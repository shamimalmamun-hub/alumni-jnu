import React, { useState } from 'react';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';
import {
  X,
  Download,
  Printer,
  CreditCard,
  CheckCircle2,
  Share2,
  Check,
  Loader2,
  FileText,
  ExternalLink,
  ShieldCheck,
  User,
  Phone,
  Mail,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { CardMemberData } from './MemberCardModal';

interface MemberFormPdfModalProps {
  member: CardMemberData & Record<string, any>;
  language?: 'bn' | 'en';
  onClose: () => void;
  onOpenCard?: (member: CardMemberData) => void;
}

export const MemberFormPdfModal: React.FC<MemberFormPdfModalProps> = ({
  member,
  language = 'bn',
  onClose,
  onOpenCard,
}) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [isPrinting, setIsPrinting] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  if (!member) return null;

  const dateStr =
    member.applicationDate ||
    (member.createdAt
      ? new Date(member.createdAt).toLocaleDateString('en-GB')
      : new Date().toLocaleDateString('en-GB'));
  const memId = member.formNo || member.membershipId || member.id || 'BOT-ALUMNI-2026';
  const nameEn = member.applicantNameEn || member.nameEnglish || member.fullName || '';
  const nameBn = member.applicantNameBn || member.nameBangla || member.fullName || 'সম্মানিত সদস্য';
  const bscSess = member.bscSession || member.session || '';
  const bscYr = member.bscYear || '';
  const bscBt = member.bscBatch || member.batch || '';
  const mscSess = member.mscSession || '';
  const mscYr = member.mscYear || '';
  const mscBt = member.mscBatch || '';
  const mphilYr = member.mphilYear || '';
  const phdYr = member.phdYear || '';
  const fName = member.fathersName || '';
  const mName = member.mothersName || '';
  const presAddr = member.presentAddress || member.currentAddress || '';
  const pVillage = member.permVillage || member.village || '';
  const pPost = member.permPost || member.post || '';
  const pUpazila = member.permUpazila || member.upazila || '';
  const pDistrict = member.permDistrict || member.district || '';

  let dDay = member.dobDay || '';
  let dMonth = member.dobMonth || '';
  let dYear = member.dobYear || '';
  if ((!dDay || !dMonth || !dYear) && member.dateOfBirth) {
    const parts = member.dateOfBirth.split(/[-/.]/);
    if (parts.length === 3) {
      dDay = parts[0];
      dMonth = parts[1];
      dYear = parts[2];
    }
  }

  const em = member.email || '';
  const ph = member.phone || member.mobile || '';
  const bg = member.bloodGroup || '';
  const nid = member.nidNumber || '';
  const occ = member.occupation || member.occupationCategory || '';
  const otherOcc = member.otherOccupation || '';
  const photo = member.userPhotoUrl || member.photoUrl || '';
  const sigUrl = member.signatureDataUrl || '';
  const sigName = member.signatureName || nameEn || nameBn;
  const memType =
    member.membershipType === 'life'
      ? 'Life Member'
      : member.membershipType === 'student'
      ? 'Student Member'
      : 'General Member';
  const fee = member.feeAmount || (member.membershipType === 'life' ? '2500' : '500');
  const pMethod = member.paymentMethod || 'bKash';
  const trxId = member.transactionId || 'VERIFIED';
  const isApproved = member.status === 'approved';

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/form/${encodeURIComponent(memId)}`
    : '';

  const handleCopyLink = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Generate & Download high-res vector A4 PDF
  const handleDownloadPdf = async () => {
    const element = document.getElementById('a4-member-filled-form-sheet');
    if (!element) return;

    try {
      setIsGeneratingPdf(true);
      setDownloadSuccess(false);

      if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
        await document.fonts.ready.catch(() => null);
      }

      await new Promise((resolve) => setTimeout(resolve, 150));

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: 1024,
        onclone: (clonedDoc) => {
          clonedDoc.querySelectorAll('.no-print').forEach((el) => {
            (el as HTMLElement).style.setProperty('display', 'none', 'important');
          });

          const clonedElement = clonedDoc.getElementById('a4-member-filled-form-sheet');
          if (clonedElement) {
            clonedElement.style.setProperty('display', 'block', 'important');
            clonedElement.style.setProperty('visibility', 'visible', 'important');
            clonedElement.style.setProperty('opacity', '1', 'important');
            clonedElement.style.setProperty('position', 'relative', 'important');
            clonedElement.style.setProperty('left', '0', 'important');
            clonedElement.style.setProperty('top', '0', 'important');
            clonedElement.style.setProperty('transform', 'none', 'important');
            clonedElement.style.setProperty('width', '794px', 'important');
            clonedElement.style.setProperty('max-width', '794px', 'important');
            clonedElement.style.setProperty('min-width', '794px', 'important');
            clonedElement.style.setProperty('margin', '0 auto', 'important');
            clonedElement.style.setProperty('box-sizing', 'border-box', 'important');
            clonedElement.style.setProperty('background-color', '#ffffff', 'important');
          }
        },
      });

      if (!canvas || canvas.width === 0 || canvas.height === 0) {
        throw new Error('Canvas render was empty.');
      }

      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const sideMargin = 6;
      const topMargin = 6;
      const availableWidth = pdfWidth - sideMargin * 2;
      const availableHeight = pdfHeight - topMargin * 2;
      const imgHeight = (canvas.height * availableWidth) / canvas.width;

      if (imgHeight <= availableHeight) {
        const offsetY = topMargin + (availableHeight - imgHeight) / 2;
        pdf.addImage(imgData, 'JPEG', sideMargin, offsetY, availableWidth, imgHeight);
      } else {
        const scaleFactor = availableHeight / imgHeight;
        const finalWidth = availableWidth * scaleFactor;
        const offsetX = (pdfWidth - finalWidth) / 2;
        pdf.addImage(imgData, 'JPEG', offsetX, topMargin, finalWidth, availableHeight);
      }

      const safeName = (nameEn || nameBn || 'Alumni').replace(/[^a-zA-Z0-9_-]/g, '_');
      const safeId = memId.replace(/[^a-zA-Z0-9_-]/g, '_');
      const fileName = `Botany_Alumni_Application_Form_${safeId}_${safeName}.pdf`;

      const blob = pdf.output('blob');
      const blobUrl = URL.createObjectURL(blob);
      const downloadLink = document.createElement('a');
      downloadLink.href = blobUrl;
      downloadLink.download = fileName;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 3000);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error('PDF generation error:', err);
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 200);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto font-sans animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-4xl w-full p-3.5 sm:p-6 space-y-4 shadow-2xl border-2 border-[#006a4e] relative my-4 sm:my-6 max-h-[94vh] overflow-y-auto">
        
        {/* Top Action Bar (no-print) */}
        <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 shrink-0 flex items-center justify-center bg-white rounded-full p-0.5 border-2 border-[#006a4e] shadow-2xs">
              <img
                src="/jnu_botany_alumni_logo.jpg"
                alt="Botany Alumni Logo"
                className="w-full h-full object-contain rounded-full"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://upload.wikimedia.org/wikipedia/en/thumb/2/23/Jagannath_University_Logo.svg/512px-Jagannath_University_Logo.svg.png';
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg text-gray-900 font-sans">
                  {language === 'bn' ? 'পূরণকৃত সদস্য আবেদন ফরম' : 'Filled Application Form'}
                </h3>
                {isApproved ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full uppercase">
                    <CheckCircle2 className="w-3 h-3" />
                    {language === 'bn' ? 'অনুমোদিত সদস্য' : 'Approved Member'}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-full uppercase">
                    {language === 'bn' ? 'আবেদন জমাকৃত' : 'Submitted'}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 font-mono">
                {language === 'bn' ? 'ফরম নং:' : 'Form No:'} <strong className="text-[#006a4e]">{memId}</strong> •{' '}
                <span className="text-gray-800 font-semibold">{nameBn || nameEn}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-end sm:self-center">
            {/* Download PDF Button */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="px-3.5 py-2 bg-[#006a4e] hover:bg-[#004d38] disabled:opacity-50 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95"
              title={language === 'bn' ? 'অফিসিয়াল আবেদনপত্রের PDF ডাউনলোড করুন' : 'Download Official Form PDF'}
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{language === 'bn' ? 'প্রস্তুত হচ্ছে...' : 'Generating...'}</span>
                </>
              ) : downloadSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-200" />
                  <span>{language === 'bn' ? 'ডাউনলোড সফল!' : 'Downloaded!'}</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'PDF ডাউনলোড' : 'Download PDF'}</span>
                </>
              )}
            </button>

            {/* Print Form */}
            <button
              type="button"
              onClick={handlePrint}
              disabled={isPrinting}
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs border border-gray-200"
              title={language === 'bn' ? 'ফরম প্রিন্ট করুন' : 'Print Form'}
            >
              <Printer className="w-3.5 h-3.5 text-gray-600" />
              <span className="hidden sm:inline">{language === 'bn' ? 'প্রিন্ট' : 'Print'}</span>
            </button>

            {/* Open Member ID Card if callback provided */}
            {onOpenCard && (
              <button
                type="button"
                onClick={() => onOpenCard(member)}
                className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-[#006a4e] border border-emerald-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title={language === 'bn' ? 'ডিজিটাল আইডি কার্ড দেখুন' : 'View Member ID Card'}
              >
                <CreditCard className="w-3.5 h-3.5 text-[#006a4e]" />
                <span>{language === 'bn' ? 'আইডি কার্ড' : 'ID Card'}</span>
              </button>
            )}

            {/* Copy Share Link */}
            <button
              type="button"
              onClick={handleCopyLink}
              className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl border border-gray-200 transition-colors cursor-pointer"
              title={language === 'bn' ? 'ফরমের লিংক কপি করুন' : 'Copy Form Link'}
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            </button>

            {/* Close Modal */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl text-lg font-bold cursor-pointer transition-colors leading-none ml-1"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Informative Status Banner (no-print) */}
        <div className="no-print bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-emerald-950">
            <Sparkles className="w-4 h-4 text-[#006a4e] shrink-0" />
            <span>
              {language === 'bn'
                ? 'এটি আপনার পূরণকৃত অফিসিয়াল আবেদন ফরম। উপরের বাটনে ক্লিক করে সরাসরি PDF ডাউনলোড বা প্রিন্ট করে সংরক্ষণ করতে পারবেন।'
                : 'This is your official filled application form. Click the Download PDF button above to save your copy.'}
            </span>
          </div>
          <div className="text-[11px] font-mono text-emerald-800 shrink-0 bg-white/80 px-2 py-0.5 rounded border border-emerald-200">
            {shareUrl}
          </div>
        </div>

        {/* ================= OFFICIAL PRINTABLE HIGH-RES A4 MEMBERSHIP FORM SHEET ================= */}
        <div
          id="a4-member-filled-form-sheet"
          className="w-full bg-white border-2 border-[#006a4e] p-4 sm:p-7 text-gray-900 relative shadow-sm font-sans"
        >
          {/* Top Header Banner */}
          <div className="w-full bg-[#006a4e] text-white p-2.5 sm:p-4 rounded-lg border-b-4 border-amber-400 flex flex-row items-center justify-between gap-2 sm:gap-4 relative mb-4 font-sans overflow-hidden shadow-xs">
            {/* Alumni Logo Left */}
            <div className="flex items-center shrink-0">
              <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center bg-white rounded-full p-1 shadow-md border-2 border-amber-400/80">
                <img
                  src="/jnu_botany_alumni_logo.jpg"
                  alt="Botany Alumni Logo"
                  className="w-full h-full object-contain rounded-full"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://upload.wikimedia.org/wikipedia/en/thumb/2/23/Jagannath_University_Logo.svg/512px-Jagannath_University_Logo.svg.png';
                  }}
                />
              </div>
            </div>

            {/* University & Department Titles */}
            <div className="text-center flex-1 space-y-0.5 sm:space-y-1">
              <p className="text-[9px] sm:text-xs tracking-wider uppercase text-emerald-100 font-bold">
                DEPARTMENT OF BOTANY • ALUMNI ASSOCIATION
              </p>
              <h1 className="text-xs sm:text-base md:text-xl font-black tracking-wide leading-tight uppercase font-serif text-white">
                JAGANNATH UNIVERSITY, DHAKA
              </h1>
              <div className="inline-block bg-white text-[#006a4e] px-2 sm:px-4 py-0.5 rounded-full font-black text-[10px] sm:text-xs shadow-xs border border-amber-400">
                APPLICATION FORM FOR MEMBERSHIP
              </div>
            </div>

            {/* JnU Logo Right */}
            <div className="flex items-center shrink-0">
              <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center bg-white rounded-full p-1 shadow-md border-2 border-amber-400/80">
                <img
                  src="https://upload.wikimedia.org/wikipedia/en/thumb/2/23/Jagannath_University_Logo.svg/512px-Jagannath_University_Logo.svg.png"
                  alt="JnU Logo"
                  className="w-full h-full object-contain rounded-full"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>

          {/* Form Meta Bar & Passport Photo */}
          <div className="flex flex-row justify-between items-start gap-4 mb-4">
            <div className="space-y-2 text-xs flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-700">Form / Member ID:</span>
                <span className="font-mono font-black text-sm text-[#006a4e] border-b-2 border-dashed border-[#006a4e] px-2 pb-0.5">
                  {memId}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-700">Date of Application:</span>
                <span className="font-medium text-gray-800 border-b border-gray-400 px-2">
                  {dateStr}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-700">Membership Category:</span>
                <span className="font-bold text-[#006a4e] uppercase bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                  {memType}
                </span>
              </div>
            </div>

            {/* Applicant Passport Photo */}
            <div className="w-24 h-28 sm:w-28 sm:h-32 border-2 border-[#006a4e] bg-gray-50 rounded-lg overflow-hidden flex flex-col items-center justify-center relative shadow-xs shrink-0">
              {photo ? (
                <img
                  src={photo}
                  alt={nameEn || 'Applicant Photo'}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="p-2 text-center text-gray-400 space-y-1">
                  <User className="w-8 h-8 mx-auto text-gray-300" />
                  <span className="text-[9px] block leading-tight font-medium">
                    Passport Size Photo
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Form Fields: English Typography */}
          <div className="space-y-3.5 text-xs text-gray-800">
            {/* 1. Name */}
            <div className="border border-gray-300 rounded-lg p-3 space-y-2 bg-gray-50/40">
              <div className="flex items-center gap-2 font-bold text-gray-900 border-b border-gray-200 pb-1">
                <span className="w-5 h-5 rounded-full bg-[#006a4e] text-white flex items-center justify-center text-[10px]">
                  1
                </span>
                <span>Name of the Applicant</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-2">
                <div>
                  <span className="text-[11px] text-gray-500 font-semibold block">
                    In English (Block Letters):
                  </span>
                  <span className="font-bold text-sm text-gray-900 uppercase">
                    {nameEn || '—'}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-gray-500 font-semibold block font-siliguri">
                    বাংলায় (Name in Bengali):
                  </span>
                  <span className="font-bold text-sm text-gray-900 font-siliguri">
                    {nameBn || '—'}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Degree Information */}
            <div className="border border-gray-300 rounded-lg p-3 space-y-2 bg-gray-50/40">
              <div className="flex items-center gap-2 font-bold text-gray-900 border-b border-gray-200 pb-1">
                <span className="w-5 h-5 rounded-full bg-[#006a4e] text-white flex items-center justify-center text-[10px]">
                  2
                </span>
                <span>Information regarding Degree Earned from Department of Botany, JnU</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-gray-300">
                  <thead className="bg-[#006a4e]/10 text-[#006a4e] font-bold border-b border-gray-300">
                    <tr>
                      <th className="p-1.5 border-r border-gray-300">Degree / Program</th>
                      <th className="p-1.5 border-r border-gray-300">Session</th>
                      <th className="p-1.5 border-r border-gray-300">Exam Year</th>
                      <th className="p-1.5">Batch</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="p-1.5 font-bold border-r border-gray-300">B.Sc. (Honours)</td>
                      <td className="p-1.5 font-mono border-r border-gray-300">{bscSess || '—'}</td>
                      <td className="p-1.5 font-mono border-r border-gray-300">{bscYr || '—'}</td>
                      <td className="p-1.5 font-mono">{bscBt || '—'}</td>
                    </tr>
                    <tr>
                      <td className="p-1.5 font-bold border-r border-gray-300">M.Sc. (Master's)</td>
                      <td className="p-1.5 font-mono border-r border-gray-300">{mscSess || '—'}</td>
                      <td className="p-1.5 font-mono border-r border-gray-300">{mscYr || '—'}</td>
                      <td className="p-1.5 font-mono">{mscBt || '—'}</td>
                    </tr>
                    {(mphilYr || phdYr) && (
                      <tr>
                        <td className="p-1.5 font-bold border-r border-gray-300">M.Phil / Ph.D.</td>
                        <td className="p-1.5 font-mono border-r border-gray-300">—</td>
                        <td className="p-1.5 font-mono border-r border-gray-300">{mphilYr || phdYr || '—'}</td>
                        <td className="p-1.5 font-mono">—</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 3. Personal & Contact Information */}
            <div className="border border-gray-300 rounded-lg p-3 space-y-2 bg-gray-50/40">
              <div className="flex items-center gap-2 font-bold text-gray-900 border-b border-gray-200 pb-1">
                <span className="w-5 h-5 rounded-full bg-[#006a4e] text-white flex items-center justify-center text-[10px]">
                  3
                </span>
                <span>Personal & Contact Information</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 pl-2">
                <div>
                  <span className="text-[11px] text-gray-500 font-semibold block">Father's Name:</span>
                  <span className="font-bold text-gray-800">{fName || '—'}</span>
                </div>
                <div>
                  <span className="text-[11px] text-gray-500 font-semibold block">Mother's Name:</span>
                  <span className="font-bold text-gray-800">{mName || '—'}</span>
                </div>
                <div>
                  <span className="text-[11px] text-gray-500 font-semibold block">Present Address:</span>
                  <span className="text-gray-800">{presAddr || '—'}</span>
                </div>
                <div>
                  <span className="text-[11px] text-gray-500 font-semibold block">Permanent Address:</span>
                  <span className="text-gray-800">
                    {[pVillage, pPost, pUpazila, pDistrict].filter(Boolean).join(', ') || '—'}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-gray-500 font-semibold block">Date of Birth:</span>
                  <span className="font-mono text-gray-800">
                    {dDay && dMonth && dYear ? `${dDay}/${dMonth}/${dYear}` : member.dateOfBirth || '—'}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-gray-500 font-semibold block">Blood Group:</span>
                  <span className="font-black text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                    {bg || '—'}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-gray-500 font-semibold block">Mobile Number:</span>
                  <span className="font-mono font-bold text-[#006a4e]">{ph || '—'}</span>
                </div>
                <div>
                  <span className="text-[11px] text-gray-500 font-semibold block">Email:</span>
                  <span className="font-mono text-gray-800">{em || '—'}</span>
                </div>
                <div>
                  <span className="text-[11px] text-gray-500 font-semibold block">NID / National ID:</span>
                  <span className="font-mono text-gray-800">{nid || '—'}</span>
                </div>
                <div>
                  <span className="text-[11px] text-gray-500 font-semibold block">Occupation & Designation:</span>
                  <span className="font-bold text-gray-800">{occ || otherOcc || '—'}</span>
                </div>
              </div>
            </div>

            {/* 4. Payment Verification Summary */}
            <div className={`border rounded-lg p-2.5 flex flex-wrap items-center justify-between gap-2 text-xs ${
              pMethod === 'Unpaid' || member.paymentStatus === 'unpaid' || trxId === 'UNPAID'
                ? 'border-amber-300 bg-amber-50/90'
                : 'border-emerald-300 bg-emerald-50/50'
            }`}>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#006a4e]" />
                <span className="font-bold text-gray-800">Payment Status:</span>
                {pMethod === 'Unpaid' || member.paymentStatus === 'unpaid' || trxId === 'UNPAID' ? (
                  <span className="font-extrabold text-red-700 bg-red-100 border border-red-300 px-2 py-0.5 rounded uppercase font-mono">
                    Unpaid
                  </span>
                ) : (
                  <span className="font-bold text-emerald-800 uppercase">
                    {member.paymentStatus === 'paid' || isApproved ? 'PAID & VERIFIED' : 'SUBMITTED'}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-[11px] text-gray-700 font-mono">
                <span>Fee: <strong className="font-mono text-[#006a4e]">৳ {fee}/-</strong></span>
                <span>Method: <strong>{pMethod}</strong></span>
                {trxId && trxId !== 'UNPAID' && <span>TrxID: <strong className="font-mono text-rose-700">{trxId}</strong></span>}
              </div>
            </div>

            {/* Signatures & Official Verification Box */}
            <div className="pt-4 border-t-2 border-gray-300 grid grid-cols-2 gap-6 items-end mt-4">
              {/* Applicant Signature */}
              <div className="text-center space-y-1">
                <div className="h-12 flex items-center justify-center">
                  {sigUrl ? (
                    <img
                      src={sigUrl}
                      alt="Applicant Signature"
                      className="max-h-12 max-w-full object-contain mx-auto"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="font-serif italic font-bold text-sm text-gray-800 border-b border-gray-400 px-4">
                      {sigName}
                    </span>
                  )}
                </div>
                <div className="border-t border-gray-800 pt-1">
                  <span className="text-[11px] font-bold text-gray-800 uppercase block">
                    Signature of the Applicant
                  </span>
                  <span className="text-[10px] text-gray-500">Date: {dateStr}</span>
                </div>
              </div>

              {/* Official Seal / General Secretary */}
              <div className="text-center space-y-1">
                <div className="h-12 flex items-center justify-center">
                  <div className="border-2 border-dashed border-[#006a4e] rounded-full px-3 py-1 bg-emerald-50/70 text-[10px] font-bold text-[#006a4e] uppercase flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-[#006a4e]" />
                    <span>Botany Alumni Verified</span>
                  </div>
                </div>
                <div className="border-t border-gray-800 pt-1">
                  <span className="text-[11px] font-bold text-gray-800 uppercase block">
                    General Secretary / President
                  </span>
                  <span className="text-[10px] text-gray-500">
                    Botany Alumni Association, JnU
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Footer Note */}
          <div className="mt-4 pt-2 border-t border-gray-200 text-center text-[10px] text-gray-500 font-sans">
            Official Membership Application Record • Department of Botany, Jagannath University, Dhaka-1100, Bangladesh
          </div>
        </div>
      </div>
    </div>
  );
};
