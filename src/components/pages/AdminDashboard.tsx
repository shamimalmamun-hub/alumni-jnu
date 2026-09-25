import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Bell,
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  Filter,
  Download,
  Printer,
  Trash2,
  Eye,
  Plus,
  RefreshCw,
  LogOut,
  Lock,
  ShieldCheck,
  Building2,
  Phone,
  Mail,
  ArrowLeft,
  Calendar,
  DollarSign,
  UserCheck,
  AlertCircle,
  CreditCard,
  MapPin,
  Send,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Briefcase,
  Droplet,
  Check,
  X,
  Sparkles,
  User,
  FileCheck,
  Copy,
  Inbox,
  Info,
  MessageSquareHeart,
  Loader2,
  HeartHandshake,
  Receipt,
  Wallet,
  Upload,
  Award,
  Image as ImageIcon,
  Newspaper,
  SlidersHorizontal
} from 'lucide-react';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';
import { openNoticePdf } from '../../utils/noticePdfGenerator';
import { db, auth, googleProvider } from '../../lib/firebase';
import { NEWS_POSTS, NewsPost } from '../../data/portalData';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { signInWithPopup, signOut } from 'firebase/auth';
import { BATCH_SESSION_LIST } from '../../data/batchSessionData';
import { EmailTemplateSettings } from '../admin/EmailTemplateSettings';
import { CommunityStatsAdminEditor } from '../admin/CommunityStatsAdminEditor';
import { formatCustomSMS, loadSavedSMSTemplate, DEFAULT_SMS_TEMPLATE } from '../../lib/smsConfig';
import { dispatchPaymentSMS } from '../../lib/smsService';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  };
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
    },
    operationType,
    path
  };
  console.error('Firestore Error in Admin Dashboard: ', JSON.stringify(errInfo));
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

interface AdminDashboardProps {
  language: 'bn' | 'en';
  onBackToHome: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  language,
  onBackToHome
}) => {
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
  const [activeTab, setActiveTab] = useState<'overview' | 'unregistered' | 'registered' | 'lifetime' | 'memberships' | 'donations' | 'community-stats' | 'feedbacks' | 'notices' | 'recent-news' | 'email'>('overview');

  // Recent News State & Modals
  const [recentNewsItems, setRecentNewsItems] = useState<NewsPost[]>([]);
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

  // Pagination for member list (10 cards per page)
  const [adminPage, setAdminPage] = useState<number>(1);
  const ADMIN_ITEMS_PER_PAGE = 10;

  // Custom SMS Body Template State
  const [smsCustomTemplate, setSmsCustomTemplate] = useState<string>(DEFAULT_SMS_TEMPLATE);

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
  const [emailTemplate, setEmailTemplate] = useState<'custom' | 'approval' | 'fee_receipt' | 'notice'>('custom');
  const [emailBody, setEmailBody] = useState<string>('');
  const [isSendingEmail, setIsSendingEmail] = useState<boolean>(false);
  const [emailSuccessMsg, setEmailSuccessMsg] = useState<string | null>(null);
  const [emailErrMsg, setEmailErrMsg] = useState<string | null>(null);

  // Load saved SMS body template
  useEffect(() => {
    loadSavedSMSTemplate().then((t) => {
      if (t) setSmsCustomTemplate(t);
    }).catch(() => {});
  }, []);

  // Data states
  const [memberships, setMemberships] = useState<MembershipRecord[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [feedbacks, setFeedbacks] = useState<FeedbackRecord[]>([]);
  const [contacts, setContacts] = useState<ContactRecord[]>([]);
  const [notices, setNotices] = useState<NoticeRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

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
  const handlePinLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const pin = adminPin.trim();
    if (pin === 'baajnu2024@botany') {
      setIsAuthenticated(true);
      const user = { name: 'উদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাডমিন সেল', email: 'admin@botany-alumni.org' };
      setAdminUser(user);
      sessionStorage.setItem('botany_admin_auth', 'true');
      sessionStorage.setItem('botany_admin_user', JSON.stringify(user));
      setAuthError('');
      showToast(language === 'bn' ? 'উদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাডমিন প্যানেলে স্বাগতম!' : 'Welcome to Botany Alumni Admin Panel!');
    } else {
      setAuthError(language === 'bn' ? 'ভুল পাসওয়ার্ড! সঠিক পাসওয়ার্ড দিন।' : 'Incorrect password! Please try again.');
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
      setAuthError(language === 'bn' ? 'গুগল সাইন-ইন ব্যর্থ হয়েছে।' : 'Google Sign-in failed.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('botany_admin_auth');
    sessionStorage.removeItem('botany_admin_user');
    sessionStorage.removeItem('soc_admin_auth');
    sessionStorage.removeItem('soc_admin_user');
    signOut(auth).catch(() => {});
    showToast(language === 'bn' ? 'লগআউট সম্পন্ন হয়েছে।' : 'Logged out.');
  };

  // Real-time data fetch from Firestore
  useEffect(() => {
    if (!isAuthenticated) return;

    setLoading(true);
    let unsubMemberships: () => void = () => {};
    let unsubPayments: () => void = () => {};
    let unsubFeedbacks: () => void = () => {};
    let unsubContacts: () => void = () => {};
    let unsubNotices: () => void = () => {};
    let unsubNews: () => void = () => {};

    try {
      // 1. Memberships
      const memQuery = query(collection(db, 'memberships'));
      unsubMemberships = onSnapshot(memQuery, (snapshot) => {
        const list: MembershipRecord[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data() as any;
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
            permanentAddress: d.permanentAddress || '',
            village: d.village || d.permVillage || '',
            post: d.post || d.permPost || '',
            upazila: d.upazila || d.permUpazila || '',
            district: d.district || d.permDistrict || '',
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
            paymentMethod: d.paymentMethod || 'Manual',
            senderNumber: d.senderNumber || d.mobile || '',
            transactionId: d.transactionId || '',
            valId: d.valId || '',
            cardType: d.cardType || '',
            paymentStatus: d.paymentStatus || 'unpaid',
            status: d.status || 'pending',
            adminNotes: d.adminNotes || '',
            createdAt: d.createdAt || '',
            paidAt: d.paidAt || '',
          });
        });
        // Sort by createdAt desc
        list.sort((a, b) => {
          const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return tB - tA;
        });
        setMemberships(list);
        setLoading(false);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'memberships');
        setLoading(false);
      });

      // 2. Feedback & Advice from Homepage
      const feedQuery = query(collection(db, 'feedback_messages'));
      unsubFeedbacks = onSnapshot(feedQuery, (snapshot) => {
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
      const contQuery = query(collection(db, 'contacts'));
      unsubContacts = onSnapshot(contQuery, (snapshot) => {
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

      // 4. Notices
      const notQuery = query(collection(db, 'notices'));
      unsubNotices = onSnapshot(notQuery, (snapshot) => {
        const list: NoticeRecord[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() } as NoticeRecord);
        });
        list.sort((a, b) => {
          const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return tB - tA;
        });
        setNotices(list);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'notices');
      });

      // 5. Payments & Donations
      const payQuery = query(collection(db, 'payments'));
      unsubPayments = onSnapshot(payQuery, (snapshot) => {
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
        console.warn('Payments listener info:', error);
      });

      // 6. Recent News
      const newsQuery = query(collection(db, 'recent_news'));
      unsubNews = onSnapshot(newsQuery, (snapshot) => {
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
    };
  }, [isAuthenticated]);

  // Update Membership Status
  const handleUpdateMemberStatus = async (id: string, newStatus: 'pending' | 'approved' | 'rejected') => {
    try {
      const targetMember = memberships.find((m) => m.id === id) || (selectedMember?.id === id ? selectedMember : null);

      const updates: {
        status: 'pending' | 'approved' | 'rejected';
        paymentStatus?: 'paid' | 'unpaid';
        paidAt?: string;
        paymentMethod?: string;
        transactionId?: string;
      } = {
        status: newStatus
      };

      if (newStatus === 'approved') {
        updates.paymentStatus = 'paid';
        updates.paidAt = new Date().toISOString();
        if (targetMember?.paymentMethod === 'Unpaid') {
          updates.paymentMethod = 'Cash';
        }
        if (!targetMember?.transactionId || targetMember?.transactionId === 'UNPAID') {
          updates.transactionId = 'PAID-CASH';
        }
      } else if (newStatus === 'pending') {
        updates.paymentStatus = 'unpaid';
      }

      await updateDoc(doc(db, 'memberships', id), updates);

      // Instantly update local state so user sees item transition immediately
      setMemberships((prev) =>
        prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
      );

      if (selectedMember && selectedMember.id === id) {
        setSelectedMember({ ...selectedMember, ...updates });
      }

      if (newStatus === 'approved') {
        showToast(
          language === 'bn'
            ? '✓ সফলভাবে পেমেন্ট Paid নিশ্চিত করা হয়েছে এবং নিবন্ধিত তালিকায় স্থানান্তরিত হয়েছে!'
            : '✓ Member marked as Paid & Approved and moved to Registered List!'
        );

        // Auto-dispatch confirmation SMS with filled form PDF link if mobile exists
        if (targetMember && (targetMember.mobile || targetMember.phone)) {
          const updatedTarget = { ...targetMember, ...updates };
          handleSendCardSMS(updatedTarget).catch((smsErr) => {
            console.warn('Auto SMS dispatch after approval error:', smsErr);
          });
        }
      } else {
        const label =
          newStatus === 'rejected' ? 'বাতিল (Rejected)' : 'বিবেচনাধীন (Unregistered/Pending)';
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

  // Send or Re-send Card & Form PDF Download SMS to Member using Custom Saved Template
  const [sendingSmsId, setSendingSmsId] = useState<string | null>(null);
  const handleSendCardSMS = async (member: MembershipRecord) => {
    const mobileNum = member.mobile || (member as any).phone;
    if (!mobileNum) {
      alert(language === 'bn' ? 'সদস্যের কোনো মোবাইল নম্বর নেই।' : 'No mobile number found for this member.');
      return;
    }
    setSendingSmsId(member.id);
    try {
      const formNo = member.formNo || member.membershipId || member.id || '';
      let origin = window.location.origin;
      if (!origin || origin.includes('localhost')) {
        origin = 'https://ais-pre-trlneysfvgomaastzre5pu-583514143305.asia-east1.run.app';
      }
      const formPdfUrl = formNo
        ? `${origin}/form/${encodeURIComponent(formNo)}`
        : (member.transactionId ? `${origin}/?form=${encodeURIComponent(member.transactionId)}` : `${origin}/membership`);
      const downloadUrl = formNo
        ? `${origin}/card/${encodeURIComponent(formNo)}`
        : (member.transactionId ? `${origin}/?trx=${encodeURIComponent(member.transactionId)}` : `${origin}/members-list`);
      
      // Ensure we have latest saved template
      let currentTemplate = smsCustomTemplate;
      try {
        const fresh = await loadSavedSMSTemplate();
        if (fresh) {
          currentTemplate = fresh;
          setSmsCustomTemplate(fresh);
        }
      } catch {}

      // Format custom body text with member's actual data and filled form PDF link
      const customBody = formatCustomSMS(
        currentTemplate,
        {
          applicantNameBn: member.applicantNameBn,
          applicantNameEn: member.applicantNameEn,
          fullName: member.fullName,
          formNo: member.formNo || member.membershipId || member.id,
          mobile: mobileNum,
          feeAmount: member.feeAmount || (member.membershipType === 'life' ? '2500' : '500'),
          transactionId: member.transactionId,
          batch: member.batch || member.bscBatch || member.mscBatch || member.session,
          cardUrl: downloadUrl,
          formPdfUrl: formPdfUrl,
          id: member.id,
        },
        origin
      );

      const res = await dispatchPaymentSMS({
        mobile: mobileNum,
        name: member.applicantNameBn || member.fullName || member.applicantNameEn || 'সদস্য',
        amount: member.feeAmount || (member.membershipType === 'life' ? '2500' : '500'),
        tranId: member.transactionId || 'Manual',
        formNo: member.formNo || member.id,
        cardUrl: downloadUrl,
        message: customBody,
      });

      if (res.success) {
        showToast(
          language === 'bn'
            ? `${mobileNum} নম্বরে পূরণকৃত ফরমের PDF লিংকসহ অনুমোদনের এসএমএস সফলভাবে পাঠানো হয়েছে!`
            : 'Approval SMS with filled form PDF link sent successfully!'
        );
      } else {
        alert(language === 'bn' ? `এসএমএস পাঠানো যায়নি: ${res.error || 'গেটওয়ে ত্রুটি'}` : `SMS failed: ${res.error}`);
      }
    } catch (e: any) {
      alert(`SMS Error: ${e?.message || 'Error'}`);
    } finally {
      setSendingSmsId(null);
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
    setEmailBody(`প্রিয় ${recipientName},\n\nউদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশন (জগন্নাথ বিশ্ববিদ্যালয়)-এর পক্ষ থেকে আন্তরিক শুভেচ্ছা গ্রহণ করুন।${formRef}\n\n[এখানে আপনার কাঙ্ক্ষিত তথ্য বা বিশেষ দিকনির্দেশনা লিখুন]\n\nযে কোনো তথ্যের জন্য আমাদের ওয়েবসাইটে ভিজিট করতে পারেন অথবা সরাসরি ড্যাশবোর্ড মারফত যোগাযোগ বজায় রাখতে পারেন।\n\nধন্যবাদান্তে,\nউদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশন\nজগন্নাথ বিশ্ববিদ্যালয়, ঢাকা।`);
    setEmailSuccessMsg(null);
    setEmailErrMsg(null);
    setIsEmailModalOpen(true);
  };

  // Change Template preset in Email Modal
  const handleSelectEmailTemplate = (template: 'custom' | 'approval' | 'fee_receipt' | 'notice') => {
    setEmailTemplate(template);
    const recipientName = emailTarget?.name || 'সম্মানিত সদস্য';
    const formRef = emailTarget?.formNo ? ` (ফরম নং: ${emailTarget.formNo})` : '';

    if (template === 'approval') {
      setEmailSubject('অভিনন্দন! আপনার অ্যালামনাই সদস্যপদ আবেদন অনুমোদিত হয়েছে');
      setEmailBody(`প্রিয় ${recipientName},\n\nশুভ সংবাদ! উদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশনে আপনার সদস্যপদ আবেদন${formRef} সফলভাবে পর্যালোচিত ও অনুমোদিত হয়েছে।\n\nএখন থেকে আপনি সেন্ট্রাল অ্যালামনাই নেটওয়ার্কের একজন নিবন্ধিত সদস্য। ওয়েবসাইট থেকে আপনার ডিজিটাল মেম্বারশিপ কার্ড ডাউনলোড করে নিতে পারেন।\n\nআমাদের সাথে যুক্ত থাকার জন্য ধন্যবাদ।\n\nশুভেচ্ছান্তে,\nউদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশন\nজগন্নাথ বিশ্ববিদ্যালয়, ঢাকা।`);
    } else if (template === 'fee_receipt') {
      setEmailSubject('পেমেন্ট নিশ্চয়তা ও ফি প্রাপ্তি স্বীকার - উদ্ভিদবিজ্ঞান অ্যালামনাই');
      setEmailBody(`প্রিয় ${recipientName},\n\nউদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশন সদস্য নিবন্ধনে আপনার জমা দেওয়া আবেদন${formRef} ও সদস্যপদ ফি সফলভাবে গৃহীত হয়েছে।\n\nআপনার ডিজিটাল সদস্যপদ কার্ড ও পেমেন্ট রসিদ ওয়েবসাইট থেকে সরাসরি ডাউনলোড করতে পারবেন।\n\nধন্যবাদান্তে,\nউদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশন\nজগন্নাথ বিশ্ববিদ্যালয়, ঢাকা।`);
    } else if (template === 'notice') {
      setEmailSubject('জরুরি নোটিশ - উদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশন');
      setEmailBody(`প্রিয় ${recipientName},\n\nউদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশন (জগন্নাথ বিশ্ববিদ্যালয়)-এর সদস্যবৃন্দের অবগতির জন্য জানানো যাচ্ছে যে,\n\n[এখানে আপনার নোটিশ বা সভার বিবরণ লিখুন]\n\nআপনার সক্রিয় উপস্থিতি ও সহযোগিতা একান্ত কাম্য।\n\nধন্যবাদান্তে,\nউদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশন সেল`);
    } else {
      setEmailSubject('উদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশন - নোটিশ ও সদস্য বার্তা');
      setEmailBody(`প্রিয় ${recipientName},\n\nউদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশন (জগন্নাথ বিশ্ববিদ্যালয়)-এর পক্ষ থেকে আন্তরিক শুভেচ্ছা গ্রহণ করুন।${formRef}\n\n[এখানে আপনার কাঙ্ক্ষিত বার্তা লিখুন]\n\nধন্যবাদান্তে,\nউদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশন`);
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
      const formattedParagraphs = emailBody
        .split('\n')
        .map((line) => line.trim())
        .map((line) =>
          line
            ? `<p style="margin: 0 0 12px 0; font-size: 14px; color: #374151; line-height: 1.6;">${line
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')}</p>`
            : '<div style="height: 8px;"></div>'
        )
        .join('');

      const htmlContent = `
        <div style="font-family: Arial, Helvetica, sans-serif; max-width: 620px; margin: 0 auto; border: 1px solid #d1d5db; border-radius: 12px; overflow: hidden; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
          <div style="background-color: #006a4e; padding: 24px 20px; text-align: center; border-bottom: 4px solid #fcd34d;">
            <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: bold; letter-spacing: 0.5px;">উদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশন</h1>
            <p style="color: #fcd34d; margin: 6px 0 0 0; font-size: 13px; font-weight: 600;">জগন্নাথ বিশ্ববিদ্যালয়, ঢাকা</p>
          </div>
          <div style="padding: 28px 24px; background-color: #ffffff;">
            ${formattedParagraphs}
          </div>
          <div style="background-color: #f8fafc; padding: 16px 20px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
            <p style="margin: 0 0 4px 0;"><strong>উদ্ভিদবিজ্ঞান বিভাগ, জগন্নাথ বিশ্ববিদ্যালয়</strong></p>
            <p style="margin: 0;">© ${new Date().getFullYear()} Botany Alumni Association, JnU. All Rights Reserved.</p>
          </div>
        </div>
      `;

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
      await deleteDoc(doc(db, 'memberships', memberToDelete.id));
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
      await Promise.all(
        selectedMemberIds.map((id) => deleteDoc(doc(db, 'memberships', id)))
      );
      if (selectedMember && selectedMemberIds.includes(selectedMember.id)) {
        setSelectedMember(null);
      }
      const count = selectedMemberIds.length;
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
      await updateDoc(doc(db, 'contacts', id), {
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
      await deleteDoc(doc(db, 'contacts', id));
      if (selectedContact?.id === id) setSelectedContact(null);
      showToast(language === 'bn' ? 'বার্তা মুছে ফেলা হয়েছে।' : 'Message deleted.');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `contacts/${id}`);
    }
  };

  // Update Feedback/Advice Status
  const handleUpdateFeedbackStatus = async (id: string, newStatus: 'unread' | 'read' | 'resolved') => {
    try {
      await updateDoc(doc(db, 'feedback_messages', id), {
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
      await deleteDoc(doc(db, 'feedback_messages', id));
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

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setNewNoticeData((prev) => ({
          ...prev,
          imageUrl: event.target?.result as string,
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleNoticePdfSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 12 * 1024 * 1024) {
      alert(language === 'bn' ? 'পিডিএফ ফাইলের সাইজ সর্বোচ্চ ১২ মেগাবাইটের বেশি হওয়া যাবে না।' : 'PDF size cannot exceed 12MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setNewNoticeData((prev) => ({
          ...prev,
          pdfUrl: event.target?.result as string,
          pdfFileName: file.name,
        }));
      }
    };
    reader.readAsDataURL(file);
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
      await setDoc(doc(db, 'notices', noticeId), {
        title: newNoticeData.title,
        category: newNoticeData.category,
        description: newNoticeData.description,
        isUrgent: newNoticeData.isUrgent,
        date: formattedDate,
        createdAt: new Date().toISOString(),
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
      showToast(language === 'bn' ? 'নতুন নোটিশ সফলভাবে প্রকাশিত হয়েছে!' : 'Notice published successfully!');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `notices/${noticeId}`);
    }
  };

  // Delete Notice
  const handleDeleteNotice = async (id: string) => {
    if (!window.confirm(language === 'bn' ? 'নোটিশটি মুছে ফেলতে চান?' : 'Delete notice?')) return;
    try {
      await deleteDoc(doc(db, 'notices', id));
      showToast(language === 'bn' ? 'নোটিশ মুছে ফেলা হয়েছে।' : 'Notice deleted.');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `notices/${id}`);
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

  const handleSaveNews = async () => {
    if (!newsFormData.titleBn || !newsFormData.summaryBn) {
      alert(language === 'bn' ? 'অনুগ্রহ করে সংবাদের শিরোনাম ও সংক্ষিপ্ত বিবরণ লিখুন।' : 'Please fill in title and summary.');
      return;
    }

    const newsId = editingNewsPost ? editingNewsPost.id : `news_${Date.now()}`;

    try {
      await setDoc(doc(db, 'recent_news', newsId), {
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
      }, { merge: true });

      setNewNewsModalOpen(false);
      showToast(
        editingNewsPost
          ? (language === 'bn' ? 'খবরটি সফলতা সাথে আপডেট করা হয়েছে!' : 'News updated successfully!')
          : (language === 'bn' ? 'নতুন খবর সফলভাবে প্রকাশিত হয়েছে!' : 'New news post published!')
      );
    } catch (err) {
      handleFirestoreError(err, editingNewsPost ? OperationType.UPDATE : OperationType.CREATE, `recent_news/${newsId}`);
    }
  };

  const handleDeleteNews = async (id: string) => {
    if (!window.confirm(language === 'bn' ? 'আপনি কি এই খবরটি মুছে ফেলতে চান?' : 'Are you sure to delete this news post?')) return;
    try {
      await deleteDoc(doc(db, 'recent_news', id));
      showToast(language === 'bn' ? 'খবরটি মুছে ফেলা হয়েছে।' : 'News post deleted.');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `recent_news/${id}`);
    }
  };

  const handleSeedDefaultNews = async () => {
    if (!window.confirm(language === 'bn' ? 'ডিফল্ট খবরগুলো ডেটাবেজে যুক্ত করতে চান?' : 'Populate default news to database?')) return;
    try {
      for (const item of NEWS_POSTS) {
        await setDoc(doc(db, 'recent_news', item.id), {
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

  // Calculate stats
  const totalApps = memberships.length;
  const approvedCount = memberships.filter(
    (m) => m.status === 'approved' && m.paymentStatus === 'paid' && m.paymentMethod !== 'Unpaid'
  ).length;
  const pendingCount = memberships.filter(
    (m) => m.status !== 'approved' || m.paymentStatus === 'unpaid' || m.paymentMethod === 'Unpaid' || m.paymentStatus !== 'paid'
  ).length;
  const lifetimeMembers = memberships.filter(
    (m) => m.membershipType === 'life' || m.purposeType === 'membership_life' || m.feePurpose === 'membership_life' || m.membershipCategory === 'life'
  );
  const lifetimeCount = lifetimeMembers.length;
  const rejectedCount = memberships.filter((m) => m.status === 'rejected').length;
  const paidCount = memberships.filter((m) => m.paymentStatus === 'paid' && m.paymentMethod !== 'Unpaid').length;

  const totalFees = memberships.reduce((acc, curr) => {
    const raw = curr.feeAmount || '500';
    const num = parseInt(raw.replace(/[^0-9]/g, ''), 10) || 500;
    return acc + num;
  }, 0);

  // ---------------- DONATIONS AGGREGATION & LOGIC ----------------
  const allDonations: PaymentRecord[] = React.useMemo(() => {
    // 1. Extract from payments collection
    const fromPayments = payments.filter((p) => {
      const pType = (p.purposeType || '').toLowerCase();
      const pPurp = (p.purpose || '').toLowerCase();
      return (
        pType === 'donation' ||
        pPurp.includes('donation') ||
        pPurp.includes('অনুদান') ||
        pPurp.includes('ডোনেশন')
      );
    });

    // 2. Also check memberships where note/membershipType is donation
    const fromMemberships: PaymentRecord[] = [];
    memberships.forEach((m) => {
      if (m.membershipType === 'donation' || (m.adminNotes && m.adminNotes.toLowerCase().includes('donation'))) {
        const amt = parseInt((m.feeAmount || '0').replace(/[^0-9]/g, ''), 10) || 0;
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

    // Check localStorage backup
    try {
      const raw = localStorage.getItem('alumni_submitted_payments');
      if (raw) {
        const parsed = JSON.parse(raw);
        parsed.forEach((p: any) => {
          if (
            (p.purposeType === 'donation' || (p.purpose && p.purpose.includes('ডোনেশন'))) &&
            !combined.some((c) => c.id === p.id || (p.transactionId && c.transactionId === p.transactionId))
          ) {
            combined.push({
              id: p.id || `local-${Date.now()}`,
              receiptNo: p.receiptNo || `BAAJNU-DON-${Math.floor(1000 + Math.random() * 9000)}`,
              payerName: p.payerName || 'Anonymous Donor',
              payerNameBn: p.payerNameBn || p.payerName || 'অজ্ঞাতনামা দাতা',
              membershipId: p.membershipId || '',
              purpose: p.purpose || 'অ্যালামনাই অ্যাসোসিয়েশনে ডোনেশন',
              purposeType: 'donation',
              amount: Number(p.amount) || 0,
              paymentMethod: p.paymentMethod || 'bKash',
              senderNumber: p.senderNumber || '',
              transactionId: p.transactionId || '',
              phone: p.phone || '',
              email: p.email || '',
              session: p.session || '',
              batch: p.batch || '',
              note: p.note || '',
              status: p.status || 'verified',
              createdAt: p.createdAt || '',
            });
          }
        });
      }
    } catch {}

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

      // Save to Firestore
      try {
        await setDoc(doc(db, 'payments', docId), newRec);
      } catch (fsErr) {
        console.warn('Firestore donation save fallback:', fsErr);
      }

      // Save to localStorage fallback
      try {
        const raw = localStorage.getItem('alumni_submitted_payments') || '[]';
        const parsed = JSON.parse(raw);
        parsed.unshift(newRec);
        localStorage.setItem('alumni_submitted_payments', JSON.stringify(parsed.slice(0, 100)));
      } catch {}

      // Update state locally for instant UI response
      setPayments((prev) => [newRec, ...prev]);

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
      if (!donationId.startsWith('mem-') && !donationId.startsWith('local-')) {
        await deleteDoc(doc(db, 'payments', donationId));
      }
      setPayments((prev) => prev.filter((p) => p.id !== donationId));
      try {
        const raw = localStorage.getItem('alumni_submitted_payments') || '[]';
        const parsed = JSON.parse(raw).filter((p: any) => p.id !== donationId);
        localStorage.setItem('alumni_submitted_payments', JSON.stringify(parsed));
      } catch {}
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
      'রসিদ নং',
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

    // Tab-level filter: Unregistered vs Registered vs Lifetime
    let matchTab = true;
    if (activeTab === 'unregistered') {
      matchTab = m.status !== 'approved' || m.paymentStatus === 'unpaid' || m.paymentMethod === 'Unpaid' || m.paymentStatus !== 'paid';
    } else if (activeTab === 'registered') {
      matchTab = m.status === 'approved' && m.paymentStatus === 'paid' && m.paymentMethod !== 'Unpaid';
    } else if (activeTab === 'lifetime') {
      matchTab = m.membershipType === 'life' || m.purposeType === 'membership_life' || m.feePurpose === 'membership_life' || m.membershipCategory === 'life';
    }

    const matchStatus =
      activeTab === 'unregistered' || activeTab === 'registered' || activeTab === 'lifetime'
        ? true
        : statusFilter === 'all' ||
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

  // If not authenticated, render Login Screen
  if (!isAuthenticated) {
    return (
      <div className="w-full min-h-screen flex-1 relative text-white py-12 px-4 flex flex-col items-center justify-center font-siliguri overflow-hidden">
        {/* Background Cover Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('/cover.png')` }}
        />
        {/* Deep Emerald / Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#002217]/85 via-[#003828]/80 to-[#001710]/90 backdrop-blur-[1px]" />

        {/* Back to portal button */}
        <div className="relative z-10 w-full max-w-md mb-6 flex justify-start">
          <button
            onClick={onBackToHome}
            className="flex items-center gap-2 text-xs font-bold text-emerald-100 hover:text-white bg-[#002217]/70 hover:bg-[#002217]/90 px-3.5 py-2 rounded-xl transition-all cursor-pointer border border-emerald-400/40 backdrop-blur-md shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{language === 'bn' ? 'মূল বাতায়নে ফিরে যান' : 'Back to Main Portal'}</span>
          </button>
        </div>

        {/* Login Box */}
        <div className="relative z-10 w-full max-w-md bg-[#002a1d]/95 border-2 border-amber-400/70 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 overflow-hidden backdrop-blur-md">
          {/* Top Decorative Banner */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-400 via-emerald-400 to-amber-500" />

          {/* Logo & Title */}
          <div className="text-center space-y-2.5">
            <div className="w-20 h-20 mx-auto flex items-center justify-center bg-white rounded-full p-1 shadow-lg border-2 border-emerald-400/60">
              <img
                src="/jnu_botany_alumni_logo.jpg"
                alt="Botany Alumni Association Logo"
                className="w-full h-full object-contain rounded-full"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://upload.wikimedia.org/wikipedia/en/thumb/2/23/Jagannath_University_Logo.svg/512px-Jagannath_University_Logo.svg.png";
                }}
              />
            </div>

            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl font-black text-white font-serif-bn tracking-wide">
                {language === 'bn' ? 'উদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশন' : 'Botany Alumni Association'}
              </h1>
              <p className="text-sm sm:text-base md:text-lg font-black text-amber-300">
                {language === 'bn' ? 'জগন্নাথ বিশ্ববিদ্যালয়, ঢাকা' : 'Jagannath University, Dhaka'}
              </p>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-800/90 border border-emerald-400/50 text-amber-200 text-xs font-bold shadow-xs">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>{language === 'bn' ? 'কেন্দ্রীয় প্রশাসনিক ড্যাশবোর্ড' : 'Central Admin Dashboard'}</span>
            </div>
          </div>

          {authError && (
            <div className="p-3 rounded-xl bg-red-950/90 border border-red-500/60 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{authError}</span>
            </div>
          )}

          {/* PIN Login Form */}
          <form onSubmit={handlePinLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-emerald-100 flex items-center justify-between">
                <span>{language === 'bn' ? 'অ্যাডমিন পাসওয়ার্ড (Password)' : 'Admin Password'}</span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={adminPin}
                  onChange={(e) => setAdminPin(e.target.value)}
                  placeholder={language === 'bn' ? 'অ্যাডমিন পাসওয়ার্ড লিখুন' : 'Enter Admin Password'}
                  className="w-full bg-[#001d14] border-2 border-emerald-500/60 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/50 transition-all font-mono shadow-inner"
                  autoFocus
                />
                <Lock className="w-4 h-4 text-emerald-400 absolute right-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-500 via-emerald-600 to-[#006a4e] hover:from-amber-400 hover:to-emerald-700 text-white font-extrabold py-3 px-4 rounded-xl shadow-lg transition-all transform active:scale-98 flex items-center justify-center gap-2 cursor-pointer border border-amber-300/60 text-sm"
            >
              <ShieldCheck className="w-4 h-4 text-amber-200" />
              <span>{language === 'bn' ? 'ড্যাশবোর্ডে প্রবেশ করুন' : 'Enter Admin Panel'}</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Authenticated Main Admin Layout
  return (
    <div className="w-full bg-[#f4f7f5] min-h-screen text-gray-800 font-siliguri pb-16">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-[#006a4e] text-white px-4 py-2.5 rounded-xl shadow-2xl border-2 border-amber-400 text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-amber-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Admin Navigation Bar */}
      <header className="w-full bg-[#004d38] text-white border-b-2 border-amber-400 shadow-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Title & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 shrink-0 flex items-center justify-center bg-white rounded-full p-0.5 shadow-sm border border-emerald-400/40">
              <img
                src="/jnu_botany_alumni_logo.jpg"
                alt="Botany Alumni Logo"
                className="w-full h-full object-contain rounded-full"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://upload.wikimedia.org/wikipedia/en/thumb/2/23/Jagannath_University_Logo.svg/512px-Jagannath_University_Logo.svg.png";
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                <h1 className="font-extrabold text-sm sm:text-base md:text-lg text-white font-serif-bn leading-tight whitespace-nowrap">
                  {language === 'bn' ? 'উদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশন, জগন্নাথ বিশ্ববিদ্যালয়' : 'Botany Alumni Association, JnU'}
                </h1>
                <span className="bg-amber-400 text-[#004d38] text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                  ADMIN
                </span>
              </div>
            </div>
          </div>

          {/* Quick Right Actions */}
          <div className="flex items-center flex-wrap gap-2">
            <button
              onClick={() => {
                setRefreshing(true);
                setTimeout(() => setRefreshing(false), 600);
                showToast(language === 'bn' ? 'ডাটা সফলভাবে রিফ্রেশ করা হয়েছে।' : 'Data refreshed.');
              }}
              className="px-3 py-1.5 bg-emerald-800/90 hover:bg-emerald-700 text-emerald-100 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer border border-emerald-600/40"
              title={language === 'bn' ? 'রিফ্রেশ করুন' : 'Refresh'}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{language === 'bn' ? 'রিফ্রেশ' : 'Refresh'}</span>
            </button>

            <button
              onClick={onBackToHome}
              className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-[#004d38] rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'মূল বাতায়ন' : 'Live Website'}</span>
            </button>

            <button
              onClick={handleLogout}
              className="px-3 py-1.5 bg-red-800/90 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer border border-red-600/50"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'লগআউট' : 'Logout'}</span>
            </button>
          </div>
        </div>

      </header>

      {/* Main Container Layout: Left Vertical Sidebar + Right Content Area */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 font-siliguri">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          
          {/* LEFT SIDEBAR NAVIGATION MENU */}
          <aside className="w-full md:w-72 lg:w-80 shrink-0 space-y-2">
            <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-3.5 sm:p-4 space-y-2 overflow-hidden md:sticky md:top-4">
              <div className="px-3 py-2.5 border-b border-gray-100 flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-[#006a4e]" />
                  <span className="text-sm sm:text-base font-black text-gray-900 font-serif-bn uppercase tracking-wide">
                    {language === 'bn' ? 'এডমিন ড্যাশবোর্ড মেনু' : 'Admin Menu'}
                  </span>
                </div>
              </div>

              {/* Vertical Menu Item List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-2">
                {/* 1. Overview */}
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`w-full text-left px-4 py-3 text-sm sm:text-base rounded-xl transition-all flex items-center justify-between gap-3 cursor-pointer ${
                    activeTab === 'overview'
                      ? 'bg-[#006a4e] text-white font-extrabold shadow-sm'
                      : 'text-gray-800 hover:bg-emerald-50 hover:text-[#004d38] font-bold'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <LayoutDashboard className={`w-5 h-5 shrink-0 ${activeTab === 'overview' ? 'text-amber-300' : 'text-emerald-700'}`} />
                    <span className="truncate">{language === 'bn' ? 'সারসংক্ষেপ (Overview)' : 'Overview'}</span>
                  </div>
                </button>

                {/* 2. Unregistered List */}
                <button
                  onClick={() => setActiveTab('unregistered')}
                  className={`w-full text-left px-4 py-3 text-sm sm:text-base rounded-xl transition-all flex items-center justify-between gap-3 cursor-pointer ${
                    activeTab === 'unregistered'
                      ? 'bg-[#006a4e] text-white font-extrabold shadow-sm'
                      : 'text-gray-800 hover:bg-emerald-50 hover:text-[#004d38] font-bold'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Clock className={`w-5 h-5 shrink-0 ${activeTab === 'unregistered' ? 'text-amber-300' : 'text-amber-600'}`} />
                    <span className="truncate">{language === 'bn' ? 'অনিবন্ধিত তালিকা' : 'Unregistered List'}</span>
                  </div>
                  <span
                    className={`text-xs font-black px-2.5 py-0.5 rounded-full font-mono shrink-0 ${
                      activeTab === 'unregistered'
                        ? 'bg-amber-400 text-amber-950'
                        : pendingCount > 0
                        ? 'bg-amber-100 text-amber-900 border border-amber-200'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {pendingCount}
                  </span>
                </button>

                {/* 3. Registered List */}
                <button
                  onClick={() => setActiveTab('registered')}
                  className={`w-full text-left px-4 py-3 text-sm sm:text-base rounded-xl transition-all flex items-center justify-between gap-3 cursor-pointer ${
                    activeTab === 'registered'
                      ? 'bg-[#006a4e] text-white font-extrabold shadow-sm'
                      : 'text-gray-800 hover:bg-emerald-50 hover:text-[#004d38] font-bold'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <CheckCircle2 className={`w-5 h-5 shrink-0 ${activeTab === 'registered' ? 'text-amber-300' : 'text-emerald-600'}`} />
                    <span className="truncate">{language === 'bn' ? 'নিবন্ধিত তালিকা' : 'Registered List'}</span>
                  </div>
                  <span
                    className={`text-xs font-black px-2.5 py-0.5 rounded-full font-mono shrink-0 ${
                      activeTab === 'registered'
                        ? 'bg-emerald-300 text-emerald-950'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {approvedCount}
                  </span>
                </button>

                {/* 4. Lifetime Members */}
                <button
                  onClick={() => setActiveTab('lifetime')}
                  className={`w-full text-left px-4 py-3 text-sm sm:text-base rounded-xl transition-all flex items-center justify-between gap-3 cursor-pointer ${
                    activeTab === 'lifetime'
                      ? 'bg-[#006a4e] text-white font-extrabold shadow-sm'
                      : 'text-gray-800 hover:bg-emerald-50 hover:text-[#004d38] font-bold'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Award className={`w-5 h-5 shrink-0 ${activeTab === 'lifetime' ? 'text-amber-300' : 'text-amber-600'}`} />
                    <span className="truncate">{language === 'bn' ? 'আজীবন সদস্য' : 'Lifetime Members'}</span>
                  </div>
                  <span
                    className={`text-xs font-black px-2.5 py-0.5 rounded-full font-mono shrink-0 ${
                      activeTab === 'lifetime'
                        ? 'bg-amber-400 text-amber-950'
                        : 'bg-amber-100 text-amber-900'
                    }`}
                  >
                    {lifetimeCount}
                  </span>
                </button>

                {/* 5. Donation Fees */}
                <button
                  onClick={() => setActiveTab('donations')}
                  className={`w-full text-left px-4 py-3 text-sm sm:text-base rounded-xl transition-all flex items-center justify-between gap-3 cursor-pointer ${
                    activeTab === 'donations'
                      ? 'bg-[#006a4e] text-white font-extrabold shadow-sm'
                      : 'text-gray-800 hover:bg-emerald-50 hover:text-[#004d38] font-bold'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <HeartHandshake className={`w-5 h-5 shrink-0 ${activeTab === 'donations' ? 'text-amber-300' : 'text-rose-600'}`} />
                    <span className="truncate">{language === 'bn' ? 'ডোনেশন ফি' : 'Donation Fees'}</span>
                  </div>
                  <span
                    className={`text-xs font-black px-2.5 py-0.5 rounded-full font-mono shrink-0 ${
                      activeTab === 'donations'
                        ? 'bg-rose-400 text-rose-950'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    ৳{totalDonationAmount.toLocaleString('bn-BD')}
                  </span>
                </button>

                {/* 6. Recent News */}
                <button
                  onClick={() => setActiveTab('recent-news')}
                  className={`w-full text-left px-4 py-3 text-sm sm:text-base rounded-xl transition-all flex items-center justify-between gap-3 cursor-pointer ${
                    activeTab === 'recent-news'
                      ? 'bg-[#006a4e] text-white font-extrabold shadow-sm'
                      : 'text-gray-800 hover:bg-emerald-50 hover:text-[#004d38] font-bold'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Newspaper className={`w-5 h-5 shrink-0 ${activeTab === 'recent-news' ? 'text-amber-300' : 'text-[#006a4e]'}`} />
                    <span className="truncate">{language === 'bn' ? 'সাম্প্রতিক খবর' : 'Recent News'}</span>
                  </div>
                  <span
                    className={`text-xs font-black px-2.5 py-0.5 rounded-full font-mono shrink-0 ${
                      activeTab === 'recent-news'
                        ? 'bg-amber-400 text-amber-950'
                        : 'bg-blue-100 text-blue-900'
                    }`}
                  >
                    {recentNewsItems.length}
                  </span>
                </button>

                {/* 7. Notices */}
                <button
                  onClick={() => setActiveTab('notices')}
                  className={`w-full text-left px-4 py-3 text-sm sm:text-base rounded-xl transition-all flex items-center justify-between gap-3 cursor-pointer ${
                    activeTab === 'notices'
                      ? 'bg-[#006a4e] text-white font-extrabold shadow-sm'
                      : 'text-gray-800 hover:bg-emerald-50 hover:text-[#004d38] font-bold'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Bell className={`w-5 h-5 shrink-0 ${activeTab === 'notices' ? 'text-amber-300' : 'text-purple-600'}`} />
                    <span className="truncate">{language === 'bn' ? 'নোটিশ ও বিজ্ঞপ্তি' : 'Notices'}</span>
                  </div>
                  <span
                    className={`text-xs font-black px-2.5 py-0.5 rounded-full font-mono shrink-0 ${
                      activeTab === 'notices'
                        ? 'bg-purple-300 text-purple-950'
                        : 'bg-purple-100 text-purple-900'
                    }`}
                  >
                    {notices.length}
                  </span>
                </button>

                {/* 8. Advice & Feedback */}
                <button
                  onClick={() => setActiveTab('feedbacks')}
                  className={`w-full text-left px-4 py-3 text-sm sm:text-base rounded-xl transition-all flex items-center justify-between gap-3 cursor-pointer ${
                    activeTab === 'feedbacks'
                      ? 'bg-[#006a4e] text-white font-extrabold shadow-sm'
                      : 'text-gray-800 hover:bg-emerald-50 hover:text-[#004d38] font-bold'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Inbox className={`w-5 h-5 shrink-0 ${activeTab === 'feedbacks' ? 'text-amber-300' : 'text-amber-600'}`} />
                    <span className="truncate">{language === 'bn' ? 'পরামর্শ ও মতামত' : 'Advice & Feedback'}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 font-mono">
                    <span
                      className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                        activeTab === 'feedbacks'
                          ? 'bg-amber-400 text-amber-950'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {feedbacks.length}
                    </span>
                    {unreadFeedbacksCount > 0 && (
                      <span className="bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                        {unreadFeedbacksCount}
                      </span>
                    )}
                  </div>
                </button>

                {/* 9. Community Stats */}
                <button
                  onClick={() => setActiveTab('community-stats')}
                  className={`w-full text-left px-4 py-3 text-sm sm:text-base rounded-xl transition-all flex items-center justify-between gap-3 cursor-pointer ${
                    activeTab === 'community-stats'
                      ? 'bg-[#006a4e] text-white font-extrabold shadow-sm'
                      : 'text-gray-800 hover:bg-emerald-50 hover:text-[#004d38] font-bold'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Users className={`w-5 h-5 shrink-0 ${activeTab === 'community-stats' ? 'text-amber-300' : 'text-emerald-700'}`} />
                    <span className="truncate">{language === 'bn' ? 'কমিউনিটি পরিসংখ্যান' : 'Community Stats'}</span>
                  </div>
                </button>

                {/* 10. Email Settings */}
                <button
                  onClick={() => setActiveTab('email')}
                  className={`w-full text-left px-4 py-3 text-sm sm:text-base rounded-xl transition-all flex items-center justify-between gap-3 cursor-pointer ${
                    activeTab === 'email'
                      ? 'bg-[#006a4e] text-white font-extrabold shadow-sm'
                      : 'text-gray-800 hover:bg-emerald-50 hover:text-[#004d38] font-bold'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Mail className={`w-5 h-5 shrink-0 ${activeTab === 'email' ? 'text-amber-300' : 'text-blue-600'}`} />
                    <span className="truncate">{language === 'bn' ? 'ইমেইল সেটিংস' : 'Email Settings'}</span>
                  </div>
                  <span className="bg-blue-500 text-white text-xs font-black px-2 py-0.5 rounded-full font-mono shrink-0">
                    EMAIL
                  </span>
                </button>
              </div>
            </div>
          </aside>

          {/* RIGHT MAIN CONTENT AREA */}
          <main className="flex-1 min-w-0 w-full space-y-6">
        
        {/* ================= TAB 1: OVERVIEW ================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Welcome banner */}
            <div className="bg-gradient-to-r from-[#004d38] via-[#006a4e] to-[#003828] text-white p-6 sm:p-7 rounded-2xl shadow-lg border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden">
              {/* Background decorative glow */}
              <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="space-y-2 relative z-10 max-w-3xl">
                <h2 className="text-2xl sm:text-3xl font-black font-serif-bn text-white tracking-wide">
                  {language === 'bn' ? 'অ্যালামনাই ও সদস্যপদ কেন্দ্রীয় ডাটাবেজ' : 'Alumni & Membership Central Control'}
                </h2>
                <p className="text-emerald-100/90 text-xs sm:text-sm font-medium leading-relaxed">
                  {language === 'bn' 
                    ? 'জগন্নাথ বিশ্ববিদ্যালয় উদ্ভিদবিজ্ঞান বিভাগের রেজিস্ট্রেশন, সদস্যপদ অনুমোদন ও তথ্য ব্যবস্থাপনাসমূহ নিয়ন্ত্রণের কেন্দ্রীয় অ্যাডমিন প্যানেল।'
                    : 'Central administration panel for managing registrations, memberships, donations, and notifications.'}
                </p>
              </div>
            </div>

            {/* Metrics cards grid - 3 cards top, 3 cards bottom */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {/* Card 1: Unregistered (Pending) */}
              <div
                onClick={() => setActiveTab('unregistered')}
                className="bg-white p-4 sm:p-5 rounded-2xl border-2 border-amber-400 shadow-md shadow-amber-900/10 hover:shadow-xl hover:shadow-amber-900/15 space-y-2.5 transition-all transform hover:-translate-y-0.5 relative overflow-hidden group cursor-pointer min-w-0"
              >
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 to-amber-500" />
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs sm:text-xs font-black tracking-wide text-amber-950 whitespace-nowrap truncate min-w-0">
                    {language === 'bn' ? 'অনিবন্ধিত সদস্য তালিকা' : 'Unregistered Members'}
                  </span>
                  <div className="p-2 rounded-xl bg-amber-100 text-amber-900 shadow-xs group-hover:scale-105 transition-transform shrink-0">
                    <Clock className="w-4 h-4 stroke-[2.5]" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-amber-950 font-mono tracking-tight drop-shadow-xs">
                  {pendingCount}
                </div>
                <div className="text-[11px] font-extrabold flex items-center justify-between gap-1 pt-2 border-t-2 border-amber-100 whitespace-nowrap">
                  <span className="text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 text-[10px] font-bold truncate shrink-0">
                    {language === 'bn' ? 'যাচাই প্রয়োজন' : 'Needs Verification'}
                  </span>
                  <span className="text-amber-700 font-bold text-[11px] shrink-0">ক্লিক করুন →</span>
                </div>
              </div>

              {/* Card 2: Registered (Approved) */}
              <div
                onClick={() => setActiveTab('registered')}
                className="bg-white p-4 sm:p-5 rounded-2xl border-2 border-emerald-500/40 shadow-md shadow-emerald-900/10 hover:shadow-xl hover:shadow-emerald-900/15 space-y-2.5 transition-all transform hover:-translate-y-0.5 relative overflow-hidden group cursor-pointer min-w-0"
              >
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-600" />
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs sm:text-xs font-black tracking-wide text-emerald-950 whitespace-nowrap truncate min-w-0">
                    {language === 'bn' ? 'নিবন্ধিত সদস্য তালিকা' : 'Registered Members'}
                  </span>
                  <div className="p-2 rounded-xl bg-emerald-100/90 text-[#006a4e] shadow-xs group-hover:scale-105 transition-transform shrink-0">
                    <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-950 font-mono tracking-tight drop-shadow-xs">
                  {approvedCount}
                </div>
                <div className="text-[11px] font-extrabold flex items-center justify-between gap-1 pt-2 border-t-2 border-emerald-100 whitespace-nowrap">
                  <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 text-[10px] font-bold truncate shrink-0">
                    {language === 'bn' ? 'সক্রিয় সদস্য' : 'Active Members'}
                  </span>
                  <span className="text-emerald-700 font-bold text-[11px] shrink-0">ক্লিক করুন →</span>
                </div>
              </div>

              {/* Card 2.5: Lifetime Members (আজীবন সদস্য তালিকা) */}
              <div
                onClick={() => setActiveTab('lifetime')}
                className="bg-white p-4 sm:p-5 rounded-2xl border-2 border-amber-500/60 shadow-md shadow-amber-900/10 hover:shadow-xl hover:shadow-amber-900/15 space-y-2.5 transition-all transform hover:-translate-y-0.5 relative overflow-hidden group cursor-pointer min-w-0"
              >
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-600" />
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs sm:text-xs font-black tracking-wide text-amber-950 whitespace-nowrap truncate min-w-0">
                    {language === 'bn' ? 'আজীবন সদস্য তালিকা' : 'Lifetime Members'}
                  </span>
                  <div className="p-2 rounded-xl bg-amber-100 text-amber-900 shadow-xs group-hover:scale-105 transition-transform shrink-0">
                    <Award className="w-4 h-4 stroke-[2.5]" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-amber-950 font-mono tracking-tight drop-shadow-xs">
                  {lifetimeCount}
                </div>
                <div className="text-[11px] font-extrabold flex items-center justify-between gap-1 pt-2 border-t-2 border-amber-100 whitespace-nowrap">
                  <span className="text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 text-[10px] font-bold truncate shrink-0">
                    {language === 'bn' ? 'আজীবন (৳২৫০০)' : 'Life Member'}
                  </span>
                  <span className="text-amber-700 font-bold text-[11px] shrink-0">ক্লিক করুন →</span>
                </div>
              </div>

              {/* Card 3: Donation Fees (ডোনেশন ফি) */}
              <div
                id="admin-donation-fee-box"
                onClick={() => setActiveTab('donations')}
                className="bg-white p-4 sm:p-5 rounded-2xl border-2 border-rose-500/50 shadow-md shadow-rose-900/10 hover:shadow-xl hover:shadow-rose-900/15 space-y-2.5 transition-all transform hover:-translate-y-0.5 relative overflow-hidden group cursor-pointer min-w-0"
              >
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500" />
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1 min-w-0">
                    <span className="text-xs sm:text-xs font-black tracking-wide text-rose-950 whitespace-nowrap truncate min-w-0">
                      {language === 'bn' ? 'ডোনেশন ফি' : 'Donation Fee'}
                    </span>
                    <span className="text-[10px] bg-rose-100 text-rose-800 font-black px-1.5 py-0.2 rounded-full whitespace-nowrap shrink-0">
                      তহবিল
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-rose-100/90 text-rose-800 shadow-xs group-hover:scale-105 transition-transform shrink-0">
                    <HeartHandshake className="w-4 h-4 stroke-[2.5]" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-rose-950 font-mono tracking-tight drop-shadow-xs">
                  ৳ {totalDonationAmount.toLocaleString('bn-BD')}
                </div>
                <div className="text-[11px] font-extrabold flex items-center justify-between gap-1 pt-2 border-t-2 border-rose-100 whitespace-nowrap">
                  <span className="text-rose-900 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 text-[10px] font-bold truncate shrink-0">
                    {allDonations.length} {language === 'bn' ? 'টি ডোনেশন' : 'Donations'}
                  </span>
                  <span className="text-rose-700 font-bold text-[11px] shrink-0">
                    {language === 'bn' ? 'বিস্তারিত →' : 'Details →'}
                  </span>
                </div>
              </div>

              {/* Card 4: Total Reg Fees Collected */}
              <div
                onClick={() => setActiveTab('memberships')}
                className="bg-white p-4 sm:p-5 rounded-2xl border-2 border-amber-500/40 shadow-md shadow-amber-900/10 hover:shadow-xl hover:shadow-amber-900/15 space-y-2.5 transition-all transform hover:-translate-y-0.5 relative overflow-hidden group cursor-pointer min-w-0"
              >
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-amber-500 to-emerald-600" />
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs sm:text-xs font-black tracking-wide text-amber-950 whitespace-nowrap truncate min-w-0">
                    {language === 'bn' ? 'সংগৃহীত নিবন্ধন ফি' : 'Reg Fees'}
                  </span>
                  <div className="p-2 rounded-xl bg-amber-100/90 text-amber-800 shadow-xs group-hover:scale-105 transition-transform shrink-0">
                    <DollarSign className="w-4 h-4 stroke-[2.5]" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-[#006a4e] font-mono tracking-tight drop-shadow-xs">
                  ৳ {totalFees.toLocaleString('bn-BD')}
                </div>
                <div className="text-[11px] font-extrabold flex items-center justify-between gap-1 pt-2 border-t-2 border-amber-100 whitespace-nowrap">
                  <span className="text-gray-700 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-200 text-[10px] font-bold truncate shrink-0">
                    {language === 'bn' ? 'নিবন্ধন ফি' : 'Reg Fee'}
                  </span>
                  <span className="text-emerald-800 bg-emerald-100/80 px-1.5 py-0.5 rounded border border-emerald-300 font-mono font-black text-[10px] shrink-0">
                    {paidCount} {language === 'bn' ? 'পেইড' : 'Paid'}
                  </span>
                </div>
              </div>

              {/* Card 5: Advice & Suggestions from Homepage */}
              <div
                onClick={() => setActiveTab('feedbacks')}
                className="bg-white p-4 sm:p-5 rounded-2xl border-2 border-teal-500/40 shadow-md shadow-teal-900/10 hover:shadow-xl hover:shadow-teal-900/15 space-y-2.5 transition-all transform hover:-translate-y-0.5 relative overflow-hidden group cursor-pointer min-w-0"
              >
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 to-emerald-600" />
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs sm:text-xs font-black tracking-wide text-teal-950 whitespace-nowrap truncate min-w-0">
                    {language === 'bn' ? 'পরামর্শ ও মতামত' : 'Advice & Feedback'}
                  </span>
                  <div className="p-2 rounded-xl bg-teal-100/90 text-teal-800 shadow-xs group-hover:scale-105 transition-transform shrink-0">
                    <Inbox className="w-4 h-4 stroke-[2.5]" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-teal-950 font-mono tracking-tight drop-shadow-xs">
                  {feedbacks.length}
                </div>
                <div className="text-[11px] font-extrabold flex items-center justify-between gap-1 pt-2 border-t-2 border-teal-100 whitespace-nowrap">
                  <span className="text-teal-900 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200 text-[10px] font-bold truncate shrink-0">
                    {language === 'bn' ? 'মতামত বক্স' : 'Feedback Box'}
                  </span>
                  {unreadFeedbacksCount > 0 ? (
                    <span className="text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 font-mono font-black text-[10px] shrink-0 animate-pulse">
                      {unreadFeedbacksCount} {language === 'bn' ? 'নতুন' : 'new'}
                    </span>
                  ) : (
                    <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 text-[10px] shrink-0">
                      {language === 'bn' ? 'সকল পঠিত' : 'All read'}
                    </span>
                  )}
                </div>
              </div>
            </div>


          </div>
        )}

        {/* ================= TAB 2: MEMBERSHIPS MANAGEMENT (UNREGISTERED, REGISTERED & LIFETIME) ================= */}
        {(activeTab === 'unregistered' || activeTab === 'registered' || activeTab === 'lifetime' || activeTab === 'memberships') && (
          <div className="space-y-5 animate-in fade-in duration-300">
            {/* View Switcher: Unregistered List vs Registered List vs Lifetime */}
            <div className="bg-white p-2 sm:p-2.5 rounded-2xl border border-emerald-100 shadow-xs flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-1.5 p-1 bg-emerald-50/70 rounded-xl border border-emerald-100/80 w-full sm:w-auto overflow-x-auto">
                <button
                  onClick={() => setActiveTab('unregistered')}
                  className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap ${
                    activeTab === 'unregistered'
                      ? 'bg-amber-400 text-amber-950 shadow-sm'
                      : 'text-gray-700 hover:bg-white/80'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 text-amber-800" />
                  <span>{language === 'bn' ? 'অনিবন্ধিত তালিকা' : 'Unregistered List'}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    activeTab === 'unregistered' ? 'bg-amber-500/30 text-amber-950' : 'bg-gray-200 text-gray-700'
                  }`}>
                    {pendingCount}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('registered')}
                  className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap ${
                    activeTab === 'registered'
                      ? 'bg-[#006a4e] text-white shadow-sm'
                      : 'text-gray-700 hover:bg-white/80'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                  <span>{language === 'bn' ? 'নিবন্ধিত তালিকা' : 'Registered List'}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    activeTab === 'registered' ? 'bg-emerald-800 text-emerald-100' : 'bg-gray-200 text-gray-700'
                  }`}>
                    {approvedCount}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('lifetime')}
                  className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap ${
                    activeTab === 'lifetime'
                      ? 'bg-amber-500 text-amber-950 shadow-sm'
                      : 'text-gray-700 hover:bg-white/80'
                  }`}
                >
                  <Award className="w-3.5 h-3.5 text-amber-950" />
                  <span>{language === 'bn' ? 'আজীবন সদস্য' : 'Lifetime Members'}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    activeTab === 'lifetime' ? 'bg-amber-200 text-amber-950' : 'bg-gray-200 text-gray-700'
                  }`}>
                    {lifetimeCount}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('memberships')}
                  className={`hidden md:flex px-3 py-2 rounded-lg text-xs font-bold transition-all items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'memberships'
                      ? 'bg-emerald-800 text-white shadow-sm'
                      : 'text-gray-600 hover:bg-white/80'
                  }`}
                >
                  <span>{language === 'bn' ? 'সকল আবেদন' : 'All Applications'}</span>
                  <span className="text-[10px] bg-gray-200 text-gray-700 px-1.5 py-0.2 rounded-full font-semibold">
                    {memberships.length}
                  </span>
                </button>
              </div>

              {/* Export Button */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={handleExportCSV}
                  className="w-full sm:w-auto px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-[#006a4e] border-2 border-emerald-300 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>{language === 'bn' ? 'এক্সেল / সিএসভি ডাউনলোড' : 'Export CSV'}</span>
                </button>
              </div>
            </div>

            {/* Contextual Information Banner */}
            {activeTab === 'unregistered' && (
              <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-100/50 border-2 border-amber-300/80 p-4 rounded-2xl flex items-start gap-3.5 shadow-xs">
                <div className="p-2 bg-amber-500 text-white rounded-xl shadow-xs shrink-0 mt-0.5">
                  <Clock className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div className="text-xs text-amber-950 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-black text-sm text-amber-950">
                      {language === 'bn' ? 'অনিবন্ধিত আবেদন তালিকা (ট্রানজেকশন যাচাই অপেক্ষমান)' : 'Unregistered Applications (Pending Verification)'}
                    </h3>
                    <span className="bg-amber-200 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded-full border border-amber-300">
                      অপেক্ষমান: {pendingCount} টি
                    </span>
                  </div>
                  <p className="text-amber-900/90 leading-relaxed font-medium">
                    {language === 'bn'
                      ? 'প্রতিটি আবেদনকারীর প্রদত্ত TrxID ও প্রেরক নম্বর মিলিয়ে আপনার বিকাশ/ব্যাংক একাউন্টে ফি জমা হওয়া নিশ্চিত করুন। ট্রানজেকশন সঠিক থাকলে সরাসরি "✓ এপ্রুভ করুন" বাটনে ক্লিক করুন। এপ্রুভ করার সাথে সাথে আবেদনকারী নিবন্ধিত তালিকায় চলে যাবে।'
                      : 'Verify each applicant\'s TrxID and Sender Number. Once payment is confirmed, click "Approve" to automatically move them to the Registered List.'}
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'registered' && (
              <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100/50 border-2 border-emerald-300/80 p-4 rounded-2xl flex items-start gap-3.5 shadow-xs">
                <div className="p-2 bg-[#006a4e] text-white rounded-xl shadow-xs shrink-0 mt-0.5">
                  <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div className="text-xs text-emerald-950 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-black text-sm text-emerald-950">
                      {language === 'bn' ? 'নিবন্ধিত অ্যালামনাই সদস্যবৃন্দ (অনুমোদিত ও সক্রিয়)' : 'Registered Alumni Members (Verified & Approved)'}
                    </h3>
                    <span className="bg-emerald-200 text-emerald-900 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-300">
                      মোট নিবন্ধিত: {approvedCount} জন
                    </span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-emerald-900/90 leading-relaxed font-medium">
                      {language === 'bn'
                        ? 'এই তালিকায় অনুমোদিত অ্যালামনাই সদস্যদের তথ্য সংরক্ষিত রয়েছে। এখান থেকে সদস্যপদ নিশ্চিতকরণ এসএমএস পাঠানো যাবে এবং আবেদনপত্র ও সনদ ভিউ বা প্রিন্ট করা যাবে।'
                        : 'These members have verified payment and approved status. You can send approval confirmation SMS, view applications, and print certificates.'}
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveTab('sms')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-amber-300" />
                      <span>{language === 'bn' ? 'এসএমএস বডি টেক্সট পরিবর্তন / কাস্টমাইজ করুন' : 'Edit SMS Body Text'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'lifetime' && (
              <div className="bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-100/60 border-2 border-amber-400/80 p-4 rounded-2xl flex items-start gap-3.5 shadow-xs">
                <div className="p-2 bg-amber-500 text-amber-950 rounded-xl shadow-xs shrink-0 mt-0.5">
                  <Award className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div className="text-xs text-amber-950 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-black text-sm text-amber-950">
                      {language === 'bn' ? 'আজীবন সদস্য তালিকা (Lifetime Members)' : 'Lifetime Members List'}
                    </h3>
                    <span className="bg-amber-200 text-amber-950 text-[10px] font-black px-2 py-0.5 rounded-full border border-amber-300">
                      মোট আজীবন সদস্য: {lifetimeCount} জন
                    </span>
                  </div>
                  <p className="text-amber-900/90 leading-relaxed font-medium">
                    {language === 'bn'
                      ? 'যেসকল অ্যালামনাই সদস্য নিবন্ধন ফর্মে "আজীবন সদস্য" (Life Member - ফি ৳২৫০০/-) সিলেক্ট করে পেমেন্ট সম্পন্ন বা আবেদন জমা দিয়েছেন, তাদের তালিকা এখানে প্রদর্শিত হচ্ছে। এখান থেকে তাদের আবেদন যাচাই ও অনুমোদন পরিচালনা করা যাবে।'
                      : 'Showing members who selected "Life Member" (Fee ৳2500/-) in the registration form. You can verify and manage their applications here.'}
                  </p>
                </div>
              </div>
            )}

            {/* Filter & Search Bar */}
            <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-xs grid grid-cols-1 sm:grid-cols-12 gap-3">
              {/* Search Box */}
              <div className="sm:col-span-6 relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={language === 'bn' ? 'নাম, ফরম নং, মোবাইল, ইমেইল বা ট্রানজেকশন...' : 'Search by name, form no, mobile, email...'}
                  className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#006a4e] focus:bg-white transition-all font-medium"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Status Filter */}
              <div className="sm:col-span-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#006a4e] font-semibold text-gray-700 cursor-pointer"
                >
                  <option value="all">{language === 'bn' ? 'সকল স্ট্যাটাস' : 'All Status'}</option>
                  <option value="approved">{language === 'bn' ? 'অনুমোদিত (Approved)' : 'Approved'}</option>
                  <option value="pending">{language === 'bn' ? 'বিবেচনাধীন (Pending)' : 'Pending'}</option>
                  <option value="rejected">{language === 'bn' ? 'বাতিল (Rejected)' : 'Rejected'}</option>
                </select>
              </div>

              {/* Payment Filter */}
              <div className="sm:col-span-3">
                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#006a4e] font-semibold text-gray-700 cursor-pointer"
                >
                  <option value="all">{language === 'bn' ? 'সকল পেমেন্ট' : 'All Payments'}</option>
                  <option value="paid">{language === 'bn' ? 'পেইড (Paid)' : 'Paid'}</option>
                  <option value="unpaid">{language === 'bn' ? 'অপরিশোধিত (Unpaid)' : 'Unpaid'}</option>
                </select>
              </div>
            </div>

            {/* Bulk Selection Bar if any selected */}
            {selectedMemberIds.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-xs animate-in fade-in slide-in-from-top-1">
                <div className="flex items-center gap-2 text-xs font-bold text-red-900">
                  <span className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-xs">
                    {selectedMemberIds.length}
                  </span>
                  <span>
                    {language === 'bn'
                      ? `${selectedMemberIds.length} জন সদস্য নির্বাচন করা হয়েছে`
                      : `${selectedMemberIds.length} members selected`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedMemberIds([])}
                    className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    {language === 'bn' ? 'নির্বাচন বাতিল' : 'Deselect All'}
                  </button>
                  <button
                    onClick={() => setBulkDeleteModalOpen(true)}
                    className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>
                      {language === 'bn'
                        ? `নির্বাচিত ${selectedMemberIds.length} জন সদস্য ডিলিট করুন`
                        : `Delete Selected (${selectedMemberIds.length})`}
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* Applications Table */}
            <div id="admin-members-list-container" className="bg-white rounded-2xl border border-emerald-100 shadow-xs overflow-hidden">
              {loading ? (
                <div className="py-16 text-center text-xs text-gray-500 space-y-3">
                  <div className="w-9 h-9 border-3 border-[#006a4e] border-t-transparent rounded-full animate-spin mx-auto" />
                  <p>{language === 'bn' ? 'আবেদন ডাটা লোড হচ্ছে...' : 'Loading applications...'}</p>
                </div>
              ) : filteredMemberships.length === 0 ? (
                <div className="py-16 text-center text-xs text-gray-400 space-y-2">
                  <FileText className="w-10 h-10 mx-auto text-gray-300" />
                  <p className="font-bold text-gray-700 text-sm">
                    {language === 'bn' ? 'কোনো আবেদন খুঁজে পাওয়া যায়নি' : 'No applications found'}
                  </p>
                  <p className="text-[11px] text-gray-400">
                    {language === 'bn' ? 'অনুগ্রহ করে সার্চ বা ফিল্টার পরিবর্তন করে পুনরায় চেষ্টা করুন।' : 'Try changing your search filters.'}
                  </p>
                </div>
              ) : (
                <>
                  {/* Mobile Cards View (Visible on small screens < md) */}
                  <div className="block md:hidden divide-y divide-emerald-100/70">
                    {paginatedAdminMemberships.map((m, idx) => {
                      const absoluteIndex = adminStartIndex + idx + 1;
                      const isSelected = selectedMemberIds.includes(m.id);
                      return (
                        <div
                          key={m.id}
                          className={`p-3.5 sm:p-4 space-y-3 transition-colors ${
                            isSelected ? 'bg-red-50/40' : 'hover:bg-emerald-50/30'
                          }`}
                        >
                          {/* Top Row: Checkbox, Index, Form No, Status */}
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleSelectMember(m.id)}
                                className="w-4 h-4 rounded text-[#006a4e] focus:ring-0 cursor-pointer accent-[#006a4e]"
                              />
                              <span className="font-mono text-gray-400 text-xs font-bold">#{absoluteIndex}</span>
                              <span className="font-mono text-xs font-bold bg-gray-100 text-gray-800 px-2 py-0.5 rounded border border-gray-200">
                                {m.formNo || m.id.slice(-6)}
                              </span>
                            </div>

                            {/* Status Dropdown */}
                            <select
                              value={m.status === 'payment_pending' ? 'pending' : (m.status || 'pending')}
                              onChange={(e) => handleUpdateMemberStatus(m.id, e.target.value as any)}
                              className={`text-[11px] font-bold px-2 py-1 rounded-lg border focus:outline-none cursor-pointer transition-all ${
                                m.status === 'approved'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-1 ring-emerald-300'
                                  : m.status === 'rejected'
                                  ? 'bg-red-50 text-red-800 border-red-300 ring-1 ring-red-300'
                                  : 'bg-amber-50 text-amber-800 border-amber-300 ring-1 ring-amber-300'
                              }`}
                            >
                              <option value="pending">{language === 'bn' ? 'বিবেচনাধীন' : 'Pending'}</option>
                              <option value="approved">{language === 'bn' ? 'অনুমোদিত' : 'Approved'}</option>
                              <option value="rejected">{language === 'bn' ? 'বাতিল' : 'Rejected'}</option>
                            </select>
                          </div>

                          {/* Member Info Row */}
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold overflow-hidden shrink-0 text-sm shadow-xs">
                              {m.userPhotoUrl ? (
                                <img src={m.userPhotoUrl} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <span>{(m.applicantNameBn || m.fullName || 'ম').charAt(0)}</span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0 space-y-0.5">
                              <h4 className="font-bold text-gray-900 text-sm leading-snug">
                                {m.applicantNameBn || m.fullName}
                              </h4>
                              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-gray-600">
                                <span>{m.batch || '—'}</span>
                                {m.session && (
                                  <span className="text-emerald-700 font-mono font-semibold">({m.session})</span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-xs font-mono text-gray-700">
                                <span className="font-bold">{m.mobile}</span>
                              </div>
                            </div>
                          </div>

                          {/* Fee & Payment Badge Box */}
                          <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200/70 flex flex-wrap items-center justify-between gap-1.5 text-xs">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-[#006a4e] font-mono">৳ {m.feeAmount || '৫০০'}</span>
                              <span className="text-gray-400">•</span>
                              {m.paymentMethod === 'Unpaid' || m.paymentStatus === 'unpaid' ? (
                                <span className="font-extrabold text-red-800 bg-red-100 border border-red-300 px-2 py-0.5 rounded text-[11px] font-mono uppercase">
                                  Unpaid
                                </span>
                              ) : (
                                <span className="text-gray-700 font-bold bg-white px-1.5 py-0.5 rounded border border-gray-200">
                                  {m.paymentMethod || 'Manual'}
                                </span>
                              )}
                            </div>
                            {m.transactionId && m.transactionId !== 'UNPAID' ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigator.clipboard.writeText(m.transactionId || '');
                                  showToast(language === 'bn' ? `TrxID কপি হয়েছে: ${m.transactionId}` : `TrxID copied: ${m.transactionId}`);
                                }}
                                className="font-mono text-[11px] font-black text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded cursor-pointer active:scale-95 flex items-center gap-1 hover:bg-rose-100 transition-colors"
                                title="কপি করতে ক্লিক করুন"
                              >
                                <span>Trx: {m.transactionId}</span>
                                <Copy className="w-3 h-3 text-rose-500" />
                              </button>
                            ) : (
                              <span className="text-[10px] text-red-600 font-bold italic">পরিশোধ বাকি (Unpaid)</span>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-wrap items-center justify-between gap-2 pt-1.5 border-t border-gray-100">
                            <div className="flex items-center gap-1.5">
                              {m.status !== 'approved' || m.paymentStatus === 'unpaid' || m.paymentMethod === 'Unpaid' ? (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateMemberStatus(m.id, 'approved')}
                                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-black transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                                  title={language === 'bn' ? 'পেমেন্ট প্রাপ্তির পর Paid চিহ্নিত করে নিবন্ধিত তালিকায় স্থানান্তর করুন' : 'Mark as Paid & Approve Member'}
                                >
                                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                                  <span>
                                    {m.paymentMethod === 'Unpaid' || m.paymentStatus === 'unpaid'
                                      ? (language === 'bn' ? 'Paid (নিবন্ধিত করুন)' : 'Mark Paid')
                                      : (language === 'bn' ? 'এপ্রুভ করুন' : 'Approve')}
                                  </span>
                                </button>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black bg-emerald-100 text-emerald-900 border border-emerald-300">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                                  <span>{language === 'bn' ? 'অনুমোদিত' : 'Approved'}</span>
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5">
                              {m.email && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleOpenEmailModal({
                                      name: m.applicantNameBn || m.fullName || 'Member',
                                      email: m.email!,
                                      formNo: m.formNo,
                                      membershipId: m.membershipId,
                                    })
                                  }
                                  className="px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                                  title={language === 'bn' ? 'ইমেইল পাঠান' : 'Send Email'}
                                >
                                  <Mail className="w-3.5 h-3.5" />
                                  <span>{language === 'bn' ? 'ইমেইল' : 'Email'}</span>
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => setSelectedMember(m)}
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-50 text-[#006a4e] hover:bg-emerald-100 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                                title={language === 'bn' ? 'সদস্য ফরম ভিউ করুন' : 'View Member Form'}
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>{language === 'bn' ? 'ফরম' : 'Form'}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => confirmSingleDelete(m.id, m.applicantNameBn || m.fullName || 'Member', m.formNo)}
                                className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                                title={language === 'bn' ? 'ডিলিট করুন' : 'Delete'}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Desktop Table View (Visible on md and up) */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#004d38] text-white uppercase text-[11px] tracking-wider font-semibold">
                        <tr>
                          <th className="py-3.5 px-3 w-10 text-center">
                            <input
                              type="checkbox"
                              checked={
                                filteredMemberships.length > 0 &&
                                filteredMemberships.every((m) => selectedMemberIds.includes(m.id))
                              }
                              onChange={() => toggleSelectAll(filteredMemberships)}
                              className="w-4 h-4 rounded text-[#006a4e] focus:ring-0 cursor-pointer accent-[#006a4e]"
                              title={language === 'bn' ? 'সবগুলো নির্বাচন করুন' : 'Select All'}
                            />
                          </th>
                          <th className="py-3.5 px-3">#</th>
                          <th className="py-3.5 px-4">{language === 'bn' ? 'ফরম নং' : 'Form No'}</th>
                          <th className="py-3.5 px-4">{language === 'bn' ? 'আবেদনকারীর নাম ও ছবি' : 'Applicant'}</th>
                          <th className="py-3.5 px-4">{language === 'bn' ? 'ব্যাচ ও সেশন' : 'Batch / Session'}</th>
                          <th className="py-3.5 px-4">{language === 'bn' ? 'মোবাইল ও ইমেইল' : 'Contact'}</th>
                          <th className="py-3.5 px-4">{language === 'bn' ? 'ফি ও ট্রানজেকশন' : 'Fee & Payment'}</th>
                          <th className="py-3.5 px-4">{language === 'bn' ? 'অনুমোদন স্থিতি' : 'Status'}</th>
                          <th className="py-3.5 px-4 text-right">{language === 'bn' ? 'অ্যাকশন' : 'Actions'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {paginatedAdminMemberships.map((m, idx) => {
                          const absoluteIndex = adminStartIndex + idx + 1;
                          const isSelected = selectedMemberIds.includes(m.id);
                          return (
                            <tr
                              key={m.id}
                              className={`transition-colors cursor-pointer group ${
                                isSelected ? 'bg-red-50/40 hover:bg-red-50/70' : 'hover:bg-emerald-50/50'
                              }`}
                              onClick={() => setSelectedMember(m)}
                            >
                              <td className="py-3.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleSelectMember(m.id)}
                                  className="w-4 h-4 rounded text-[#006a4e] focus:ring-0 cursor-pointer accent-[#006a4e]"
                                />
                              </td>
                              <td className="py-3.5 px-3 font-mono text-gray-400 text-[11px]">
                                {absoluteIndex}
                              </td>
                              <td className="py-3.5 px-4">
                                <span className="font-mono text-xs font-bold bg-gray-100 text-gray-800 px-2 py-0.5 rounded border border-gray-200">
                                  {m.formNo || m.id.slice(-6)}
                                </span>
                              </td>
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold overflow-hidden shrink-0 text-xs shadow-2xs">
                                    {m.userPhotoUrl ? (
                                      <img src={m.userPhotoUrl} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                      <span>{(m.applicantNameBn || m.fullName || 'ম').charAt(0)}</span>
                                    )}
                                  </div>
                                  <div>
                                    <div className="font-bold text-gray-900 group-hover:text-[#006a4e]">
                                      {m.applicantNameBn || m.fullName}
                                    </div>
                                    {m.occupation && (
                                      <div className="text-[10px] text-gray-500">{m.occupation}</div>
                                    )}
                                    {(m.degreeDocData || m.degreeDocName) && (
                                      <div className="mt-0.5">
                                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-300 px-1.5 py-0.2 rounded font-medium">
                                          <FileText className="w-3 h-3 text-emerald-600" />
                                          <span>সনদ সংলগ্ন</span>
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="py-3.5 px-4">
                                <div className="font-semibold text-gray-900">{m.batch || '—'}</div>
                                <div className="text-[10px] text-emerald-700 font-mono">{m.session || '—'}</div>
                              </td>
                              <td className="py-3.5 px-4">
                                <div className="font-mono font-bold text-gray-800">{m.mobile}</div>
                                {m.email && (
                                  <div className="text-[10px] text-gray-500 truncate max-w-[140px]">{m.email}</div>
                                )}
                              </td>
                              <td className="py-3.5 px-4">
                                <div className="font-bold text-[#006a4e] font-mono text-sm">৳ {m.feeAmount || '৫০০'}</div>
                                <div className="text-[11px] text-gray-700 font-mono flex items-center gap-1.5 flex-wrap mt-0.5">
                                  {m.paymentMethod === 'Unpaid' || m.paymentStatus === 'unpaid' ? (
                                    <span className="font-extrabold text-red-800 bg-red-100 border border-red-300 px-2 py-0.5 rounded uppercase">
                                      Unpaid
                                    </span>
                                  ) : (
                                    <span className="font-bold text-gray-800 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
                                      {m.paymentMethod || 'Manual'}
                                    </span>
                                  )}
                                  {m.transactionId && m.transactionId !== 'UNPAID' && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        navigator.clipboard.writeText(m.transactionId || '');
                                        showToast(language === 'bn' ? `TrxID কপি হয়েছে: ${m.transactionId}` : `TrxID copied: ${m.transactionId}`);
                                      }}
                                      className="font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded flex items-center gap-1 hover:bg-rose-100 transition-colors cursor-pointer"
                                      title={language === 'bn' ? 'TrxID কপি করতে ক্লিক করুন' : 'Click to copy TrxID'}
                                    >
                                      <span>Trx: {m.transactionId}</span>
                                      <Copy className="w-3 h-3 text-rose-500" />
                                    </button>
                                  )}
                                </div>
                                {m.senderNumber && (
                                  <div className="text-[10px] text-gray-500 font-mono mt-0.5">
                                    প্রেরক: <span className="font-bold text-gray-700">{m.senderNumber}</span>
                                  </div>
                                )}
                              </td>
                              <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                                {m.status === 'approved' && m.paymentStatus === 'paid' && m.paymentMethod !== 'Unpaid' ? (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-2xs">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                                    <span>{language === 'bn' ? 'অনুমোদিত' : 'Approved'}</span>
                                  </span>
                                ) : m.paymentMethod === 'Unpaid' || m.paymentStatus === 'unpaid' ? (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-red-100 text-red-950 border border-red-300 shadow-2xs">
                                    <Clock className="w-3.5 h-3.5 text-red-700" />
                                    <span>{language === 'bn' ? 'অনিবন্ধিত (Unpaid)' : 'Unpaid'}</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-950 border border-amber-300 shadow-2xs">
                                    <Clock className="w-3.5 h-3.5 text-amber-700" />
                                    <span>{language === 'bn' ? 'যাচাই অপেক্ষমান' : 'Pending'}</span>
                                  </span>
                                )}
                              </td>
                              <td className="py-3.5 px-4 text-right space-x-1.5" onClick={(e) => e.stopPropagation()}>
                                {m.status !== 'approved' || m.paymentStatus === 'unpaid' || m.paymentMethod === 'Unpaid' ? (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateMemberStatus(m.id, 'approved')}
                                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-black inline-flex items-center gap-1 shadow-sm transition-all cursor-pointer hover:shadow"
                                      title={language === 'bn' ? 'পেমেন্ট পেয়ে থাকলে Paid চিহ্নিত করে নিবন্ধিত তালিকায় স্থানান্তরিত করুন' : 'Mark as Paid & Move to Registered List'}
                                    >
                                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                                      <span>
                                        {m.paymentMethod === 'Unpaid' || m.paymentStatus === 'unpaid'
                                          ? (language === 'bn' ? 'Paid (নিবন্ধিত করুন)' : 'Mark Paid')
                                          : (language === 'bn' ? 'এপ্রুভ করুন' : 'Approve')}
                                      </span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setSelectedMember(m)}
                                      className="p-1.5 rounded-lg bg-emerald-50 text-[#006a4e] hover:bg-emerald-100 transition-colors cursor-pointer inline-flex items-center"
                                      title={language === 'bn' ? 'সদস্য ফরম ও পূর্ণ বিবরণ' : 'View Member Form'}
                                    >
                                      <Eye className="w-4 h-4" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => confirmSingleDelete(m.id, m.applicantNameBn || m.fullName || 'Member', m.formNo)}
                                      className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors cursor-pointer inline-flex items-center"
                                      title={language === 'bn' ? 'আবেদন ডিলিট' : 'Delete Application'}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => handleSendCardSMS(m)}
                                      disabled={sendingSmsId === m.id}
                                      className="p-1.5 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 disabled:opacity-50 transition-colors cursor-pointer inline-flex items-center"
                                      title={language === 'bn' ? 'সদস্যকে নিশ্চিতকরণ এসএমএস পাঠান' : 'Send Confirmation SMS to Member'}
                                    >
                                      <MessageSquare className={`w-4 h-4 ${sendingSmsId === m.id ? 'animate-spin' : ''}`} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setSelectedMember(m)}
                                      className="p-1.5 rounded-lg bg-emerald-50 text-[#006a4e] hover:bg-emerald-100 transition-colors cursor-pointer inline-flex items-center"
                                      title={language === 'bn' ? 'সদস্য ফরম ও সনদ প্রিন্ট' : 'View Form & Certificate'}
                                    >
                                      <Eye className="w-4 h-4" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateMemberStatus(m.id, 'pending')}
                                      className="p-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-amber-100 hover:text-amber-800 transition-colors cursor-pointer inline-flex items-center"
                                      title={language === 'bn' ? 'পুনরায় অনিবন্ধিত তালিকায় স্থানান্তর করুন' : 'Revert to Unregistered'}
                                    >
                                      <RefreshCw className="w-4 h-4" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => confirmSingleDelete(m.id, m.applicantNameBn || m.fullName || 'Member', m.formNo)}
                                      className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors cursor-pointer inline-flex items-center"
                                      title={language === 'bn' ? 'সদস্য ডিলিট করুন' : 'Delete Member'}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Admin 10-Item Pagination Bar */}
                  {totalAdminPages > 1 && (
                    <div className="bg-[#f4f8f5] border-t border-emerald-100 p-3.5 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="text-xs font-bold text-gray-700 text-center sm:text-left">
                        {language === 'bn' ? (
                          <span>
                            মোট <strong className="text-[#006a4e]">{totalAdminMembersCount}</strong> জনের মধ্যে{' '}
                            <strong className="text-gray-900">{adminStartIndex + 1} - {adminEndIndex}</strong> পর্যন্ত দেখানো হচ্ছে{' '}
                            <span className="text-gray-500 font-normal">(পৃষ্ঠা {adminPage} / {totalAdminPages})</span>
                          </span>
                        ) : (
                          <span>
                            Showing <strong className="text-gray-900">{adminStartIndex + 1} - {adminEndIndex}</strong> of{' '}
                            <strong className="text-[#006a4e]">{totalAdminMembersCount}</strong> records{' '}
                            <span className="text-gray-500 font-normal">(Page {adminPage} of {totalAdminPages})</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleAdminPageChange(adminPage - 1)}
                          disabled={adminPage === 1}
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                            adminPage === 1
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                              : 'bg-white hover:bg-emerald-50 text-[#006a4e] border border-emerald-300 shadow-2xs cursor-pointer active:scale-95'
                          }`}
                        >
                          <ChevronLeft className="w-4 h-4" />
                          <span>{language === 'bn' ? 'পূর্ববর্তী' : 'Previous'}</span>
                        </button>

                        <div className="flex items-center gap-1">
                          {Array.from({ length: totalAdminPages }, (_, i) => i + 1).map((pageNum) => (
                            <button
                              key={pageNum}
                              type="button"
                              onClick={() => handleAdminPageChange(pageNum)}
                              className={`min-w-[32px] h-[32px] px-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center ${
                                pageNum === adminPage
                                  ? 'bg-[#006a4e] text-white shadow-xs scale-105 ring-2 ring-emerald-300'
                                  : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
                              }`}
                            >
                              {pageNum}
                            </button>
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleAdminPageChange(adminPage + 1)}
                          disabled={adminPage === totalAdminPages}
                          className={`inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
                            adminPage === totalAdminPages
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                              : 'bg-[#006a4e] hover:bg-[#00523d] text-white shadow-xs cursor-pointer active:scale-95 ring-1 ring-emerald-700'
                          }`}
                        >
                          <span>{language === 'bn' ? 'পরবর্তী' : 'Next'}</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}



        {/* ================= TAB: DONATION FEES & FUND (ডোনেশন ফি) ================= */}
        {activeTab === 'donations' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header Banner */}
            <div className="bg-gradient-to-br from-[#881337] via-[#9f1239] to-[#4c0519] text-white p-5 sm:p-6 rounded-2xl border-2 border-rose-400/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="space-y-1 z-10">
                <div className="flex items-center gap-2">
                  <span className="bg-amber-400 text-rose-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    ALUMNI FUND REGISTER
                  </span>
                  <span className="bg-rose-500/30 text-rose-100 text-[11px] font-bold px-2 py-0.5 rounded-full">
                    {allDonations.length} {language === 'bn' ? 'টি ডোনেশন এন্ট্রি' : 'Donations'}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black font-serif-bn flex items-center gap-2">
                  <HeartHandshake className="w-6 h-6 text-amber-300 shrink-0" />
                  <span>{language === 'bn' ? 'ডোনেশন ফি ও অ্যাসোসিয়েশন তহবিল রেজিস্টার' : 'Donation Fees & Alumni Fund Register'}</span>
                </h2>
                <p className="text-xs sm:text-sm text-rose-100/90 font-medium max-w-2xl">
                  {language === 'bn'
                    ? 'উদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশনের তহবিলে জমাকৃত সকল অনুদান, ডোনার তালিকা ও মাধ্যমভিত্তিক পূর্ণাঙ্গ হিসাব।'
                    : 'Real-time record of all donations, contributor details, and payment medium breakdowns.'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center flex-wrap gap-2.5 z-10">
                <button
                  type="button"
                  onClick={() => setIsAddDonationModalOpen(true)}
                  className="px-4 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-rose-950 font-black rounded-xl text-xs shadow-lg transition-all transform active:scale-95 flex items-center gap-2 cursor-pointer border border-amber-200"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>{language === 'bn' ? 'নতুন ডোনেশন এন্ট্রি' : 'Add Donation'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportDonationsCsv}
                  className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-white/20 cursor-pointer shadow-xs"
                >
                  <Download className="w-4 h-4 text-amber-300" />
                  <span>{language === 'bn' ? 'সিএসভি ডাউনলোড' : 'CSV Export'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-white/20 cursor-pointer shadow-xs"
                >
                  <Printer className="w-4 h-4 text-rose-200" />
                  <span>{language === 'bn' ? 'প্রিন্ট' : 'Print'}</span>
                </button>
              </div>
            </div>

            {/* KPI Highlight Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              {/* Box 1: Total Donation Fund */}
              <div className="bg-white p-4 rounded-2xl border-2 border-rose-500/40 shadow-sm col-span-2 sm:col-span-1 lg:col-span-2">
                <div className="flex items-center justify-between text-xs text-rose-900 font-bold mb-1">
                  <span>{language === 'bn' ? 'সর্বমোট সংগৃহীত অনুদান' : 'Total Donations'}</span>
                  <Wallet className="w-4 h-4 text-rose-600" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-rose-950 font-mono tracking-tight">
                  ৳ {totalDonationAmount.toLocaleString('bn-BD')}
                </div>
                <div className="text-[11px] text-rose-700 font-semibold mt-1">
                  {allDonations.length} {language === 'bn' ? 'জন দাতার অনুদান' : 'Donors count'}
                </div>
              </div>

              {/* Box 2: bKash Collection */}
              <div className="bg-white p-3.5 rounded-2xl border border-pink-200 shadow-2xs">
                <div className="flex items-center justify-between text-xs text-pink-700 font-bold mb-1">
                  <span>বিকাশ (bKash)</span>
                  <span className="w-2 h-2 rounded-full bg-[#D12053]" />
                </div>
                <div className="text-lg font-black text-gray-900 font-mono">
                  ৳ {allDonations.filter(d => (d.paymentMethod || '').toLowerCase().includes('bkash')).reduce((s, c) => s + (Number(c.amount) || 0), 0).toLocaleString('bn-BD')}
                </div>
                <div className="text-[10px] text-gray-500 font-medium mt-0.5">
                  {allDonations.filter(d => (d.paymentMethod || '').toLowerCase().includes('bkash')).length} টি পেমেন্ট
                </div>
              </div>

              {/* Box 3: Nagad Collection */}
              <div className="bg-white p-3.5 rounded-2xl border border-orange-200 shadow-2xs">
                <div className="flex items-center justify-between text-xs text-orange-700 font-bold mb-1">
                  <span>নগদ (Nagad)</span>
                  <span className="w-2 h-2 rounded-full bg-[#F7941D]" />
                </div>
                <div className="text-lg font-black text-gray-900 font-mono">
                  ৳ {allDonations.filter(d => (d.paymentMethod || '').toLowerCase().includes('nagad')).reduce((s, c) => s + (Number(c.amount) || 0), 0).toLocaleString('bn-BD')}
                </div>
                <div className="text-[10px] text-gray-500 font-medium mt-0.5">
                  {allDonations.filter(d => (d.paymentMethod || '').toLowerCase().includes('nagad')).length} টি পেমেন্ট
                </div>
              </div>

              {/* Box 4: Rocket Collection */}
              <div className="bg-white p-3.5 rounded-2xl border border-purple-200 shadow-2xs">
                <div className="flex items-center justify-between text-xs text-purple-700 font-bold mb-1">
                  <span>রকেট (Rocket)</span>
                  <span className="w-2 h-2 rounded-full bg-[#8C3494]" />
                </div>
                <div className="text-lg font-black text-gray-900 font-mono">
                  ৳ {allDonations.filter(d => (d.paymentMethod || '').toLowerCase().includes('rocket')).reduce((s, c) => s + (Number(c.amount) || 0), 0).toLocaleString('bn-BD')}
                </div>
                <div className="text-[10px] text-gray-500 font-medium mt-0.5">
                  {allDonations.filter(d => (d.paymentMethod || '').toLowerCase().includes('rocket')).length} টি পেমেন্ট
                </div>
              </div>

              {/* Box 5: Bank & Cash Collection */}
              <div className="bg-white p-3.5 rounded-2xl border border-emerald-200 shadow-2xs">
                <div className="flex items-center justify-between text-xs text-emerald-700 font-bold mb-1">
                  <span>ব্যাংক / ক্যাশ</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                </div>
                <div className="text-lg font-black text-gray-900 font-mono">
                  ৳ {allDonations.filter(d => !(d.paymentMethod || '').toLowerCase().includes('bkash') && !(d.paymentMethod || '').toLowerCase().includes('nagad') && !(d.paymentMethod || '').toLowerCase().includes('rocket')).reduce((s, c) => s + (Number(c.amount) || 0), 0).toLocaleString('bn-BD')}
                </div>
                <div className="text-[10px] text-gray-500 font-medium mt-0.5">
                  {allDonations.filter(d => !(d.paymentMethod || '').toLowerCase().includes('bkash') && !(d.paymentMethod || '').toLowerCase().includes('nagad') && !(d.paymentMethod || '').toLowerCase().includes('rocket')).length} টি পেমেন্ট
                </div>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-rose-200/80 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                {/* Search Input */}
                <div className="relative w-full sm:w-96">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={donationSearchTerm}
                    onChange={(e) => setDonationSearchTerm(e.target.value)}
                    placeholder={language === 'bn' ? 'দাতার নাম, মোবাইল, TrxID, ব্যাচ বা রসিদ দিয়ে খুঁজুন...' : 'Search by name, phone, TrxID, batch...'}
                    className="w-full pl-9.5 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all font-medium"
                  />
                  {donationSearchTerm && (
                    <button
                      type="button"
                      onClick={() => setDonationSearchTerm('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Method Filter Buttons */}
                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
                  <span className="text-xs font-bold text-gray-500 shrink-0 mr-1">
                    <Filter className="w-3.5 h-3.5 inline mr-1" />
                    {language === 'bn' ? 'মাধ্যম:' : 'Method:'}
                  </span>
                  {[
                    { id: 'all', label: 'সকল মাধ্যম' },
                    { id: 'bkash', label: 'বিকাশ' },
                    { id: 'nagad', label: 'নগদ' },
                    { id: 'rocket', label: 'রকেট' },
                    { id: 'bank', label: 'ব্যাংক' },
                    { id: 'cash', label: 'ক্যাশ / অফলাইন' }
                  ].map((m) => {
                    const isSelected = donationMethodFilter === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setDonationMethodFilter(m.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                          isSelected
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {m.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Donation Records List / Table */}
            <div id="admin-donations-list-container" className="bg-white rounded-2xl border border-rose-200/80 shadow-xs overflow-hidden">
              <div className="p-4 bg-rose-50/50 border-b border-rose-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HeartHandshake className="w-4 h-4 text-rose-700" />
                  <span className="text-xs font-black text-rose-950">
                    {language === 'bn' ? 'ডোনেশন হিসাব তালিকা' : 'Donation Records'} ({filteredDonations.length})
                  </span>
                </div>
                <span className="text-xs font-bold text-rose-900 bg-rose-100 px-2.5 py-0.5 rounded-full">
                  মোট: ৳ {filteredDonations.reduce((s, d) => s + (Number(d.amount) || 0), 0).toLocaleString('bn-BD')}
                </span>
              </div>

              {filteredDonations.length === 0 ? (
                <div className="p-12 text-center space-y-3">
                  <div className="w-14 h-14 bg-rose-50 text-rose-400 rounded-full flex items-center justify-center mx-auto">
                    <HeartHandshake className="w-7 h-7" />
                  </div>
                  <h3 className="font-bold text-gray-800 text-sm">
                    {language === 'bn' ? 'কোনো ডোনেশন রেকর্ড পাওয়া যায়নি' : 'No donation records found'}
                  </h3>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto">
                    {language === 'bn'
                      ? 'নতুন কোনো অনুদান যোগ করতে উপরে "নতুন ডোনেশন এন্ট্রি" বাটনে ক্লিক করুন।'
                      : 'Click "Add Donation" button above to record a new donation.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsAddDonationModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'ডোনেশন এন্ট্রি করুন' : 'Add Donation'}</span>
                  </button>
                </div>
              ) : (
                <>
                  {/* Mobile Card View (sm and down) */}
                  <div className="block md:hidden divide-y divide-gray-100">
                    {paginatedDonations.map((d, idx) => (
                      <div
                        key={d.id || idx}
                        onClick={() => setSelectedDonation(d)}
                        className="p-4 space-y-3 hover:bg-rose-50/40 transition-colors cursor-pointer"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="text-[10px] font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded inline-block border border-rose-200">
                              {d.receiptNo}
                            </div>
                            <h4 className="font-black text-sm text-gray-900 mt-1">
                              {d.payerNameBn || d.payerName}
                            </h4>
                            {d.payerName && d.payerName !== d.payerNameBn && (
                              <p className="text-xs text-gray-600">{d.payerName}</p>
                            )}
                            {(d.batch || d.session) && (
                              <p className="text-[11px] font-semibold text-emerald-800 mt-0.5">
                                {d.batch && `ব্যাচ: ${d.batch}`} {d.session && `(${d.session})`}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <span className="text-base font-black text-rose-800 font-mono">
                              ৳ {(Number(d.amount) || 0).toLocaleString('bn-BD')}
                            </span>
                            <div className="mt-1">
                              <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                d.paymentMethod?.toLowerCase().includes('bkash')
                                  ? 'bg-pink-100 text-[#D12053] border border-pink-200'
                                  : d.paymentMethod?.toLowerCase().includes('nagad')
                                  ? 'bg-orange-100 text-[#F7941D] border border-orange-200'
                                  : d.paymentMethod?.toLowerCase().includes('rocket')
                                  ? 'bg-purple-100 text-[#8C3494] border border-purple-200'
                                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              }`}>
                                {d.paymentMethod || 'Manual'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="text-xs text-gray-600 grid grid-cols-2 gap-2 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                          <div>
                            <span className="text-gray-400 block text-[10px]">মোবাইল / প্রেরক</span>
                            <span className="font-mono font-bold text-gray-800">{d.phone || d.senderNumber || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 block text-[10px]">ট্রানজেকশন আইডি</span>
                            <span className="font-mono font-bold text-rose-900 select-all">{d.transactionId || 'N/A'}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
                          <span>{d.createdAt ? new Date(d.createdAt).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}</span>
                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => setSelectedDonation(d)}
                              className="px-2.5 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg font-bold text-xs flex items-center gap-1 cursor-pointer"
                            >
                              <Receipt className="w-3.5 h-3.5" />
                              <span>রসিদ</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteDonation(d.id)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop Table View (md and up) */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#881337] text-white uppercase text-[11px] tracking-wider font-semibold">
                        <tr>
                          <th className="py-3.5 px-3">#</th>
                          <th className="py-3.5 px-4">{language === 'bn' ? 'রসিদ নং' : 'Receipt No'}</th>
                          <th className="py-3.5 px-4">{language === 'bn' ? 'দাতার নাম ও পরিচিতি' : 'Donor Info'}</th>
                          <th className="py-3.5 px-4">{language === 'bn' ? 'মোবাইল নম্বর' : 'Phone'}</th>
                          <th className="py-3.5 px-4">{language === 'bn' ? 'অনুদানের পরিমাণ' : 'Amount'}</th>
                          <th className="py-3.5 px-4">{language === 'bn' ? 'পেমেন্ট মাধ্যম' : 'Medium / Method'}</th>
                          <th className="py-3.5 px-4">{language === 'bn' ? 'প্রেরক নম্বর ও TrxID' : 'Sender & TrxID'}</th>
                          <th className="py-3.5 px-4">{language === 'bn' ? 'তারিখ ও সময়' : 'Date & Time'}</th>
                          <th className="py-3.5 px-4 text-right">{language === 'bn' ? 'অ্যাকশন' : 'Actions'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {paginatedDonations.map((d, idx) => {
                          const isBkash = d.paymentMethod?.toLowerCase().includes('bkash');
                          const isNagad = d.paymentMethod?.toLowerCase().includes('nagad');
                          const isRocket = d.paymentMethod?.toLowerCase().includes('rocket');
                          return (
                            <tr
                              key={d.id || idx}
                              onClick={() => setSelectedDonation(d)}
                              className="hover:bg-rose-50/50 transition-colors cursor-pointer group"
                            >
                              <td className="py-3.5 px-3 text-gray-500 font-mono font-bold">
                                {donationStartIndex + idx + 1}
                              </td>
                              <td className="py-3.5 px-4 font-mono font-bold text-rose-900">
                                <span className="bg-rose-50 border border-rose-200 px-2 py-0.5 rounded text-[11px]">
                                  {d.receiptNo}
                                </span>
                              </td>
                              <td className="py-3.5 px-4">
                                <div className="font-black text-gray-900 text-sm">
                                  {d.payerNameBn || d.payerName}
                                </div>
                                {d.payerName && d.payerName !== d.payerNameBn && (
                                  <div className="text-[11px] text-gray-500">{d.payerName}</div>
                                )}
                                {(d.batch || d.session) && (
                                  <div className="text-[11px] font-bold text-emerald-800">
                                    {d.batch && `ব্যাচ: ${d.batch}`} {d.session && `(${d.session})`}
                                  </div>
                                )}
                                {d.note && (
                                  <div className="text-[10px] text-gray-500 italic mt-0.5 line-clamp-1">
                                    "{d.note}"
                                  </div>
                                )}
                              </td>
                              <td className="py-3.5 px-4 font-mono font-bold text-gray-800">
                                {d.phone || d.senderNumber || '—'}
                              </td>
                              <td className="py-3.5 px-4">
                                <span className="text-sm sm:text-base font-black text-rose-950 font-mono bg-rose-100/70 border border-rose-300/80 px-2.5 py-1 rounded-xl shadow-2xs">
                                  ৳ {(Number(d.amount) || 0).toLocaleString('bn-BD')}
                                </span>
                              </td>
                              <td className="py-3.5 px-4">
                                <span
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black shadow-2xs ${
                                    isBkash
                                      ? 'bg-pink-100 text-[#D12053] border border-pink-300'
                                      : isNagad
                                      ? 'bg-orange-100 text-[#c75e00] border border-orange-300'
                                      : isRocket
                                      ? 'bg-purple-100 text-[#8C3494] border border-purple-300'
                                      : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                  }`}
                                >
                                  <span className="w-2 h-2 rounded-full bg-current" />
                                  <span>{d.paymentMethod || 'Manual'}</span>
                                </span>
                              </td>
                              <td className="py-3.5 px-4">
                                <div className="text-xs font-mono font-bold text-gray-800">
                                  {d.senderNumber || d.phone || '—'}
                                </div>
                                <div
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (d.transactionId) {
                                      navigator.clipboard.writeText(d.transactionId);
                                      showToast(language === 'bn' ? 'TrxID কপি হয়েছে!' : 'TrxID Copied!');
                                    }
                                  }}
                                  className="text-[11px] font-mono font-bold text-rose-900 hover:text-rose-700 flex items-center gap-1 cursor-pointer select-all"
                                  title="Click to copy TrxID"
                                >
                                  <span>{d.transactionId || 'N/A'}</span>
                                  <Copy className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                              </td>
                              <td className="py-3.5 px-4 text-xs text-gray-600">
                                <div>{d.createdAt ? new Date(d.createdAt).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</div>
                                <div className="text-[10px] text-gray-400 font-mono">
                                  {d.createdAt ? new Date(d.createdAt).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }) : ''}
                                </div>
                              </td>
                              <td className="py-3.5 px-4 text-right space-x-1.5" onClick={(e) => e.stopPropagation()}>
                                <button
                                  type="button"
                                  onClick={() => setSelectedDonation(d)}
                                  className="px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-800 hover:bg-rose-100 font-bold text-xs inline-flex items-center gap-1 transition-colors cursor-pointer border border-rose-200"
                                  title={language === 'bn' ? 'মানি রসিদ দেখুন ও প্রিন্ট করুন' : 'View & Print Money Receipt'}
                                >
                                  <Receipt className="w-3.5 h-3.5 text-rose-700" />
                                  <span>{language === 'bn' ? 'মানি রসিদ' : 'Receipt'}</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteDonation(d.id)}
                                  className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors cursor-pointer inline-flex items-center"
                                  title={language === 'bn' ? 'ডোনেশন ডিলিট' : 'Delete Donation'}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Admin 10-Item Donation Pagination Bar */}
                  {totalDonationPages > 1 && (
                    <div className="bg-rose-50/60 border-t border-rose-100 p-3.5 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="text-xs font-bold text-rose-950 text-center sm:text-left">
                        {language === 'bn' ? (
                          <span>
                            মোট <strong className="text-rose-700">{totalDonationCount}</strong> টি রেকর্ডের মধ্যে{' '}
                            <strong className="text-gray-900">{donationStartIndex + 1} - {donationEndIndex}</strong> পর্যন্ত দেখানো হচ্ছে{' '}
                            <span className="text-gray-500 font-normal">(পৃষ্ঠা {donationPage} / {totalDonationPages})</span>
                          </span>
                        ) : (
                          <span>
                            Showing <strong className="text-gray-900">{donationStartIndex + 1} - {donationEndIndex}</strong> of{' '}
                            <strong className="text-rose-700">{totalDonationCount}</strong> records{' '}
                            <span className="text-gray-500 font-normal">(Page {donationPage} of {totalDonationPages})</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleDonationPageChange(donationPage - 1)}
                          disabled={donationPage === 1}
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                            donationPage === 1
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                              : 'bg-white hover:bg-rose-100 text-rose-900 border border-rose-200 shadow-2xs cursor-pointer active:scale-95'
                          }`}
                        >
                          <ChevronLeft className="w-4 h-4" />
                          <span>{language === 'bn' ? 'পূর্ববর্তী' : 'Previous'}</span>
                        </button>

                        <div className="flex items-center gap-1">
                          {Array.from({ length: totalDonationPages }, (_, i) => i + 1).map((pageNum) => (
                            <button
                              key={pageNum}
                              type="button"
                              onClick={() => handleDonationPageChange(pageNum)}
                              className={`min-w-[32px] h-[32px] px-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center ${
                                pageNum === donationPage
                                  ? 'bg-rose-700 text-white shadow-xs scale-105 ring-2 ring-rose-300'
                                  : 'bg-white hover:bg-rose-50 text-gray-700 border border-gray-200'
                              }`}
                            >
                              {pageNum}
                            </button>
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDonationPageChange(donationPage + 1)}
                          disabled={donationPage === totalDonationPages}
                          className={`inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
                            donationPage === totalDonationPages
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                              : 'bg-rose-700 hover:bg-rose-800 text-white shadow-xs cursor-pointer active:scale-95 ring-1 ring-rose-600'
                          }`}
                        >
                          <span>{language === 'bn' ? 'পরবর্তী' : 'Next'}</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB: ADVICE & FEEDBACK BOX ================= */}
        {activeTab === 'feedbacks' && (
          <div className="space-y-5 animate-in fade-in duration-300">
            {/* Header Banner */}
            <div className="bg-gradient-to-br from-[#004d38] via-[#005a40] to-[#003828] text-white p-5 sm:p-6 rounded-2xl border-2 border-emerald-500/30 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-lg sm:text-xl font-black font-serif-bn flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-amber-300 shrink-0" />
                  <span>{language === 'bn' ? 'উদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশন পরামর্শ ও মতামত বক্স' : 'Botany Alumni Association Advice & Feedback Box'}</span>
                </h2>
                <p className="text-xs text-emerald-100/90 font-normal">
                  {language === 'bn'
                    ? 'হোমপেইজের পরামর্শ ফরম থেকে জমাকৃত সকল বার্তা, নাম, ব্যাচ, যোগাযোগ ও বিশদ বিবরণ।'
                    : 'All advice and messages submitted via the homepage portal.'}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                <span className="bg-white/10 text-white font-mono text-xs px-3 py-1.5 rounded-xl border border-white/20">
                  মোট: {feedbacks.length} টি
                </span>
                {unreadFeedbacksCount > 0 && (
                  <span className="bg-rose-500 text-white font-mono text-xs px-3 py-1.5 rounded-xl font-bold animate-pulse">
                    {unreadFeedbacksCount} টি অপঠিত
                  </span>
                )}
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Search input */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={feedbackSearch}
                  onChange={(e) => setFeedbackSearch(e.target.value)}
                  placeholder={language === 'bn' ? 'নাম, ব্যাচ, ফোন/ইমেইল বা বিষয় দিয়ে খুঁজুন...' : 'Search by name, batch, phone, email, subject...'}
                  className="w-full pl-9 pr-8 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 bg-gray-50 focus:bg-white transition-colors"
                />
                {feedbackSearch && (
                  <button
                    onClick={() => setFeedbackSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Status Filter Buttons */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                <button
                  onClick={() => setFeedbackStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors whitespace-nowrap ${
                    feedbackStatusFilter === 'all'
                      ? 'bg-[#006a4e] text-white shadow-xs'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {language === 'bn' ? `সকল (${feedbacks.length})` : `All (${feedbacks.length})`}
                </button>
                <button
                  onClick={() => setFeedbackStatusFilter('unread')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors whitespace-nowrap ${
                    feedbackStatusFilter === 'unread'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-rose-50 hover:bg-rose-100 text-rose-700'
                  }`}
                >
                  {language === 'bn' ? `নতুন অপঠিত (${unreadFeedbacksCount})` : `Unread (${unreadFeedbacksCount})`}
                </button>
                <button
                  onClick={() => setFeedbackStatusFilter('read')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors whitespace-nowrap ${
                    feedbackStatusFilter === 'read'
                      ? 'bg-gray-700 text-white shadow-xs'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {language === 'bn'
                    ? `পঠিত (${feedbacks.filter((f) => f.status === 'read').length})`
                    : `Read (${feedbacks.filter((f) => f.status === 'read').length})`}
                </button>
                <button
                  onClick={() => setFeedbackStatusFilter('resolved')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors whitespace-nowrap ${
                    feedbackStatusFilter === 'resolved'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {language === 'bn'
                    ? `গৃহীত (${feedbacks.filter((f) => f.status === 'resolved').length})`
                    : `Resolved (${feedbacks.filter((f) => f.status === 'resolved').length})`}
                </button>
              </div>
            </div>

            {/* Content List */}
            {feedbacks.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-emerald-100 text-center text-xs text-gray-400 space-y-3">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 text-[#006a4e] flex items-center justify-center">
                  <Inbox className="w-7 h-7 stroke-[2]" />
                </div>
                <p className="font-bold text-gray-600 text-sm">
                  {language === 'bn' ? 'কোনো পরামর্শ ও মতামত জমা পড়েনি' : 'No suggestions received yet'}
                </p>
              </div>
            ) : (() => {
              const displayList = feedbacks.filter((f) => {
                if (feedbackStatusFilter === 'unread' && f.status && f.status !== 'unread') return false;
                if (feedbackStatusFilter === 'read' && f.status !== 'read') return false;
                if (feedbackStatusFilter === 'resolved' && f.status !== 'resolved') return false;

                if (feedbackSearch.trim()) {
                  const q = feedbackSearch.toLowerCase().trim();
                  const sName = (f.senderName || f.name || '').toLowerCase();
                  const sBatch = (f.senderBatch || f.batch || f.occupation || '').toLowerCase();
                  const sContact = (f.senderContact || [f.phone, f.email].filter(Boolean).join(' ') || '').toLowerCase();
                  const sSubject = (f.subject || '').toLowerCase();
                  const sMessage = (f.message || '').toLowerCase();
                  return sName.includes(q) || sBatch.includes(q) || sContact.includes(q) || sSubject.includes(q) || sMessage.includes(q);
                }
                return true;
              });

              if (displayList.length === 0) {
                return (
                  <div className="bg-white p-10 rounded-2xl border border-gray-200 text-center text-xs text-gray-400 space-y-2">
                    <p className="font-bold text-gray-600 text-sm">
                      {language === 'bn' ? 'এই ফিল্টারে কোনো বার্তা পাওয়া যায়নি' : 'No feedback matches this filter'}
                    </p>
                    <button
                      onClick={() => { setFeedbackSearch(''); setFeedbackStatusFilter('all'); }}
                      className="text-emerald-700 font-bold hover:underline cursor-pointer"
                    >
                      {language === 'bn' ? 'ফিল্টার রিসেট করুন' : 'Reset Filter'}
                    </button>
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5">
                  {displayList.map((f) => {
                    const sName = f.senderName || f.name || (language === 'bn' ? 'নাম উল্লেখ নেই' : 'No Name');
                    const sBatch = f.senderBatch || f.batch || f.occupation || (language === 'bn' ? 'উল্লেখ নেই' : 'Not specified');
                    const sContact = f.senderContact || [f.phone, f.email].filter(Boolean).join(' • ') || (language === 'bn' ? 'উল্লেখ নেই' : 'Not specified');
                    const sSubject = f.subject || (language === 'bn' ? 'সাধারণ মতামত ও পরামর্শ' : 'General Feedback');
                    const sMessage = f.message || '';

                    // Timestamp parsing
                    let dateStr = '';
                    let timeStr = '';
                    if (f.createdAt) {
                      try {
                        let d: Date;
                        if (typeof f.createdAt === 'string') d = new Date(f.createdAt);
                        else if (f.createdAt?.toDate && typeof f.createdAt.toDate === 'function') d = f.createdAt.toDate();
                        else if (f.createdAt?.seconds) d = new Date(f.createdAt.seconds * 1000);
                        else d = new Date(f.createdAt);

                        if (!isNaN(d.getTime())) {
                          dateStr = d.toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          });
                          timeStr = d.toLocaleTimeString(language === 'bn' ? 'bn-BD' : 'en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          });
                        }
                      } catch {
                        // ignore
                      }
                    }

                    return (
                      <div
                        key={f.id}
                        className={`bg-white rounded-2xl border transition-all flex flex-col justify-between shadow-xs hover:shadow-md p-4 sm:p-5 space-y-3.5 ${
                          !f.status || f.status === 'unread'
                            ? 'border-emerald-400 bg-emerald-50/15 ring-1 ring-emerald-300'
                            : 'border-gray-200 hover:border-emerald-200'
                        }`}
                      >
                        <div className="space-y-3">
                          {/* Card Top: Status & Date/Time */}
                          <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-2.5">
                            <span
                              className={`text-[10px] sm:text-[11px] font-black px-2.5 py-0.5 rounded-full border ${
                                f.status === 'resolved'
                                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                  : f.status === 'read'
                                  ? 'bg-gray-100 text-gray-700 border-gray-200'
                                  : 'bg-rose-100 text-rose-800 border-rose-200 animate-pulse'
                              }`}
                            >
                              {f.status === 'resolved'
                                ? (language === 'bn' ? 'বাস্তবায়িত / পর্যালোচিত' : 'Resolved')
                                : f.status === 'read'
                                ? (language === 'bn' ? 'পঠিত' : 'Read')
                                : (language === 'bn' ? 'নতুন অপঠিত' : 'New Unread')}
                            </span>

                            <div className="text-[10px] sm:text-[11px] text-gray-500 font-mono flex items-center gap-1 shrink-0">
                              <Calendar className="w-3 h-3 text-gray-400" />
                              <span>{dateStr || '—'}</span>
                              {timeStr && <span className="text-gray-400">({timeStr})</span>}
                            </div>
                          </div>

                          {/* Field 1: আপনার নাম */}
                          <div className="bg-gray-50/90 rounded-xl p-2.5 border border-gray-100 space-y-0.5">
                            <span className="text-[10px] font-bold text-gray-500 flex items-center gap-1">
                              <User className="w-3 h-3 text-[#006a4e]" />
                              <span>{language === 'bn' ? 'আপনার নাম:' : 'Name:'}</span>
                            </span>
                            <h3 className="font-bold text-sm text-gray-900 leading-tight">
                              {sName}
                            </h3>
                          </div>

                          {/* Two Column Grid: Field 2 (ব্যাচ / পরিচিতি) & Field 3 (ফোন বা ইমেইল) */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {/* Field 2: ব্যাচ / পরিচিতি */}
                            <div className="bg-gray-50/90 rounded-xl p-2.5 border border-gray-100 space-y-0.5">
                              <span className="text-[10px] font-bold text-gray-500 flex items-center gap-1">
                                <Info className="w-3 h-3 text-[#006a4e]" />
                                <span>{language === 'bn' ? 'ব্যাচ / পরিচিতি:' : 'Batch / Identity:'}</span>
                              </span>
                              <div className="text-xs font-bold text-[#006a4e] truncate" title={sBatch}>
                                {sBatch}
                              </div>
                            </div>

                            {/* Field 3: ফোন বা ইমেইল */}
                            <div className="bg-gray-50/90 rounded-xl p-2.5 border border-gray-100 space-y-0.5">
                              <span className="text-[10px] font-bold text-gray-500 flex items-center gap-1">
                                <Phone className="w-3 h-3 text-[#006a4e]" />
                                <span>{language === 'bn' ? 'ফোন বা ইমেইল:' : 'Phone / Email:'}</span>
                              </span>
                              <div className="text-xs font-bold text-gray-800 truncate" title={sContact}>
                                {sContact.includes('@') ? (
                                  <a href={`mailto:${sContact}`} className="text-emerald-700 hover:underline">
                                    {sContact}
                                  </a>
                                ) : /^[0-9+ -]+$/.test(sContact) ? (
                                  <a href={`tel:${sContact}`} className="text-emerald-700 hover:underline">
                                    {sContact}
                                  </a>
                                ) : (
                                  <span>{sContact}</span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Field 4: বিষয় */}
                          <div className="bg-emerald-50/60 rounded-xl p-2.5 border border-emerald-200/80 space-y-0.5">
                            <span className="text-[10px] font-bold text-emerald-800 flex items-center gap-1">
                              <FileText className="w-3 h-3 text-[#006a4e]" />
                              <span>{language === 'bn' ? 'বিষয়:' : 'Subject:'}</span>
                            </span>
                            <div className="text-xs font-black text-emerald-950 leading-snug">
                              {sSubject}
                            </div>
                          </div>

                          {/* Field 5: আপনার মূল বার্তা / পরামর্শের বিশদ বিবরণ */}
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-gray-600 flex items-center gap-1">
                              <MessageSquareHeart className="w-3 h-3 text-[#006a4e]" />
                              <span>{language === 'bn' ? 'আপনার মূল বার্তা / পরামর্শের বিশদ বিবরণ:' : 'Detailed Advice / Message:'}</span>
                            </span>
                            <div className="text-xs text-gray-800 bg-gray-50/80 p-3 rounded-xl border border-gray-200 leading-relaxed max-h-40 overflow-y-auto whitespace-pre-wrap font-sans select-text">
                              {sMessage}
                            </div>
                          </div>
                        </div>

                        {/* Card Bottom: Actions */}
                        <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-1.5 flex-wrap text-xs">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {(!f.status || f.status === 'unread') && (
                              <button
                                onClick={() => handleUpdateFeedbackStatus(f.id, 'read')}
                                className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-[11px] font-bold cursor-pointer transition-colors"
                              >
                                {language === 'bn' ? 'পঠিত' : 'Mark Read'}
                              </button>
                            )}
                            {f.status === 'read' && (
                              <button
                                onClick={() => handleUpdateFeedbackStatus(f.id, 'unread')}
                                className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-[11px] font-bold cursor-pointer transition-colors"
                              >
                                {language === 'bn' ? 'অপঠিত' : 'Unread'}
                              </button>
                            )}
                            {f.status !== 'resolved' && (
                              <button
                                onClick={() => handleUpdateFeedbackStatus(f.id, 'resolved')}
                                className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg text-[11px] font-bold cursor-pointer transition-colors"
                              >
                                {language === 'bn' ? 'গৃহীত' : 'Resolved'}
                              </button>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            {(f.email || sContact.includes('@')) && (
                              <button
                                onClick={() =>
                                  handleOpenEmailModal({
                                    name: sName,
                                    email: f.email || (sContact.includes('@') ? sContact : ''),
                                  })
                                }
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors"
                                title={language === 'bn' ? 'ইমেইল পাঠান' : 'Send Email'}
                              >
                                <Mail className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => setSelectedFeedback(f)}
                              className="p-1.5 text-[#006a4e] hover:bg-emerald-50 rounded-lg cursor-pointer transition-colors"
                              title={language === 'bn' ? 'পূর্ণাঙ্গ বিবরণ দেখুন' : 'View Full Details'}
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                const txt = `[উদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশন পরামর্শ ও মতামত]
আপনার নাম: ${sName}
ব্যাচ / পরিচিতি: ${sBatch}
ফোন বা ইমেইল: ${sContact}
বিষয়: ${sSubject}
জমার তারিখ ও সময়: ${dateStr} ${timeStr}

আপনার মূল বার্তা / পরামর্শের বিশদ বিবরণ:
${sMessage}`;
                                navigator.clipboard.writeText(txt);
                                showToast(language === 'bn' ? 'পরামর্শের সম্পূর্ণ বিবরণ কপি হয়েছে।' : 'Feedback copied to clipboard.');
                              }}
                              className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
                              title={language === 'bn' ? 'কপি করুন' : 'Copy'}
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteFeedback(f.id)}
                              className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                              title={language === 'bn' ? 'মুছে ফেলুন' : 'Delete'}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}

        {/* ================= TAB 4: NOTICES & BULLETINS ================= */}
        {activeTab === 'notices' && (
          <div className="space-y-5 animate-in fade-in duration-300">
            <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-gray-900 font-serif-bn flex items-center gap-2">
                  <Bell className="w-5 h-5 text-[#006a4e]" />
                  <span>{language === 'bn' ? 'নোটিশ, বিজ্ঞপ্তি ও প্রেস রিলিজ প্রকাশনা' : 'Notices & Press Releases'}</span>
                </h2>
                <p className="text-xs text-gray-500">
                  {language === 'bn'
                    ? 'উদ্ভিদবিজ্ঞান বিভাগ ও অ্যালামনাই অ্যাসোসিয়েশনের জন্য নতুন নোটিশ ও প্রেস বিজ্ঞপ্তি প্রকাশ করুন।'
                    : 'Publish departmental announcements directly to the live website.'}
                </p>
              </div>

              <button
                onClick={() => setNewNoticeModal(true)}
                className="px-4 py-2.5 bg-[#006a4e] hover:bg-[#00523d] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{language === 'bn' ? 'নতুন নোটিশ তৈরি করুন' : 'Add New Notice'}</span>
              </button>
            </div>

            {/* Notice List */}
            <div className="space-y-3">
              {notices.length === 0 ? (
                <div className="bg-white p-12 rounded-2xl border border-emerald-100 text-center text-xs text-gray-400 space-y-2">
                  <Bell className="w-10 h-10 mx-auto text-gray-300" />
                  <p className="font-bold text-gray-600 text-sm">
                    {language === 'bn' ? 'কোনো নোটিশ তৈরি করা হয়নি' : 'No notices published yet'}
                  </p>
                  <button
                    onClick={() => setNewNoticeModal(true)}
                    className="text-xs text-[#006a4e] font-bold hover:underline"
                  >
                    {language === 'bn' ? '+ প্রথম নোটিশ প্রকাশ করুন' : '+ Publish First Notice'}
                  </button>
                </div>
              ) : (
                notices.map((n) => (
                  <div
                    key={n.id}
                    className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {n.isUrgent && (
                          <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {language === 'bn' ? 'জরুরি ঘোষণা' : 'Urgent'}
                          </span>
                        )}
                        <span className="bg-emerald-50 text-[#006a4e] border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {n.category}
                        </span>
                        <span className="text-[11px] text-gray-400 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {n.date}
                        </span>
                        {n.imageUrl && (
                          <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <ImageIcon className="w-3 h-3" />
                            <span>{language === 'bn' ? 'ছবি সংলগ্ন' : 'Image Attached'}</span>
                          </span>
                        )}
                        {n.pdfUrl && (
                          <span className="bg-blue-100 text-blue-800 border border-blue-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            <span>{language === 'bn' ? 'PDF সংলগ্ন' : 'PDF Attached'}</span>
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-base text-gray-900">{n.title}</h3>
                      <p className="text-xs text-gray-600 leading-relaxed">{n.description}</p>

                      {(n.imageUrl || n.pdfUrl) && (
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          {n.imageUrl && (
                            <img
                              src={n.imageUrl}
                              alt="Notice preview"
                              className="h-14 w-20 object-cover rounded-lg border border-emerald-200 cursor-pointer hover:opacity-90"
                              onClick={() => {
                                const win = window.open();
                                win?.document.write(`<img src="${n.imageUrl}" style="max-width:100%"/>`);
                              }}
                              title="ছবি দেখতে ক্লিক করুন"
                            />
                          )}
                          {n.pdfUrl && (
                            <a
                              href={n.pdfUrl}
                              download={n.pdfFileName || 'notice.pdf'}
                              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                            >
                              <FileText className="w-3.5 h-3.5 text-red-600" />
                              <span>{n.pdfFileName || 'PDF নথি'}</span>
                              <Download className="w-3 h-3 text-blue-600" />
                            </a>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                      <button
                        onClick={() => openNoticePdf({
                          id: n.id,
                          titleBn: n.title,
                          titleEn: n.title,
                          date: n.date,
                          isNew: !!n.isUrgent,
                          category: 'general',
                          categoryBn: n.category,
                          categoryEn: n.category,
                          refNo: n.id,
                          detailsBn: n.description,
                          detailsEn: n.description,
                          imageUrl: n.imageUrl,
                          pdfUrl: n.pdfUrl,
                          pdfFileName: n.pdfFileName
                        }, language)}
                        className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-[#006a4e] border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        title={language === 'bn' ? 'অফিসিয়াল নোটিশ দেখুন' : 'View Official Notice'}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{language === 'bn' ? 'প্রিভিউ' : 'Preview'}</span>
                      </button>
                      <button
                        onClick={() => handleDeleteNotice(n.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                        title={language === 'bn' ? 'মুছে ফেলুন' : 'Delete'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ================= TAB: RECENT NEWS MANAGEMENT ================= */}
        {activeTab === 'recent-news' && (
          <div className="space-y-5 animate-in fade-in duration-300">
            <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900 font-serif-bn flex items-center gap-2">
                  <Newspaper className="w-5 h-5 text-[#006a4e]" />
                  <span>{language === 'bn' ? 'সাম্প্রতিক খবর পোস্ট ও ব্যবস্থাপনা' : 'Recent News Management'}</span>
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {language === 'bn'
                    ? 'ওয়েবসাইটের হোমপেইজ স্লাইডার ও সাম্প্রতিক খবর সেকশনে প্রদর্শনের জন্য খবর প্রকাশ ও সম্পাদন করুন।'
                    : 'Publish and update recent news items displayed on the website hero slider and news portal.'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleOpenCreateNews}
                  className="px-4 py-2.5 bg-[#006a4e] hover:bg-[#00523d] text-white rounded-xl text-sm font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{language === 'bn' ? 'নতুন খবর পোস্ট করুন' : 'Post New News'}</span>
                </button>
              </div>
            </div>

            {/* News List */}
            <div className="space-y-4">
              {recentNewsItems.length === 0 ? (
                <div className="bg-white p-12 rounded-2xl border border-emerald-100 text-center text-xs text-gray-400 space-y-3">
                  <Newspaper className="w-12 h-12 mx-auto text-emerald-200" />
                  <p className="font-bold text-gray-700 text-sm">
                    {language === 'bn' ? 'কোনো সাম্প্রতিক খবর প্রকাশিত হয়নি' : 'No news posts published yet'}
                  </p>
                  <div className="flex justify-center items-center gap-3 pt-2">
                    <button
                      onClick={handleOpenCreateNews}
                      className="px-4 py-2 bg-[#006a4e] text-white font-bold rounded-xl text-xs hover:bg-[#00523d] transition-colors cursor-pointer"
                    >
                      {language === 'bn' ? '+ নতুন খবর পোস্ট করুন' : '+ Post Custom News'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recentNewsItems.map((post) => (
                    <div
                      key={post.id}
                      className="bg-white rounded-2xl border border-emerald-100 p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-2.5">
                        <div className="relative h-44 w-full rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                          <img
                            src={post.imageUrl || 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=1000&q=80'}
                            alt={post.titleBn}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 left-2 bg-[#006a4e]/90 text-white text-[11px] font-bold px-2.5 py-1 rounded-md shadow-xs">
                            {post.categoryBn}
                          </div>
                          <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] font-medium px-2 py-0.5 rounded-md flex items-center gap-1 backdrop-blur-xs">
                            <Calendar className="w-3 h-3 text-amber-300" />
                            <span>{post.date}</span>
                          </div>
                        </div>

                        <h3 className="font-bold text-sm sm:text-base text-gray-900 font-serif-bn leading-snug line-clamp-2">
                          {post.titleBn}
                        </h3>

                        <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
                          {post.summaryBn}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <span className="text-[11px] text-gray-400 font-mono">
                          ID: {post.id}
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenEditNews(post)}
                            className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5 text-amber-700" />
                            <span>{language === 'bn' ? 'সম্পাদনা' : 'Edit'}</span>
                          </button>

                          <button
                            onClick={() => handleDeleteNews(post.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                            title={language === 'bn' ? 'মুছে ফেলুন' : 'Delete'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB: COMMUNITY STATS SETTINGS ================= */}
        {activeTab === 'community-stats' && (
          <div className="animate-in fade-in duration-300">
            <CommunityStatsAdminEditor
              language={language}
              onShowToast={showToast}
            />
          </div>
        )}

        {/* ================= TAB 5: EMAIL SETTINGS & TEMPLATES ================= */}
        {activeTab === 'email' && (
          <div className="animate-in fade-in duration-300">
            <EmailTemplateSettings
              language={language}
              members={memberships}
              onShowToast={showToast}
            />
          </div>
        )}
      </main>
        </div>
      </div>

      {/* ================= MODAL: MEMBER APPLICATION FORM (FILLED OFFICIAL REGISTRATION FORM IN ENGLISH) ================= */}
      {selectedMember && (() => {
        const dateStr = selectedMember.applicationDate || (selectedMember.createdAt ? new Date(selectedMember.createdAt).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB'));
        const memId = selectedMember.formNo || selectedMember.membershipId || selectedMember.id;
        const nameEn = selectedMember.applicantNameEn || selectedMember.nameEnglish || selectedMember.fullName || '';
        const nameBn = selectedMember.applicantNameBn || selectedMember.nameBangla || selectedMember.fullName || '';
        const bscSess = selectedMember.bscSession || selectedMember.session || '';
        const bscYr = selectedMember.bscYear || '';
        const bscBt = selectedMember.bscBatch || selectedMember.batch || '';
        const mscSess = selectedMember.mscSession || '';
        const mscYr = selectedMember.mscYear || '';
        const mscBt = selectedMember.mscBatch || '';
        const mphilYr = selectedMember.mphilYear || '';
        const phdYr = selectedMember.phdYear || '';
        const fName = selectedMember.fathersName || '';
        const mName = selectedMember.mothersName || '';
        const presAddr = selectedMember.presentAddress || '';
        const pVillage = selectedMember.permVillage || selectedMember.village || '';
        const pPost = selectedMember.permPost || selectedMember.post || '';
        const pUpazila = selectedMember.permUpazila || selectedMember.upazila || '';
        const pDistrict = selectedMember.permDistrict || selectedMember.district || '';
        
        let dDay = selectedMember.dobDay || '';
        let dMonth = selectedMember.dobMonth || '';
        let dYear = selectedMember.dobYear || '';
        if ((!dDay || !dMonth || !dYear) && selectedMember.dateOfBirth) {
          const parts = selectedMember.dateOfBirth.split(/[-/.]/);
          if (parts.length === 3) {
            dDay = parts[0];
            dMonth = parts[1];
            dYear = parts[2];
          }
        }

        const em = selectedMember.email || '';
        const ph = selectedMember.phone || selectedMember.mobile || '';
        const bg = selectedMember.bloodGroup || '';
        const nid = selectedMember.nidNumber || '';
        const occ = selectedMember.occupation || selectedMember.occupationCategory || '';
        const otherOcc = selectedMember.otherOccupation || '';
        const photo = selectedMember.userPhotoUrl || selectedMember.photoUrl || '';
        const sigUrl = selectedMember.signatureDataUrl || '';
        const sigName = selectedMember.signatureName || nameEn || nameBn;
        const memType = selectedMember.membershipType === 'life' ? 'Life Member' : selectedMember.membershipType === 'student' ? 'Student Member' : 'General Member';
        const fee = selectedMember.feeAmount || (selectedMember.membershipType === 'life' ? '2500' : '500');
        const pMethod = selectedMember.paymentMethod || 'bKash';
        const sender = selectedMember.senderNumber || '';
        const trxId = selectedMember.transactionId || '';
        const docName = selectedMember.degreeDocName || (selectedMember.degreeDocData ? 'degree_certificate' : '');
        const docData = selectedMember.degreeDocData || selectedMember.degreeDocUrl || '';

        return (
          <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto font-sans animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl sm:rounded-3xl max-w-4xl w-full p-4 sm:p-6 space-y-4 shadow-2xl border-2 border-[#006a4e] relative my-4 sm:my-6 max-h-[92vh] overflow-y-auto">
              
              {/* Modal Top Bar (no-print) */}
              <div className="no-print flex items-center justify-between border-b border-gray-200 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 shrink-0 flex items-center justify-center bg-white rounded-full p-0.5 border border-emerald-300 shadow-2xs">
                    <img
                      src="/jnu_botany_alumni_logo.jpg"
                      alt="Botany Alumni Logo"
                      className="w-full h-full object-contain rounded-full"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://upload.wikimedia.org/wikipedia/en/thumb/2/23/Jagannath_University_Logo.svg/512px-Jagannath_University_Logo.svg.png";
                      }}
                    />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base sm:text-lg text-gray-900 font-sans flex items-center gap-2">
                      <span>Membership Application Form</span>
                      <span className="text-[10px] font-bold bg-emerald-100 text-[#006a4e] px-2 py-0.5 rounded-full border border-emerald-300 uppercase">
                        Official View
                      </span>
                    </h3>
                    <p className="text-xs text-gray-500 font-mono">
                      Form No: <strong className="text-[#006a4e]">{memId}</strong> | Applicant: <strong className="text-gray-800">{nameEn || nameBn}</strong>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleDownloadMemberPdf(selectedMember)}
                    disabled={isGeneratingMemberPdf}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                    title={language === 'bn' ? 'অফিসিয়াল আবেদনপত্রের PDF ডাউনলোড করুন' : 'Download Official PDF'}
                  >
                    {isGeneratingMemberPdf ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span className="hidden sm:inline">{language === 'bn' ? 'প্রস্তুত হচ্ছে...' : 'Generating...'}</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{language === 'bn' ? 'PDF ডাউনলোড' : 'Download PDF'}</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePrintMemberForm(selectedMember)}
                    className="px-3 py-1.5 bg-[#006a4e] hover:bg-[#004d38] text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                    title={language === 'bn' ? 'আবেদনপত্র প্রিন্ট করুন' : 'Print Form'}
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'প্রিন্ট ফর্ম' : 'Print Form'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedMember(null)}
                    className="text-gray-400 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100 text-xl font-bold cursor-pointer transition-colors leading-none"
                    title="Close"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Transaction Verification & Quick Approve Bar (no-print) */}
              {selectedMember.status !== 'approved' || selectedMember.paymentStatus === 'unpaid' || selectedMember.paymentMethod === 'Unpaid' ? (
                <div className="no-print bg-amber-50 border-2 border-amber-300 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 bg-amber-500 text-white rounded-xl shadow-xs shrink-0">
                      <Clock className="w-5 h-5 stroke-[2.5]" />
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <h4 className="text-xs sm:text-sm font-black text-amber-950">
                        {pMethod === 'Unpaid' || selectedMember.paymentStatus === 'unpaid'
                          ? (language === 'bn' ? 'অনিবন্ধিত সদস্য (পেমেন্ট Unpaid বাকি রয়েছে)' : 'Unregistered Member (Payment Unpaid)')
                          : (language === 'bn' ? 'অনিবন্ধিত আবেদন: ট্রানজেকশন যাচাই ও অনুমোদন' : 'Pending Verification: Approve to Register')}
                      </h4>
                      <div className="text-[11px] text-amber-900 flex flex-wrap items-center gap-2">
                        <span>ফি: <strong className="font-mono text-emerald-800">৳ {fee}/-</strong></span>
                        <span>•</span>
                        <span>মেথড: <strong>{pMethod}</strong></span>
                        {trxId && trxId !== 'UNPAID' && (
                          <>
                            <span>•</span>
                            <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-amber-300 font-bold text-rose-700">
                              TrxID: {trxId}
                            </span>
                          </>
                        )}
                        {sender && (
                          <>
                            <span>•</span>
                            <span className="font-mono">প্রেরক: <strong>{sender}</strong></span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleUpdateMemberStatus(selectedMember.id, 'approved')}
                      className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-sm cursor-pointer transition-all"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>
                        {pMethod === 'Unpaid' || selectedMember.paymentStatus === 'unpaid'
                          ? (language === 'bn' ? 'টাকা জমা হয়েছে - Paid চিহ্নিত করে নিবন্ধিত করুন' : 'Mark as Paid & Move to Registered List')
                          : (language === 'bn' ? 'ট্রানজেকশন সঠিক - এপ্রুভ করুন' : 'Confirm & Approve')}
                      </span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="no-print bg-emerald-50 border-2 border-emerald-300 rounded-xl p-3 flex items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                    <span className="text-xs font-black text-emerald-950">
                      {language === 'bn' ? 'এই সদস্য ইতিমধ্যে অনুমোদিত (Paid) এবং নিবন্ধিত তালিকায় রয়েছে।' : 'This member is approved (Paid) and active in the Registered List.'}
                    </span>
                  </div>
                  {selectedMember.email && (
                    <button
                      type="button"
                      onClick={() =>
                        handleOpenEmailModal({
                          name: selectedMember.applicantNameBn || selectedMember.fullName || 'Member',
                          email: selectedMember.email!,
                          formNo: selectedMember.formNo || selectedMember.membershipId,
                          membershipId: selectedMember.membershipId,
                        })
                      }
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>{language === 'bn' ? 'ইমেইল পাঠান' : 'Send Email'}</span>
                    </button>
                  )}
                </div>
              )}

              {/* ================= OFFICIAL PRINTABLE MEMBERSHIP FORM (IN ENGLISH) ================= */}
              <div
                id="a4-membership-form-print"
                className="w-full bg-white border-2 border-[#006a4e] p-4 sm:p-7 text-gray-900 relative shadow-sm font-sans"
              >
                {/* Top Header Banner */}
                <div className="w-full bg-[#006a4e] text-white p-2.5 sm:p-4 rounded-lg border-b-4 border-amber-400 flex flex-row items-center justify-between gap-2 sm:gap-4 relative mb-4 font-sans overflow-hidden shadow-xs">
                  {/* Alumni Logo Left */}
                  <div className="flex items-center shrink-0">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center bg-white rounded-full p-1 shadow-md border-2 border-amber-400/80">
                      <img
                        src="/jnu_botany_alumni_logo.jpg"
                        alt="Botany Alumni Logo"
                        className="w-full h-full object-contain rounded-full"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://upload.wikimedia.org/wikipedia/en/thumb/8/87/Logo_of_Jagannath_University.svg/512px-Logo_of_Jagannath_University.svg.png';
                        }}
                      />
                    </div>
                  </div>

                  {/* Center Official Title */}
                  <div className="text-center flex-1 space-y-0.5 px-1 min-w-0">
                    <h1 className="text-xs sm:text-base md:text-lg font-black text-amber-300 tracking-tight leading-tight uppercase font-['Plus_Jakarta_Sans',sans-serif]">
                      BOTANY ALUMNI ASSOCIATION
                      <span className="block text-xs sm:text-base md:text-lg font-black text-amber-200 mt-0.5">
                        {language === 'bn' ? 'জগন্নাথ বিশ্ববিদ্যালয়, ঢাকা' : 'Jagannath University, Dhaka'}
                      </span>
                    </h1>
                    <p className="text-[10px] sm:text-xs font-medium text-emerald-100/90 tracking-normal font-sans leading-tight">
                      9-10 Chittaranjan Ave, Dhaka 1100.
                    </p>
                    <div className="pt-0.5">
                      <span className="text-[10px] sm:text-xs font-bold text-white bg-[#004d38] px-3 py-0.5 rounded-full border border-amber-400/70 shadow-xs inline-block tracking-wide font-sans whitespace-nowrap">
                        Membership Application Form
                      </span>
                    </div>
                  </div>

                  {/* Photo Box Top Right */}
                  <div className="shrink-0 flex flex-col items-center font-sans">
                    <div className="w-16 h-20 sm:w-22 sm:h-26 border-2 border-amber-300 bg-[#004d38] rounded-md flex flex-col items-center justify-center text-center p-0.5 overflow-hidden shadow-inner relative">
                      {photo ? (
                        <img
                          src={photo}
                          alt="Applicant Photo"
                          className="w-full h-full object-cover rounded-sm"
                        />
                      ) : (
                        <div className="space-y-1 text-emerald-100 px-1">
                          <User className="w-6 h-6 sm:w-8 sm:h-8 mx-auto text-amber-300" />
                          <span className="text-[9px] sm:text-[10px] font-bold block leading-tight text-white">
                            Photo
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Form Body Fields (All in English) */}
                <div className="space-y-3.5 text-xs sm:text-sm font-sans">
                  
                  {/* Top Row: Date & Membership ID */}
                  <div className="flex flex-row justify-between items-center gap-2 mb-2 bg-emerald-50/50 p-2 sm:p-2.5 rounded-lg border border-emerald-200/80">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 text-xs sm:text-sm shrink-0">
                        Date:
                      </span>
                      <div className="min-w-[120px] border border-gray-400 rounded px-2.5 py-1 text-xs sm:text-sm font-bold font-mono text-gray-900 bg-white shadow-2xs">
                        {dateStr || '—'}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 text-xs sm:text-sm shrink-0">
                        Membership ID:
                      </span>
                      <div className="min-w-[140px] border border-gray-400 rounded px-2.5 py-1 text-xs sm:text-sm font-extrabold font-mono text-[#006a4e] bg-white shadow-2xs">
                        {memId || '—'}
                      </div>
                    </div>
                  </div>

                  {/* 1. Name of the Alumni: */}
                  <div className="space-y-2 border-b border-gray-300 pb-3">
                    <div className="font-bold text-[#004d38] text-xs sm:text-sm">
                      1. Name of the Alumni:
                    </div>
                    
                    <div className="grid grid-cols-1 gap-2 pl-0 sm:pl-4">
                      {/* In English : */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                        <span className="w-full sm:w-28 font-semibold text-gray-800 shrink-0 text-xs sm:text-sm">
                          In English <span className="hidden sm:inline float-right mr-1">:</span>
                        </span>
                        <div className="flex-1 border border-gray-400 rounded px-3 py-1.5 text-xs sm:text-sm font-bold text-gray-900 bg-white uppercase font-mono shadow-2xs">
                          {nameEn || '—'}
                        </div>
                      </div>

                      {/* In Bangla : */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                        <span className="w-full sm:w-28 font-semibold text-gray-800 shrink-0 text-xs sm:text-sm">
                          In Bangla <span className="hidden sm:inline float-right mr-1">:</span>
                        </span>
                        <div className="flex-1 border border-gray-400 rounded px-3 py-1.5 text-xs sm:text-sm font-bold text-gray-900 bg-white shadow-2xs">
                          {nameBn || '—'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 2. Information regarding degree earned from the Department of Botany: */}
                  <div className="space-y-2.5 border-b border-gray-300 pb-3">
                    <div className="font-bold text-[#004d38] text-xs sm:text-sm">
                      2. Information regarding degree earned from the Department of Botany:
                    </div>

                    <div className="space-y-2 pl-0 sm:pl-4">
                      {/* i) BSc Honours */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs sm:text-sm bg-gray-50/80 p-2 sm:p-0 rounded border border-gray-200 sm:border-none">
                        <span className="w-full sm:w-28 font-semibold text-gray-800 shrink-0">
                          i) BSc Honours <span className="hidden sm:inline float-right mr-1">:</span>
                        </span>
                        
                        <div className="grid grid-cols-3 sm:flex sm:flex-1 sm:items-center gap-1.5 sm:gap-x-2">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 flex-1">
                            <span className="text-gray-700 text-[11px] sm:text-xs shrink-0 font-medium">Session:</span>
                            <div className="w-full border border-gray-400 rounded px-2 py-1 text-xs font-bold font-mono text-gray-900 bg-white">
                              {bscSess || '—'}
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 w-full sm:w-32">
                            <span className="text-gray-700 text-[11px] sm:text-xs shrink-0 font-medium">Passing Year:</span>
                            <div className="w-full border border-gray-400 rounded px-2 py-1 text-xs font-bold font-mono text-gray-900 bg-white">
                              {bscYr || '—'}
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 w-full sm:w-36">
                            <span className="text-gray-700 text-[11px] sm:text-xs shrink-0 font-medium">Batch:</span>
                            <div className="w-full border border-gray-400 rounded px-2 py-1 text-xs font-bold text-gray-900 bg-white">
                              {bscBt || '—'}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* ii) MSc */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs sm:text-sm bg-gray-50/80 p-2 sm:p-0 rounded border border-gray-200 sm:border-none">
                        <span className="w-full sm:w-28 font-semibold text-gray-800 shrink-0">
                          ii) MSc <span className="hidden sm:inline float-right mr-1">:</span>
                        </span>
                        
                        <div className="grid grid-cols-3 sm:flex sm:flex-1 sm:items-center gap-1.5 sm:gap-x-2">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 flex-1">
                            <span className="text-gray-700 text-[11px] sm:text-xs shrink-0 font-medium">Session:</span>
                            <div className="w-full border border-gray-400 rounded px-2 py-1 text-xs font-mono text-gray-900 bg-white">
                              {mscSess || '—'}
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 w-full sm:w-32">
                            <span className="text-gray-700 text-[11px] sm:text-xs shrink-0 font-medium">Passing Year:</span>
                            <div className="w-full border border-gray-400 rounded px-2 py-1 text-xs font-mono text-gray-900 bg-white">
                              {mscYr || '—'}
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 w-full sm:w-36">
                            <span className="text-gray-700 text-[11px] sm:text-xs shrink-0 font-medium">Batch:</span>
                            <div className="w-full border border-gray-400 rounded px-2 py-1 text-xs text-gray-900 bg-white">
                              {mscBt || '—'}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* iii) MPhil & iv) PhD */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                        <div className="flex items-center gap-2 text-xs sm:text-sm">
                          <span className="w-20 sm:w-28 font-semibold text-gray-800 shrink-0">
                            iii) MPhil <span className="hidden sm:inline float-right mr-1">:</span>
                          </span>
                          <div className="flex items-center gap-1.5 flex-1">
                            <span className="text-gray-700 text-[11px] sm:text-xs shrink-0 font-medium">Passing Year:</span>
                            <div className="w-full border border-gray-400 rounded px-2 py-1 text-xs text-gray-900 bg-white font-mono">
                              {mphilYr || '—'}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs sm:text-sm">
                          <span className="w-20 sm:w-28 font-semibold text-gray-800 shrink-0">
                            iv) PhD <span className="hidden sm:inline float-right mr-1">:</span>
                          </span>
                          <div className="flex items-center gap-1.5 flex-1">
                            <span className="text-gray-700 text-[11px] sm:text-xs shrink-0 font-medium">Passing Year:</span>
                            <div className="w-full border border-gray-400 rounded px-2 py-1 text-xs text-gray-900 bg-white font-mono">
                              {phdYr || '—'}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* NB: Attached document */}
                      <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-gray-800 text-xs bg-emerald-50/80 p-2 sm:p-2.5 rounded border border-emerald-200">
                        <div className="flex items-start sm:items-center gap-1.5 font-medium">
                          <span className="inline-block w-2 h-2 bg-[#006a4e] shrink-0 mt-1 sm:mt-0 rounded-full"></span>
                          <span>
                            <strong className="text-emerald-950">NB:</strong> Attach a copy of certificate/marksheet/testimonial of BSc/MSc degree.
                          </span>
                        </div>

                        {docData || docName ? (
                          <div className="shrink-0 flex items-center gap-2">
                            {docData ? (
                              <button
                                type="button"
                                onClick={() => {
                                  if (docData.startsWith('data:image/') || docData.startsWith('http')) {
                                    const win = window.open();
                                    if (win) {
                                      win.document.write(`
                                        <!DOCTYPE html>
                                        <html>
                                          <head>
                                            <title>${docName || 'Degree Certificate / Marksheet'}</title>
                                            <style>
                                              body { margin:0; background:#0f172a; display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:100vh; color:#fff; font-family:sans-serif; }
                                              img { max-width:95%; max-height:90vh; border-radius:8px; box-shadow:0 10px 25px rgba(0,0,0,0.5); object-fit:contain; }
                                              .header { margin-bottom:12px; font-size:14px; color:#cbd5e1; }
                                            </style>
                                          </head>
                                          <body>
                                            <div class="header">📄 ${docName || 'Degree Certificate / Marksheet Document'}</div>
                                            <img src="${docData}" alt="Certificate Document" />
                                          </body>
                                        </html>
                                      `);
                                    }
                                  } else {
                                    const link = document.createElement('a');
                                    link.href = docData;
                                    link.target = '_blank';
                                    link.download = docName || 'degree_certificate_marksheet';
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                  }
                                }}
                                className="px-3 py-1 bg-[#006a4e] hover:bg-[#00523d] active:scale-95 text-white rounded-md font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                                title={language === 'bn' ? 'সংযুক্ত ডিগ্রি সার্টিফিকেট/মার্শিট দেখুন বা ডাউনলোড করুন' : 'View or download degree certificate'}
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>{language === 'bn' ? 'সংযুক্ত সনদ/ফাইল দেখুন' : 'View Document'}</span>
                                {docName && <span className="font-mono text-[10px] opacity-90 max-w-[120px] truncate">({docName})</span>}
                              </button>
                            ) : (
                              <div className="shrink-0 flex items-center gap-1.5 bg-white px-2 py-0.5 rounded border border-emerald-400 text-emerald-800 font-semibold text-xs">
                                <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="font-mono">{docName}</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-amber-700 font-semibold italic bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            {language === 'bn' ? 'কোনো সনদ বা পেপার সংলগ্ন করা হয়নি' : 'No document attached'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 3. Personal Information: */}
                  <div className="space-y-2.5 border-b border-gray-300 pb-3">
                    <div className="font-bold text-[#004d38] text-xs sm:text-sm">
                      3. Personal Information:
                    </div>

                    <div className="space-y-2 pl-0 sm:pl-4">
                      {/* Father's Name */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                        <span className="w-full sm:w-36 font-semibold text-gray-800 shrink-0 text-xs sm:text-sm">
                          Father's Name <span className="hidden sm:inline float-right mr-1">:</span>
                        </span>
                        <div className="flex-1 border border-gray-400 rounded px-3 py-1.5 text-xs sm:text-sm text-gray-900 bg-white font-medium shadow-2xs">
                          {fName || '—'}
                        </div>
                      </div>

                      {/* Mother's Name */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                        <span className="w-full sm:w-36 font-semibold text-gray-800 shrink-0 text-xs sm:text-sm">
                          Mother's Name <span className="hidden sm:inline float-right mr-1">:</span>
                        </span>
                        <div className="flex-1 border border-gray-400 rounded px-3 py-1.5 text-xs sm:text-sm text-gray-900 bg-white font-medium shadow-2xs">
                          {mName || '—'}
                        </div>
                      </div>

                      {/* Present Address */}
                      <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3">
                        <span className="w-full sm:w-36 font-semibold text-gray-800 shrink-0 text-xs sm:text-sm pt-0.5">
                          Present Address <span className="hidden sm:inline float-right mr-1">:</span>
                        </span>
                        <div className="flex-1 border border-gray-400 rounded px-3 py-1.5 text-xs sm:text-sm text-gray-900 bg-white min-h-[38px] leading-relaxed shadow-2xs">
                          {presAddr || '—'}
                        </div>
                      </div>

                      {/* Permanent Address: Village, Post, Upazila, District */}
                      <div className="space-y-1.5 bg-gray-50/70 p-2 sm:p-0 rounded border border-gray-200 sm:border-none">
                        <span className="w-full sm:w-36 font-semibold text-gray-800 shrink-0 text-xs sm:text-sm block">
                          Permanent Address <span className="hidden sm:inline float-right mr-1">:</span>
                        </span>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 flex-1">
                            <span className="text-gray-700 text-[11px] sm:text-xs shrink-0 font-medium">Village:</span>
                            <div className="w-full border border-gray-400 rounded px-2 py-1 text-xs text-gray-900 bg-white">
                              {pVillage || '—'}
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 flex-1">
                            <span className="text-gray-700 text-[11px] sm:text-xs shrink-0 font-medium">Post:</span>
                            <div className="w-full border border-gray-400 rounded px-2 py-1 text-xs text-gray-900 bg-white">
                              {pPost || '—'}
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 flex-1">
                            <span className="text-gray-700 text-[11px] sm:text-xs shrink-0 font-medium">Upazila:</span>
                            <div className="w-full border border-gray-400 rounded px-2 py-1 text-xs text-gray-900 bg-white">
                              {pUpazila || '—'}
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 flex-1">
                            <span className="text-gray-700 text-[11px] sm:text-xs shrink-0 font-medium">District:</span>
                            <div className="w-full border border-gray-400 rounded px-2 py-1 text-xs text-gray-900 bg-white">
                              {pDistrict || '—'}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Date of Birth & Email */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-800 shrink-0 text-xs sm:text-sm">
                            Date of Birth:
                          </span>

                          <div className="flex items-center gap-1">
                            <div className="w-10 text-center border border-gray-400 rounded px-1 py-1 text-xs font-mono font-bold text-gray-900 bg-white">
                              {dDay ? String(dDay).padStart(2, '0') : 'DD'}
                            </div>
                            <span className="text-gray-400 font-bold text-xs">/</span>
                            <div className="w-10 text-center border border-gray-400 rounded px-1 py-1 text-xs font-mono font-bold text-gray-900 bg-white">
                              {dMonth ? String(dMonth).padStart(2, '0') : 'MM'}
                            </div>
                            <span className="text-gray-400 font-bold text-xs">/</span>
                            <div className="w-16 text-center border border-gray-400 rounded px-1 py-1 text-xs font-mono font-bold text-gray-900 bg-white">
                              {dYear || 'YYYY'}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-800 text-xs sm:text-sm shrink-0">
                            Email:
                          </span>
                          <div className="w-full border border-gray-400 rounded px-2.5 py-1 text-xs sm:text-sm text-gray-900 bg-white truncate font-medium">
                            {em || '—'}
                          </div>
                        </div>
                      </div>

                      {/* Phone Number & Blood Group */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-20 sm:w-28 font-semibold text-gray-800 shrink-0 text-xs sm:text-sm">
                            Phone:
                          </span>
                          <div className="w-full border border-gray-400 rounded px-2.5 py-1 text-xs sm:text-sm font-mono font-bold text-gray-900 bg-white">
                            {ph || '—'}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-800 text-xs sm:text-sm shrink-0">
                            Blood Group:
                          </span>
                          <div className="w-full border border-gray-400 rounded px-2.5 py-1 text-xs font-bold text-rose-700 bg-white font-mono">
                            {bg || '—'}
                          </div>
                        </div>
                      </div>

                      {/* NID Number */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                        <span className="w-full sm:w-36 font-semibold text-gray-800 shrink-0 text-xs sm:text-sm">
                          NID Number <span className="hidden sm:inline float-right mr-1">:</span>
                        </span>
                        <div className="flex-1 border border-gray-400 rounded px-3 py-1 text-xs sm:text-sm font-mono font-bold text-gray-900 bg-white">
                          {nid || '—'}
                        </div>
                      </div>

                      {/* Occupation */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                        <span className="w-full sm:w-36 font-semibold text-gray-800 shrink-0 text-xs sm:text-sm">
                          Occupation <span className="hidden sm:inline float-right mr-1">:</span>
                        </span>
                        <div className="flex-1 border border-gray-400 rounded px-3 py-1.5 text-xs sm:text-sm text-gray-900 bg-white font-medium flex items-center justify-between">
                          <span>{occ || '—'}</span>
                          {otherOcc && (
                            <span className="text-gray-500 text-xs italic">({otherOcc})</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 4. Declaration Line & Signature */}
                  <div className="pt-2 pb-2 bg-emerald-50/60 p-3 rounded-lg border border-emerald-200">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-[#006a4e] text-white rounded flex items-center justify-center font-bold text-xs shrink-0">
                          ✓
                        </div>
                        <span className="font-semibold text-gray-900 text-xs sm:text-sm">
                          I ensure that information mentioned above is complete and correct.
                        </span>
                      </div>

                      {/* Signature Preview */}
                      <div className="text-right shrink-0">
                        <span className="text-[10px] text-gray-500 block font-sans">Applicant's Signature:</span>
                        {sigUrl ? (
                          <div className="inline-block border border-gray-400 rounded bg-white p-1 mt-0.5 shadow-2xs">
                            <img src={sigUrl} alt="Signature" className="h-8 max-w-[140px] object-contain" />
                          </div>
                        ) : (
                          <div className="font-serif italic font-bold text-gray-900 text-xs border-b border-gray-700 pb-0.5 px-3 mt-0.5 inline-block">
                            {sigName || '—'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 5. Official Verification & Payment Summary */}
                  <div className="mt-2 pt-2 border-t border-dashed border-gray-400 font-sans">
                    <div className="bg-emerald-50/90 border border-emerald-300 rounded-lg p-2.5 sm:p-3 space-y-2 text-xs">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#006a4e]"></span>
                          <span className="font-bold text-gray-900">Membership Category:</span>
                          <span className="font-extrabold text-[#004d38] bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                            {memType}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900">Fee Amount:</span>
                          <span className={`font-black font-mono text-sm px-2 py-0.5 rounded border ${
                            pMethod === 'Unpaid' || selectedMember.paymentStatus === 'unpaid' || trxId === 'UNPAID'
                              ? 'text-red-700 bg-red-100 border-red-300'
                              : 'text-[#006a4e] bg-white border-emerald-300'
                          }`}>
                            ৳ {fee}/- ({
                              pMethod === 'Unpaid' || selectedMember.paymentStatus === 'unpaid' || trxId === 'UNPAID'
                                ? 'Unpaid'
                                : selectedMember.paymentStatus === 'paid'
                                ? 'PAID'
                                : 'PENDING'
                            })
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-emerald-200/80 font-mono text-xs text-gray-800">
                        <div>
                          <span className="text-gray-500 block text-[10px] font-sans">Method:</span>
                          <strong className="uppercase">{pMethod}</strong>
                        </div>
                        <div>
                          <span className="text-gray-500 block text-[10px] font-sans">Sender Mobile:</span>
                          <strong>{sender || '—'}</strong>
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <span className="text-gray-500 block text-[10px] font-sans">TrxID:</span>
                          <strong className="text-emerald-950 bg-white px-1.5 py-0.5 rounded border border-emerald-300 inline-block font-bold">
                            {trxId || '—'}
                          </strong>
                        </div>
                        <div>
                          <span className="text-gray-500 block text-[10px] font-sans">Approval Status:</span>
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold font-sans inline-block ${
                            selectedMember.status === 'approved'
                              ? 'bg-emerald-600 text-white'
                              : selectedMember.status === 'rejected'
                              ? 'bg-red-600 text-white'
                              : 'bg-amber-500 text-white'
                          }`}>
                            {selectedMember.status === 'approved' ? '✓ Approved' : selectedMember.status === 'rejected' ? '✕ Rejected' : '⏳ Pending'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Quick Status Modifiers & Admin Actions (no-print) */}
              <div className="no-print flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-700">Change Status:</span>
                  <button
                    onClick={() => handleUpdateMemberStatus(selectedMember.id, 'approved')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedMember.status === 'approved'
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                    }`}
                  >
                    ✓ Approve
                  </button>
                  <button
                    onClick={() => handleUpdateMemberStatus(selectedMember.id, 'pending')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedMember.status === 'pending' || !selectedMember.status || selectedMember.status === 'payment_pending'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                    }`}
                  >
                    Pending
                  </button>
                  <button
                    onClick={() => handleUpdateMemberStatus(selectedMember.id, 'rejected')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedMember.status === 'rejected'
                        ? 'bg-red-600 text-white shadow-xs'
                        : 'bg-red-100 text-red-800 hover:bg-red-200'
                    }`}
                  >
                    ✕ Reject
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {selectedMember.email && (
                    <button
                      type="button"
                      onClick={() =>
                        handleOpenEmailModal({
                          name: selectedMember.applicantNameBn || selectedMember.fullName || 'Member',
                          email: selectedMember.email!,
                          formNo: selectedMember.formNo,
                          membershipId: selectedMember.membershipId,
                        })
                      }
                      className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
                      title={language === 'bn' ? 'সদস্যকে ইমেইল পাঠান' : 'Send Email to Member'}
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>{language === 'bn' ? 'ইমেইল পাঠান' : 'Send Email'}</span>
                    </button>
                  )}
                  <button
                    onClick={() => confirmSingleDelete(selectedMember.id, nameBn || nameEn || 'Member', selectedMember.formNo)}
                    className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    title="Delete member application"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-600" />
                    <span>Delete</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownloadMemberPdf(selectedMember)}
                    disabled={isGeneratingMemberPdf}
                    className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                    title={language === 'bn' ? 'অফিসিয়াল আবেদনপত্রের PDF ডাউনলোড করুন' : 'Download Official PDF'}
                  >
                    {isGeneratingMemberPdf ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Download className="w-3.5 h-3.5" />
                    )}
                    <span>{language === 'bn' ? 'PDF ডাউনলোড' : 'Download PDF'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePrintMemberForm(selectedMember)}
                    className="px-4 py-2 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                    title={language === 'bn' ? 'আবেদনপত্র প্রিন্ট করুন' : 'Print Form'}
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'প্রিন্ট করুন' : 'Print Form'}</span>
                  </button>
                  <button
                    onClick={() => setSelectedMember(null)}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ================= MODAL: SINGLE MEMBER DELETE CONFIRMATION ================= */}
      {memberToDelete && (
        <div className="fixed inset-0 bg-black/75 z-60 flex items-center justify-center p-4 font-siliguri animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border-2 border-red-500 text-center">
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <Trash2 className="w-7 h-7" />
            </div>
            
            <div className="space-y-1.5">
              <h3 className="font-extrabold text-lg text-gray-900 font-serif-bn">
                {language === 'bn' ? 'সদস্যপদ মুছে ফেলার নিশ্চিতকরণ' : 'Confirm Member Deletion'}
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                {language === 'bn' ? (
                  <>
                    আপনি কি নিশ্চিতভাবে <strong className="text-red-700">"{memberToDelete.name}"</strong>
                    {memberToDelete.formNo ? ` (ফরম: ${memberToDelete.formNo})` : ''}-এর নিবন্ধিত ডাটা ও সনদ স্থায়ীভাবে মুছে ফেলতে চান?
                  </>
                ) : (
                  <>
                    Are you sure you want to permanently delete the member data for <strong>"{memberToDelete.name}"</strong>?
                  </>
                )}
              </p>
              <p className="text-[11px] text-amber-700 bg-amber-50 py-1.5 px-3 rounded-lg border border-amber-200 font-semibold">
                ⚠️ {language === 'bn' ? 'এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।' : 'This action cannot be undone.'}
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setMemberToDelete(null)}
                disabled={isDeleting}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
              >
                {language === 'bn' ? 'না, বাতিল' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={executeSingleDelete}
                disabled={isDeleting}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-colors cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{language === 'bn' ? 'মুছে ফেলা হচ্ছে...' : 'Deleting...'}</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'হ্যাঁ, নিশ্চিত ডিলিট করুন' : 'Yes, Delete Permanently'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: BULK DELETE CONFIRMATION ================= */}
      {bulkDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/75 z-60 flex items-center justify-center p-4 font-siliguri animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border-2 border-red-500 text-center">
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <Trash2 className="w-7 h-7" />
            </div>
            
            <div className="space-y-1.5">
              <h3 className="font-extrabold text-lg text-gray-900 font-serif-bn">
                {language === 'bn' ? 'একাধিক সদস্য মুছে ফেলার নিশ্চিতকরণ' : 'Confirm Bulk Deletion'}
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                {language === 'bn' ? (
                  <>
                    আপনি নির্বাচিত <strong className="text-red-700">{selectedMemberIds.length} জন সদস্যের</strong> সকল নিবন্ধিত তথ্য ও আবেদন স্থায়ীভাবে ডাটাবেজ থেকে মুছে ফেলতে যাচ্ছেন।
                  </>
                ) : (
                  <>
                    You are about to permanently delete <strong>{selectedMemberIds.length} selected members</strong>.
                  </>
                )}
              </p>
              <p className="text-[11px] text-amber-700 bg-amber-50 py-1.5 px-3 rounded-lg border border-amber-200 font-semibold">
                ⚠️ {language === 'bn' ? 'এই প্রক্রিয়াটি স্থায়ী এবং আর ফেরত আনা যাবে না।' : 'This action is irreversible.'}
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setBulkDeleteModalOpen(false)}
                disabled={isDeleting}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
              >
                {language === 'bn' ? 'না, বাতিল' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={executeBulkDelete}
                disabled={isDeleting}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-colors cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{language === 'bn' ? 'মুছে ফেলা হচ্ছে...' : 'Deleting...'}</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>
                      {language === 'bn'
                        ? `হ্যাঁ, ${selectedMemberIds.length} জনই ডিলিট করুন`
                        : `Yes, Delete All ${selectedMemberIds.length}`}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD NEW NOTICE ================= */}
      {newNoticeModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-3 sm:p-4 font-siliguri animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl border-2 border-[#006a4e] max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-base sm:text-lg text-gray-900 font-serif-bn flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#006a4e]" />
                <span>{language === 'bn' ? 'নতুন নোটিশ ও প্রেস বিজ্ঞপ্তি প্রকাশ' : 'Publish New Notice'}</span>
              </h3>
              <button
                onClick={() => setNewNoticeModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNotice} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-gray-700">{language === 'bn' ? 'নোটিশের শিরোনাম *' : 'Notice Title *'}</label>
                <input
                  type="text"
                  value={newNoticeData.title}
                  onChange={(e) => setNewNoticeData({ ...newNoticeData, title: e.target.value })}
                  placeholder={language === 'bn' ? 'যেমন: উদ্ভিদবিজ্ঞান অ্যালামনাই বার্ষিক সাধারণ সভা ও রিইউনিয়ন...' : 'Notice title...'}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-[#006a4e] text-xs font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">{language === 'bn' ? 'ক্যাটাগরি' : 'Category'}</label>
                  <select
                    value={newNoticeData.category}
                    onChange={(e) => setNewNoticeData({ ...newNoticeData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-[#006a4e] text-xs font-semibold cursor-pointer"
                  >
                    <option value="জরুরি নোটিশ">জরুরি নোটিশ</option>
                    <option value="প্রেস বিজ্ঞপ্তি">প্রেস বিজ্ঞপ্তি</option>
                    <option value="অ্যালামনাই পুনর্মিলনী ও অনুষ্ঠান">অ্যালামনাই পুনর্মিলনী ও অনুষ্ঠান</option>
                    <option value="সাধারণ বিজ্ঞপ্তি">সাধারণ বিজ্ঞপ্তি</option>
                  </select>
                </div>

                <div className="space-y-1 flex flex-col justify-end">
                  <label className="flex items-center gap-2 cursor-pointer pt-2">
                    <input
                      type="checkbox"
                      checked={newNoticeData.isUrgent}
                      onChange={(e) => setNewNoticeData({ ...newNoticeData, isUrgent: e.target.checked })}
                      className="w-4 h-4 text-red-600 rounded cursor-pointer"
                    />
                    <span className="font-bold text-red-600">{language === 'bn' ? 'জরুরি বুলেটিন টিকারে দেখান' : 'Show in Urgent Ticker'}</span>
                  </label>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700">{language === 'bn' ? 'বিস্তারিত বিবরণ *' : 'Detailed Content *'}</label>
                <textarea
                  rows={4}
                  value={newNoticeData.description}
                  onChange={(e) => setNewNoticeData({ ...newNoticeData, description: e.target.value })}
                  placeholder={language === 'bn' ? 'নোটিশের পূর্ণাঙ্গ বিবরণ ও নির্দেশনাবলী লিখুন...' : 'Write notice details...'}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-[#006a4e] text-xs leading-relaxed"
                  required
                />
              </div>

              {/* Attachment Section: Image & PDF Upload */}
              <div className="space-y-2 pt-1 border-t border-gray-100">
                <label className="font-bold text-gray-800 text-xs flex items-center justify-between">
                  <span>{language === 'bn' ? 'সংযুক্ত নথি (Image ও PDF Upload)' : 'Attachments (Image & PDF Upload)'}</span>
                  <span className="text-[10px] text-gray-400 font-normal">
                    {language === 'bn' ? 'ঐচ্ছিক' : 'Optional'}
                  </span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Image Upload Box */}
                  <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#006a4e] text-xs flex items-center gap-1.5">
                        <ImageIcon className="w-4 h-4 text-emerald-700" />
                        {language === 'bn' ? 'ইমেজ আপলোড' : 'Image Upload'}
                      </span>
                      {newNoticeData.imageUrl && (
                        <button
                          type="button"
                          onClick={() => setNewNoticeData((prev) => ({ ...prev, imageUrl: '' }))}
                          className="text-[10px] text-rose-600 hover:underline font-bold"
                        >
                          {language === 'bn' ? 'মুছে ফেলুন' : 'Remove'}
                        </button>
                      )}
                    </div>

                    {newNoticeData.imageUrl ? (
                      <div className="relative group rounded-xl overflow-hidden border border-emerald-300 bg-white p-1 text-center">
                        <img
                          src={newNoticeData.imageUrl}
                          alt="Notice preview"
                          className="h-24 w-full object-contain rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => setNewNoticeData((prev) => ({ ...prev, imageUrl: '' }))}
                          className="mt-1 text-[11px] text-rose-600 font-bold hover:underline"
                        >
                          ✕ {language === 'bn' ? 'ছবি পরিবর্তন করুন' : 'Remove Image'}
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-emerald-300 hover:border-emerald-500 rounded-xl bg-white cursor-pointer transition-colors text-center">
                        <Upload className="w-5 h-5 text-emerald-600 mb-1" />
                        <span className="text-[11px] font-bold text-gray-700">
                          {language === 'bn' ? 'ছবি নির্বাচন করুন (JPG/PNG)' : 'Select Image (JPG/PNG)'}
                        </span>
                        <span className="text-[10px] text-gray-400">সর্বোচ্চ ৮ মেগাবাইট</span>
                        <input
                          type="file"
                          accept="image/png, image/jpeg, image/jpg, image/webp"
                          onChange={handleNoticeImageSelect}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  {/* PDF Upload Box */}
                  <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-blue-900 text-xs flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-blue-700" />
                        {language === 'bn' ? 'PDF আপলোড' : 'PDF Upload'}
                      </span>
                      {newNoticeData.pdfUrl && (
                        <button
                          type="button"
                          onClick={() => setNewNoticeData((prev) => ({ ...prev, pdfUrl: '', pdfFileName: '' }))}
                          className="text-[10px] text-rose-600 hover:underline font-bold"
                        >
                          {language === 'bn' ? 'মুছে ফেলুন' : 'Remove'}
                        </button>
                      )}
                    </div>

                    {newNoticeData.pdfUrl ? (
                      <div className="p-2.5 bg-white border border-blue-300 rounded-xl flex items-center justify-between gap-2 shadow-2xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="w-5 h-5 text-red-600 shrink-0" />
                          <div className="truncate">
                            <p className="text-xs font-bold text-gray-800 truncate">
                              {newNoticeData.pdfFileName || 'notice_document.pdf'}
                            </p>
                            <span className="text-[10px] text-emerald-700 font-semibold">✓ PDF যুক্ত হয়েছে</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setNewNoticeData((prev) => ({ ...prev, pdfUrl: '', pdfFileName: '' }))}
                          className="p-1 text-gray-400 hover:text-rose-600 rounded cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-blue-300 hover:border-blue-500 rounded-xl bg-white cursor-pointer transition-colors text-center">
                        <Upload className="w-5 h-5 text-blue-600 mb-1" />
                        <span className="text-[11px] font-bold text-gray-700">
                          {language === 'bn' ? 'পিডিএফ ফাইল নির্বাচন করুন' : 'Select PDF File'}
                        </span>
                        <span className="text-[10px] text-gray-400">সর্বোচ্চ ১২ মেগাবাইট (.pdf)</span>
                        <input
                          type="file"
                          accept="application/pdf, .pdf"
                          onChange={handleNoticePdfSelect}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setNewNoticeModal(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold cursor-pointer"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#006a4e] hover:bg-[#00523d] text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'প্রকাশ করুন' : 'Publish'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD / EDIT RECENT NEWS ================= */}
      {newNewsModalOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-3 sm:p-4 font-siliguri animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl border-2 border-[#006a4e] max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-base sm:text-lg text-gray-900 font-serif-bn flex items-center gap-2">
                <Newspaper className="w-5 h-5 text-[#006a4e]" />
                <span>
                  {editingNewsPost
                    ? (language === 'bn' ? 'খবর সম্পাদনা করুন' : 'Edit News Post')
                    : (language === 'bn' ? 'নতুন সাম্প্রতিক খবর প্রকাশ করুন' : 'Post New Recent News')}
                </span>
              </h3>
              <button
                onClick={() => setNewNewsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSaveNews(); }} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-gray-700">{language === 'bn' ? 'সংবাদের শিরোনাম *' : 'News Title *'}</label>
                <input
                  type="text"
                  value={newsFormData.titleBn}
                  onChange={(e) => setNewsFormData({ ...newsFormData, titleBn: e.target.value })}
                  placeholder={language === 'bn' ? 'যেমন: উদ্ভিদবিজ্ঞান অ্যালামনাই বার্ষিক সাধারণ সভা সংক্রান্ত সংবাদ...' : 'Title...'}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-[#006a4e] text-xs font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">{language === 'bn' ? 'ক্যাটাগরি' : 'Category'}</label>
                  <select
                    value={newsFormData.categoryBn}
                    onChange={(e) => setNewsFormData({ ...newsFormData, categoryBn: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-[#006a4e] text-xs font-semibold cursor-pointer"
                  >
                    <option value="একাডেমিক সংবাদ">একাডেমিক সংবাদ</option>
                    <option value="ফিল্ড ওয়ার্ক ও গবেষণা">ফিল্ড ওয়ার্ক ও গবেষণা</option>
                    <option value="অ্যালামনাই ইভেন্ট">অ্যালামনাই ইভেন্ট</option>
                    <option value="গবেষণা ও সাফল্য">গবেষণা ও সাফল্য</option>
                    <option value="সাধারণ খবরাখবর">সাধারণ খবরাখবর</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700">{language === 'bn' ? 'প্রকাশের তারিখ' : 'Publication Date'}</label>
                  <input
                    type="text"
                    value={newsFormData.date}
                    onChange={(e) => setNewsFormData({ ...newsFormData, date: e.target.value })}
                    placeholder={language === 'bn' ? 'যেমন: ১৫ মার্চ, ২০২৬' : 'Date...'}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-[#006a4e] text-xs font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700">{language === 'bn' ? 'কভার ছবি (ইউআরএল)' : 'Cover Image URL'}</label>
                <input
                  type="text"
                  value={newsFormData.imageUrl}
                  onChange={(e) => setNewsFormData({ ...newsFormData, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-[#006a4e] text-xs font-medium font-mono"
                />
                {newsFormData.imageUrl && (
                  <div className="pt-2">
                    <p className="text-[10px] text-gray-500 mb-1">ইমেজ প্রিভিউ:</p>
                    <img
                      src={newsFormData.imageUrl}
                      alt="Preview"
                      className="h-28 w-full object-cover rounded-xl border border-gray-200"
                      onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700">{language === 'bn' ? 'সংক্ষিপ্ত সারসংক্ষেপ (কার্ড ও স্লাইডারে দেখাবে) *' : 'Summary *'}</label>
                <textarea
                  rows={3}
                  value={newsFormData.summaryBn}
                  onChange={(e) => setNewsFormData({ ...newsFormData, summaryBn: e.target.value })}
                  placeholder={language === 'bn' ? 'সংবাদের প্রধান অংশ সংক্ষেপে লিখুন...' : 'Short summary...'}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-[#006a4e] text-xs font-medium"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700">{language === 'bn' ? 'বিস্তারিত সংবাদ বিবরণ' : 'Full Content / Details'}</label>
                <textarea
                  rows={5}
                  value={newsFormData.contentBn}
                  onChange={(e) => setNewsFormData({ ...newsFormData, contentBn: e.target.value })}
                  placeholder={language === 'bn' ? 'সম্পূর্ণ সংবাদ বা আর্টিকেলের বিবরণ লিখুন...' : 'Full content details...'}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-[#006a4e] text-xs font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setNewNewsModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#006a4e] hover:bg-[#00523d] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>
                    {editingNewsPost
                      ? (language === 'bn' ? 'আপডেট করুন' : 'Update News')
                      : (language === 'bn' ? 'প্রকাশ করুন' : 'Publish News')}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: FEEDBACK FULL DETAILS ================= */}
      {selectedFeedback && (() => {
        const sName = selectedFeedback.senderName || selectedFeedback.name || (language === 'bn' ? 'নাম উল্লেখ নেই' : 'No Name');
        const sBatch = selectedFeedback.senderBatch || selectedFeedback.batch || selectedFeedback.occupation || (language === 'bn' ? 'উল্লেখ নেই' : 'Not specified');
        const sContact = selectedFeedback.senderContact || [selectedFeedback.phone, selectedFeedback.email].filter(Boolean).join(' • ') || (language === 'bn' ? 'উল্লেখ নেই' : 'Not specified');
        const sSubject = selectedFeedback.subject || (language === 'bn' ? 'সাধারণ মতামত ও পরামর্শ' : 'General Feedback');
        const sMessage = selectedFeedback.message || '';

        let dateStr = '';
        let timeStr = '';
        if (selectedFeedback.createdAt) {
          try {
            let d: Date;
            if (typeof selectedFeedback.createdAt === 'string') d = new Date(selectedFeedback.createdAt);
            else if (selectedFeedback.createdAt?.toDate && typeof selectedFeedback.createdAt.toDate === 'function') d = selectedFeedback.createdAt.toDate();
            else if (selectedFeedback.createdAt?.seconds) d = new Date(selectedFeedback.createdAt.seconds * 1000);
            else d = new Date(selectedFeedback.createdAt);

            if (!isNaN(d.getTime())) {
              dateStr = d.toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              });
              timeStr = d.toLocaleTimeString(language === 'bn' ? 'bn-BD' : 'en-US', {
                hour: '2-digit',
                minute: '2-digit'
              });
            }
          } catch {
            // ignore
          }
        }

        return (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 font-siliguri animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-7 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto border border-emerald-100">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-3.5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-xs font-black px-2.5 py-0.5 rounded-full border ${
                        selectedFeedback.status === 'resolved'
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                          : selectedFeedback.status === 'read'
                          ? 'bg-gray-100 text-gray-700 border-gray-200'
                          : 'bg-rose-100 text-rose-800 border-rose-200 animate-pulse'
                      }`}
                    >
                      {selectedFeedback.status === 'resolved'
                        ? (language === 'bn' ? 'বাস্তবায়িত / পর্যালোচিত' : 'Resolved')
                        : selectedFeedback.status === 'read'
                        ? (language === 'bn' ? 'পঠিত' : 'Read')
                        : (language === 'bn' ? 'নতুন অপঠিত' : 'New Unread')}
                    </span>
                    <span className="text-xs text-gray-500 font-mono">
                      {dateStr} {timeStr && `• ${timeStr}`}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-gray-900 font-serif-bn">
                    {language === 'bn' ? 'পরামর্শ ও মতামতের বিশদ বিবরণ' : 'Advice & Feedback Full Details'}
                  </h3>
                </div>

                <button
                  onClick={() => setSelectedFeedback(null)}
                  className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Fields Grid */}
              <div className="space-y-3">
                {/* Field 1: আপনার নাম */}
                <div className="bg-gray-50 rounded-2xl p-3.5 border border-gray-200/80 space-y-1">
                  <span className="text-xs font-bold text-gray-500 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#006a4e]" />
                    <span>{language === 'bn' ? 'আপনার নাম:' : 'Your Name:'}</span>
                  </span>
                  <div className="text-base font-black text-gray-900">
                    {sName}
                  </div>
                </div>

                {/* Two columns: Field 2 (ব্যাচ / পরিচিতি) & Field 3 (ফোন বা ইমেইল) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Field 2: ব্যাচ / পরিচিতি */}
                  <div className="bg-gray-50 rounded-2xl p-3.5 border border-gray-200/80 space-y-1">
                    <span className="text-xs font-bold text-gray-500 flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-[#006a4e]" />
                      <span>{language === 'bn' ? 'ব্যাচ / পরিচিতি:' : 'Batch / Identity:'}</span>
                    </span>
                    <div className="text-sm font-bold text-[#006a4e]">
                      {sBatch}
                    </div>
                  </div>

                  {/* Field 3: ফোন বা ইমেইল */}
                  <div className="bg-gray-50 rounded-2xl p-3.5 border border-gray-200/80 space-y-1">
                    <span className="text-xs font-bold text-gray-500 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#006a4e]" />
                      <span>{language === 'bn' ? 'ফোন বা ইমেইল:' : 'Phone or Email:'}</span>
                    </span>
                    <div className="text-sm font-bold text-gray-800">
                      {sContact.includes('@') ? (
                        <a href={`mailto:${sContact}`} className="text-emerald-700 hover:underline">
                          {sContact}
                        </a>
                      ) : /^[0-9+ -]+$/.test(sContact) ? (
                        <a href={`tel:${sContact}`} className="text-emerald-700 hover:underline">
                          {sContact}
                        </a>
                      ) : (
                        <span>{sContact}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Field 4: বিষয় */}
                <div className="bg-emerald-50/70 rounded-2xl p-3.5 border border-emerald-200 space-y-1">
                  <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#006a4e]" />
                    <span>{language === 'bn' ? 'বিষয়:' : 'Subject:'}</span>
                  </span>
                  <div className="text-sm font-black text-emerald-950">
                    {sSubject}
                  </div>
                </div>

                {/* Field 5: আপনার মূল বার্তা / পরামর্শের বিশদ বিবরণ */}
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                    <MessageSquareHeart className="w-3.5 h-3.5 text-[#006a4e]" />
                    <span>{language === 'bn' ? 'আপনার মূল বার্তা / পরামর্শের বিশদ বিবরণ:' : 'Detailed Message / Advice:'}</span>
                  </span>
                  <div className="text-sm text-gray-800 bg-white p-4 rounded-2xl border border-gray-300 leading-relaxed font-sans shadow-inner whitespace-pre-wrap select-text max-h-64 overflow-y-auto">
                    {sMessage}
                  </div>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex items-center gap-2 flex-wrap">
                  {(!selectedFeedback.status || selectedFeedback.status === 'unread') && (
                    <button
                      onClick={() => handleUpdateFeedbackStatus(selectedFeedback.id, 'read')}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                    >
                      {language === 'bn' ? 'পঠিত মার্ক করুন' : 'Mark Read'}
                    </button>
                  )}
                  {selectedFeedback.status === 'read' && (
                    <button
                      onClick={() => handleUpdateFeedbackStatus(selectedFeedback.id, 'unread')}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                    >
                      {language === 'bn' ? 'অপঠিত করুন' : 'Mark Unread'}
                    </button>
                  )}
                  {selectedFeedback.status !== 'resolved' && (
                    <button
                      onClick={() => handleUpdateFeedbackStatus(selectedFeedback.id, 'resolved')}
                      className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                    >
                      {language === 'bn' ? 'গৃহীত মার্ক করুন' : 'Mark Resolved'}
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const txt = `[উদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশন পরামর্শ ও মতামত]
আপনার নাম: ${sName}
ব্যাচ / পরিচিতি: ${sBatch}
ফোন বা ইমেইল: ${sContact}
বিষয়: ${sSubject}
জমার তারিখ ও সময়: ${dateStr} ${timeStr}

আপনার মূল বার্তা / পরামর্শের বিশদ বিবরণ:
${sMessage}`;
                      navigator.clipboard.writeText(txt);
                      showToast(language === 'bn' ? 'পরামর্শের সম্পূর্ণ বিবরণ কপি হয়েছে।' : 'Feedback copied to clipboard.');
                    }}
                    className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'কপি করুন' : 'Copy'}</span>
                  </button>
                  <button
                    onClick={() => handleDeleteFeedback(selectedFeedback.id)}
                    className="px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'মুছে ফেলুন' : 'Delete'}</span>
                  </button>
                  <button
                    onClick={() => setSelectedFeedback(null)}
                    className="px-4 py-1.5 bg-[#006a4e] hover:bg-[#00523d] text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
                  >
                    {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ================= MODAL: DONATION DETAILS & MONEY RECEIPT ================= */}
      {selectedDonation && (() => {
        const d = selectedDonation;
        const dName = d.payerNameBn || d.payerName || 'সম্মানিত অ্যালামনাই ডোনার';
        const dNameEn = d.payerName;
        const dPhone = d.phone || d.senderNumber || '—';
        const dMethod = d.paymentMethod || 'Manual';
        const dTrx = d.transactionId || '—';
        const dSender = d.senderNumber || '—';
        const dAmount = Number(d.amount) || 0;
        const dDate = d.createdAt ? new Date(d.createdAt).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';
        const dTime = d.createdAt ? new Date(d.createdAt).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }) : '';
        const isBkash = dMethod.toLowerCase().includes('bkash');
        const isNagad = dMethod.toLowerCase().includes('nagad');
        const isRocket = dMethod.toLowerCase().includes('rocket');

        return (
          <div className="fixed inset-0 bg-black/75 z-60 flex items-center justify-center p-3 sm:p-4 font-siliguri animate-in fade-in duration-150 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 space-y-5 shadow-2xl border-2 border-rose-500/40 relative my-auto">
              {/* Close button */}
              <button
                type="button"
                onClick={() => setSelectedDonation(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 p-2 rounded-full cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Receipt Header */}
              <div className="text-center space-y-1.5 border-b-2 border-dashed border-rose-200 pb-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-black uppercase tracking-wider">
                  <HeartHandshake className="w-3.5 h-3.5" />
                  <span>অফিসিয়াল ডোনেশন মানি রসিদ (MONEY RECEIPT)</span>
                </div>
                <h3 className="font-black text-xl text-[#006a4e] font-serif-bn">
                  উদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশন
                </h3>
                <p className="text-xs text-gray-600 font-medium">
                  জগন্নাথ বিশ্ববিদ্যালয়, ঢাকা-১১০০
                </p>
                <div className="flex items-center justify-between text-xs text-gray-600 pt-2 px-2">
                  <span className="font-mono font-bold bg-gray-100 px-2.5 py-1 rounded-lg border border-gray-200">
                    রসিদ নং: <strong className="text-rose-900">{d.receiptNo}</strong>
                  </span>
                  <span className="font-medium">
                    তারিখ: <strong className="text-gray-900">{dDate}</strong>
                  </span>
                </div>
              </div>

              {/* Donor & Payment Details Card */}
              <div className="bg-rose-50/50 rounded-2xl p-4 sm:p-5 border border-rose-200/80 space-y-3.5 text-xs text-gray-700">
                {/* Donor Name & Batch */}
                <div className="flex items-start justify-between gap-2 border-b border-rose-100 pb-3">
                  <div>
                    <span className="text-[11px] text-gray-500 font-bold block">দাতার নাম (Donor Name):</span>
                    <span className="text-base font-black text-gray-900 font-serif-bn">{dName}</span>
                    {dNameEn && dNameEn !== dName && (
                      <span className="text-xs text-gray-600 block">{dNameEn}</span>
                    )}
                  </div>
                  {(d.batch || d.session) && (
                    <div className="text-right">
                      <span className="text-[11px] text-gray-500 font-bold block">ব্যাচ / সেশন:</span>
                      <span className="text-xs font-black text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded inline-block">
                        {d.batch && `ব্যাচ ${d.batch}`} {d.session && `(${d.session})`}
                      </span>
                    </div>
                  )}
                </div>

                {/* Amount Paid - Prominent Box */}
                <div className="bg-white p-3.5 rounded-xl border-2 border-rose-300 shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-rose-800 font-bold block">অনুদানের পরিমাণ (Donation Amount):</span>
                    <span className="text-xs text-gray-500">অ্যাসোসিয়েশন কল্যাণ ও উন্নয়ন তহবিল</span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-rose-900 font-mono tracking-tight">
                    ৳ {dAmount.toLocaleString('bn-BD')}
                  </div>
                </div>

                {/* Payment Medium & Transaction Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="bg-white p-3 rounded-xl border border-rose-100 space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 block uppercase">পেমেন্ট মাধ্যম (Payment Method)</span>
                    <div className="flex items-center gap-1.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                        isBkash
                          ? 'bg-pink-100 text-[#D12053] border border-pink-300'
                          : isNagad
                          ? 'bg-orange-100 text-[#c75e00] border border-orange-300'
                          : isRocket
                          ? 'bg-purple-100 text-[#8C3494] border border-purple-300'
                          : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      }`}>
                        {dMethod}
                      </span>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-rose-100 space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 block uppercase">মোবাইল / প্রেরক নম্বর</span>
                    <span className="font-mono font-bold text-gray-900 text-xs">{dPhone}</span>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-rose-100 space-y-1 sm:col-span-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">ট্রানজেকশন আইডি (TrxID)</span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(dTrx);
                          showToast(language === 'bn' ? 'TrxID কপি হয়েছে' : 'TrxID copied');
                        }}
                        className="text-[10px] text-rose-700 font-bold hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" />
                        <span>কপি</span>
                      </button>
                    </div>
                    <span className="font-mono font-black text-rose-950 text-sm select-all block">{dTrx}</span>
                  </div>
                </div>

                {/* Optional Note */}
                {d.note && (
                  <div className="bg-white p-3 rounded-xl border border-gray-200">
                    <span className="text-[10px] text-gray-400 font-bold block uppercase">মন্তব্য / নোট (Note)</span>
                    <p className="text-xs text-gray-700 font-sans italic mt-0.5">{d.note}</p>
                  </div>
                )}
              </div>

              {/* Status and Verification Badge */}
              <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-100 pt-3">
                <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>যাচাইকৃত ডোনেশন ও জমা নিশ্চিত</span>
                </div>
                <span className="text-[11px] font-mono text-gray-400">{dTime}</span>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-between gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const txt = `[উদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশন - ডোনেশন রসিদ]
রসিদ নং: ${d.receiptNo}
দাতার নাম: ${dName}
ব্যাচ/সেশন: ${d.batch || ''} ${d.session || ''}
মোবাইল: ${dPhone}
অনুদানের পরিমাণ: ৳ ${dAmount}
পেমেন্ট মাধ্যম: ${dMethod}
প্রেরক নম্বর: ${dSender}
TrxID: ${dTrx}
তারিখ: ${dDate} ${dTime}`;
                    navigator.clipboard.writeText(txt);
                    showToast(language === 'bn' ? 'ডোনেশন বিবরণ কপি হয়েছে।' : 'Donation details copied.');
                  }}
                  className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'কপি করুন' : 'Copy'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all shadow-md active:scale-95"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'রসিদ প্রিন্ট' : 'Print Receipt'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedDonation(null)}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                  >
                    {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ================= MODAL: MANUAL DONATION ENTRY ================= */}
      {isAddDonationModalOpen && (
        <div className="fixed inset-0 bg-black/75 z-60 flex items-center justify-center p-3 sm:p-4 font-siliguri animate-in fade-in duration-150 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-4 shadow-2xl border-2 border-rose-500/40 relative my-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-rose-100 text-rose-700 rounded-xl">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base sm:text-lg text-gray-900 font-serif-bn">
                    {language === 'bn' ? 'নতুন ডোনেশন এন্ট্রি যুক্ত করুন' : 'Record New Donation'}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {language === 'bn' ? 'অফলাইন/অনলাইন অনুদানের বিস্তারিত তথ্য সংরক্ষণ করুন' : 'Save offline or direct contribution details'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddDonationModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 bg-gray-100 p-2 rounded-full cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveManualDonation} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Donor Name BN */}
                <div className="space-y-1">
                  <label className="font-bold text-gray-700 block">
                    {language === 'bn' ? 'দাতার নাম (বাংলায়) *' : 'Donor Name (Bengali) *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={newDonationData.payerNameBn}
                    onChange={(e) => setNewDonationData({ ...newDonationData, payerNameBn: e.target.value })}
                    placeholder="উদা: প্রফেসর ড. মো: রফিকুল ইসলাম"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-medium"
                  />
                </div>

                {/* Donor Name EN */}
                <div className="space-y-1">
                  <label className="font-bold text-gray-700 block">
                    {language === 'bn' ? 'দাতার নাম (ইংরেজিতে)' : 'Donor Name (English)'}
                  </label>
                  <input
                    type="text"
                    value={newDonationData.payerName}
                    onChange={(e) => setNewDonationData({ ...newDonationData, payerName: e.target.value })}
                    placeholder="e.g. Prof. Dr. Rafiqul Islam"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-medium"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className="font-bold text-gray-700 block">
                    {language === 'bn' ? 'মোবাইল নম্বর' : 'Phone Number'}
                  </label>
                  <input
                    type="text"
                    value={newDonationData.phone}
                    onChange={(e) => setNewDonationData({ ...newDonationData, phone: e.target.value })}
                    placeholder="017XXXXXXXX"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-mono font-medium"
                  />
                </div>

                {/* Batch */}
                <div className="space-y-1">
                  <label className="font-bold text-gray-700 block">
                    {language === 'bn' ? 'ব্যাচ / সেশন' : 'Batch / Session'}
                  </label>
                  <input
                    type="text"
                    value={newDonationData.batch}
                    onChange={(e) => setNewDonationData({ ...newDonationData, batch: e.target.value })}
                    placeholder="১ম ব্যাচ (২০০৫-০৬)"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-medium"
                  />
                </div>

                {/* Amount */}
                <div className="space-y-1">
                  <label className="font-black text-rose-900 block">
                    {language === 'bn' ? 'অনুদানের পরিমাণ (টাকা) *' : 'Amount (BDT) *'}
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newDonationData.amount}
                    onChange={(e) => setNewDonationData({ ...newDonationData, amount: e.target.value })}
                    placeholder="5000"
                    className="w-full px-3 py-2 bg-rose-50/60 border-2 border-rose-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-mono font-black text-base text-rose-900"
                  />
                </div>

                {/* Payment Method */}
                <div className="space-y-1">
                  <label className="font-bold text-gray-700 block">
                    {language === 'bn' ? 'পেমেন্ট মাধ্যম (Method) *' : 'Payment Method *'}
                  </label>
                  <select
                    value={newDonationData.paymentMethod}
                    onChange={(e) => setNewDonationData({ ...newDonationData, paymentMethod: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-bold"
                  >
                    <option value="bKash">bKash (বিকাশ)</option>
                    <option value="Nagad">Nagad (নগদ)</option>
                    <option value="Rocket">Rocket (রকেট)</option>
                    <option value="Bank Transfer">Bank Transfer (ব্যাংক ট্রান্সফার)</option>
                    <option value="Cash / Offline">Cash / Offline (ক্যাশ / সরাসরি অনুদান)</option>
                  </select>
                </div>

                {/* Sender Number */}
                <div className="space-y-1">
                  <label className="font-bold text-gray-700 block">
                    {language === 'bn' ? 'প্রেরক নম্বর / ব্যাংক অ্যাকাউন্ট' : 'Sender No / Account'}
                  </label>
                  <input
                    type="text"
                    value={newDonationData.senderNumber}
                    onChange={(e) => setNewDonationData({ ...newDonationData, senderNumber: e.target.value })}
                    placeholder="01XXXXXXXXX"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-mono"
                  />
                </div>

                {/* Transaction ID */}
                <div className="space-y-1">
                  <label className="font-bold text-gray-700 block">
                    {language === 'bn' ? 'ট্রানজেকশন আইডি (TrxID)' : 'Transaction ID'}
                  </label>
                  <input
                    type="text"
                    value={newDonationData.transactionId}
                    onChange={(e) => setNewDonationData({ ...newDonationData, transactionId: e.target.value })}
                    placeholder="BL12345678"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-mono"
                  />
                </div>
              </div>

              {/* Note */}
              <div className="space-y-1">
                <label className="font-bold text-gray-700 block">
                  {language === 'bn' ? 'মন্তব্য বা উদ্দেশ্য (Note / Purpose)' : 'Note / Purpose'}
                </label>
                <textarea
                  rows={2}
                  value={newDonationData.note}
                  onChange={(e) => setNewDonationData({ ...newDonationData, note: e.target.value })}
                  placeholder="উদা: পুনর্মিলনী উপলক্ষে বিশেষ অনুদান"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-medium resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddDonationModalOpen(false)}
                  disabled={isSavingDonation}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSavingDonation}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black shadow-md flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSavingDonation ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>{language === 'bn' ? 'সংরক্ষণ হচ্ছে...' : 'Saving...'}</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{language === 'bn' ? 'ডোনেশন সংরক্ষণ করুন' : 'Save Donation'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: CUSTOMIZABLE EMAIL SENDER ================= */}
      {isEmailModalOpen && emailTarget && (
        <div className="fixed inset-0 bg-black/75 z-60 flex items-center justify-center p-3 sm:p-4 font-siliguri animate-in fade-in duration-150 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-5 sm:p-6 space-y-4 shadow-2xl border-2 border-blue-600 relative my-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base sm:text-lg text-gray-900 font-serif-bn">
                    {language === 'bn' ? 'কাস্টম ইমেইল পাঠান' : 'Send Customized Email'}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {language === 'bn' ? 'প্রাপকের কাছে সরাসরি বিষয়বস্তু কাস্টমাইজ করে মেইল দিন' : 'Customize subject & message body before dispatch'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEmailModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 bg-gray-100 p-2 rounded-full cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Recipient Info Card */}
            <div className="bg-blue-50/70 p-3 rounded-2xl border border-blue-200 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] text-blue-700 font-bold uppercase block">প্রাপক (Recipient):</span>
                <span className="font-bold text-gray-900 text-sm">{emailTarget.name}</span>
                {emailTarget.formNo && (
                  <span className="ml-2 font-mono text-[11px] bg-white px-1.5 py-0.5 rounded border border-blue-200 text-blue-800">
                    ফরম: {emailTarget.formNo}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <input
                  type="email"
                  value={emailTarget.email}
                  onChange={(e) => setEmailTarget({ ...emailTarget, email: e.target.value })}
                  className="px-2.5 py-1 bg-white border border-blue-300 rounded-lg font-mono text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="email@example.com"
                />
              </div>
            </div>

            {/* Template Selector Presets */}
            <div className="space-y-1 text-xs">
              <label className="font-bold text-gray-700 block">টেমপ্লেট থিম নির্বাচন করুন (Quick Templates):</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleSelectEmailTemplate('custom')}
                  className={`px-2.5 py-1.5 rounded-xl font-bold border transition-all cursor-pointer text-center text-[11px] ${
                    emailTemplate === 'custom'
                      ? 'bg-blue-600 text-white border-blue-700 shadow-2xs'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200'
                  }`}
                >
                  কাস্টম বার্তা
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectEmailTemplate('approval')}
                  className={`px-2.5 py-1.5 rounded-xl font-bold border transition-all cursor-pointer text-center text-[11px] ${
                    emailTemplate === 'approval'
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200'
                  }`}
                >
                  অনুমোদন বার্তা
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectEmailTemplate('fee_receipt')}
                  className={`px-2.5 py-1.5 rounded-xl font-bold border transition-all cursor-pointer text-center text-[11px] ${
                    emailTemplate === 'fee_receipt'
                      ? 'bg-teal-600 text-white border-teal-700 shadow-2xs'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200'
                  }`}
                >
                  পেমেন্ট রসিদ
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectEmailTemplate('notice')}
                  className={`px-2.5 py-1.5 rounded-xl font-bold border transition-all cursor-pointer text-center text-[11px] ${
                    emailTemplate === 'notice'
                      ? 'bg-amber-600 text-white border-amber-700 shadow-2xs'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200'
                  }`}
                >
                  জরুরি নোটিশ
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSendCustomEmail} className="space-y-3 text-xs">
              {/* Subject Input */}
              <div className="space-y-1">
                <label className="font-bold text-gray-800 block">
                  ইমেইল সাবজেক্ট (Subject) * <span className="text-gray-400 font-normal">(কাস্টমাইজযোগ্য)</span>
                </label>
                <input
                  type="text"
                  required
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="ইমেইলের মূল বিষয় লিখুন..."
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-gray-900"
                />
              </div>

              {/* Message Body Textarea */}
              <div className="space-y-1">
                <label className="font-bold text-gray-800 block">
                  ইমেইল বার্তা / বডি (Message Body) * <span className="text-gray-400 font-normal">(যেকোনো লেখা বা অনুচ্ছেদ পরিবর্তন করুন)</span>
                </label>
                <textarea
                  rows={8}
                  required
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  placeholder="ইমেইলের বার্তা এখানে লিখুন..."
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-sans leading-relaxed resize-y text-xs"
                />
              </div>

              {/* Success / Error Alerts */}
              {emailSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{emailSuccessMsg}</span>
                </div>
              )}
              {emailErrMsg && (
                <div className="p-3 bg-red-50 border border-red-300 rounded-xl text-red-800 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{emailErrMsg}</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsEmailModalOpen(false)}
                  disabled={isSendingEmail}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSendingEmail}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-md flex items-center gap-2 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSendingEmail ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>মেইল পাঠানো হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>মেইল পাঠান (Send Email)</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
