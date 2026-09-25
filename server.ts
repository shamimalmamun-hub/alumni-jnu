import express from 'express';
import path from 'path';
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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
