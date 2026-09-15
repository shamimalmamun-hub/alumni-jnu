import fs from 'fs';
import path from 'path';

const outDir = path.join(process.cwd(), 'public', 'images', 'convening_1st');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Page 1 SVG
const page1Svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 1280" width="100%" height="100%" style="background:#ffffff; font-family: 'SolaimanLipi', 'Kalpurush', 'Hind Siliguri', 'Segoe UI', Arial, sans-serif;">
  <rect x="0" y="0" width="900" height="1280" fill="#fdfdfd"/>
  <rect x="40" y="40" width="820" height="1200" fill="#ffffff" stroke="#c5d0c8" stroke-width="1.5" rx="4"/>
  
  <!-- Header Left -->
  <text x="70" y="85" font-size="14" font-weight="bold" fill="#111827">Department of Botany</text>
  <text x="70" y="105" font-size="13" font-weight="600" fill="#1f2937">Jagannath University</text>
  <text x="70" y="123" font-size="12" fill="#374151">Dhaka-1100, Bangladesh</text>
  <text x="70" y="140" font-size="11" fill="#4b5563">Phone: 880-2-9583766</text>

  <!-- Header Right -->
  <text x="830" y="85" font-size="17" font-weight="bold" fill="#111827" text-anchor="end">উদ্ভিদবিজ্ঞান বিভাগ</text>
  <text x="830" y="107" font-size="14" font-weight="bold" fill="#1f2937" text-anchor="end">জগন্নাথ বিশ্ববিদ্যালয়</text>
  <text x="830" y="125" font-size="12" fill="#374151" text-anchor="end">ঢাকা- ১১০০, বাংলাদেশ</text>
  <text x="830" y="141" font-size="11" fill="#4b5563" text-anchor="end">ফোনঃ ৮৮০-২-৯৫৮৩৭৬৬</text>

  <!-- Center Logo Emblem -->
  <circle cx="450" cy="105" r="32" fill="#f0f9f4" stroke="#006a4e" stroke-width="1.5"/>
  <text x="450" y="100" font-size="9" font-weight="bold" fill="#006a4e" text-anchor="middle">জগন্নাথ</text>
  <text x="450" y="114" font-size="8" font-weight="bold" fill="#006a4e" text-anchor="middle">বিশ্ববিদ্যালয়</text>

  <!-- Top Divider -->
  <line x1="70" y1="160" x2="830" y2="160" stroke="#111827" stroke-width="1.2"/>

  <!-- Document Title -->
  <text x="450" y="195" font-size="20" font-weight="bold" fill="#111827" text-anchor="middle">জগন্নাথ বিশ্ববিদ্যালয় উদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশন</text>

  <!-- Meeting intro -->
  <text x="70" y="235" font-size="13" fill="#1f2937" textLength="760">অদ্য ০৪/০৮/২০১৭ তারিখে উদ্ভিদবিজ্ঞান বিভাগ থেকে ডিগ্রিপ্রাপ্ত প্রাক্তন শিক্ষার্থীদের নিয়ে উদ্ভিদবিজ্ঞান বিভাগে</text>
  <text x="70" y="255" font-size="13" fill="#1f2937" textLength="760">এক সভা অনুষ্ঠিত হয়। সভায় সভাপতিত্ব করেন অ্যালামনাই অ্যাসোসিয়েশন গঠন সংক্রান্ত কমিটির সভাপতি</text>
  <text x="70" y="275" font-size="13" fill="#1f2937">অধ্যাপক ড. মোঃ মনিরুজ্জামান খন্দকার। সভায় সর্বমোট ৫০জন সদস্য উপস্থিত ছিলেন। সভায় গৃহীত সিদ্ধান্ত</text>
  <text x="70" y="295" font-size="13" font-weight="bold" fill="#111827">সমূহঃ</text>

  <!-- Decisions -->
  <text x="70" y="325" font-size="13.5" font-weight="bold" fill="#111827">সিদ্ধান্ত ১:</text>
  <text x="70" y="345" font-size="13" fill="#1f2937">সভায় জগন্নাথ বিশ্ববিদ্যালয়ের উদ্ভিদবিজ্ঞান বিভাগের অ্যালামনাইদের সংগঠিত করে তাদের মধ্যে পারস্পরিক</text>
  <text x="70" y="365" font-size="13" fill="#1f2937">যোগাযোগ, সহযোগিতা ও পেশাগত দক্ষতা বৃদ্ধির লক্ষ্যে অ্যালামনাই অ্যাসোসিয়েশন করার সিদ্ধান্ত গৃহীত</text>
  <text x="70" y="385" font-size="13" fill="#1f2937">হয়।</text>

  <text x="70" y="415" font-size="13.5" font-weight="bold" fill="#111827">সিদ্ধান্ত ২:</text>
  <text x="70" y="435" font-size="13" fill="#1f2937">জগন্নাথ বিশ্ববিদ্যালয়ের উদ্ভিদবিজ্ঞান বিভাগ হতে স্নাতক (সম্মান)/স্নাতকোত্তর/এমফিল/পিএইচডি ডিগ্রিপ্রাপ্তগণ</text>
  <text x="70" y="455" font-size="13" fill="#1f2937">অ্যাসোসিয়েশনের সদস্য হওয়ার যোগ্য বিবেচিত হবেন।</text>

  <text x="70" y="485" font-size="13.5" font-weight="bold" fill="#111827">সিদ্ধান্ত ৩:</text>
  <text x="70" y="505" font-size="13" fill="#1f2937">অ্যালামনাই সদস্য ফরম পূরণ ও সদস্য অন্তর্ভুক্তি ফি ৫০০/- (পাঁচশত) টাকা প্রদান সাপেক্ষে অ্যাসোসিয়েশনের</text>
  <text x="70" y="525" font-size="13" fill="#1f2937">সদস্য হতে হবে।</text>

  <text x="70" y="555" font-size="13.5" font-weight="bold" fill="#111827">সিদ্ধান্ত ৪:</text>
  <text x="70" y="575" font-size="13" fill="#1f2937">শুধুমাত্র সদস্যগণ অ্যাসোসিয়েশনের সাধারণ সভায় উপস্থিত, ভোটাধিকার প্রয়োগ ও অ্যালামনাই সংক্রান্ত</text>
  <text x="70" y="595" font-size="13" fill="#1f2937">কার্যক্রমের জন্য যোগ্য বিবেচিত হবেন।</text>

  <!-- Committee Section -->
  <text x="70" y="630" font-size="14" font-weight="bold" fill="#111827">সভায় নিম্নোক্ত আহ্বায়ক কমিটি অনুমোদন করা হয় :</text>
  
  <text x="70" y="660" font-size="13.5" font-weight="bold" fill="#111827">আহ্বায়ক</text>
  <text x="180" y="660" font-size="13.5" font-weight="bold" fill="#111827">:</text>
  <text x="200" y="660" font-size="13.5" fill="#1f2937">কাজী ইমরোজ (২০০১-২০০২)</text>

  <text x="70" y="685" font-size="13.5" font-weight="bold" fill="#111827">যুগ্ম আহ্বায়ক</text>
  <text x="180" y="685" font-size="13.5" font-weight="bold" fill="#111827">:</text>
  <text x="200" y="685" font-size="13" fill="#1f2937">মোঃ ওমর ফারুক (২০০৪-২০০৫)</text>
  <text x="200" y="705" font-size="13" fill="#1f2937">সুবীর সরকার পান্থু (২০০৩-২০০৪)</text>

  <text x="70" y="735" font-size="13.5" font-weight="bold" fill="#111827">সদস্য সচিব</text>
  <text x="180" y="735" font-size="13.5" font-weight="bold" fill="#111827">:</text>
  <text x="200" y="735" font-size="13.5" fill="#1f2937">মোঃ আব্দুর রাজ্জাক - ১ম ব্যাচ</text>

  <text x="70" y="765" font-size="13.5" font-weight="bold" fill="#111827">সদস্য</text>
  <text x="180" y="765" font-size="13.5" font-weight="bold" fill="#111827">:</text>
  
  <g font-size="12.5" fill="#1f2937">
    <text x="200" y="765">- সুষমা সরমা</text><text x="400" y="765">(২০০০-২০০১)</text>
    <text x="200" y="785">- সজল</text><text x="400" y="785">(২০০১-২০০২)</text>
    <text x="200" y="805">- উত্তম কুমার সরকার</text><text x="400" y="805">(২০০১-২০০২)</text>
    <text x="200" y="825">- হাবিবুর রহমান</text><text x="400" y="825">(২০০১-২০০২)</text>
    <text x="200" y="845">- মোঃ আমিনুর রহমান</text><text x="400" y="845">(২০০৩-২০০৪)</text>
    <text x="200" y="865">- গোলাম মর্তুজা</text><text x="400" y="865">(২০০৪-২০০৫)</text>
    <text x="200" y="885">- কিশোর কুমার রায়</text><text x="400" y="885">১ম ব্যাচ</text>
    <text x="200" y="905">- মোঃ রবিউল ইসলাম খান</text><text x="400" y="905">১ম ব্যাচ</text>
    <text x="200" y="925">- জাহিদুল ইসলাম</text><text x="400" y="925">১ম ব্যাচ</text>
    <text x="200" y="945">- এম, এ হান্নান</text><text x="400" y="945">১ম ব্যাচ</text>
    <text x="200" y="965">- সামসুল আলম</text><text x="400" y="965">১ম ব্যাচ</text>
    <text x="200" y="985">- বিশ্বজিৎ মালাকার</text><text x="400" y="985">১ম ব্যাচ</text>
    <text x="200" y="1005">- ফুয়াদ হাসান</text><text x="400" y="1005">১ম ব্যাচ</text>
    <text x="200" y="1025">- আমেনা কিবরিয়া মিতু</text><text x="400" y="1025">১ম ব্যাচ</text>
    <text x="200" y="1045">- মাইদুল ইসলাম রাজু</text><text x="400" y="1045">১ম ব্যাচ</text>
    <text x="200" y="1065">- মোঃ মেহেদী হাসান</text><text x="400" y="1065">১ম ব্যাচ</text>
    <text x="200" y="1085">- মোঃ সোহেল মোল্লা</text><text x="400" y="1085">১ম ব্যাচ</text>
  </g>

  <!-- Signature bottom right -->
  <path d="M720,1160 Q750,1140 770,1165 T810,1150" stroke="#003366" stroke-width="2" fill="none"/>
  
  <!-- Footer file ref -->
  <text x="700" y="1220" font-size="11" font-family="monospace" fill="#6b7280">E:\\Alumni\\Alumni Committee.doc 1</text>
</svg>`;

// Page 2 SVG
const page2Svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 1280" width="100%" height="100%" style="background:#ffffff; font-family: 'SolaimanLipi', 'Kalpurush', 'Hind Siliguri', 'Segoe UI', Arial, sans-serif;">
  <rect x="0" y="0" width="900" height="1280" fill="#fdfdfd"/>
  <rect x="40" y="40" width="820" height="1200" fill="#ffffff" stroke="#c5d0c8" stroke-width="1.5" rx="4"/>
  
  <!-- Header Left -->
  <text x="70" y="85" font-size="14" font-weight="bold" fill="#111827">Department of Botany</text>
  <text x="70" y="105" font-size="13" font-weight="600" fill="#1f2937">Jagannath University</text>
  <text x="70" y="123" font-size="12" fill="#374151">Dhaka-1100, Bangladesh</text>
  <text x="70" y="140" font-size="11" fill="#4b5563">Phone: 880-2-9583766</text>

  <!-- Header Right -->
  <text x="830" y="85" font-size="17" font-weight="bold" fill="#111827" text-anchor="end">উদ্ভিদবিজ্ঞান বিভাগ</text>
  <text x="830" y="107" font-size="14" font-weight="bold" fill="#1f2937" text-anchor="end">জগন্নাথ বিশ্ববিদ্যালয়</text>
  <text x="830" y="125" font-size="12" fill="#374151" text-anchor="end">ঢাকা- ১১০০, বাংলাদেশ</text>
  <text x="830" y="141" font-size="11" fill="#4b5563" text-anchor="end">ফোনঃ ৮৮০-২-৯৫৮৩৭৬৬</text>

  <!-- Center Logo Emblem -->
  <circle cx="450" cy="105" r="32" fill="#f0f9f4" stroke="#006a4e" stroke-width="1.5"/>
  <text x="450" y="100" font-size="9" font-weight="bold" fill="#006a4e" text-anchor="middle">জগন্নাথ</text>
  <text x="450" y="114" font-size="8" font-weight="bold" fill="#006a4e" text-anchor="middle">বিশ্ববিদ্যালয়</text>

  <!-- Top Divider -->
  <line x1="70" y1="160" x2="830" y2="160" stroke="#111827" stroke-width="1.2"/>

  <!-- Members List (Page 2) -->
  <g font-size="12.5" fill="#1f2937">
    <text x="200" y="195">- মোঃ শফিউদ্দীন</text><text x="400" y="195">২য় ব্যাচ</text>
    <text x="200" y="215">- সোহেল রানা</text><text x="400" y="215">২য় ব্যাচ</text>
    <text x="200" y="235">- রোকনুজ্জামান</text><text x="400" y="235">২য় ব্যাচ</text>
    <text x="200" y="255">- লিজা</text><text x="400" y="255">২য় ব্যাচ</text>
    <text x="200" y="275">- মোঃ এনামুল হক</text><text x="400" y="275">২য় ব্যাচ</text>
    <text x="200" y="295">- মোঃ আমির হোসেন</text><text x="400" y="295">২য় ব্যাচ</text>
    <text x="200" y="315">- মোঃ মনির হোসেন</text><text x="400" y="315">২য় ব্যাচ</text>
    <text x="200" y="335">- মেঘলা সাহা পিংকি</text><text x="400" y="335">৩য় ব্যাচ</text>
    <text x="200" y="355">- ইমন হক</text><text x="400" y="355">৩য় ব্যাচ</text>
    <text x="200" y="375">- কে.এম. ওমর ফারুক</text><text x="400" y="375">৩য় ব্যাচ</text>
    <text x="200" y="395">- নিয়ামুল কবির</text><text x="400" y="395">৩য় ব্যাচ</text>
    <text x="200" y="415">- মোঃ জাহিদ হাসান প্রধান</text><text x="400" y="415">৩য় ব্যাচ</text>
    <text x="200" y="435">- মোঃ মহসিন</text><text x="400" y="435">৪র্থ ব্যাচ</text>
    <text x="200" y="455">- মোঃ এরশাদুর রহমান</text><text x="400" y="455">৪র্থ ব্যাচ</text>
    <text x="200" y="475">- আদনান রাহী</text><text x="400" y="475">৪র্থ ব্যাচ</text>
    <text x="200" y="495">- ফিরোজ আহম্মেদ</text><text x="400" y="495">৫ম ব্যাচ</text>
    <text x="200" y="515">- গিয়াস মোহন</text><text x="400" y="515">৫ম ব্যাচ</text>
    <text x="200" y="535">- নজরুল ইসলাম</text><text x="400" y="535">৫ম ব্যাচ</text>
    <text x="200" y="555">- জুনাইদ হোসেন</text><text x="400" y="555">৫ম ব্যাচ</text>
    <text x="200" y="575">- মোঃ মাইদুল ইসলাম</text><text x="400" y="575">৫ম ব্যাচ</text>
    <text x="200" y="595">- মোঃ সাকিল সরকার</text><text x="400" y="595">৫ম ব্যাচ</text>
    <text x="200" y="615">- তাজমিলুর রহমান</text><text x="400" y="615">৫ম ব্যাচ</text>
    <text x="200" y="635">- ভ্রান্ত নাথ অধিকারী</text><text x="400" y="635">৬ষ্ঠ ব্যাচ</text>
    <text x="200" y="655">- নূর মোহাম্মদ (রাহুল)</text><text x="400" y="655">৬ষ্ঠ ব্যাচ</text>
    <text x="200" y="675">- মোঃ আরিফ হোসেন</text><text x="400" y="675">৬ষ্ঠ ব্যাচ</text>
    <text x="200" y="695">- নাসরিন আক্তার দোয়েল</text><text x="400" y="695">৬ষ্ঠ ব্যাচ</text>
    <text x="200" y="715">- আব্দুল্লাহ আল সাঈদ</text><text x="400" y="715">৭ম ব্যাচ</text>
    <text x="200" y="735">- শিল্পী আক্তার</text><text x="400" y="735">৭ম ব্যাচ</text>
    <text x="200" y="755">- সানজিদা ইসলাম</text><text x="400" y="755">৭ম ব্যাচ</text>
    <text x="200" y="775">- ধীমান পাল</text><text x="400" y="775">৭ম ব্যাচ</text>
    <text x="200" y="795">- নাজমুল হাসান</text><text x="400" y="795">৭ম ব্যাচ</text>
    <text x="200" y="815">- মেহেদী হাসান</text><text x="400" y="815">৭ম ব্যাচ</text>
  </g>

  <!-- Decision 5 -->
  <text x="70" y="865" font-size="13.5" font-weight="bold" fill="#111827">সিদ্ধান্ত ৫:</text>
  <text x="70" y="895" font-size="14" font-weight="bold" fill="#111827">আহ্বায়ক কমিটির কর্মপরিধি :</text>

  <text x="110" y="930" font-size="13" fill="#1f2937">১.  আহ্বায়ক কমিটি অ্যালামনাই অ্যাসোসিয়েশনের সদস্য সংগ্রহের ব্যবস্থা গ্রহণ করবে।</text>
  <text x="110" y="960" font-size="13" fill="#1f2937">২.  অ্যাসোসিয়েশনের খসড়া গঠনতন্ত্র প্রণয়ন করবে।</text>
  <text x="110" y="990" font-size="13" fill="#1f2937">৩.  অ্যালামনাই অ্যাসোসিয়েশনের প্রথম সাধারণ সভা অনুষ্ঠানের ব্যবস্থা গ্রহণ করবে।</text>
  <text x="110" y="1020" font-size="13" fill="#1f2937">৪.  অ্যালামনাই অ্যাসোসিয়েশন সংক্রান্ত অন্যান্য প্রযোজ্য কর্ম সম্পাদন করবে।</text>

  <!-- Signature bottom right -->
  <path d="M720,1160 Q750,1140 770,1165 T810,1150" stroke="#003366" stroke-width="2" fill="none"/>

  <!-- Footer file ref -->
  <text x="700" y="1220" font-size="11" font-family="monospace" fill="#6b7280">E:\\Alumni\\Alumni Committee.doc 2</text>
</svg>`;

// Page 3 SVG
const page3Svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 1280" width="100%" height="100%" style="background:#ffffff; font-family: 'SolaimanLipi', 'Kalpurush', 'Hind Siliguri', 'Segoe UI', Arial, sans-serif;">
  <rect x="0" y="0" width="900" height="1280" fill="#fdfdfd"/>
  <rect x="40" y="40" width="820" height="1200" fill="#ffffff" stroke="#c5d0c8" stroke-width="1.5" rx="4"/>
  
  <!-- Header Left -->
  <text x="70" y="85" font-size="14" font-weight="bold" fill="#111827">Department of Botany</text>
  <text x="70" y="105" font-size="13" font-weight="600" fill="#1f2937">Jagannath University</text>
  <text x="70" y="123" font-size="12" fill="#374151">Dhaka-1100, Bangladesh</text>
  <text x="70" y="140" font-size="11" fill="#4b5563">Phone: 880-2-9583766</text>

  <!-- Header Right -->
  <text x="830" y="85" font-size="17" font-weight="bold" fill="#111827" text-anchor="end">উদ্ভিদবিজ্ঞান বিভাগ</text>
  <text x="830" y="107" font-size="14" font-weight="bold" fill="#1f2937" text-anchor="end">জগন্নাথ বিশ্ববিদ্যালয়</text>
  <text x="830" y="125" font-size="12" fill="#374151" text-anchor="end">ঢাকা- ১১০০, বাংলাদেশ</text>
  <text x="830" y="141" font-size="11" fill="#4b5563" text-anchor="end">ফোনঃ ৮৮০-২-৯৫৮৩৭৬৬</text>

  <!-- Center Logo Emblem -->
  <circle cx="450" cy="105" r="32" fill="#f0f9f4" stroke="#006a4e" stroke-width="1.5"/>
  <text x="450" y="100" font-size="9" font-weight="bold" fill="#006a4e" text-anchor="middle">জগন্নাথ</text>
  <text x="450" y="114" font-size="8" font-weight="bold" fill="#006a4e" text-anchor="middle">বিশ্ববিদ্যালয়</text>

  <!-- Top Divider -->
  <line x1="70" y1="160" x2="830" y2="160" stroke="#111827" stroke-width="1.2"/>

  <!-- Decisions 6 to 9 -->
  <text x="70" y="200" font-size="13.5" font-weight="bold" fill="#111827">সিদ্ধান্ত ৬:</text>
  <text x="70" y="225" font-size="13" fill="#1f2937">অ্যাসোসিয়েশনের প্রথম সাধারণ সভায় খসড়া গঠনতন্ত্র অনুমোদন ও অনুমোদিত গঠনতন্ত্র মোতাবেক পূর্ণাঙ্গ</text>
  <text x="70" y="248" font-size="13" fill="#1f2937">কমিটি গঠিত হবে। গঠনতন্ত্র মোতাবেক প্রথম পূর্ণাঙ্গ কমিটি গঠনে অ্যালামনাই অ্যাসোসিয়েশনের গঠন সংক্রান্ত</text>
  <text x="70" y="271" font-size="13" fill="#1f2937">কমিটির সভাপতি প্রধান নির্বাচন কমিশনারের দায়িত্ব পালন করবেন।</text>

  <text x="70" y="315" font-size="13.5" font-weight="bold" fill="#111827">সিদ্ধান্ত ৭:</text>
  <text x="70" y="340" font-size="13" fill="#1f2937">অ্যালামনাই অ্যাসোসিয়েশন গঠন সংক্রান্ত কমিটির সভাপতির অনুমোদন ক্রমে আহ্বায়ক কমিটি প্রয়োজনে সদস্য</text>
  <text x="70" y="363" font-size="13" fill="#1f2937">সংযোজন/বিয়োজন করতে পারবে।</text>

  <text x="70" y="405" font-size="13.5" font-weight="bold" fill="#111827">সিদ্ধান্ত ৮:</text>
  <text x="70" y="430" font-size="13" fill="#1f2937">অ্যালামনাইগণ নিজ দায়িত্বে আহ্বায়ক কমিটির অথবা প্রতিনিধি মাধ্যমে পূরণকৃত সদস্য ফরম ও ফি অ্যালামনাই</text>
  <text x="70" y="453" font-size="13" fill="#1f2937">অ্যাসোসিয়েশনের গঠন সংক্রান্ত কমিটির সভাপতি বরাবর প্রেরণ করবেন। বিভাগে অ্যালামনাই সংক্রান্ত একটি</text>
  <text x="70" y="476" font-size="13" fill="#1f2937">রেজিস্টার সংরক্ষিত থাকবে।</text>

  <text x="70" y="520" font-size="13.5" font-weight="bold" fill="#111827">সিদ্ধান্ত ৯:</text>
  <text x="70" y="545" font-size="13" fill="#1f2937">সভায় জগন্নাথ বিশ্ববিদ্যালয়ের উদ্ভিদবিজ্ঞান বিভাগ থেকে ডিগ্রিপ্রাপ্ত সকলকে সদস্য হয়ে অ্যাসোসিয়েশনের</text>
  <text x="70" y="568" font-size="13" fill="#1f2937">কার্যক্রম বেগবান করার আহ্বান জানানো হয়।</text>

  <!-- Conclusion -->
  <text x="70" y="630" font-size="13" fill="#1f2937">আর কোন আলোচ্য বিষয় না থাকায় সভাপতি সকলকে ধন্যবাদ জানিয়ে সভার সমাপ্তি ঘোষণা করেন।</text>

  <!-- Signature Stamp & Details -->
  <g transform="translate(480, 720)">
    <path d="M50,40 Q80,20 120,45 T190,30" stroke="#003366" stroke-width="2.5" fill="none"/>
    <text x="130" y="70" font-size="13" font-weight="bold" fill="#003366">০৪/০৮/২০১৭</text>
    
    <text x="130" y="100" font-size="14.5" font-weight="bold" fill="#111827" text-anchor="middle">অধ্যাপক ড. মোঃ মনিরুজ্জামান খন্দকার</text>
    <text x="130" y="125" font-size="13" font-weight="bold" fill="#1f2937" text-anchor="middle">সভাপতি</text>
    <text x="130" y="148" font-size="12.5" fill="#374151" text-anchor="middle">অ্যালামনাই অ্যাসোসিয়েশন গঠন সংক্রান্ত কমিটি</text>
    <text x="130" y="171" font-size="12.5" fill="#374151" text-anchor="middle">উদ্ভিদবিজ্ঞান বিভাগ</text>
    <text x="130" y="194" font-size="12.5" fill="#374151" text-anchor="middle">জগন্নাথ বিশ্ববিদ্যালয়, ঢাকা</text>

    <text x="130" y="225" font-size="10.5" font-style="italic" fill="#4b5563" text-anchor="middle">Dr. Md. Maniruzzaman Khandaker</text>
    <text x="130" y="242" font-size="10.5" font-style="italic" fill="#4b5563" text-anchor="middle">Professor</text>
    <text x="130" y="259" font-size="10" font-style="italic" fill="#4b5563" text-anchor="middle">Department of Botany</text>
    <text x="130" y="275" font-size="10" font-style="italic" fill="#4b5563" text-anchor="middle">Jagannath University, Dhaka.</text>
  </g>

  <!-- Footer file ref -->
  <text x="700" y="1220" font-size="11" font-family="monospace" fill="#6b7280">E:\\Alumni\\Alumni Committee.doc 3</text>
</svg>`;

fs.writeFileSync(path.join(outDir, 'page_1.svg'), page1Svg, 'utf-8');
fs.writeFileSync(path.join(outDir, 'page_2.svg'), page2Svg, 'utf-8');
fs.writeFileSync(path.join(outDir, 'page_3.svg'), page3Svg, 'utf-8');

console.log('SVG document pages generated successfully in public/images/convening_1st/');
