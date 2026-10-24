export const onRequestOptions = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
};

export const onRequest = async (context: any) => {
  const env = context.env || {};
  const req = context.request;

  if (req.method === 'OPTIONS') {
    return onRequestOptions();
  }

  const SSL_STORE_ID = env.SSLCOMMERZ_STORE_ID || 'alumn6a8db7f2f37e4';
  const SSL_STORE_PASSWD = env.SSLCOMMERZ_STORE_PASSWD || 'NrbSvx33N4Me';
  const SSL_IS_LIVE = env.SSLCOMMERZ_IS_LIVE === 'true' || env.SSLCOMMERZ_IS_LIVE === true;
  const SSL_BASE_URL = SSL_IS_LIVE
    ? 'https://securepay.sslcommerz.com'
    : 'https://sandbox.sslcommerz.com';

  const corsHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      try {
        const text = await req.text();
        if (text) body = JSON.parse(text);
      } catch {
        body = {};
      }
    }

    const {
      amount = 500,
      membershipId = '',
      formNo = '',
      name = '',
      email = 'member@example.com',
      mobile = '01770618575',
      address = 'Dhaka, Bangladesh',
      appUrl = '',
    } = body;

    const applicantName = (name && name !== 'Applicant') ? name : '';
    const applicantPhone = mobile || '';
    const applicantAmount = amount || 500;

    const url = new URL(req.url);
    const baseUrl = appUrl || (env.APP_URL ? env.APP_URL.replace(/\/$/, '') : url.origin);
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

    const sslRes = await fetch(`${SSL_BASE_URL}/gwprocess/v4/api.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: sslParams.toString(),
    });

    const sslData = (await sslRes.json()) as any;

    if (sslData && (sslData.status === 'SUCCESS' || sslData.status === 'success') && sslData.GatewayPageURL) {
      return new Response(
        JSON.stringify({
          status: 'SUCCESS',
          gatewayUrl: sslData.GatewayPageURL,
          GatewayPageURL: sslData.GatewayPageURL,
          sessionkey: sslData.sessionkey,
          tran_id,
        }),
        { status: 200, headers: corsHeaders }
      );
    } else {
      return new Response(
        JSON.stringify({
          status: 'FAILED',
          message: sslData?.failedreason || 'Failed to initialize SSLCommerz payment gateway session.',
        }),
        { status: 400, headers: corsHeaders }
      );
    }
  } catch (err: any) {
    return new Response(
      JSON.stringify({ status: 'FAILED', message: err.message || 'Unknown Server Error' }),
      { status: 500, headers: corsHeaders }
    );
  }
};

export const onRequestPost = onRequest;
export const onRequestGet = onRequest;
