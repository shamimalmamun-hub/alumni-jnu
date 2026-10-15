import React, { useEffect, useState } from 'react';
import { Users, UserCheck, Shield, HeartHandshake } from 'lucide-react';
import { getDocument, watch } from '../lib/db';

export interface CommunityStatsData {
  titleBn?: string;
  titleEn?: string;
  subBn?: string;
  subEn?: string;
  mode?: 'manual';
  totalMembers?: number | string;
  lifeMembers?: number | string;
  committeeMembers?: number | string;
  donorMembers?: number | string;
  trusteeMembers?: number | string;
  suffix?: string;
}

interface CommunityStatsWidgetProps {
  language: 'bn' | 'en';
  onNavigateToMembers?: () => void;
  onNavigateToLeadership?: () => void;
  onNavigateToDonation?: () => void;
}


export const DEFAULT_MANUAL_STATS: CommunityStatsData = {
  mode: 'manual',
  totalMembers: 1240,
  lifeMembers: 793,
  committeeMembers: 35,
  donorMembers: 29,
  suffix: '+',
  titleBn: 'আমাদের অ্যালামনাই পরিবার',
  titleEn: 'Our Growing Community',
  subBn: 'জগন্নাথ বিশ্ববিদ্যালয় উদ্ভিদবিজ্ঞান বিভাগের সকল ব্যাচের প্রাক্তন ও বর্তমান সদস্যদের সম্মিলিত শক্তি',
  subEn: 'Uniting generations of Botany Alumni from Jagannath University, Dhaka',
};

export const CommunityStatsWidget: React.FC<CommunityStatsWidgetProps> = ({
  language,
  onNavigateToMembers,
  onNavigateToLeadership,
  onNavigateToDonation,
}) => {
  // Admin-managed numbers from D1 `site_settings/community_stats`
  const [adminStats, setAdminStats] = useState<CommunityStatsData>(DEFAULT_MANUAL_STATS);

  useEffect(() => {
    return watch('site_settings', async () => {
      const data = await getDocument<CommunityStatsData>('site_settings', 'community_stats');
      if (data) {
        setAdminStats({ ...DEFAULT_MANUAL_STATS, ...data, mode: 'manual' as const });
      }
    });
  }, []);

  const toBnNumber = (val: number | string) => {
    if (val === undefined || val === null) return '';
    const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return val
      .toString()
      .split('')
      .map((d) => bnDigits[parseInt(d, 10)] ?? d)
      .join('');
  };

  // Strictly manual numbers
  const totalMembersVal =
    adminStats.totalMembers !== undefined && adminStats.totalMembers !== ''
      ? adminStats.totalMembers
      : DEFAULT_MANUAL_STATS.totalMembers;

  const lifeMembersVal =
    adminStats.lifeMembers !== undefined && adminStats.lifeMembers !== ''
      ? adminStats.lifeMembers
      : DEFAULT_MANUAL_STATS.lifeMembers;

  const committeeMembersVal =
    adminStats.committeeMembers !== undefined && adminStats.committeeMembers !== ''
      ? adminStats.committeeMembers
      : DEFAULT_MANUAL_STATS.committeeMembers;

  const donorMembersVal =
    adminStats.donorMembers !== undefined && adminStats.donorMembers !== ''
      ? adminStats.donorMembers
      : DEFAULT_MANUAL_STATS.donorMembers;

  const suffix = adminStats.suffix !== undefined ? adminStats.suffix : '+';

  const sectionTitleBn = adminStats.titleBn || DEFAULT_MANUAL_STATS.titleBn!;
  const sectionTitleEn = adminStats.titleEn || DEFAULT_MANUAL_STATS.titleEn!;
  const sectionSubBn = adminStats.subBn || DEFAULT_MANUAL_STATS.subBn!;
  const sectionSubEn = adminStats.subEn || DEFAULT_MANUAL_STATS.subEn!;

  const statCards = [
    {
      id: 'total-members',
      icon: Users,
      iconBg: 'bg-[#d2f4df] text-[#1b6b47]',
      value: totalMembersVal,
      titleBn: 'মোট সদস্য',
      titleEn: 'Total Members',
      subBn: 'সাধারণ ও নিবন্ধিত অ্যালামনাই',
      subEn: 'General & Registered Alumni',
      cardBg: 'bg-[#eefbf2] border-[#bfe8cc] hover:border-[#8fd9a7]',
      onClick: onNavigateToMembers,
    },
    {
      id: 'life-members',
      icon: UserCheck,
      iconBg: 'bg-[#d2f4df] text-[#1b6b47]',
      value: lifeMembersVal,
      titleBn: 'মোট আজীবন সদস্য',
      titleEn: 'Life Member',
      subBn: 'আজীবন স্থায়ী সদস্যবৃন্দ',
      subEn: 'Permanent Life Members',
      cardBg: 'bg-[#eefbf2] border-[#bfe8cc] hover:border-[#8fd9a7]',
      onClick: onNavigateToMembers,
    },
    {
      id: 'committee-members',
      icon: Shield,
      iconBg: 'bg-[#daf1e2] text-[#1b6b47]',
      value: committeeMembersVal,
      titleBn: 'কমিটি সদস্য',
      titleEn: 'Executive Committee',
      subBn: 'কার্যনির্বাহী ও উপদেষ্টা পরিষদ',
      subEn: 'Executive & Advisory Body',
      cardBg: 'bg-[#eefbf2] border-[#bfe8cc] hover:border-[#8fd9a7]',
      onClick: onNavigateToLeadership,
    },
    {
      id: 'donor-members',
      icon: HeartHandshake,
      iconBg: 'bg-[#d6f4e1] text-[#166534]',
      value: donorMembersVal,
      titleBn: 'দাতা ও ট্রাস্টি সদস্য',
      titleEn: 'Donor & Trustee Member',
      subBn: 'বিশেষ অনুদান ও তহবিল পৃষ্ঠপোষক',
      subEn: 'Special Donors & Patrons',
      cardBg: 'bg-[#eefbf2] border-[#bfe8cc] hover:border-[#8fd9a7]',
      onClick: onNavigateToDonation,
    },
  ];

  return (
    <div
      id="growing-community-stats-section"
      className="mt-6 rounded-2xl bg-[#eaf8ee] border border-[#bfe8cc] p-5 sm:p-6 lg:p-7 shadow-xs font-siliguri"
    >
      {/* Clean Header matching user specifications */}
      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0c3121] tracking-tight">
          {language === 'bn' ? sectionTitleBn : sectionTitleEn}
        </h2>
        {Boolean(language === 'bn' ? sectionSubBn : sectionSubEn) && (
          <p className="text-xs sm:text-sm text-[#185338] font-medium mt-1.5">
            {language === 'bn' ? sectionSubBn : sectionSubEn}
          </p>
        )}
      </div>

      {/* 4 Clean Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          const numDisplay =
            language === 'bn'
              ? `${toBnNumber(card.value)}${suffix}`
              : `${card.value}${suffix}`;

          return (
            <div
              key={card.id}
              id={`stat-card-${card.id}`}
              onClick={card.onClick}
              className={`rounded-2xl border-2 p-5 sm:p-6 text-center transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md hover:-translate-y-0.5 flex flex-col items-center justify-between ${card.cardBg}`}
            >
              {/* Circular Icon Container */}
              <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 shadow-2xs border border-emerald-200/70 ${card.iconBg}`}>
                <Icon className="w-7 h-7 stroke-[2.2]" />
              </div>

              {/* Bold Stats Number */}
              <div className="font-mono text-2xl sm:text-3xl font-black text-[#134e2c] tracking-tight my-1">
                {numDisplay}
              </div>

              {/* Category Label */}
              <div className="mt-1">
                <h3 className="font-extrabold text-sm sm:text-base text-[#0f3d23] leading-snug">
                  {language === 'bn' ? card.titleBn : card.titleEn}
                </h3>
                <p className="text-[11px] sm:text-xs text-emerald-800/80 font-semibold mt-0.5">
                  {language === 'bn' ? card.subBn : card.subEn}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
