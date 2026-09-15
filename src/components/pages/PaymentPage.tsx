import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Smartphone,
  Building2,
  CheckCircle2,
  Copy,
  Check,
  Search,
  Download,
  Printer,
  FileCheck2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  QrCode,
  Upload,
  RefreshCw,
  Clock,
  UserCheck,
  ExternalLink,
  BookOpen,
  Info,
} from 'lucide-react';
import { db } from '../../lib/firebase';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
} from 'firebase/firestore';
import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';
import jnuBotanyLogo from '../../assets/images/jnu_botany_alumni_logo.jpg';
import { BATCH_SESSION_LIST } from '../../data/batchSessionData';

interface PaymentPageProps {
  language: 'bn' | 'en';
  onBackToHome: () => void;
  onNavigateToRegister?: () => void;
  initialMembershipId?: string;
  initialFeeType?: 'general' | 'life' | string;
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
  paymentMethod: 'bKash' | 'Nagad' | 'Rocket' | 'Bank Transfer';
  senderNumber: string;
  transactionId: string;
  phone: string;
  email?: string;
  session?: string;
  batch?: string;
  note?: string;
  slipUrl?: string;
  status: 'verified' | 'pending';
  createdAt: string;
}

const PAYMENT_CATEGORIES = [
  {
    id: 'general',
    titleBn: 'সাধারণ সদস্যপদ ফি',
    titleEn: 'General Membership Fee',
    amount: 500,
    descBn: 'উদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশনের ২ বছর মেয়াদী সাধারণ সদস্যপদ',
    descEn: '2-Year General Membership for Botany Alumni Association',
    badgeBn: '৳ ৫০০',
    badgeEn: '500 BDT',
  },
  {
    id: 'life',
    titleBn: 'আজীবন সদস্যপদ ফি',
    titleEn: 'Life Membership Fee',
    amount: 2500,
    descBn: 'আজীবন সদস্যপদ ও আজীবন ভোটার/কাউন্সিলর অধিকার',
    descEn: 'Permanent Life Membership & Voting Rights',
    badgeBn: '৳ ২৫০০',
    badgeEn: '2500 BDT',
    popular: true,
  },
];

export const PaymentPage: React.FC<PaymentPageProps> = ({
  language,
  onBackToHome,
  onNavigateToRegister,
  initialMembershipId,
  initialFeeType = 'general',
}) => {
  const [activeTab, setActiveTab] = useState<'pay' | 'verify' | 'gateways' | 'guidelines'>('pay');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Form State
  const [purposeType, setPurposeType] = useState<string>(initialFeeType);
  const [customAmount, setCustomAmount] = useState<string>('1000');
  const [membershipId, setMembershipId] = useState<string>(initialMembershipId || '');
  const [payerName, setPayerName] = useState<string>('');
  const [payerNameBn, setPayerNameBn] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [session, setSession] = useState<string>('');
  const [batch, setBatch] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'bKash' | 'Nagad' | 'Rocket' | 'Bank Transfer'>('bKash');
  const [senderNumber, setSenderNumber] = useState<string>('');
  const [transactionId, setTransactionId] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [slipPreview, setSlipPreview] = useState<string | null>(null);

  // Submission & Result States
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdReceipt, setCreatedReceipt] = useState<PaymentRecord | null>(null);

  // Verification Search State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchResult, setSearchResult] = useState<PaymentRecord | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  // PDF Generation State
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<boolean>(false);

  // Check URL query parameters or initial props on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const idParam = initialMembershipId || params.get('id') || params.get('membershipId') || params.get('formNo');
    const typeParam = initialFeeType || params.get('type') || params.get('fee');
    const trxParam = params.get('trx') || params.get('transactionId');

    if (idParam) {
      setMembershipId(idParam);
      lookupMemberInfo(idParam);
    }
    if (typeParam && ['general', 'life', 'reunion', 'student', 'donation'].includes(typeParam)) {
      setPurposeType(typeParam);
    }
    if (trxParam) {
      setActiveTab('verify');
      setSearchQuery(trxParam);
      handleSearchPayment(trxParam);
    }
  }, [initialMembershipId, initialFeeType]);

  const lookupMemberInfo = async (id: string) => {
    // 1. Try checking sessionStorage first (instant for freshly submitted forms)
    try {
      const sessionRaw = sessionStorage.getItem('current_member_application');
      if (sessionRaw) {
        const data = JSON.parse(sessionRaw);
        if (data.membershipId === id || data.formNo === id || !id) {
          if (data.nameEnglish || data.fullName) setPayerName(data.nameEnglish || data.fullName);
          if (data.nameBangla || data.applicantNameBn) setPayerNameBn(data.nameBangla || data.applicantNameBn);
          if (data.phone || data.mobile) setPhone(data.phone || data.mobile);
          if (data.email) setEmail(data.email);
          if (data.bscSession || data.session) setSession(data.bscSession || data.session);
          if (data.bscBatch || data.batch) setBatch(data.bscBatch || data.batch);
          if (data.membershipType) setPurposeType(data.membershipType);
          return;
        }
      }
    } catch (e) {}

    // 2. Try checking localStorage backup
    try {
      const localListRaw = localStorage.getItem('alumni_submitted_memberships');
      if (localListRaw) {
        const list = JSON.parse(localListRaw);
        const match = list.find((m: any) => m.membershipId === id || m.formNo === id || m.id === id);
        if (match) {
          if (match.applicantNameEn || match.nameEnglish || match.fullName) {
            setPayerName(match.applicantNameEn || match.nameEnglish || match.fullName);
          }
          if (match.applicantNameBn || match.nameBangla) {
            setPayerNameBn(match.applicantNameBn || match.nameBangla);
          }
          if (match.phone || match.mobile) setPhone(match.phone || match.mobile);
          if (match.email) setEmail(match.email);
          if (match.bscSession || match.session) setSession(match.bscSession || match.session);
          if (match.bscBatch || match.batch) setBatch(match.bscBatch || match.batch);
          if (match.membershipType) setPurposeType(match.membershipType);
          return;
        }
      }
    } catch (e) {}

    // 3. Fallback to Firestore lookup
    try {
      const docRef = doc(db, 'memberships', id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        if (data.nameEnglish || data.fullName || data.applicantNameEn) {
          setPayerName(data.nameEnglish || data.fullName || data.applicantNameEn);
        }
        if (data.nameBangla || data.applicantNameBn) {
          setPayerNameBn(data.nameBangla || data.applicantNameBn);
        }
        if (data.phone || data.mobile) setPhone(data.phone || data.mobile);
        if (data.email) setEmail(data.email);
        if (data.bscSession || data.session) setSession(data.bscSession || data.session);
        if (data.bscBatch || data.batch) setBatch(data.bscBatch || data.batch);
        if (data.membershipType) setPurposeType(data.membershipType);
      }
    } catch (e) {
      console.warn('Could not auto-fetch member details:', e);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleSlipUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSlipPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getEffectiveAmount = (): number => {
    const selected = PAYMENT_CATEGORIES.find((c) => c.id === purposeType);
    if (!selected) return 500;
    if (selected.id === 'donation') {
      const parsed = parseInt(customAmount.replace(/[^0-9]/g, ''), 10);
      return isNaN(parsed) || parsed < 50 ? 500 : parsed;
    }
    return selected.amount;
  };

  const getPurposeTitle = (): string => {
    const selected = PAYMENT_CATEGORIES.find((c) => c.id === purposeType);
    if (!selected) return language === 'bn' ? 'সদস্যপদ ফি' : 'Membership Fee';
    return language === 'bn' ? selected.titleBn : selected.titleEn;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!senderNumber.trim()) {
      setErrorMessage(language === 'bn' ? 'অনুগ্রহ করে যে নম্বর বা ব্যাংক অ্যাকাউন্ট থেকে টাকা পাঠিয়েছেন তা লিখুন।' : 'Please enter sender account/mobile number.');
      return;
    }
    if (!transactionId.trim()) {
      setErrorMessage(language === 'bn' ? 'অনুগ্রহ করে ট্রানজেকশন আইডি (TrxID) লিখুন।' : 'Please enter the Transaction ID.');
      return;
    }

    setIsSubmitting(true);

    try {
      const amount = getEffectiveAmount();
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const receiptNo = `BAAJNU-PAY-${randomSuffix}`;
      const paymentDocId = `PAY-${Date.now()}-${randomSuffix}`;
      const now = new Date().toISOString();

      const finalPayerName = payerName.trim() || membershipId.trim() || 'Alumni Member';
      const finalPhone = phone.trim() || senderNumber.trim();

      const newRecord: PaymentRecord = {
        id: paymentDocId,
        receiptNo,
        payerName: finalPayerName,
        payerNameBn: payerNameBn.trim() || finalPayerName,
        membershipId: membershipId.trim() || undefined,
        purpose: getPurposeTitle(),
        purposeType,
        amount,
        paymentMethod,
        senderNumber: senderNumber.trim(),
        transactionId: transactionId.trim().toUpperCase(),
        phone: finalPhone,
        email: email.trim() || undefined,
        session: session.trim() || undefined,
        batch: batch.trim() || undefined,
        note: note.trim() || undefined,
        slipUrl: slipPreview || undefined,
        status: 'verified',
        createdAt: now,
      };

      // 1. Save to `payments` collection
      const paymentRef = doc(db, 'payments', paymentDocId);
      await setDoc(paymentRef, newRecord);

      // 2. If membershipId provided, update the membership record
      if (membershipId.trim()) {
        try {
          const memRef = doc(db, 'memberships', membershipId.trim());
          const memSnap = await getDoc(memRef);
          if (memSnap.exists()) {
            await updateDoc(memRef, {
              paymentStatus: 'paid',
              paymentMethod,
              senderNumber: senderNumber.trim(),
              transactionId: transactionId.trim().toUpperCase(),
              paymentReceiptNo: receiptNo,
              paidAmount: amount,
              paidAt: now,
            });
          }
        } catch (memErr) {
          console.warn('Membership status update warning:', memErr);
        }
      }

      setCreatedReceipt(newRecord);
      setIsSubmitting(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Payment record error:', err);
      setErrorMessage(
        language === 'bn'
          ? 'পেমেন্ট সংরক্ষণ করতে সমস্যা হয়েছে। অনুগ্রহ করে ইন্টারনেট সংযোগ চেক করে পুনরায় চেষ্টা করুন।'
          : 'Failed to record payment. Please check your connection and try again.'
      );
      setIsSubmitting(false);
    }
  };

  const handleSearchPayment = async (overrideQuery?: string) => {
    const q = (overrideQuery !== undefined ? overrideQuery : searchQuery).trim();
    if (!q) {
      setSearchError(language === 'bn' ? 'অনুগ্রহ করে ট্রানজেকশন আইডি, মেম্বারশিপ আইডি বা মোবাইল নম্বর লিখুন।' : 'Please enter TrxID, Membership ID or Phone.');
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    setSearchResult(null);

    try {
      const colRef = collection(db, 'payments');

      // 1. Try by Transaction ID
      let snap = await getDocs(query(colRef, where('transactionId', '==', q.toUpperCase())));
      if (snap.empty) {
        snap = await getDocs(query(colRef, where('transactionId', '==', q)));
      }

      // 2. Try by Receipt No
      if (snap.empty) {
        snap = await getDocs(query(colRef, where('receiptNo', '==', q.toUpperCase())));
      }

      // 3. Try by Membership ID
      if (snap.empty) {
        snap = await getDocs(query(colRef, where('membershipId', '==', q)));
      }

      // 4. Try by Phone
      if (snap.empty) {
        snap = await getDocs(query(colRef, where('phone', '==', q)));
      }

      // 5. If still not found, check memberships collection for paid record
      if (snap.empty) {
        const memRef = collection(db, 'memberships');
        let memSnap = await getDocs(query(memRef, where('transactionId', '==', q.toUpperCase())));
        if (memSnap.empty) {
          memSnap = await getDocs(query(memRef, where('formNo', '==', q)));
        }

        if (!memSnap.empty) {
          const memData = memSnap.docs[0].data();
          const synthesized: PaymentRecord = {
            id: memSnap.docs[0].id,
            receiptNo: memData.paymentReceiptNo || `BAAJNU-REC-${memData.formNo || 'VERIFIED'}`,
            payerName: memData.nameEnglish || memData.fullName || 'Alumni Member',
            payerNameBn: memData.nameBangla || memData.applicantNameBn || 'অ্যালামনাই সদস্য',
            membershipId: memData.formNo || memData.membershipId,
            purpose: memData.membershipType === 'life' ? 'আজীবন সদস্যপদ ফি' : 'সাধারণ সদস্যপদ ফি',
            purposeType: memData.membershipType || 'general',
            amount: memData.membershipType === 'life' ? 2500 : 500,
            paymentMethod: memData.paymentMethod || 'bKash',
            senderNumber: memData.senderNumber || memData.mobile || 'N/A',
            transactionId: memData.transactionId || q,
            phone: memData.phone || memData.mobile || '',
            session: memData.bscSession || memData.session,
            status: 'verified',
            createdAt: memData.paidAt || memData.createdAt || new Date().toISOString(),
          };
          setSearchResult(synthesized);
          setIsSearching(false);
          return;
        }
      }

      if (!snap.empty) {
        const docData = snap.docs[0].data() as PaymentRecord;
        setSearchResult({ ...docData, id: snap.docs[0].id });
      } else {
        setSearchError(
          language === 'bn'
            ? 'প্রদত্ত তথ্য অনুযায়ী কোনো পেমেন্ট রেকর্ড খুঁজে পাওয়া যায়নি। সঠিক TrxID বা মোবাইল নম্বর দিয়ে পুনরায় চেষ্টা করুন।'
            : 'No payment record found matching your query. Please verify the TrxID or phone number.'
        );
      }
    } catch (e) {
      console.error('Payment search error:', e);
      setSearchError(language === 'bn' ? 'অনুসন্ধানে সমস্যা হয়েছে।' : 'Error searching payment.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleDownloadReceiptPdf = async (receiptElementId: string, receiptNumber: string) => {
    const element = document.getElementById(receiptElementId);
    if (!element) return;

    setIsDownloadingPdf(true);
    try {
      const canvas = await html2canvas(element, {
        scale: 2.5,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const margin = 15;
      const contentWidth = pdfWidth - margin * 2;
      const contentHeight = (canvas.height * contentWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', margin, 15, contentWidth, contentHeight);
      pdf.save(`Money_Receipt_${receiptNumber}.pdf`);
    } catch (err) {
      console.error('PDF error:', err);
      window.print();
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const formatAmountBn = (amt: number): string => {
    const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return amt.toString().replace(/\d/g, (d) => bnDigits[parseInt(d, 10)]);
  };

  return (
    <div className="w-full bg-[#f4f7f5] min-h-screen py-4 sm:py-8 px-2.5 sm:px-6 font-sans text-gray-900 antialiased">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation Breadcrumb Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-xl border border-emerald-200/80 shadow-xs no-print">
          <div className="flex items-center gap-2">
            <button
              onClick={onBackToHome}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-emerald-50 text-gray-700 hover:text-[#006a4e] text-xs font-bold rounded-lg border border-gray-300 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'হোমে ফিরুন' : 'Back to Home'}</span>
            </button>
            <span className="text-gray-300 font-bold hidden sm:inline">/</span>
            <span className="text-xs sm:text-sm font-extrabold text-[#006a4e] flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-emerald-700" />
              <span>{language === 'bn' ? 'অনলাইন পেমেন্ট গেটওয়ে' : 'Online Payment Gateway'}</span>
            </span>
          </div>

          {onNavigateToRegister && (
            <button
              onClick={onNavigateToRegister}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-[#006a4e] text-xs font-bold rounded-lg border border-emerald-300 transition-colors cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'সদস্য নিবন্ধন ফরম' : 'Member Registration Form'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>


        {/* TAB 1: PAY FEE FORM */}
        {activeTab === 'pay' && !createdReceipt && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Payment Gateways Visual Poster (Exact Matching Branding) */}
            <div className="bg-[#ede4d8] border-2 border-[#5a3f28] rounded-2xl overflow-hidden shadow-md text-[#2f2013]">
              {/* Banner Title */}
              <div className="border-b-2 border-[#5a3f28] py-2.5 px-4 text-center bg-[#e2d5c5]">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-[#2f2013] font-serif-bn">
                  Payment Getways
                </h2>
                <p className="text-[11px] sm:text-xs text-[#5a3f28] font-semibold mt-0.5">
                  Botany Alumni Association, Jagannath University (BAAJnU)
                </p>
              </div>

              {/* 2-Column Split: Mobile Banking on Left, Bank Account on Right */}
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y-2 md:divide-y-0 md:divide-x-2 divide-[#5a3f28]">
                {/* Left Column: Bkash/Nagad/Rocket- */}
                <div className="p-4 sm:p-5 flex flex-col justify-center bg-[#ede4d8]">
                  <div className="flex items-center gap-2 mb-2 flex-wrap justify-between">
                    <div className="text-base sm:text-lg font-bold border-b border-[#5a3f28]/70 pb-0.5 w-max">
                      Bkash/Nagad/Rocket-
                    </div>
                    <div className="flex items-center gap-1.5 bg-white/90 px-2 py-1 rounded-md border border-[#5a3f28]/30 shadow-2xs">
                      <img
                        src="https://mssalumni.org/wp-content/uploads/2026/09/vecteezy_bkash-logo-vector_.jpg"
                        alt="bKash"
                        className="h-5 w-auto object-contain"
                        referrerPolicy="no-referrer"
                      />
                      <img
                        src="https://mssalumni.org/wp-content/uploads/2026/09/unnamed.png"
                        alt="Nagad"
                        className="h-5 w-auto object-contain"
                        referrerPolicy="no-referrer"
                      />
                      <img
                        src="https://images.seeklogo.com/logo-png/31/1/dutch-bangla-rocket-logo-png_seeklogo-317692.png"
                        alt="Rocket"
                        className="h-5 w-auto object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                  
                  <div className="text-2xl sm:text-3xl md:text-[34px] font-black tracking-wider font-mono text-[#24170d] flex items-center justify-between gap-2 flex-wrap py-1">
                    <span>01557766933</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard('01557766933', 'mobile')}
                      className="px-2.5 py-1 bg-[#3a2717] hover:bg-[#20140a] text-white text-xs font-bold rounded shadow-xs flex items-center gap-1 cursor-pointer transition-transform active:scale-95"
                      title="Copy mobile number"
                    >
                      {copiedKey === 'mobile' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{language === 'bn' ? 'কপি হয়েছে' : 'Copied'}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>{language === 'bn' ? 'নম্বর কপি' : 'Copy'}</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-[#5a3f28]/20 flex flex-wrap items-center gap-2 text-xs text-[#5a3f28]">
                    <span className="bg-[#3a2717] text-amber-200 px-2 py-0.5 rounded text-[10px] font-bold">
                      Personal / Send Money
                    </span>
                    <span className="text-[11px] font-medium">
                      {language === 'bn' ? 'যেকোনো পার্সোনাল ওয়ালেট থেকে পাঠানো যাবে' : 'Send via any personal mobile wallet'}
                    </span>
                  </div>
                </div>

                {/* Right Column: AC Information- */}
                <div className="p-4 sm:p-5 flex flex-col justify-center space-y-1 sm:space-y-1.5 text-xs sm:text-sm bg-[#ede4d8]">
                  <div className="text-base sm:text-lg font-bold border-b border-[#5a3f28]/70 inline-block pb-0.5 mb-1 w-max">
                    AC Information-
                  </div>
                  
                  <div className="font-extrabold text-sm sm:text-base text-[#24170d] tracking-wide">
                    BAAJnU
                  </div>

                  <div className="flex items-center justify-between gap-2 font-mono font-black text-base sm:text-lg text-[#24170d]">
                    <span>0220075059031</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard('0220075059031', 'ac')}
                      className="px-2.5 py-1 bg-[#3a2717] hover:bg-[#20140a] text-white text-xs font-bold rounded shadow-xs flex items-center gap-1 cursor-pointer transition-transform active:scale-95"
                      title="Copy account number"
                    >
                      {copiedKey === 'ac' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{language === 'bn' ? 'কপি হয়েছে' : 'Copied'}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>{language === 'bn' ? 'অ্যাকাউন্ট কপি' : 'Copy'}</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="font-bold text-xs sm:text-sm text-[#24170d]">
                    IFIC Bank PLC
                  </div>
                  <div className="font-semibold text-xs text-[#3a2717]">
                    Banasree Branch
                  </div>
                  
                  <div className="flex items-center justify-between gap-2 font-mono text-xs sm:text-sm font-bold text-[#24170d] pt-1">
                    <span>Routing- 120260720</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard('120260720', 'routing')}
                      className="px-2 py-0.5 bg-[#5a3f28]/20 hover:bg-[#5a3f28]/30 text-[#24170d] text-[11px] font-bold rounded flex items-center gap-1 cursor-pointer"
                      title="Copy routing number"
                    >
                      {copiedKey === 'routing' ? (
                        <span>✓ কপি</span>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Category Selector */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 border border-emerald-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-[#006a4e] text-white flex items-center justify-center font-bold text-xs">
                    ১
                  </span>
                  <h3 className="font-bold text-base sm:text-lg text-[#004d38]">
                    {language === 'bn' ? 'ফি এর ধরন নির্বাচন করুন' : 'Select Fee Category'}
                  </h3>
                </div>
                <span className="text-xs font-semibold text-gray-500">
                  {language === 'bn' ? 'নিচের যেকোনো একটি বেছে নিন' : 'Choose one category'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {PAYMENT_CATEGORIES.map((cat) => {
                  const isSelected = purposeType === cat.id;
                  return (
                    <div
                      key={cat.id}
                      onClick={() => setPurposeType(cat.id)}
                      className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-[#006a4e] bg-emerald-50/70 shadow-md ring-2 ring-emerald-600/20'
                          : 'border-gray-200 hover:border-emerald-300 bg-white hover:bg-gray-50'
                      }`}
                    >
                      {cat.popular && (
                        <span className="absolute -top-2.5 right-3 px-2.5 py-0.5 rounded-full bg-amber-500 text-white font-extrabold text-[11px] uppercase tracking-wider shadow-xs">
                          {language === 'bn' ? 'জনপ্রিয়' : 'Popular'}
                        </span>
                      )}

                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="font-bold text-base text-gray-900">
                            {language === 'bn' ? cat.titleBn : cat.titleEn}
                          </span>
                          <span
                            className={`px-2.5 py-1 rounded-lg text-xs font-black font-mono ${
                              isSelected ? 'bg-[#006a4e] text-white' : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {language === 'bn' ? cat.badgeBn : cat.badgeEn}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                          {language === 'bn' ? cat.descBn : cat.descEn}
                        </p>
                      </div>

                      <div className="mt-4 pt-2.5 border-t border-gray-100 flex items-center justify-between text-xs sm:text-sm">
                        <span className="font-bold text-emerald-800">
                          {isSelected ? (language === 'bn' ? '✓ নির্বাচিত' : '✓ Selected') : (language === 'bn' ? 'ক্লিক করুন' : 'Select')}
                        </span>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected ? 'border-[#006a4e] bg-[#006a4e]' : 'border-gray-300'
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Submission Form */}
            <form onSubmit={handleFormSubmit} className="bg-white rounded-2xl p-4 sm:p-6 border border-emerald-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-[#006a4e] text-white flex items-center justify-center font-bold text-xs">
                    ২
                  </span>
                  <h3 className="font-bold text-base sm:text-lg text-[#004d38]">
                    {language === 'bn' ? 'সদস্য ও ট্রানজেকশন তথ্য পূরণ করুন' : 'Member & Transaction Details'}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-500 block">{language === 'bn' ? 'মোট প্রদেয় ফি' : 'Payable Amount'}</span>
                  <span className="text-base sm:text-lg font-black text-[#006a4e] font-mono">
                    ৳ {language === 'bn' ? formatAmountBn(getEffectiveAmount()) : getEffectiveAmount()}/-
                  </span>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 bg-red-50 border-l-4 border-red-600 rounded-lg text-red-800 text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-2xs">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{errorMessage}</span>
                </div>
              )}


              {/* Payment Method & Transaction Box */}
              <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200 space-y-4">
                <h4 className="font-bold text-sm text-[#004d38] border-b border-emerald-300 pb-2">
                  {language === 'bn' ? 'লেনদেনের বিস্তারিত তথ্য' : 'Payment Transaction Details'}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Payment Method */}
                  <div className="space-y-1">
                    <label className="font-bold text-gray-800 text-xs">
                      {language === 'bn' ? 'পেমেন্ট মাধ্যম' : 'Payment Method'} <span className="text-red-600">*</span>
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="w-full border border-gray-400 rounded-lg px-3 py-2 text-xs sm:text-sm font-bold text-gray-900 bg-white focus:outline-none focus:border-[#006a4e]"
                    >
                      <option value="bKash">bKash (বিকাশ)</option>
                      <option value="Nagad">Nagad (নগদ)</option>
                      <option value="Rocket">Rocket (রকেট)</option>
                      <option value="Bank Transfer">Bank Transfer (ব্যাংক হিসাব)</option>
                    </select>
                  </div>

                  {/* Sender Number */}
                  <div className="space-y-1">
                    <label className="font-bold text-gray-800 text-xs">
                      {language === 'bn' ? 'প্রেরক নম্বর / একাউন্ট' : 'Sender Phone / Account'} <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={senderNumber}
                      onChange={(e) => setSenderNumber(e.target.value)}
                      placeholder="যে নম্বর থেকে টাকা পাঠিয়েছেন"
                      className="w-full border border-gray-400 rounded-lg px-3 py-2 text-xs sm:text-sm font-mono font-bold text-gray-900 bg-white focus:outline-none focus:border-[#006a4e]"
                    />
                  </div>

                  {/* Transaction ID (TrxID) */}
                  <div className="space-y-1">
                    <label className="font-bold text-gray-800 text-xs">
                      {language === 'bn' ? 'ট্রানজেকশন আইডি (TrxID)' : 'Transaction ID (TrxID)'} <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      placeholder="e.g. BL90XX22YQ"
                      className="w-full border-2 border-emerald-600 rounded-lg px-3 py-2 text-xs sm:text-sm font-mono font-black text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#006a4e]"
                    />
                  </div>
                </div>

                {/* Reference / Note & Attachment */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="space-y-1">
                    <label className="font-bold text-gray-800 text-xs">
                      {language === 'bn' ? 'মন্তব্য বা রেফারেন্স নোট' : 'Reference / Remarks'}
                    </label>
                    <input
                      type="text"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="e.g. Life membership fee for 2026"
                      className="w-full border border-gray-400 rounded-lg px-3 py-2 text-xs text-gray-900 bg-white focus:outline-none focus:border-[#006a4e]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-gray-800 text-xs flex items-center justify-between">
                      <span>{language === 'bn' ? 'পেমেন্ট স্লিপ / স্ক্রিনশট' : 'Payment Slip / Screenshot'}</span>
                      <span className="text-[10px] text-gray-500">{language === 'bn' ? '(ঐচ্ছিক)' : '(Optional)'}</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <label className="px-3 py-2 bg-white hover:bg-gray-100 text-[#006a4e] border border-[#006a4e] rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors shrink-0">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{slipPreview ? (language === 'bn' ? 'পরিবর্তন' : 'Change') : (language === 'bn' ? 'ফাইল আপলোড' : 'Upload')}</span>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={handleSlipUpload}
                          className="hidden"
                        />
                      </label>
                      {slipPreview && (
                        <span className="text-xs text-emerald-800 font-semibold flex items-center gap-1 truncate">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{language === 'bn' ? 'স্লিপ যুক্ত হয়েছে' : 'Slip attached'}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-3 flex flex-col sm:flex-row items-center justify-end gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-[#006a4e] to-[#004d38] hover:from-[#00523d] hover:to-[#003827] text-white text-sm sm:text-base font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2.5 cursor-pointer border border-emerald-400 active:scale-98 disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{language === 'bn' ? 'পেমেন্ট যাচাই ও সংরক্ষণ হচ্ছে...' : 'Verifying & Saving...'}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-amber-300 shrink-0" />
                      <span>{language === 'bn' ? 'পেমেন্ট সাবমিট করুন ও ই-রসিদ সংগ্রহ করুন' : 'Submit Payment & Get E-Receipt'}</span>
                      <ArrowRight className="w-4 h-4 text-amber-300" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* SUCCESS / CREATED MONEY RECEIPT VIEW */}
        {createdReceipt && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Top Success Banner */}
            <div className="bg-emerald-50 border-2 border-emerald-500 rounded-2xl p-4 sm:p-5 text-center space-y-2 no-print shadow-sm">
              <div className="w-12 h-12 bg-[#006a4e] text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-7 h-7 text-amber-300" />
              </div>
              <h3 className="text-lg sm:text-2xl font-black text-[#004d38] font-serif-bn">
                {language === 'bn'
                  ? 'অভিনন্দন! আপনার পেমেন্ট সফলভাবে সংরক্ষিত হয়েছে'
                  : 'Congratulations! Payment Recorded Successfully'}
              </h3>
              <p className="text-xs sm:text-sm text-gray-700 max-w-lg mx-auto">
                {language === 'bn'
                  ? 'আপনার অফিসিয়াল ই-মানি রিসিট প্রস্তুত করা হয়েছে। নিচে প্রদত্ত রিসিটটি ডাউনলোড অথবা প্রিন্ট করে সংরক্ষণ করুন।'
                  : 'Your official E-Money Receipt is ready. Please download or print it for your records.'}
              </p>

              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => handleDownloadReceiptPdf('official-money-receipt', createdReceipt.receiptNo)}
                  disabled={isDownloadingPdf}
                  className="px-5 py-2.5 bg-[#006a4e] hover:bg-[#004d38] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer border border-emerald-300"
                >
                  <Download className="w-4 h-4 text-amber-300" />
                  <span>{isDownloadingPdf ? (language === 'bn' ? 'পিডিএফ তৈরি হচ্ছে...' : 'Generating PDF...') : (language === 'bn' ? 'পিডিএফ ডাউনলোড করুন' : 'Download Receipt PDF')}</span>
                </button>

                <button
                  onClick={() => window.print()}
                  className="px-4 py-2.5 bg-white hover:bg-gray-100 text-gray-800 text-xs sm:text-sm font-bold rounded-xl border border-gray-300 shadow-2xs transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-gray-600" />
                  <span>{language === 'bn' ? 'প্রিন্ট রসিদ' : 'Print Receipt'}</span>
                </button>

                <button
                  onClick={() => setCreatedReceipt(null)}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs sm:text-sm font-bold rounded-xl border border-gray-300 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4 text-gray-600" />
                  <span>{language === 'bn' ? 'নতুন পেমেন্ট করুন' : 'Make Another Payment'}</span>
                </button>
              </div>
            </div>

            {/* Official Printable Money Receipt Box */}
            <div
              id="official-money-receipt"
              className="bg-white border-2 border-[#006a4e] rounded-2xl p-6 sm:p-8 shadow-xl max-w-2xl mx-auto space-y-6 text-gray-900 font-sans relative overflow-hidden print:border-none print:shadow-none print:p-0"
            >
              {/* Background Watermark */}
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none">
                <img src={jnuBotanyLogo} alt="Watermark" className="w-96 h-96 object-contain" />
              </div>

              {/* Receipt Header */}
              <div className="border-b-2 border-emerald-700 pb-4 text-center space-y-2 relative z-10">
                <div className="flex items-center justify-center gap-3">
                  <img src={jnuBotanyLogo} alt="Logo" className="w-14 h-14 object-contain rounded-full border border-emerald-400 p-0.5" />
                  <div className="text-center">
                    <h2 className="text-lg sm:text-xl font-black text-[#004d38] font-serif-bn tracking-tight">
                      উদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশন
                    </h2>
                    <h3 className="text-xs sm:text-sm font-bold text-gray-700 font-siliguri">
                      ৯-১০ চিত্তরঞ্জন এভিনিউ, ঢাকা-১১০০
                    </h3>
                    <p className="text-[10px] text-[#006a4e] font-semibold">
                      Department of Botany Alumni Association, Jagannath University
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <span className="inline-block px-4 py-1 rounded-full bg-[#006a4e] text-white text-xs font-black tracking-wider uppercase shadow-xs">
                    {language === 'bn' ? 'অফিসিয়াল ই-মানি রিসিট (MONEY RECEIPT)' : 'OFFICIAL E-MONEY RECEIPT'}
                  </span>
                </div>
              </div>

              {/* Receipt Meta Numbers */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-emerald-50/70 p-3 rounded-xl border border-emerald-200 relative z-10">
                <div>
                  <span className="text-gray-600 font-semibold block">{language === 'bn' ? 'রসিদ নং / Receipt No:' : 'Receipt No:'}</span>
                  <span className="font-mono font-extrabold text-[#004d38] text-sm">{createdReceipt.receiptNo}</span>
                </div>
                <div className="text-right">
                  <span className="text-gray-600 font-semibold block">{language === 'bn' ? 'তারিখ ও সময় / Date:' : 'Date & Time:'}</span>
                  <span className="font-mono font-bold text-gray-800 text-xs">
                    {new Date(createdReceipt.createdAt).toLocaleString(language === 'bn' ? 'bn-BD' : 'en-US')}
                  </span>
                </div>
              </div>

              {/* Details Table */}
              <div className="space-y-2 text-xs sm:text-sm relative z-10">
                <div className="flex justify-between py-1.5 border-b border-gray-200">
                  <span className="font-semibold text-gray-600">{language === 'bn' ? 'সদস্যের নাম (Payer Name):' : 'Payer Name:'}</span>
                  <span className="font-bold text-gray-900">{createdReceipt.payerName} {createdReceipt.payerNameBn ? `(${createdReceipt.payerNameBn})` : ''}</span>
                </div>

                {createdReceipt.membershipId && (
                  <div className="flex justify-between py-1.5 border-b border-gray-200">
                    <span className="font-semibold text-gray-600">{language === 'bn' ? 'মেম্বারশিপ / আইডি নং:' : 'Membership ID:'}</span>
                    <span className="font-mono font-bold text-[#006a4e]">{createdReceipt.membershipId}</span>
                  </div>
                )}

                {createdReceipt.session && (
                  <div className="flex justify-between py-1.5 border-b border-gray-200">
                    <span className="font-semibold text-gray-600">{language === 'bn' ? 'সেশন / ব্যাচ:' : 'Session / Batch:'}</span>
                    <span className="font-medium text-gray-900">{createdReceipt.session}</span>
                  </div>
                )}

                <div className="flex justify-between py-1.5 border-b border-gray-200">
                  <span className="font-semibold text-gray-600">{language === 'bn' ? 'মোবাইল নম্বর:' : 'Mobile No:'}</span>
                  <span className="font-mono font-bold text-gray-900">{createdReceipt.phone}</span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-gray-200">
                  <span className="font-semibold text-gray-600">{language === 'bn' ? 'পেমেন্টের উদ্দেশ্য (Purpose):' : 'Payment Purpose:'}</span>
                  <span className="font-bold text-emerald-900">{createdReceipt.purpose}</span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-gray-200">
                  <span className="font-semibold text-gray-600">{language === 'bn' ? 'পেমেন্ট মেথড (Method):' : 'Payment Method:'}</span>
                  <span className="font-bold text-gray-900">{createdReceipt.paymentMethod} (Sender: {createdReceipt.senderNumber})</span>
                </div>

                <div className="flex justify-between py-1.5 border-b-2 border-emerald-300 bg-emerald-50/40 px-2 rounded">
                  <span className="font-semibold text-gray-700">{language === 'bn' ? 'ট্রানজেকশন আইডি (TrxID):' : 'Transaction ID:'}</span>
                  <span className="font-mono font-black text-[#006a4e] text-sm sm:text-base tracking-wider">{createdReceipt.transactionId}</span>
                </div>

                {/* Amount Row */}
                <div className="flex justify-between items-center py-2.5 bg-[#004d38] text-white px-3.5 rounded-xl mt-3 shadow-xs">
                  <span className="font-bold text-xs sm:text-sm">
                    {language === 'bn' ? 'পরিশোধিত মোট অংক (Total Paid):' : 'Total Amount Paid:'}
                  </span>
                  <span className="font-mono font-black text-lg sm:text-xl text-amber-300">
                    ৳ {language === 'bn' ? formatAmountBn(createdReceipt.amount) : createdReceipt.amount}/-
                  </span>
                </div>
              </div>

              {/* Receipt Footer Signatures & QR */}
              <div className="pt-6 border-t border-gray-300 grid grid-cols-3 gap-2 items-end text-center text-[10px] text-gray-600 relative z-10">
                <div className="space-y-1">
                  <div className="h-8 flex items-center justify-center font-mono font-bold text-emerald-800 text-[11px]">
                    SYSTEM VERIFIED
                  </div>
                  <div className="border-t border-gray-400 pt-1">
                    <span>{language === 'bn' ? 'অনলাইন সার্ভার স্বাক্ষর' : 'System Verified'}</span>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center">
                  <div className="w-12 h-12 border border-gray-300 rounded p-0.5 bg-white shadow-2xs flex items-center justify-center">
                    <QrCode className="w-10 h-10 text-gray-800" />
                  </div>
                  <span className="text-[9px] text-gray-500 mt-0.5">Scan to Verify</span>
                </div>

                <div className="space-y-1">
                  <div className="h-8 flex items-center justify-center font-serif-bn font-bold text-gray-800 text-xs">
                    কোষাধ্যক্ষ / সাধারণ সম্পাদক
                  </div>
                  <div className="border-t border-gray-400 pt-1">
                    <span>{language === 'bn' ? 'উদ্ভিদবিজ্ঞান অ্যালামনাই' : 'Botany Alumni JnU'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: VERIFY & SEARCH RECEIPT */}
        {activeTab === 'verify' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl p-4 sm:p-6 border border-emerald-200 shadow-sm space-y-4">
              <div className="border-b border-gray-200 pb-3">
                <h3 className="font-bold text-base sm:text-lg text-[#004d38] flex items-center gap-2">
                  <Search className="w-5 h-5 text-emerald-700" />
                  <span>{language === 'bn' ? 'পেমেন্ট ভেরিফিকেশন ও মানি রিসিট অনুসন্ধান' : 'Search Payment & E-Receipt'}</span>
                </h3>
                <p className="text-xs text-gray-600 mt-1">
                  {language === 'bn'
                    ? 'আপনার পেমেন্টের ট্রানজেকশন আইডি (TrxID), মেম্বারশিপ আইডি, রসিদ নম্বর বা মোবাইল নম্বর দিয়ে সার্চ করে রিসিট প্রিন্ট করুন।'
                    : 'Search by Transaction ID (TrxID), Membership ID, Receipt No or Mobile number.'}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchPayment()}
                    placeholder={language === 'bn' ? 'TrxID, সদস্য আইডি বা মোবাইল নম্বর লিখুন...' : 'Enter TrxID, Membership ID or Phone...'}
                    className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:border-[#006a4e] focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
                <button
                  onClick={() => handleSearchPayment()}
                  disabled={isSearching}
                  className="px-6 py-2.5 bg-[#006a4e] hover:bg-[#004d38] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 disabled:opacity-60"
                >
                  {isSearching ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{language === 'bn' ? 'খোঁজা হচ্ছে...' : 'Searching...'}</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      <span>{language === 'bn' ? 'খুঁজুন' : 'Search'}</span>
                    </>
                  )}
                </button>
              </div>

              {searchError && (
                <div className="p-3.5 bg-red-50 border-l-4 border-red-600 rounded-xl text-red-800 text-xs sm:text-sm font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{searchError}</span>
                </div>
              )}
            </div>

            {/* Found Search Result */}
            {searchResult && (
              <div className="space-y-4">
                <div className="bg-emerald-50 border-2 border-emerald-400 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-6 h-6 text-[#006a4e] shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-emerald-900 block">
                        {language === 'bn' ? 'বৈধ পেমেন্ট রেকর্ড পাওয়া গেছে!' : 'Valid Payment Record Found!'}
                      </span>
                      <span className="text-[11px] text-emerald-700">
                        Receipt No: <strong className="font-mono">{searchResult.receiptNo}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDownloadReceiptPdf('searched-money-receipt', searchResult.receiptNo)}
                      disabled={isDownloadingPdf}
                      className="px-4 py-2 bg-[#006a4e] hover:bg-[#004d38] text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-amber-300" />
                      <span>{language === 'bn' ? 'পিডিএফ রিসিট' : 'Download PDF'}</span>
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="px-3 py-2 bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5 text-gray-600" />
                      <span>{language === 'bn' ? 'প্রিন্ট' : 'Print'}</span>
                    </button>
                  </div>
                </div>

                {/* Search Result Voucher Card */}
                <div
                  id="searched-money-receipt"
                  className="bg-white border-2 border-emerald-600 rounded-2xl p-6 sm:p-8 shadow-md max-w-2xl mx-auto space-y-5 text-gray-900 font-sans"
                >
                  <div className="border-b-2 border-emerald-700 pb-3 text-center space-y-1">
                    <div className="flex items-center justify-center gap-2.5">
                      <img src={jnuBotanyLogo} alt="Logo" className="w-12 h-12 object-contain rounded-full border border-emerald-400 p-0.5" />
                      <div className="text-center">
                        <h2 className="text-base sm:text-lg font-black text-[#004d38] font-serif-bn">
                          উদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশন
                        </h2>
                        <p className="text-[10px] text-gray-600 font-semibold font-siliguri">৯-১০ চিত্তরঞ্জন এভিনিউ, ঢাকা-১১০০</p>
                      </div>
                    </div>
                    <span className="inline-block px-3 py-0.5 rounded-full bg-[#006a4e] text-white text-[11px] font-bold uppercase mt-1">
                      MONEY RECEIPT VOUCHER
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                    <div>
                      <span className="text-gray-500 font-semibold block">Receipt No:</span>
                      <span className="font-mono font-extrabold text-[#004d38]">{searchResult.receiptNo}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-gray-500 font-semibold block">Date:</span>
                      <span className="font-mono font-bold text-gray-800">
                        {new Date(searchResult.createdAt).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US')}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs sm:text-sm">
                    <div className="flex justify-between py-1 border-b border-gray-200">
                      <span className="text-gray-600 font-semibold">Payer Name:</span>
                      <span className="font-bold text-gray-900">{searchResult.payerName}</span>
                    </div>

                    {searchResult.membershipId && (
                      <div className="flex justify-between py-1 border-b border-gray-200">
                        <span className="text-gray-600 font-semibold">Membership ID:</span>
                        <span className="font-mono font-bold text-[#006a4e]">{searchResult.membershipId}</span>
                      </div>
                    )}

                    <div className="flex justify-between py-1 border-b border-gray-200">
                      <span className="text-gray-600 font-semibold">Purpose:</span>
                      <span className="font-bold text-emerald-900">{searchResult.purpose}</span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-gray-200">
                      <span className="text-gray-600 font-semibold">Payment Method:</span>
                      <span className="font-bold text-gray-900">{searchResult.paymentMethod} ({searchResult.senderNumber})</span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-gray-200">
                      <span className="text-gray-600 font-semibold">Transaction ID (TrxID):</span>
                      <span className="font-mono font-extrabold text-[#006a4e]">{searchResult.transactionId}</span>
                    </div>

                    <div className="flex justify-between items-center py-2 bg-[#004d38] text-white px-3 rounded-lg mt-2 font-mono font-black text-base">
                      <span>Total Amount:</span>
                      <span className="text-amber-300">৳ {language === 'bn' ? formatAmountBn(searchResult.amount) : searchResult.amount}/-</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: BANK & GATEWAYS INFO */}
        {activeTab === 'gateways' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* IFIC Bank Card */}
              <div className="bg-white rounded-2xl p-5 border-2 border-emerald-300 shadow-sm space-y-4">
                <div className="flex items-center gap-3 border-b border-gray-200 pb-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#006a4e] flex items-center justify-center font-bold">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-gray-900">IFIC Bank PLC</h3>
                    <p className="text-xs text-emerald-700 font-semibold">Banasree Branch, Dhaka</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-gray-800">
                  <div className="flex justify-between py-1.5 border-b border-gray-100">
                    <span className="text-gray-600 font-semibold">Account Title:</span>
                    <span className="font-bold text-right">BAAJnU</span>
                  </div>

                  <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                    <span className="text-gray-600 font-semibold">Account Number:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-extrabold text-sm text-[#006a4e]">0220075059031</span>
                      <button
                        onClick={() => copyToClipboard('0220075059031', 'ific')}
                        className="px-2 py-0.5 rounded bg-gray-100 hover:bg-emerald-100 text-xs text-[#006a4e] cursor-pointer"
                      >
                        {copiedKey === 'ific' ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between py-1.5 border-b border-gray-100">
                    <span className="text-gray-600 font-semibold">Routing Number:</span>
                    <span className="font-mono font-bold">120260720</span>
                  </div>
                </div>
              </div>

              {/* Mobile Banking Helpline Card */}
              <div className="bg-white rounded-2xl p-5 border-2 border-emerald-300 shadow-sm space-y-4">
                <div className="flex items-center gap-3 border-b border-gray-200 pb-3">
                  <div className="w-10 h-10 rounded-xl bg-pink-100 text-[#e2136e] flex items-center justify-center font-bold">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-gray-900">Mobile Banking</h3>
                    <p className="text-xs text-pink-700 font-semibold">Bkash / Nagad / Rocket (Personal)</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-gray-800">
                  <div className="flex justify-between py-1.5 border-b border-gray-100">
                    <span className="text-gray-600 font-semibold">Wallets:</span>
                    <span className="font-bold text-right">bKash, Nagad, Rocket</span>
                  </div>

                  <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                    <span className="text-gray-600 font-semibold">Account Number:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-extrabold text-sm text-[#e2136e]">01557766933</span>
                      <button
                        onClick={() => copyToClipboard('01557766933', 'mobile2')}
                        className="px-2 py-0.5 rounded bg-gray-100 hover:bg-emerald-100 text-xs text-[#006a4e] cursor-pointer"
                      >
                        {copiedKey === 'mobile2' ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between py-1.5">
                    <span className="text-gray-600 font-semibold">Type:</span>
                    <span className="font-bold text-gray-900">Personal / Send Money</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Helpline and Treasurer Contact */}
            <div className="bg-emerald-50 rounded-2xl p-4 sm:p-5 border border-emerald-300 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <h4 className="font-bold text-sm sm:text-base text-[#004d38]">
                  {language === 'bn' ? 'পেমেন্ট ও হিসাব সংক্রান্ত হেল্পলাইন' : 'Payment & Accounts Helpline'}
                </h4>
                <p className="text-xs text-gray-700">
                  {language === 'bn'
                    ? 'কোনো লেনদেন জটিলতায় কোষাধ্যক্ষ বা অফিসিয়াল অ্যালামনাই হেল্পডেস্কে যোগাযোগ করুন।'
                    : 'For any transaction assistance, contact the Treasurer office or alumni desk.'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <a
                  href="tel:01557766933"
                  className="px-3.5 py-2 bg-[#006a4e] text-white text-xs font-bold rounded-lg shadow-xs hover:bg-[#004d38] transition-colors"
                >
                  📞 01557766933
                </a>
                <a
                  href="mailto:baajnu@gmail.com"
                  className="px-3.5 py-2 bg-white text-gray-800 border border-gray-300 text-xs font-bold rounded-lg hover:bg-gray-100 transition-colors"
                >
                  ✉️ Email Desk
                </a>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: INSTRUCTIONS & FAQ */}
        {activeTab === 'guidelines' && (
          <div className="bg-white rounded-2xl p-5 sm:p-7 border border-emerald-200 shadow-sm space-y-5 animate-in fade-in duration-300">
            <h3 className="font-bold text-lg text-[#004d38] border-b border-gray-200 pb-3">
              {language === 'bn' ? 'পেমেন্ট নির্দেশিকা ও সাধারণ প্রশ্নোত্তর' : 'Payment Guidelines & Step-by-Step Instructions'}
            </h3>

            <div className="space-y-4 text-xs sm:text-sm text-gray-800">
              <div className="p-3.5 bg-pink-50/70 border border-pink-200 rounded-xl space-y-1.5">
                <h4 className="font-bold text-pink-900 flex items-center gap-2">
                  <span>📱 বিকাশ (bKash) / নগদ (Nagad) / রকেট (Rocket) পরিশোধের ধাপ:</span>
                </h4>
                <ol className="list-decimal list-inside space-y-1 text-gray-700 pl-2">
                  <li>আপনার বিকাশ/নগদ/রকেট অ্যাপে লগইন করুন অথবা ডায়াল কোড ব্যবহার করুন।</li>
                  <li><strong>Send Money</strong> অপশন নির্বাচন করুন।</li>
                  <li>প্রাপক নম্বর হিসেবে <strong>01557766933</strong> লিখুন।</li>
                  <li>সদস্যপদের ধরন অনুযায়ী নির্ধারিত পরিমাণ টাকা লিখুন (যেমনঃ ২৫০০ বা ৫০০)।</li>
                  <li>আপনার পিন দিয়ে লেনদেন সম্পন্ন করুন।</li>
                  <li>প্রাপ্ত <strong>TrxID (ট্রানজেকশন আইডি)</strong> সংগ্রহ করে উপরের ফর্মে সাবমিট করুন।</li>
                </ol>
              </div>

              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1.5">
                <h4 className="font-bold text-[#004d38] flex items-center gap-2">
                  <span>🏦 ব্যাংক ডিপোজিট বা অনলাইন ফান্ড ট্রান্সফার (NPSB / BEFTN / EFT):</span>
                </h4>
                <p className="text-gray-700">
                  বাংলাদেশের যেকোনো ব্যাংকের অনলাইন ব্যাংকিং অ্যাপ অথবা যেকোনো শাখা থেকে সরাসরি IFIC Bank PLC (A/C: 0220075059031, BAAJnU, Banasree Branch, Routing: 120260720) অ্যাকাউন্টে টাকা পাঠিয়ে ডিপোজিট স্লিপের রেফারেন্স নম্বর TrxID ঘরে দিন।
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
