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

// SMS Gateway Credentials & Configuration
const rawSmsKey = process.env.SMS_API_KEY;
const SMS_API_KEY = (rawSmsKey && rawSmsKey !== 'BMszEcuXSaGtE4xr68JP8G6m3uP04IZidBWpgXIB') 
  ? rawSmsKey 
  : 'juOIwULseyuzv3Z9AUKk';
const SMS_PROVIDER = (process.env.SMS_PROVIDER || 'bulksmsbd').toLowerCase();
const SMS_SENDER_ID = process.env.SMS_SENDER_ID || '8809648906169';
const SMS_API_URL = process.env.SMS_API_URL || 'http://bulksmsbd.net/api/smsapi';

/**
 * Format BD phone numbers to standard 11 digits (01XXXXXXXXX) or 8801XXXXXXXXX
 */
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

/**
 * Send SMS using Bangladeshi SMS Gateways
 */
async function sendSMS({
  mobile,
  message,
}: {
  mobile: string;
  message: string;
}): Promise<{ success: boolean; provider: string; data?: any; error?: string }> {
  const apiKey = SMS_API_KEY;
  if (!apiKey) {
    console.warn('SMS_API_KEY is not configured.');
    return { success: false, provider: 'none', error: 'SMS_API_KEY not configured' };
  }

  const { local, withCountry } = normalizeBDPhone(mobile);
  console.log(`[SMS] Dispatching to ${local} (${withCountry}) via ${SMS_PROVIDER} (Sender ID: ${SMS_SENDER_ID || 'None'})...`);

  try {
    // 1. Alpha SMS / SMS.net.bd Provider (https://api.sms.net.bd/sendsms)
    if (SMS_PROVIDER === 'alphasms' || SMS_PROVIDER === 'sms.net.bd' || SMS_PROVIDER === 'alpha') {
      const url = SMS_API_URL || 'https://api.sms.net.bd/sendsms';
      
      const formData = new URLSearchParams();
      formData.append('api_key', apiKey);
      formData.append('msg', message);
      formData.append('to', withCountry);
      if (SMS_SENDER_ID) {
        formData.append('sender_id', SMS_SENDER_ID);
      }

      console.log(`[AlphaSMS] Sending POST to ${url} with to=${withCountry}, sender_id=${SMS_SENDER_ID}...`);

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
      });

      const rawText = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(rawText);
      } catch (err) {
        data = { raw: rawText };
      }
      console.log('[AlphaSMS] Response:', JSON.stringify(data));

      const isSuccess = res.ok && (!data.error || data.error === 0 || data.status === 'success' || data.error_code === 200);
      return { success: isSuccess, provider: 'alphasms', data };
    }

    // 1. BulksmsBD Provider (http://bulksmsbd.net/api/smsapi)
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

      console.log(`[BulksmsBD] Sending SMS (${smsType}) to ${targetNumber} (withCountry: ${withCountry}) with senderid=${SMS_SENDER_ID}...`);
      
      // Try POST first for reliable Unicode delivery, fallback to GET if needed
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

      // If POST didn't return 202, try GET method with encoded parameters
      if (!jsonRes || (jsonRes.response_code !== 202 && jsonRes.response_code !== 200)) {
        console.log('[BulksmsBD] POST returned non-202, trying GET fallback...', textRes);
        const getUrl = `${url}?${postParams.toString()}`;
        const getRes = await fetch(getUrl, { method: 'GET' });
        const getText = await getRes.text();
        try {
          jsonRes = JSON.parse(getText);
        } catch (e) {
          jsonRes = { raw: getText };
        }
      }

      console.log('[BulksmsBD] Final Response:', jsonRes);
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

    // 3. Greenweb Provider
    if (SMS_PROVIDER === 'greenweb') {
      const url = SMS_API_URL || 'http://api.greenweb.com.bd/api.php';
      const params = new URLSearchParams({
        token: apiKey,
        to: local,
        message: message,
      });
      const res = await fetch(`${url}?${params.toString()}`, { method: 'GET' });
      const textRes = await res.text();
      console.log('[Greenweb] Response:', textRes);
      return { success: res.ok, provider: 'greenweb', data: textRes };
    }

    // 4. Custom or Generic URL endpoint
    if (SMS_API_URL) {
      const res = await fetch(SMS_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: apiKey,
          mobile: local,
          phone: withCountry,
          senderId: SMS_SENDER_ID,
          message,
        }),
      });
      const data = await res.text();
      return { success: res.ok, provider: 'custom', data };
    }

    return { success: false, provider: SMS_PROVIDER, error: 'Unknown SMS provider' };
  } catch (err: any) {
    console.error('[SMS] Send Error:', err);
    return { success: false, provider: SMS_PROVIDER, error: err.message };
  }
}

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
    smsConfigured: Boolean(SMS_API_KEY),
    smsProvider: SMS_PROVIDER,
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
            <h1 style="color: #ffffff; margin: 0; font-size: 20px;">উদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশন</h1>
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

// API: Send SMS directly
app.post('/api/send-sms', async (req, res) => {
  try {
    const {
      mobile,
      name,
      applicantName,
      tranId,
      amount = '৫০০',
      formNo,
      cardUrl,
      message,
      customMessage,
      appUrl,
    } = req.body;

    if (!mobile) {
      return res.status(400).json({ status: 'FAILED', message: 'Mobile number is required' });
    }

    const memberName = name || applicantName || 'সম্মানিত সদস্য';
    const txn = tranId || `TXN_${Date.now().toString().slice(-6)}`;

    // Resolve app base URL accurately
    let baseUrl = appUrl || '';
    if (!baseUrl) {
      const originHeader = req.get('origin') || (req.get('referer') ? new URL(req.get('referer')!).origin : '');
      if (originHeader && !originHeader.includes('localhost')) {
        baseUrl = originHeader;
      } else {
        const forwardedHost = req.get('x-forwarded-host');
        const forwardedProto = req.get('x-forwarded-proto') || 'https';
        const host = forwardedHost || req.get('host');
        if (host && !host.includes('localhost')) {
          baseUrl = `${forwardedProto.includes('https') ? 'https' : 'http'}://${host}`;
        } else if (process.env.APP_URL && process.env.APP_URL !== 'MY_APP_URL') {
          baseUrl = process.env.APP_URL.replace(/\/$/, '');
        } else {
          baseUrl = 'https://ais-pre-trlneysfvgomaastzre5pu-583514143305.asia-east1.run.app';
        }
      }
    }

    let downloadUrl = cardUrl;
    if (!downloadUrl) {
      if (formNo) {
        downloadUrl = `${baseUrl}/card/${encodeURIComponent(formNo)}`;
      } else if (tranId) {
        downloadUrl = `${baseUrl}/?trx=${encodeURIComponent(tranId)}`;
      } else {
        downloadUrl = `${baseUrl}/members-list`;
      }
    }

    // Send clean message without card download link
    let finalMessage = (customMessage || message || '').trim();
    if (!finalMessage) {
      finalMessage = `অভিনন্দন ${memberName}! উদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশন সদস্য নিবন্ধনে আপনার আবেদন ও ৳${amount} ফি সফলভাবে গৃহীত হয়েছে (TrxID: ${txn})।`;
    }

    console.log(`[/api/send-sms] Sending SMS to ${mobile} with message: "${finalMessage}"`);

    const smsResult = await sendSMS({
      mobile,
      message: finalMessage,
    });

    return res.json({
      status: smsResult.success ? 'SUCCESS' : 'FAILED',
      result: smsResult,
      cardUrl: downloadUrl,
      sentMessage: finalMessage,
    });
  } catch (err: any) {
    console.error('API /api/send-sms Error:', err);
    res.status(500).json({ status: 'FAILED', message: err.message });
  }
});

// API: Direct Diagnostic & Test SMS (supports GET and POST)
app.all('/api/test-sms', async (req, res) => {
  try {
    const phone = (req.query.phone || req.query.mobile || req.body?.phone || req.body?.mobile || '01770618575') as string;
    const formNo = (req.query.formNo || req.body?.formNo || 'SOC-ALUMNI-2026-TEST') as string;
    
    const originHeader = req.get('origin') || (req.get('referer') ? new URL(req.get('referer')!).origin : '');
    const forwardedHost = req.get('x-forwarded-host');
    const forwardedProto = req.get('x-forwarded-proto') || 'https';
    const host = forwardedHost || req.get('host') || 'localhost:3000';
    const reqHostUrl = `${forwardedProto.includes('https') ? 'https' : 'http'}://${host}`;
    const baseUrl = originHeader ? originHeader : (process.env.APP_URL && process.env.APP_URL !== 'MY_APP_URL' ? process.env.APP_URL.replace(/\/$/, '') : reqHostUrl);
    const downloadUrl = `${baseUrl}/?card=${encodeURIComponent(formNo)}`;

    const msg = (req.query.msg || req.query.message || req.body?.message || `অভিনন্দন সম্মানিত সদস্য! উদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশনে আপনার সদস্য নিবন্ধন ও ফি সফলভাবে গৃহীত হয়েছে।`) as string;

    const result = await sendSMS({
      mobile: phone,
      message: msg,
    });

    res.json({
      status: result.success ? 'SUCCESS' : 'FAILED',
      phone,
      provider: result.provider,
      senderId: SMS_SENDER_ID,
      cardUrl: downloadUrl,
      sentMessage: msg,
      gatewayResponse: result.data,
      error: result.error,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({ status: 'FAILED', error: err.message });
  }
});

// Notices Persistent File Storage Helper
const NOTICES_FILE = path.join(process.cwd(), 'data', 'notices.json');

function isDemoNoticeId(id: string): boolean {
  if (!id) return false;
  return /^not-(0[1-9]|[12][0-9]|3[0-5])$/.test(id) || id.startsWith('not_demo_');
}

function getPersistedNotices(): any[] {
  try {
    if (fs.existsSync(NOTICES_FILE)) {
      const data = fs.readFileSync(NOTICES_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.filter((n: any) => n && n.id && !isDemoNoticeId(n.id));
      }
    }
    const backupFile = path.join(process.cwd(), 'data', 'notices_backup.json');
    if (fs.existsSync(backupFile)) {
      const data = fs.readFileSync(backupFile, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.filter((n: any) => n && n.id && !isDemoNoticeId(n.id));
      }
    }
  } catch (err) {
    console.warn('Error reading persisted notices:', err);
  }
  return [];
}

function savePersistedNotices(notices: any[]): void {
  try {
    const dir = path.dirname(NOTICES_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const clean = notices.filter((n: any) => n && n.id && !isDemoNoticeId(n.id));
    fs.writeFileSync(NOTICES_FILE, JSON.stringify(clean, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Error saving persisted notices:', err);
  }
}

// API: Get notices
app.get('/api/notices', (req, res) => {
  const notices = getPersistedNotices();
  res.json(notices);
});

// API: Batch sync notices (e.g. from client browser localStorage)
app.post('/api/notices/sync-batch', (req, res) => {
  try {
    const { notices } = req.body;
    if (!Array.isArray(notices)) {
      return res.status(400).json({ error: 'Array of notices is required' });
    }
    const validNotices = notices.filter((n: any) => n && n.id && !isDemoNoticeId(n.id));
    const current = getPersistedNotices();
    const map = new Map<string, any>(current.map((n: any) => [n.id, n]));
    for (const n of validNotices) {
      map.set(n.id, n);
    }
    const merged = Array.from(map.values());
    merged.sort((a, b) => {
      const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return tB - tA;
    });
    savePersistedNotices(merged);
    res.json({ success: true, count: merged.length, notices: merged });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// API: Publish or Update notice
app.post('/api/notices', (req, res) => {
  try {
    const notice = req.body;
    if (!notice || !notice.id) {
      return res.status(400).json({ error: 'Notice id is required' });
    }
    if (isDemoNoticeId(notice.id)) {
      return res.json({ success: true, ignored: true });
    }
    const notices = getPersistedNotices();
    const updated = [notice, ...notices.filter((n: any) => n.id !== notice.id)];
    savePersistedNotices(updated);
    res.json({ success: true, notice });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// API: Delete notice
app.delete('/api/notices/:id', (req, res) => {
  try {
    const { id } = req.params;
    const notices = getPersistedNotices();
    const filtered = notices.filter((n: any) => n.id !== id);
    savePersistedNotices(filtered);
    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Community Stats Persistent File Storage (Strictly Manual - Auto Sync Disabled)
const COMMUNITY_STATS_FILE = path.join(process.cwd(), 'data', 'community_stats.json');

const DEFAULT_COMMUNITY_STATS = {
  mode: 'manual',
  totalMembers: 1240,
  lifeMembers: 793,
  committeeMembers: 35,
  donorMembers: 29,
  suffix: '+',
  titleBn: 'আমাদের অ্যালামনাই পরিবার',
  titleEn: 'Our Growing Community',
  subBn: 'জগন্নাথ বিশ্ববিদ্যালয় উদ্ভিদবিজ্ঞান বিভাগের সকল ব্যাচের প্রাক্তন ও বর্তমান সদস্যদের সম্মিলিত শক্তি',
  subEn: 'Uniting generations of Botany Alumni from Jagannath University, Dhaka',
};

function getPersistedCommunityStats(): any {
  try {
    if (fs.existsSync(COMMUNITY_STATS_FILE)) {
      const data = fs.readFileSync(COMMUNITY_STATS_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      return { ...DEFAULT_COMMUNITY_STATS, ...parsed, mode: 'manual' };
    }
  } catch (err) {
    console.warn('Error reading persisted community stats:', err);
  }
  return DEFAULT_COMMUNITY_STATS;
}

function savePersistedCommunityStats(stats: any): void {
  try {
    const dir = path.dirname(COMMUNITY_STATS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(
      COMMUNITY_STATS_FILE,
      JSON.stringify({ ...DEFAULT_COMMUNITY_STATS, ...stats, mode: 'manual' }, null, 2),
      'utf-8'
    );
  } catch (err) {
    console.warn('Error saving persisted community stats:', err);
  }
}

// API: Get Community Stats (Always Manual)
app.get('/api/community-stats', (req, res) => {
  res.json(getPersistedCommunityStats());
});

// API: Save Community Stats (Strictly Manual)
app.post('/api/community-stats', (req, res) => {
  try {
    const stats = req.body || {};
    const updated = {
      ...stats,
      mode: 'manual',
      updatedAt: new Date().toISOString(),
    };
    savePersistedCommunityStats(updated);
    res.json({ success: true, stats: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Memberships Persistent File Storage
const MEMBERSHIPS_FILE = path.join(process.cwd(), 'data', 'memberships.json');

function getPersistedMemberships(): any[] {
  try {
    if (fs.existsSync(MEMBERSHIPS_FILE)) {
      const data = fs.readFileSync(MEMBERSHIPS_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed.filter((m: any) => m && (m.id || m.membershipId || m.formNo));
      }
    }
    const backupFile = path.join(process.cwd(), 'data', 'memberships_backup.json');
    if (fs.existsSync(backupFile)) {
      const data = fs.readFileSync(backupFile, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed.filter((m: any) => m && (m.id || m.membershipId || m.formNo));
      }
    }
  } catch (err) {
    console.warn('Error reading persisted memberships:', err);
  }
  return [];
}

function savePersistedMemberships(members: any[]): void {
  try {
    const dir = path.dirname(MEMBERSHIPS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const clean = (members || []).filter((m: any) => m && (m.id || m.membershipId || m.formNo));
    fs.writeFileSync(MEMBERSHIPS_FILE, JSON.stringify(clean, null, 2), 'utf-8');
    const backupFile = path.join(process.cwd(), 'data', 'memberships_backup.json');
    fs.writeFileSync(backupFile, JSON.stringify(clean, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Error saving persisted memberships:', err);
  }
}

// API: Get all memberships
app.get('/api/memberships', (req, res) => {
  const members = getPersistedMemberships();
  members.sort((a, b) => {
    const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return tB - tA;
  });
  res.json(members);
});

// API: Save or create membership application
app.post('/api/memberships', (req, res) => {
  try {
    const member = req.body;
    if (!member) {
      return res.status(400).json({ error: 'Membership body required' });
    }
    const members = getPersistedMemberships();
    
    // Find highest BOT-XXXX sequence
    let maxSequence = 0;
    for (const m of members) {
      const fNo = m.formNo || m.membershipId || m.id || '';
      const digits = fNo.replace(/\D/g, '');
      if (digits) {
        const val = parseInt(digits, 10);
        if (!isNaN(val) && val < 100000 && val > maxSequence) {
          maxSequence = val;
        }
      }
    }
    const nextFormNo = `BOT-${String(Math.max(members.length + 1, maxSequence + 1)).padStart(4, '0')}`;
    const now = new Date().toISOString();

    // Check if an existing record matches this exact ID (only for explicit updates)
    let requestedId = member.id || member.membershipId;
    let existingIdx = -1;
    if (requestedId && requestedId.length > 5 && !requestedId.startsWith('MEM-') && !requestedId.startsWith('BOT-')) {
      existingIdx = members.findIndex(
        (m: any) => m.id === requestedId || m.membershipId === requestedId
      );
    }

    if (existingIdx >= 0) {
      const existing = members[existingIdx];
      // True update
      const updatedRecord = {
        ...existing,
        ...member,
        id: existing.id || requestedId,
        membershipId: existing.membershipId || requestedId,
        formNo: existing.formNo || member.formNo || nextFormNo,
        updatedAt: now,
      };
      members[existingIdx] = updatedRecord;
      savePersistedMemberships(members);
      console.log(`[API] Updated existing membership: ${updatedRecord.id}`);
      return res.json({ success: true, member: updatedRecord });
    }

    // New membership registration
    const uniqueId = `MEM-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const finalFormNo = member.formNo && member.formNo !== 'BOT-0001' ? member.formNo : nextFormNo;

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

    members.unshift(record);
    savePersistedMemberships(members);
    console.log(`[API] Created new membership: ${uniqueId} (${record.applicantNameBn || record.applicantNameEn || record.fullName || 'Member'}) - Form: ${finalFormNo}`);
    res.json({ success: true, member: record });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// API: Update membership status or details
app.patch('/api/memberships/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body || {};
    const members = getPersistedMemberships();
    const idx = members.findIndex((m: any) => m.id === id || m.membershipId === id || m.formNo === id);
    if (idx >= 0) {
      members[idx] = {
        ...members[idx],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      savePersistedMemberships(members);
      return res.json({ success: true, member: members[idx] });
    }
    // If not found, create it with updates
    const newRecord = {
      id,
      membershipId: id,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    members.unshift(newRecord);
    savePersistedMemberships(members);
    res.json({ success: true, member: newRecord });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// API: Delete membership
app.delete('/api/memberships/:id', (req, res) => {
  try {
    const { id } = req.params;
    const members = getPersistedMemberships();
    const filtered = members.filter((m: any) => m.id !== id && m.membershipId !== id);
    savePersistedMemberships(filtered);
    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// API: Batch sync memberships (from client localStorage or Firestore)
app.post('/api/memberships/sync-batch', (req, res) => {
  try {
    const { memberships } = req.body;
    if (!Array.isArray(memberships)) {
      return res.status(400).json({ error: 'Array of memberships is required' });
    }
    const current = getPersistedMemberships();
    const map = new Map<string, any>(current.map((m: any) => [m.id || m.membershipId, m]));

    for (const m of memberships) {
      if (m && (m.id || m.membershipId || m.formNo)) {
        const key = m.id || m.membershipId || m.formNo;
        const existing = map.get(key);
        map.set(key, existing ? { ...existing, ...m } : m);
      }
    }

    const merged = Array.from(map.values());
    merged.sort((a, b) => {
      const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return tB - tA;
    });

    savePersistedMemberships(merged);
    res.json({ success: true, count: merged.length, memberships: merged });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Payments Persistent File Storage
const PAYMENTS_FILE = path.join(process.cwd(), 'data', 'payments.json');

function getPersistedPayments(): any[] {
  try {
    if (fs.existsSync(PAYMENTS_FILE)) {
      const data = fs.readFileSync(PAYMENTS_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.warn('Error reading payments:', err);
  }
  return [];
}

function savePersistedPayments(payments: any[]): void {
  try {
    const dir = path.dirname(PAYMENTS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(PAYMENTS_FILE, JSON.stringify(payments || [], null, 2), 'utf-8');
  } catch (err) {
    console.warn('Error saving payments:', err);
  }
}

app.get('/api/payments', (req, res) => {
  res.json(getPersistedPayments());
});

app.post('/api/payments', (req, res) => {
  try {
    const payment = req.body;
    if (!payment) return res.status(400).json({ error: 'Payment body required' });
    const payments = getPersistedPayments();
    const id = payment.id || payment.paymentDocId || `PAY-${Date.now()}`;
    const record = { ...payment, id, createdAt: payment.createdAt || new Date().toISOString() };
    const existingIdx = payments.findIndex((p: any) => p.id === id);
    if (existingIdx >= 0) {
      payments[existingIdx] = { ...payments[existingIdx], ...record };
    } else {
      payments.unshift(record);
    }
    savePersistedPayments(payments);
    res.json({ success: true, payment: record });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Recent News Persistence
const NEWS_FILE = path.join(process.cwd(), 'data', 'recent_news.json');
function getPersistedNews(): any[] {
  try {
    if (fs.existsSync(NEWS_FILE)) {
      const data = fs.readFileSync(NEWS_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.warn('Error reading news:', err);
  }
  return [];
}
function savePersistedNews(news: any[]): void {
  try {
    const dir = path.dirname(NEWS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(NEWS_FILE, JSON.stringify(news || [], null, 2), 'utf-8');
  } catch (err) {
    console.warn('Error saving news:', err);
  }
}

app.get('/api/recent-news', (req, res) => {
  res.json(getPersistedNews());
});

app.post('/api/recent-news', (req, res) => {
  try {
    const item = req.body;
    if (!item) return res.status(400).json({ error: 'Body required' });
    const list = getPersistedNews();
    const id = item.id || `NEWS-${Date.now()}`;
    const record = { ...item, id, updatedAt: new Date().toISOString() };
    const idx = list.findIndex((n: any) => n.id === id);
    if (idx >= 0) list[idx] = { ...list[idx], ...record };
    else list.unshift(record);
    savePersistedNews(list);
    res.json({ success: true, item: record });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/recent-news/:id', (req, res) => {
  try {
    const { id } = req.params;
    const list = getPersistedNews().filter((n: any) => n.id !== id);
    savePersistedNews(list);
    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/recent-news/sync-batch', (req, res) => {
  try {
    const { items } = req.body;
    if (Array.isArray(items)) {
      const list = getPersistedNews();
      const map = new Map<string, any>(list.map((n: any) => [n.id, n]));
      for (const item of items) {
        if (item && item.id) {
          const ex = map.get(item.id);
          map.set(item.id, ex ? { ...ex, ...item } : item);
        }
      }
      const merged = Array.from(map.values());
      savePersistedNews(merged);
      return res.json({ success: true, count: merged.length });
    }
    res.status(400).json({ error: 'Array required' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Feedback Messages Persistence
const FEEDBACK_FILE = path.join(process.cwd(), 'data', 'feedback.json');
function getPersistedFeedback(): any[] {
  try {
    if (fs.existsSync(FEEDBACK_FILE)) {
      const data = fs.readFileSync(FEEDBACK_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.warn('Error reading feedback:', err);
  }
  return [];
}
function savePersistedFeedback(feedback: any[]): void {
  try {
    const dir = path.dirname(FEEDBACK_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(FEEDBACK_FILE, JSON.stringify(feedback || [], null, 2), 'utf-8');
  } catch (err) {
    console.warn('Error saving feedback:', err);
  }
}

app.get('/api/feedback', (req, res) => {
  res.json(getPersistedFeedback());
});

app.post('/api/feedback', (req, res) => {
  try {
    const item = req.body;
    if (!item) return res.status(400).json({ error: 'Body required' });
    const list = getPersistedFeedback();
    const id = item.id || `FEED-${Date.now()}`;
    const record = { ...item, id, createdAt: item.createdAt || new Date().toISOString() };
    const idx = list.findIndex((f: any) => f.id === id);
    if (idx >= 0) list[idx] = { ...list[idx], ...record };
    else list.unshift(record);
    savePersistedFeedback(list);
    res.json({ success: true, feedback: record });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/feedback/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body || {};
    const list = getPersistedFeedback();
    const idx = list.findIndex((f: any) => f.id === id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...updates };
      savePersistedFeedback(list);
      return res.json({ success: true, feedback: list[idx] });
    }
    res.status(404).json({ error: 'Not found' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/feedback/:id', (req, res) => {
  try {
    const { id } = req.params;
    const list = getPersistedFeedback().filter((f: any) => f.id !== id);
    savePersistedFeedback(list);
    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Contacts Persistence
const CONTACTS_FILE = path.join(process.cwd(), 'data', 'contacts.json');
function getPersistedContacts(): any[] {
  try {
    if (fs.existsSync(CONTACTS_FILE)) {
      const data = fs.readFileSync(CONTACTS_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.warn('Error reading contacts:', err);
  }
  return [];
}
function savePersistedContacts(contacts: any[]): void {
  try {
    const dir = path.dirname(CONTACTS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(CONTACTS_FILE, JSON.stringify(contacts || [], null, 2), 'utf-8');
  } catch (err) {
    console.warn('Error saving contacts:', err);
  }
}

app.get('/api/contacts', (req, res) => {
  res.json(getPersistedContacts());
});

app.post('/api/contacts', (req, res) => {
  try {
    const item = req.body;
    if (!item) return res.status(400).json({ error: 'Body required' });
    const list = getPersistedContacts();
    const id = item.id || `CONT-${Date.now()}`;
    const record = { ...item, id, createdAt: item.createdAt || new Date().toISOString() };
    const idx = list.findIndex((c: any) => c.id === id);
    if (idx >= 0) list[idx] = { ...list[idx], ...record };
    else list.unshift(record);
    savePersistedContacts(list);
    res.json({ success: true, contact: record });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/contacts/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body || {};
    const list = getPersistedContacts();
    const idx = list.findIndex((c: any) => c.id === id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...updates };
      savePersistedContacts(list);
      return res.json({ success: true, contact: list[idx] });
    }
    res.status(404).json({ error: 'Not found' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/contacts/:id', (req, res) => {
  try {
    const { id } = req.params;
    const list = getPersistedContacts().filter((c: any) => c.id !== id);
    savePersistedContacts(list);
    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
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

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Botany Alumni Express Server running on port ${PORT}`);
  });
}

setupViteMiddleware();
