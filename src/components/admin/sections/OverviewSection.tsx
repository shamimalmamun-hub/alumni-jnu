import React from 'react';
import { CheckCircle2, Clock, CircleOff, DollarSign, HeartHandshake, Inbox, Award } from 'lucide-react';
import { useAdminData } from '../AdminDataContext';
import { MemberApplications } from '../shared/MemberApplications';

export const OverviewSection = () => {
  const {
    language,
    activeTab,
    navigateTab,
    pendingCount,
    approvedCount,
    lifetimeCount,
    totalDonationAmount,
    allDonations,
    totalFees,
    paidCount,
    feedbacks,
    unreadFeedbacksCount,
  } = useAdminData();

  return (
    <>
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Welcome banner */}
            <div className="bg-gradient-to-r from-[#004d38] via-[#006a4e] to-[#003828] text-white p-6 sm:p-7 rounded-2xl shadow-lg border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden">
              {/* Background decorative glow */}
              <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="space-y-2 relative z-10 max-w-3xl">
                <h2 className="text-2xl sm:text-3xl font-black font-serif-bn text-white tracking-wide">
                  {language === 'bn' ? 'অ্যালামনাই ও সদস্যপদ কেন্দ্রীয় ডাটাবেজ' : 'Alumni & Membership Central Control'}
                </h2>
                <p className="text-emerald-100/90 text-xs sm:text-sm font-medium leading-relaxed">
                  {language === 'bn' 
                    ? 'জগন্নাথ বিশ্ববিদ্যালয় উদ্ভিদবিজ্ঞান বিভাগের রেজিস্ট্রেশন, সদস্যপদ অনুমোদন ও তথ্য ব্যবস্থাপনাসমূহ নিয়ন্ত্রণের কেন্দ্রীয় অ্যাডমিন প্যানেল।'
                    : 'Central administration panel for managing registrations, memberships, donations, and notifications.'}
                </p>
              </div>
            </div>

            {/* Metrics cards grid - 3 cards top, 3 cards bottom */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {/* Card 1: Unregistered (Pending) */}
              <div
                onClick={() => navigateTab('unregistered')}
                className="bg-white p-4 sm:p-5 rounded-2xl border-2 border-amber-400 shadow-md shadow-amber-900/10 hover:shadow-xl hover:shadow-amber-900/15 space-y-2.5 transition-all transform hover:-translate-y-0.5 relative overflow-hidden group cursor-pointer min-w-0"
              >
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 to-amber-500" />
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs sm:text-xs font-black tracking-wide text-amber-950 whitespace-nowrap truncate min-w-0">
                    {language === 'bn' ? 'অনিবন্ধিত সদস্য তালিকা' : 'Unregistered Members'}
                  </span>
                  <div className="p-2 rounded-xl bg-amber-100 text-amber-900 shadow-xs group-hover:scale-105 transition-transform shrink-0">
                    <Clock className="w-4 h-4 stroke-[2.5]" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-amber-950 font-mono tracking-tight drop-shadow-xs">
                  {pendingCount}
                </div>
                <div className="text-[11px] font-extrabold flex items-center justify-between gap-1 pt-2 border-t-2 border-amber-100 whitespace-nowrap">
                  <span className="text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 text-[10px] font-bold truncate shrink-0">
                    {language === 'bn' ? 'যাচাই প্রয়োজন' : 'Needs Verification'}
                  </span>
                  <span className="text-amber-700 font-bold text-[11px] shrink-0">ক্লিক করুন →</span>
                </div>
              </div>

              {/* Card 2: Registered (Approved) */}
              <div
                onClick={() => navigateTab('registered')}
                className="bg-white p-4 sm:p-5 rounded-2xl border-2 border-emerald-500/40 shadow-md shadow-emerald-900/10 hover:shadow-xl hover:shadow-emerald-900/15 space-y-2.5 transition-all transform hover:-translate-y-0.5 relative overflow-hidden group cursor-pointer min-w-0"
              >
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-600" />
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs sm:text-xs font-black tracking-wide text-emerald-950 whitespace-nowrap truncate min-w-0">
                    {language === 'bn' ? 'নিবন্ধিত সদস্য তালিকা' : 'Registered Members'}
                  </span>
                  <div className="p-2 rounded-xl bg-emerald-100/90 text-[#006a4e] shadow-xs group-hover:scale-105 transition-transform shrink-0">
                    <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-950 font-mono tracking-tight drop-shadow-xs">
                  {approvedCount}
                </div>
                <div className="text-[11px] font-extrabold flex items-center justify-between gap-1 pt-2 border-t-2 border-emerald-100 whitespace-nowrap">
                  <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 text-[10px] font-bold truncate shrink-0">
                    {language === 'bn' ? 'সক্রিয় সদস্য' : 'Active Members'}
                  </span>
                  <span className="text-emerald-700 font-bold text-[11px] shrink-0">ক্লিক করুন →</span>
                </div>
              </div>

              {/* Card 2.5: Lifetime Members (আজীবন সদস্য তালিকা) */}
              <div
                onClick={() => navigateTab('lifetime')}
                className="bg-white p-4 sm:p-5 rounded-2xl border-2 border-amber-500/60 shadow-md shadow-amber-900/10 hover:shadow-xl hover:shadow-amber-900/15 space-y-2.5 transition-all transform hover:-translate-y-0.5 relative overflow-hidden group cursor-pointer min-w-0"
              >
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-600" />
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs sm:text-xs font-black tracking-wide text-amber-950 whitespace-nowrap truncate min-w-0">
                    {language === 'bn' ? 'আজীবন সদস্য তালিকা' : 'Lifetime Members'}
                  </span>
                  <div className="p-2 rounded-xl bg-amber-100 text-amber-900 shadow-xs group-hover:scale-105 transition-transform shrink-0">
                    <Award className="w-4 h-4 stroke-[2.5]" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-amber-950 font-mono tracking-tight drop-shadow-xs">
                  {lifetimeCount}
                </div>
                <div className="text-[11px] font-extrabold flex items-center justify-between gap-1 pt-2 border-t-2 border-amber-100 whitespace-nowrap">
                  <span className="text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 text-[10px] font-bold truncate shrink-0">
                    {language === 'bn' ? 'আজীবন (৳২৫০০)' : 'Life Member'}
                  </span>
                  <span className="text-amber-700 font-bold text-[11px] shrink-0">ক্লিক করুন →</span>
                </div>
              </div>

              {/* Card 3: Donation Fees (ডোনেশন ফি) */}
              <div
                id="admin-donation-fee-box"
                onClick={() => navigateTab('donations')}
                className="bg-white p-4 sm:p-5 rounded-2xl border-2 border-rose-500/50 shadow-md shadow-rose-900/10 hover:shadow-xl hover:shadow-rose-900/15 space-y-2.5 transition-all transform hover:-translate-y-0.5 relative overflow-hidden group cursor-pointer min-w-0"
              >
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500" />
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1 min-w-0">
                    <span className="text-xs sm:text-xs font-black tracking-wide text-rose-950 whitespace-nowrap truncate min-w-0">
                      {language === 'bn' ? 'ডোনেশন ফি' : 'Donation Fee'}
                    </span>
                    <span className="text-[10px] bg-rose-100 text-rose-800 font-black px-1.5 py-0.2 rounded-full whitespace-nowrap shrink-0">
                      তহবিল
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-rose-100/90 text-rose-800 shadow-xs group-hover:scale-105 transition-transform shrink-0">
                    <HeartHandshake className="w-4 h-4 stroke-[2.5]" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-rose-950 font-mono tracking-tight drop-shadow-xs">
                  ৳ {totalDonationAmount.toLocaleString('bn-BD')}
                </div>
                <div className="text-[11px] font-extrabold flex items-center justify-between gap-1 pt-2 border-t-2 border-rose-100 whitespace-nowrap">
                  <span className="text-rose-900 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 text-[10px] font-bold truncate shrink-0">
                    {allDonations.length} {language === 'bn' ? 'টি ডোনেশন' : 'Donations'}
                  </span>
                  <span className="text-rose-700 font-bold text-[11px] shrink-0">
                    {language === 'bn' ? 'বিস্তারিত →' : 'Details →'}
                  </span>
                </div>
              </div>

              {/* Card 4: Total Reg Fees Collected */}
              <div
                onClick={() => navigateTab('memberships')}
                className="bg-white p-4 sm:p-5 rounded-2xl border-2 border-amber-500/40 shadow-md shadow-amber-900/10 hover:shadow-xl hover:shadow-amber-900/15 space-y-2.5 transition-all transform hover:-translate-y-0.5 relative overflow-hidden group cursor-pointer min-w-0"
              >
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-amber-500 to-emerald-600" />
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs sm:text-xs font-black tracking-wide text-amber-950 whitespace-nowrap truncate min-w-0">
                    {language === 'bn' ? 'সংগৃহীত নিবন্ধন ফি' : 'Reg Fees'}
                  </span>
                  <div className="p-2 rounded-xl bg-amber-100/90 text-amber-800 shadow-xs group-hover:scale-105 transition-transform shrink-0">
                    <DollarSign className="w-4 h-4 stroke-[2.5]" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-[#006a4e] font-mono tracking-tight drop-shadow-xs">
                  ৳ {totalFees.toLocaleString('bn-BD')}
                </div>
                <div className="text-[11px] font-extrabold flex items-center justify-between gap-1 pt-2 border-t-2 border-amber-100 whitespace-nowrap">
                  <span className="text-gray-700 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-200 text-[10px] font-bold truncate shrink-0">
                    {language === 'bn' ? 'নিবন্ধন ফি' : 'Reg Fee'}
                  </span>
                  <span className="text-emerald-800 bg-emerald-100/80 px-1.5 py-0.5 rounded border border-emerald-300 font-mono font-black text-[10px] shrink-0">
                    {paidCount} {language === 'bn' ? 'পেইড' : 'Paid'}
                  </span>
                </div>
              </div>

              {/* Card 5: Advice & Suggestions from Homepage */}
              <div
                onClick={() => navigateTab('feedbacks')}
                className="bg-white p-4 sm:p-5 rounded-2xl border-2 border-teal-500/40 shadow-md shadow-teal-900/10 hover:shadow-xl hover:shadow-teal-900/15 space-y-2.5 transition-all transform hover:-translate-y-0.5 relative overflow-hidden group cursor-pointer min-w-0"
              >
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 to-emerald-600" />
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs sm:text-xs font-black tracking-wide text-teal-950 whitespace-nowrap truncate min-w-0">
                    {language === 'bn' ? 'পরামর্শ ও মতামত' : 'Advice & Feedback'}
                  </span>
                  <div className="p-2 rounded-xl bg-teal-100/90 text-teal-800 shadow-xs group-hover:scale-105 transition-transform shrink-0">
                    <Inbox className="w-4 h-4 stroke-[2.5]" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-teal-950 font-mono tracking-tight drop-shadow-xs">
                  {feedbacks.length}
                </div>
                <div className="text-[11px] font-extrabold flex items-center justify-between gap-1 pt-2 border-t-2 border-teal-100 whitespace-nowrap">
                  <span className="text-teal-900 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200 text-[10px] font-bold truncate shrink-0">
                    {language === 'bn' ? 'মতামত বক্স' : 'Feedback Box'}
                  </span>
                  {unreadFeedbacksCount > 0 ? (
                    <span className="text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 font-mono font-black text-[10px] shrink-0 animate-pulse">
                      {unreadFeedbacksCount} {language === 'bn' ? 'নতুন' : 'new'}
                    </span>
                  ) : (
                    <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 text-[10px] shrink-0">
                      {language === 'bn' ? 'সকল পঠিত' : 'All read'}
                    </span>
                  )}
                </div>
              </div>
            </div>


          </div>
        )}
      <MemberApplications />
    </>
  );
};
