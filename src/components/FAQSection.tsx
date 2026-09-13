import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Sparkles, BookOpen, Users, Globe } from 'lucide-react';

interface FAQItem {
  id: string;
  questionBn: string;
  questionEn: string;
  answerBn: string;
  answerEn: string;
  category: 'student' | 'alumni' | 'general' | 'reunion';
}

const FAQ_LIST: FAQItem[] = [
  {
    id: 'faq-1',
    questionBn: 'জগন্নাথ বিশ্ববিদ্যালয় উদ্ভিদবিজ্ঞান বিভাগ অ্যালামনাই অ্যাসোসিয়েশনের সদস্য হতে কারা যোগ্য?',
    questionEn: 'Who is eligible to become a member of the Botany Department Alumni Association?',
    answerBn: 'জগন্নাথ বিশ্ববিদ্যালয়ের উদ্ভিদবিজ্ঞান বিভাগ থেকে স্নাতক (সম্মান), স্নাতকোত্তর বা উচ্চতর ডিগ্রিতে উত্তীর্ণ সকল প্রাক্তন শিক্ষার্থী এবং বর্তমান বিভাগীয় সম্মানিত শিক্ষকবৃন্দ অ্যালামনাই অ্যাসোসিয়েশনের সদস্য হওয়ার যোগ্য।',
    answerEn: 'All graduates (B.Sc Honours/M.Sc/M.Phil/Ph.D) from the Department of Botany, Jagannath University, and honorable faculty members are eligible to become members.',
    category: 'alumni'
  },
  {
    id: 'faq-2',
    questionBn: 'অ্যালামনাই পোর্টালে অনলাইন নিবন্ধন ও মেম্বারশিপ ফি জমা দেওয়ার প্রক্রিয়া কী?',
    questionEn: 'What is the process for online registration and membership fee submission on the alumni portal?',
    answerBn: 'পোর্টালে "সদস্য নিবন্ধন" ফরম পূরণ করে সাবমিট করতে হবে। এরপর প্রদত্ত বিকাশ/নগদ বা ব্যাংক অ্যাকাউন্টে নির্দিষ্ট রেজিস্ট্রেশন ফি প্রদান করে ট্রানজেকশন আইডি (TrxID) ফরমের সাথে যুক্ত করতে হবে।',
    answerEn: 'Fill out the "Membership Registration" form on the portal, pay the required registration fee via bKash/Nagad or bank, and submit the Transaction ID (TrxID).',
    category: 'alumni'
  },
  {
    id: 'faq-3',
    questionBn: 'বার্ষিক পুনর্মিলনী ও উৎসবে অংশগ্রহণের জন্য কীভাবে নিবন্ধন করব?',
    questionEn: 'How do I register for participation in the Annual Reunion & Festival?',
    answerBn: 'পুনর্মিলনীর নির্ধারিত তারিখের পূর্বে পোর্টালে গিয়ে ব্যাচ, পেমেন্ট ও যোগাযোগের তথ্য দিয়ে রেজিস্ট্রেশন সম্পন্ন করতে হবে। সফল রেজিস্ট্রেশনের পর ডিজিটাল পাস ও আমন্ত্রণপত্র সংগ্রহ করা যাবে।',
    answerEn: 'Complete registration on the portal prior to the reunion deadline by providing batch, payment, and contact details to receive your digital entry pass.',
    category: 'reunion'
  },
  {
    id: 'faq-4',
    questionBn: 'ডিজিটাল সদস্য পরিচয়পত্র (Alumni ID Card) কীভাবে ডাউনলোড বা সংগ্রহ করব?',
    questionEn: 'How can I download or obtain my digital Alumni ID Card?',
    answerBn: 'সদস্য হিসেবে সফলভাবে নিবন্ধন ও প্রশাসন কর্তৃক অনুমোদন পাওয়ার পর, পোর্টালে গিয়ে আপনার ফোন নম্বর বা রোল দিয়ে ডিজিটাল মেম্বারশিপ আইডি কার্ড সহজে ডাউনলোড বা প্রিন্ট করতে পারবেন।',
    answerEn: 'Once your registration is verified, you can download or print your digital membership ID card directly from the portal.',
    category: 'alumni'
  },
  {
    id: 'faq-5',
    questionBn: 'অ্যালামনাই কল্যাণ তহবিল থেকে অস্বচ্ছল ও মেধাবী শিক্ষার্থীদের কীভাবে সহায়তা করা হয়?',
    questionEn: 'How are needy and meritorious students supported by the Alumni Welfare Trust?',
    answerBn: 'অ্যালামনাই অ্যাসোসিয়েশনের কল্যাণ তহবিল থেকে জগন্নাথ বিশ্ববিদ্যালয়ের উদ্ভিদবিজ্ঞান বিভাগে বর্তমান অধ্যয়নরত অস্বচ্ছল ও মেধাবী শিক্ষার্থীদের এককালীন শিক্ষাবৃত্তি ও গবেষণা সহায়তা প্রদান করা হয়।',
    answerEn: 'The Alumni Welfare Trust provides educational scholarships and research assistance to deserving students currently studying in the Botany Department.',
    category: 'general'
  },
  {
    id: 'faq-6',
    questionBn: 'ক্যারিয়ার ও উচ্চশিক্ষা মেন্টরশিপ কার্যক্রমে প্রাক্তন শিক্ষার্থীরা কীভাবে অংশ নিতে পারেন?',
    questionEn: 'How can alumni participate in career and higher study mentorship programs?',
    answerBn: 'প্রতিষ্ঠিত ও পেশাজীবী প্রাক্তন শিক্ষার্থীরা (বিসিএস কর্মকর্তা, বিজ্ঞানী, গবেষক, শিক্ষক ও করপোরেট পেশাজীবীগণ) বিভাগীয় শিক্ষার্থীদের ক্যারিয়ার গাইডলাইন ও বিদেশে উচ্চশিক্ষা মেন্টরশিপ প্রোগ্রামে মেন্টর হিসেবে অংশ নিতে পারেন।',
    answerEn: 'Successful alumni (BCS cadres, scientists, researchers, educators, corporate professionals) can voluntarily join as mentors in career guidance and higher studies counseling.',
    category: 'alumni'
  }
];

interface FAQSectionProps {
  language: 'bn' | 'en';
}

export const FAQSection: React.FC<FAQSectionProps> = ({ language }) => {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggleAccordion = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className="w-full bg-gradient-to-b from-[#f4faf6] to-[#edf7f0] border border-[#c2e2cc] rounded-2xl p-5 sm:p-8 space-y-6 shadow-sm font-siliguri">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-emerald-200/60 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#006a4e] text-white rounded-2xl shadow-sm">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full">
                {language === 'bn' ? 'সহায়িকা' : 'Help Desk'}
              </span>
            </div>
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900 font-serif-bn mt-1">
              {language === 'bn' ? 'সাধারণ জিজ্ঞাসা ও প্রশ্নোত্তর (FAQ)' : 'Frequently Asked Questions (FAQ)'}
            </h2>
            <p className="text-xs sm:text-sm text-gray-600">
              {language === 'bn'
                ? 'শিক্ষার্থী ও প্রাক্তন শিক্ষার্থীদের জন্য বিভাগীয় গুরুত্বপূর্ণ তথ্যাবলী ও নির্দেশিকা'
                : 'Essential guidelines and queries for students and alumni'}
            </p>
          </div>
        </div>
      </div>

      {/* Accordion Cards */}
      <div className="space-y-3.5">
        {FAQ_LIST.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-xs sm:text-sm bg-white rounded-xl border border-emerald-100">
            {language === 'bn' ? 'কোনো সম্পর্কিত প্রশ্ন পাওয়া যায়নি।' : 'No matching questions found.'}
          </div>
        ) : (
          FAQ_LIST.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className={`bg-white border rounded-2xl transition-all overflow-hidden shadow-2xs ${
                  isOpen ? 'border-[#006a4e] ring-2 ring-emerald-500/10 shadow-md' : 'border-emerald-100 hover:border-emerald-300'
                }`}
              >
                <button
                  onClick={() => toggleAccordion(faq.id)}
                  className="w-full px-5 py-4 flex items-center justify-between text-left gap-4 cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full shrink-0 transition-colors ${isOpen ? 'bg-[#006a4e]' : 'bg-emerald-300 group-hover:bg-[#006a4e]'}`} />
                    <span className="font-bold text-gray-900 text-xs sm:text-sm group-hover:text-[#006a4e] transition-colors">
                      {language === 'bn' ? faq.questionBn : faq.questionEn}
                    </span>
                  </div>
                  <div className={`p-1.5 rounded-full shrink-0 transition-transform duration-200 ${isOpen ? 'bg-emerald-100 text-[#006a4e] rotate-180' : 'bg-gray-100 text-gray-500 group-hover:bg-emerald-50 group-hover:text-[#006a4e]'}`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-2 text-xs sm:text-sm text-gray-700 leading-relaxed border-t border-emerald-50 bg-emerald-50/30 animate-in fade-in duration-200">
                    <div className="pl-5 border-l-2 border-[#006a4e] my-1">
                      {language === 'bn' ? faq.answerBn : faq.answerEn}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
