import React, { useState, useEffect } from 'react';
import { Camera, Calendar, MapPin, X, Download, Layers, ChevronLeft, ChevronRight, Play, Pause, Maximize2, ExternalLink } from 'lucide-react';
import { GALLERY_IMAGES, GalleryImage } from '../data/portalData';

interface PhotoGalleryProps {
  language: 'bn' | 'en';
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({ language }) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryImage | null>(null);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, [activeCategory]);

  const filteredPhotos = activeCategory === 'all'
    ? GALLERY_IMAGES
    : GALLERY_IMAGES.filter((img) => img.category === activeCategory);

  const totalSlides = filteredPhotos.length;
  const currentPhoto = filteredPhotos[currentIndex] || filteredPhotos[0];

  // Automatic slide rotation every 4 seconds
  useEffect(() => {
    if (isPaused || totalSlides <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalSlides);
    }, 4000);
    return () => clearInterval(interval);
  }, [isPaused, totalSlides]);

  // Reset index when category changes
  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    setCurrentIndex(0);
  };

  const nextSlide = () => {
    if (totalSlides === 0) return;
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    if (totalSlides === 0) return;
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  return (
    <section id="photo-gallery-carousel-section" className="w-full bg-white border border-[#c1d3c1] rounded-lg shadow-2xs overflow-hidden font-siliguri">
      {/* Top Section Header */}
      <div className="bg-gradient-to-r from-[#07361f] via-[#15803d] to-[#0a4729] text-white px-4 py-3 flex items-center justify-between border-b-2 border-amber-400">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-amber-300">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-base sm:text-lg leading-tight flex items-center gap-2">
              <span>{language === 'bn' ? 'উদ্ভিদবিজ্ঞান অ্যালামনাই ফটো গ্যালারি' : 'Botany Alumni Photo Gallery'}</span>
            </h2>
            <p className="text-[11px] sm:text-xs text-emerald-100">
              {language === 'bn'
                ? 'জগন্নাথ বিশ্ববিদ্যালয় উদ্ভিদবিজ্ঞান বিভাগের সেমিনার ও অ্যালামনাইদের মিলনমেলার চিত্র'
                : 'Seminars, research, and alumni fellowship glimpses of the Department of Botany, Jagannath University'}
            </p>
          </div>
        </div>
      </div>



      {/* Gallery Content or Skeleton */}
      {isLoading ? (
        <div className="p-4 space-y-3 animate-pulse bg-[#f9fbf9]">
          <div className="w-full aspect-16/9 sm:aspect-21/9 max-h-[380px] bg-slate-200 rounded-lg relative overflow-hidden flex flex-col justify-between p-4">
            <div className="w-24 h-6 bg-slate-300 rounded" />
            <div className="space-y-2">
              <div className="w-3/4 h-6 bg-slate-300 rounded" />
              <div className="w-1/2 h-4 bg-slate-300 rounded" />
              <div className="flex gap-2 pt-1">
                <div className="w-20 h-4 bg-slate-300 rounded" />
                <div className="w-28 h-4 bg-slate-300 rounded" />
              </div>
            </div>
          </div>
          <div className="flex justify-center gap-2 pt-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="w-14 h-10 sm:w-18 sm:h-12 bg-slate-200 rounded shrink-0" />
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Main Carousel Display Stage */}
          {currentPhoto && (
            <div
              className="relative w-full bg-slate-900 group"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              {/* Main Slide Image */}
              <div
                className="relative aspect-16/9 sm:aspect-21/9 w-full max-h-[380px] overflow-hidden flex items-center justify-center cursor-pointer"
                onClick={() => setSelectedPhoto(currentPhoto)}
                title={language === 'bn' ? 'বড় করে দেখতে ক্লিক করুন' : 'Click to view full size'}
              >
                <img
                  src={currentPhoto.imageUrl}
                  alt={language === 'bn' ? currentPhoto.titleBn : currentPhoto.titleEn}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-all duration-500 ease-out group-hover:scale-[1.02]"
                />

                {/* Gradient Mask for readable text */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none" />

                {/* Category Badge overlay top & expand hint */}
                <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-none">
                  <span className="bg-[#006a4e] text-amber-300 text-[11px] sm:text-xs font-bold px-2.5 py-1 rounded shadow-md border border-amber-400/40">
                    {language === 'bn' ? currentPhoto.categoryBn : currentPhoto.categoryEn}
                  </span>
                </div>

                <div className="absolute top-3 right-3 flex items-center gap-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="bg-black/60 backdrop-blur-xs text-white text-[11px] px-2.5 py-1 rounded flex items-center gap-1 border border-white/20">
                    <Maximize2 className="w-3.5 h-3.5 text-amber-300" />
                    {language === 'bn' ? 'বড় করে দেখুন' : 'Expand'}
                  </span>
                </div>

                {/* Prev & Next Arrow Controls */}
                <button
                  onClick={prevSlide}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-[#006a4e] text-white p-2 sm:p-2.5 rounded-full backdrop-blur-xs transition-all cursor-pointer shadow-lg border border-white/20 hover:scale-110"
                  aria-label="Previous Slide"
                >
                  <ChevronLeft className="w-5 h-5 text-white" />
                </button>

                <button
                  onClick={nextSlide}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-[#006a4e] text-white p-2 sm:p-2.5 rounded-full backdrop-blur-xs transition-all cursor-pointer shadow-lg border border-white/20 hover:scale-110"
                  aria-label="Next Slide"
                >
                  <ChevronRight className="w-5 h-5 text-white" />
                </button>

                {/* Caption & Metadata overlay bottom */}
                <div className="absolute bottom-0 inset-x-0 p-3 sm:p-5 text-white space-y-1.5">
                  <h3 className="font-bold text-sm sm:text-lg text-amber-300 drop-shadow-md leading-snug line-clamp-2">
                    {language === 'bn' ? currentPhoto.titleBn : currentPhoto.titleEn}
                  </h3>

                  <p className="text-xs sm:text-sm text-gray-200 line-clamp-2 leading-relaxed hidden sm:block">
                    {language === 'bn' ? currentPhoto.descriptionBn : currentPhoto.descriptionEn}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] sm:text-xs text-emerald-200 pt-1">
                    <span className="flex items-center gap-1 font-medium bg-black/40 px-2 py-0.5 rounded border border-emerald-800/60">
                      <Calendar className="w-3.5 h-3.5 text-amber-300" />
                      {currentPhoto.date}
                    </span>

                    <span className="flex items-center gap-1 font-medium bg-black/40 px-2 py-0.5 rounded border border-emerald-800/60 truncate max-w-[220px]">
                      <MapPin className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                      <span className="truncate">{language === 'bn' ? currentPhoto.locationBn : currentPhoto.locationEn}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Slide Thumbnails & Indicator Bar */}
          <div className="bg-[#111a16] p-2 sm:p-2.5 border-t border-emerald-900/60">
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 w-full max-w-md mx-auto">
              {filteredPhotos.map((photo, idx) => (
                <button
                  key={photo.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`relative shrink-0 rounded overflow-hidden transition-all cursor-pointer ${
                    currentIndex === idx
                      ? 'ring-2 ring-amber-400 scale-105 opacity-100'
                      : 'opacity-50 hover:opacity-80'
                  }`}
                >
                  <img
                    src={photo.imageUrl}
                    alt={`Thumb ${idx + 1}`}
                    referrerPolicy="no-referrer"
                    className="w-11 h-7 sm:w-16 sm:h-10 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20" />
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-[#006a4e] text-white px-4 py-3 flex items-center justify-between border-b-2 border-amber-400">
              <div className="flex items-center gap-2">
                <span className="bg-amber-400 text-[#006a4e] text-[11px] font-extrabold px-2 py-0.5 rounded uppercase">
                  {language === 'bn' ? selectedPhoto.categoryBn : selectedPhoto.categoryEn}
                </span>
                <span className="text-xs text-emerald-100 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-300" />
                  {selectedPhoto.date}
                </span>
              </div>

              <button
                onClick={() => setSelectedPhoto(null)}
                className="p-1 rounded-full text-white/80 hover:text-white hover:bg-emerald-800 transition-colors cursor-pointer"
                title={language === 'bn' ? 'বন্ধ করুন' : 'Close'}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="w-full max-h-[50vh] bg-black rounded-lg overflow-hidden flex items-center justify-center">
                <img
                  src={selectedPhoto.imageUrl}
                  alt={language === 'bn' ? selectedPhoto.titleBn : selectedPhoto.titleEn}
                  referrerPolicy="no-referrer"
                  className="max-w-full max-h-[50vh] object-contain"
                />
              </div>

              <div className="space-y-2">
                <h2 className="text-base sm:text-lg font-bold text-gray-900">
                  {language === 'bn' ? selectedPhoto.titleBn : selectedPhoto.titleEn}
                </h2>

                <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 p-2 rounded border border-gray-200">
                  <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span className="font-semibold">
                    {language === 'bn' ? selectedPhoto.locationBn : selectedPhoto.locationEn}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed pt-1">
                  {language === 'bn' ? selectedPhoto.descriptionBn : selectedPhoto.descriptionEn}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-100 px-4 py-2.5 border-t border-gray-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-gray-600">
                <Camera className="w-4 h-4 text-emerald-700" />
                <span>{language === 'bn' ? 'উদ্ভিদবিজ্ঞান বিভাগ অ্যালামনাই অ্যাসোসিয়েশন' : 'Department of Botany Alumni Association'}</span>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={selectedPhoto.imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-[#006a4e] text-white rounded font-semibold flex items-center gap-1.5 hover:bg-emerald-800 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'মূল ছবি' : 'Full Res'}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
