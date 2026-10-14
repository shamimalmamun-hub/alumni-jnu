import React from 'react';
import { Facebook, Instagram, Youtube, User, LogOut, Lock } from 'lucide-react';

interface HeaderTopProps {
  language: 'bn' | 'en';
  loggedInMember?: any;
  onLogout?: () => void;
  onOpenLoginModal?: () => void;
}

export const HeaderTop: React.FC<HeaderTopProps> = ({
  language,
  loggedInMember,
  onLogout,
  onOpenLoginModal,
}) => {
  return (
    <div id="header-top-bar" className="w-full bg-gradient-to-r from-[#032715] via-[#084527] to-[#032715] border-b border-emerald-700/60 text-white text-xs py-1.5 px-2.5 sm:px-4 md:px-5 font-siliguri overflow-hidden shadow-xs">
      <div className="flex flex-row items-center justify-between gap-2">
        {/* Left: Social Media Icons (Facebook, Instagram, Youtube) */}
        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href="https://www.facebook.com/share/1HP68J9Fzp/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-7 h-7 rounded-full bg-emerald-900/80 hover:bg-[#1877F2] border border-emerald-500/40 hover:border-blue-400 text-amber-300 hover:text-white flex items-center justify-center transition-all shadow-xs hover:scale-110 cursor-pointer"
            title={language === 'bn' ? 'ফেসবুক পেজ / গ্রুপ' : 'Facebook Page / Group'}
            aria-label="Facebook"
          >
            <Facebook className="w-3.5 h-3.5" />
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-7 h-7 rounded-full bg-emerald-900/80 hover:bg-gradient-to-tr hover:from-amber-500 hover:via-rose-500 hover:to-purple-600 border border-emerald-500/40 hover:border-rose-300 text-amber-300 hover:text-white flex items-center justify-center transition-all shadow-xs hover:scale-110 cursor-pointer"
            title={language === 'bn' ? 'ইনস্টাগ্রাম প্রোফাইল' : 'Instagram Profile'}
            aria-label="Instagram"
          >
            <Instagram className="w-3.5 h-3.5" />
          </a>
          <a
            href="https://youtube.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-7 h-7 rounded-full bg-emerald-900/80 hover:bg-[#FF0000] border border-emerald-500/40 hover:border-red-400 text-amber-300 hover:text-white flex items-center justify-center transition-all shadow-xs hover:scale-110 cursor-pointer"
            title={language === 'bn' ? 'ইউটিউব চ্যানেল' : 'YouTube Channel'}
            aria-label="YouTube"
          >
            <Youtube className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Right utility controls: Member Login/Logout button */}
        <div className="flex items-center justify-end gap-1.5 sm:gap-2 shrink-0 ml-auto">
          {/* Member Login / Logout Button */}
          {loggedInMember ? (
            <div className="flex items-center gap-1.5 bg-emerald-900/80 border border-emerald-500/50 text-emerald-100 px-2.5 py-0.5 sm:py-1 rounded text-[11px] sm:text-xs font-siliguri shadow-xs">
              <User className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="font-extrabold text-amber-300 max-w-[100px] sm:max-w-[130px] truncate" title={loggedInMember.applicantNameBn || loggedInMember.applicantNameEn}>
                {loggedInMember.applicantNameBn || loggedInMember.applicantNameEn || 'সদস্য'}
              </span>
              <button
                type="button"
                onClick={onLogout}
                className="ml-1 text-white bg-rose-600 hover:bg-rose-700 px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-extrabold flex items-center gap-1 transition-colors cursor-pointer"
                title={language === 'bn' ? 'লগআউট করুন' : 'Logout'}
              >
                <LogOut className="w-3 h-3" />
                <span>{language === 'bn' ? 'লগআউট' : 'Logout'}</span>
              </button>
            </div>
          ) : (
            <button
              id="header-top-login-btn"
              type="button"
              onClick={onOpenLoginModal}
              className="bg-amber-400 hover:bg-amber-500 text-amber-950 font-black px-2.5 sm:px-3 py-1 rounded-md text-[11px] sm:text-xs flex items-center gap-1.5 transition-all shadow-md hover:shadow-lg cursor-pointer font-siliguri tracking-wide active:scale-95 whitespace-nowrap"
              title={language === 'bn' ? 'অ্যালামনাই লগইন করুন' : 'Alumni Login'}
            >
              <Lock className="w-3.5 h-3.5 text-amber-950 shrink-0" />
              <span>{language === 'bn' ? 'অ্যালামনাই লগইন' : 'Alumni Login'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};


