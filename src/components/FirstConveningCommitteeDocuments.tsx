import React from 'react';
import { 
  Download, 
  FileText, 
  ExternalLink,
  Calendar,
  ShieldCheck
} from 'lucide-react';

interface FirstConveningCommitteeDocumentsProps {
  language: 'bn' | 'en';
}

export const FirstConveningCommitteeDocuments: React.FC<FirstConveningCommitteeDocumentsProps> = ({ language }) => {
  const pdfUrl = '/pdf/Alumni_Committee.pdf';

  const handleDownloadPdf = () => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = 'Alumni_Committee_1st_Convening.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 font-siliguri max-w-5xl mx-auto">
      {/* Top Header & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-emerald-50 border border-emerald-200 p-5 rounded-2xl shadow-xs">
        <div className="flex items-center gap-3 text-[#006a4e]">
          <div className="p-2.5 bg-[#006a4e] text-amber-300 rounded-xl shadow-xs">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-base sm:text-lg text-emerald-950 font-serif-bn">
              {language === 'bn' 
                ? '১ম আহ্বায়ক কমিটি (২০১৭) এর মূল অফিশিয়াল নথি (PDF)' 
                : '1st Convening Committee (2017) Official Document (PDF)'}
            </h3>
            <p className="text-xs text-emerald-800 flex items-center gap-2 mt-0.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              <span>{language === 'bn' ? 'তারিখ: ০৪ আগস্ট ২০১৭' : 'Date: 04 August 2017'}</span>
              <span className="text-emerald-400">•</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>{language === 'bn' ? 'মূল অনুমোদিত কপি' : 'Official Approved Copy'}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-emerald-950 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <ExternalLink className="w-4 h-4 text-emerald-950" />
            <span>{language === 'bn' ? 'দেখুন' : 'View'}</span>
          </a>

          <button
            type="button"
            onClick={handleDownloadPdf}
            className="px-4 py-2.5 bg-[#006a4e] hover:bg-[#00543e] text-amber-300 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{language === 'bn' ? 'পিডিএফ ডাউনলোড' : 'Download PDF'}</span>
          </button>
        </div>
      </div>

      {/* Embedded PDF Viewer */}
      <div className="bg-white border-2 border-emerald-100 rounded-2xl p-2 sm:p-4 shadow-md overflow-hidden">
        <div className="w-full h-[650px] sm:h-[800px] rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
          <iframe
            src={`${pdfUrl}#toolbar=1&navpanes=0&scrollbar=1`}
            title="1st Convening Committee Document PDF"
            className="w-full h-full border-0"
          />
        </div>
      </div>
    </div>
  );
};
