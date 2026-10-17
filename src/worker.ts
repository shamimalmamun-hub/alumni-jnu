import { handleDataApi, type DbEnv } from './worker/db';

export interface Env extends DbEnv {
  APP_URL?: string;
  RESEND_API_KEY?: string;
  RESEND_FROM_EMAIL?: string;
  ASSETS?: { fetch: (req: Request) => Promise<Response> };
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
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, PATCH, DELETE',
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
      resendConfigured: Boolean(env.RESEND_API_KEY),
      timestamp: new Date().toISOString(),
      platform: 'cloudflare-worker',
    });
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
              <h1 style="color: #ffffff; margin: 0; font-size: 20px;">উদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশন, জগন্নাথ বিশ্ববিদ্যালয়</h1>
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

  /* ------------------------------------------------- database + admin login */
  const dataResponse = await handleDataApi(request, url, env, normalizedPath);
  if (dataResponse) return dataResponse;

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
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, PATCH, DELETE',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    // 1. /api/* routes: health, email, admin login and the D1-backed /api/db/* document API.
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
