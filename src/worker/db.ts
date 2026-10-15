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

interface Policy {
  /** 'public': anyone can read/list. 'lookup': anyone can fetch by id or query by `lookupFields`. */
  read?: 'public' | 'lookup';
  lookupFields?: string[];
  /** Anyone may create a new document (never overwrite an existing one). */
  create?: boolean;
  /** Anyone may merge-update these keys on an existing document. */
  publicPatchKeys?: string[];
  /** Fields hidden from public list queries that only filter on `status` (e.g. the members directory). */
  directoryHiddenFields?: string[];
}

// Everything not allowed here requires an admin token.
const POLICY: Record<string, Policy> = {
  notices: { read: 'public' },
  recent_news: { read: 'public' },
  site_settings: { read: 'public' },
  settings: {},
  memberships: {
    read: 'lookup',
    lookupFields: ['formNo', 'transactionId', 'mobile', 'status'],
    create: true,
    publicPatchKeys: ['paymentStatus', 'paymentMethod', 'senderNumber', 'transactionId', 'paymentReceiptNo', 'paidAmount', 'paidAt'],
    directoryHiddenFields: [
      'nidNumber', 'nid', 'signatureDataUrl', 'degreeDocData', 'degreeDocUrl', 'degreeDoc',
      'adminNotes', 'fathersName', 'mothersName', 'dateOfBirth', 'dobDay', 'dobMonth', 'dobYear',
    ],
  },
  payments: { read: 'lookup', lookupFields: ['transactionId', 'receiptNo', 'membershipId', 'phone'], create: true },
  contacts: { create: true },
  feedback_messages: { create: true },
};

const MAX_BODY_BYTES = 1_900_000; // D1 rows are capped at 2 MB
const MAX_LIST = 5000;
const MAX_LOOKUP = 50;
const FIELD_RE = /^[A-Za-z0-9_]{1,64}$/;

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

const toDoc = (row: { id: string; data: string }, hidden: string[] = []) => {
  const data = JSON.parse(row.data);
  for (const key of hidden) delete data[key];
  return { ...data, id: row.id };
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
    if (i < 1 || !FIELD_RE.test(field)) throw new HttpError(400, `Invalid where clause: ${w}`);
    return { field, value: w.slice(i + 1) };
  });
}

async function handleDb(request: Request, url: URL, env: DbEnv, segments: string[]): Promise<Response> {
  const [collection, rawId] = segments;
  const policy = POLICY[collection];
  if (!policy) throw new HttpError(404, `Unknown collection: ${collection}`);
  const id = rawId ? decodeURIComponent(rawId) : undefined;
  if (id !== undefined && (id.length === 0 || id.length > 200)) throw new HttpError(400, 'Invalid document id');

  const method = request.method.toUpperCase();
  const admin = await isAdmin(request, env);
  const requireAdmin = () => {
    if (!admin) throw new HttpError(401, 'Admin authentication required');
  };

  /* ------------------------------------------------------------------ read */
  if (method === 'GET') {
    if (id !== undefined) {
      if (!admin && !policy.read) requireAdmin();
      const row = await env.DB.prepare('SELECT id, data FROM documents WHERE collection = ?1 AND id = ?2')
        .bind(collection, id)
        .first<{ id: string; data: string }>();
      if (!row) throw new HttpError(404, 'Not found');
      return json({ doc: toDoc(row) });
    }

    const where = parseWhere(url);
    let limit = Math.min(Number(url.searchParams.get('limit')) || MAX_LIST, MAX_LIST);
    let hidden: string[] = [];

    if (!admin && policy.read !== 'public') {
      if (policy.read !== 'lookup') requireAdmin();
      const allowed = policy.lookupFields || [];
      if (where.length === 0 || where.some((w) => !allowed.includes(w.field))) {
        throw new HttpError(403, 'This query requires admin authentication');
      }
      const directory = where.every((w) => w.field === 'status');
      if (directory) {
        if (!(where.length === 1 && where[0].value === 'approved')) throw new HttpError(403, 'This query requires admin authentication');
        hidden = policy.directoryHiddenFields || [];
      } else {
        limit = Math.min(limit, MAX_LOOKUP);
      }
    }

    const clauses = ['collection = ?1'];
    const binds: (string | number)[] = [collection];
    for (const w of where) {
      binds.push(w.value);
      clauses.push(`json_extract(data, '$.${w.field}') = ?${binds.length}`);
    }
    binds.push(limit);
    const { results } = await env.DB.prepare(
      `SELECT id, data FROM documents WHERE ${clauses.join(' AND ')} ORDER BY created_at DESC LIMIT ?${binds.length}`
    )
      .bind(...binds)
      .all<{ id: string; data: string }>();
    return json({ docs: results.map((r) => toDoc(r, hidden)) });
  }

  /* ----------------------------------------------------------------- write */
  if (method === 'POST' && id === undefined) {
    if (!admin && !policy.create) requireAdmin();
    const body = await readJsonObject(request);
    const newId = crypto.randomUUID();
    await env.DB.prepare('INSERT INTO documents (collection, id, data) VALUES (?1, ?2, ?3)')
      .bind(collection, newId, JSON.stringify(body))
      .run();
    return json({ id: newId }, 201);
  }

  if (id === undefined) throw new HttpError(405, 'Method not allowed');

  if (method === 'PUT') {
    const body = await readJsonObject(request);
    const merge = url.searchParams.get('merge') === '1';

    if (!admin) {
      if (!policy.create) requireAdmin();
      // Public callers can only create; an existing document is left untouched.
      const res = await env.DB.prepare('INSERT INTO documents (collection, id, data) VALUES (?1, ?2, ?3) ON CONFLICT DO NOTHING')
        .bind(collection, id, JSON.stringify(body))
        .run();
      return json({ ok: true, created: (res.meta.changes ?? 0) > 0 });
    }

    const onConflict = merge
      ? 'data = json_patch(documents.data, excluded.data)'
      : 'data = excluded.data';
    await env.DB.prepare(
      `INSERT INTO documents (collection, id, data) VALUES (?1, ?2, ?3)
       ON CONFLICT (collection, id) DO UPDATE SET ${onConflict}, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')`
    )
      .bind(collection, id, JSON.stringify(body))
      .run();
    return json({ ok: true });
  }

  if (method === 'PATCH') {
    const body = await readJsonObject(request);
    if (!admin) {
      const keys = policy.publicPatchKeys || [];
      if (keys.length === 0) requireAdmin();
      if (Object.keys(body).some((k) => !keys.includes(k))) throw new HttpError(403, 'Field update requires admin authentication');
    }
    const res = await env.DB.prepare(
      `UPDATE documents SET data = json_patch(data, ?3), updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
       WHERE collection = ?1 AND id = ?2`
    )
      .bind(collection, id, JSON.stringify(body))
      .run();
    if (!res.meta.changes) throw new HttpError(404, 'Not found');
    return json({ ok: true });
  }

  if (method === 'DELETE') {
    requireAdmin();
    await env.DB.prepare('DELETE FROM documents WHERE collection = ?1 AND id = ?2').bind(collection, id).run();
    return json({ ok: true });
  }

  throw new HttpError(405, 'Method not allowed');
}

const toEnDigits = (str: string) => str.replace(/[০-৯]/g, (d) => String('০১২৩৪৫৬৭৮৯'.indexOf(d)));

/**
 * Member portal login: match a Member ID + mobile number server-side so the browser never
 * has to download the membership list. Only approved members get a profile back.
 */
async function memberLogin(env: DbEnv, rawId: string, rawMobile: string) {
  const cleanId = toEnDigits(rawId).toLowerCase().replace(/[^a-z0-9]/gi, '');
  const cleanMobile = toEnDigits(rawMobile).replace(/\D/g, '');
  if (!cleanId || !cleanMobile) return { member: null, status: null, name: '' };

  const { results } = await env.DB.prepare(
    `SELECT id,
            json_extract(data, '$.formNo') AS formNo, json_extract(data, '$.membershipId') AS membershipId,
            json_extract(data, '$.mobile') AS mobile, json_extract(data, '$.phone') AS phone,
            json_extract(data, '$.status') AS status, json_extract(data, '$.applicantNameBn') AS nameBn,
            json_extract(data, '$.fullName') AS fullName, json_extract(data, '$.applicantNameEn') AS nameEn,
            json_extract(data, '$.session') AS session, json_extract(data, '$.batch') AS batch,
            json_extract(data, '$.program') AS program, json_extract(data, '$.userPhotoUrl') AS photo,
            json_extract(data, '$.bloodGroup') AS bloodGroup
       FROM documents WHERE collection = 'memberships'`
  ).all<Record<string, string | null>>();

  let status: string | null = null;
  let name = '';
  for (const r of results) {
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
    name = r.nameBn || r.fullName || r.nameEn || 'সম্মানিত সদস্য';
    if (r.status === 'approved') {
      return {
        status,
        name,
        member: {
          id: r.id,
          formNo: r.formNo || r.membershipId || r.id,
          applicantNameBn: r.nameBn || r.fullName || 'সম্মানিত সদস্য',
          applicantNameEn: r.nameEn || '',
          mobile: r.mobile || r.phone || '',
          session: r.session || r.batch || '',
          program: r.program || 'bsc_honours',
          userPhotoUrl: r.photo || '',
          bloodGroup: r.bloodGroup || '',
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
