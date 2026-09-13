import React from 'react';
import { X, Download, Printer, Share2, FileText, Calendar, Building, CheckCircle2 } from 'lucide-react';
import { NoticeItem } from '../data/portalData';
import { BD_GOV_SEAL_DATA, BD_GOV_SEAL_SVG_URL } from '../assets/imageConstants';

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
        ? `"${title}" - পিডিএফ সরকারি সার্কুলার ডাউনলোড শুরু হয়েছে।`
        : `Downloading Official PDF Circular for "${title}"`
    );
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-lg shadow-2xl border border-gray-200 max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="bg-[#006a4e] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-300" />
            <span className="font-bold text-sm md:text-base">
              {language === 'bn' ? 'সরকারি আদেশ / নোটিশ বিবরণ' : 'Official Notice / Circular Detail'}
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
        <div className="p-6 md:p-8 overflow-y-auto flex-1 bg-[#fdfdfd] space-y-6">
          {/* Government Letterhead Header */}
          <div className="text-center space-y-1 pb-4 border-b border-gray-300">
            <div className="w-12 h-12 mx-auto rounded-full overflow-hidden border border-amber-500/50 mb-2">
              <img
                src={BD_GOV_SEAL_DATA}
                alt="BD Seal"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = BD_GOV_SEAL_SVG_URL;
                }}
              />
            </div>
            <h3 className="font-bold text-lg text-gray-900 font-serif">
              {language === 'bn' ? 'গণপ্রজাতন্ত্রী বাংলাদেশ সরকার' : "Government of the People's Republic of Bangladesh"}
            </h3>
            <p className="text-sm font-semibold text-[#006a4e]">
              {language === 'bn' ? 'অর্থ বিভাগ, অর্থ মন্ত্রণালয়' : 'Finance Division, Ministry of Finance'}
            </p>
            <p className="text-xs text-gray-600">
              {language === 'bn' ? 'বাংলাদেশ সচিবালয়, ঢাকা' : 'Bangladesh Secretariat, Dhaka'}
            </p>
          </div>

          {/* Reference and Date Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-gray-700 bg-gray-100 p-3 rounded border border-gray-200 gap-2">
            <div>
              <span className="font-bold text-gray-900">
                {language === 'bn' ? 'স্মারক নম্বর: ' : 'Ref No: '}
              </span>
              <span className="font-mono text-[#006a4e] font-semibold">{notice.refNo}</span>
            </div>
            <div>
              <span className="font-bold text-gray-900">
                {language === 'bn' ? 'তারিখ: ' : 'Date: '}
              </span>
              <span>{notice.date}</span>
            </div>
          </div>

          {/* Subject / Notice Title */}
          <div className="space-y-2">
            <div className="inline-block bg-amber-100 text-amber-900 text-xs font-bold px-2.5 py-1 rounded">
              {language === 'bn' ? notice.categoryBn : notice.categoryEn}
            </div>
            <h2 className="text-lg md:text-xl font-bold text-gray-900 leading-snug">
              {title}
            </h2>
          </div>

          {/* Main Document Content */}
          <div className="bg-white p-5 rounded border border-gray-200 text-sm text-gray-800 leading-relaxed space-y-3 font-serif">
            <p>{details}</p>
            {notice.pdfUrl && (
              <div className="my-3 rounded overflow-hidden border border-gray-300 bg-gray-50 flex justify-center p-2">
                <img
                  src={notice.pdfUrl}
                  alt={title}
                  referrerPolicy="no-referrer"
                  className="max-h-[350px] w-auto object-contain rounded shadow-sm"
                />
              </div>
            )}
            <p className="text-xs text-gray-600 italic">
              {language === 'bn'
                ? 'সংশ্লিষ্ট সকল কর্মকর্তা ও কর্মচারীকে এ নির্দেশনামা যথাযথভাবে প্রতিপালন করতে অনুরোধ করা হলো।'
                : 'All concerned officers and staff are requested to comply with these guidelines accordingly.'}
            </p>
          </div>

          {/* Signature Block Simulation */}
          <div className="pt-6 flex justify-end text-center text-xs text-gray-700">
            <div className="space-y-1">
              <div className="font-bold font-serif text-gray-900">
                {language === 'bn' ? 'রাষ্ট্রপতির আদেশক্রমে' : 'By order of the President'}
              </div>
              <div className="w-32 border-b border-dashed border-gray-400 my-4 mx-auto" />
              <div className="font-semibold text-[#006a4e]">
                {language === 'bn' ? 'যুগ্মসচিব (প্রশাসন)' : 'Joint Secretary (Admin)'}
              </div>
              <div className="text-[11px] text-gray-500">
                {language === 'bn' ? 'অর্থ বিভাগ, অর্থ মন্ত্রণালয়' : 'Finance Division, Ministry of Finance'}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="bg-gray-100 px-6 py-3 border-t border-gray-200 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            {language === 'bn' ? 'অনুমোদিত ও যাচাইকৃত কপি' : 'Verified Digital Record'}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'প্রিন্ট' : 'Print'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="bg-[#006a4e] hover:bg-[#00523d] text-white px-4 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
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
