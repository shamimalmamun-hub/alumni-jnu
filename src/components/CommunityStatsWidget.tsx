import React, { useEffect, useState } from 'react';
import { Users, UserCheck, Shield, HeartHandshake } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, doc, onSnapshot } from 'firebase/firestore';
import { EXECUTIVE_COMMITTEE_LIST } from '../data/portalData';

export interface CommunityStatsData {
  titleBn?: string;
  titleEn?: string;
  subBn?: string;
  subEn?: string;
  mode?: 'manual' | 'auto';
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

export const CommunityStatsWidget: React.FC<CommunityStatsWidgetProps> = ({
  language,
  onNavigateToMembers,
  onNavigateToLeadership,
  onNavigateToDonation,
}) => {
  // Admin custom settings state
  const [adminStats, setAdminStats] = useState<CommunityStatsData | null>(null);

  // Auto-calculated state fallback
  const [autoGeneralMembers, setAutoGeneralMembers] = useState<number>(1240);
  const [autoLifeMembers, setAutoLifeMembers] = useState<number>(793);
  const [autoDonorMembers, setAutoDonorMembers] = useState<number>(29);
  const [autoCommitteeMembers] = useState<number>(
    EXECUTIVE_COMMITTEE_LIST.length > 0 ? EXECUTIVE_COMMITTEE_LIST.length : 35
  );

  useEffect(() => {
    let unsubscribeAdmin = () => {};
    let unsubscribeMembers = () => {};
    let unsubscribePayments = () => {};

    try {
      // 1. Listen to admin custom settings from Firestore
      const settingsDocRef = doc(db, 'site_settings', 'community_stats');
      unsubscribeAdmin = onSnapshot(
        settingsDocRef,
        (docSnap) => {
          if (docSnap.exists()) {
            setAdminStats(docSnap.data() as CommunityStatsData);
          } else {
            setAdminStats(null);
          }
        },
        (err) => {
          console.warn('Community stats settings listener:', err);
        }
      );

      // 2. Auto listener for registered memberships
      const memRef = collection(db, 'memberships');
      unsubscribeMembers = onSnapshot(
        memRef,
        (snapshot) => {
          if (!snapshot.empty) {
            let liveLifeCount = 0;
            let liveApprovedTotal = 0;

            snapshot.forEach((d) => {
              const data = d.data() as any;
              const isApproved = data.status === 'approved' || !data.status;
              if (isApproved) {
                liveApprovedTotal++;
                const isLife =
                  data.membershipType === 'life' ||
                  data.feeType === 'life' ||
                  data.category === 'life' ||
                  (typeof data.amount === 'number' && data.amount >= 2000);
                if (isLife) {
                  liveLifeCount++;
                }
              }
            });

            setAutoGeneralMembers(1200 + liveApprovedTotal);
            setAutoLifeMembers(790 + liveLifeCount);
          }
        },
        (err) => {
          console.warn('Auto memberships listener:', err);
        }
      );

      // 3. Auto listener for payments / donations
      const payRef = collection(db, 'payments');
      unsubscribePayments = onSnapshot(
        payRef,
        (snapshot) => {
          if (!snapshot.empty) {
            const donorPhoneSet = new Set<string>();
            snapshot.forEach((d) => {
              const data = d.data() as any;
              const type = (data.feeType || data.purpose || '').toLowerCase();
              if (
                type.startsWith('donation') ||
                type === 'donor' ||
                type.includes('reunion') ||
                type.includes('iftar') ||
                type.includes('zakat')
              ) {
                donorPhoneSet.add(data.mobile || data.phone || data.payerName || d.id);
              }
            });
            setAutoDonorMembers(28 + Math.max(1, donorPhoneSet.size));
          }
        },
        (err) => {
          console.warn('Auto payments listener:', err);
        }
      );
    } catch (e) {
      console.warn('Error setting up stats listeners:', e);
    }

    return () => {
      unsubscribeAdmin();
      unsubscribeMembers();
      unsubscribePayments();
    };
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

  const isManual = adminStats?.mode === 'manual' || adminStats?.mode === undefined && adminStats !== null;

  const totalMembersVal = isManual && adminStats?.totalMembers !== undefined && adminStats?.totalMembers !== ''
    ? adminStats.totalMembers
    : autoGeneralMembers;

  const lifeMembersVal = isManual && adminStats?.lifeMembers !== undefined && adminStats?.lifeMembers !== ''
    ? adminStats.lifeMembers
    : autoLifeMembers;

  const committeeMembersVal = isManual && adminStats?.committeeMembers !== undefined && adminStats?.committeeMembers !== ''
    ? adminStats.committeeMembers
    : autoCommitteeMembers;

  const donorMembersVal = isManual && adminStats?.donorMembers !== undefined && adminStats?.donorMembers !== ''
    ? adminStats.donorMembers
    : autoDonorMembers;

  const suffix = adminStats?.suffix !== undefined ? adminStats.suffix : '+';

  const sectionTitleBn = adminStats?.titleBn || 'আমাদের অ্যালামনাই পরিবার';
  const sectionTitleEn = adminStats?.titleEn || 'Our Growing Community';
  const sectionSubBn = adminStats?.subBn || 'জগন্নাথ বিশ্ববিদ্যালয় উদ্ভিদবিজ্ঞান বিভাগের সকল ব্যাচের প্রাক্তন ও বর্তমান সদস্যদের সম্মিলিত শক্তি';
  const sectionSubEn = adminStats?.subEn || 'Uniting generations of Botany Alumni from Jagannath University, Dhaka';

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
      {/* Clean Header matching the user screenshot */}
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
