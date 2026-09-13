import React, { useState, useEffect } from 'react';
import { HeroBanner } from './components/HeroBanner';
import { NoticeBoard } from './components/NoticeBoard';
import { SecretaryCard } from './components/SecretaryCard';
import { GeneralSecretaryCard } from './components/GeneralSecretaryCard';
import { TreasurerCard } from './components/TreasurerCard';
import { PhotoGallery } from './components/PhotoGallery';
import { FAQSection } from './components/FAQSection';
import { NoticeModal } from './components/NoticeModal';
import { SpeechModal } from './components/SpeechModal';
import { PrimaryMembershipForm } from './components/PrimaryMembershipForm';
import { AboutPage } from './components/pages/AboutPage';
import { LeadershipPage } from './components/pages/LeadershipPage';
import { NewsPage } from './components/pages/NewsPage';
import { GalleryPage } from './components/pages/GalleryPage';
import { ContactPage } from './components/pages/ContactPage';
import { MembersListPage } from './components/pages/MembersListPage';
import { PaymentPage } from './components/pages/PaymentPage';
import { AdminDashboard } from './components/pages/AdminDashboard';
import { MemberCardModal, CardMemberData } from './components/MemberCardModal';
import { db } from './lib/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { Footer } from './components/Footer';
import { NoticeItem, NOTICES_DATA } from './data/portalData';
import { Bell, Sparkles, Building2, ExternalLink, HelpCircle, FileCheck2, Info, ArrowUp, UserPlus, Home, Leaf, Sprout } from 'lucide-react';

export default function App() {
  const [language, setLanguage] = useState<'bn' | 'en'>('bn');
  const [activePage, setActivePage] = useState<'home' | 'about' | 'leadership' | 'membership' | 'members-list' | 'payment' | 'news' | 'gallery' | 'contact' | 'admin'>('home');
  const [pageLoading, setPageLoading] = useState<boolean>(false);
  const [selectedNotice, setSelectedNotice] = useState<NoticeItem | null>(null);
  const [speechModalOpen, setSpeechModalOpen] = useState<boolean>(false);
  const [speechModalPerson, setSpeechModalPerson] = useState<'adviser' | 'secretary' | 'general_secretary' | 'treasurer'>('adviser');
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);
  const [directCardMember, setDirectCardMember] = useState<CardMemberData | null>(null);
  const [paymentContext, setPaymentContext] = useState<{ membershipId?: string; feeType?: string }>({});

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

  const navigateToPage = (newPage: 'home' | 'about' | 'leadership' | 'membership' | 'members-list' | 'payment' | 'news' | 'gallery' | 'contact' | 'admin') => {
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
      } else if (newPage === 'leadership') {
        targetPath = '/leadership';
      } else if (newPage === 'news') {
        targetPath = '/news';
      } else if (newPage === 'gallery') {
        targetPath = '/gallery';
      } else if (newPage === 'contact') {
        targetPath = '/contact';
      }

      window.history.pushState(null, '', targetPath);
    } catch (e) {}

    setActivePage(newPage);
    setTimeout(() => {
      setPageLoading(false);
    }, 150);
  };

  const handleSearch = (_query: string) => {};

  const handleMenuClick = (menuTitle: string) => {
    const lower = menuTitle.toLowerCase();
    if (
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
      lower.includes('নিবন্ধন তালিকা')
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
      lower.includes('সম্পর্ক') ||
      lower.includes('about') ||
      lower.includes('ইতিহাস') ||
      lower.includes('history') ||
      lower.includes('নীতি') ||
      lower.includes('principles')
    ) {
      navigateToPage('about');
    } else if (
      lower.includes('নেতৃত্ব') ||
      lower.includes('leadership') ||
      lower.includes('কমিটি') ||
      lower.includes('committee') ||
      lower.includes('সংগঠন') ||
      lower.includes('wings')
    ) {
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
        <header id="portal-header-section" className="relative z-30 shadow-[0_8px_20px_-3px_rgba(0,0,0,0.22)] border-b border-[#9eb99e] no-print overflow-hidden">
          <HeroBanner
            language={language}
            onMenuClick={handleMenuClick}
            onSearch={handleSearch}
            onLanguageToggle={toggleLanguage}
            activePage={activePage}
          />

          {/* Scrolling Ticker / News Bulletin */}
          <div className="bg-[#eaf4ec] py-1.5 sm:py-2 px-2.5 sm:px-4 text-xs text-[#0a4729] overflow-hidden font-siliguri border-b border-emerald-300/40">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <span className="bg-[#15803d] text-white px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold shrink-0 flex items-center gap-1 shadow-2xs">
                <Sprout className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                <span>{language === 'bn' ? 'ঘোষণা' : 'Bulletin'}</span>
              </span>
              <marquee className="truncate text-[11px] sm:text-xs font-semibold text-emerald-950 flex-1 min-w-0">
                {language === 'bn'
                  ? '🌿 উদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশন, জগন্নাথ বিশ্ববিদ্যালয়, ঢাকা এর অফিসিয়াল পোর্টালে স্বাগতম । ২০২৬ সালের বার্ষিক বোটানি পুনর্মিলনী রেজিস্ট্রেশন ও আজীবন সদস্যপদ কার্যক্রম চলমান রয়েছে।'
                  : '🌿 Welcome to the Official Portal of Botany Alumni Association, Jagannath University, Dhaka. Annual Reunion 2026 Registration & Life Membership enrollment is now active.'}
              </marquee>
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
        ) : activePage === 'about' ? (
          <main className="flex-1 w-full bg-white">
            <AboutPage language={language} onBackToHome={() => navigateToPage('home')} />
          </main>
        ) : activePage === 'leadership' ? (
          <main className="flex-1 w-full bg-white">
            <LeadershipPage
              language={language}
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
        ) : (
          <main className="flex-1 w-full px-4 sm:px-6 py-6 space-y-6 bg-white">
            {/* Photo Gallery Carousel Section */}
            <PhotoGallery language={language} />

            {/* Main 2-Column Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Notice Board & FAQ Section */}
              <div className="lg:col-span-7 xl:col-span-8 flex flex-col space-y-6">
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
              </div>
            </div>
          </main>
        )}

        {/* Direct Member Card Modal (triggered from SMS link or card param) */}
        {directCardMember && (
          <MemberCardModal
            member={directCardMember}
            language={language}
            onClose={() => setDirectCardMember(null)}
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

