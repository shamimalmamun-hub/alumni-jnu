import React from 'react';
import { Camera, Upload, X, Sparkles, Image as ImageIcon } from 'lucide-react';
import { useAdminData } from '../AdminDataContext';

export const GalleryImageModal: React.FC = () => {
  const {
    language,
    galleryModalOpen,
    setGalleryModalOpen,
    editingGalleryImage,
    galleryFormData,
    setGalleryFormData,
    handleGalleryImageUpload,
    handleSaveGalleryImage,
    isUploadingGalleryPhoto,
  } = useAdminData();

  if (!galleryModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-3 sm:p-4 font-siliguri animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 space-y-4 shadow-2xl border-2 border-[#006a4e] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#006a4e] flex items-center justify-center shrink-0 border border-emerald-200">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-gray-900 font-serif-bn leading-tight">
                {editingGalleryImage
                  ? (language === 'bn' ? 'ছবি পরিবর্তন করুন' : 'Change Photo')
                  : (language === 'bn' ? 'গ্যালারিতে নতুন ছবি যোগ করুন' : 'Add New Photo')}
              </h3>
            </div>
          </div>
          <button
            onClick={() => setGalleryModalOpen(false)}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 flex items-center justify-center text-sm font-bold cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form - ONLY Photo */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (isUploadingGalleryPhoto) return;
            handleSaveGalleryImage();
          }}
          className="space-y-4 text-xs"
        >
          {/* Image Upload / URL Input */}
          <div className="space-y-2">
            <label className="font-bold text-gray-800 block">
              {language === 'bn' ? 'ছবি নির্বাচন বা আপলোড করুন *' : 'Select or Upload Photo *'}
            </label>

            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={galleryFormData.imageUrl}
                onChange={(e) => setGalleryFormData({ ...galleryFormData, imageUrl: e.target.value })}
                placeholder={language === 'bn' ? 'ছবির লিংক দিন অথবা ডানে আপলোড বাটনে ক্লিক করুন...' : 'Paste image URL or click Upload...'}
                className="flex-1 px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-[#006a4e] text-xs font-mono"
                required
              />
              <label className={`px-3.5 py-2.5 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs transition-colors ${
                isUploadingGalleryPhoto ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#006a4e] hover:bg-[#00523d]'
              }`}>
                <Upload className="w-4 h-4 text-amber-300" />
                <span>{isUploadingGalleryPhoto ? (language === 'bn' ? 'প্রসেসিং...' : 'Uploading...') : (language === 'bn' ? 'ফাইল বাছাই' : 'Upload')}</span>
                <input
                  type="file"
                  accept="image/*"
                  disabled={isUploadingGalleryPhoto}
                  onChange={handleGalleryImageUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Upload loading state */}
            {isUploadingGalleryPhoto && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold animate-pulse">
                <div className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin shrink-0" />
                <span>{language === 'bn' ? 'ছবি প্রসেসিং ও অপটিমাইজেশন চলছে... অনুগ্রহ করে একটু অপেক্ষা করুন।' : 'Processing & optimizing photo... please wait.'}</span>
              </div>
            )}

            {/* Image Preview */}
            {galleryFormData.imageUrl && !isUploadingGalleryPhoto && (
              <div className="pt-2 rounded-xl border border-emerald-200 bg-emerald-50/30 p-2.5 space-y-1.5">
                <p className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider">
                  {language === 'bn' ? 'ছবি প্রিভিউ (হোম পেজে এভাবেই প্রদর্শিত হবে):' : 'Photo Preview:'}
                </p>
                <div className="w-full aspect-16/9 max-h-64 rounded-lg overflow-hidden bg-slate-900 flex items-center justify-center">
                  <img
                    src={galleryFormData.imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setGalleryModalOpen(false)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold cursor-pointer"
            >
              {language === 'bn' ? 'বাতিল' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isUploadingGalleryPhoto || !galleryFormData.imageUrl}
              className={`px-6 py-2 rounded-xl font-bold shadow-md flex items-center gap-1.5 ${
                isUploadingGalleryPhoto || !galleryFormData.imageUrl
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                  : 'bg-[#006a4e] hover:bg-[#00523d] text-white cursor-pointer'
              }`}
            >
              <Camera className="w-4 h-4 text-amber-300" />
              <span>
                {isUploadingGalleryPhoto
                  ? (language === 'bn' ? 'প্রসেসিং হচ্ছে...' : 'Processing...')
                  : editingGalleryImage
                  ? (language === 'bn' ? 'সংরক্ষণ করুন' : 'Save')
                  : (language === 'bn' ? 'গ্যালারির নিচে যোগ করুন' : 'Add Below to Gallery')}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
