import React, { useState, useEffect } from 'react';
import { HeaderTop } from './components/HeaderTop';
import { HeroBanner } from './components/HeroBanner';
import { NoticeBoard } from './components/NoticeBoard';
import { RecentNewsSlider } from './components/RecentNewsSlider';
import { SecretaryCard } from './components/SecretaryCard';
import { GeneralSecretaryCard } from './components/GeneralSecretaryCard';
import { TreasurerCard } from './components/TreasurerCard';
import { PhotoGallery } from './components/PhotoGallery';
import { FAQSection } from './components/FAQSection';
import { SponsorCard } from './components/SponsorCard';
import { CommunityStatsWidget } from './components/CommunityStatsWidget';
import { NoticeModal } from './components/NoticeModal';
import { SpeechModal } from './components/SpeechModal';
import { PrimaryMembershipForm } from './components/PrimaryMembershipForm';
import { AboutPage } from './components/pages/AboutPage';
import { ObjectivesPage } from './components/pages/ObjectivesPage';
import { LeadershipPage } from './components/pages/LeadershipPage';
import { NewsPage } from './components/pages/NewsPage';
import { GalleryPage } from './components/pages/GalleryPage';
import { ContactPage } from './components/pages/ContactPage';
import { MembersListPage } from './components/pages/MembersListPage';
import { PaymentPage } from './components/pages/PaymentPage';
import { BloodCornerPage } from './components/pages/BloodCornerPage';
import { JobNewsPage } from './components/pages/JobNewsPage';
import { AdminDashboard } from './components/pages/AdminDashboard';
import { DonationSelectionModal, DonationCategoryType } from './components/DonationSelectionModal';
import { MemberCardModal, CardMemberData } from './components/MemberCardModal';
import { MemberFormPdfModal } from './components/MemberFormPdfModal';
import { MemberLoginModal } from './components/MemberLoginModal';
import { db, auth } from './lib/firebase';
import { signOut } from 'firebase/auth';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { Footer } from './components/Footer';
import { AdviceAndFeedbackSection } from './components/AdviceAndFeedbackSection';
import { NoticeItem, NOTICES_DATA } from './data/portalData';
import { Bell, Sparkles, Building2, ExternalLink, HelpCircle, FileCheck2, Info, ArrowUp, UserPlus, Home, Leaf, Sprout } from 'lucide-react';

export default function App() {
  const [language, setLanguage] = useState<'bn' | 'en'>('bn');
  const [activePage, setActivePage] = useState<
    | 'home'
    | 'about'
    | 'objectives'
    | 'leadership'
    | 'membership'
    | 'members-list'
    | 'payment'
    | 'news'
    | 'gallery'
    | 'contact'
    | 'admin'
    | 'blood-corner'
    | 'job-news'
  >('home');
  const [pageLoading, setPageLoading] = useState<boolean>(false);
  const [selectedNotice, setSelectedNotice] = useState<NoticeItem | null>(null);
  const [speechModalOpen, setSpeechModalOpen] = useState<boolean>(false);
  const [speechModalPerson, setSpeechModalPerson] = useState<'adviser' | 'secretary' | 'general_secretary' | 'treasurer'>('adviser');
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);
  const [directCardMember, setDirectCardMember] = useState<CardMemberData | null>(null);
  const [directPdfMember, setDirectPdfMember] = useState<any | null>(null);
  const [paymentContext, setPaymentContext] = useState<{ membershipId?: string; feeType?: string }>({});
  const [leadershipCommitteeTab, setLeadershipCommitteeTab] = useState<'executive' | 'convening_2nd' | 'convening_1st'>('executive');
  const [globalSearchQuery, setGlobalSearchQuery] = useState<string>('');
  
  // Member Login & Access Control States
  const [loggedInMember, setLoggedInMember] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('botany_alumni_logged_in_member');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [loginModalOpen, setLoginModalOpen] = useState<boolean>(false);
  const [isDonationModalOpen, setIsDonationModalOpen] = useState<boolean>(false);
  const [pendingTargetPage, setPendingTargetPage] = useState<string | null>(null);
  const [pendingSearchQuery, setPendingSearchQuery] = useState<string | null>(null);

  const isPublicPage = (pageName: string): boolean => {
    return (
      pageName === 'home' ||
      pageName === 'about' ||
      pageName === 'objectives' ||
      pageName === 'leadership' ||
      pageName === 'membership' ||
      pageName === 'payment' ||
      pageName === 'news' ||
      pageName === 'gallery' ||
      pageName === 'contact'
    );
  };

  const handleLogout = () => {
    setLoggedInMember(null);
    try {
      localStorage.removeItem('botany_alumni_logged_in_member');
    } catch (e) {}
    signOut(auth).catch(() => {});
    setActivePage('home');
  };

  const handleLoginSuccess = (memberData: any) => {
    setLoggedInMember(memberData);
    try {
      localStorage.setItem('botany_alumni_logged_in_member', JSON.stringify(memberData));
    } catch (e) {}

    if (pendingSearchQuery) {
      setGlobalSearchQuery(pendingSearchQuery);
      setPendingSearchQuery(null);
      navigateToPage('members-list');
    } else if (pendingTargetPage) {
      const target = pendingTargetPage;
      setPendingTargetPage(null);
      navigateToPage(target as any);
    } else {
      navigateToPage('members-list');
    }
  };

  // URL Route Listener for Clean Paths (e.g. /form, /members-list, /admin, /card/ID)
  useEffect(() => {
    const checkUrlRoute = async () => {
      const rawPath = window.location.pathname;
      const path = rawPath.toLowerCase().replace(/\/+$/, '') || '/';
      const search = window.location.search.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const urlParams = new URLSearchParams(window.location.search);

      let cardKey = '';
      if (path.startsWith('/card/')) {
        cardKey = decodeURIComponent(rawPath.replace(/^\/card\//i, '')).replace(/\/+$/, '').trim();
      } else {
        cardKey = (
          urlParams.get('card') ||
          urlParams.get('cardno') ||
          urlParams.get('show_card') ||
          ''
        ).trim();
      }

      let formKey = '';
      if (path.startsWith('/form/') && path !== '/form') {
        formKey = decodeURIComponent(rawPath.replace(/^\/form\//i, '')).replace(/\/+$/, '').trim();
      } else if (path.startsWith('/pdf/')) {
        formKey = decodeURIComponent(rawPath.replace(/^\/pdf\//i, '')).replace(/\/+$/, '').trim();
      } else {
        formKey = (
          urlParams.get('form') ||
          urlParams.get('formNo') ||
          urlParams.get('form_no') ||
          urlParams.get('pdf') ||
          urlParams.get('pdf_view') ||
          ''
        ).trim();
      }

      // Fetch Form PDF data if formKey exists
      if (formKey) {
        try {
          // 1. Try finding in Firestore by Document ID first
          const docRef = doc(db, 'memberships', formKey);
          const docSnap = await getDoc(docRef).catch(() => null);
          if (docSnap && docSnap.exists()) {
            setDirectPdfMember({ id: docSnap.id, ...(docSnap.data() as any) });
          } else {
            // 2. Query by formNo (exact or uppercase)
            const colRef = collection(db, 'memberships');
            let snap = await getDocs(query(colRef, where('formNo', '==', formKey))).catch(() => null);
            if (!snap || snap.empty) {
              snap = await getDocs(query(colRef, where('formNo', '==', formKey.toUpperCase()))).catch(() => null);
            }
            // 3. Query by transactionId
            if (!snap || snap.empty) {
              snap = await getDocs(query(colRef, where('transactionId', '==', formKey))).catch(() => null);
            }
            // 4. Query by mobile
            if (!snap || snap.empty) {
              snap = await getDocs(query(colRef, where('mobile', '==', formKey))).catch(() => null);
            }

            if (snap && !snap.empty) {
              const matchedDoc = snap.docs[0];
              setDirectPdfMember({ id: matchedDoc.id, ...(matchedDoc.data() as any) });
            } else {
              setDirectPdfMember({
                formNo: formKey,
                applicantNameBn: 'সম্মানিত সদস্য',
                applicantNameEn: 'Distinguished Member',
                fullName: 'সম্মানিত সদস্য',
                session: '২০০৫-২০০৬',
                mobile: '০১৭১২৩৪৫৬৭৮',
                status: 'approved',
                paymentStatus: 'paid',
                transactionId: 'VERIFIED',
              });
            }
          }
        } catch (e) {
          console.warn('Error fetching member form PDF from URL:', e);
        }
      }

      if (cardKey) {
        try {
          // 1. Try finding in Firestore by Document ID first
          const docRef = doc(db, 'memberships', cardKey);
          const docSnap = await getDoc(docRef).catch(() => null);
          if (docSnap && docSnap.exists()) {
            setDirectCardMember({ id: docSnap.id, ...(docSnap.data() as any) });
          } else {
            // 2. Try querying by formNo (exact or uppercase)
            const colRef = collection(db, 'memberships');
            let snap = await getDocs(query(colRef, where('formNo', '==', cardKey))).catch(() => null);
            
            if (!snap || snap.empty) {
              snap = await getDocs(query(colRef, where('formNo', '==', cardKey.toUpperCase()))).catch(() => null);
            }
            
            // 3. Try querying by transactionId
            if (!snap || snap.empty) {
              snap = await getDocs(query(colRef, where('transactionId', '==', cardKey))).catch(() => null);
            }

            // 4. Try querying by mobile number
            if (!snap || snap.empty) {
              snap = await getDocs(query(colRef, where('mobile', '==', cardKey))).catch(() => null);
            }

            if (snap && !snap.empty) {
              const matchedDoc = snap.docs[0];
              setDirectCardMember({ id: matchedDoc.id, ...(matchedDoc.data() as any) });
            } else {
              // Fallback preview
              setDirectCardMember({
                formNo: cardKey,
                applicantNameBn: 'সম্মানিত সদস্য',
                fullName: 'সম্মানিত সদস্য',
                session: '২০২০-২০২১',
                program: 'bsc_honours',
                mobile: '০১৭১২৩৪৫৬৭৮',
                currentAddress: 'জগন্নাথ বিশ্ববিদ্যালয়, ঢাকা',
                transactionId: 'VERIFIED',
              });
            }
          }
        } catch (e) {
          console.warn('Error fetching member card from URL:', e);
        }
      }

      // Clean path and query mapping
      if (
        path === '/admin' ||
        path.startsWith('/admin/') ||
        hash === '#admin' ||
        hash === '#/admin' ||
        search.includes('page=admin')
      ) {
        setActivePage('admin');
      } else if (
        path === '/form' ||
        path === '/membership' ||
        path === '/registration' ||
        path === '/reunion' ||
        hash === '#form' ||
        hash === '#membership' ||
        search.includes('page=form') ||
        search.includes('page=membership')
      ) {
        setActivePage('membership');
      } else if (
        path === '/donation' ||
        path === '/donate' ||
        hash === '#donation' ||
        hash === '#donate' ||
        search.includes('page=donation') ||
        search.includes('type=donation')
      ) {
        setPaymentContext({ feeType: 'donation' });
        setActivePage('payment');
      } else if (
        path === '/payment' ||
        path === '/pay' ||
        path === '/fees' ||
        hash === '#payment' ||
        hash === '#pay' ||
        search.includes('page=payment') ||
        search.includes('page=pay')
      ) {
        setActivePage('payment');
      } else if (
        path === '/members-list' ||
        path === '/members' ||
        path === '/directory' ||
        hash === '#members-list' ||
        search.includes('page=members-list')
      ) {
        setActivePage('members-list');
      } else if (
        path === '/objectives' ||
        path === '/mission' ||
        hash === '#objectives' ||
        hash === '#mission-vision' ||
        hash === '#mission' ||
        search.includes('page=objectives') ||
        search.includes('page=mission')
      ) {
        setActivePage('objectives');
      } else if (path === '/about' || hash === '#about' || search.includes('page=about')) {
        setActivePage('about');
      } else if (path === '/leadership' || hash === '#leadership' || search.includes('page=leadership')) {
        setActivePage('leadership');
      } else if (path === '/news' || hash === '#news' || search.includes('page=news')) {
        setActivePage('news');
      } else if (path === '/gallery' || hash === '#gallery' || search.includes('page=gallery')) {
        setActivePage('gallery');
      } else if (path === '/contact' || hash === '#contact' || search.includes('page=contact')) {
        setActivePage('contact');
      } else if (
        path === '/blood-corner' ||
        path === '/blood' ||
        hash === '#blood-corner' ||
        hash === '#blood' ||
        search.includes('page=blood')
      ) {
        setActivePage('blood-corner');
      } else if (
        path === '/job-news' ||
        path === '/jobs' ||
        path === '/career' ||
        hash === '#job-news' ||
        hash === '#jobs' ||
        search.includes('page=job')
      ) {
        setActivePage('job-news');
      } else {
        setActivePage('home');
      }
    };

    // Check on initial mount
    checkUrlRoute();

    // Listen to popstate and hashchange changes
    window.addEventListener('hashchange', checkUrlRoute);
    window.addEventListener('popstate', checkUrlRoute);

    // Keyboard shortcut for authorized admins: Ctrl + Shift + A
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setActivePage((prev) => {
          if (prev === 'admin') {
            try {
              window.history.pushState(null, '', '/');
            } catch (err) {}
            return 'home';
          } else {
            try {
              window.history.pushState(null, '', '/admin');
            } catch (err) {}
            return 'admin';
          }
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('hashchange', checkUrlRoute);
      window.removeEventListener('popstate', checkUrlRoute);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [activePage]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'bn' ? 'en' : 'bn'));
  };

  const navigateToPage = (
    newPage:
      | 'home'
      | 'about'
      | 'objectives'
      | 'leadership'
      | 'membership'
      | 'members-list'
      | 'payment'
      | 'news'
      | 'gallery'
      | 'contact'
      | 'admin'
      | 'blood-corner'
      | 'job-news'
  ) => {
    if (!isPublicPage(newPage) && newPage !== 'admin' && !loggedInMember) {
      setPendingTargetPage(newPage);
      setLoginModalOpen(true);
      return;
    }

    setPageLoading(true);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

    try {
      let targetPath = '/';
      if (newPage === 'admin') {
        targetPath = '/admin';
      } else if (newPage === 'membership') {
        targetPath = '/form';
      } else if (newPage === 'payment') {
        targetPath = '/payment';
      } else if (newPage === 'members-list') {
        targetPath = '/members-list';
      } else if (newPage === 'about') {
        targetPath = '/about';
      } else if (newPage === 'objectives') {
        targetPath = '/objectives';
      } else if (newPage === 'leadership') {
        targetPath = '/leadership';
      } else if (newPage === 'news') {
        targetPath = '/news';
      } else if (newPage === 'gallery') {
        targetPath = '/gallery';
      } else if (newPage === 'contact') {
        targetPath = '/contact';
      } else if (newPage === 'blood-corner') {
        targetPath = '/blood-corner';
      } else if (newPage === 'job-news') {
        targetPath = '/job-news';
      }

      window.history.pushState(null, '', targetPath);
    } catch (e) {}

    setActivePage(newPage);
    setTimeout(() => {
      setPageLoading(false);
    }, 150);
  };

  const handleSearch = (query: string) => {
    if (!loggedInMember) {
      setPendingSearchQuery(query);
      setPendingTargetPage('members-list');
      setLoginModalOpen(true);
      return;
    }
    setGlobalSearchQuery(query);
    navigateToPage('members-list');
  };

  const handleSelectDonationOption = (option: DonationCategoryType) => {
    setIsDonationModalOpen(false);
    const typeMap: Record<DonationCategoryType, string> = {
      renewal: 'donation_renewal',
      reunion: 'donation_reunion',
      iftar: 'donation_iftar',
      zakat: 'donation_zakat',
      others: 'donation_others',
    };
    const selectedFee = typeMap[option] || 'donation';
    setPaymentContext({ feeType: selectedFee });
    try {
      window.history.pushState(null, '', `/payment?type=${selectedFee}`);
    } catch (e) {}
    navigateToPage('payment');
  };

  const handleMenuClick = (menuTitle: string) => {
    const lower = menuTitle.toLowerCase();
    
    // Sub-donation items
    if (lower.includes('নবায়ন') || lower.includes('নবায়ন') || lower.includes('renewal')) {
      handleSelectDonationOption('renewal');
    } else if (lower.includes('পুনর্মিলনী অনুদান') || lower.includes('reunion donation')) {
      handleSelectDonationOption('reunion');
    } else if (lower.includes('ইফতার') || lower.includes('iftar')) {
      handleSelectDonationOption('iftar');
    } else if (lower.includes('যাকাত') || lower.includes('zakat')) {
      handleSelectDonationOption('zakat');
    } else if (lower.includes('অন্যান্য অনুদান') || lower.includes('other donation')) {
      handleSelectDonationOption('others');
    } else if (
      lower.includes('ডোনেশন') ||
      lower.includes('donation') ||
      lower.includes('অনুদান') ||
      lower.includes('donate')
    ) {
      // Open the donation selection modal as requested
      setIsDonationModalOpen(true);
    } else if (
      lower.includes('পেমেন্ট') ||
      lower.includes('payment') ||
      lower.includes('টাকা') ||
      lower.includes('রসিদ') ||
      lower.includes('receipt') ||
      lower.includes('ফি পরিশোধ')
    ) {
      navigateToPage('payment');
    } else if (
      lower.includes('তালিকা') ||
      lower.includes('directory') ||
      lower.includes('members-list') ||
      lower.includes('member list') ||
      lower.includes('নিবন্ধন তালিকা') ||
      lower.includes('নিবন্ধিত সদস্য') ||
      lower === 'সদস্য'
    ) {
      navigateToPage('members-list');
    } else if (
      lower.includes('পুনর্মিলনী') ||
      lower.includes('পুনমিলনী') ||
      lower.includes('reunion') ||
      lower.includes('নিবন্ধন') ||
      lower.includes('registration') ||
      lower.includes('সদস্য') ||
      lower.includes('membership') ||
      lower.includes('ফি') ||
      lower.includes('ফরম')
    ) {
      navigateToPage('membership');
    } else if (
      lower.includes('লক্ষ্য') ||
      lower.includes('উদ্দেশ্য') ||
      lower.includes('mission') ||
      lower.includes('objectives')
    ) {
      navigateToPage('objectives');
    } else if (
      lower.includes('সম্পর্ক') ||
      lower.includes('about') ||
      lower.includes('পরিচিতি') ||
      lower.includes('profile') ||
      lower.includes('পটভূমি') ||
      lower.includes('ইতিহাস') ||
      lower.includes('history') ||
      lower.includes('নীতি') ||
      lower.includes('principles') ||
      lower.includes('সংজ্ঞা') ||
      lower.includes('সেমিনার')
    ) {
      navigateToPage('about');
    } else if (
      lower.includes('নেতৃত্ব') ||
      lower.includes('leadership') ||
      lower.includes('কমিটি') ||
      lower.includes('committee') ||
      lower.includes('কার্যনির্বাহী') ||
      lower.includes('executive') ||
      lower.includes('আহ্বায়ক') ||
      lower.includes('convening') ||
      lower.includes('সংগঠন') ||
      lower.includes('wings')
    ) {
      if (lower.includes('কার্যনির্বাহী') || lower.includes('executive') || lower.includes('২০২৪-২৬')) {
        setLeadershipCommitteeTab('executive');
      } else if (lower.includes('১ম') || lower.includes('1st') || lower.includes('২০১৭')) {
        setLeadershipCommitteeTab('convening_1st');
      } else if (lower.includes('২য়') || lower.includes('2nd') || lower.includes('২০২৪')) {
        setLeadershipCommitteeTab('convening_2nd');
      } else {
        setLeadershipCommitteeTab('executive');
      }
      navigateToPage('leadership');
    } else if (
      lower.includes('সংবাদ') ||
      lower.includes('news') ||
      lower.includes('প্রেস') ||
      lower.includes('press') ||
      lower.includes('কর্মসূচি') ||
      lower.includes('events')
    ) {
      navigateToPage('news');
    } else if (
      lower.includes('মিডিয়া') ||
      lower.includes('media') ||
      lower.includes('গ্যালারি') ||
      lower.includes('gallery') ||
      lower.includes('ছবি') ||
      lower.includes('ভিডিও')
    ) {
      navigateToPage('gallery');
    } else if (
      lower.includes('যোগাযোগ') ||
      lower.includes('contact')
    ) {
      navigateToPage('contact');
    } else if (
      lower.includes('ব্লাড') ||
      lower.includes('blood') ||
      lower.includes('রক্ত')
    ) {
      navigateToPage('blood-corner');
    } else if (
      lower.includes('চাকরি') ||
      lower.includes('চাকরী') ||
      lower.includes('job') ||
      lower.includes('career') ||
      lower.includes('ক্যারিয়ার') ||
      lower.includes('নিয়োগ') ||
      lower.includes('সার্কুলার')
    ) {
      navigateToPage('job-news');
    } else {
      navigateToPage('home');
    }
  };

  // If currently in dedicated Admin Panel route, render the standalone Admin Panel
  if (activePage === 'admin') {
    return (
      <div className="min-h-screen bg-[#05140e] font-sans text-gray-800 antialiased selection:bg-[#008e48] selection:text-white flex flex-col">
        <AdminDashboard
          language={language}
          onBackToHome={() => navigateToPage('home')}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-portal-pattern flex flex-col items-center py-0 font-sans text-gray-800 antialiased selection:bg-[#008e48] selection:text-white">
      {/* Unified Portal Outer Frame Box */}
      <div className="w-full max-w-[1020px] min-h-screen bg-white shadow-[0_0_40px_rgba(0,0,0,0.5),0_10px_25px_rgba(0,0,0,0.3)] border-x-0 sm:border-x border-[#a8bea8] rounded-none flex flex-col my-0 relative z-10 overflow-x-hidden">
        {/* Top Header Region */}
        <header id="portal-header-section" className="relative z-30 shadow-[0_8px_20px_-3px_rgba(0,0,0,0.22)] border-b border-[#9eb99e] no-print">
          <HeaderTop
            language={language}
            loggedInMember={loggedInMember}
            onLogout={handleLogout}
            onOpenLoginModal={() => setLoginModalOpen(true)}
          />
          <HeroBanner
            language={language}
            onMenuClick={handleMenuClick}
            onSearch={handleSearch}
            onLanguageToggle={toggleLanguage}
            activePage={activePage}
            loggedInMember={loggedInMember}
            onLogout={handleLogout}
            onOpenLoginModal={() => setLoginModalOpen(true)}
          />

          {/* Scrolling Ticker / News Bulletin */}
          <div id="news-ticker" className="bg-[#eaf4ec] py-2 px-3 text-xs text-[#0a4729] overflow-hidden font-siliguri border-b border-emerald-300/40 relative flex items-center">
            <div className="flex items-center gap-2.5 w-full min-w-0 overflow-hidden">
              <div className="bg-[#15803d] text-white px-2.5 sm:px-3 py-0.5 rounded-full text-[11px] font-bold shrink-0 flex items-center shadow-xs z-10">
                <span>{language === 'bn' ? 'ঘোষণা' : 'Bulletin'}</span>
              </div>
              <div className="flex-1 overflow-hidden min-w-0 relative">
                <div className="marquee-container text-xs sm:text-[13px] font-bold text-emerald-950 select-none">
                  <div className="flex items-center gap-12 pr-12 shrink-0">
                    <span>
                      {language === 'bn'
                        ? '২০২৬ সালের নভেম্বরে নতুন কার্যনির্বাহী কমিটি নির্বাচনের লক্ষ্যে সাধারণ সদস্য এবং আজীবন সদস্য সংগ্রহ চলমান রয়েছে। আজই ফরম পূরণ করে আপনার সদস্যপদ নিশ্চিত করুন।'
                        : 'Collection of general members and life members is ongoing for the election of the new executive committee in November 2026. Register today to secure your membership.'}
                    </span>
                    <span className="text-emerald-500 font-normal">✦</span>
                  </div>
                  <div className="flex items-center gap-12 pr-12 shrink-0" aria-hidden="true">
                    <span>
                      {language === 'bn'
                        ? '২০২৬ সালের নভেম্বরে নতুন কার্যনির্বাহী কমিটি নির্বাচনের লক্ষ্যে সাধারণ সদস্য এবং আজীবন সদস্য সংগ্রহ চলমান রয়েছে। আজই ফরম পূরণ করে আপনার সদস্যপদ নিশ্চিত করুন।'
                        : 'Collection of general members and life members is ongoing for the election of the new executive committee in November 2026. Register today to secure your membership.'}
                    </span>
                    <span className="text-emerald-500 font-normal">✦</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content View Switcher */}
        {pageLoading ? (
          <main className="flex-1 w-full bg-white flex flex-col items-center justify-center min-h-[450px] py-20 font-siliguri">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 border-4 border-[#006a4e] border-t-transparent rounded-full animate-spin shadow-sm" />
              <span className="text-[#006a4e] font-extrabold text-sm tracking-wide">
                {language === 'bn' ? 'পেইজ লোড হচ্ছে...' : 'Loading...'}
              </span>
            </div>
          </main>
        ) : activePage === 'objectives' ? (
          <main className="flex-1 w-full bg-[#f8faf9]">
            <ObjectivesPage
              language={language}
              onBackToHome={() => navigateToPage('home')}
              onNavigateToAbout={() => navigateToPage('about')}
            />
          </main>
        ) : activePage === 'about' ? (
          <main className="flex-1 w-full bg-white">
            <AboutPage 
              language={language} 
              onBackToHome={() => navigateToPage('home')} 
              onNavigateToObjectives={() => navigateToPage('objectives')}
            />
          </main>
        ) : activePage === 'leadership' ? (
          <main className="flex-1 w-full bg-white">
            <LeadershipPage
              language={language}
              initialTab={leadershipCommitteeTab}
              onBackToHome={() => navigateToPage('home')}
              onOpenSpeechModal={(person) => {
                setSpeechModalPerson(person);
                setSpeechModalOpen(true);
              }}
            />
          </main>
        ) : activePage === 'membership' ? (
          <main className="flex-1 w-full bg-white">
            <PrimaryMembershipForm
              language={language}
              onClose={() => navigateToPage('home')}
              onNavigateToPayment={(memId, feeType) => {
                setPaymentContext({ membershipId: memId, feeType });
                try {
                  const query = new URLSearchParams();
                  if (memId) query.set('id', memId);
                  if (feeType) query.set('type', feeType);
                  window.history.pushState(null, '', `/payment?${query.toString()}`);
                } catch (e) {}
                setActivePage('payment');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </main>
        ) : activePage === 'payment' ? (
          <main className="flex-1 w-full bg-[#f4f7f5]">
            <PaymentPage
              language={language}
              onBackToHome={() => navigateToPage('home')}
              onNavigateToRegister={() => navigateToPage('membership')}
              initialMembershipId={paymentContext.membershipId}
              initialFeeType={paymentContext.feeType || 'general'}
            />
          </main>
        ) : activePage === 'members-list' ? (
          <main className="flex-1 w-full bg-white">
            <MembersListPage
              language={language}
              initialSearchQuery={globalSearchQuery}
              onNavigateToRegister={() => navigateToPage('membership')}
              onBackToHome={() => navigateToPage('home')}
            />
          </main>
        ) : activePage === 'news' ? (
          <main className="flex-1 w-full bg-white">
            <NewsPage language={language} onBackToHome={() => navigateToPage('home')} />
          </main>
        ) : activePage === 'gallery' ? (
          <main className="flex-1 w-full bg-white">
            <GalleryPage language={language} onBackToHome={() => navigateToPage('home')} />
          </main>
        ) : activePage === 'contact' ? (
          <main className="flex-1 w-full bg-white">
            <ContactPage language={language} onBackToHome={() => navigateToPage('home')} />
          </main>
        ) : activePage === 'blood-corner' ? (
          <main className="flex-1 w-full bg-[#f8faf9]">
            <BloodCornerPage language={language} onBackToHome={() => navigateToPage('home')} />
          </main>
        ) : activePage === 'job-news' ? (
          <main className="flex-1 w-full bg-[#f8faf9]">
            <JobNewsPage language={language} onBackToHome={() => navigateToPage('home')} />
          </main>
        ) : (
          <main className="flex-1 w-full px-4 sm:px-6 py-6 space-y-6 bg-white">
            {/* Photo Gallery Carousel Section */}
            <PhotoGallery language={language} />

            {/* Main 2-Column Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Recent News Slider, Notice Board & FAQ Section */}
              <div className="lg:col-span-7 xl:col-span-8 flex flex-col space-y-6">
                {/* Recent News Image Slider */}
                <RecentNewsSlider
                  language={language}
                  onViewAllNews={() => navigateToPage('news')}
                />

                <NoticeBoard
                  language={language}
                  onSelectNotice={(notice) => setSelectedNotice(notice)}
                  onViewAllNotices={() => navigateToPage('news')}
                  onOpenSpeechModal={(person) => {
                    setSpeechModalPerson(person);
                    setSpeechModalOpen(true);
                  }}
                />

                {/* FAQ Section directly below Notice Board */}
                <FAQSection language={language} />
              </div>

              {/* Right Column: Leadership Photo Cards & Quick Portal */}
              <div className="lg:col-span-5 xl:col-span-4 flex flex-col space-y-6">
                {/* Alumni President Photo Card */}
                <SecretaryCard
                  language={language}
                  onOpenSpeechModal={(person) => {
                    setSpeechModalPerson((person as any) || 'secretary');
                    setSpeechModalOpen(true);
                  }}
                />

                {/* Alumni General Secretary Photo Card */}
                <GeneralSecretaryCard
                  language={language}
                  onOpenSpeechModal={(person) => {
                    setSpeechModalPerson((person as any) || 'general_secretary');
                    setSpeechModalOpen(true);
                  }}
                />

                {/* Alumni Treasurer Photo Card */}
                <TreasurerCard
                  language={language}
                  onOpenSpeechModal={(person) => {
                    setSpeechModalPerson((person as any) || 'treasurer');
                    setSpeechModalOpen(true);
                  }}
                />

                {/* Website Sponsor Acknowledgement Card (Placed directly below Alumni Treasurer) */}
                <SponsorCard language={language} />
              </div>
            </div>

            {/* Our Growing Community - Live Stats Widget (Under Website Sponsor Section) */}
            <CommunityStatsWidget
              language={language}
              onNavigateToMembers={() => navigateToPage('members-list')}
              onNavigateToLeadership={() => navigateToPage('leadership')}
              onNavigateToDonation={() => {
                setPaymentContext({ feeType: 'donation' });
                navigateToPage('payment');
              }}
            />

            {/* Advice, Suggestions & Feedback Corner - Only on Home Page */}
            <AdviceAndFeedbackSection language={language} />
          </main>
        )}

        {/* Direct Member Card Modal (triggered from SMS link or card param) */}
        {directCardMember && (
          <MemberCardModal
            member={directCardMember}
            language={language}
            onClose={() => setDirectCardMember(null)}
            onOpenFormPdf={(m) => {
              setDirectCardMember(null);
              setDirectPdfMember(m);
            }}
          />
        )}

        {/* Direct Filled Form PDF Modal (triggered from SMS link or form/pdf param) */}
        {directPdfMember && (
          <MemberFormPdfModal
            member={directPdfMember}
            language={language}
            onClose={() => setDirectPdfMember(null)}
            onOpenCard={(m) => {
              setDirectPdfMember(null);
              setDirectCardMember(m);
            }}
          />
        )}

        {/* Notice Detail Modal */}
        <NoticeModal
          notice={selectedNotice}
          language={language}
          onClose={() => setSelectedNotice(null)}
        />

        {/* Speech / Profile Modal */}
        <SpeechModal
          isOpen={speechModalOpen}
          language={language}
          personType={speechModalPerson}
          onClose={() => setSpeechModalOpen(false)}
        />

        {/* Member Login Modal */}
        <MemberLoginModal
          isOpen={loginModalOpen}
          language={language}
          onClose={() => {
            setLoginModalOpen(false);
            setPendingTargetPage(null);
            setPendingSearchQuery(null);
          }}
          onLoginSuccess={handleLoginSuccess}
        />

        {/* Donation Purpose Selection Modal */}
        <DonationSelectionModal
          isOpen={isDonationModalOpen}
          language={language}
          onClose={() => setIsDonationModalOpen(false)}
          onSelectOption={handleSelectDonationOption}
        />

        {/* Footer */}
        <Footer
          language={language}
        />
      </div>

      {/* Floating Scroll To Top Button */}
      {showScrollTop && (
        <button
          id="scroll-to-top-btn"
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 bg-[#006a4e] hover:bg-[#00523b] text-white p-3 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 border-2 border-white group no-print cursor-pointer"
          title={language === 'bn' ? 'উপরে যান' : 'Scroll to top'}
        >
          <ArrowUp className="w-5 h-5 animate-bounce" />
          <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 ease-in-out text-xs font-bold pl-0 group-hover:pl-2">
            {language === 'bn' ? 'উপরে যান' : 'Top'}
          </span>
        </button>
      )}
    </div>
  );
}

