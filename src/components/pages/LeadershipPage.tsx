import React, { useState, useEffect } from 'react';
import { ArrowLeft, Layers } from 'lucide-react';
import { FirstConveningCommitteeDocuments } from '../FirstConveningCommitteeDocuments';
import { SecondConveningCommitteeDocuments } from '../SecondConveningCommitteeDocuments';
import { ExecutiveCommitteeDocuments } from '../ExecutiveCommitteeDocuments';

export type CommitteeTab = 'executive' | 'convening_1st' | 'convening_2nd';

interface LeadershipPageProps {
  language: 'bn' | 'en';
  initialTab?: CommitteeTab;
  onBackToHome: () => void;
  onOpenSpeechModal: (person: 'adviser' | 'secretary' | 'general_secretary' | 'treasurer' | 'paurashava_president' | 'paurashava_general_secretary') => void;
}

export const LeadershipPage: React.FC<LeadershipPageProps> = ({ 
  language, 
  initialTab = 'executive', 
  onBackToHome, 
}) => {
  const [activeTab, setActiveTab] = useState<CommitteeTab>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  return (
    <div className="w-full bg-white py-6 px-4 sm:px-8 space-y-6 font-siliguri animate-in fade-in duration-300">
      {/* Top Breadcrumb & Back */}
      <div className="flex flex-wrap items-center justify-between border-b border-emerald-100 pb-4 gap-3">
        <button
          onClick={onBackToHome}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-[#006a4e] rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === 'bn' ? 'হোম পেজে ফিরুন' : 'Back to Home'}</span>
        </button>

        <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#006a4e]">
          <Layers className="w-4 h-4 text-emerald-600" />
          <span>
            {language === 'bn' 
              ? (activeTab === 'executive' 
                  ? '১ম কার্যনির্বাহী কমিটি (২০২৪-২৬)' 
                  : activeTab === 'convening_1st' 
                    ? '১ম আহ্বায়ক কমিটি (২০১৭)' 
                    : '২য় আহ্বায়ক কমিটি (২০২৪)') 
              : (activeTab === 'executive' 
                  ? '1st Executive Committee (2024-26)' 
                  : activeTab === 'convening_1st' 
                    ? '1st Convening Committee (2017)' 
                    : '2nd Convening Committee (2024)')}
          </span>
        </div>
      </div>



      {/* TAB 1: ১ম কার্যনির্বাহী কমিটি (২০২৪-২৬) */}
      {activeTab === 'executive' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <ExecutiveCommitteeDocuments language={language} />
        </div>
      )}

      {/* TAB 2: ১ম আহ্বায়ক কমিটি (২০১৭) */}
      {activeTab === 'convening_1st' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <FirstConveningCommitteeDocuments language={language} />
        </div>
      )}

      {/* TAB 3: ২য় আহ্বায়ক কমিটি (২০২৪) */}
      {activeTab === 'convening_2nd' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <SecondConveningCommitteeDocuments language={language} />
        </div>
      )}
    </div>
  );
};
