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
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Payload too large & JSON parse error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err && (err.type === 'entity.too.large' || err.status === 413 || err.name === 'PayloadTooLargeError')) {
    console.warn(`[PayloadTooLargeError] Request payload exceeded limit: ${err.message}`);
    return res.status(413).json({
      error: 'PayloadTooLargeError',
      message: 'Request entity too large. Maximum supported payload size is 50MB.',
    });
  }
  if (err && err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ error: 'BadRequest', message: 'Invalid JSON payload' });
  }
  next(err);
});

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

// Dev only: D1-backed routes live in the Worker (`npm run dev:worker`, port 8787).
const WORKER_ORIGIN = process.env.WORKER_ORIGIN || 'http://localhost:8787';
app.all(['/api/db/*', '/api/admin/*', '/api/member-login'], async (req, res) => {
  try {
    const hasBody = !['GET', 'HEAD'].includes(req.method);
    const upstream = await fetch(WORKER_ORIGIN + req.originalUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        ...(req.headers.authorization ? { Authorization: req.headers.authorization } : {}),
      },
      body: hasBody ? JSON.stringify(req.body ?? {}) : undefined,
    });
    res.status(upstream.status).type('application/json').send(await upstream.text());
  } catch (err: any) {
    res.status(502).json({ error: `Worker unreachable at ${WORKER_ORIGIN}. Run \`npm run dev:worker\`. (${err.message})` });
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
