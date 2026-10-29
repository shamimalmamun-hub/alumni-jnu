import React, { useRef, useState } from 'react';
import { Camera, Plus, Edit2, Trash2, Eye, Upload, Loader2, Sparkles, Image as ImageIcon } from 'lucide-react';
import { useAdminData } from '../AdminDataContext';

export const GallerySection: React.FC = () => {
  const {
    language,
    activeTab,
    galleryImages,
    handleOpenCreateGalleryImage,
    handleOpenEditGalleryImage,
    handleDeleteGalleryImage,
    handleDirectGalleryUpload,
    isUploadingGalleryPhoto,
  } = useAdminData();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  if (activeTab !== 'gallery') return null;

  const maxPhotos = 15;
  const isFull = galleryImages.length >= maxPhotos;

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (isFull || isUploadingGalleryPhoto) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const pseudoEvent = {
        target: {
          files: e.dataTransfer.files,
          value: '',
        },
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleDirectGalleryUpload(pseudoEvent);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 font-siliguri">
      {/* Hidden File Input for Direct Upload */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        multiple
        disabled={isFull || isUploadingGalleryPhoto}
        onChange={handleDirectGalleryUpload}
        className="hidden"
      />

      {/* Top Header Card */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-emerald-100 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#006a4e] flex items-center justify-center shrink-0 border border-emerald-200">
            <Camera className="w-5 h-5 text-[#006a4e]" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 font-serif-bn leading-tight">
              {language === 'bn' ? 'গ্যালারির ছবি' : 'Photo Gallery'}
            </h2>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-xs font-semibold text-gray-600">
                {language === 'bn'
                  ? `মোট ছবি: ${galleryImages.length}টি`
                  : `Total photos: ${galleryImages.length}`}
              </span>
              <span className="text-xs text-gray-300">•</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200">
                {language === 'bn'
                  ? `সর্বোচ্চ ছবি আপলোড ${maxPhotos}টি`
                  : `Max Upload: ${maxPhotos} Photos`}
              </span>
              {galleryImages.length < maxPhotos && (
                <span className="text-[11px] text-emerald-700 font-medium">
                  {language === 'bn'
                    ? `(আরও ${maxPhotos - galleryImages.length}টি ছবি যোগ করা যাবে)`
                    : `(${maxPhotos - galleryImages.length} slots available)`}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Direct Upload Button (Adds below immediately) */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isFull || isUploadingGalleryPhoto}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 shadow-md shrink-0 cursor-pointer ${
              isFull || isUploadingGalleryPhoto
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed shadow-none border border-gray-300'
                : 'bg-[#006a4e] hover:bg-[#00523d] text-white'
            }`}
            title={isFull ? (language === 'bn' ? 'সর্বোচ্চ ১৫টি ছবি আপলোড করা হয়েছে' : 'Max 15 photos reached') : undefined}
          >
            {isUploadingGalleryPhoto ? (
              <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
            ) : (
              <Plus className="w-4 h-4 text-amber-300" />
            )}
            <span>
              {isUploadingGalleryPhoto
                ? (language === 'bn' ? 'আপলোড হচ্ছে...' : 'Uploading...')
                : (language === 'bn' ? 'নতুন ছবি যোগ করুন' : 'Add New Photo')}
            </span>
          </button>

          {/* Modal Option for Custom Image URL */}
          <button
            type="button"
            onClick={handleOpenCreateGalleryImage}
            disabled={isFull || isUploadingGalleryPhoto}
            className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all border shrink-0 ${
              isFull
                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200 cursor-pointer'
            }`}
            title={language === 'bn' ? 'ছবির লিংক দিয়ে যোগ করুন' : 'Add via Image URL'}
          >
            {language === 'bn' ? 'লিংক দিয়ে যোগ' : 'Add via URL'}
          </button>
        </div>
      </div>

      {/* Uploading progress notification banner */}
      {isUploadingGalleryPhoto && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 flex items-center gap-3 animate-pulse shadow-xs">
          <Loader2 className="w-5 h-5 text-amber-700 animate-spin shrink-0" />
          <div className="text-xs">
            <p className="font-bold">
              {language === 'bn'
                ? 'ছবি আপলোড ও প্রসেসিং হচ্ছে...'
                : 'Uploading & processing photos...'}
            </p>
            <p className="text-amber-800 text-[11px] mt-0.5">
              {language === 'bn'
                ? 'ছবিটি স্বয়ংক্রিয়ভাবে গ্যালারির নিচে যুক্ত হয়ে হোম পেজে দৃশ্যমান হবে। অনুগ্রহ করে একটু অপেক্ষা করুন।'
                : 'Photo is being added below in this gallery and will be visible on the home page. Please wait.'}
            </p>
          </div>
        </div>
      )}

      {/* Photo Grid */}
      {galleryImages.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-emerald-100 text-center space-y-3">
          <Camera className="w-12 h-12 mx-auto text-emerald-200" />
          <p className="font-bold text-gray-700 text-sm">
            {language === 'bn' ? 'গ্যালারিতে কোনো ছবি নেই।' : 'No photos in gallery.'}
          </p>
          <div className="flex justify-center pt-1">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-[#006a4e] text-white font-bold rounded-xl text-xs hover:bg-[#00523d] transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 text-amber-300" />
              <span>{language === 'bn' ? 'ছবি আপলোড করুন' : 'Upload Photo'}</span>
            </button>
          </div>
        </div>
      ) : (
        <div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4"
          onDragOver={(e) => {
            e.preventDefault();
            if (!isFull) setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
        >
          {galleryImages.map((photo, index) => (
            <div
              key={photo.id || index}
              className="relative aspect-4/3 rounded-xl overflow-hidden bg-slate-900 border border-emerald-100 shadow-xs hover:shadow-md transition-all group"
            >
              {/* Image */}
              <img
                src={photo.imageUrl}
                alt={photo.titleBn || 'Alumni Gallery'}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/1st.jpeg';
                }}
              />

              {/* Sequential Number Badge (Top-Left) */}
              <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-md bg-black/65 backdrop-blur-xs text-white text-[10px] font-bold border border-white/20 shadow-xs pointer-events-none">
                {language === 'bn' ? `ছবি ${index + 1}` : `Photo ${index + 1}`}
              </div>


              {/* Action Buttons Overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2 z-20">
                <a
                  href={photo.imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-white/90 hover:bg-white text-gray-800 rounded-lg shadow-sm transition-transform hover:scale-110"
                  title={language === 'bn' ? 'বড় করে দেখুন' : 'View Full Image'}
                >
                  <Eye className="w-4 h-4 text-emerald-800" />
                </a>

                <button
                  type="button"
                  onClick={() => handleOpenEditGalleryImage(photo)}
                  className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm transition-transform hover:scale-110 cursor-pointer"
                  title={language === 'bn' ? 'ছবি পরিবর্তন' : 'Change Photo'}
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteGalleryImage(photo.id)}
                  className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-sm transition-transform hover:scale-110 cursor-pointer"
                  title={language === 'bn' ? 'মুছে ফেলুন' : 'Delete'}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {/* Interactive In-Place Upload Card Added Below! */}
          {!isFull && (
            <div
              onClick={() => {
                if (!isUploadingGalleryPhoto) fileInputRef.current?.click();
              }}
              className={`relative aspect-4/3 rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center p-3 text-center cursor-pointer group shadow-2xs select-none ${
                isDragOver
                  ? 'border-[#006a4e] bg-emerald-100/80 scale-[1.02]'
                  : 'border-emerald-300 hover:border-[#006a4e] bg-emerald-50/40 hover:bg-emerald-50'
              } ${isUploadingGalleryPhoto ? 'cursor-wait opacity-75' : ''}`}
            >
              {isUploadingGalleryPhoto ? (
                <div className="flex flex-col items-center justify-center space-y-2">
                  <Loader2 className="w-7 h-7 text-[#006a4e] animate-spin" />
                  <span className="text-xs font-bold text-[#006a4e]">
                    {language === 'bn' ? 'আপলোড হচ্ছে...' : 'Uploading...'}
                  </span>
                </div>
              ) : (
                <>
                  <div className="w-11 h-11 rounded-xl bg-white shadow-xs text-[#006a4e] flex items-center justify-center mb-2 group-hover:scale-110 group-hover:bg-[#006a4e] group-hover:text-white transition-all border border-emerald-200">
                    <Plus className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-gray-800 font-serif-bn leading-tight">
                    {language === 'bn' ? '+ নতুন ছবি যোগ করুন' : '+ Add New Photo'}
                  </span>
                  <span className="text-[10px] text-gray-500 mt-1 leading-tight">
                    {language === 'bn'
                      ? 'ক্লিক করে নিচে যুক্ত করুন'
                      : 'Click to add below'}
                  </span>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
