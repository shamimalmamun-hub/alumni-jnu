import React from 'react';
import { Newspaper, Plus, Upload } from 'lucide-react';
import { useAdminData } from '../AdminDataContext';

export const NewNewsModal = () => {
  const {
    language,
    newNewsModalOpen,
    setNewNewsModalOpen,
    editingNewsPost,
    newsFormData,
    setNewsFormData,
    getImageSizeKb,
    handleNewsImageUpload,
    handleSaveNews,
  } = useAdminData();

  return (
    <>
      {/* ================= MODAL: ADD / EDIT RECENT NEWS ================= */}
      {newNewsModalOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-3 sm:p-4 font-siliguri animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl border-2 border-[#006a4e] max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-base sm:text-lg text-gray-900 font-serif-bn flex items-center gap-2">
                <Newspaper className="w-5 h-5 text-[#006a4e]" />
                <span>
                  {editingNewsPost
                    ? (language === 'bn' ? 'খবর সম্পাদনা করুন' : 'Edit News Post')
                    : (language === 'bn' ? 'নতুন সাম্প্রতিক খবর প্রকাশ করুন' : 'Post New Recent News')}
                </span>
              </h3>
              <button
                onClick={() => setNewNewsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSaveNews(); }} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-gray-700">{language === 'bn' ? 'সংবাদের শিরোনাম *' : 'News Title *'}</label>
                <input
                  type="text"
                  value={newsFormData.titleBn}
                  onChange={(e) => setNewsFormData({ ...newsFormData, titleBn: e.target.value })}
                  placeholder={language === 'bn' ? 'যেমন: উদ্ভিদবিজ্ঞান অ্যালামনাই বার্ষিক সাধারণ সভা সংক্রান্ত সংবাদ...' : 'Title...'}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-[#006a4e] text-xs font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">{language === 'bn' ? 'ক্যাটাগরি' : 'Category'}</label>
                  <select
                    value={newsFormData.categoryBn}
                    onChange={(e) => setNewsFormData({ ...newsFormData, categoryBn: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-[#006a4e] text-xs font-semibold cursor-pointer"
                  >
                    <option value="একাডেমিক সংবাদ">একাডেমিক সংবাদ</option>
                    <option value="ফিল্ড ওয়ার্ক ও গবেষণা">ফিল্ড ওয়ার্ক ও গবেষণা</option>
                    <option value="অ্যালামনাই ইভেন্ট">অ্যালামনাই ইভেন্ট</option>
                    <option value="গবেষণা ও সাফল্য">গবেষণা ও সাফল্য</option>
                    <option value="সাধারণ খবরাখবর">সাধারণ খবরাখবর</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700">{language === 'bn' ? 'প্রকাশের তারিখ' : 'Publication Date'}</label>
                  <input
                    type="text"
                    value={newsFormData.date}
                    onChange={(e) => setNewsFormData({ ...newsFormData, date: e.target.value })}
                    placeholder={language === 'bn' ? 'যেমন: ১৫ মার্চ, ২০২৬' : 'Date...'}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-[#006a4e] text-xs font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-bold text-gray-700 flex items-center justify-between">
                  <span>{language === 'bn' ? 'কভার ছবি (ফাইল আপলোড বা ইউআরএল)' : 'Cover Image (Upload or URL)'}</span>
                  {newsFormData.imageUrl && getImageSizeKb(newsFormData.imageUrl) !== null && (
                    <span className="text-[10px] bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-mono font-bold">
                      {language === 'bn' ? `কম্প্রেসড সাইজ: ${getImageSizeKb(newsFormData.imageUrl)} KB` : `Compressed: ${getImageSizeKb(newsFormData.imageUrl)} KB`}
                    </span>
                  )}
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={newsFormData.imageUrl}
                    onChange={(e) => setNewsFormData({ ...newsFormData, imageUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/... বা ছবি আপলোড করুন"
                    className="flex-1 px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-[#006a4e] text-xs font-medium font-mono"
                  />
                  <label className="px-3.5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-xs flex items-center gap-1 cursor-pointer shrink-0 border border-gray-300">
                    <Upload className="w-4 h-4 text-[#006a4e]" />
                    <span>{language === 'bn' ? 'ছবি আপলোড' : 'Upload'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleNewsImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                {newsFormData.imageUrl && (
                  <div className="pt-2">
                    <p className="text-[10px] text-gray-500 mb-1">{language === 'bn' ? 'ইমেজ প্রিভিউ:' : 'Image Preview:'}</p>
                    <img
                      src={newsFormData.imageUrl}
                      alt="Preview"
                      className="h-28 w-full object-cover rounded-xl border border-gray-200 shadow-sm"
                      onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700">{language === 'bn' ? 'সংক্ষিপ্ত সারসংক্ষেপ (কার্ড ও স্লাইডারে দেখাবে) *' : 'Summary *'}</label>
                <textarea
                  rows={3}
                  value={newsFormData.summaryBn}
                  onChange={(e) => setNewsFormData({ ...newsFormData, summaryBn: e.target.value })}
                  placeholder={language === 'bn' ? 'সংবাদের প্রধান অংশ সংক্ষেপে লিখুন...' : 'Short summary...'}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-[#006a4e] text-xs font-medium"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700">{language === 'bn' ? 'বিস্তারিত সংবাদ বিবরণ' : 'Full Content / Details'}</label>
                <textarea
                  rows={5}
                  value={newsFormData.contentBn}
                  onChange={(e) => setNewsFormData({ ...newsFormData, contentBn: e.target.value })}
                  placeholder={language === 'bn' ? 'সম্পূর্ণ সংবাদ বা আর্টিকেলের বিবরণ লিখুন...' : 'Full content details...'}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-[#006a4e] text-xs font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setNewNewsModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#006a4e] hover:bg-[#00523d] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>
                    {editingNewsPost
                      ? (language === 'bn' ? 'আপডেট করুন' : 'Update News')
                      : (language === 'bn' ? 'প্রকাশ করুন' : 'Publish News')}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
