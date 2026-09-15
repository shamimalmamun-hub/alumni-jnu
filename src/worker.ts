export interface Env {
  APP_URL?: string;
  SMS_API_KEY?: string;
  SMS_SENDER_ID?: string;
  SMS_API_URL?: string;
  SMS_PROVIDER?: string;
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

    // 1. Health check endpoint
    if (normalizedPath === '/api/health') {
      return new Response(JSON.stringify({ status: 'ok', time: new Date().toISOString(), platform: 'cloudflare-worker' }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // 2. Direct SMS Dispatch API
    if (normalizedPath === '/api/send-sms') {
      try {
        let body: any = {};
        try { body = await request.json(); } catch { body = {}; }
        const { mobile, name, amount, tranId, formNo, cardUrl, message: customMsg } = body;
        const targetMobile = mobile || '';

        if (!targetMobile) {
          return new Response(JSON.stringify({ success: false, error: 'Mobile number is required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }

        const applicantName = (name && name !== 'Applicant' && name !== 'সদস্য') ? name : '';
        const displayName = applicantName ? applicantName : 'সদস্য';
        const formNoVal = formNo || body.formNo || '';
        const linkToCard = cardUrl || (formNoVal ? `${url.origin}/card/${encodeURIComponent(formNoVal)}` : (tranId ? `${url.origin}/card/${encodeURIComponent(tranId)}` : `${url.origin}/card/BOTANY-ALUMNI`));

        let msgToSend = customMsg || `অভিনন্দন ${displayName}! উদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশন সদস্য নিবন্ধনে আপনার আবেদন ও ৳${amount || '৫০০'} ফি সফলভাবে গৃহীত হয়েছে (TrxID: ${tranId || 'N/A'})। সদস্য কার্ড ডাউনলোড লিংক: ${linkToCard}`;

        if (customMsg && !customMsg.includes('http') && !customMsg.includes('/card/')) {
          msgToSend = `${customMsg} কার্ড লিংক: ${linkToCard}`;
        }

        const smsResult = await sendSMSWithEnv({
          mobile: targetMobile,
          message: msgToSend,
          env,
        });

        return new Response(JSON.stringify(smsResult), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      } catch (err: any) {
        return new Response(JSON.stringify({ success: false, error: err.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }
    }

    // 3. Test SMS endpoint
    if (normalizedPath === '/api/test-sms') {
      const phone = url.searchParams.get('phone') || url.searchParams.get('mobile') || '01401996674';
      const testMsg = `উদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশন: টেস্ট এসএমএস সফল হয়েছে! সময়: ${new Date().toLocaleTimeString('bn-BD')}`;
      const result = await sendSMSWithEnv({
        mobile: phone,
        message: testMsg,
        env,
      });
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // 4. Serve static assets from ./dist if available
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
