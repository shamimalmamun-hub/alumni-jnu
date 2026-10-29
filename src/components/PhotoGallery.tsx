import React, { useState, useEffect } from 'react';
import { Camera, ChevronLeft, ChevronRight } from 'lucide-react';
import { GALLERY_IMAGES, GalleryImage, sortGalleryImages } from '../data/portalData';
import { watch, listDocuments } from '../lib/db';

interface PhotoGalleryProps {
  language: 'bn' | 'en';
}

const getCachedPhotos = (): GalleryImage[] => {
  try {
    const saved = localStorage.getItem('botany_alumni_gallery_images');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const custom = parsed.filter((p: any) => !String(p.id).startsWith('botany-gallery-'));
        const defaults = parsed.filter((p: any) => String(p.id).startsWith('botany-gallery-'));
        custom.sort((a: any, b: any) => {
          const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return tB - tA;
        });
        return [...custom, ...sortGalleryImages(defaults)];
      }
    }
  } catch {}
  return sortGalleryImages(GALLERY_IMAGES);
};

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({ language }) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [photos, setPhotos] = useState<GalleryImage[]>(getCachedPhotos);

  // Subscribe to live gallery images from database
  useEffect(() => {
    const loadLivePhotos = async () => {
      try {
        const docs = await listDocuments<GalleryImage>('gallery_images');
        let combined: GalleryImage[] = [];
        if (docs && docs.length > 0) {
          const map = new Map<string, GalleryImage>();
          for (const b of GALLERY_IMAGES) map.set(b.id, b);
          for (const d of docs) map.set(d.id, d as GalleryImage);
          combined = Array.from(map.values());
        } else {
          combined = GALLERY_IMAGES;
        }

        const customPhotos: GalleryImage[] = [];
        const defaultPhotos: GalleryImage[] = [];

        combined.forEach((d: any) => {
          const item: GalleryImage = {
            id: d.id,
            titleBn: d.titleBn || '',
            titleEn: d.titleEn || d.titleBn || '',
            category: d.category || 'reunion',
            categoryBn: d.categoryBn || '',
            categoryEn: d.categoryEn || '',
            imageUrl: d.imageUrl || '',
            date: d.date || '',
            locationBn: d.locationBn || '',
            locationEn: d.locationEn || '',
            descriptionBn: d.descriptionBn || '',
            descriptionEn: d.descriptionEn || '',
            fbPostUrl: d.fbPostUrl || '',
            order: d.order,
            createdAt: d.createdAt,
          };
          if (String(item.id).startsWith('botany-gallery-')) {
            defaultPhotos.push(item);
          } else {
            customPhotos.push(item);
          }
        });

        // Sort custom uploaded photos (newest first) so newly uploaded photos appear immediately
        customPhotos.sort((a, b) => {
          const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return tB - tA;
        });

        const sortedDefaults = sortGalleryImages(defaultPhotos);
        // Put newly uploaded photos FIRST so when uploaded from admin, they show up right away!
        const formatted = [...customPhotos, ...sortedDefaults];

        setPhotos(formatted);
        try {
          localStorage.setItem('botany_alumni_gallery_images', JSON.stringify(formatted));
        } catch {}
      } catch (err) {
        console.warn('Failed to load gallery images in PhotoGallery:', err);
      } finally {
        setIsLoading(false);
      }
    };

    const unsub = watch('gallery_images', loadLivePhotos);

    // Listen to custom gallery-updated event for instant local synchronization
    const onGalleryUpdated = () => {
      loadLivePhotos();
    };
    window.addEventListener('gallery-updated', onGalleryUpdated);

    return () => {
      unsub();
      window.removeEventListener('gallery-updated', onGalleryUpdated);
    };
  }, []);

  const totalSlides = photos.length;
  const currentPhoto = photos[currentIndex] || photos[0];

  // Automatic slide rotation every 4 seconds
  useEffect(() => {
    if (isPaused || totalSlides <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalSlides);
    }, 4000);
    return () => clearInterval(interval);
  }, [isPaused, totalSlides]);

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
      <div className="bg-gradient-to-r from-[#07361f] via-[#15803d] to-[#0a4729] text-white px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between border-b-2 border-amber-400">
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/10 flex items-center justify-center text-amber-300 shrink-0">
            <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-bold text-[11px] sm:text-sm md:text-base leading-snug text-white">
              <span>{language === 'bn' ? 'উদ্ভিদবিজ্ঞান অ্যালামনাই ফটো গ্যালারি' : 'Botany Alumni Photo Gallery'}</span>
            </h2>
          </div>
        </div>
      </div>

      {/* Gallery Content or Skeleton */}
      {isLoading ? (
        <div className="p-2 sm:p-3 animate-pulse bg-[#f9fbf9]">
          <div className="w-full aspect-16/9 max-h-[440px] bg-slate-200 rounded-lg relative overflow-hidden" />
        </div>
      ) : (
        <>
          {/* Main Carousel Display Stage - UNIFORM SIZE & NO BLACK SIDEBARS */}
          {currentPhoto && (
            <div
              className="relative w-full bg-gray-100 group overflow-hidden"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              {/* Main Slide Image - 100% full coverage */}
              <div
                className="relative aspect-16/9 w-full max-h-[440px] overflow-hidden flex items-center justify-center cursor-default select-none bg-gray-100"
              >
                <img
                  src={currentPhoto.imageUrl}
                  alt={currentPhoto.titleBn || 'Alumni Gallery Photo'}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center transition-all duration-500 ease-out pointer-events-none select-none"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/1st.jpeg';
                  }}
                />

                {/* Top Badge: Slide Counter */}
                <div className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-md border border-white/20 shadow-xs pointer-events-none">
                  {language === 'bn'
                    ? `ছবি ${currentIndex + 1} / ${totalSlides}`
                    : `Photo ${currentIndex + 1} of ${totalSlides}`}
                </div>


                {/* Prev & Next Arrow Controls */}
                <button
                  onClick={prevSlide}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-[#006a4e] text-white p-2 sm:p-2.5 rounded-full backdrop-blur-xs transition-all cursor-pointer shadow-lg border border-white/20 hover:scale-110 opacity-80 group-hover:opacity-100"
                  aria-label="Previous Slide"
                >
                  <ChevronLeft className="w-5 h-5 text-white" />
                </button>

                <button
                  onClick={nextSlide}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-[#006a4e] text-white p-2 sm:p-2.5 rounded-full backdrop-blur-xs transition-all cursor-pointer shadow-lg border border-white/20 hover:scale-110 opacity-80 group-hover:opacity-100"
                  aria-label="Next Slide"
                >
                  <ChevronRight className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Bottom Thumbnail Strip */}
              {totalSlides > 1 && (
                <div className="bg-gray-900/90 p-2 border-t border-white/10 flex items-center gap-1.5 overflow-x-auto scrollbar-thin">
                  {photos.map((item, idx) => (
                    <button
                      key={item.id || idx}
                      type="button"
                      onClick={() => setCurrentIndex(idx)}
                      className={`relative shrink-0 w-12 sm:w-16 aspect-4/3 rounded-md overflow-hidden transition-all cursor-pointer border ${
                        idx === currentIndex
                          ? 'border-amber-400 ring-2 ring-amber-400/50 scale-105 opacity-100'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                      title={language === 'bn' ? `ছবি ${idx + 1}` : `Photo ${idx + 1}`}
                    >
                      <img
                        src={item.imageUrl}
                        alt=""
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/1st.jpeg';
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
};
