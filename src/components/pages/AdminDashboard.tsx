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
  ChevronRight,
  GraduationCap,
  Briefcase,
  Droplet,
  Check,
  X
} from 'lucide-react';
import { db, auth, googleProvider } from '../../lib/firebase';
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
  fullName?: string;
  applicantNameBn?: string;
  applicantNameEn?: string;
  session?: string;
  batch?: string;
  mobile: string;
  email?: string;
  presentAddress?: string;
  permanentAddress?: string;
  occupation?: string;
  bloodGroup?: string;
  userPhotoUrl?: string;
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
  createdAt?: string;
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

  // Navigation tabs: overview, memberships, contacts, notices, batches
  const [activeTab, setActiveTab] = useState<'overview' | 'memberships' | 'contacts' | 'notices' | 'batches'>('overview');

  // Data states
  const [memberships, setMemberships] = useState<MembershipRecord[]>([]);
  const [contacts, setContacts] = useState<ContactRecord[]>([]);
  const [notices, setNotices] = useState<NoticeRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [batchFilter, setBatchFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');

  // Modals & Selection States
  const [selectedMember, setSelectedMember] = useState<MembershipRecord | null>(null);
  const [selectedContact, setSelectedContact] = useState<ContactRecord | null>(null);
  const [newNoticeModal, setNewNoticeModal] = useState<boolean>(false);
  const [newNoticeData, setNewNoticeData] = useState({
    title: '',
    category: 'জরুরি নোটিশ',
    description: '',
    isUrgent: false
  });

  // Dedicated Delete Confirmation States
  const [memberToDelete, setMemberToDelete] = useState<{ id: string; name: string; formNo?: string } | null>(null);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

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
    const pin = adminPin.trim().toLowerCase();
    if (pin === 'bot2026' || pin === 'jnu2026' || pin === 'botany2026' || pin === 'admin123' || pin === 'soc2026' || pin === 'amc2026') {
      setIsAuthenticated(true);
      const user = { name: 'উদ্ভিদবিজ্ঞান বিভাগীয় অ্যালামনাই অ্যাডমিন সেল', email: 'admin@botany-alumni.org' };
      setAdminUser(user);
      sessionStorage.setItem('botany_admin_auth', 'true');
      sessionStorage.setItem('botany_admin_user', JSON.stringify(user));
      setAuthError('');
      showToast(language === 'bn' ? 'উদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাডমিন প্যানেলে স্বাগতম!' : 'Welcome to Botany Alumni Admin Panel!');
    } else {
      setAuthError(language === 'bn' ? 'ভুল পাসকোড! সঠিক পাসকোড দিন (যেমন: bot2026 বা jnu2026)।' : 'Incorrect Passcode! Please try again.');
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
    let unsubContacts: () => void = () => {};
    let unsubNotices: () => void = () => {};

    try {
      // 1. Memberships
      const memQuery = query(collection(db, 'memberships'));
      unsubMemberships = onSnapshot(memQuery, (snapshot) => {
        const list: MembershipRecord[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data() as any;
          list.push({
            id: docSnap.id,
            formNo: d.formNo || `SOC-ALUMNI-${docSnap.id.slice(-4)}`,
            fullName: d.fullName || d.applicantNameBn || 'নামহীন সদস্য',
            applicantNameBn: d.applicantNameBn || d.fullName || 'নামহীন সদস্য',
            applicantNameEn: d.applicantNameEn || '',
            session: d.session || '',
            batch: d.batch || '',
            mobile: d.mobile || '',
            email: d.email || '',
            presentAddress: d.presentAddress || '',
            permanentAddress: d.permanentAddress || '',
            occupation: d.occupation || '',
            bloodGroup: d.bloodGroup || '',
            userPhotoUrl: d.userPhotoUrl || '',
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

      // 2. Contacts
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

      // 3. Notices
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
    } catch (e) {
      console.error(e);
      setLoading(false);
    }

    return () => {
      unsubMemberships();
      unsubContacts();
      unsubNotices();
    };
  }, [isAuthenticated]);

  // Update Membership Status
  const handleUpdateMemberStatus = async (id: string, newStatus: 'pending' | 'approved' | 'rejected') => {
    try {
      await updateDoc(doc(db, 'memberships', id), {
        status: newStatus
      });
      if (selectedMember && selectedMember.id === id) {
        setSelectedMember({ ...selectedMember, status: newStatus });
      }
      const label = newStatus === 'approved' ? 'অনুমোদিত (Approved)' : newStatus === 'rejected' ? 'বাতিল (Rejected)' : 'বিবেচনাধীন (Pending)';
      showToast(language === 'bn' ? `আবেদনের স্ট্যাটাস পরিবর্তিত হয়েছে: ${label}` : `Status updated to ${newStatus}`);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `memberships/${id}`);
      alert(language === 'bn' ? 'স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে।' : 'Failed to update status');
    }
  };

  // Send or Re-send Card Download SMS to Member
  const [sendingSmsId, setSendingSmsId] = useState<string | null>(null);
  const handleSendCardSMS = async (member: MembershipRecord) => {
    if (!member.mobile) {
      alert(language === 'bn' ? 'সদস্যের কোনো মোবাইল নম্বর নেই।' : 'No mobile number found for this member.');
      return;
    }
    setSendingSmsId(member.id);
    try {
      const formNo = member.formNo || '';
      const origin = window.location.origin;
      const downloadUrl = formNo ? `${origin}/card/${encodeURIComponent(formNo)}` : (member.transactionId ? `${origin}/?trx=${encodeURIComponent(member.transactionId)}` : `${origin}/members-list`);
      
      const res = await dispatchPaymentSMS({
        mobile: member.mobile,
        name: member.applicantNameBn || member.fullName || 'সদস্য',
        amount: member.feeAmount || '৫০০',
        tranId: member.transactionId || 'Manual',
        formNo: member.formNo,
        cardUrl: downloadUrl,
      });

      if (res.success) {
        showToast(language === 'bn' ? `${member.mobile} নম্বরে কার্ড ডাউনলোড লিংকসহ এসএমএস পাঠানো হয়েছে!` : 'SMS with card link sent successfully!');
      } else {
        alert(language === 'bn' ? `এসএমএস পাঠানো যায়নি: ${res.error || 'গেটওয়ে ত্রুটি'}` : `SMS failed: ${res.error}`);
      }
    } catch (e: any) {
      alert(`SMS Error: ${e?.message || 'Error'}`);
    } finally {
      setSendingSmsId(null);
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
        createdAt: new Date().toISOString()
      });
      setNewNoticeModal(false);
      setNewNoticeData({ title: '', category: 'জরুরি নোটিশ', description: '', isUrgent: false });
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

  // Export to CSV
  const handleExportCSV = () => {
    if (memberships.length === 0) {
      alert(language === 'bn' ? 'কোনো ডাটা পাওয়া যায়নি।' : 'No data to export.');
      return;
    }

    const headers = [
      'ফরম নম্বর',
      'আইডি',
      'নাম (বাংলা)',
      'নাম (ইংরেজি)',
      'শিক্ষাবর্ষ / সেশন',
      'অ্যালামনাই ব্যাচ',
      'মোবাইল নম্বর',
      'ইমেইল',
      'রক্তের গ্রুপ',
      'পেশা ও পদবী',
      'বর্তমান ঠিকানা',
      'স্থায়ী ঠিকানা',
      'সদস্যপদ ধরন',
      'ফি (টাকা)',
      'পেমেন্ট মেথড',
      'ট্রানজেকশন আইডি',
      'পেমেন্ট স্থিতি',
      'অনুমোদন স্ট্যাটাস',
      'আবেদনের তারিখ'
    ];

    const rows = filteredMemberships.map((m) => [
      `"${m.formNo || ''}"`,
      `"${m.id}"`,
      `"${m.applicantNameBn || m.fullName || ''}"`,
      `"${m.applicantNameEn || ''}"`,
      `"${m.session || ''}"`,
      `"${m.batch || ''}"`,
      `"${m.mobile || ''}"`,
      `"${m.email || ''}"`,
      `"${m.bloodGroup || ''}"`,
      `"${m.occupation || ''}"`,
      `"${(m.presentAddress || '').replace(/"/g, '""')}"`,
      `"${(m.permanentAddress || '').replace(/"/g, '""')}"`,
      `"${m.membershipType === 'life' ? 'আজীবন' : m.membershipType === 'student' ? 'ছাত্র' : 'সাধারণ'}"`,
      `"${m.feeAmount || '৫০০'}"`,
      `"${m.paymentMethod || 'Manual'}"`,
      `"${m.transactionId || ''}"`,
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

  // Filtered memberships
  const filteredMemberships = memberships.filter((m) => {
    const term = searchTerm.trim().toLowerCase();
    const matchSearch =
      !term ||
      (m.applicantNameBn && m.applicantNameBn.toLowerCase().includes(term)) ||
      (m.fullName && m.fullName.toLowerCase().includes(term)) ||
      (m.applicantNameEn && m.applicantNameEn.toLowerCase().includes(term)) ||
      (m.mobile && m.mobile.includes(term)) ||
      (m.email && m.email.toLowerCase().includes(term)) ||
      (m.formNo && m.formNo.toLowerCase().includes(term)) ||
      (m.transactionId && m.transactionId.toLowerCase().includes(term)) ||
      (m.session && m.session.toLowerCase().includes(term)) ||
      (m.batch && m.batch.toLowerCase().includes(term)) ||
      (m.occupation && m.occupation.toLowerCase().includes(term));

    const matchBatch =
      batchFilter === 'all' ||
      m.batch === batchFilter ||
      m.session === batchFilter;

    const matchStatus =
      statusFilter === 'all' ||
      (statusFilter === 'pending' && (!m.status || m.status === 'pending' || m.status === 'payment_pending')) ||
      m.status === statusFilter;

    const matchPayment =
      paymentFilter === 'all' ||
      (paymentFilter === 'paid' && m.paymentStatus === 'paid') ||
      (paymentFilter === 'unpaid' && m.paymentStatus !== 'paid');

    return matchSearch && matchBatch && matchStatus && matchPayment;
  });

  // Calculate stats
  const totalApps = memberships.length;
  const approvedCount = memberships.filter(m => m.status === 'approved').length;
  const pendingCount = memberships.filter(m => !m.status || m.status === 'pending' || m.status === 'payment_pending').length;
  const rejectedCount = memberships.filter(m => m.status === 'rejected').length;
  const paidCount = memberships.filter(m => m.paymentStatus === 'paid').length;

  const totalFees = memberships.reduce((acc, curr) => {
    const raw = curr.feeAmount || '500';
    const num = parseInt(raw.replace(/[^0-9]/g, ''), 10) || 500;
    return acc + num;
  }, 0);

  const unreadMessagesCount = contacts.filter(c => !c.status || c.status === 'unread').length;

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
      <div className="w-full min-h-screen flex-1 bg-gradient-to-b from-[#003828] via-[#004d38] to-[#002b1f] text-white py-12 px-4 flex flex-col items-center justify-center font-siliguri">
        {/* Back to portal button */}
        <div className="w-full max-w-md mb-6 flex justify-start">
          <button
            onClick={onBackToHome}
            className="flex items-center gap-2 text-xs font-bold text-emerald-200 hover:text-white bg-white/10 hover:bg-white/20 px-3.5 py-2 rounded-xl transition-all cursor-pointer border border-emerald-400/30"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{language === 'bn' ? 'মূল বাতায়নে ফিরে যান' : 'Back to Main Portal'}</span>
          </button>
        </div>

        {/* Login Box */}
        <div className="w-full max-w-md bg-[#002f21]/95 border-2 border-amber-400/60 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden backdrop-blur-md">
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
                {language === 'bn' ? 'জগন্নাথ বিশ্ববিদ্যালয়, ঢাকা' : 'Jagannath University, Dhaka'}
              </h1>
              <p className="text-xs sm:text-sm font-bold text-amber-300">
                {language === 'bn' ? 'উদ্ভিদবিজ্ঞান বিভাগ অ্যালামনাই অ্যাসোসিয়েশন' : 'Botany Alumni Association'}
              </p>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-800/90 border border-emerald-400/50 text-amber-200 text-xs font-bold shadow-xs">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>{language === 'bn' ? 'কেন্দ্রীয় প্রশাসনিক ড্যাশবোর্ড' : 'Central Admin Dashboard'}</span>
            </div>

            <p className="text-xs text-emerald-200/90 pt-1 leading-relaxed">
              {language === 'bn'
                ? 'অ্যালামনাই সদস্যপদ আবেদন অনুমোদন, ফি যাচাই, তালিকা ও নোটিশ পরিচালনার জন্য প্রবেশ করুন।'
                : 'Login to manage alumni registrations, fee approvals, and department bulletins.'}
            </p>
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
                <span>{language === 'bn' ? 'অ্যাডমিন পাসকোড / পিন (PIN)' : 'Admin Access Passcode'}</span>
                <span className="text-[11px] text-amber-300 font-mono">
                  {language === 'bn' ? 'ডিফল্ট: bot2026' : 'Default: bot2026'}
                </span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={adminPin}
                  onChange={(e) => setAdminPin(e.target.value)}
                  placeholder={language === 'bn' ? 'পাসকোড লিখুন (যেমন: bot2026 বা jnu2026)' : 'Enter PIN (e.g. bot2026 or jnu2026)'}
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

          {/* Footer note */}
          <p className="text-center text-[11px] text-emerald-300/70 border-t border-emerald-800/80 pt-3">
            {language === 'bn'
              ? 'উদ্ভিদবিজ্ঞান বিভাগীয় অ্যালামনাই কার্যনির্বাহী কমিটি ও দায়িত্বশীলদের ব্যবহারের জন্য সংরক্ষিত।'
              : 'Authorized Botany Alumni Association administrators only.'}
          </p>
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
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-sm sm:text-base md:text-lg text-white font-serif-bn leading-tight">
                  {language === 'bn' ? 'উদ্ভিদবিজ্ঞান বিভাগ - অ্যালামনাই ড্যাশবোর্ড' : 'Botany Alumni - Admin Panel'}
                </h1>
                <span className="bg-amber-400 text-[#004d38] text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  ADMIN
                </span>
              </div>
              <p className="text-[11px] text-emerald-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>জগন্নাথ বিশ্ববিদ্যালয়, ঢাকা</span>
                <span>•</span>
                <span className="text-amber-200 font-bold">{adminUser.name}</span>
              </p>
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

        {/* Tab Navigation Menu */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 flex items-center gap-1 overflow-x-auto scrollbar-none pt-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 sm:px-4 py-2 text-xs font-bold rounded-t-xl transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-[#f4f7f5] text-[#004d38] border-t-2 border-amber-400 shadow-xs'
                : 'text-emerald-100 hover:bg-emerald-800/60'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-amber-300" />
            <span>{language === 'bn' ? 'সারসংক্ষেপ (Overview)' : 'Overview'}</span>
          </button>

          <button
            onClick={() => setActiveTab('memberships')}
            className={`px-3.5 sm:px-4 py-2 text-xs font-bold rounded-t-xl transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'memberships'
                ? 'bg-[#f4f7f5] text-[#004d38] border-t-2 border-amber-400 shadow-xs'
                : 'text-emerald-100 hover:bg-emerald-800/60'
            }`}
          >
            <Users className="w-4 h-4 text-emerald-300" />
            <span>{language === 'bn' ? 'অ্যালামনাই আবেদনসমূহ' : 'Alumni Applications'}</span>
            <span className="bg-amber-400 text-[#004d38] text-[10px] font-black px-1.5 py-0.2 rounded-full ml-0.5">
              {memberships.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('batches')}
            className={`px-3.5 sm:px-4 py-2 text-xs font-bold rounded-t-xl transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'batches'
                ? 'bg-[#f4f7f5] text-[#004d38] border-t-2 border-amber-400 shadow-xs'
                : 'text-emerald-100 hover:bg-emerald-800/60'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-blue-300" />
            <span>{language === 'bn' ? 'ব্যাচ ও সেশন পরিসংখ্যান' : 'Batch & Sessions'}</span>
          </button>

          <button
            onClick={() => setActiveTab('contacts')}
            className={`px-3.5 sm:px-4 py-2 text-xs font-bold rounded-t-xl transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'contacts'
                ? 'bg-[#f4f7f5] text-[#004d38] border-t-2 border-amber-400 shadow-xs'
                : 'text-emerald-100 hover:bg-emerald-800/60'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-purple-300" />
            <span>{language === 'bn' ? 'বার্তা ও মতামত' : 'Messages'}</span>
            {unreadMessagesCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full ml-0.5 animate-pulse">
                {unreadMessagesCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('notices')}
            className={`px-3.5 sm:px-4 py-2 text-xs font-bold rounded-t-xl transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'notices'
                ? 'bg-[#f4f7f5] text-[#004d38] border-t-2 border-amber-400 shadow-xs'
                : 'text-emerald-100 hover:bg-emerald-800/60'
            }`}
          >
            <Bell className="w-4 h-4 text-rose-300" />
            <span>{language === 'bn' ? 'নোটিশ ও বিজ্ঞপ্তি' : 'Notices'}</span>
            <span className="bg-emerald-700 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full ml-0.5">
              {notices.length}
            </span>
          </button>
        </div>
      </header>

      {/* Main Container Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-6 space-y-6">
        
        {/* ================= TAB 1: OVERVIEW ================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Welcome banner */}
            <div className="bg-gradient-to-br from-[#004d38] via-[#006a4e] to-[#003828] text-white p-5 sm:p-6 rounded-2xl shadow-md border-2 border-emerald-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-300 px-3 py-0.5 rounded-full text-xs font-bold border border-amber-400/30">
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>উদ্ভিদবিজ্ঞান বিভাগ অ্যালামনাই অ্যাসোসিয়েশন</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black font-serif-bn text-white">
                  {language === 'bn' ? 'অ্যালামনাই ও সদস্যপদ কেন্দ্রীয় ডাটাবেজ' : 'Alumni & Membership Central Control'}
                </h2>
                <p className="text-xs sm:text-sm text-emerald-100/90 max-w-2xl leading-relaxed">
                  {language === 'bn'
                    ? '১ম থেকে ২৭তম ব্যাচের সকল প্রাক্তন ও বর্তমান শিক্ষার্থীর সদস্যপদ আবেদন, ফি পেমেন্ট TrxID যাচাই এবং অনুমোদন স্থিতি এখানে সার্বক্ষণিক আপডেট হচ্ছে।'
                    : 'Real-time overview of all alumni applications, payment transactions, and verification records.'}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setActiveTab('memberships')}
                  className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-[#004d38] rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Users className="w-4 h-4" />
                  <span>{language === 'bn' ? 'আবেদন তালিকা দেখুন' : 'View Applications'}</span>
                </button>
                <button
                  onClick={() => setNewNoticeModal(true)}
                  className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-white/20 cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-amber-300" />
                  <span>{language === 'bn' ? 'নতুন নোটিশ' : 'New Notice'}</span>
                </button>
              </div>
            </div>

            {/* Metrics cards grid - Ultra bold, colored & prominent shadows */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {/* Card 1: Total Applications */}
              <div className="bg-white p-5 sm:p-6 rounded-2xl border-2 border-emerald-500/30 shadow-lg shadow-emerald-900/10 hover:shadow-xl hover:shadow-emerald-900/15 space-y-3 transition-all transform hover:-translate-y-0.5 relative overflow-hidden group">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-600" />
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-[13px] font-black tracking-wide text-emerald-950">
                    {language === 'bn' ? 'মোট অ্যালামনাই আবেদন' : 'Total Applications'}
                  </span>
                  <div className="p-2.5 rounded-xl bg-emerald-100/90 text-[#006a4e] shadow-xs group-hover:scale-105 transition-transform">
                    <Users className="w-5 h-5 stroke-[2.5]" />
                  </div>
                </div>
                <div className="text-3xl sm:text-4xl font-black text-emerald-950 font-mono tracking-tight drop-shadow-xs">
                  {totalApps}
                </div>
                <div className="text-xs font-extrabold flex items-center justify-between gap-1.5 pt-2 border-t-2 border-emerald-100">
                  <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    {approvedCount} {language === 'bn' ? 'অনুমোদিত' : 'Approved'}
                  </span>
                  <span className="text-gray-300 font-bold">•</span>
                  <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    {pendingCount} {language === 'bn' ? 'বিবেচনাধীন' : 'Pending'}
                  </span>
                </div>
              </div>

              {/* Card 2: Total Fees Collected */}
              <div className="bg-white p-5 sm:p-6 rounded-2xl border-2 border-amber-500/40 shadow-lg shadow-amber-900/10 hover:shadow-xl hover:shadow-amber-900/15 space-y-3 transition-all transform hover:-translate-y-0.5 relative overflow-hidden group">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-amber-500 to-emerald-600" />
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-[13px] font-black tracking-wide text-amber-950">
                    {language === 'bn' ? 'সংগৃহীত সদস্য ফি' : 'Total Fees Collected'}
                  </span>
                  <div className="p-2.5 rounded-xl bg-amber-100/90 text-amber-800 shadow-xs group-hover:scale-105 transition-transform">
                    <DollarSign className="w-5 h-5 stroke-[2.5]" />
                  </div>
                </div>
                <div className="text-3xl sm:text-4xl font-black text-[#006a4e] font-mono tracking-tight drop-shadow-xs">
                  ৳ {totalFees.toLocaleString('bn-BD')}
                </div>
                <div className="text-xs font-extrabold flex items-center justify-between pt-2 border-t-2 border-amber-100">
                  <span className="text-gray-700 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-200">
                    {language === 'bn' ? '৫০০/- টাকা হারে নিবন্ধন' : 'Fee @ 500 BDT'}
                  </span>
                  <span className="text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-md border border-emerald-300 font-mono font-black">
                    {paidCount} {language === 'bn' ? 'পেইড' : 'Paid'}
                  </span>
                </div>
              </div>

              {/* Card 3: Citizen Inquiries */}
              <div className="bg-white p-5 sm:p-6 rounded-2xl border-2 border-blue-500/30 shadow-lg shadow-blue-900/10 hover:shadow-xl hover:shadow-blue-900/15 space-y-3 transition-all transform hover:-translate-y-0.5 relative overflow-hidden group">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600" />
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-[13px] font-black tracking-wide text-blue-950">
                    {language === 'bn' ? 'বার্তা ও পরামর্শ বক্স' : 'Inquiries & Feedback'}
                  </span>
                  <div className="p-2.5 rounded-xl bg-blue-100/90 text-blue-800 shadow-xs group-hover:scale-105 transition-transform">
                    <MessageSquare className="w-5 h-5 stroke-[2.5]" />
                  </div>
                </div>
                <div className="text-3xl sm:text-4xl font-black text-blue-950 font-mono tracking-tight drop-shadow-xs">
                  {contacts.length}
                </div>
                <div className="text-xs font-extrabold flex items-center gap-2 pt-2 border-t-2 border-blue-100">
                  <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 font-mono font-black">
                    {unreadMessagesCount}
                  </span>
                  <span className="text-gray-800">
                    {language === 'bn' ? 'টি নতুন অপঠিত বার্তা' : 'unread messages'}
                  </span>
                </div>
              </div>

              {/* Card 4: Published Notices */}
              <div className="bg-white p-5 sm:p-6 rounded-2xl border-2 border-purple-500/30 shadow-lg shadow-purple-900/10 hover:shadow-xl hover:shadow-purple-900/15 space-y-3 transition-all transform hover:-translate-y-0.5 relative overflow-hidden group">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-500 to-rose-500" />
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-[13px] font-black tracking-wide text-purple-950">
                    {language === 'bn' ? 'সক্রিয় নোটিশ ও বিজ্ঞপ্তি' : 'Active Bulletins'}
                  </span>
                  <div className="p-2.5 rounded-xl bg-purple-100/90 text-purple-800 shadow-xs group-hover:scale-105 transition-transform">
                    <Bell className="w-5 h-5 stroke-[2.5]" />
                  </div>
                </div>
                <div className="text-3xl sm:text-4xl font-black text-purple-950 font-mono tracking-tight drop-shadow-xs">
                  {notices.length}
                </div>
                <div className="text-xs font-extrabold text-gray-800 pt-2 border-t-2 border-purple-100 flex items-center justify-between">
                  <span className="bg-purple-50 text-purple-900 px-2 py-0.5 rounded-md border border-purple-200">
                    {language === 'bn' ? 'অ্যালামনাই ও বিভাগীয় বিজ্ঞপ্তি' : 'Announcements & events'}
                  </span>
                </div>
              </div>
            </div>

            {/* 2-Column Section: Batch Distribution & Latest Submissions */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Batch Distribution */}
              <div className="lg:col-span-6 bg-white p-5 sm:p-6 rounded-2xl border border-emerald-100 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2 font-bold text-gray-900 text-sm">
                    <GraduationCap className="w-4 h-4 text-[#006a4e]" />
                    <span>{language === 'bn' ? 'ব্যাচ ও সেশন ভিত্তিক সদস্য বণ্টন' : 'Applications by Batch'}</span>
                  </div>
                  <button
                    onClick={() => setActiveTab('batches')}
                    className="text-xs text-[#006a4e] font-bold hover:underline"
                  >
                    {language === 'bn' ? 'সকল ব্যাচ দেখুন →' : 'View All →'}
                  </button>
                </div>

                <div className="space-y-3">
                  {batchStats.slice(0, 8).map((b, idx) => {
                    const pct = totalApps > 0 ? Math.round((b.count / totalApps) * 100) : 0;
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-gray-700">
                          <span className="font-bold">{b.batchBn} ({b.sessionBn})</span>
                          <span className="text-[#006a4e] font-mono font-bold">
                            {b.count} {language === 'bn' ? 'জন' : 'members'} ({pct}%)
                          </span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-600 to-teal-700 rounded-full transition-all duration-500"
                            style={{ width: `${Math.max(pct, b.count > 0 ? 8 : 0)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recent Applications Feed */}
              <div className="lg:col-span-6 bg-white p-5 sm:p-6 rounded-2xl border border-emerald-100 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2 font-bold text-gray-900 text-sm">
                    <Clock className="w-4 h-4 text-[#006a4e]" />
                    <span>{language === 'bn' ? 'সাম্প্রতিক সদস্য আবেদনসমূহ' : 'Recent Applications'}</span>
                  </div>
                  <button
                    onClick={() => setActiveTab('memberships')}
                    className="text-xs text-[#006a4e] font-bold hover:underline"
                  >
                    {language === 'bn' ? 'সকল দেখুন (' + memberships.length + ') →' : 'View All →'}
                  </button>
                </div>

                {memberships.length === 0 ? (
                  <div className="text-center py-10 text-xs text-gray-400 space-y-2">
                    <FileText className="w-8 h-8 mx-auto text-gray-300" />
                    <p>{language === 'bn' ? 'এখনও কোনো আবেদন জমা পড়েনি।' : 'No applications received yet.'}</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {memberships.slice(0, 5).map((m) => (
                      <div
                        key={m.id}
                        onClick={() => setSelectedMember(m)}
                        className="p-3 rounded-xl border border-gray-100 hover:border-emerald-300 hover:bg-emerald-50/40 transition-all flex items-center justify-between gap-3 cursor-pointer group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Member Photo or Initial */}
                          <div className="w-10 h-10 rounded-full bg-emerald-700 text-white flex items-center justify-center font-black overflow-hidden shrink-0 text-sm shadow-xs">
                            {m.userPhotoUrl ? (
                              <img src={m.userPhotoUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span>{(m.applicantNameBn || m.fullName || 'ম').charAt(0)}</span>
                            )}
                          </div>

                          <div className="space-y-0.5 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-gray-900 group-hover:text-[#006a4e] truncate">
                                {m.applicantNameBn || m.fullName}
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                                m.status === 'approved'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : m.status === 'rejected'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {m.status === 'approved' ? 'অনুমোদিত' : m.status === 'rejected' ? 'বাতিল' : 'বিবেচনাধীন'}
                              </span>
                            </div>
                            <div className="text-[11px] text-gray-500 flex items-center gap-2">
                              <span className="font-mono">{m.mobile}</span>
                              <span>•</span>
                              <span className="text-emerald-700 font-semibold">{m.batch || m.session || 'সেশন উল্লেখ নেই'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right">
                            <span className="text-xs font-mono font-bold text-emerald-800">৳ {m.feeAmount || '৫০০'}</span>
                            <p className="text-[10px] text-gray-400 font-mono">
                              {m.formNo ? m.formNo.slice(-8) : m.id.slice(-6)}
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              confirmSingleDelete(m.id, m.applicantNameBn || m.fullName || 'Member', m.formNo);
                            }}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            title={language === 'bn' ? 'সদস্য ডিলিট করুন' : 'Delete Member'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: MEMBERSHIPS MANAGEMENT ================= */}
        {activeTab === 'memberships' && (
          <div className="space-y-5 animate-in fade-in duration-300">
            {/* Header & Action Bar */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-emerald-100 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900 font-serif-bn flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#006a4e]" />
                  <span>{language === 'bn' ? 'অ্যালামনাই সদস্যপদ আবেদন তালিকা ও অনুমোদন' : 'Alumni Membership Applications'}</span>
                </h2>
                <p className="text-xs text-gray-500">
                  {language === 'bn'
                    ? `মোট প্রাপ্ত আবেদন: ${memberships.length} টি | বর্তমান ফিল্টারে: ${filteredMemberships.length} টি`
                    : `Total Applications: ${memberships.length} | Filtered: ${filteredMemberships.length}`}
                </p>
              </div>

              {/* Export Button */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleExportCSV}
                  className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-[#006a4e] border-2 border-emerald-300 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>{language === 'bn' ? 'এক্সেল / সিএসভি ডাউনলোড' : 'Export CSV'}</span>
                </button>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-xs grid grid-cols-1 sm:grid-cols-12 gap-3">
              {/* Search Box */}
              <div className="sm:col-span-5 relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={language === 'bn' ? 'নাম, ফরম নং, মোবাইল, সেশন, ইমেইল বা ট্রানজেকশন...' : 'Search by name, form no, mobile, session...'}
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

              {/* Batch Filter */}
              <div className="sm:col-span-3">
                <select
                  value={batchFilter}
                  onChange={(e) => setBatchFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#006a4e] font-semibold text-gray-700 cursor-pointer"
                >
                  <option value="all">{language === 'bn' ? 'সকল ব্যাচ ও সেশন' : 'All Batches & Sessions'}</option>
                  {BATCH_SESSION_LIST.map((b, i) => (
                    <option key={i} value={b.batchBn}>
                      {b.displayLabelBn}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="sm:col-span-2">
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
              <div className="sm:col-span-2">
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
            <div className="bg-white rounded-2xl border border-emerald-100 shadow-xs overflow-hidden">
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
                    {filteredMemberships.map((m, idx) => {
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
                              <span className="font-mono text-gray-400 text-xs font-bold">#{idx + 1}</span>
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
                          <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100 flex flex-wrap items-center justify-between gap-1.5 text-xs">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-[#006a4e] font-mono">৳ {m.feeAmount || '৫০০'}</span>
                              <span className="text-gray-400">•</span>
                              <span className="text-gray-600 font-medium">{m.paymentMethod || 'Manual'}</span>
                            </div>
                            {m.transactionId && (
                              <span className="font-mono text-[11px] font-bold text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">
                                Trx: {m.transactionId}
                              </span>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center justify-end gap-2 pt-1 border-t border-gray-100">
                            <button
                              onClick={() => handleSendCardSMS(m)}
                              disabled={sendingSmsId === m.id}
                              className="px-3 py-1.5 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 disabled:opacity-50 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <MessageSquare className={`w-3.5 h-3.5 ${sendingSmsId === m.id ? 'animate-spin' : ''}`} />
                              <span>{language === 'bn' ? 'এসএমএস' : 'SMS'}</span>
                            </button>
                            <button
                              onClick={() => setSelectedMember(m)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-50 text-[#006a4e] hover:bg-emerald-100 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>{language === 'bn' ? 'বিবরণ' : 'View'}</span>
                            </button>
                            <button
                              onClick={() => confirmSingleDelete(m.id, m.applicantNameBn || m.fullName || 'Member', m.formNo)}
                              className="px-2.5 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
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
                        {filteredMemberships.map((m, idx) => {
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
                                {idx + 1}
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
                                <div className="font-bold text-[#006a4e] font-mono">৳ {m.feeAmount || '৫০০'}</div>
                                <div className="text-[10px] text-gray-700 font-mono flex items-center gap-1 flex-wrap">
                                  <span className="font-bold text-gray-900">{m.paymentMethod || 'Manual'}</span>
                                  {m.transactionId && (
                                    <>
                                      <span>•</span>
                                      <span className="font-bold text-red-700 bg-red-50 border border-red-200 px-1 rounded" title={`TrxID: ${m.transactionId}`}>
                                        Trx: {m.transactionId}
                                      </span>
                                    </>
                                  )}
                                </div>
                                {m.senderNumber && (
                                  <div className="text-[10px] text-gray-500 font-mono">
                                    প্রেরক: {m.senderNumber}
                                  </div>
                                )}
                              </td>
                              <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                                <select
                                  value={m.status === 'payment_pending' ? 'pending' : (m.status || 'pending')}
                                  onChange={(e) => handleUpdateMemberStatus(m.id, e.target.value as any)}
                                  className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border focus:outline-none cursor-pointer transition-all ${
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
                              </td>
                              <td className="py-3.5 px-4 text-right space-x-1.5" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={() => handleSendCardSMS(m)}
                                  disabled={sendingSmsId === m.id}
                                  className="p-1.5 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 disabled:opacity-50 transition-colors cursor-pointer"
                                  title={language === 'bn' ? 'কার্ড লিংকসহ এসএমএস পাঠান' : 'Send Card Download SMS'}
                                >
                                  <MessageSquare className={`w-4 h-4 ${sendingSmsId === m.id ? 'animate-spin' : ''}`} />
                                </button>
                                <button
                                  onClick={() => setSelectedMember(m)}
                                  className="p-1.5 rounded-lg bg-emerald-50 text-[#006a4e] hover:bg-emerald-100 transition-colors cursor-pointer"
                                  title={language === 'bn' ? 'পূর্ণ বিবরণ ও সনদ প্রিন্ট' : 'View Full Certificate'}
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => confirmSingleDelete(m.id, m.applicantNameBn || m.fullName || 'Member', m.formNo)}
                                  className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
                                  title={language === 'bn' ? 'সদস্য ডিলিট করুন' : 'Delete Member'}
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
                </>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 3: BATCHES & SESSIONS STATS ================= */}
        {activeTab === 'batches' && (
          <div className="space-y-5 animate-in fade-in duration-300">
            <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white p-5 sm:p-6 rounded-2xl border border-emerald-700/50 shadow-lg shadow-emerald-950/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg sm:text-xl font-black font-serif-bn flex items-center gap-2.5 text-white tracking-wide">
                  <span className="p-2 rounded-xl bg-white/10 text-emerald-300 backdrop-blur-xs">
                    <GraduationCap className="w-6 h-6 stroke-[2.5]" />
                  </span>
                  <span>{language === 'bn' ? 'উদ্ভিদবিজ্ঞান বিভাগের ব্যাচ ও সেশন ভিত্তিক পরিসংখ্যান (১ম - ২৭তম ব্যাচ)' : 'Batch & Session Statistics'}</span>
                </h2>
                <p className="text-xs sm:text-sm text-emerald-200/90 font-medium mt-1">
                  {language === 'bn'
                    ? 'প্রতিটি ব্যাচের সদস্য নিবন্ধন সংখ্যা, অনুমোদনের হার ও ফি আদায়ের পুঙ্খানুপুঙ্খ হিসাব।'
                    : 'Membership breakdown across all 27 batches of Botany Department.'}
                </p>
              </div>
            </div>

            {/* Batch Cards Grid - Rich Colored & Prominent Shadows */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {batchStats.map((b, i) => {
                const batchMembers = memberships.filter(
                  (m) =>
                    m.batch === b.batchBn ||
                    m.session === b.sessionBn ||
                    (m.session && m.session.includes(b.sessionBn))
                );
                const approvedInBatch = batchMembers.filter((m) => m.status === 'approved').length;
                const totalBatchFees = batchMembers.reduce((acc, m) => {
                  const raw = m.feeAmount || '500';
                  return acc + (parseInt(raw.replace(/[^0-9]/g, ''), 10) || 500);
                }, 0);

                // Rotating colorful theme palette for each batch card
                const themes = [
                  {
                    cardBg: 'bg-gradient-to-br from-emerald-100/90 via-teal-50/70 to-emerald-50 border-2 border-emerald-400/80 shadow-lg shadow-emerald-950/10 hover:shadow-xl hover:shadow-emerald-950/20',
                    topStripe: 'bg-gradient-to-r from-emerald-500 to-teal-600',
                    batchTitle: 'text-emerald-950',
                    sessionText: 'text-emerald-800 font-extrabold',
                    badge: 'bg-emerald-700 text-white shadow-sm border border-emerald-600',
                    stat1Bg: 'bg-white/95 border-2 border-emerald-200 shadow-xs',
                    stat1Label: 'text-emerald-900 font-bold',
                    stat1Value: 'text-emerald-950 font-black',
                    stat2Bg: 'bg-emerald-200/70 border-2 border-emerald-300 shadow-xs',
                    stat2Label: 'text-emerald-950 font-bold',
                    stat2Value: 'text-[#005a40] font-black',
                    button: 'bg-[#006a4e] hover:bg-[#00523c] text-white shadow-sm hover:shadow-md'
                  },
                  {
                    cardBg: 'bg-gradient-to-br from-blue-100/90 via-sky-50/70 to-indigo-50 border-2 border-blue-400/80 shadow-lg shadow-blue-950/10 hover:shadow-xl hover:shadow-blue-950/20',
                    topStripe: 'bg-gradient-to-r from-blue-500 to-indigo-600',
                    batchTitle: 'text-blue-950',
                    sessionText: 'text-blue-800 font-extrabold',
                    badge: 'bg-blue-700 text-white shadow-sm border border-blue-600',
                    stat1Bg: 'bg-white/95 border-2 border-blue-200 shadow-xs',
                    stat1Label: 'text-blue-900 font-bold',
                    stat1Value: 'text-blue-950 font-black',
                    stat2Bg: 'bg-blue-200/70 border-2 border-blue-300 shadow-xs',
                    stat2Label: 'text-blue-950 font-bold',
                    stat2Value: 'text-blue-950 font-black',
                    button: 'bg-blue-700 hover:bg-blue-800 text-white shadow-sm hover:shadow-md'
                  },
                  {
                    cardBg: 'bg-gradient-to-br from-amber-100/90 via-orange-50/70 to-amber-50 border-2 border-amber-400/80 shadow-lg shadow-amber-950/10 hover:shadow-xl hover:shadow-amber-950/20',
                    topStripe: 'bg-gradient-to-r from-amber-500 to-orange-600',
                    batchTitle: 'text-amber-950',
                    sessionText: 'text-amber-800 font-extrabold',
                    badge: 'bg-amber-700 text-white shadow-sm border border-amber-600',
                    stat1Bg: 'bg-white/95 border-2 border-amber-200 shadow-xs',
                    stat1Label: 'text-amber-900 font-bold',
                    stat1Value: 'text-amber-950 font-black',
                    stat2Bg: 'bg-amber-200/70 border-2 border-amber-300 shadow-xs',
                    stat2Label: 'text-amber-950 font-bold',
                    stat2Value: 'text-amber-950 font-black',
                    button: 'bg-amber-700 hover:bg-amber-800 text-white shadow-sm hover:shadow-md'
                  },
                  {
                    cardBg: 'bg-gradient-to-br from-purple-100/90 via-fuchsia-50/70 to-purple-50 border-2 border-purple-400/80 shadow-lg shadow-purple-950/10 hover:shadow-xl hover:shadow-purple-950/20',
                    topStripe: 'bg-gradient-to-r from-purple-500 to-fuchsia-600',
                    batchTitle: 'text-purple-950',
                    sessionText: 'text-purple-800 font-extrabold',
                    badge: 'bg-purple-700 text-white shadow-sm border border-purple-600',
                    stat1Bg: 'bg-white/95 border-2 border-purple-200 shadow-xs',
                    stat1Label: 'text-purple-900 font-bold',
                    stat1Value: 'text-purple-950 font-black',
                    stat2Bg: 'bg-purple-200/70 border-2 border-purple-300 shadow-xs',
                    stat2Label: 'text-purple-950 font-bold',
                    stat2Value: 'text-purple-950 font-black',
                    button: 'bg-purple-700 hover:bg-purple-800 text-white shadow-sm hover:shadow-md'
                  },
                  {
                    cardBg: 'bg-gradient-to-br from-rose-100/90 via-pink-50/70 to-rose-50 border-2 border-rose-400/80 shadow-lg shadow-rose-950/10 hover:shadow-xl hover:shadow-rose-950/20',
                    topStripe: 'bg-gradient-to-r from-rose-500 to-pink-600',
                    batchTitle: 'text-rose-950',
                    sessionText: 'text-rose-800 font-extrabold',
                    badge: 'bg-rose-700 text-white shadow-sm border border-rose-600',
                    stat1Bg: 'bg-white/95 border-2 border-rose-200 shadow-xs',
                    stat1Label: 'text-rose-900 font-bold',
                    stat1Value: 'text-rose-950 font-black',
                    stat2Bg: 'bg-rose-200/70 border-2 border-rose-300 shadow-xs',
                    stat2Label: 'text-rose-950 font-bold',
                    stat2Value: 'text-rose-950 font-black',
                    button: 'bg-rose-700 hover:bg-rose-800 text-white shadow-sm hover:shadow-md'
                  },
                  {
                    cardBg: 'bg-gradient-to-br from-teal-100/90 via-cyan-50/70 to-teal-50 border-2 border-teal-400/80 shadow-lg shadow-teal-950/10 hover:shadow-xl hover:shadow-teal-950/20',
                    topStripe: 'bg-gradient-to-r from-teal-500 to-cyan-600',
                    batchTitle: 'text-teal-950',
                    sessionText: 'text-teal-800 font-extrabold',
                    badge: 'bg-teal-700 text-white shadow-sm border border-teal-600',
                    stat1Bg: 'bg-white/95 border-2 border-teal-200 shadow-xs',
                    stat1Label: 'text-teal-900 font-bold',
                    stat1Value: 'text-teal-950 font-black',
                    stat2Bg: 'bg-teal-200/70 border-2 border-teal-300 shadow-xs',
                    stat2Label: 'text-teal-950 font-bold',
                    stat2Value: 'text-teal-950 font-black',
                    button: 'bg-teal-700 hover:bg-teal-800 text-white shadow-sm hover:shadow-md'
                  }
                ];

                const theme = themes[i % themes.length];

                return (
                  <div
                    key={i}
                    className={`${theme.cardBg} p-5 rounded-2xl transition-all duration-200 space-y-3.5 relative overflow-hidden transform hover:-translate-y-1 group`}
                  >
                    <div className={`absolute top-0 left-0 right-0 h-1.5 ${theme.topStripe}`} />

                    <div className="flex items-center justify-between border-b border-black/10 pb-2.5 pt-1">
                      <div>
                        <h3 className={`font-black text-base sm:text-lg ${theme.batchTitle} tracking-tight font-serif-bn`}>
                          {b.batchBn}
                        </h3>
                        <span className={`text-xs ${theme.sessionText} font-mono block`}>
                          সেশন: {b.sessionBn}
                        </span>
                      </div>
                      <span className={`${theme.badge} font-mono font-black text-xs px-3 py-1 rounded-full`}>
                        {batchMembers.length} {language === 'bn' ? 'আবেদন' : 'apps'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className={`${theme.stat1Bg} p-3 rounded-xl`}>
                        <span className={`text-[11px] ${theme.stat1Label} block mb-0.5`}>
                          {language === 'bn' ? 'অনুমোদিত সদস্য' : 'Approved'}
                        </span>
                        <span className={`text-base font-mono ${theme.stat1Value}`}>
                          {approvedInBatch} জন
                        </span>
                      </div>
                      <div className={`${theme.stat2Bg} p-3 rounded-xl`}>
                        <span className={`text-[11px] ${theme.stat2Label} block mb-0.5`}>
                          {language === 'bn' ? 'সংগৃহীত ফি' : 'Fee Total'}
                        </span>
                        <span className={`text-base font-mono ${theme.stat2Value}`}>
                          ৳ {totalBatchFees}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setBatchFilter(b.batchBn);
                        setActiveTab('memberships');
                      }}
                      className={`w-full text-center py-2.5 ${theme.button} text-xs font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5`}
                    >
                      <span>{language === 'bn' ? 'এই ব্যাচের সদস্য তালিকা' : 'View Members'}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= TAB 4: CITIZEN MESSAGES ================= */}
        {activeTab === 'contacts' && (
          <div className="space-y-5 animate-in fade-in duration-300">
            <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-xs flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900 font-serif-bn flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-[#006a4e]" />
                  <span>{language === 'bn' ? 'অ্যালামনাই ও ভিজিটর মতামত, বার্তা ও যোগাযোগ' : 'Inquiries & Feedback'}</span>
                </h2>
                <p className="text-xs text-gray-500">
                  {language === 'bn'
                    ? 'ওয়েবসাইটে পাঠানো সাধারণ অ্যালামনাই ও শুভানুধ্যায়ীদের বার্তা ও পরামর্শ।'
                    : 'Messages and inquiries submitted by alumni and portal visitors.'}
                </p>
              </div>
            </div>

            {contacts.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-emerald-100 text-center text-xs text-gray-400 space-y-2">
                <MessageSquare className="w-10 h-10 mx-auto text-gray-300" />
                <p className="font-bold text-gray-600 text-sm">
                  {language === 'bn' ? 'কোনো বার্তা জমা পড়েনি' : 'No messages received yet'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {contacts.map((c) => (
                  <div
                    key={c.id}
                    className={`bg-white p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-3 shadow-xs hover:shadow-md ${
                      !c.status || c.status === 'unread'
                        ? 'border-emerald-500/80 bg-emerald-50/20 ring-1 ring-emerald-400'
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          c.status === 'resolved'
                            ? 'bg-blue-100 text-blue-800'
                            : c.status === 'read'
                            ? 'bg-gray-100 text-gray-700'
                            : 'bg-red-100 text-red-800 animate-pulse'
                        }`}>
                          {c.status === 'resolved' ? 'নিষ্পন্ন' : c.status === 'read' ? 'পঠিত' : 'নতুন অপঠিত'}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">
                          {c.createdAt ? new Date(c.createdAt).toLocaleDateString('bn-BD') : ''}
                        </span>
                      </div>

                      <h3 className="font-bold text-sm text-gray-900">{c.name}</h3>

                      {c.subject && (
                        <p className="text-xs font-semibold text-emerald-800 line-clamp-1">
                          {c.subject}
                        </p>
                      )}

                      <p className="text-xs text-gray-600 bg-gray-50 p-2.5 rounded-xl border border-gray-100 leading-relaxed max-h-32 overflow-y-auto">
                        {c.message}
                      </p>

                      <div className="space-y-1 text-xs text-gray-600 pt-1">
                        <div className="flex items-center gap-1.5 font-mono">
                          <Phone className="w-3.5 h-3.5 text-[#006a4e]" />
                          <a href={`tel:${c.phone}`} className="hover:underline text-emerald-800 font-bold">
                            {c.phone}
                          </a>
                        </div>
                        {c.email && (
                          <div className="flex items-center gap-1.5 text-[11px]">
                            <Mail className="w-3.5 h-3.5 text-gray-400" />
                            <a href={`mailto:${c.email}`} className="hover:underline text-gray-600 truncate">
                              {c.email}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1">
                        {c.status !== 'read' && (
                          <button
                            onClick={() => handleUpdateContactStatus(c.id, 'read')}
                            className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-[11px] font-bold cursor-pointer"
                          >
                            {language === 'bn' ? 'পঠিত' : 'Read'}
                          </button>
                        )}
                        {c.status !== 'resolved' && (
                          <button
                            onClick={() => handleUpdateContactStatus(c.id, 'resolved')}
                            className="px-2 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg text-[11px] font-bold cursor-pointer"
                          >
                            {language === 'bn' ? 'নিষ্পন্ন' : 'Resolved'}
                          </button>
                        )}
                      </div>

                      <button
                        onClick={() => handleDeleteContact(c.id)}
                        className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                        title={language === 'bn' ? 'মুছে ফেলুন' : 'Delete'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 5: NOTICES & BULLETINS ================= */}
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
                      <div className="flex items-center gap-2">
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
                      </div>
                      <h3 className="font-bold text-base text-gray-900">{n.title}</h3>
                      <p className="text-xs text-gray-600 leading-relaxed">{n.description}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
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
      </main>

      {/* ================= MODAL: MEMBER APPLICATION DETAILS & PRINTABLE CERTIFICATE ================= */}
      {selectedMember && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto font-siliguri animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-7 space-y-6 shadow-2xl border-2 border-[#006a4e] relative my-6">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
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
                  <h3 className="font-bold text-base sm:text-lg text-gray-900 font-serif-bn">
                    {language === 'bn' ? 'অ্যালামনাই সদস্যপদ সনদ ও নিবন্ধন বিবরণী' : 'Alumni Registration Certificate'}
                  </h3>
                  <p className="text-[11px] text-gray-500 font-mono">
                    ফরম নং: <strong className="text-[#006a4e]">{selectedMember.formNo || selectedMember.id}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedMember(null)}
                className="text-gray-400 hover:text-gray-600 p-1 text-xl font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Printable Member Certificate Box */}
            <div id="printable-member-certificate" className="bg-[#fcfdfa] border-2 border-emerald-800/60 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs relative overflow-hidden">
              {/* Watermark logo */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
                <img
                  src="/jnu_botany_alumni_logo.jpg"
                  alt="Watermark"
                  className="w-64 h-64 object-contain rounded-full"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Certificate Header */}
              <div className="text-center border-b-2 border-emerald-700/40 pb-3 space-y-1">
                <h4 className="text-lg sm:text-xl font-extrabold text-[#006a4e] font-serif-bn">
                  জগন্নাথ বিশ্ববিদ্যালয়, ঢাকা
                </h4>
                <p className="text-xs sm:text-sm font-bold text-gray-800">
                  উদ্ভিদবিজ্ঞান বিভাগ অ্যালামনাই অ্যাসোসিয়েশন
                </p>
                <div className="inline-block bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black px-3.5 py-0.5 rounded-full uppercase tracking-wider mt-1">
                  {language === 'bn' ? 'অ্যালামনাই সদস্য নিবন্ধন রসিদ ও প্রত্যয়ন' : 'Alumni Membership Card & Slip'}
                </div>
              </div>

              {/* Top Profile Strip: Photo + Name + Batch */}
              <div className="flex items-center gap-4 bg-emerald-50/60 p-3 rounded-xl border border-emerald-200">
                <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-black overflow-hidden shrink-0 border-2 border-emerald-600 shadow-xs">
                  {selectedMember.userPhotoUrl ? (
                    <img src={selectedMember.userPhotoUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-bold">{(selectedMember.applicantNameBn || selectedMember.fullName || 'ম').charAt(0)}</span>
                  )}
                </div>

                <div className="space-y-1 min-w-0">
                  <h3 className="font-extrabold text-base sm:text-lg text-gray-900 truncate">
                    {selectedMember.applicantNameBn || selectedMember.fullName}
                  </h3>
                  {selectedMember.applicantNameEn && (
                    <p className="text-xs font-semibold text-gray-600 uppercase font-mono">
                      {selectedMember.applicantNameEn}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="bg-emerald-700 text-white font-bold px-2 py-0.2 rounded-md text-[11px]">
                      {selectedMember.batch || 'ব্যাচ উল্লেখ নেই'}
                    </span>
                    <span className="text-emerald-900 font-bold font-mono">
                      সেশন: {selectedMember.session || '—'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Data Grid: 10 Core Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                <div>
                  <span className="text-gray-500 block text-[11px]">{language === 'bn' ? 'মোবাইল নম্বর:' : 'Mobile:'}</span>
                  <span className="font-bold text-gray-900 font-mono text-sm">{selectedMember.mobile}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">{language === 'bn' ? 'ইমেইল এড্রেস:' : 'Email Address:'}</span>
                  <span className="font-semibold text-gray-900 truncate block">{selectedMember.email || 'উল্লেখ নেই'}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">{language === 'bn' ? 'রক্তের গ্রুপ:' : 'Blood Group:'}</span>
                  <span className="font-bold text-rose-700 text-sm">{selectedMember.bloodGroup || 'অজানা'}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">{language === 'bn' ? 'বর্তমান পেশা / পদবী:' : 'Occupation:'}</span>
                  <span className="font-bold text-gray-900">{selectedMember.occupation || 'শিক্ষার্থী / ব্যক্তিগত'}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-gray-500 block text-[11px]">{language === 'bn' ? 'বর্তমান ঠিকানা:' : 'Present Address:'}</span>
                  <span className="font-medium text-gray-900">{selectedMember.presentAddress || '—'}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-gray-500 block text-[11px]">{language === 'bn' ? 'স্থায়ী ঠিকানা:' : 'Permanent Address:'}</span>
                  <span className="font-medium text-gray-900">{selectedMember.permanentAddress || '—'}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">{language === 'bn' ? 'পরিশোধিত সদস্য ফি:' : 'Fee Amount:'}</span>
                  <span className="font-bold text-[#006a4e] font-mono text-sm">
                    ৳ {selectedMember.feeAmount || (selectedMember.membershipType === 'life' ? '২৫০০' : '৫০০')}/- {selectedMember.membershipType === 'life' || selectedMember.feeAmount === '২৫০০' ? '(আজীবন)' : '(সাধারণ)'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">{language === 'bn' ? 'পেমেন্ট মেথড ও ট্রানজেকশন:' : 'Payment & TxID:'}</span>
                  <div className="font-bold text-gray-900 font-mono text-xs space-y-0.5 mt-0.5">
                    <div>মাধ্যম: <span className="text-[#006a4e] font-extrabold">{selectedMember.paymentMethod || 'Manual'}</span></div>
                    <div>TrxID: <span className="text-red-700 font-extrabold bg-red-50 border border-red-200 px-1 py-0.2 rounded">{selectedMember.transactionId || '—'}</span></div>
                    {selectedMember.senderNumber && (
                      <div className="text-gray-600 font-normal">প্রেরক: <span className="font-semibold text-gray-900">{selectedMember.senderNumber}</span></div>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Banner */}
              <div className="pt-3 border-t border-gray-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 font-bold">{language === 'bn' ? 'অনুমোদন স্থিতি:' : 'Status:'}</span>
                  <span className={`px-3 py-1 rounded-full font-extrabold text-[11px] ${
                    selectedMember.status === 'approved'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : selectedMember.status === 'rejected'
                      ? 'bg-red-100 text-red-800 border border-red-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}>
                    {selectedMember.status === 'approved' ? '✓ অনুমোদিত (Approved)' : selectedMember.status === 'rejected' ? '✕ বাতিল (Rejected)' : '⏳ বিবেচনাধীন (Pending)'}
                  </span>
                </div>

                <span className="text-[11px] text-gray-500 font-mono">
                  তারিখ: {selectedMember.createdAt ? new Date(selectedMember.createdAt).toLocaleDateString('bn-BD') : ''}
                </span>
              </div>
            </div>

            {/* Quick Status Modifiers */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-700">{language === 'bn' ? 'স্ট্যাটাস বদলান:' : 'Change Status:'}</span>
                <button
                  onClick={() => handleUpdateMemberStatus(selectedMember.id, 'approved')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedMember.status === 'approved'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                  }`}
                >
                  ✓ অনুমোদন করুন
                </button>
                <button
                  onClick={() => handleUpdateMemberStatus(selectedMember.id, 'pending')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedMember.status === 'pending' || !selectedMember.status || selectedMember.status === 'payment_pending'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                  }`}
                >
                  বিবেচনাধীন
                </button>
                <button
                  onClick={() => handleUpdateMemberStatus(selectedMember.id, 'rejected')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedMember.status === 'rejected'
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'bg-red-100 text-red-800 hover:bg-red-200'
                  }`}
                >
                  ✕ বাতিল
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSendCardSMS(selectedMember)}
                  disabled={sendingSmsId === selectedMember.id}
                  className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  title={language === 'bn' ? 'এই সদস্যকে কার্ড ডাউনলোড লিংকসহ এসএমএস পাঠান' : 'Send Card Download SMS'}
                >
                  <MessageSquare className={`w-3.5 h-3.5 ${sendingSmsId === selectedMember.id ? 'animate-spin' : ''}`} />
                  <span>{sendingSmsId === selectedMember.id ? 'পাঠানো হচ্ছে...' : 'কার্ড SMS পাঠান'}</span>
                </button>
                <button
                  onClick={() => confirmSingleDelete(selectedMember.id, selectedMember.applicantNameBn || selectedMember.fullName || 'Member', selectedMember.formNo)}
                  className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  title={language === 'bn' ? 'এই সদস্যকে স্থায়ীভাবে মুছে ফেলুন' : 'Delete this member'}
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-600" />
                  <span>{language === 'bn' ? 'সদস্য ডিলিট করুন' : 'Delete Member'}</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'প্রিন্ট / পিডিএফ' : 'Print Certificate'}</span>
                </button>
                <button
                  onClick={() => setSelectedMember(null)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border-2 border-[#006a4e]">
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
    </div>
  );
};
