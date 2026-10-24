import React from 'react';
import { Bell, Plus, Calendar, Eye, Trash2, FileText, Download, Image as ImageIcon } from 'lucide-react';
import { openNoticePdf } from '../../../utils/noticePdfGenerator';
import { useAdminData } from '../AdminDataContext';

export const NoticesSection = () => {
  const { language, activeTab, notices, setNewNoticeModal, handleDeleteNotice } = useAdminData();

  return (
    <>
        {activeTab === 'notices' && (
          <div className="space-y-5 animate-in fade-in duration-300">
            <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-gray-900 font-serif-bn flex items-center gap-2">
                  <Bell className="w-5 h-5 text-[#006a4e]" />
                  <span>{language === 'bn' ? 'নোটিশ, বিজ্ঞপ্তি ও প্রেস রিলিজ প্রকাশনা' : 'Notices & Press Releases'}</span>
                </h2>
                <p className="text-xs text-gray-500">
                  {language === 'bn'
                    ? 'উদ্ভিদবিজ্ঞান বিভাগ ও অ্যালামনাই অ্যাসোসিয়েশনের জন্য নতুন নোটিশ ও প্রেস বিজ্ঞপ্তি প্রকাশ করুন।'
                    : 'Publish departmental announcements directly to the live website.'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setNewNoticeModal(true)}
                  className="px-4 py-2.5 bg-[#006a4e] hover:bg-[#00523d] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{language === 'bn' ? 'নতুন নোটিশ তৈরি করুন' : 'Add New Notice'}</span>
                </button>
              </div>
            </div>

            {/* Notice List */}
            <div className="space-y-3">
              {notices.length === 0 ? (
                <div className="bg-white p-12 rounded-2xl border border-emerald-100 text-center text-xs text-gray-400 space-y-2">
                  <Bell className="w-10 h-10 mx-auto text-gray-300" />
                  <p className="font-bold text-gray-600 text-sm">
                    {language === 'bn' ? 'কোনো নোটিশ তৈরি করা হয়নি' : 'No notices published yet'}
                  </p>
                  <button
                    onClick={() => setNewNoticeModal(true)}
                    className="text-xs text-[#006a4e] font-bold hover:underline"
                  >
                    {language === 'bn' ? '+ প্রথম নোটিশ প্রকাশ করুন' : '+ Publish First Notice'}
                  </button>
                </div>
              ) : (
                notices.map((n) => (
                  <div
                    key={n.id}
                    className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {n.isUrgent && (
                          <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {language === 'bn' ? 'জরুরি ঘোষণা' : 'Urgent'}
                          </span>
                        )}
                        <span className="bg-emerald-50 text-[#006a4e] border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {n.category}
                        </span>
                        <span className="text-[11px] text-gray-400 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {n.date}
                        </span>
                        {n.imageUrl && (
                          <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <ImageIcon className="w-3 h-3" />
                            <span>{language === 'bn' ? 'ছবি সংলগ্ন' : 'Image Attached'}</span>
                          </span>
                        )}
                        {n.pdfUrl && (
                          <span className="bg-blue-100 text-blue-800 border border-blue-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            <span>{language === 'bn' ? 'PDF সংলগ্ন' : 'PDF Attached'}</span>
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-base text-gray-900">{n.title}</h3>
                      <p className="text-xs text-gray-600 leading-relaxed">{n.description}</p>

                      {(n.imageUrl || n.pdfUrl) && (
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          {n.imageUrl && (
                            <img
                              src={n.imageUrl}
                              alt="Notice preview"
                              className="h-14 w-20 object-cover rounded-lg border border-emerald-200 cursor-pointer hover:opacity-90"
                              onClick={() => {
                                window.open(n.imageUrl, '_blank');
                              }}
                              title="ছবি দেখতে ক্লিক করুন"
                            />
                          )}
                          {n.pdfUrl && (
                            <a
                              href={n.pdfUrl}
                              download={n.pdfFileName || 'notice.pdf'}
                              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                            >
                              <FileText className="w-3.5 h-3.5 text-red-600" />
                              <span>{n.pdfFileName || 'PDF নথি'}</span>
                              <Download className="w-3 h-3 text-blue-600" />
                            </a>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                      <button
                        onClick={() => openNoticePdf({
                          id: n.id,
                          titleBn: n.title,
                          titleEn: n.title,
                          date: n.date,
                          isNew: !!n.isUrgent,
                          category: 'general',
                          categoryBn: n.category,
                          categoryEn: n.category,
                          refNo: n.id,
                          detailsBn: n.description,
                          detailsEn: n.description,
                          imageUrl: n.imageUrl,
                          pdfUrl: n.pdfUrl,
                          pdfFileName: n.pdfFileName
                        }, language)}
                        className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-[#006a4e] border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        title={language === 'bn' ? 'অফিসিয়াল নোটিশ দেখুন' : 'View Official Notice'}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{language === 'bn' ? 'প্রিভিউ' : 'Preview'}</span>
                      </button>
                      <button
                        onClick={() => handleDeleteNotice(n.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                        title={language === 'bn' ? 'মুছে ফেলুন' : 'Delete'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
    </>
  );
};
