import React from 'react';
import { 
  ArrowLeft, 
  Target, 
  CheckCircle2, 
  GraduationCap
} from 'lucide-react';

interface ObjectivesPageProps {
  language: 'bn' | 'en';
  onBackToHome: () => void;
  onNavigateToAbout?: () => void;
}

export const ObjectivesPage: React.FC<ObjectivesPageProps> = ({ 
  language, 
  onBackToHome,
  onNavigateToAbout 
}) => {
  const objectivesList = [
    {
      id: 'a',
      letterBn: '(ক)',
      letterEn: '(a)',
      textBn: 'অ্যালামনাইদের মধ্যে একতা, সৌহার্দ্য, সম্প্রীতি ও ভ্রাতৃত্ববোধ স্থাপন ও তা সুদৃঢ় করা এবং সদস্যদের মধ্যে সাহায্য ও সহযোগিতার মনোভাব গড়ে তোলা;',
      textEn: 'To establish and strengthen unity, harmony, fraternity, and goodwill among alumni, and to nurture an ethos of mutual support and cooperation;'
    },
    {
      id: 'b',
      letterBn: '(খ)',
      letterEn: '(b)',
      textBn: 'অ্যালামনাই অ্যাসোসিয়েশন ও তার সদস্যদের তথ্য সংরক্ষণ;',
      textEn: 'To record, maintain, and preserve updated profiles, directories, and data of the Alumni Association and its members;'
    },
    {
      id: 'c',
      letterBn: '(গ)',
      letterEn: '(c)',
      textBn: 'অ্যালামনাইদের স্বার্থ সংরক্ষণ;',
      textEn: 'To safeguard, uphold, and protect the legitimate rights, welfare, and interests of alumni;'
    },
    {
      id: 'd',
      letterBn: '(ঘ)',
      letterEn: '(d)',
      textBn: 'অ্যালামনাইদের জন্য সভা, সেমিনার, কর্মশিবির, প্রদর্শনী, ক্রীড়া, পুনর্মিলনী, বনভোজনের ও অন্যান্য অনুষ্ঠানের আয়োজন;',
      textEn: 'To organize conferences, seminars, workshops, exhibitions, sporting events, reunions, picnics, and social gatherings for alumni;'
    },
    {
      id: 'e',
      letterBn: '(ঙ)',
      letterEn: '(e)',
      textBn: 'অ্যালামনাই ও তার পরিবারস্থ সদস্য বা শিক্ষার্থীদের জন্য প্রণোদনামূলক কর্মসূচি গ্রহণ;',
      textEn: 'To formulate and implement motivational initiatives, welfare benefits, and incentive programs for alumni, their families, and students;'
    },
    {
      id: 'f',
      letterBn: '(চ)',
      letterEn: '(f)',
      textBn: 'নিয়মিত বুলেটিন, সাময়িকী, স্মরণিকা মুদ্রণ ও বিভিন্ন প্রকাশনা প্রকাশ;',
      textEn: 'To regularly print, publish, and circulate bulletins, periodicals, souvenir magazines, research briefs, and diverse publications;'
    },
    {
      id: 'g',
      letterBn: '(ছ)',
      letterEn: '(g)',
      textBn: 'জাতীয় ও আন্তর্জাতিক পর্যায়ে অ্যালামনাইদের দক্ষতা উন্নয়ন ও কর্মক্ষেত্র সৃজন করা ও কর্মপ্রাপ্তিতে সহযোগিতা করা;',
      textEn: 'To facilitate professional skill development, foster entrepreneurship, create employment avenues, and assist alumni in career placement at national and international levels;'
    },
    {
      id: 'h',
      letterBn: '(জ)',
      letterEn: '(h)',
      textBn: 'জরুরি প্রয়োজনে আর্তমানবতার সেবামূলক কার্যক্রম গ্রহণ;',
      textEn: 'To undertake humanitarian, philanthropic, emergency relief, and charitable activities during national crises or community emergencies;'
    },
    {
      id: 'i',
      letterBn: '(ঝ)',
      letterEn: '(i)',
      textBn: 'শিক্ষার্থী ও অ্যালামনাইদের শিক্ষা ও গবেষণা উন্নয়নে কর্মসূচি গ্রহণ;',
      textEn: 'To launch and implement programs fostering higher education, academic excellence, scientific research, and botanical innovations among students and alumni;'
    },
    {
      id: 'j',
      letterBn: '(ঞ)',
      letterEn: '(j)',
      textBn: 'অ্যাসোসিয়েশনের সদস্যদের মধ্যে কেউ সামাজিক বা স্বাস্থ্যগত বিপর্যয়ের মুখোমুখি হলে তাঁর সার্বিক সাহায্যে এগিয়ে আসা;',
      textEn: 'To extend comprehensive solidarity, mutual aid, medical assistance, and emergency support to any member of the association facing social or health adversities;'
    },
    {
      id: 'k',
      letterBn: '(ট)',
      letterEn: '(k)',
      textBn: 'অ্যাসোসিয়েশনের সদস্য অথবা তাঁদের স্ত্রী/স্বামী সন্তানদের মধ্যে জাতীয় বা আন্তর্জাতিক পর্যায়ে কোন কৃতিত্ব অর্জনকারীকে বাৎসরিক সমাবেশের সময় সংবর্ধনা প্রদান;',
      textEn: 'To accord formal civic honors, accolades, and reception during the annual gathering to members, their spouses, or children for distinguished achievements at national or international levels;'
    },
    {
      id: 'l',
      letterBn: '(ঠ)',
      letterEn: '(l)',
      textBn: 'উপরোক্ত লক্ষ্য ও উদ্দেশ্য অর্জনে তথা অ্যালামনাইদের প্রতি দায়মোচনের প্রযোজ্য ক্ষেত্রে সহায়তা প্রদান।',
      textEn: 'To render all requisite assistance and measures in realizing the aforementioned aims and objectives and in fulfilling institutional obligations toward alumni wherever applicable.'
    }
  ];

  return (
    <div className="w-full bg-[#f8faf9] min-h-screen py-6 px-3 sm:px-6 md:px-8 font-siliguri animate-in fade-in duration-300">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Top Breadcrumb / Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-xl border border-emerald-100 shadow-2xs no-print">
          <div className="flex items-center gap-2">
            <button
              onClick={onBackToHome}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-[#006a4e] rounded-lg text-xs sm:text-sm font-bold transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{language === 'bn' ? 'হোম বাতায়নে ফিরুন' : 'Back to Home'}</span>
            </button>

            {onNavigateToAbout && (
              <button
                onClick={onNavigateToAbout}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-emerald-50 text-gray-700 hover:text-[#006a4e] rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer border border-gray-200 hover:border-emerald-200"
              >
                <GraduationCap className="w-4 h-4" />
                <span>{language === 'bn' ? 'অ্যাসোসিয়েশন পরিচিতি' : 'About Association'}</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] sm:text-xs font-bold text-[#006a4e] bg-emerald-100/70 px-3 py-1 rounded-full border border-emerald-200">
              {language === 'bn' ? 'গঠনতন্ত্র ও নীতিমালা' : 'Constitution & Policy'}
            </span>
          </div>
        </div>

        {/* Document Content List */}
        <div className="bg-white border border-emerald-200/80 rounded-2xl p-4 sm:p-7 shadow-xs space-y-4">
          
          <div className="flex flex-wrap items-center justify-between pb-3 border-b border-emerald-100 gap-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-emerald-50 text-[#006a4e] border border-emerald-200/60">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 font-serif-bn">
                  {language === 'bn' ? 'লক্ষ্য ও উদ্দেশ্য' : 'Aims & Objectives'}
                </h1>
                <p className="text-xs text-gray-500">
                  {language === 'bn' ? 'উদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশন জগন্নাথ বিশ্ববিদ্যালয়, ঢাকা' : 'Botany Alumni Association Jagannath University, Dhaka'}
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              {language === 'bn' ? 'মোট ১২টি ধারা' : 'Total 12 Clauses'}
            </span>
          </div>

          <div className="p-3.5 sm:p-4 bg-emerald-50/70 rounded-xl border border-emerald-200/80 text-xs sm:text-sm font-semibold text-emerald-950 leading-relaxed">
            {language === 'bn'
              ? 'লক্ষ্য ও উদ্দেশ্য: উদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশন জগন্নাথ বিশ্ববিদ্যালয়ের লক্ষ্য ও উদ্দেশ্য নিম্নরূপ:'
              : 'Aims & Objectives: The aims and objectives of Botany Alumni Association Jagannath University are as follows:'}
          </div>

          {/* Clauses Cards Grid / List */}
          <div className="space-y-3 pt-1">
            {objectivesList.map((item, idx) => (
              <div 
                key={item.id}
                id={`clause-${item.id}`}
                className="group flex items-start gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-xl bg-[#fafdfa] hover:bg-emerald-50/60 border border-emerald-100/90 hover:border-emerald-300 transition-all duration-200 shadow-2xs"
              >
                {/* Clause Badge */}
                <span className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#006a4e] to-[#004d38] text-amber-300 flex items-center justify-center text-xs sm:text-sm font-bold shrink-0 mt-0.5 font-anek shadow-xs border border-emerald-500/30 group-hover:scale-105 transition-transform">
                  {language === 'bn' ? item.letterBn : item.letterEn}
                </span>

                {/* Clause Content */}
                <div className="flex-1 min-w-0 pt-0.5 space-y-1">
                  <p className="text-sm sm:text-base text-gray-900 leading-relaxed font-semibold font-siliguri">
                    {language === 'bn' ? item.textBn : item.textEn}
                  </p>
                  {language === 'bn' ? (
                    <p className="text-xs text-gray-500 leading-relaxed font-sans italic hidden group-hover:block transition-all">
                      {item.textEn}
                    </p>
                  ) : (
                    <p className="text-xs text-emerald-800 leading-relaxed font-serif-bn hidden group-hover:block transition-all">
                      {item.textBn}
                    </p>
                  )}
                </div>

                <div className="text-emerald-300 group-hover:text-emerald-600 transition-colors pt-1 shrink-0">
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              </div>
            ))}
          </div>

          {/* Footer of the Box */}
          <div className="mt-6 pt-5 border-t border-emerald-100 bg-emerald-50/60 p-4 rounded-xl border border-emerald-200/70 text-center space-y-2">
            <p className="text-xs sm:text-sm text-emerald-950 font-bold">
              {language === 'bn'
                ? 'উদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশন জগন্নাথ বিশ্ববিদ্যালয়, ঢাকা-১১০০'
                : 'Botany Alumni Association Jagannath University, Dhaka-1100'}
            </p>
            <p className="text-xs text-gray-600">
              {language === 'bn'
                ? 'অনুমোদিত খসড়া গঠনতন্ত্র অনুসারে সংরক্ষিত।'
                : 'Recorded in accordance with the approved constitution.'}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
