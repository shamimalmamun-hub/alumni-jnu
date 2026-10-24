import React, { useState, useEffect } from 'react';
import {
  Terminal,
  Layers,
  Sparkles,
  Users,
  Activity,
  X,
  Minimize2,
  Maximize2,
  ExternalLink,
  CreditCard,
  FileText,
  LogIn,
  LogOut,
  Shield,
  Trash2,
  Globe,
  Copy,
  Check,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Database,
  Laptop,
  Smartphone,
  Tablet,
  Heart,
  Briefcase,
  HelpCircle,
  Home,
  UserCheck,
  Building2,
  Image as ImageIcon,
  Phone,
  FileCheck2,
} from 'lucide-react';
import { CardMemberData } from './MemberCardModal';
import { findMembership } from '../lib/membershipLookup';
import { NOTICES_DATA, NoticeItem } from '../data/portalData';

// Pre-configured rich mock member for instant testing and modal previews
export const DEV_MOCK_MEMBER: CardMemberData & Record<string, any> = {
  id: 'BOT-1024',
  formNo: 'BOT-1024',
  membershipId: 'BOT-1024',
  membershipType: 'life',
  applicantNameEn: 'Dr. Mohammad Rafiqul Islam',
  applicantNameBn: 'ড. মোহাম্মদ রফিকুল ইসলাম',
  fullName: 'Dr. Mohammad Rafiqul Islam',
  nameEnglish: 'Dr. Mohammad Rafiqul Islam',
  nameBangla: 'ড. মোহাম্মদ রফিকুল ইসলাম',
  fathersName: 'Late Nurul Islam',
  mothersName: 'Amena Begum',
  program: 'B.Sc (Hons), M.Sc in Botany',
  batch: '1st Batch (Alumni)',
  session: '1997-1998',
  bscSession: '1997-1998',
  bscYear: '2001',
  bscBatch: '1st Batch',
  mscSession: '2001-2002',
  mscYear: '2003',
  mscBatch: '1st Batch',
  mphilYear: '2008',
  phdYear: '2014',
  mobile: '01712345678',
  phone: '01712345678',
  email: 'rafiqul.botany@jnu.ac.bd',
  bloodGroup: 'B+',
  nidNumber: '19792612345678901',
  occupation: 'Teacher',
  organizationPosition: 'Department of Botany, Jagannath University (Professor)',
  district: 'Faridpur',
  permDistrict: 'Faridpur',
  presentAddress: 'Flat 4A, Green Garden Apartment, 14 Lake Circus, Kalabagan, Dhaka-1205',
  permVillage: 'Baitul Aman, Kotwali, Faridpur',
  paymentStatus: 'paid',
  status: 'approved',
  paymentMethod: 'bKash',
  transactionId: 'TRX992817263',
  feeAmount: '5,000 BDT',
  applicationDate: '15/01/2026',
  createdAt: '2026-01-15T10:00:00.000Z',
};

export const DEV_MOCK_PENDING_MEMBER: CardMemberData & Record<string, any> = {
  ...DEV_MOCK_MEMBER,
  id: 'BOT-1088',
  formNo: 'BOT-1088',
  membershipId: 'BOT-1088',
  membershipType: 'general',
  applicantNameEn: 'Tariqul Hasan',
  applicantNameBn: 'তারিকুল হাসান',
  fullName: 'Tariqul Hasan',
  batch: '8th Batch (Alumni)',
  session: '2004-2005',
  mobile: '01898765432',
  phone: '01898765432',
  email: 'tariqul.botany@gmail.com',
  paymentStatus: 'pending',
  status: 'pending',
  feeAmount: '1,000 BDT',
};

export interface DevOverlayProps {
  activePage: string;
  onNavigate: (page: any) => void;
  language: 'bn' | 'en';
  onToggleLanguage: () => void;
  loggedInMember: any;
  onSetLoggedInMember: (member: any) => void;
  onLogout: () => void;
  onOpenLoginModal: () => void;
  onOpenDonationModal: () => void;
  onOpenMemberCard: (member: CardMemberData) => void;
  onOpenMemberPdf: (member: any) => void;
  onOpenNoticeModal: (notice: NoticeItem) => void;
  onOpenSpeechModal: (person: 'adviser' | 'secretary' | 'general_secretary' | 'treasurer') => void;
}

export const DevOverlay: React.FC<DevOverlayProps> = ({
  activePage,
  onNavigate,
  language,
  onToggleLanguage,
  loggedInMember,
  onSetLoggedInMember,
  onLogout,
  onOpenLoginModal,
  onOpenDonationModal,
  onOpenMemberCard,
  onOpenMemberPdf,
  onOpenNoticeModal,
  onOpenSpeechModal,
}) => {
  // Only render in development environments (Vite dev or localhost)
  const isDev =
    Boolean(import.meta.env.DEV) ||
    (typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname.endsWith('.local')));

  if (!isDev) {
    return null;
  }

  return (
    <DevOverlayContent
      activePage={activePage}
      onNavigate={onNavigate}
      language={language}
      onToggleLanguage={onToggleLanguage}
      loggedInMember={loggedInMember}
      onSetLoggedInMember={onSetLoggedInMember}
      onLogout={onLogout}
      onOpenLoginModal={onOpenLoginModal}
      onOpenDonationModal={onOpenDonationModal}
      onOpenMemberCard={onOpenMemberCard}
      onOpenMemberPdf={onOpenMemberPdf}
      onOpenNoticeModal={onOpenNoticeModal}
      onOpenSpeechModal={onOpenSpeechModal}
    />
  );
};

const DevOverlayContent: React.FC<DevOverlayProps> = ({
  activePage,
  onNavigate,
  language,
  onToggleLanguage,
  loggedInMember,
  onSetLoggedInMember,
  onLogout,
  onOpenLoginModal,
  onOpenDonationModal,
  onOpenMemberCard,
  onOpenMemberPdf,
  onOpenNoticeModal,
  onOpenSpeechModal,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState<'routes' | 'modals' | 'auth' | 'diagnostics'>('routes');

  // Diagnostics & health ping states
  const [windowDimensions, setWindowDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1280,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  });
  const [healthStatus, setHealthStatus] = useState<{
    loading: boolean;
    data: any | null;
    error: string | null;
    latencyMs?: number;
  }>({ loading: false, data: null, error: null });
  const [communityStats, setCommunityStats] = useState<{
    loading: boolean;
    data: any | null;
    error: string | null;
  }>({ loading: false, data: null, error: null });
  const [customLookupKey, setCustomLookupKey] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Track window resizing
  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Determine Tailwind Breakpoint
  const getBreakpoint = (w: number) => {
    if (w < 640) return { tag: 'xs (<640px)', icon: Smartphone };
    if (w < 768) return { tag: 'sm (640-767px)', icon: Smartphone };
    if (w < 1024) return { tag: 'md (768-1023px)', icon: Tablet };
    if (w < 1280) return { tag: 'lg (1024-1279px)', icon: Laptop };
    if (w < 1536) return { tag: 'xl (1280-1535px)', icon: Laptop };
    return { tag: '2xl (>=1536px)', icon: Laptop };
  };

  const bpInfo = getBreakpoint(windowDimensions.width);
  const BpIcon = bpInfo.icon;

  // Health ping test
  const handlePingHealth = async () => {
    setHealthStatus({ loading: true, data: null, error: null });
    const startTime = performance.now();
    try {
      const res = await fetch('/api/health');
      const endTime = performance.now();
      const latency = Math.round(endTime - startTime);
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const data = await res.json();
      setHealthStatus({ loading: false, data, error: null, latencyMs: latency });
    } catch (err: any) {
      setHealthStatus({ loading: false, data: null, error: err.message || 'Health check failed' });
    }
  };

  // Ping community stats
  const handlePingStats = async () => {
    setCommunityStats({ loading: true, data: null, error: null });
    try {
      const res = await fetch('/api/stats/community');
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const data = await res.json();
      setCommunityStats({ loading: false, data, error: null });
    } catch (err: any) {
      setCommunityStats({ loading: false, data: null, error: err.message || 'Stats check failed' });
    }
  };

  // Lookup custom member
  const handleLookupMember = async () => {
    if (!customLookupKey.trim()) return;
    setLookupLoading(true);
    setLookupError(null);
    try {
      const found = await findMembership(customLookupKey.trim());
      if (found) {
        onOpenMemberCard(found as any);
      } else {
        setLookupError(`No member found matching "${customLookupKey}"`);
      }
    } catch (err: any) {
      setLookupError(err.message || 'Lookup failed');
    } finally {
      setLookupLoading(false);
    }
  };

  // Autofill form
  const handleTriggerAutofill = () => {
    if (activePage !== 'membership') {
      onNavigate('membership');
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('botany_dev_autofill'));
      }, 300);
    } else {
      window.dispatchEvent(new CustomEvent('botany_dev_autofill'));
    }
  };

  // Copy current URL
  const handleCopyUrl = () => {
    try {
      navigator.clipboard.writeText(window.location.href);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch (e) {}
  };

  // Clear storage
  const handleClearStorage = () => {
    if (window.confirm('Reset all localStorage and session data for this app?')) {
      try {
        localStorage.clear();
        sessionStorage.clear();
        onLogout();
        window.location.reload();
      } catch (e) {}
    }
  };

  const routesList = [
    { id: 'home', labelBn: 'হোম পেইজ', labelEn: 'Home Page', path: '/', icon: Home },
    { id: 'membership', labelBn: 'সদস্য ফরম', labelEn: 'Registration Form', path: '/form', icon: FileCheck2 },
    { id: 'members-list', labelBn: 'সদস্য তালিকা', labelEn: 'Members Directory', path: '/members-list', icon: Users },
    { id: 'payment', labelBn: 'পেমেন্ট ও অনুদান', labelEn: 'Payment & Fees', path: '/payment', icon: CreditCard },
    { id: 'leadership', labelBn: 'নেতৃত্ব ও কমিটি', labelEn: 'Leadership', path: '/leadership', icon: Building2 },
    { id: 'about', labelBn: 'পরিচিতি ও বিভাগ', labelEn: 'About Association', path: '/about', icon: Building2 },
    { id: 'objectives', labelBn: 'লক্ষ্য ও উদ্দেশ্য', labelEn: 'Objectives', path: '/objectives', icon: Sparkles },
    { id: 'news', labelBn: 'সংবাদ ও বিজ্ঞপ্তি', labelEn: 'News & Events', path: '/news', icon: FileText },
    { id: 'gallery', labelBn: 'ফটো গ্যালারি', labelEn: 'Photo Gallery', path: '/gallery', icon: ImageIcon },
    { id: 'blood-corner', labelBn: 'ব্লাড কর্নার', labelEn: 'Blood Corner', path: '/blood-corner', icon: Heart },
    { id: 'job-news', labelBn: 'চাকরি সার্কুলার', labelEn: 'Job Circulars', path: '/job-news', icon: Briefcase },
    { id: 'contact', labelBn: 'যোগাযোগ', labelEn: 'Contact Us', path: '/contact', icon: Phone },
    { id: 'admin', labelBn: 'এডমিন ড্যাশবোর্ড', labelEn: 'Admin Panel', path: '/admin', icon: Shield },
  ];

  return (
    <div className="no-print">
      {/* 1. FLOATING OVERLAY TRIGGER BUTTON */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
          }}
          className="fixed bottom-5 left-5 z-[99999] bg-zinc-950/90 hover:bg-zinc-900 text-zinc-100 border border-emerald-500/40 hover:border-emerald-400 rounded-full pl-3 pr-3.5 py-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.6),0_0_15px_rgba(16,185,129,0.2)] backdrop-blur-md flex items-center gap-2 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer group select-none"
          title="Open Dev Tools Overlay"
        >
          {/* Glowing pulse indicator */}
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>

          <Terminal className="w-3.5 h-3.5 text-emerald-400 group-hover:rotate-12 transition-transform duration-200" />

          <span className="text-[11px] font-mono font-bold tracking-wider text-emerald-400">
            DEV
          </span>

          <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800/80 px-1.5 py-0.5 rounded border border-zinc-700/60 max-w-[90px] truncate">
            /{activePage}
          </span>

          <span className="hidden sm:inline-flex items-center text-[10px] font-mono text-emerald-300/80 bg-emerald-950/70 px-1.5 py-0.5 rounded border border-emerald-800/60">
            {bpInfo.tag.split(' ')[0]}
          </span>
        </button>
      )}

      {/* 2. EXPANDED DEV OVERLAY PANEL */}
      {isOpen && (
        <div
          className={`fixed bottom-5 left-5 z-[99999] bg-zinc-950/95 text-zinc-100 border border-emerald-500/40 rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_30px_rgba(16,185,129,0.2)] backdrop-blur-xl flex flex-col overflow-hidden transition-all duration-300 font-sans ${
            isMinimized
              ? 'w-72 h-14'
              : 'w-[calc(100vw-32px)] sm:w-[500px] max-h-[85vh] h-[640px]'
          }`}
        >
          {/* Top Header Bar */}
          <div className="bg-zinc-900/90 border-b border-zinc-800 px-3.5 py-2.5 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-6 h-6 rounded-lg bg-emerald-950/90 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shrink-0">
                <Terminal className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-white tracking-wide truncate">
                    Alumni Dev Overlay
                  </h3>
                  <span className="text-[9px] font-mono font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.2 rounded-full uppercase">
                    Dev Mode
                  </span>
                </div>
                {!isMinimized && (
                  <p className="text-[10px] text-zinc-400 font-mono truncate">
                    Vite React 19 • port 3000 • {bpInfo.tag}
                  </p>
                )}
              </div>
            </div>

            {/* Header Action Buttons */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={onToggleLanguage}
                className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-[10px] font-mono font-medium transition-colors border border-zinc-700 cursor-pointer"
                title="Toggle Language"
              >
                {language === 'bn' ? 'বাং → EN' : 'EN → বাং'}
              </button>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
                title={isMinimized ? 'Expand panel' : 'Minimize panel'}
              >
                {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded text-zinc-400 hover:text-red-400 hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Close overlay"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Tab Navigation Navigation */}
              <div className="flex border-b border-zinc-800/90 bg-zinc-900/50 px-2 pt-1.5 gap-1 shrink-0 overflow-x-auto scrollbar-none">
                <button
                  onClick={() => setActiveTab('routes')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'routes'
                      ? 'bg-zinc-800/90 text-emerald-400 border-t-2 border-emerald-500 font-semibold shadow-xs'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Routes ({routesList.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab('modals')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'modals'
                      ? 'bg-zinc-800/90 text-emerald-400 border-t-2 border-emerald-500 font-semibold shadow-xs'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Modals & Actions</span>
                </button>
                <button
                  onClick={() => setActiveTab('auth')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'auth'
                      ? 'bg-zinc-800/90 text-emerald-400 border-t-2 border-emerald-500 font-semibold shadow-xs'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Auth & Session</span>
                </button>
                <button
                  onClick={() => setActiveTab('diagnostics')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'diagnostics'
                      ? 'bg-zinc-800/90 text-emerald-400 border-t-2 border-emerald-500 font-semibold shadow-xs'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Diagnostics</span>
                </button>
              </div>

              {/* Scrollable Tab Content */}
              <div className="flex-1 overflow-y-auto p-3.5 space-y-4 text-xs">
                {/* ================= TAB 1: ROUTES ================= */}
                {activeTab === 'routes' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-zinc-400 px-0.5">
                      <span className="font-mono text-[11px] text-zinc-400">
                        Quick Route Jump (1-Click)
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
                        Active: /{activePage}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {routesList.map((route) => {
                        const Icon = route.icon;
                        const isActive = activePage === route.id;
                        return (
                          <button
                            key={route.id}
                            onClick={() => {
                              onNavigate(route.id as any);
                            }}
                            className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between gap-1.5 cursor-pointer relative group ${
                              isActive
                                ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                                : 'bg-zinc-900/70 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 text-zinc-300'
                            }`}
                          >
                            <div className="flex items-center justify-between w-full">
                              <div className="flex items-center gap-1.5">
                                <Icon
                                  className={`w-3.5 h-3.5 ${
                                    isActive ? 'text-emerald-400' : 'text-zinc-400 group-hover:text-zinc-200'
                                  }`}
                                />
                                <span className="font-bold text-[11px] text-white">
                                  {language === 'bn' ? route.labelBn : route.labelEn}
                                </span>
                              </div>
                              {isActive && (
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              )}
                            </div>
                            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 group-hover:text-zinc-400">
                              <span>{route.path}</span>
                              <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Quick Query Sub-routes */}
                    <div className="pt-2 border-t border-zinc-800/80">
                      <p className="text-[10px] font-mono text-zinc-400 mb-1.5">
                        Deep Link Sub-routes:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          onClick={() => {
                            window.history.pushState(null, '', '/payment?type=general');
                            onNavigate('payment');
                          }}
                          className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 hover:border-emerald-500/50 rounded-md text-[10px] font-mono text-zinc-300 transition-colors cursor-pointer"
                        >
                          /payment?type=general
                        </button>
                        <button
                          onClick={() => {
                            window.history.pushState(null, '', '/payment?type=life');
                            onNavigate('payment');
                          }}
                          className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 hover:border-emerald-500/50 rounded-md text-[10px] font-mono text-zinc-300 transition-colors cursor-pointer"
                        >
                          /payment?type=life
                        </button>
                        <button
                          onClick={() => {
                            window.history.pushState(null, '', '/payment?type=donation');
                            onNavigate('payment');
                          }}
                          className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 hover:border-emerald-500/50 rounded-md text-[10px] font-mono text-zinc-300 transition-colors cursor-pointer"
                        >
                          /payment?type=donation
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ================= TAB 2: MODALS & ACTIONS ================= */}
                {activeTab === 'modals' && (
                  <div className="space-y-3">
                    {/* Member Card & Form PDF */}
                    <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white flex items-center gap-1.5">
                          <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                          Member Card & Form PDF Modals
                        </span>
                        <span className="text-[10px] font-mono text-zinc-400">BOT-1024</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => onOpenMemberCard(DEV_MOCK_MEMBER)}
                          className="p-2 rounded-lg bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-200 font-medium text-left flex items-center justify-between transition-colors cursor-pointer"
                        >
                          <span>Preview Member Card</span>
                          <ExternalLink className="w-3 h-3 text-emerald-400" />
                        </button>
                        <button
                          onClick={() => onOpenMemberPdf(DEV_MOCK_MEMBER)}
                          className="p-2 rounded-lg bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700 text-zinc-200 font-medium text-left flex items-center justify-between transition-colors cursor-pointer"
                        >
                          <span>Preview Form PDF</span>
                          <ExternalLink className="w-3 h-3 text-zinc-400" />
                        </button>
                      </div>

                      {/* Custom Member Lookup */}
                      <div className="pt-2 border-t border-zinc-800/80 space-y-1.5">
                        <p className="text-[10px] text-zinc-400">
                          Lookup custom Member by ID, Form No or Phone:
                        </p>
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            placeholder="e.g. BOT-1001 or 01712345678"
                            value={customLookupKey}
                            onChange={(e) => {
                              setCustomLookupKey(e.target.value);
                              setLookupError(null);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleLookupMember();
                            }}
                            className="flex-1 bg-zinc-950 border border-zinc-700 rounded-lg px-2.5 py-1 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-hidden focus:border-emerald-500"
                          />
                          <button
                            onClick={handleLookupMember}
                            disabled={lookupLoading || !customLookupKey.trim()}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg font-medium transition-colors cursor-pointer shrink-0"
                          >
                            {lookupLoading ? '...' : 'Open'}
                          </button>
                        </div>
                        {lookupError && (
                          <p className="text-[10px] text-red-400 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {lookupError}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Form Autofill Action */}
                    <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white flex items-center gap-1.5">
                          <FileCheck2 className="w-3.5 h-3.5 text-blue-400" />
                          Registration Form Autofill
                        </span>
                        <span className="text-[10px] font-mono text-zinc-400">Sample Form Data</span>
                      </div>
                      <p className="text-[10px] text-zinc-400 leading-relaxed">
                        Instantly populates the membership registration form with sample alumni credentials (Dr. Mohammad Rafiqul Islam, 1st Batch) so you can test submissions without typing.
                      </p>
                      <button
                        onClick={handleTriggerAutofill}
                        className="w-full py-2 px-3 bg-blue-600/30 hover:bg-blue-600/40 text-blue-200 border border-blue-500/40 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                        <span>Autofill Registration Form</span>
                      </button>
                    </div>

                    {/* Donation & Notice & Speech Modals */}
                    <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl space-y-2">
                      <span className="font-semibold text-white flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        Other Core Modals
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={onOpenDonationModal}
                          className="p-2 rounded-lg bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700 text-zinc-200 text-left transition-colors cursor-pointer"
                        >
                          <div className="font-medium">Donation Modal</div>
                          <div className="text-[10px] text-zinc-400">Category selector</div>
                        </button>
                        <button
                          onClick={() => {
                            if (NOTICES_DATA && NOTICES_DATA.length > 0) {
                              onOpenNoticeModal(NOTICES_DATA[0]);
                            }
                          }}
                          className="p-2 rounded-lg bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700 text-zinc-200 text-left transition-colors cursor-pointer"
                        >
                          <div className="font-medium">Notice Modal</div>
                          <div className="text-[10px] text-zinc-400">Sample announcement</div>
                        </button>
                      </div>

                      {/* Leadership Speech Modals */}
                      <div className="pt-2 border-t border-zinc-800/80">
                        <p className="text-[10px] text-zinc-400 mb-1.5">Leadership Speech Modal:</p>
                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            onClick={() => onOpenSpeechModal('adviser')}
                            className="p-1.5 bg-zinc-800 hover:bg-zinc-700 rounded text-[11px] text-zinc-300 text-left cursor-pointer"
                          >
                            Chief Adviser
                          </button>
                          <button
                            onClick={() => onOpenSpeechModal('secretary')}
                            className="p-1.5 bg-zinc-800 hover:bg-zinc-700 rounded text-[11px] text-zinc-300 text-left cursor-pointer"
                          >
                            President
                          </button>
                          <button
                            onClick={() => onOpenSpeechModal('general_secretary')}
                            className="p-1.5 bg-zinc-800 hover:bg-zinc-700 rounded text-[11px] text-zinc-300 text-left cursor-pointer"
                          >
                            General Secretary
                          </button>
                          <button
                            onClick={() => onOpenSpeechModal('treasurer')}
                            className="p-1.5 bg-zinc-800 hover:bg-zinc-700 rounded text-[11px] text-zinc-300 text-left cursor-pointer"
                          >
                            Treasurer
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ================= TAB 3: AUTH & SESSION ================= */}
                {activeTab === 'auth' && (
                  <div className="space-y-3">
                    {/* Active Session Status */}
                    <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-emerald-400" />
                          Current Auth State
                        </span>
                        {loggedInMember ? (
                          <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
                            Authenticated
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded">
                            Guest / Visitor
                          </span>
                        )}
                      </div>

                      {loggedInMember ? (
                        <div className="p-2.5 rounded-lg bg-zinc-950/80 border border-zinc-800 space-y-1.5">
                          <div className="font-bold text-white text-xs">
                            {loggedInMember.applicantNameEn || loggedInMember.fullName || 'Logged in Member'}
                          </div>
                          <div className="text-[10px] font-mono text-zinc-400 space-y-0.5">
                            <div>Form No: {loggedInMember.formNo || loggedInMember.membershipId}</div>
                            <div>Mobile: {loggedInMember.mobile || loggedInMember.phone}</div>
                            <div>Batch: {loggedInMember.batch || loggedInMember.session || 'N/A'}</div>
                            <div>Status: <span className="text-emerald-400">{loggedInMember.status || 'approved'}</span></div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-[10px] text-zinc-400 leading-relaxed">
                          No member is currently logged in. Public pages are accessible, but member directory requires authentication.
                        </p>
                      )}
                    </div>

                    {/* Quick Login Simulations */}
                    <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl space-y-2">
                      <span className="font-semibold text-white text-xs">Simulate Member Login (1-Click)</span>
                      <p className="text-[10px] text-zinc-400">
                        Bypasses SMS/OTP verification to instantly simulate a logged-in session for testing member features.
                      </p>
                      <div className="space-y-1.5">
                        <button
                          onClick={() => {
                            onSetLoggedInMember(DEV_MOCK_MEMBER);
                            try {
                              localStorage.setItem(
                                'botany_alumni_logged_in_member',
                                JSON.stringify(DEV_MOCK_MEMBER)
                              );
                            } catch (e) {}
                          }}
                          className="w-full py-2 px-3 bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-200 border border-emerald-500/40 rounded-lg font-medium flex items-center justify-between transition-colors cursor-pointer"
                        >
                          <span className="flex items-center gap-1.5">
                            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                            Login as Dr. Rafiqul (Approved)
                          </span>
                          <span className="text-[10px] font-mono opacity-80">BOT-1024</span>
                        </button>

                        <button
                          onClick={() => {
                            onSetLoggedInMember(DEV_MOCK_PENDING_MEMBER);
                            try {
                              localStorage.setItem(
                                'botany_alumni_logged_in_member',
                                JSON.stringify(DEV_MOCK_PENDING_MEMBER)
                              );
                            } catch (e) {}
                          }}
                          className="w-full py-2 px-3 bg-amber-600/30 hover:bg-amber-600/40 text-amber-200 border border-amber-500/40 rounded-lg font-medium flex items-center justify-between transition-colors cursor-pointer"
                        >
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-amber-400" />
                            Login as Tariqul (Pending)
                          </span>
                          <span className="text-[10px] font-mono opacity-80">BOT-1088</span>
                        </button>

                        {loggedInMember && (
                          <button
                            onClick={onLogout}
                            className="w-full py-2 px-3 bg-red-950/40 hover:bg-red-900/40 text-red-300 border border-red-800/50 rounded-lg font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <LogOut className="w-3.5 h-3.5 text-red-400" />
                            Logout Current Member
                          </button>
                        )}

                        <button
                          onClick={onOpenLoginModal}
                          className="w-full py-2 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <LogIn className="w-3.5 h-3.5 text-zinc-400" />
                          Open Real Login Modal (OTP flow)
                        </button>
                      </div>
                    </div>

                    {/* Admin & Storage Reset */}
                    <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl space-y-2">
                      <span className="font-semibold text-white text-xs">Admin & Storage Operations</span>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => onNavigate(activePage === 'admin' ? 'home' : 'admin')}
                          className="p-2 rounded-lg bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700 text-zinc-200 text-left transition-colors cursor-pointer"
                        >
                          <div className="font-medium flex items-center gap-1.5">
                            <Shield className="w-3.5 h-3.5 text-emerald-400" />
                            {activePage === 'admin' ? 'Back to Home' : 'Admin Panel'}
                          </div>
                          <div className="text-[10px] font-mono text-zinc-400">Ctrl + Shift + A</div>
                        </button>

                        <button
                          onClick={handleClearStorage}
                          className="p-2 rounded-lg bg-red-950/30 hover:bg-red-900/30 border border-red-800/40 text-red-300 text-left transition-colors cursor-pointer"
                        >
                          <div className="font-medium flex items-center gap-1.5">
                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                            Reset Storage
                          </div>
                          <div className="text-[10px] text-zinc-400">Clear localStorage</div>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ================= TAB 4: DIAGNOSTICS ================= */}
                {activeTab === 'diagnostics' && (
                  <div className="space-y-3">
                    {/* Viewport & Responsive */}
                    <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white flex items-center gap-1.5">
                          <BpIcon className="w-3.5 h-3.5 text-emerald-400" />
                          Screen & Breakpoint
                        </span>
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
                          {bpInfo.tag}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-mono text-zinc-300 bg-zinc-950/80 p-2 rounded-lg border border-zinc-800">
                        <span>Resolution:</span>
                        <span className="text-white font-bold">
                          {windowDimensions.width}px × {windowDimensions.height}px
                        </span>
                      </div>
                    </div>

                    {/* API Health Check */}
                    <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white flex items-center gap-1.5">
                          <Activity className="w-3.5 h-3.5 text-blue-400" />
                          Express Server Health (/api/health)
                        </span>
                        <button
                          onClick={handlePingHealth}
                          disabled={healthStatus.loading}
                          className="px-2 py-0.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded text-[10px] font-medium transition-colors cursor-pointer"
                        >
                          {healthStatus.loading ? 'Pinging...' : 'Ping'}
                        </button>
                      </div>
                      {healthStatus.data ? (
                        <div className="p-2 rounded bg-zinc-950 border border-zinc-800 font-mono text-[10px] space-y-1 text-zinc-300">
                          <div className="flex items-center justify-between">
                            <span>Status:</span>
                            <span className="text-emerald-400 font-bold">
                              {healthStatus.data.status} ({healthStatus.latencyMs}ms)
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Resend Email:</span>
                            <span
                              className={
                                healthStatus.data.resendConfigured
                                  ? 'text-emerald-400'
                                  : 'text-amber-400'
                              }
                            >
                              {healthStatus.data.resendConfigured ? 'Configured' : 'Missing API Key'}
                            </span>
                          </div>
                        </div>
                      ) : healthStatus.error ? (
                        <div className="p-2 rounded bg-red-950/50 border border-red-800/50 font-mono text-[10px] text-red-300">
                          {healthStatus.error}
                        </div>
                      ) : (
                        <p className="text-[10px] text-zinc-500">
                          Click Ping to verify local Node.js Express server response & email configuration.
                        </p>
                      )}
                    </div>

                    {/* Cloudflare Worker Community Stats */}
                    <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white flex items-center gap-1.5">
                          <Database className="w-3.5 h-3.5 text-emerald-400" />
                          Worker D1 Stats (/api/stats/community)
                        </span>
                        <button
                          onClick={handlePingStats}
                          disabled={communityStats.loading}
                          className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded text-[10px] font-medium transition-colors cursor-pointer"
                        >
                          {communityStats.loading ? 'Fetching...' : 'Query'}
                        </button>
                      </div>
                      {communityStats.data ? (
                        <div className="p-2 rounded bg-zinc-950 border border-zinc-800 font-mono text-[10px] space-y-1 text-zinc-300">
                          <div className="flex items-center justify-between">
                            <span>Total Approved Members:</span>
                            <span className="text-white font-bold">
                              {communityStats.data.totalMembers ?? 0}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Life Members:</span>
                            <span className="text-emerald-400 font-bold">
                              {communityStats.data.lifeMembers ?? 0}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Paid Donors:</span>
                            <span className="text-amber-400 font-bold">
                              {communityStats.data.donorMembers ?? 0}
                            </span>
                          </div>
                        </div>
                      ) : communityStats.error ? (
                        <div className="p-2 rounded bg-red-950/50 border border-red-800/50 font-mono text-[10px] text-red-300">
                          {communityStats.error}
                        </div>
                      ) : (
                        <p className="text-[10px] text-zinc-500">
                          Click Query to check Cloudflare Worker / D1 database aggregation.
                        </p>
                      )}
                    </div>

                    {/* Current URL & Copy */}
                    <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white text-xs">Current Route & URL</span>
                        <button
                          onClick={handleCopyUrl}
                          className="flex items-center gap-1 text-[10px] text-zinc-400 hover:text-white cursor-pointer"
                        >
                          {copiedUrl ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy URL</span>
                            </>
                          )}
                        </button>
                      </div>
                      <div className="p-2 bg-zinc-950 border border-zinc-800 rounded font-mono text-[10px] text-zinc-300 break-all select-all">
                        {typeof window !== 'undefined' ? window.location.href : '/'}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Footer Info */}
              <div className="bg-zinc-900/90 border-t border-zinc-800 px-3.5 py-2 flex items-center justify-between text-[10px] font-mono text-zinc-500 shrink-0">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Dev tools visible in development only
                </span>
                <span className="text-zinc-400">Ctrl + Shift + A (Admin)</span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
