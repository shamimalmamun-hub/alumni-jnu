import React from 'react';
import { 
  ArrowLeft, 
  GraduationCap, 
  Landmark, 
  FileText, 
  BookmarkCheck
} from 'lucide-react';

interface AboutPageProps {
  language: 'bn' | 'en';
  onBackToHome: () => void;
  onNavigateToObjectives?: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ language, onBackToHome, onNavigateToObjectives }) => {
  return (
    <div className="w-full bg-white py-6 px-4 sm:px-8 space-y-8 font-siliguri animate-in fade-in duration-300">
      {/* Top Navigation / Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between border-b border-emerald-100 pb-4 gap-2 overflow-hidden">
        <div className="flex items-center gap-2">
          <button
            onClick={onBackToHome}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 bg-emerald-50 hover:bg-emerald-100 text-[#006a4e] rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{language === 'bn' ? 'হোম পেজে ফিরুন' : 'Back to Home'}</span>
          </button>
          {onNavigateToObjectives && (
            <button
              onClick={onNavigateToObjectives}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 bg-emerald-800 hover:bg-emerald-900 text-amber-300 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 shadow-2xs"
            >
              <span>{language === 'bn' ? 'লক্ষ্য ও উদ্দেশ্য ➔' : 'View Objectives ➔'}</span>
            </button>
          )}
        </div>
        <span className="text-[11px] sm:text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 uppercase tracking-wider truncate text-right">
          {language === 'bn' ? 'অ্যালামনাই অ্যাসোসিয়েশন পরিচিতি' : 'Alumni Association Profile'}
        </span>
      </div>

      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center justify-center p-3 bg-emerald-50 text-[#006a4e] rounded-full shadow-xs mb-1">
          <GraduationCap className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-serif-bn text-[#006a4e]">
          {language === 'bn' 
            ? 'উদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশন পরিচিতি' 
            : 'Botany Alumni Association Profile & Constitution Background'}
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 font-medium">
          {language === 'bn'
            ? 'উদ্ভিদবিজ্ঞান বিভাগ, জগন্নাথ বিশ্ববিদ্যালয়, ঢাকা'
            : 'Department of Botany, Jagannath University, Dhaka'}
        </p>
      </div>

      {/* Main Document Content Box */}
      <div className="max-w-4xl mx-auto bg-[#fafdfa] border border-emerald-200/80 rounded-2xl p-5 sm:p-8 shadow-xs space-y-8">
        
        {/* পটভূমি (Background) */}
        <section className="space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-emerald-200">
            <Landmark className="w-5 h-5 text-[#006a4e]" />
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 font-serif-bn">
              {language === 'bn' ? 'পটভূমিঃ' : 'Background:'}
            </h2>
          </div>

          <div className="space-y-4 text-sm sm:text-base text-gray-800 leading-relaxed text-justify">
            <p>
              {language === 'bn'
                ? 'জগন্নাথ বিশ্ববিদ্যালয় (সংক্ষিপ্ত: জবি) বাংলাদেশের রাজধানী ঢাকায় অবস্থিত একটি গবেষণাধর্মী সরকারি বিশ্ববিদ্যালয়। জগন্নাথ বিশ্ববিদ্যালয় শিক্ষা প্রতিষ্ঠান হিসেবে যাত্রা শুরু করে ১৮৫৮ সালে এবং ২০০৫ সালের ২০ই অক্টোবর বাংলাদেশের জাতীয় সংসদে "জগন্নাথ বিশ্ববিদ্যালয় আইন, ২০০৫" পাশের মাধ্যমে একটি পূর্ণাঙ্গ বিশ্ববিদ্যালয় হিসেবে প্রতিষ্ঠিত হয়।'
                : 'Jagannath University (JnU) is a premier public research university located in Dhaka, Bangladesh. The institution began its journey in 1858 and was established as a full-fledged university on 20 October 2005 with the enactment of the "Jagannath University Act, 2005" by the National Parliament of Bangladesh.'}
            </p>

            <p>
              {language === 'bn'
                ? 'বিভাগের স্ব-মূল্যায়নে (Self Assessment) সক্রিয় অ্যালামনাই অ্যাসোসিয়েশন থাকা অত্যাবশ্যকীয় বিবেচনায় ২০১৭ সালে বিভাগের স্বমূল্যায়ন প্রক্রিয়া শুরুর লক্ষে ১০/০৭/২০১৭ ও ০৭/০৮/২০১৭ তারিখে অনুষ্ঠিত বিভাগীয় একাডেমিক কমিটির ৬২ ও ৬৩ তম সভায় যথাক্রমে বিভাগের দুই জন ফ্যাকাল্টিকে নিয়ে অ্যালামনাই অ্যাসোসিয়েশন গঠন সংক্রান্ত আহ্বায়ক কমিটি ও সকল ফ্যাকাল্টির সমন্বয়ে উপদেষ্টা পরিষদ গঠিত হয়। জগন্নাথ বিশ্ববিদ্যালয় প্রতিষ্ঠার পর লাইফ এন্ড আর্থ সায়েন্স অনুষদের অধীনে পরিচালিত উদ্ভিদবিজ্ঞান বিভাগ থেকে ডিগ্রিপ্রাপ্ত অ্যালামনাইদের সংগঠিত করে বিভাগের শিক্ষার্থী ও উপদেষ্টাবৃন্দের সাথে অ্যালামনাইদের এবং অ্যালামনাইদের নিজেদের মধ্যে পারস্পরিক যোগাযোগ, সহযোগিতা, সম্প্রীতি ও পেশাগত দক্ষতা বৃদ্ধির লক্ষ্যে উপরোল্লিখিত আহ্বায়ক কমিটির ডাকে সাড়া দিয়ে ০৪/০৮/২০১৭ তারিখে প্রায় ৫০জন অ্যালামনাই বিভাগে একত্রিত হয়ে জগন্নাথ বিশ্ববিদ্যালয় উদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশন গঠনের সিদ্ধান্ত গ্রহণ করে। একই দিনে অ্যালামনাইদের সমন্বয়ে একটি আহ্বায়ক কমিটিও গঠিত হয়। পরবর্তীতে ৭ বছর অতিক্রান্ত হলেও আহ্বায়ক কমিটি কোনো গঠনতন্ত্র প্রণয়ন, নির্বাচনের আয়োজন এবং পুনর্মিলনী অনুষ্ঠান করতে পারেনি।'
                : 'Recognizing an active alumni association as essential for the departmental Self-Assessment process in 2017, the 62nd and 63rd meetings of the Departmental Academic Committee on 10/07/2017 and 07/08/2017 formed a convening committee comprising two faculty members and an Advisory Council with all faculty members. To unite graduates of the Department of Botany under the Faculty of Life and Earth Sciences, foster mutual collaboration, harmony, and professional development between alumni, students, and faculty advisors, approximately 50 alumni gathered at the department on 04/08/2017 and decided to establish the association. An alumni convening committee was formed on the same day. However, over the subsequent 7 years, the committee could not finalize a constitution, organize elections, or arrange a reunion.'}
            </p>

            <p>
              {language === 'bn'
                ? 'উল্লেখ্য, ১০/০২/২০২১ তারিখে বিশ্ববিদ্যালয়ের রেজিস্টার দপ্তর থেকে জানানো হয়, কেবলমাত্র জগন্নাথ বিশ্ববিদ্যালয়ের সনদধারীরাই জগন্নাথ বিশ্ববিদ্যালয় উদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশন এর সদস্য হতে পারবেন। অতঃপর দীর্ঘদিন অকার্যকর থাকার পর ৩০/০৮/২০২৪ তারিখে বিভাগের অ্যালামনাইগণ আরেকটি সাধারণ সভার আয়োজন করে নতুন আহ্বায়ক কমিটি গঠন করে। সভায় জগন্নাথ বিশ্ববিদ্যালয় উদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশন এর নতুন নাম রাখা হয় উদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশন জগন্নাথ বিশ্ববিদ্যালয়।'
                : 'Notably, on 10/02/2021, the Registrar\'s Office notified that only degree holders from Jagannath University are eligible for membership in the association. After remaining dormant for years, on 30/08/2024, alumni convened a general meeting to reform the convening committee and officially renamed the body to "Botany Alumni Association Jagannath University".'}
            </p>

            <p className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200/80 text-emerald-950 font-medium">
              {language === 'bn'
                ? 'অ্যালামনাই অ্যাসোসিয়েশন গঠন সংক্রান্ত আহ্বায়ক কমিটি, উপদেষ্টা পরিষদ ও পুনর্গঠিত অ্যালামনাই আহ্বায়ক কমিটি আলোচনা ও পর্যালোচনা করে প্রস্তুতকৃত খসড়া গঠনতন্ত্র অদ্য ২৩/১১/২০২৪ তারিখে অনুষ্ঠিত সাধারণ সভায় বিবেচনার জন্য উপস্থাপন করা হল।'
                : 'Following discussions and comprehensive reviews by the faculty convening committee, advisory council, and the restructured alumni convening committee, the draft constitution was presented for consideration at the General Meeting held on 23/11/2024.'}
            </p>
          </div>
        </section>

        {/* ১। নামকরণ (Name) */}
        <section className="space-y-3 bg-white border-2 border-emerald-100 rounded-xl p-5 sm:p-6 shadow-xs">
          <div className="flex items-center gap-2 text-[#006a4e]">
            <BookmarkCheck className="w-5 h-5 text-amber-500" />
            <h3 className="text-base sm:text-lg font-bold text-emerald-950 font-serif-bn">
              {language === 'bn' ? '১। নামকরণ :' : '1. Nomenclature / Name:'}
            </h3>
          </div>
          <div className="pl-2 sm:pl-4 text-sm sm:text-base text-gray-800 leading-relaxed space-y-1.5">
            <p>
              {language === 'bn' ? (
                <>
                  এ অ্যাসোসিয়েশনের নাম হবে <strong>উদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশন জগন্নাথ বিশ্ববিদ্যালয়</strong>; ইংরেজিতে <strong>Botany Alumni Association Jagannath University</strong>; ইংরেজি নামের সংক্ষিপ্ত রূপ হবে <strong>BAAJnU</strong>।
                </>
              ) : (
                <>
                  The official name of this association shall be <strong>উদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশন জগন্নাথ বিশ্ববিদ্যালয়</strong>; in English: <strong>Botany Alumni Association Jagannath University</strong>; with the official English acronym <strong>BAAJnU</strong>.
                </>
              )}
            </p>
          </div>
        </section>

        {/* ২। সংজ্ঞাঃ (Definitions) */}
        <section className="space-y-4 bg-white border border-emerald-100 rounded-xl p-5 sm:p-6 shadow-xs">
          <div className="flex items-center gap-2 text-[#006a4e] pb-2 border-b border-gray-100">
            <FileText className="w-5 h-5 text-[#006a4e]" />
            <h3 className="text-base sm:text-lg font-bold text-emerald-950 font-serif-bn">
              {language === 'bn' ? '২। সংজ্ঞাঃ' : '2. Definitions:'}
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 italic">
            {language === 'bn' 
              ? 'বিষয় ও প্রসঙ্গের পরিপন্থী না হলে এ গঠনতন্ত্রে—' 
              : 'Unless repugnant to the subject or context, in this constitution—'}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-100/80 flex items-start gap-2.5">
              <span className="w-6 h-6 rounded-full bg-[#006a4e] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                ক
              </span>
              <div className="text-xs sm:text-sm text-gray-800">
                <strong className="text-emerald-950">{language === 'bn' ? '"বিশ্ববিদ্যালয়"' : '"University"'}</strong> {language === 'bn' ? 'অর্থ জগন্নাথ বিশ্ববিদ্যালয়;' : 'means Jagannath University;'}
              </div>
            </div>

            <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-100/80 flex items-start gap-2.5">
              <span className="w-6 h-6 rounded-full bg-[#006a4e] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                খ
              </span>
              <div className="text-xs sm:text-sm text-gray-800">
                <strong className="text-emerald-950">{language === 'bn' ? '"বিভাগ"' : '"Department"'}</strong> {language === 'bn' ? 'অর্থ জগন্নাথ বিশ্ববিদ্যালয়ের উদ্ভিদবিজ্ঞান বিভাগ;' : 'means Department of Botany, Jagannath University;'}
              </div>
            </div>

            <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-100/80 flex items-start gap-2.5">
              <span className="w-6 h-6 rounded-full bg-[#006a4e] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                গ
              </span>
              <div className="text-xs sm:text-sm text-gray-800">
                <strong className="text-emerald-950">{language === 'bn' ? '"অ্যাসোসিয়েশন"' : '"Association"'}</strong> {language === 'bn' ? 'অর্থ উদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশন জগন্নাথ বিশ্ববিদ্যালয়;' : 'means Botany Alumni Association Jagannath University;'}
              </div>
            </div>

            <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-100/80 flex items-start gap-2.5">
              <span className="w-6 h-6 rounded-full bg-[#006a4e] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                ঘ
              </span>
              <div className="text-xs sm:text-sm text-gray-800">
                <strong className="text-emerald-950">{language === 'bn' ? '"অ্যালামনাই"' : '"Alumni"'}</strong> {language === 'bn' ? 'অর্থ উদ্ভিদবিজ্ঞান বিভাগের অ্যালামনাই;' : 'means Alumni of the Department of Botany;'}
              </div>
            </div>

            <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-100/80 flex items-start gap-2.5">
              <span className="w-6 h-6 rounded-full bg-[#006a4e] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                ঙ
              </span>
              <div className="text-xs sm:text-sm text-gray-800">
                <strong className="text-emerald-950">{language === 'bn' ? '"শিক্ষার্থী"' : '"Student"'}</strong> {language === 'bn' ? 'অর্থ চলমান শিক্ষাবর্ষে অধ্যয়নরত বিভাগের শিক্ষার্থী;' : 'means student currently enrolled in the department;'}
              </div>
            </div>

            <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-100/80 flex items-start gap-2.5">
              <span className="w-6 h-6 rounded-full bg-[#006a4e] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                চ
              </span>
              <div className="text-xs sm:text-sm text-gray-800">
                <strong className="text-emerald-950">{language === 'bn' ? '"সদস্য"' : '"Member"'}</strong> {language === 'bn' ? 'অর্থ অ্যাসোসিয়েশনের সদস্য, আজীবন সদস্য এর অন্তর্ভুক্ত হবে;' : 'means member of the association, including Life Members;'}
              </div>
            </div>

            <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-100/80 flex items-start gap-2.5">
              <span className="w-6 h-6 rounded-full bg-[#006a4e] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                ছ
              </span>
              <div className="text-xs sm:text-sm text-gray-800">
                <strong className="text-emerald-950">{language === 'bn' ? '"নির্বাচন কমিশন"' : '"Election Commission"'}</strong> {language === 'bn' ? 'অর্থ অ্যাসোসিয়েশনের নির্বাহী পরিষদ নির্বাচনের জন্য গঠিত নির্বাচন কমিশন;' : 'means Election Commission formed for Executive Council election;'}
              </div>
            </div>

            <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-100/80 flex items-start gap-2.5">
              <span className="w-6 h-6 rounded-full bg-[#006a4e] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                জ
              </span>
              <div className="text-xs sm:text-sm text-gray-800">
                <strong className="text-emerald-950">{language === 'bn' ? '"গঠনতন্ত্র"' : '"Constitution"'}</strong> {language === 'bn' ? 'অর্থ উদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশন জগন্নাথ বিশ্ববিদ্যালয়ের গঠনতন্ত্র।' : 'means the Constitution of Botany Alumni Association Jagannath University.'}
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};
