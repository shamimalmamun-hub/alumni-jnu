/**
 * Client-Side and Hybrid SMS Dispatcher
 * Works across:
 * 1. Node/Express backend (/api/send-sms)
 * 2. Cloudflare Pages & Workers (/api/send-sms)
 */

import { isSMSEnabled } from './smsConfig';

export interface SMSPayload {
  mobile: string;
  name?: string;
  amount?: string | number;
  tranId?: string;
  formNo?: string;
  cardUrl?: string;
  message?: string;
}

export async function dispatchPaymentSMS({
  mobile,
  name = 'সদস্য',
  amount = '৫০০',
  tranId = '',
  formNo = '',
  cardUrl = '',
  message,
}: SMSPayload): Promise<{ success: boolean; data?: any; error?: string; disabled?: boolean }> {
  if (!mobile) {
    console.warn('[SMS Dispatch] Mobile number is empty.');
    return { success: false, error: 'Mobile number empty' };
  }

  // Check if SMS dispatch is turned ON or OFF
  const enabled = await isSMSEnabled().catch(() => true);
  if (!enabled) {
    console.log('[SMS Service] Dispatch skipped because SMS service is turned OFF in settings.');
    return {
      success: false,
      disabled: true,
      error: 'এসএমএস সেবা অপশনটি বন্ধ (OFF) রয়েছে। সেটিংসে অন না করা পর্যন্ত মেসেজ পাঠানো হবে না।',
    };
  }

  // Clean and normalize BD number
  const digitsOnly = String(mobile).replace(/[^0-9]/g, '');
  let local = digitsOnly;
  if (digitsOnly.startsWith('880')) local = digitsOnly.slice(2);
  else if (digitsOnly.startsWith('88')) local = digitsOnly.slice(2);
  if (!local.startsWith('0') && local.length === 10) local = `0${local}`;
  const cleanNumber = local.startsWith('0') ? local : `0${local}`;

  // Determine card download URL
  let downloadUrl = cardUrl;
  if (!downloadUrl && typeof window !== 'undefined' && window.location?.origin) {
    const origin = window.location.origin;
    if (formNo) {
      downloadUrl = `${origin}/card/${encodeURIComponent(formNo)}`;
    } else if (tranId) {
      downloadUrl = `${origin}/card/${encodeURIComponent(tranId)}`;
    } else {
      downloadUrl = `${origin}/card/BOTANY-ALUMNI`;
    }
  }

  const messageText =
    message ||
    `অভিনন্দন ${name}! উদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশন সদস্য নিবন্ধনে আপনার আবেদন ও ৳${amount} ফি সফলভাবে গৃহীত হয়েছে (TrxID: ${tranId || 'N/A'})।`;

  console.log(`[SMS Service] Attempting SMS dispatch to ${cleanNumber}... Message: ${messageText}`);

  try {
    const res = await fetch('/api/send-sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mobile: cleanNumber,
        name,
        amount,
        tranId,
        formNo,
        cardUrl: downloadUrl,
        appUrl: typeof window !== 'undefined' ? window.location.origin : '',
        message: messageText,
      }),
    });
    const data = await res.json().catch(() => null);
    if (res.ok && data && (data.success || data.status === 'SUCCESS')) {
      return { success: true, data };
    }
    return { success: false, error: data?.error || `SMS API returned status ${res.status}` };
  } catch (err: any) {
    console.error('[SMS Service] dispatch failed:', err);
    return { success: false, error: err?.message };
  }
}
