import React, { useState } from 'react';
import { Search, Globe, ExternalLink, Sprout } from 'lucide-react';

interface HeaderTopProps {
  language: 'bn' | 'en';
  onLanguageToggle: () => void;
  onSearch: (query: string) => void;
}

export const HeaderTop: React.FC<HeaderTopProps> = ({
  language,
  onLanguageToggle,
  onSearch,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };

  return (
    <div id="header-top-bar" className="w-full bg-[#f0f7f2] border-b border-[#c2d6c6] text-[#222222] text-xs py-1.5 px-2.5 sm:px-4 md:px-5 font-siliguri overflow-hidden">
      <div className="flex flex-col md:flex-row items-center justify-between gap-1.5 sm:gap-2">
        {/* Left slogan text */}
        <div className="flex items-center gap-1.5 font-extrabold text-[#115e3b] text-[11px] sm:text-xs md:text-sm tracking-wide text-center md:text-left">
          <Sprout className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#16a34a] shrink-0 animate-pulse" />
          <span className="line-clamp-1 sm:line-clamp-none">
            {language === 'bn'
              ? 'উদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশন । জগন্নাথ বিশ্ববিদ্যালয়'
              : 'Botany Alumni Association | Jagannath University'}
          </span>
        </div>

        {/* Right utility controls: Official University Website Link, Search bar, English/Bangla toggle */}
        <div className="flex flex-wrap items-center justify-center md:justify-end gap-1.5 sm:gap-2 w-full md:w-auto">
          {/* Official University Website Link */}
          <a
            id="official-college-website-link"
            href="https://jnu.ac.bd/"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#008e48] hover:bg-[#006a4e] text-white px-2 py-0.5 sm:px-2.5 sm:py-1 rounded text-[11px] sm:text-xs font-semibold flex items-center gap-1 sm:gap-1.5 shadow-xs transition-colors"
          >
            <ExternalLink className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>{language === 'bn' ? 'অফিসিয়াল বিশ্ববিদ্যালয় ওয়েবসাইট' : 'Official University Portal'}</span>
          </a>

          {/* Search box */}
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <input
              id="header-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'bn' ? 'এখানে খুঁজুন...' : 'Search here...'}
              className="bg-white border border-[#b8cbb8] text-[#222] pl-2.5 pr-7 py-0.5 sm:py-1 rounded text-[11px] sm:text-xs focus:outline-none focus:border-[#006a4e] w-28 sm:w-40 transition-all"
            />
            <button
              id="header-search-submit"
              type="submit"
              aria-label="Search"
              className="absolute right-1 text-[#666] hover:text-[#006a4e] p-0.5 sm:p-1"
            >
              <Search className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>
          </form>

          {/* Language Toggle Button */}
          <button
            id="lang-toggle-btn"
            onClick={onLanguageToggle}
            className="bg-[#006a4e] hover:bg-[#00523d] text-white px-2 py-0.5 sm:px-2.5 sm:py-1 rounded text-[11px] sm:text-xs font-medium flex items-center gap-1 sm:gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Globe className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>{language === 'bn' ? 'English' : 'বাংলা'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

