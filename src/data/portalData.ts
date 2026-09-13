// PORTAL DATA REPOSITORY: JAGANNATH UNIVERSITY - DEPARTMENT OF BOTANY ALUMNI ASSOCIATION
// জগন্নাথ বিশ্ববিদ্যালয় - উদ্ভিদবিজ্ঞান বিভাগ অ্যালামনাই অ্যাসোসিয়েশন

export interface MenuItem {
  titleBn: string;
  titleEn: string;
  href?: string;
  children?: MenuItem[];
}

export interface NoticeItem {
  id: string;
  titleBn: string;
  titleEn: string;
  date: string;
  isNew: boolean;
  category: 'academic' | 'exam' | 'seminar' | 'admission' | 'general';
  categoryBn: string;
  categoryEn: string;
  refNo: string;
  detailsBn: string;
  detailsEn: string;
  attachmentUrl?: string;
}

export interface TeacherProfile {
  id: string;
  nameBn: string;
  nameEn: string;
  designationBn: string;
  designationEn: string;
  qualificationBn: string;
  qualificationEn: string;
  email: string;
  phone: string;
  specializationBn: string;
  specializationEn: string;
  imageUrl: string;
}

export const NAV_MENU: MenuItem[] = [
  {
    titleBn: 'আমাদের সম্পর্কে',
    titleEn: 'About Us',
    href: '#about',
    children: [
      { titleBn: 'অ্যালামনাই অ্যাসোসিয়েশন পরিচিতি', titleEn: 'Alumni Association Profile', href: '#department-about' },
      { titleBn: 'লক্ষ্য ও উদ্দেশ্য', titleEn: 'Mission & Objectives', href: '#mission-vision' },
      { titleBn: 'উদ্ভিদবিজ্ঞান বিভাগ ও বিশ্ববিদ্যালয়ের ইতিহাস', titleEn: 'History of Botany Dept & University', href: '#college-history' },
      { titleBn: 'সেমিনার ও অ্যালামনাই সেল', titleEn: 'Seminar & Alumni Facilities', href: '#seminar-library' }
    ]
  },
  {
    titleBn: 'কার্যনির্বাহী ও উপদেষ্টা পরিষদ',
    titleEn: 'Executive & Advisory Council',
    href: '#leadership',
    children: [
      { titleBn: 'প্রধান উপদেষ্টা ও কার্যনির্বাহী পরিষদ', titleEn: 'Chief Advisor & Executive Council', href: '#leadership' },
      { titleBn: 'সম্মানিত শিক্ষক ও অনুষদ পরিষদ', titleEn: 'Faculty Members & Advisors', href: '#faculty-members' },
      { titleBn: 'উপদেষ্টা পরিষদ ও বাস্তবায়ন সেল', titleEn: 'Advisory Council & Working Cells', href: '#staff-officers' }
    ]
  },
  {
    titleBn: 'সদস্য নিবন্ধন',
    titleEn: 'Member Registration',
    href: '#membership'
  },
  {
    titleBn: 'নিবন্ধিত অ্যালামনাই তালিকা',
    titleEn: 'Registered Alumni Directory',
    href: '#members-list'
  },
  {
    titleBn: 'যোগাযোগ',
    titleEn: 'Contact Us',
    href: '#contact'
  }
];

export const NOTICES_DATA: NoticeItem[] = [
  {
    id: 'notice-1',
    titleBn: 'জগন্নাথ বিশ্ববিদ্যালয় উদ্ভিদবিজ্ঞান বিভাগ অ্যালামনাই অ্যাসোসিয়েশনের বার্ষিক পুনর্মিলনী ২০২৬ ও নিবন্ধন সংক্রান্ত জরুরি বিজ্ঞপ্তি',
    titleEn: 'Urgent Notice Regarding Annual Reunion 2026 and Alumni Membership Registration',
    date: '১৫-০৮-২০২৬',
    isNew: true,
    category: 'seminar',
    categoryBn: 'পুনর্মিলনী ও উৎসব',
    categoryEn: 'Reunion & Festival',
    refNo: 'জবি/উদ্ভিদবিজ্ঞান/অ্যালামনাই/২০২৬/০১',
    detailsBn: 'জগন্নাথ বিশ্ববিদ্যালয়ের উদ্ভিদবিজ্ঞান বিভাগের সকল ব্যাচের প্রাক্তন শিক্ষার্থীদের অবগতির জন্য জানানো যাচ্ছে যে, আগামী নভেম্বরে অনুষ্ঠিত হতে যাচ্ছে "উদ্ভিদবিজ্ঞান বিভাগ অ্যালামনাই অ্যাসোসিয়েশন বার্ষিক পুনর্মিলনী ২০২৬"। সকল ব্যাচের প্রাক্তন শিক্ষার্থীদের পোর্টালে গিয়ে অবিলম্বে রেজিস্ট্রেশন সম্পন্ন করার জন্য বিশেষভাবে অনুরোধ করা হলো।',
    detailsEn: 'All former graduates of the Botany Department are hereby notified that the Annual Reunion 2026 is scheduled for November. Please complete your registration via the portal.'
  },
  {
    id: 'notice-2',
    titleBn: 'অ্যালামনাই অ্যাসোসিয়েশন কার্যনির্বাহী পরিষদ ও উপদেষ্টা কমিটির যৌথ সভা আহ্বান',
    titleEn: 'Joint Meeting Call of Alumni Association Executive Council and Advisory Committee',
    date: '১০-০৮-২০২৬',
    isNew: true,
    category: 'academic',
    categoryBn: 'কার্যনির্বাহী সভা',
    categoryEn: 'Executive Meeting',
    refNo: 'জবি/উদ্ভিদবিজ্ঞান/অ্যালামনাই/২০২৬/০২',
    detailsBn: 'অ্যালামনাই অ্যাসোসিয়েশনের সম্মানিত উপদেষ্টা পরিষদ এবং কার্যনির্বাহী কমিটির এক যৌথ সভা আগামী ২২ আগস্ট ২০২৬ শুক্রবার বিকাল ৪:০০ টায় বিভাগীয় সেমিনার কক্ষে অনুষ্ঠিত হবে। পুনর্মিলনী প্রস্তুতি ও তহবিল সংগ্রহ বিষয়ে গুরুত্বপূর্ণ সিদ্ধান্ত গৃহীত হবে।',
    detailsEn: 'A joint meeting of the Advisory Council and Executive Committee will be held on Friday, August 22, 2026, at 4:00 PM in the Department Seminar Room.'
  },
  {
    id: 'notice-3',
    titleBn: 'অ্যালামনাই কল্যাণ তহবিল থেকে মেধাবী ও অস্বচ্ছল শিক্ষার্থীদের শিক্ষাবৃত্তি প্রদান সংক্রান্ত বিজ্ঞপ্তি',
    titleEn: 'Notice Regarding Education Scholarships for Meritorious & Needy Students from Alumni Trust',
    date: '০৫-০৮-২০২৬',
    isNew: false,
    category: 'admission',
    categoryBn: 'বৃত্তি ও কল্যাণ',
    categoryEn: 'Scholarship & Welfare',
    refNo: 'জবি/উদ্ভিদবিজ্ঞান/অ্যালামনাই/২০২৬/০৩',
    detailsBn: 'উদ্ভিদবিজ্ঞান বিভাগ অ্যালামনাই অ্যাসোসিয়েশনের উদ্যোগে বর্তমান অধ্যয়নরত অস্বচ্ছল ও মেধাবী শিক্ষার্থীদের এককালীন শিক্ষা বৃত্তি প্রদান করা হবে। আগ্রহী শিক্ষার্থীদের আগামী ২৫ আগস্টের মধ্যে বিভাগীয় অফিসে নির্ধারিত ফরমে আবেদন করার জন্য বলা হলো।',
    detailsEn: 'The Botany Alumni Association will provide educational scholarships to deserving students. Interested students are requested to apply by August 25.'
  },
  {
    id: 'notice-4',
    titleBn: 'বিসিএস ও সরকারি-বেসরকারি চাকরি প্রস্তুতি বিষয়ক ক্যারিয়ার মেন্টরশিপ ও গাইডলাইন সেশন',
    titleEn: 'Career Mentorship & Guidance Session on BCS and Job Preparation by Alumni Experts',
    date: '২৮-০৭-২০২৬',
    isNew: false,
    category: 'seminar',
    categoryBn: 'ক্যারিয়ার মেন্টরশিপ',
    categoryEn: 'Career Mentorship',
    refNo: 'জবি/উদ্ভিদবিজ্ঞান/অ্যালামনাই/২০২৬/০৪',
    detailsBn: 'অ্যালামনাই অ্যাসোসিয়েশনের সফল বিসিএস ক্যাডার ও গবেষকদের অংশগ্রহণে বর্তমান শিক্ষার্থীদের নিয়ে একটি বিশেষ ক্যারিয়ার গাইডলাইন ও মেন্টরশিপ সেশন আগামী ৩০ আগস্ট ২০২৬ সেমিনার কক্ষে অনুষ্ঠিত হবে।',
    detailsEn: 'A special career mentorship session featuring successful alumni BCS cadres and professionals will be held on August 30, 2026.'
  },
  {
    id: 'notice-5',
    titleBn: 'ডিজিটাল ডাটাবেজ ও অনলাইন সদস্য পরিচয়পত্র (ID Card) ডাউনলোড সংক্রান্ত বিজ্ঞপ্তি',
    titleEn: 'Digital Database & Online Alumni ID Card Generation Notice',
    date: '২০-০৭-২০২৬',
    isNew: false,
    category: 'general',
    categoryBn: 'সদস্য নিবন্ধন',
    categoryEn: 'Membership ID',
    refNo: 'জবি/উদ্ভিদবিজ্ঞান/অ্যালামনাই/২০২৬/০৫',
    detailsBn: 'যাঁরা ইতোমধ্যে অ্যালামনাই পোর্টালে নিবন্ধন সম্পন্ন করেছেন, তাঁরা প্রোফাইল লগইন করে ডিজিটাল মেম্বারশিপ আইডি কার্ড ডাউনলোড করতে পারবেন। নতুন সদস্যদের রেজিস্ট্রেশন কার্যক্রম চলমান রয়েছে।',
    detailsEn: 'Alumni who have already completed portal registration can now log in and download their digital membership ID cards.'
  }
];

export const ADVISER_BIO = {
  nameBn: 'প্রফেসর মো. আমান উল্লাহ',
  nameEn: 'Prof. Md. Aman Ullah',
  titleBn: 'উপাচার্য, জগন্নাথ বিশ্ববিদ্যালয়, ঢাকা',
  titleEn: 'Vice-Chancellor, Jagannath University, Dhaka',
  ministryBn: 'জগন্নাথ বিশ্ববিদ্যালয়, ঢাকা',
  ministryEn: 'Jagannath University, Dhaka',
  bioBn: 'প্রফেসর মো. আমান উল্লাহ জগন্নাথ বিশ্ববিদ্যালয়ের সম্মানিত উপাচার্য। সুদীর্ঘ শিক্ষাজীবনে তিনি উচ্চশিক্ষার বিস্তার, প্রাতিষ্ঠানিক সুশাসন এবং গবেষণামূলক পরিবেশ তৈরিতে একনিষ্ঠ ভূমিকা রেখে চলেছেন। তাঁর দূরদর্শী নেতৃত্বে জগন্নাথ বিশ্ববিদ্যালয় শীর্ষস্থানীয় বিদ্যাপীঠ হিসেবে সুনাম অক্ষুণ্ণ রেখেছে।',
  bioEn: 'Prof. Md. Aman Ullah is the Honorable Vice-Chancellor of Jagannath University, Dhaka. With a distinguished career in higher education, he has dedicated himself to academic excellence, institutional governance, and research culture.',
  messageBn: 'জগন্নাথ বিশ্ববিদ্যালয়ের উদ্ভিদবিজ্ঞান বিভাগ উদ্ভিদ গবেষণা, জীববৈচিত্র্য সংরক্ষণ ও উদ্ভিদবিজ্ঞান শিক্ষায় অগ্রণী ভূমিকা পালন করছে। শিক্ষার্থীদের উদ্ভাবনী জ্ঞানে সমৃদ্ধ হয়ে দেশ ও জাতির কল্যাণে কাজ করার আহ্বান জানাই।',
  messageEn: 'The Department of Botany at Jagannath University plays a leading role in botanical research, biodiversity conservation, and life science education.'
};

export const SECRETARY_BIO = {
  nameBn: 'মোঃ আব্দুর রাজ্জাক',
  nameEn: 'Md. Abdur Razzak',
  titleBn: 'সভাপতি, অ্যালামনাই অ্যাসোসিয়েশন',
  titleEn: 'President, Alumni Association',
  batchBn: '১ম ব্যাচ',
  batchEn: '1st Batch',
  sessionBn: '২০০৫-২০০৬',
  sessionEn: '2005-2006',
  phone: '০১৭১০-৫৯৫১২৯',
  email: 'razzak90jnu.bd@gmail.com',
  ministryBn: 'উদ্ভিদবিজ্ঞান বিভাগ, জগন্নাথ বিশ্ববিদ্যালয়',
  ministryEn: 'Department of Botany, Jagannath University',
  bioBn: 'মোঃ আব্দুর রাজ্জাক জগন্নাথ বিশ্ববিদ্যালয়ের উদ্ভিদবিজ্ঞান বিভাগের ১ম ব্যাচের (সেশন: ২০০৫-২০০৬) শিক্ষার্থী এবং বর্তমানে উদ্ভিদবিজ্ঞান বিভাগ অ্যালামনাই অ্যাসোসিয়েশনের সম্মানিত সভাপতি হিসেবে দায়িত্ব পালন করছেন। প্রাক্তন ও বর্তমান শিক্ষার্থীদের মেলবন্ধন সুদৃঢ় করতে এবং বিভাগীয় সার্বিক অগ্রগতিতে তিনি সক্রিয় ভূমিকা রেখে চলেছেন।',
  bioEn: 'Md. Abdur Razzak is a 1st batch (Session: 2005-2006) alumnus of the Department of Botany, Jagannath University, and currently serves as the President of the Botany Alumni Association, dedicated to uniting alumni and advancing departmental excellence.',
  messageBn: 'উদ্ভিদবিজ্ঞান বিভাগ অ্যালামনাই অ্যাসোসিয়েশনের সকল সম্মানিত সদস্য, শিক্ষকবৃন্দ ও প্রিয় শিক্ষার্থীদের আন্তরিক শুভেচ্ছা। আমাদের ১ম ব্যাচ থেকে শুরু করে বর্তমান ব্যাচ পর্যন্ত সকল অ্যালামনাইদের সৌহার্দ্যপূর্ণ ঐক্য, পারস্পরিক সহযোগিতা ও ঐতিহ্য ধরে রাখতে আমরা একসাথে কাজ করে যাব।',
  messageEn: 'Warm greetings to all members, faculty, and dear students of the Botany Alumni Association. From our 1st batch to the latest, let us unite to foster brotherhood, mutual collaboration, and uphold our botanical legacy.'
};

export const GENERAL_SECRETARY_BIO = {
  nameBn: 'মোঃ মেহেদী হাসান',
  nameEn: 'Md. Mehedi Hasan',
  titleBn: 'সাধারণ সম্পাদক, অ্যালামনাই অ্যাসোসিয়েশন',
  titleEn: 'General Secretary, Alumni Association',
  batchBn: '৭ম ব্যাচ',
  batchEn: '7th Batch',
  sessionBn: '২০১০-২০১১',
  sessionEn: '2010-2011',
  email: 'mehedihasanbotn019@gmail.com',
  ministryBn: 'উদ্ভিদবিজ্ঞান বিভাগ, জগন্নাথ বিশ্ববিদ্যালয়',
  ministryEn: 'Department of Botany, Jagannath University',
  bioBn: 'মোঃ মেহেদী হাসান জগন্নাথ বিশ্ববিদ্যালয়ের উদ্ভিদবিজ্ঞান বিভাগের ৭ম ব্যাচের (সেশন: ২০১০-২০১১) শিক্ষার্থী এবং বর্তমানে উদ্ভিদবিজ্ঞান বিভাগ অ্যালামনাই অ্যাসোসিয়েশনের সাধারণ সম্পাদক হিসেবে অত্যন্ত নিষ্ঠার সাথে দায়িত্ব পালন করছেন। সকল প্রাক্তন শিক্ষার্থীদের মধ্যে সৌহার্দ্যপূর্ণ ঐক্য, নিয়মিত যোগাযোগ, পুনর্মিলনী ও কল্যাণমূলক কার্যক্রম পরিচালনায় তিনি সক্রিয় ভূমিকা রাখছেন।',
  bioEn: 'Md. Mehedi Hasan is a 7th batch (Session: 2010-2011) alumnus of the Department of Botany, Jagannath University, and serves as the General Secretary of the Botany Alumni Association, dedicated to alumni fellowship, reunions, and departmental welfare.',
  messageBn: 'উদ্ভিদবিজ্ঞান বিভাগ অ্যালামনাই অ্যাসোসিয়েশনের সকল সদস্য ও শুভানুধ্যায়ীদের আন্তরিক শুভেচ্ছা। আমাদের মূল লক্ষ্য প্রাক্তন ও বর্তমান শিক্ষার্থীদের মধ্যে আজীবন মেলবন্ধন, সৌহার্দ্য ও সহযোগিতার পরিবেশ সুদৃঢ় করা।',
  messageEn: 'Heartiest greetings to all members and well-wishers of the Botany Alumni Association. Our primary goal is to foster lifelong fellowship and unity.'
};

export const TREASURER_BIO = {
  nameBn: 'মো: ময়নুল হোসাইন সাকের',
  nameEn: 'Md. Moinul Hossain Shaker',
  titleBn: 'কোষাধ্যক্ষ, অ্যালামনাই অ্যাসোসিয়েশন',
  titleEn: 'Treasurer, Alumni Association',
  batchBn: '১০ম ব্যাচ (দশম)',
  batchEn: '10th Batch',
  sessionBn: '২০১৪-২০১৫',
  sessionEn: '2014-2015',
  phone: '০১৫৫৭-৭৬৬৯৩৩',
  email: 'shaker.jnu@gmail.com',
  ministryBn: 'উদ্ভিদবিজ্ঞান বিভাগ, জগন্নাথ বিশ্ববিদ্যালয়',
  ministryEn: 'Department of Botany, Jagannath University',
  bioBn: 'মো: ময়নুল হোসাইন সাকের জগন্নাথ বিশ্ববিদ্যালয়ের উদ্ভিদবিজ্ঞান বিভাগের ১০ম ব্যাচের (সেশন: ২০১৪-২০১৫) শিক্ষার্থী এবং বর্তমানে উদ্ভিদবিজ্ঞান বিভাগ অ্যালামনাই অ্যাসোসিয়েশনের কোষাধ্যক্ষ হিসেবে অ্যাসোসিয়েশনের তহবিল ব্যবস্থাপনা, আর্থিক স্বচ্ছতা এবং পুনর্মিলনী ও কল্যাণ তহবিলের সুষ্ঠু হিসাব সংরক্ষণে নিবেদিতভাবে কাজ করছেন।',
  bioEn: 'Md. Moinul Hossain Shaker is a 10th batch (Session: 2014-2015) alumnus of the Department of Botany, Jagannath University, and currently serves as the Treasurer of the Botany Alumni Association, managing financial transparency, welfare funds, and budget audits.',
  messageBn: 'অ্যালামনাই অ্যাসোসিয়েশনের আর্থিক স্বচ্ছতা, জবাবদিহিতা ও টেকসই কল্যাণ তহবিল গঠন আমাদের সর্বোচ্চ অগ্রাধিকার। সকল সম্মানিত সদস্যের সহযোগিতায় আমরা একটি স্বচ্ছ তহবিল পরিচালনায় প্রতিশ্রুতিবদ্ধ।',
  messageEn: 'Financial transparency, accountability, and sustainable welfare funds are our top priorities for the Botany Alumni Association.'
};

export const PAURASHAVA_PRESIDENT_BIO = {
  nameBn: 'রেহানা পারভীন',
  nameEn: 'Rehana Parvin',
  titleBn: 'সহযোগী অধ্যাপক ও সেমিনার ইনচার্জ',
  titleEn: 'Associate Professor & Seminar In-Charge',
  ministryBn: 'উদ্ভিদবিজ্ঞান বিভাগ, জগন্নাথ বিশ্ববিদ্যালয়',
  ministryEn: 'Department of Botany, Jagannath University',
  bioBn: 'রেহানা পারভীন উদ্ভিদবিজ্ঞান বিভাগের সহযোগী অধ্যাপক এবং সেমিনার লাইব্রেরির ইনচার্জ হিসেবে দায়িত্ব পালন করছেন। তাঁর আন্তরিক উদ্যোগে সেমিনার লাইব্রেরিতে উদ্ভিদবিজ্ঞানের সমৃদ্ধ গ্রন্থ, ল্যাব জার্নাল ও গবেষণা সাময়িকী সংযোজিত হয়েছে।',
  bioEn: 'Rehana Parvin is an Associate Professor and Seminar In-Charge in the Department of Botany, overseeing library collections, research archives, and student reading facilities.',
  messageBn: 'বিভাগীয় সেমিনার লাইব্রেরিতে সমৃদ্ধ বই, জার্নাল ও ডিজিটাল শিক্ষাসামগ্রী রয়েছে। নিয়মিত পড়াশোনা ও লাইব্রেরির সদ্ব্যবহারের মাধ্যমে শিক্ষার্থীদের জ্ঞান সমৃদ্ধ করতে আহ্বান জানাই।',
  messageEn: 'Our departmental seminar library houses valuable botanical literature and research journals.'
};

export const PAURASHAVA_GENERAL_SECRETARY_BIO = {
  nameBn: 'মো. মাহমুদুল হাসান',
  nameEn: 'Md. Mahmudul Hasan',
  titleBn: 'সহকারী অধ্যাপক ও স্টাডি ট্যুর কো-অর্ডিনেটর',
  titleEn: 'Assistant Professor & Study Tour Coordinator',
  ministryBn: 'উদ্ভিদবিজ্ঞান বিভাগ, জগন্নাথ বিশ্ববিদ্যালয়',
  ministryEn: 'Department of Botany, Jagannath University',
  bioBn: 'মো. মাহমুদুল হাসান উদ্ভিদবিজ্ঞান বিভাগের সহকারী অধ্যাপক হিসেবে কর্মরত। তিনি শিক্ষার্থীদের বার্ষিক বোটানিক্যাল এক্সকারশন, ফিল্ড ওয়ার্ক ও গবেষণামূলক কার্যক্রমের সফল সমন্বয়ক হিসেবে দায়িত্ব পালন করছেন।',
  bioEn: 'Md. Mahmudul Hasan is an Assistant Professor and coordinator for annual botanical excursions, fieldwork, and research programs in the Department of Botany.',
  messageBn: 'মাঠপর্যায়ের বোটানিক্যাল ফিল্ড এক্সকারশনের মাধ্যমে শিক্ষার্থীরা প্রকৃতির অপার উদ্ভিদ বৈচিত্র্য ও বাস্তুসংস্থান নিবিড়ভাবে অনুধাবন করতে পারে।',
  messageEn: 'Empirical botanical fieldwork and excursions enable students to observe and analyze real-world plant biodiversity directly.'
};

export const EMERGENCY_NUMBERS = [
  { code: '৩৩৩', labelBn: 'জাতীয় তথ্য বাতায়ন', labelEn: 'National Information Portal', icon: 'PhoneCall' },
  { code: '৯৯৯', labelBn: 'জরুরি সেবা (পুলিশ, অ্যাম্বুলেন্স, ফায়ার)', labelEn: 'National Emergency Services', icon: 'ShieldAlert' },
  { code: '১০৯', labelBn: 'নারী ও শিশু নির্যাতন প্রতিরোধ হেল্পলাইন', labelEn: 'Women & Children Helpline', icon: 'Users' },
  { code: '১০৬', labelBn: 'দুদক অভিযোগ কেন্দ্র', labelEn: 'Anti-Corruption Helpline', icon: 'AlertTriangle' },
  { code: '০২-৯৫১৫২৪২', labelBn: 'জগন্নাথ বিশ্ববিদ্যালয় হেল্পডেস্ক', labelEn: 'Jagannath University Helpdesk', icon: 'Phone' }
];

export interface GalleryImage {
  id: string;
  titleBn: string;
  titleEn: string;
  category: 'fieldwork' | 'seminar' | 'tour' | 'cultural' | 'campus' | 'sports' | 'reunion' | 'moments' | string;
  categoryBn: string;
  categoryEn: string;
  imageUrl: string;
  fbPostUrl?: string;
  date: string;
  locationBn: string;
  locationEn: string;
  descriptionBn: string;
  descriptionEn: string;
}

export const GALLERY_IMAGES: GalleryImage[] = [
  {
    id: 'botany-gallery-1',
    titleBn: 'উদ্ভিদবিজ্ঞান বিভাগ অ্যালামনাইদের স্মৃতিচারণ ও মিলনমেলা',
    titleEn: 'Botany Alumni Reunion & Memorable Moments',
    category: 'reunion',
    categoryBn: 'অ্যালামনাই মিলনমেলা',
    categoryEn: 'Alumni Reunion',
    imageUrl: 'https://mssalumni.org/wp-content/uploads/2026/09/WhatsApp-Image-2026-09-07-at-12.05.31-PM-1.jpeg',
    date: '০৭ সেপ্টেম্বর, ২০২৬',
    locationBn: 'জগন্নাথ বিশ্ববিদ্যালয় ক্যাম্পাস',
    locationEn: 'Jagannath University Campus',
    descriptionBn: 'জগন্নাথ বিশ্ববিদ্যালয় উদ্ভিদবিজ্ঞান বিভাগের প্রাক্তন শিক্ষার্থীদের সৌহার্দ্যপূর্ণ মিলনমেলা ও আনন্দঘন মুহূর্ত।',
    descriptionEn: 'Warm fellowship and memorable moments shared by the alumni of Department of Botany, Jagannath University.'
  },
  {
    id: 'botany-gallery-2',
    titleBn: 'বিভাগীয় প্রাঙ্গণে শিক্ষক ও প্রাক্তনীদের আন্তরিক আড্ডা',
    titleEn: 'Hearty Gathering of Faculty & Alumni at Department Campus',
    category: 'campus',
    categoryBn: 'ক্যাম্পাস ও স্মৃতি',
    categoryEn: 'Campus & Memories',
    imageUrl: 'https://mssalumni.org/wp-content/uploads/2026/09/WhatsApp-Image-2026-09-07-at-12.05.32-PM-1.jpeg',
    date: '০৭ সেপ্টেম্বর, ২০২৬',
    locationBn: 'উদ্ভিদবিজ্ঞান বিভাগ, জগন্নাথ বিশ্ববিদ্যালয়',
    locationEn: 'Department of Botany, Jagannath University',
    descriptionBn: 'উদ্ভিদবিজ্ঞান বিভাগের প্রিয় প্রাঙ্গণে শিক্ষক ও প্রাক্তনীদের প্রাণবন্ত উপস্থিতি ও স্মৃতিচারণ।',
    descriptionEn: 'Vibrant gathering and nostalgia among respected faculty and alumni at the department premises.'
  },
  {
    id: 'botany-gallery-3',
    titleBn: 'উদ্ভিদবিজ্ঞান পরিবারের প্রীতি সম্মিলন ও শুভেচ্ছা বিনিময়',
    titleEn: 'Botany Family Fellowship & Warm Exchange of Greetings',
    category: 'reunion',
    categoryBn: 'অ্যালামনাই মিলনমেলা',
    categoryEn: 'Alumni Reunion',
    imageUrl: 'https://mssalumni.org/wp-content/uploads/2026/09/WhatsApp-Image-2026-09-07-at-12.05.32-PM.jpeg',
    date: '০৭ সেপ্টেম্বর, ২০২৬',
    locationBn: 'জগন্নাথ বিশ্ববিদ্যালয়',
    locationEn: 'Jagannath University',
    descriptionBn: 'বিভাগের বিভিন্ন ব্যাচের প্রাক্তনীদের একত্রিত হওয়া এবং পারস্পরিক সৌহার্দ্য ও ভ্রাতৃত্বের মেলবন্ধন।',
    descriptionEn: 'Uniting alumni from various batches in a spirit of friendship, harmony, and mutual respect.'
  },
  {
    id: 'botany-gallery-4',
    titleBn: 'অ্যালামনাই অ্যাসোসিয়েশনের বিশেষ মুহূর্ত ও ফটোসেশন',
    titleEn: 'Special Moments & Photo Session of Alumni Association',
    category: 'moments',
    categoryBn: 'বিশেষ মুহূর্ত',
    categoryEn: 'Special Moments',
    imageUrl: 'https://mssalumni.org/wp-content/uploads/2026/09/WhatsApp-Image-2026-09-07-at-12.05.33-PM-2.jpeg',
    date: '০৭ সেপ্টেম্বর, ২০২৬',
    locationBn: 'জগন্নাথ বিশ্ববিদ্যালয় প্রাঙ্গণ',
    locationEn: 'Jagannath University Campus',
    descriptionBn: 'উদ্ভিদবিজ্ঞান বিভাগের সুদীর্ঘ ঐতিহ্য ও ভালোবাসার প্রতীক হয়ে থাকা এক অনন্য ফ্রেমের স্মৃতি।',
    descriptionEn: 'A timeless frame capturing the long-standing heritage and bonding of Botany alumni.'
  },
  {
    id: 'botany-gallery-5',
    titleBn: 'বিভাগীয় স্মৃতি ও প্রাক্তন বন্ধুদের পুনর্মিলনী উৎসব',
    titleEn: 'Departmental Reminiscence & Alumni Celebration',
    category: 'reunion',
    categoryBn: 'অ্যালামনাই মিলনমেলা',
    categoryEn: 'Alumni Reunion',
    imageUrl: 'https://mssalumni.org/wp-content/uploads/2026/09/WhatsApp-Image-2026-09-07-at-12.05.33-PM.jpeg',
    date: '০৭ সেপ্টেম্বর, ২০২৬',
    locationBn: 'জগন্নাথ বিশ্ববিদ্যালয়',
    locationEn: 'Jagannath University',
    descriptionBn: 'স্মৃতির ক্যাম্পাসে ফিরে আসা উদ্ভিদবিজ্ঞানীদের বাঁধভাঙা উল্লাস ও আনন্দঘন পরিবেশ।',
    descriptionEn: 'Unbounded joy and festive atmosphere as botanists return to their cherished campus.'
  },
  {
    id: 'botany-gallery-6',
    titleBn: 'উদ্ভিদবিজ্ঞান বিভাগ অ্যালামনাইদের বর্ণাঢ্য গ্রুপ ফটোসেশন',
    titleEn: 'Grand Group Photo Session of Botany Alumni',
    category: 'moments',
    categoryBn: 'বিশেষ মুহূর্ত',
    categoryEn: 'Special Moments',
    imageUrl: 'https://mssalumni.org/wp-content/uploads/2026/09/WhatsApp-Image-2026-09-07-at-12.06.46-PM.jpeg',
    date: '০৭ সেপ্টেম্বর, ২০২৬',
    locationBn: 'জগন্নাথ বিশ্ববিদ্যালয় ক্যাম্পাস',
    locationEn: 'Jagannath University Campus',
    descriptionBn: 'অ্যালামনাই অ্যাসোসিয়েশনের সকল সম্মানিত সদস্য ও সহপাঠীদের নিয়ে স্মরণীয় গ্রুপ ফটোসেশন।',
    descriptionEn: 'A memorable group photo session featuring respected members, faculty, and alumni.'
  }
];

export interface GalleryVideo {
  id: string;
  titleBn: string;
  titleEn: string;
  category: 'lecture' | 'documentary' | 'seminar' | 'cultural';
  categoryBn: string;
  categoryEn: string;
  thumbnailUrl: string;
  videoEmbedId: string;
  duration: string;
  date: string;
  speakerBn: string;
  speakerEn: string;
  descriptionBn: string;
  descriptionEn: string;
}

export const GALLERY_VIDEOS: GalleryVideo[] = [
  {
    id: 'v1',
    titleBn: 'জগন্নাথ বিশ্ববিদ্যালয়ের ইতিহাস ও উদ্ভিদবিজ্ঞান বিভাগের অবদান',
    titleEn: 'Heritage of Jagannath University & Contribution of Botany Dept',
    category: 'documentary',
    categoryBn: 'প্রামাণ্যচিত্র',
    categoryEn: 'Documentary',
    thumbnailUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80',
    videoEmbedId: 'dQw4w9WgXcQ',
    duration: '১৮:৪৫',
    date: '১০ ফেব্রুয়ারি, ২০২৬',
    speakerBn: 'প্রামাণ্যচিত্র ও শিক্ষক মণ্ডলী',
    speakerEn: 'Documentary Presentation & Faculty',
    descriptionBn: 'জগন্নাথ বিশ্ববিদ্যালয়ের ইতিহাস, ঐতিহ্য এবং উদ্ভিদবিজ্ঞান বিভাগের পাঠদান ও বোটানিক্যাল গবেষণার চিত্র নিয়ে বিশেষ প্রামাণ্যচিত্র।',
    descriptionEn: 'Special documentary capturing the rich academic heritage of Jagannath University and Botany Department.'
  },
  {
    id: 'v2',
    titleBn: 'উদ্ভিদ শারীরবিজ্ঞান ও জীববৈচিত্র্য সংরক্ষণ - বিশেষ একাডেমিক লেকচার',
    titleEn: 'Plant Physiology & Biodiversity Conservation - Academic Lecture',
    category: 'lecture',
    categoryBn: 'একাডেমিক লেকচার',
    categoryEn: 'Academic Lecture',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=800&q=80',
    videoEmbedId: 'L_LUpnjgPso',
    duration: '২৪:১৫',
    date: '১৫ জানুয়ারি, ২০২৬',
    speakerBn: 'ফারজানা ইয়াসমিন মিতা',
    speakerEn: 'Farhana Yasmin Mita',
    descriptionBn: 'উদ্ভিদবিজ্ঞানের মৌলিক গবেষণা ও বাংলাদেশের উদ্ভিদ বৈচিত্র্য সংরক্ষণ বিষয়ে বিভাগীয় প্রধানের বিশেষ বিশ্লেষণমূলক বক্তব্য।',
    descriptionEn: 'In-depth lecture on fundamental botanical research and biodiversity conservation in Bangladesh.'
  },
  {
    id: 'v3',
    titleBn: 'উদ্ভিদবিজ্ঞান বিভাগ নবীন বরণ ও সাংস্কৃতিক সন্ধ্যার মনোজ্ঞ পরিবেশনা',
    titleEn: 'Botany Freshers Welcome & Cultural Gala Performances',
    category: 'cultural',
    categoryBn: 'সাংস্কৃতিক অনুষ্ঠান',
    categoryEn: 'Cultural Event',
    thumbnailUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80',
    videoEmbedId: 'kJQP7kiw5Fk',
    duration: '১২:৩০',
    date: '২০ ডিসেম্বর, ২০২৫',
    speakerBn: 'উদ্ভিদবিজ্ঞান শিক্ষার্থী পরিষদ',
    speakerEn: 'Botany Students Forum',
    descriptionBn: 'উদ্ভিদবিজ্ঞান বিভাগের শিক্ষার্থীদের পরিবেশনায় লোকগীতি, আবৃত্তি, নাটক ও দেশাত্মবোধক গানের মনোজ্ঞ পরিবেশনা।',
    descriptionEn: 'Musical and theatrical cultural performances by the students of Department of Botany.'
  }
];

export interface NewsPost {
  id: string;
  titleBn: string;
  titleEn: string;
  category: 'academic' | 'seminar' | 'tour' | 'achievement';
  categoryBn: string;
  categoryEn: string;
  imageUrl: string;
  date: string;
  authorBn: string;
  authorEn: string;
  summaryBn: string;
  summaryEn: string;
  contentBn: string;
  contentEn: string;
  isFeatured: boolean;
  viewsCount: number;
}

export const NEWS_POSTS: NewsPost[] = [
  {
    id: 'news-research-lab',
    titleBn: 'উদ্ভিদবিজ্ঞান বিভাগে আধুনিক ডিজিটাল সেমিনার ও স্মার্ট রিসার্চ কর্নার উদ্বোধন',
    titleEn: 'Inauguration of Modern Digital Seminar & Smart Research Corner in Botany Dept',
    category: 'academic',
    categoryBn: 'একাডেমিক সংবাদ',
    categoryEn: 'Academic News',
    imageUrl: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=1000&q=80',
    date: '১০ আগস্ট, ২০২৬',
    authorBn: 'মিডিয়া ও তথ্য সেল, উদ্ভিদবিজ্ঞান বিভাগ',
    authorEn: 'Media & Info Cell, Dept. of Botany',
    summaryBn: 'জগন্নাথ বিশ্ববিদ্যালয়ের উদ্ভিদবিজ্ঞান বিভাগে শিক্ষার্থীদের আধুনিক গবেষণা ও ই-বুক ব্যবহারের জন্য ডিজিটাল সেমিনার ও স্মার্ট রিসার্চ কর্নার উদ্বোধন করা হয়েছে।',
    summaryEn: 'A modern digital seminar and smart research corner inaugurated for botany students to access digital archives and e-journals.',
    contentBn: `জগন্নাথ বিশ্ববিদ্যালয়ের উদ্ভিদবিজ্ঞান বিভাগে শিক্ষার্থীদের আধুনিক গবেষণা, আন্তর্জাতিক জার্নাল অধ্যয়ন ও ডেটা অ্যানালাইসিসের সুবিধার্থে একটি সুসজ্জিত ডিজিটাল সেমিনার ও স্মার্ট রিসার্চ কর্নার উদ্বোধন করা হয়েছে।

উদ্বোধনী অনুষ্ঠানে প্রধান অতিথি হিসেবে উপস্থিত ছিলেন সম্মানিত উপাচার্য প্রফেসর মো. আমান উল্লাহ। বিশেষ অতিথি হিসেবে বক্তব্য রাখেন উপ-উপাচার্য প্রফেসর নুরুল ইসলাম। অনুষ্ঠানে সভাপতিত্ব করেন উদ্ভিদবিজ্ঞান বিভাগের প্রধান ফারজানা ইয়াসমিন মিতা।

উপাচার্য মহোদয় বলেন, "একবিংশ শতাব্দীর চ্যালেঞ্জ মোকাবেলায় উদ্ভিদবিজ্ঞানের শিক্ষার্থীদের তথ্যপ্রযুক্তি জ্ঞান ও গবেষণার দক্ষতা অর্জন অপরিহার্য। এই রিসার্চ কর্নার তাঁদের গবেষণায় প্রভূত সহায়তা করবে।" অনুষ্ঠানে বিভাগের শিক্ষক ও শিক্ষার্থীরা উপস্থিত ছিলেন।`,
    contentEn: `A modern digital seminar and smart research corner was officially inaugurated at the Department of Botany, Jagannath University, Dhaka, to empower students with data analysis and e-journal access. Vice-Chancellor Prof. Md. Aman Ullah graced the event as the chief guest.`,
    isFeatured: true,
    viewsCount: 3840
  },
  {
    id: 'news-fieldwork-2026',
    titleBn: 'অনার্স ৪র্থ বর্ষের শিক্ষার্থীদের উদ্ভিদবিজ্ঞান বোটানিক্যাল ফিল্ড এক্সকারশন ২০২৬ সফলভাবে সম্পন্ন',
    titleEn: 'Honours 4th Year Botanical Excursion 2026 Completed Successfully',
    category: 'tour',
    categoryBn: 'ফিল্ড ওয়ার্ক',
    categoryEn: 'Field Work',
    imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1000&q=80',
    date: '০২ আগস্ট, ২০২৬',
    authorBn: 'স্টাডি ট্যুর ও গবেষণা কমিটি',
    authorEn: 'Study Tour & Research Committee',
    summaryBn: 'উদ্ভিদ বৈচিত্র্য, বোটানিক্যাল নমুনা ও বাস্তুসংস্থানের ওপর উদ্ভিদবিজ্ঞান ৪র্থ বর্ষের ফিল্ড রিসার্চ সম্পন্ন হয়েছে।',
    summaryEn: 'Honours 4th-year students successfully completed empirical botanical field research on plant diversity and ecosystem.',
    contentBn: `উদ্ভিদবিজ্ঞান বিভাগের বিএসসি (সম্মান) ৪র্থ বর্ষের শিক্ষার্থীদের বাধ্যতামূলক ফিল্ড এক্সকারশন ও মনোগ্রাফ প্রণয়নের অংশ হিসেবে সরেজমিনে জরিপ কার্যক্রম সফলভাবে সম্পন্ন হয়েছে।

শিক্ষার্থীরা বিভিন্ন দলে বিভক্ত হয়ে বিভিন্ন উদ্ভিদের নমুনা সংগ্রহ, হ্যার্বেরিয়াম প্রস্তুতকরণ এবং স্থানীয় উদ্ভিদ বাস্তুসংস্থান বিষয়ে কাজ করেন। বিভাগের সহকারী অধ্যাপক মো. মাহমুদুল হাসান এবং অন্যান্য শিক্ষকবৃন্দ সার্বিক ফিল্ড তত্ত্বাবধান করেন।`,
    contentEn: `Students of BSc (Honours) 4th Year carried out extensive botanical field exploration as part of their monograph requirement.`,
    isFeatured: false,
    viewsCount: 2190
  },
  {
    id: 'news-freshers-orientation',
    titleBn: 'উদ্ভিদবিজ্ঞান বিভাগে নবাগত অনার্স ১ম বর্ষ শিক্ষার্থীদের জমকালো ওরিয়েন্টেশন ও ক্লাস সূচনা',
    titleEn: 'Grand Orientation & Commencement of Classes for Honours 1st Year Students',
    category: 'academic',
    categoryBn: 'একাডেমিক',
    categoryEn: 'Academic',
    imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1000&q=80',
    date: '২০ জুলাই, ২০২৬',
    authorBn: 'বিভাগীয় অফিস',
    authorEn: 'Department Office',
    summaryBn: '২০২৪-২০২৫ শিক্ষাবর্ষে মেধা তালিকায় উদ্ভিদবিজ্ঞান বিভাগে ভর্তিকৃত নবীন শিক্ষার্থীদের ফুল দিয়ে বরণ ও একাডেমিক পরিচিতি অনুষ্ঠিত হয়েছে।',
    summaryEn: 'Newly admitted honours 1st-year students were warmly welcomed with flowers and an academic curriculum briefing.',
    contentBn: `জগন্নাথ বিশ্ববিদ্যালয়ের উদ্ভিদবিজ্ঞান বিভাগে ২০২৪-২০২৫ শিক্ষাবর্ষের অনার্স ১ম বর্ষের নবাগত শিক্ষার্থীদের ওরিয়েন্টেশন ক্লাস অনুষ্ঠিত হয়েছে। অনুষ্ঠানে শিক্ষার্থীদের বিভাগের সমৃদ্ধ ঐতিহ্য, নিয়মশৃঙ্খলা, সেমিনার লাইব্রেরি ব্যবহার ও পরীক্ষা পদ্ধতি সম্পর্কে বিস্তারিত অবহিত করা হয়।`,
    contentEn: `The Department of Botany at Jagannath University held its orientation for newly admitted students, outlining academic disciplines, seminar facilities, and study pathways.`,
    isFeatured: false,
    viewsCount: 1750
  }
];

export interface EServiceItem {
  id: string;
  titleBn: string;
  titleEn: string;
  descBn: string;
  descEn: string;
  icon: string;
  link: string;
}

export const E_SERVICES: EServiceItem[] = [
  {
    id: 'eservice-membership',
    titleBn: 'সদস্য নিবন্ধন',
    titleEn: 'Member Registration',
    descBn: 'আজীবন ও সাধারণ সদস্যপদের অনলাইন রেজিস্ট্রেশন।',
    descEn: 'Online registration for lifetime and general alumni membership.',
    icon: 'CreditCard',
    link: '#membership'
  },
  {
    id: 'eservice-directory',
    titleBn: 'নিবন্ধিত অ্যালামনাই ডিরেক্টরি',
    titleEn: 'Registered Alumni Directory',
    descBn: 'বিভাগীয় প্রাক্তন গ্র্যাজুয়েটদের ব্যাচভিত্তিক ডিরেক্টরি ও যোগাযোগ পোর্টাল।',
    descEn: 'Batch-wise directory and networking portal for botany alumni graduates.',
    icon: 'FileText',
    link: '#members-list'
  },
  {
    id: 'eservice-library',
    titleBn: 'সেমিনার ডিজিটাল লাইব্রেরি',
    titleEn: 'Digital Seminar Library',
    descBn: 'অনলাইন ই-বুক ক্যাটালগ, উদ্ভিদবিজ্ঞান জার্নাল ও গবেষণা মনোগ্রাফ আর্কাইভ।',
    descEn: 'Online e-book catalogue, botany journals, and research monograph archives.',
    icon: 'Zap',
    link: '#seminar'
  },
  {
    id: 'eservice-stipend',
    titleBn: 'অ্যালামনাই শিক্ষা বৃত্তি ও কল্যাণ তহবিল',
    titleEn: 'Alumni Scholarship & Welfare Fund',
    descBn: 'মেধাবী ও অসচ্ছল শিক্ষার্থীদের জন্য অ্যালামনাই ট্রাস্ট বৃত্তির আবেদন।',
    descEn: 'Application for Alumni Trust scholarships for meritorious and underprivileged students.',
    icon: 'HeartHandshake',
    link: '#membership'
  },
  {
    id: 'eservice-nu-results',
    titleBn: 'জাতীয় বিশ্ববিদ্যালয় ফলাফল বাতায়ন',
    titleEn: 'NU Exam Results Portal',
    descBn: 'অনার্স ও মাস্টার্স নিয়মিত ও মানোন্নয়ন পরীক্ষার ফলাফল অনুসন্ধান।',
    descEn: 'Search results for Honours and Masters examinations of National University.',
    icon: 'PieChart',
    link: 'http://results.nu.ac.bd'
  },
  {
    id: 'eservice-certificate',
    titleBn: 'অ্যালামনাই আইডি ও প্রশংসাপত্র',
    titleEn: 'Alumni ID & Testimonial Desk',
    descBn: 'ডিজিটাল অ্যালামনাই সদস্য কার্ড, প্রত্যয়নপত্র ও প্রশংসাপত্র প্রাপ্তি।',
    descEn: 'Digital alumni membership card, testimonials, and department verification.',
    icon: 'Calculator',
    link: '#membership'
  }
];

