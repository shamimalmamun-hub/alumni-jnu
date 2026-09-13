import React, { useState } from 'react';
import html2canvas from 'html2canvas-pro';
import {
  X,
  User,
  Download,
  CheckCircle2,
  Phone,
  MapPin,
  Calendar,
  Layers,
  Sparkles,
  CreditCard,
  Share2
} from 'lucide-react';

export interface CardMemberData {
  id?: string;
  formNo?: string;
  applicantNameBn?: string;
  fullName?: string;
  applicantNameEn?: string;
  program?: string;
  session?: string;
  batch?: string;
  mobile?: string;
  district?: string;
  village?: string;
  presentAddress?: string;
  currentAddress?: string;
  transactionId?: string;
  userPhotoUrl?: string;
  status?: string;
  paymentStatus?: string;
  feeAmount?: string;
}

interface MemberCardModalProps {
  member: CardMemberData | null;
  language?: 'bn' | 'en';
  onClose: () => void;
  autoDownload?: boolean;
}

export const MemberCardModal: React.FC<MemberCardModalProps> = ({
  member,
  language = 'bn',
  onClose,
}) => {
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [generatedImgUrl, setGeneratedImgUrl] = useState<string | null>(null);
  const [downloadSuccessNote, setDownloadSuccessNote] = useState<string | null>(null);

  if (!member) return null;

  const displayNameBn = member.applicantNameBn || member.fullName || 'সম্মানিত সদস্য';
  const displayFormNo = member.formNo || member.id || 'BOT-ALUMNI-2026';
  const displaySession = member.session || member.batch || '—';
  const displayMobile = member.mobile || '—';
  const displayAddress = member.currentAddress || member.presentAddress || member.district || 'জগন্নাথ বিশ্ববিদ্যালয়, ঢাকা';
  const displayTrx = member.transactionId || 'VERIFIED';

  const getProgramName = (prog?: string) => {
    if (!prog) return 'বিএসসি (সম্মান)';
    if (prog === 'masters') return 'এমএসসি (মাস্টার্স)';
    if (prog === 'degree') return 'ডিগ্রী (পাস)';
    return 'বিএসসি (সম্মান)';
  };

  const isIOS = () => {
    return (
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    );
  };

  const handleDownloadImage = async () => {
    const cardElement = document.getElementById('alumni-member-card-canvas');
    if (!cardElement) return;

    try {
      setIsDownloading(true);
      setDownloadSuccessNote(null);

      if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
        await document.fonts.ready.catch(() => null);
      }

      // Render at scale 2 to prevent iOS Safari/Chrome WebKit canvas memory exhaustion
      const canvas = await html2canvas(cardElement, {
        scale: 2.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const safeName = displayNameBn.replace(/\s+/g, '_');
      const safeFormNo = displayFormNo.replace(/[^a-zA-Z0-9_-]/g, '');
      const fileName = `Alumni_Card_${safeName}_${safeFormNo}.png`;

      // 1. Get Blob
      const blob: Blob | null = await new Promise((resolve) => {
        canvas.toBlob((b) => resolve(b), 'image/png', 0.95);
      });

      const dataUrl = canvas.toDataURL('image/png', 0.95);
      setGeneratedImgUrl(dataUrl);

      // 2. For iOS (iPhone / iPad) - Use Web Share API or long press
      if (isIOS()) {
        if (blob && navigator.canShare) {
          try {
            const file = new File([blob], fileName, { type: 'image/png' });
            if (navigator.canShare({ files: [file] })) {
              await navigator.share({
                files: [file],
                title: `Alumni Card - ${displayNameBn}`,
                text: `জগন্নাথ বিশ্ববিদ্যালয় উদ্ভিদবিজ্ঞান বিভাগ পুনর্মিলনী সদস্য কার্ড (${displayFormNo})`,
              });
              setDownloadSuccessNote('সদস্য কার্ড সফলভাবে শেয়ার বা সংরক্ষণ করা হয়েছে!');
              return;
            }
          } catch (shareErr: any) {
            if (shareErr.name === 'AbortError') {
              return;
            }
            console.warn('iOS Web Share fallback:', shareErr);
          }
        }
        setDownloadSuccessNote('আইফোনে ছবি সেভ করতে: নিচে কার্ডের ছবির ওপর চেপে ধরে (Long Press) "Save to Photos" সিলেক্ট করুন।');
        return;
      }

      // 3. For Android and PC / Mac Desktop - DIRECT Instant File Download
      if (blob) {
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = fileName;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 4000);
      } else {
        const link = document.createElement('a');
        link.download = fileName;
        link.href = dataUrl;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      setDownloadSuccessNote('সদস্য কার্ড সফলভাবে ডাউনলোড হয়েছে!');
    } catch (error) {
      console.error('Error generating card image download:', error);
    } finally {
      setTimeout(() => setIsDownloading(false), 600);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white max-w-sm sm:max-w-md w-full rounded-2xl shadow-2xl border-2 border-emerald-700/50 overflow-hidden p-3.5 sm:p-5 space-y-3.5 relative my-auto">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full cursor-pointer transition-colors no-print z-10"
          title={language === 'bn' ? 'বন্ধ করুন' : 'Close'}
        >
          <X className="w-4 h-4" />
        </button>

        {/* Printable & Downloadable Card Canvas */}
        <div
          id="alumni-member-card-canvas"
          className="bg-white p-4 sm:p-5 space-y-3.5 rounded-xl border-2 border-emerald-600/70 relative overflow-hidden font-siliguri"
        >
          {/* Official Header with College & Alumni Logo */}
          <div className="text-center border-b border-emerald-700/20 pb-2.5 space-y-1.5">
            <div className="flex items-center justify-center gap-2.5">
              <img
                src="/jnu_botany_alumni_logo.jpg"
                alt="Botany Alumni Association Logo"
                className="w-11 h-11 object-contain shrink-0 rounded-full border border-emerald-500/40 p-0.5 bg-white shadow-xs"
                crossOrigin="anonymous"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://upload.wikimedia.org/wikipedia/en/thumb/8/87/Logo_of_Jagannath_University.svg/512px-Logo_of_Jagannath_University.svg.png';
                }}
              />
              <div className="text-left">
                <h2 className="text-[13px] sm:text-sm font-black text-gray-900 leading-tight">
                  জগন্নাথ বিশ্ববিদ্যালয়, ঢাকা
                </h2>
                <p className="text-[11px] font-bold text-emerald-800 leading-tight">
                  উদ্ভিদবিজ্ঞান বিভাগ অ্যালামনাই অ্যাসোসিয়েশন
                </p>
              </div>
            </div>

            <div className="pt-0.5">
              <div className="bg-[#006a4e] text-white px-3 py-1 rounded-md shadow-xs inline-block">
                <h3 className="text-xs sm:text-[13px] font-black tracking-wide whitespace-nowrap">
                  উদ্ভিদবিজ্ঞান বিভাগ — পুনর্মিলনী সদস্য কার্ড
                </h3>
              </div>
            </div>

            <div className="pt-0.5">
              <span className="inline-block bg-amber-100 text-amber-950 border border-amber-300 font-mono font-black text-[11px] sm:text-xs px-2.5 py-0.5 rounded-md shadow-2xs">
                রেজিস্ট্রেশন নং: {displayFormNo}
              </span>
            </div>
          </div>

          {/* Profile Section */}
          <div className="flex items-center gap-3.5 bg-white p-3 rounded-xl border border-emerald-200 shadow-2xs">
            <div className="w-16 h-20 rounded-lg bg-emerald-700 border-2 border-emerald-500 flex items-center justify-center font-bold text-white overflow-hidden shrink-0 shadow-xs">
              {member.userPhotoUrl ? (
                <img
                  src={member.userPhotoUrl}
                  alt={displayNameBn}
                  className="w-full h-full object-cover"
                  crossOrigin="anonymous"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <User className="w-8 h-8 text-white" />
              )}
            </div>

            <div className="space-y-1 min-w-0 flex-1">
              <h4 className="font-black text-gray-900 text-sm sm:text-base leading-tight truncate">
                {displayNameBn}
              </h4>
              {member.applicantNameEn && (
                <p className="text-[11px] text-gray-500 font-mono truncate">
                  {member.applicantNameEn}
                </p>
              )}
              <p className="text-xs font-bold text-[#006a4e]">
                {getProgramName(member.program)}
              </p>
              <div className="flex items-center gap-1.5 pt-0.5">
                <span className="bg-emerald-100 text-[#006a4e] text-[10px] font-bold px-2 py-0.5 rounded-full">
                  ব্যাচ: {displaySession}
                </span>
              </div>
            </div>
          </div>

          {/* Member Details */}
          <div className="space-y-1.5 text-xs text-gray-800 bg-white p-3 rounded-xl border border-emerald-100 shadow-2xs">
            <div className="flex justify-between border-b border-gray-100 pb-1">
              <span className="text-gray-500 font-medium">রেজিস্ট্রেশন ফরম নং:</span>
              <span className="font-bold font-mono text-rose-700">{displayFormNo}</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-1">
              <span className="text-gray-500 font-medium">ব্যাচ / সেশন:</span>
              <span className="font-bold text-gray-900">{displaySession}</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-1">
              <span className="text-gray-500 font-medium">মোবাইল নম্বর:</span>
              <span className="font-mono font-bold text-gray-900">{displayMobile}</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-1">
              <span className="text-gray-500 font-medium">ঠিকানা:</span>
              <span className="font-medium text-gray-900 text-right max-w-[190px] truncate">
                {displayAddress}
              </span>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-1">
              <span className="text-gray-500 font-medium">পেমেন্ট ট্রানজেকশন:</span>
              <span className="font-mono font-bold text-emerald-800">
                {displayTrx}
              </span>
            </div>
            <div className="flex justify-between pt-0.5">
              <span className="text-gray-500 font-medium">স্ট্যাটাস:</span>
              <span className="font-bold text-[#006a4e] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#006a4e]" />
                অনুমোদিত ও ভেরিফাইড
              </span>
            </div>
          </div>

          {/* Official Seal Footnote */}
          <div className="text-center pt-1 border-t border-emerald-200/60">
            <p className="text-[10px] font-semibold text-emerald-800">
              সার্বিক সহযোগিতায় - শামীম আল মামুন
            </p>
          </div>
        </div>

        {/* Download / Share Notification Alert */}
        {downloadSuccessNote && (
          <div className="bg-emerald-50 border border-emerald-300 text-[#006a4e] p-2.5 rounded-xl text-xs font-medium flex items-center justify-between gap-2 animate-in fade-in">
            <span>{downloadSuccessNote}</span>
            <button
              type="button"
              onClick={() => setDownloadSuccessNote(null)}
              className="text-emerald-700 hover:text-emerald-950 font-bold text-xs"
            >
              ✕
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-1 no-print">
          <button
            type="button"
            onClick={handleDownloadImage}
            disabled={isDownloading}
            className="flex-1 min-h-[44px] py-2.5 px-4 bg-[#006a4e] hover:bg-[#00523d] disabled:bg-gray-400 text-white font-black text-xs sm:text-sm rounded-xl shadow-md cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-2"
            title={language === 'bn' ? 'সদস্য কার্ড ছবি হিসেবে ডাউনলোড করুন' : 'Download Member Card PNG'}
          >
            <Download className={`w-4 h-4 ${isDownloading ? 'animate-bounce' : ''}`} />
            <span>
              {isDownloading
                ? language === 'bn'
                  ? 'ডাউনলোড হচ্ছে...'
                  : 'Downloading...'
                : language === 'bn'
                ? 'কার্ড ডাউনলোড'
                : 'Download Card'}
            </span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs sm:text-sm rounded-xl border border-gray-300 cursor-pointer transition-colors text-center"
          >
            {language === 'bn' ? 'বন্ধ' : 'Close'}
          </button>
        </div>

        {/* Dedicated iOS / Mobile Long-Press Image Preview Modal */}
        {generatedImgUrl && isIOS() && (
          <div className="bg-amber-50/95 border-2 border-amber-300 rounded-xl p-3 text-center space-y-2 mt-2">
            <div className="flex items-center justify-center gap-1.5 text-amber-900 font-bold text-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>আইফোনে সেভ করার সহজ নিয়ম:</span>
            </div>
            <p className="text-[11px] text-amber-800 leading-snug">
              নিচের ছবির ওপর ২ সেকেন্ড <b>চেপে ধরে রাখুন (Long Press)</b> এবং ভেসে ওঠা অপশন থেকে <b>"Save to Photos"</b> বা <b>"Add to Photos"</b> সিলেক্ট করুন।
            </p>
            <div className="rounded-lg overflow-hidden border border-amber-300 shadow-sm max-w-[220px] mx-auto">
              <img
                src={generatedImgUrl}
                alt="Member Card Preview"
                className="w-full h-auto block select-none pointer-events-auto"
              />
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

