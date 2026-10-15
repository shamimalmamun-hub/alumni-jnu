export const onRequest = async (context: any) => {
  const req = context.request;
  const url = new URL(req.url);
  const env = context.env || {};

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const normalizedPath = url.pathname.replace(/\/$/, '');

  // SSLCommerz Callback
  if (normalizedPath === '/api/sslcommerz/callback') {
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
            for (const [key, value] of formData.entries()) payload[key] = String(value);
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
              try { Object.assign(payload, JSON.parse(text)); } catch {
                const params = new URLSearchParams(text);
                for (const [k, v] of params.entries()) payload[k] = v;
              }
            }
          }
        } else {
          const text = await clonedReq.text().catch(() => '');
          if (text) {
            if (text.trim().startsWith('{')) {
              try { Object.assign(payload, JSON.parse(text)); } catch {}
            } else {
              const params = new URLSearchParams(text);
              for (const [k, v] of params.entries()) payload[k] = v;
            }
          }
        }
      } catch (e) {
        console.error('Callback payload parse error:', e);
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
    try { window.location.replace(${JSON.stringify(targetUrl)}); } catch(e) { window.location.href = ${JSON.stringify(targetUrl)}; }
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
  }

  // 4. SSLCommerz Init Payment
  if (normalizedPath === '/api/sslcommerz/init-payment') {
    const SSL_STORE_ID = env.SSLCOMMERZ_STORE_ID || 'alumn6a8db7f2f37e4';
    const SSL_STORE_PASSWD = env.SSLCOMMERZ_STORE_PASSWD || 'NrbSvx33N4Me';
    const SSL_IS_LIVE = env.SSLCOMMERZ_IS_LIVE === 'true' || env.SSLCOMMERZ_IS_LIVE === true;
    const SSL_BASE_URL = SSL_IS_LIVE ? 'https://securepay.sslcommerz.com' : 'https://sandbox.sslcommerz.com';

    try {
      let body: any = {};
      try { body = await req.json(); } catch { body = {}; }

      const {
        amount = 500, membershipId = '', formNo = '', name = '',
        email = 'member@example.com', mobile = '', address = 'Dhaka, Bangladesh',
      } = body;

      const applicantName = (name && name !== 'Applicant') ? name : '';
      const applicantPhone = mobile || '';
      const applicantAmount = amount || 500;

      const baseUrl = env.APP_URL ? env.APP_URL.replace(/\/$/, '') : url.origin;
      const tran_id = `TXN_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
      const callbackURL = `${baseUrl}/api/sslcommerz/callback?membershipId=${encodeURIComponent(membershipId)}&applicantName=${encodeURIComponent(applicantName)}&applicantPhone=${encodeURIComponent(applicantPhone)}&applicantAmount=${encodeURIComponent(String(applicantAmount))}`;

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

      const sslRes = await fetch(`${SSL_BASE_URL}/gwprocess/v4/api.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: sslParams.toString(),
      });

      const sslData = (await sslRes.json()) as any;
      if (sslData && (sslData.status === 'SUCCESS' || sslData.status === 'success') && sslData.GatewayPageURL) {
        return new Response(JSON.stringify({
          status: 'SUCCESS',
          gatewayUrl: sslData.GatewayPageURL,
          GatewayPageURL: sslData.GatewayPageURL,
          sessionkey: sslData.sessionkey,
          tran_id,
        }), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
      }

      return new Response(JSON.stringify({
        status: 'FAILED',
        message: sslData?.failedreason || 'Failed to initialize SSLCommerz payment.',
      }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    } catch (err: any) {
      return new Response(JSON.stringify({ status: 'FAILED', message: err.message }), {
        status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
  }

  // 5. Health check
  if (normalizedPath === '/api/health') {
    return new Response(JSON.stringify({ status: 'ok', time: new Date().toISOString() }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  return new Response(JSON.stringify({ error: 'Endpoint not found' }), {
    status: 404,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
};

export const onRequestPost = onRequest;
export const onRequestGet = onRequest;
export const onRequestOptions = onRequest;
export const onRequestPut = onRequest;
