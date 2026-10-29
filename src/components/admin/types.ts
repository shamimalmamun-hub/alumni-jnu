import { watch, listDocuments } from '../../lib/db';
import { auth } from '../../lib/firebase';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function buildBrandedEmailHtml(text: string): string {
  const formattedParagraphs = text
    .split('\n')
    .map((line) => line.trim())
    .map((line) =>
      line
        ? `<p style="margin: 0 0 12px 0; font-size: 14px; color: #374151; line-height: 1.6;">${line
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(
              /(https?:\/\/[^\s<>"']+)/g,
              '<a href="$1" style="color: #006a4e; font-weight: bold; text-decoration: underline; word-break: break-all;">$1</a>'
            )}</p>`
        : '<div style="height: 8px;"></div>'
    )
    .join('');

  return `
    <div style="font-family: Arial, Helvetica, sans-serif; max-width: 620px; margin: 0 auto; border: 1px solid #d1d5db; border-radius: 12px; overflow: hidden; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
      <div style="background-color: #006a4e; padding: 24px 20px; text-align: center; border-bottom: 4px solid #fcd34d;">
        <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: bold; letter-spacing: 0.5px;">উদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশন</h1>
        <p style="color: #fcd34d; margin: 6px 0 0 0; font-size: 13px; font-weight: 600;">জগন্নাথ বিশ্ববিদ্যালয়, ঢাকা</p>
      </div>
      <div style="padding: 28px 24px; background-color: #ffffff;">
        ${formattedParagraphs}
      </div>
      <div style="background-color: #f8fafc; padding: 16px 20px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
        <p style="margin: 0 0 4px 0;"><strong>উদ্ভিদবিজ্ঞান বিভাগ, জগন্নাথ বিশ্ববিদ্যালয়</strong></p>
        <p style="margin: 0 0 4px 0;">Botany Alumni Association, Jagannath University</p>
        <p style="margin: 0;">© ${new Date().getFullYear()} Botany Alumni Association, JnU. All Rights Reserved.</p>
      </div>
    </div>
  `;
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  let errStr = '';
  try {
    if (error instanceof Error) {
      errStr = error.message;
    } else if (typeof error === 'object' && error !== null) {
      errStr = (error as any).message || (error as any).error || JSON.stringify(error);
    } else {
      errStr = String(error);
    }
  } catch {
    errStr = String(error);
  }

  const errInfo: FirestoreErrorInfo = {
    error: errStr,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
    },
    operationType,
    path
  };
  console.error('Database error in Admin Dashboard: ', JSON.stringify(errInfo));
}

/**
 * Load a whole collection and hand it to `onData` in the shape the list builders below expect
 * (`forEach` over `{ id, data() }`). Re-runs after this browser writes to the collection.
 */
export function watchCollection(
  name: string,
  onData: (snapshot: { forEach: (fn: (docSnap: { id: string; data: () => any }) => void) => void }) => void,
  onError: (error: unknown) => void
) {
  return watch(name, async () => {
    try {
      const docs = await listDocuments(name);
      onData({ forEach: (fn) => docs.forEach((d) => fn({ id: d.id, data: () => d })) });
    } catch (err) {
      onError(err);
    }
  });
}

export interface MembershipRecord {
  id: string;
  formNo?: string;
  membershipId?: string;
  applicationDate?: string;
  fullName?: string;
  applicantNameBn?: string;
  applicantNameEn?: string;
  fathersName?: string;
  mothersName?: string;
  dateOfBirth?: string;
  dobDay?: string;
  dobMonth?: string;
  dobYear?: string;
  bscSession?: string;
  bscYear?: string;
  bscBatch?: string;
  mscSession?: string;
  mscYear?: string;
  mscBatch?: string;
  mphilYear?: string;
  phdYear?: string;
  degreeDocName?: string;
  degreeDocData?: string;
  degreeDocUrl?: string;
  program?: string;
  academicYear?: string;
  classRoll?: string;
  regNumber?: string;
  session?: string;
  batch?: string;
  mobile: string;
  phone?: string;
  email?: string;
  presentAddress?: string;
  permanentAddress?: string;
  village?: string;
  post?: string;
  upazila?: string;
  district?: string;
  permVillage?: string;
  permPost?: string;
  permUpazila?: string;
  permDistrict?: string;
  occupation?: string;
  occupationCategory?: string;
  otherOccupation?: string;
  organizationPosition?: string;
  bloodGroup?: string;
  nidNumber?: string;
  userPhotoUrl?: string;
  signatureDataUrl?: string;
  signatureName?: string;
  declarationConfirmed?: boolean;
  membershipType?: string;
  feeAmount?: string;
  paymentMethod?: string;
  senderNumber?: string;
  transactionId?: string;
  valId?: string;
  cardType?: string;
  paymentStatus?: 'paid' | 'unpaid' | 'pending';
  status?: 'pending' | 'approved' | 'rejected' | 'payment_pending';
  adminNotes?: string;
  createdAt?: string;
  paidAt?: string;
}

export interface FeedbackRecord {
  id: string;
  senderName?: string;
  name?: string;
  senderBatch?: string;
  batch?: string;
  senderContact?: string;
  phone?: string;
  email?: string;
  category?: string;
  subject?: string;
  message: string;
  status?: 'unread' | 'read' | 'resolved';
  createdAt?: any;
  occupation?: string;
}

export interface ContactRecord {
  id: string;
  name: string;
  phone: string;
  email?: string;
  subject?: string;
  message: string;
  status?: 'unread' | 'read' | 'resolved';
  createdAt?: string;
}

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

export interface PaymentRecord {
  id: string;
  receiptNo: string;
  payerName: string;
  payerNameBn?: string;
  membershipId?: string;
  purpose: string;
  purposeType: string;
  amount: number;
  paymentMethod: string;
  senderNumber: string;
  transactionId: string;
  phone: string;
  email?: string;
  session?: string;
  batch?: string;
  note?: string;
  slipUrl?: string;
  status: string;
  createdAt: string;
}

export type AdminSection =
  | 'overview'
  | 'unregistered'
  | 'unpaid'
  | 'registered'
  | 'lifetime'
  | 'memberships'
  | 'donations'
  | 'community-stats'
  | 'feedbacks'
  | 'notices'
  | 'recent-news'
  | 'announcements'
  | 'gallery'
  | 'email';

export const ADMIN_SECTIONS: AdminSection[] = [
  'overview',
  'unregistered',
  'unpaid',
  'registered',
  'lifetime',
  'memberships',
  'donations',
  'community-stats',
  'feedbacks',
  'notices',
  'recent-news',
  'announcements',
  'gallery',
  'email',
];

/** Parse the admin section slug from a path like `/admin/unpaid` (null when not an admin section path). */
export function parseAdminSection(pathname: string): AdminSection | null {
  const match = pathname.toLowerCase().replace(/\/+$/, '').match(/^\/admin\/([a-z-]+)$/);
  if (!match) return null;
  const slug = match[1];
  return (ADMIN_SECTIONS as string[]).includes(slug) ? (slug as AdminSection) : null;
}
