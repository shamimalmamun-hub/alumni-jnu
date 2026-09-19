import React from 'react';
import { Award, GraduationCap, HeartHandshake, Briefcase } from 'lucide-react';

interface SponsorCardProps {
  language: 'bn' | 'en';
}

const SANJAY_PHOTO_URL = '/sanjay.jpeg';

export const SponsorCard: React.FC<SponsorCardProps> = ({ language }) => {
  return (
    <div id="website-sponsor-card" className="bg-gradient-to-br from-white via-[#fbfdfb] to-[#f4f9f5] border border-[#a6cba9] rounded-xl shadow-xs overflow-hidden flex flex-col font-siliguri transition-all hover:shadow-sm">
      {/* Compact Header Bar */}
      <div className="bg-gradient-to-r from-[#032a18] via-[#094729] to-[#04331d] text-white px-3 py-1.5 sm:py-2 flex items-center justify-between border-b border-amber-400/40">
        <div className="flex items-center font-bold tracking-tight">
          <h2 className="text-xs sm:text-sm font-extrabold text-amber-300 font-serif-bn leading-tight">
            {language === 'bn' ? 'ওয়েবসাইট পৃষ্ঠপোষক' : 'Website Sponsored By'}
          </h2>
        </div>

        <div className="flex items-center gap-1 bg-amber-400/20 border border-amber-400/40 text-amber-200 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold">
          <HeartHandshake className="w-3 h-3 text-amber-300" />
          <span>{language === 'bn' ? 'সৌজন্যে' : 'Sponsored'}</span>
        </div>
      </div>

      {/* Compact Card Content */}
      <div className="p-3 sm:p-3.5 flex flex-col sm:flex-row gap-3 sm:gap-4 items-center sm:items-start text-center sm:text-left">
        {/* Photo Container */}
        <div className="relative shrink-0">
          <div className="w-20 sm:w-24 h-24 sm:h-28 rounded-lg overflow-hidden shadow-sm border border-amber-400/80 bg-gray-100 relative group">
            <img
              src={SANJAY_PHOTO_URL}
              alt={language === 'bn' ? 'সঞ্জয় দাস' : 'Sanjay Das'}
              className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/sanjay.jpeg';
              }}
            />
          </div>
          <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-amber-500 to-amber-600 text-amber-950 p-1 rounded-full shadow-xs border border-white" title="Special Sponsor">
            <Award className="w-3 h-3" />
          </div>
        </div>

        {/* Details & Information */}
        <div className="flex-1 min-w-0 space-y-1.5">
          <div>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5">
              <h3 className="text-sm sm:text-base font-extrabold text-[#063b21] leading-tight">
                {language === 'bn' ? 'সঞ্জয় দাস' : 'Sanjay Das'}
              </h3>
              <span className="bg-amber-100 text-amber-900 border border-amber-300/80 font-bold text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                <GraduationCap className="w-2.5 h-2.5 text-amber-700" />
                <span>{language === 'bn' ? 'সেশন : ২০০৪-২০০৫' : 'Session : 2004-2005'}</span>
              </span>
            </div>
          </div>

          {/* Profession / Job Badge */}
          <div className="py-1 px-2.5 rounded-lg bg-emerald-50/90 border border-emerald-200 text-emerald-950 flex flex-wrap items-center justify-center sm:justify-start gap-1.5 text-[11px] sm:text-xs">
            <span className="font-extrabold text-[#03361e] inline-flex items-center gap-1.5">
              <Briefcase className="w-3 h-3 text-emerald-700 shrink-0" />
              {language === 'bn' ? 'পুলিশ অফিসার, নিউইয়র্ক সিটি, যুক্তরাষ্ট্র' : 'Police Officer, New York City, USA'}
            </span>
          </div>

          {/* Tribute & Note */}
          <p className="text-[10px] sm:text-[11px] text-gray-500 italic leading-snug">
            {language === 'bn'
              ? 'উদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশনের অফিসিয়াল ওয়েব পোর্টাল পৃষ্ঠপোষকতায় আন্তরিক ধন্যবাদ ও শুভকামনা।'
              : 'Special gratitude to Sanjay Das for sponsoring the official web portal of Botany Alumni Association.'}
          </p>
        </div>
      </div>
    </div>
  );
};
