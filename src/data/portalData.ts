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
  imageUrl?: string;
  pdfUrl?: string;
  pdfFileName?: string;
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
      { titleBn: 'লক্ষ্য ও উদ্দেশ্য', titleEn: 'Mission & Objectives', href: '#mission-vision' }
    ]
  },
  {
    titleBn: 'কার্যনির্বাহী ও আহ্বায়ক কমিটি',
    titleEn: 'Executive & Convening Committees',
    href: '#leadership',
    children: [
      { titleBn: '১ম কার্যনির্বাহী কমিটি (২০২৪-২৬)', titleEn: '1st Executive Committee (2024-26)', href: '#executive-committee' },
      { titleBn: '২য় আহ্বায়ক কমিটি (২০২৪)', titleEn: '2nd Convening Committee (2024)', href: '#2nd-convening-committee' },
      { titleBn: '১ম আহ্বায়ক কমিটি (২০১৭)', titleEn: '1st Convening Committee (2017)', href: '#1st-convening-committee' }
    ]
  },
  {
    titleBn: 'সদস্য নিবন্ধন',
    titleEn: 'Member Registration',
    href: '#membership'
  },
  {
    titleBn: 'সদস্য',
    titleEn: 'Registered Alumni Directory',
    href: '#members-list'
  },
  {
    titleBn: 'ব্লাড কর্ণার',
    titleEn: 'Blood Corner',
    href: '#blood-corner'
  },
  {
    titleBn: 'চাকরি নিউজ',
    titleEn: 'Job News',
    href: '#job-news'
  },
  {
    titleBn: 'ডোনেশন',
    titleEn: 'Donation',
    href: '#donation',
    children: [
      { titleBn: 'সদস্য নবায়ন ফি', titleEn: 'Membership Renewal Fee', href: '#donation-renewal' },
      { titleBn: 'Reunion (পুনর্মিলনী অনুদান)', titleEn: 'Reunion Donation', href: '#donation-reunion' },
      { titleBn: 'Iftar (ইফতার মাহফিল অনুদান)', titleEn: 'Iftar Mahfil Donation', href: '#donation-iftar' },
      { titleBn: 'Zakat (যাকাত তহবিল)', titleEn: 'Zakat Fund Donation', href: '#donation-zakat' },
      { titleBn: 'Others (অন্যান্য অনুদান)', titleEn: 'Others / General Donation', href: '#donation-others' }
    ]
  }
];

export const NOTICES_DATA: NoticeItem[] = [];

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
  messageBn: 'উদ্ভিদবিজ্ঞান বিভাগ অ্যালামনাই অ্যাসোসিয়েশনের সকল সম্মানিত সদস্য, শিক্ষকবৃন্দ ও প্রিয় শিক্ষার্থীদের আন্তরিক শুভেচ্ছা। আমাদের জগন্নাথ কলেজ ও জগন্নাথ বিশ্ববিদ্যালয়ের সকল অ্যালামনাইদের সৌহার্দ্যপূর্ণ ঐক্য, পারস্পরিক সহযোগিতা ও ঐতিহ্য ধরে রাখতে আমরা একসাথে কাজ করে যাব।',
  messageEn: 'Warm greetings to all esteemed members, faculty, and dear students of the Botany Alumni Association. We will work together to uphold cordial unity, mutual collaboration, and the rich legacy of all alumni of Jagannath College and Jagannath University.',
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
  phone: '+880 1795-186813',
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
  batchBn: '১০ম ব্যাচ',
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

export interface CommitteeMember {
  id: string;
  nameBn: string;
  nameEn: string;
  designationBn: string;
  designationEn: string;
  batchBn?: string;
  batchEn?: string;
  sessionBn?: string;
  sessionEn?: string;
  organizationBn?: string;
  organizationEn?: string;
  phone?: string;
  email?: string;
  photoUrl?: string;
  roleType?: 'chief' | 'president' | 'vice_president' | 'secretary' | 'treasurer' | 'joint_secretary' | 'organizing' | 'member' | 'convenor' | 'joint_convenor' | 'member_secretary';
  locationBn?: string;
  locationEn?: string;
  bloodGroup?: string;
}

export const EXECUTIVE_COMMITTEE_LIST: CommitteeMember[] = [
  // ১. সভাপতি (১)
  {
    id: 'ec-1',
    nameBn: 'মোঃ আব্দুর রাজ্জাক',
    nameEn: 'Md. Abdur Razzak',
    designationBn: 'সভাপতি',
    designationEn: 'President',
    batchBn: '১ম ব্যাচ',
    batchEn: '1st Batch',
    sessionBn: '২০০৫-২০০৬',
    sessionEn: '2005-2006',
    phone: '০১৭১০-৫৯৫১২৯',
    email: 'razzak90jnu.bd@gmail.com',
    photoUrl: 'https://mssalumni.org/wp-content/uploads/2026/09/WhatsApp-Image-2026-09-08-at-4.52.45-PM.jpeg',
    roleType: 'president'
  },
  // ২. সহ সভাপতি (৪)
  {
    id: 'ec-vp-1',
    nameBn: 'মোঃ শামসুল আলম',
    nameEn: 'Md. Samsul Alom',
    designationBn: 'সহ-সভাপতি',
    designationEn: 'Vice President',
    batchBn: '১ম ব্যাচ',
    batchEn: '1st Batch',
    sessionBn: '২০০৫-২০০৬',
    sessionEn: '2005-2006',
    phone: '০১৭১৯-৪১৭৬০২',
    email: 'samsul.ju1st@gmail.com',
    photoUrl: '/samsul.jpeg',
    roleType: 'vice_president'
  },
  {
    id: 'ec-vp-2-omar',
    nameBn: 'মোঃ ওমর ফারুক',
    nameEn: 'Md. Omar Faruk',
    designationBn: 'সহ-সভাপতি',
    designationEn: 'Vice President',
    batchBn: '৩য় ব্যাচ',
    batchEn: '3rd Batch',
    sessionBn: '২০০৭-২০০৮',
    sessionEn: '2007-2008',
    roleType: 'vice_president'
  },
  {
    id: 'ec-vp-3',
    nameBn: 'মোঃ রাকিব হাসান',
    nameEn: 'MD Rakib Hasan',
    designationBn: 'সহ-সভাপতি',
    designationEn: 'Vice President',
    batchBn: '৭ম ব্যাচ',
    batchEn: '7th Batch',
    sessionBn: '২০১১-২০১২',
    sessionEn: '2011-2012',
    phone: '০১৫১৭১৪৯৭১১',
    email: 'octopaulrakibhasan@gmail.com',
    photoUrl: '/rakib.jpeg',
    roleType: 'vice_president'
  },
  {
    id: 'ec-vp-2',
    nameBn: 'আবদুল্লাহ আল সাঈদ মজুমদার',
    nameEn: 'Abdullah Al Sayed Mazumder',
    designationBn: 'সহ-সভাপতি',
    designationEn: 'Vice President',
    batchBn: '৭ম ব্যাচ',
    batchEn: '7th Batch',
    sessionBn: '২০১১-২০১২',
    sessionEn: '2011-2012',
    phone: '০১৮১২৯০৬২৯৭',
    email: 'mithu.abdullah55@gmail.com',
    photoUrl: '/al.jpeg',
    roleType: 'vice_president'
  },
  // ৩. সাধারণ সম্পাদক (১)
  {
    id: 'ec-2',
    nameBn: 'মোঃ মেহেদী হাসান',
    nameEn: 'Md. Mehedi Hasan',
    designationBn: 'সাধারণ সম্পাদক',
    designationEn: 'General Secretary',
    batchBn: '৭ম ব্যাচ',
    batchEn: '7th Batch',
    sessionBn: '২০১০-২০১১',
    sessionEn: '2010-2011',
    phone: '+880 1795-186813',
    email: 'mehedihasanbotn019@gmail.com',
    photoUrl: 'https://mssalumni.org/wp-content/uploads/2026/09/WhatsApp-Image-2026-09-08-at-4.56.31-PM.jpeg',
    roleType: 'secretary'
  },
  // ৪. যুগ্ম সাধারণ সম্পাদক (২)
  {
    id: 'ec-js-1',
    nameBn: 'মো. আব্দুল জব্বার জায়েদ',
    nameEn: 'Md. Abdul Jabbar Zayed',
    designationBn: 'যুগ্ম সাধারণ সম্পাদক',
    designationEn: 'Joint General Secretary',
    batchBn: '৯ম ব্যাচ',
    batchEn: '9th Batch',
    sessionBn: '২০১২-২০১৩',
    sessionEn: '2012-2013',
    phone: '০১৫২১-২০৮৩১৩',
    email: 'jayedjnu.bot09@gmail.com',
    photoUrl: '/images/executive/jobbar.jpeg',
    roleType: 'joint_secretary'
  },
  {
    id: 'ec-js-2',
    nameBn: 'মোঃ তানভীর আহসান',
    nameEn: 'Md. Tanvir Ahsan',
    designationBn: 'যুগ্ম সাধারণ সম্পাদক',
    designationEn: 'Joint General Secretary',
    batchBn: '১১তম ব্যাচ',
    batchEn: '11th Batch',
    sessionBn: '২০১৪-২০১৫',
    sessionEn: '2014-2015',
    phone: '০১৮৮৬-৯০৯৫০০',
    email: 'tanvirahsan1996@gmail.com',
    photoUrl: '/images/executive/tanvir.jpeg',
    roleType: 'joint_secretary'
  },
  // ৫. কোষাধ্যক্ষ (১)
  {
    id: 'ec-3',
    nameBn: 'মো: ময়নুল হোসাইন সাকের',
    nameEn: 'Md. Moinul Hossain Shaker',
    designationBn: 'কোষাধ্যক্ষ',
    designationEn: 'Treasurer',
    batchBn: '১০ম ব্যাচ',
    batchEn: '10th Batch',
    sessionBn: '২০১৪-২০১৫',
    sessionEn: '2014-2015',
    phone: '০১৫৫৭-৭৬৬৯৩৩',
    email: 'shaker.jnu@gmail.com',
    photoUrl: '/tresure.jpeg',
    roleType: 'treasurer'
  },
  // ৬. সহ-কোষাধ্যক্ষ (১)
  {
    id: 'ec-asst-tres',
    nameBn: 'মো: আসাদুজ্জামান',
    nameEn: 'Md. Asaduzzaman',
    designationBn: 'সহ-কোষাধ্যক্ষ',
    designationEn: 'Assistant Treasurer',
    batchBn: '১২তম ব্যাচ',
    batchEn: '12th Batch',
    sessionBn: '২০১৫-২০১৬',
    sessionEn: '2015-2016',
    locationBn: 'রাজশাহী',
    locationEn: 'Rajshahi',
    bloodGroup: 'B+',
    phone: '০১৭৮৬-৭৩৮৬৬৮',
    email: 'raju00002015@gmail.com',
    photoUrl: '/images/executive/asad.jpeg',
    roleType: 'treasurer'
  },
  // ৭. সাংগঠনিক সম্পাদক (১)
  {
    id: 'ec-org-1',
    nameBn: 'গিয়াস উদ্দিন',
    nameEn: 'Gias Uddin',
    designationBn: 'সাংগঠনিক সম্পাদক',
    designationEn: 'Organizing Secretary',
    batchBn: '৫ম ব্যাচ',
    batchEn: '5th Batch',
    sessionBn: '২০০৯-২০১০',
    sessionEn: '2009-2010',
    phone: '+৮৮০ ১৮৬৬-৪৪০৬৭০',
    email: 'kobigiasmohon@gmail.com',
    photoUrl: '/images/executive/gias.jpeg',
    roleType: 'organizing'
  },
  // ৮. সহ-সাংগঠনিক সম্পাদক (১)
  {
    id: 'ec-asst-org-1',
    nameBn: 'মনিরুজ্জামান মনির',
    nameEn: 'Moniruzzaman Monir',
    designationBn: 'সহ-সাংগঠনিক সম্পাদক',
    designationEn: 'Assistant Organizing Secretary',
    batchBn: '১৩তম ব্যাচ',
    batchEn: '13th Batch',
    sessionBn: '২০১৭-২০১৮',
    sessionEn: '2017-2018',
    locationBn: 'ঢাকা',
    locationEn: 'Dhaka',
    bloodGroup: 'O+',
    phone: '০১৯১৯-১০৭৪৮০',
    email: 'themonir260@gmail.com',
    photoUrl: '/images/executive/monir.jpeg',
    roleType: 'organizing'
  },
  // ৯. দপ্তর সম্পাদক (১)
  {
    id: 'ec-office-1',
    nameBn: 'মো. সালমান হাজরা',
    nameEn: 'Md. Salman Hazra',
    designationBn: 'দপ্তর সম্পাদক',
    designationEn: 'Office Secretary',
    batchBn: '৭ম ব্যাচ',
    batchEn: '7th Batch',
    sessionBn: '২০১১-২০১২',
    sessionEn: '2011-2012',
    locationBn: 'ঢাকা',
    locationEn: 'Dhaka',
    bloodGroup: 'O+',
    phone: '০১৭৬২-৪৫১০৭৬',
    email: 'salmanhazra7@gmail.com',
    photoUrl: '/images/executive/salman.jpeg',
    roleType: 'organizing'
  },
  // ১০. আন্তর্জাতিক সম্পাদক (১)
  {
    id: 'ec-intl-1',
    nameBn: 'সঞ্জয় দাস',
    nameEn: 'Sanjay Das',
    designationBn: 'আন্তর্জাতিক সম্পাদক',
    designationEn: 'International Secretary',
    batchBn: '১ম ব্যাচ',
    batchEn: '1st Batch',
    sessionBn: '২০০৪-২০০৫',
    sessionEn: '2004-2005',
    email: 'sanjaydas.ju@gmail.com',
    photoUrl: '/images/executive/sanjay.jpeg',
    roleType: 'organizing'
  },
  // ১১. প্রচার, প্রকাশনা ও জনসংযোগ সম্পাদক (১)
  {
    id: 'ec-pub-1',
    nameBn: 'মো: জুনায়েদ হোসেন',
    nameEn: 'Md. Junayed Hossain',
    designationBn: 'প্রচার, প্রকাশনা ও জনসংযোগ সম্পাদক',
    designationEn: 'Publicity, Publication & PR Secretary',
    batchBn: '৫ম ব্যাচ',
    batchEn: '5th Batch',
    sessionBn: '২০০৯-২০১০',
    sessionEn: '2009-2010',
    phone: '০১৬৮৩-৮৯৬৯৯৮',
    email: 'hmdjunayed@gmail.com',
    photoUrl: '/images/executive/jubayed.jpeg',
    roleType: 'organizing'
  },
  // ১২. শিক্ষা ও সমাজকল্যাণ সম্পাদক (১)
  {
    id: 'ec-edu-1',
    nameBn: 'ফারুক আহমেদ সুমন',
    nameEn: 'Faruk Ahmed Suman',
    designationBn: 'শিক্ষা ও সমাজকল্যাণ সম্পাদক',
    designationEn: 'Education & Social Welfare Secretary',
    batchBn: '৮ম ব্যাচ',
    batchEn: '8th Batch',
    sessionBn: '২০১২-২০১৩',
    sessionEn: '2012-2013',
    bloodGroup: 'O+',
    phone: '01703388822',
    email: 'ahmedsumonjnu@gmail.com',
    photoUrl: '/images/executive/sumon.jpeg',
    roleType: 'organizing'
  },
  // ১৩. তথ্যপ্রযুক্তি সম্পাদক (১)
  {
    id: 'ec-it-1',
    nameBn: 'মো: শাহাদাৎ হোসেন',
    nameEn: 'Md. Shahadat Hossain',
    designationBn: 'তথ্যপ্রযুক্তি সম্পাদক',
    designationEn: 'Information Technology Secretary',
    batchBn: '৭ম ব্যাচ',
    batchEn: '7th Batch',
    sessionBn: '২০১১-২০১২',
    sessionEn: '2011-2012',
    phone: '০১৬৭৪-৭৫১৬৫৯',
    email: 'shahadatanik.jnu@gmail.com',
    photoUrl: '/images/executive/onik.jpeg',
    roleType: 'organizing'
  },
  // ১৪. ক্রীড়া ও সাংস্কৃতিক সম্পাদক (১)
  {
    id: 'ec-sports-1',
    nameBn: 'সৈয়দ আসিফ হাসান',
    nameEn: 'Syed Asif Hasan',
    designationBn: 'ক্রীড়া ও সাংস্কৃতিক সম্পাদক',
    designationEn: 'Sports & Cultural Secretary',
    batchBn: '১১তম ব্যাচ',
    batchEn: '11th Batch',
    sessionBn: '২০১৫-২০১৬',
    sessionEn: '2015-2016',
    phone: '০১৫৭১-৪৪৩৮৯৮',
    email: 'asif.bot.jnu@gmail.com',
    photoUrl: '/images/executive/asif.jpeg',
    roleType: 'organizing'
  },
  // ১৫. সদস্য / কার্যনির্বাহী সদস্য
  {
    id: 'ec-mem-2',
    nameBn: 'মো: মাঈদুল ইসলাম',
    nameEn: 'Md. Maidul Islam',
    designationBn: 'কার্যনির্বাহী সদস্য',
    designationEn: 'Executive Member',
    batchBn: '১ম ব্যাচ',
    batchEn: '1st Batch',
    sessionBn: '২০০৫-২০০৬',
    sessionEn: '2005-2006',
    phone: '০১৭২২-৯৪৯১৪৩',
    email: 'razu592@gmail.com',
    photoUrl: '/images/executive/maidul.jpeg',
    roleType: 'member'
  },
  {
    id: 'ec-mem-3',
    nameBn: 'মোঃ হাসানুল বান্না',
    nameEn: 'Md. Hasanul Banna',
    designationBn: 'কার্যনির্বাহী সদস্য',
    designationEn: 'Executive Member',
    batchBn: '১ম ব্যাচ',
    batchEn: '1st Batch',
    sessionBn: '২০০৫-২০০৬',
    sessionEn: '2005-2006',
    phone: '০১৭১০-৫৭৮০৫৬',
    email: 'h.b.chapal1988@gmail.com',
    photoUrl: '/images/executive/banna.jpeg',
    roleType: 'member'
  },
  {
    id: 'ec-mem-3b',
    nameBn: 'মোঃ মেহেদী হাসান',
    nameEn: 'Md. Mehedi Hasan',
    designationBn: 'কার্যনির্বাহী সদস্য',
    designationEn: 'Executive Member',
    batchBn: '১ম ব্যাচ',
    batchEn: '1st Batch',
    sessionBn: '২০০৫-২০০৬',
    sessionEn: '2005-2006',
    phone: '+৮৮০ ১৮৬৭-০৭৫৭৭৫',
    email: 'mehedihasanfp13@gmail.com',
    photoUrl: '/images/executive/mehedi.jpeg',
    roleType: 'member'
  },
  {
    id: 'ec-mem-1',
    nameBn: 'আমেনা কিবরিয়া',
    nameEn: 'Amena Kibria',
    designationBn: 'কার্যনির্বাহী সদস্য',
    designationEn: 'Executive Member',
    batchBn: '১ম ব্যাচ',
    batchEn: '1st Batch',
    sessionBn: '২০০৫-২০০৬',
    sessionEn: '2005-2006',
    phone: '০১৭৬৭-৭৯৫০১০',
    email: 'amenakibriamishu@gmail.com',
    photoUrl: '/images/executive/amena.jpeg',
    roleType: 'member'
  },
  {
    id: 'ec-mem-2nd-1',
    nameBn: 'লিও এনামুল হক',
    nameEn: 'Leo Enamul Haque',
    designationBn: 'কার্যনির্বাহী সদস্য',
    designationEn: 'Executive Member',
    batchBn: '২য় ব্যাচ',
    batchEn: '2nd Batch',
    sessionBn: '২০০৬-২০০৭',
    sessionEn: '2006-2007',
    phone: '+৮৮০ ১৯২১-৪১৩৯৭০',
    photoUrl: '/images/executive/leo.jpeg',
    roleType: 'member'
  },
  {
    id: 'ec-mem-3rd-1',
    nameBn: 'মেঘলা সাহা পিংকি',
    nameEn: 'Meghla Saha Pinky',
    designationBn: 'কার্যনির্বাহী সদস্য',
    designationEn: 'Executive Member',
    batchBn: '৩য় ব্যাচ',
    batchEn: '3rd Batch',
    sessionBn: '২০০৭-২০০৮',
    sessionEn: '2007-2008',
    organizationBn: 'বিভাগীয় শিক্ষক, উদ্ভিদবিজ্ঞান বিভাগ, জবি',
    organizationEn: 'Faculty Member, Dept. of Botany, JnU',
    phone: '+৮৮০ ১৭৯৬-৫৩৩৬৭৮',
    photoUrl: '/images/executive/pinky.jpeg',
    roleType: 'member'
  },
  {
    id: 'ec-mem-5',
    nameBn: 'মো: সোহেল রানা',
    nameEn: 'Md. Sohel Rana',
    designationBn: 'কার্যনির্বাহী সদস্য',
    designationEn: 'Executive Member',
    batchBn: '৯ম ব্যাচ',
    batchEn: '9th Batch',
    sessionBn: '২০১৩-২০১৪',
    sessionEn: '2013-2014',
    phone: '০১৭২৩-১১৩৬৬৮',
    email: 'sohelrana113668@gmail.com',
    photoUrl: '/images/executive/rana.jpeg',
    roleType: 'member'
  },
  {
    id: 'ec-mem-4',
    nameBn: 'মো: মাহফুজুর রহমান',
    nameEn: 'Md. Mahfuzur Rahman',
    designationBn: 'কার্যনির্বাহী সদস্য',
    designationEn: 'Executive Member',
    batchBn: '৯ম ব্যাচ',
    batchEn: '9th Batch',
    sessionBn: '২০১৩-২০১৪',
    sessionEn: '2013-2014',
    phone: '০১৯৯৫-৫৬০৭০৮',
    email: 'mahfuz.rahman94@gmail.com',
    photoUrl: '/images/executive/mahfuz.jpeg',
    roleType: 'member'
  },
  {
    id: 'ec-mem-sifat',
    nameBn: 'আহমেদ সিফাত চৌধুরী',
    nameEn: 'Ahmed Sifat Chowdhury',
    designationBn: 'কার্যনির্বাহী সদস্য',
    designationEn: 'Executive Member',
    batchBn: '১০ম ব্যাচ',
    batchEn: '10th Batch',
    sessionBn: '২০১৪-২০১৫',
    sessionEn: '2014-2015',
    roleType: 'member'
  },
  {
    id: 'ec-mem-6',
    nameBn: 'মো: রওনক আজাদ',
    nameEn: 'Md. Rownok Azad',
    designationBn: 'কার্যনির্বাহী সদস্য',
    designationEn: 'Executive Member',
    batchBn: '১০ম ব্যাচ',
    batchEn: '10th Batch',
    sessionBn: '২০১৪-২০১৫',
    sessionEn: '2014-2015',
    locationBn: 'মিরপুর-১, ঢাকা',
    locationEn: 'Mirpur-1, Dhaka',
    bloodGroup: 'B+',
    phone: '০১৭৭৬-৫৯৫৫১৯',
    email: 'rownok15@gmail.com',
    photoUrl: '/images/executive/azad.jpeg',
    roleType: 'member'
  },
  {
    id: 'ec-mem-7',
    nameBn: 'মো: অনিক মিয়া',
    nameEn: 'Md. Anik Mia',
    designationBn: 'কার্যনির্বাহী সদস্য',
    designationEn: 'Executive Member',
    batchBn: '১১তম ব্যাচ',
    batchEn: '11th Batch',
    sessionBn: '২০১৫-২০১৬',
    sessionEn: '2015-2016',
    phone: '০১৭৭১-০৩৮২৯৯',
    email: 'anikmia1998@gmail.com',
    photoUrl: '/images/executive/anik.jpeg',
    roleType: 'member'
  },
  {
    id: 'ec-mem-8',
    nameBn: 'কাজী বাইজীদ',
    nameEn: 'Kazi Baized',
    designationBn: 'কার্যনির্বাহী সদস্য',
    designationEn: 'Executive Member',
    batchBn: '১১তম ব্যাচ',
    batchEn: '11th Batch',
    sessionBn: '২০১৫-২০১৬',
    sessionEn: '2015-2016',
    phone: '০১৮৪০-৭৩১২০৩',
    email: 'kazibaized1997@gmail.com',
    photoUrl: '/images/executive/baized.jpeg',
    roleType: 'member'
  },
  {
    id: 'ec-mem-9',
    nameBn: 'মো: ইসমাইল হোসেন',
    nameEn: 'Md. Ismail Hossain',
    designationBn: 'কার্যনির্বাহী সদস্য',
    designationEn: 'Executive Member',
    batchBn: '১৩তম ব্যাচ',
    batchEn: '13th Batch',
    sessionBn: '২০১৭-২০১৮',
    sessionEn: '2017-2018',
    locationBn: 'টাঙ্গাইল সদর',
    locationEn: 'Tangail Sadar',
    bloodGroup: 'A+',
    phone: '০১৬৭৯-৪৩১০৯৩',
    email: 'ismailahmed01732@gmail.com',
    photoUrl: '/images/executive/ismail.jpeg',
    roleType: 'member'
  },
  {
    id: 'ec-mem-11',
    nameBn: 'ফয়সাল আহামেদ',
    nameEn: 'Faisal Ahmed',
    designationBn: 'কার্যনির্বাহী সদস্য',
    designationEn: 'Executive Member',
    batchBn: '১৩তম ব্যাচ',
    batchEn: '13th Batch',
    sessionBn: '২০১৭-২০১৮',
    sessionEn: '2017-2018',
    phone: '০১৫২১-২৩৪৮৬৬',
    email: 'amifaisalahmed000@gmail.com',
    photoUrl: '/images/executive/faisal.jpeg',
    roleType: 'member'
  },
  {
    id: 'ec-mem-10',
    nameBn: 'মোঃ সাইদুল ইসলাম',
    nameEn: 'Md. Saidul Islam',
    designationBn: 'কার্যনির্বাহী সদস্য',
    designationEn: 'Executive Member',
    batchBn: '১৩তম ব্যাচ',
    batchEn: '13th Batch',
    sessionBn: '২০১৭-২০১৮',
    sessionEn: '2017-2018',
    locationBn: 'টাঙ্গাইল',
    locationEn: 'Tangail',
    bloodGroup: 'AB+',
    phone: '০১৬৪৩-৩৫৯১৯৯',
    email: 'khondokarsaidul464@gmail.com',
    photoUrl: '/images/executive/saidul.jpeg',
    roleType: 'member'
  },
  {
    id: 'ec-mem-12',
    nameBn: 'ফারজানা আক্তার',
    nameEn: 'Farjana Akter',
    designationBn: 'কার্যনির্বাহী সদস্য',
    designationEn: 'Executive Member',
    batchBn: '১৩তম ব্যাচ',
    batchEn: '13th Batch',
    sessionBn: '২০১৭-২০১৮',
    sessionEn: '2017-2018',
    locationBn: 'সিঙ্গাপুর',
    locationEn: 'Singapore',
    bloodGroup: 'O+',
    phone: '০১৬১৭-৫৯৬৮৪২',
    email: 'farjanajimi234@gmail.com',
    photoUrl: '/images/executive/farjana.jpeg',
    roleType: 'member'
  },
  {
    id: 'ec-mem-sajib',
    nameBn: 'সজীব চন্দ্র সরকার',
    nameEn: 'Sajib Chandra Sarker',
    designationBn: 'কার্যনির্বাহী সদস্য',
    designationEn: 'Executive Member',
    batchBn: '১৩তম ব্যাচ',
    batchEn: '13th Batch',
    sessionBn: '২০১৭-২০১৮',
    sessionEn: '2017-2018',
    phone: '+880 1913-978805',
    photoUrl: '/images/executive/sojib.jpeg',
    roleType: 'member'
  },
  {
    id: 'ec-mem-13',
    nameBn: 'মো: নাহিদ হাসান',
    nameEn: 'Md. Nahid Hasan',
    designationBn: 'কার্যনির্বাহী সদস্য',
    designationEn: 'Executive Member',
    batchBn: '১৩তম ব্যাচ',
    batchEn: '13th Batch',
    sessionBn: '২০১৭-২০১৮',
    sessionEn: '2017-2018',
    locationBn: 'জার্মানি',
    locationEn: 'Germany',
    bloodGroup: 'AB+',
    phone: '০১৮৭১-১৫৭৭৯৮',
    email: 'nahidhasan3264@gmail.com',
    photoUrl: '/images/executive/nahid_hasan.jpeg',
    roleType: 'member'
  },
  {
    id: 'ec-mem-14-naim',
    nameBn: 'এ এস এম আবদুল্লাহ আল নাইম',
    nameEn: 'A S M Abdullah Al Nayim',
    designationBn: 'কার্যনির্বাহী সদস্য',
    designationEn: 'Executive Member',
    batchBn: '১৪তম ব্যাচ',
    batchEn: '14th Batch',
    sessionBn: '২০১৮-২০১৯',
    sessionEn: '2018-2019',
    phone: '+৩৫৮ ৪৫৩৫৩০৭৮৭',
    email: 'alnayim.30@gmail.com',
    photoUrl: '/images/executive/nayem.jpeg',
    roleType: 'member'
  },
  {
    id: 'ec-mem-14',
    nameBn: 'রাহুল দেব পাল',
    nameEn: 'Rahul Dev Paul',
    designationBn: 'কার্যনির্বাহী সদস্য',
    designationEn: 'Executive Member',
    batchBn: '১৪তম ব্যাচ',
    batchEn: '14th Batch',
    sessionBn: '২০১৮-২০১৯',
    sessionEn: '2018-2019',
    phone: '০১৫৮০-৯৫৮৮৭৫',
    email: 'rahulpaul944@gmail.com',
    photoUrl: '/images/executive/pal.jpeg',
    roleType: 'member'
  }
];

export const SECOND_CONVENING_COMMITTEE_LIST: CommitteeMember[] = [
  {
    id: 'cc2-1',
    nameBn: 'আহ্বায়ক (২য় আহ্বায়ক কমিটি)',
    nameEn: 'Convenor (2nd Convening Committee)',
    designationBn: 'আহ্বায়ক',
    designationEn: 'Convenor',
    batchBn: 'জবি উদ্ভিদবিজ্ঞান',
    batchEn: 'JnU Botany',
    roleType: 'convenor'
  },
  {
    id: 'cc2-2',
    nameBn: 'যুগ্ম আহ্বায়কবৃন্দ (২য় আহ্বায়ক কমিটি)',
    nameEn: 'Joint Convenors (2nd Convening Committee)',
    designationBn: 'যুগ্ম আহ্বায়ক',
    designationEn: 'Joint Convenors',
    batchBn: 'সিনিয়র ব্যাচসমূহ',
    batchEn: 'Senior Batches',
    roleType: 'joint_convenor'
  },
  {
    id: 'cc2-3',
    nameBn: 'সদস্য সচিব (২য় আহ্বায়ক কমিটি)',
    nameEn: 'Member Secretary (2nd Convening Committee)',
    designationBn: 'সদস্য সচিব',
    designationEn: 'Member Secretary',
    batchBn: 'জবি উদ্ভিদবিজ্ঞান',
    batchEn: 'JnU Botany',
    roleType: 'member_secretary'
  },
  {
    id: 'cc2-4',
    nameBn: 'সম্মানিত সদস্যবৃন্দ (২য় আহ্বায়ক কমিটি)',
    nameEn: 'Respected Members (2nd Convening Committee)',
    designationBn: 'কমিটি সদস্য',
    designationEn: 'Committee Members',
    batchBn: '১ম - ১৬তম ব্যাচ প্রতিনিধি',
    batchEn: '1st - 16th Batch Representatives',
    roleType: 'member'
  }
];

export const FIRST_CONVENING_COMMITTEE_LIST: CommitteeMember[] = [
  {
    id: 'cc1-0',
    nameBn: 'অধ্যাপক ড. মোঃ মনিরুজ্জামান খন্দকার',
    nameEn: 'Prof. Dr. Md. Maniruzzaman Khandaker',
    designationBn: 'সভাপতি (গঠন সংক্রান্ত কমিটি)',
    designationEn: 'President (Formation Committee)',
    organizationBn: 'উদ্ভিদবিজ্ঞান বিভাগ, জগন্নাথ বিশ্ববিদ্যালয়',
    organizationEn: 'Dept. of Botany, Jagannath University',
    roleType: 'chief'
  },
  {
    id: 'cc1-1',
    nameBn: 'কাজী ইমরোজ',
    nameEn: 'Kazi Imroz',
    designationBn: 'আহ্বায়ক',
    designationEn: 'Convenor',
    sessionBn: '২০০১-২০০২',
    sessionEn: '2001-2002',
    roleType: 'convenor'
  },
  {
    id: 'cc1-2',
    nameBn: 'মোঃ ওমর ফারুক',
    nameEn: 'Md. Omar Faruq',
    designationBn: 'যুগ্ম আহ্বায়ক',
    designationEn: 'Joint Convenor',
    sessionBn: '২০০৪-২০০৫',
    sessionEn: '2004-2005',
    roleType: 'joint_convenor'
  },
  {
    id: 'cc1-3',
    nameBn: 'সুবীর সরকার পান্থু',
    nameEn: 'Subir Sarkar Panthu',
    designationBn: 'যুগ্ম আহ্বায়ক',
    designationEn: 'Joint Convenor',
    sessionBn: '২০০৩-২০০৪',
    sessionEn: '2003-2004',
    roleType: 'joint_convenor'
  },
  {
    id: 'cc1-4',
    nameBn: 'মোঃ আব্দুর রাজ্জাক',
    nameEn: 'Md. Abdur Razzak',
    designationBn: 'সদস্য সচিব',
    designationEn: 'Member Secretary',
    batchBn: '১ম ব্যাচ',
    batchEn: '1st Batch',
    roleType: 'member_secretary'
  }
];

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
    titleBn: 'উদ্ভিদবিজ্ঞান অ্যালামনাই গ্যাদারিং ও প্রীতি সমাবেশ (ছবি ১)',
    titleEn: 'Botany Alumni Gathering & Celebration (Photo 1)',
    category: 'reunion',
    categoryBn: 'অ্যালামনাই মিলনমেলা',
    categoryEn: 'Alumni Reunion',
    imageUrl: '/1st.jpeg',
    date: '১৬ সেপ্টেম্বর, ২০২৬',
    locationBn: 'জগন্নাথ বিশ্ববিদ্যালয় ক্যাম্পাস',
    locationEn: 'Jagannath University Campus',
    descriptionBn: 'জগন্নাথ বিশ্ববিদ্যালয় উদ্ভিদবিজ্ঞান বিভাগের প্রাক্তন শিক্ষার্থীদের সৌহার্দ্যপূর্ণ মিলনমেলা ও আনন্দঘন মুহূর্ত।',
    descriptionEn: 'Warm fellowship and memorable moments shared by the alumni of Department of Botany, Jagannath University.'
  },
  {
    id: 'botany-gallery-2',
    titleBn: 'বিভাগীয় শিক্ষক ও অ্যালামনাইদের স্মরণীয় মুহূর্ত (ছবি ২)',
    titleEn: 'Memorable Moments of Faculty & Alumni (Photo 2)',
    category: 'campus',
    categoryBn: 'ক্যাম্পাস ও স্মৃতি',
    categoryEn: 'Campus & Memories',
    imageUrl: '/2nd.jpeg',
    date: '১৬ সেপ্টেম্বর, ২০২৬',
    locationBn: 'উদ্ভিদবিজ্ঞান বিভাগ, জগন্নাথ বিশ্ববিদ্যালয়',
    locationEn: 'Department of Botany, Jagannath University',
    descriptionBn: 'উদ্ভিদবিজ্ঞান বিভাগের প্রিয় প্রাঙ্গণে শিক্ষক ও প্রাক্তনীদের প্রাণবন্ত উপস্থিতি ও স্মৃতিচারণ।',
    descriptionEn: 'Vibrant gathering and nostalgia among respected faculty and alumni at the department premises.'
  },
  {
    id: 'botany-gallery-3',
    titleBn: 'অ্যালামনাই অ্যাসোসিয়েশন আলোচনা ও ফটোসেশন (ছবি ৩)',
    titleEn: 'Alumni Association Discussion & Session (Photo 3)',
    category: 'moments',
    categoryBn: 'বিশেষ মুহূর্ত',
    categoryEn: 'Special Moments',
    imageUrl: '/3rd.jpeg',
    date: '১৬ সেপ্টেম্বর, ২০২৬',
    locationBn: 'জগন্নাথ বিশ্ববিদ্যালয়',
    locationEn: 'Jagannath University',
    descriptionBn: 'বিভাগের বিভিন্ন ব্যাচের প্রাক্তনীদের একত্রিত হওয়া এবং পারস্পরিক সৌহার্দ্য ও ভ্রাতৃত্বের মেলবন্ধন।',
    descriptionEn: 'Uniting alumni from various batches in a spirit of friendship, harmony, and mutual respect.'
  },
  {
    id: 'botany-gallery-4',
    titleBn: 'প্রাক্তন ও বর্তমান শিক্ষার্থীদের প্রীতি সম্মিলন (ছবি ৪)',
    titleEn: 'Alumni Fellowship & Gathering (Photo 4)',
    category: 'reunion',
    categoryBn: 'অ্যালামনাই মিলনমেলা',
    categoryEn: 'Alumni Reunion',
    imageUrl: '/4th.jpeg',
    date: '১৬ সেপ্টেম্বর, ২০২৬',
    locationBn: 'জগন্নাথ বিশ্ববিদ্যালয় ক্যাম্পাস',
    locationEn: 'Jagannath University Campus',
    descriptionBn: 'উদ্ভিদবিজ্ঞান বিভাগের সুদীর্ঘ ঐতিহ্য ও ভালোবাসার প্রতীক হয়ে থাকা এক অনন্য ফ্রেমের স্মৃতি।',
    descriptionEn: 'A timeless frame capturing the long-standing heritage and bonding of Botany alumni.'
  },
  {
    id: 'botany-gallery-5',
    titleBn: 'উদ্ভিদবিজ্ঞান পরিবার পুনর্মিলনী উৎসব (ছবি ৫)',
    titleEn: 'Botany Alumni Reunion Celebration (Photo 5)',
    category: 'moments',
    categoryBn: 'বিশেষ মুহূর্ত',
    categoryEn: 'Special Moments',
    imageUrl: '/5th.jpeg',
    date: '১৬ সেপ্টেম্বর, ২০২৬',
    locationBn: 'জগন্নাথ বিশ্ববিদ্যালয়',
    locationEn: 'Jagannath University',
    descriptionBn: 'স্মৃতির ক্যাম্পাসে ফিরে আসা উদ্ভিদবিজ্ঞানীদের বাঁধভাঙা উল্লাস ও আনন্দঘন পরিবেশ।',
    descriptionEn: 'Unbounded joy and festive atmosphere as botanists return to their cherished campus.'
  },
  {
    id: 'botany-gallery-6',
    titleBn: 'অ্যালামনাই অ্যাসোসিয়েশন মেম্বার ফ্রেম (ছবি ৬)',
    titleEn: 'Alumni Association Member Snapshot (Photo 6)',
    category: 'campus',
    categoryBn: 'ক্যাম্পাস ও স্মৃতি',
    categoryEn: 'Campus & Memories',
    imageUrl: '/6th.jpeg',
    date: '১৬ সেপ্টেম্বর, ২০২৬',
    locationBn: 'উদ্ভিদবিজ্ঞান বিভাগ',
    locationEn: 'Department of Botany',
    descriptionBn: 'অ্যালামনাই অ্যাসোসিয়েশনের সকল সম্মানিত সদস্য ও সহপাঠীদের নিয়ে স্মরণীয় মুহূর্ত।',
    descriptionEn: 'A memorable photo session featuring respected members, faculty, and alumni.'
  },
  {
    id: 'botany-gallery-7',
    titleBn: 'ক্যাম্পাসে সহপাঠীদের আনন্দঘন মুহূর্ত (ছবি ৭)',
    titleEn: 'Cherished Moments on Campus (Photo 7)',
    category: 'reunion',
    categoryBn: 'অ্যালামনাই মিলনমেলা',
    categoryEn: 'Alumni Reunion',
    imageUrl: '/7th.jpeg',
    date: '১৬ সেপ্টেম্বর, ২০২৬',
    locationBn: 'জগন্নাথ বিশ্ববিদ্যালয়',
    locationEn: 'Jagannath University',
    descriptionBn: 'প্রিয় সহপাঠী ও শিক্ষকগণের আন্তরিক কুশল বিনিময় এবং ভ্রাতৃত্বের এক চিরচেনা মুহূর্ত।',
    descriptionEn: 'Heartwarming interaction among beloved classmates and teachers at the campus.'
  },
  {
    id: 'botany-gallery-8',
    titleBn: 'অ্যালামনাই অ্যাসোসিয়েশন বিশেষ আলোকচিত্র (ছবি ৮)',
    titleEn: 'Alumni Association Special Feature (Photo 8)',
    category: 'moments',
    categoryBn: 'বিশেষ মুহূর্ত',
    categoryEn: 'Special Moments',
    imageUrl: '/8th.jpeg',
    date: '১৬ সেপ্টেম্বর, ২০২৬',
    locationBn: 'জগন্নাথ বিশ্ববিদ্যালয় ক্যাম্পাস',
    locationEn: 'Jagannath University Campus',
    descriptionBn: 'উদ্ভিদবিজ্ঞান বিভাগের সুবর্ণ ঐতিহ্য ও প্রাক্তনীদের সেতুবন্ধনের বিশেষ চিত্র।',
    descriptionEn: 'Special photograph showcasing the legacy and bonding of Botany alumni.'
  },
  {
    id: 'botany-gallery-9',
    titleBn: 'বিভাগীয় ইতিহাস ও ঐতিহ্যের স্মারক (ছবি ৯)',
    titleEn: 'Departmental Heritage & Legacy (Photo 9)',
    category: 'campus',
    categoryBn: 'ক্যাম্পাস ও স্মৃতি',
    categoryEn: 'Campus & Memories',
    imageUrl: '/9th.jpeg',
    date: '১৬ সেপ্টেম্বর, ২০২৬',
    locationBn: 'উদ্ভিদবিজ্ঞান বিভাগ, জগন্নাথ বিশ্ববিদ্যালয়',
    locationEn: 'Department of Botany, Jagannath University',
    descriptionBn: 'বিভাগের একাডেমিক ও অ্যালামনাই কার্যক্রমের এক উজ্জ্বল ও আনন্দদায়ক স্মৃতিচিত্র।',
    descriptionEn: 'A vibrant capture of departmental traditions and alumni contributions.'
  },
  {
    id: 'botany-gallery-10',
    titleBn: 'উদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশন আনন্দ উৎসব (ছবি ১০)',
    titleEn: 'Botany Alumni Grand Fellowship (Photo 10)',
    category: 'reunion',
    categoryBn: 'অ্যালামনাই মিলনমেলা',
    categoryEn: 'Alumni Reunion',
    imageUrl: '/10th.jpeg',
    date: '১৬ সেপ্টেম্বর, ২০২৬',
    locationBn: 'জগন্নাথ বিশ্ববিদ্যালয়',
    locationEn: 'Jagannath University',
    descriptionBn: 'অ্যালামনাই অ্যাসোসিয়েশনের সকল সম্মানিত সদস্য ও সহপাঠীদের নিয়ে ১০ম স্মরণীয় ফ্রেম।',
    descriptionEn: 'The 10th memorable frame capturing respected members and botanical alumni.'
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
    imageUrl: 'https://media.istockphoto.com/id/2022468311/vector/single-man-stick-figure-icon.jpg?s=1024x1024&w=is&k=20&c=knHDGHH3klSPlNHLoqfsFcAkVJc78KuABkT5lVLCXco=',
    date: '১০ আগস্ট, ২০২৬',
    authorBn: 'মিডিয়া ও তথ্য সেল, উদ্ভিদবিজ্ঞান বিভাগ',
    authorEn: 'Media & Info Cell, Dept. of Botany',
    summaryBn: 'জগন্নাথ বিশ্ববিদ্যালয়ের উদ্ভিদবিজ্ঞান বিভাগে শিক্ষার্থীদের আধুনিক গবেষণা ও ই-বুক ব্যবহারের জন্য ডিজিটাল সেমিনার ও স্মার্ট রিসার্চ কর্নার উদ্বোধন করা হয়েছে।',
    summaryEn: 'A modern digital seminar and smart research corner inaugurated for botany students to access digital archives and e-journals.',
    contentBn: `জগন্নাথ বিশ্ববিদ্যালয়ের উদ্ভিদবিজ্ঞান বিভাগে শিক্ষার্থীদের আধুনিক গবেষণা, আন্তর্জাতিক জার্নাল অধ্যয়ন ও ডেটা অ্যানালাইসিসের সুবিধার্থে একটি সুসজ্জিত ডিজিটাল সেমিনার ও স্মার্ট রিসার্চ কর্নার উদ্বোধন করা হয়েছে।

উদ্বোধনী অনুষ্ঠানে প্রধান অতিথি হিসেবে উপস্থিত ছিলেন সম্মানিত উপাচার্য প্রফেসর মো. আমান উল্লাহ। বিশেষ অতিথি হিসেবে বক্তব্য রাখেন উপ-উপাচার্য প্রফেসর নুরুল ইসলাম। অনুষ্ঠানে সভাপতিত্ব করেন উদ্ভিদবিজ্ঞান বিভাগের প্রধান ফারজানা ইয়াসমিন মিতা।

উপাচার্য মহোদয় বলেন, "একবিংশ শতাব্দীর চ্যালেঞ্জ মোকাবেলায় উদ্ভিদবিজ্ঞানের শিক্ষার্থীদের তথ্যপ্রযুক্তির জ্ঞান ও গবেষণার দক্ষতা অর্জন অপরিহার্য। এই রিসার্চ কর্নার তাঁদের গবেষণায় প্রভূত সহায়তা করবে।" অনুষ্ঠানে বিভাগের শিক্ষক ও শিক্ষার্থীরা উপস্থিত ছিলেন।`,
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
    imageUrl: 'https://media.istockphoto.com/id/2022468311/vector/single-man-stick-figure-icon.jpg?s=1024x1024&w=is&k=20&c=knHDGHH3klSPlNHLoqfsFcAkVJc78KuABkT5lVLCXco=',
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
    imageUrl: 'https://media.istockphoto.com/id/2022468311/vector/single-man-stick-figure-icon.jpg?s=1024x1024&w=is&k=20&c=knHDGHH3klSPlNHLoqfsFcAkVJc78KuABkT5lVLCXco=',
    date: '২০ জুলাই, ২০২৬',
    authorBn: 'বিভাগীয় অফিস',
    authorEn: 'Department Office',
    summaryBn: '২০২৪-২০২৫ শিক্ষাবর্ষে মেধা তালিকায় উদ্ভিদবিজ্ঞান বিভাগে ভর্তিকৃত নবীন শিক্ষার্থীদের ফুল দিয়ে বরণ ও একাডেমিক পরিচিতি অনুষ্ঠিত হয়েছে।',
    summaryEn: 'Newly admitted honours 1st-year students were warmly welcomed with flowers and an academic curriculum briefing.',
    contentBn: `জগন্নাথ বিশ্ববিদ্যালয়ের উদ্ভিদবিজ্ঞান বিভাগে ২০২৪-২০২৫ শিক্ষাবর্ষের অনার্স ১ম বর্ষের নবাগত শিক্ষার্থীদের ওরিয়েন্টেশন ক্লাস অনুষ্ঠিত হয়েছে। অনুষ্ঠানে শিক্ষার্থীদের বিভাগের সমৃদ্ধ ঐতিহ্য, নিয়মশৃঙ্খলা, সেমিনার লাইব্রেরি ব্যবহার ও পরীক্ষা পদ্ধতি সম্পর্কে বিস্তারিত অবহিত করা হয়।`,
    contentEn: `The Department of Botany at Jagannath University held its orientation for newly admitted students, outlining academic disciplines, seminar facilities, and study pathways.`,
    isFeatured: false,
    viewsCount: 1750
  },
  {
    id: 'news-reunion-prep-2026',
    titleBn: 'বার্ষিক উদ্ভিদবিজ্ঞান অ্যালামনাই গ্র্যান্ড পুনর্মিলনী ২০২৬-এর প্রস্তুতি সভা ও রেজিস্ট্রেশন উন্মোচন',
    titleEn: 'Preparation Meeting & Registration Launch for Annual Botany Alumni Grand Reunion 2026',
    category: 'achievement',
    categoryBn: 'অ্যালামনাই ইভেন্ট',
    categoryEn: 'Alumni Event',
    imageUrl: 'https://media.istockphoto.com/id/2022468311/vector/single-man-stick-figure-icon.jpg?s=1024x1024&w=is&k=20&c=knHDGHH3klSPlNHLoqfsFcAkVJc78KuABkT5lVLCXco=',
    date: '১৫ সেপ্টেম্বর, ২০২৬',
    authorBn: 'অ্যালামনাই প্রচার ও ইভেন্ট সেল',
    authorEn: 'Alumni Event & PR Cell',
    summaryBn: 'জগন্নাথ বিশ্ববিদ্যালয় উদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশনের মহতী পুনর্মিলনী সফল করতে নির্বাহী কমিটির এক বিশেষ প্রস্তুতি সভা অনুষ্ঠিত হয়েছে।',
    summaryEn: 'Executive committee holds high-level coordination meeting for upcoming Botany Alumni Reunion 2026.',
    contentBn: `জগন্নাথ বিশ্ববিদ্যালয় উদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশনের উদ্যোগে আয়োজিতব্য 'গ্র্যান্ড পুনর্মিলনী ২০২৬' সফলভাবে উদযাপনের লক্ষ্যে বিশ্ববিদ্যালয়ের উদ্ভিদবিজ্ঞান মিলনায়তনে এক মহাসভা অনুষ্ঠিত হয়েছে।
    
সভায় অ্যালামনাই সদস্যবৃন্দ পুনর্মিলনীর লোগো, টি-শার্ট ও র্যাফেল ড্র কুপন উন্মোচন করেন। দেশ-বিদেশের সকল ব্যাচের অ্যালামনাইদের অনলাইনে দ্রুত রেজিস্ট্রেশন সম্পন্ন করার উদাত্ত আহ্বান জানান নির্বাহী কমিটি।`,
    contentEn: `Botany Alumni Association hosted a major organizational meeting to finalize venue arrangements, souvenir publication, and online registration drives for Reunion 2026.`,
    isFeatured: true,
    viewsCount: 4210
  },
  {
    id: 'news-biotech-award',
    titleBn: 'আন্তর্জাতিক বায়ো-রিসার্চ কংগ্রেসে উদ্ভিদবিজ্ঞান বিভাগের গবেষক দলের শ্রেষ্ঠ পেপার পুরস্কার অর্জন',
    titleEn: 'Botany Research Team Wins Best Paper Award at International Bio-Research Congress',
    category: 'achievement',
    categoryBn: 'গবেষণা ও সাফল্য',
    categoryEn: 'Research & Award',
    imageUrl: 'https://media.istockphoto.com/id/2022468311/vector/single-man-stick-figure-icon.jpg?s=1024x1024&w=is&k=20&c=knHDGHH3klSPlNHLoqfsFcAkVJc78KuABkT5lVLCXco=',
    date: '১৮ সেপ্টেম্বর, ২০২৬',
    authorBn: 'উদ্ভিদবিজ্ঞান গবেষণা সেল',
    authorEn: 'Botany Research Cell',
    summaryBn: 'টিস্যু কালচার ও উদ্ভিজ্জ ওষুধ উপাদানের ওপর গবেষণাপত্র উপস্থাপন করে আন্তর্জাতিক আয়োজনে ১ম স্থান অধিকার করেছেন শিক্ষার্থীরা।',
    summaryEn: 'Botany students secured top honours for outstanding research on plant tissue culture and herbal active compounds.',
    contentBn: `আন্তর্জাতিক বায়ো-রিসার্চ কংগ্রেসে পরিবেশবান্ধব টিস্যু কালচার প্রযুক্তির মাধ্যমে বিরল ঔষধি উদ্ভিদের বাণিজ্যিক বংশবৃদ্ধি শীর্ষক গবেষণার জন্য জগন্নাথ বিশ্ববিদ্যালয় উদ্ভিদবিজ্ঞান বিভাগের টিম 'বেস্ট ইয়ং সায়েন্টিস্ট অ্যাওয়ার্ড' অর্জন করেছে।
    
বিভাগের চেয়ারম্যান এবং শিক্ষকবৃন্দ জয়ী গবেষকদের আন্তরিক অভিনন্দন জানান এবং উত্তরোত্তর সাফল্য কামনা করেন।`,
    contentEn: `Jagannath University Botany research fellows earned the Best Young Scientist Award at the International Bio-Research Congress for innovative tissue culture protocols.`,
    isFeatured: false,
    viewsCount: 3100
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

