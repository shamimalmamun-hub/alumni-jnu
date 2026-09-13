import React from 'react';
import { X, BookOpen, MessageSquare, Award } from 'lucide-react';
import { ADVISER_BIO, SECRETARY_BIO, GENERAL_SECRETARY_BIO, TREASURER_BIO, PAURASHAVA_PRESIDENT_BIO, PAURASHAVA_GENERAL_SECRETARY_BIO } from '../data/portalData';

interface SpeechModalProps {
  isOpen: boolean;
  language: 'bn' | 'en';
  personType?: 'adviser' | 'secretary' | 'general_secretary' | 'treasurer' | 'paurashava_president' | 'paurashava_general_secretary';
  onClose: () => void;
}

export const SpeechModal: React.FC<SpeechModalProps> = ({
  isOpen,
  language,
  personType = 'adviser',
  onClose,
}) => {
  if (!isOpen) return null;

  const bioData =
    personType === 'paurashava_president'
      ? PAURASHAVA_PRESIDENT_BIO
      : personType === 'paurashava_general_secretary'
      ? PAURASHAVA_GENERAL_SECRETARY_BIO
      : personType === 'treasurer'
      ? TREASURER_BIO
      : personType === 'general_secretary'
      ? GENERAL_SECRETARY_BIO
      : personType === 'secretary'
      ? SECRETARY_BIO
      : ADVISER_BIO;

  const photoUrl =
    personType === 'paurashava_president'
      ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80'
      : personType === 'paurashava_general_secretary'
      ? 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80'
      : personType === 'treasurer'
      ? 'https://mssalumni.org/wp-content/uploads/2026/09/WhatsApp-Image-2026-09-08-at-4.55.13-PM.jpeg'
      : personType === 'general_secretary'
      ? 'https://mssalumni.org/wp-content/uploads/2026/09/WhatsApp-Image-2026-09-08-at-4.56.31-PM.jpeg'
      : personType === 'secretary'
      ? 'https://mssalumni.org/wp-content/uploads/2026/09/WhatsApp-Image-2026-09-08-at-4.52.45-PM.jpeg'
      : 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200 font-siliguri">
      <div className="bg-white rounded-lg shadow-2xl border border-gray-200 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-[#008e48] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-base md:text-lg">
            <BookOpen className="w-5 h-5 text-amber-300" />
            <span>
              {language === 'bn'
                ? `${bioData.titleBn} এর প্রোফাইল ও বার্তা`
                : `${bioData.titleEn} Profile & Message`}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 bg-[#fdfdfd]">
          {/* Header Profile Box */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 bg-[#0a261c] text-white rounded-lg border border-emerald-800">
            <div className="w-24 h-32 rounded overflow-hidden border border-amber-400 shrink-0 bg-emerald-950">
              <img
                src={photoUrl}
                alt={bioData.nameEn}
                className="w-full h-full object-cover object-top"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = photoUrl;
                }}
              />
            </div>
            <div className="text-center sm:text-left space-y-1">
              <h3 className="text-xl font-bold font-siliguri text-white">
                {language === 'bn' ? bioData.nameBn : bioData.nameEn}
              </h3>
              <p className="text-xs text-amber-300 font-semibold">
                {language === 'bn' ? bioData.titleBn : bioData.titleEn}
              </p>
              <p className="text-xs text-emerald-200">
                {language === 'bn' ? bioData.ministryBn : bioData.ministryEn}
              </p>
              {('batchBn' in bioData) && (
                <div className="pt-1.5 flex flex-wrap gap-2 text-xs">
                  <span className="bg-amber-400/20 text-amber-200 border border-amber-400/30 px-2 py-0.5 rounded">
                    {language === 'bn'
                      ? `${(bioData as any).batchBn} (সেশন: ${(bioData as any).sessionBn})`
                      : `${(bioData as any).batchEn} (Session: ${(bioData as any).sessionEn})`}
                  </span>
                  {(bioData as any).phone && (
                    <a
                      href={`tel:${(bioData as any).phone.replace(/[^0-9]/g, '')}`}
                      className="bg-emerald-500/20 text-emerald-200 border border-emerald-500/30 px-2 py-0.5 rounded hover:bg-emerald-500/40 transition-colors"
                    >
                      📞 {(bioData as any).phone}
                    </a>
                  )}
                  {(bioData as any).email && (
                    <a
                      href={`mailto:${(bioData as any).email}`}
                      className="bg-emerald-500/20 text-emerald-200 border border-emerald-500/30 px-2 py-0.5 rounded hover:bg-emerald-500/40 transition-colors"
                    >
                      ✉️ {(bioData as any).email}
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Biography */}
          <div className="space-y-2">
            <h4 className="font-bold text-sm text-[#006a4e] flex items-center gap-1.5 border-b border-gray-200 pb-1">
              <Award className="w-4 h-4 text-amber-600" />
              <span>{language === 'bn' ? 'সংক্ষিপ্ত পরিচিতি ও অবদান' : 'Profile & Background'}</span>
            </h4>
            <p className="text-xs md:text-sm text-gray-700 leading-relaxed font-siliguri">
              {language === 'bn' ? bioData.bioBn : bioData.bioEn}
            </p>
          </div>

          {/* Full Message */}
          <div className="space-y-2">
            <h4 className="font-bold text-sm text-[#006a4e] flex items-center gap-1.5 border-b border-gray-200 pb-1">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>{language === 'bn' ? 'অফিসিয়াল বাণী ও দিকনির্দেশনা' : 'Official Message & Guidance'}</span>
            </h4>
            <div className="p-4 bg-[#f0fdf4] border-l-4 border-[#008e48] rounded text-xs md:text-sm text-gray-800 leading-relaxed italic font-siliguri">
              "{language === 'bn' ? bioData.messageBn : bioData.messageEn}"
            </div>
          </div>
        </div>

        {/* Footer Close */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#008e48] hover:bg-[#006a4e] text-white text-xs font-semibold rounded-md transition-colors cursor-pointer"
          >
            {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
