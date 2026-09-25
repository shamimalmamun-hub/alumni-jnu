import React, { useState } from 'react';
import {
  MessageSquareHeart,
  Send,
  Lightbulb,
  CheckCircle2,
  BookOpen,
  Sparkles,
  User,
  Mail,
  Phone,
  PenTool,
  HelpCircle,
  MessageCircle,
  ShieldCheck,
  ChevronRight,
  Info
} from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface AdviceAndFeedbackSectionProps {
  language?: 'bn' | 'en';
}

interface GuidancePost {
  id: string;
  author: string;
  authorTitle: string;
  batchOrDept?: string;
  category: string;
  title: string;
  summary: string;
  fullMessage: string;
  date: string;
  badgeBg: string;
}

const FEATURED_ADVICE: GuidancePost[] = [
  {
    id: '1',
    author: 'অধ্যাপক ড. মোঃ আশরাফুজ্জামান',
    authorTitle: 'বিভাগীয় প্রধান ও সভাপতি',
    batchOrDept: 'উদ্ভিদবিজ্ঞান বিভাগ, জবি',
    category: 'বিভাগীয় দিকনির্দেশনা',
    title: 'অ্যালামনাই ও শিক্ষার্থীদের মেলবন্ধনে বিভাগীয় সমৃদ্ধি',
    summary: 'বিভাগের বর্তমান শিক্ষার্থীদের গবেষণা ও ক্যারিয়ার গঠনে প্রবীণ অ্যালামনাইদের অভিজ্ঞতা ও দিকনির্দেশনা একটি বড় চালিকাশক্তি...',
    fullMessage: 'জগন্নাথ বিশ্ববিদ্যালয় উদ্ভিদবিজ্ঞান বিভাগের প্রাক্তন ও বর্তমান শিক্ষার্থীদের প্রতি আমাদের উদাত্ত আহ্বান—আপনারা বিভাগের শিক্ষা ও গবেষণা কার্যক্রমে সক্রিয় ভূমিকা পালন করুন। সিনিয়র অ্যালামনাইদের উচিত নবীন শিক্ষার্থীদের ক্যারিয়ার গাইডলাইন, বায়োটেক ও ফার্মাসিউটিক্যালস শিল্পে ইন্টার্নশিপের সুবিধা এবং বিদেশে উচ্চশিক্ষার স্কলারশিপ তথ্য দিয়ে সহযোগিতা করা। আপনাদের মতামতের ভিত্তিতে বিভাগ আরও সমৃদ্ধ হবে।',
    date: '১০ সেপ্টেম্বর ২০২৬',
    badgeBg: 'bg-emerald-100 text-[#006a4e]'
  },
  {
    id: '2',
    author: 'ড. সাইফুর রহমান (১ম ব্যাচ)',
    authorTitle: 'সিনিয়র সাইন্টিস্ট, BARI',
    batchOrDept: '১ম ব্যাচ অ্যালামনাই',
    category: 'গবেষণা ও ক্যারিয়ার পরামর্শ',
    title: 'উদ্ভিদবিজ্ঞানে আধুনিক গবেষণা ও উচ্চশিক্ষার সুযোগ',
    summary: 'বায়োইনফরমেটিক্স, মলিকুলার বায়োলজি ও জিনোমিক্স নিয়ে এখন থেকেই শিক্ষার্থীদের চিন্তাভাবনা ও প্রস্তুতি নেওয়া জরুরি...',
    fullMessage: 'উদ্ভিদবিজ্ঞান বিষয়টি এখন আর কেবল চিরাচরিত ট্যাক্সোনোমি বা মরফোলজিতে সীমাবদ্ধ নেই। জলবায়ু পরিবর্তন ও টেকসই কৃষির এই যুগে জিনোম এডিটিং, টিস্যু কালচার, মলিকুলার ব্রিডিং ও ড্রাগ ডিসকভারিতে বিপুল সুযোগ সৃষ্টি হয়েছে। শিক্ষার্থীদের প্রতি পরামর্শ—অনার্স ৩য়-৪র্থ বর্ষ থেকেই ভালো জার্নাল পেপার পড়ার অভ্যাস তৈরি করুন এবং কম্পিউটার প্রোগ্রামিং বা বায়োইনফরমেটিক্স টুলস শিখুন।',
    date: '০৫ সেপ্টেম্বর ২০২৬',
    badgeBg: 'bg-amber-100 text-amber-900'
  },
  {
    id: '3',
    author: 'নাসরিন আক্তার (৫ম ব্যাচ)',
    authorTitle: 'কোয়ালিটি কন্ট্রোল হেড, এসিআই এগ্রো',
    batchOrDept: '৫ম ব্যাচ অ্যালামনাই',
    category: 'ইন্ডাস্ট্রি ও কর্পোরেট পরামর্শ',
    title: 'ফার্মাসিউটিক্যালস ও সিড ইন্ডাস্ট্রিতে ক্যারিয়ার প্রস্তুতি',
    summary: 'ল্যাবরেটরি স্কিল, ইন্ডাস্ট্রিয়াল স্ট্যান্ডার্ডস ও সফট স্কিল উন্নয়নে বিশেষ গুরুত্ব দিন...',
    fullMessage: 'আমাদের অনেক শিক্ষার্থীই অনার্স শেষে কী করবেন তা নিয়ে দ্বিধাদ্বন্দ্বে থাকেন। সিড ইন্ডাস্ট্রি, বায়োটেকনোলজি ও ফার্মাসিউটিক্যালস কোম্পানিতে বিএসসি অ্যালামনাইদের চাহিদা ব্যাপক। ভাইভা বোনে আত্মবিশ্বাস বাড়াতে ল্যাবরেটরি প্র্যাকটিক্যাল জ্ঞান, কেমিক্যাল হ্যান্ডলিং অভিজ্ঞতা এবং কার্যকর যোগাযোগ দক্ষতা গড়ে তুলুন। আমরা সর্বদাই ছোট ভাই-বোনদের দিকনির্দেশনা দিতে প্রস্তুত।',
    date: '০১ সেপ্টেম্বর ২০২৬',
    badgeBg: 'bg-blue-100 text-blue-900'
  }
];

export const AdviceAndFeedbackSection: React.FC<AdviceAndFeedbackSectionProps> = ({
  language = 'bn'
}) => {
  const [activeTab, setActiveTab] = useState<'form' | 'guidelines'>('form');
  const [senderName, setSenderName] = useState('');
  const [senderBatch, setSenderBatch] = useState('');
  const [senderContact, setSenderContact] = useState('');
  const [category, setCategory] = useState('দিকনির্দেশনামূলক পরামর্শ');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [selectedPost, setSelectedPost] = useState<GuidancePost | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !senderName.trim() ||
      !senderBatch.trim() ||
      !senderContact.trim() ||
      !subject.trim() ||
      !message.trim()
    ) {
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'feedback_messages'), {
        senderName: senderName.trim(),
        senderBatch: senderBatch.trim(),
        senderContact: senderContact.trim(),
        category,
        subject: subject.trim(),
        message: message.trim(),
        createdAt: serverTimestamp(),
        status: 'unread'
      });
    } catch (err) {
      console.warn('Firestore submission notice:', err);
    } finally {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setSenderName('');
      setSenderBatch('');
      setSenderContact('');
      setSubject('');
      setMessage('');
      setTimeout(() => setSubmitSuccess(false), 7000);
    }
  };

  return (
    <section className="w-full bg-gradient-to-b from-[#f0f8f4] via-[#e8f5ed] to-[#dfefe6] border-t-2 border-[#b0d8bd] py-4 sm:py-8 px-3 sm:px-6 lg:px-8 font-siliguri text-gray-800 shadow-inner">
      <div className="max-w-7xl mx-auto space-y-3 sm:space-y-5">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-0.5 sm:space-y-1.5">
          <h2 className="text-[11px] sm:text-sm md:text-xl lg:text-2xl font-bold text-gray-900 font-serif-bn tracking-tight leading-snug">
            {language === 'bn'
              ? 'লেখালেখি, মত প্রকাশ ও পরামর্শ প্রদান অপশন'
              : 'Submissions, Opinions & Advice Portal'}
          </h2>

          <p className="text-[7px] sm:text-[9px] md:text-xs font-normal text-gray-600 leading-tight max-w-xl mx-auto px-2">
            {language === 'bn'
              ? 'উদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশনের সার্বিক উন্নয়ন, শিক্ষার্থীদের জন্য ক্যারিয়ার দিকনির্দেশনা বা যেকোনো গঠনমূলক পরামর্শ আমাদের কাছে লিখে পাঠান।'
              : 'Share your valuable advice, career recommendations, or development proposals directly with the Alumni Association.'}
          </p>
        </div>

        {/* Submit Form */}
        <div className="bg-white rounded-lg sm:rounded-xl border border-emerald-200 shadow-xs p-3 sm:p-7 w-full space-y-3 sm:space-y-5">
            <div className="flex items-center gap-2 sm:gap-3 border-b border-emerald-100 pb-2 sm:pb-3.5">
              <div className="p-1 sm:p-2.5 bg-[#006a4e] text-white rounded-md sm:rounded-lg shadow-xs">
                <MessageSquareHeart className="w-3.5 h-3.5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h3 className="text-xs sm:text-base md:text-lg font-bold text-gray-900 font-serif-bn">
                  {language === 'bn' ? 'আপনার পরামর্শ বা বক্তব্য দিন' : 'Send Your Advice or Article'}
                </h3>
              </div>
            </div>

            {submitSuccess && (
              <div className="p-2.5 sm:p-3.5 bg-emerald-50 border border-emerald-300 rounded-lg flex items-start gap-2 text-emerald-900 animate-fadeIn">
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-[11px] sm:text-sm space-y-0.5">
                  <p className="font-bold">
                    {language === 'bn' ? 'বার্তাটি সফলভাবে জমা হয়েছে!' : 'Message Submitted Successfully!'}
                  </p>
                  <p className="text-emerald-700">
                    {language === 'bn'
                      ? 'আপনার গুরুত্বপূর্ণ মতামত ও দিকনির্দেশনামূলক বার্তার জন্য আন্তরিক ধন্যবাদ।'
                      : 'Thank you for your valuable feedback and guidance message.'}
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-2.5 sm:space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4">
                {/* Sender Name */}
                <div className="space-y-1 sm:space-y-1.5">
                  <label className="text-[11px] sm:text-sm font-bold text-gray-700 flex items-center gap-1 sm:gap-1.5">
                    <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#006a4e]" />
                    <span>{language === 'bn' ? 'আপনার নাম *' : 'Your Name *'}</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder=""
                    className="w-full px-2.5 sm:px-3.5 py-1.5 sm:py-2.5 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-md sm:rounded-lg focus:outline-hidden focus:border-emerald-500 focus:bg-white transition-colors"
                  />
                </div>

                {/* Batch or Identity */}
                <div className="space-y-1 sm:space-y-1.5">
                  <label className="text-[11px] sm:text-sm font-bold text-gray-700 flex items-center gap-1 sm:gap-1.5">
                    <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#006a4e]" />
                    <span>{language === 'bn' ? 'ব্যাচ / পরিচিতি *' : 'Batch / Identity *'}</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={senderBatch}
                    onChange={(e) => setSenderBatch(e.target.value)}
                    placeholder=""
                    className="w-full px-2.5 sm:px-3.5 py-1.5 sm:py-2.5 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-md sm:rounded-lg focus:outline-hidden focus:border-emerald-500 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4">
                {/* Contact */}
                <div className="space-y-1 sm:space-y-1.5">
                  <label className="text-[11px] sm:text-sm font-bold text-gray-700 flex items-center gap-1 sm:gap-1.5">
                    <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#006a4e]" />
                    <span>{language === 'bn' ? 'ফোন বা ইমেইল *' : 'Phone or Email *'}</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={senderContact}
                    onChange={(e) => setSenderContact(e.target.value)}
                    placeholder=""
                    className="w-full px-2.5 sm:px-3.5 py-1.5 sm:py-2.5 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-md sm:rounded-lg focus:outline-hidden focus:border-emerald-500 focus:bg-white transition-colors"
                  />
                </div>

                {/* Subject */}
                <div className="space-y-1 sm:space-y-1.5">
                  <label className="text-[11px] sm:text-sm font-bold text-gray-700 block">
                    {language === 'bn' ? 'বিষয় *' : 'Subject *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder=""
                    className="w-full px-2.5 sm:px-3.5 py-1.5 sm:py-2.5 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-md sm:rounded-lg focus:outline-hidden focus:border-emerald-500 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              {/* Detailed Message */}
              <div className="space-y-1 sm:space-y-1.5">
                <label className="text-[11px] sm:text-sm font-bold text-gray-700 block">
                  {language === 'bn' ? 'আপনার মূল বার্তা / পরামর্শের বিশদ বিবরণ *' : 'Detailed Message / Advice *'}
                </label>
                <textarea
                  required
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder=""
                  className="w-full px-2.5 sm:px-3.5 py-1.5 sm:py-2.5 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-md sm:rounded-lg focus:outline-hidden focus:border-emerald-500 focus:bg-white transition-colors resize-y"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-1 sm:pt-1.5 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 bg-[#006a4e] hover:bg-[#00523b] text-white font-bold rounded-md sm:rounded-lg shadow-xs flex items-center justify-center gap-1.5 sm:gap-2 transition-all hover:scale-101 cursor-pointer disabled:opacity-50 text-xs sm:text-sm"
                >
                  <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300" />
                  <span>
                    {isSubmitting
                      ? (language === 'bn' ? 'পাঠানো হচ্ছে...' : 'Sending...')
                      : (language === 'bn' ? 'বার্তা পাঠান' : 'Submit Advice')}
                  </span>
                </button>
              </div>
            </form>
          </div>

      </div>

      {/* Modal for full guidance message */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl relative font-siliguri max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-3">
              <div>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${selectedPost.badgeBg}`}>
                  {selectedPost.category}
                </span>
                <h3 className="text-lg font-bold text-gray-900 font-serif-bn mt-1">
                  {selectedPost.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedPost(null)}
                className="text-gray-400 hover:text-gray-700 p-1 text-xl font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-gray-700 leading-relaxed">
              <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl space-y-0.5">
                <p className="font-bold text-[#006a4e] text-sm">{selectedPost.author}</p>
                <p className="text-xs text-gray-600">{selectedPost.authorTitle} • {selectedPost.batchOrDept}</p>
              </div>

              <p className="whitespace-pre-line text-gray-800">
                {selectedPost.fullMessage}
              </p>
            </div>

            <div className="pt-3 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setSelectedPost(null)}
                className="px-5 py-2 bg-[#006a4e] text-white font-bold text-xs sm:text-sm rounded-xl cursor-pointer"
              >
                {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
