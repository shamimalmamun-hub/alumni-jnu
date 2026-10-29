import React from 'react';
import { Newspaper, Plus, Calendar, FileText, Trash2 } from 'lucide-react';
import { useAdminData } from '../AdminDataContext';

export const RecentNewsSection = () => {
  const { language, activeTab, recentNewsItems, handleOpenCreateNews, handleOpenEditNews, handleDeleteNews } = useAdminData();

  return (
    <>
        {activeTab === 'recent-news' && (
          <div className="space-y-5 animate-in fade-in duration-300">
            <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900 font-serif-bn flex items-center gap-2">
                  <Newspaper className="w-5 h-5 text-[#006a4e]" />
                  <span>{language === 'bn' ? 'সাম্প্রতিক খবর পোস্ট ও ব্যবস্থাপনা' : 'Recent News Management'}</span>
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {language === 'bn'
                    ? 'ওয়েবসাইটের হোমপেইজ স্লাইডার ও সাম্প্রতিক খবর সেকশনে প্রদর্শনের জন্য খবর প্রকাশ ও সম্পাদন করুন।'
                    : 'Publish and update recent news items displayed on the website hero slider and news portal.'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleOpenCreateNews}
                  className="px-4 py-2.5 bg-[#006a4e] hover:bg-[#00523d] text-white rounded-xl text-sm font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{language === 'bn' ? 'নতুন খবর পোস্ট করুন' : 'Post New News'}</span>
                </button>
              </div>
            </div>

            {/* News List */}
            <div className="space-y-4">
              {recentNewsItems.length === 0 ? (
                <div className="bg-white p-12 rounded-2xl border border-emerald-100 text-center text-xs text-gray-400 space-y-3">
                  <Newspaper className="w-12 h-12 mx-auto text-emerald-200" />
                  <p className="font-bold text-gray-700 text-sm">
                    {language === 'bn' ? 'কোনো সাম্প্রতিক খবর প্রকাশিত হয়নি' : 'No news posts published yet'}
                  </p>
                  <div className="flex justify-center items-center gap-3 pt-2">
                    <button
                      onClick={handleOpenCreateNews}
                      className="px-4 py-2 bg-[#006a4e] text-white font-bold rounded-xl text-xs hover:bg-[#00523d] transition-colors cursor-pointer"
                    >
                      {language === 'bn' ? '+ নতুন খবর পোস্ট করুন' : '+ Post Custom News'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recentNewsItems.map((post) => (
                    <div
                      key={post.id}
                      className="bg-white rounded-2xl border border-emerald-100 p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-2.5">
                        <div className="relative h-44 w-full rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                          <img
                            src={post.imageUrl || 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=1000&q=80'}
                            alt={post.titleBn}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 left-2 bg-[#006a4e]/90 text-white text-[11px] font-bold px-2.5 py-1 rounded-md shadow-xs">
                            {post.categoryBn}
                          </div>
                          <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] font-medium px-2 py-0.5 rounded-md flex items-center gap-1 backdrop-blur-xs">
                            <Calendar className="w-3 h-3 text-amber-300" />
                            <span>{post.date}</span>
                          </div>
                        </div>

                        <h3 className="font-bold text-sm sm:text-base text-gray-900 font-serif-bn leading-snug line-clamp-2">
                          {post.titleBn}
                        </h3>

                        <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
                          {post.summaryBn}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <span className="text-[11px] text-gray-400 font-mono">
                          ID: {post.id}
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenEditNews(post)}
                            className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5 text-amber-700" />
                            <span>{language === 'bn' ? 'সম্পাদনা' : 'Edit'}</span>
                          </button>

                          <button
                            onClick={() => handleDeleteNews(post.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                            title={language === 'bn' ? 'মুছে ফেলুন' : 'Delete'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
    </>
  );
};
