import React, { useState, useEffect } from 'react';
import { listDocuments, watch } from '../../lib/db';
import { MemberCardModal } from '../MemberCardModal';
import {
  Users,
  User,
  Search,
  GraduationCap,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Eye,
  X,
  UserPlus,
  RefreshCw,
  Award,
  CheckCircle2,
  Building2,
  BookOpen,
  ArrowLeft,
  Sparkles,
  LayoutGrid,
  List,
  FileText,
  Hash,
  Home,
  ChevronLeft,
  ChevronRight,
  Download,
  Share2,
  CreditCard,
  Lock,
  KeyRound
} from 'lucide-react';

export interface MemberRecord {
  id: string;
  formNo?: string;
  membershipId?: string;
  applicantNameBn: string;
  applicantNameEn?: string;
  fullName?: string;
  program?: string;
  academicYear?: string;
  session?: string;
  batch?: string;
  bscBatch?: string;
  bscSession?: string;
  mscBatch?: string;
  mscSession?: string;
  classRoll?: string;
  regNumber?: string;
  mobile?: string;
  nidNumber?: string;
  email?: string;
  bloodGroup?: string;
  district?: string;
  village?: string;
  presentAddress?: string;
  currentAddress?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  membershipType?: string;
  feeAmount?: string;
  transactionId?: string;
  date?: string;
  userPhotoUrl?: string;
  status?: string;
}

// Convert Bengali digits (০-৯) to English digits (0-9)
const bnToEnDigits = (str: string): string => {
  const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return (str || '').replace(/[০-৯]/g, (d) => String(banglaDigits.indexOf(d)));
};

// Convert English digits (0-9) to Bengali digits (০-৯)
const enToBnDigits = (str: string): string => {
  const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return (str || '').replace(/[0-9]/g, (d) => banglaDigits[Number(d)] || d);
};

// Extract numeric batch number from text (e.g. "১ম ব্যাচ" -> 1, "7th Batch" -> 7, "৮ম" -> 8, "batch 1" -> 1)
const extractBatchNumber = (text?: string): number | null => {
  if (!text) return null;
  const str = text.toLowerCase().trim();

  // If text starts with bot- or bot, it is a member ID, not a batch
  if (/^bot[-_]?[a-z0-9]+/i.test(str)) {
    return null;
  }

  // Word ordinals & explicit Bengali/English ordinals
  if (str.includes('প্রথম') || str.includes('first') || /\b1st\b/i.test(str) || str.includes('১ম')) return 1;
  if (str.includes('দ্বিতীয়') || str.includes('দ্বিতীয়') || str.includes('second') || /\b2nd\b/i.test(str) || str.includes('২য়') || str.includes('২য়')) return 2;
  if (str.includes('তৃতীয়') || str.includes('তৃতীয়') || str.includes('third') || /\b3rd\b/i.test(str) || str.includes('৩য়') || str.includes('৩য়')) return 3;
  if (str.includes('চতুর্থ') || str.includes('fourth') || /\b4th\b/i.test(str) || str.includes('৪র্থ')) return 4;
  if (str.includes('পঞ্চম') || str.includes('fifth') || /\b5th\b/i.test(str) || str.includes('৫ম')) return 5;
  if (str.includes('ষষ্ঠ') || str.includes('sixth') || /\b6th\b/i.test(str) || str.includes('৬ষ্ঠ')) return 6;
  if (str.includes('সপ্তম') || str.includes('seventh') || /\b7th\b/i.test(str) || str.includes('৭ম')) return 7;
  if (str.includes('অষ্টম') || str.includes('eighth') || /\b8th\b/i.test(str) || str.includes('৮ম')) return 8;
  if (str.includes('নবম') || str.includes('ninth') || /\b9th\b/i.test(str) || str.includes('৯ম')) return 9;
  if (str.includes('দশম') || str.includes('tenth') || /\b10th\b/i.test(str) || str.includes('১০ম')) return 10;

  // Ordinal suffix regex (e.g. 11th, ১১তম, 12th, ১২তম)
  const enStr = bnToEnDigits(str);
  const ordinalMatch = enStr.match(/\b(\d+)\s*(?:st|nd|rd|th|ম|তম|র্থ|ষ্ঠ|য়|য়)\b/i);
  if (ordinalMatch && ordinalMatch[1]) {
    const num = parseInt(ordinalMatch[1], 10);
    if (!isNaN(num) && num > 0 && num <= 100) return num;
  }

  // Plain number MUST be accompanied by "batch" or "ব্যাচ"
  if (str.includes('ব্যাচ') || str.includes('batch')) {
    const batchMatch = enStr.match(/(?:batch\s*(\d+)|(\d+)\s*batch|ব্যাচ\s*(\d+)|(\d+)\s*ব্যাচ)/i);
    if (batchMatch) {
      const numStr = batchMatch[1] || batchMatch[2] || batchMatch[3] || batchMatch[4];
      if (numStr) {
        const num = parseInt(numStr, 10);
        if (!isNaN(num) && num > 0 && num <= 100) return num;
      }
    }
  }

  return null;
};

// Card theme color styles for vibrant aesthetic cards
const CARD_THEMES = [
  {
    bg: 'bg-gradient-to-br from-emerald-50/95 via-teal-50/70 to-emerald-100/60',
    border: 'border-emerald-300 hover:border-emerald-500',
    ribbonBg: 'bg-emerald-700 text-white',
    avatarBg: 'bg-emerald-600 text-white shadow-emerald-200',
    btnBg: 'bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900',
    accentText: 'text-emerald-800',
    infoBox: 'bg-white/85 border-emerald-200/90 shadow-2xs',
  },
  {
    bg: 'bg-gradient-to-br from-amber-50/95 via-orange-50/70 to-amber-100/60',
    border: 'border-amber-300 hover:border-amber-500',
    ribbonBg: 'bg-amber-700 text-white',
    avatarBg: 'bg-amber-600 text-white shadow-amber-200',
    btnBg: 'bg-gradient-to-r from-amber-700 to-orange-800 hover:from-amber-800 hover:to-orange-900',
    accentText: 'text-amber-900',
    infoBox: 'bg-white/85 border-amber-200/90 shadow-2xs',
  },
  {
    bg: 'bg-gradient-to-br from-sky-50/95 via-cyan-50/70 to-blue-100/60',
    border: 'border-sky-300 hover:border-sky-500',
    ribbonBg: 'bg-sky-800 text-white',
    avatarBg: 'bg-sky-700 text-white shadow-sky-200',
    btnBg: 'bg-gradient-to-r from-sky-800 to-blue-900 hover:from-sky-900 hover:to-blue-950',
    accentText: 'text-sky-900',
    infoBox: 'bg-white/85 border-sky-200/90 shadow-2xs',
  },
  {
    bg: 'bg-gradient-to-br from-indigo-50/95 via-purple-50/70 to-indigo-100/60',
    border: 'border-indigo-300 hover:border-indigo-500',
    ribbonBg: 'bg-indigo-800 text-white',
    avatarBg: 'bg-indigo-700 text-white shadow-indigo-200',
    btnBg: 'bg-gradient-to-r from-indigo-800 to-purple-900 hover:from-indigo-900 hover:to-purple-950',
    accentText: 'text-indigo-900',
    infoBox: 'bg-white/85 border-indigo-200/90 shadow-2xs',
  }
];

interface MembersListPageProps {
  language: 'bn' | 'en';
  initialSearchQuery?: string;
  loggedInMember?: any;
  onOpenLoginModal?: () => void;
  onNavigateToRegister?: () => void;
  onBackToHome?: () => void;
}

const ITEMS_PER_PAGE = 10;

export const MembersListPage: React.FC<MembersListPageProps> = ({
  language,
  initialSearchQuery = '',
  loggedInMember,
  onOpenLoginModal,
  onNavigateToRegister,
  onBackToHome,
}) => {
  const [members, setMembers] = useState<MemberRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearchQuery);
  const [membershipTypeFilter, setMembershipTypeFilter] = useState<'all' | 'life' | 'general'>('all');
  const [programFilter, setProgramFilter] = useState<string>('all');
  const [sessionFilter, setSessionFilter] = useState<string>('all');
  const [selectedMember, setSelectedMember] = useState<MemberRecord | null>(null);
  const [autoDownloadCard, setAutoDownloadCard] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [currentPage, setCurrentPage] = useState<number>(1);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const isLifeRecord = (m: MemberRecord) =>
    m.membershipType === 'life' ||
    m.membershipType === 'lifetime' ||
    (typeof m.membershipType === 'string' && m.membershipType.toLowerCase().includes('life')) ||
    (typeof m.membershipType === 'string' && m.membershipType.includes('আজীবন')) ||
    m.feeAmount === '2500' ||
    m.feeAmount === '২৫০০' ||
    (typeof m.feeAmount === 'string' && (m.feeAmount.includes('2500') || m.feeAmount.includes('২৫০০'))) ||
    m.feeAmount === '5,000 BDT';

  const handleOpenCard = (member: MemberRecord, autoDownload = false) => {
    setSelectedMember(member);
    setAutoDownloadCard(autoDownload);
  };

  const handleShareCard = async (member: MemberRecord) => {
    const memTitle = isLifeRecord(member) ? 'আজীবন সদস্য' : 'সাধারণ সদস্য';
    const shareText = `উদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশন (জগন্নাথ বিশ্ববিদ্যালয়) ডিজিটাল সদস্য আইডি কার্ড:\nনাম: ${member.applicantNameBn}\nআইডি: ${member.formNo || member.id}\nপদবী: ${memTitle}\nসেশন: ${member.session || '—'}`;
    const shareUrl = window.location.href;

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `Alumni ID Card - ${member.applicantNameBn}`,
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') return;
      }
    }

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
        showToast(language === 'bn' ? '✓ সদস্য আইডি কার্ডের বিবরণ কপি করা হয়েছে!' : '✓ Card details copied!');
        return;
      } catch {}
    }

    showToast(language === 'bn' ? '✓ আইডি কার্ড প্রস্তুত' : '✓ ID Card ready');
  };

  useEffect(() => {
    if (initialSearchQuery !== undefined) {
      setSearchQuery(initialSearchQuery);
      if (initialSearchQuery.trim()) {
        setProgramFilter('all');
        setSessionFilter('all');
        setMembershipTypeFilter('all');
      }
    }
  }, [initialSearchQuery]);

  // Approved members from Admin Dashboard (D1)
  useEffect(() => {
    return watch('memberships', async () => {
      try {
        const docs = await listDocuments<any>('memberships', { where: { status: 'approved' } });
        const dbList: MemberRecord[] = [];
        docs.forEach((data) => {
          if (data.status === 'approved') {
            const autoGeneratedFormNo = `BOT-${String(dbList.length + 1).padStart(4, '0')}`;
            dbList.push({
              id: data.id,
              formNo: data.formNo || data.membershipId || autoGeneratedFormNo,
              membershipId: data.membershipId || data.formNo || autoGeneratedFormNo,
              applicantNameBn: data.applicantNameBn || data.fullName || 'নামহীন সদস্য',
              applicantNameEn: data.applicantNameEn || data.fullName || '',
              fullName: data.fullName || data.applicantNameEn || data.applicantNameBn || '',
              program: data.program || 'bsc_honours',
              academicYear: data.academicYear || '',
              session: data.session || data.bscSession || data.batch || '',
              batch: data.batch || data.bscBatch || data.session || '',
              bscBatch: data.bscBatch || '',
              bscSession: data.bscSession || '',
              mscBatch: data.mscBatch || '',
              mscSession: data.mscSession || '',
              classRoll: data.classRoll || '',
              regNumber: data.regNumber || '',
              mobile: data.mobile || data.phone || '',
              nidNumber: data.nidNumber || data.nid || '',
              email: data.email || '',
              bloodGroup: data.bloodGroup || '',
              district: data.district || '',
              village: data.village || '',
              presentAddress: data.presentAddress || data.currentAddress || '',
              currentAddress: data.currentAddress || data.presentAddress || '',
              paymentMethod: data.paymentMethod || 'Manual',
              paymentStatus: data.paymentStatus || 'paid',
              membershipType: data.membershipType || (data.feeAmount === '2500' || data.feeAmount === '২৫০০' ? 'life' : 'general'),
              feeAmount: data.feeAmount || '',
              transactionId: data.transactionId || data.paymentTransactionId || data.trxId || data.paymentTrxId || data.transaction_id || '',
              date: data.date || (data.createdAt ? new Date(data.createdAt).toLocaleDateString('bn-BD') : ''),
              userPhotoUrl: data.userPhotoUrl || '',
              status: data.status || 'approved',
            });
          }
        });

        dbList.sort((a, b) => (b.formNo || '').localeCompare(a.formNo || ''));
        setMembers(dbList);
      } finally {
        setLoading(false);
      }
    });
  }, []);

  // Reset to page 1 whenever filters or search query change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, programFilter, sessionFilter, membershipTypeFilter]);

  // Filter list: Search by Name (নাম), Batch & Session (ব্যাচ), Member ID / Form No (আইডি নাম্বার), Mobile, NID
  const filteredMembers = members.filter((m) => {
    const rawQuery = searchQuery.trim();
    const isLife = isLifeRecord(m);
    const matchesType =
      membershipTypeFilter === 'all' ||
      (membershipTypeFilter === 'life' && isLife) ||
      (membershipTypeFilter === 'general' && !isLife);

    if (!rawQuery) {
      const matchesProgram = programFilter === 'all' || m.program === programFilter;
      const matchesSession = sessionFilter === 'all' || m.session === sessionFilter;
      return matchesProgram && matchesSession && matchesType;
    }

    const qLower = rawQuery.toLowerCase();
    const qEnDigits = bnToEnDigits(rawQuery).replace(/\D/g, ''); // Extract digits if present
    const qEn = bnToEnDigits(qLower);
    const qBn = enToBnDigits(qLower);
    const qClean = qEn.replace(/[^a-z0-9]/gi, '');

    // Cleaned fields
    const nameBn = (m.applicantNameBn || '').toLowerCase();
    const nameEn = `${m.applicantNameEn || ''} ${m.fullName || ''}`.toLowerCase();
    const formNo = (m.formNo || m.membershipId || m.id || '').toLowerCase();
    const formNoClean = bnToEnDigits(formNo).replace(/[^a-z0-9]/gi, '');
    const mobileClean = bnToEnDigits(m.mobile || '').replace(/\D/g, '');
    const nidClean = bnToEnDigits(m.nidNumber || '').replace(/\D/g, '');

    // 1. Name match (নাম: বাংলা ও ইংরেজি নাম)
    const matchesName = nameBn.includes(qLower) || nameEn.includes(qLower);

    // 2. Batch & Session match (ব্যাচ: ১ম ব্যাচ, 1st Batch, ৭ম ব্যাচ, 8th, সেশন ১৯৯৭-১৯৯৮, ২০০৫-২০০৬ ইত্যাদি)
    const mBatch = (m.batch || '').toLowerCase();
    const mSession = (m.session || '').toLowerCase();
    const mBscBatch = (m.bscBatch || '').toLowerCase();
    const mBscSession = (m.bscSession || '').toLowerCase();
    const mCombinedBatch = `${mBatch} ${mSession} ${mBscBatch} ${mBscSession} ${m.academicYear || ''}`.toLowerCase();
    const mCombinedEn = bnToEnDigits(mCombinedBatch);
    const mCombinedBn = enToBnDigits(mCombinedBatch);

    const qBatchNum = extractBatchNumber(qLower);
    const mBatchNum = extractBatchNumber(mBatch) || extractBatchNumber(mBscBatch);
    const matchesBatchNumber = qBatchNum !== null && mBatchNum !== null && qBatchNum === mBatchNum;

    const matchesBatch =
      (qLower.length >= 3 && mCombinedBatch.includes(qLower)) ||
      (qEn.length >= 3 && mCombinedEn.includes(qEn)) ||
      (qBn.length >= 3 && mCombinedBn.includes(qBn)) ||
      matchesBatchNumber ||
      (qEnDigits.length >= 4 && mCombinedEn.replace(/\D/g, '').includes(qEnDigits));

    // 3. Member ID / Form No match (আইডি নাম্বার: BOT-0001, 0001, 1, BOT-0005, BOT-LIFE-01 ইত্যাদি)
    const formDigitsOnly = formNoClean.replace(/\D/g, '');
    const last4Digits = formDigitsOnly.slice(-4);

    let matchesFormNo = false;
    if (qClean.length >= 3) {
      if (formNoClean.includes(qClean) || formNo.includes(qLower) || enToBnDigits(formNo).includes(qLower)) {
        matchesFormNo = true;
      }
    } else if (qClean.length > 0) {
      if (formNoClean === qClean || last4Digits === qClean) {
        matchesFormNo = true;
      } else if (qEnDigits.length > 0 && formDigitsOnly.length > 0) {
        const qNum = parseInt(qEnDigits, 10);
        const fNum = parseInt(formDigitsOnly, 10);
        if (qNum === fNum && formDigitsOnly.endsWith(qEnDigits.padStart(4, '0'))) {
          matchesFormNo = true;
        }
      }
    }

    if (qEnDigits.length === 4 && last4Digits === qEnDigits) {
      matchesFormNo = true;
    }

    // 4. Mobile Phone match
    const matchesMobile = qEnDigits.length >= 3 && mobileClean.includes(qEnDigits);

    // 5. NID match
    const matchesNid = qEnDigits.length >= 3 && nidClean.includes(qEnDigits);

    const matchesSearch = matchesName || matchesBatch || matchesFormNo || matchesMobile || matchesNid;

    const matchesProgram = programFilter === 'all' || m.program === programFilter;
    const matchesSession = sessionFilter === 'all' || m.session === sessionFilter;

    return matchesSearch && matchesProgram && matchesSession && matchesType;
  });

  // Pagination calculation: max 9 members per page
  const totalMembersCount = filteredMembers.length;
  const totalPages = Math.max(1, Math.ceil(totalMembersCount / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalMembersCount);
  const paginatedMembers = filteredMembers.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      // Smoothly scroll window and document to the top
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      document.documentElement.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      document.body.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      const topEl = document.getElementById('members-list-page') || document.getElementById('root');
      if (topEl) {
        topEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const getProgramLabel = (prog?: string) => {
    switch (prog) {
      case 'bsc_honours':
      case 'bss_honours':
        return language === 'bn' ? 'বিএসসি (সম্মান)' : 'BSc (Honours)';
      case 'msc_masters':
      case 'mss_masters':
        return language === 'bn' ? 'এমএসসি (মাস্টার্স)' : 'MSc (Masters)';
      default:
        return language === 'bn' ? 'উদ্ভিদবিজ্ঞান' : 'Botany';
    }
  };

  // Unique sessions list for dropdown
  const sessionList = Array.from(
    new Set(members.map((m) => m.session).filter(Boolean))
  );

  // If not logged in, enforce authentication before accessing member directory
  if (!loggedInMember) {
    return (
      <div id="members-list-page" className="w-full bg-[#f4f7f5] p-4 sm:p-8 font-siliguri min-h-[500px] flex items-center justify-center">
        <div className="max-w-lg w-full bg-white rounded-3xl shadow-xl border border-emerald-600/30 overflow-hidden text-center p-6 sm:p-8 space-y-5 animate-in fade-in duration-200">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-amber-500/10 border-2 border-amber-500/40 rounded-full flex items-center justify-center mx-auto text-amber-600 shadow-inner">
            <Lock className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-[#006a4e] rounded-full text-xs font-bold border border-emerald-300">
              <Users className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'সুরক্ষিত সদস্য বাতায়ন' : 'Protected Member Portal'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 font-serif-bn">
              {language === 'bn' ? 'সদস্য লগইন আবশ্যক' : 'Member Login Required'}
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-medium">
              {language === 'bn'
                ? 'উদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশনের সম্মানিত সদস্যদের তালিকা ও ডিজিটাল আইডি কার্ড শুধুমাত্র অনুমোদিত ও নিবন্ধিত সদস্যদের জন্য সংরক্ষিত। এই পেইজে প্রবেশ করতে অনুগ্রহ করে আপনার মেম্বার আইডি ও মোবাইল নম্বর দিয়ে লগইন করুন।'
                : 'The Botany Alumni Association Member Directory and Digital ID Cards are restricted to verified members. Please log in with your Member ID and Mobile Number to enter.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={onOpenLoginModal}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-[#006a4e] to-[#004d38] hover:from-[#005a42] hover:to-[#003d2c] text-white font-black text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <KeyRound className="w-4 h-4 text-amber-300" />
              <span>{language === 'bn' ? 'সদস্য লগইন করুন' : 'Member Login'}</span>
            </button>
            {onBackToHome && (
              <button
                type="button"
                onClick={onBackToHome}
                className="w-full sm:w-auto px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm rounded-xl transition-all cursor-pointer"
              >
                {language === 'bn' ? 'মূল পাতায় ফিরে যান' : 'Back to Home'}
              </button>
            )}
          </div>

          {onNavigateToRegister && (
            <div className="pt-3 border-t border-gray-100 text-xs text-gray-500">
              {language === 'bn' ? 'এখনও সদস্য হিসেবে নিবন্ধন করেননি? ' : 'Not a registered member yet? '}
              <button
                type="button"
                onClick={onNavigateToRegister}
                className="text-[#006a4e] font-bold hover:underline cursor-pointer"
              >
                {language === 'bn' ? 'এখানে ক্লিক করে নতুন নিবন্ধন করুন' : 'Click here to register'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div id="members-list-page" className="w-full bg-[#f4f7f5] p-3 sm:p-6 lg:p-8 font-siliguri space-y-4 sm:space-y-6">
      
      {/* Navigation Top Bar (Back button if available) */}
      {onBackToHome && (
        <div className="flex items-center justify-between no-print">
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#006a4e] hover:text-[#00523d] transition-colors cursor-pointer py-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{language === 'bn' ? 'মূল পাতায় ফিরে যান' : 'Back to Home'}</span>
          </button>
        </div>
      )}

      {/* Top Banner & Header - Mobile Optimized with College Colors */}
      <div className="bg-gradient-to-br from-[#004d38] via-[#006a4e] to-[#003828] text-white rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg border border-emerald-600/40 relative overflow-hidden">
        {/* Subtle Background Graphic */}
        <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-300 px-3 py-1 rounded-full text-xs font-bold border border-amber-400/30 backdrop-blur-xs">
              <Users className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'উদ্ভিদবিজ্ঞান বিভাগীয় বাতায়ন' : 'Botany Alumni Directory'}</span>
            </div>

            <h1 className="text-lg sm:text-2xl md:text-3xl font-black tracking-tight font-serif-bn leading-tight text-white">
              {language === 'bn'
                ? 'সদস্য নিবন্ধন তালিকা ও ডিজিটাল আইডি কার্ড'
                : 'Botany Members Directory & ID Cards'}
            </h1>

            <p className="text-xs sm:text-sm text-emerald-100/90 font-medium max-w-2xl leading-relaxed">
              {language === 'bn'
                ? 'এডমিন ড্যাশবোর্ড থেকে অনুমোদিত সকল সম্মানিত সদস্যের ডিজিটাল আইডি কার্ড স্বয়ংক্রিয়ভাবে প্রস্তুত হয়ে এখানে সংযুক্ত রয়েছে। সদস্য আইডি, নাম বা ব্যাচ দিয়ে সহজেই খুঁজে নিয়ে আইডি কার্ড দেখুন ও ডাউনলোড করুন।'
                : 'Official Digital ID cards are automatically generated for all admin-approved members. Search by Form No, Name, or Batch to view and download your ID card.'}
            </p>
          </div>
        </div>
      </div>

      {/* Summary KPI Stats Bar - Mobile Friendly Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
        {/* Total Members */}
        <div className="bg-white border border-emerald-200 p-2.5 sm:p-4 rounded-xl text-center space-y-0.5 shadow-xs">
          <span className="text-[10px] sm:text-xs text-gray-500 font-bold block truncate">
            {language === 'bn' ? 'মোট অনুমোদিত সদস্য' : 'Approved Members'}
          </span>
          <span className="text-lg sm:text-2xl font-black text-[#006a4e]">
            {members.length}
          </span>
        </div>

        {/* Lifetime Members */}
        <div className="bg-white border border-amber-200 p-2.5 sm:p-4 rounded-xl text-center space-y-0.5 shadow-xs">
          <span className="text-[10px] sm:text-xs text-amber-700 font-bold block truncate">
            {language === 'bn' ? 'আজীবন সদস্য' : 'Lifetime Members'}
          </span>
          <span className="text-lg sm:text-2xl font-black text-amber-700">
            {members.filter((m) => m.membershipType === 'life' || m.feeAmount === '2500' || m.feeAmount === '২৫০০').length}
          </span>
        </div>

        {/* BSc Honours */}
        <div className="bg-white border border-emerald-200 p-2.5 sm:p-4 rounded-xl text-center space-y-0.5 shadow-xs">
          <span className="text-[10px] sm:text-xs text-gray-500 font-bold block truncate">
            {language === 'bn' ? 'বিএসসি (সম্মান)' : 'BSc Honours'}
          </span>
          <span className="text-lg sm:text-2xl font-black text-emerald-700">
            {members.filter((m) => m.program === 'bsc_honours' || m.program === 'bss_honours').length}
          </span>
        </div>

        {/* MSc Masters */}
        <div className="bg-white border border-sky-200 p-2.5 sm:p-4 rounded-xl text-center space-y-0.5 shadow-xs">
          <span className="text-[10px] sm:text-xs text-gray-500 font-bold block truncate">
            {language === 'bn' ? 'এমএসসি (মাস্টার্স)' : 'MSc Masters'}
          </span>
          <span className="text-lg sm:text-2xl font-black text-sky-700">
            {members.filter((m) => m.program === 'msc_masters' || m.program === 'mss_masters').length}
          </span>
        </div>
      </div>

      {/* Filter & Search Box - Optimized for Registration Form No. Search */}
      <div className="bg-white border border-[#cce0d2] rounded-2xl p-3.5 sm:p-5 shadow-xs space-y-3">
        
        {/* Category Filter Tabs: All Cards, Lifetime Members, General Members */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setMembershipTypeFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              membershipTypeFilter === 'all'
                ? 'bg-[#006a4e] text-white shadow-xs'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5 text-amber-300" />
            <span>{language === 'bn' ? 'সকল অনুমোদিত কার্ড' : 'All Approved Cards'}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 font-mono">
              {members.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setMembershipTypeFilter('life')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              membershipTypeFilter === 'life'
                ? 'bg-amber-500 text-amber-950 shadow-xs ring-2 ring-amber-300'
                : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-amber-800" />
            <span>{language === 'bn' ? 'আজীবন সদস্য কার্ড' : 'Life Member Cards'}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-900/10 font-black font-mono">
              {members.filter((m) => isLifeRecord(m)).length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setMembershipTypeFilter('general')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              membershipTypeFilter === 'general'
                ? 'bg-emerald-700 text-white shadow-xs ring-2 ring-emerald-300'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{language === 'bn' ? 'সাধারণ সদস্য কার্ড' : 'General Member Cards'}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-900/10 font-black font-mono">
              {members.filter((m) => !isLifeRecord(m)).length}
            </span>
          </button>
        </div>

        {/* Registration Form No. / Name / Batch Search Input */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <label
              htmlFor="member-search-query-input"
              className="text-xs font-bold text-gray-800 flex items-center gap-1.5 whitespace-nowrap"
            >
              <FileText className="w-3.5 h-3.5 text-[#006a4e] shrink-0" />
              <span className="whitespace-nowrap">
                {language === 'bn'
                  ? 'নাম, ব্যাচ ও আইডি নম্বর দিয়ে সদস্য অনুসন্ধান:'
                  : 'Search by Name, Batch & Member ID:'}
              </span>
            </label>
            {!loggedInMember && (
              <button
                type="button"
                onClick={() => onOpenLoginModal && onOpenLoginModal()}
                className="text-[11px] text-amber-800 bg-amber-100/90 border border-amber-300 font-extrabold px-2.5 py-0.5 rounded-lg hover:bg-amber-200 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>🔒 {language === 'bn' ? 'অনুসন্ধানের জন্য লগইন আবশ্যক' : 'Login required to search'}</span>
              </button>
            )}
          </div>

          <div className="relative">
            <input
              id="member-search-query-input"
              type="text"
              onFocus={(e) => {
                if (!loggedInMember) {
                  e.target.blur();
                  if (onOpenLoginModal) onOpenLoginModal();
                }
              }}
              onClick={(e) => {
                if (!loggedInMember) {
                  e.preventDefault();
                  if (onOpenLoginModal) onOpenLoginModal();
                }
              }}
              onChange={(e) => {
                if (!loggedInMember) {
                  if (onOpenLoginModal) onOpenLoginModal();
                } else {
                  setSearchQuery(e.target.value);
                }
              }}
              placeholder={
                !loggedInMember
                  ? (language === 'bn' ? '🔒 অনুসন্ধানের জন্য প্রথমে লগইন করুন...' : '🔒 Please login to search...')
                  : (language === 'bn'
                      ? 'নাম (যেমন: রফিকুল ইসলাম), ব্যাচ (যেমন: ১ম ব্যাচ, ৭ম ব্যাচ) বা মেম্বার আইডি (যেমন: BOT-0001)...'
                      : 'Search by Name, Batch (e.g. 1st Batch, 7th Batch), or Member ID (e.g. BOT-0001)...')
              }
              value={searchQuery}
              className="w-full pl-9 pr-8 py-2.5 text-xs sm:text-sm bg-gray-50/80 border-2 border-emerald-500/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#006a4e] focus:bg-white text-gray-900 font-mono transition-all placeholder:font-sans placeholder:text-gray-400 shadow-inner"
            />
            <Search className="w-4 h-4 text-emerald-700 absolute left-3 top-1/2 -translate-y-1/2" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                title={language === 'bn' ? 'মুছে ফেলুন' : 'Clear search'}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Dropdowns Grid: Only Program & Session */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-0.5">
          {/* Program Filter */}
          <select
            id="member-program-filter"
            value={programFilter}
            onChange={(e) => setProgramFilter(e.target.value)}
            className="w-full bg-gray-50 border border-gray-300 text-xs font-semibold px-2.5 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#006a4e] text-gray-700 cursor-pointer"
          >
            <option value="all">{language === 'bn' ? 'সকল কোর্স' : 'All Programs'}</option>
            <option value="bsc_honours">{language === 'bn' ? 'বিএসসি (সম্মান)' : 'BSc (Honours)'}</option>
            <option value="msc_masters">{language === 'bn' ? 'এমএসসি (মাস্টার্স)' : 'MSc (Masters)'}</option>
          </select>

          {/* Session Filter */}
          <select
            id="member-session-filter"
            value={sessionFilter}
            onChange={(e) => setSessionFilter(e.target.value)}
            className="w-full bg-gray-50 border border-gray-300 text-xs font-semibold px-2.5 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#006a4e] text-gray-700 cursor-pointer"
          >
            <option value="all">{language === 'bn' ? 'সকল ব্যাচ/সেশন' : 'All Batches'}</option>
            {sessionList.map((ses, sIdx) => (
              <option key={sIdx} value={ses}>
                {ses}
              </option>
            ))}
          </select>

          {/* Reset Filters Button */}
          {(searchQuery || programFilter !== 'all' || sessionFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setProgramFilter('all');
                setSessionFilter('all');
              }}
              className="col-span-2 sm:col-span-1 py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'রিসেট' : 'Reset'}</span>
            </button>
          )}
        </div>

        {/* Status Count and View Toggle Row */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
          <span className="font-bold text-[#006a4e] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {language === 'bn'
              ? `মোট প্রাপ্ত সদস্য: ${filteredMembers.length} জন`
              : `Found: ${filteredMembers.length} members`}
          </span>

          {/* View Mode Toggle Buttons */}
          <div className="flex items-center bg-gray-100 p-0.5 rounded-lg border border-gray-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-[#006a4e] shadow-2xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'রঙিন কার্ড' : 'Cards'}</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-[#006a4e] shadow-2xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'তালিকা' : 'Table'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Members Directory Content */}
      <div id="members-directory-section" className="space-y-4 sm:space-y-6">
        {/* Active Search Query Feedback Banner */}
        {searchQuery.trim() && (
          <div className="bg-emerald-50/90 border-2 border-emerald-400 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5 text-xs sm:text-sm text-emerald-950 font-medium">
              <Sparkles className="w-5 h-5 text-amber-500 shrink-0" />
              <div>
                <span>
                  {language === 'bn' ? (
                    <>
                      অনুসন্ধান: &ldquo;<strong className="text-[#006a4e] font-extrabold">{searchQuery.trim()}</strong>&rdquo; —{' '}
                      {filteredMembers.length > 0 ? (
                        <strong className="text-emerald-800 font-bold">{filteredMembers.length} জন সদস্যের নির্দিষ্ট ডিজিটাল আইডি কার্ড পাওয়া গেছে</strong>
                      ) : (
                        <span className="text-rose-700 font-bold">কোনো আইডি কার্ড মেলেনি</span>
                      )}
                    </>
                  ) : (
                    <>
                      Search: &ldquo;<strong className="text-[#006a4e] font-extrabold">{searchQuery.trim()}</strong>&rdquo; —{' '}
                      {filteredMembers.length > 0 ? (
                        <strong className="text-emerald-800 font-bold">{filteredMembers.length} member card(s) found</strong>
                      ) : (
                        <span className="text-rose-700 font-bold">No card found</span>
                      )}
                    </>
                  )}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setProgramFilter('all');
                setSessionFilter('all');
                setMembershipTypeFilter('all');
              }}
              className="px-3 py-1.5 bg-white hover:bg-emerald-100/60 text-[#006a4e] border border-emerald-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs shrink-0 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'সকল সদস্যের কার্ড দেখুন' : 'Show All Cards'}</span>
            </button>
          </div>
        )}

        {loading ? (
          <div className="py-16 text-center space-y-3 bg-white rounded-2xl border border-gray-200">
            <div className="w-10 h-10 border-4 border-[#006a4e] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs sm:text-sm font-bold text-gray-600">
              {language === 'bn' ? 'সদস্য তালিকা লোড হচ্ছে...' : 'Loading members directory...'}
            </p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="py-14 text-center bg-white border-2 border-dashed border-emerald-300 rounded-2xl space-y-3 p-6 shadow-xs max-w-xl mx-auto">
            <Users className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="text-base sm:text-lg font-black text-gray-800 font-serif-bn">
              {language === 'bn' ? 'কোনো সদস্যের আইডি কার্ড পাওয়া যায়নি' : 'No Member ID Card Found'}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              {language === 'bn' ? (
                <>
                  নাম (যেমন: <strong>ড. মোহাম্মদ রফিকুল ইসলাম</strong> বা <strong>Abdur Razzak</strong>), ব্যাচ (যেমন: <strong>১ম ব্যাচ</strong>, <strong>৭ম ব্যাচ</strong>, <strong>8th Batch</strong>) অথবা মেম্বার আইডি (যেমন: <strong>BOT-0001</strong> বা <strong>0002</strong>) দিয়ে পুনরায় অনুসন্ধান করুন।
                </>
              ) : (
                'Please search again with a Member Name, Batch (e.g. 1st Batch, 7th Batch), or Member ID (e.g. BOT-0001).'
              )}
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setProgramFilter('all');
                  setSessionFilter('all');
                  setMembershipTypeFilter('all');
                }}
                className="px-4 py-2 bg-[#006a4e] hover:bg-[#00533d] text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'সকল অনুমোদিত কার্ড প্রদর্শন করুন' : 'Show All Approved Cards'}</span>
              </button>
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          /* Official Digital Alumni ID Cards Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {paginatedMembers.map((member, idx) => {
              const formNoStr = member.formNo || member.id;
              const isLife = isLifeRecord(member);

              // Clean address display
              const displayAddress =
                member.currentAddress ||
                member.presentAddress ||
                (member.village && member.district ? `${member.village}, ${member.district}` : member.district) ||
                'জগন্নাথ বিশ্ববিদ্যালয়, ঢাকা';

              return (
                <div
                  key={member.id || idx}
                  id={`alumni-card-${member.formNo || member.id}`}
                  className={`bg-white rounded-2xl border-2 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-xl relative group ${
                    isLife
                      ? 'border-amber-400 shadow-amber-950/5'
                      : 'border-emerald-600/70 shadow-emerald-950/5'
                  }`}
                >
                  {/* Official ID Card Header Bar */}
                  <div className="bg-gradient-to-r from-[#00422f] via-[#006a4e] to-[#003828] text-white p-3 sm:p-3.5 relative border-b-2 border-amber-400/80 shadow-xs">
                    <div className="flex items-center gap-2.5">
                      <img
                        src="/jnu_botany_alumni_logo.jpg"
                        alt="JnU Botany Alumni Logo"
                        className="w-10 h-10 object-contain rounded-full bg-white p-0.5 border-2 border-amber-300 shrink-0 shadow-xs"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://upload.wikimedia.org/wikipedia/en/thumb/8/87/Logo_of_Jagannath_University.svg/512px-Logo_of_Jagannath_University.svg.png';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <h2 className="text-[13px] sm:text-sm font-black text-white leading-tight font-serif-bn tracking-tight">
                          উদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশন
                        </h2>
                        <p className="text-[11px] font-bold text-amber-300/95 leading-tight">
                          জগন্নাথ বিশ্ববিদ্যালয়, ঢাকা
                        </p>
                      </div>
                    </div>

                    {/* Member Category & Registration ID Ribbon */}
                    <div className="mt-2.5 flex items-center justify-between gap-1.5 pt-1.5 border-t border-emerald-600/60">
                      <div
                        className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-black uppercase tracking-wider inline-flex items-center gap-1 shadow-2xs ${
                          isLife
                            ? 'bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-amber-950 border border-amber-200'
                            : 'bg-emerald-800 text-white border border-emerald-400/60'
                        }`}
                      >
                        {isLife ? <Sparkles className="w-3 h-3 text-amber-950" /> : <CheckCircle2 className="w-3 h-3 text-emerald-300" />}
                        <span>
                          {isLife
                            ? (language === 'bn' ? 'আজীবন সদস্য কার্ড' : 'LIFE MEMBER')
                            : (language === 'bn' ? 'সাধারণ সদস্য কার্ড' : 'GENERAL MEMBER')}
                        </span>
                      </div>

                      <span className="font-mono text-[11px] font-black bg-white/95 text-gray-900 px-2 py-0.5 rounded border border-gray-200 shadow-2xs">
                        {formNoStr}
                      </span>
                    </div>
                  </div>

                  {/* ID Card Body: Photo + Name + Credentials */}
                  <div className="p-3.5 sm:p-4 space-y-3 bg-gradient-to-b from-emerald-50/25 via-white to-amber-50/20 flex-1 flex flex-col justify-between">
                    <div className="flex items-start gap-3">
                      {/* Passport Proportion Photo */}
                      <div className="w-[74px] h-[90px] rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 border-2 border-emerald-700/60 overflow-hidden shrink-0 shadow-sm relative flex items-center justify-center">
                        {member.userPhotoUrl ? (
                          <img
                            src={member.userPhotoUrl}
                            alt={member.applicantNameBn}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="text-center p-1">
                            <User className="w-7 h-7 text-emerald-700 mx-auto" />
                            <span className="text-[9px] font-bold text-emerald-800 font-mono block">ALUMNI</span>
                          </div>
                        )}
                        <span className="absolute bottom-0.5 right-0.5 bg-white rounded-full p-0.5 shadow border border-gray-200" title="Verified Member">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 fill-emerald-100" />
                        </span>
                      </div>

                      {/* Name & Title */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <h3 className="font-black text-gray-950 text-base sm:text-lg leading-tight font-serif-bn line-clamp-1">
                          {member.applicantNameBn}
                        </h3>
                        {member.applicantNameEn && (
                          <p className="text-xs font-semibold text-gray-500 font-sans truncate">
                            {member.applicantNameEn}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                          <span className="inline-block bg-emerald-100/90 text-emerald-950 font-bold px-2 py-0.5 rounded text-[11px] border border-emerald-200">
                            {getProgramLabel(member.program)}
                          </span>
                          {member.bloodGroup && (
                            <span className="inline-block bg-rose-100 text-rose-800 font-black px-1.5 py-0.5 rounded text-[10.5px] border border-rose-300">
                              🩸 {member.bloodGroup}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Metadata Box: Batch, Mobile, Address */}
                    <div className="bg-white/95 rounded-xl p-2.5 space-y-1.5 text-xs text-gray-800 border border-emerald-200/80 shadow-2xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-gray-500 font-bold flex items-center gap-1">
                          <GraduationCap className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                          <span>{language === 'bn' ? 'সেশন:' : 'Session:'}</span>
                        </span>
                        <span className="font-mono font-bold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11.5px]">
                          {member.session || member.batch || '—'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <span className="text-gray-500 font-bold flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span>মোবাইল:</span>
                        </span>
                        <a
                          href={member.mobile ? `tel:${member.mobile}` : undefined}
                          className="font-mono font-bold text-gray-900 hover:text-emerald-700 bg-gray-50 px-2 py-0.5 rounded border border-gray-200 text-[11.5px]"
                        >
                          {member.mobile || '—'}
                        </a>
                      </div>

                      <div className="flex items-start justify-between gap-2">
                        <span className="text-gray-500 font-bold flex items-center gap-1 shrink-0">
                          <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          <span>ঠিকানা:</span>
                        </span>
                        <span className="font-medium text-gray-800 text-right line-clamp-1 max-w-[190px]">
                          {displayAddress}
                        </span>
                      </div>

                      {((member.transactionId && member.transactionId.toUpperCase() !== 'UNPAID') || isLifeRecord(member)) && (
                        <div className="flex items-center justify-between gap-2 pt-1 border-t border-emerald-100/70">
                          <span className="text-gray-500 font-bold flex items-center gap-1 shrink-0">
                            <CreditCard className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                            <span>{language === 'bn' ? 'ট্রানজেকশন:' : 'TrxID:'}</span>
                          </span>
                          <span className={`font-bold px-2 py-0.5 rounded border text-[11px] truncate max-w-[170px] ${
                            isLifeRecord(member)
                              ? 'text-amber-950 bg-amber-100/90 border-amber-300 font-sans shadow-2xs'
                              : 'font-mono text-emerald-950 bg-emerald-50 border-emerald-200'
                          }`}>
                            {isLifeRecord(member)
                              ? (language === 'bn' ? 'আজীবন সদস্য' : 'Life Member')
                              : member.transactionId}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Security Hologram & Authorized Signature */}
                    <div className="flex items-center justify-between pt-1 border-t border-gray-200/80 text-[10px]">
                      <div className="flex items-center gap-1 text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        <Award className="w-3 h-3 text-amber-600" />
                        <span>অফিসিয়াল আইডি • BAAJNU</span>
                      </div>
                      <div className="text-right">
                        <span className="font-serif italic font-bold text-gray-700 block text-[11px] border-b border-gray-400 pb-0.5">
                          General Secretary
                        </span>
                        <span className="text-[9.5px] text-gray-500 block">অনুমোদিত স্বাক্ষর</span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action Buttons */}
                  <div className="bg-gray-50 p-2.5 border-t border-gray-200 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenCard(member, true)}
                      className="flex-1 py-2 px-3 bg-[#006a4e] hover:bg-[#00523d] active:bg-[#004030] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                      title={language === 'bn' ? 'আইডি কার্ড সরাসরি ডাউনলোড করুন' : 'Download ID Card PNG'}
                    >
                      <Download className="w-3.5 h-3.5 text-amber-300" />
                      <span>{language === 'bn' ? 'ডাউনলোড' : 'Download'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenCard(member, false)}
                      className="py-2 px-3 bg-white hover:bg-emerald-50 text-[#006a4e] border border-emerald-300 text-xs font-bold rounded-xl shadow-2xs transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-98"
                      title={language === 'bn' ? 'বড় করে দেখুন ও প্রিন্ট' : 'View Full Card'}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{language === 'bn' ? 'দেখুন' : 'View'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleShareCard(member)}
                      className="p-2 bg-white hover:bg-amber-50 text-gray-600 hover:text-amber-700 border border-gray-300 rounded-xl transition-all cursor-pointer shadow-2xs active:scale-95"
                      title={language === 'bn' ? 'শেয়ার করুন' : 'Share'}
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Responsive Table View: Batch, Address, Phone, ID Card Status */
          <div className="overflow-x-auto rounded-2xl border border-[#c1d3c1] shadow-xs bg-white">
            <table className="w-full text-left text-xs border-collapse min-w-[720px]">
              <thead>
                <tr className="bg-[#006a4e] text-white font-bold border-b border-emerald-700">
                  <th className="py-3 px-3">#</th>
                  <th className="py-3 px-3">{language === 'bn' ? 'রেজি. নং' : 'Reg No.'}</th>
                  <th className="py-3 px-3">{language === 'bn' ? 'সদস্যের নাম ও কোর্স' : 'Name & Program'}</th>
                  <th className="py-3 px-3">{language === 'bn' ? 'সদস্য পদবী ও সেশন' : 'Type & Session'}</th>
                  <th className="py-3 px-3">{language === 'bn' ? 'ফোন নম্বর' : 'Phone'}</th>
                  <th className="py-3 px-3 text-center">{language === 'bn' ? 'আইডি কার্ড' : 'ID Status'}</th>
                  <th className="py-3 px-3 text-center">{language === 'bn' ? 'অ্যাকশন' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedMembers.map((member, idx) => {
                  const formNoStr = member.formNo || member.id;
                  const isLife = isLifeRecord(member);

                  return (
                    <tr
                      key={member.id || idx}
                      className="hover:bg-[#f3f9f4] transition-colors"
                    >
                      <td className="py-3 px-3 text-gray-500 font-mono font-bold">
                        {startIndex + idx + 1}
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-mono text-xs font-black bg-emerald-50 text-emerald-950 px-2 py-0.5 rounded border border-emerald-200 whitespace-nowrap shadow-2xs">
                          {formNoStr}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold overflow-hidden shrink-0 shadow-2xs">
                            {member.userPhotoUrl ? (
                              <img
                                src={member.userPhotoUrl}
                                alt={member.applicantNameBn}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span>{member.applicantNameBn.charAt(0) || 'স'}</span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-extrabold text-gray-900 text-xs truncate">
                              {member.applicantNameBn}
                            </p>
                            <span className="text-[10px] text-[#006a4e] font-bold">
                              {getProgramLabel(member.program)}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="space-y-0.5">
                          <span
                            className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-bold ${
                              isLife ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            }`}
                          >
                            {isLife ? (language === 'bn' ? 'আজীবন সদস্য' : 'Life Member') : (language === 'bn' ? 'সাধারণ সদস্য' : 'General Member')}
                          </span>
                          <p className="font-semibold text-gray-900 text-xs font-mono">
                            {member.session || '—'}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-gray-900">
                        {member.mobile || '—'}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 whitespace-nowrap shadow-2xs">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>{language === 'bn' ? 'প্রস্তুত' : 'Ready'}</span>
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenCard(member, false)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-[#006a4e] hover:bg-[#00523d] text-white rounded-lg font-bold text-xs shadow-2xs transition-colors cursor-pointer"
                            title={language === 'bn' ? 'আইডি কার্ড দেখুন' : 'View ID Card'}
                          >
                            <CreditCard className="w-3.5 h-3.5 text-amber-300" />
                            <span>{language === 'bn' ? 'দেখুন' : 'View'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenCard(member, true)}
                            className="inline-flex items-center p-1.5 bg-amber-100 hover:bg-amber-200 text-amber-950 rounded-lg font-bold text-xs border border-amber-300 shadow-2xs transition-colors cursor-pointer"
                            title={language === 'bn' ? 'আইডি কার্ড সরাসরি ডাউনলোড করুন' : 'Download ID Card'}
                          >
                            <Download className="w-3.5 h-3.5 text-amber-700" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleShareCard(member)}
                            className="inline-flex items-center p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold text-xs border border-gray-300 shadow-2xs transition-colors cursor-pointer"
                            title={language === 'bn' ? 'শেয়ার করুন' : 'Share'}
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Dynamic Pagination Bar (10 members per page) */}
        {!loading && filteredMembers.length > 0 && totalPages > 1 && (
          <div className="bg-white border border-emerald-200/80 rounded-2xl p-3 sm:p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Range & Total Count info */}
            <div className="text-xs font-semibold text-gray-700 text-center sm:text-left">
              {language === 'bn' ? (
                <span>
                  মোট <strong className="text-[#006a4e] font-bold">{totalMembersCount}</strong> জন অনুমোদিত সদস্যের মধ্যে{' '}
                  <strong className="text-gray-900 font-bold">{startIndex + 1} - {endIndex}</strong> নম্বর প্রদর্শিত হচ্ছে{' '}
                  <span className="text-gray-500 font-normal">
                    (পৃষ্ঠা <strong className="text-[#006a4e]">{currentPage}</strong> / {totalPages})
                  </span>
                </span>
              ) : (
                <span>
                  Showing <strong className="text-gray-900 font-bold">{startIndex + 1} - {endIndex}</strong> of{' '}
                  <strong className="text-[#006a4e] font-bold">{totalMembersCount}</strong> approved members{' '}
                  <span className="text-gray-500 font-normal">
                    (Page <strong className="text-[#006a4e]">{currentPage}</strong> of {totalPages})
                  </span>
                </span>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Previous Page Button */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                    : 'bg-white hover:bg-emerald-50 text-[#006a4e] hover:text-[#004d38] border border-emerald-300 shadow-2xs cursor-pointer active:scale-95'
                }`}
                title={language === 'bn' ? 'পূর্ববর্তী পৃষ্ঠা' : 'Previous Page'}
              >
                <ChevronLeft className="w-4 h-4" />
                <span>{language === 'bn' ? 'পূর্ববর্তী' : 'Previous'}</span>
              </button>

              {/* Numbered Page Buttons */}
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                  const isActive = pageNum === currentPage;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`min-w-[34px] h-[34px] px-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                        isActive
                          ? 'bg-[#006a4e] text-white shadow-xs scale-105 ring-2 ring-emerald-300'
                          : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              {/* Next Page Button */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`inline-flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                    : 'bg-[#006a4e] hover:bg-[#00523d] text-white shadow-xs cursor-pointer active:scale-95 ring-1 ring-emerald-700'
                }`}
                title={language === 'bn' ? 'পরবর্তী পৃষ্ঠা' : 'Next Page'}
              >
                <span>{language === 'bn' ? 'পরবর্তী' : 'Next'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Member Details Modal / ID Card Slip */}
      {selectedMember && (
        <MemberCardModal
          member={selectedMember}
          language={language}
          autoDownload={autoDownloadCard}
          onClose={() => {
            setSelectedMember(null);
            setAutoDownloadCard(false);
          }}
        />
      )}

      {/* Floating Action Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#004d38] text-white px-4 py-2.5 rounded-xl shadow-2xl border-2 border-amber-300 flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-4 h-4 text-amber-300 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
};
