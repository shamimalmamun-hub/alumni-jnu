import React, { useState, useEffect } from 'react';
import { Newspaper, Calendar, Eye, User, ArrowRight, X, Share2, Tag, BookmarkCheck } from 'lucide-react';
import { NEWS_POSTS, NewsPost } from '../data/portalData';

interface NewsSectionProps {
  language: 'bn' | 'en';
}

export const NewsSection: React.FC<NewsSectionProps> = ({ language }) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedArticle, setSelectedArticle] = useState<NewsPost | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, [activeCategory]);

  const filteredNews = activeCategory === 'all'
    ? NEWS_POSTS
    : NEWS_POSTS.filter((n) => n.category === activeCategory);

  const featuredPost = filteredNews.find((n) => n.isFeatured) || filteredNews[0];
  const regularPosts = filteredNews.filter((n) => n.id !== featuredPost?.id);

  return (
    <section id="news-section" className="w-full bg-white border border-[#c1d3c1] rounded-lg shadow-2xs overflow-hidden font-siliguri">
      {/* Header Bar */}
      <div className="bg-[#006a4e] text-white px-4 py-3 flex items-center justify-between border-b-2 border-amber-400">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 flex items-center justify-center">
            <img
              src="https://www.svgrepo.com/show/489524/news.svg"
              alt="News Icon"
              className="w-6 h-6 object-contain filter brightness-0 invert"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <h2 className="font-bold text-base sm:text-lg leading-tight">
              {language === 'bn' ? 'অ্যালামনাই ও বিভাগীয় সংবাদ বাতায়ন' : 'Alumni & Department News Hub'}
            </h2>
            <p className="text-[11px] sm:text-xs text-emerald-100">
              {language === 'bn'
                ? 'উদ্ভিদবিজ্ঞান বিভাগ অ্যালামনাই অ্যাসোসিয়েশন এর কার্যক্রম, পুনর্মিলনী ও সেমিনার সমাচার'
                : 'Botany Department Alumni Association activities, reunion updates & events'}
            </p>
          </div>
        </div>

        <span className="hidden sm:inline-block bg-emerald-900/60 text-amber-300 font-bold text-xs px-2.5 py-1 rounded border border-emerald-700/50">
          {language === 'bn' ? 'অ্যালামনাই মিডিয়া ও প্রকাশনা সেল' : 'Alumni Media & Publication Cell'}
        </span>
      </div>

      {/* Category Pills */}
      <div className="p-3 sm:p-4 bg-[#f4f9f5] border-b border-[#d2e4d2] flex items-center gap-2 overflow-x-auto scrollbar-thin">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-colors cursor-pointer ${
            activeCategory === 'all'
              ? 'bg-[#006a4e] text-white shadow-2xs'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-emerald-50'
          }`}
        >
          {language === 'bn' ? 'সকল খবর' : 'All News'}
        </button>
        <button
          onClick={() => setActiveCategory('academic')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-colors cursor-pointer ${
            activeCategory === 'academic'
              ? 'bg-[#006a4e] text-white shadow-2xs'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-emerald-50'
          }`}
        >
          {language === 'bn' ? 'একাডেমিক সংবাদ' : 'Academic News'}
        </button>
        <button
          onClick={() => setActiveCategory('seminar')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-colors cursor-pointer ${
            activeCategory === 'seminar'
              ? 'bg-[#006a4e] text-white shadow-2xs'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-emerald-50'
          }`}
        >
          {language === 'bn' ? 'সেমিনার ও কর্মশালা' : 'Seminars'}
        </button>
        <button
          onClick={() => setActiveCategory('tour')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-colors cursor-pointer ${
            activeCategory === 'tour'
              ? 'bg-[#006a4e] text-white shadow-2xs'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-emerald-50'
          }`}
        >
          {language === 'bn' ? 'ফিল্ড ওয়ার্ক ও শিক্ষা সফর' : 'Field Work & Tour'}
        </button>
      </div>

      {/* News Articles Content or Skeleton */}
      {isLoading ? (
        <div className="p-4 space-y-6 animate-pulse">
          {/* Featured Article Skeleton */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden flex flex-col lg:flex-row p-4 gap-4">
            <div className="w-full lg:w-1/2 h-52 sm:h-60 bg-slate-200 rounded-lg shrink-0" />
            <div className="flex-1 space-y-3 py-2 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-24 h-4 bg-slate-200 rounded" />
                <div className="w-3/4 h-6 bg-slate-200 rounded" />
                <div className="w-full h-4 bg-slate-200 rounded" />
                <div className="w-5/6 h-4 bg-slate-200 rounded" />
              </div>
              <div className="flex justify-between pt-4 border-t border-slate-200">
                <div className="w-24 h-4 bg-slate-200 rounded" />
                <div className="w-28 h-4 bg-slate-200 rounded" />
              </div>
            </div>
          </div>

          {/* Regular Articles Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white border border-slate-200 rounded-lg overflow-hidden p-3 space-y-3">
                <div className="w-full h-36 bg-slate-200 rounded" />
                <div className="w-20 h-3 bg-slate-200 rounded" />
                <div className="w-full h-4 bg-slate-200 rounded" />
                <div className="w-4/5 h-3 bg-slate-200 rounded" />
                <div className="flex justify-between pt-2 border-t border-slate-100">
                  <div className="w-16 h-3 bg-slate-200 rounded" />
                  <div className="w-12 h-3 bg-slate-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-4 space-y-6">
          {/* Featured Main Story Card */}
          {featuredPost && (
            <div
              onClick={() => setSelectedArticle(featuredPost)}
              className="group bg-gradient-to-r from-emerald-50/60 to-amber-50/30 border-2 border-emerald-600/60 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col lg:flex-row"
            >
              {/* Featured Image */}
              <div className="relative w-full lg:w-1/2 aspect-16/9 lg:aspect-auto bg-gray-100 overflow-hidden shrink-0">
                <img
                  src={featuredPost.imageUrl}
                  alt={language === 'bn' ? featuredPost.titleBn : featuredPost.titleEn}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 bg-[#d9383a] text-white text-xs font-bold px-2.5 py-1 rounded shadow-md uppercase tracking-wider flex items-center gap-1">
                  <BookmarkCheck className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'প্রধান সংবাদ' : 'Featured News'}</span>
                </div>
              </div>

              {/* Featured Text Content */}
              <div className="p-4 sm:p-6 flex-1 flex flex-col justify-between">
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
                    <span className="bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                      {language === 'bn' ? featuredPost.categoryBn : featuredPost.categoryEn}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-gray-500">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                      {featuredPost.date}
                    </span>
                  </div>

                  <h3 className="font-bold text-base sm:text-lg text-gray-900 group-hover:text-[#006a4e] transition-colors leading-snug">
                    {language === 'bn' ? featuredPost.titleBn : featuredPost.titleEn}
                  </h3>

                  <p className="text-xs sm:text-sm text-gray-700 leading-relaxed line-clamp-3">
                    {language === 'bn' ? featuredPost.summaryBn : featuredPost.summaryEn}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-emerald-200/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-gray-600 font-medium">
                    <User className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{language === 'bn' ? featuredPost.authorBn : featuredPost.authorEn}</span>
                  </div>

                  <button className="text-[#006a4e] font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform cursor-pointer">
                    <span>{language === 'bn' ? 'সম্পূর্ণ খবর পড়ুন' : 'Read Full Article'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Regular Posts Grid */}
          {regularPosts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {regularPosts.map((post) => (
                <div
                  key={post.id}
                  onClick={() => setSelectedArticle(post)}
                  className="group bg-white border border-[#d2e4d2] rounded-lg overflow-hidden shadow-2xs hover:shadow-md hover:border-[#008e48] transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    {/* Image */}
                    <div className="relative aspect-16/9 w-full bg-gray-100 overflow-hidden">
                      <img
                        src={post.imageUrl}
                        alt={language === 'bn' ? post.titleBn : post.titleEn}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 left-2 bg-emerald-900/80 text-amber-300 text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded backdrop-blur-xs">
                        {language === 'bn' ? post.categoryBn : post.categoryEn}
                      </div>
                    </div>

                    {/* Body */}
                    <div className="p-3.5 space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                          {post.date}
                        </span>
                        <span className="flex items-center gap-1 text-gray-400">
                          <Eye className="w-3.5 h-3.5" />
                          {post.viewsCount}
                        </span>
                      </div>

                      <h4 className="font-bold text-xs sm:text-sm text-gray-900 line-clamp-2 group-hover:text-[#006a4e] transition-colors leading-snug">
                        {language === 'bn' ? post.titleBn : post.titleEn}
                      </h4>

                      <p className="text-[11px] text-gray-600 line-clamp-2 leading-relaxed">
                        {language === 'bn' ? post.summaryBn : post.summaryEn}
                      </p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="p-3.5 pt-0">
                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px]">
                      <span className="text-gray-500 truncate max-w-[140px]">
                        {language === 'bn' ? post.authorBn : post.authorEn}
                      </span>
                      <span className="text-[#006a4e] font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                        {language === 'bn' ? 'বিস্তারিত' : 'Details'} &rarr;
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Article Detail Reader Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-[#006a4e] text-white px-4 py-3 flex items-center justify-between border-b-2 border-amber-400">
              <div className="flex items-center gap-2">
                <span className="bg-amber-400 text-[#006a4e] text-[11px] font-extrabold px-2.5 py-0.5 rounded uppercase">
                  {language === 'bn' ? selectedArticle.categoryBn : selectedArticle.categoryEn}
                </span>
                <span className="text-xs text-emerald-100 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-300" />
                  {selectedArticle.date}
                </span>
              </div>

              <button
                onClick={() => setSelectedArticle(null)}
                className="p-1 rounded-full text-white/80 hover:text-white hover:bg-emerald-800 transition-colors cursor-pointer"
                title={language === 'bn' ? 'বন্ধ করুন' : 'Close'}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              <h1 className="text-base sm:text-xl font-bold text-gray-900 leading-snug border-b border-gray-200 pb-3">
                {language === 'bn' ? selectedArticle.titleBn : selectedArticle.titleEn}
              </h1>

              <div className="flex flex-wrap items-center justify-between text-xs text-gray-600 bg-gray-50 p-2.5 rounded border border-gray-200 gap-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-700" />
                  <span className="font-semibold">{language === 'bn' ? selectedArticle.authorBn : selectedArticle.authorEn}</span>
                </div>

                <div className="flex items-center gap-3 text-gray-500">
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4 text-emerald-600" />
                    {selectedArticle.viewsCount} {language === 'bn' ? 'বার পঠিত' : 'Reads'}
                  </span>
                </div>
              </div>

              <div className="w-full max-h-72 rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={selectedArticle.imageUrl}
                  alt={language === 'bn' ? selectedArticle.titleBn : selectedArticle.titleEn}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="prose prose-sm max-w-none text-gray-800 text-xs sm:text-sm leading-relaxed space-y-3 whitespace-pre-line font-siliguri">
                {language === 'bn' ? selectedArticle.contentBn : selectedArticle.contentEn}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-100 px-4 py-3 border-t border-gray-200 flex items-center justify-between text-xs">
              <span className="text-gray-500 font-medium">
                {language === 'bn' ? 'বাংলাদেশ জাতীয়তাবাদী দল (বিএনপি), মধুপুর শাখা' : 'Bangladesh Nationalist Party (BNP), Madhupur Unit'}
              </span>

              <button
                onClick={() => setSelectedArticle(null)}
                className="px-4 py-1.5 bg-[#006a4e] text-white rounded font-semibold hover:bg-emerald-800 transition-colors cursor-pointer"
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
