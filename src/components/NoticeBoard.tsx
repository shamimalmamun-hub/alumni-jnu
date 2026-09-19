import React, { useState, useEffect } from 'react';
import { Calendar, ChevronRight, Leaf, Sprout, FileText, Bell } from 'lucide-react';
import { NOTICES_DATA, NoticeItem } from '../data/portalData';
import { openNoticePdf } from '../utils/noticePdfGenerator';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

interface NoticeBoardProps {
  language: 'bn' | 'en';
  onSelectNotice?: (notice: NoticeItem) => void;
  onViewAllNotices: () => void;
  onOpenSpeechModal?: (personType: 'paurashava_president' | 'paurashava_general_secretary') => void;
}

export const NoticeBoard: React.FC<NoticeBoardProps> = ({
  language,
  onSelectNotice,
  onViewAllNotices,
}) => {
  const [liveNotices, setLiveNotices] = useState<NoticeItem[]>([]);

  useEffect(() => {
    try {
      const q = query(collection(db, 'notices'));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const fetched: NoticeItem[] = snapshot.docs.map((docSnap) => {
            const data = docSnap.data();
            return {
              id: docSnap.id,
              titleBn: data.title || '',
              titleEn: data.title || '',
              date: data.date || '',
              isNew: !!data.isUrgent,
              category: 'general',
              categoryBn: data.category || 'সাধারণ নোটিশ',
              categoryEn: data.category || 'General Notice',
              refNo: docSnap.id,
              detailsBn: data.description || '',
              detailsEn: data.description || '',
            };
          });
          setLiveNotices(fetched);
        },
        (error) => {
          console.warn('Notice real-time listener error:', error);
        }
      );
      return () => unsubscribe();
    } catch {
      // Fallback
    }
  }, []);

  const filteredNotices = [...liveNotices, ...NOTICES_DATA];

  const handleNoticeClick = (notice: NoticeItem) => {
    // Directly open PDF in a new tab without showing any popup modal
    openNoticePdf(notice, language);
  };

  return (
    <div id="notice-board-card" className="bg-white border border-[#b2cfb8] rounded-xl shadow-md overflow-hidden flex flex-col h-full font-siliguri">
      {/* Botanical Green Header */}
      <div className="bg-gradient-to-r from-[#07361f] via-[#15803d] to-[#0a4729] text-white px-4 py-3 flex items-center justify-between border-b border-emerald-500/30">
        <div className="flex items-center gap-2.5 font-bold text-base md:text-lg tracking-wide">
          <div className="p-1 rounded bg-white/10 text-emerald-300">
            <Leaf className="w-5 h-5" />
          </div>
          <div>
            <h2 className="leading-tight text-base sm:text-lg font-bold">{language === 'bn' ? 'অ্যালামনাই নোটিশ বোর্ড' : 'Alumni Notice Board'}</h2>
          </div>
        </div>
      </div>

      {/* Notice List Container */}
      <div className="divide-y divide-[#edf4ee] overflow-y-auto max-h-[380px] sm:max-h-[420px] bg-white">
        {filteredNotices.length === 0 ? (
          <div className="py-12 px-4 text-center text-gray-500 flex flex-col items-center justify-center gap-2.5">
            <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-2xs">
              <Bell className="w-6 h-6 text-emerald-700" />
            </div>
            <p className="text-sm font-bold text-gray-700">
              {language === 'bn' ? 'বর্তমানে কোনো নোটিশ নেই' : 'No notices published yet'}
            </p>
            <p className="text-xs text-gray-500 max-w-xs">
              {language === 'bn'
                ? 'অ্যালামনাই অ্যাসোসিয়েশনের নতুন নোটিশ প্রকাশিত হলে এখানে দেখতে পাবেন।'
                : 'New official announcements will appear here once published.'}
            </p>
          </div>
        ) : (
          filteredNotices.map((notice) => {
            const title = language === 'bn' ? notice.titleBn : notice.titleEn;
            const categoryName = language === 'bn' ? notice.categoryBn : notice.categoryEn;

            return (
              <div
                key={notice.id}
                onClick={() => handleNoticeClick(notice)}
                className="p-3 sm:p-3.5 hover:bg-[#f1f8f3] transition-colors cursor-pointer flex items-start justify-between gap-3 group"
              >
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 bg-[#e8f5ec] text-[#0d5932] text-[11px] font-bold px-2 py-0.5 rounded border border-[#b8dfc4]">
                      <Sprout className="w-2.5 h-2.5 text-[#16a34a]" />
                      <span>{categoryName}</span>
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-1 font-medium">
                      <Calendar className="w-3 h-3 text-emerald-700" />
                      {notice.date}
                    </span>
                  </div>

                  <h3 className="text-xs sm:text-sm font-semibold text-gray-900 group-hover:text-[#0b4d2b] leading-snug line-clamp-2 transition-colors">
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

                    {notice.imageUrl && (
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded border border-emerald-300">
                        📷 {language === 'bn' ? 'ছবি' : 'Image'}
                      </span>
                    )}
                    {notice.pdfUrl && (
                      <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-1.5 py-0.5 rounded border border-blue-300">
                        📄 PDF
                      </span>
                    )}

                    <span className="hidden sm:inline text-emerald-800 font-mono text-xs font-semibold">
                      {notice.refNo}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[#006a4e] shrink-0 mt-1 opacity-80 group-hover:opacity-100 transition-opacity">
                  <span className="hidden sm:inline text-[11px] font-bold bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                    {notice.pdfUrl ? 'নথি / PDF' : 'PDF'}
                  </span>
                  <FileText className="w-4 h-4" />
                </div>
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
          <span>{language === 'bn' ? 'সকল নোটিশ দেখতে ক্লিক করুন' : 'Click to view all notices'}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
