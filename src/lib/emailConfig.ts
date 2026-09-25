import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export interface EmailVariable {
  key: string;
  labelBn: string;
  labelEn: string;
  example: string;
  descriptionBn: string;
}

export const EMAIL_VARIABLES: EmailVariable[] = [
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
    key: '{email}',
    labelBn: 'ইমেইল এড্রেস',
    labelEn: 'Email Address',
    example: 'member@example.com',
    descriptionBn: 'সদস্যের নিবন্ধিত ইমেইল ঠিকানা',
  },
  {
    key: '{phone}',
    labelBn: 'মোবাইল নম্বর',
    labelEn: 'Mobile Number',
    example: '01712345678',
    descriptionBn: 'সদস্যের মোবাইল নম্বর',
  },
  {
    key: '{amount}',
    labelBn: 'ফি পরিমাণ',
    labelEn: 'Fee Amount',
    example: '৫০০',
    descriptionBn: 'পরিশোধিত ফি পরিমাণ',
  },
  {
    key: '{batch}',
    labelBn: 'ব্যাচ / সেশন',
    labelEn: 'Batch / Session',
    example: '২০০৫-২০০৬ (১ম ব্যাচ)',
    descriptionBn: 'অনার্স বা মাস্টার্স ব্যাচ',
  },
];

export const DEFAULT_EMAIL_SUBJECT = 'উদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশন - গুরুত্বপূর্ণ নোটিশ ও সদস্য তথ্য';

export const DEFAULT_EMAIL_TEMPLATE =
  `প্রিয় {name},

উদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশন (জগন্নাথ বিশ্ববিদ্যালয়)-এর পক্ষ থেকে আন্তরিক শুভেচ্ছা গ্রহণ করুন। (ফরম নং: {formNo})

আপনার সদস্যপদ আবেদন ও ফি সফলভাবে গৃহীত হয়েছে। এখন থেকে আপনি সেন্ট্রাল অ্যালামনাই নেটওয়ার্কের নিবন্ধিত সদস্য।

যে কোনো তথ্যের জন্য আমাদের ওয়েবসাইটে ভিজিট করতে পারেন।

ধন্যবাদান্তে,
উদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশন
জগন্নাথ বিশ্ববিদ্যালয়, ঢাকা।`;

export interface EmailPreset {
  id: string;
  titleBn: string;
  titleEn: string;
  subject: string;
  template: string;
  category: 'approval' | 'receipt' | 'notice' | 'custom';
}

export const EMAIL_PRESET_TEMPLATES: EmailPreset[] = [
  {
    id: 'approval_preset',
    titleBn: 'সদস্যপদ অনুমোদন ও অভিনন্দন ইমেইল',
    titleEn: 'Membership Approval & Congratulations Email',
    category: 'approval',
    subject: 'অভিনন্দন! আপনার অ্যালামনাই সদস্যপদ আবেদন অনুমোদিত হয়েছে',
    template: `প্রিয় {name},

শুভ সংবাদ! উদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশনে আপনার সদস্যপদ আবেদন (ফরম নং: {formNo}) সফলভাবে পর্যালোচিত ও অনুমোদিত হয়েছে।

এখন থেকে আপনি সেন্ট্রাল অ্যালামনাই নেটওয়ার্কের একজন নিবন্ধিত সদস্য। ওয়েবসাইট থেকে আপনার ডিজিটাল মেম্বারশিপ কার্ড ডাউনলোড করে নিতে পারেন।

আমাদের সাথে যুক্ত থাকার জন্য ধন্যবাদ।

শুভেচ্ছান্তে,
উদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশন
জগন্নাথ বিশ্ববিদ্যালয়, ঢাকা।`,
  },
  {
    id: 'receipt_preset',
    titleBn: 'পেমেন্ট নিশ্চয়তা ও ফি প্রাপ্তি স্বীকার',
    titleEn: 'Payment Confirmation & Fee Receipt',
    category: 'receipt',
    subject: 'পেমেন্ট নিশ্চয়তা ও ফি প্রাপ্তি স্বীকার - উদ্ভিদবিজ্ঞান অ্যালামনাই',
    template: `প্রিয় {name},

উদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশন সদস্য নিবন্ধনে আপনার জমা দেওয়া আবেদন (ফরম নং: {formNo}) ও সদস্যপদ ফি ৳{amount} সফলভাবে গৃহীত হয়েছে।

আপনার ডিজিটাল সদস্যপদ কার্ড ও পেমেন্ট রসিদ ওয়েবসাইট থেকে সরাসরি ডাউনলোড করতে পারবেন।

ধন্যবাদান্তে,
উদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশন
জগন্নাথ বিশ্ববিদ্যালয়, ঢাকা।`,
  },
  {
    id: 'notice_preset',
    titleBn: 'জরুরি বিশেষ নোটিশ ইমেইল',
    titleEn: 'Urgent Special Notice Email',
    category: 'notice',
    subject: 'জরুরি নোটিশ - উদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশন',
    template: `প্রিয় {name},

উদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশন (জগন্নাথ বিশ্ববিদ্যালয়)-এর সদস্যবৃন্দের অবগতির জন্য জানানো যাচ্ছে যে,

[এখানে আপনার বিশেষ নোটিশ বা সভার তারিখ ও বিবরণ লিখুন]

আপনার সক্রিয় উপস্থিতি ও সর্বাত্মক সহযোগিতা একান্ত কাম্য।

ধন্যবাদান্তে,
উদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশন সেল`,
  },
];

export function formatCustomEmail(
  rawTemplate: string,
  vars: {
    name?: string;
    formNo?: string;
    email?: string;
    phone?: string;
    amount?: string;
    batch?: string;
  }
): string {
  let result = rawTemplate || '';
  result = result.replace(/\{name\}/g, vars.name || 'সম্মানিত সদস্য');
  result = result.replace(/\{formNo\}/g, vars.formNo || 'BOT-2026-0000');
  result = result.replace(/\{email\}/g, vars.email || 'member@example.com');
  result = result.replace(/\{phone\}/g, vars.phone || '01700000000');
  result = result.replace(/\{amount\}/g, vars.amount || '৫০০');
  result = result.replace(/\{batch\}/g, vars.batch || 'জবি ১ম ব্যাচ');
  return result;
}

export async function loadSavedEmailConfig(): Promise<{
  subject: string;
  template: string;
  enabled: boolean;
}> {
  try {
    const docRef = doc(db, 'settings', 'email_config');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      return {
        subject: data.subject || DEFAULT_EMAIL_SUBJECT,
        template: data.template || DEFAULT_EMAIL_TEMPLATE,
        enabled: data.enabled !== false,
      };
    }
  } catch (err) {
    console.warn('Error loading email config from Firestore:', err);
  }
  return {
    subject: DEFAULT_EMAIL_SUBJECT,
    template: DEFAULT_EMAIL_TEMPLATE,
    enabled: true,
  };
}

export async function saveEmailFullConfig(subject: string, template: string, enabled: boolean): Promise<boolean> {
  try {
    const docRef = doc(db, 'settings', 'email_config');
    await setDoc(
      docRef,
      {
        subject,
        template,
        enabled,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    return true;
  } catch (err) {
    console.error('Error saving email config to Firestore:', err);
    throw err;
  }
}
