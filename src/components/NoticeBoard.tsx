import React, { useState } from 'react';
import { FileText, Calendar, ChevronRight, Search, Download, Filter, Eye, GraduationCap, BookOpen, Leaf, Sprout } from 'lucide-react';
import { NOTICES_DATA, NoticeItem } from '../data/portalData';

interface NoticeBoardProps {
  language: 'bn' | 'en';
  onSelectNotice: (notice: NoticeItem) => void;
  onViewAllNotices: () => void;
  onOpenSpeechModal?: (personType: 'paurashava_president' | 'paurashava_general_secretary') => void;
}

export const NoticeBoard: React.FC<NoticeBoardProps> = ({
  language,
  onSelectNotice,
  onViewAllNotices,
  onOpenSpeechModal,
}) => {
  const filteredNotices = NOTICES_DATA;

  return (
    <div id="notice-board-card" className="bg-white border border-[#b2cfb8] rounded-xl shadow-md overflow-hidden flex flex-col h-full font-siliguri">
      {/* Botanical Green Header */}
      <div className="bg-gradient-to-r from-[#07361f] via-[#15803d] to-[#0a4729] text-white px-4 py-3 flex items-center justify-between border-b border-emerald-500/30">
        <div className="flex items-center gap-2.5 font-bold text-base md:text-lg tracking-wide">
          <div className="p-1 rounded bg-white/10 text-emerald-300">
            <Leaf className="w-5 h-5" />
          </div>
          <div>
            <h2 className="leading-tight">{language === 'bn' ? 'অ্যালামনাই নোটিশ বোর্ড' : 'Alumni Notice Board'}</h2>
            <p className="text-[11px] text-emerald-200/90 font-normal">
              {language === 'bn' ? 'উদ্ভিদবিজ্ঞান বিভাগ, জগন্নাথ বিশ্ববিদ্যালয়' : 'Dept. of Botany, Jagannath University'}
            </p>
          </div>
        </div>
      </div>

      {/* Notice List Container */}
      <div className="divide-y divide-[#edf4ee] overflow-y-auto max-h-[380px] sm:max-h-[420px] bg-white">
        {filteredNotices.length === 0 ? (
          <div className="py-8 text-center text-gray-500 text-xs">
            {language === 'bn' ? 'কোনো নোটিশ পাওয়া যায়নি' : 'No notices found.'}
          </div>
        ) : (
          filteredNotices.map((notice) => {
            const title = language === 'bn' ? notice.titleBn : notice.titleEn;
            const categoryName = language === 'bn' ? notice.categoryBn : notice.categoryEn;

            return (
              <div
                key={notice.id}
                onClick={() => onSelectNotice(notice)}
                className="p-3 hover:bg-[#f1f8f3] transition-colors cursor-pointer flex items-start justify-between gap-3 group"
              >
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 bg-[#e8f5ec] text-[#0d5932] text-[10px] font-bold px-2 py-0.5 rounded border border-[#b8dfc4]">
                      <Sprout className="w-2.5 h-2.5 text-[#16a34a]" />
                      <span>{categoryName}</span>
                    </span>
                    <span className="text-[11px] text-gray-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      {notice.date}
                    </span>
                  </div>

                  <h3 className="text-xs sm:text-[13px] font-medium text-gray-800 group-hover:text-[#0b4d2b] group-hover:font-semibold leading-relaxed line-clamp-2 transition-colors">
                    {title}
                  </h3>

                  <div className="flex items-center gap-2 pt-0.5">
                    {notice.isNew ? (
                      <span className="bg-[#e11d48] text-white text-[11px] font-bold px-2 py-0.5 rounded shadow-2xs">
                        {language === 'bn' ? 'নতুন' : 'NEW'}
                      </span>
                    ) : (
                      <span className="bg-[#6b7280] text-white text-[11px] font-medium px-2 py-0.5 rounded">
                        {language === 'bn' ? 'সাধারণ' : 'General'}
                      </span>
                    )}

                    <span className="hidden sm:inline text-emerald-800 font-mono text-[11px]">
                      {notice.refNo}
                    </span>
                  </div>
                </div>

                <Eye className="w-4 h-4 text-gray-400 group-hover:text-[#006a4e] shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            );
          })
        )}
      </div>

      {/* Footer link */}
      <div className="p-3 bg-[#e8f3ea] border-t border-[#c5dbc5] text-center flex flex-col items-center gap-3">
        <button
          id="btn-notice-footer-more"
          onClick={onViewAllNotices}
          className="bg-[#15803d] hover:bg-[#0f5f2c] text-white font-bold text-xs sm:text-sm py-2 px-5 rounded-md shadow-sm transition-all inline-flex items-center gap-2 cursor-pointer hover:shadow-md active:scale-95"
        >
          <span>{language === 'bn' ? 'সকল একাডেমিক নোটিশ দেখতে এখানে ক্লিক করুন' : 'Click here to view all academic notices'}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
