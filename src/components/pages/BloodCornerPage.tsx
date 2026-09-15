import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Heart, 
  Droplet, 
  Search, 
  Phone, 
  MapPin, 
  Calendar, 
  UserCheck, 
  AlertCircle
} from 'lucide-react';

interface Donor {
  id: string;
  nameBn: string;
  nameEn: string;
  photoUrl?: string;
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'O+' | 'O-' | 'AB+' | 'AB-';
  sessionBn: string;
  sessionEn: string;
  phone: string;
  locationBn: string;
  locationEn: string;
}

const INITIAL_DONORS: Donor[] = [
  {
    id: 'donor-1',
    nameBn: 'মইনুল হোসেন শাকের',
    nameEn: 'Moynul Hossain Shaker',
    bloodGroup: 'AB+',
    sessionBn: '২০১৪-২০১৫',
    sessionEn: '2014-2015',
    phone: '01557766933',
    locationBn: 'বাড্ডা, ঢাকা',
    locationEn: 'Badda, Dhaka'
  },
  {
    id: 'donor-2',
    nameBn: 'মোঃ সামসুল আলম',
    nameEn: 'Md. Samsul Alom',
    bloodGroup: 'O+',
    sessionBn: '২০০৫-০৬',
    sessionEn: '2005-06',
    phone: '01719417602',
    locationBn: 'কুষ্টিয়া',
    locationEn: 'Kushtia'
  },
  {
    id: 'donor-3',
    nameBn: 'মোঃ মেহেদী হাসান',
    nameEn: 'Md. Mehedi Hasan',
    bloodGroup: 'O+',
    sessionBn: '২০১০-২০১১',
    sessionEn: '2010-2011',
    phone: '01795186813',
    locationBn: 'পটুয়াখালী',
    locationEn: 'Patuakhali'
  },
  {
    id: 'donor-4',
    nameBn: 'মনিরুজ্জামান মনির',
    nameEn: 'Moniruzzaman Monir',
    bloodGroup: 'O+',
    sessionBn: '২০১৭-১৮',
    sessionEn: '2017-18',
    phone: '01919107480',
    locationBn: 'মিরপুর-১৪, ঢাকা',
    locationEn: 'Mirpur 14, Dhaka'
  }
];

interface BloodCornerPageProps {
  language: 'bn' | 'en';
  onBackToHome: () => void;
}

export const BloodCornerPage: React.FC<BloodCornerPageProps> = ({ language, onBackToHome }) => {
  const [donors, setDonors] = useState<Donor[]>(() => {
    try {
      const saved = localStorage.getItem('botany_blood_donors_v4');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {}
    return INITIAL_DONORS;
  });

  const [selectedGroup, setSelectedGroup] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    try {
      localStorage.setItem('botany_blood_donors_v4', JSON.stringify(donors));
    } catch (e) {}
  }, [donors]);

  const bloodGroups = ['ALL', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

  const filteredDonors = donors.filter((donor) => {
    const matchesGroup = selectedGroup === 'ALL' || donor.bloodGroup === selectedGroup;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = 
      !query ||
      donor.nameBn.toLowerCase().includes(query) ||
      donor.nameEn.toLowerCase().includes(query) ||
      donor.sessionBn.toLowerCase().includes(query) ||
      donor.sessionEn.toLowerCase().includes(query) ||
      donor.locationBn.toLowerCase().includes(query) ||
      donor.locationEn.toLowerCase().includes(query) ||
      donor.phone.includes(query) ||
      donor.bloodGroup.toLowerCase().includes(query);

    return matchesGroup && matchesSearch;
  });

  return (
    <div className="w-full bg-[#f8faf9] min-h-screen py-6 px-3 sm:px-6 md:px-8 font-siliguri animate-in fade-in duration-300">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Top Breadcrumb & Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-xl border border-emerald-100 shadow-2xs">
          <button
            onClick={onBackToHome}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-[#006a4e] rounded-lg text-xs sm:text-sm font-bold transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{language === 'bn' ? 'হোম বাতায়নে ফিরুন' : 'Back to Home'}</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-[11px] sm:text-xs font-bold text-red-700 bg-red-50 px-3 py-1.5 rounded-full border border-red-200">
              {language === 'bn' ? 'জরুরি রক্তসেবা বাতায়ন' : 'Emergency Blood Service'}
            </span>
          </div>
        </div>

        {/* Hero Section */}
        <div className="bg-gradient-to-r from-[#800f14] via-[#a31621] to-[#6e0d12] text-white rounded-2xl p-6 sm:p-8 shadow-md relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 opacity-10 pointer-events-none">
            <Heart className="w-80 h-80 text-white fill-white" />
          </div>

          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-amber-200 text-xs font-bold border border-white/20">
              <Droplet className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
              <span>{language === 'bn' ? 'উদ্ভিদ বিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশন ব্লাড ব্যাংক' : 'Botany Alumni Association Blood Bank'}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-serif-bn tracking-tight text-white drop-shadow-xs">
              {language === 'bn' ? 'ব্লাড কর্ণার: মানবতার সেতুবন্ধন' : 'Blood Corner: Bridge of Humanity'}
            </h1>

            <p className="text-xs sm:text-sm md:text-base text-red-100 font-medium leading-relaxed">
              {language === 'bn' 
                ? 'উদ্ভিদ বিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশন, জগন্নাথ বিশ্ববিদ্যালয়ের শিক্ষার্থী, শিক্ষক ও তাঁদের পরিবারের জরুরি রক্তের প্রয়োজনে স্বেচ্ছাসেবী রক্তদাতাদের তালিকা।' 
                : 'Emergency blood donors list for Botany Alumni Association, Jagannath University students, faculty, and their families.'}
            </p>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-emerald-100 shadow-xs space-y-4">
          
          {/* Blood Group Filter Chips */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
              {language === 'bn' ? 'রক্তের গ্রুপ নির্বাচন করুন:' : 'Filter by Blood Group:'}
            </label>
            <div className="flex flex-wrap gap-2">
              {bloodGroups.map((group) => {
                const isSelected = selectedGroup === group;
                return (
                  <button
                    key={group}
                    onClick={() => setSelectedGroup(group)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-red-600 text-white border-red-700 shadow-xs scale-105'
                        : 'bg-gray-50 hover:bg-red-50 text-gray-700 border-gray-200 hover:border-red-200'
                    }`}
                  >
                    {group === 'ALL' ? (language === 'bn' ? 'সকল গ্রুপ' : 'All Groups') : group}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search Input */}
          <div className="relative pt-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 mt-0.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'bn' ? 'রক্তদাতার নাম, এলাকা, সেশন বা ফোন নম্বর দিয়ে খুঁজুন...' : 'Search by donor name, area, session or phone number...'}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:border-emerald-500 focus:bg-white transition-colors"
            />
          </div>
        </div>

        {/* Donors Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 font-serif-bn flex items-center gap-2">
              <Heart className="w-4.5 h-4.5 text-red-600 fill-red-600" />
              <span>{language === 'bn' ? 'স্বেচ্ছাসেবী রক্তদাতাদের তালিকা' : 'Volunteer Blood Donors'}</span>
            </h2>
            <span className="text-xs text-gray-500 font-medium">
              {language === 'bn' ? `মোট প্রদর্শিত: ${filteredDonors.length} জন` : `Total Displayed: ${filteredDonors.length}`}
            </span>
          </div>

          {filteredDonors.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center space-y-3">
              <AlertCircle className="w-10 h-10 text-gray-400 mx-auto" />
              <p className="text-sm font-bold text-gray-700">
                {language === 'bn' ? 'কোনো রক্তদাতা পাওয়া যায়নি' : 'No donors found'}
              </p>
              <p className="text-xs text-gray-500">
                {language === 'bn' ? 'অনুগ্রহ করে অনুসন্ধানের শর্ত পরিবর্তন করুন অথবা গ্রুপ ফিল্টার রিসিলেক্ট করুন।' : 'Please adjust your filter or search terms.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5">
              {filteredDonors.map((donor) => (
                <div
                  key={donor.id}
                  className="bg-white rounded-2xl border border-gray-200/90 hover:border-red-400/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group hover:-translate-y-0.5"
                >
                  {/* Box Header Accent Bar with Session & Blood Group Badge */}
                  <div className="bg-gradient-to-r from-red-50 via-red-100/40 to-emerald-50/40 px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                    {/* ৮. সেশন Box Badge */}
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-emerald-200 text-emerald-800 rounded-lg text-[11px] font-bold shadow-2xs">
                      <Calendar className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span className="truncate">{language === 'bn' ? `সেশন: ${donor.sessionBn}` : `Session: ${donor.sessionEn}`}</span>
                    </div>

                    {/* ৬. ব্লাড গ্রুপ Box Badge */}
                    <div className="flex items-center gap-1 bg-gradient-to-br from-red-600 via-red-700 to-red-900 text-white px-3 py-1 rounded-xl shadow-xs border border-red-400/30">
                      <Droplet className="w-3.5 h-3.5 fill-amber-300 text-amber-300 shrink-0" />
                      <span className="text-base font-black tracking-tight">{donor.bloodGroup}</span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    {/* Photo + Name Row */}
                    <div className="flex items-center gap-3.5">
                      {/* ২. ছবি (Photo Box) */}
                      <div className="relative shrink-0 w-14 h-14 rounded-2xl overflow-hidden border-2 border-red-200 shadow-2xs group-hover:border-red-500 transition-colors bg-gray-100 flex items-center justify-center">
                        {donor.photoUrl ? (
                          <img
                            src={donor.photoUrl}
                            alt={donor.nameBn}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : null}
                        {(!donor.photoUrl || true) && (
                          <div
                            className={`w-full h-full bg-gradient-to-br from-red-600 to-emerald-800 text-white font-black text-lg flex items-center justify-center ${
                              donor.photoUrl ? 'hidden [div:has(img[style*="display: none"])+&]:flex' : ''
                            }`}
                          >
                            {(language === 'bn' ? donor.nameBn : donor.nameEn).charAt(0)}
                          </div>
                        )}
                      </div>

                      {/* ১. নাম (Name) */}
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm sm:text-base font-bold text-gray-900 truncate group-hover:text-red-700 transition-colors leading-snug">
                          {language === 'bn' ? donor.nameBn : donor.nameEn}
                        </h3>
                        <p className="text-[11px] text-gray-500 font-medium">
                          {language === 'bn' ? 'স্বেচ্ছাসেবী রক্তদাতা' : 'Volunteer Blood Donor'}
                        </p>
                      </div>
                    </div>

                    {/* ৭. লোকেশন Box */}
                    <div className="flex items-center gap-2 bg-gray-50 p-2.5 rounded-xl border border-gray-100 text-xs text-gray-700 font-medium">
                      <div className="w-6 h-6 rounded-lg bg-red-100/70 text-red-600 flex items-center justify-center shrink-0">
                        <MapPin className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0 flex-1 truncate">
                        <span className="text-[10px] text-gray-400 block font-bold uppercase tracking-wider">{language === 'bn' ? 'বর্তমান অবস্থান' : 'Location'}</span>
                        <span className="font-semibold text-gray-800 truncate block">{language === 'bn' ? donor.locationBn : donor.locationEn}</span>
                      </div>
                    </div>

                    {/* ৫. ফোন নাম্বার & Call Action Box */}
                    <div className="flex items-center justify-between gap-2 bg-[#002f23] text-white p-2.5 rounded-xl border border-emerald-900/40 shadow-2xs">
                      <div className="flex items-center gap-2 min-w-0 pl-1">
                        <div className="w-6 h-6 rounded-lg bg-emerald-700/50 text-amber-300 flex items-center justify-center shrink-0">
                          <Phone className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] text-emerald-300/80 block font-bold uppercase tracking-wider">{language === 'bn' ? 'ফোন নম্বর' : 'Phone'}</span>
                          <span className="text-xs sm:text-sm font-mono font-bold text-white tracking-wide">{donor.phone}</span>
                        </div>
                      </div>

                      <a
                        href={`tel:${donor.phone}`}
                        className="flex items-center gap-1.5 py-2 px-3.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs shrink-0"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>{language === 'bn' ? 'কল দিন' : 'Call Now'}</span>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Informational Guideline Card */}
        <div className="bg-white rounded-2xl border border-emerald-100 p-4 sm:p-6 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-[#006a4e]">
            <UserCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-sm sm:text-base font-serif-bn">
              {language === 'bn' ? 'রক্তদানের জন্য জরুরি দিকনির্দেশনা' : 'Blood Donation Guidelines'}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm text-gray-700">
            <div className="p-3.5 bg-red-50/60 rounded-xl border border-red-100 space-y-1.5">
              <h4 className="font-bold text-red-900 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-red-600" />
                <span>{language === 'bn' ? 'কে রক্ত দিতে পারবেন?' : 'Who can donate?'}</span>
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                {language === 'bn'
                  ? '১৮ থেকে ৬০ বছর বয়সী সুস্থ যেকোনো ব্যক্তি, যাঁর ওজন অন্তত ৪৫ কেজি এবং হিমোগ্লোবিন সন্তোষজনক।'
                  : 'Any healthy individual aged 18 to 60, weighing at least 45 kg with normal hemoglobin levels.'}
              </p>
            </div>

            <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-100 space-y-1.5">
              <h4 className="font-bold text-emerald-950 flex items-center gap-1.5">
                <Droplet className="w-4 h-4 text-emerald-600" />
                <span>{language === 'bn' ? 'রক্তদানের সময়সূচি' : 'Donation Interval'}</span>
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                {language === 'bn'
                  ? 'পুরুষরা প্রতি ৩ মাস পর পর এবং নারীরা প্রতি ৪ মাস পর পর নিরাপদে স্বেচ্ছায় রক্তদান করতে পারেন।'
                  : 'Men can donate every 3 months and women can donate every 4 months safely.'}
              </p>
            </div>

            <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-100 space-y-1.5">
              <h4 className="font-bold text-amber-950 flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-amber-600" />
                <span>{language === 'bn' ? 'রক্তদানের উপকারিতা' : 'Health Benefits'}</span>
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                {language === 'bn'
                  ? 'রক্তদানে হৃদরোগের ঝুঁকি কমে, রক্তে কোলেস্টেরল নিয়ন্ত্রণে থাকে এবং দেহে নতুন রক্তকণিকা তৈরি হয়।'
                  : 'Reduces cardiovascular risks, regulates cholesterol, and stimulates fresh blood cell formation.'}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
