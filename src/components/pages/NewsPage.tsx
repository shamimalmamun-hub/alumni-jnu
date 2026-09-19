import React, { useState, useEffect } from 'react';
import { ArrowLeft, FileText, Calendar, Bell, Download, Search } from 'lucide-react';
import { NOTICES_DATA, NoticeItem } from '../../data/portalData';
import { openNoticePdf } from '../../utils/noticePdfGenerator';
import { db } from '../../lib/firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';

interface NewsPageProps {
  language: 'bn' | 'en';
  onBackToHome: () => void;
}

const toBnNumber = (num: number | string): string => {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/[0-9]/g, (digit) => bnDigits[parseInt(digit, 10)]);
};

export const NewsPage: React.FC<NewsPageProps> = ({ language, onBackToHome }) => {
  const [liveNotices, setLiveNotices] = useState<NoticeItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

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
              imageUrl: data.imageUrl || '',
              pdfUrl: data.pdfUrl || '',
              pdfFileName: data.pdfFileName || '',
            };
          });
          setLiveNotices(fetched);
          setLoading(false);
        },
        (error) => {
          console.warn('News page notices listener error:', error);
          setLoading(false);
        }
      );
      return () => unsubscribe();
    } catch {
      setLoading(false);
    }
  }, []);

  const allNotices: NoticeItem[] = [...liveNotices, ...NOTICES_DATA];

  const filteredNotices = allNotices.filter((notice) => {
    if (!searchQuery.trim()) return true;
    const queryLower = searchQuery.toLowerCase();
    const title = (language === 'bn' ? notice.titleBn : notice.titleEn).toLowerCase();
    const date = (notice.date || '').toLowerCase();
    return title.includes(queryLower) || date.includes(queryLower);
  });

  const handleOpenPdf = (notice: NoticeItem, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    openNoticePdf(notice, language);
  };

  return (
    <div className="w-full bg-slate-50/50 min-h-[70vh] py-6 sm:py-10 px-4 sm:px-6 lg:px-8 font-siliguri animate-in fade-in duration-200">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Top Navigation & Breadcrumb */}
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-emerald-100/80">
          <button
            onClick={onBackToHome}
            className="flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-emerald-50 text-[#006a4e] border border-emerald-200 rounded-lg text-xs sm:text-sm font-bold transition-all shadow-2xs hover:shadow-xs cursor-pointer active:scale-98"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{language === 'bn' ? 'মূল পাতায় ফিরুন' : 'Back to Home'}</span>
          </button>
        </div>

        {/* Page Header */}
        <div className="bg-gradient-to-r from-[#006a4e] to-[#044c39] rounded-2xl p-6 sm:p-8 text-white shadow-md border-b-4 border-amber-400 relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-white/5 rounded-full pointer-events-none" />
          <div className="relative z-10 max-w-2xl space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black font-serif-bn tracking-tight">
              {language === 'bn' ? 'নোটিশ বোর্ড' : 'Notice Board'}
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-normal">
              {language === 'bn'
                ? 'অ্যালামনাই অ্যাসোসিয়েশনের সকল আনুষ্ঠানিক নোটিশের তালিকা এবং অফিসিয়াল পিডিএফ।'
                : 'Listing of all official alumni announcements, circulars, and downloadable PDFs.'}
            </p>
          </div>
        </div>

        {/* Search & Notice Count Filter Bar */}
        <div className="bg-white rounded-xl border border-gray-200 p-3.5 sm:p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'bn' ? 'নোটিশের শিরোনাম দিয়ে খুঁজুন...' : 'Search notices by title...'}
              className="w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:border-[#006a4e] focus:bg-white transition-all font-medium"
            />
          </div>

          <div className="text-xs text-gray-600 font-semibold self-end sm:self-auto">
            {language === 'bn'
              ? `মোট নোটিশ: ${toBnNumber(filteredNotices.length)} টি`
              : `Total Notices: ${filteredNotices.length}`}
          </div>
        </div>

        {/* Notice List / Table */}
        <div className="bg-white border border-emerald-100 rounded-2xl shadow-xs overflow-hidden">
          {loading ? (
            <div className="py-16 text-center text-gray-500 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-semibold text-gray-600">
                {language === 'bn' ? 'নোটিশ লোড হচ্ছে...' : 'Loading notices...'}
              </p>
            </div>
          ) : filteredNotices.length === 0 ? (
            <div className="py-16 px-4 text-center text-gray-500 flex flex-col items-center justify-center gap-3">
              <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-2xs">
                <Bell className="w-7 h-7 text-emerald-700" />
              </div>
              <h3 className="text-base font-bold text-gray-800">
                {language === 'bn' ? 'বর্তমানে কোনো নোটিশ নেই' : 'No notices available'}
              </h3>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#f0f7f3] border-b border-emerald-200/80 text-emerald-950 text-xs sm:text-sm font-bold">
                    <th className="py-3 px-4 w-16 text-center">
                      {language === 'bn' ? 'ক্রম' : 'SL'}
                    </th>
                    <th className="py-3 px-4 w-32 sm:w-36">
                      {language === 'bn' ? 'তারিখ' : 'Date'}
                    </th>
                    <th className="py-3 px-4">
                      {language === 'bn' ? 'নোটিশের শিরোনাম' : 'Notice Title'}
                    </th>
                    <th className="py-3 px-4 w-32 sm:w-40 text-center">
                      {language === 'bn' ? 'পিডিএফ ফাইল' : 'PDF File'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
                  {filteredNotices.map((notice, index) => {
                    const title = language === 'bn' ? notice.titleBn : notice.titleEn;
                    return (
                      <tr
                        key={notice.id}
                        onClick={() => handleOpenPdf(notice)}
                        className="hover:bg-[#f3f9f5] transition-colors cursor-pointer group"
                      >
                        <td className="py-4 px-4 text-center font-bold text-gray-500 group-hover:text-emerald-800">
                          {language === 'bn' ? toBnNumber(index + 1) : index + 1}
                        </td>
                        <td className="py-4 px-4 text-gray-600 font-medium whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5 text-xs text-emerald-900 bg-emerald-50 border border-emerald-200/50 px-2 py-0.5 rounded">
                            <Calendar className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                            <span>{notice.date || (language === 'bn' ? 'অদ্যাবধি' : 'N/A')}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="space-y-1">
                            <div className="font-semibold text-gray-900 group-hover:text-[#006a4e] leading-snug transition-colors">
                              {title}
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                              {notice.isNew && (
                                <span className="inline-block bg-[#e11d48] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-2xs">
                                  {language === 'bn' ? 'নতুন' : 'NEW'}
                                </span>
                              )}
                              {notice.imageUrl && (
                                <span className="inline-block bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded">
                                  📷 {language === 'bn' ? 'ছবি সংলগ্ন' : 'Image Attached'}
                                </span>
                              )}
                              {notice.pdfUrl && (
                                <span className="inline-block bg-blue-100 text-blue-800 border border-blue-300 text-[10px] font-bold px-2 py-0.5 rounded">
                                  📄 PDF {language === 'bn' ? 'নথি সংলগ্ন' : 'Attached'}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <button
                            onClick={(e) => handleOpenPdf(notice, e)}
                            className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#006a4e] to-[#044c39] hover:from-[#00553e] hover:to-[#033c2d] text-white px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer"
                            title={language === 'bn' ? 'পিডিএফ দেখুন বা ডাউনলোড করুন' : 'View or Download PDF'}
                          >
                            <FileText className="w-4 h-4 text-amber-300 shrink-0" />
                            <span>{language === 'bn' ? 'পিডিএফ' : 'PDF'}</span>
                            <Download className="w-3.5 h-3.5 opacity-80" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
