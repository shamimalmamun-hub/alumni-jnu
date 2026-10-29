import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { Resend } from 'resend';

const app = express();
const PORT = 3000;

app.set('trust proxy', true);
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-APP-Key');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Payload too large & JSON parse error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err && (err.type === 'entity.too.large' || err.status === 413 || err.name === 'PayloadTooLargeError')) {
    console.warn(`[PayloadTooLargeError] Request payload exceeded limit: ${err.message}`);
    return res.status(413).json({
      error: 'PayloadTooLargeError',
      message: 'Request entity too large. Maximum supported payload size is 50MB.',
    });
  }
  if (err && err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ error: 'BadRequest', message: 'Invalid JSON payload' });
  }
  next(err);
});

/**
 * Send Email using Resend (resend.com)
 */
async function sendEmail({
  to,
  subject,
  html,
  text,
  from,
}: {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
}): Promise<{ success: boolean; data?: any; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('[Resend Email] RESEND_API_KEY is not configured in environment.');
    return { success: false, error: 'RESEND_API_KEY environment variable is not configured.' };
  }

  try {
    const resendClient = new Resend(apiKey);
    const sender = from || process.env.RESEND_FROM_EMAIL || 'Botany Alumni Association <onboarding@resend.dev>';

    console.log(`[Resend Email] Dispatching email to ${Array.isArray(to) ? to.join(', ') : to} with subject "${subject}"...`);

    const result = await resendClient.emails.send({
      from: sender,
      to: Array.isArray(to) ? to : [to],
      subject: subject,
      html: html,
      text: text,
    });

    if (result.error) {
      console.error('[Resend Email] Error from Resend API:', result.error);
      return { success: false, error: result.error.message || 'Failed to send email via Resend' };
    }

    console.log('[Resend Email] Email sent successfully! ID:', result.data?.id);
    return { success: true, data: result.data };
  } catch (err: any) {
    console.error('[Resend Email] Send Error:', err);
    return { success: false, error: err.message };
  }
}

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    resendConfigured: Boolean(process.env.RESEND_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// API: Send Email via Resend (resend.com)
app.post('/api/send-email', async (req, res) => {
  try {
    const { to, subject, html, text, from, applicantName, formNo, amount, tranId } = req.body;

    if (!to) {
      return res.status(400).json({ status: 'FAILED', message: 'Recipient email ("to") is required' });
    }

    let finalSubject = subject || 'উদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশন - নোটিফিকেশন';
    let finalHtml = html;

    if (!finalHtml) {
      const name = applicantName || 'সম্মানিত সদস্য';
      const txn = tranId || '';
      finalHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; background-color: #ffffff;">
          <div style="background-color: #006a4e; padding: 20px; text-align: center; border-radius: 6px 6px 0 0;">
            <h1 style="color: #ffffff; margin: 0; font-size: 20px;">উদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশন, জগন্নাথ বিশ্ববিদ্যালয়</h1>
            <p style="color: #fcd34d; margin: 5px 0 0 0; font-size: 14px;">জগন্নাথ বিশ্ববিদ্যালয়, ঢাকা</p>
          </div>
          <div style="padding: 20px; color: #1f2937; line-height: 1.6;">
            <p>প্রিয় <strong>${name}</strong>,</p>
            <p>উদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশনে আপনাকে স্বাগতম।</p>
            ${formNo ? `<p><strong>আবেদন নম্বর (Form No):</strong> ${formNo}</p>` : ''}
            ${amount ? `<p><strong>ফি:</strong> ৳${amount}</p>` : ''}
            ${txn ? `<p><strong>ট্রানজেকশন আইডি:</strong> ${txn}</p>` : ''}
            <p style="margin-top: 20px;">আপনার সার্বিক আপডেট ও অ্যালুমনাই তথ্য জানতে আমাদের ওয়েবসাইটে ভিজিট করুন।</p>
          </div>
          <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 6px 6px;">
            © উদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশন, জগন্নাথ বিশ্ববিদ্যালয়
          </div>
        </div>
      `;
    }

    const emailResult = await sendEmail({
      to,
      subject: finalSubject,
      html: finalHtml,
      text,
      from,
    });

    return res.json({
      status: emailResult.success ? 'SUCCESS' : 'FAILED',
      result: emailResult,
    });
  } catch (err: any) {
    console.error('API /api/send-email Error:', err);
    res.status(500).json({ status: 'FAILED', message: err.message });
  }
});

// API: Direct Diagnostic & Test Email via Resend
app.all('/api/test-email', async (req, res) => {
  try {
    const to = (req.query.to || req.query.email || req.body?.to || req.body?.email || 'hellothereshamim@gmail.com') as string;
    const testSubject = 'উদ্ভিদবিজ্ঞান অ্যালামনাই - Resend Email Test';
    const testHtml = `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #006a4e; border-radius: 8px; max-width: 500px;">
        <h2 style="color: #006a4e; margin-top: 0;">Resend.com Email Integration Active!</h2>
        <p>উদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশন জগন্নাথ বিশ্ববিদ্যালয় সিস্টেম থেকে Resend.com এর মাধ্যমে ইমেইল সার্ভিস সফলভাবে সংযুক্ত করা হয়েছে।</p>
        <p style="font-size: 12px; color: #666; margin-bottom: 0;">Timestamp: ${new Date().toISOString()}</p>
      </div>
    `;

    const result = await sendEmail({
      to,
      subject: testSubject,
      html: testHtml,
    });

    res.json({
      status: result.success ? 'SUCCESS' : 'FAILED',
      to,
      resendConfigured: Boolean(process.env.RESEND_API_KEY),
      result: result.data,
      error: result.error,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({ status: 'FAILED', error: err.message });
  }
});

/**
 * Robust Local JSON Store & API Handlers (ensures zero 502 errors and 100% reliable form submissions)
 */
const DB_FILE = path.join(process.cwd(), 'db_store.json');

function loadDb(): Record<string, Record<string, any>> {
  try {
    if (fs.existsSync(DB_FILE)) {
      return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    }
  } catch (e) {
    console.warn('Error reading db_store.json:', e);
  }
  return {
    notices: {},
    recent_news: {},
    memberships: {},
    payments: {},
    contacts: {},
    feedback_messages: {},
    settings: {},
    gallery_images: {},
    announcements: {},
  };
}

function saveDb(data: Record<string, Record<string, any>>) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.warn('Error writing db_store.json:', e);
  }
}

let localDb = loadDb();

// Seed baseline notices if empty
if (!localDb.notices || Object.keys(localDb.notices).length === 0) {
  import('./src/data/baselineNotices.ts').then((mod) => {
    const notices = mod.BASELINE_CLIENT_NOTICES || [];
    localDb.notices = {};
    for (const n of notices) {
      localDb.notices[n.id] = n;
    }
    saveDb(localDb);
  }).catch(() => {});
}

// Seed news if empty
if (!localDb.recent_news || Object.keys(localDb.recent_news).length === 0) {
  import('./src/data/portalData.ts').then((mod) => {
    const posts = mod.NEWS_POSTS || [];
    localDb.recent_news = {};
    for (const p of posts) {
      localDb.recent_news[p.id] = p;
    }
    saveDb(localDb);
  }).catch(() => {});
}

// Seed gallery images if empty
if (!localDb.gallery_images || Object.keys(localDb.gallery_images).length === 0) {
  import('./src/data/portalData.ts').then((mod) => {
    const images = mod.GALLERY_IMAGES || [];
    localDb.gallery_images = {};
    for (const img of images) {
      localDb.gallery_images[img.id] = img;
    }
    saveDb(localDb);
  }).catch(() => {});
}

// Seed announcement in settings if empty
if (!localDb.settings) localDb.settings = {};
if (!localDb.settings.announcement) {
  localDb.settings.announcement = {
    id: 'announcement',
    badgeBn: 'ঘোষণা',
    badgeEn: 'Bulletin',
    textBn: '২০২৬ সালের নভেম্বরে নতুন কার্যনির্বাহী কমিটি নির্বাচনের লক্ষ্যে সাধারণ সদস্য এবং আজীবন সদস্য সংগ্রহ চলমান রয়েছে। আজই ফরম পূরণ করে আপনার সদস্যপদ নিশ্চিত করুন।',
    textEn: 'Collection of general members and life members is ongoing for the election of the new executive committee in November 2026. Register today to secure your membership.',
    linkUrl: '',
    isActive: true,
    updatedAt: new Date().toISOString(),
  };
  saveDb(localDb);
}

function ensureMemberAddress(m: any) {
  if (!m || typeof m !== 'object') return;
  let village = m.permVillage || m.village || '';
  let post = m.permPost || m.post || '';
  let upazila = m.permUpazila || m.upazila || '';
  let district = m.permDistrict || m.district || '';

  if (!village || !post || !upazila || !district) {
    const rawPerm = m.permanentAddress || '';
    const rawPresent = m.presentAddress || m.currentAddress || '';
    const source = rawPerm || rawPresent || district || '';

    const vM = source.match(/(?:Village|গ্রাম|Vill)\s*[:：\-]?\s*([^,;\n]+)/i);
    const pM = source.match(/(?:Post|ডাকঘর|ডাক|PO)\s*[:：\-]?\s*([^,;\n]+)/i);
    const uM = source.match(/(?:Upazila|উপজেলা|থানা|PS)\s*[:：\-]?\s*([^,;\n]+)/i);
    const dM = source.match(/(?:District|(?<!উপ)জেলা|Dist)\s*[:：\-]?\s*([^,;\n]+)/i);

    if (!village && vM) village = vM[1].trim();
    if (!post && pM) post = pM[1].trim();
    if (!upazila && uM) upazila = uM[1].trim();
    if (!district && dM) district = dM[1].trim();

    const cleaned = source
      .replace(/(?:Village|গ্রাম|Vill)\s*[:：\-]?\s*([^,;\n]+)/gi, '')
      .replace(/(?:Post|ডাকঘর|ডাক|PO)\s*[:：\-]?\s*([^,;\n]+)/gi, '')
      .replace(/(?:Upazila|উপজেলা|থানা|PS)\s*[:：\-]?\s*([^,;\n]+)/gi, '')
      .replace(/(?:District|(?<!উপ)জেলা|Dist)\s*[:：\-]?\s*([^,;\n]+)/gi, '')
      .replace(/^[,\s;]+|[,\s;]+$/g, '')
      .trim();

    if ((!village || !post || !upazila || !district) && (cleaned.includes(',') || source.includes(','))) {
      const parts = (cleaned || source).split(',').map((s: string) => s.trim()).filter(Boolean);
      if (parts.length >= 4) {
        if (!village) village = parts[0];
        if (!post) post = parts[1];
        if (!upazila) upazila = parts[2];
        if (!district) district = parts.slice(3).join(', ');
      } else if (parts.length === 3) {
        if (!village) village = parts[0];
        if (!post) post = parts[1];
        if (!upazila) upazila = parts[1];
        if (!district) district = parts[2];
      } else if (parts.length === 2) {
        if (!village) village = parts[0];
        if (!post) post = parts[0];
        if (!upazila) upazila = parts[0];
        if (!district) district = parts[1];
      } else if (parts.length === 1) {
        if (!district) district = parts[0];
        if (!village) village = parts[0];
        if (!upazila) upazila = parts[0];
        if (!post) post = parts[0];
      }
    } else if (!village && !post && !upazila && !district && source.trim()) {
      village = source.trim();
      post = source.trim();
      upazila = source.trim();
      district = source.trim();
    }

    if (district && !village) village = district;
    if (district && !upazila) upazila = district;
    if (district && !post) post = district;

    if (!district && m.district) district = m.district;
    if (!district) district = 'ঢাকা';
    if (!village) village = district;
    if (!post) post = district;
    if (!upazila) upazila = district;

    const permanentAddress = `Village: ${village}, Post: ${post}, Upazila: ${upazila}, District: ${district}`;

    m.village = village;
    m.post = post;
    m.upazila = upazila;
    m.district = district;
    m.permVillage = village;
    m.permPost = post;
    m.permUpazila = upazila;
    m.permDistrict = district;
    m.permanentAddress = permanentAddress;
  }
}

function ensureMemberPayment(m: any) {
  if (!m || typeof m !== 'object') return;
  const payments = localDb.payments || {};
  const mId = String(m.id || '').trim();
  const formNo = String(m.formNo || '').trim();
  const memId = String(m.membershipId || '').trim();
  const phone = String(m.phone || m.mobile || '').replace(/\D/g, '');

  if (!m.paymentMethod || m.paymentMethod === 'Manual' || !m.transactionId || !m.senderNumber) {
    for (const pKey of Object.keys(payments)) {
      const p = payments[pKey];
      if (!p) continue;
      const pMemId = String(p.membershipId || '').trim();
      const pPhone = String(p.phone || p.senderNumber || '').replace(/\D/g, '');
      const matchMem = Boolean((mId && pMemId === mId) || (formNo && pMemId === formNo) || (memId && pMemId === memId));
      const matchPhone = Boolean(phone.length >= 7 && pPhone.length >= 7 && (phone.includes(pPhone) || pPhone.includes(phone)));
      if (matchMem || matchPhone) {
        if (!m.paymentMethod || m.paymentMethod === 'Manual') {
          m.paymentMethod = p.paymentMethod || 'bKash';
        }
        if (!m.senderNumber) {
          m.senderNumber = p.senderNumber || p.phone || m.mobile || m.phone || '';
        }
        if (!m.transactionId) {
          m.transactionId = p.transactionId || '';
        }
        if (p.amount && !m.paidAmount) {
          m.paidAmount = p.amount;
        }
        break;
      }
    }
  }
}

// Backfill permanent address and payment details for existing memberships on startup
if (localDb.memberships) {
  let dbChanged = false;
  for (const key of Object.keys(localDb.memberships)) {
    const mem = localDb.memberships[key];
    ensureMemberAddress(mem);
    ensureMemberPayment(mem);
    if (mem.data && typeof mem.data === 'object') {
      ensureMemberAddress(mem.data);
      ensureMemberPayment(mem.data);
    }
    dbChanged = true;
  }
  if (dbChanged) {
    saveDb(localDb);
  }
}

app.post('/api/admin/login', (req, res) => {
  const { pin } = req.body || {};
  const ADMIN_PIN = 'baajnu2024@botany';
  if (pin && typeof pin === 'string' && pin.trim() === ADMIN_PIN) {
    return res.json({ token: 'local-admin-token-' + Date.now() });
  }
  res.status(401).json({ error: 'Incorrect password' });
});

app.get('/api/stats/community', (req, res) => {
  const memberships = Object.values(localDb.memberships || {});
  const payments = Object.values(localDb.payments || {});
  const approved = memberships.filter((m: any) => m.status === 'approved' && m.paymentMethod !== 'Unpaid');
  const life = approved.filter((m: any) => m.membershipType === 'life' || m.feeAmount === '2500' || m.feeAmount === '২৫০০');
  const donors = payments.filter((p: any) => {
    const amt = Number(p.amount) || 0;
    const pType = String(p.purposeType || '').toLowerCase();
    const purpose = String(p.purpose || '').toLowerCase();
    const isMem = pType === 'general' || pType === 'life' || purpose.includes('সদস্যপদ') || purpose.includes('নিবন্ধন');
    return amt > 0 && !isMem;
  });
  res.json({
    totalMembers: approved.length,
    lifeMembers: life.length,
    donorMembers: donors.length,
  });
});

app.post('/api/member-login', (req, res) => {
  const { id, mobile } = req.body || {};
  const memberships = localDb.memberships || {};
  const cleanId = String(id || '').trim().toLowerCase();
  const cleanMobile = String(mobile || '').trim().replace(/\D/g, '');

  for (const mId of Object.keys(memberships)) {
    const m = memberships[mId];
    const mFormNo = String(m.formNo || m.membershipId || m.id || '').trim().toLowerCase();
    const mMobile = String(m.mobile || m.phone || '').trim().replace(/\D/g, '');

    const matchId = mFormNo.includes(cleanId) || mId.toLowerCase() === cleanId;
    const matchMobile = mMobile.includes(cleanMobile) || cleanMobile.includes(mMobile);

    if (matchId && matchMobile) {
      if (m.status === 'approved') {
        return res.json({
          status: 'approved',
          name: m.applicantNameBn || m.fullName || 'সম্মানিত সদস্য',
          member: {
            id: m.id,
            formNo: m.formNo || m.membershipId || m.id,
            membershipId: m.membershipId || m.formNo || m.id,
            applicantNameBn: m.applicantNameBn || m.fullName || 'সম্মানিত সদস্য',
            applicantNameEn: m.applicantNameEn || '',
            mobile: m.mobile || m.phone || '',
            phone: m.phone || m.mobile || '',
            session: m.session || m.bscSession || '',
            batch: m.batch || m.bscBatch || '',
            userPhotoUrl: m.userPhotoUrl || m.photoUrl || '',
            bloodGroup: m.bloodGroup || '',
            status: m.status,
            membershipType: m.membershipType || (m.feeAmount === '2500' || m.feeAmount === '২৫০০' ? 'life' : 'general'),
            feeAmount: m.feeAmount || '',
            paymentMethod: m.paymentMethod || '',
            paymentStatus: m.paymentStatus || '',
            transactionId: m.transactionId || m.paymentTransactionId || '',
            presentAddress: m.presentAddress || m.currentAddress || '',
            currentAddress: m.currentAddress || m.presentAddress || '',
          },
        });
      } else {
        return res.json({
          status: m.status || 'pending',
          name: m.applicantNameBn || m.fullName || 'সম্মানিত সদস্য',
          member: null,
        });
      }
    }
  }
  res.json({ member: null, status: null, name: '' });
});

app.all('/api/db/:collection/:id?', (req, res) => {
  const collection = req.params.collection;
  const id = req.params.id;
  const method = req.method.toUpperCase();
  const query = req.query;

  if (!localDb[collection]) {
    localDb[collection] = {};
  }

  const colStore = localDb[collection];

  const normalizeDoc = (doc: any, docId: string) => {
    if (!doc) return null;
    const subData = doc.data && typeof doc.data === 'object' && !Array.isArray(doc.data) ? doc.data : {};
    const norm = { ...subData, ...doc, id: docId };
    if (collection === 'memberships') {
      ensureMemberAddress(norm);
      ensureMemberPayment(norm);
    }
    return norm;
  };

  if (method === 'GET') {
    if (id) {
      const doc = colStore[id];
      if (!doc) {
        return res.status(404).json({ error: 'Not found' });
      }
      return res.json({ doc: normalizeDoc(doc, id) });
    } else {
      let docs = Object.keys(colStore).map((docId) => normalizeDoc(colStore[docId], docId)!);

      if (collection === 'gallery_images') {
        const parseBotanyIndex = (id: string) => {
          const match = String(id || '').match(/botany-gallery-(\d+)/);
          return match ? parseInt(match[1], 10) : null;
        };
        docs.sort((a: any, b: any) => {
          if (typeof a.order === 'number' && typeof b.order === 'number') {
            return a.order - b.order;
          }
          if (typeof a.order === 'number') return -1;
          if (typeof b.order === 'number') return 1;

          const bIndexA = parseBotanyIndex(a.id);
          const bIndexB = parseBotanyIndex(b.id);
          if (bIndexA !== null && bIndexB !== null) return bIndexA - bIndexB;
          if (bIndexA !== null && bIndexB === null) return -1;
          if (bIndexA === null && bIndexB !== null) return 1;

          const tA = a.createdAt ? new Date(a.createdAt).getTime() : (String(a.id).startsWith('gallery_') ? Number(String(a.id).replace('gallery_', '')) || 0 : 0);
          const tB = b.createdAt ? new Date(b.createdAt).getTime() : (String(b.id).startsWith('gallery_') ? Number(String(b.id).replace('gallery_', '')) || 0 : 0);
          return tA - tB;
        });
      }

      if (query.where) {
        const wheres = Array.isArray(query.where) ? query.where : [query.where];
        for (const w of wheres) {
          const idx = String(w).indexOf(':');
          if (idx > 0) {
            const field = String(w).slice(0, idx);
            const val = String(w).slice(idx + 1);
            docs = docs.filter((d) => String(d[field] ?? (d.data && d.data[field])) === val);
          }
        }
      }

      if (query.limit) {
        const lim = parseInt(String(query.limit), 10);
        if (!isNaN(lim)) {
          docs = docs.slice(0, lim);
        }
      }

      return res.json({ docs });
    }
  }

  if (method === 'POST') {
    const newId = 'id_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
    const body = req.body || {};
    colStore[newId] = { ...body, id: newId, createdAt: body.createdAt || new Date().toISOString() };
    saveDb(localDb);
    return res.status(201).json({ id: newId });
  }

  if (method === 'PUT') {
    if (!id) return res.status(400).json({ error: 'Missing id' });
    const body = req.body || {};
    const merge = query.merge === '1';
    let targetId = id;
    if (!colStore[id] && collection === 'memberships') {
      const foundKey = Object.keys(colStore).find((k) => {
        const item = colStore[k];
        return item.id === id || item.formNo === id || item.membershipId === id || item.mobile === id || item.phone === id;
      });
      if (foundKey) targetId = foundKey;
    }
    const existing = colStore[targetId] || {};
    colStore[targetId] = merge ? { ...existing, ...body, id: targetId } : { ...body, id: targetId, createdAt: body.createdAt || existing.createdAt || new Date().toISOString() };
    saveDb(localDb);
    return res.json({ ok: true, created: !existing.id });
  }

  if (method === 'PATCH') {
    if (!id) return res.status(400).json({ error: 'Missing id' });
    let existing = colStore[id];
    let actualId = id;
    if (!existing && collection === 'memberships') {
      const foundKey = Object.keys(colStore).find((k) => {
        const item = colStore[k];
        return item.id === id || item.formNo === id || item.membershipId === id || item.mobile === id || item.phone === id;
      });
      if (foundKey) {
        existing = colStore[foundKey];
        actualId = foundKey;
      }
    }
    if (!existing) {
      return res.status(404).json({ error: 'Not found' });
    }
    const body = req.body || {};
    const updatedSubData = existing.data && typeof existing.data === 'object' && !Array.isArray(existing.data) ? { ...existing.data, ...body } : undefined;
    colStore[actualId] = {
      ...existing,
      ...(updatedSubData ? { data: updatedSubData } : {}),
      ...body,
      id: actualId,
      updatedAt: new Date().toISOString()
    };
    saveDb(localDb);
    return res.json({ ok: true });
  }

  if (method === 'DELETE') {
    if (!id) return res.status(400).json({ error: 'Missing id' });
    delete colStore[id];
    saveDb(localDb);
    return res.json({ ok: true });
  }

  res.status(405).json({ error: 'Method not allowed' });
});

// Vite Middleware for Full-Stack React development & Production Static serving
async function setupViteMiddleware() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Botany Alumni Express Server running on port ${PORT}`);
  });

  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`[Error] Port ${PORT} is already in use.`);
      process.exit(1);
    } else {
      throw err;
    }
  });
}

setupViteMiddleware();
