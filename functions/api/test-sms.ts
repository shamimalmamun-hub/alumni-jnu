export const onRequest = async (context: any) => {
  const req = context.request;
  const url = new URL(req.url);
  const env = context.env || {};

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const phone = url.searchParams.get('phone') || url.searchParams.get('mobile') || '01401996674';
  const rawSmsKey = env.SMS_API_KEY;
  const apiKey = (rawSmsKey && rawSmsKey !== 'BMszEcuXSaGtE4xr68JP8G6m3uP04IZidBWpgXIB')
    ? rawSmsKey
    : 'juOIwULseyuzv3Z9AUKk';
  const SMS_SENDER_ID = env.SMS_SENDER_ID || '8809648906169';
  const SMS_API_URL = env.SMS_API_URL || 'http://bulksmsbd.net/api/smsapi';

  const digitsOnly = String(phone).replace(/[^0-9]/g, '');
  let local = digitsOnly;
  if (digitsOnly.startsWith('880')) local = digitsOnly.slice(2);
  else if (digitsOnly.startsWith('88')) local = digitsOnly.slice(2);
  if (!local.startsWith('0') && local.length === 10) local = `0${local}`;
  const cleanNumber = local.startsWith('0') ? local : `0${local}`;

  const testMsg = `আনন্দ মোহন কলেজ সমাজবিজ্ঞান বিভাগ অ্যালামনাই: টেস্ট এসএমএস সফল হয়েছে! সময়: ${new Date().toLocaleTimeString('bn-BD')}`;

  const postParams = new URLSearchParams({
    api_key: apiKey,
    type: 'unicode',
    number: cleanNumber,
    message: testMsg,
  });
  if (SMS_SENDER_ID) postParams.append('senderid', SMS_SENDER_ID);

  try {
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

    return new Response(JSON.stringify({ status: 'SUCCESS', target: cleanNumber, data: jsonRes }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ status: 'FAILED', error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};

export const onRequestGet = onRequest;
export const onRequestPost = onRequest;
