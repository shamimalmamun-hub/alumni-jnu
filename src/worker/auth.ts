export interface AuthEnv {
  FIREBASE_PROJECT_ID?: string;
  ADMIN_EMAILS?: string;
  ADMIN_PIN?: string;
  ADMIN_TOKEN_SECRET?: string;
}

const PIN_TOKEN_TTL_MS = 12 * 60 * 60 * 1000;
const JWKS_URL = 'https://www.googleapis.com/robot/v1/metadata/jwk/securetoken@system.gserviceaccount.com';

const encoder = new TextEncoder();

const b64urlToBytes = (s: string): Uint8Array => {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(s.length / 4) * 4, '=');
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
};

const toHex = (buf: ArrayBuffer): string =>
  Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('');

function timingSafeEqual(a: string, b: string): boolean {
  const ab = encoder.encode(a);
  const bb = encoder.encode(b);
  if (ab.length !== bb.length) return false;
  let diff = 0;
  for (let i = 0; i < ab.length; i++) diff |= ab[i] ^ bb[i];
  return diff === 0;
}

async function hmac(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return toHex(await crypto.subtle.sign('HMAC', key, encoder.encode(message)));
}

const pinSecret = (env: AuthEnv) => env.ADMIN_TOKEN_SECRET || env.ADMIN_PIN || 'baajnu2024@botany';

/** Exchange the admin PIN for a short-lived signed token. */
export async function issuePinToken(pin: string, env: AuthEnv): Promise<string | null> {
  const expectedPin = 'baajnu2024@botany';
  if (!timingSafeEqual(pin, expectedPin)) return null;
  const exp = Date.now() + PIN_TOKEN_TTL_MS;
  return `pin.${exp}.${await hmac(pinSecret(env), `admin:${exp}`)}`;
}

async function verifyPinToken(token: string, env: AuthEnv): Promise<boolean> {
  const [, expStr, sig] = token.split('.');
  const exp = Number(expStr);
  if (!pinSecret(env) || !sig || !Number.isFinite(exp) || exp < Date.now()) return false;
  return timingSafeEqual(sig, await hmac(pinSecret(env), `admin:${exp}`));
}

let jwksCache: { keys: any[]; fetchedAt: number } | null = null;

async function getJwks(): Promise<any[]> {
  if (jwksCache && Date.now() - jwksCache.fetchedAt < 60 * 60 * 1000) return jwksCache.keys;
  const res = await fetch(JWKS_URL);
  if (!res.ok) throw new Error(`JWKS fetch failed: ${res.status}`);
  const { keys } = (await res.json()) as { keys: any[] };
  jwksCache = { keys, fetchedAt: Date.now() };
  return keys;
}

/** Verify a Firebase Auth ID token and require the email to be on the admin allowlist. */
async function verifyFirebaseToken(token: string, env: AuthEnv): Promise<boolean> {
  const projectId = env.FIREBASE_PROJECT_ID;
  const allowed = (env.ADMIN_EMAILS || '').split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);
  if (!projectId || allowed.length === 0) return false;

  const [h, p, s] = token.split('.');
  if (!h || !p || !s) return false;
  const header = JSON.parse(new TextDecoder().decode(b64urlToBytes(h)));
  const payload = JSON.parse(new TextDecoder().decode(b64urlToBytes(p)));
  if (header.alg !== 'RS256') return false;

  const jwk = (await getJwks()).find((k) => k.kid === header.kid);
  if (!jwk) return false;
  const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
  const valid = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, b64urlToBytes(s), encoder.encode(`${h}.${p}`));
  if (!valid) return false;

  const now = Math.floor(Date.now() / 1000);
  return (
    payload.aud === projectId &&
    payload.iss === `https://securetoken.google.com/${projectId}` &&
    payload.exp > now &&
    payload.iat <= now + 60 &&
    payload.email_verified === true &&
    typeof payload.email === 'string' &&
    allowed.includes(payload.email.toLowerCase())
  );
}

export async function isAdmin(request: Request, env: AuthEnv): Promise<boolean> {
  const header = request.headers.get('Authorization') || '';
  if (!header.startsWith('Bearer ')) return false;
  const token = header.slice(7).trim();
  try {
    return token.startsWith('pin.') ? await verifyPinToken(token, env) : await verifyFirebaseToken(token, env);
  } catch (err) {
    console.warn('[auth] token verification failed:', err);
    return false;
  }
}
