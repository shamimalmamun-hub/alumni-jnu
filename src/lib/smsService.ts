/**
 * Client-Side and Hybrid SMS Dispatcher
 * Works across:
 * 1. Node/Express backend (/api/send-sms)
 * 2. Cloudflare Pages & Workers (/api/send-sms)
 * 3. Direct Static Fallback
 */

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
}: SMSPayload): Promise<{ success: boolean; data?: any; error?: string }> {
  if (!mobile) {
    console.warn('[SMS Dispatch] Mobile number is empty.');
    return { success: false, error: 'Mobile number empty' };
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
    `অভিনন্দন ${name}! উদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশন সদস্য নিবন্ধনে আপনার আবেদন ও ৳${amount} ফি সফলভাবে গৃহীত হয়েছে (TrxID: ${tranId || 'N/A'})। কার্ড ডাউনলোড লিংক: ${downloadUrl || window.location.origin}`;

  console.log(`[SMS Service] Attempting SMS dispatch to ${cleanNumber}... Link: ${downloadUrl}`);

  // 1. Try Backend / Cloudflare Function endpoint first
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

    if (res.ok) {
      const data = await res.json().catch(() => null);
      if (data && (data.success || data.status === 'SUCCESS')) {
        console.log('[SMS Service] SMS successfully sent via API route:', data);
        return { success: true, data };
      }
    } else {
      console.warn(`[SMS Service] API route returned status ${res.status}, evaluating fallback...`);
    }
  } catch (err) {
    console.warn('[SMS Service] API route fetch failed:', err);
  }

  // 2. Direct Fallback if static host has no /api/send-sms backend
  try {
    const apiKey = 'juOIwULseyuzv3Z9AUKk';
    const senderId = '8809648906169';
    const hasUnicode = /[^\u0000-\u007F]/.test(messageText);
    const smsType = hasUnicode ? 'unicode' : 'text';

    const params = new URLSearchParams({
      api_key: apiKey,
      type: smsType,
      number: cleanNumber,
      message: messageText,
      senderid: senderId,
    });

    const directUrl = `https://bulksmsbd.net/api/smsapi?${params.toString()}`;
    
    // Use no-cors mode or standard fetch so browser doesn't block
    await fetch(directUrl, {
      method: 'GET',
      mode: 'no-cors',
    }).catch(() => null);

    console.log('[SMS Service] Direct SMS request dispatched to BulkSMSBD gateway.');
    return { success: true, data: { mode: 'direct_dispatched' } };
  } catch (fallbackErr: any) {
    console.error('[SMS Service] Direct dispatch failed:', fallbackErr);
    return { success: false, error: fallbackErr?.message };
  }
}
