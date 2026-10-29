import React from 'react';
import { Plus, Upload, X, Send, FileText, Image as ImageIcon } from 'lucide-react';
import { useAdminData } from '../AdminDataContext';

export const NewNoticeModal = () => {
  const {
    language,
    newNoticeModal,
    setNewNoticeModal,
    newNoticeData,
    setNewNoticeData,
    handleNoticeImageSelect,
    handleNoticePdfSelect,
    handleCreateNotice,
  } = useAdminData();

  return (
    <>
      {/* ================= MODAL: ADD NEW NOTICE ================= */}
      {newNoticeModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-3 sm:p-4 font-siliguri animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl border-2 border-[#006a4e] max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-base sm:text-lg text-gray-900 font-serif-bn flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#006a4e]" />
                <span>{language === 'bn' ? 'নতুন নোটিশ ও প্রেস বিজ্ঞপ্তি প্রকাশ' : 'Publish New Notice'}</span>
              </h3>
              <button
                onClick={() => setNewNoticeModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNotice} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-gray-700">{language === 'bn' ? 'নোটিশের শিরোনাম *' : 'Notice Title *'}</label>
                <input
                  type="text"
                  value={newNoticeData.title}
                  onChange={(e) => setNewNoticeData({ ...newNoticeData, title: e.target.value })}
                  placeholder={language === 'bn' ? 'যেমন: উদ্ভিদবিজ্ঞান অ্যালামনাই বার্ষিক সাধারণ সভা ও রিইউনিয়ন...' : 'Notice title...'}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-[#006a4e] text-xs font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">{language === 'bn' ? 'ক্যাটাগরি' : 'Category'}</label>
                  <select
                    value={newNoticeData.category}
                    onChange={(e) => setNewNoticeData({ ...newNoticeData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-[#006a4e] text-xs font-semibold cursor-pointer"
                  >
                    <option value="জরুরি নোটিশ">জরুরি নোটিশ</option>
                    <option value="প্রেস বিজ্ঞপ্তি">প্রেস বিজ্ঞপ্তি</option>
                    <option value="অ্যালামনাই পুনর্মিলনী ও অনুষ্ঠান">অ্যালামনাই পুনর্মিলনী ও অনুষ্ঠান</option>
                    <option value="সাধারণ বিজ্ঞপ্তি">সাধারণ বিজ্ঞপ্তি</option>
                  </select>
                </div>

                <div className="space-y-1 flex flex-col justify-end">
                  <label className="flex items-center gap-2 cursor-pointer pt-2">
                    <input
                      type="checkbox"
                      checked={newNoticeData.isUrgent}
                      onChange={(e) => setNewNoticeData({ ...newNoticeData, isUrgent: e.target.checked })}
                      className="w-4 h-4 text-red-600 rounded cursor-pointer"
                    />
                    <span className="font-bold text-red-600">{language === 'bn' ? 'জরুরি বুলেটিন টিকারে দেখান' : 'Show in Urgent Ticker'}</span>
                  </label>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700">{language === 'bn' ? 'বিস্তারিত বিবরণ *' : 'Detailed Content *'}</label>
                <textarea
                  rows={4}
                  value={newNoticeData.description}
                  onChange={(e) => setNewNoticeData({ ...newNoticeData, description: e.target.value })}
                  placeholder={language === 'bn' ? 'নোটিশের পূর্ণাঙ্গ বিবরণ ও নির্দেশনাবলী লিখুন...' : 'Write notice details...'}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-[#006a4e] text-xs leading-relaxed"
                  required
                />
              </div>

              {/* Attachment Section: Image & PDF Upload */}
              <div className="space-y-2 pt-1 border-t border-gray-100">
                <label className="font-bold text-gray-800 text-xs flex items-center justify-between">
                  <span>{language === 'bn' ? 'সংযুক্ত নথি (Image ও PDF Upload)' : 'Attachments (Image & PDF Upload)'}</span>
                  <span className="text-[10px] text-gray-400 font-normal">
                    {language === 'bn' ? 'ঐচ্ছিক' : 'Optional'}
                  </span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Image Upload Box */}
                  <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#006a4e] text-xs flex items-center gap-1.5">
                        <ImageIcon className="w-4 h-4 text-emerald-700" />
                        {language === 'bn' ? 'ইমেজ আপলোড' : 'Image Upload'}
                      </span>
                      {newNoticeData.imageUrl && (
                        <button
                          type="button"
                          onClick={() => setNewNoticeData((prev) => ({ ...prev, imageUrl: '' }))}
                          className="text-[10px] text-rose-600 hover:underline font-bold"
                        >
                          {language === 'bn' ? 'মুছে ফেলুন' : 'Remove'}
                        </button>
                      )}
                    </div>

                    {newNoticeData.imageUrl ? (
                      <div className="relative group rounded-xl overflow-hidden border border-emerald-300 bg-white p-1 text-center">
                        <img
                          src={newNoticeData.imageUrl}
                          alt="Notice preview"
                          className="h-24 w-full object-contain rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => setNewNoticeData((prev) => ({ ...prev, imageUrl: '' }))}
                          className="mt-1 text-[11px] text-rose-600 font-bold hover:underline"
                        >
                          ✕ {language === 'bn' ? 'ছবি পরিবর্তন করুন' : 'Remove Image'}
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-emerald-300 hover:border-emerald-500 rounded-xl bg-white cursor-pointer transition-colors text-center">
                        <Upload className="w-5 h-5 text-emerald-600 mb-1" />
                        <span className="text-[11px] font-bold text-gray-700">
                          {language === 'bn' ? 'ছবি নির্বাচন করুন (JPG/PNG)' : 'Select Image (JPG/PNG)'}
                        </span>
                        <span className="text-[10px] text-gray-400">সর্বোচ্চ ৮ মেগাবাইট</span>
                        <input
                          type="file"
                          accept="image/png, image/jpeg, image/jpg, image/webp"
                          onChange={handleNoticeImageSelect}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  {/* PDF Upload Box */}
                  <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-blue-900 text-xs flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-blue-700" />
                        {language === 'bn' ? 'PDF আপলোড' : 'PDF Upload'}
                      </span>
                      {newNoticeData.pdfUrl && (
                        <button
                          type="button"
                          onClick={() => setNewNoticeData((prev) => ({ ...prev, pdfUrl: '', pdfFileName: '' }))}
                          className="text-[10px] text-rose-600 hover:underline font-bold"
                        >
                          {language === 'bn' ? 'মুছে ফেলুন' : 'Remove'}
                        </button>
                      )}
                    </div>

                    {newNoticeData.pdfUrl ? (
                      <div className="p-2.5 bg-white border border-blue-300 rounded-xl flex items-center justify-between gap-2 shadow-2xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="w-5 h-5 text-red-600 shrink-0" />
                          <div className="truncate">
                            <p className="text-xs font-bold text-gray-800 truncate">
                              {newNoticeData.pdfFileName || 'notice_document.pdf'}
                            </p>
                            <span className="text-[10px] text-emerald-700 font-semibold">✓ PDF যুক্ত হয়েছে</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setNewNoticeData((prev) => ({ ...prev, pdfUrl: '', pdfFileName: '' }))}
                          className="p-1 text-gray-400 hover:text-rose-600 rounded cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-blue-300 hover:border-blue-500 rounded-xl bg-white cursor-pointer transition-colors text-center">
                        <Upload className="w-5 h-5 text-blue-600 mb-1" />
                        <span className="text-[11px] font-bold text-gray-700">
                          {language === 'bn' ? 'পিডিএফ ফাইল নির্বাচন করুন' : 'Select PDF File'}
                        </span>
                        <span className="text-[10px] text-gray-400">সর্বোচ্চ ১২ মেগাবাইট (.pdf)</span>
                        <input
                          type="file"
                          accept="application/pdf, .pdf"
                          onChange={handleNoticePdfSelect}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setNewNoticeModal(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold cursor-pointer"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#006a4e] hover:bg-[#00523d] text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'প্রকাশ করুন' : 'Publish'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
