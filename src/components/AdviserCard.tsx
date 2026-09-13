import React from 'react';
import { UserCheck, Award, MessageSquare, BookOpen, GraduationCap } from 'lucide-react';
import { ADVISER_BIO } from '../data/portalData';

const PRINCIPAL_PHOTO_URL = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';

interface AdviserCardProps {
  language: 'bn' | 'en';
  onOpenSpeechModal: () => void;
}

export const AdviserCard: React.FC<AdviserCardProps> = ({
  language,
  onOpenSpeechModal,
}) => {
  return (
    <div id="adviser-card" className="bg-white border border-[#b8cbb8] rounded-lg shadow-sm overflow-hidden flex flex-col font-siliguri">
      {/* Green Header Bar */}
      <div className="bg-[#008e48] text-white px-3 sm:px-4 py-2.5 flex items-center justify-between border-b border-[#00743b] min-w-0">
        <div className="flex items-center gap-1.5 sm:gap-2 font-bold tracking-wide min-w-0 w-full overflow-hidden">
          <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300 shrink-0" />
          <h2 className="text-xs sm:text-sm md:text-base whitespace-nowrap truncate leading-tight">
            {language === 'bn' ? 'অধ্যক্ষের বাণী' : "Principal's Message"}
          </h2>
        </div>
      </div>

      {/* Compact Card Content */}
      <div className="p-3.5 flex flex-col space-y-3 bg-[#fbfdfb]">
        {/* Profile Info (Photo + Details) */}
        <div className="flex gap-3.5 items-center">
          {/* Photo Frame */}
          <div className="w-24 sm:w-28 h-32 sm:h-36 rounded-md overflow-hidden shadow-md border-2 border-[#008e48] bg-gray-100 shrink-0">
            <img
              src="https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80"
              alt={language === 'bn' ? ADVISER_BIO.nameBn : ADVISER_BIO.nameEn}
              className="w-full h-full object-cover object-top"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = PRINCIPAL_PHOTO_URL;
              }}
            />
          </div>

          {/* Text details */}
          <div className="flex-1 min-w-0 space-y-1 text-left">
            <h3 className="text-base sm:text-lg font-bold text-[#004d38] leading-tight">
              {language === 'bn' ? ADVISER_BIO.nameBn : ADVISER_BIO.nameEn}
            </h3>
            <p className="text-xs font-bold text-amber-700">
              {language === 'bn' ? ADVISER_BIO.titleBn : ADVISER_BIO.titleEn}
            </p>
            <p className="text-[11px] text-gray-600 font-medium leading-tight">
              {language === 'bn' ? ADVISER_BIO.ministryBn : ADVISER_BIO.ministryEn}
            </p>
          </div>
        </div>

        {/* Short quote / message box */}
        <div className="bg-[#eef6f1] border-l-3 border-[#008e48] p-2.5 rounded text-left">
          <p className="text-xs text-[#0f5132] font-medium leading-relaxed italic">
            "{language === 'bn' ? ADVISER_BIO.messageBn : ADVISER_BIO.messageEn}"
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-0.5">
          <button
            id="btn-adviser-speech"
            onClick={onOpenSpeechModal}
            className="bg-[#008e48] hover:bg-[#006a4e] text-white text-xs font-semibold py-2 px-2.5 rounded transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'সম্পূর্ণ বাণী' : 'Full Message'}</span>
          </button>

          <button
            id="btn-adviser-bio"
            onClick={onOpenSpeechModal}
            className="bg-white hover:bg-emerald-50 text-[#006a4e] text-xs font-semibold py-2 px-2.5 rounded transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-[#008e48] active:scale-95"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#008e48]" />
            <span>{language === 'bn' ? 'জীবনবৃত্তান্ত' : 'Biography'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
