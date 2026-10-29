import React from 'react';
import { MessageSquare, Search, X, Inbox, Calendar, User, Info, Phone, FileText, MessageSquareHeart, Eye, Copy, Trash2, Mail } from 'lucide-react';
import { useAdminData } from '../AdminDataContext';

export const FeedbacksSection = () => {
  const {
    language,
    activeTab,
    feedbacks,
    unreadFeedbacksCount,
    feedbackSearch,
    setFeedbackSearch,
    feedbackStatusFilter,
    setFeedbackStatusFilter,
    handleUpdateFeedbackStatus,
    handleDeleteFeedback,
    handleOpenEmailModal,
    setSelectedFeedback,
    showToast,
  } = useAdminData();

  return (
    <>
        {activeTab === 'feedbacks' && (
          <div className="space-y-5 animate-in fade-in duration-300">
            {/* Header Banner */}
            <div className="bg-gradient-to-br from-[#004d38] via-[#005a40] to-[#003828] text-white p-5 sm:p-6 rounded-2xl border-2 border-emerald-500/30 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-lg sm:text-xl font-black font-serif-bn flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-amber-300 shrink-0" />
                  <span>{language === 'bn' ? 'উদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশন পরামর্শ ও মতামত বক্স' : 'Botany Alumni Association Advice & Feedback Box'}</span>
                </h2>
                <p className="text-xs text-emerald-100/90 font-normal">
                  {language === 'bn'
                    ? 'হোমপেইজের পরামর্শ ফরম থেকে জমাকৃত সকল বার্তা, নাম, ব্যাচ, যোগাযোগ ও বিশদ বিবরণ।'
                    : 'All advice and messages submitted via the homepage portal.'}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                <span className="bg-white/10 text-white font-mono text-xs px-3 py-1.5 rounded-xl border border-white/20">
                  মোট: {feedbacks.length} টি
                </span>
                {unreadFeedbacksCount > 0 && (
                  <span className="bg-rose-500 text-white font-mono text-xs px-3 py-1.5 rounded-xl font-bold animate-pulse">
                    {unreadFeedbacksCount} টি অপঠিত
                  </span>
                )}
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Search input */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={feedbackSearch}
                  onChange={(e) => setFeedbackSearch(e.target.value)}
                  placeholder={language === 'bn' ? 'নাম, ব্যাচ, ফোন/ইমেইল বা বিষয় দিয়ে খুঁজুন...' : 'Search by name, batch, phone, email, subject...'}
                  className="w-full pl-9 pr-8 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 bg-gray-50 focus:bg-white transition-colors"
                />
                {feedbackSearch && (
                  <button
                    onClick={() => setFeedbackSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Status Filter Buttons */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                <button
                  onClick={() => setFeedbackStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors whitespace-nowrap ${
                    feedbackStatusFilter === 'all'
                      ? 'bg-[#006a4e] text-white shadow-xs'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {language === 'bn' ? `সকল (${feedbacks.length})` : `All (${feedbacks.length})`}
                </button>
                <button
                  onClick={() => setFeedbackStatusFilter('unread')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors whitespace-nowrap ${
                    feedbackStatusFilter === 'unread'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-rose-50 hover:bg-rose-100 text-rose-700'
                  }`}
                >
                  {language === 'bn' ? `নতুন অপঠিত (${unreadFeedbacksCount})` : `Unread (${unreadFeedbacksCount})`}
                </button>
                <button
                  onClick={() => setFeedbackStatusFilter('read')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors whitespace-nowrap ${
                    feedbackStatusFilter === 'read'
                      ? 'bg-gray-700 text-white shadow-xs'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {language === 'bn'
                    ? `পঠিত (${feedbacks.filter((f) => f.status === 'read').length})`
                    : `Read (${feedbacks.filter((f) => f.status === 'read').length})`}
                </button>
                <button
                  onClick={() => setFeedbackStatusFilter('resolved')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors whitespace-nowrap ${
                    feedbackStatusFilter === 'resolved'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {language === 'bn'
                    ? `গৃহীত (${feedbacks.filter((f) => f.status === 'resolved').length})`
                    : `Resolved (${feedbacks.filter((f) => f.status === 'resolved').length})`}
                </button>
              </div>
            </div>

            {/* Content List */}
            {feedbacks.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-emerald-100 text-center text-xs text-gray-400 space-y-3">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 text-[#006a4e] flex items-center justify-center">
                  <Inbox className="w-7 h-7 stroke-[2]" />
                </div>
                <p className="font-bold text-gray-600 text-sm">
                  {language === 'bn' ? 'কোনো পরামর্শ ও মতামত জমা পড়েনি' : 'No suggestions received yet'}
                </p>
              </div>
            ) : (() => {
              const displayList = feedbacks.filter((f) => {
                if (feedbackStatusFilter === 'unread' && f.status && f.status !== 'unread') return false;
                if (feedbackStatusFilter === 'read' && f.status !== 'read') return false;
                if (feedbackStatusFilter === 'resolved' && f.status !== 'resolved') return false;

                if (feedbackSearch.trim()) {
                  const q = feedbackSearch.toLowerCase().trim();
                  const sName = (f.senderName || f.name || '').toLowerCase();
                  const sBatch = (f.senderBatch || f.batch || f.occupation || '').toLowerCase();
                  const sContact = (f.senderContact || [f.phone, f.email].filter(Boolean).join(' ') || '').toLowerCase();
                  const sSubject = (f.subject || '').toLowerCase();
                  const sMessage = (f.message || '').toLowerCase();
                  return sName.includes(q) || sBatch.includes(q) || sContact.includes(q) || sSubject.includes(q) || sMessage.includes(q);
                }
                return true;
              });

              if (displayList.length === 0) {
                return (
                  <div className="bg-white p-10 rounded-2xl border border-gray-200 text-center text-xs text-gray-400 space-y-2">
                    <p className="font-bold text-gray-600 text-sm">
                      {language === 'bn' ? 'এই ফিল্টারে কোনো বার্তা পাওয়া যায়নি' : 'No feedback matches this filter'}
                    </p>
                    <button
                      onClick={() => { setFeedbackSearch(''); setFeedbackStatusFilter('all'); }}
                      className="text-emerald-700 font-bold hover:underline cursor-pointer"
                    >
                      {language === 'bn' ? 'ফিল্টার রিসেট করুন' : 'Reset Filter'}
                    </button>
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5">
                  {displayList.map((f) => {
                    const sName = f.senderName || f.name || (language === 'bn' ? 'নাম উল্লেখ নেই' : 'No Name');
                    const sBatch = f.senderBatch || f.batch || f.occupation || (language === 'bn' ? 'উল্লেখ নেই' : 'Not specified');
                    const sContact = f.senderContact || [f.phone, f.email].filter(Boolean).join(' • ') || (language === 'bn' ? 'উল্লেখ নেই' : 'Not specified');
                    const sSubject = f.subject || (language === 'bn' ? 'সাধারণ মতামত ও পরামর্শ' : 'General Feedback');
                    const sMessage = f.message || '';

                    // Timestamp parsing
                    let dateStr = '';
                    let timeStr = '';
                    if (f.createdAt) {
                      try {
                        let d: Date;
                        if (typeof f.createdAt === 'string') d = new Date(f.createdAt);
                        else if (f.createdAt?.toDate && typeof f.createdAt.toDate === 'function') d = f.createdAt.toDate();
                        else if (f.createdAt?.seconds) d = new Date(f.createdAt.seconds * 1000);
                        else d = new Date(f.createdAt);

                        if (!isNaN(d.getTime())) {
                          dateStr = d.toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', {
                            year: 'numeric',
                            month: 'short',
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
                      <div
                        key={f.id}
                        className={`bg-white rounded-2xl border transition-all flex flex-col justify-between shadow-xs hover:shadow-md p-4 sm:p-5 space-y-3.5 ${
                          !f.status || f.status === 'unread'
                            ? 'border-emerald-400 bg-emerald-50/15 ring-1 ring-emerald-300'
                            : 'border-gray-200 hover:border-emerald-200'
                        }`}
                      >
                        <div className="space-y-3">
                          {/* Card Top: Status & Date/Time */}
                          <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-2.5">
                            <span
                              className={`text-[10px] sm:text-[11px] font-black px-2.5 py-0.5 rounded-full border ${
                                f.status === 'resolved'
                                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                  : f.status === 'read'
                                  ? 'bg-gray-100 text-gray-700 border-gray-200'
                                  : 'bg-rose-100 text-rose-800 border-rose-200 animate-pulse'
                              }`}
                            >
                              {f.status === 'resolved'
                                ? (language === 'bn' ? 'বাস্তবায়িত / পর্যালোচিত' : 'Resolved')
                                : f.status === 'read'
                                ? (language === 'bn' ? 'পঠিত' : 'Read')
                                : (language === 'bn' ? 'নতুন অপঠিত' : 'New Unread')}
                            </span>

                            <div className="text-[10px] sm:text-[11px] text-gray-500 font-mono flex items-center gap-1 shrink-0">
                              <Calendar className="w-3 h-3 text-gray-400" />
                              <span>{dateStr || '—'}</span>
                              {timeStr && <span className="text-gray-400">({timeStr})</span>}
                            </div>
                          </div>

                          {/* Field 1: আপনার নাম */}
                          <div className="bg-gray-50/90 rounded-xl p-2.5 border border-gray-100 space-y-0.5">
                            <span className="text-[10px] font-bold text-gray-500 flex items-center gap-1">
                              <User className="w-3 h-3 text-[#006a4e]" />
                              <span>{language === 'bn' ? 'আপনার নাম:' : 'Name:'}</span>
                            </span>
                            <h3 className="font-bold text-sm text-gray-900 leading-tight">
                              {sName}
                            </h3>
                          </div>

                          {/* Two Column Grid: Field 2 (ব্যাচ / পরিচিতি) & Field 3 (ফোন বা ইমেইল) */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {/* Field 2: ব্যাচ / পরিচিতি */}
                            <div className="bg-gray-50/90 rounded-xl p-2.5 border border-gray-100 space-y-0.5">
                              <span className="text-[10px] font-bold text-gray-500 flex items-center gap-1">
                                <Info className="w-3 h-3 text-[#006a4e]" />
                                <span>{language === 'bn' ? 'ব্যাচ / পরিচিতি:' : 'Batch / Identity:'}</span>
                              </span>
                              <div className="text-xs font-bold text-[#006a4e] truncate" title={sBatch}>
                                {sBatch}
                              </div>
                            </div>

                            {/* Field 3: ফোন বা ইমেইল */}
                            <div className="bg-gray-50/90 rounded-xl p-2.5 border border-gray-100 space-y-0.5">
                              <span className="text-[10px] font-bold text-gray-500 flex items-center gap-1">
                                <Phone className="w-3 h-3 text-[#006a4e]" />
                                <span>{language === 'bn' ? 'ফোন বা ইমেইল:' : 'Phone / Email:'}</span>
                              </span>
                              <div className="text-xs font-bold text-gray-800 truncate" title={sContact}>
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
                          <div className="bg-emerald-50/60 rounded-xl p-2.5 border border-emerald-200/80 space-y-0.5">
                            <span className="text-[10px] font-bold text-emerald-800 flex items-center gap-1">
                              <FileText className="w-3 h-3 text-[#006a4e]" />
                              <span>{language === 'bn' ? 'বিষয়:' : 'Subject:'}</span>
                            </span>
                            <div className="text-xs font-black text-emerald-950 leading-snug">
                              {sSubject}
                            </div>
                          </div>

                          {/* Field 5: আপনার মূল বার্তা / পরামর্শের বিশদ বিবরণ */}
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-gray-600 flex items-center gap-1">
                              <MessageSquareHeart className="w-3 h-3 text-[#006a4e]" />
                              <span>{language === 'bn' ? 'আপনার মূল বার্তা / পরামর্শের বিশদ বিবরণ:' : 'Detailed Advice / Message:'}</span>
                            </span>
                            <div className="text-xs text-gray-800 bg-gray-50/80 p-3 rounded-xl border border-gray-200 leading-relaxed max-h-40 overflow-y-auto whitespace-pre-wrap font-sans select-text">
                              {sMessage}
                            </div>
                          </div>
                        </div>

                        {/* Card Bottom: Actions */}
                        <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-1.5 flex-wrap text-xs">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {(!f.status || f.status === 'unread') && (
                              <button
                                onClick={() => handleUpdateFeedbackStatus(f.id, 'read')}
                                className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-[11px] font-bold cursor-pointer transition-colors"
                              >
                                {language === 'bn' ? 'পঠিত' : 'Mark Read'}
                              </button>
                            )}
                            {f.status === 'read' && (
                              <button
                                onClick={() => handleUpdateFeedbackStatus(f.id, 'unread')}
                                className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-[11px] font-bold cursor-pointer transition-colors"
                              >
                                {language === 'bn' ? 'অপঠিত' : 'Unread'}
                              </button>
                            )}
                            {f.status !== 'resolved' && (
                              <button
                                onClick={() => handleUpdateFeedbackStatus(f.id, 'resolved')}
                                className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg text-[11px] font-bold cursor-pointer transition-colors"
                              >
                                {language === 'bn' ? 'গৃহীত' : 'Resolved'}
                              </button>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            {(f.email || sContact.includes('@')) && (
                              <button
                                onClick={() =>
                                  handleOpenEmailModal({
                                    name: sName,
                                    email: f.email || (sContact.includes('@') ? sContact : ''),
                                  })
                                }
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors"
                                title={language === 'bn' ? 'ইমেইল পাঠান' : 'Send Email'}
                              >
                                <Mail className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => setSelectedFeedback(f)}
                              className="p-1.5 text-[#006a4e] hover:bg-emerald-50 rounded-lg cursor-pointer transition-colors"
                              title={language === 'bn' ? 'পূর্ণাঙ্গ বিবরণ দেখুন' : 'View Full Details'}
                            >
                              <Eye className="w-4 h-4" />
                            </button>
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
                              className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
                              title={language === 'bn' ? 'কপি করুন' : 'Copy'}
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteFeedback(f.id)}
                              className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                              title={language === 'bn' ? 'মুছে ফেলুন' : 'Delete'}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}
    </>
  );
};
