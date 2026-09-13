import React from 'react';
import { Compass, MessageSquare, BookOpen, Award } from 'lucide-react';
import { PAURASHAVA_GENERAL_SECRETARY_BIO } from '../data/portalData';

const STUDY_TOUR_PHOTO = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';

interface PaurashavaGeneralSecretaryCardProps {
  language: 'bn' | 'en';
  onOpenSpeechModal: () => void;
}

export const PaurashavaGeneralSecretaryCard: React.FC<PaurashavaGeneralSecretaryCardProps> = ({
  language,
  onOpenSpeechModal,
}) => {
  return (
    <div id="studytour-coordinator-card" className="bg-white border-2 border-emerald-700/30 rounded-xl shadow-md overflow-hidden flex flex-col font-siliguri h-full transition-all hover:shadow-lg">
      {/* Green Header Bar */}
      <div className="bg-gradient-to-r from-[#064e3b] via-[#047857] to-[#059669] text-white px-2.5 sm:px-3 py-2.5 flex items-center justify-between border-b-2 border-amber-400 min-w-0">
        <div className="flex items-center gap-1.5 font-bold tracking-tight min-w-0 w-full overflow-hidden">
          <Compass className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300 shrink-0" />
          <h2 className="text-[10px] min-[360px]:text-[11px] sm:text-xs md:text-sm font-bold whitespace-nowrap leading-none tracking-normal">
            {language === 'bn' ? 'স্টাডি ট্যুর ও রিসার্চ কো-অর্ডিনেটর' : 'Study Tour & Research Coordinator'}
          </h2>
        </div>
        <span className="hidden min-[420px]:inline-block text-[9px] bg-amber-400/20 text-amber-200 border border-amber-400/40 px-1.5 py-0.5 rounded font-medium shrink-0 ml-1">
          {language === 'bn' ? 'গবেষণা' : 'Research'}
        </span>
      </div>

      {/* Card Content */}
      <div className="p-3.5 flex flex-col space-y-3 bg-gradient-to-b from-[#f0fdf4] via-white to-[#f8fafc] flex-1 justify-between">
        <div className="space-y-3">
          {/* Profile Info (Photo + Details) */}
          <div className="flex gap-3 items-center">
            {/* Photo Frame */}
            <div className="w-22 sm:w-26 h-30 sm:h-34 rounded-xl overflow-hidden shadow-md border-2 border-[#047857] ring-2 ring-amber-400/60 bg-gray-100 shrink-0">
              <img
                src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80"
                alt={language === 'bn' ? PAURASHAVA_GENERAL_SECRETARY_BIO.nameBn : PAURASHAVA_GENERAL_SECRETARY_BIO.nameEn}
                className="w-full h-full object-cover object-top"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = STUDY_TOUR_PHOTO;
                }}
              />
            </div>

            {/* Text details */}
            <div className="flex-1 min-w-0 space-y-1 text-left">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#047857] bg-emerald-100/80 px-2 py-0.5 rounded-full">
                <Award className="w-3 h-3 text-[#047857]" />
                {language === 'bn' ? 'উদ্ভিদবিজ্ঞান বিভাগ' : 'Dept. of Botany'}
              </span>
              <h3 className="text-sm sm:text-base font-bold text-[#0f172a] leading-tight pt-0.5">
                {language === 'bn' ? PAURASHAVA_GENERAL_SECRETARY_BIO.nameBn : PAURASHAVA_GENERAL_SECRETARY_BIO.nameEn}
              </h3>
              <p className="text-xs font-bold text-amber-700">
                {language === 'bn' ? PAURASHAVA_GENERAL_SECRETARY_BIO.titleBn : PAURASHAVA_GENERAL_SECRETARY_BIO.titleEn}
              </p>
              <p className="text-[11px] text-slate-600 font-medium leading-tight">
                {language === 'bn' ? PAURASHAVA_GENERAL_SECRETARY_BIO.ministryBn : PAURASHAVA_GENERAL_SECRETARY_BIO.ministryEn}
              </p>
            </div>
          </div>

          {/* Short quote / message box */}
          <div className="bg-[#ecfdf5] border-l-4 border-[#047857] p-2.5 rounded-r-lg text-left shadow-2xs">
            <p className="text-xs text-[#065f46] font-medium leading-relaxed italic">
              "{language === 'bn' ? PAURASHAVA_GENERAL_SECRETARY_BIO.messageBn : PAURASHAVA_GENERAL_SECRETARY_BIO.messageEn}"
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            id="btn-studytour-coord-speech"
            onClick={onOpenSpeechModal}
            className="bg-[#047857] hover:bg-[#065f46] text-white text-xs font-semibold py-2 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
          >
            <MessageSquare className="w-3.5 h-3.5 text-amber-300" />
            <span>{language === 'bn' ? 'বার্তা ও বিবরণ' : 'Message & Info'}</span>
          </button>

          <button
            id="btn-studytour-coord-bio"
            onClick={onOpenSpeechModal}
            className="bg-white hover:bg-emerald-50 text-[#047857] text-xs font-semibold py-2 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-[#047857] active:scale-95"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#047857]" />
            <span>{language === 'bn' ? 'জীবনবৃত্তান্ত' : 'Biography'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
