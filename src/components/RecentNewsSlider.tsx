import React, { useState, useEffect, useRef } from 'react';
import {
  Newspaper,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  ArrowRight,
  X,
  Share2,
  BookmarkCheck,
  User
} from 'lucide-react';
import { NEWS_POSTS, NewsPost } from '../data/portalData';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';

interface RecentNewsSliderProps {
  language: 'bn' | 'en';
  onViewAllNews?: () => void;
}

const toBnNumber = (num: number | string): string => {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/[0-9]/g, (digit) => bnDigits[parseInt(digit, 10)]);
};

export const RecentNewsSlider: React.FC<RecentNewsSliderProps> = ({
  language,
  onViewAllNews,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedNews, setSelectedNews] = useState<NewsPost | null>(null);
  const [shareCopied, setShareCopied] = useState(false);
  const [firestorePosts, setFirestorePosts] = useState<NewsPost[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Subscribe to Firestore recent_news
  useEffect(() => {
    try {
      const q = query(collection(db, 'recent_news'));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const list: NewsPost[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            list.push({
              id: docSnap.id,
              titleBn: data.titleBn || '',
              titleEn: data.titleEn || data.titleBn || '',
              category: data.category || 'academic',
              categoryBn: data.categoryBn || 'সাধারণ খবরাখবর',
              categoryEn: data.categoryEn || 'General News',
              imageUrl: data.imageUrl || 'https://media.istockphoto.com/id/2022468311/vector/single-man-stick-figure-icon.jpg?s=1024x1024&w=is&k=20&c=knHDGHH3klSPlNHLoqfsFcAkVJc78KuABkT5lVLCXco=',
              date: data.date || '',
              authorBn: data.authorBn || '',
              authorEn: data.authorEn || '',
              summaryBn: data.summaryBn || '',
              summaryEn: data.summaryEn || data.summaryBn || '',
              contentBn: data.contentBn || '',
              contentEn: data.contentEn || data.contentBn || '',
              isFeatured: data.isFeatured || false,
              viewsCount: data.viewsCount || 0
            });
          });

          if (list.length > 0) {
            setFirestorePosts(list);
          } else {
            setFirestorePosts([]);
          }
        },
        (err) => {
          console.warn('Firestore recent_news error:', err);
        }
      );
      return () => unsubscribe();
    } catch (err) {
      console.warn('recent_news catch error:', err);
    }
  }, []);

  const posts = firestorePosts.length > 0 ? firestorePosts : NEWS_POSTS;
  const totalSlides = posts.length;

  // Auto-slide effect
  useEffect(() => {
    if (isPaused || totalSlides <= 1) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalSlides);
    }, 5000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, totalSlides]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const currentPost = posts[currentIndex] || posts[0];

  const handleShare = (post: NewsPost) => {
    const shareText = `${language === 'bn' ? post.titleBn : post.titleEn} - Jagannath University Botany Alumni`;
    if (navigator.share) {
      navigator
        .share({
          title: shareText,
          text: language === 'bn' ? post.summaryBn : post.summaryEn,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2500);
    }
  };

  return (
    <div
      id="recent-news-slider-section"
      className="bg-white border border-[#b2cfb8] rounded-xl shadow-md overflow-hidden font-siliguri transition-all duration-200"
    >
      {/* Botanical Header Bar (Matching Alumni President card) */}
      <div className="bg-gradient-to-r from-[#07361f] via-[#15803d] to-[#0a4729] text-white px-3 sm:px-4 py-2.5 flex items-center justify-between border-b border-emerald-500/30 min-w-0">
        <div className="flex items-center gap-2 font-bold tracking-tight min-w-0 w-full overflow-hidden">
          <div className="p-1 rounded bg-white/10 text-amber-300 shrink-0">
            <Newspaper className="w-4 h-4" />
          </div>
          <h2 className="text-xs sm:text-sm md:text-base font-bold whitespace-nowrap leading-tight text-white font-serif-bn">
            {language === 'bn' ? 'সাম্প্রতিক খবর' : 'Recent News & Updates'}
          </h2>
        </div>
      </div>

      {/* Main Container Content */}
      <div className="p-3.5 sm:p-4 flex flex-col space-y-3 bg-[#fbfdfb]">
        {/* Main Slide Card Container */}
        <div
          className="flex flex-col gap-3.5"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
        {/* 1. CLEAN IMAGE BANNER (No text on top of image) */}
        <div className="relative group rounded-xl sm:rounded-2xl overflow-hidden bg-gray-100 shadow-sm h-52 sm:h-64 md:h-72 w-full border border-gray-200/80">
          <img
            src={currentPost.imageUrl}
            alt={language === 'bn' ? currentPost.titleBn : currentPost.titleEn}
            className="w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-700 ease-out cursor-pointer"
            onClick={() => setSelectedNews(currentPost)}
          />

          {/* Carousel Arrow Controls */}
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous Slide"
            className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/50 hover:bg-[#006a4e] text-white border border-white/30 backdrop-blur-md flex items-center justify-center transition-all opacity-85 group-hover:opacity-100 cursor-pointer active:scale-95 shadow-md"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={handleNext}
            aria-label="Next Slide"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/50 hover:bg-[#006a4e] text-white border border-white/30 backdrop-blur-md flex items-center justify-center transition-all opacity-85 group-hover:opacity-100 cursor-pointer active:scale-95 shadow-md"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Slide Number Counter Tag (Top Right) */}
          <div className="absolute top-3 right-3 z-20 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/65 backdrop-blur-md border border-white/20 text-white text-[11px] font-mono font-bold shadow-xs">
            <span className="text-amber-400">
              {language === 'bn' ? toBnNumber(currentIndex + 1) : currentIndex + 1}
            </span>
            <span className="text-gray-400">/</span>
            <span>{language === 'bn' ? toBnNumber(totalSlides) : totalSlides}</span>
          </div>
        </div>

        {/* 2. TEXT CONTENT BELOW THE IMAGE */}
        <div className="bg-emerald-50/40 p-3.5 sm:p-4 rounded-xl border border-emerald-100/80 space-y-2.5">
          {/* Date Meta Badge */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-white text-gray-700 border border-gray-200">
                <Calendar className="w-3.5 h-3.5 text-amber-600" />
                <span>{currentPost.date}</span>
              </span>
            </div>
          </div>

          {/* Headline Title */}
          <h3
            onClick={() => setSelectedNews(currentPost)}
            className="text-base sm:text-lg font-bold font-serif-bn leading-snug text-gray-900 hover:text-[#006a4e] transition-colors cursor-pointer line-clamp-2"
          >
            {language === 'bn' ? currentPost.titleBn : currentPost.titleEn}
          </h3>

          {/* Summary Paragraph */}
          <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 leading-relaxed">
            {language === 'bn' ? currentPost.summaryBn : currentPost.summaryEn}
          </p>

          {/* Footer Row: Action Button */}
          <div className="pt-2 flex items-center justify-end border-t border-emerald-100">
            <button
              type="button"
              onClick={() => setSelectedNews(currentPost)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold bg-[#006a4e] hover:bg-[#00523d] text-white shadow-xs cursor-pointer transition-all active:scale-95"
            >
              <span>{language === 'bn' ? 'বিস্তারিত পড়ুন' : 'Read Article'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Slide Dot Navigation Bar */}
      <div className="flex items-center justify-center gap-1.5 mt-3">
        {posts.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setCurrentIndex(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={`transition-all cursor-pointer rounded-full ${
              idx === currentIndex
                ? 'w-6 h-2 bg-[#006a4e]'
                : 'w-2 h-2 bg-gray-200 hover:bg-emerald-300'
            }`}
          />
        ))}
      </div>
      </div>

      {/* Article Full View Modal */}
      {selectedNews && (
        <div
          className="fixed inset-0 z-[130] flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setSelectedNews(null)}
        >
          <div
            className="relative w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden flex flex-col max-h-[90vh] font-siliguri animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header Bar */}
            <div className="bg-gradient-to-r from-[#004d38] via-[#006a4e] to-[#004d38] text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xs text-emerald-100 flex items-center gap-1 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-amber-300" />
                  <span>{selectedNews.date}</span>
                </span>
              </div>

              <button
                type="button"
                onClick={() => setSelectedNews(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 custom-scrollbar">
              {/* Image */}
              <div className="relative rounded-2xl overflow-hidden aspect-video bg-gray-100 border border-gray-200">
                <img
                  src={selectedNews.imageUrl}
                  alt={language === 'bn' ? selectedNews.titleBn : selectedNews.titleEn}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Title */}
              <h3 className="text-xl sm:text-2xl font-bold font-serif-bn text-gray-900 leading-snug">
                {language === 'bn' ? selectedNews.titleBn : selectedNews.titleEn}
              </h3>

              {/* Meta Info Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 text-xs text-emerald-900 font-medium">
                <div className="flex items-center gap-1.5">
                  <User className="w-4 h-4 text-[#006a4e]" />
                  <span>{language === 'bn' ? selectedNews.authorBn : selectedNews.authorEn}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-600">
                  <BookmarkCheck className="w-4 h-4 text-emerald-600" />
                  <span>{language === 'bn' ? 'যাচাইকৃত খবর' : 'Verified Report'}</span>
                </div>
              </div>

              {/* Paragraph Content */}
              <div className="text-sm sm:text-base text-gray-700 leading-relaxed space-y-3 whitespace-pre-line font-normal">
                {language === 'bn' ? selectedNews.contentBn : selectedNews.contentEn}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={() => handleShare(selectedNews)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 shadow-2xs transition-colors cursor-pointer"
              >
                <Share2 className="w-4 h-4 text-[#006a4e]" />
                <span>
                  {shareCopied
                    ? language === 'bn'
                      ? 'লিঙ্ক কপি হয়েছে!'
                      : 'Link Copied!'
                    : language === 'bn'
                    ? 'শেয়ার করুন'
                    : 'Share'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedNews(null)}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#006a4e] hover:bg-[#00523d] text-white shadow-xs cursor-pointer transition-colors"
              >
                {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
