export interface Env {
  APP_URL?: string;
  SMS_API_KEY?: string;
  SMS_SENDER_ID?: string;
  SMS_API_URL?: string;
  SMS_PROVIDER?: string;
  RESEND_API_KEY?: string;
  RESEND_FROM_EMAIL?: string;
  ASSETS?: { fetch: (req: Request) => Promise<Response> };
}

/* ---------------------------------------------------------------------------
 * Firebase (Firestore REST) central storage.
 * Prod runs on Cloudflare Worker with no Node filesystem, so all /api/* data
 * endpoints are backed by the public Firestore REST API. Security rules are
 * open ("allow read, write: if true"), so the web API key is sufficient.
 * ------------------------------------------------------------------------- */
const FB_PROJECT_ID = 'academic-domain-2rr5c';
const FB_API_KEY = 'AIzaSyA8INm0h9iUN7Lleids_AUn1AzHstLhISg';
const FB_DB_ID = 'ai-studio-botanyalumniasso-31f95de5-d295-4aaa-bb38-c1987454f637';
const FS_BASE = `https://firestore.googleapis.com/v1/projects/${FB_PROJECT_ID}/databases/${FB_DB_ID}/documents`;

function normalizeBDPhone(phone: string): { local: string; withCountry: string } {
  const digitsOnly = String(phone || '').replace(/[^0-9]/g, '');
  let local = digitsOnly;
  if (digitsOnly.startsWith('880')) {
    local = digitsOnly.slice(2);
  } else if (digitsOnly.startsWith('88')) {
    local = digitsOnly.slice(2);
  }
  if (!local.startsWith('0') && local.length === 10) {
    local = `0${local}`;
  }
  return {
    local,
    withCountry: local.startsWith('0') ? `88${local}` : `880${local}`,
  };
}

async function sendSMSWithEnv({
  mobile,
  message,
  env,
}: {
  mobile: string;
  message: string;
  env: Env;
}): Promise<{ success: boolean; provider: string; data?: any; error?: string }> {
  const rawSmsKey = env.SMS_API_KEY;
  const apiKey = (rawSmsKey && rawSmsKey !== 'BMszEcuXSaGtE4xr68JP8G6m3uP04IZidBWpgXIB')
    ? rawSmsKey
    : 'juOIwULseyuzv3Z9AUKk';
  const SMS_PROVIDER = (env.SMS_PROVIDER || 'bulksmsbd').toLowerCase();
  const SMS_SENDER_ID = env.SMS_SENDER_ID || '8809648906169';
  const SMS_API_URL = env.SMS_API_URL || 'http://bulksmsbd.net/api/smsapi';

  const { local, withCountry } = normalizeBDPhone(mobile);
  console.log(`[CF Worker SMS] Sending to ${local} (${withCountry}) via ${SMS_PROVIDER}...`);

  try {
    if (SMS_PROVIDER === 'bulksmsbd' || !SMS_PROVIDER) {
      const url = SMS_API_URL || 'http://bulksmsbd.net/api/smsapi';
      const targetNumber = local.startsWith('0') ? local : `0${local}`;
      const hasUnicode = /[^\u0000-\u007F]/.test(message);
      const smsType = hasUnicode ? 'unicode' : 'text';

      const postParams = new URLSearchParams({
        api_key: apiKey,
        type: smsType,
        number: targetNumber,
        message: message,
      });
      if (SMS_SENDER_ID) {
        postParams.append('senderid', SMS_SENDER_ID);
      }

      let res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
        body: postParams.toString(),
      });

      let textRes = await res.text();
      let jsonRes: any = null;
      try {
        jsonRes = JSON.parse(textRes);
      } catch (e) {
        jsonRes = { raw: textRes };
      }

      if (!jsonRes || (jsonRes.response_code !== 202 && jsonRes.response_code !== 200)) {
        const getUrl = `${url}?${postParams.toString()}`;
        const getRes = await fetch(getUrl, { method: 'GET' });
        const getText = await getRes.text();
        try {
          jsonRes = JSON.parse(getText);
        } catch (e) {
          jsonRes = { raw: getText };
        }
      }

      const isSuccess = Boolean(
        jsonRes && (
          jsonRes.response_code === 202 ||
          jsonRes.response_code === 200 ||
          jsonRes.success === true ||
          (typeof textRes === 'string' && textRes.includes('202'))
        )
      );
      return { success: isSuccess, provider: 'bulksmsbd', data: jsonRes };
    }

    if (SMS_PROVIDER === 'alphasms' || SMS_PROVIDER === 'sms.net.bd') {
      const url = SMS_API_URL || 'https://api.sms.net.bd/sendsms';
      const formData = new URLSearchParams();
      formData.append('api_key', apiKey);
      formData.append('msg', message);
      formData.append('to', withCountry);
      if (SMS_SENDER_ID) formData.append('sender_id', SMS_SENDER_ID);

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
      });
      const data = await res.json().catch(() => ({}));
      return { success: res.ok, provider: 'alphasms', data };
    }

    return { success: false, provider: 'unknown', error: 'Unknown provider' };
  } catch (err: any) {
    console.error('Cloudflare Worker SMS Error:', err);
    return { success: false, provider: SMS_PROVIDER, error: err.message };
  }
}

/* ---------------------------------------------------------------------------
 * Resend email (parity with Express server /api/send-email)
 * ------------------------------------------------------------------------- */
async function sendEmail({
  to,
  subject,
  html,
  text,
  from,
  env,
}: {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  env: Env;
}): Promise<{ success: boolean; data?: any; error?: string }> {
  const apiKey = env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('[Resend Email] RESEND_API_KEY is not configured in environment.');
    return { success: false, error: 'RESEND_API_KEY environment variable is not configured.' };
  }

  try {
    const defaultSender = 'Botany Alumni Association <onboarding@resend.dev>';
    const sender = from || env.RESEND_FROM_EMAIL || defaultSender;

    const result = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: sender,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        text,
      }),
    });

    let data: any = null;
    try { data = await result.json(); } catch {}

    if (!result.ok) {
      console.error('[Resend Email] Error from Resend API:', data);
      return { success: false, error: (data && (data.message || data.error)) || 'Failed to send email via Resend' };
    }

    console.log('[Resend Email] Email sent successfully! ID:', data && data.id);
    return { success: true, data };
  } catch (err: any) {
    console.error('[Resend Email] Send Error:', err);
    return { success: false, error: err.message };
  }
}

/* ---------------------------------------------------------------------------
 * Firestore REST helpers: JSON <-> Firestore typed values
 * ------------------------------------------------------------------------- */
function jsonValueToFirestore(value: any): any {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (typeof value === 'number') {
    return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  }
  if (typeof value === 'string') return { stringValue: value };
  if (Array.isArray(value)) {
    return { arrayValue: { values: value.map((v) => jsonValueToFirestore(v)) } };
  }
  if (typeof value === 'object') {
    const fields: Record<string, any> = {};
    for (const [k, v] of Object.entries(value as Record<string, any>)) {
      fields[k] = jsonValueToFirestore(v);
    }
    return { mapValue: { fields } };
  }
  return { stringValue: String(value) };
}

function firestoreValueToJs(fieldValue: any): any {
  if (!fieldValue || typeof fieldValue !== 'object') return null;
  if ('nullValue' in fieldValue) return null;
  if ('booleanValue' in fieldValue) return fieldValue.booleanValue;
  if ('integerValue' in fieldValue) return parseInt(fieldValue.integerValue, 10);
  if ('doubleValue' in fieldValue) return fieldValue.doubleValue;
  if ('stringValue' in fieldValue) return fieldValue.stringValue;
  if ('timestampValue' in fieldValue) return fieldValue.timestampValue;
  if ('arrayValue' in fieldValue) {
    return ((fieldValue.arrayValue && fieldValue.arrayValue.values) || []).map(firestoreValueToJs);
  }
  if ('mapValue' in fieldValue) {
    const fields = (fieldValue.mapValue && fieldValue.mapValue.fields) || {};
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(fields)) {
      out[k] = firestoreValueToJs(v);
    }
    return out;
  }
  if ('bytesValue' in fieldValue) return fieldValue.bytesValue;
  if ('referenceValue' in fieldValue) return fieldValue.referenceValue;
  if ('geoPointValue' in fieldValue) return fieldValue.geoPointValue;
  return null;
}

function docIdFromName(name: string | undefined): string {
  if (!name) return '';
  const parts = name.split('/');
  return parts[parts.length - 1];
}

/* ---------------------------------------------------------------------------
 * Read-optimize: this database is an AI-Studio free-tier Firestore with a hard
 * daily read quota. Every GET result is cached per isolate with a short TTL and
 * stale data is served when Firestore is throttled, so normal visitors and the
 * admin dashboard no longer burn through the quota.
 * ------------------------------------------------------------------------- */
const responseCache = new Map<string, { t: number; val: any }>();

async function cached<T>(key: string, ttlMs: number, producer: () => Promise<T>): Promise<T> {
  const hit = responseCache.get(key);
  const now = Date.now();
  if (hit && now - hit.t < ttlMs) return hit.val;
  try {
    const val = await producer();
    responseCache.set(key, { t: now, val });
    return val;
  } catch (err: any) {
    // Firestore quota / transient errors — serve stale cache if available
    if (hit && /429|RESOURCE_EXHAUSTED|quota|Deadline|unavailable|500/.test(err.message || '')) {
      return hit.val;
    }
    throw err;
  }
}

function invalidateCache(prefixes: string[]): void {
  for (const key of Array.from(responseCache.keys())) {
    if (prefixes.some((p) => key.startsWith(p))) responseCache.delete(key);
  }
}

function firestoreDocToJs(doc: any): Record<string, any> {
  const fields = (doc && doc.fields) || {};
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(fields)) {
    out[k] = firestoreValueToJs(v);
  }
  return out;
}

// Collection listing must use :runQuery — the direct documents.list endpoint
// rejects tokenless (API-key-only) requests with 403 even when rules are open.
// `limit` keeps read units low on heavy collections.
async function fsListDocuments(collectionName: string, limit = 300): Promise<Record<string, any>[]> {
  const url = `${FS_BASE}:runQuery?key=${FB_API_KEY}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: collectionName, allDescendants: false }],
        ...(limit ? { limit: { value: limit } } : {}),
      },
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Firestore list failed (${res.status}): ${text.slice(0, 200)}`);
  }
  const data: any = await res.json();
  const rows = Array.isArray(data) ? data : [];
  const docs = rows
    .map((row: any) => row.document)
    .filter(Boolean);
  return docs.map((doc: any) => ({
    ...firestoreDocToJs(doc),
    id: docIdFromName(doc.name),
  }));
}

async function fsGetDocument(collectionName: string, id: string): Promise<Record<string, any> | null> {
  const url = `${FS_BASE}/${encodeURIComponent(collectionName)}/${encodeURIComponent(id)}?key=${FB_API_KEY}`;
  const res = await fetch(url);
  if (res.status === 404) return null;
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Firestore get failed (${res.status}): ${text.slice(0, 200)}`);
  }
  const doc: any = await res.json();
  return { ...firestoreDocToJs(doc), id: docIdFromName(doc.name) };
}

// "set" semantics: creates when missing, otherwise overwrites whole doc.
async function fsSetDocument(
  collectionName: string,
  id: string,
  data: Record<string, any>
): Promise<void> {
  const fields: Record<string, any> = {};
  for (const [k, v] of Object.entries(data)) {
    if (v === undefined) continue;
    fields[k] = jsonValueToFirestore(v);
  }
  const url = `${FS_BASE}/${encodeURIComponent(collectionName)}/${encodeURIComponent(id)}?key=${FB_API_KEY}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Firestore write failed (${res.status}): ${text.slice(0, 200)}`);
  }
}

// "update" semantics: read-merge-write so only provided fields change.
// Uses Firestore's updateMask so no read unit is consumed — critical on the
// free-tier database (payment flow PATCH must succeed even when read quota
// for the day is exhausted).
async function fsPatchDocument(
  collectionName: string,
  id: string,
  updates: Record<string, any>
): Promise<Record<string, any>> {
  const fields: Record<string, any> = {};
  const maskKeys: string[] = [];
  for (const [k, v] of Object.entries(updates)) {
    if (v === undefined) continue;
    fields[k] = jsonValueToFirestore(v);
    maskKeys.push(k);
  }
  const mask = maskKeys.map((k) => `updateMask.fieldPaths=${encodeURIComponent(k)}`).join('&');
  const url = `${FS_BASE}/${encodeURIComponent(collectionName)}/${encodeURIComponent(id)}?key=${FB_API_KEY}${mask ? '&' + mask : ''}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Firestore update failed (${res.status}): ${text.slice(0, 200)}`);
  }
  const doc: any = await res.json();
  const merged = { ...firestoreDocToJs(doc), id };
  return merged;
}

async function fsDeleteDocument(collectionName: string, id: string): Promise<void> {
  const url = `${FS_BASE}/${encodeURIComponent(collectionName)}/${encodeURIComponent(id)}?key=${FB_API_KEY}`;
  await fetch(url, { method: 'DELETE' });
}

function sortByCreatedAtDesc<T extends Record<string, any>>(list: T[]): T[] {
  return list.sort((a, b) => {
    const tA = a.createdAt ? new Date(String(a.createdAt)).getTime() : 0;
    const tB = b.createdAt ? new Date(String(b.createdAt)).getTime() : 0;
    return tB - tA;
  });
}

function isDemoNoticeId(id: string): boolean {
  if (!id) return false;
  return /^not-(0[1-9]|[12][0-9]|3[0-5])$/.test(id) || id.startsWith('not_demo_');
}

const DEFAULT_COMMUNITY_STATS = {
  mode: 'manual',
  totalMembers: 1240,
  lifeMembers: 793,
  committeeMembers: 35,
  donorMembers: 29,
  suffix: '+',
  titleBn: 'আমাদের অ্যালামনাই পরিবার',
  titleEn: 'Our Growing Community',
  subBn: 'জগন্নাথ বিশ্ববিদ্যালয় উদ্ভিদবিজ্ঞান বিভাগের সকল ব্যাচের প্রাক্তন ও বর্তমান সদস্যদের সম্মিলিত শক্তি',
  subEn: 'Uniting generations of Botany Alumni from Jagannath University, Dhaka',
};

async function readBody(request: Request): Promise<any> {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

function jsonResponse(obj: any, status = 200): Response {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

async function handleApi(
  normalizedPath: string,
  request: Request,
  url: URL,
  env: Env
): Promise<Response> {
  const method = request.method.toUpperCase();
  const segments = normalizedPath.split('/').filter(Boolean); // e.g. ['api','memberships',':id']

  /* ---------------------------------------------------------------- health */
  if (normalizedPath === '/api/health') {
    return jsonResponse({
      status: 'ok',
      smsConfigured: true,
      smsProvider: (env.SMS_PROVIDER || 'bulksmsbd').toLowerCase(),
      resendConfigured: Boolean(env.RESEND_API_KEY),
      timestamp: new Date().toISOString(),
      platform: 'cloudflare-worker',
    });
  }

  /* ------------------------------------------------------------------- SMS */
  if (normalizedPath === '/api/send-sms') {
    try {
      const body = await readBody(request);
      const { mobile, name, amount, tranId, formNo, cardUrl, message: customMsg } = body;
      const targetMobile = mobile || '';

      if (!targetMobile) {
        return jsonResponse({ success: false, error: 'Mobile number is required' }, 400);
      }

      const applicantName = (name && name !== 'Applicant' && name !== 'সদস্য') ? name : '';
      const displayName = applicantName ? applicantName : 'সদস্য';
      const formNoVal = formNo || body.formNo || '';
      const linkToCard = cardUrl || (formNoVal ? `${url.origin}/card/${encodeURIComponent(formNoVal)}` : (tranId ? `${url.origin}/card/${encodeURIComponent(tranId)}` : `${url.origin}/card/BOTANY-ALUMNI`));

      let msgToSend = (customMsg || '').trim();
      if (!msgToSend) {
        msgToSend = `অভিনন্দন ${displayName}! উদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশন সদস্য নিবন্ধনে আপনার আবেদন ও ৳${amount || '৫০০'} ফি সফলভাবে গৃহীত হয়েছে (TrxID: ${tranId || 'N/A'})।`;
      }

      const smsResult = await sendSMSWithEnv({
        mobile: targetMobile,
        message: msgToSend,
        env,
      });

      return jsonResponse({ ...smsResult, cardUrl: linkToCard });
    } catch (err: any) {
      return jsonResponse({ success: false, error: err.message }, 500);
    }
  }

  if (normalizedPath === '/api/test-sms') {
    const phone = url.searchParams.get('phone') || url.searchParams.get('mobile') || '01401996674';
    const testMsg = `উদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশন: টেস্ট এসএমএস সফল হয়েছে! সময়: ${new Date().toLocaleTimeString('bn-BD')}`;
    const result = await sendSMSWithEnv({
      mobile: phone,
      message: testMsg,
      env,
    });
    return jsonResponse(result);
  }

  /* ----------------------------------------------------------------- email */
  if (normalizedPath === '/api/send-email' && method === 'POST') {
    try {
      const body = await readBody(request);
      const { to, subject, html, text, from, applicantName, formNo, amount, tranId } = body;

      if (!to) {
        return jsonResponse({ status: 'FAILED', message: 'Recipient email ("to") is required' }, 400);
      }

      let finalSubject = subject || 'উদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশন - নোটিফিকেশন';
      let finalHtml = html;

      if (!finalHtml) {
        const name = applicantName || 'সম্মানিত সদস্য';
        const txn = tranId || '';
        finalHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; background-color: #ffffff;">
            <div style="background-color: #006a4e; padding: 20px; text-align: center; border-radius: 6px 6px 0 0;">
              <h1 style="color: #ffffff; margin: 0; font-size: 20px;">উদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশন</h1>
              <p style="color: #fcd34d; margin: 5px 0 0 0; font-size: 14px;">জগন্নাথ বিশ্ববিদ্যালয়, ঢাকা</p>
            </div>
            <div style="padding: 20px; color: #1f2937; line-height: 1.6;">
              <p>প্রিয় <strong>${name}</strong>,</p>
              <p>উদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশনে আপনাকে স্বাগতম।</p>
              ${formNo ? `<p><strong>আবেদন নম্বর (Form No):</strong> ${formNo}</p>` : ''}
              ${amount ? `<p><strong>ফি:</strong> ৳${amount}</p>` : ''}
              ${txn ? `<p><strong>ট্রানজেকশন আইডি:</strong> ${txn}</p>` : ''}
              <p style="margin-top: 20px;">আপনার সার্বিক আপডেট ও অ্যালুমনাই তথ্য জানতে আমাদের ওয়েবসাইটে ভিজিট করুন।</p>
            </div>
            <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 6px 6px;">
              © উদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশন, জগন্নাথ বিশ্ববিদ্যালয়
            </div>
          </div>
        `;
      }

      const emailResult = await sendEmail({ to, subject: finalSubject, html: finalHtml, text, from, env });
      return jsonResponse({
        status: emailResult.success ? 'SUCCESS' : 'FAILED',
        result: emailResult,
      });
    } catch (err: any) {
      console.error('API /api/send-email Error:', err);
      return jsonResponse({ status: 'FAILED', message: err.message }, 500);
    }
  }

  if (normalizedPath === '/api/test-email') {
    try {
      const body = await readBody(request);
      const to = url.searchParams.get('to') || url.searchParams.get('email') || body.to || body.email || 'hellothereshamim@gmail.com';
      const testSubject = 'উদ্ভিদবিজ্ঞান অ্যালামনাই - Resend Email Test';
      const testHtml = `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #006a4e; border-radius: 8px; max-width: 500px;">
          <h2 style="color: #006a4e; margin-top: 0;">Resend.com Email Integration Active!</h2>
          <p>উদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশন জগন্নাথ বিশ্ববিদ্যালয় সিস্টেম থেকে Resend.com এর মাধ্যমে ইমেইল সার্ভিস সফলভাবে সংযুক্ত করা হয়েছে।</p>
          <p style="font-size: 12px; color: #666; margin-bottom: 0;">Timestamp: ${new Date().toISOString()}</p>
        </div>
      `;
      const result = await sendEmail({ to, subject: testSubject, html: testHtml, env });
      return jsonResponse({
        status: result.success ? 'SUCCESS' : 'FAILED',
        to,
        result,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      return jsonResponse({ status: 'FAILED', error: err.message }, 500);
    }
  }

  /* ----------------------------------------------------------- memberships */
  if (normalizedPath === '/api/memberships') {
    try {
      if (method === 'GET') {
        try {
          const members = await cached('memberships', 20000, () => fsListDocuments('memberships'));
          return jsonResponse(sortByCreatedAtDesc(members));
        } catch (e) {
          return jsonResponse(sortByCreatedAtDesc([]));
        }
      }

      if (method === 'POST' || method === 'PUT') {
        const member = await readBody(request);
        if (!member) return jsonResponse({ error: 'Membership body required' }, 400);

        const now = new Date().toISOString();

        // Explicit existing-id update (never MEM-/BOT- client ids)
        let requestedId = member.id || member.membershipId;
        let existingDoc: Record<string, any> | null = null;
        if (requestedId && String(requestedId).length > 5 && !String(requestedId).startsWith('MEM-') && !String(requestedId).startsWith('BOT-')) {
          existingDoc = await fsGetDocument('memberships', String(requestedId));
        }

        if (existingDoc) {
          const updatedRecord = {
            ...existingDoc,
            ...member,
            id: existingDoc.id,
            membershipId: existingDoc.membershipId || existingDoc.id,
            formNo: existingDoc.formNo || member.formNo || `BOT-${String(Date.now()).slice(-4)}`,
            updatedAt: now,
          };
          await fsSetDocument('memberships', String(existingDoc.id), updatedRecord);
          invalidateCache(['memberships']);
          console.log(`[API] Updated existing membership: ${updatedRecord.id}`);
          return jsonResponse({ success: true, member: updatedRecord });
        }

        // New membership registration — intentionally avoids read operations
        // (free-tier Firestore read quota is scarce; form-number comes from the client)
        const uniqueId = String(member.id || member.membershipId || `MEM-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`);
        const finalFormNo = member.formNo && member.formNo !== 'BOT-0001' ? member.formNo : `BOT-${String(Date.now()).slice(-4)}`;

        const record = {
          ...member,
          id: uniqueId,
          membershipId: member.membershipId || uniqueId,
          formNo: finalFormNo,
          status: member.status || 'pending',
          paymentStatus: member.paymentStatus || 'pending',
          createdAt: member.createdAt || now,
          updatedAt: now,
        };

        await fsSetDocument('memberships', uniqueId, record);
        invalidateCache(['memberships']);
        console.log(`[API] Created new membership: ${uniqueId} (Form: ${finalFormNo})`);
        return jsonResponse({ success: true, member: record });
      }
    } catch (err: any) {
      console.error('API /api/memberships error:', err);
      return jsonResponse({ error: err.message }, 500);
    }
  }

  if (segments[1] === 'memberships' && segments[2] === 'sync-batch' && method === 'POST') {
    try {
      const { memberships } = await readBody(request);
      if (!Array.isArray(memberships)) {
        return jsonResponse({ error: 'Array of memberships is required' }, 400);
      }
      const current = await fsListDocuments('memberships');
      const map = new Map<string, any>(current.map((m: any) => [m.id || m.membershipId, m]));

      for (const m of memberships) {
        if (m && (m.id || m.membershipId || m.formNo)) {
          const key = String(m.id || m.membershipId || m.formNo);
          const existing = map.get(key);
          map.set(key, existing ? { ...existing, ...m } : m);
        }
      }

      const merged = sortByCreatedAtDesc(Array.from(map.values()));
      await Promise.all(
        merged
          .filter((m: any) => m.id)
          .map((m: any) => fsSetDocument('memberships', String(m.id), m))
      );
      invalidateCache(['memberships']);
      return jsonResponse({ success: true, count: merged.length, memberships: merged });
    } catch (err: any) {
      console.error('API memberships/sync-batch error:', err);
      return jsonResponse({ error: err.message }, 500);
    }
  }

  if (segments[1] === 'memberships' && segments[2]) {
    const id = decodeURIComponent(segments[2]);
    try {
      if (method === 'GET') {
        const docRec = await fsGetDocument('memberships', id);
        if (!docRec) return jsonResponse({ error: 'Not found' }, 404);
        return jsonResponse(docRec);
      }
      if (method === 'PATCH' || method === 'PUT') {
        const updates = await readBody(request);
        const member = await fsPatchDocument('memberships', id, {
          ...updates,
          updatedAt: new Date().toISOString(),
        });
        invalidateCache(['memberships']);
        return jsonResponse({ success: true, member });
      }
      if (method === 'DELETE') {
        await fsDeleteDocument('memberships', id);
        invalidateCache(['memberships']);
        return jsonResponse({ success: true, id });
      }
    } catch (err: any) {
      console.error(`API /api/memberships/${id} error:`, err);
      return jsonResponse({ error: err.message }, err.message.includes('404') ? 404 : 500);
    }
  }

  /* -------------------------------------------------------------- payments */
  if (normalizedPath === '/api/payments') {
    try {
      if (method === 'GET') {
        try {
          const payments = await cached('payments', 20000, () => fsListDocuments('payments'));
          return jsonResponse(sortByCreatedAtDesc(payments));
        } catch (e) {
          return jsonResponse([]);
        }
      }
      if (method === 'POST' || method === 'PUT') {
        const payment = await readBody(request);
        if (!payment) return jsonResponse({ error: 'Payment body required' }, 400);
        const id = String(payment.id || payment.paymentDocId || `PAY-${Date.now()}`);
        const record = {
          ...payment,
          id,
          createdAt: payment.createdAt || new Date().toISOString(),
        };
        await fsSetDocument('payments', id, record);
        invalidateCache(['payments']);
        return jsonResponse({ success: true, payment: record });
      }
    } catch (err: any) {
      console.error('API /api/payments error:', err);
      return jsonResponse({ error: err.message }, 500);
    }
  }

  /* --------------------------------------------------------- community-stats */
  if (normalizedPath === '/api/community-stats') {
    try {
      if (method === 'GET') {
        try {
          const docRec = await cached('community_stats', 30000, () => fsGetDocument('site_settings', 'community_stats'));
          const stats: Record<string, any> = { ...DEFAULT_COMMUNITY_STATS, ...(docRec || {}), mode: 'manual' };
          if (stats.id) delete stats.id;
          return jsonResponse(stats);
        } catch (e) {
          // Quota / degraded Firestore — serve last known defaults so the
          // homepage never shows a broken state
          const stats: Record<string, any> = { ...DEFAULT_COMMUNITY_STATS, mode: 'manual' };
          return jsonResponse(stats);
        }
      }
      if (method === 'POST' || method === 'PUT') {
        const stats = (await readBody(request)) || {};
        const updated = { ...stats, mode: 'manual', updatedAt: new Date().toISOString() };
        delete updated.id;
        await fsSetDocument('site_settings', 'community_stats', updated);
        invalidateCache(['community_stats']);
        return jsonResponse({ success: true, stats: updated });
      }
    } catch (err: any) {
      console.error('API /api/community-stats error:', err);
      return jsonResponse({ error: err.message }, 500);
    }
  }

  /* ------------------------------------------------------------ recent-news */
  if (normalizedPath === '/api/recent-news') {
    try {
      if (method === 'GET') {
        try {
          const news = await cached('recent_news', 60000, () => fsListDocuments('recent_news', 30));
          return jsonResponse(sortByCreatedAtDesc(news));
        } catch (e) {
          return jsonResponse([]);
        }
      }
      if (method === 'POST' || method === 'PUT') {
        const item = await readBody(request);
        if (!item) return jsonResponse({ error: 'Body required' }, 400);
        const id = String(item.id || `NEWS-${Date.now()}`);
        const existing = await fsGetDocument('recent_news', id);
        const record = { ...(existing || {}), ...item, id, updatedAt: new Date().toISOString() };
        await fsSetDocument('recent_news', id, record);
        invalidateCache(['recent_news']);
        return jsonResponse({ success: true, item: record });
      }
    } catch (err: any) {
      console.error('API /api/recent-news error:', err);
      return jsonResponse({ error: err.message }, 500);
    }
  }

  if (segments[1] === 'recent-news' && segments[2] === 'sync-batch' && method === 'POST') {
    try {
      const { items } = await readBody(request);
      if (!Array.isArray(items)) return jsonResponse({ error: 'Array required' }, 400);
      let count = 0;
      for (const item of items) {
        if (item && item.id) {
          const existing = await fsGetDocument('recent_news', String(item.id));
          const record = { ...(existing || {}), ...item, id: String(item.id), updatedAt: new Date().toISOString() };
          await fsSetDocument('recent_news', String(item.id), record);
          count += 1;
        }
      }
      invalidateCache(['recent_news']);
      return jsonResponse({ success: true, count });
    } catch (err: any) {
      console.error('API recent-news/sync-batch error:', err);
      return jsonResponse({ error: err.message }, 500);
    }
  }

  if (segments[1] === 'recent-news' && segments[2] && method === 'DELETE') {
    const id = decodeURIComponent(segments[2]).replace(/\?.*$/, '');
    try {
      await fsDeleteDocument('recent_news', id);
      invalidateCache(['recent_news']);
      return jsonResponse({ success: true, id });
    } catch (err: any) {
      console.error(`API /api/recent-news/${id} error:`, err);
      return jsonResponse({ error: err.message }, 500);
    }
  }

  /* ---------------------------------------------------------------- notices */
  if (normalizedPath === '/api/notices') {
    try {
      if (method === 'GET') {
        try {
          const notices = await cached('notices', 60000, () => fsListDocuments('notices', 60));
          const cleaned = notices
            .filter((n: any) => n && n.id && !isDemoNoticeId(String(n.id)))
            .map((n: any) => {
              if (n.id) delete n.id;
              return n;
            });
          return jsonResponse(sortByCreatedAtDesc(cleaned as any));
        } catch (e) {
          // Quota / degraded Firestore: empty list lets the client fall back
          // to its bundled demo notices instead of erroring
          return jsonResponse([]);
        }
      }
      if (method === 'POST' || method === 'PUT') {
        const notice = await readBody(request);
        if (!notice || !notice.id) return jsonResponse({ error: 'Notice id is required' }, 400);
        if (isDemoNoticeId(String(notice.id))) {
          return jsonResponse({ success: true, ignored: true });
        }
        const existing = await fsGetDocument('notices', String(notice.id));
        const record = { ...(existing || {}), ...notice, id: String(notice.id) };
        await fsSetDocument('notices', String(notice.id), record);
        invalidateCache(['notices']);
        return jsonResponse({ success: true, notice: record });
      }
    } catch (err: any) {
      console.error('API /api/notices error:', err);
      return jsonResponse({ error: err.message }, 500);
    }
  }

  if (segments[1] === 'notices' && segments[2] === 'sync-batch' && method === 'POST') {
    try {
      const { notices } = await readBody(request);
      if (!Array.isArray(notices)) {
        return jsonResponse({ error: 'Array of notices is required' }, 400);
      }
      const valid = notices.filter((n: any) => n && n.id && !isDemoNoticeId(String(n.id)));
      for (const n of valid) {
        const existing = await fsGetDocument('notices', String(n.id));
        const record = { ...(existing || {}), ...n, id: String(n.id) };
        await fsSetDocument('notices', String(n.id), record);
      }
      const merged = await fsListDocuments('notices');
      invalidateCache(['notices']);
      const cleaned = merged.filter((n: any) => n && n.id && !isDemoNoticeId(String(n.id)));
      return jsonResponse({ success: true, count: cleaned.length, notices: cleaned });
    } catch (err: any) {
      console.error('API notices/sync-batch error:', err);
      return jsonResponse({ error: err.message }, 500);
    }
  }

  if (segments[1] === 'notices' && segments[2] && method === 'DELETE') {
    const id = decodeURIComponent(segments[2]).replace(/\?.*$/, '');
    try {
      await fsDeleteDocument('notices', id);
      invalidateCache(['notices']);
      return jsonResponse({ success: true, id });
    } catch (err: any) {
      console.error(`API /api/notices/${id} error:`, err);
      return jsonResponse({ error: err.message }, 500);
    }
  }

  /* --------------------------------------------------------------- feedback */
  if (normalizedPath === '/api/feedback') {
    try {
      if (method === 'GET') {
        try {
          const feedback = await cached('feedback_messages', 30000, () => fsListDocuments('feedback_messages', 200));
          return jsonResponse(sortByCreatedAtDesc(feedback));
        } catch (e) {
          return jsonResponse([]);
        }
      }
      if (method === 'POST' || method === 'PUT') {
        const item = await readBody(request);
        if (!item) return jsonResponse({ error: 'Body required' }, 400);
        const id = String(item.id || `FEED-${Date.now()}`);
        const existing = await fsGetDocument('feedback_messages', id);
        const record = {
          ...(existing || {}),
          ...item,
          id,
          createdAt: item.createdAt || new Date().toISOString(),
        };
        await fsSetDocument('feedback_messages', id, record);
        invalidateCache(['feedback']);
        return jsonResponse({ success: true, feedback: record });
      }
    } catch (err: any) {
      console.error('API /api/feedback error:', err);
      return jsonResponse({ error: err.message }, 500);
    }
  }

  if (segments[1] === 'feedback' && segments[2]) {
    const id = decodeURIComponent(segments[2]).replace(/\?.*$/, '');
    try {
      if (method === 'PATCH' || method === 'PUT') {
        const updates = await readBody(request);
        const merged = await fsPatchDocument('feedback_messages', id, updates);
        invalidateCache(['feedback']);
        return jsonResponse({ success: true, feedback: merged });
      }
      if (method === 'DELETE') {
        await fsDeleteDocument('feedback_messages', id);
        invalidateCache(['feedback']);
        return jsonResponse({ success: true, id });
      }
    } catch (err: any) {
      console.error(`API /api/feedback/${id} error:`, err);
      return jsonResponse({ error: err.message }, 500);
    }
  }

  /* --------------------------------------------------------------- contacts */
  if (normalizedPath === '/api/contacts') {
    try {
      if (method === 'GET') {
        try {
          const contacts = await cached('contacts', 30000, () => fsListDocuments('contacts', 200));
          return jsonResponse(sortByCreatedAtDesc(contacts));
        } catch (e) {
          return jsonResponse([]);
        }
      }
      if (method === 'POST' || method === 'PUT') {
        const item = await readBody(request);
        if (!item) return jsonResponse({ error: 'Body required' }, 400);
        const id = String(item.id || `CONT-${Date.now()}`);
        const existing = await fsGetDocument('contacts', id);
        const record = {
          ...(existing || {}),
          ...item,
          id,
          createdAt: item.createdAt || new Date().toISOString(),
        };
        await fsSetDocument('contacts', id, record);
        invalidateCache(['contacts']);
        return jsonResponse({ success: true, contact: record });
      }
    } catch (err: any) {
      console.error('API /api/contacts error:', err);
      return jsonResponse({ error: err.message }, 500);
    }
  }

  if (segments[1] === 'contacts' && segments[2]) {
    const id = decodeURIComponent(segments[2]).replace(/\?.*$/, '');
    try {
      if (method === 'PATCH' || method === 'PUT') {
        const updates = await readBody(request);
        const merged = await fsPatchDocument('contacts', id, updates);
        invalidateCache(['contacts']);
        return jsonResponse({ success: true, contact: merged });
      }
      if (method === 'DELETE') {
        await fsDeleteDocument('contacts', id);
        invalidateCache(['contacts']);
        return jsonResponse({ success: true, id });
      }
    } catch (err: any) {
      console.error(`API /api/contacts/${id} error:`, err);
      return jsonResponse({ error: err.message }, 500);
    }
  }

  /* ----------------------------------------------------------- unknown API */
  console.log(`[Worker] Unhandled API route: ${method} ${normalizedPath}`);
  return jsonResponse({ error: 'Not found', path: normalizedPath }, 404);
}

export default {
  async fetch(request: Request, env: Env, ctx: any): Promise<Response> {
    const url = new URL(request.url);
    const normalizedPath = url.pathname.replace(/\/$/, '');

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    // 1. All /api/* routes (health, SMS, email, memberships, payments, notices,
    //    community-stats, recent-news, feedback, contacts) backed by Firestore
    if (normalizedPath.startsWith('/api') && (
      normalizedPath === '/api' ||
      normalizedPath.startsWith('/api/') ||
      normalizedPath.startsWith('/api')
    )) {
      try {
        return await handleApi(normalizedPath.replace(/\/$/, ''), request, url, env);
      } catch (err: any) {
        console.error('[Worker] API handler error:', err);
        return jsonResponse({ error: err.message || 'Internal API error' }, 500);
      }
    }

    // 2. Serve static assets from ./dist if available
    if (env.ASSETS) {
      if (request.method !== 'GET' && request.method !== 'HEAD') {
        const getRequest = new Request(request.url, {
          method: 'GET',
          headers: request.headers,
        });
        return env.ASSETS.fetch(getRequest);
      }
      return env.ASSETS.fetch(request);
    }

    return new Response('Not found', { status: 404 });
  },
};
