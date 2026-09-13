import React, { useState } from 'react';
import {
  CreditCard,
  Smartphone,
  Building2,
  Check,
  Copy,
  ArrowLeft,
  Lock,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  Sparkles
} from 'lucide-react';

export interface PaymentSubmissionData {
  paymentMethod: 'bKash' | 'Nagad' | 'Rocket' | 'Bank Transfer';
  senderNumber: string;
  transactionId: string;
  paymentNote?: string;
  feeAmount: string;
  membershipType?: 'general' | 'life';
}

interface MembershipPaymentSectionProps {
  language: 'bn' | 'en';
  formData: {
    membershipId: string;
    membershipType?: 'general' | 'life';
    nameEnglish: string;
    nameBangla?: string;
    phone: string;
    email?: string;
    bscSession?: string;
    mscSession?: string;
  };
  onBackToForm: () => void;
  onConfirmPayment: (paymentData: PaymentSubmissionData) => Promise<void>;
  isSubmitting: boolean;
}

export const MembershipPaymentSection: React.FC<MembershipPaymentSectionProps> = ({
  language,
  formData,
  onBackToForm,
  onConfirmPayment,
  isSubmitting,
}) => {
  const [membershipType, setMembershipType] = useState<'general' | 'life'>(
    formData.membershipType || 'general'
  );
  const [paymentMethod, setPaymentMethod] = useState<'bKash' | 'Nagad' | 'Rocket' | 'Bank Transfer'>('bKash');
  const [senderNumber, setSenderNumber] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [paymentNote, setPaymentNote] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const feeAmountBn = membershipType === 'life' ? '২৫০০' : '৫০০';
  const feeAmountEn = membershipType === 'life' ? '2500' : '500';
  const feeInWords =
    membershipType === 'life'
      ? (language === 'bn' ? '(দুই হাজার পাঁচশত টাকা মাত্র)' : '(Two Thousand Five Hundred BDT)')
      : (language === 'bn' ? '(পাঁচশত টাকা মাত্র)' : '(Five Hundred BDT)');
  const typeNameBn = membershipType === 'life' ? 'আজীবন সদস্য' : 'সাধারণ সদস্য';
  const typeNameEn = membershipType === 'life' ? 'Life Member' : 'General Member';

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validation
    if (!senderNumber.trim()) {
      const msg =
        language === 'bn'
          ? `অনুগ্রহ করে যে নম্বর বা অ্যাকাউন্ট থেকে ${feeAmountBn}/- টাকা পাঠানো হয়েছে তা লিখুন।`
          : `Please provide the sender phone or bank account number from which ${feeAmountEn} BDT was sent.`;
      setFormError(msg);
      return;
    }

    if (!transactionId.trim()) {
      const msg =
        language === 'bn'
          ? 'অনুগ্রহ করে পেমেন্টের ট্রানজেকশন আইডি (TrxID) লিখুন।'
          : 'Please enter the transaction ID (TrxID).';
      setFormError(msg);
      return;
    }

    await onConfirmPayment({
      paymentMethod,
      senderNumber: senderNumber.trim(),
      transactionId: transactionId.trim(),
      paymentNote: paymentNote.trim(),
      feeAmount: feeAmountBn,
      membershipType,
    });
  };

  return (
    <div className="w-full max-w-3xl mx-auto py-4 sm:py-6 px-3 sm:px-4 font-sans text-gray-900 animate-in fade-in duration-300">
      {/* Step Indicator Header */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-3">
        <button
          type="button"
          onClick={onBackToForm}
          disabled={isSubmitting}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg transition-colors cursor-pointer border border-gray-300"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{language === 'bn' ? 'আবেদনপত্র সংশোধন' : 'Back to Edit Form'}</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-bold">
          <span className="text-emerald-700 flex items-center gap-1">
            <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[11px]">✓</span>
            <span>{language === 'bn' ? 'ফরম পূরণ' : 'Form Filled'}</span>
          </span>
          <span className="text-gray-300">→</span>
          <span className="text-[#006a4e] flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-300">
            <span className="w-5 h-5 rounded-full bg-[#006a4e] text-white flex items-center justify-center text-[11px]">2</span>
            <span>{language === 'bn' ? `ফি পেমেন্ট (৳ ${feeAmountBn})` : `Fee Payment (${feeAmountEn} BDT)`}</span>
          </span>
          <span className="text-gray-300">→</span>
          <span className="text-gray-400">
            {language === 'bn' ? 'নিশ্চিতকরণ' : 'Confirmation'}
          </span>
        </div>
      </div>

      {/* Official Payment Gateways Visual Banner (Exact match with user image) */}
      <div className="bg-[#ede4d8] border-2 border-[#5a3f28] rounded-xl overflow-hidden shadow-md text-[#2f2013] mb-6">
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

      {/* Dedicated Membership Category Selection Section (Moved to Payment Page per user request) */}
      <div className="bg-emerald-50/90 border-2 border-emerald-600 rounded-xl p-4 sm:p-5 mb-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-200/80 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#006a4e]"></span>
            <h3 className="text-sm sm:text-base font-black text-gray-900 font-serif-bn">
              {language === 'bn' ? 'মেম্বারশিপ সিলেকশন (সদস্যপদের ধরন):' : 'Membership Category Selection:'}
            </h3>
            <span className="text-red-600 font-bold text-lg leading-none" title="বাধ্যতামূলক">*</span>
          </div>
          <div className="text-xs text-gray-600 font-mono">
            ID: <span className="font-bold text-[#006a4e]">{formData.membershipId}</span> | {formData.nameEnglish}
          </div>
        </div>

        {/* 2 Category Selection Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* General Member Option */}
          <div
            onClick={() => setMembershipType('general')}
            className={`p-3.5 sm:p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
              membershipType === 'general'
                ? 'bg-white border-[#006a4e] ring-2 ring-[#006a4e]/20 shadow-sm'
                : 'bg-white/70 border-gray-300 hover:border-emerald-400 hover:bg-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <input
                type="radio"
                id="membership-general-opt"
                name="membershipCategory"
                value="general"
                checked={membershipType === 'general'}
                onChange={() => setMembershipType('general')}
                className="w-4 h-4 text-[#006a4e] focus:ring-[#006a4e] cursor-pointer"
              />
              <label htmlFor="membership-general-opt" className="cursor-pointer">
                <div className="font-black text-sm sm:text-base text-gray-900">
                  {language === 'bn' ? 'সাধারণ সদস্য' : 'General Member'}
                </div>
                <div className="text-[11px] text-gray-500 font-medium">
                  {language === 'bn' ? 'সাধারণ সদস্য নিবন্ধন' : 'General Membership'}
                </div>
              </label>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 rounded-lg text-sm sm:text-base font-black font-mono bg-emerald-100 text-[#006a4e] border border-emerald-300 shadow-2xs">
                ৳ ৫০০/-
              </span>
            </div>
          </div>

          {/* Life Member Option */}
          <div
            onClick={() => setMembershipType('life')}
            className={`p-3.5 sm:p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
              membershipType === 'life'
                ? 'bg-white border-amber-600 ring-2 ring-amber-500/20 shadow-sm'
                : 'bg-white/70 border-gray-300 hover:border-amber-400 hover:bg-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <input
                type="radio"
                id="membership-life-opt"
                name="membershipCategory"
                value="life"
                checked={membershipType === 'life'}
                onChange={() => setMembershipType('life')}
                className="w-4 h-4 text-amber-600 focus:ring-amber-500 cursor-pointer"
              />
              <label htmlFor="membership-life-opt" className="cursor-pointer">
                <div className="font-black text-sm sm:text-base text-gray-900">
                  {language === 'bn' ? 'আজীবন সদস্য' : 'Life Member'}
                </div>
                <div className="text-[11px] text-gray-500 font-medium">
                  {language === 'bn' ? 'আজীবন সদস্য নিবন্ধন' : 'Life Membership'}
                </div>
              </label>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 rounded-lg text-sm sm:text-base font-black font-mono bg-amber-100 text-amber-800 border border-amber-300 shadow-2xs">
                ৳ ২৫০০/-
              </span>
            </div>
          </div>
        </div>

        {/* Selected Fee Summary Banner */}
        <div className="bg-white px-4 py-2.5 rounded-lg border border-emerald-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="text-xs text-gray-700">
            <span className="font-bold text-emerald-900">
              {language === 'bn' ? 'নির্বাচিত সদস্যপদ:' : 'Selected Membership:'}
            </span>{' '}
            <span className="font-extrabold text-[#006a4e]">
              {typeNameBn}
            </span>{' '}
            <span className="text-gray-500">({feeInWords})</span>
          </div>
          <div className="text-xs sm:text-sm font-bold text-gray-900">
            {language === 'bn' ? 'প্রদেয় সর্বমোট ফি:' : 'Total Payable Fee:'}{' '}
            <span className="font-black text-lg text-[#006a4e] font-mono">
              ৳ {feeAmountBn}/-
            </span>
          </div>
        </div>
      </div>

      {/* Payment Information Form */}
      <form onSubmit={handlePaymentSubmit} className="bg-white border-2 border-emerald-700/60 rounded-xl p-4 sm:p-6 shadow-lg space-y-5">
        <div className="border-b border-gray-200 pb-3">
          <h3 className="text-base sm:text-lg font-black text-gray-900 flex items-center gap-2 font-serif-bn">
            <CreditCard className="w-5 h-5 text-[#006a4e]" />
            <span>{language === 'bn' ? 'পেমেন্ট ও ট্রানজেকশন তথ্য প্রদান করুন' : 'Enter Payment & Transaction Details'}</span>
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            {language === 'bn'
              ? `উপরের বিকাশ/নগদ/রকেট নম্বরে (01557766933) অথবা ব্যাংক অ্যাকাউন্টে ${feeAmountBn}/- টাকা পাঠানোর পর নিচের তথ্যগুলো পূরণ করুন।`
              : `After sending ${feeAmountEn} BDT to the Bkash/Nagad/Rocket number (01557766933) or IFIC Bank account, fill in the fields below.`}
          </p>
        </div>

        {/* Payment Method Selector */}
        <div>
          <label className="block text-xs font-bold text-gray-800 mb-2">
            ১. পেমেন্ট মাধ্যম নির্বাচন করুন (Payment Method) <span className="text-red-600 font-bold">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            {[
              {
                id: 'bKash' as const,
                name: 'bKash',
                nameBn: 'বিকাশ',
                logo: 'https://mssalumni.org/wp-content/uploads/2026/09/vecteezy_bkash-logo-vector_.jpg',
              },
              {
                id: 'Nagad' as const,
                name: 'Nagad',
                nameBn: 'নগদ',
                logo: 'https://mssalumni.org/wp-content/uploads/2026/09/unnamed.png',
              },
              {
                id: 'Rocket' as const,
                name: 'Rocket',
                nameBn: 'রকেট',
                logo: 'https://images.seeklogo.com/logo-png/31/1/dutch-bangla-rocket-logo-png_seeklogo-317692.png',
              },
              {
                id: 'Bank Transfer' as const,
                name: 'Bank Transfer',
                nameBn: 'ব্যাংক ট্রান্সফার',
                isBank: true,
              },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setPaymentMethod(opt.id)}
                className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex flex-col items-center justify-between text-center relative min-h-[96px] ${
                  paymentMethod === opt.id
                    ? 'bg-emerald-50/90 border-[#006a4e] ring-2 ring-[#006a4e]/20 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50/80 shadow-2xs'
                }`}
              >
                {/* Radio check badge */}
                <span
                  className={`absolute top-2 right-2 w-4 h-4 rounded-full border flex items-center justify-center text-[10px] font-bold ${
                    paymentMethod === opt.id
                      ? 'border-[#006a4e] bg-[#006a4e] text-white'
                      : 'border-gray-300 bg-white'
                  }`}
                >
                  {paymentMethod === opt.id ? '✓' : ''}
                </span>

                {/* Logo Image or Bank Icon */}
                <div className="h-10 w-full flex items-center justify-center px-1 my-0.5">
                  {'logo' in opt && opt.logo ? (
                    <img
                      src={opt.logo}
                      alt={opt.name}
                      className="max-h-9 max-w-[85%] object-contain"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center shadow-2xs">
                      <Building2 className="w-5 h-5" />
                    </div>
                  )}
                </div>

                {/* Brand Name (Only Logo & Name, NO number underneath) */}
                <div className="mt-1">
                  <div className="font-bold text-xs text-gray-900 leading-tight">
                    {opt.name}
                  </div>
                  <div className="text-[11px] font-semibold text-gray-600 leading-tight">
                    {opt.nameBn}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Sender Phone Number */}
        <div>
          <label className="block text-xs font-bold text-gray-800 mb-1">
            ২. যে নম্বর বা অ্যাকাউন্ট থেকে টাকা পাঠানো হয়েছে (Sender Number) <span className="text-red-600 font-bold">*</span>
          </label>
          <div className="relative">
            <Smartphone className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              required
              value={senderNumber}
              onChange={(e) => setSenderNumber(e.target.value)}
              placeholder={
                paymentMethod === 'Bank Transfer'
                  ? 'আপনার প্রেরক ব্যাংক হিসাব নম্বর বা নাম'
                  : language === 'bn'
                    ? `যে বিকাশ/নগদ/রকেট নম্বর থেকে ${feeAmountBn} টাকা পাঠিয়েছেন (যেমন: 017XXXXXXXX)`
                    : `Sender number from which ${feeAmountEn} BDT was sent (e.g. 017XXXXXXXX)`
              }
              className="w-full pl-9 pr-3 py-2 border border-gray-400 rounded-lg text-xs sm:text-sm font-mono text-gray-900 focus:outline-none focus:border-[#006a4e] focus:ring-1 focus:ring-[#006a4e] bg-white"
            />
          </div>
          <p className="text-[11px] text-gray-500 mt-1">
            {language === 'bn'
              ? 'অ্যাডমিন এই নম্বরের সাথে প্রাপ্ত পেমেন্ট মিলিয়ে ভেরিফাই করবেন।'
              : 'Our administration will cross-check this sender phone/account with received funds.'}
          </p>
        </div>

        {/* Transaction ID */}
        <div>
          <label className="block text-xs font-bold text-gray-800 mb-1">
            ৩. ট্রানজেকশন আইডি (Transaction ID / TrxID) <span className="text-red-600 font-bold">*</span>
          </label>
          <input
            type="text"
            required
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value.toUpperCase())}
            placeholder={
              paymentMethod === 'Bank Transfer'
                ? 'ব্যাংক ডিপোজিট রেফারেন্স / ভাউচার নম্বর'
                : 'বিকাশ/নগদ/রকেট ট্রানজেকশন আইডি (যেমন: BKL9834X2)'
            }
            className="w-full px-3 py-2 border border-gray-400 rounded-lg text-xs sm:text-sm font-mono font-bold tracking-wider text-gray-900 focus:outline-none focus:border-[#006a4e] focus:ring-1 focus:ring-[#006a4e] bg-white uppercase"
          />
          <p className="text-[11px] text-gray-500 mt-1">
            {language === 'bn'
              ? 'টাকা পাঠানোর পর এসএমএস বা অ্যাপের ট্রানজেকশন হিস্ট্রি থেকে TrxID টি সঠিকভাবে লিখুন।'
              : 'Enter the exact TrxID received in the confirmation SMS or mobile banking app.'}
          </p>
        </div>

        {/* Payment Note (Optional) */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            ৪. অতিরিক্ত নোট বা মন্তব্য (ঐচ্ছিক / Optional)
          </label>
          <input
            type="text"
            value={paymentNote}
            onChange={(e) => setPaymentNote(e.target.value)}
            placeholder={`যেমন: ${formData.membershipId} - ${formData.nameEnglish}`}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-gray-800 focus:outline-none focus:border-[#006a4e] bg-white"
          />
        </div>

        {/* Error Notification */}
        {formError && (
          <div className="p-3 bg-red-50 border-l-4 border-red-600 rounded text-red-800 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{formError}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBackToForm}
            disabled={isSubmitting}
            className="w-full sm:w-auto px-4 py-2.5 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 text-gray-800 text-xs font-bold rounded-lg transition-colors cursor-pointer border border-gray-300"
          >
            ← {language === 'bn' ? 'আবেদনপত্রে ফিরে যান' : 'Back to Form'}
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-6 py-3 bg-[#006a4e] hover:bg-[#00523d] disabled:bg-gray-400 text-white text-xs sm:text-sm font-bold rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{language === 'bn' ? 'ডাটাবেজে সংরক্ষণ করা হচ্ছে...' : 'Saving to Database...'}</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 text-amber-300" />
                <span>
                  {language === 'bn'
                    ? `পেমেন্ট নিশ্চিত করুন ও আবেদন জমা দিন (৳ ${feeAmountBn})`
                    : `Confirm Payment & Submit (${feeAmountEn} BDT)`}
                </span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
