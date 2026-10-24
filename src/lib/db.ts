import { auth } from './firebase';

/**
 * Client for the Worker's D1-backed document API (/api/db/*).
 * Replaces the Firestore SDK: documents are plain JSON objects addressed by (collection, id).
 */

export type Doc<T = Record<string, any>> = T & { id: string };

const PIN_TOKEN_KEY = 'botany_admin_token';

/* ------------------------------------------------------------- admin token */

export function setPinToken(token: string | null) {
  try {
    if (token) sessionStorage.setItem(PIN_TOKEN_KEY, token);
    else sessionStorage.removeItem(PIN_TOKEN_KEY);
  } catch {}
}

async function getAuthHeader(): Promise<Record<string, string>> {
  try {
    await auth.authStateReady();
    if (auth.currentUser) return { Authorization: `Bearer ${await auth.currentUser.getIdToken()}` };
  } catch {}
  try {
    const pin = sessionStorage.getItem(PIN_TOKEN_KEY);
    if (pin) return { Authorization: `Bearer ${pin}` };
  } catch {}
  return {};
}

/** Exchange the admin PIN for a signed session token (verified by the Worker). */
export async function loginWithPin(pin: string): Promise<boolean> {
  const res = await fetch('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pin }),
  });
  if (!res.ok) return false;
  const { token } = await res.json();
  setPinToken(token);
  return true;
}

/* ----------------------------------------------------------------- requests */

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`/api/db/${path}`, {
    method,
    headers: { ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}), ...(await getAuthHeader()) },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    let message = res.statusText;
    try {
      message = (await res.json()).error || message;
    } catch {}
    if (res.status === 401) window.dispatchEvent(new Event('admin-auth-expired'));
    throw new ApiError(res.status, message);
  }
  return res.json();
}

const enc = encodeURIComponent;

/* ------------------------------------------------------------ change events */

// Listeners re-fetch after this browser writes to their collection (there are no server push updates).
const changeListeners = new Map<string, Set<() => void>>();
const notifyChange = (collection: string) => changeListeners.get(collection)?.forEach((fn) => fn());

/**
 * Fetch once now, then again whenever this client writes to `collection`.
 * Drop-in replacement for the old `onSnapshot` subscriptions.
 */
export function watch(collection: string, load: () => void | Promise<void>): () => void {
  const set = changeListeners.get(collection) ?? new Set();
  changeListeners.set(collection, set);
  let active = true;
  const run = () => {
    if (active) Promise.resolve(load()).catch((err) => console.warn(`watch(${collection}) failed:`, err?.message || err));
  };
  set.add(run);
  run();
  return () => {
    active = false;
    set.delete(run);
  };
}

/* --------------------------------------------------------------- operations */

/** Get one document, or null if it does not exist. */
export async function getDocument<T = Record<string, any>>(collection: string, id: string): Promise<Doc<T> | null> {
  try {
    return (await request<{ doc: Doc<T> }>('GET', `${enc(collection)}/${enc(id)}`)).doc;
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

export interface ListOptions {
  where?: Record<string, string>;
  limit?: number;
}

export async function listDocuments<T = Record<string, any>>(collection: string, opts: ListOptions = {}): Promise<Doc<T>[]> {
  const params = new URLSearchParams();
  for (const [field, value] of Object.entries(opts.where || {})) params.append('where', `${field}:${value}`);
  if (opts.limit) params.set('limit', String(opts.limit));
  const qs = params.toString();
  return (await request<{ docs: Doc<T>[] }>('GET', `${enc(collection)}${qs ? `?${qs}` : ''}`)).docs;
}

/** Create or replace a document (or deep-merge into it with `merge: true`). */
export async function setDocument(collection: string, id: string, data: object, opts: { merge?: boolean } = {}): Promise<void> {
  await request('PUT', `${enc(collection)}/${enc(id)}${opts.merge ? '?merge=1' : ''}`, data);
  notifyChange(collection);
}

/** Create a document with a generated id; returns the id. */
export async function addDocument(collection: string, data: object): Promise<string> {
  const { id } = await request<{ id: string }>('POST', enc(collection), data);
  notifyChange(collection);
  return id;
}

/** Merge fields into an existing document. Rejects with a 404 ApiError if it is missing. */
export async function updateDocument(collection: string, id: string, data: object): Promise<void> {
  await request('PATCH', `${enc(collection)}/${enc(id)}`, data);
  notifyChange(collection);
}

export async function deleteDocument(collection: string, id: string): Promise<void> {
  await request('DELETE', `${enc(collection)}/${enc(id)}`);
  notifyChange(collection);
}
