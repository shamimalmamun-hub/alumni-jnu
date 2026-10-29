import { isAdmin, issuePinToken, type AuthEnv } from './auth';

// Minimal D1 typings (avoids pulling in @cloudflare/workers-types for the few calls used here).
interface D1Statement {
  bind(...values: unknown[]): D1Statement;
  first<T = unknown>(): Promise<T | null>;
  all<T = unknown>(): Promise<{ results: T[] }>;
  run(): Promise<{ meta: { changes?: number } }>;
}
interface D1Database {
  prepare(query: string): D1Statement;
}

export interface DbEnv extends AuthEnv {
  DB: D1Database;
}

class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-store',
    },
  });

const MAX_BODY_BYTES = 1_900_000; // D1 row cap is 2 MB
const MAX_LIST = 5000;
const MAX_LOOKUP = 50;

const jsonOrNull = (text: unknown): Record<string, any> => {
  try {
    const parsed = JSON.parse(String(text ?? '{}'));
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
};

const clean = (v: unknown): string => (v === null || v === undefined ? '' : String(v));
const bool01 = (v: unknown): number => (v === true || v === 1 || v === '1' || v === 'true' ? 1 : 0);
const intOrNull = (v: unknown): number | null => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : null;
};

async function readJsonObject(request: Request): Promise<Record<string, any>> {
  const text = await request.text();
  if (text.length > MAX_BODY_BYTES) throw new HttpError(413, 'Document too large (limit ~1.9 MB)');
  let parsed: any;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new HttpError(400, 'Invalid JSON body');
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new HttpError(400, 'Body must be a JSON object');
  return parsed;
}

function parseWhere(url: URL): { field: string; value: string }[] {
  return url.searchParams.getAll('where').map((w) => {
    const i = w.indexOf(':');
    const field = w.slice(0, i);
    if (i < 1 || !/^[A-Za-z0-9_]{1,64}$/.test(field)) throw new HttpError(400, `Invalid where clause: ${w}`);
    return { field, value: w.slice(i + 1) };
  });
}

/* ==========================================================================
 * Collection registry
 *
 * Physical model: normalized tables (see migrations/0002_normalize.sql).
 * Public API: unchanged document API at /api/db/<collection>[/<id>].
 *
 * map        : client field -> table column (writes + where clauses)
 * numbers    : fields stored as integers
 * read       : 'public'  = anyone may list
 *              'lookup'  = public may GET by id and list only by lookupFields
 *              undefined = admin only
 * create     : anyone may create documents
 * patch      : client field names the public may update
 * sensitive  : fields redacted on every public read (directory + id GET)
 * assemble   : row -> client document (legacy aliases preserved)
 * ========================================================================== */

interface CollectionDef {
  table: string;
  read?: 'public' | 'lookup';
  lookupFields?: string[];
  create?: boolean;
  patchFields?: string[];
  sensitive?: string[];
  map: Record<string, string>;
  numbers?: Set<string>;
  assemble: (row: Record<string, any>) => Record<string, any>;
}

const NOTICE_FIELDS = (row: Record<string, any>): Record<string, any> => {
  const extras = jsonOrNull(row.extras);
  const doc: Record<string, any> = {
    id: row.id,
    title: row.title ?? '',
    category: row.category ?? '',
    description: row.description ?? '',
    isUrgent: !!row.is_urgent,
    date: row.date_display ?? '',
    imageUrl: row.image_url ?? '',
    pdfUrl: row.pdf_url ?? '',
    pdfFileName: row.pdf_file ?? '',
    createdAt: clean(row.published_at) || clean(row.created_at),
    deleted: !!row.deleted,
  };
  for (const k of Object.keys(extras)) if (!(k in doc)) doc[k] = extras[k];
  return doc;
};

const NEWS_FIELDS = (row: Record<string, any>): Record<string, any> => {
  const extras = jsonOrNull(row.extras);
  const doc: Record<string, any> = {
    id: row.id,
    titleBn: row.title_bn ?? '',
    titleEn: row.title_en ?? '',
    category: row.category ?? '',
    categoryBn: row.category_bn ?? '',
    categoryEn: row.category_en ?? '',
    imageUrl: row.image_url ?? '',
    date: row.date ?? '',
    authorBn: row.author_bn ?? '',
    authorEn: row.author_en ?? '',
    summaryBn: row.summary_bn ?? '',
    summaryEn: row.summary_en ?? '',
    contentBn: row.content_bn ?? '',
    contentEn: row.content_en ?? '',
    isFeatured: !!row.is_featured,
    viewsCount: row.views_count ?? 0,
    createdAt: row.created_at,
  };
  for (const k of Object.keys(extras)) if (!(k in doc)) doc[k] = extras[k];
  return doc;
};

const GENERIC_ASSEMBLE = (shape: (row: Record<string, any>) => Record<string, any>) => (row: Record<string, any>): Record<string, any> => shape(row);

const PAYMENT_FIELDS = (row: Record<string, any>): Record<string, any> => {
  const extras = jsonOrNull(row.extras);
  const doc: Record<string, any> = {
    id: row.id,
    receiptNo: row.receipt_no ?? '',
    payerName: row.payer_name ?? '',
    payerNameBn: row.payer_name_bn ?? '',
    membershipId: row.membership_id ?? '',
    purpose: row.purpose ?? '',
    purposeType: row.purpose_type ?? '',
    amount: row.amount ?? 0,
    paymentMethod: row.payment_method ?? '',
    senderNumber: row.sender_number ?? '',
    transactionId: row.trx_id ?? '',
    phone: row.phone ?? '',
    email: row.email ?? '',
    session: row.session ?? '',
    batch: row.batch ?? '',
    note: row.note ?? '',
    slipUrl: row.slip_url ?? '',
    status: row.status ?? 'verified',
    createdAt: row.created_at,
  };
  for (const k of Object.keys(extras)) if (!(k in doc)) doc[k] = extras[k];
  return doc;
};

const CONTACT_FIELDS = (row: Record<string, any>): Record<string, any> => {
  const extras = jsonOrNull(row.extras);
  const doc: Record<string, any> = {
    id: row.id,
    name: row.name ?? '',
    phone: row.phone ?? '',
    email: row.email ?? '',
    subject: row.subject ?? '',
    message: row.message ?? '',
    status: row.status ?? 'unread',
    createdAt: row.created_at,
  };
  for (const k of Object.keys(extras)) if (!(k in doc)) doc[k] = extras[k];
  return doc;
};

const FEEDBACK_FIELDS = (row: Record<string, any>): Record<string, any> => {
  const extras = jsonOrNull(row.extras);
  const doc: Record<string, any> = {
    id: row.id,
    senderName: row.sender_name ?? '',
    senderBatch: row.sender_batch ?? '',
    senderContact: row.sender_contact ?? '',
    category: row.category ?? '',
    subject: row.subject ?? '',
    message: row.message ?? '',
    status: row.status ?? 'unread',
    createdAt: row.created_at,
  };
  for (const k of Object.keys(extras)) if (!(k in doc)) doc[k] = extras[k];
  return doc;
};

const SETTINGS_IDS: Record<string, string> = { settings: 'settings', site_settings: 'site_settings', gallery_images: 'gallery' };

/* ------------------------------------------------------------- members ----- */

const MEMBER_COLUMNS: Record<string, string> = {
  status: 'status',
  membershipId: 'membership_id',
  formNo: 'form_no',
  applicationDate: 'application_date',
  applicantNameEn: 'applicant_name_en',
  applicantNameBn: 'applicant_name_bn',
  email: 'email',
  mobile: 'mobile',
  phone: 'phone',
  bloodGroup: 'blood_group',
  occupationCategory: 'occupation_category',
  occupation: 'occupation',
  organizationPosition: 'organization_position',
  session: 'session',
  batch: 'batch',
  userPhotoUrl: 'photo_url',
  feeAmount: 'fee_amount',
  paymentStatus: 'payment_status',
  paymentMethod: 'payment_method',
  senderNumber: 'sender_number',
  transactionId: 'trx_number',
  paymentReceiptNo: 'payment_receipt_no',
  paidAmount: 'paid_amount',
  paidAt: 'paid_at',
};

const PROFILE_COLUMNS: Record<string, string> = {
  fathersName: 'fathers_name',
  mothersName: 'mothers_name',
  dateOfBirth: 'date_of_birth',
  nidNumber: 'nid_number',
  presentAddress: 'present_address',
  permVillage: 'perm_village',
  permPost: 'perm_post',
  permUpazila: 'perm_upazila',
  permDistrict: 'perm_district',
  village: 'perm_village',
  post: 'perm_post',
  upazila: 'perm_upazila',
  district: 'perm_district',
  signatureDataUrl: 'signature_url',
  signatureName: 'signature_name',
  degreeDocUrl: 'degree_doc_url',
  degreeDocName: 'degree_doc_name',
  declarationConfirmed: 'declaration_confirmed',
};

const MEMBER_NUMERIC = new Set(['paidAmount', 'declarationConfirmed']);

const PAYMENT_COLUMNS: Record<string, string> = {
  receiptNo: 'receipt_no',
  payerName: 'payer_name',
  payerNameBn: 'payer_name_bn',
  membershipId: 'membership_id',
  purpose: 'purpose',
  purposeType: 'purpose_type',
  amount: 'amount',
  paymentMethod: 'payment_method',
  senderNumber: 'sender_number',
  transactionId: 'trx_id',
  phone: 'phone',
  email: 'email',
  session: 'session',
  batch: 'batch',
  note: 'note',
  slipUrl: 'slip_url',
  status: 'status',
};

const CONTACT_COLUMNS: Record<string, string> = {
  name: 'name',
  phone: 'phone',
  email: 'email',
  subject: 'subject',
  message: 'message',
  status: 'status',
};

const FEEDBACK_COLUMNS: Record<string, string> = {
  senderName: 'sender_name',
  senderBatch: 'sender_batch',
  senderContact: 'sender_contact',
  category: 'category',
  subject: 'subject',
  message: 'message',
  status: 'status',
};

const MEMBER_SENSITIVE = [
  'nidNumber', 'signatureDataUrl', 'signatureName', 'degreeDocData', 'degreeDocUrl', 'degreeDocName',
  'adminNotes', 'fathersName', 'mothersName', 'dateOfBirth', 'dobDay', 'dobMonth', 'dobYear',
];

const DEGREE_COLUMNS: Record<string, string[]> = {
  bscSession: ['bsc', 'session'],
  bscYear: ['bsc', 'passing_year'],
  bscBatch: ['bsc', 'batch'],
  mscSession: ['msc', 'session'],
  mscYear: ['msc', 'passing_year'],
  mscBatch: ['msc', 'batch'],
  mphilYear: ['mphil', 'passing_year'],
  phdYear: ['phd', 'passing_year'],
};

interface MembersRow { id: string; [k: string]: unknown }

const assembleMemberDoc = async (
  env: DbEnv,
  row: MembersRow,
  redact: boolean
): Promise<Record<string, any>> => {
  const [profileRows, degreeRows] = await Promise.all([
    env.DB.prepare('SELECT * FROM member_profiles WHERE member_id = ?1').bind(row.id).all<Record<string, any>>(),
    env.DB.prepare('SELECT program, session, passing_year, batch FROM member_degrees WHERE member_id = ?1').bind(row.id)
      .all<{ program: string; session: string | null; passing_year: string | null; batch: string | null }>(),
  ]);
  const p = profileRows.results[0] || {};
  const degrees: Record<string, string> = {};
  for (const d of degreeRows.results) {
    for (const [field, [prog, col]] of Object.entries(DEGREE_COLUMNS)) {
      if (prog === d.program && !(field in degrees)) degrees[field] = clean(d[col as 'session' | 'batch' | 'passing_year']);
    }
  }

  const get = (k: string) => clean(row[k]);
  // member_profiles columns live on `p`, not on the members row.
  const gp = (k: string) => clean(p[k]);
  const permParts = [gp('perm_village'), gp('perm_post'), gp('perm_upazila'), gp('perm_district')];
  const dob = gp('date_of_birth');
  const [dobDay = '', dobMonth = '', dobYear = ''] = dob.split('/');

  const extras = jsonOrNull(row.extras);
  const doc: Record<string, any> = {
    id: row.id,
    membershipId: get('membership_id') || row.id,
    formNo: get('form_no'),
    applicationDate: get('application_date'),
    applicantNameEn: get('applicant_name_en'),
    applicantNameBn: get('applicant_name_bn'),
    fullName: get('applicant_name_en'),
    session: get('session'),
    batch: get('batch'),
    email: get('email'),
    phone: get('phone') || get('mobile'),
    mobile: get('mobile') || get('phone'),
    bloodGroup: get('blood_group'),
    occupationCategory: get('occupation_category'),
    occupation: get('occupation'),
    organizationPosition: get('organization_position'),
    organization: get('organization_position'),
    designation: get('organization_position'),
    userPhotoUrl: get('photo_url'),
    photoUrl: get('photo_url'),
    feeAmount: get('fee_amount'),
    membershipType: get('membership_type') || 'general',
    status: get('status') || 'pending',
    paymentStatus: get('payment_status') || 'pending',
    paymentMethod: get('payment_method'),
    senderNumber: get('sender_number'),
    transactionId: get('trx_number'),
    paymentReceiptNo: get('payment_receipt_no'),
    paidAmount: row.paid_amount === null || row.paid_amount === undefined ? undefined : row.paid_amount,
    paidAt: get('paid_at'),
    bscSession: '', bscYear: '', bscBatch: '',
    mscSession: '', mscYear: '', mscBatch: '',
    mphilYear: '', phdYear: '',
    ...degrees,
    permanentAddress: permParts.some(Boolean)
      ? [
          permParts[0] ? `Village: ${permParts[0]}, ` : '',
          permParts[1] ? `Post: ${permParts[1]}, ` : '',
          permParts[2] ? `Upazila: ${permParts[2]}, ` : '',
          permParts[3] ? `District: ${permParts[3]}` : '',
        ].join('').replace(/, $/, '')
      : '',
    village: gp('perm_village'),
    post: gp('perm_post'),
    upazila: gp('perm_upazila'),
    district: gp('perm_district'),
    permVillage: gp('perm_village'),
    permPost: gp('perm_post'),
    permUpazila: gp('perm_upazila'),
    permDistrict: gp('perm_district'),
    fathersName: gp('fathers_name'),
    mothersName: gp('mothers_name'),
    dateOfBirth: dob,
    dobDay, dobMonth, dobYear,
    nidNumber: gp('nid_number'),
    presentAddress: gp('present_address'),
    signatureDataUrl: gp('signature_url'),
    signatureName: gp('signature_name'),
    degreeDocData: gp('degree_doc_url'),
    degreeDocUrl: gp('degree_doc_url'),
    degreeDocName: gp('degree_doc_name'),
    declarationConfirmed: !!Number(gp('declaration_confirmed')),
    createdAt: row.created_at,
  };
  for (const k of Object.keys(extras)) if (!(k in doc)) doc[k] = extras[k];
  if (redact) for (const k of MEMBER_SENSITIVE) delete doc[k];
  return doc;
};

/* ---------------------------------------------------------- registry ------- */

const COLLECTIONS: Record<string, CollectionDef> = {
  notices: {
    table: 'notices',
    read: 'public',
    map: {
      title: 'title', category: 'category', description: 'description', isUrgent: 'is_urgent',
      date: 'date_display', imageUrl: 'image_url', pdfUrl: 'pdf_url', pdfFileName: 'pdf_file',
      deleted: 'deleted', createdAt: 'published_at',
    },
    numbers: new Set(['isUrgent', 'deleted']),
    assemble: GENERIC_ASSEMBLE(NOTICE_FIELDS),
  },
  recent_news: {
    table: 'news',
    read: 'public',
    map: {
      titleBn: 'title_bn', titleEn: 'title_en', category: 'category', categoryBn: 'category_bn',
      categoryEn: 'category_en', imageUrl: 'image_url', date: 'date', authorBn: 'author_bn',
      authorEn: 'author_en', summaryBn: 'summary_bn', summaryEn: 'summary_en', contentBn: 'content_bn',
      contentEn: 'content_en', isFeatured: 'is_featured', viewsCount: 'views_count',
    },
    numbers: new Set(['isFeatured', 'viewsCount']),
    assemble: GENERIC_ASSEMBLE(NEWS_FIELDS),
  },
  site_settings: {
    table: 'settings',
    read: 'public',
    map: {},
    assemble: () => ({}),
  },
  settings: {
    table: 'settings',
    read: 'public',
    map: {},
    assemble: () => ({}),
  },
  gallery_images: {
    table: 'settings',
    read: 'public',
    map: {},
    assemble: () => ({}),
  },
  memberships: {
    table: 'members',
    read: 'lookup',
    lookupFields: ['formNo', 'transactionId', 'mobile', 'status'],
    create: true,
    patchFields: ['paymentStatus', 'paymentMethod', 'senderNumber', 'transactionId', 'paymentReceiptNo', 'paidAmount', 'paidAt', 'status', 'membershipType', 'feeAmount'],
    sensitive: MEMBER_SENSITIVE,
    map: MEMBER_COLUMNS,
    numbers: MEMBER_NUMERIC,
    assemble: () => ({}), // handled specially (needs profiles + degrees)
  },
  payments: {
    table: 'payments',
    read: 'lookup',
    lookupFields: ['transactionId', 'receiptNo', 'membershipId', 'phone'],
    create: true,
    map: PAYMENT_COLUMNS,
    numbers: new Set(['amount']),
    assemble: GENERIC_ASSEMBLE(PAYMENT_FIELDS),
  },
  contacts: {
    table: 'contacts',
    create: true,
    map: CONTACT_COLUMNS,
    assemble: GENERIC_ASSEMBLE(CONTACT_FIELDS),
  },
  feedback_messages: {
    table: 'feedback_messages',
    create: true,
    map: FEEDBACK_COLUMNS,
    assemble: GENERIC_ASSEMBLE(FEEDBACK_FIELDS),
  },
};

/* ==========================================================================
 * Row <-> document mapping helpers
 * ========================================================================== */

const buildValues = (def: CollectionDef, doc: Record<string, any>) => {
  const values: Record<string, unknown> = {};
  for (const [field, column] of Object.entries(def.map)) {
    if (!(field in doc)) continue;
    const v = doc[field];
    if (def.numbers?.has(field)) values[column] = intOrNull(v);
    else if (typeof v === 'boolean') values[column] = bool01(v);
    else if (v === undefined || v === null) values[column] = null;
    else if (typeof v === 'object') continue; // store objects in extras
    else values[column] = v;
  }
  return values;
};

const classify = (def: CollectionDef, doc: Record<string, any>) => {
  const cols = buildValues(def, doc);
  const extras: Record<string, any> = {};
  for (const [k, v] of Object.entries(doc)) {
    if (k === 'id' || k === 'createdAt' || def.map[k]) continue;
    extras[k] = v;
  }
  return { cols, extras };
};

const whereColumn = (def: CollectionDef, field: string): string | null => {
  const col = def.map[field];
  return col ?? null;
};

/* ==========================================================================
 * Handlers
 * ========================================================================== */

async function getSettingDoc(env: DbEnv, group: string, id: string): Promise<Record<string, any> | null> {
  let row = await env.DB.prepare('SELECT value FROM settings WHERE key = ?1').bind(`${group}/${id}`)
    .first<{ value: string }>();
  if (!row && (group === 'settings' || group === 'admin')) {
    row = await env.DB.prepare('SELECT value FROM settings WHERE key = ?1 OR key = ?2')
      .bind(`admin/${id}`, id)
      .first<{ value: string }>();
  }
  if (!row) return null;
  return { id, ...jsonOrNull(row.value) };
}

async function writeSettingDoc(env: DbEnv, group: string, id: string, body: Record<string, any>, merge: boolean): Promise<void> {
  const key = `${group}/${id}`;
  const payload = { ...body };
  delete payload.id;
  let final = JSON.stringify(payload);
  if (merge) {
    const existing = await env.DB.prepare('SELECT value FROM settings WHERE key = ?1 OR key = ?2').bind(key, `admin/${id}`).first<{ value: string }>();
    if (existing) final = JSON.stringify({ ...jsonOrNull(existing.value), ...payload });
  }
  await env.DB
    .prepare(
      `INSERT INTO settings (key, value) VALUES (?1, ?2)
       ON CONFLICT (key) DO UPDATE SET value = excluded.value, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')`
    )
    .bind(key, final)
    .run();

  if (group === 'settings') {
    await env.DB
      .prepare(
        `INSERT INTO settings (key, value) VALUES (?1, ?2)
         ON CONFLICT (key) DO UPDATE SET value = excluded.value, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')`
      )
      .bind(`admin/${id}`, final)
      .run()
      .catch(() => {});
  }
}

/** Write a member document: `members` columns + `member_profiles` + `member_degrees`. */
async function writeMemberDoc(env: DbEnv, id: string, docIn: Record<string, any>, opts: { createOnly: boolean; createdAt?: string }): Promise<boolean> {
  // Drop assembled-only aliases so they are rebuilt from columns on read.
  const doc = { ...docIn };
  if (doc.status === undefined && docIn.status === undefined) doc.status = 'pending';

  // Profile fields split across member_profiles.
  const profileValues = buildValues({ map: PROFILE_COLUMNS, numbers: MEMBER_NUMERIC } as unknown as CollectionDef, doc);
  profileValues['declaration_confirmed'] = bool01(doc['declarationConfirmed']);

  // Degrees: split mphil/phd passing years into member_degrees.
  const degreeRows = Object.entries(DEGREE_COLUMNS)
    .map(([field, [program, column]]) => {
      const value = doc[field];
      return { program, column, value: clean(value), has: value !== undefined && value !== null && value !== '' };
    })
    .filter((d) => d.has);

  const { cols, extras } = classify(COLLECTIONS.memberships, doc);

  if (!cols['form_no']) cols['form_no'] = clean(doc['formNo']);
  if (!cols['applicant_name_en']) cols['applicant_name_en'] = clean(doc['applicantNameEn'] ?? doc['fullName'] ?? '');
  if (doc['membershipId'] && !cols['membership_id']) cols['membership_id'] = clean(doc['membershipId']);
  if (!cols['status']) cols['status'] = clean(doc['status'] ?? 'pending');
  if (!cols['payment_status']) cols['payment_status'] = 'pending';

  const colNames = ['id', ...Object.keys(cols), 'extras', ...(opts.createdAt ? ['created_at'] : [])];
  const colParams = [id, ...Object.values(cols), JSON.stringify(extras), ...(opts.createdAt ? [opts.createdAt] : [])];
  const placeholders = colNames.map((_, i) => `?${i + 1}`).join(', ');

  const conflict = opts.createOnly
    ? 'DO NOTHING'
    : `DO UPDATE SET ${Object.keys(cols)
        .concat(['extras'])
        .map((c) => `${c} = excluded.${c}`)
        .join(', ')}, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')`;

  const res = await env.DB.prepare(
    `INSERT INTO members (${colNames.join(', ')}) VALUES (${placeholders}) ON CONFLICT (id) ${conflict}`
  ).bind(...colParams).run();

  if (res.meta.changes === 0 && opts.createOnly) {
    return false; // public create-only: existing row untouched
  }

  if (Object.keys(profileValues).length > 0) {
    const names = ['member_id', ...Object.keys(profileValues)];
    const params = [id, ...Object.values(profileValues)];
    const ph = names.map((_, i) => `?${i + 1}`).join(', ');
    const updates = Object.keys(profileValues).map((c) => `${c} = excluded.${c}`).join(', ');
    await env.DB.prepare(
      `INSERT INTO member_profiles (${names.join(', ')}) VALUES (${ph})
       ON CONFLICT (member_id) DO UPDATE SET ${updates}`
    ).bind(...params).run();
  }

  for (const d of degreeRows) {
    const program = d.program;
    const isDegree = program === 'bsc' || program === 'msc';
    // Each (field -> column) entry writes only ITS column so separate entries
    // for the same program never clobber each other.
    await env.DB.prepare(
      `INSERT INTO member_degrees (member_id, program, session, passing_year, batch) VALUES (?1, ?2, ?3, ?4, ?5)
       ON CONFLICT (member_id, program) DO UPDATE SET
         session = COALESCE(excluded.session, session),
         passing_year = COALESCE(excluded.passing_year, passing_year),
         batch = COALESCE(excluded.batch, batch)`
    )
      .bind(
        id,
        program,
        isDegree && d.column === 'session' ? d.value : null,
        d.column === 'passing_year' ? d.value : null,
        isDegree && d.column === 'batch' ? d.value : null
      )
      .run();
  }

  return res.meta.changes !== 0;
}

/** Write a generic (non-member) document. */
async function writeSimpleDoc(env: DbEnv, def: CollectionDef, id: string, doc: Record<string, any>, opts: { createOnly: boolean }): Promise<{ ok: boolean }> {
  if (def.table === 'settings') return { ok: true };

  const { cols, extras } = classify(def, doc);
  if (Object.keys(cols).length === 0 && Object.keys(extras).length === 0) return { ok: true };

  // payments: resolve the real member FK from the (string) membership id.
  if (def.table === 'payments' && cols['membership_id']) {
    const ref = clean(cols['membership_id']);
    const m = await env.DB.prepare('SELECT id FROM members WHERE id = ?1 OR form_no = ?2').bind(ref, ref).first<{ id: string }>();
    cols['member_id'] = m?.id ?? null;
  }

  const colNames = ['id', ...Object.keys(cols), 'extras'];
  const colParams = [id, ...Object.values(cols), JSON.stringify(extras)];
  const placeholders = colNames.map((_, i) => `?${i + 1}`).join(', ');
  const conflict = opts.createOnly
    ? 'DO NOTHING'
    : `DO UPDATE SET ${Object.keys(cols).concat(['extras']).map((c) => `${c} = excluded.${c}`).join(', ')},
       updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')`;

  const res = await env.DB.prepare(
    `INSERT INTO ${def.table} (${colNames.join(', ')}) VALUES (${placeholders}) ON CONFLICT (id) ${conflict}`
  ).bind(...colParams).run();
  return { ok: !(opts.createOnly && res.meta.changes === 0) };
}

/* ---------------------------------------------------------------- read ----- */

async function handleCollectionGet(
  env: DbEnv,
  def: CollectionDef,
  collection: string,
  id: string | undefined,
  url: URL,
  admin: boolean
): Promise<Response> {
  /* GET one document */
  if (id !== undefined) {
    if (def.table === 'settings') {
      const group = SETTINGS_IDS[collection] || (collection === 'settings' ? 'settings' : (collection === 'gallery_images' ? 'gallery' : 'site_settings'));
      // settings require admin; site_settings and gallery_images are public
      if (!admin && def.read !== 'public') throw new HttpError(401, 'Admin authentication required');
      const doc = await getSettingDoc(env, group, id);
      if (!doc) throw new HttpError(404, 'Not found');
      return json({ doc });
    }

    if (!admin && !def.read) throw new HttpError(401, 'Admin authentication required');
    const redact = !admin;
    if (def.table === 'members') {
      const row = await env.DB.prepare('SELECT * FROM members WHERE id = ?1').bind(id).first<MembersRow>();
      if (!row) throw new HttpError(404, 'Not found');
      return json({ doc: await assembleMemberDoc(env, row, redact) });
    }
    const row = await env.DB.prepare(`SELECT * FROM ${def.table} WHERE id = ?1`).bind(id).first<Record<string, any>>();
    if (!row) throw new HttpError(404, 'Not found');
    return json({ doc: def.assemble(row) });
  }

  /* GET list */
  const where = parseWhere(url);
  let limit = Math.min(Number(url.searchParams.get('limit')) || MAX_LIST, MAX_LIST);
  let redact = false;

  if (!admin && def.read !== 'public') {
    if (def.read !== 'lookup') throw new HttpError(401, 'Admin authentication required');
    const allowed = def.lookupFields || [];
    if (where.length === 0 || where.some((w) => !allowed.includes(w.field))) {
      throw new HttpError(403, 'This query requires admin authentication');
    }
    const directory = where.length === 1 && where[0].field === 'status' && where[0].value === 'approved';
    if (!directory) limit = Math.min(limit, MAX_LOOKUP);
    else redact = true;
  }

  if (def.table === 'settings') {
    if (!admin && def.read !== 'public') throw new HttpError(403, 'Listing settings requires admin authentication');
    const group = SETTINGS_IDS[collection] || (collection === 'settings' ? 'settings' : (collection === 'gallery_images' ? 'gallery' : 'site_settings'));
    const prefix = `${group}/`;
    let rows = await env.DB
      .prepare(`SELECT key, value FROM settings WHERE key LIKE ?1 ORDER BY created_at DESC LIMIT ?2`)
      .bind(`${prefix}%`, limit)
      .all<{ key: string; value: string }>();
    if (rows.results.length === 0 && collection === 'settings') {
      rows = await env.DB
        .prepare(`SELECT key, value FROM settings WHERE key LIKE 'admin/%' ORDER BY created_at DESC LIMIT ?1`)
        .bind(limit)
        .all<{ key: string; value: string }>();
      if (rows.results.length > 0) {
        return json({ docs: rows.results.map((r) => ({ id: r.key.slice('admin/'.length), ...jsonOrNull(r.value) })) });
      }
    }
    return json({ docs: rows.results.map((r) => ({ id: r.key.slice(prefix.length), ...jsonOrNull(r.value) })) });
  }

  const clauses: string[] = [];
  const binds: unknown[] = [];
  for (const w of where) {
    const col = whereColumn(def, w.field);
    if (!col) throw new HttpError(400, `Unknown field: ${w.field}`);
    binds.push(def.numbers?.has(w.field) ? intOrNull(w.value) : w.value);
    clauses.push(`${col} = ?${binds.length}`);
  }
  binds.push(limit);
  const orderCol = def.table === 'notices' ? 'COALESCE(published_at, created_at)' : 'created_at';
  const rows = await env.DB
    .prepare(`SELECT * FROM ${def.table} ${clauses.length ? `WHERE ${clauses.join(' AND ')}` : ''} ORDER BY ${orderCol} DESC LIMIT ?${binds.length}`)
    .bind(...binds)
    .all<Record<string, any>>();

  if (def.table === 'members') {
    const docs = await Promise.all(rows.results.map((r) => assembleMemberDoc(env, r as unknown as MembersRow, redact)));
    return json({ docs });
  }
  return json({ docs: rows.results.map((r) => def.assemble(r)) });
}

async function handleCollectionWrite(
  env: DbEnv,
  def: CollectionDef,
  collection: string,
  id: string | undefined,
  request: Request,
  url: URL,
  admin: boolean,
  method: string
): Promise<Response> {
  /* POST: create with a server-side id */
  if (id === undefined && method === 'POST') {
    if (!admin && !def.create) throw new HttpError(401, 'Admin authentication required');
    const body = await readJsonObject(request);
    const newId = crypto.randomUUID();
    if (def.table === 'members') await writeMemberDoc(env, newId, body, { createOnly: false });
    else if (def.table === 'settings') void newId;
    else await writeSimpleDoc(env, def, newId, body, { createOnly: false });
    return json({ id: newId }, 201);
  }
  if (id === undefined) throw new HttpError(405, 'Method not allowed');
  if (id.length === 0 || id.length > 200) throw new HttpError(400, 'Invalid document id');

  /* PUT: create or replace */
  if (method === 'PUT') {
    const body = await readJsonObject(request);
    const merge = url.searchParams.get('merge') === '1';

    if (def.table === 'settings') {
      if (!admin) throw new HttpError(401, 'Admin authentication required');
      const group = SETTINGS_IDS[collection] || (collection === 'settings' ? 'settings' : (collection === 'gallery_images' ? 'gallery' : 'site_settings'));
      await writeSettingDoc(env, group, id, body, merge);
      return json({ ok: true });
    }

    // Collections without public create are admin-write-only (e.g. notices, news).
    if (!admin && !def.create) throw new HttpError(401, 'Admin authentication required');

    if (def.table === 'members') {
      const existingRow = await env.DB.prepare('SELECT * FROM members WHERE id = ?1').bind(id).first<Record<string, any>>();
      if (existingRow) {
        const existingDoc = await assembleMemberDoc(env, existingRow as unknown as MembersRow, false);
        if (admin || existingDoc.status !== 'approved') {
          Object.assign(existingDoc, body);
          await writeMemberDoc(env, id, existingDoc, { createOnly: false });
          return json({ ok: true, created: false });
        }
      }
      const created = await writeMemberDoc(env, id, body, { createOnly: !admin });
      return json({ ok: true, created });
    }

    if (admin && merge) {
      const existing = await env.DB.prepare(`SELECT * FROM ${def.table} WHERE id = ?1`).bind(id).first<Record<string, any>>();
      if (existing) {
        await writeSimpleDoc(env, def, id, { ...def.assemble(existing), ...body, id }, { createOnly: false });
        return json({ ok: true });
      }
    }

    if (!admin) {
      let created = true;
      if (def.table === 'members') created = await writeMemberDoc(env, id, body, { createOnly: true });
      else created = (await writeSimpleDoc(env, def, id, body, { createOnly: true })).ok;
      return json({ ok: true, created });
    }

    await writeSimpleDoc(env, def, id, body, { createOnly: false });
    return json({ ok: true });
  }

  /* PATCH: merge keys into an existing document */
  if (method === 'PATCH') {
    const body = await readJsonObject(request);
    if (def.table === 'settings') {
      if (!admin) throw new HttpError(401, 'Admin authentication required');
      const group = SETTINGS_IDS[collection] === 'admin' ? 'settings' : 'site_settings';
      await writeSettingDoc(env, group, id, body, true);
      return json({ ok: true });
    }

    if (!admin) {
      const allowed = def.patchFields || [];
      if (allowed.length === 0) throw new HttpError(401, 'Admin authentication required');
      if (Object.keys(body).some((k) => !allowed.includes(k))) {
        throw new HttpError(403, 'Field update requires admin authentication');
      }
    }

    if (def.table === 'members') {
      // Read-modify-write so admin patches of `status` or any other mapped
      // column land on the right table, and unmapped keys stay in `extras`.
      const row = await env.DB.prepare('SELECT * FROM members WHERE id = ?1').bind(id).first<Record<string, any>>();
      if (!row) throw new HttpError(404, 'Not found');
      await writeMemberDoc(env, id, { ...(await assembleMemberDoc(env, row as unknown as MembersRow, false)), ...body }, { createOnly: false });
      return json({ ok: true });
    }

    // Generic tables: merge in JS (small docs), preserving unmapped keys in extras.
    const existing = await env.DB.prepare(`SELECT * FROM ${def.table} WHERE id = ?1`).bind(id).first<Record<string, any>>();
    if (!existing) throw new HttpError(404, 'Not found');
    const merged = { ...def.assemble(existing), ...body };
    await writeSimpleDoc(env, def, id, merged, { createOnly: false });
    return json({ ok: true });
  }

  /* DELETE */
  if (method === 'DELETE') {
    if (!admin) throw new HttpError(401, 'Admin authentication required');
    if (def.table === 'settings') {
      const group = SETTINGS_IDS[collection] || (collection === 'settings' ? 'settings' : (collection === 'gallery_images' ? 'gallery' : 'site_settings'));
      await env.DB.prepare('DELETE FROM settings WHERE key = ?1').bind(`${group}/${id}`).run();
      return json({ ok: true });
    }
    await env.DB.prepare(`DELETE FROM ${def.table} WHERE id = ?1`).bind(id).run();
    return json({ ok: true });
  }

  throw new HttpError(405, 'Method not allowed');
}

async function handleDb(request: Request, url: URL, env: DbEnv, segments: string[]): Promise<Response> {
  const [collectionName, rawId] = segments;
  const def = COLLECTIONS[collectionName];
  if (!def) throw new HttpError(404, `Unknown collection: ${collectionName}`);
  const id = rawId ? decodeURIComponent(rawId) : undefined;
  if (id !== undefined && (id.length === 0 || id.length > 200)) throw new HttpError(400, 'Invalid document id');

  const admin = await isAdmin(request, env);
  const method = request.method.toUpperCase();

  if (method === 'GET') return handleCollectionGet(env, def, collectionName, id, url, admin);
  return handleCollectionWrite(env, def, collectionName, id, request, url, admin, method);
}

const toEnDigits = (str: string) => str.replace(/[০-৯]/g, (d) => String('০১২৩৪৫৬৭৮৯'.indexOf(d)));

/**
 * Member portal login: match a Member ID + mobile server-side with indexed queries.
 * Only approved members get a profile back.
 */
async function memberLogin(env: DbEnv, rawId: string, rawMobile: string) {
  const cleanId = toEnDigits(rawId).toLowerCase().replace(/[^a-z0-9]/gi, '');
  const cleanMobile = toEnDigits(rawMobile).replace(/\D/g, '');
  if (!cleanId || !cleanMobile) return { member: null, status: null, name: '' };

  // Candidate rows: fix mobile matches via indexed columns; id matches need a
  // normalized comparison done in SQL, so two small queries are run and merged.
  const byMobile = await env.DB
    .prepare(
      `SELECT id, form_no AS formNo, membership_id AS membershipId, mobile, phone, status,
              applicant_name_bn AS applicantNameBn, applicant_name_en AS applicantNameEn,
              session, batch, blood_group, photo_url AS userPhotoUrl
         FROM members
        WHERE mobile = ?1
           OR phone = ?1
           OR (length(mobile) >= 8 AND substr(mobile, -8) = substr(?1, -8))
           OR (length(?1) >= 8 AND substr(?1, -8) = substr(mobile, -8))
        LIMIT 25`
    )
    .bind(cleanMobile)
    .all<Record<string, string | null>>();

  const byId = await env.DB
    .prepare(
      `SELECT id, form_no AS formNo, membership_id AS membershipId, mobile, phone, status,
              applicant_name_bn AS applicantNameBn, applicant_name_en AS applicantNameEn,
              session, batch, blood_group, photo_url AS userPhotoUrl
         FROM members
        WHERE replace(replace(replace(lower(COALESCE(form_no, membership_id, id)), '-', ''), ' ', ''), '.', '') = ?1
           OR (length(?1) >= 3 AND replace(replace(replace(lower(COALESCE(form_no, membership_id, id)), '-', ''), ' ', ''), '.', '') LIKE '%' || ?1)
        LIMIT 25`
    )
    .bind(cleanId)
    .all<Record<string, string | null>>();

  const seen = new Set<string>();
  const candidates = [...byMobile.results, ...byId.results].filter((r) => (seen.has(r.id!) ? false : (seen.add(r.id!), true)));

  let status: string | null = null;
  let name = '';
  for (const r of candidates) {
    const docId = r.id!.toLowerCase();
    const cleanFormNo = toEnDigits((r.formNo || r.membershipId || r.id || '').toLowerCase()).replace(/[^a-z0-9]/gi, '');
    const last4 = cleanFormNo.replace(/\D/g, '').slice(-4);
    const mobile = toEnDigits(r.mobile || r.phone || '').replace(/\D/g, '');

    const matchesId =
      cleanFormNo === cleanId || cleanFormNo.includes(cleanId) || docId === cleanId || (cleanId.length >= 3 && last4 === cleanId);
    const matchesMobile =
      mobile === cleanMobile ||
      (cleanMobile.length >= 8 && mobile.endsWith(cleanMobile)) ||
      (mobile.length >= 8 && cleanMobile.endsWith(mobile));
    if (!matchesId || !matchesMobile) continue;

    status = r.status || 'pending';
    name = r.applicantNameBn || r.applicantNameEn || 'সম্মানিত সদস্য';
    if (r.status === 'approved') {
      return {
        status,
        name,
        member: {
          id: r.id,
          formNo: r.formNo || r.membershipId || r.id,
          applicantNameBn: r.applicantNameBn || r.applicantNameEn || 'সম্মানিত সদস্য',
          applicantNameEn: r.applicantNameEn || '',
          mobile: r.mobile || r.phone || '',
          session: r.session || '',
          batch: r.batch || '',
          program: 'bsc_honours',
          userPhotoUrl: r.userPhotoUrl || '',
          bloodGroup: r.blood_group || '',
          status: r.status,
        },
      };
    }
  }
  return { member: null, status, name };
}

/** Handles /api/db/*, /api/member-login and /api/admin/login. Returns null for other paths. */
export async function handleDataApi(request: Request, url: URL, env: DbEnv, path: string): Promise<Response | null> {
  try {
    if (path === '/api/admin/login' && request.method === 'POST') {
      const { pin } = await readJsonObject(request);
      const token = typeof pin === 'string' ? await issuePinToken(pin.trim(), env) : null;
      return token ? json({ token }) : json({ error: 'Incorrect password' }, 401);
    }
    if (path === '/api/member-login' && request.method === 'POST') {
      const { id, mobile } = await readJsonObject(request);
      return json(await memberLogin(env, String(id || ''), String(mobile || '')));
    }
    if (path.startsWith('/api/db/')) {
      return await handleDb(request, url, env, path.slice('/api/db/'.length).split('/').filter(Boolean));
    }
    return null;
  } catch (err: any) {
    if (err instanceof HttpError) return json({ error: err.message }, err.status);
    console.error('[db] error:', err);
    return json({ error: 'Internal error' }, 500);
  }
}
