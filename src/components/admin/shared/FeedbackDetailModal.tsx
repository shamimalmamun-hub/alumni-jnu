import React from 'react';
import { X, User, Info, Phone, FileText, MessageSquareHeart, Copy, Trash2 } from 'lucide-react';
import { useAdminData } from '../AdminDataContext';

export const FeedbackDetailModal = () => {
  const {
    language,
    selectedFeedback,
    setSelectedFeedback,
    handleUpdateFeedbackStatus,
    handleDeleteFeedback,
    showToast,
  } = useAdminData();

  return (
    <>
      {/* ================= MODAL: FEEDBACK FULL DETAILS ================= */}
      {selectedFeedback && (() => {
        const sName = selectedFeedback.senderName || selectedFeedback.name || (language === 'bn' ? 'নাম উল্লেখ নেই' : 'No Name');
        const sBatch = selectedFeedback.senderBatch || selectedFeedback.batch || selectedFeedback.occupation || (language === 'bn' ? 'উল্লেখ নেই' : 'Not specified');
        const sContact = selectedFeedback.senderContact || [selectedFeedback.phone, selectedFeedback.email].filter(Boolean).join(' • ') || (language === 'bn' ? 'উল্লেখ নেই' : 'Not specified');
        const sSubject = selectedFeedback.subject || (language === 'bn' ? 'সাধারণ মতামত ও পরামর্শ' : 'General Feedback');
        const sMessage = selectedFeedback.message || '';

        let dateStr = '';
        let timeStr = '';
        if (selectedFeedback.createdAt) {
          try {
            let d: Date;
            if (typeof selectedFeedback.createdAt === 'string') d = new Date(selectedFeedback.createdAt);
            else if (selectedFeedback.createdAt?.toDate && typeof selectedFeedback.createdAt.toDate === 'function') d = selectedFeedback.createdAt.toDate();
            else if (selectedFeedback.createdAt?.seconds) d = new Date(selectedFeedback.createdAt.seconds * 1000);
            else d = new Date(selectedFeedback.createdAt);

            if (!isNaN(d.getTime())) {
              dateStr = d.toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              });
              timeStr = d.toLocaleTimeString(language === 'bn' ? 'bn-BD' : 'en-US', {
                hour: '2-digit',
                minute: '2-digit'
              });
            }
          } catch {
            // ignore
          }
        }

        return (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 font-siliguri animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-7 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto border border-emerald-100">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-3.5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-xs font-black px-2.5 py-0.5 rounded-full border ${
                        selectedFeedback.status === 'resolved'
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                          : selectedFeedback.status === 'read'
                          ? 'bg-gray-100 text-gray-700 border-gray-200'
                          : 'bg-rose-100 text-rose-800 border-rose-200 animate-pulse'
                      }`}
                    >
                      {selectedFeedback.status === 'resolved'
                        ? (language === 'bn' ? 'বাস্তবায়িত / পর্যালোচিত' : 'Resolved')
                        : selectedFeedback.status === 'read'
                        ? (language === 'bn' ? 'পঠিত' : 'Read')
                        : (language === 'bn' ? 'নতুন অপঠিত' : 'New Unread')}
                    </span>
                    <span className="text-xs text-gray-500 font-mono">
                      {dateStr} {timeStr && `• ${timeStr}`}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-gray-900 font-serif-bn">
                    {language === 'bn' ? 'পরামর্শ ও মতামতের বিশদ বিবরণ' : 'Advice & Feedback Full Details'}
                  </h3>
                </div>

                <button
                  onClick={() => setSelectedFeedback(null)}
                  className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Fields Grid */}
              <div className="space-y-3">
                {/* Field 1: আপনার নাম */}
                <div className="bg-gray-50 rounded-2xl p-3.5 border border-gray-200/80 space-y-1">
                  <span className="text-xs font-bold text-gray-500 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#006a4e]" />
                    <span>{language === 'bn' ? 'আপনার নাম:' : 'Your Name:'}</span>
                  </span>
                  <div className="text-base font-black text-gray-900">
                    {sName}
                  </div>
                </div>

                {/* Two columns: Field 2 (ব্যাচ / পরিচিতি) & Field 3 (ফোন বা ইমেইল) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Field 2: ব্যাচ / পরিচিতি */}
                  <div className="bg-gray-50 rounded-2xl p-3.5 border border-gray-200/80 space-y-1">
                    <span className="text-xs font-bold text-gray-500 flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-[#006a4e]" />
                      <span>{language === 'bn' ? 'ব্যাচ / পরিচিতি:' : 'Batch / Identity:'}</span>
                    </span>
                    <div className="text-sm font-bold text-[#006a4e]">
                      {sBatch}
                    </div>
                  </div>

                  {/* Field 3: ফোন বা ইমেইল */}
                  <div className="bg-gray-50 rounded-2xl p-3.5 border border-gray-200/80 space-y-1">
                    <span className="text-xs font-bold text-gray-500 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#006a4e]" />
                      <span>{language === 'bn' ? 'ফোন বা ইমেইল:' : 'Phone or Email:'}</span>
                    </span>
                    <div className="text-sm font-bold text-gray-800">
                      {sContact.includes('@') ? (
                        <a href={`mailto:${sContact}`} className="text-emerald-700 hover:underline">
                          {sContact}
                        </a>
                      ) : /^[0-9+ -]+$/.test(sContact) ? (
                        <a href={`tel:${sContact}`} className="text-emerald-700 hover:underline">
                          {sContact}
                        </a>
                      ) : (
                        <span>{sContact}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Field 4: বিষয় */}
                <div className="bg-emerald-50/70 rounded-2xl p-3.5 border border-emerald-200 space-y-1">
                  <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#006a4e]" />
                    <span>{language === 'bn' ? 'বিষয়:' : 'Subject:'}</span>
                  </span>
                  <div className="text-sm font-black text-emerald-950">
                    {sSubject}
                  </div>
                </div>

                {/* Field 5: আপনার মূল বার্তা / পরামর্শের বিশদ বিবরণ */}
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                    <MessageSquareHeart className="w-3.5 h-3.5 text-[#006a4e]" />
                    <span>{language === 'bn' ? 'আপনার মূল বার্তা / পরামর্শের বিশদ বিবরণ:' : 'Detailed Message / Advice:'}</span>
                  </span>
                  <div className="text-sm text-gray-800 bg-white p-4 rounded-2xl border border-gray-300 leading-relaxed font-sans shadow-inner whitespace-pre-wrap select-text max-h-64 overflow-y-auto">
                    {sMessage}
                  </div>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex items-center gap-2 flex-wrap">
                  {(!selectedFeedback.status || selectedFeedback.status === 'unread') && (
                    <button
                      onClick={() => handleUpdateFeedbackStatus(selectedFeedback.id, 'read')}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                    >
                      {language === 'bn' ? 'পঠিত মার্ক করুন' : 'Mark Read'}
                    </button>
                  )}
                  {selectedFeedback.status === 'read' && (
                    <button
                      onClick={() => handleUpdateFeedbackStatus(selectedFeedback.id, 'unread')}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                    >
                      {language === 'bn' ? 'অপঠিত করুন' : 'Mark Unread'}
                    </button>
                  )}
                  {selectedFeedback.status !== 'resolved' && (
                    <button
                      onClick={() => handleUpdateFeedbackStatus(selectedFeedback.id, 'resolved')}
                      className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                    >
                      {language === 'bn' ? 'গৃহীত মার্ক করুন' : 'Mark Resolved'}
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const txt = `[উদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশন পরামর্শ ও মতামত]
আপনার নাম: ${sName}
ব্যাচ / পরিচিতি: ${sBatch}
ফোন বা ইমেইল: ${sContact}
বিষয়: ${sSubject}
জমার তারিখ ও সময়: ${dateStr} ${timeStr}

আপনার মূল বার্তা / পরামর্শের বিশদ বিবরণ:
${sMessage}`;
                      navigator.clipboard.writeText(txt);
                      showToast(language === 'bn' ? 'পরামর্শের সম্পূর্ণ বিবরণ কপি হয়েছে।' : 'Feedback copied to clipboard.');
                    }}
                    className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'কপি করুন' : 'Copy'}</span>
                  </button>
                  <button
                    onClick={() => handleDeleteFeedback(selectedFeedback.id)}
                    className="px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'মুছে ফেলুন' : 'Delete'}</span>
                  </button>
                  <button
                    onClick={() => setSelectedFeedback(null)}
                    className="px-4 py-1.5 bg-[#006a4e] hover:bg-[#00523d] text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
                  >
                    {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </>
  );
};
