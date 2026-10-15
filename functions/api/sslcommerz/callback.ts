export const onRequest = async (context: any) => {
  const req = context.request;
  const url = new URL(req.url);
  const env = context.env || {};

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  let payload: Record<string, any> = {};
  for (const [key, value] of url.searchParams.entries()) {
    payload[key] = value;
  }

  if (req.method === 'POST' || req.method === 'PUT') {
    try {
      const contentType = req.headers.get('content-type') || '';
      const clonedReq = req.clone();

      if (contentType.includes('application/x-www-form-urlencoded')) {
        try {
          const formData = await req.formData();
          for (const [key, value] of formData.entries()) {
            payload[key] = String(value);
          }
        } catch {
          const text = await clonedReq.text();
          if (text) {
            const params = new URLSearchParams(text);
            for (const [k, v] of params.entries()) payload[k] = v;
          }
        }
      } else if (contentType.includes('application/json')) {
        try {
          const json = await req.json();
          Object.assign(payload, json);
        } catch {
          const text = await clonedReq.text();
          if (text) {
            try {
              Object.assign(payload, JSON.parse(text));
            } catch {
              const params = new URLSearchParams(text);
              for (const [k, v] of params.entries()) payload[k] = v;
            }
          }
        }
      } else {
        const text = await clonedReq.text().catch(() => '');
        if (text) {
          if (text.trim().startsWith('{')) {
            try {
              Object.assign(payload, JSON.parse(text));
            } catch {
              // ignore
            }
          } else {
            const params = new URLSearchParams(text);
            for (const [k, v] of params.entries()) payload[k] = v;
          }
        }
      }
    } catch (e) {
      console.error('Error parsing SSLCommerz callback body:', e);
    }
  }

  const status = String(payload.status || payload.SSL_STATUS || '').toUpperCase();
  const tran_id = payload.tran_id || payload.tranId || payload.trx_id || `TXN_${Date.now()}`;
  const val_id = payload.val_id || payload.valId || '';
  const card_type = payload.card_type || payload.card_brand || 'SSLCommerz';
  const membershipId = payload.value_a || payload.membershipId || url.searchParams.get('membershipId') || '';

  let targetUrl = `${url.origin}/?payment_gateway=sslcommerz&ssl_status=failure&reason=${encodeURIComponent(String(payload.error || payload.failedreason || 'Payment Failed'))}${membershipId ? `&membershipId=${encodeURIComponent(String(membershipId))}` : ''}`;

  if (status === 'VALID' || status === 'VALIDATED' || status === 'SUCCESS') {
    targetUrl = `${url.origin}/?payment_gateway=sslcommerz&ssl_status=success&tran_id=${encodeURIComponent(String(tran_id))}&val_id=${encodeURIComponent(String(val_id))}&card_type=${encodeURIComponent(String(card_type))}${membershipId ? `&membershipId=${encodeURIComponent(String(membershipId))}` : ''}`;
  } else if (status === 'CANCELLED' || status === 'CANCEL') {
    targetUrl = `${url.origin}/?payment_gateway=sslcommerz&ssl_status=cancel${membershipId ? `&membershipId=${encodeURIComponent(String(membershipId))}` : ''}`;
  }

  const html = `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="utf-8">
  <meta http-equiv="refresh" content="0;url=${targetUrl}">
  <title>পেমেন্ট প্রসেসিং...</title>
  <script>
    try {
      window.location.replace(${JSON.stringify(targetUrl)});
    } catch(e) {
      window.location.href = ${JSON.stringify(targetUrl)};
    }
  </script>
</head>
<body style="font-family: system-ui, -apple-system, sans-serif; text-align: center; padding: 40px 20px; background-color: #f9fafb; color: #111827;">
  <div style="max-width: 420px; margin: 0 auto; background: white; padding: 30px; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); border: 2px solid #006a4e;">
    <h2 style="color: #006a4e; margin-bottom: 10px;">আবেদন ও পেমেন্ট গৃহীত হয়েছে!</h2>
    <p style="color: #4b5563; font-size: 14px; margin-bottom: 20px;">আপনাকে মূল পেজে রিডাইরেক্ট করা হচ্ছে, অনুগ্রহ করে কিছু মুহূর্ত অপেক্ষা করুন...</p>
    <a href="${targetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #006a4e; color: white; font-weight: bold; text-decoration: none; border-radius: 8px;">এখানে ক্লিক করুন</a>
  </div>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      ...corsHeaders,
    },
  });
};

export const onRequestPost = onRequest;
export const onRequestGet = onRequest;
export const onRequestOptions = onRequest;
export const onRequestPut = onRequest;
