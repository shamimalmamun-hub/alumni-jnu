import React, { useState } from 'react';
import { X, Lock, Phone, KeyRound, AlertCircle, ShieldCheck, ArrowRight } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface MemberLoginModalProps {
  isOpen: boolean;
  language: 'bn' | 'en';
  onClose: () => void;
  onLoginSuccess: (memberData: any) => void;
  targetPageName?: string;
}

// Convert Bengali digits (০-৯) to English digits (0-9)
const bnToEnDigits = (str: string): string => {
  const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return str.replace(/[০-৯]/g, (d) => String(banglaDigits.indexOf(d)));
};

export const MemberLoginModal: React.FC<MemberLoginModalProps> = ({
  isOpen,
  language,
  onClose,
  onLoginSuccess,
  targetPageName,
}) => {
  const [memberIdInput, setMemberIdInput] = useState('');
  const [mobileInput, setMobileInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const rawId = memberIdInput.trim();
    const rawMobile = mobileInput.trim();

    if (!rawId || !rawMobile) {
      setErrorMessage(
        language === 'bn'
          ? 'অনুগ্রহ করে মেম্বার আইডি এবং মোবাইল নম্বর দুটিই সঠিক প্রদান করুন।'
          : 'Please provide both Member ID and Mobile Number.'
      );
      return;
    }

    setLoading(true);

    try {
      const cleanIdInput = bnToEnDigits(rawId).toLowerCase().replace(/[^a-z0-9]/gi, '');
      const cleanMobileInput = bnToEnDigits(rawMobile).replace(/\D/g, '');

      // Query memberships from Firestore
      const colRef = collection(db, 'memberships');
      const snapshot = await getDocs(colRef).catch(() => null);

      let foundMember: any = null;
      let matchedStatus: string | null = null;
      let matchedMemberName: string = '';

      if (snapshot && !snapshot.empty) {
        snapshot.forEach((docSnap) => {
          if (foundMember) return;
          const data = docSnap.data();

          const docId = docSnap.id.toLowerCase();
          const formNo = (data.formNo || data.membershipId || docSnap.id || '').toLowerCase();
          const cleanFormNo = bnToEnDigits(formNo).replace(/[^a-z0-9]/gi, '');
          const formDigitsOnly = cleanFormNo.replace(/\D/g, '');
          const last4FormDigits = formDigitsOnly.slice(-4);

          const mobile = bnToEnDigits(data.mobile || data.phone || '').replace(/\D/g, '');

          // Check Form No or ID match
          const matchesId =
            cleanFormNo === cleanIdInput ||
            cleanFormNo.includes(cleanIdInput) ||
            docId === cleanIdInput ||
            (cleanIdInput.length >= 3 && last4FormDigits === cleanIdInput);

          // Check Mobile match (matches full or last 10-11 digits)
          const matchesMobile =
            mobile === cleanMobileInput ||
            (cleanMobileInput.length >= 8 && mobile.endsWith(cleanMobileInput)) ||
            (mobile.length >= 8 && cleanMobileInput.endsWith(mobile));

          if (matchesId && matchesMobile) {
            matchedStatus = data.status || 'pending';
            matchedMemberName = data.applicantNameBn || data.fullName || data.applicantNameEn || 'সম্মানিত সদস্য';

            // Allow login if approved by Admin or pending
            if (data.status === 'approved') {
              foundMember = {
                id: docSnap.id,
                formNo: data.formNo || data.membershipId || docSnap.id,
                applicantNameBn: data.applicantNameBn || data.fullName || 'সম্মানিত সদস্য',
                applicantNameEn: data.applicantNameEn || '',
                mobile: data.mobile || data.phone || '',
                session: data.session || data.batch || '',
                program: data.program || 'bsc_honours',
                userPhotoUrl: data.userPhotoUrl || '',
                bloodGroup: data.bloodGroup || '',
                status: data.status,
              };
            }
          }
        });
      }

      if (foundMember) {
        onLoginSuccess(foundMember);
        onClose();
      } else if (matchedStatus === 'rejected') {
        setErrorMessage(
          language === 'bn'
            ? `দুঃখিত ${matchedMemberName}, আপনার সদস্যপদ আবেদনটি বাতিল করা হয়েছে। বিস্তারিত জানতে অ্যাডমিনের সাথে যোগাযোগ করুন।`
            : `Sorry ${matchedMemberName}, your membership application was rejected. Please contact the administrator.`
        );
      } else if (matchedStatus === 'pending' || matchedStatus === 'payment_pending' || matchedStatus) {
        setErrorMessage(
          language === 'bn'
            ? `শ্রদ্ধেয় ${matchedMemberName}, আপনার সদস্যপদ আবেদনটি এখনও অ্যাডমিন কর্তৃক অনুমোদনাধীন (Pending Approval) রয়েছে। অ্যাডমিন ড্যাশবোর্ড থেকে অনুমোদন করার পর আপনি সিস্টেমে লগইন করতে পারবেন।`
            : `Dear ${matchedMemberName}, your membership application is currently pending admin approval. You can log in once approved by the admin.`
        );
      } else {
        setErrorMessage(
          language === 'bn'
            ? 'প্রদত্ত মেম্বার আইডি অথবা মোবাইল নম্বর নিবন্ধিত রেকর্ডের সাথে মিলছে না। অনুগ্রহ করে সঠিক তথ্যাদি প্রদান করুন।'
            : 'Member ID or Mobile Number does not match our registered records. Please check and try again.'
        );
      }
    } catch (err) {
      console.error('Login verification error:', err);
      setErrorMessage(
        language === 'bn'
          ? 'সার্ভারের সাথে যোগাযোগ করতে সমস্যা হয়েছে। অনুগ্রহ করে ইন্টারনেট কানেকশন চেক করুন।'
          : 'Failed to connect to authentication server. Please check your internet.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs font-siliguri animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-emerald-500/40 overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#004d38] via-[#006a4e] to-[#003829] p-5 sm:p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-emerald-100 hover:text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-300/40 flex items-center justify-center text-amber-300 shrink-0 shadow-inner">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold text-amber-300 font-serif-bn">
                {language === 'bn' ? 'সদস্য লগইন বাতায়ন' : 'Member Login Portal'}
              </h3>
              <p className="text-xs text-emerald-100/90 leading-tight">
                {language === 'bn'
                  ? 'সিস্টেমের মেম্বার সুবিধা পেতে লগইন করুন'
                  : 'Log in to access alumni member services'}
              </p>
            </div>
          </div>
        </div>

        {/* Notice Info Box */}
        <div className="p-5 sm:p-6 space-y-4">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs sm:text-sm flex items-start gap-2.5 leading-relaxed">
            <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">
                {language === 'bn' ? 'সুরক্ষিত বাতায়ন:' : 'Protected Portal:'}{' '}
              </span>
              {language === 'bn'
                ? 'কার্যনির্বাহী কমিটি, রেজিস্টার্ড অ্যালামনাই তালিকা, ব্লাড কর্নার, চাকরি নিউজ ও অনুসন্ধান অপশন ব্যবহারের জন্য সদস্য লগইন প্রয়োজন।'
                : 'Login is required to access Leadership, Alumni Directory, Blood Corner, Job News & Search features.'}
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs sm:text-sm flex items-start gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {/* Member ID Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-[#006a4e]" />
                <span>
                  {language === 'bn' ? 'মেম্বার আইডি / ফর্ম নম্বর:' : 'Member ID / Form No:'}
                </span>
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder={
                  language === 'bn'
                    ? 'যেমন: BOT-0001, 0001 বা মোবাইল নম্বর'
                    : 'e.g. BOT-0001, 0001 or mobile number'
                }
                value={memberIdInput}
                onChange={(e) => setMemberIdInput(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#006a4e] focus:bg-white text-gray-900 font-mono transition-all placeholder:font-sans placeholder:text-gray-400"
              />
            </div>

            {/* Mobile Number Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#006a4e]" />
                <span>
                  {language === 'bn' ? 'নিবন্ধিত মোবাইল নম্বর:' : 'Registered Mobile Number:'}
                </span>
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder={
                  language === 'bn'
                    ? 'নিবন্ধনের সময় প্রদানকৃত ১১ ডিজিটের মোবাইল নম্বর'
                    : '11-digit Mobile Number used during registration'
                }
                value={mobileInput}
                onChange={(e) => setMobileInput(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#006a4e] focus:bg-white text-gray-900 font-mono transition-all placeholder:font-sans placeholder:text-gray-400"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
              >
                {language === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 px-6 py-2.5 text-xs sm:text-sm font-extrabold text-white bg-gradient-to-r from-[#006a4e] to-[#004d38] hover:from-[#00523d] hover:to-[#003829] rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{language === 'bn' ? 'লগইন নিশ্চিত করুন' : 'Verify & Login'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Modal Footer Note */}
        <div className="bg-gray-50 p-3 border-t border-gray-100 text-center text-[11px] text-gray-500">
          {language === 'bn'
            ? 'এখনো নিবন্ধিত হননি? উপরের "সদস্য নিবন্ধন" মেনু থেকে নতুন সদস্য ফর্ম পূরণ করতে পারবেন।'
            : 'Not registered yet? Click "Member Registration" menu to apply.'}
        </div>
      </div>
    </div>
  );
};

