import React from 'react';
import { Mail, X, AlertCircle, CheckCircle2, Loader2, Send } from 'lucide-react';
import { useAdminData } from '../AdminDataContext';

export const EmailComposerModal = () => {
  const {
    language,
    isEmailModalOpen,
    setIsEmailModalOpen,
    emailTarget,
    setEmailTarget,
    emailSubject,
    setEmailSubject,
    emailTemplate,
    setEmailTemplate,
    emailBody,
    setEmailBody,
    isSendingEmail,
    emailSuccessMsg,
    emailErrMsg,
    handleSelectEmailTemplate,
    handleSendCustomEmail,
  } = useAdminData();

  return (
    <>
      {/* ================= MODAL: CUSTOMIZABLE EMAIL SENDER ================= */}
      {isEmailModalOpen && emailTarget && (
        <div className="fixed inset-0 bg-black/75 z-60 flex items-center justify-center p-3 sm:p-4 font-siliguri animate-in fade-in duration-150 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-5 sm:p-6 space-y-4 shadow-2xl border-2 border-blue-600 relative my-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base sm:text-lg text-gray-900 font-serif-bn">
                    {language === 'bn' ? 'কাস্টম ইমেইল পাঠান' : 'Send Customized Email'}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {language === 'bn' ? 'প্রাপকের কাছে সরাসরি বিষয়বস্তু কাস্টমাইজ করে মেইল দিন' : 'Customize subject & message body before dispatch'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEmailModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 bg-gray-100 p-2 rounded-full cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Recipient Info Card */}
            <div className="bg-blue-50/70 p-3 rounded-2xl border border-blue-200 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] text-blue-700 font-bold uppercase block">প্রাপক (Recipient):</span>
                <span className="font-bold text-gray-900 text-sm">{emailTarget.name}</span>
                {emailTarget.formNo && (
                  <span className="ml-2 font-mono text-[11px] bg-white px-1.5 py-0.5 rounded border border-blue-200 text-blue-800">
                    ফরম: {emailTarget.formNo}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <input
                  type="email"
                  value={emailTarget.email}
                  onChange={(e) => setEmailTarget({ ...emailTarget, email: e.target.value })}
                  className="px-2.5 py-1 bg-white border border-blue-300 rounded-lg font-mono text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="email@example.com"
                />
              </div>
            </div>

            {/* Template Selector Presets */}
            <div className="space-y-1 text-xs">
              <label className="font-bold text-gray-700 block">টেমপ্লেট থিম নির্বাচন করুন (Quick Templates):</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleSelectEmailTemplate('custom')}
                  className={`px-2.5 py-1.5 rounded-xl font-bold border transition-all cursor-pointer text-center text-[11px] ${
                    emailTemplate === 'custom'
                      ? 'bg-blue-600 text-white border-blue-700 shadow-2xs'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200'
                  }`}
                >
                  কাস্টম বার্তা
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectEmailTemplate('approval')}
                  className={`px-2.5 py-1.5 rounded-xl font-bold border transition-all cursor-pointer text-center text-[11px] ${
                    emailTemplate === 'approval'
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200'
                  }`}
                >
                  অনুমোদন বার্তা
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectEmailTemplate('fee_receipt')}
                  className={`px-2.5 py-1.5 rounded-xl font-bold border transition-all cursor-pointer text-center text-[11px] ${
                    emailTemplate === 'fee_receipt'
                      ? 'bg-teal-600 text-white border-teal-700 shadow-2xs'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200'
                  }`}
                >
                  পেমেন্ট রসিদ
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectEmailTemplate('notice')}
                  className={`px-2.5 py-1.5 rounded-xl font-bold border transition-all cursor-pointer text-center text-[11px] ${
                    emailTemplate === 'notice'
                      ? 'bg-amber-600 text-white border-amber-700 shadow-2xs'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200'
                  }`}
                >
                  জরুরি নোটিশ
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSendCustomEmail} className="space-y-3 text-xs">
              {/* Subject Input */}
              <div className="space-y-1">
                <label className="font-bold text-gray-800 block">
                  ইমেইল সাবজেক্ট (Subject) * <span className="text-gray-400 font-normal">(কাস্টমাইজযোগ্য)</span>
                </label>
                <input
                  type="text"
                  required
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="ইমেইলের মূল বিষয় লিখুন..."
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-gray-900"
                />
              </div>

              {/* Message Body Textarea */}
              <div className="space-y-1">
                <label className="font-bold text-gray-800 block">
                  ইমেইল বার্তা / বডি (Message Body) * <span className="text-gray-400 font-normal">(যেকোনো লেখা বা অনুচ্ছেদ পরিবর্তন করুন)</span>
                </label>
                <textarea
                  rows={8}
                  required
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  placeholder="ইমেইলের বার্তা এখানে লিখুন..."
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-sans leading-relaxed resize-y text-xs"
                />
              </div>

              {/* Success / Error Alerts */}
              {emailSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{emailSuccessMsg}</span>
                </div>
              )}
              {emailErrMsg && (
                <div className="p-3 bg-red-50 border border-red-300 rounded-xl text-red-800 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{emailErrMsg}</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsEmailModalOpen(false)}
                  disabled={isSendingEmail}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSendingEmail}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-md flex items-center gap-2 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSendingEmail ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>মেইল পাঠানো হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>মেইল পাঠান (Send Email)</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
