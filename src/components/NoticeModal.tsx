import React from 'react';
import { X, Download, Printer, FileText, CheckCircle2 } from 'lucide-react';
import { NoticeItem } from '../data/portalData';

interface NoticeModalProps {
  notice: NoticeItem | null;
  language: 'bn' | 'en';
  onClose: () => void;
}

export const NoticeModal: React.FC<NoticeModalProps> = ({
  notice,
  language,
  onClose,
}) => {
  if (!notice) return null;

  const title = language === 'bn' ? notice.titleBn : notice.titleEn;
  const details = language === 'bn' ? notice.detailsBn : notice.detailsEn;

  const handleDownload = () => {
    alert(
      language === 'bn'
        ? `"${title}" - পিডিএফ নোটিশ ডাউনলোড শুরু হয়েছে।`
        : `Downloading PDF for "${title}"`
    );
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200 app-modal-overlay">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="bg-[#005c36] text-white px-5 py-3.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-300" />
            <span className="font-bold text-sm sm:text-base font-serif-bn">
              {language === 'bn' ? 'অফিসিয়াল নোটিশ বিবরণ' : 'Official Notice Detail'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Official Document Paper body */}
        <div className="p-5 sm:p-8 overflow-y-auto flex-1 bg-[#fcfdfd] space-y-5">
          {/* Alumni Letterhead Header */}
          <div className="text-center space-y-1 pb-4 border-b-2 border-emerald-800/30">
            <div className="w-16 h-16 mx-auto rounded-full overflow-hidden border-2 border-emerald-700 shadow-xs mb-2">
              <img
                src="/jnu_botany_alumni_logo.jpg"
                alt="JnU Botany Alumni Logo"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=150&q=80';
                }}
              />
            </div>
            <h3 className="font-extrabold text-base sm:text-xl text-emerald-950 font-serif-bn leading-tight">
              {language === 'bn' ? 'জগন্নাথ বিশ্ববিদ্যালয় উদ্ভিদবিজ্ঞান বিভাগ অ্যালামনাই অ্যাসোসিয়েশন' : 'Jagannath University Botany Alumni Association'}
            </h3>
            <p className="text-xs sm:text-sm font-bold text-emerald-800">
              {language === 'bn' ? 'উদ্ভিদবিজ্ঞান বিভাগ, জগন্নাথ বিশ্ববিদ্যালয়, ঢাকা-১০০০' : 'Department of Botany, Jagannath University, Dhaka-1000'}
            </p>
            <p className="text-[11px] sm:text-xs text-gray-600 font-mono">
              {language === 'bn' ? 'ইমেইল: botanyalumni.jnu@gmail.com | ওয়েবসাইট: www.jnubotanyalumni.org' : 'Email: botanyalumni.jnu@gmail.com | Web: www.jnubotanyalumni.org'}
            </p>
          </div>

          {/* Reference and Date Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-gray-700 bg-emerald-50/60 p-3 rounded-xl border border-emerald-200/80 gap-2">
            <div>
              <span className="font-bold text-gray-900">
                {language === 'bn' ? 'স্মারক নম্বর: ' : 'Ref No: '}
              </span>
              <span className="font-mono text-emerald-900 font-semibold">{notice.refNo}</span>
            </div>
            <div>
              <span className="font-bold text-gray-900">
                {language === 'bn' ? 'তারিখ: ' : 'Date: '}
              </span>
              <span className="font-semibold text-gray-800">{notice.date}</span>
            </div>
          </div>

          {/* Subject / Notice Title */}
          <div className="space-y-2">
            <div className="inline-block bg-amber-100 text-amber-900 text-xs font-bold px-2.5 py-1 rounded-md border border-amber-200">
              {language === 'bn' ? notice.categoryBn : notice.categoryEn}
            </div>
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 leading-snug font-serif-bn">
              {title}
            </h2>
          </div>

          {/* Main Document Content */}
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-gray-200 text-xs sm:text-sm text-gray-800 leading-relaxed space-y-3 font-siliguri shadow-2xs">
            <p className="whitespace-pre-line">{details}</p>
            {notice.pdfUrl && (
              <div className="my-3 rounded-lg overflow-hidden border border-gray-300 bg-gray-50 flex justify-center p-2">
                <img
                  src={notice.pdfUrl}
                  alt={title}
                  referrerPolicy="no-referrer"
                  className="max-h-[350px] w-auto object-contain rounded shadow-sm"
                />
              </div>
            )}
            <p className="text-xs text-emerald-800 italic pt-2 border-t border-gray-100">
              {language === 'bn'
                ? 'উদ্ভিদবিজ্ঞান বিভাগ অ্যালামনাই অ্যাসোসিয়েশনের সকল সম্মানিত সদস্য ও সংশ্লিষ্টদের অবগতির জন্য প্রকাশ করা হলো।'
                : 'Published for the information of all honorable members and concerned parties of the Botany Alumni Association.'}
            </p>
          </div>

          {/* Signature Block Simulation */}
          <div className="pt-4 grid grid-cols-2 text-center text-xs text-gray-700 gap-4 border-t border-gray-200">
            <div className="space-y-1">
              <div className="w-28 border-b border-dashed border-gray-400 my-3 mx-auto" />
              <div className="font-bold text-emerald-900 font-serif-bn">
                {language === 'bn' ? 'সাধারণ সম্পাদক' : 'General Secretary'}
              </div>
              <div className="text-[11px] text-gray-500">
                {language === 'bn' ? 'উদ্ভিদবিজ্ঞান বিভাগ অ্যালামনাই অ্যাসোসিয়েশন' : 'Botany Alumni Association'}
              </div>
            </div>

            <div className="space-y-1">
              <div className="w-28 border-b border-dashed border-gray-400 my-3 mx-auto" />
              <div className="font-bold text-emerald-900 font-serif-bn">
                {language === 'bn' ? 'সভাপতি' : 'President'}
              </div>
              <div className="text-[11px] text-gray-500">
                {language === 'bn' ? 'উদ্ভিদবিজ্ঞান বিভাগ অ্যালামনাই অ্যাসোসিয়েশন' : 'Botany Alumni Association'}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="bg-gray-100 px-5 py-3 border-t border-gray-200 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs text-emerald-800 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            {language === 'bn' ? 'যাচাইকৃত অফিসিয়াল ডিজিটাল নোটিশ' : 'Verified Official Digital Notice'}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-white hover:bg-gray-200 border border-gray-300 text-gray-800 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'প্রিন্ট' : 'Print'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="bg-[#005c36] hover:bg-[#004729] text-white px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'পিডিএফ ডাউনলোড' : 'Download PDF'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
