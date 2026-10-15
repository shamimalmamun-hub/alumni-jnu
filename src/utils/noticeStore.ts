import { NoticeItem } from '../data/portalData';
import { BASELINE_CLIENT_NOTICES } from '../data/baselineNotices';
import { db } from '../lib/firebase';
import { collection, doc, setDoc, onSnapshot } from 'firebase/firestore';

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

// Firestore documents are capped at 1 MiB; leave headroom for the other fields.
const MAX_ATTACHMENT_CHARS = 900_000;

const byNewest = (a: NoticeRecord, b: NoticeRecord) => {
  const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
  const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
  return tB - tA;
};

/**
 * Publish (create or overwrite) a notice straight to Firestore.
 * Every connected client receives it through its live listener.
 */
export async function publishNotice(
  newNotice: Omit<NoticeRecord, 'id' | 'createdAt'> & { id?: string }
): Promise<NoticeRecord> {
  const record: NoticeRecord = {
    ...newNotice,
    id: newNotice.id || `not_${Date.now()}`,
    createdAt: new Date().toISOString(),
  };

  const { id, ...fields } = record;
  const data = {
    title: fields.title,
    category: fields.category,
    description: fields.description,
    isUrgent: !!fields.isUrgent,
    date: fields.date,
    createdAt: fields.createdAt,
    imageUrl: fields.imageUrl || '',
    pdfUrl: fields.pdfUrl || '',
    pdfFileName: fields.pdfFileName || '',
  };

  if (data.imageUrl.length + data.pdfUrl.length > MAX_ATTACHMENT_CHARS) {
    throw new Error('Attachment too large: image + PDF must stay under about 700 KB to be stored in Firestore.');
  }

  await setDoc(doc(db, 'notices', id), data);
  return record;
}

/**
 * Delete a notice for everyone. A tombstone document is written (instead of a hard delete)
 * so that built-in baseline notices, which are not stored in Firestore, are hidden too.
 */
export async function removeNotice(id: string): Promise<void> {
  await setDoc(doc(db, 'notices', id), { deleted: true });
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
 * Live notice list: built-in baseline notices overlaid with the Firestore `notices` collection.
 * The callback fires immediately with the baseline, then on every remote change.
 */
export function subscribeNotices(callback: (notices: NoticeRecord[]) => void): () => void {
  const baseline = new Map<string, NoticeRecord>();
  (BASELINE_CLIENT_NOTICES || []).forEach((n) => n?.id && baseline.set(n.id, n));
  callback(Array.from(baseline.values()).sort(byNewest));

  return onSnapshot(
    collection(db, 'notices'),
    (snapshot) => {
      const map = new Map(baseline);
      snapshot.forEach((d) => {
        const data = d.data() as any;
        if (data.deleted) map.delete(d.id);
        else map.set(d.id, { id: d.id, ...data } as NoticeRecord);
      });
      callback(Array.from(map.values()).sort(byNewest));
    },
    (error) => {
      console.warn('Notices listener error:', error?.message || error);
    }
  );
}
