import React from 'react';
import {
  X,
  HeartHandshake,
  Users,
  Moon,
  Coins,
  Gift,
  ArrowRight,
  ShieldCheck,
  Building2,
  CheckCircle2,
  Heart,
  RefreshCw
} from 'lucide-react';

export type DonationCategoryType = 'renewal' | 'reunion' | 'iftar' | 'zakat' | 'others';

export interface DonationOption {
  id: DonationCategoryType;
  titleBn: string;
  titleEn: string;
  subtitleBn: string;
  subtitleEn: string;
  descBn: string;
  descEn: string;
  badgeBn: string;
  badgeEn: string;
  colorTheme: {
    bgLight: string;
    border: string;
    hoverBorder: string;
    iconBg: string;
    iconColor: string;
    badgeBg: string;
    badgeText: string;
    btnBg: string;
    btnHover: string;
  };
  icon: 'renewal' | 'reunion' | 'iftar' | 'zakat' | 'others';
}

export const DONATION_OPTIONS: DonationOption[] = [
  {
    id: 'renewal',
    titleBn: 'সদস্য নবায়ন ফি',
    titleEn: 'Membership Renewal Fee',
    subtitleBn: 'সাধারণ সদস্যপদ মেয়াদের বার্ষিক/দ্বিবার্ষিক নবায়ন ফি',
    subtitleEn: 'General Membership Renewal Fee',
    descBn: 'সাধারণ সদস্যপদের মেয়াদ উত্তীর্ণ হলে বা নিয়মিত সচল রাখতে সদস্য নবায়ন ফি প্রদান করুন এবং সকল সুবিধা ও ভোটাধিকার নিশ্চিত রাখুন।',
    descEn: 'Renew your active general membership to maintain voting rights, networking, and all association benefits.',
    badgeBn: 'সদস্য নবায়ন',
    badgeEn: 'Renewal Fee',
    colorTheme: {
      bgLight: 'bg-indigo-50/70',
      border: 'border-indigo-300',
      hoverBorder: 'hover:border-indigo-500',
      iconBg: 'bg-indigo-600',
      iconColor: 'text-white',
      badgeBg: 'bg-indigo-100 text-indigo-900 border-indigo-300',
      badgeText: 'text-indigo-800',
      btnBg: 'bg-indigo-700 hover:bg-indigo-800',
      btnHover: 'hover:bg-indigo-800',
    },
    icon: 'renewal',
  },
  {
    id: 'reunion',
    titleBn: 'Reunion (পুনর্মিলনী অনুদান)',
    titleEn: 'Reunion Donation',
    subtitleBn: 'বিভাগীয় বার্ষিক পুনর্মিলনী ও মিলনমেলা তহবিল',
    subtitleEn: 'Departmental Reunion & Annual Meet Fund',
    descBn: 'উদ্ভিদবিজ্ঞান অ্যালামনাইদের ঐতিহাসিক মিলনমেলা, সাংস্কৃতিক উৎসব ও সংবর্ধনা অনুষ্ঠান সফল করতে আপনার আন্তরিক অনুদান প্রদান করুন।',
    descEn: 'Support the grand reunion, cultural festival and alumni gathering of the Department of Botany, Jagannath University.',
    badgeBn: 'পুনর্মিলনী তহবিল',
    badgeEn: 'Reunion Fund',
    colorTheme: {
      bgLight: 'bg-emerald-50/70',
      border: 'border-emerald-300',
      hoverBorder: 'hover:border-emerald-500',
      iconBg: 'bg-emerald-600',
      iconColor: 'text-white',
      badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      badgeText: 'text-emerald-800',
      btnBg: 'bg-[#006a4e] hover:bg-[#00523d]',
      btnHover: 'hover:bg-emerald-700',
    },
    icon: 'reunion',
  },
  {
    id: 'iftar',
    titleBn: 'Iftar (ইফতার মাহফিল অনুদান)',
    titleEn: 'Iftar Mahfil Donation',
    subtitleBn: 'পবিত্র মাহে রমজানের ইফতার ও দোয়া মাহফিল তহবিল',
    subtitleEn: 'Annual Ramadan Alumni Iftar & Doa Fund',
    descBn: 'পবিত্র রমজান উপলক্ষে শিক্ষক, অ্যালামনাই ও অধ্যয়নরত শিক্ষার্থীদের নিয়ে আয়োজিত বার্ষিক ইফতার ও দোয়া মাহফিলে অংশগ্রহণ ও সহযোগিতা করুন।',
    descEn: 'Contribute to the annual Ramadan alumni and students collective Iftar and prayer gathering.',
    badgeBn: 'ইফতার ও দোয়া মাহফিল',
    badgeEn: 'Iftar & Prayer Fund',
    colorTheme: {
      bgLight: 'bg-amber-50/70',
      border: 'border-amber-300',
      hoverBorder: 'hover:border-amber-500',
      iconBg: 'bg-amber-500',
      iconColor: 'text-white',
      badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
      badgeText: 'text-amber-800',
      btnBg: 'bg-amber-600 hover:bg-amber-700',
      btnHover: 'hover:bg-amber-700',
    },
    icon: 'iftar',
  },
  {
    id: 'zakat',
    titleBn: 'Zakat (যাকাত তহবিল)',
    titleEn: 'Zakat Fund Donation',
    subtitleBn: 'অসচ্ছল শিক্ষার্থী ও বিপদগ্রস্ত অ্যালামনাই সাহায্য তহবিল',
    subtitleEn: 'Needy Students & Alumni Welfare Zakat Fund',
    descBn: 'উদ্ভিদবিজ্ঞান বিভাগের মেধাবী অথচ অসচ্ছল শিক্ষার্থী ও জরুরি চিকিৎসা প্রয়োজনে বিপদগ্রস্ত অ্যালামনাইদের জন্য শরীয়াহসম্মত যাকাত তহবিল।',
    descEn: 'Dedicated Shariah-compliant Zakat fund for financial grants to underprivileged botany students and distressed alumni.',
    badgeBn: '১০০% যাকাত নীতিমালা',
    badgeEn: '100% Shariah Compliant',
    colorTheme: {
      bgLight: 'bg-teal-50/70',
      border: 'border-teal-300',
      hoverBorder: 'hover:border-teal-500',
      iconBg: 'bg-teal-600',
      iconColor: 'text-white',
      badgeBg: 'bg-teal-100 text-teal-900 border-teal-300',
      badgeText: 'text-teal-800',
      btnBg: 'bg-teal-700 hover:bg-teal-800',
      btnHover: 'hover:bg-teal-800',
    },
    icon: 'zakat',
  },
  {
    id: 'others',
    titleBn: 'Others (অন্যান্য অনুদান)',
    titleEn: 'Others / General Welfare Fund',
    subtitleBn: 'বিভাগীয় উন্নয়ন, সেমিনার লাইব্রেরি ও সার্বিক কল্যাণ তহবিল',
    subtitleEn: 'Departmental Research, Garden & General Fund',
    descBn: 'বোটানিক্যাল গার্ডেন সংরক্ষণ, স্মার্ট ক্লাসরুম, সেমিনার লাইব্রেরি উন্নয়ন ও অ্যালামনাই অ্যাসোসিয়েশনের সাধারণ তহবিলে যেকোনো অনুদান।',
    descEn: 'Support botanical research, departmental infrastructure, garden conservation and ongoing alumni welfare projects.',
    badgeBn: 'সার্বিক উন্নয়ন তহবিল',
    badgeEn: 'General Welfare',
    colorTheme: {
      bgLight: 'bg-blue-50/70',
      border: 'border-blue-300',
      hoverBorder: 'hover:border-blue-500',
      iconBg: 'bg-blue-600',
      iconColor: 'text-white',
      badgeBg: 'bg-blue-100 text-blue-900 border-blue-300',
      badgeText: 'text-blue-800',
      btnBg: 'bg-blue-700 hover:bg-blue-800',
      btnHover: 'hover:bg-blue-800',
    },
    icon: 'others',
  },
];

interface DonationSelectionModalProps {
  isOpen: boolean;
  language: 'bn' | 'en';
  onClose: () => void;
  onSelectOption: (optionId: DonationCategoryType) => void;
}

export const DonationSelectionModal: React.FC<DonationSelectionModalProps> = ({
  isOpen,
  language,
  onClose,
  onSelectOption,
}) => {
  if (!isOpen) return null;

  const renderIcon = (type: string) => {
    switch (type) {
      case 'renewal':
        return <RefreshCw className="w-6 h-6" />;
      case 'reunion':
        return <Users className="w-6 h-6" />;
      case 'iftar':
        return <Moon className="w-6 h-6" />;
      case 'zakat':
        return <Coins className="w-6 h-6" />;
      case 'others':
      default:
        return <Gift className="w-6 h-6" />;
    }
  };

  return (
    <div
      id="donation-selection-modal"
      className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border-2 border-emerald-600 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200 font-siliguri"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-[#004d38] via-[#006a4e] to-[#004d38] text-white p-4 sm:p-5 flex items-center justify-between border-b border-emerald-500/40 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-400/20 border border-amber-300/40 flex items-center justify-center text-amber-300 shrink-0 shadow-inner">
              <HeartHandshake className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-2xl font-black tracking-tight text-white font-serif-bn">
                  {language === 'bn' ? 'অনুদানের খাত নির্বাচন করুন (DONATION)' : 'Select Donation Purpose (DONATION)'}
                </h2>
                <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400 text-emerald-950">
                  {language === 'bn' ? '৫টি অপশন' : '5 Options'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-emerald-100/90 font-medium">
                {language === 'bn'
                  ? 'উদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশনের কোন খাতে অনুদান প্রদান করতে চান তা বেছে নিন'
                  : 'Choose which alumni fund you would like to contribute towards'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - 4 Distinct Options in a 2x2 Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5 bg-gradient-to-b from-[#f8faf8] to-white flex-1 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4.5">
            {DONATION_OPTIONS.map((opt) => {
              const title = language === 'bn' ? opt.titleBn : opt.titleEn;
              const subtitle = language === 'bn' ? opt.subtitleBn : opt.subtitleEn;
              const desc = language === 'bn' ? opt.descBn : opt.descEn;
              const badge = language === 'bn' ? opt.badgeBn : opt.badgeEn;

              return (
                <div
                  key={opt.id}
                  id={`donation-option-card-${opt.id}`}
                  onClick={() => onSelectOption(opt.id)}
                  className={`relative p-4 sm:p-5 rounded-2xl border-2 ${opt.colorTheme.border} ${opt.colorTheme.bgLight} ${opt.colorTheme.hoverBorder} hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between group hover:-translate-y-0.5`}
                >
                  <div className="space-y-3">
                    {/* Top Row: Icon + Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-11 h-11 rounded-xl ${opt.colorTheme.iconBg} ${opt.colorTheme.iconColor} flex items-center justify-center shadow-md group-hover:scale-105 transition-transform shrink-0`}
                        >
                          {renderIcon(opt.icon)}
                        </div>
                        <div>
                          <h3 className="text-base sm:text-lg font-black text-gray-900 leading-tight group-hover:text-[#006a4e] transition-colors">
                            {title}
                          </h3>
                          <p className="text-[11px] sm:text-xs font-semibold text-emerald-800 line-clamp-1">
                            {subtitle}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold border ${opt.colorTheme.badgeBg} shrink-0`}
                      >
                        {badge}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-xs sm:text-[13px] text-gray-700 leading-relaxed pt-1">
                      {desc}
                    </p>

                    {/* Zakat Card Image Banner */}
                    {opt.id === 'zakat' && (
                      <div className="mt-2 rounded-xl overflow-hidden border-2 border-teal-400/80 shadow-xs relative">
                        <img
                          src="/zakat-1.jpeg"
                          alt="Zakat Fund (যাকাত তহবিল)"
                          className="w-full h-28 sm:h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-2 right-2 bg-emerald-950/85 text-amber-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-amber-300/40 shadow-xs">
                          {language === 'bn' ? '১০০% যাকাত' : '100% Zakat'}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action CTA Button */}
                  <div className="mt-4 pt-3 border-t border-gray-200/80 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-gray-600">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{language === 'bn' ? 'যেকোনো পরিমাণ অনুদান' : 'Any custom amount'}</span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectOption(opt.id);
                      }}
                      className={`${opt.colorTheme.btnBg} text-white font-extrabold text-xs sm:text-sm px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm group-hover:shadow-md transition-all cursor-pointer`}
                    >
                      <span>{language === 'bn' ? 'অনুদান দিন' : 'Donate Now'}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Secure Payment & Trust Banner */}
          <div className="bg-emerald-900/5 border border-emerald-600/20 rounded-xl p-3 sm:p-3.5 flex items-center justify-between flex-wrap gap-2 text-xs text-gray-700">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#006a4e] shrink-0" />
              <span className="font-semibold text-emerald-950">
                {language === 'bn'
                  ? 'বিকাশ, নগদ, রকেট ও ব্যাংক একাউন্টের মাধ্যমে সুরক্ষিতভাবে অনুদান প্রদান ও মানি রসিদ সংগ্রহ করতে পারবেন।'
                  : 'Pay securely via bKash, Nagad, Rocket or Bank and instantly obtain money receipt.'}
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-gray-500 hover:text-gray-800 underline font-semibold ml-auto cursor-pointer"
            >
              {language === 'bn' ? 'পরে দান করব (বন্ধ করুন)' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
