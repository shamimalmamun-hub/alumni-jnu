import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

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

// SSLCommerz Credentials
const SSL_STORE_ID = process.env.SSLCOMMERZ_STORE_ID || 'alumn6a8db7f2f37e4';
const SSL_STORE_PASSWD = process.env.SSLCOMMERZ_STORE_PASSWD || 'NrbSvx33N4Me';
const SSL_IS_LIVE = process.env.SSLCOMMERZ_IS_LIVE === 'true';
const SSL_BASE_URL = SSL_IS_LIVE
  ? 'https://securepay.sslcommerz.com'
  : 'https://sandbox.sslcommerz.com';

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

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    gateway: `SSLCommerz (${SSL_IS_LIVE ? 'Live' : 'Sandbox'})`,
    storeId: SSL_STORE_ID,
    smsConfigured: Boolean(SMS_API_KEY),
    smsProvider: SMS_PROVIDER,
    timestamp: new Date().toISOString(),
  });
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
      if (originHeader && !originHeader.includes('sslcommerz') && !originHeader.includes('localhost')) {
        baseUrl = originHeader;
      } else {
        const forwardedHost = req.get('x-forwarded-host');
        const forwardedProto = req.get('x-forwarded-proto') || 'https';
        const host = forwardedHost || req.get('host');
        if (host && !host.includes('sslcommerz') && !host.includes('localhost')) {
          baseUrl = `${forwardedProto.includes('https') ? 'https' : 'http'}://${host}`;
        } else if (process.env.APP_URL && process.env.APP_URL !== 'MY_APP_URL') {
          baseUrl = process.env.APP_URL.replace(/\/$/, '');
        } else {
          baseUrl = 'https://ais-pre-tkk7t5cng7m6zteqmuheb4-583514143305.asia-east1.run.app';
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

    // Ensure the message definitely has the card download link
    let finalMessage = customMessage || message || '';
    if (!finalMessage) {
      finalMessage = `অভিনন্দন ${memberName}! আনন্দ মোহন কলেজ সমাজবিজ্ঞান বিভাগ অ্যালামনাই পুনর্মিলনীতে আপনার নিবন্ধন ও ৳${amount} ফি সফলভাবে গৃহীত হয়েছে (TrxID: ${txn})। সদস্য কার্ড ডাউনলোড লিংক: ${downloadUrl}`;
    } else if (!finalMessage.includes('http') && !finalMessage.includes('/card/')) {
      finalMessage = `${finalMessage} সদস্য কার্ড লিংক: ${downloadUrl}`;
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
    const baseUrl = originHeader && !originHeader.includes('sslcommerz') ? originHeader : (process.env.APP_URL && process.env.APP_URL !== 'MY_APP_URL' ? process.env.APP_URL.replace(/\/$/, '') : reqHostUrl);
    const downloadUrl = `${baseUrl}/?card=${encodeURIComponent(formNo)}`;

    const msg = (req.query.msg || req.query.message || req.body?.message || `অভিনন্দন সম্মানিত সদস্য! আনন্দ মোহন কলেজ সমাজবিজ্ঞান বিভাগ পুনর্মিলনীতে নিবন্ধন ও ফি সফল হয়েছে। কার্ড ডাউনলোড লিংক: ${downloadUrl}`) as string;

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

// API: Initialize SSLCommerz Payment Session
app.post('/api/sslcommerz/init-payment', async (req, res) => {
  try {
    const {
      amount = 500,
      membershipId = '',
      formNo = '',
      name = 'Applicant',
      email = 'member@example.com',
      mobile = '01770618575',
      address = 'Dhaka, Bangladesh',
      appUrl = '',
    } = req.body;

    const originHeader = req.get('origin') || (req.get('referer') ? new URL(req.get('referer')!).origin : '');
    const forwardedHost = req.get('x-forwarded-host');
    const forwardedProto = req.get('x-forwarded-proto') || 'https';
    const host = forwardedHost || req.get('host') || 'localhost:3000';
    const reqHostUrl = `${forwardedProto.includes('https') ? 'https' : 'http'}://${host}`;
    
    // Use appUrl from body (sent directly by browser) or originHeader
    let baseUrl = appUrl || originHeader || reqHostUrl;
    if (!baseUrl || baseUrl.includes('localhost') || baseUrl.includes('sslcommerz')) {
      const envAppUrl = process.env.APP_URL;
      if (envAppUrl && envAppUrl !== 'MY_APP_URL') {
        baseUrl = envAppUrl.replace(/\/$/, '');
      } else {
        baseUrl = 'https://ais-pre-tkk7t5cng7m6zteqmuheb4-583514143305.asia-east1.run.app';
      }
    }

    const applicantName = (name && name !== 'Applicant') ? name : '';
    const applicantPhone = mobile || '';
    const applicantAmount = amount || 500;
    const tran_id = `TXN_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
    const callbackURL = `${baseUrl}/api/sslcommerz/callback?membershipId=${encodeURIComponent(membershipId)}&applicantName=${encodeURIComponent(applicantName)}&applicantPhone=${encodeURIComponent(applicantPhone)}&applicantAmount=${encodeURIComponent(String(applicantAmount))}&formNo=${encodeURIComponent(formNo)}&appUrl=${encodeURIComponent(baseUrl)}`;

    const sslParams = new URLSearchParams({
      store_id: SSL_STORE_ID,
      store_passwd: SSL_STORE_PASSWD,
      total_amount: Number(amount).toFixed(2),
      currency: 'BDT',
      tran_id,
      success_url: callbackURL,
      fail_url: callbackURL,
      cancel_url: callbackURL,
      ipn_url: `${baseUrl}/api/sslcommerz/ipn`,
      cus_name: applicantName || 'Applicant',
      cus_email: email || 'member@example.com',
      cus_add1: address || 'Bangladesh',
      cus_city: 'Dhaka',
      cus_country: 'Bangladesh',
      cus_phone: applicantPhone,
      shipping_method: 'NO',
      product_name: 'Alumni Membership Fee',
      product_category: 'Membership',
      product_profile: 'general',
      value_a: membershipId,
      value_b: formNo,
      value_c: applicantPhone,
      value_d: encodeURIComponent(applicantName).slice(0, 250),
    });

    console.log('Initiating SSLCommerz Session for tran_id:', tran_id, 'Callback:', callbackURL);

    const sslRes = await fetch(`${SSL_BASE_URL}/gwprocess/v4/api.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: sslParams.toString(),
    });

    const sslData = (await sslRes.json()) as any;
    console.log('SSLCommerz Init Response Status:', sslData?.status);

    if (sslData && (sslData.status === 'SUCCESS' || sslData.status === 'success') && sslData.GatewayPageURL) {
      return res.json({
        status: 'SUCCESS',
        gatewayUrl: sslData.GatewayPageURL,
        GatewayPageURL: sslData.GatewayPageURL,
        sessionkey: sslData.sessionkey,
        tran_id,
      });
    } else {
      return res.status(400).json({
        status: 'FAILED',
        message: sslData?.failedreason || 'Failed to initialize SSLCommerz payment gateway session.',
      });
    }
  } catch (err: any) {
    console.error('SSLCommerz Init Error:', err);
    res.status(500).json({ status: 'FAILED', message: err.message });
  }
});

// SSLCommerz Callback Endpoint (Handles POST / GET / OPTIONS from SSLCommerz)
app.all(['/api/sslcommerz/callback', '/api/sslcommerz/callback/'], async (req, res) => {
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  const payload = { ...req.query, ...req.body };
  console.log('SSLCommerz Callback Payload received:', payload);

  const status = String(payload.status || '').toUpperCase();
  const tran_id = payload.tran_id || payload.tranId || `TXN_${Date.now()}`;
  const val_id = payload.val_id || '';
  const card_type = payload.card_type || payload.card_brand || 'SSLCommerz';
  const membershipId = payload.value_a || payload.membershipId || req.query.membershipId || '';

  let targetUrl = `/?payment_gateway=sslcommerz&ssl_status=failure&reason=${encodeURIComponent(String(payload.error || payload.failedreason || 'Payment Failed'))}${membershipId ? `&membershipId=${encodeURIComponent(String(membershipId))}` : ''}`;

  if (status === 'VALID' || status === 'VALIDATED' || status === 'SUCCESS') {
    targetUrl = `/?payment_gateway=sslcommerz&ssl_status=success&tran_id=${encodeURIComponent(String(tran_id))}&val_id=${encodeURIComponent(String(val_id))}&card_type=${encodeURIComponent(String(card_type))}${membershipId ? `&membershipId=${encodeURIComponent(String(membershipId))}` : ''}`;
    
    // Automatically dispatch SMS from backend callback directly to the form recipient number
    const custPhone = payload.applicantPhone || payload.value_c || payload.cus_phone || payload.phone || '';
    
    // Accurately extract applicant name
    let applicantName = payload.applicantName || req.query.applicantName || '';
    if (!applicantName && payload.value_d) {
      try {
        applicantName = decodeURIComponent(payload.value_d);
      } catch {
        applicantName = payload.value_d;
      }
    }
    if (!applicantName || applicantName === 'Applicant') {
      applicantName = payload.cus_name || payload.name || '';
    }
    if (applicantName === 'Applicant') {
      applicantName = '';
    }
    const displayName = applicantName ? applicantName : 'সদস্য';
    const formNoVal = payload.formNo || payload.value_b || req.query.formNo || '';

    // Robust app baseUrl determination for the SMS link
    let baseUrl = payload.appUrl || req.query.appUrl || '';
    if (!baseUrl || baseUrl.includes('sslcommerz')) {
      const forwardedHost = req.get('x-forwarded-host');
      const forwardedProto = req.get('x-forwarded-proto') || 'https';
      const host = forwardedHost || req.get('host');
      if (host && !host.includes('sslcommerz') && !host.includes('localhost')) {
        baseUrl = `${forwardedProto.includes('https') ? 'https' : 'http'}://${host}`;
      } else if (process.env.APP_URL && process.env.APP_URL !== 'MY_APP_URL') {
        baseUrl = process.env.APP_URL.replace(/\/$/, '');
      } else {
        baseUrl = 'https://ais-pre-tkk7t5cng7m6zteqmuheb4-583514143305.asia-east1.run.app';
      }
    }

    const cardDownloadUrl = formNoVal ? `${baseUrl}/card/${encodeURIComponent(formNoVal)}` : `${baseUrl}/?trx=${encodeURIComponent(tran_id)}`;

    const totalAmount = payload.applicantAmount || payload.amount || payload.total_amount || '৫০০';
    if (custPhone) {
      const smsText = `অভিনন্দন ${displayName}! আনন্দ মোহন কলেজ সমাজবিজ্ঞান বিভাগ অ্যালামনাই পুনর্মিলনীতে আপনার নিবন্ধন ও ৳${totalAmount} ফি সফলভাবে গৃহীত হয়েছে (TrxID: ${tran_id})। সদস্য কার্ড ডাউনলোড লিংক: ${cardDownloadUrl}`;
      console.log(`[SSL Callback] Triggering auto SMS to form mobile: ${custPhone} for ${displayName}... Message: ${smsText}`);
      sendSMS({
        mobile: custPhone,
        message: smsText,
      }).then((r) => console.log('[SSL Callback SMS Result]:', r)).catch((e) => console.error('[SSL Callback SMS Err]:', e));
    }
  } else if (status === 'CANCELLED' || status === 'CANCEL') {
    targetUrl = `/?payment_gateway=sslcommerz&ssl_status=cancel${membershipId ? `&membershipId=${encodeURIComponent(String(membershipId))}` : ''}`;
  }

  const html = `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="utf-8">
  <meta http-equiv="refresh" content="0;url=${targetUrl}">
  <title>পেমেন্ট প্রসেসিং...</title>
  <script>
    window.location.replace(${JSON.stringify(targetUrl)});
  </script>
</head>
<body style="font-family: sans-serif; text-align: center; padding-top: 50px; background-color: #f9fafb; color: #111827;">
  <h2>পেমেন্ট সম্পন্ন হয়েছে!</h2>
  <p>আপনাকে রিডাইরেক্ট করা হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...</p>
  <a href="${targetUrl}" style="color: #006a4e; font-weight: bold;">যদি রিডাইরেক্ট না হয় তবে এখানে ক্লিক করুন</a>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(html);
});

// SSLCommerz IPN (Instant Payment Notification)
app.post('/api/sslcommerz/ipn', async (req, res) => {
  console.log('SSLCommerz IPN received:', req.body);
  res.status(200).send('IPN Received');
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
    console.log(`bKash PGW Express Server running on port ${PORT}`);
  });
}

setupViteMiddleware();
