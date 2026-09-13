import React from 'react';
import { BookOpen, Shield, Users, Award, CheckCircle2, ArrowLeft, GraduationCap, Library, Landmark, Sparkles } from 'lucide-react';
import { FAQSection } from '../FAQSection';

interface AboutPageProps {
  language: 'bn' | 'en';
  onBackToHome: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ language, onBackToHome }) => {
  return (
    <div className="w-full bg-white py-6 px-4 sm:px-8 space-y-8 font-siliguri animate-in fade-in duration-300">
      {/* Top Navigation / Breadcrumb */}
      <div className="flex items-center justify-between border-b border-emerald-100 pb-4 gap-2 overflow-hidden">
        <button
          onClick={onBackToHome}
          className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 bg-emerald-50 hover:bg-emerald-100 text-[#006a4e] rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === 'bn' ? 'হোম পেজে ফিরুন' : 'Back to Home'}</span>
        </button>
        <span className="text-[11px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider truncate text-right">
          {language === 'bn' ? 'উদ্ভিদবিজ্ঞান অ্যালামনাই' : 'Botany Alumni'}
        </span>
      </div>

      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center justify-center p-3 bg-emerald-50 text-[#006a4e] rounded-full shadow-xs mb-1">
          <GraduationCap className="w-7 h-7" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-serif-bn">
          {language === 'bn' ? 'অ্যালামনাই অ্যাসোসিয়েশন পরিচিতি, ইতিহাস ও লক্ষ্য' : 'Alumni Association Profile, History & Mission'}
        </h1>
        <p className="text-sm text-gray-600 leading-relaxed">
          {language === 'bn'
            ? 'জগন্নাথ বিশ্ববিদ্যালয়, ঢাকা এর উদ্ভিদবিজ্ঞান বিভাগের প্রাক্তন ও বর্তমান শিক্ষার্থীদের একতাবদ্ধ প্লাটফর্ম — ভ্রাতৃত্ব, পেশাগত নেটওয়ার্কিং ও সামাজিক উন্নয়নে নিবেদিত।'
            : 'A unified platform of past and present botany graduates of Jagannath University, Dhaka — dedicated to fraternity, professional networking, and botanical research development.'}
        </p>
      </div>

      {/* Section 1: Association History & Mission */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        <div className="bg-[#fcfdfd] border border-emerald-100 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3 text-[#006a4e]">
            <Landmark className="w-6 h-6" />
            <h2 className="text-lg font-bold">
              {language === 'bn' ? 'অ্যালামনাই অ্যাসোসিয়েশনের প্রেক্ষাপট ও ঐতিহ্য' : 'Heritage & Context of Alumni Association'}
            </h2>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">
            {language === 'bn'
              ? 'ঐতিহ্যবাহী জগন্নাথ বিশ্ববিদ্যালয়ের উদ্ভিদবিজ্ঞান বিভাগ থেকে উত্তীর্ণ দেশ-বিদেশে প্রতিষ্ঠিত প্রাক্তন শিক্ষার্থীদের সুদৃঢ় মেলবন্ধন গড়ে তোলার প্রত্যয়ে ২০১৭ সালে "উদ্ভিদবিজ্ঞান বিভাগ অ্যালামনাই অ্যাসোসিয়েশন" আনুষ্ঠানিকভাবে প্রতিষ্ঠিত হয়।'
              : 'The Department of Botany Alumni Association was officially established in 2017 to build a strong, lifelong bond among graduates of Jagannath University serving across Bangladesh and the world.'}
          </p>
          <p className="text-sm text-gray-700 leading-relaxed">
            {language === 'bn'
              ? 'এই অ্যাসোসিয়েশন নিয়মিত পুনর্মিলনী উৎসব, প্রাক্তন-বর্তমান মেলবন্ধন, সেমিনার লাইব্রেরির আধুনিকায়ন, গবেষণা অনুদান এবং জুনিয়র শিক্ষার্থীদের জন্য ক্যারিয়ার মেন্টরশিপ ও শিক্ষা বৃত্তি পরিচালনা করে আসছে।'
              : 'The association regularly organizes reunions, provides career mentorship and scholarships for current students, modernizes the departmental seminar library, and supports botanical research.'}
          </p>
        </div>

        <div className="bg-[#fcfdfd] border border-emerald-100 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3 text-[#006a4e]">
            <Award className="w-6 h-6" />
            <h2 className="text-lg font-bold">
              {language === 'bn' ? 'অ্যাসোসিয়েশনের মূল লক্ষ্য ও উদ্দেশ্যসমূহ' : 'Key Goals & Objectives'}
            </h2>
          </div>
          <ul className="space-y-3 text-sm text-gray-700">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#006a4e] shrink-0 mt-1" />
              <span>
                {language === 'bn'
                  ? 'দেশ-বিদেশে কর্মরত সকল ব্যাচের উদ্ভিদবিজ্ঞান অ্যালামনাইদের ঐক্যবদ্ধ ডাটাবেজ ও যোগাযোগ নেটওয়ার্ক গঠন।'
                  : 'Establishing a comprehensive alumni database and networking platform for all batches.'}
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#006a4e] shrink-0 mt-1" />
              <span>
                {language === 'bn'
                  ? 'বিভাগের অস্বচ্ছল ও মেধাবী শিক্ষার্থীদের এককালীন মেধা বৃত্তি ও উচ্চশিক্ষা সহায়তা প্রদান।'
                  : 'Providing scholarships and higher education grants to meritorious and underprivileged students.'}
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#006a4e] shrink-0 mt-1" />
              <span>
                {language === 'bn'
                  ? 'বিসিএস, সরকারি-বেসরকারি চাকরি ও আন্তর্জাতিক উচ্চশিক্ষা বিষয়ে নিয়মিত ক্যারিয়ার গাইডলাইন সেশন আয়োজন।'
                  : 'Organizing BCS, corporate job coaching, and international scholarship mentoring sessions.'}
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#006a4e] shrink-0 mt-1" />
              <span>
                {language === 'bn'
                  ? 'বার্ষিক পুনর্মিলনী, গুণীজন সংবর্ধনা ও উদ্ভিদবিজ্ঞান মনোগ্রাফ প্রকাশনায় সার্বিক সহযোগিতা।'
                  : 'Organizing annual reunions, honoring distinguished alumni, and supporting botanical publications.'}
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Section 2: Department & University Heritage */}
      <div className="bg-emerald-900 text-white rounded-2xl p-6 sm:p-8 space-y-6 shadow-lg">
        <div className="flex items-center gap-3">
          <Library className="w-7 h-7 text-amber-300" />
          <h3 className="text-xl font-bold font-serif-bn text-amber-200">
            {language === 'bn' ? 'জগন্নাথ বিশ্ববিদ্যালয় উদ্ভিদবিজ্ঞান পরিবারের গৌরবময় ঐতিহ্য' : 'Proud Heritage of Botany Family at Jagannath University'}
          </h3>
        </div>
        <p className="text-sm text-emerald-100 leading-relaxed">
          {language === 'bn'
            ? 'জগন্নাথ বিশ্ববিদ্যালয় বাংলাদেশের অন্যতম ঐতিহ্যবাহী উচ্চশিক্ষা প্রতিষ্ঠান। এখানকার উদ্ভিদবিজ্ঞান বিভাগের প্রাক্তন শিক্ষার্থীরা আজ বাংলাদেশ সিভিল সার্ভিস (বিসিএস), বিশ্ববিদ্যালয় শিক্ষকতা, আন্তর্জাতিক গবেষণা সংস্থা ও বিভিন্ন সংস্থায় স্বমহিমায় উজ্জ্বল। অ্যালামনাই অ্যাসোসিয়েশন এই ঐতিহ্যকে উত্তরোত্তর সমৃদ্ধ করতে নিবেদিতপ্রাণ।'
            : 'Jagannath University is one of the premier institutions of higher learning in Bangladesh. Botany alumni have distinguished themselves in the Bangladesh Civil Service (BCS), university academia, research organizations, and biotechnology field.'}
        </p>
      </div>

      {/* Section 3: FAQ Component Integration */}
      <FAQSection language={language} />
    </div>
  );
};
