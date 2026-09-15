import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Home, ChevronDown, Menu, X, ChevronRight, Trees } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { NAV_MENU } from '../data/portalData';
import jnuBotanyLogo from '../assets/images/jnu_botany_alumni_logo.jpg';

interface HeroBannerProps {
  language: 'bn' | 'en';
  onMenuClick: (menuTitle: string) => void;
  onSearch?: (query: string) => void;
  onLanguageToggle?: () => void;
  activePage?: string;
}

const BOTANY_ALUMNI_LOGO_URL = jnuBotanyLogo;
const BOTANY_ALUMNI_LOGO_FALLBACK = '/jnu_botany_alumni_logo.jpg';

const JNU_MAIN_LOGO_URL =
  'https://upload.wikimedia.org/wikipedia/en/thumb/4/47/Logo_of_Jagannath_University.svg/960px-Logo_of_Jagannath_University.svg.png?utm_source=en.wikipedia.org&utm_campaign=imageinfo&utm_content=thumbnail';
const JNU_MAIN_LOGO_FALLBACK =
  'https://upload.wikimedia.org/wikipedia/en/4/47/Logo_of_Jagannath_University.svg';

export const HeroBanner: React.FC<HeroBannerProps> = ({
  language,
  onMenuClick,
  onSearch: _onSearch,
  onLanguageToggle,
  activePage = 'home',
}) => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSubOpen, setMobileSubOpen] = useState<number | null>(null);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Click handler to go back to Home page and reload the application
  const handleHeaderGoHome = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }
    if (window.location.pathname !== '/' || window.location.search || window.location.hash) {
      window.location.href = '/';
    } else {
      window.location.reload();
    }
  };

  return (
    <header className="w-full bg-[#083d24] text-white shadow-xs relative">
      {/* Top Branding Section: Website Name & Dual Logos above the Banner */}
      <div
        id="hero-branding-header"
        onClick={handleHeaderGoHome}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleHeaderGoHome();
          }
        }}
        title={language === 'bn' ? 'হোম পেইজে যান (রিলোড)' : 'Go to Home (Reload)'}
        className="w-full bg-gradient-to-r from-[#06331c] via-[#0b4629] to-[#052b17] border-b border-emerald-500/40 py-2 sm:py-3.5 px-2 sm:px-6 font-siliguri overflow-hidden cursor-pointer select-none transition-colors hover:brightness-105 active:brightness-95"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-1.5 sm:gap-4">
          {/* Left: Botany Alumni Association Logo & Title */}
          <div className="flex items-center gap-2 min-[375px]:gap-3 sm:gap-3.5 md:gap-4 text-left min-w-0 flex-1">
            {/* Department of Botany Alumni Association Logo */}
            <div
              className="w-11 h-11 min-[360px]:w-12 min-[360px]:h-12 min-[400px]:w-13 min-[400px]:h-13 sm:w-16 sm:h-16 md:w-20 md:h-20 shrink-0 flex items-center justify-center relative group"
              title={language === 'bn' ? 'উদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশন' : 'Botany Alumni Association'}
            >
              <div className="absolute -inset-0.5 sm:-inset-1 rounded-full bg-emerald-400/30 blur-xs group-hover:bg-emerald-400/50 transition-all"></div>
              <img
                src={BOTANY_ALUMNI_LOGO_URL}
                alt={language === 'bn' ? 'উদ্ভিদবিজ্ঞান অ্যালামনাই লোগো' : 'Botany Alumni Association Logo'}
                className="w-full h-full object-contain rounded-full shadow-lg border-2 border-emerald-400/60 relative z-10 bg-white p-0.5 transition-transform group-hover:scale-105"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = BOTANY_ALUMNI_LOGO_FALLBACK;
                }}
              />
            </div>

            {/* Title Text */}
            <div className="space-y-0.5 sm:space-y-1 text-left min-w-0 flex-1 overflow-hidden">
              <h1 className="text-[15px] min-[360px]:text-[16.5px] min-[400px]:text-[18px] sm:text-xl md:text-2xl lg:text-3xl font-black tracking-tight text-white font-serif-bn leading-tight sm:leading-tight drop-shadow-sm line-clamp-2 sm:line-clamp-none break-words">
                {language === 'bn' ? 'উদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশন' : 'Botany Alumni Association'}
              </h1>
              <p className="text-[12px] min-[360px]:text-[13px] min-[400px]:text-[14px] sm:text-sm md:text-base lg:text-lg font-bold text-amber-300 tracking-wide leading-snug sm:leading-normal">
                <span>{language === 'bn' ? 'জগন্নাথ বিশ্ববিদ্যালয়, ' : 'Jagannath University, '}</span>
                <span className="text-[11px] min-[360px]:text-[12px] min-[400px]:text-[13px] sm:text-xs md:text-sm font-semibold text-emerald-100/95 font-serif-bn">
                  {language === 'bn' ? '৯-১০ চিত্তরঞ্জন এভিনিউ, ঢাকা-১১০০' : '9-10 Chittaranjan Ave, Dhaka 1100'}
                </span>
              </p>
            </div>
          </div>

          {/* Right: Slogan (Desktop) & Jagannath University Official Logo */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {/* Desktop Slogan Block */}
            <div className="hidden md:flex flex-col items-end text-right text-xs text-white/90 border-r border-emerald-500/30 pr-4 py-1 space-y-0.5">
              <div className="flex items-center gap-1.5 text-amber-300 font-extrabold text-sm sm:text-base tracking-wide">
                <Trees className="w-4 h-4 text-emerald-300" />
                <span className="font-anek tracking-wider font-black">Plant ★ Prosperity ★ Peace</span>
              </div>
              <span className="text-emerald-200 font-bold text-xs tracking-wide">
                {language === 'bn'
                  ? 'উদ্ভিদ ★ সমৃদ্ধি ★ শান্তি'
                  : 'Plant ★ Prosperity ★ Peace'}
              </span>
            </div>

            {/* Jagannath University Official Logo */}
            <div
              className="w-11 h-11 min-[360px]:w-12 min-[360px]:h-12 min-[400px]:w-13 min-[400px]:h-13 sm:w-16 sm:h-16 md:w-20 md:h-20 shrink-0 flex items-center justify-center relative group"
              title={language === 'bn' ? 'জগন্নাথ বিশ্ববিদ্যালয়' : 'Jagannath University'}
            >
              <div className="absolute -inset-0.5 sm:-inset-1 rounded-full bg-amber-400/25 blur-xs group-hover:bg-amber-400/40 transition-all"></div>
              <img
                src={JNU_MAIN_LOGO_URL}
                alt={language === 'bn' ? 'জগন্নাথ বিশ্ববিদ্যালয় লোগো' : 'Jagannath University Logo'}
                className="w-full h-full object-contain rounded-full shadow-lg border-2 border-amber-400/60 relative z-10 bg-white p-0.5 sm:p-1 transition-transform group-hover:scale-105"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = JNU_MAIN_LOGO_FALLBACK;
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Menu Bar */}
      <nav id="main-navigation" className="bg-[#042817] border-b border-emerald-600/40 text-white text-sm relative z-40 font-siliguri">
        <div className="max-w-7xl mx-auto px-2.5 sm:px-6">
          {/* Mobile navigation bar with Slogan and hamburger */}
          <div className="flex items-center justify-between py-2 sm:py-2.5 lg:hidden gap-2">
            <div className="flex items-center gap-1.5 font-bold text-xs min-[360px]:text-[13px] sm:text-sm text-amber-300 tracking-wide font-anek min-w-0 truncate">
              <Trees className="w-4 h-4 text-emerald-300 shrink-0" />
              <span className="truncate">{language === 'bn' ? 'উদ্ভিদ ★ সমৃদ্ধি ★ শান্তি' : 'Plant ★ Prosperity ★ Peace'}</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                id="mobile-menu-toggle"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1.5 rounded bg-emerald-800 text-white hover:bg-emerald-700 transition-colors flex items-center gap-1 cursor-pointer"
                aria-label={language === 'bn' ? 'মেনু খুলুন' : 'Open Menu'}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Desktop Navigation */}
          <ul className="hidden lg:flex items-center flex-nowrap whitespace-nowrap gap-0.5 py-0 font-semibold overflow-visible">
            {/* Home Icon */}
            <li className="shrink-0">
              <button
                id="nav-item-home"
                onClick={() => onMenuClick('হোম')}
                className={`flex items-center justify-center px-3.5 py-2.5 transition-colors border-r border-emerald-700/50 cursor-pointer ${
                  activePage === 'home'
                    ? 'bg-[#002f23] text-amber-300 font-extrabold'
                    : 'hover:bg-[#003d2e] text-white'
                }`}
                title={language === 'bn' ? 'হোম' : 'Home'}
              >
                <Home className="w-4.5 h-4.5" />
              </button>
            </li>

            {/* Menu Items with Dropdowns */}
            {NAV_MENU.map((item, idx) => {
              const title = language === 'bn' ? item.titleBn : item.titleEn;
              const isItemActive = (() => {
                if (item.href === '#about' && (activePage === 'about' || activePage === 'objectives')) return true;
                if (item.href === '#leadership' && activePage === 'leadership') return true;
                if (item.href === '#membership' && activePage === 'membership') return true;
                if (item.href === '#members-list' && activePage === 'members-list') return true;
                if (item.href === '#blood-corner' && activePage === 'blood-corner') return true;
                if (item.href === '#job-news' && activePage === 'job-news') return true;
                if (item.href === '#contact' && activePage === 'contact') return true;
                return false;
              })();

              return (
                <li
                  key={idx}
                  className="relative border-r border-emerald-700/50 shrink-0"
                  onMouseEnter={() => item.children && setActiveDropdown(item.titleEn)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button
                    id={`nav-menu-btn-${idx}`}
                    onClick={() => {
                      if (item.children) {
                        setActiveDropdown(activeDropdown === item.titleEn ? null : item.titleEn);
                      } else {
                        onMenuClick(title);
                      }
                    }}
                    className={`flex items-center gap-1 px-2.5 xl:px-3.5 py-2.5 transition-colors cursor-pointer text-[13px] xl:text-[14px] 2xl:text-[15px] font-semibold tracking-wide ${
                      isItemActive
                        ? 'bg-[#002f23] text-amber-300 font-bold'
                        : 'hover:bg-[#003d2e] text-white'
                    }`}
                  >
                    <span>{title}</span>
                    {item.children && <ChevronDown className="w-3.5 h-3.5 opacity-90" />}
                  </button>

                  {/* Dropdown Menu */}
                  {item.children && activeDropdown === item.titleEn && (
                    <div className="absolute left-0 top-full w-72 bg-[#004232] border border-emerald-600/50 shadow-2xl rounded-b-md py-2 text-[13.5px] xl:text-[14px] z-[100] animate-in fade-in slide-in-from-top-1 duration-150">
                      {item.children.map((child, cIdx) => (
                        <div key={cIdx} className="relative group/sub">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveDropdown(null);
                              onMenuClick(language === 'bn' ? child.titleBn : child.titleEn);
                            }}
                            className="w-full text-left flex items-center justify-between px-4 py-2.5 hover:bg-[#006a4e] text-emerald-100 hover:text-white transition-colors font-medium text-[13.5px] xl:text-[14px] cursor-pointer leading-snug"
                          >
                            <span>{language === 'bn' ? child.titleBn : child.titleEn}</span>
                            {child.children && <ChevronRight className="w-3.5 h-3.5 opacity-80 ml-2" />}
                          </button>

                          {/* Sub-Dropdown Menu (Level 2) */}
                          {child.children && (
                            <div className="hidden group-hover/sub:block absolute left-full top-0 w-72 bg-[#004232] border border-emerald-600/50 shadow-2xl rounded-r-md rounded-b-md py-2 text-[13.5px] xl:text-[14px] z-[110]">
                              {child.children.map((subChild, sIdx) => (
                                <button
                                  key={sIdx}
                                  type="button"
                                  onClick={() => {
                                    setActiveDropdown(null);
                                    onMenuClick(language === 'bn' ? subChild.titleBn : subChild.titleEn);
                                  }}
                                  className="w-full text-left block px-4 py-2.5 hover:bg-[#006a4e] text-emerald-100 hover:text-white transition-colors cursor-pointer text-[13.5px] xl:text-[14px] leading-snug"
                                >
                                  {language === 'bn' ? subChild.titleBn : subChild.titleEn}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </li>
              );
            })}

            {/* Desktop Navigation closes */}
          </ul>

          {/* Mobile Off-Canvas Side Drawer mounted directly to body with highest z-index */}
          {typeof document !== 'undefined' &&
            createPortal(
              <AnimatePresence>
                {mobileMenuOpen && (
                  <div className="fixed inset-0 z-[99999] lg:hidden">
                    {/* Backdrop Overlay */}
                    <motion.div
                      key="mobile-drawer-backdrop"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.35, ease: 'easeInOut' }}
                      onClick={() => setMobileMenuOpen(false)}
                      className="fixed inset-0 bg-black/75 backdrop-blur-xs"
                      aria-hidden="true"
                    />

                    {/* Sliding Side Drawer */}
                    <motion.div
                      key="mobile-drawer-panel"
                      initial={{ x: '100%' }}
                      animate={{ x: 0 }}
                      exit={{ x: '100%' }}
                      transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                      className="fixed top-0 right-0 bottom-0 w-[90%] max-w-[380px] sm:max-w-[420px] bg-gradient-to-b from-[#06331c] via-[#094227] to-[#042414] text-white shadow-2xl flex flex-col border-l border-emerald-500/40 overflow-hidden"
                    >
                      {/* Drawer Header */}
                      <div className="p-4 sm:p-5 border-b border-emerald-600/40 flex items-center justify-between bg-[#042514]/95 shadow-xs">
                        <div
                          onClick={() => {
                            setMobileMenuOpen(false);
                            handleHeaderGoHome();
                          }}
                          className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer hover:opacity-90 transition-opacity"
                          title={language === 'bn' ? 'হোম পেইজে যান (রিলোড)' : 'Go to Home (Reload)'}
                        >
                          <img
                            src={BOTANY_ALUMNI_LOGO_URL}
                            alt="Logo"
                            className="w-11 h-11 rounded-full border-2 border-amber-400/80 object-cover shrink-0 shadow-xs"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = BOTANY_ALUMNI_LOGO_FALLBACK;
                            }}
                          />
                          <div className="min-w-0 flex-1">
                            <h2 className="text-sm sm:text-base font-extrabold text-amber-300 leading-snug font-serif-bn">
                              {language === 'bn' ? 'উদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশন' : 'Botany Alumni Association'}
                            </h2>
                            <p className="text-[11px] text-emerald-200">
                              {language === 'bn' ? 'জগন্নাথ বিশ্ববিদ্যালয়, ঢাকা' : 'Jagannath University, Dhaka'}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setMobileMenuOpen(false);
                          }}
                          className="p-2 rounded-full text-emerald-200 hover:text-white hover:bg-emerald-800 transition-colors cursor-pointer shrink-0"
                          aria-label="Close menu"
                        >
                          <X className="w-6 h-6" />
                        </button>
                      </div>

                      {/* Scrollable Navigation Items */}
                      <div className="flex-1 overflow-y-auto p-4 space-y-1.5 font-siliguri custom-scrollbar">
                        {/* Home full button */}
                        <button
                          type="button"
                          onClick={() => {
                            setMobileMenuOpen(false);
                            onMenuClick('হোম');
                          }}
                          className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-emerald-800/60 bg-emerald-900/40 border border-emerald-700/50 text-amber-300 font-extrabold text-[16px] sm:text-[17px] cursor-pointer transition-colors text-left shadow-xs"
                        >
                          <Home className="w-5 h-5 text-amber-300" />
                          <span>{language === 'bn' ? 'হোম বাতায়ন' : 'Home Page'}</span>
                        </button>

                        {NAV_MENU.map((item, idx) => {
                          const itemTitle = language === 'bn' ? item.titleBn : item.titleEn;
                          const isSubOpen = mobileSubOpen === idx;
                          return (
                            <div key={idx} className="border-b border-emerald-800/40 pb-1.5 pt-1">
                              {item.children ? (
                                <button
                                  type="button"
                                  onClick={() => setMobileSubOpen(isSubOpen ? null : idx)}
                                  className="w-full flex items-center justify-between font-extrabold text-amber-200 hover:text-white text-[16px] sm:text-[17px] px-3 py-2.5 sm:py-3 hover:bg-emerald-800/50 rounded-xl transition-colors cursor-pointer text-left"
                                >
                                  <span>{itemTitle}</span>
                                  <ChevronDown
                                    className={`w-5 h-5 text-amber-300 transition-transform duration-300 ${
                                      isSubOpen ? 'rotate-180 text-amber-400' : ''
                                    }`}
                                  />
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setMobileMenuOpen(false);
                                    onMenuClick(itemTitle);
                                  }}
                                  className="w-full text-left font-extrabold text-amber-300 hover:text-white text-[16px] sm:text-[17px] px-3 py-2.5 sm:py-3 hover:bg-emerald-800/50 rounded-xl transition-colors cursor-pointer"
                                >
                                  {itemTitle}
                                </button>
                              )}

                              {item.children && isSubOpen && (
                                <div className="pl-2 space-y-1 mt-1 text-sm text-emerald-100 bg-[#002b1f]/80 p-2.5 rounded-xl border border-emerald-700/50 animate-in fade-in duration-200">
                                  {item.children.map((child, cIdx) => {
                                    const childTitle = language === 'bn' ? child.titleBn : child.titleEn;
                                    return (
                                      <div key={cIdx}>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setMobileMenuOpen(false);
                                            onMenuClick(childTitle);
                                          }}
                                          className="w-full text-left py-2 px-2.5 rounded-lg hover:bg-emerald-800/60 hover:text-white font-bold text-emerald-100 text-[15px] sm:text-[15.5px] cursor-pointer flex items-center gap-2 transition-colors"
                                        >
                                          <span className="text-amber-400 font-bold text-base">&bull;</span>
                                          <span>{childTitle}</span>
                                        </button>
                                        {child.children && (
                                          <div className="pl-3.5 space-y-1 my-1 text-xs text-amber-100 border-l-2 border-emerald-600/50 ml-2.5">
                                            {child.children.map((subChild, sIdx) => {
                                              const subTitle = language === 'bn' ? subChild.titleBn : subChild.titleEn;
                                              return (
                                                <button
                                                  key={sIdx}
                                                  type="button"
                                                  onClick={() => {
                                                    setMobileMenuOpen(false);
                                                    onMenuClick(subTitle);
                                                  }}
                                                  className="w-full text-left py-1.5 px-2.5 rounded-lg hover:bg-emerald-800/50 hover:text-amber-300 cursor-pointer flex items-center gap-2 text-[14px] sm:text-[14.5px] font-medium transition-colors"
                                                >
                                                  <span className="text-amber-300 font-bold">&ndash;</span>
                                                  <span>{subTitle}</span>
                                                </button>
                                              );
                                            })}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>,
              document.body
            )}
        </div>
      </nav>

      {/* Website Banner Image directly below navigation */}
      <div
        id="hero-header-banner-image"
        className="w-full bg-[#021a0f] border-b border-emerald-700/60 relative overflow-hidden"
      >
        <img
          src="https://mssalumni.org/wp-content/uploads/2026/09/Gemini_Generated_Image_188tet188tet188t.jpg"
          alt={language === 'bn' ? 'উদ্ভিদবিজ্ঞান বিভাগ অ্যালামনাই অ্যাসোসিয়েশন ব্যানার' : 'Department of Botany Alumni Association Banner'}
          className="w-full h-auto max-h-[380px] object-cover object-center block"
          referrerPolicy="no-referrer"
        />
      </div>
    </header>
  );
};
