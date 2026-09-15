import React, { useState, useEffect } from 'react';
import { Camera, Layers, ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import { GALLERY_IMAGES } from '../data/portalData';

interface PhotoGalleryProps {
  language: 'bn' | 'en';
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({ language }) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
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
                className="relative aspect-16/9 sm:aspect-21/9 w-full max-h-[380px] overflow-hidden flex items-center justify-center cursor-default select-none"
              >
                <img
                  src={currentPhoto.imageUrl}
                  alt={language === 'bn' ? currentPhoto.titleBn : currentPhoto.titleEn}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-all duration-500 ease-out pointer-events-none select-none"
                />

                {/* Prev & Next Arrow Controls */}
                <button
                  onClick={prevSlide}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-[#006a4e] text-white p-2 sm:p-2.5 rounded-full backdrop-blur-xs transition-all cursor-pointer shadow-lg border border-white/20 hover:scale-110 opacity-80 group-hover:opacity-100"
                  aria-label="Previous Slide"
                >
                  <ChevronLeft className="w-5 h-5 text-white" />
                </button>

                <button
                  onClick={nextSlide}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-[#006a4e] text-white p-2 sm:p-2.5 rounded-full backdrop-blur-xs transition-all cursor-pointer shadow-lg border border-white/20 hover:scale-110 opacity-80 group-hover:opacity-100"
                  aria-label="Next Slide"
                >
                  <ChevronRight className="w-5 h-5 text-white" />
                </button>
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
                    className="w-11 h-7 sm:w-16 sm:h-10 object-cover pointer-events-none select-none"
                  />
                  <div className="absolute inset-0 bg-black/20" />
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  );
};
