import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Users, MessageSquare, Bell, FileText, CheckCircle2, Clock,
  LogOut, Mail, ArrowLeft, Award, Image as ImageIcon, Newspaper, SlidersHorizontal,
  CircleOff, Inbox, HeartHandshake, ShieldCheck, AlertCircle, Lock, Megaphone, Camera
} from 'lucide-react';
import { useAdminDataState } from './useAdminDataState';
import { AdminDataContextProvider } from './AdminDataContext';
import { OverviewSection } from './sections/OverviewSection';
import { UnregisteredSection } from './sections/UnregisteredSection';
import { UnpaidSection } from './sections/UnpaidSection';
import { RegisteredSection } from './sections/RegisteredSection';
import { LifetimeSection } from './sections/LifetimeSection';
import { MembershipsSection } from './sections/MembershipsSection';
import { DonationsSection } from './sections/DonationsSection';
import { FeedbacksSection } from './sections/FeedbacksSection';
import { NoticesSection } from './sections/NoticesSection';
import { RecentNewsSection } from './sections/RecentNewsSection';
import { AnnouncementsSection } from './sections/AnnouncementsSection';
import { GallerySection } from './sections/GallerySection';
import { CommunityStatsSection } from './sections/CommunityStatsSection';
import { EmailSection } from './sections/EmailSection';
import { MemberFormModal } from './shared/MemberFormModal';
import { DeleteConfirmModals } from './shared/DeleteConfirmModals';
import { NewNoticeModal } from './shared/NewNoticeModal';
import { NewNewsModal } from './shared/NewNewsModal';
import { GalleryImageModal } from './shared/GalleryImageModal';
import { FeedbackDetailModal } from './shared/FeedbackDetailModal';
import { AddDonationModal } from './shared/AddDonationModal';
import { EmailComposerModal } from './shared/EmailComposerModal';

interface AdminDashboardProps {
  language: 'bn' | 'en';
  onBackToHome: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  language,
  onBackToHome
}) => {
  const admin = useAdminDataState(language);
  const {
    isAuthenticated,
    adminPin,
    setAdminPin,
    authError,
    adminUser,
    handlePinLogin,
    handleGoogleLogin,
    handleLogout,
    activeTab,
    navigateTab,
    toastMessage,
    pendingCount,
    approvedCount,
    unpaidCount,
    lifetimeCount,
    memberships,
    totalDonationAmount,
    recentNewsItems,
    notices,
    feedbacks,
    unreadFeedbacksCount,
    galleryImages,
  } = admin;

  if (!isAuthenticated) {
    return (
      <AdminDataContextProvider value={admin}>
      <div className="w-full min-h-screen flex-1 relative text-white py-12 px-4 flex flex-col items-center justify-center font-siliguri overflow-hidden">
        {/* Background Cover Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('/cover.png')` }}
        />
        {/* Deep Emerald / Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#002217]/85 via-[#003828]/80 to-[#001710]/90 backdrop-blur-[1px]" />

        {/* Back to portal button */}
        <div className="relative z-10 w-full max-w-md mb-6 flex justify-start">
          <button
            onClick={onBackToHome}
            className="flex items-center gap-2 text-xs font-bold text-emerald-100 hover:text-white bg-[#002217]/70 hover:bg-[#002217]/90 px-3.5 py-2 rounded-xl transition-all cursor-pointer border border-emerald-400/40 backdrop-blur-md shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{language === 'bn' ? 'মূল বাতায়নে ফিরে যান' : 'Back to Main Portal'}</span>
          </button>
        </div>

        {/* Login Box */}
        <div className="relative z-10 w-full max-w-md bg-[#002a1d]/95 border-2 border-amber-400/70 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 overflow-hidden backdrop-blur-md">
          {/* Top Decorative Banner */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-400 via-emerald-400 to-amber-500" />

          {/* Logo & Title */}
          <div className="text-center space-y-2.5">
            <div className="w-20 h-20 mx-auto flex items-center justify-center bg-white rounded-full p-1 shadow-lg border-2 border-emerald-400/60">
              <img
                src="/jnu_botany_alumni_logo.jpg"
                alt="Botany Alumni Association Logo"
                className="w-full h-full object-contain rounded-full"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://upload.wikimedia.org/wikipedia/en/thumb/2/23/Jagannath_University_Logo.svg/512px-Jagannath_University_Logo.svg.png";
                }}
              />
            </div>

            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl font-black text-white font-serif-bn tracking-wide">
                {language === 'bn' ? 'উদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশন' : 'Botany Alumni Association'}
              </h1>
              <p className="text-sm sm:text-base md:text-lg font-black text-amber-300">
                {language === 'bn' ? 'জগন্নাথ বিশ্ববিদ্যালয়, ঢাকা' : 'Jagannath University, Dhaka'}
              </p>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-800/90 border border-emerald-400/50 text-amber-200 text-xs font-bold shadow-xs">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>{language === 'bn' ? 'কেন্দ্রীয় প্রশাসনিক ড্যাশবোর্ড' : 'Central Admin Dashboard'}</span>
            </div>
          </div>

          {authError && (
            <div className="p-3 rounded-xl bg-red-950/90 border border-red-500/60 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{authError}</span>
            </div>
          )}

          {/* PIN Login Form */}
          <form onSubmit={handlePinLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-emerald-100 flex items-center justify-between">
                <span>{language === 'bn' ? 'অ্যাডমিন পাসওয়ার্ড (Password)' : 'Admin Password'}</span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={adminPin}
                  onChange={(e) => setAdminPin(e.target.value)}
                  placeholder={language === 'bn' ? 'অ্যাডমিন পাসওয়ার্ড লিখুন' : 'Enter Admin Password'}
                  className="w-full bg-[#001d14] border-2 border-emerald-500/60 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/50 transition-all font-mono shadow-inner"
                  autoFocus
                />
                <Lock className="w-4 h-4 text-emerald-400 absolute right-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-500 via-emerald-600 to-[#006a4e] hover:from-amber-400 hover:to-emerald-700 text-white font-extrabold py-3 px-4 rounded-xl shadow-lg transition-all transform active:scale-98 flex items-center justify-center gap-2 cursor-pointer border border-amber-300/60 text-sm"
            >
              <ShieldCheck className="w-4 h-4 text-amber-200" />
              <span>{language === 'bn' ? 'ড্যাশবোর্ডে প্রবেশ করুন' : 'Enter Admin Panel'}</span>
            </button>
          </form>
        </div>
      </div>
      </AdminDataContextProvider>
    );
  }

  return (
    <AdminDataContextProvider value={admin}>
    <div className="w-full bg-[#f4f7f5] min-h-screen text-gray-800 font-siliguri pb-16">      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-[#006a4e] text-white px-4 py-2.5 rounded-xl shadow-2xl border-2 border-amber-400 text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-amber-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Admin Navigation Bar */}
      <header className="w-full bg-[#004d38] text-white border-b-2 border-amber-400 shadow-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Title & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 shrink-0 flex items-center justify-center bg-white rounded-full p-0.5 shadow-sm border border-emerald-400/40">
              <img
                src="/jnu_botany_alumni_logo.jpg"
                alt="Botany Alumni Logo"
                className="w-full h-full object-contain rounded-full"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://upload.wikimedia.org/wikipedia/en/thumb/2/23/Jagannath_University_Logo.svg/512px-Jagannath_University_Logo.svg.png";
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                <h1 className="font-extrabold text-sm sm:text-base md:text-lg text-white font-serif-bn leading-tight whitespace-nowrap">
                  {language === 'bn' ? 'উদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশন, জগন্নাথ বিশ্ববিদ্যালয়' : 'Botany Alumni Association, JnU'}
                </h1>
                <span className="bg-amber-400 text-[#004d38] text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                  ADMIN
                </span>
              </div>
            </div>
          </div>

          {/* Quick Right Actions */}
          <div className="flex items-center flex-wrap gap-2">

            <button
              onClick={onBackToHome}
              className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-[#004d38] rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'মূল বাতায়ন' : 'Live Website'}</span>
            </button>

            <button
              onClick={handleLogout}
              className="px-3 py-1.5 bg-red-800/90 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer border border-red-600/50"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'লগআউট' : 'Logout'}</span>
            </button>
          </div>
        </div>

      </header>

      {/* Main Container Layout: Left Vertical Sidebar + Right Content Area */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 font-siliguri">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          
          {/* LEFT SIDEBAR NAVIGATION MENU */}
          <aside className="w-full md:w-72 lg:w-80 shrink-0 space-y-2">
            <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-3.5 sm:p-4 space-y-2 overflow-hidden md:sticky md:top-4">
              <div className="px-3 py-2.5 border-b border-gray-100 flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-[#006a4e]" />
                  <span className="text-sm sm:text-base font-black text-gray-900 font-serif-bn uppercase tracking-wide">
                    {language === 'bn' ? 'এডমিন ড্যাশবোর্ড মেনু' : 'Admin Menu'}
                  </span>
                </div>
              </div>

              {/* Vertical Menu Item List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-2">
                {/* 1. Overview */}
                <button
                  onClick={() => navigateTab('overview')}
                  className={`w-full text-left px-4 py-3 text-sm sm:text-base rounded-xl transition-all flex items-center justify-between gap-3 cursor-pointer ${
                    activeTab === 'overview'
                      ? 'bg-[#006a4e] text-white font-extrabold shadow-sm'
                      : 'text-gray-800 hover:bg-emerald-50 hover:text-[#004d38] font-bold'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <LayoutDashboard className={`w-5 h-5 shrink-0 ${activeTab === 'overview' ? 'text-amber-300' : 'text-emerald-700'}`} />
                    <span className="truncate">{language === 'bn' ? 'সারসংক্ষেপ (Overview)' : 'Overview'}</span>
                  </div>
                </button>

                {/* 2. Unregistered List / Applications */}
                <button
                  onClick={() => navigateTab('unregistered')}
                  className={`w-full text-left px-4 py-3 text-sm sm:text-base rounded-xl transition-all flex items-center justify-between gap-3 cursor-pointer ${
                    activeTab === 'unregistered'
                      ? 'bg-[#006a4e] text-white font-extrabold shadow-sm'
                      : 'text-gray-800 hover:bg-emerald-50 hover:text-[#004d38] font-bold'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Clock className={`w-5 h-5 shrink-0 ${activeTab === 'unregistered' ? 'text-amber-300' : 'text-amber-600'}`} />
                    <span className="truncate">{language === 'bn' ? 'আবেদন তালিকা (অপেক্ষমান)' : 'Applications (Pending)'}</span>
                  </div>
                  <span
                    className={`text-xs font-black px-2.5 py-0.5 rounded-full font-mono shrink-0 ${
                      activeTab === 'unregistered'
                        ? 'bg-amber-400 text-amber-950'
                        : pendingCount > 0
                        ? 'bg-amber-100 text-amber-900 border border-amber-200'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {pendingCount}
                  </span>
                </button>

                {/* 3. Registered List */}
                <button
                  onClick={() => navigateTab('registered')}
                  className={`w-full text-left px-4 py-3 text-sm sm:text-base rounded-xl transition-all flex items-center justify-between gap-3 cursor-pointer ${
                    activeTab === 'registered'
                      ? 'bg-[#006a4e] text-white font-extrabold shadow-sm'
                      : 'text-gray-800 hover:bg-emerald-50 hover:text-[#004d38] font-bold'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <CheckCircle2 className={`w-5 h-5 shrink-0 ${activeTab === 'registered' ? 'text-amber-300' : 'text-emerald-600'}`} />
                    <span className="truncate">{language === 'bn' ? 'নিবন্ধিত সদস্য তালিকা' : 'Registered List'}</span>
                  </div>
                  <span
                    className={`text-xs font-black px-2.5 py-0.5 rounded-full font-mono shrink-0 ${
                      activeTab === 'registered'
                        ? 'bg-emerald-300 text-emerald-950'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {approvedCount}
                  </span>
                </button>

                {/* 3.5 Unpaid Members List */}
                <button
                  onClick={() => navigateTab('unpaid')}
                  className={`w-full text-left px-4 py-3 text-sm sm:text-base rounded-xl transition-all flex items-center justify-between gap-3 cursor-pointer ${
                    activeTab === 'unpaid'
                      ? 'bg-[#006a4e] text-white font-extrabold shadow-sm'
                      : 'text-gray-800 hover:bg-emerald-50 hover:text-[#004d38] font-bold'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <CircleOff className={`w-5 h-5 shrink-0 ${activeTab === 'unpaid' ? 'text-amber-300' : 'text-red-600'}`} />
                    <span className="truncate">{language === 'bn' ? 'অপরিশোধিত সদস্য তালিকা' : 'Unpaid Members List'}</span>
                  </div>
                  <span
                    className={`text-xs font-black px-2.5 py-0.5 rounded-full font-mono shrink-0 ${
                      activeTab === 'unpaid'
                        ? 'bg-red-300 text-red-950'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {unpaidCount}
                  </span>
                </button>

                {/* 4. Lifetime Members */}
                <button
                  onClick={() => navigateTab('lifetime')}
                  className={`w-full text-left px-4 py-3 text-sm sm:text-base rounded-xl transition-all flex items-center justify-between gap-3 cursor-pointer ${
                    activeTab === 'lifetime'
                      ? 'bg-[#006a4e] text-white font-extrabold shadow-sm'
                      : 'text-gray-800 hover:bg-emerald-50 hover:text-[#004d38] font-bold'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Award className={`w-5 h-5 shrink-0 ${activeTab === 'lifetime' ? 'text-amber-300' : 'text-amber-600'}`} />
                    <span className="truncate">{language === 'bn' ? 'আজীবন সদস্য' : 'Lifetime Members'}</span>
                  </div>
                  <span
                    className={`text-xs font-black px-2.5 py-0.5 rounded-full font-mono shrink-0 ${
                      activeTab === 'lifetime'
                        ? 'bg-amber-400 text-amber-950'
                        : 'bg-amber-100 text-amber-900'
                    }`}
                  >
                    {lifetimeCount}
                  </span>
                </button>

                {/* 4.5 All Applications */}
                <button
                  onClick={() => navigateTab('memberships')}
                  className={`w-full text-left px-4 py-3 text-sm sm:text-base rounded-xl transition-all flex items-center justify-between gap-3 cursor-pointer ${
                    activeTab === 'memberships'
                      ? 'bg-[#006a4e] text-white font-extrabold shadow-sm'
                      : 'text-gray-800 hover:bg-emerald-50 hover:text-[#004d38] font-bold'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText className={`w-5 h-5 shrink-0 ${activeTab === 'memberships' ? 'text-amber-300' : 'text-emerald-700'}`} />
                    <span className="truncate">{language === 'bn' ? 'সকল সদস্য আবেদন' : 'All Applications'}</span>
                  </div>
                  <span
                    className={`text-xs font-black px-2.5 py-0.5 rounded-full font-mono shrink-0 ${
                      activeTab === 'memberships'
                        ? 'bg-emerald-300 text-emerald-950'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {memberships.length}
                  </span>
                </button>

                {/* 5. Donation Fees */}
                <button
                  onClick={() => navigateTab('donations')}
                  className={`w-full text-left px-4 py-3 text-sm sm:text-base rounded-xl transition-all flex items-center justify-between gap-3 cursor-pointer ${
                    activeTab === 'donations'
                      ? 'bg-[#006a4e] text-white font-extrabold shadow-sm'
                      : 'text-gray-800 hover:bg-emerald-50 hover:text-[#004d38] font-bold'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <HeartHandshake className={`w-5 h-5 shrink-0 ${activeTab === 'donations' ? 'text-amber-300' : 'text-rose-600'}`} />
                    <span className="truncate">{language === 'bn' ? 'ডোনেশন ফি' : 'Donation Fees'}</span>
                  </div>
                  <span
                    className={`text-xs font-black px-2.5 py-0.5 rounded-full font-mono shrink-0 ${
                      activeTab === 'donations'
                        ? 'bg-rose-400 text-rose-950'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    ৳{totalDonationAmount.toLocaleString('bn-BD')}
                  </span>
                </button>

                {/* 6. Recent News */}
                <button
                  onClick={() => navigateTab('recent-news')}
                  className={`w-full text-left px-4 py-3 text-sm sm:text-base rounded-xl transition-all flex items-center justify-between gap-3 cursor-pointer ${
                    activeTab === 'recent-news'
                      ? 'bg-[#006a4e] text-white font-extrabold shadow-sm'
                      : 'text-gray-800 hover:bg-emerald-50 hover:text-[#004d38] font-bold'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Newspaper className={`w-5 h-5 shrink-0 ${activeTab === 'recent-news' ? 'text-amber-300' : 'text-[#006a4e]'}`} />
                    <span className="truncate">{language === 'bn' ? 'সাম্প্রতিক খবর' : 'Recent News'}</span>
                  </div>
                  <span
                    className={`text-xs font-black px-2.5 py-0.5 rounded-full font-mono shrink-0 ${
                      activeTab === 'recent-news'
                        ? 'bg-amber-400 text-amber-950'
                        : 'bg-blue-100 text-blue-900'
                    }`}
                  >
                    {recentNewsItems.length}
                  </span>
                </button>

                {/* 7. Notices */}
                <button
                  onClick={() => navigateTab('notices')}
                  className={`w-full text-left px-4 py-3 text-sm sm:text-base rounded-xl transition-all flex items-center justify-between gap-3 cursor-pointer ${
                    activeTab === 'notices'
                      ? 'bg-[#006a4e] text-white font-extrabold shadow-sm'
                      : 'text-gray-800 hover:bg-emerald-50 hover:text-[#004d38] font-bold'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Bell className={`w-5 h-5 shrink-0 ${activeTab === 'notices' ? 'text-amber-300' : 'text-purple-600'}`} />
                    <span className="truncate">{language === 'bn' ? 'নোটিশ ও বিজ্ঞপ্তি' : 'Notices'}</span>
                  </div>
                  <span
                    className={`text-xs font-black px-2.5 py-0.5 rounded-full font-mono shrink-0 ${
                      activeTab === 'notices'
                        ? 'bg-purple-300 text-purple-950'
                        : 'bg-purple-100 text-purple-900'
                    }`}
                  >
                    {notices.length}
                  </span>
                </button>

                {/* 7.5. Announcements & Bulletin */}
                <button
                  onClick={() => navigateTab('announcements')}
                  className={`w-full text-left px-4 py-3 text-sm sm:text-base rounded-xl transition-all flex items-center justify-between gap-3 cursor-pointer ${
                    activeTab === 'announcements'
                      ? 'bg-[#006a4e] text-white font-extrabold shadow-sm'
                      : 'text-gray-800 hover:bg-emerald-50 hover:text-[#004d38] font-bold'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Megaphone className={`w-5 h-5 shrink-0 ${activeTab === 'announcements' ? 'text-amber-300' : 'text-emerald-600'}`} />
                    <span className="truncate">{language === 'bn' ? 'ঘোষণা ও বুলেটিন' : 'Announcements & Bulletin'}</span>
                  </div>
                  <span className="bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full font-mono shrink-0">
                    LIVE
                  </span>
                </button>

                {/* 7.6. Photo Gallery */}
                <button
                  onClick={() => navigateTab('gallery')}
                  className={`w-full text-left px-4 py-3 text-sm sm:text-base rounded-xl transition-all flex items-center justify-between gap-3 cursor-pointer ${
                    activeTab === 'gallery'
                      ? 'bg-[#006a4e] text-white font-extrabold shadow-sm'
                      : 'text-gray-800 hover:bg-emerald-50 hover:text-[#004d38] font-bold'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Camera className={`w-5 h-5 shrink-0 ${activeTab === 'gallery' ? 'text-amber-300' : 'text-emerald-700'}`} />
                    <span className="truncate">{language === 'bn' ? 'গ্যালারির ছবি' : 'Photo Gallery'}</span>
                  </div>
                  <span
                    className={`text-xs font-black px-2.5 py-0.5 rounded-full font-mono shrink-0 ${
                      activeTab === 'gallery'
                        ? 'bg-amber-400 text-amber-950'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {galleryImages.length}
                  </span>
                </button>

                {/* 8. Advice & Feedback */}
                <button
                  onClick={() => navigateTab('feedbacks')}
                  className={`w-full text-left px-4 py-3 text-sm sm:text-base rounded-xl transition-all flex items-center justify-between gap-3 cursor-pointer ${
                    activeTab === 'feedbacks'
                      ? 'bg-[#006a4e] text-white font-extrabold shadow-sm'
                      : 'text-gray-800 hover:bg-emerald-50 hover:text-[#004d38] font-bold'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Inbox className={`w-5 h-5 shrink-0 ${activeTab === 'feedbacks' ? 'text-amber-300' : 'text-amber-600'}`} />
                    <span className="truncate">{language === 'bn' ? 'পরামর্শ ও মতামত' : 'Advice & Feedback'}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 font-mono">
                    <span
                      className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                        activeTab === 'feedbacks'
                          ? 'bg-amber-400 text-amber-950'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {feedbacks.length}
                    </span>
                    {unreadFeedbacksCount > 0 && (
                      <span className="bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                        {unreadFeedbacksCount}
                      </span>
                    )}
                  </div>
                </button>

                {/* 9. Community Stats */}
                <button
                  onClick={() => navigateTab('community-stats')}
                  className={`w-full text-left px-4 py-3 text-sm sm:text-base rounded-xl transition-all flex items-center justify-between gap-3 cursor-pointer ${
                    activeTab === 'community-stats'
                      ? 'bg-[#006a4e] text-white font-extrabold shadow-sm'
                      : 'text-gray-800 hover:bg-emerald-50 hover:text-[#004d38] font-bold'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Users className={`w-5 h-5 shrink-0 ${activeTab === 'community-stats' ? 'text-amber-300' : 'text-emerald-700'}`} />
                    <span className="truncate">{language === 'bn' ? 'কমিউনিটি পরিসংখ্যান' : 'Community Stats'}</span>
                  </div>
                </button>

                {/* 10. Email Settings */}
                <button
                  onClick={() => navigateTab('email')}
                  className={`w-full text-left px-4 py-3 text-sm sm:text-base rounded-xl transition-all flex items-center justify-between gap-3 cursor-pointer ${
                    activeTab === 'email'
                      ? 'bg-[#006a4e] text-white font-extrabold shadow-sm'
                      : 'text-gray-800 hover:bg-emerald-50 hover:text-[#004d38] font-bold'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Mail className={`w-5 h-5 shrink-0 ${activeTab === 'email' ? 'text-amber-300' : 'text-blue-600'}`} />
                    <span className="truncate">{language === 'bn' ? 'ইমেইল সেটিংস' : 'Email Settings'}</span>
                  </div>
                  <span className="bg-blue-500 text-white text-xs font-black px-2 py-0.5 rounded-full font-mono shrink-0">
                    EMAIL
                  </span>
                </button>
              </div>
            </div>
          </aside>

          {/* RIGHT MAIN CONTENT AREA */}
          <main className="flex-1 min-w-0 w-full space-y-6">
        {activeTab === 'overview' && <OverviewSection />}
        {activeTab === 'unregistered' && <UnregisteredSection />}
        {activeTab === 'unpaid' && <UnpaidSection />}
        {activeTab === 'registered' && <RegisteredSection />}
        {activeTab === 'lifetime' && <LifetimeSection />}
        {activeTab === 'memberships' && <MembershipsSection />}
        {activeTab === 'donations' && <DonationsSection />}
        {activeTab === 'feedbacks' && <FeedbacksSection />}
        {activeTab === 'notices' && <NoticesSection />}
        {activeTab === 'recent-news' && <RecentNewsSection />}
        {activeTab === 'announcements' && <AnnouncementsSection />}
        {activeTab === 'gallery' && <GallerySection />}
        {activeTab === 'community-stats' && <CommunityStatsSection />}
        {activeTab === 'email' && <EmailSection />}
      </main>
        </div>
      </div>

      {/* ================= SHARED MODALS ================= */}
      <MemberFormModal />
      <DeleteConfirmModals />
      <NewNoticeModal />
      <NewNewsModal />
      <GalleryImageModal />
      <FeedbackDetailModal />
      <AddDonationModal />
      <EmailComposerModal />
    </div>
    </AdminDataContextProvider>
  );
};
