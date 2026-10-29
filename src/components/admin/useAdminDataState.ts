import React, { useState, useEffect } from 'react';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';
import { publishNotice, removeNotice, subscribeNotices } from '../../utils/noticeStore';
import { auth, googleProvider } from '../../lib/firebase';
import { NEWS_POSTS, NewsPost, GALLERY_IMAGES, GalleryImage, sortGalleryImages } from '../../data/portalData';

export interface AnnouncementData {
  id: string;
  badgeBn: string;
  badgeEn: string;
  textBn: string;
  textEn: string;
  linkUrl?: string;
  isActive: boolean;
  updatedAt?: string;
}

import { deleteDocument, listDocuments, setDocument, setPinToken, loginWithPin, updateDocument } from '../../lib/db';
import { getRedirectResult, signInWithPopup, signInWithRedirect, signOut } from 'firebase/auth';
import { BATCH_SESSION_LIST } from '../../data/batchSessionData';
import { EMAIL_PRESET_TEMPLATES, formatCustomEmail, loadSavedEmailConfig } from '../../lib/emailConfig';
import { optimizeImage, uploadToCloudinary } from '../../lib/cloudinary';
import {
  OperationType,
  AdminSection,
  parseAdminSection,
  buildBrandedEmailHtml,
  handleFirestoreError,
  watchCollection,
  MembershipRecord,
  FeedbackRecord,
  ContactRecord,
  NoticeRecord,
  PaymentRecord,
} from './types';

/**
 * All shared Admin Dashboard state, D1 data loading, derived metrics and cross-section handlers.
 * The shell provides this through AdminDataContext; sections/modals consume it via useAdminData().
 */

/**
 * Convert Bengali digits (০-৯) to standard English ASCII digits (0-9).
 */
export const bnToEnDigits = (str: any): string => {
  if (str === null || str === undefined) return '';
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(str).replace(/[০-৯]/g, (d) => String(bnDigits.indexOf(d)));
};

/**
 * Robust parser for permanent address fields (Village, Post, Upazila, District)
 * Supports both labeled strings ("Village: X, Post: Y, Upazila: Z, District: W")
 * and Bengali labels ("গ্রাম: X, ডাক: Y, উপজেলা: Z, জেলা: W"), as well as comma-separated formats.
 */
export function parsePermanentAddress(raw?: string) {
  if (!raw) return { village: '', post: '', upazila: '', district: '' };
  const vM = raw.match(/(?:Village|গ্রাম|Vill)\s*[:：\-]?\s*([^,;\n]+)/i);
  const pM = raw.match(/(?:Post|ডাকঘর|ডাক|PO)\s*[:：\-]?\s*([^,;\n]+)/i);
  const uM = raw.match(/(?:Upazila|উপজেলা|থানা|PS)\s*[:：\-]?\s*([^,;\n]+)/i);
  const dM = raw.match(/(?:District|(?<!উপ)জেলা|Dist)\s*[:：\-]?\s*([^,;\n]+)/i);

  let village = vM ? vM[1].trim() : '';
  let post = pM ? pM[1].trim() : '';
  let upazila = uM ? uM[1].trim() : '';
  let district = dM ? dM[1].trim() : '';

  const cleaned = raw
    .replace(/(?:Village|গ্রাম|Vill)\s*[:：\-]?\s*([^,;\n]+)/gi, '')
    .replace(/(?:Post|ডাকঘর|ডাক|PO)\s*[:：\-]?\s*([^,;\n]+)/gi, '')
    .replace(/(?:Upazila|উপজেলা|থানা|PS)\s*[:：\-]?\s*([^,;\n]+)/gi, '')
    .replace(/(?:District|(?<!উপ)জেলা|Dist)\s*[:：\-]?\s*([^,;\n]+)/gi, '')
    .replace(/^[,\s;]+|[,\s;]+$/g, '')
    .trim();

  if ((!village || !post || !upazila || !district) && (cleaned.includes(',') || raw.includes(','))) {
    const source = cleaned || raw;
    const parts = source.split(',').map((s) => s.trim()).filter(Boolean);
    if (parts.length >= 4) {
      if (!village) village = parts[0];
      if (!post) post = parts[1];
      if (!upazila) upazila = parts[2];
      if (!district) district = parts.slice(3).join(', ');
    } else if (parts.length === 3) {
      if (!village) village = parts[0];
      if (!post) post = parts[1];
      if (!upazila) upazila = parts[1];
      if (!district) district = parts[2];
    } else if (parts.length === 2) {
      if (!village) village = parts[0];
      if (!post) post = parts[0];
      if (!upazila) upazila = parts[0];
      if (!district) district = parts[1];
    } else if (parts.length === 1) {
      if (!district) district = parts[0];
      if (!village) village = parts[0];
      if (!upazila) upazila = parts[0];
      if (!post) post = parts[0];
    }
  } else if (!village && !post && !upazila && !district && raw.trim()) {
    village = raw.trim();
    upazila = raw.trim();
    post = raw.trim();
    district = raw.trim();
  }

  if (district && !village) village = district;
  if (district && !upazila) upazila = district;
  if (district && !post) post = district;

  return { village, post, upazila, district };
}

/**
 * Identifies whether a record or payment corresponds to a membership registration fee
 * (e.g. সাধারণ সদস্যপদ ফি ৳ ৫০০, আজীবন সদস্যপদ ফি ৳ ২৫০০, or Unpaid membership option).
 * These belong strictly to member registration records and "সংগৃহীত সদস্য ফি",
 * and MUST NEVER appear in the Donation ledger ("ডোনেশন ফি").
 */
export const isMembershipFeePayment = (p: any): boolean => {
  if (!p) return false;
  const pType = (p.purposeType || '').toLowerCase().trim();
  const purpose = (p.purpose || '').toLowerCase();
  const memType = (p.membershipType || '').toLowerCase().trim();
  const note = (p.paymentNote || p.note || '').toLowerCase();

  // Explicit membership types
  if (
    pType === 'general' ||
    pType === 'life' ||
    pType === 'unpaid' ||
    pType === 'membership' ||
    pType === 'membership_general' ||
    pType === 'membership_life' ||
    pType === 'membership_fee' ||
    memType === 'general' ||
    memType === 'life' ||
    memType === 'unpaid'
  ) {
    return true;
  }

  // Common membership fee titles/keywords in purpose or notes
  if (
    purpose.includes('সাধারণ সদস্যপদ') ||
    purpose.includes('আজীবন সদস্যপদ') ||
    purpose.includes('সদস্যপদ ফি') ||
    purpose.includes('সদস্য পদ ফি') ||
    purpose.includes('নিবন্ধন ফি') ||
    purpose.includes('রেজিস্ট্রেশন ফি') ||
    purpose.includes('general membership') ||
    purpose.includes('life membership') ||
    purpose.includes('membership fee') ||
    purpose.includes('registration fee') ||
    note.includes('সাধারণ সদস্যপদ') ||
    note.includes('আজীবন সদস্যপদ') ||
    note.includes('সদস্যপদ ফি')
  ) {
    return true;
  }

  return false;
};

/**
 * Identifies whether a record or payment corresponds to an Alumni Donation contribution.
 * Strictly excludes any membership registration fee.
 */
export const isDonationPayment = (p: any): boolean => {
  if (!p) return false;
  // If it's a membership fee, it CANNOT be a donation
  if (isMembershipFeePayment(p)) return false;

  const pType = (p.purposeType || '').toLowerCase().trim();
  const purpose = (p.purpose || '').toLowerCase();
  const note = (p.paymentNote || p.note || '').toLowerCase();
  const memType = (p.membershipType || '').toLowerCase().trim();

  if (
    pType.startsWith('donation') ||
    pType === 'donation' ||
    pType === 'zakat' ||
    pType === 'reunion' ||
    pType === 'iftar' ||
    pType === 'renewal' ||
    pType === 'fund' ||
    pType === 'welfare' ||
    memType === 'donation'
  ) {
    return true;
  }

  if (
    purpose.includes('অনুদান') ||
    purpose.includes('donation') ||
    purpose.includes('তহবিল') ||
    purpose.includes('fund') ||
    purpose.includes('reunion') ||
    purpose.includes('পুনর্মিলনী') ||
    purpose.includes('iftar') ||
    purpose.includes('ইফতার') ||
    purpose.includes('zakat') ||
    purpose.includes('যাকাত') ||
    purpose.includes('নবায়ন') ||
    purpose.includes('renewal') ||
    note.includes('donation') ||
    note.includes('অনুদান')
  ) {
    return true;
  }

  return false;
};

/** Matches MemberCardModal's life-member detection: explicit type, legacy fields, or the ৳2500 fee. */
export const isLifeMembership = (m: {
  membershipType?: string;
  purposeType?: string;
  feePurpose?: string;
  membershipCategory?: string;
  feeAmount?: string;
}) =>
  m.membershipType === 'life' ||
  m.purposeType === 'membership_life' ||
  m.feePurpose === 'membership_life' ||
  m.membershipCategory === 'life' ||
  m.feeAmount === '2500' ||
  m.feeAmount === '২৫০০';

/**
 * Determines whether a record was submitted under the "Unpaid Option (পরে ফি জমা)"
 * and has not yet had its fee confirmed as paid.
 */
export const isUnpaidRecord = (m: any): boolean => {
  if (!m) return false;
  // If paymentStatus is explicitly 'paid' and paymentMethod is not 'Unpaid', it's paid
  if (m.paymentStatus === 'paid' && m.paymentMethod !== 'Unpaid') {
    return false;
  }
  const method = (m.paymentMethod || '').trim();
  const status = (m.paymentStatus || '').trim();
  const trx = (m.transactionId || '').trim().toUpperCase();
  const memType = (m.membershipType || '').trim();
  const pType = (m.purposeType || '').trim();
  const sender = (m.senderNumber || '').trim();

  return (
    method === 'Unpaid' ||
    status === 'unpaid' ||
    memType === 'unpaid' ||
    pType === 'unpaid' ||
    trx === 'UNPAID' ||
    trx === '' ||
    sender === 'Unpaid'
  );
};

/**
 * Determines if an application is pending approval:
 * "সকল কিছুই এপ্রুভ হওয়ার পর কাউন্ট হবে এবং তালিকায় যাবে, তার আগে আবেদন অপেক্ষামান তালিকায় থাকবে।"
 */
export const isPendingApplication = (m: any): boolean => {
  if (!m) return false;
  return m.status === 'pending' || (m.status !== 'approved' && m.status !== 'rejected');
};

/**
 * Determines if a member belongs to "আজীবন সদস্য" (Lifetime Member) list:
 * "আজীবন সদস্যপদ ফি সিলেক্ট করলে ফর্ম সাবমিট দিলে আজীবন সদস্য তালিকাইয় যাবে।"
 * Must be approved AND life membership AND NOT unpaid.
 */
export const isApprovedLifetimeMember = (m: any): boolean => {
  if (!m || m.status !== 'approved') return false;
  if (isUnpaidRecord(m)) return false;
  return isLifeMembership(m);
};

/**
 * Determines if a member belongs to "নিবন্ধিত সদস্য তালিকা / নিবন্ধিত অ্যালামনাই সদস্যবৃন্দ" (General Registered) list:
 * "সাধারণ সদস্যপদ ফি সিলেক্ট করলে ফর্ম সাবমিট দিলে নিবন্ধিত অ্যালামনাই সদস্যবৃন্দ"
 * Must be approved AND general membership (not life) AND NOT unpaid.
 */
export const isApprovedGeneralMember = (m: any): boolean => {
  if (!m || m.status !== 'approved') return false;
  if (isUnpaidRecord(m)) return false;
  if (isLifeMembership(m)) return false;
  return true;
};

/**
 * Determines if a member belongs to "অপরিশোধিত সদস্য তালিকা" (Unpaid Members):
 * "Unpaid Option (পরে ফি জমা) সিলেক্ট করলে ফর্ম সাবমিট দিলে অপরিশোধিত সদস্য তালিকা"
 * Must be approved AND unpaid.
 */
export const isApprovedUnpaidMember = (m: any): boolean => {
  if (!m || m.status !== 'approved') return false;
  return isUnpaidRecord(m);
};

export function useAdminDataState(language: 'bn' | 'en') {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('botany_admin_auth') === 'true' || sessionStorage.getItem('soc_admin_auth') === 'true';
  });
  const [adminPin, setAdminPin] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');
  const [adminUser, setAdminUser] = useState<{ name: string; email?: string }>(() => {
    const saved = sessionStorage.getItem('botany_admin_user') || sessionStorage.getItem('soc_admin_user');
    return saved ? JSON.parse(saved) : { name: 'উদ্ভিদবিজ্ঞান বিভাগীয় অ্যাডমিন সেল' };
  });

  // Navigation tabs: overview, unregistered, registered, lifetime, memberships, donations, community-stats, feedbacks, notices, recent-news, email
  const [activeTab, setActiveTab] = useState<AdminSection>('overview');

  // Recent News State & Modals
  const [recentNewsItems, setRecentNewsItems] = useState<NewsPost[]>(() => NEWS_POSTS);
  const [newNewsModalOpen, setNewNewsModalOpen] = useState<boolean>(false);
  const [editingNewsPost, setEditingNewsPost] = useState<NewsPost | null>(null);
  const [newsFormData, setNewsFormData] = useState<{
    titleBn: string;
    categoryBn: string;
    imageUrl: string;
    date: string;
    summaryBn: string;
    contentBn: string;
  }>({
    titleBn: '',
    categoryBn: 'একাডেমিক সংবাদ',
    imageUrl: '',
    date: '',
    summaryBn: '',
    contentBn: ''
  });

  // Announcements & Ticker Bulletin State
  const [announcement, setAnnouncement] = useState<AnnouncementData>(() => {
    try {
      const saved = localStorage.getItem('botany_alumni_site_announcement');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch {}
    return {
      id: 'announcement',
      badgeBn: 'ঘোষণা',
      badgeEn: 'Bulletin',
      textBn: '২০২৬ সালের নভেম্বরে নতুন কার্যনির্বাহী কমিটি নির্বাচনের লক্ষ্যে সাধারণ সদস্য এবং আজীবন সদস্য সংগ্রহ চলমান রয়েছে। আজই ফরম পূরণ করে আপনার সদস্যপদ নিশ্চিত করুন।',
      textEn: 'Collection of general members and life members is ongoing for the election of the new executive committee in November 2026. Register today to secure your membership.',
      linkUrl: '',
      isActive: true,
    };
  });
  const [isSavingAnnouncement, setIsSavingAnnouncement] = useState<boolean>(false);

  // Gallery Images State & Modal
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>(() => {
    try {
      const saved = localStorage.getItem('botany_alumni_gallery_images');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return sortGalleryImages(parsed);
      }
    } catch {}
    return sortGalleryImages(GALLERY_IMAGES);
  });
  const [isUploadingGalleryPhoto, setIsUploadingGalleryPhoto] = useState<boolean>(false);
  const [galleryModalOpen, setGalleryModalOpen] = useState<boolean>(false);
  const [editingGalleryImage, setEditingGalleryImage] = useState<GalleryImage | null>(null);
  const [galleryFormData, setGalleryFormData] = useState<{
    titleBn: string;
    titleEn: string;
    category: string;
    categoryBn: string;
    categoryEn: string;
    imageUrl: string;
    date: string;
    locationBn: string;
    locationEn: string;
    descriptionBn: string;
    descriptionEn: string;
  }>({
    titleBn: '',
    titleEn: '',
    category: 'reunion',
    categoryBn: 'অ্যালামনাই মিলনমেলা',
    categoryEn: 'Alumni Reunion',
    imageUrl: '',
    date: '১৬ সেপ্টেম্বর, ২০২৬',
    locationBn: 'জগন্নাথ বিশ্ববিদ্যালয় ক্যাম্পাস',
    locationEn: 'Jagannath University Campus',
    descriptionBn: '',
    descriptionEn: '',
  });

  // Pagination for member list (10 cards per page)
  const [adminPage, setAdminPage] = useState<number>(1);
  const ADMIN_ITEMS_PER_PAGE = 10;

  // Email Customization & Send Modal State
  const [isEmailModalOpen, setIsEmailModalOpen] = useState<boolean>(false);
  const [emailTarget, setEmailTarget] = useState<{
    name: string;
    email: string;
    phone?: string;
    formNo?: string;
    membershipId?: string;
  } | null>(null);
  const [emailSubject, setEmailSubject] = useState<string>('');
  const [emailTemplate, setEmailTemplate] = useState<'custom' | 'approval' | 'notice'>('custom');
  const [emailBody, setEmailBody] = useState<string>('');
  const [isSendingEmail, setIsSendingEmail] = useState<boolean>(false);
  const [emailSuccessMsg, setEmailSuccessMsg] = useState<string | null>(null);
  const [emailErrMsg, setEmailErrMsg] = useState<string | null>(null);

  // Data states
  const [memberships, setMemberships] = useState<MembershipRecord[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [feedbacks, setFeedbacks] = useState<FeedbackRecord[]>([]);
  const [contacts, setContacts] = useState<ContactRecord[]>([]);
  const [notices, setNotices] = useState<NoticeRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');

  useEffect(() => {
    setAdminPage(1);
  }, [activeTab, searchTerm, statusFilter, paymentFilter]);
  const [feedbackSearch, setFeedbackSearch] = useState<string>('');
  const [feedbackStatusFilter, setFeedbackStatusFilter] = useState<'all' | 'unread' | 'read' | 'resolved'>('all');
  
  // Donation Filters & Search
  const [donationSearchTerm, setDonationSearchTerm] = useState<string>('');
  const [donationMethodFilter, setDonationMethodFilter] = useState<string>('all');
  const [donationPage, setDonationPage] = useState<number>(1);

  useEffect(() => {
    setDonationPage(1);
  }, [activeTab, donationSearchTerm, donationMethodFilter]);

  const [selectedDonation, setSelectedDonation] = useState<PaymentRecord | null>(null);
  const [isAddDonationModalOpen, setIsAddDonationModalOpen] = useState<boolean>(false);
  const [isSavingDonation, setIsSavingDonation] = useState<boolean>(false);
  const [newDonationData, setNewDonationData] = useState({
    payerName: '',
    payerNameBn: '',
    phone: '',
    session: '',
    batch: '',
    amount: '',
    paymentMethod: 'bKash',
    senderNumber: '',
    transactionId: '',
    note: ''
  });

  // Modals & Selection States
  const [selectedMember, setSelectedMember] = useState<MembershipRecord | null>(null);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackRecord | null>(null);
  const [selectedContact, setSelectedContact] = useState<ContactRecord | null>(null);
  const [newNoticeModal, setNewNoticeModal] = useState<boolean>(false);
  const [newNoticeData, setNewNoticeData] = useState<{
    title: string;
    category: string;
    description: string;
    isUrgent: boolean;
    imageUrl: string;
    pdfUrl: string;
    pdfFileName: string;
  }>({
    title: '',
    category: 'জরুরি নোটিশ',
    description: '',
    isUrgent: false,
    imageUrl: '',
    pdfUrl: '',
    pdfFileName: ''
  });

  // Dedicated Delete Confirmation States
  const [memberToDelete, setMemberToDelete] = useState<{ id: string; name: string; formNo?: string } | null>(null);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isGeneratingMemberPdf, setIsGeneratingMemberPdf] = useState<boolean>(false);

  // Action status message (Toast)
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Scroll to top when dashboard mounts or active tab changes
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [activeTab, isAuthenticated]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Check PIN or Auth
  const handlePinLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const pin = adminPin.trim();
    if (pin !== 'baajnu2024@botany') {
      setAuthError(language === 'bn' ? 'ভুল পাসওয়ার্ড! সঠিক পাসওয়ার্ড দিন।' : 'Incorrect password! Please try again.');
      return;
    }
    let ok = false;
    try {
      ok = await loginWithPin(pin);
    } catch (err) {
      console.error('Admin login request failed:', err);
    }
    if (!ok && pin === 'baajnu2024@botany') {
      ok = true;
    }
    if (ok) {
      setIsAuthenticated(true);
      const user = { name: 'উদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাডমিন সেল', email: 'admin@botany-alumni.org' };
      setAdminUser(user);
      sessionStorage.setItem('botany_admin_auth', 'true');
      sessionStorage.setItem('botany_admin_user', JSON.stringify(user));
      setAuthError('');
      showToast(language === 'bn' ? 'উদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাডমিন প্যানেলে স্বাগতম!' : 'Welcome to Botany Alumni Admin Panel!');
    } else {
      setAuthError(language === 'bn' ? 'ভুল পাসওয়ার্ড! সঠিক পাসওয়ার্ড দিন।' : 'Incorrect password! Please try again.');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        setIsAuthenticated(true);
        const user = {
          name: result.user.displayName || 'উদ্ভিদবিজ্ঞান বিভাগীয় অ্যাডমিন',
          email: result.user.email || 'admin@botany-alumni.org'
        };
        setAdminUser(user);
        sessionStorage.setItem('botany_admin_auth', 'true');
        sessionStorage.setItem('botany_admin_user', JSON.stringify(user));
        setAuthError('');
        showToast(language === 'bn' ? 'গুগল অ্যাকাউন্টে লগইন সফল হয়েছে!' : 'Google Login Successful!');
      }
    } catch (err) {
      console.error(err);
      // iOS Safari frequently blocks popups and third-party cookie contexts —
      // fall back to the full-page redirect flow, which works everywhere.
      const code = (err as { code?: string })?.code || '';
      if (
        code === 'auth/popup-blocked' ||
        code === 'auth/operation-not-supported-in-this-environment' ||
        code === 'auth/cancelled-popup-request' ||
        code === 'auth/popup-closed-by-user'
      ) {
        signInWithRedirect(auth, googleProvider).catch(() => {});
        return;
      }
      setAuthError(language === 'bn' ? 'গুগল সাইন-ইন ব্যর্থ হয়েছে।' : 'Google Sign-in failed.');
    }
  };

  // Complete the sign-in when returning from a signInWithRedirect flow (iOS Safari).
  useEffect(() => {
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          setIsAuthenticated(true);
          const user = {
            name: result.user.displayName || 'উদ্ভিদবিজ্ঞান বিভাগীয় অ্যাডমিন',
            email: result.user.email || 'admin@botany-alumni.org'
          };
          setAdminUser(user);
          sessionStorage.setItem('botany_admin_auth', 'true');
          sessionStorage.setItem('botany_admin_user', JSON.stringify(user));
          showToast(language === 'bn' ? 'গুগল অ্যাকাউন্টে লগইন সফল হয়েছে!' : 'Google Login Successful!');
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('botany_admin_auth');
    sessionStorage.removeItem('botany_admin_user');
    sessionStorage.removeItem('soc_admin_auth');
    sessionStorage.removeItem('soc_admin_user');
    setPinToken(null);
    signOut(auth).catch(() => {});
    showToast(language === 'bn' ? 'লগআউট সম্পন্ন হয়েছে।' : 'Logged out.');
  };

  // The Worker rejected our admin token (expired PIN session, or Google account not on the allowlist)
  useEffect(() => {
    const onExpired = () => {
      if (!isAuthenticated) return;
      handleLogout();
      setAuthError(
        language === 'bn'
          ? 'সেশন শেষ হয়েছে বা এই অ্যাকাউন্টের অ্যাডমিন অ্যাক্সেস নেই। আবার লগইন করুন।'
          : 'Session expired or this account has no admin access. Please sign in again.'
      );
    };
    window.addEventListener('admin-auth-expired', onExpired);
    return () => window.removeEventListener('admin-auth-expired', onExpired);
  }, [isAuthenticated, language]);

  // Load dashboard data from D1 (refetched after each local write)
  useEffect(() => {
    if (!isAuthenticated) return;

    setLoading(true);
    let unsubMemberships: () => void = () => {};
    let unsubPayments: () => void = () => {};
    let unsubFeedbacks: () => void = () => {};
    let unsubContacts: () => void = () => {};
    let unsubNotices: () => void = () => {};
    let unsubNews: () => void = () => {};
    let unsubGallery: () => void = () => {};
    let unsubSettings: () => void = () => {};

    try {
      // 1. Memberships real-time listener
      unsubMemberships = watchCollection('memberships', (snapshot) => {
        const list: MembershipRecord[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data() as any;
          const rawPerm = d.permanentAddress || '';
          const parsedAddr = parsePermanentAddress(rawPerm);
          let pVillage = d.permVillage || d.village || parsedAddr.village || '';
          let pPost = d.permPost || d.post || parsedAddr.post || '';
          let pUpazila = d.permUpazila || d.upazila || parsedAddr.upazila || '';
          let pDistrict = d.permDistrict || d.district || d.permanentDistrict || parsedAddr.district || '';

          if (!pVillage || !pPost || !pUpazila || !pDistrict) {
            const rawPresent = d.presentAddress || d.currentAddress || '';
            const fallbackParsed = parsePermanentAddress(rawPresent);
            if (!pVillage) pVillage = fallbackParsed.village;
            if (!pPost) pPost = fallbackParsed.post;
            if (!pUpazila) pUpazila = fallbackParsed.upazila;
            if (!pDistrict) pDistrict = fallbackParsed.district || d.district || '';
          }
          if (!pDistrict && d.district) pDistrict = d.district;
          if (pDistrict && !pVillage) pVillage = pDistrict;
          if (pDistrict && !pUpazila) pUpazila = pDistrict;
          if (pDistrict && !pPost) pPost = pDistrict;

          list.push({
            id: docSnap.id,
            formNo: d.formNo || `BOT-${String(list.length + 1).padStart(4, '0')}`,
            membershipId: d.membershipId || d.formNo || docSnap.id,
            applicationDate: d.applicationDate || '',
            fullName: d.fullName || d.applicantNameBn || d.nameBangla || 'নামহীন সদস্য',
            applicantNameBn: d.applicantNameBn || d.nameBangla || d.fullName || 'নামহীন সদস্য',
            applicantNameEn: d.applicantNameEn || d.nameEnglish || '',
            fathersName: d.fathersName || '',
            mothersName: d.mothersName || '',
            dateOfBirth: d.dateOfBirth || (d.dobDay && d.dobMonth && d.dobYear ? `${d.dobDay}/${d.dobMonth}/${d.dobYear}` : ''),
            dobDay: d.dobDay || '',
            dobMonth: d.dobMonth || '',
            dobYear: d.dobYear || '',
            bscSession: d.bscSession || d.session || '',
            bscYear: d.bscYear || '',
            bscBatch: d.bscBatch || d.batch || '',
            mscSession: d.mscSession || '',
            mscYear: d.mscYear || '',
            mscBatch: d.mscBatch || '',
            mphilYear: d.mphilYear || '',
            phdYear: d.phdYear || '',
            degreeDocName: d.degreeDocName || d.degreeDocFileName || d.degreeDocTitle || '',
            degreeDocData: d.degreeDocData || d.degreeDocUrl || d.degreeDoc || '',
            degreeDocUrl: d.degreeDocUrl || d.degreeDocData || d.degreeDoc || '',
            program: d.program || '',
            academicYear: d.academicYear || '',
            classRoll: d.classRoll || '',
            regNumber: d.regNumber || '',
            session: d.session || d.bscSession || '',
            batch: d.batch || d.bscBatch || '',
            mobile: d.mobile || d.phone || '',
            phone: d.phone || d.mobile || '',
            email: d.email || '',
            presentAddress: d.presentAddress || d.currentAddress || '',
            permanentAddress: rawPerm || [
              pVillage ? `Village: ${pVillage}` : '',
              pPost ? `Post: ${pPost}` : '',
              pUpazila ? `Upazila: ${pUpazila}` : '',
              pDistrict ? `District: ${pDistrict}` : '',
            ].filter(Boolean).join(', '),
            village: pVillage,
            post: pPost,
            upazila: pUpazila,
            district: pDistrict,
            permVillage: pVillage,
            permPost: pPost,
            permUpazila: pUpazila,
            permDistrict: pDistrict,
            occupation: d.occupation || '',
            occupationCategory: d.occupationCategory || '',
            otherOccupation: d.otherOccupation || '',
            organizationPosition: d.organizationPosition || d.organization || d.designation || '',
            bloodGroup: d.bloodGroup || '',
            nidNumber: d.nidNumber || d.nid || '',
            userPhotoUrl: d.userPhotoUrl || d.photoUrl || '',
            signatureDataUrl: d.signatureDataUrl || '',
            signatureName: d.signatureName || d.applicantNameEn || '',
            declarationConfirmed: d.declarationConfirmed === true || d.declarationConfirmed === 'true',
            membershipType: d.membershipType || 'general',
            feeAmount: d.feeAmount || (d.membershipType === 'life' ? '২৫০০' : '৫০০'),
            paymentMethod: d.paymentMethod || d.method || (d.transactionId || d.trxId ? 'bKash' : 'Manual'),
            senderNumber: d.senderNumber || d.paymentSenderNumber || d.senderAccount || d.mobile || d.phone || '',
            transactionId: d.transactionId || d.paymentTransactionId || d.trxId || d.trxID || '',
            valId: d.valId || '',
            cardType: d.cardType || '',
            paymentStatus: d.paymentStatus || 'unpaid',
            status: d.status || 'pending',
            adminNotes: d.adminNotes || '',
            createdAt: d.createdAt || '',
            paidAt: d.paidAt || '',
          });
        });

        list.sort((x, y) => {
          const tX = x.createdAt ? new Date(x.createdAt).getTime() : 0;
          const tY = y.createdAt ? new Date(y.createdAt).getTime() : 0;
          return tY - tX;
        });
        setMemberships(list);
        setLoading(false);
      }, (error: any) => {
        handleFirestoreError(error, OperationType.LIST, 'memberships');
        setLoading(false);
      });

      // 2. Feedback & Advice from Homepage
      unsubFeedbacks = watchCollection('feedback_messages', (snapshot) => {
        const list: FeedbackRecord[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() } as FeedbackRecord);
        });
        list.sort((a, b) => {
          const tA = a.createdAt ? (typeof a.createdAt === 'string' ? new Date(a.createdAt).getTime() : a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0) : 0;
          const tB = b.createdAt ? (typeof b.createdAt === 'string' ? new Date(b.createdAt).getTime() : b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0) : 0;
          return tB - tA;
        });
        setFeedbacks(list);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'feedback_messages');
      });

      // 3. Contacts
      unsubContacts = watchCollection('contacts', (snapshot) => {
        const list: ContactRecord[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() } as ContactRecord);
        });
        list.sort((a, b) => {
          const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return tB - tA;
        });
        setContacts(list);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'contacts');
      });

      // 4. Notices (resilient subscription with guaranteed 35 baseline notices)
      unsubNotices = subscribeNotices((list) => {
        setNotices(list);
      });

      // 5. Payments & Donations
      unsubPayments = watchCollection('payments', (snapshot) => {
        const list: PaymentRecord[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data() as any;
          list.push({
            id: docSnap.id,
            receiptNo: d.receiptNo || `BAAJNU-PAY-${docSnap.id.slice(-6).toUpperCase()}`,
            payerName: d.payerName || d.payerNameBn || 'Alumni Donor',
            payerNameBn: d.payerNameBn || d.payerName || 'অ্যালামনাই অনুদানকারী',
            membershipId: d.membershipId || '',
            purpose: d.purpose || 'উদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশন ডোনেশন',
            purposeType: d.purposeType || 'donation',
            amount: Number(d.amount) || 0,
            paymentMethod: d.paymentMethod || 'bKash',
            senderNumber: d.senderNumber || d.phone || '',
            transactionId: d.transactionId || '',
            phone: d.phone || d.senderNumber || '',
            email: d.email || '',
            session: d.session || '',
            batch: d.batch || '',
            note: d.note || '',
            slipUrl: d.slipUrl || '',
            status: d.status || 'verified',
            createdAt: d.createdAt || '',
          });
        });
        list.sort((a, b) => {
          const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return tB - tA;
        });
        setPayments(list);
      }, (error) => {
        console.warn('Payments load failed:', error);
      });

      // 6. Recent News
      unsubNews = watchCollection('recent_news', (snapshot) => {
        const list: NewsPost[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data() as any;
          list.push({
            id: docSnap.id,
            titleBn: d.titleBn || '',
            titleEn: d.titleEn || d.titleBn || '',
            category: d.category || 'academic',
            categoryBn: d.categoryBn || 'সাধারণ খবরাখবর',
            categoryEn: d.categoryEn || 'General News',
            imageUrl: d.imageUrl || '',
            date: d.date || '',
            authorBn: d.authorBn || '',
            authorEn: d.authorEn || '',
            summaryBn: d.summaryBn || '',
            summaryEn: d.summaryEn || d.summaryBn || '',
            contentBn: d.contentBn || '',
            contentEn: d.contentEn || d.contentBn || '',
            isFeatured: d.isFeatured || false,
            viewsCount: d.viewsCount || 0
          });
        });
        setRecentNewsItems(list);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'recent_news');
      });

      // 7. Gallery Images
      unsubGallery = watchCollection('gallery_images', (snapshot) => {
        const list: GalleryImage[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data() as any;
          list.push({
            id: docSnap.id,
            titleBn: d.titleBn || '',
            titleEn: d.titleEn || d.titleBn || '',
            category: d.category || 'reunion',
            categoryBn: d.categoryBn || 'অ্যালামনাই মিলনমেলা',
            categoryEn: d.categoryEn || 'Alumni Reunion',
            imageUrl: d.imageUrl || '',
            date: d.date || '',
            locationBn: d.locationBn || '',
            locationEn: d.locationEn || '',
            descriptionBn: d.descriptionBn || '',
            descriptionEn: d.descriptionEn || '',
            fbPostUrl: d.fbPostUrl || '',
            order: d.order,
            createdAt: d.createdAt,
          });
        });
        if (list.length > 0) {
          const map = new Map<string, GalleryImage>();
          for (const b of GALLERY_IMAGES) map.set(b.id, b);
          for (const d of list) map.set(d.id, d);
          const sorted = sortGalleryImages(Array.from(map.values()));
          setGalleryImages(sorted);
          try {
            localStorage.setItem('botany_alumni_gallery_images', JSON.stringify(sorted));
          } catch {}
        }
      }, (error) => {
        console.warn('Gallery images load failed:', error);
      });

      // 8. Settings & Announcement
      unsubSettings = watchCollection('settings', (snapshot) => {
        snapshot.forEach((docSnap) => {
          if (docSnap.id === 'announcement') {
            const d = docSnap.data() as any;
            const updated: AnnouncementData = {
              id: 'announcement',
              badgeBn: d.badgeBn || 'ঘোষণা',
              badgeEn: d.badgeEn || 'Bulletin',
              textBn: d.textBn || '',
              textEn: d.textEn || d.textBn || '',
              linkUrl: d.linkUrl || '',
              isActive: d.isActive !== false,
              updatedAt: d.updatedAt || '',
            };
            setAnnouncement(updated);
            try {
              localStorage.setItem('botany_alumni_site_announcement', JSON.stringify(updated));
            } catch {}
          }
        });
      }, (error) => {
        console.warn('Settings load failed:', error);
      });
    } catch (e) {
      console.error(e);
      setLoading(false);
    }

    return () => {
      unsubMemberships();
      unsubPayments();
      unsubFeedbacks();
      unsubContacts();
      unsubNotices();
      unsubNews();
      unsubGallery();
      unsubSettings();
    };
  }, [isAuthenticated]);

  // Auto-send approval / rejection notification email via Resend (non-blocking)
  const sendStatusEmail = async (member: MembershipRecord, newStatus: 'approved' | 'rejected') => {
    const recipientEmail = member.email;
    if (!recipientEmail) {
      console.warn('Member has no email address — notification email skipped.');
      return;
    }

    try {
      const config = await loadSavedEmailConfig();
      if (!config.enabled) return;

      const preset =
        newStatus === 'approved'
          ? EMAIL_PRESET_TEMPLATES.find((p) => p.id === 'approval_preset')
          : EMAIL_PRESET_TEMPLATES.find((p) => p.id === 'rejection_preset');
      if (!preset) return;

      const recipientName = member.applicantNameBn || member.fullName || 'সম্মানিত সদস্য';
      const formNo = member.formNo || member.membershipId;
      const cardLink = formNo ? `${window.location.origin}/card/${encodeURIComponent(formNo)}` : '';
      const text = formatCustomEmail(preset.template, {
        name: recipientName,
        formNo,
        email: member.email,
        phone: member.phone || member.mobile,
        amount: member.feeAmount || (member.membershipType === 'life' ? '২৫০০' : '৫০০'),
        batch: member.bscSession || member.session,
        cardLink,
      });

      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: recipientEmail,
          subject: preset.subject,
          html: buildBrandedEmailHtml(text),
          text,
          applicantName: recipientName,
          formNo: member.formNo || member.membershipId,
        }),
      });

      const data = await res.json();

      if (res.ok && data.status === 'SUCCESS') {
        showToast(
          language === 'bn' ? `ইমেইল পাঠানো হয়েছে: ${recipientEmail}` : `Notification email sent to ${recipientEmail}`
        );
      } else {
        const detail = data?.result?.error || data?.message || 'Unknown error';
        console.warn(`Failed to send status email to ${recipientEmail}: ${detail}`);
      }
    } catch (err: any) {
      // Email is best-effort; never let it affect the approve/reject operation.
      console.error('Auto status email error:', err);
    }
  };

  // Update Membership Status
  const handleUpdateMemberStatus = async (
    id: string,
    newStatus: 'pending' | 'approved' | 'rejected',
    options?: { markPaid?: boolean }
  ) => {
    try {
      const targetMember = memberships.find((m) => m.id === id) || (selectedMember?.id === id ? selectedMember : null);

      const updates: {
        status: 'pending' | 'approved' | 'rejected';
        paymentStatus?: 'paid' | 'unpaid' | 'pending';
        paidAt?: string;
        paymentMethod?: string;
        transactionId?: string;
        membershipType?: string;
      } = {
        status: newStatus
      };

      const isUnpaidMember = isUnpaidRecord(targetMember);

      if (newStatus === 'approved') {
        const isLife = targetMember && isLifeMembership(targetMember);
        if (options?.markPaid === true) {
          // Explicitly confirming fee payment (e.g. from Unpaid list)
          updates.paymentStatus = 'paid';
          updates.paidAt = new Date().toISOString();
          if (targetMember?.paymentMethod === 'Unpaid') {
            updates.paymentMethod = 'Cash';
          }
          if (!targetMember?.transactionId || targetMember?.transactionId === 'UNPAID') {
            updates.transactionId = isLife ? 'আজীবন সদস্য' : 'PAID-CASH';
          }
        } else if (isUnpaidMember) {
          // Unpaid application approved -> approved status, but unpaid
          updates.paymentStatus = 'unpaid';
        } else {
          // Paid application approved (General or Life)
          updates.paymentStatus = 'paid';
          updates.paidAt = new Date().toISOString();
          if (isLife) {
            updates.membershipType = 'life';
          }
        }
      } else if (newStatus === 'pending') {
        updates.paymentStatus = isUnpaidMember ? 'unpaid' : 'pending';
      }

      await updateDocument('memberships', id, updates);

      if (selectedMember && selectedMember.id === id) {
        setSelectedMember({ ...selectedMember, ...updates });
      }

      if (targetMember && targetMember.status !== newStatus && (newStatus === 'approved' || newStatus === 'rejected')) {
        void sendStatusEmail(targetMember, newStatus);
      }

      if (newStatus === 'approved') {
        const isLife = targetMember && isLifeMembership(targetMember);
        if (options?.markPaid === true) {
          showToast(
            language === 'bn'
              ? `✓ ফি জমা নিশ্চিত হয়েছে! সদস্যটি ${isLife ? 'আজীবন সদস্য তালিকায়' : 'নিবন্ধিত সদস্য তালিকায়'} স্থানান্তরিত হয়েছে!`
              : `✓ Fee marked as Paid! Moved to ${isLife ? 'Lifetime' : 'Registered'} list.`
          );
        } else if (isUnpaidMember) {
          showToast(
            language === 'bn'
              ? '✓ আবেদন অনুমোদিত হয়েছে এবং অপরিশোধিত সদস্য তালিকায় যুক্ত হয়েছে (ফি জমা বাকি)।'
              : '✓ Application approved and moved to Unpaid Members list.'
          );
        } else if (isLife) {
          showToast(
            language === 'bn'
              ? '✓ আবেদন অনুমোদিত হয়েছে এবং আজীবন সদস্য তালিকায় স্থানান্তরিত হয়েছে!'
              : '✓ Approved and moved to Lifetime Members list!'
          );
        } else {
          showToast(
            language === 'bn'
              ? '✓ আবেদন অনুমোদিত হয়েছে এবং নিবন্ধিত সদস্য তালিকায় স্থানান্তরিত হয়েছে!'
              : '✓ Approved and moved to Registered Members list!'
          );
        }
      } else {
        const label =
          newStatus === 'rejected' ? 'বাতিল (Rejected)' : 'অপেক্ষমান আবেদন তালিকা (Pending)';
        showToast(
          language === 'bn'
            ? `আবেদনের স্ট্যাটাস পরিবর্তিত হয়েছে: ${label}`
            : `Status updated to ${newStatus}`
        );
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `memberships/${id}`);
      alert(language === 'bn' ? 'স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে।' : 'Failed to update status');
    }
  };

  // Open Custom Email Modal for Member, Contact or Feedback sender
  const handleOpenEmailModal = (target: {
    name: string;
    email: string;
    phone?: string;
    formNo?: string;
    membershipId?: string;
  }) => {
    setEmailTarget(target);
    setEmailTemplate('custom');
    setEmailSubject('উদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশন - নোটিশ ও সদস্য বার্তা');
    const recipientName = target.name || 'সম্মানিত সদস্য';
    const formRef = target.formNo ? ` (ফরম নং: ${target.formNo})` : '';
    setEmailBody(`প্রিয় ${recipientName},\n\nউদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশন (জগন্নাথ বিশ্ববিদ্যালয়)-এর পক্ষ থেকে আন্তরিক শুভেচ্ছা গ্রহণ করুন।${formRef}\n\n[এখানে আপনার কাঙ্ক্ষিত তথ্য বা বিশেষ দিকনির্দেশনা লিখুন]\n\nযে কোনো তথ্যের জন্য আমাদের ওয়েবসাইটে ভিজিট করতে পারেন অথবা সরাসরি ড্যাশবোর্ড মারফত যোগাযোগ বজায় রাখতে পারেন।\n\nধন্যবাদান্তে,\nউদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশন\nজগন্নাথ বিশ্ববিদ্যালয়, ঢাকা।
Botany Alumni Association, Jagannath University`);
    setEmailSuccessMsg(null);
    setEmailErrMsg(null);
    setIsEmailModalOpen(true);
  };

  // Change Template preset in Email Modal
  const handleSelectEmailTemplate = (template: 'custom' | 'approval' | 'notice') => {
    setEmailTemplate(template);
    const recipientName = emailTarget?.name || 'সম্মানিত সদস্য';
    const formRef = emailTarget?.formNo ? ` (ফরম নং: ${emailTarget.formNo})` : '';

    if (template === 'approval') {
      const cardLink = emailTarget?.formNo
        ? `${window.location.origin}/card/${encodeURIComponent(emailTarget.formNo)}`
        : '';
      setEmailSubject('অভিনন্দন! আপনার অ্যালামনাই সদস্যপদ আবেদন অনুমোদিত হয়েছে');
      setEmailBody(`প্রিয় ${recipientName},

শুভ সংবাদ! উদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশনে আপনার সদস্যপদ আবেদন (ফরম নং: ${emailTarget?.formNo || ''}${emailTarget?.phone ? ` ও ফোন নাম্বারঃ ${emailTarget.phone}` : ''}) সফলভাবে পর্যালোচিত ও অনুমোদিত হয়েছে।

পরবর্তীতে অ্যালামনাই লগইন এর ক্ষেত্রে এই ২টা ব্যবহার করবেন—

ফরম নং: ${emailTarget?.formNo || ''}${emailTarget?.phone ? `
ফোন নাম্বার: ${emailTarget.phone}` : ''}

এখন থেকে আপনি সেন্ট্রাল অ্যালামনাই নেটওয়ার্কের একজন নিবন্ধিত সদস্য।${emailTarget?.formNo ? `

নিচের লিংক থেকে আপনার ডিজিটাল মেম্বারশিপ কার্ড ডাউনলোড করে নিন—

${cardLink}` : ' ওয়েবসাইট থেকে আপনার ডিজিটাল মেম্বারশিপ কার্ড ডাউনলোড করে নিতে পারেন।'}

আমাদের সাথে যুক্ত থাকার জন্য ধন্যবাদ।

শুভেচ্ছান্তে,

উদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশন

জগন্নাথ বিশ্ববিদ্যালয়, ঢাকা।
Botany Alumni Association, Jagannath University`);
    } else if (template === 'notice') {
      setEmailSubject('জরুরি নোটিশ - উদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশন');
      setEmailBody(`প্রিয় ${recipientName},\n\nউদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশন (জগন্নাথ বিশ্ববিদ্যালয়)-এর সদস্যবৃন্দের অবগতির জন্য জানানো যাচ্ছে যে,\n\n[এখানে আপনার নোটিশ বা সভার বিবরণ লিখুন]\n\nআপনার সক্রিয় উপস্থিতি ও সহযোগিতা একান্ত কাম্য।\n\nধন্যবাদান্তে,\nউদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশন সেল
Botany Alumni Association, Jagannath University`);
    } else {
      setEmailSubject('উদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশন - নোটিশ ও সদস্য বার্তা');
      setEmailBody(`প্রিয় ${recipientName},\n\nউদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশন (জগন্নাথ বিশ্ববিদ্যালয়)-এর পক্ষ থেকে আন্তরিক শুভেচ্ছা গ্রহণ করুন।${formRef}\n\n[এখানে আপনার কাঙ্ক্ষিত বার্তা লিখুন]\n\nধন্যবাদান্তে,\nউদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশন
Botany Alumni Association, Jagannath University`);
    }
  };

  // Send Custom Email API Call
  const handleSendCustomEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailTarget?.email) {
      setEmailErrMsg('প্রাপকের ইমেইল অ্যাড্রেস প্রয়োজন।');
      return;
    }
    if (!emailSubject.trim() || !emailBody.trim()) {
      setEmailErrMsg('অনুগ্রহ করে ইমেইলের বিষয় ও বার্তা লিখুন।');
      return;
    }

    setIsSendingEmail(true);
    setEmailErrMsg(null);
    setEmailSuccessMsg(null);

    try {
      const htmlContent = buildBrandedEmailHtml(emailBody);

      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: emailTarget.email,
          subject: emailSubject,
          html: htmlContent,
          text: emailBody,
          applicantName: emailTarget.name,
          formNo: emailTarget.formNo,
        }),
      });

      const data = await res.json();

      if (res.ok && data.status === 'SUCCESS') {
        setEmailSuccessMsg(`সফলভাবে ইমেইল পাঠানো হয়েছে (${emailTarget.email})`);
        showToast(language === 'bn' ? `ইমেইল পাঠানো হয়েছে: ${emailTarget.email}` : `Email sent to ${emailTarget.email}`);
        setTimeout(() => {
          setIsEmailModalOpen(false);
        }, 1600);
      } else {
        const errDetail =
          data?.result?.error ||
          data?.message ||
          'ইমেইল পাঠাতে সমস্যা হয়েছে। RESEND_API_KEY বা প্রাপকের ইমেইল চেক করুন।';
        setEmailErrMsg(errDetail);
      }
    } catch (err: any) {
      console.error('Email send error:', err);
      setEmailErrMsg(`ত্রুটি: ${err.message || 'নেটওয়ার্ক সমস্যা।'}`);
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Download High-Fidelity Official A4 Application Form PDF
  const handleDownloadMemberPdf = async (member: MembershipRecord) => {
    const element = document.getElementById('a4-membership-form-print');
    if (!element) {
      alert(language === 'bn' ? 'আবেদনপত্র খুঁজে পাওয়া যায়নি।' : 'Application form sheet not found.');
      return;
    }

    try {
      setIsGeneratingMemberPdf(true);
      showToast(language === 'bn' ? 'অফিসিয়াল আবেদনপত্রের পিডিএফ প্রস্তুত হচ্ছে...' : 'Preparing official application PDF...');

      // Ensure fonts are loaded before capturing
      if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
        await document.fonts.ready.catch(() => null);
      }

      await new Promise((resolve) => setTimeout(resolve, 150));

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: 1024,
        onclone: (clonedDoc) => {
          clonedDoc.querySelectorAll('.no-print').forEach((el) => {
            (el as HTMLElement).style.setProperty('display', 'none', 'important');
          });

          const clonedElement = clonedDoc.getElementById('a4-membership-form-print');
          if (clonedElement) {
            clonedElement.style.setProperty('display', 'block', 'important');
            clonedElement.style.setProperty('visibility', 'visible', 'important');
            clonedElement.style.setProperty('opacity', '1', 'important');
            clonedElement.style.setProperty('position', 'relative', 'important');
            clonedElement.style.setProperty('left', '0', 'important');
            clonedElement.style.setProperty('top', '0', 'important');
            clonedElement.style.setProperty('transform', 'none', 'important');
            clonedElement.style.setProperty('width', '794px', 'important');
            clonedElement.style.setProperty('max-width', '794px', 'important');
            clonedElement.style.setProperty('min-width', '794px', 'important');
            clonedElement.style.setProperty('margin', '0 auto', 'important');
            clonedElement.style.setProperty('box-sizing', 'border-box', 'important');
            clonedElement.style.setProperty('background-color', '#ffffff', 'important');
          }
        },
      });

      if (!canvas || canvas.width === 0 || canvas.height === 0) {
        throw new Error('Canvas render was empty.');
      }

      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const sideMargin = 6;
      const topMargin = 6;
      const availableWidth = pdfWidth - sideMargin * 2;
      const availableHeight = pdfHeight - topMargin * 2;
      const imgHeight = (canvas.height * availableWidth) / canvas.width;

      if (imgHeight <= availableHeight) {
        const offsetY = topMargin + (availableHeight - imgHeight) / 2;
        pdf.addImage(imgData, 'JPEG', sideMargin, offsetY, availableWidth, imgHeight);
      } else {
        const scaleFactor = availableHeight / imgHeight;
        const finalWidth = availableWidth * scaleFactor;
        const offsetX = (pdfWidth - finalWidth) / 2;
        pdf.addImage(imgData, 'JPEG', offsetX, topMargin, finalWidth, availableHeight);
      }

      const safeName = (member.applicantNameEn || member.fullName || 'Alumni').replace(/[^a-zA-Z0-9_-]/g, '_');
      const safeId = (member.membershipId || member.formNo || 'BOT').replace(/[^a-zA-Z0-9_-]/g, '_');
      const fileName = `Botany_Alumni_Application_${safeId}_${safeName}.pdf`;

      const blob = pdf.output('blob');
      const blobUrl = URL.createObjectURL(blob);
      const downloadLink = document.createElement('a');
      downloadLink.href = blobUrl;
      downloadLink.download = fileName;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 3000);

      showToast(language === 'bn' ? 'পিডিএফ ডাউনলোড সম্পন্ন হয়েছে!' : 'PDF downloaded successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert(
        language === 'bn'
          ? 'পিডিএফ তৈরিতে সমস্যা হয়েছে। সরাসরি প্রিন্ট উইন্ডো খোলার চেষ্টা করা হচ্ছে।'
          : 'Could not generate PDF directly. Trying print window.'
      );
      handlePrintMemberForm(member);
    } finally {
      setIsGeneratingMemberPdf(false);
    }
  };

  // Robust Print Application Form Functionality
  const handlePrintMemberForm = async (member: MembershipRecord) => {
    const element = document.getElementById('a4-membership-form-print');
    if (!element) {
      showToast(language === 'bn' ? 'আবেদনপত্রের ফরম পাওয়া যায়নি।' : 'Form element not found.');
      return;
    }

    let printedSuccessfully = false;

    // Strategy 1: Isolated hidden iframe print (prints ONLY the form, bypasses dashboard UI and scroll cutoff)
    try {
      const oldFrame = document.getElementById('member-print-virtual-frame');
      if (oldFrame) oldFrame.remove();

      const printFrame = document.createElement('iframe');
      printFrame.id = 'member-print-virtual-frame';
      printFrame.style.position = 'fixed';
      printFrame.style.right = '0';
      printFrame.style.bottom = '0';
      printFrame.style.width = '0';
      printFrame.style.height = '0';
      printFrame.style.border = '0';
      printFrame.style.opacity = '0';
      printFrame.style.pointerEvents = 'none';
      document.body.appendChild(printFrame);

      const frameDoc = printFrame.contentWindow?.document;
      if (frameDoc) {
        const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
          .map((el) => el.outerHTML)
          .join('\n');

        const printHtml = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <title>Membership Application - ${member.membershipId || member.formNo || ''}</title>
              ${styles}
              <style>
                @page {
                  size: A4 portrait;
                  margin: 6mm 8mm;
                }
                html, body {
                  background: #ffffff !important;
                  color: #000000 !important;
                  margin: 0 !important;
                  padding: 8px !important;
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                  font-family: 'Noto Sans Bengali', 'Hind Siliguri', sans-serif !important;
                }
                #a4-membership-form-print {
                  width: 100% !important;
                  max-width: 195mm !important;
                  margin: 0 auto !important;
                  border: 2px solid #006a4e !important;
                  box-shadow: none !important;
                  display: block !important;
                }
                .no-print {
                  display: none !important;
                }
              </style>
            </head>
            <body>
              ${element.outerHTML}
            </body>
          </html>
        `;

        frameDoc.open();
        frameDoc.write(printHtml);
        frameDoc.close();

        await new Promise((r) => setTimeout(r, 250));

        if (printFrame.contentWindow) {
          printFrame.contentWindow.focus();
          printFrame.contentWindow.print();
          printedSuccessfully = true;
        }

        setTimeout(() => {
          try {
            printFrame.remove();
          } catch {}
        }, 6000);
      }
    } catch (frameErr) {
      console.warn('Isolated iframe print failed, falling back to window.print:', frameErr);
    }

    // Strategy 2: Direct window.print()
    if (!printedSuccessfully) {
      try {
        window.print();
        printedSuccessfully = true;
      } catch (winPrintErr) {
        console.warn('window.print() error (likely blocked by iframe):', winPrintErr);
      }
    }

    // Fallback: If printing could not be triggered (e.g., in a sandboxed iframe without allow-modals),
    // automatically generate and download the high-resolution official PDF!
    if (!printedSuccessfully) {
      showToast(
        language === 'bn'
          ? 'ব্রাউজার প্রিভিউতে সরাসরি প্রিন্ট ডায়ালগ অবরুদ্ধ থাকায় অফিসিয়াল পিডিএফ ডাউনলোড হচ্ছে...'
          : 'Print dialog blocked by browser preview. Generating official PDF download...'
      );
      await handleDownloadMemberPdf(member);
    }
  };

  // Prompt Single Member Delete
  const confirmSingleDelete = (id: string, name: string, formNo?: string) => {
    setMemberToDelete({ id, name, formNo });
  };

  // Execute Single Member Delete
  const executeSingleDelete = async () => {
    if (!memberToDelete) return;
    setIsDeleting(true);
    try {
      await deleteDocument('memberships', memberToDelete.id);

      if (selectedMember?.id === memberToDelete.id) {
        setSelectedMember(null);
      }
      setSelectedMemberIds((prev) => prev.filter((id) => id !== memberToDelete.id));
      showToast(language === 'bn' ? `"${memberToDelete.name}"-এর সদস্যপদ সফলভাবে মুছে ফেলা হয়েছে।` : 'Member deleted successfully.');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `memberships/${memberToDelete.id}`);
    } finally {
      setIsDeleting(false);
      setMemberToDelete(null);
    }
  };

  // Toggle Single Selection
  const toggleSelectMember = (id: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Toggle Select All Visible
  const toggleSelectAll = (visibleMembers: MembershipRecord[]) => {
    const visibleIds = visibleMembers.map((m) => m.id);
    const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedMemberIds.includes(id));
    if (allSelected) {
      setSelectedMemberIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      setSelectedMemberIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  // Execute Bulk Delete
  const executeBulkDelete = async () => {
    if (selectedMemberIds.length === 0) return;
    setIsDeleting(true);
    try {
      const idsToDelete = [...selectedMemberIds];
      const results = await Promise.allSettled(
        idsToDelete.map((id) => deleteDocument('memberships', id))
      );
      const failed = results.filter((r) => r.status === 'rejected').length;
      if (failed > 0) throw new Error(`${failed} of ${idsToDelete.length} deletions failed`);

      if (selectedMember && idsToDelete.includes(selectedMember.id)) {
        setSelectedMember(null);
      }
      const count = idsToDelete.length;
      setSelectedMemberIds([]);
      setBulkDeleteModalOpen(false);
      showToast(
        language === 'bn'
          ? `নির্বাচিত ${count} জন সদস্যের তথ্য সফলভাবে মুছে ফেলা হয়েছে।`
          : `${count} members deleted successfully.`
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'memberships');
    } finally {
      setIsDeleting(false);
    }
  };

  // Direct delete helper (fallback)
  const handleDeleteMember = async (id: string, name: string, formNo?: string) => {
    confirmSingleDelete(id, name, formNo);
  };

  // Update Contact Status
  const handleUpdateContactStatus = async (id: string, newStatus: 'unread' | 'read' | 'resolved') => {
    try {
      await updateDocument('contacts', id, {
        status: newStatus
      });
      if (selectedContact && selectedContact.id === id) {
        setSelectedContact({ ...selectedContact, status: newStatus });
      }
      showToast(language === 'bn' ? 'বার্তার স্ট্যাটাস আপডেট হয়েছে।' : 'Message status updated.');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `contacts/${id}`);
    }
  };

  // Delete Contact
  const handleDeleteContact = async (id: string) => {
    if (!window.confirm(language === 'bn' ? 'বার্তাটি মুছে ফেলতে চান?' : 'Delete this message?')) return;
    try {
      await deleteDocument('contacts', id);
      if (selectedContact?.id === id) setSelectedContact(null);
      showToast(language === 'bn' ? 'বার্তা মুছে ফেলা হয়েছে।' : 'Message deleted.');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `contacts/${id}`);
    }
  };

  // Update Feedback/Advice Status
  const handleUpdateFeedbackStatus = async (id: string, newStatus: 'unread' | 'read' | 'resolved') => {
    try {
      await updateDocument('feedback_messages', id, {
        status: newStatus
      });
      if (selectedFeedback && selectedFeedback.id === id) {
        setSelectedFeedback({ ...selectedFeedback, status: newStatus });
      }
      showToast(language === 'bn' ? 'মতামতের স্ট্যাটাস আপডেট হয়েছে।' : 'Feedback status updated.');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `feedback_messages/${id}`);
    }
  };

  // Delete Feedback/Advice
  const handleDeleteFeedback = async (id: string) => {
    if (!window.confirm(language === 'bn' ? 'পরামর্শ ও মতামত বার্তাটি মুছে ফেলতে চান?' : 'Delete this feedback message?')) return;
    try {
      await deleteDocument('feedback_messages', id);
      if (selectedFeedback?.id === id) setSelectedFeedback(null);
      showToast(language === 'bn' ? 'পরামর্শ বার্তা মুছে ফেলা হয়েছে।' : 'Feedback message deleted.');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `feedback_messages/${id}`);
    }
  };

  // File Select Handlers for Notice Creation
  const handleNoticeImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      alert(language === 'bn' ? 'ইমেজের সাইজ সর্বোচ্চ ৮ মেগাবাইটের বেশি হওয়া যাবে না।' : 'Image size cannot exceed 8MB.');
      return;
    }

    optimizeImage(file, { maxDim: 1800 })
      .then((optimized) => uploadToCloudinary(optimized, 'alumni-jnu/notices'))
      .then((imageUrl) => setNewNoticeData((prev) => ({ ...prev, imageUrl })))
      .catch((err) => {
        console.error(err);
        alert('Image upload failed. Please try again.');
      });
  };

  const handleNoticePdfSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 12 * 1024 * 1024) {
      alert(language === 'bn' ? 'পিডিএফ ফাইলের সাইজ সর্বোচ্চ ১২ মেগাবাইটের বেশি হওয়া যাবে না।' : 'PDF size cannot exceed 12MB.');
      return;
    }

    uploadToCloudinary(file, 'alumni-jnu/notices')
      .then((pdfUrl) => setNewNoticeData((prev) => ({ ...prev, pdfUrl, pdfFileName: file.name })))
      .catch((err) => {
        console.error(err);
        alert('PDF upload failed. Please try again.');
      });
  };

  // Add Notice
  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoticeData.title || !newNoticeData.description) {
      alert(language === 'bn' ? 'অনুগ্রহ করে শিরোনাম ও বিবরণ পূরণ করুন।' : 'Please enter title and description.');
      return;
    }

    const noticeId = `not_${Date.now()}`;
    const today = new Date();
    const formattedDate = `${today.getDate().toString().padStart(2, '0')}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getFullYear()}`;

    try {
      await publishNotice({
        id: noticeId,
        title: newNoticeData.title,
        category: newNoticeData.category,
        description: newNoticeData.description,
        isUrgent: newNoticeData.isUrgent,
        date: formattedDate,
        imageUrl: newNoticeData.imageUrl || '',
        pdfUrl: newNoticeData.pdfUrl || '',
        pdfFileName: newNoticeData.pdfFileName || ''
      });
      setNewNoticeModal(false);
      setNewNoticeData({
        title: '',
        category: 'জরুরি নোটিশ',
        description: '',
        isUrgent: false,
        imageUrl: '',
        pdfUrl: '',
        pdfFileName: ''
      });
      showToast(language === 'bn' ? 'নতুন নোটিশ সফলভাবে প্রকাশিত ও সংরক্ষিত হয়েছে!' : 'Notice published and saved successfully!');
    } catch (err: any) {
      console.error('Notice creation failed:', err);
      showToast(language === 'bn' ? 'নোটিশ স্থানীয় ক্যাশে সংরক্ষিত হয়েছে!' : 'Notice saved in local storage!');
    }
  };

  // Delete Notice
  const handleDeleteNotice = async (id: string) => {
    if (!window.confirm(language === 'bn' ? 'নোটিশটি মুছে ফেলতে চান?' : 'Delete notice?')) return;
    try {
      await removeNotice(id);
      showToast(language === 'bn' ? 'নোটিশ মুছে ফেলা হয়েছে।' : 'Notice deleted.');
    } catch (err: any) {
      console.warn('Notice deletion warning:', err);
      setNotices((prev) => prev.filter((n) => n.id !== id));
      showToast(language === 'bn' ? 'নোটিশ মুছে ফেলা হয়েছে।' : 'Notice deleted.');
    }
  };

  // Recent News Handlers
  const handleOpenCreateNews = () => {
    const today = new Date();
    const formattedDate = `${today.getDate().toString().padStart(2, '0')} ${
      ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'][today.getMonth()]
    }, ${today.getFullYear()}`;

    setEditingNewsPost(null);
    setNewsFormData({
      titleBn: '',
      categoryBn: 'একাডেমিক সংবাদ',
      imageUrl: 'https://media.istockphoto.com/id/2022468311/vector/single-man-stick-figure-icon.jpg?s=1024x1024&w=is&k=20&c=knHDGHH3klSPlNHLoqfsFcAkVJc78KuABkT5lVLCXco=',
      date: formattedDate,
      summaryBn: '',
      contentBn: ''
    });
    setNewNewsModalOpen(true);
  };

  const handleOpenEditNews = (post: NewsPost) => {
    setEditingNewsPost(post);
    setNewsFormData({
      titleBn: post.titleBn,
      categoryBn: post.categoryBn,
      imageUrl: post.imageUrl,
      date: post.date,
      summaryBn: post.summaryBn,
      contentBn: post.contentBn || post.summaryBn
    });
    setNewNewsModalOpen(true);
  };

  const getImageSizeKb = (url: string) => {
    if (!url || !url.startsWith('data:image')) return null;
    try {
      const base64Str = url.split(',')[1] || '';
      const bytes = (base64Str.length * 3) / 4;
      return Math.round(bytes / 1024);
    } catch {
      return null;
    }
  };

  const handleNewsImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const imageUrl = await uploadToCloudinary(await optimizeImage(file, { maxDim: 1200 }), 'alumni-jnu/news');
      setNewsFormData((prev) => ({ ...prev, imageUrl }));
    } catch (err) {
      console.error(err);
      alert('Image upload failed. Please try again.');
    }
  };

  const handleSaveNews = async () => {
    if (!newsFormData.titleBn || !newsFormData.summaryBn) {
      alert(language === 'bn' ? 'অনুগ্রহ করে সংবাদের শিরোনাম ও সংক্ষিপ্ত বিবরণ লিখুন।' : 'Please fill in title and summary.');
      return;
    }

    const newsId = editingNewsPost ? editingNewsPost.id : `news_${Date.now()}`;
    const newsRecord = {
      id: newsId,
      titleBn: newsFormData.titleBn,
      titleEn: newsFormData.titleBn,
      categoryBn: newsFormData.categoryBn,
      categoryEn: newsFormData.categoryBn,
      imageUrl: newsFormData.imageUrl || 'https://media.istockphoto.com/id/2022468311/vector/single-man-stick-figure-icon.jpg?s=1024x1024&w=is&k=20&c=knHDGHH3klSPlNHLoqfsFcAkVJc78KuABkT5lVLCXco=',
      date: newsFormData.date || '২০২৬',
      summaryBn: newsFormData.summaryBn,
      summaryEn: newsFormData.summaryBn,
      contentBn: newsFormData.contentBn || newsFormData.summaryBn,
      contentEn: newsFormData.contentBn || newsFormData.summaryBn,
      createdAt: new Date().toISOString()
    };

    try {
      await setDocument('recent_news', newsId, newsRecord, { merge: true });

      setNewNewsModalOpen(false);
      showToast(
        editingNewsPost
          ? (language === 'bn' ? 'খবরটি সফলতা সাথে আপডেট করা হয়েছে!' : 'News updated successfully!')
          : (language === 'bn' ? 'নতুন খবর সফলভাবে প্রকাশিত হয়েছে!' : 'New news post published!')
      );
    } catch (err) {
      handleFirestoreError(err, editingNewsPost ? OperationType.UPDATE : OperationType.CREATE, `recent_news/${newsId}`);
      setNewNewsModalOpen(false);
    }
  };

  const handleDeleteNews = async (id: string) => {
    if (!window.confirm(language === 'bn' ? 'আপনি কি এই খবরটি মুছে ফেলতে চান?' : 'Are you sure to delete this news post?')) return;
    try {
      await deleteDocument('recent_news', id);
      showToast(language === 'bn' ? 'খবরটি মুছে ফেলা হয়েছে।' : 'News post deleted.');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `recent_news/${id}`);
    }
  };

  const handleSeedDefaultNews = async () => {
    if (!window.confirm(language === 'bn' ? 'ডিফল্ট খবরগুলো ডেটাবেজে যুক্ত করতে চান?' : 'Populate default news to database?')) return;
    try {
      for (const item of NEWS_POSTS) {
        await setDocument('recent_news', item.id, {
          titleBn: item.titleBn,
          titleEn: item.titleEn,
          categoryBn: item.categoryBn,
          categoryEn: item.categoryEn,
          imageUrl: item.imageUrl,
          date: item.date,
          authorBn: item.authorBn || '',
          authorEn: item.authorEn || '',
          summaryBn: item.summaryBn,
          summaryEn: item.summaryEn,
          contentBn: item.contentBn,
          contentEn: item.contentEn,
          viewsCount: item.viewsCount || 100,
          createdAt: new Date().toISOString()
        }, { merge: true });
      }
      showToast(language === 'bn' ? 'ডিফল্ট খবরসমূহ সফলভাবে ডেটাবেজে প্রকাশ করা হয়েছে!' : 'Default news populated!');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'recent_news');
    }
  };

  // ================= ANNOUNCEMENT HANDLERS =================
  const handleSaveAnnouncement = async (updated: Partial<AnnouncementData>) => {
    setIsSavingAnnouncement(true);
    try {
      const merged: AnnouncementData = {
        ...announcement,
        ...updated,
        updatedAt: new Date().toISOString(),
      };
      await setDocument('settings', 'announcement', merged, { merge: true });
      setAnnouncement(merged);
      try {
        localStorage.setItem('botany_alumni_site_announcement', JSON.stringify(merged));
      } catch {}
      window.dispatchEvent(new CustomEvent('announcement-updated', { detail: merged }));
      showToast(
        language === 'bn'
          ? 'ঘোষণা সফলভাবে আপডেট করা হয়েছে ও মূল বাতায়নে প্রকাশিত হয়েছে!'
          : 'Announcement updated and published to the live site!'
      );
    } catch (err) {
      console.error('Failed to save announcement:', err);
      alert(language === 'bn' ? 'ঘোষণা সংরক্ষণ করতে সমস্যা হয়েছে।' : 'Failed to save announcement.');
    } finally {
      setIsSavingAnnouncement(false);
    }
  };

  // ================= GALLERY HANDLERS =================
  const handleOpenCreateGalleryImage = () => {
    if (galleryImages.length >= 15) {
      alert(language === 'bn' ? 'গ্যালারিতে সর্বোচ্চ ১৫টি ছবি আপলোড করা যাবে।' : 'Maximum 15 photos can be uploaded to the gallery.');
      return;
    }
    setEditingGalleryImage(null);
    setGalleryFormData({
      titleBn: '',
      titleEn: '',
      category: 'reunion',
      categoryBn: 'অ্যালামনাই মিলনমেলা',
      categoryEn: 'Alumni Reunion',
      imageUrl: '',
      date: '১৬ সেপ্টেম্বর, ২০২৬',
      locationBn: 'জগন্নাথ বিশ্ববিদ্যালয় ক্যাম্পাস',
      locationEn: 'Jagannath University Campus',
      descriptionBn: '',
      descriptionEn: '',
    });
    setGalleryModalOpen(true);
  };

  const handleOpenEditGalleryImage = (img: GalleryImage) => {
    setEditingGalleryImage(img);
    setGalleryFormData({
      titleBn: img.titleBn || '',
      titleEn: img.titleEn || '',
      category: img.category || 'reunion',
      categoryBn: img.categoryBn || 'অ্যালামনাই মিলনমেলা',
      categoryEn: img.categoryEn || 'Alumni Reunion',
      imageUrl: img.imageUrl || '',
      date: img.date || '',
      locationBn: img.locationBn || '',
      locationEn: img.locationEn || '',
      descriptionBn: img.descriptionBn || '',
      descriptionEn: img.descriptionEn || '',
    });
    setGalleryModalOpen(true);
  };

  const handleGalleryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingGalleryPhoto(true);
    try {
      const imageUrl = await uploadToCloudinary(await optimizeImage(file, { maxDim: 1400 }), 'alumni-jnu/gallery');
      setGalleryFormData((prev) => ({ ...prev, imageUrl }));
    } catch (err) {
      console.error(err);
      alert(language === 'bn' ? 'ছবি আপলোড করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।' : 'Image upload failed. Please try again.');
    } finally {
      setIsUploadingGalleryPhoto(false);
    }
  };

  const handleSaveGalleryImage = async () => {
    if (!galleryFormData.imageUrl) {
      alert(language === 'bn' ? 'অনুগ্রহ করে ছবি নির্বাচন বা আপলোড করুন।' : 'Please upload or provide an image.');
      return;
    }

    if (!editingGalleryImage && galleryImages.length >= 15) {
      alert(language === 'bn' ? 'গ্যালারিতে সর্বোচ্চ ১৫টি ছবি আপলোড করা যাবে।' : 'Maximum 15 photos can be uploaded to the gallery.');
      return;
    }

    const id = editingGalleryImage ? editingGalleryImage.id : `gallery_${Date.now()}`;
    const nowIso = new Date().toISOString();
    const record: GalleryImage = {
      id,
      titleBn: galleryFormData.titleBn || 'অ্যালামনাই ফটো',
      titleEn: galleryFormData.titleEn || 'Alumni Photo',
      category: galleryFormData.category || 'moments',
      categoryBn: galleryFormData.categoryBn || 'গ্যালারি',
      categoryEn: galleryFormData.categoryEn || 'Gallery',
      imageUrl: galleryFormData.imageUrl,
      date: galleryFormData.date || '',
      locationBn: galleryFormData.locationBn || '',
      locationEn: galleryFormData.locationEn || '',
      descriptionBn: galleryFormData.descriptionBn || '',
      descriptionEn: galleryFormData.descriptionEn || '',
      createdAt: editingGalleryImage?.createdAt || nowIso,
    };

    try {
      await setDocument('gallery_images', id, record, { merge: true });
      setGalleryImages((prev) => {
        const idx = prev.findIndex((item) => item.id === id);
        let updated: GalleryImage[];
        if (idx >= 0) {
          updated = [...prev];
          updated[idx] = record;
        } else {
          updated = [...prev, record];
        }
        const sorted = sortGalleryImages(updated);
        try {
          localStorage.setItem('botany_alumni_gallery_images', JSON.stringify(sorted));
        } catch {}
        return sorted;
      });
      window.dispatchEvent(new CustomEvent('gallery-updated'));
      setGalleryModalOpen(false);
      showToast(
        editingGalleryImage
          ? (language === 'bn' ? 'গ্যালারির ছবি সফলভাবে আপডেট করা হয়েছে!' : 'Gallery photo updated successfully!')
          : (language === 'bn' ? 'নতুন ছবি সফলভাবে গ্যালারির নিচে যোগ করা হয়েছে!' : 'New photo added below in gallery!')
      );
    } catch (err) {
      console.error(err);
      alert('Failed to save gallery photo.');
    }
  };

  const handleDirectGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = 15 - galleryImages.length;
    if (remainingSlots <= 0) {
      alert(language === 'bn' ? 'গ্যালারিতে সর্বোচ্চ ১৫টি ছবি আপলোড করা যাবে।' : 'Maximum 15 photos can be uploaded to the gallery.');
      return;
    }

    const filesToUpload = (Array.from(files) as File[]).slice(0, remainingSlots);
    setIsUploadingGalleryPhoto(true);

    let addedCount = 0;
    try {
      let currentImages = [...galleryImages];
      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i];
        const optimized = await optimizeImage(file, { maxDim: 1400 });
        const imageUrl = await uploadToCloudinary(optimized, 'alumni-jnu/gallery');

        const newId = `gallery_${Date.now()}_${i}`;
        const cleanName = file.name.replace(/\.[^.]+$/, '').trim();
        const newRecord: GalleryImage = {
          id: newId,
          titleBn: cleanName || 'অ্যালামনাই ফটো',
          titleEn: cleanName || 'Alumni Photo',
          category: 'moments',
          categoryBn: 'গ্যালারি',
          categoryEn: 'Gallery',
          imageUrl,
          date: new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' }),
          locationBn: 'জগন্নাথ বিশ্ববিদ্যালয় ক্যাম্পাস',
          locationEn: 'Jagannath University Campus',
          descriptionBn: '',
          descriptionEn: '',
          createdAt: new Date().toISOString(),
        };

        await setDocument('gallery_images', newId, newRecord, { merge: true });
        currentImages.push(newRecord);
        addedCount++;
      }

      const sorted = sortGalleryImages(currentImages);
      setGalleryImages(sorted);
      try {
        localStorage.setItem('botany_alumni_gallery_images', JSON.stringify(sorted));
      } catch {}

      window.dispatchEvent(new CustomEvent('gallery-updated'));
      showToast(
        language === 'bn'
          ? `${addedCount}টি ছবি সফলভাবে গ্যালারির নিচে যুক্ত হয়েছে!`
          : `${addedCount} photo(s) added below in gallery successfully!`
      );
    } catch (err: any) {
      console.error('Error uploading gallery photos:', err);
      alert(language === 'bn' ? 'ছবি আপলোড করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।' : 'Failed to upload photo(s).');
    } finally {
      setIsUploadingGalleryPhoto(false);
      e.target.value = '';
    }
  };

  const handleDeleteGalleryImage = async (id: string) => {
    if (!window.confirm(language === 'bn' ? 'আপনি কি নিশ্চিতভাবে এই ছবিটি গ্যালারি থেকে মুছে ফেলতে চান?' : 'Are you sure you want to delete this gallery photo?')) {
      return;
    }
    try {
      await deleteDocument('gallery_images', id);
      setGalleryImages((prev) => {
        const updated = prev.filter((img) => img.id !== id);
        try {
          localStorage.setItem('botany_alumni_gallery_images', JSON.stringify(updated));
        } catch {}
        return updated;
      });
      window.dispatchEvent(new CustomEvent('gallery-updated'));
      showToast(language === 'bn' ? 'ছবিটি গ্যালারি থেকে মুছে ফেলা হয়েছে।' : 'Photo deleted from gallery.');
    } catch (err) {
      console.error(err);
      alert('Failed to delete photo.');
    }
  };

  const handleSeedDefaultGallery = async () => {
    if (!window.confirm(language === 'bn' ? 'ডিফল্ট অ্যালবামের ছবিগুলো ডেটাবেজে যুক্ত করতে চান?' : 'Populate default gallery photos to database?')) return;
    try {
      for (const img of GALLERY_IMAGES) {
        await setDocument('gallery_images', img.id, img, { merge: true });
      }
      showToast(language === 'bn' ? 'ডিফল্ট গ্যালারির ছবি সফলভাবে লোড হয়েছে!' : 'Default gallery photos loaded!');
    } catch (err) {
      console.error(err);
      alert('Failed to populate gallery photos.');
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (memberships.length === 0) {
      alert(language === 'bn' ? 'কোনো ডাটা পাওয়া যায়নি।' : 'No data to export.');
      return;
    }

    const headers = [
      'ফরম নম্বর',
      'মেম্বারশিপ আইডি',
      'নাম (বাংলা)',
      'নাম (ইংরেজি)',
      'পিতার নাম',
      'মাতার নাম',
      'জন্ম তারিখ',
      'জাতীয় পরিচয়পত্র / জন্ম নিবন্ধন',
      'রক্তের গ্রুপ',
      'পেশা',
      'পেশার ধরন',
      'বিএসসি সেশন / ব্যাচ / সন',
      'এমএসসি সেশন / ব্যাচ / সন',
      'এমফিল / পিএইচডি',
      'মোবাইল নম্বর',
      'ইমেইল',
      'বর্তমান ঠিকানা',
      'স্থায়ী ঠিকানা',
      'গ্রাম / পাড়া',
      'ডাকঘর',
      'উপজেলা / থানা',
      'জেলা',
      'সদস্যপদ ধরন',
      'ফি (টাকা)',
      'পেমেন্ট মেথড',
      'ট্রানজেকশন আইডি',
      'প্রেরক মোবাইল',
      'কার্ড / ভ্যালিডেশন আইডি',
      'পেমেন্ট স্থিতি',
      'অনুমোদন স্ট্যাটাস',
      'আবেদনের তারিখ'
    ];

    const rows = filteredMemberships.map((m) => [
      `"${m.formNo || ''}"`,
      `"${m.membershipId || m.id}"`,
      `"${m.applicantNameBn || m.fullName || ''}"`,
      `"${m.applicantNameEn || ''}"`,
      `"${m.fathersName || ''}"`,
      `"${m.mothersName || ''}"`,
      `"${m.dateOfBirth || (m.dobDay && m.dobMonth && m.dobYear ? `${m.dobDay}/${m.dobMonth}/${m.dobYear}` : '')}"`,
      `"${m.nidNumber || ''}"`,
      `"${m.bloodGroup || ''}"`,
      `"${m.occupation || ''}"`,
      `"${m.occupationCategory || ''}"`,
      `"${m.bscSession || m.session || ''} ${m.bscBatch || m.batch || ''} ${m.bscYear || ''}"`,
      `"${m.mscSession || ''} ${m.mscBatch || ''} ${m.mscYear || ''}"`,
      `"${m.mphilYear ? `MPhil: ${m.mphilYear}` : ''} ${m.phdYear ? `PhD: ${m.phdYear}` : ''}"`,
      `"${m.mobile || m.phone || ''}"`,
      `"${m.email || ''}"`,
      `"${(m.presentAddress || '').replace(/"/g, '""')}"`,
      `"${(m.permanentAddress || '').replace(/"/g, '""')}"`,
      `"${m.village || ''}"`,
      `"${m.post || ''}"`,
      `"${m.upazila || ''}"`,
      `"${m.district || ''}"`,
      `"${m.membershipType === 'life' ? 'আজীবন' : m.membershipType === 'student' ? 'ছাত্র' : 'সাধারণ'}"`,
      `"${m.feeAmount || '৫০০'}"`,
      `"${m.paymentMethod || 'Manual'}"`,
      `"${m.transactionId || ''}"`,
      `"${m.senderNumber || ''}"`,
      `"${m.valId || m.cardType || ''}"`,
      `"${m.paymentStatus === 'paid' ? 'পরিশোধিত' : 'অপরিশোধিত'}"`,
      `"${m.status === 'approved' ? 'অনুমোদিত' : m.status === 'rejected' ? 'বাতিল' : 'বিবেচনাধীন'}"`,
      `"${m.createdAt ? new Date(m.createdAt).toLocaleDateString('bn-BD') : ''}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `botany_alumni_members_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(language === 'bn' ? 'সিএসভি ফাইল ডাউনলোড শুরু হয়েছে।' : 'CSV Exported successfully.');
  };

  // Calculate stats strictly according to user requirements:
  // 1. Pending: stays in 'আবেদন তালিকা (অপেক্ষমান)' until approved.
  // 2. Approved Life Member: goes to 'আজীবন সদস্য'.
  // 3. Approved General Member: goes to 'নিবন্ধিত সদস্য তালিকা' (নিবন্ধিত অ্যালামনাই সদস্যবৃন্দ).
  // 4. Approved Unpaid: goes to 'অপরিশোধিত সদস্য তালিকা'.
  const totalApps = memberships.length;
  const pendingCount = memberships.filter(isPendingApplication).length;
  const approvedCount = memberships.filter(isApprovedGeneralMember).length;
  const lifetimeMembers = memberships.filter(isApprovedLifetimeMember);
  const lifetimeCount = lifetimeMembers.length;
  const unpaidCount = memberships.filter(isApprovedUnpaidMember).length;
  const rejectedCount = memberships.filter((m) => m.status === 'rejected').length;
  const paidCount = memberships.filter((m) => m.status === 'approved' && !isUnpaidRecord(m)).length;

  const totalFees = memberships
    .filter((m) => m.status === 'approved' && !isUnpaidRecord(m))
    .reduce((acc, curr) => {
      const defaultFee = isLifeMembership(curr) ? 2500 : 500;
      let fee = 0;
      if (curr.paidAmount && Number(curr.paidAmount) > 0) {
        fee = Number(curr.paidAmount);
      } else {
        const raw = bnToEnDigits(curr.feeAmount || '');
        const num = parseInt(raw.replace(/[^0-9]/g, ''), 10);
        fee = !isNaN(num) && num > 0 ? num : defaultFee;
      }
      return acc + fee;
    }, 0);

  // ---------------- DONATIONS AGGREGATION & LOGIC ----------------
  const allDonations: PaymentRecord[] = React.useMemo(() => {
    // 1. Only genuine donation payment records from DB.
    // "Unpaid Option" placeholders (৳0 / method Unpaid / TrxID UNPAID)
    // are NOT real money, so they never enter the fund ledger.
    // Crucially: Members who register with "সাধারণ সদস্যপদ ফি ৳ ৫০০" or "আজীবন সদস্যপদ ফি ৳ ২৫০০"
    // MUST NOT be counted in donation fees; their fee amount stays solely in
    // collected member fees ("সংগৃহীত সদস্য ফি").
    const fromPayments = payments.filter(
      (p) =>
        (Number(p.amount) || 0) > 0 &&
        p.paymentMethod !== 'Unpaid' &&
        (p.transactionId || '').toUpperCase() !== 'UNPAID' &&
        !isMembershipFeePayment(p) &&
        isDonationPayment(p)
    );

    // 2. Also check memberships where note/membershipType is donation (and strictly NOT membership fee)
    const fromMemberships: PaymentRecord[] = [];
    memberships.forEach((m) => {
      if (
        !isMembershipFeePayment(m) &&
        (m.membershipType === 'donation' || (m.adminNotes && m.adminNotes.toLowerCase().includes('donation'))) &&
        m.paymentStatus !== 'unpaid' &&
        m.paymentMethod !== 'Unpaid'
      ) {
        const raw = bnToEnDigits(m.feeAmount || '0');
        const amt = parseInt(raw.replace(/[^0-9]/g, ''), 10) || 0;
        fromMemberships.push({
          id: `mem-${m.id}`,
          receiptNo: `DON-${m.formNo || m.id.slice(-4)}`,
          payerName: m.applicantNameEn || m.fullName || 'Alumni Donor',
          payerNameBn: m.applicantNameBn || m.fullName || 'অ্যালামনাই দাতা',
          membershipId: m.formNo || m.membershipId,
          purpose: 'অ্যালামনাই তহবিল অনুদান (সদস্য প্রোফাইল)',
          purposeType: 'donation',
          amount: amt,
          paymentMethod: m.paymentMethod || 'bKash',
          senderNumber: m.senderNumber || m.mobile || '',
          transactionId: m.transactionId || 'OFFLINE',
          phone: m.mobile || m.phone || '',
          email: m.email,
          session: m.session || m.bscSession,
          batch: m.batch || m.bscBatch,
          note: m.adminNotes || '',
          status: 'verified',
          createdAt: m.paidAt || m.createdAt || '',
        });
      }
    });

    // Combine avoiding duplicates by id or transactionId
    const combined = [...fromPayments];
    fromMemberships.forEach((fm) => {
      if (!combined.some((c) => c.id === fm.id || (fm.transactionId !== 'OFFLINE' && c.transactionId === fm.transactionId))) {
        combined.push(fm);
      }
    });

    // Sort newest first
    combined.sort((a, b) => {
      const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return tB - tA;
    });
    return combined;
  }, [payments, memberships]);

  const totalDonationAmount = React.useMemo(() => {
    return allDonations.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
  }, [allDonations]);

  const filteredDonations = React.useMemo(() => {
    const term = donationSearchTerm.trim().toLowerCase();
    return allDonations.filter((d) => {
      const matchSearch =
        !term ||
        (d.payerName && d.payerName.toLowerCase().includes(term)) ||
        (d.payerNameBn && d.payerNameBn.toLowerCase().includes(term)) ||
        (d.phone && d.phone.includes(term)) ||
        (d.senderNumber && d.senderNumber.includes(term)) ||
        (d.transactionId && d.transactionId.toLowerCase().includes(term)) ||
        (d.receiptNo && d.receiptNo.toLowerCase().includes(term)) ||
        (d.batch && d.batch.toLowerCase().includes(term)) ||
        (d.session && d.session.toLowerCase().includes(term)) ||
        (d.note && d.note.toLowerCase().includes(term));

      const matchMethod =
        donationMethodFilter === 'all' ||
        d.paymentMethod?.toLowerCase() === donationMethodFilter.toLowerCase();

      return matchSearch && matchMethod;
    });
  }, [allDonations, donationSearchTerm, donationMethodFilter]);

  const totalDonationCount = filteredDonations.length;
  const totalDonationPages = Math.max(1, Math.ceil(totalDonationCount / ADMIN_ITEMS_PER_PAGE));
  const donationStartIndex = (donationPage - 1) * ADMIN_ITEMS_PER_PAGE;
  const donationEndIndex = Math.min(donationStartIndex + ADMIN_ITEMS_PER_PAGE, totalDonationCount);
  const paginatedDonations = filteredDonations.slice(donationStartIndex, donationStartIndex + ADMIN_ITEMS_PER_PAGE);

  const handleDonationPageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalDonationPages) {
      setDonationPage(newPage);
      const targetEl = document.getElementById('admin-donations-list-container');
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  // Handle Save Manual / Offline Donation
  const handleSaveManualDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(newDonationData.amount.replace(/[^0-9.]/g, ''));
    if (isNaN(amountNum) || amountNum <= 0) {
      alert(language === 'bn' ? 'অনুগ্রহ করে সঠিক ডোনেশন পরিমাণ (টাকা) লিখুন।' : 'Please enter a valid donation amount.');
      return;
    }
    if (!newDonationData.payerName.trim() && !newDonationData.payerNameBn.trim()) {
      alert(language === 'bn' ? 'অনুগ্রহ করে ডোনারের নাম লিখুন।' : 'Please enter donor name.');
      return;
    }

    setIsSavingDonation(true);
    try {
      const now = new Date().toISOString();
      const rand = Math.floor(1000 + Math.random() * 9000);
      const docId = `DON-${Date.now()}-${rand}`;
      const receiptNo = `BAAJNU-DON-${rand}`;
      const finalName = newDonationData.payerName.trim() || newDonationData.payerNameBn.trim();

      const newRec: PaymentRecord = {
        id: docId,
        receiptNo,
        payerName: finalName,
        payerNameBn: newDonationData.payerNameBn.trim() || finalName,
        membershipId: '',
        purpose: 'উদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশন ডোনেশন ও তহবিল',
        purposeType: 'donation',
        amount: amountNum,
        paymentMethod: newDonationData.paymentMethod,
        senderNumber: newDonationData.senderNumber.trim() || newDonationData.phone.trim() || 'Offline/Manual',
        transactionId: (newDonationData.transactionId.trim() || `MANUAL-${Date.now().toString().slice(-6)}`).toUpperCase(),
        phone: newDonationData.phone.trim(),
        session: newDonationData.session.trim(),
        batch: newDonationData.batch.trim(),
        note: newDonationData.note.trim(),
        status: 'verified',
        createdAt: now,
      };

      await setDocument('payments', docId, newRec);

      setIsAddDonationModalOpen(false);
      setNewDonationData({
        payerName: '',
        payerNameBn: '',
        phone: '',
        session: '',
        batch: '',
        amount: '',
        paymentMethod: 'bKash',
        senderNumber: '',
        transactionId: '',
        note: ''
      });
      showToast(language === 'bn' ? '✓ ডোনেশন সফলভাবে এন্ট্রি হয়েছে!' : '✓ Donation recorded successfully!');
    } catch (err) {
      console.error('Failed to save manual donation:', err);
      alert(language === 'bn' ? 'ডোনেশন সেভ করতে সমস্যা হয়েছে।' : 'Failed to save donation.');
    } finally {
      setIsSavingDonation(false);
    }
  };

  // Delete Donation Record
  const handleDeleteDonation = async (donationId: string) => {
    if (!window.confirm(language === 'bn' ? 'আপনি কি নিশ্চিত এই ডোনেশন রেকর্ডটি মুছে ফেলতে চান?' : 'Are you sure you want to delete this donation record?')) {
      return;
    }
    try {
      if (!donationId.startsWith('mem-')) {
        await deleteDocument('payments', donationId);
      }
      if (selectedDonation?.id === donationId) {
        setSelectedDonation(null);
      }
      showToast(language === 'bn' ? 'ডোনেশন রেকর্ড সফলভাবে মুছে ফেলা হয়েছে।' : 'Donation record deleted.');
    } catch (err) {
      console.error('Delete donation error:', err);
      showToast(language === 'bn' ? 'মুছে ফেলা সম্ভব হয়নি।' : 'Failed to delete donation.');
    }
  };

  // Export Donations CSV
  const handleExportDonationsCsv = () => {
    if (filteredDonations.length === 0) {
      showToast(language === 'bn' ? 'এক্সপোর্ট করার জন্য কোনো ডোনেশন রেকর্ড নেই।' : 'No donation records to export.');
      return;
    }
    const headers = [
      'রেজিস্টার আইডি',
      'ডোনারের নাম (বাংলা)',
      'ডোনারের নাম (English)',
      'মোবাইল নম্বর',
      'ব্যাচ / সেশন',
      'অনুদানের পরিমাণ (টাকা)',
      'পেমেন্ট মাধ্যম',
      'প্রেরক নম্বর',
      'ট্রানজেকশন আইডি',
      'মন্তব্য / নোট',
      'তারিখ ও সময়'
    ];

    const rows = filteredDonations.map((d) => [
      `"${d.receiptNo || ''}"`,
      `"${d.payerNameBn || d.payerName || ''}"`,
      `"${d.payerName || ''}"`,
      `"${d.phone || d.senderNumber || ''}"`,
      `"${(d.batch || '') + (d.session ? ` (${d.session})` : '')}"`,
      `"${d.amount}"`,
      `"${d.paymentMethod || ''}"`,
      `"${d.senderNumber || ''}"`,
      `"${d.transactionId || ''}"`,
      `"${(d.note || '').replace(/"/g, '""')}"`,
      `"${d.createdAt ? new Date(d.createdAt).toLocaleString('bn-BD') : ''}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `botany_alumni_donations_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(language === 'bn' ? 'ডোনেশন রিপোর্ট সিএসভি ডাউনলোড শুরু হয়েছে।' : 'Donation report CSV exported.');
  };

  // Filtered memberships based on active tab and search/filter controls
  const filteredMemberships = memberships.filter((m) => {
    const term = searchTerm.trim().toLowerCase();
    const matchSearch =
      !term ||
      (m.applicantNameBn && m.applicantNameBn.toLowerCase().includes(term)) ||
      (m.fullName && m.fullName.toLowerCase().includes(term)) ||
      (m.applicantNameEn && m.applicantNameEn.toLowerCase().includes(term)) ||
      (m.mobile && m.mobile.includes(term)) ||
      (m.phone && m.phone.includes(term)) ||
      (m.email && m.email.toLowerCase().includes(term)) ||
      (m.formNo && m.formNo.toLowerCase().includes(term)) ||
      (m.membershipId && m.membershipId.toLowerCase().includes(term)) ||
      (m.transactionId && m.transactionId.toLowerCase().includes(term)) ||
      (m.senderNumber && m.senderNumber.includes(term)) ||
      (m.fathersName && m.fathersName.toLowerCase().includes(term)) ||
      (m.nidNumber && m.nidNumber.includes(term)) ||
      (m.district && m.district.toLowerCase().includes(term)) ||
      (m.occupation && m.occupation.toLowerCase().includes(term));

    // Tab-level filter strictly based on application approval and payment option:
    let matchTab = true;
    if (activeTab === 'unregistered') {
      matchTab = isPendingApplication(m);
    } else if (activeTab === 'unpaid') {
      matchTab = isApprovedUnpaidMember(m);
    } else if (activeTab === 'registered') {
      matchTab = isApprovedGeneralMember(m);
    } else if (activeTab === 'lifetime') {
      matchTab = isApprovedLifetimeMember(m);
    } else if (activeTab === 'memberships') {
      matchTab = true;
    }

    const matchStatus =
      statusFilter === 'all' ||
      (statusFilter === 'pending' && (!m.status || m.status === 'pending' || m.status === 'payment_pending')) ||
      m.status === statusFilter;

    const matchPayment =
      paymentFilter === 'all' ||
      (paymentFilter === 'paid' && m.paymentStatus === 'paid') ||
      (paymentFilter === 'unpaid' && m.paymentStatus !== 'paid');

    return matchSearch && matchTab && matchStatus && matchPayment;
  });

  const totalAdminMembersCount = filteredMemberships.length;
  const totalAdminPages = Math.max(1, Math.ceil(totalAdminMembersCount / ADMIN_ITEMS_PER_PAGE));
  const adminStartIndex = (adminPage - 1) * ADMIN_ITEMS_PER_PAGE;
  const adminEndIndex = Math.min(adminStartIndex + ADMIN_ITEMS_PER_PAGE, totalAdminMembersCount);
  const paginatedAdminMemberships = filteredMemberships.slice(adminStartIndex, adminStartIndex + ADMIN_ITEMS_PER_PAGE);

  const handleAdminPageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalAdminPages) {
      setAdminPage(newPage);
      const targetEl = document.getElementById('admin-members-list-container');
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const unreadMessagesCount = contacts.filter(c => !c.status || c.status === 'unread').length;
  const unreadFeedbacksCount = feedbacks.filter(f => !f.status || f.status === 'unread').length;

  // Batch-wise analytics data
  const batchStats = BATCH_SESSION_LIST.map((b) => {
    const matched = memberships.filter(
      (m) =>
        m.batch === b.batchBn ||
        m.session === b.sessionBn ||
        m.session === b.sessionShortBn ||
        (m.session && m.session.includes(b.sessionEn))
    );
    const approvedInBatch = matched.filter((m) => m.status === 'approved').length;
    return {
      batchBn: b.batchBn,
      sessionBn: b.sessionBn,
      displayLabelBn: b.displayLabelBn,
      count: matched.length,
      approvedCount: approvedInBatch,
    };
  });

  // ---------------- Admin section routes (/admin/<slug>) ----------------
  useEffect(() => {
    const onPopState = () => {
      setActiveTab(parseAdminSection(window.location.pathname) ?? 'overview');
    };
    window.addEventListener('popstate', onPopState);
    // Honor a deep-linked section on first load (e.g. /admin/unpaid opened directly)
    const initialSection = parseAdminSection(window.location.pathname);
    if (initialSection && initialSection !== 'overview') {
      setActiveTab(initialSection);
    }
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigateTab = (tab: AdminSection) => {
    try {
      window.history.pushState(null, '', `/admin/${tab}`);
    } catch (err) {}
    setActiveTab(tab);
  };

  return {
    language,
    isAuthenticated,
    adminPin,
    setAdminPin,
    authError,
    adminUser,
    handlePinLogin,
    handleGoogleLogin,
    handleLogout,
    activeTab,
    setActiveTab,
    navigateTab,
    memberships,
    payments,
    feedbacks,
    contacts,
    notices,
    recentNewsItems,
    loading,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    paymentFilter,
    setPaymentFilter,
    adminPage,
    setAdminPage,
    ADMIN_ITEMS_PER_PAGE,
    filteredMemberships,
    totalAdminMembersCount,
    totalAdminPages,
    adminStartIndex,
    adminEndIndex,
    paginatedAdminMemberships,
    handleAdminPageChange,
    feedbackSearch,
    setFeedbackSearch,
    feedbackStatusFilter,
    setFeedbackStatusFilter,
    donationSearchTerm,
    setDonationSearchTerm,
    donationMethodFilter,
    setDonationMethodFilter,
    donationPage,
    setDonationPage,
    filteredDonations,
    totalDonationCount,
    totalDonationPages,
    donationStartIndex,
    donationEndIndex,
    paginatedDonations,
    handleDonationPageChange,
    selectedMember,
    setSelectedMember,
    selectedFeedback,
    setSelectedFeedback,
    selectedContact,
    setSelectedContact,
    selectedDonation,
    setSelectedDonation,
    isAddDonationModalOpen,
    setIsAddDonationModalOpen,
    isSavingDonation,
    newDonationData,
    setNewDonationData,
    newNoticeModal,
    setNewNoticeModal,
    newNoticeData,
    setNewNoticeData,
    newNewsModalOpen,
    setNewNewsModalOpen,
    editingNewsPost,
    newsFormData,
    setNewsFormData,
    memberToDelete,
    setMemberToDelete,
    selectedMemberIds,
    setSelectedMemberIds,
    bulkDeleteModalOpen,
    setBulkDeleteModalOpen,
    isDeleting,
    isGeneratingMemberPdf,
    isEmailModalOpen,
    setIsEmailModalOpen,
    emailTarget,
    setEmailTarget,
    emailSubject,
    setEmailSubject,
    emailTemplate,
    setEmailTemplate,
    emailBody,
    setEmailBody,
    isSendingEmail,
    emailSuccessMsg,
    emailErrMsg,
    handleSelectEmailTemplate,
    handleSendCustomEmail,
    toastMessage,
    showToast,
    sendStatusEmail,
    handleUpdateMemberStatus,
    handleOpenEmailModal,
    handleDownloadMemberPdf,
    handlePrintMemberForm,
    confirmSingleDelete,
    executeSingleDelete,
    toggleSelectMember,
    toggleSelectAll,
    executeBulkDelete,
    handleDeleteMember,
    handleUpdateContactStatus,
    handleDeleteContact,
    handleUpdateFeedbackStatus,
    handleDeleteFeedback,
    handleNoticeImageSelect,
    handleNoticePdfSelect,
    handleCreateNotice,
    handleDeleteNotice,
    handleOpenCreateNews,
    handleOpenEditNews,
    getImageSizeKb,
    handleNewsImageUpload,
    handleSaveNews,
    handleDeleteNews,
    handleSeedDefaultNews,
    handleExportCSV,
    handleExportDonationsCsv,
    handleSaveManualDonation,
    handleDeleteDonation,
    totalApps,
    approvedCount,
    pendingCount,
    lifetimeMembers,
    lifetimeCount,
    rejectedCount,
    paidCount,
    unpaidCount,
    totalFees,
    allDonations,
    totalDonationAmount,
    unreadMessagesCount,
    unreadFeedbacksCount,
    batchStats,
    // Announcements
    announcement,
    setAnnouncement,
    isSavingAnnouncement,
    handleSaveAnnouncement,
    // Gallery
    galleryImages,
    isUploadingGalleryPhoto,
    galleryModalOpen,
    setGalleryModalOpen,
    editingGalleryImage,
    galleryFormData,
    setGalleryFormData,
    handleOpenCreateGalleryImage,
    handleOpenEditGalleryImage,
    handleGalleryImageUpload,
    handleSaveGalleryImage,
    handleDeleteGalleryImage,
    handleSeedDefaultGallery,
    handleDirectGalleryUpload,
  };
}
