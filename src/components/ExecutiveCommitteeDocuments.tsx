import React, { useState } from 'react';
import { 
  Download, 
  Printer, 
  ZoomIn, 
  X, 
  FileImage 
} from 'lucide-react';

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
    titleBn: 'কার্যনির্বাহী কমিটি নথি - মূল কপি',
    titleEn: 'Executive Committee Document - Original Scan',
    imageSrc: '/images/executive/page_1.jpg',
    downloadFileName: 'Executive_Committee_Official_Document.jpg'
  }
];

interface ExecutiveCommitteeDocumentsProps {
  language: 'bn' | 'en';
}

export const ExecutiveCommitteeDocuments: React.FC<ExecutiveCommitteeDocumentsProps> = ({ language }) => {
  const [selectedImage, setSelectedImage] = useState<DocumentImageItem | null>(null);
  const [zoomScale, setZoomScale] = useState<number>(1);

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

  return (
    <div className="space-y-6 font-siliguri">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
        <div className="flex items-center gap-2 text-[#006a4e]">
          <FileImage className="w-5 h-5 text-emerald-700 shrink-0" />
          <span className="font-bold text-sm sm:text-base">
            {language === 'bn' 
              ? '১ম কার্যনির্বাহী কমিটি (২০২৪-২৬) এর মূল অফিশিয়াল ডকুমেন্টের আসল কপি' 
              : '1st Executive Committee (2024-26) Original Official Document Scan'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleDownload(EXECUTIVE_COMMITTEE_DOCUMENTS[0])}
            className="px-4 py-2 bg-[#006a4e] hover:bg-[#00543e] text-amber-300 rounded-lg text-xs sm:text-sm font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{language === 'bn' ? 'ডাউনলোড' : 'Download Document'}</span>
          </button>
        </div>
      </div>

      {/* Pure Image Grid */}
      <div className="max-w-2xl mx-auto">
        {EXECUTIVE_COMMITTEE_DOCUMENTS.map((item) => (
          <div
            key={item.id}
            className="bg-white border-2 border-emerald-100 hover:border-[#006a4e] rounded-2xl p-4 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group"
          >
            {/* Header Info */}
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-emerald-50">
              <span className="px-3 py-1 bg-[#006a4e] text-amber-300 text-xs font-bold rounded-md">
                {language === 'bn' ? 'কার্যনির্বাহী কমিটি নথি' : 'Executive Committee Document'}
              </span>
              <span className="text-xs text-gray-500 font-medium">
                {language === 'bn' ? 'অফিসিয়াল কপি' : 'Official Scan'}
              </span>
            </div>

            {/* Document Image Container with Zoom On Click */}
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

              {/* Hover Overlay */}
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

      {/* Fullscreen Zoom Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[96vh] flex flex-col shadow-2xl overflow-hidden border border-emerald-300">
            {/* Modal Header */}
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

            {/* Modal Image Viewer Body */}
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
