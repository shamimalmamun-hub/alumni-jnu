import React, { useState } from 'react';
import { 
  Download, 
  Printer, 
  ZoomIn, 
  X, 
  FileImage,
  Award,
  Phone,
  Mail,
  GraduationCap,
  Calendar,
  User,
  ShieldCheck,
  Building2,
  Copy,
  Check,
  Sparkles,
  MapPin,
  Droplet,
  Users,
  Layers,
  Briefcase,
  RotateCcw
} from 'lucide-react';
import { EXECUTIVE_COMMITTEE_LIST, CommitteeMember } from '../data/portalData';

interface DocumentImageItem {
  id: number;
  pageNumber: number;
  titleBn: string;
  titleEn: string;
  imageSrc: string;
  downloadFileName: string;
}

const EXECUTIVE_COMMITTEE_DOCUMENTS: DocumentImageItem[] = [
  {
    id: 1,
    pageNumber: 1,
    titleBn: 'কার্যনির্বাহী কমিটি নথি - মূল কপি (পাতা ১)',
    titleEn: 'Executive Committee Document - Original Scan (Page 1)',
    imageSrc: '/new_c.jpeg',
    downloadFileName: 'Executive_Committee_Official_Document_Page_1.jpg'
  },
  {
    id: 2,
    pageNumber: 2,
    titleBn: 'কার্যনির্বাহী কমিটি নথি - মূল কপি (পাতা ২)',
    titleEn: 'Executive Committee Document - Original Scan (Page 2)',
    imageSrc: '/new_c1.jpeg',
    downloadFileName: 'Executive_Committee_Official_Document_Page_2.jpg'
  }
];

interface ExecutiveCommitteeDocumentsProps {
  language: 'bn' | 'en';
}

export const ExecutiveCommitteeDocuments: React.FC<ExecutiveCommitteeDocumentsProps> = ({ language }) => {
  const [selectedImage, setSelectedImage] = useState<DocumentImageItem | null>(null);
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [selectedDesignation, setSelectedDesignation] = useState<string | null>(null);

  const handleCopy = (text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleDownload = (item: DocumentImageItem) => {
    const link = document.createElement('a');
    link.href = item.imageSrc;
    link.download = item.downloadFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintImage = (item: DocumentImageItem) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${item.titleBn}</title>
            <style>
              body { margin: 0; padding: 20px; display: flex; justify-content: center; align-items: center; background: #fff; }
              img { max-width: 100%; height: auto; box-shadow: none; }
              @media print {
                body { padding: 0; }
                img { width: 100%; }
              }
            </style>
          </head>
          <body>
            <img src="${item.imageSrc}" alt="${item.titleBn}" onload="window.print();window.close();" />
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  // Helper for role badge colors - all roles now use the requested amber theme
  const getRoleBadgeStyle = (_roleType?: string) => {
    return 'bg-amber-100 text-amber-950 border border-amber-400 font-bold';
  };

  // Helper to get first meaningful letter of a name
  const getInitialLetter = (name: string): string => {
    if (!name) return 'অ';
    const clean = name
      .replace(/^(মোঃ|মো:|মুঃ|মু:|ডাঃ|ডা:|ড\.|Dr\.|Md\.|MD\.|Md|MD|Mr\.|Mr|Mrs\.|Mrs|Engr\.|Engr)\s*/i, '')
      .trim();
    const target = clean || name;
    return target.charAt(0).toUpperCase();
  };

  // Helper for Bengali numbers
  const toBengaliNumber = (num: number): string => {
    const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return num.toString().split('').map((d) => bnDigits[parseInt(d, 10)] || d).join('');
  };

  // Dynamic designation counts
  const designationStats = React.useMemo(() => {
    const orderMap: Record<string, number> = {
      'সভাপতি': 1,
      'সহ-সভাপতি': 2,
      'সহ সভাপতি': 2,
      'সাধারণ সম্পাদক': 3,
      'যুগ্ম সাধারণ সম্পাদক': 4,
      'কোষাধ্যক্ষ': 5,
      'সহ-কোষাধ্যক্ষ': 6,
      'সহকারী-কোষাধ্যক্ষ': 6,
      'সাংগঠনিক সম্পাদক': 7,
      'সহ-সাংগঠনিক সম্পাদক': 8,
      'দপ্তর সম্পাদক': 9,
      'আন্তর্জাতিক সম্পাদক': 10,
      'প্রচার, প্রকাশনা ও জনসংযোগ সম্পাদক': 11,
      'প্রচার সম্পাদক': 11,
      'শিক্ষা ও সমাজকল্যাণ সম্পাদক': 12,
      'তথ্যপ্রযুক্তি সম্পাদক': 13,
      'তথ্য ও প্রযুক্তি সম্পাদক': 13,
      'ক্রীড়া ও সাংস্কৃতিক সম্পাদক': 14,
      'ক্রীড়া সম্পাদক': 14,
      'কার্যনির্বাহী সদস্য': 15,
      'সদস্য': 15,
    };

    const countMap: Record<string, { count: number; titleBn: string; titleEn: string; roleType?: string }> = {};

    EXECUTIVE_COMMITTEE_LIST.forEach((m) => {
      const key = m.designationBn;
      if (!countMap[key]) {
        countMap[key] = {
          count: 0,
          titleBn: m.designationBn,
          titleEn: m.designationEn,
          roleType: m.roleType,
        };
      }
      countMap[key].count += 1;
    });

    return Object.values(countMap).sort((a, b) => {
      const orderA = orderMap[a.titleBn] || 99;
      const orderB = orderMap[b.titleBn] || 99;
      return orderA - orderB;
    });
  }, []);

  const totalMembersCount = EXECUTIVE_COMMITTEE_LIST.length;

  const filteredMembers = selectedDesignation
    ? EXECUTIVE_COMMITTEE_LIST.filter((m) => m.designationBn === selectedDesignation)
    : EXECUTIVE_COMMITTEE_LIST;

  return (
    <div className="space-y-8 font-siliguri">
      {/* 1. COMMITTEE STATS & OVERVIEW */}
      <div className="bg-gradient-to-br from-emerald-50/80 via-white to-amber-50/40 border-2 border-emerald-200 rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-xs">
        {/* Main Banner Heading & Total Members Card */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5 sm:gap-4">
          <div className="space-y-1 sm:space-y-1.5">
            <div className="inline-flex items-center px-2.5 sm:px-3.5 py-0.5 sm:py-1 bg-[#006a4e] text-amber-300 rounded-full text-[11px] sm:text-xs font-bold shadow-2xs">
              <span>{language === 'bn' ? '১ম কার্যনির্বাহী পরিষদ (২০২৪–২০২৬)' : '1st Executive Committee (2024–2026)'}</span>
            </div>
            <h2 className="text-base sm:text-xl md:text-2xl font-black text-[#006a4e] tracking-tight font-serif-bn leading-snug">
              {language === 'bn' ? 'কমিটি সদস্য সংখ্যা ও পদভিত্তিক বিবরণ' : 'Committee Member Count & Designation Breakdown'}
            </h2>
            <p className="text-[11px] sm:text-xs md:text-sm text-gray-600 font-medium leading-relaxed">
              {language === 'bn' 
                ? 'উদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশন, জগন্নাথ বিশ্ববিদ্যালয়-এর পূর্ণাঙ্গ কমিটির বিবরণ' 
                : 'Botany Alumni Association, Jagannath University — Official Executive Committee'}
            </p>
          </div>

          {/* Big Total Members Badge */}
          <div className="flex items-center gap-3 sm:gap-3.5 bg-gradient-to-r from-[#006a4e] to-[#044c39] text-white px-3.5 py-2.5 sm:px-5 sm:py-3.5 rounded-xl sm:rounded-2xl shadow-md border-2 border-amber-400 shrink-0 self-start md:self-auto">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-amber-400/20 border border-amber-300/40 flex items-center justify-center text-amber-300 shrink-0">
              <Users className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="text-[10px] sm:text-[11px] uppercase tracking-wider text-amber-200 font-semibold">
                {language === 'bn' ? 'সর্বমোট সদস্য' : 'Total Members'}
              </div>
              <div className="text-xl sm:text-2xl md:text-3xl font-black text-amber-300 leading-tight">
                {language === 'bn' ? `${toBengaliNumber(totalMembersCount)} জন` : `${totalMembersCount} Members`}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. ALL UNIFORM EXECUTIVE COMMITTEE PROFILE CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredMembers.map((member, index) => {
          const isPresident = member.roleType === 'president';
          const cardBorder = isPresident 
            ? 'border-2 border-amber-400 shadow-md hover:border-amber-500' 
            : 'border border-emerald-200 shadow-xs hover:border-emerald-500 hover:shadow-md';
          const officialSerial = EXECUTIVE_COMMITTEE_LIST.findIndex((m) => m.id === member.id) + 1;
          const serialNum = officialSerial > 0 ? officialSerial : (index + 1);

          return (
            <div
              key={member.id}
              className={`bg-white rounded-2xl p-5 transition-all flex flex-col justify-between space-y-4 group ${cardBorder}`}
            >
              {/* Top Section: Role Badge & Card ID */}
              <div className="flex items-center justify-between border-b border-emerald-100/80 pb-2.5">
                <span className={`px-3 py-1 text-xs rounded-lg shadow-2xs flex items-center gap-1.5 ${getRoleBadgeStyle(member.roleType)}`}>
                  <Award className="w-3.5 h-3.5 text-amber-900 shrink-0" />
                  <span>{language === 'bn' ? member.designationBn : member.designationEn}</span>
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/80">
                    {language === 'bn' ? `নং ${toBengaliNumber(serialNum)}` : `#${serialNum < 10 ? `0${serialNum}` : serialNum}`}
                  </span>
                  {member.batchBn && (
                    <span className="text-[11px] font-bold text-gray-500">
                      {language === 'bn' ? member.batchBn : (member.batchEn || member.batchBn)}
                    </span>
                  )}
                </div>
              </div>

              {/* Middle Section: Photo & Primary Info */}
              <div className="flex items-start gap-3.5">
                {/* Photo / First Letter Avatar Frame */}
                <div className="w-20 h-24 sm:w-22 sm:h-26 rounded-xl overflow-hidden border-2 border-emerald-600 bg-gradient-to-br from-[#042f19] via-[#084e2a] to-[#022011] shrink-0 shadow-xs relative flex items-center justify-center">
                  {member.photoUrl ? (
                    <img
                      src={member.photoUrl}
                      alt={language === 'bn' ? member.nameBn : member.nameEn}
                      className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105 z-10 relative"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : null}
                  <div className="absolute inset-0 flex items-center justify-center text-amber-300 font-black text-2xl sm:text-3xl font-siliguri select-none">
                    <span className="transform group-hover:scale-110 transition-transform drop-shadow-sm">
                      {getInitialLetter(language === 'bn' ? member.nameBn : (member.nameEn || member.nameBn))}
                    </span>
                  </div>
                </div>

                {/* Main Text Details */}
                <div className="min-w-0 flex-1 space-y-1">
                  <h3 className="font-black text-base sm:text-lg text-[#032715] font-serif-bn leading-snug">
                    {language === 'bn' ? member.nameBn : member.nameEn}
                  </h3>
                  {member.sessionBn && (
                    <div className="text-xs font-semibold text-emerald-800 bg-emerald-50/80 border border-emerald-200/60 rounded-md px-2 py-0.5 inline-block">
                      {language === 'bn' ? `সেশন: ${member.sessionBn}` : `Session: ${member.sessionEn || member.sessionBn}`}
                    </div>
                  )}

                  {(member.locationBn || member.bloodGroup) && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5 text-[11px]">
                      {member.locationBn && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-900 border border-emerald-200 font-medium">
                          <MapPin className="w-3 h-3 text-emerald-700 shrink-0" />
                          <span>{language === 'bn' ? member.locationBn : (member.locationEn || member.locationBn)}</span>
                        </span>
                      )}
                      {member.bloodGroup && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 font-bold">
                          <Droplet className="w-3 h-3 text-rose-600 shrink-0" />
                          <span>{member.bloodGroup}</span>
                        </span>
                      )}
                    </div>
                  )}

                  <p className="text-[11px] font-medium text-gray-600 pt-0.5 flex items-start gap-1 leading-tight">
                    <Building2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span className={member.organizationBn ? "font-semibold text-emerald-900" : ""}>
                      {member.organizationBn 
                        ? (language === 'bn' ? member.organizationBn : (member.organizationEn || member.organizationBn))
                        : (language === 'bn' ? 'উদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশন' : 'Botany Alumni Association')}
                    </span>
                  </p>
                </div>
              </div>

              {/* Bottom Section: Contact Info (Phone & Email) */}
              <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-3 space-y-2 text-xs">
                {member.phone ? (
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="p-1.5 bg-emerald-700 text-white rounded-md shrink-0">
                        <Phone className="w-3.5 h-3.5" />
                      </div>
                      <a
                        href={`tel:${member.phone.replace(/[^0-9]/g, '')}`}
                        className="font-bold text-emerald-900 hover:text-emerald-700 underline truncate"
                      >
                        {member.phone}
                      </a>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(member.phone || '', `phone-${member.id}`)}
                      className="p-1 hover:bg-emerald-200 rounded text-emerald-800 transition-colors cursor-pointer shrink-0"
                      title="Copy Phone"
                    >
                      {copiedField === `phone-${member.id}` ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-gray-400">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'ফোন নম্বর দেওয়া হয়নি' : 'Phone not listed'}</span>
                  </div>
                )}

                {member.email ? (
                  <div className="flex items-center justify-between gap-2 border-t border-emerald-200/50 pt-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="p-1.5 bg-emerald-700 text-white rounded-md shrink-0">
                        <Mail className="w-3.5 h-3.5" />
                      </div>
                      <a
                        href={`mailto:${member.email}`}
                        className="font-bold text-emerald-900 hover:text-emerald-700 underline truncate text-[11px]"
                        title={member.email}
                      >
                        {member.email}
                      </a>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(member.email || '', `email-${member.id}`)}
                      className="p-1 hover:bg-emerald-200 rounded text-emerald-800 transition-colors cursor-pointer shrink-0"
                      title="Copy Email"
                    >
                      {copiedField === `email-${member.id}` ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-gray-400 border-t border-emerald-200/50 pt-2">
                    <Mail className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'ইমেল দেওয়া হয়নি' : 'Email not listed'}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. OFFICIAL DOCUMENT SCAN SECTION */}
      <div className="pt-4 border-t border-emerald-100 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
          <div className="flex items-center gap-2 text-[#006a4e]">
            <FileImage className="w-5 h-5 text-emerald-700 shrink-0" />
            <span className="font-bold text-sm sm:text-base">
              {language === 'bn' 
                ? '১ম কার্যনির্বাহী কমিটি (২০২৪-২৬) এর মূল অফিশিয়াল ডকুমেন্টের আসল কপি' 
                : '1st Executive Committee (2024-26) Original Official Document Scan'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleDownload(EXECUTIVE_COMMITTEE_DOCUMENTS[0])}
              className="px-3 py-1.5 bg-[#006a4e] hover:bg-[#00543e] text-amber-300 rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'ডাউনলোড (পাতা ১)' : 'Download (Page 1)'}</span>
            </button>
            <button
              type="button"
              onClick={() => handleDownload(EXECUTIVE_COMMITTEE_DOCUMENTS[1])}
              className="px-3 py-1.5 bg-[#006a4e] hover:bg-[#00543e] text-amber-300 rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'ডাউনলোড (পাতা ২)' : 'Download (Page 2)'}</span>
            </button>
          </div>
        </div>

        {/* Scanned Image Preview */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {EXECUTIVE_COMMITTEE_DOCUMENTS.map((item) => (
            <div
              key={item.id}
              className="bg-white border-2 border-emerald-100 hover:border-[#006a4e] rounded-2xl p-4 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-emerald-50">
                <span className="px-3 py-1 bg-[#006a4e] text-amber-300 text-xs font-bold rounded-md">
                  {language === 'bn' ? item.titleBn : item.titleEn}
                </span>
                <span className="text-xs text-gray-500 font-medium">
                  {language === 'bn' ? 'অফিসিয়াল কপি' : 'Official Scan'}
                </span>
              </div>

              <div
                onClick={() => {
                  setSelectedImage(item);
                  setZoomScale(1);
                }}
                className="relative w-full aspect-[1/1.42] bg-gray-50 rounded-xl overflow-hidden border border-gray-200 cursor-pointer group/img shadow-inner"
              >
                <img
                  src={item.imageSrc}
                  alt={item.titleBn}
                  className="w-full h-full object-contain p-1 transition-transform duration-300 group-hover/img:scale-105"
                  referrerPolicy="no-referrer"
                />

                <div className="absolute inset-0 bg-[#004d38]/70 opacity-0 group-hover/img:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-2 backdrop-blur-2xs">
                  <ZoomIn className="w-8 h-8 text-amber-300 animate-pulse" />
                  <span className="text-xs font-bold text-amber-200">
                    {language === 'bn' ? 'ক্লিক করে বড় করে দেখুন' : 'Click to View Full Size'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. FULLSCREEN ZOOM IMAGE MODAL FOR DOCUMENT */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[96vh] flex flex-col shadow-2xl overflow-hidden border border-emerald-300">
            <div className="bg-[#006a4e] text-white p-3.5 sm:p-4 flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2 overflow-hidden">
                <FileImage className="w-5 h-5 text-amber-300 shrink-0" />
                <h3 className="font-bold text-sm sm:text-base text-amber-100 truncate">
                  {selectedImage.titleBn}
                </h3>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setZoomScale((prev) => (prev >= 2.5 ? 1 : prev + 0.5))}
                  className="px-2.5 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                  <span>{Math.round(zoomScale * 100)}%</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownload(selectedImage)}
                  className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-emerald-950 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'ডাউনলোড' : 'Download'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handlePrintImage(selectedImage)}
                  className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-amber-300" />
                  <span className="hidden sm:inline">{language === 'bn' ? 'প্রিন্ট' : 'Print'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedImage(null)}
                  className="p-1.5 hover:bg-emerald-800 text-white rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-3 sm:p-6 overflow-auto flex items-center justify-center bg-gray-100 min-h-[60vh]">
              <div 
                className="transition-transform duration-200 bg-white rounded-lg shadow-lg max-w-full overflow-hidden"
                style={{ transform: `scale(${zoomScale})`, transformOrigin: 'top center' }}
              >
                <img
                  src={selectedImage.imageSrc}
                  alt={selectedImage.titleBn}
                  className="max-h-[80vh] w-auto object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
