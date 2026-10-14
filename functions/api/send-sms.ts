export const onRequest = async (context: any) => {
  const req = context.request;
  const env = context.env || {};

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    let body: any = {};
    try { body = await req.json(); } catch { body = {}; }
    const { mobile, name, amount, tranId, formNo, cardUrl, message: customMsg } = body;
    const targetMobile = mobile || '';

    if (!targetMobile) {
      return new Response(JSON.stringify({ success: false, error: 'Mobile number is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const rawSmsKey = env.SMS_API_KEY;
    const apiKey = (rawSmsKey && rawSmsKey !== 'BMszEcuXSaGtE4xr68JP8G6m3uP04IZidBWpgXIB')
      ? rawSmsKey
      : 'juOIwULseyuzv3Z9AUKk';
    const SMS_SENDER_ID = env.SMS_SENDER_ID || '8809648906169';
    const SMS_API_URL = env.SMS_API_URL || 'http://bulksmsbd.net/api/smsapi';

    // Normalize phone number
    const digitsOnly = String(targetMobile).replace(/[^0-9]/g, '');
    let local = digitsOnly;
    if (digitsOnly.startsWith('880')) local = digitsOnly.slice(2);
    else if (digitsOnly.startsWith('88')) local = digitsOnly.slice(2);
    if (!local.startsWith('0') && local.length === 10) local = `0${local}`;
    const cleanNumber = local.startsWith('0') ? local : `0${local}`;

    const reqUrl = new URL(req.url);
    const baseUrl = body.appUrl || (env.APP_URL ? env.APP_URL.replace(/\/$/, '') : reqUrl.origin);
    const downloadUrl = cardUrl || (formNo ? `${baseUrl}/card/${encodeURIComponent(formNo)}` : (tranId ? `${baseUrl}/?trx=${encodeURIComponent(tranId)}` : `${baseUrl}/members-list`));

    const msgToSend = customMsg || `অভিনন্দন ${name || 'সদস্য'}! আনন্দ মোহন কলেজ সমাজবিজ্ঞান বিভাগ অ্যালামনাই পুনর্মিলনীতে আপনার নিবন্ধন ও ৳${amount || '৫০০'} ফি সফলভাবে গৃহীত হয়েছে (TrxID: ${tranId || 'N/A'})। সদস্য কার্ড ডাউনলোড লিংক: ${downloadUrl}`;
    const hasUnicode = /[^\u0000-\u007F]/.test(msgToSend);
    const smsType = hasUnicode ? 'unicode' : 'text';

    const postParams = new URLSearchParams({
      api_key: apiKey,
      type: smsType,
      number: cleanNumber,
      message: msgToSend,
    });
    if (SMS_SENDER_ID) {
      postParams.append('senderid', SMS_SENDER_ID);
    }

    console.log(`[CF Functions SMS] Sending to ${cleanNumber}...`);

    let res = await fetch(SMS_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
      body: postParams.toString(),
    });

    let textRes = await res.text();
    let jsonRes: any = null;
    try { jsonRes = JSON.parse(textRes); } catch { jsonRes = { raw: textRes }; }

    if (!jsonRes || (jsonRes.response_code !== 202 && jsonRes.response_code !== 200)) {
      const getUrl = `${SMS_API_URL}?${postParams.toString()}`;
      const getRes = await fetch(getUrl, { method: 'GET' });
      const getText = await getRes.text();
      try { jsonRes = JSON.parse(getText); } catch { jsonRes = { raw: getText }; }
    }

    const isSuccess = Boolean(
      jsonRes && (
        jsonRes.response_code === 202 ||
        jsonRes.response_code === 200 ||
        jsonRes.success === true ||
        (typeof textRes === 'string' && textRes.includes('202'))
      )
    );

    return new Response(JSON.stringify({ success: isSuccess, provider: 'bulksmsbd', data: jsonRes }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};

export const onRequestPost = onRequest;
export const onRequestGet = onRequest;
export const onRequestOptions = onRequest;
