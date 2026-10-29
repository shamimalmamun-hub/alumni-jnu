import React, { useState, useEffect } from 'react';
import { Video, Play, Calendar, User, X, Share2, Film, CheckCircle2 } from 'lucide-react';
import { GALLERY_VIDEOS, GalleryVideo } from '../data/portalData';

interface VideoGalleryProps {
  language: 'bn' | 'en';
}

export const VideoGallery: React.FC<VideoGalleryProps> = ({ language }) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedVideo, setSelectedVideo] = useState<GalleryVideo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, [activeCategory]);

  const filteredVideos = activeCategory === 'all'
    ? GALLERY_VIDEOS
    : GALLERY_VIDEOS.filter((v) => v.category === activeCategory);

  return (
    <section id="video-gallery-section" className="w-full bg-white border border-[#c1d3c1] rounded-lg shadow-2xs overflow-hidden font-siliguri">
      {/* Header Bar */}
      <div className="bg-[#006a4e] text-white px-4 py-3 flex items-center justify-between border-b-2 border-amber-400">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 flex items-center justify-center">
            <img
              src="https://www.svgrepo.com/show/532727/video.svg"
              alt="Video Icon"
              className="w-6 h-6 object-contain filter brightness-0 invert"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <h2 className="font-bold text-base sm:text-lg leading-tight">
              {language === 'bn' ? 'ভিডিও গ্যালারি ও সরাসরি বক্তব্য' : 'Video Gallery & Speeches'}
            </h2>
            <p className="text-[11px] sm:text-xs text-emerald-100">
              {language === 'bn'
                ? 'উদ্ভিদবিজ্ঞান বিভাগের সেমিনার, একাডেমিক লেকচার, রিইউনিয়ন ও প্রামাণ্যচিত্র'
                : 'Botany Department seminars, academic lectures, reunions & documentaries'}
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1 text-xs text-amber-300 font-semibold bg-emerald-900/60 px-2.5 py-1 rounded border border-emerald-700/50">
          <Film className="w-3.5 h-3.5" />
          <span>{filteredVideos.length} {language === 'bn' ? 'টি ভিডিও' : 'Videos'}</span>
        </div>
      </div>

      {/* Category Filters */}
      <div className="p-3 sm:p-4 bg-[#f4f9f5] border-b border-[#d2e4d2] flex items-center gap-2 overflow-x-auto scrollbar-thin">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-colors cursor-pointer ${
            activeCategory === 'all'
              ? 'bg-[#006a4e] text-white shadow-2xs'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-emerald-50'
          }`}
        >
          {language === 'bn' ? 'সকল ভিডিও' : 'All Videos'}
        </button>
        <button
          onClick={() => setActiveCategory('documentary')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-colors cursor-pointer ${
            activeCategory === 'documentary'
              ? 'bg-[#006a4e] text-white shadow-2xs'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-emerald-50'
          }`}
        >
          {language === 'bn' ? 'প্রামাণ্যচিত্র' : 'Documentary'}
        </button>
        <button
          onClick={() => setActiveCategory('lecture')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-colors cursor-pointer ${
            activeCategory === 'lecture'
              ? 'bg-[#006a4e] text-white shadow-2xs'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-emerald-50'
          }`}
        >
          {language === 'bn' ? 'একাডেমিক লেকচার' : 'Lectures'}
        </button>
        <button
          onClick={() => setActiveCategory('cultural')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-colors cursor-pointer ${
            activeCategory === 'cultural'
              ? 'bg-[#006a4e] text-white shadow-2xs'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-emerald-50'
          }`}
        >
          {language === 'bn' ? 'সাংস্কৃতিক অনুষ্ঠান' : 'Cultural Events'}
        </button>
      </div>

      {/* Video Grid or Skeleton */}
      {isLoading ? (
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6 animate-pulse">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="bg-white border border-[#d2e4d2] rounded-lg overflow-hidden flex flex-col sm:flex-row p-3 gap-3">
              <div className="w-full sm:w-[130px] h-28 sm:h-24 bg-slate-200 rounded shrink-0 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-slate-300" />
              </div>
              <div className="flex-1 space-y-2 py-1">
                <div className="w-3/4 h-4 bg-slate-200 rounded" />
                <div className="w-full h-3 bg-slate-200 rounded" />
                <div className="w-2/3 h-3 bg-slate-200 rounded" />
                <div className="flex justify-between pt-2">
                  <div className="w-16 h-3 bg-slate-200 rounded" />
                  <div className="w-16 h-3 bg-slate-200 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6">
          {filteredVideos.map((video) => (
            <div
              key={video.id}
              onClick={() => setSelectedVideo(video)}
              className="group bg-white border border-[#d2e4d2] rounded-lg overflow-hidden shadow-2xs hover:shadow-md hover:border-[#008e48] transition-all cursor-pointer flex flex-col sm:flex-row"
            >
              {/* Thumbnail */}
              <div className="relative w-full sm:w-[130px] h-28 sm:h-24 bg-black overflow-hidden shrink-0">
                <img
                  src={video.thumbnailUrl}
                  alt={language === 'bn' ? video.titleBn : video.titleEn}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transform-gpu group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-100"
                  style={{ imageRendering: '-webkit-optimize-contrast' }}
                />

                {/* Play Button Overlay */}
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <span className="w-8 h-8 rounded-full bg-[#d9383a] text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  </span>
                </div>

                {/* Duration Tag */}
                <div className="absolute bottom-1 right-1 bg-black/80 text-white font-mono text-[9px] font-bold px-1 py-0.2 rounded backdrop-blur-xs">
                  {video.duration}
                </div>

                {/* Category Tag */}
                <div className="absolute top-1 left-1 bg-[#006a4e] text-white text-[9px] font-bold px-1 py-0.2 rounded">
                  {language === 'bn' ? video.categoryBn : video.categoryEn}
                </div>
              </div>

              {/* Video Meta */}
              <div className="p-3.5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-gray-900 group-hover:text-[#006a4e] transition-colors leading-snug line-clamp-2">
                    {language === 'bn' ? video.titleBn : video.titleEn}
                  </h3>

                  <p className="text-[11px] text-gray-600 line-clamp-2 mt-1.5 leading-relaxed">
                    {language === 'bn' ? video.descriptionBn : video.descriptionEn}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                  <span className="flex items-center gap-1 font-medium text-emerald-800">
                    <User className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate max-w-[120px]">
                      {language === 'bn' ? video.speakerBn : video.speakerEn}
                    </span>
                  </span>

                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    {video.date}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Video Modal Player */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-[#006a4e] text-white px-4 py-3 flex items-center justify-between border-b-2 border-amber-400">
              <div className="flex items-center gap-2">
                <span className="bg-amber-400 text-[#006a4e] text-[11px] font-extrabold px-2 py-0.5 rounded uppercase">
                  {language === 'bn' ? selectedVideo.categoryBn : selectedVideo.categoryEn}
                </span>
                <span className="text-xs text-emerald-100 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-300" />
                  {selectedVideo.date}
                </span>
              </div>

              <button
                onClick={() => setSelectedVideo(null)}
                className="p-1 rounded-full text-white/80 hover:text-white hover:bg-emerald-800 transition-colors cursor-pointer"
                title={language === 'bn' ? 'বন্ধ করুন' : 'Close'}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Responsive Video Container */}
              <div className="w-full aspect-16/9 bg-black rounded-lg overflow-hidden shadow-inner relative flex items-center justify-center">
                {/* Embedded HTML5 or Video Representation */}
                <div className="relative w-full h-full flex flex-col items-center justify-center bg-gray-900 text-white p-6 text-center">
                  <img
                    src={selectedVideo.thumbnailUrl}
                    alt={language === 'bn' ? selectedVideo.titleBn : selectedVideo.titleEn}
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 w-full h-full object-cover opacity-30"
                  />
                  <div className="relative z-10 space-y-3">
                    <div className="w-16 h-16 rounded-full bg-[#d9383a] text-white mx-auto flex items-center justify-center shadow-2xl animate-pulse">
                      <Play className="w-8 h-8 fill-current ml-1" />
                    </div>
                    <p className="text-sm font-semibold text-amber-300">
                      {language === 'bn' ? 'ভিডিও স্ট্রিমিং ও বক্তব্য প্রচার' : 'Video Stream Playing'}
                    </p>
                    <span className="inline-block bg-black/60 px-3 py-1 rounded text-xs font-mono">
                      {selectedVideo.duration}
                    </span>
                  </div>
                </div>
              </div>

              {/* Video Info */}
              <div className="space-y-2">
                <h2 className="text-base sm:text-lg font-bold text-gray-900">
                  {language === 'bn' ? selectedVideo.titleBn : selectedVideo.titleEn}
                </h2>

                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 bg-gray-50 p-2.5 rounded border border-gray-200">
                  <div className="flex items-center gap-1 text-emerald-800 font-bold">
                    <User className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{language === 'bn' ? selectedVideo.speakerBn : selectedVideo.speakerEn}</span>
                  </div>
                  <span className="text-gray-300">|</span>
                  <div className="flex items-center gap-1 text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{language === 'bn' ? 'এইচডি অডিও ও ভিডিও' : 'HD Quality Audio & Video'}</span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed pt-1">
                  {language === 'bn' ? selectedVideo.descriptionBn : selectedVideo.descriptionEn}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-100 px-4 py-2.5 border-t border-gray-200 flex items-center justify-between text-xs">
              <span className="text-gray-500 font-medium">
                {language === 'bn' ? 'মধুপুর বিএনপি তথ্য ও মিডিয়া উইং' : 'Madhupur BNP Media Wing'}
              </span>

              <button
                onClick={() => setSelectedVideo(null)}
                className="px-4 py-1.5 bg-gray-700 text-white rounded font-semibold hover:bg-gray-800 transition-colors cursor-pointer"
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
