import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export interface SMSVariable {
  key: string;
  labelBn: string;
  labelEn: string;
  example: string;
  descriptionBn: string;
}

export const SMS_VARIABLES: SMSVariable[] = [
  {
    key: '{name}',
    labelBn: 'সদস্যের নাম',
    labelEn: 'Member Name',
    example: 'ড. মোঃ রফিকুল ইসলাম',
    descriptionBn: 'আবেদনকারীর পূর্ণ নাম',
  },
  {
    key: '{formNo}',
    labelBn: 'ফরম / মেম্বার নম্বর',
    labelEn: 'Form / Member ID',
    example: 'BOT-2026-0012',
    descriptionBn: 'অফিসিয়াল ফরম বা সদস্য আইডি',
  },
  {
    key: '{formPdfUrl}',
    labelBn: 'পূরণকৃত ফরমের PDF লিংক',
    labelEn: 'Filled Form PDF Link',
    example: 'https://ais-pre-trlneysfvgomaastzre5pu-583514143305.asia-east1.run.app/form/BOT-2026-0012',
    descriptionBn: 'ইউজারের পূরণকৃত অফিসিয়াল আবেদন ফরমের সরাসরি ভিউ ও PDF ডাউনলোড লিংক',
  },
  {
    key: '{phone}',
    labelBn: 'মোবাইল নম্বর',
    labelEn: 'Mobile Number',
    example: '01712345678',
    descriptionBn: 'সদস্যের নিবন্ধিত মোবাইল নম্বর',
  },
  {
    key: '{amount}',
    labelBn: 'ফি পরিমাণ',
    labelEn: 'Fee Amount',
    example: '৫০০',
    descriptionBn: 'সদস্যপদ ফি বা পরিশোধিত টাকার পরিমাণ',
  },
  {
    key: '{trxId}',
    labelBn: 'লেনদেন / TrxID',
    labelEn: 'Transaction ID',
    example: 'BKASH987123',
    descriptionBn: 'পেমেন্ট ট্রানজেকশন নম্বর',
  },
  {
    key: '{batch}',
    labelBn: 'ব্যাচ / সেশন',
    labelEn: 'Batch / Session',
    example: '২০০৫-২০০৬ (১ম ব্যাচ)',
    descriptionBn: 'অনার্স বা মাস্টার্স ব্যাচ',
  },
];

export const DEFAULT_SMS_TEMPLATE =
  'অভিনন্দন {name}! উদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশনে আপনার সদস্যপদ সফলভাবে অনুমোদিত হয়েছে (ফরম নং: {formNo})। আপনার পূরণকৃত আবেদন ফরমের PDF লিংক: {formPdfUrl}। শুভেচ্ছা ও অভিনন্দন!';

export interface SMSPreset {
  id: string;
  titleBn: string;
  titleEn: string;
  template: string;
  category: 'approved' | 'receipt' | 'short' | 'custom';
}

export const SMS_PRESET_TEMPLATES: SMSPreset[] = [
  {
    id: 'approved_with_pdf',
    titleBn: 'অফিসিয়াল অনুমোদন ও পূরণকৃত ফরম PDF লিংক (প্রস্তাবিত)',
    titleEn: 'Official Approval with Filled Form PDF Link',
    category: 'approved',
    template:
      'অভিনন্দন {name}! উদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশনে আপনার সদস্যপদ সফলভাবে অনুমোদিত হয়েছে (ফরম নং: {formNo})। আপনার পূরণকৃত আবেদন ফরমের PDF লিংক: {formPdfUrl}। শুভেচ্ছা ও অভিনন্দন!',
  },
  {
    id: 'short_direct',
    titleBn: 'সংক্ষিপ্ত সদস্যপদ ও ফরম লিংক',
    titleEn: 'Short Membership Message with Form Link',
    category: 'short',
    template:
      'প্রিয় {name}, উদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশনে আপনার সদস্যপদ নিশ্চিত হয়েছে (ফরম নং: {formNo})। পূরণকৃত ফরম ডাউনলোড করুন: {formPdfUrl}। ধন্যবাদ!',
  },
  {
    id: 'fee_receipt_trx',
    titleBn: 'ফি রসিদ ও পূরণকৃত ফরমের বিস্তারিত লিংক',
    titleEn: 'Fee Receipt & Filled Form Included',
    category: 'receipt',
    template:
      'সম্মানিত {name}, উদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশনে আপনার সদস্য নিবন্ধন ও ৳{amount} ফি সফলভাবে গৃহীত হয়েছে (TrxID: {trxId}, ফরম: {formNo})। পূরণকৃত ফরম: {formPdfUrl}। শুভেচ্ছা!',
  },
  {
    id: 'alumni_reunion',
    titleBn: 'পুনর্মিলনী ও ফরম রেকর্ড নোটিশ',
    titleEn: 'Alumni Notice with Form Link',
    category: 'custom',
    template:
      'প্রিয় {name}, উদ্ভিদবিজ্ঞান অ্যালামনাই পরিবারে আপনাকে স্বাগতম (ফরম নং: {formNo})। পূরণকৃত আবেদন ফরমের কপি দেখতে ভিজিট করুন: {formPdfUrl}।',
  },
];

const LOCAL_STORAGE_KEY = 'botany_alumni_sms_template';
const LOCAL_STORAGE_ENABLED_KEY = 'botany_alumni_sms_enabled';

export interface SMSConfigData {
  template: string;
  enabled: boolean;
}

/**
 * Strips legacy card-only download placeholders from template while preserving {formPdfUrl} / {pdfUrl} / {formUrl}
 */
export function stripCardLinkFromTemplate(text: string): string {
  if (!text) return '';
  return text
    .replace(/আপনার\s*ডিজিটাল\s*আইডি\s*কার্ড\s*ডাউনলোড\s*লিংক:\s*\{?cardUrl\}?/gi, '')
    .replace(/সদস্য\s*কার্ড\s*ডাউনলোড\s*লিংক:\s*\{?cardUrl\}?/gi, '')
    .replace(/ডিজিটাল\s*কার্ড\s*ডাউনলোড\s*করুন:\s*\{?cardUrl\}?/gi, '')
    .replace(/কার্ড\s*ডাউনলোড\s*লিংক:\s*\{?cardUrl\}?/gi, '')
    .replace(/কার্ড\s*লিংক:\s*\{?cardUrl\}?/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * Format SMS message using template and member information
 */
export function formatCustomSMS(
  template: string,
  member: {
    applicantNameBn?: string;
    applicantNameEn?: string;
    fullName?: string;
    formNo?: string;
    membershipId?: string;
    mobile?: string;
    feeAmount?: string;
    transactionId?: string;
    batch?: string;
    honsBatch?: string;
    mastersBatch?: string;
    cardUrl?: string;
    formPdfUrl?: string;
    id?: string;
  },
  _originUrl?: string
): string {
  const formNo = member.formNo || member.membershipId || member.id || '';
  const name =
    member.applicantNameBn ||
    member.fullName ||
    member.applicantNameEn ||
    'সদস্য';
  const phone = member.mobile || '';
  const amount = member.feeAmount || '৫০০';
  const trxId = member.transactionId || 'Manual';
  const batch = member.batch || member.honsBatch || member.mastersBatch || '';

  // Resolve base URL for form PDF view/download link
  let origin = (_originUrl || (typeof window !== 'undefined' && window.location?.origin ? window.location.origin : '')).replace(/\/+$/, '');
  if (!origin || origin.includes('localhost')) {
    origin = 'https://ais-pre-trlneysfvgomaastzre5pu-583514143305.asia-east1.run.app';
  }

  const formPdfUrl = member.formPdfUrl || (formNo ? `${origin}/form/${encodeURIComponent(formNo)}` : `${origin}/membership`);

  const rawTemplate = stripCardLinkFromTemplate(template || DEFAULT_SMS_TEMPLATE);

  return rawTemplate
    .replace(/{name}/g, name)
    .replace(/{formPdfUrl}/g, formPdfUrl)
    .replace(/{pdfUrl}/g, formPdfUrl)
    .replace(/{formUrl}/g, formPdfUrl)
    .replace(/{formNo}/g, formNo)
    .replace(/{phone}/g, phone)
    .replace(/{amount}/g, amount)
    .replace(/{trxId}/g, trxId)
    .replace(/{batch}/g, batch)
    .replace(/{cardUrl}/g, member.cardUrl || `${origin}/card/${encodeURIComponent(formNo)}`)
    .replace(/{link}/g, formPdfUrl)
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * Check whether SMS sending is globally ON or OFF
 */
export async function isSMSEnabled(): Promise<boolean> {
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_ENABLED_KEY);
      if (cached !== null) {
        return cached === 'true';
      }
    } catch {}
  }
  const config = await loadSavedSMSConfig();
  return config.enabled;
}

/**
 * Load full saved SMS config (template + ON/OFF status) from Firestore (with localStorage fallback)
 */
export async function loadSavedSMSConfig(): Promise<SMSConfigData> {
  let template = DEFAULT_SMS_TEMPLATE;
  let enabled = true;

  try {
    const docRef = doc(db, 'settings', 'sms_config');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      if (data) {
        if (typeof data.bodyTemplate === 'string' && data.bodyTemplate.trim()) {
          const cleaned = stripCardLinkFromTemplate(data.bodyTemplate.trim());
          template = cleaned || DEFAULT_SMS_TEMPLATE;
        }
        if (typeof data.enabled === 'boolean') {
          enabled = data.enabled;
        } else if (typeof data.smsEnabled === 'boolean') {
          enabled = data.smsEnabled;
        }

        // Cache locally
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(LOCAL_STORAGE_KEY, template);
            localStorage.setItem(LOCAL_STORAGE_ENABLED_KEY, String(enabled));
          } catch {}
        }
        return { template, enabled };
      }
    }
  } catch (err) {
    console.warn('[SMSConfig] Firestore read failed, reading from localStorage:', err);
  }

  // Fallback to localStorage
  if (typeof window !== 'undefined') {
    try {
      const cachedTpl = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cachedTpl && cachedTpl.trim()) {
        const cleaned = stripCardLinkFromTemplate(cachedTpl.trim());
        template = cleaned || DEFAULT_SMS_TEMPLATE;
      }
      const cachedEnabled = localStorage.getItem(LOCAL_STORAGE_ENABLED_KEY);
      if (cachedEnabled !== null) {
        enabled = cachedEnabled === 'true';
      }
    } catch {}
  }

  return { template, enabled };
}

/**
 * Load saved SMS template from Firestore (with localStorage fallback)
 */
export async function loadSavedSMSTemplate(): Promise<string> {
  const config = await loadSavedSMSConfig();
  return config.template;
}

/**
 * Save full SMS configuration (template & ON/OFF state) to Firestore and local storage
 */
export async function saveSMSFullConfig(
  config: { template: string; enabled: boolean },
  updatedBy?: string
): Promise<{ success: boolean; error?: string }> {
  const cleanTemplate = config.template.trim() || DEFAULT_SMS_TEMPLATE;
  const isEnabled = Boolean(config.enabled);

  // 1. Save to localStorage immediately
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, cleanTemplate);
      localStorage.setItem(LOCAL_STORAGE_ENABLED_KEY, String(isEnabled));
    } catch {}
  }

  // 2. Persist to Firestore
  try {
    const docRef = doc(db, 'settings', 'sms_config');
    await setDoc(
      docRef,
      {
        bodyTemplate: cleanTemplate,
        enabled: isEnabled,
        smsEnabled: isEnabled,
        updatedAt: serverTimestamp(),
        updatedBy: updatedBy || 'Admin',
      },
      { merge: true }
    );
    return { success: true };
  } catch (err: any) {
    console.error('[SMSConfig] Failed to save config to Firestore:', err);
    return { success: false, error: err?.message || 'Firestore error' };
  }
}

/**
 * Save SMS template to Firestore and local storage
 */
export async function saveSMSTemplate(
  template: string,
  updatedBy?: string
): Promise<{ success: boolean; error?: string }> {
  const currentEnabled = await isSMSEnabled().catch(() => true);
  return saveSMSFullConfig({ template, enabled: currentEnabled }, updatedBy);
}

/**
 * Calculate SMS parts and Unicode detection
 */
export function calculateSMSStats(text: string) {
  const length = text.length;
  // Check for non-ASCII characters (like Bengali)
  const isUnicode = /[^\u0000-\u007F]/.test(text);

  let smsCount = 1;
  let remainingInCurrentPart = 0;

  if (isUnicode) {
    // Unicode SMS: 70 chars for 1 part, 67 chars per part if multi-part
    if (length <= 70) {
      smsCount = 1;
      remainingInCurrentPart = 70 - length;
    } else {
      smsCount = Math.ceil(length / 67);
      remainingInCurrentPart = smsCount * 67 - length;
    }
  } else {
    // GSM-7 SMS: 160 chars for 1 part, 153 chars per part if multi-part
    if (length <= 160) {
      smsCount = 1;
      remainingInCurrentPart = 160 - length;
    } else {
      smsCount = Math.ceil(length / 153);
      remainingInCurrentPart = smsCount * 153 - length;
    }
  }

  return {
    length,
    isUnicode,
    smsCount: length === 0 ? 0 : smsCount,
    remainingInCurrentPart,
  };
}
