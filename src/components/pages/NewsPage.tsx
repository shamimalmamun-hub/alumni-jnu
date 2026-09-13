import React, { useState } from 'react';
import { Newspaper, Calendar, ArrowLeft, Tag, Share2, ExternalLink, GraduationCap, Award, BookOpen } from 'lucide-react';
import { NEWS_POSTS, NewsPost } from '../../data/portalData';

interface NewsPageProps {
  language: 'bn' | 'en';
  onBackToHome: () => void;
}

export const NewsPage: React.FC<NewsPageProps> = ({ language, onBackToHome }) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'academic' | 'seminar' | 'tour' | 'achievement'>('all');
  const [selectedArticle, setSelectedArticle] = useState<NewsPost | null>(null);

  const filteredNews = NEWS_POSTS.filter((item) => {
    if (selectedCategory === 'all') return true;
    return item.category === selectedCategory;
  });

  return (
    <div className="w-full bg-white py-6 px-4 sm:px-8 space-y-8 font-siliguri animate-in fade-in duration-300">
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
          {language === 'bn' ? 'সংবাদ ও ইভেন্ট' : 'News & Events'}
        </span>
      </div>

      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center justify-center p-3 bg-emerald-50 text-[#006a4e] rounded-full shadow-xs mb-1">
          <Newspaper className="w-7 h-7" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-serif-bn">
          {language === 'bn' ? 'সংবাদ, ইভেন্ট ও একাডেমিক বুলেটিন' : 'News, Events & Academic Bulletin'}
        </h1>
        <p className="text-sm text-gray-600">
          {language === 'bn'
            ? 'উদ্ভিদবিজ্ঞান বিভাগের একাডেমিক কার্যক্রম, সেমিনার, গবেষণা, পুনর্মিলনী ও সাফল্যের সাম্প্রতিক সংবাদ।'
            : 'Recent news, academic activities, seminars, botanical research, reunion, and achievements of Department of Botany.'}
        </p>

        {/* Category Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-[#006a4e] text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {language === 'bn' ? 'সকল সংবাদ' : 'All News'}
          </button>
          <button
            onClick={() => setSelectedCategory('academic')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === 'academic'
                ? 'bg-[#006a4e] text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {language === 'bn' ? 'একাডেমিক' : 'Academic'}
          </button>
          <button
            onClick={() => setSelectedCategory('seminar')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === 'seminar'
                ? 'bg-[#006a4e] text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {language === 'bn' ? 'সেমিনার ও সম্মেলন' : 'Seminars'}
          </button>
          <button
            onClick={() => setSelectedCategory('tour')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === 'tour'
                ? 'bg-[#006a4e] text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {language === 'bn' ? 'ফিল্ড ওয়ার্ক ও ট্যুর' : 'Field Work & Tours'}
          </button>
          <button
            onClick={() => setSelectedCategory('achievement')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === 'achievement'
                ? 'bg-[#006a4e] text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {language === 'bn' ? 'অর্জন ও সাফল্য' : 'Achievements'}
          </button>
        </div>
      </div>

      {/* Selected Article Modal / View */}
      {selectedArticle && (
        <div className="bg-[#fcfdfd] border-2 border-emerald-600/30 rounded-2xl p-6 sm:p-8 space-y-6 shadow-md relative">
          <button
            onClick={() => setSelectedArticle(null)}
            className="absolute top-4 right-4 text-xs font-bold bg-gray-200 hover:bg-gray-300 px-3 py-1.5 rounded-lg text-gray-700 transition-colors cursor-pointer"
          >
            {language === 'bn' ? 'বন্ধ করুন ✕' : 'Close ✕'}
          </button>
          <div className="flex items-center gap-3 text-xs text-emerald-800 font-semibold">
            <span className="bg-emerald-100 text-[#006a4e] px-2.5 py-0.5 rounded-full font-bold">
              {language === 'bn' ? selectedArticle.categoryBn : selectedArticle.categoryEn}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {selectedArticle.date}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 font-serif-bn leading-snug">
            {language === 'bn' ? selectedArticle.titleBn : selectedArticle.titleEn}
          </h2>
          {selectedArticle.imageUrl && (
            <div className="w-full max-h-[420px] overflow-hidden rounded-xl border border-gray-200">
              <img
                src={selectedArticle.imageUrl}
                alt="News Feature"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          )}
          <div className="text-sm sm:text-base text-gray-700 leading-relaxed space-y-4 whitespace-pre-line">
            <p>{language === 'bn' ? selectedArticle.contentBn : selectedArticle.contentEn}</p>
          </div>
          <div className="pt-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
            <span>{language === 'bn' ? `প্রতিবেদন: ${selectedArticle.authorBn}` : `Reported by: ${selectedArticle.authorEn}`}</span>
            <button
              onClick={() => {
                navigator.clipboard?.writeText(window.location.href);
                alert(language === 'bn' ? 'লিংক কপি করা হয়েছে!' : 'Link copied to clipboard!');
              }}
              className="flex items-center gap-1.5 text-[#006a4e] font-bold hover:underline cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>{language === 'bn' ? 'শেয়ার করুন' : 'Share'}</span>
            </button>
          </div>
        </div>
      )}

      {/* News Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        {filteredNews.map((item) => (
          <div
            key={item.id}
            onClick={() => setSelectedArticle(item)}
            className="bg-white border border-emerald-100 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group"
          >
            {item.imageUrl && (
              <div className="h-48 w-full overflow-hidden bg-gray-100">
                <img
                  src={item.imageUrl}
                  alt={item.titleBn}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}
            <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-emerald-700 font-semibold">
                  <span className="bg-emerald-50 text-[#006a4e] px-2.5 py-0.5 rounded-full font-bold">
                    {language === 'bn' ? item.categoryBn : item.categoryEn}
                  </span>
                  <span className="flex items-center gap-1 text-gray-500">
                    <Calendar className="w-3.5 h-3.5" />
                    {item.date}
                  </span>
                </div>
                <h3 className="text-base font-bold text-gray-900 group-hover:text-[#006a4e] transition-colors line-clamp-2">
                  {language === 'bn' ? item.titleBn : item.titleEn}
                </h3>
                <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
                  {language === 'bn' ? item.summaryBn : item.summaryEn}
                </p>
              </div>
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-[#006a4e]">
                <span>{language === 'bn' ? 'বিস্তারিত পড়ুন →' : 'Read More →'}</span>
                <span className="text-gray-500 font-normal">{language === 'bn' ? item.authorBn : item.authorEn}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
