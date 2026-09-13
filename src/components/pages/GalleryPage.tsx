import React from 'react';
import { Image as ImageIcon, Video, ArrowLeft, Camera } from 'lucide-react';
import { PhotoGallery } from '../PhotoGallery';
import { VideoGallery } from '../VideoGallery';

interface GalleryPageProps {
  language: 'bn' | 'en';
  onBackToHome: () => void;
}

export const GalleryPage: React.FC<GalleryPageProps> = ({ language, onBackToHome }) => {
  return (
    <div className="w-full bg-white py-6 px-4 sm:px-8 space-y-10 font-siliguri animate-in fade-in duration-300">
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
          {language === 'bn' ? 'ফটো ও ভিডিও গ্যালারি' : 'Photo & Video Gallery'}
        </span>
      </div>

      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center justify-center p-3 bg-emerald-50 text-[#006a4e] rounded-full shadow-xs mb-1">
          <Camera className="w-7 h-7" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-serif-bn">
          {language === 'bn' ? 'উদ্ভিদবিজ্ঞান অ্যালামনাই ফটো ও ভিডিও গ্যালারি' : 'Botany Alumni Photo & Video Gallery'}
        </h1>
        <p className="text-sm text-gray-600">
          {language === 'bn'
            ? 'জগন্নাথ বিশ্ববিদ্যালয় উদ্ভিদবিজ্ঞান বিভাগ ও অ্যালামনাই অ্যাসোসিয়েশনের পুনর্মিলনী, সেমিনার, গবেষণা ও প্রীতি সম্মিলনের স্মরণীয় মুহূর্ত।'
            : 'Memorable moments from reunions, botanical research, seminars, and alumni celebrations at Jagannath University.'}
        </p>
      </div>

      {/* Photo Gallery Component */}
      <PhotoGallery language={language} />

      {/* Video Gallery Component */}
      <VideoGallery language={language} />
    </div>
  );
};
