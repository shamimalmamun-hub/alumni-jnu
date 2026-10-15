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

    // 1. /api/* routes: health, SMS and email only. All data lives in Firestore and is
    //    read/written directly by the browser.
    if (normalizedPath.startsWith('/api')) {
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
