import React from 'react';
import { MessageSquare, BookOpen, Leaf, Users, Mail, GraduationCap } from 'lucide-react';
import { GENERAL_SECRETARY_BIO } from '../data/portalData';

const GS_PHOTO_URL = 'https://mssalumni.org/wp-content/uploads/2026/09/WhatsApp-Image-2026-09-08-at-4.56.31-PM.jpeg';

interface GeneralSecretaryCardProps {
  language: 'bn' | 'en';
  onOpenSpeechModal: (person?: string) => void;
}

export const GeneralSecretaryCard: React.FC<GeneralSecretaryCardProps> = ({
  language,
  onOpenSpeechModal,
}) => {
  return (
    <div id="general-secretary-card" className="bg-white border border-[#b2cfb8] rounded-xl shadow-md overflow-hidden flex flex-col font-siliguri">
      {/* Botanical Header Bar */}
      <div className="bg-gradient-to-r from-[#07361f] via-[#15803d] to-[#0a4729] text-white px-3 sm:px-4 py-2.5 flex items-center justify-between border-b border-emerald-500/30 min-w-0">
        <div className="flex items-center gap-2 font-bold tracking-tight min-w-0 w-full overflow-hidden">
          <div className="p-1 rounded bg-white/10 text-amber-300 shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <h2 className="text-xs sm:text-sm md:text-base font-bold whitespace-nowrap leading-tight">
            {language === 'bn' ? 'অ্যালামনাই সাধারণ সম্পাদক' : 'Alumni General Secretary'}
          </h2>
        </div>
      </div>

      {/* Compact Card Content */}
      <div className="p-3.5 flex flex-col space-y-3 bg-[#fbfdfb]">
        {/* Profile Info (Photo + Details) */}
        <div className="flex gap-3.5 items-start">
          {/* Photo Frame */}
          <div className="w-24 sm:w-28 h-32 sm:h-36 rounded-lg overflow-hidden shadow-md border-2 border-[#15803d] bg-gray-100 shrink-0 relative group">
            <img
              src={GS_PHOTO_URL}
              alt={language === 'bn' ? GENERAL_SECRETARY_BIO.nameBn : GENERAL_SECRETARY_BIO.nameEn}
              className="w-full h-full object-cover object-top"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80';
              }}
            />
          </div>

          {/* Text details */}
          <div className="flex-1 min-w-0 space-y-1 text-left">
            <h3 className="text-base sm:text-lg font-bold text-[#093f24] leading-tight">
              {language === 'bn' ? GENERAL_SECRETARY_BIO.nameBn : GENERAL_SECRETARY_BIO.nameEn}
            </h3>
            <p className="text-xs font-bold text-emerald-700 flex items-center gap-1">
              <Leaf className="w-3 h-3 text-emerald-600 shrink-0" />
              <span>{language === 'bn' ? GENERAL_SECRETARY_BIO.titleBn : GENERAL_SECRETARY_BIO.titleEn}</span>
            </p>
            <p className="text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200/60 rounded px-1.5 py-0.5 inline-flex items-center gap-1">
              <GraduationCap className="w-3 h-3 text-amber-700 shrink-0" />
              <span>
                {language === 'bn'
                  ? `${GENERAL_SECRETARY_BIO.batchBn} (সেশন: ${GENERAL_SECRETARY_BIO.sessionBn})`
                  : `${GENERAL_SECRETARY_BIO.batchEn} (Session: ${GENERAL_SECRETARY_BIO.sessionEn})`}
              </span>
            </p>
            <p className="text-[11px] text-gray-600 font-medium leading-tight">
              {language === 'bn' ? GENERAL_SECRETARY_BIO.ministryBn : GENERAL_SECRETARY_BIO.ministryEn}
            </p>

            {/* Direct Contact details */}
            <div className="pt-1 flex flex-col gap-0.5 text-[11px] text-gray-700">
              <a
                href={`mailto:${GENERAL_SECRETARY_BIO.email}`}
                className="flex items-center gap-1.5 hover:text-emerald-700 transition-colors truncate"
              >
                <Mail className="w-3 h-3 text-emerald-600 shrink-0" />
                <span className="truncate">{GENERAL_SECRETARY_BIO.email}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Short quote / message box */}
        <div className="bg-[#eef8f1] border-l-3 border-[#15803d] p-2.5 rounded-md text-left">
          <p className="text-xs text-[#0a4729] font-medium leading-relaxed italic">
            "{language === 'bn' ? GENERAL_SECRETARY_BIO.messageBn : GENERAL_SECRETARY_BIO.messageEn}"
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-0.5">
          <button
            id="btn-general-secretary-speech"
            onClick={() => onOpenSpeechModal('general_secretary')}
            className="bg-[#15803d] hover:bg-[#0f5f2c] text-white text-xs font-semibold py-2 px-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'বার্তা ও বিবরণ' : 'Message & Info'}</span>
          </button>

          <button
            id="btn-general-secretary-bio"
            onClick={() => onOpenSpeechModal('general_secretary')}
            className="bg-white hover:bg-emerald-50 text-[#15803d] text-xs font-semibold py-2 px-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-[#15803d] active:scale-95"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#15803d]" />
            <span>{language === 'bn' ? 'জীবনবৃত্তান্ত' : 'Biography'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
