import React from 'react';
import { Phone, Mail, MapPin, GraduationCap, BookOpen, Library, Landmark, Award } from 'lucide-react';

interface FooterProps {
  language: 'bn' | 'en';
}

export const Footer: React.FC<FooterProps> = ({ language }) => {
  return (
    <footer id="main-portal-footer" className="w-full bg-[#16221d] text-white text-sm border-t-4 border-[#008e48] font-siliguri">
      <div className="w-full h-full">
        {/* Main footer contents */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Col 1: About Jagannath University - Botany */}
          <div className="space-y-3.5">
            <div className="flex flex-col items-start gap-3">
              {/* Logos on Top */}
              <div className="flex items-center gap-3">
                {/* Botany Alumni Association Logo */}
                <div className="w-13 h-13 sm:w-14 sm:h-14 shrink-0 flex items-center justify-center bg-white rounded-full p-0.5 shadow-md border border-emerald-400/60">
                  <img
                    src="/jnu_botany_alumni_logo.jpg"
                    alt="Botany Alumni Association Logo"
                    className="w-full h-full object-contain rounded-full"
                    referrerPolicy="no-referrer"
                  />
                </div>
                {/* Jagannath University Official Logo */}
                <div className="w-13 h-13 sm:w-14 sm:h-14 shrink-0 flex items-center justify-center bg-white rounded-full p-1 shadow-md border border-amber-400/60">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/en/thumb/4/47/Logo_of_Jagannath_University.svg/960px-Logo_of_Jagannath_University.svg.png?utm_source=en.wikipedia.org&utm_campaign=imageinfo&utm_content=thumbnail"
                    alt="Jagannath University Logo"
                    className="w-full h-full object-contain rounded-full"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://upload.wikimedia.org/wikipedia/en/4/47/Logo_of_Jagannath_University.svg";
                    }}
                  />
                </div>
              </div>

              {/* Text underneath */}
              <div>
                <h3 className="font-bold text-base sm:text-lg text-emerald-300 leading-tight">
                  {language === 'bn' ? 'উদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশন' : 'Botany Alumni Association'}
                </h3>
                <p className="text-amber-300 text-xs sm:text-sm font-bold mt-1">
                  {language === 'bn' ? 'জগন্নাথ বিশ্ববিদ্যালয়, ঢাকা' : 'Jagannath University, Dhaka'}
                </p>
              </div>
            </div>
            <p className="text-gray-300 leading-relaxed text-xs sm:text-sm">
              {language === 'bn'
                ? 'জগন্নাথ বিশ্ববিদ্যালয় উদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশনের অফিসিয়াল বাতায়ন। প্রাক্তন ও বর্তমান শিক্ষার্থীদের সেতুবন্ধন ও কল্যাণে নিবেদিত।'
                : 'Official Alumni Portal of Botany Alumni Association, Jagannath University. Fostering fraternity and student welfare.'}
            </p>
          </div>

          {/* Col 2: Association Wings & Activities */}
          <div className="space-y-3">
            <h4 className="font-bold text-amber-300 text-sm sm:text-base border-b border-emerald-800/80 pb-2 uppercase tracking-wide">
              {language === 'bn' ? 'অ্যালামনাই কার্যক্রম ও সেল' : 'Alumni Wings & Activities'}
            </h4>
            <ul className="space-y-2 text-gray-300 text-xs sm:text-sm">
              <li>
                <a href="#membership" className="hover:text-amber-300 transition-colors flex items-center gap-2">
                  <span className="text-amber-400 font-bold">&rsaquo;</span>
                  {language === 'bn' ? 'অ্যালামনাই সদস্য নিবন্ধন' : 'Alumni Member Registration'}
                </a>
              </li>
              <li>
                <a href="#members-directory" className="hover:text-amber-300 transition-colors flex items-center gap-2">
                  <span className="text-amber-400 font-bold">&rsaquo;</span>
                  {language === 'bn' ? 'নিবন্ধিত সদস্য ডিরেক্টরি' : 'Registered Member Directory'}
                </a>
              </li>
              <li>
                <a href="#reunion" className="hover:text-amber-300 transition-colors flex items-center gap-2">
                  <span className="text-amber-400 font-bold">&rsaquo;</span>
                  {language === 'bn' ? 'পুনর্মিলনী ও বার্ষিক উৎসব' : 'Reunion & Annual Gathering'}
                </a>
              </li>
              <li>
                <a href="#executive-committee" className="hover:text-amber-300 transition-colors flex items-center gap-2">
                  <span className="text-amber-400 font-bold">&rsaquo;</span>
                  {language === 'bn' ? 'কার্যনির্বাহী ও উপদেষ্টা পরিষদ' : 'Executive & Advisory Council'}
                </a>
              </li>
              <li>
                <a href="#scholarship-fund" className="hover:text-amber-300 transition-colors flex items-center gap-2">
                  <span className="text-amber-400 font-bold">&rsaquo;</span>
                  {language === 'bn' ? 'মেধা বৃত্তি ও কল্যাণ তহবিল' : 'Merit Scholarship & Welfare Fund'}
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Department Facilities */}
          <div className="space-y-3">
            <h4 className="font-bold text-amber-300 text-sm sm:text-base border-b border-emerald-800/80 pb-2 uppercase tracking-wide">
              {language === 'bn' ? 'বিভাগীয় ঐতিহ্য ও সুবিধা' : 'Department & Heritage'}
            </h4>
            <ul className="space-y-2 text-gray-300 text-xs sm:text-sm">
              <li>
                <a href="#seminar-library" className="hover:text-amber-300 transition-colors flex items-center gap-2">
                  <span className="text-amber-400 font-bold">&rsaquo;</span>
                  {language === 'bn' ? 'বিভাগীয় সেমিনার লাইব্রেরি' : 'Departmental Seminar Library'}
                </a>
              </li>
              <li>
                <a href="#smart-classroom" className="hover:text-amber-300 transition-colors flex items-center gap-2">
                  <span className="text-amber-400 font-bold">&rsaquo;</span>
                  {language === 'bn' ? 'মাল্টিমিডিয়া ও স্মার্ট ক্লাসরুম' : 'Multimedia & Smart Classrooms'}
                </a>
              </li>
              <li>
                <a href="#botany-club" className="hover:text-amber-300 transition-colors flex items-center gap-2">
                  <span className="text-amber-400 font-bold">&rsaquo;</span>
                  {language === 'bn' ? 'উদ্ভিদবিজ্ঞান ক্লাব ও রিসার্চ ফোরাম' : 'Botany Club & Research Forum'}
                </a>
              </li>
              <li>
                <a href="#study-tour" className="hover:text-amber-300 transition-colors flex items-center gap-2">
                  <span className="text-amber-400 font-bold">&rsaquo;</span>
                  {language === 'bn' ? 'বার্ষিক শিক্ষা সফর ও ফিল্ড রিসার্চ' : 'Annual Study Tour & Fieldwork'}
                </a>
              </li>
              <li>
                <a href="#gallery" className="hover:text-amber-300 transition-colors flex items-center gap-2">
                  <span className="text-amber-400 font-bold">&rsaquo;</span>
                  {language === 'bn' ? 'উদ্ভিদবিজ্ঞান অ্যালামনাই ফটো গ্যালারি' : 'Botany Alumni Photo Gallery'}
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Department Office */}
          <div className="space-y-3">
            <h4 className="font-bold text-amber-300 text-sm sm:text-base border-b border-emerald-800/80 pb-2 uppercase tracking-wide">
              {language === 'bn' ? 'সচিবালয় ও যোগাযোগ' : 'Secretariat & Contact'}
            </h4>
            <div className="space-y-2.5 text-gray-300 text-xs sm:text-sm">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4.5 h-4.5 text-emerald-400 shrink-0 mt-0.5" />
                <span className="font-siliguri">
                  {language === 'bn'
                    ? '৯-১০ চিত্তরঞ্জন এভিনিউ, ঢাকা-১১০০।'
                    : '9-10 Chittaranjan Ave, Dhaka 1100.'}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
                <a href="mailto:baajnu@gmail.com" className="hover:text-amber-300 transition-colors">
                  baajnu@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
                <a href="tel:+8801401996674" className="hover:text-amber-300 transition-colors font-mono">
                  +880 1401-996674
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="bg-[#0b120f] py-3.5 px-2 sm:px-6 border-t border-emerald-950 text-gray-300 text-[10px] min-[360px]:text-[11.5px] min-[400px]:text-xs sm:text-sm">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
            <span className="whitespace-nowrap tracking-tight sm:tracking-normal">
              {language === 'bn'
                ? 'কপিরাইট © ২০২৬ সর্বস্বত্ব সংরক্ষিত - উদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশন'
                : 'Copyright © 2026 All Rights Reserved - Botany Alumni Association'}
            </span>
            <span className="text-gray-300 font-medium flex items-center justify-center gap-1 text-[11px] sm:text-xs flex-wrap">
              Developed by{' '}
              <a
                href="https://www.facebook.com/ishamimalmamun"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-300 font-bold hover:underline transition-colors"
              >
                Shamim Al Mamun
              </a>{' '}
              | CEO of{' '}
              <a
                href="https://xfixbd.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-300 font-bold hover:underline transition-colors"
              >
                xfixbd.com
              </a>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
