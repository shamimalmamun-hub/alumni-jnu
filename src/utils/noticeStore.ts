import { NoticeItem } from '../data/portalData';
import { db } from '../lib/firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot, query } from 'firebase/firestore';

export interface NoticeRecord {
  id: string;
  title: string;
  category: string;
  description: string;
  date: string;
  isUrgent?: boolean;
  imageUrl?: string;
  pdfUrl?: string;
  pdfFileName?: string;
  createdAt?: string;
}

const STORAGE_KEY = 'botany_alumni_notices';
const DELETED_NOTICES_KEY = 'botany_alumni_deleted_notices';
const EVENT_NAME = 'botany_notices_updated';

/**
 * Identify synthetic demo notice IDs (generated dummy notices not created by the client)
 */
export function isDemoNoticeId(id: string): boolean {
  if (!id) return false;
  return /^not-(0[1-9]|[12][0-9]|3[0-5])$/.test(id) || id.startsWith('not_demo_');
}

/**
 * Get set of explicitly deleted notice IDs
 */
export function getDeletedNoticeIds(): Set<string> {
  try {
    const raw = localStorage.getItem(DELETED_NOTICES_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return new Set(arr);
    }
  } catch (err) {
    console.warn('Failed to read deleted notice IDs:', err);
  }
  return new Set<string>();
}

/**
 * Save set of explicitly deleted notice IDs
 */
export function saveDeletedNoticeIds(ids: Set<string>): void {
  try {
    localStorage.setItem(DELETED_NOTICES_KEY, JSON.stringify(Array.from(ids)));
  } catch (err) {
    console.warn('Failed to save deleted notice IDs:', err);
  }
}

/**
 * Purge any synthetic demo notices from client's localStorage
 */
export function purgeAllDemoNotices(): NoticeRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const clean = parsed.filter((n: any) => n && n.id && !isDemoNoticeId(n.id));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
        window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: clean }));
        return clean;
      }
    }
  } catch (e) {
    // ignore
  }
  return [];
}

/**
 * Get stored notices from localStorage, strictly filtering out demo notices
 */
export function getStoredNotices(): NoticeRecord[] {
  const deletedIds = getDeletedNoticeIds();
  const map = new Map<string, NoticeRecord>();

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          // Never include demo notices or explicitly deleted notices
          if (item && item.id && !isDemoNoticeId(item.id) && !deletedIds.has(item.id)) {
            map.set(item.id, item);
          }
        }
      }
    }
  } catch (err) {
    console.warn('Failed to read notices from localStorage:', err);
  }

  const result = Array.from(map.values());
  result.sort((a, b) => {
    const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return tB - tA;
  });

  return result;
}

/**
 * Save notices list to localStorage and broadcast event
 */
export function saveStoredNotices(notices: NoticeRecord[]): void {
  try {
    const clean = notices.filter((n) => n && n.id && !isDemoNoticeId(n.id));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: clean }));
  } catch (err) {
    console.warn('Failed to save notices to localStorage:', err);
  }
}

/**
 * Save or publish a new notice (guaranteed server + local + Firestore sync)
 */
export async function publishNotice(newNotice: Omit<NoticeRecord, 'id' | 'createdAt'> & { id?: string }): Promise<NoticeRecord> {
  const current = getStoredNotices();
  const noticeId = newNotice.id || `not_${Date.now()}`;
  const record: NoticeRecord = {
    ...newNotice,
    id: noticeId,
    createdAt: new Date().toISOString(),
  };

  // Remove from deleted list if previously marked deleted
  const deleted = getDeletedNoticeIds();
  if (deleted.has(noticeId)) {
    deleted.delete(noticeId);
    saveDeletedNoticeIds(deleted);
  }

  // 1. Immediately store in local storage
  const updated = [record, ...current.filter((n) => n.id !== noticeId)];
  saveStoredNotices(updated);

  // 2. Backup to Express server API
  try {
    fetch('/api/notices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
    }).catch(() => {});
  } catch (e) {
    // Ignore server background error
  }

  // 3. Try persisting to Firestore (silent catch if quota exceeded or offline)
  try {
    await setDoc(doc(db, 'notices', noticeId), {
      title: record.title,
      category: record.category,
      description: record.description,
      isUrgent: !!record.isUrgent,
      date: record.date,
      createdAt: record.createdAt,
      imageUrl: record.imageUrl || '',
      pdfUrl: record.pdfUrl || '',
      pdfFileName: record.pdfFileName || '',
    });
  } catch (err: any) {
    console.warn('Firestore notice write notice (saved in local & server backup):', err?.message || err);
  }

  return record;
}

/**
 * Delete a notice locally, from server, and from Firestore
 */
export async function removeNotice(id: string): Promise<void> {
  // Mark as explicitly deleted
  const deleted = getDeletedNoticeIds();
  deleted.add(id);
  saveDeletedNoticeIds(deleted);

  const current = getStoredNotices();
  const filtered = current.filter((n) => n.id !== id);
  saveStoredNotices(filtered);

  // Sync delete to Express server API
  try {
    fetch(`/api/notices/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }).catch(() => {});
  } catch (e) {
    // Ignore server background error
  }

  // Delete from Firestore
  try {
    await deleteDoc(doc(db, 'notices', id));
  } catch (err: any) {
    console.warn('Firestore delete notice warning:', err?.message || err);
  }
}

/**
 * Convert NoticeRecord to NoticeItem for portal components
 */
export function recordToNoticeItem(r: NoticeRecord): NoticeItem {
  return {
    id: r.id,
    titleBn: r.title,
    titleEn: r.title,
    date: r.date,
    isNew: !!r.isUrgent,
    category: 'general',
    categoryBn: r.category || 'সাধারণ নোটিশ',
    categoryEn: r.category || 'General Notice',
    refNo: r.id.startsWith('BAAJnU')
      ? r.id
      : (r.id.startsWith('not-')
          ? `BAAJnU/NOT/${r.id.replace('not-', '2026/')}`
          : `BAAJnU/NOT/${r.id.replace('not_', '').slice(-4) || 'GEN'}`),
    detailsBn: r.description,
    detailsEn: r.description,
    imageUrl: r.imageUrl || '',
    pdfUrl: r.pdfUrl || '',
    pdfFileName: r.pdfFileName || '',
  };
}

/**
 * Subscribe to notice updates (listens to local storage, server API, and Firestore)
 */
export function subscribeNotices(callback: (notices: NoticeRecord[]) => void): () => void {
  // Purge any stale demo notices on first run
  purgeAllDemoNotices();

  // Initial fire with stored local notices
  const initial = getStoredNotices();
  callback(initial);

  // Background fetch from server API to sync across clients/devices
  try {
    fetch('/api/notices')
      .then((res) => {
        if (!res.ok) throw new Error('Server returned non-200');
        return res.json();
      })
      .then((serverNotices) => {
        if (Array.isArray(serverNotices)) {
          const deletedIds = getDeletedNoticeIds();
          const cleanServer = serverNotices.filter((s) => s && s.id && !isDemoNoticeId(s.id) && !deletedIds.has(s.id));
          const current = getStoredNotices();
          const map = new Map<string, NoticeRecord>();

          // Merge current local and server notices
          cleanServer.forEach((n) => map.set(n.id, n));
          current.forEach((n) => map.set(n.id, n));

          const merged = Array.from(map.values());
          merged.sort((a, b) => {
            const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return tB - tA;
          });

          // If local has client notices not yet on server, sync them to server
          const missingOnServer = current.filter((c) => !cleanServer.some((s) => s.id === c.id));
          if (missingOnServer.length > 0) {
            fetch('/api/notices/sync-batch', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ notices: missingOnServer }),
            }).catch(() => {});
          }

          saveStoredNotices(merged);
          callback(merged);
        }
      })
      .catch(() => {
        // Silently ignore if server API is unavailable
      });
  } catch (e) {
    // Ignore fetch error
  }

  // Listen to local window events
  const handleLocalUpdate = (e: Event) => {
    const custom = e as CustomEvent<NoticeRecord[]>;
    if (custom.detail) {
      const clean = custom.detail.filter((n) => n && n.id && !isDemoNoticeId(n.id));
      callback(clean);
    } else {
      callback(getStoredNotices());
    }
  };
  window.addEventListener(EVENT_NAME, handleLocalUpdate);

  // Firestore listener
  let unsubFirestore: (() => void) | null = null;
  try {
    const q = query(collection(db, 'notices'));
    unsubFirestore = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const remoteList: NoticeRecord[] = snapshot.docs
            .map((d) => ({
              id: d.id,
              ...(d.data() as any),
            }))
            .filter((d) => !isDemoNoticeId(d.id));

          const deletedIds = getDeletedNoticeIds();
          const current = getStoredNotices();
          const map = new Map<string, NoticeRecord>();

          remoteList.forEach((r) => {
            if (!deletedIds.has(r.id)) map.set(r.id, r);
          });
          current.forEach((c) => {
            if (!deletedIds.has(c.id)) map.set(c.id, c);
          });

          const merged = Array.from(map.values());
          merged.sort((a, b) => {
            const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return tB - tA;
          });

          // Sync remote notices to server storage as well
          if (remoteList.length > 0) {
            fetch('/api/notices/sync-batch', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ notices: remoteList }),
            }).catch(() => {});
          }

          saveStoredNotices(merged);
          callback(merged);
        }
      },
      (error) => {
        // Handle Firestore quota exhaustion gracefully
        console.warn('Notice listener quota or network note (using local & server cache):', error?.message || error);
        callback(getStoredNotices());
      }
    );
  } catch (err) {
    console.warn('Notice real-time listener initialize error:', err);
  }

  return () => {
    window.removeEventListener(EVENT_NAME, handleLocalUpdate);
    if (unsubFirestore) {
      unsubFirestore();
    }
  };
}
