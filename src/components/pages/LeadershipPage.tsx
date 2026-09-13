import React from 'react';
import { Users, Award, Shield, ArrowLeft, GraduationCap, BookOpen, Library, CheckCircle } from 'lucide-react';
import { AdviserCard } from '../AdviserCard';
import { SecretaryCard } from '../SecretaryCard';
import { GeneralSecretaryCard } from '../GeneralSecretaryCard';
import { TreasurerCard } from '../TreasurerCard';

interface LeadershipPageProps {
  language: 'bn' | 'en';
  onBackToHome: () => void;
  onOpenSpeechModal: (person: 'adviser' | 'secretary' | 'general_secretary' | 'treasurer' | 'paurashava_president' | 'paurashava_general_secretary') => void;
}

export const LeadershipPage: React.FC<LeadershipPageProps> = ({ language, onBackToHome, onOpenSpeechModal }) => {
  return (
    <div className="w-full bg-white py-6 px-4 sm:px-8 space-y-8 font-siliguri animate-in fade-in duration-300">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between border-b border-emerald-100 pb-4 gap-2 overflow-hidden">
        <button
          onClick={onBackToHome}
          className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 bg-emerald-50 hover:bg-emerald-100 text-[#006a4e] rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === 'bn' ? 'হোম পেজে ফিরুন' : 'Back to Home'}</span>
        </button>
        <span className="text-[11px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider truncate text-right">
          {language === 'bn' ? 'অ্যালামনাই কার্যনির্বাহী পরিষদ' : 'Alumni Executive Council'}
        </span>
      </div>

      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center justify-center p-3 bg-emerald-50 text-[#006a4e] rounded-full shadow-xs mb-1">
          <GraduationCap className="w-7 h-7" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-serif-bn">
          {language === 'bn' ? 'অ্যালামনাই অ্যাসোসিয়েশন কার্যনির্বাহী নেতৃবৃন্দ' : 'Alumni Association Executive Leaders'}
        </h1>
        <p className="text-sm text-gray-600">
          {language === 'bn'
            ? 'উদ্ভিদবিজ্ঞান বিভাগ অ্যালামনাই অ্যাসোসিয়েশন, জগন্নাথ বিশ্ববিদ্যালয় এর সম্মানিত সভাপতি, সাধারণ সম্পাদক, কোষাধ্যক্ষ ও উপদেষ্টা পরিষদ।'
            : 'Honorable President, General Secretary, Treasurer and Advisors of Botany Department Alumni Association, Jagannath University.'}
        </p>
      </div>

      {/* Leadership Grid: President, General Secretary, Treasurer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        <SecretaryCard language={language} onOpenSpeechModal={() => onOpenSpeechModal('secretary')} />
        <GeneralSecretaryCard language={language} onOpenSpeechModal={() => onOpenSpeechModal('general_secretary')} />
        <TreasurerCard language={language} onOpenSpeechModal={() => onOpenSpeechModal('treasurer')} />
      </div>

      {/* Chief Patron / Advisor */}
      <div className="max-w-xl mx-auto pt-2">
        <AdviserCard language={language} onOpenSpeechModal={() => onOpenSpeechModal('adviser')} />
      </div>

      {/* Academic Wings / Committees Section */}
      <div className="bg-[#fcfdfd] border border-emerald-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex items-center gap-3 text-[#006a4e]">
          <BookOpen className="w-6 h-6" />
          <h3 className="text-lg font-bold font-serif-bn">
            {language === 'bn' ? 'অ্যালামনাই অ্যাসোসিয়েশন সেল ও উপ-কমিটি' : 'Alumni Association Sub-Committees & Cells'}
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-2xs space-y-1">
            <h4 className="font-bold text-[#006a4e]">{language === 'bn' ? 'পুনর্মিলনী ও বার্ষিক সম্মেলন কমিটি' : 'Reunion & Convention Committee'}</h4>
            <p className="text-xs text-gray-600">{language === 'bn' ? 'মহোৎসব আয়োজন, ভেন্যু ব্যবস্থাপনা ও অভ্যর্থনা' : 'Event planning, venue logistics & reception'}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-2xs space-y-1">
            <h4 className="font-bold text-[#006a4e]">{language === 'bn' ? 'সদস্য নিবন্ধন ও তথ্যপ্রযুক্তি সেল' : 'Membership & IT Database Cell'}</h4>
            <p className="text-xs text-gray-600">{language === 'bn' ? 'অনলাইন সদস্য তালিকা, ব্যাচ ডাটাবেজ ও আইডি কার্ড' : 'Online alumni directory, batch records & ID card'}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-2xs space-y-1">
            <h4 className="font-bold text-[#006a4e]">{language === 'bn' ? 'শিক্ষা ও মেধা বৃত্তি কল্যাণ তহবিল' : 'Education Scholarship & Welfare Trust'}</h4>
            <p className="text-xs text-gray-600">{language === 'bn' ? 'মেধাবী ও অসচ্ছল শিক্ষার্থীদের আর্থিক সহায়তা' : 'Scholarship support for needy students'}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-2xs space-y-1">
            <h4 className="font-bold text-[#006a4e]">{language === 'bn' ? 'প্রচার, প্রকাশনা ও স্মরণিকা সেল' : 'Media, Publication & Souvenir Cell'}</h4>
            <p className="text-xs text-gray-600">{language === 'bn' ? 'স্মরণিকা প্রকাশ, নিউজলেটার ও মিডিয়া প্রচার' : 'Souvenir magazine & digital media release'}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-2xs space-y-1">
            <h4 className="font-bold text-[#006a4e]">{language === 'bn' ? 'ক্যারিয়ার নেটওয়ার্ক ও জব ফোরাম' : 'Career Networking & Mentorship Wing'}</h4>
            <p className="text-xs text-gray-600">{language === 'bn' ? 'বিসিএস ও চাকরির প্রস্তুতিমূলক দিকনির্দেশনা' : 'BCS & job placement support for fresh graduates'}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-2xs space-y-1">
            <h4 className="font-bold text-[#006a4e]">{language === 'bn' ? 'সেমিনার উন্নয়ন ও বোটানিক্যাল গবেষণা সেল' : 'Seminar Development & Research Cell'}</h4>
            <p className="text-xs text-gray-600">{language === 'bn' ? 'বিভাগীয় লাইব্রেরি সমৃদ্ধকরণ ও গবেষণা অনুদান' : 'Library enhancement & research grant supervision'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
