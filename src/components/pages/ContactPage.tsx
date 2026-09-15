import React, { useState } from 'react';
import { MapPin, Phone, Mail, Send, ArrowLeft, CheckCircle2, GraduationCap, Building } from 'lucide-react';
import { db, auth } from '../../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

interface ContactPageProps {
  language: 'bn' | 'en';
  onBackToHome: () => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ language, onBackToHome }) => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.message) {
      alert(language === 'bn' ? 'অনুগ্রহ করে নাম, ফোন নম্বর এবং বার্তা পূরণ করুন।' : 'Please fill in name, phone number, and message.');
      return;
    }

    const contactId = `contact_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const path = `contacts/${contactId}`;

    try {
      await setDoc(doc(db, 'contacts', contactId), {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
        createdAt: new Date().toISOString()
      });
      setSubmitted(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

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
          {language === 'bn' ? 'যোগাযোগ ও দপ্তর' : 'Contact & Office'}
        </span>
      </div>

      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center justify-center p-3 bg-emerald-50 text-[#006a4e] rounded-full shadow-xs mb-1">
          <MapPin className="w-7 h-7" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-serif-bn">
          {language === 'bn' ? 'যোগাযোগ ও বিভাগীয় অফিসের ঠিকানা' : 'Contact & Departmental Address'}
        </h1>
        <p className="text-sm text-gray-600">
          {language === 'bn'
            ? 'জগন্নাথ বিশ্ববিদ্যালয়, ঢাকার উদ্ভিদবিজ্ঞান বিভাগের অফিস ও সেমিনারের সাথে যোগাযোগের মাধ্যম।'
            : 'Get in touch with the Department of Botany, Jagannath University, Dhaka.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        {/* Office Info Card */}
        <div className="bg-[#fcfdfd] border border-emerald-100 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-[#006a4e] font-serif-bn border-b border-emerald-100 pb-3">
              {language === 'bn' ? 'বিভাগীয় দপ্তর ও হেল্পডেস্ক' : 'Departmental Office & Helpdesk'}
            </h2>
            <div className="space-y-4 text-sm text-gray-700">
              <div className="flex items-start gap-3">
                <Building className="w-5 h-5 text-[#006a4e] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-gray-900">{language === 'bn' ? 'উদ্ভিদবিজ্ঞান বিভাগ' : 'Department of Botany'}</strong>
                  <span className="font-siliguri">{language === 'bn' ? '৯-১০ চিত্তরঞ্জন এভিনিউ, জগন্নাথ বিশ্ববিদ্যালয়, পুরান ঢাকা, ঢাকা - ১১০০।' : '9-10 Chittaranjan Ave, Jagannath University, Old Dhaka, Dhaka 1100.'}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#006a4e] shrink-0" />
                <div>
                  <strong className="block text-gray-900">{language === 'bn' ? 'বিভাগীয় হেল্পলাইন' : 'Helpdesk Phone'}</strong>
                  <a href="tel:01401996674" className="text-[#006a4e] hover:underline font-semibold font-mono">
                    01401996674
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#006a4e] shrink-0" />
                <div>
                  <strong className="block text-gray-900">{language === 'bn' ? 'অফিসিয়াল ইমেইল' : 'Official Email'}</strong>
                  <a href="mailto:baajnu@gmail.com" className="text-[#006a4e] hover:underline font-semibold">
                    baajnu@gmail.com
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200 text-xs text-emerald-900 space-y-1">
            <p className="font-bold">{language === 'bn' ? 'বিভাগীয় অফিস সময়সূচী:' : 'Department Office Hours:'}</p>
            <p>{language === 'bn' ? 'রবিবার - বৃহস্পতিবার: সকাল ৯:০০ টা থেকে বিকাল ৪:০০ টা পর্যন্ত।' : 'Sunday - Thursday: 9:00 AM to 4:00 PM.'}</p>
          </div>
        </div>

        {/* Contact Form Card */}
        <div className="bg-white border border-emerald-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          {submitted ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
              <div className="w-16 h-16 bg-emerald-100 text-[#006a4e] rounded-full flex items-center justify-center shadow-sm">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 font-serif-bn">
                {language === 'bn' ? 'আপনার বার্তা সফলভাবে পাঠানো হয়েছে!' : 'Your message has been sent successfully!'}
              </h3>
              <p className="text-sm text-gray-600 max-w-sm">
                {language === 'bn'
                  ? 'উদ্ভিদবিজ্ঞান বিভাগীয় অফিস শীঘ্রই আপনার সাথে যোগাযোগ করবে।'
                  : 'Department of Botany office will get in touch with you shortly.'}
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setFormData({ name: '', phone: '', email: '', subject: '', message: '' });
                }}
                className="mt-4 px-5 py-2.5 bg-[#006a4e] hover:bg-[#00523b] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-sm"
              >
                {language === 'bn' ? 'আরেকটি বার্তা পাঠান' : 'Send Another Message'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="text-lg font-bold text-[#006a4e] font-serif-bn border-b border-emerald-100 pb-3">
                {language === 'bn' ? 'জিজ্ঞাসা বা পরামর্শ জানান' : 'Send Inquiry or Feedback'}
              </h2>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">
                  {language === 'bn' ? 'আপনার নাম *' : 'Your Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={language === 'bn' ? 'আপনার সম্পূর্ণ নাম লিখুন' : 'Enter your full name'}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-[#006a4e] focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">
                    {language === 'bn' ? 'মোবাইল নম্বর (English) *' : 'Mobile Number *'}
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-3.5 text-emerald-700 pointer-events-none" />
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => {
                        const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
                        const enDigits = e.target.value.replace(/[০-৯]/g, (d) => String(bnDigits.indexOf(d))).replace(/[^0-9]/g, '');
                        setFormData({ ...formData, phone: enDigits });
                      }}
                      maxLength={11}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-gray-300 text-sm font-mono focus:ring-2 focus:ring-[#006a4e] focus:outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">
                    {language === 'bn' ? 'ইমেইল *' : 'Email *'}
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="student@example.com"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-[#006a4e] focus:outline-none"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">
                  {language === 'bn' ? 'বিষয় *' : 'Subject *'}
                </label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder={language === 'bn' ? 'যেমন: সেমিনার লাইব্রেরি, ভর্তি বা পরীক্ষা' : 'e.g., Seminar Library, Admission, Exam'}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-[#006a4e] focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">
                  {language === 'bn' ? 'আপনার বার্তা *' : 'Your Message *'}
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder={language === 'bn' ? 'আপনার বক্তব্য বা তথ্য জানতে বিস্তারিত লিখুন...' : 'Write your inquiry here...'}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-[#006a4e] focus:outline-none resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#006a4e] hover:bg-[#00523b] text-white text-sm font-bold rounded-xl transition-colors cursor-pointer shadow-sm"
              >
                <Send className="w-4 h-4" />
                <span>{language === 'bn' ? 'বার্তা প্রেরণ করুন' : 'Send Message'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
