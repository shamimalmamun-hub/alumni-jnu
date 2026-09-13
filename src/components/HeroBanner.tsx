import React, { useState } from 'react';
import { Home, ChevronDown, Menu, X, ChevronRight, Globe, Trees } from 'lucide-react';
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

  return (
    <header className="w-full bg-[#083d24] text-white shadow-xs relative">
      {/* Top Branding Section: Website Name & Dual Logos above the Banner */}
      <div id="hero-branding-header" className="w-full bg-gradient-to-r from-[#06331c] via-[#0b4629] to-[#052b17] border-b border-emerald-500/40 py-2 sm:py-3.5 px-2 sm:px-6 font-siliguri overflow-hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-1.5 sm:gap-4">
          {/* Left: Botany Alumni Association Logo & Title */}
          <div className="flex items-center gap-1.5 min-[375px]:gap-2.5 sm:gap-3.5 md:gap-4 text-left min-w-0 flex-1">
            {/* Department of Botany Alumni Association Logo */}
            <div
              className="w-10 h-10 min-[375px]:w-11 min-[375px]:h-11 sm:w-16 sm:h-16 md:w-20 md:h-20 shrink-0 flex items-center justify-center relative group"
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
              <h1 className="text-[12.5px] min-[360px]:text-[14px] min-[400px]:text-[15.5px] sm:text-xl md:text-2xl lg:text-3xl font-black tracking-tight text-white font-serif-bn leading-tight sm:leading-tight drop-shadow-sm line-clamp-2 sm:line-clamp-none break-words">
                {language === 'bn' ? 'উদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশন' : 'Botany Alumni Association'}
              </h1>
              <p className="text-[10px] min-[360px]:text-[11px] sm:text-sm md:text-base lg:text-lg font-bold text-amber-300 tracking-wide leading-tight sm:leading-normal flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                <span>{language === 'bn' ? 'জগন্নাথ বিশ্ববিদ্যালয়' : 'Jagannath University'}</span>
                <span className="text-emerald-300/70 font-normal hidden min-[400px]:inline">•</span>
                <span className="text-[9.5px] sm:text-xs md:text-sm font-semibold text-emerald-100 hidden min-[400px]:inline font-serif-bn">
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
              className="w-10 h-10 min-[375px]:w-11 min-[375px]:h-11 sm:w-16 sm:h-16 md:w-20 md:h-20 shrink-0 flex items-center justify-center relative group"
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
            <div className="flex items-center gap-1.5 font-bold text-[11px] min-[360px]:text-xs sm:text-sm text-amber-300 tracking-wide font-anek min-w-0 truncate">
              <Trees className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
              <span className="truncate">{language === 'bn' ? 'উদ্ভিদ ★ সমৃদ্ধি ★ শান্তি' : 'Plant ★ Prosperity ★ Peace'}</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {onLanguageToggle && (
                <button
                  onClick={onLanguageToggle}
                  className="px-2 py-1 text-[11px] font-bold bg-emerald-800/90 text-amber-300 rounded border border-emerald-600/60 transition-colors flex items-center gap-1 cursor-pointer"
                  title={language === 'bn' ? 'Switch to English' : 'বাংলায় দেখুন'}
                >
                  <Globe className="w-3 h-3" />
                  <span>{language === 'bn' ? 'EN' : 'বাং'}</span>
                </button>
              )}
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
                className={`flex items-center justify-center px-3 py-2.5 transition-colors border-r border-emerald-700/50 cursor-pointer ${
                  activePage === 'home'
                    ? 'bg-[#002f23] text-amber-300 font-extrabold'
                    : 'hover:bg-[#003d2e] text-white'
                }`}
                title={language === 'bn' ? 'হোম' : 'Home'}
              >
                <Home className="w-4 h-4" />
              </button>
            </li>

            {/* Menu Items with Dropdowns */}
            {NAV_MENU.map((item, idx) => {
              const title = language === 'bn' ? item.titleBn : item.titleEn;

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
                    className="flex items-center gap-1 px-3 py-2.5 hover:bg-[#003d2e] transition-colors cursor-pointer text-xs xl:text-sm font-medium text-white"
                  >
                    <span>{title}</span>
                    {item.children && <ChevronDown className="w-3 h-3 opacity-80" />}
                  </button>

                  {/* Dropdown Menu */}
                  {item.children && activeDropdown === item.titleEn && (
                    <div className="absolute left-0 top-full w-64 bg-[#004232] border border-emerald-600/50 shadow-2xl rounded-b-md py-1.5 text-xs z-[100] animate-in fade-in slide-in-from-top-1 duration-150">
                      {item.children.map((child, cIdx) => (
                        <div key={cIdx} className="relative group/sub">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveDropdown(null);
                              onMenuClick(language === 'bn' ? child.titleBn : child.titleEn);
                            }}
                            className="w-full text-left flex items-center justify-between px-4 py-2 hover:bg-[#006a4e] text-emerald-100 hover:text-white transition-colors font-medium cursor-pointer"
                          >
                            <span>{language === 'bn' ? child.titleBn : child.titleEn}</span>
                            {child.children && <ChevronRight className="w-3.5 h-3.5 opacity-80 ml-2" />}
                          </button>

                          {/* Sub-Dropdown Menu (Level 2) */}
                          {child.children && (
                            <div className="hidden group-hover/sub:block absolute left-full top-0 w-60 bg-[#004232] border border-emerald-600/50 shadow-2xl rounded-r-md rounded-b-md py-1.5 text-xs z-[110]">
                              {child.children.map((subChild, sIdx) => (
                                <button
                                  key={sIdx}
                                  type="button"
                                  onClick={() => {
                                    setActiveDropdown(null);
                                    onMenuClick(language === 'bn' ? subChild.titleBn : subChild.titleEn);
                                  }}
                                  className="w-full text-left block px-4 py-2 hover:bg-[#006a4e] text-emerald-100 hover:text-white transition-colors cursor-pointer"
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

            {/* Right Language Toggle */}
            {onLanguageToggle && (
              <li className="ml-auto flex items-center pl-2 py-1 shrink-0">
                <button
                  id="header-lang-toggle-btn"
                  onClick={onLanguageToggle}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold bg-emerald-800 hover:bg-emerald-700 text-amber-300 rounded border border-emerald-600/60 transition-colors shrink-0 cursor-pointer shadow-xs"
                  title={language === 'bn' ? 'English এ পরিবর্তন করুন' : 'বাংলায় পরিবর্তন করুন'}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'English' : 'বাংলা'}</span>
                </button>
              </li>
            )}
          </ul>

          {/* Mobile Navigation Dropdown */}
          {mobileMenuOpen && (
            <div className="lg:hidden pb-4 pt-2 border-t border-emerald-700/60 space-y-2">
              {onLanguageToggle && (
                <div className="px-2 py-1 flex justify-end">
                  <button
                    onClick={() => {
                      onLanguageToggle();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-emerald-800 hover:bg-emerald-700 text-amber-300 rounded border border-emerald-600/60 transition-colors cursor-pointer"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'English Version' : 'বাংলা সংস্করণ'}</span>
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onMenuClick('হোম');
                }}
                className="w-full flex items-center gap-2 p-2 rounded hover:bg-[#003d2e] text-amber-300 font-semibold text-sm cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>{language === 'bn' ? 'হোম বাতায়ন' : 'Home Page'}</span>
              </button>



              {NAV_MENU.map((item, idx) => {
                const itemTitle = language === 'bn' ? item.titleBn : item.titleEn;
                const isSubOpen = mobileSubOpen === idx;
                return (
                  <div key={idx} className="border-b border-emerald-700/40 pb-2">
                    {item.children ? (
                      <button
                        type="button"
                        onClick={() => setMobileSubOpen(isSubOpen ? null : idx)}
                        className="w-full flex items-center justify-between font-semibold text-amber-200 text-sm px-2 py-1.5 hover:bg-[#003d2e] rounded transition-colors cursor-pointer"
                      >
                        <span>{itemTitle}</span>
                        <ChevronDown className={`w-4 h-4 text-amber-300 transition-transform duration-200 ${isSubOpen ? 'rotate-180' : ''}`} />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          onMenuClick(itemTitle);
                        }}
                        className="w-full text-left font-semibold text-amber-300 text-sm px-2 py-1.5 hover:bg-[#003d2e] rounded transition-colors cursor-pointer"
                      >
                        {itemTitle}
                      </button>
                    )}
                    {item.children && isSubOpen && (
                      <div className="pl-4 space-y-1.5 mt-1.5 text-xs text-emerald-100 bg-[#002f23]/60 p-2 rounded-lg border border-emerald-700/50 animate-in fade-in duration-200">
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
                                className="w-full text-left py-1 hover:text-white font-semibold text-emerald-200 cursor-pointer flex items-center gap-1.5"
                              >
                                <span className="text-amber-400 font-bold">&bull;</span>
                                <span>{childTitle}</span>
                              </button>
                              {child.children && (
                                <div className="pl-4 space-y-1 my-1 text-xs text-amber-100/90 border-l border-emerald-600/40">
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
                                        className="w-full text-left py-0.5 hover:text-amber-300 cursor-pointer flex items-center gap-1"
                                      >
                                        <span className="text-amber-300">&ndash;</span>
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
