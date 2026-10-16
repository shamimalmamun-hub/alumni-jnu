import React from 'react';
import { Download, Printer, Loader2, Clock, Check, CheckCircle2, Mail, Eye, Trash2, User, FileCheck } from 'lucide-react';
import { useAdminData } from '../AdminDataContext';

export const MemberFormModal = () => {
  const {
    language,
    selectedMember,
    setSelectedMember,
    handleDownloadMemberPdf,
    handlePrintMemberForm,
    isGeneratingMemberPdf,
    handleUpdateMemberStatus,
    handleOpenEmailModal,
    confirmSingleDelete,
  } = useAdminData();

  return (
    <>
      {selectedMember && (() => {
        const dateStr = selectedMember.applicationDate || (selectedMember.createdAt ? new Date(selectedMember.createdAt).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB'));
        const memId = selectedMember.formNo || selectedMember.membershipId || selectedMember.id;
        const nameEn = selectedMember.applicantNameEn || selectedMember.nameEnglish || selectedMember.fullName || '';
        const nameBn = selectedMember.applicantNameBn || selectedMember.nameBangla || selectedMember.fullName || '';
        const bscSess = selectedMember.bscSession || selectedMember.session || '';
        const bscYr = selectedMember.bscYear || '';
        const bscBt = selectedMember.bscBatch || selectedMember.batch || '';
        const mscSess = selectedMember.mscSession || '';
        const mscYr = selectedMember.mscYear || '';
        const mscBt = selectedMember.mscBatch || '';
        const mphilYr = selectedMember.mphilYear || '';
        const phdYr = selectedMember.phdYear || '';
        const fName = selectedMember.fathersName || '';
        const mName = selectedMember.mothersName || '';
        const presAddr = selectedMember.presentAddress || '';
        const pVillage = selectedMember.permVillage || selectedMember.village || '';
        const pPost = selectedMember.permPost || selectedMember.post || '';
        const pUpazila = selectedMember.permUpazila || selectedMember.upazila || '';
        const pDistrict = selectedMember.permDistrict || selectedMember.district || '';
        
        let dDay = selectedMember.dobDay || '';
        let dMonth = selectedMember.dobMonth || '';
        let dYear = selectedMember.dobYear || '';
        if ((!dDay || !dMonth || !dYear) && selectedMember.dateOfBirth) {
          const parts = selectedMember.dateOfBirth.split(/[-/.]/);
          if (parts.length === 3) {
            dDay = parts[0];
            dMonth = parts[1];
            dYear = parts[2];
          }
        }

        const em = selectedMember.email || '';
        const ph = selectedMember.phone || selectedMember.mobile || '';
        const bg = selectedMember.bloodGroup || '';
        const nid = selectedMember.nidNumber || '';
        const occ = selectedMember.occupation || selectedMember.occupationCategory || '';
        const otherOcc = selectedMember.otherOccupation || '';
        const org = selectedMember.organizationPosition || '';
        const photo = selectedMember.userPhotoUrl || selectedMember.photoUrl || '';
        const sigUrl = selectedMember.signatureDataUrl || '';
        const sigName = selectedMember.signatureName || nameEn || nameBn;
        const memType = selectedMember.membershipType === 'life' ? 'Life Member' : selectedMember.membershipType === 'student' ? 'Student Member' : 'General Member';
        const fee = selectedMember.feeAmount || (selectedMember.membershipType === 'life' ? '2500' : '500');
        const pMethod = selectedMember.paymentMethod || 'bKash';
        const sender = selectedMember.senderNumber || '';
        const trxId = selectedMember.transactionId || '';
        const docName = selectedMember.degreeDocName || (selectedMember.degreeDocData ? 'degree_certificate' : '');
        const docData = selectedMember.degreeDocData || selectedMember.degreeDocUrl || '';

        return (
          <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto font-sans animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl sm:rounded-3xl max-w-4xl w-full p-4 sm:p-6 space-y-4 shadow-2xl border-2 border-[#006a4e] relative my-4 sm:my-6 max-h-[92vh] overflow-y-auto">
              
              {/* Modal Top Bar (no-print) */}
              <div className="no-print flex items-center justify-between border-b border-gray-200 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 shrink-0 flex items-center justify-center bg-white rounded-full p-0.5 border border-emerald-300 shadow-2xs">
                    <img
                      src="/jnu_botany_alumni_logo.jpg"
                      alt="Botany Alumni Logo"
                      className="w-full h-full object-contain rounded-full"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://upload.wikimedia.org/wikipedia/en/thumb/2/23/Jagannath_University_Logo.svg/512px-Jagannath_University_Logo.svg.png";
                      }}
                    />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base sm:text-lg text-gray-900 font-sans flex items-center gap-2">
                      <span>Membership Application Form</span>
                      <span className="text-[10px] font-bold bg-emerald-100 text-[#006a4e] px-2 py-0.5 rounded-full border border-emerald-300 uppercase">
                        Official View
                      </span>
                    </h3>
                    <p className="text-xs text-gray-500 font-mono">
                      Form No: <strong className="text-[#006a4e]">{memId}</strong> | Applicant: <strong className="text-gray-800">{nameEn || nameBn}</strong>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleDownloadMemberPdf(selectedMember)}
                    disabled={isGeneratingMemberPdf}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                    title={language === 'bn' ? 'অফিসিয়াল আবেদনপত্রের PDF ডাউনলোড করুন' : 'Download Official PDF'}
                  >
                    {isGeneratingMemberPdf ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span className="hidden sm:inline">{language === 'bn' ? 'প্রস্তুত হচ্ছে...' : 'Generating...'}</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{language === 'bn' ? 'PDF ডাউনলোড' : 'Download PDF'}</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePrintMemberForm(selectedMember)}
                    className="px-3 py-1.5 bg-[#006a4e] hover:bg-[#004d38] text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                    title={language === 'bn' ? 'আবেদনপত্র প্রিন্ট করুন' : 'Print Form'}
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'প্রিন্ট ফর্ম' : 'Print Form'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedMember(null)}
                    className="text-gray-400 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100 text-xl font-bold cursor-pointer transition-colors leading-none"
                    title="Close"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Transaction Verification & Quick Approve Bar (no-print) */}
              {selectedMember.status !== 'approved' || selectedMember.paymentStatus === 'unpaid' || selectedMember.paymentMethod === 'Unpaid' ? (
                <div className="no-print bg-amber-50 border-2 border-amber-300 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 bg-amber-500 text-white rounded-xl shadow-xs shrink-0">
                      <Clock className="w-5 h-5 stroke-[2.5]" />
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <h4 className="text-xs sm:text-sm font-black text-amber-950">
                        {pMethod === 'Unpaid' || selectedMember.paymentStatus === 'unpaid'
                          ? (language === 'bn' ? 'অনিবন্ধিত সদস্য (পেমেন্ট Unpaid বাকি রয়েছে)' : 'Unregistered Member (Payment Unpaid)')
                          : (language === 'bn' ? 'অনিবন্ধিত আবেদন: ট্রানজেকশন যাচাই ও অনুমোদন' : 'Pending Verification: Approve to Register')}
                      </h4>
                      <div className="text-[11px] text-amber-900 flex flex-wrap items-center gap-2">
                        <span>ফি: <strong className="font-mono text-emerald-800">৳ {fee}/-</strong></span>
                        <span>•</span>
                        <span>মেথড: <strong>{pMethod}</strong></span>
                        {trxId && trxId !== 'UNPAID' && (
                          <>
                            <span>•</span>
                            <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-amber-300 font-bold text-rose-700">
                              TrxID: {trxId}
                            </span>
                          </>
                        )}
                        {sender && (
                          <>
                            <span>•</span>
                            <span className="font-mono">প্রেরক: <strong>{sender}</strong></span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleUpdateMemberStatus(selectedMember.id, 'approved', selectedMember.status === 'approved' ? undefined : { markPaid: false })}
                      className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-sm cursor-pointer transition-all"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>
                        {pMethod === 'Unpaid' || selectedMember.paymentStatus === 'unpaid'
                          ? (language === 'bn' ? 'টাকা জমা হয়েছে - Paid চিহ্নিত করে নিবন্ধিত করুন' : 'Mark as Paid & Move to Registered List')
                          : (language === 'bn' ? 'ট্রানজেকশন সঠিক - এপ্রুভ করুন' : 'Confirm & Approve')}
                      </span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="no-print bg-emerald-50 border-2 border-emerald-300 rounded-xl p-3 flex items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                    <span className="text-xs font-black text-emerald-950">
                      {language === 'bn' ? 'এই সদস্য ইতিমধ্যে অনুমোদিত (Paid) এবং নিবন্ধিত তালিকায় রয়েছে।' : 'This member is approved (Paid) and active in the Registered List.'}
                    </span>
                  </div>
                  {selectedMember.email && (
                    <button
                      type="button"
                      onClick={() =>
                        handleOpenEmailModal({
                          name: selectedMember.applicantNameBn || selectedMember.fullName || 'Member',
                          email: selectedMember.email!,
                          formNo: selectedMember.formNo || selectedMember.membershipId,
                          membershipId: selectedMember.membershipId,
                        })
                      }
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>{language === 'bn' ? 'ইমেইল পাঠান' : 'Send Email'}</span>
                    </button>
                  )}
                </div>
              )}

              {/* ================= OFFICIAL PRINTABLE MEMBERSHIP FORM (IN ENGLISH) ================= */}
              <div
                id="a4-membership-form-print"
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
                            'https://upload.wikimedia.org/wikipedia/en/thumb/8/87/Logo_of_Jagannath_University.svg/512px-Logo_of_Jagannath_University.svg.png';
                        }}
                      />
                    </div>
                  </div>

                  {/* Center Official Title */}
                  <div className="text-center flex-1 space-y-0.5 px-1 min-w-0">
                    <h1 className="text-xs sm:text-base md:text-lg font-black text-amber-300 tracking-tight leading-tight uppercase font-['Plus_Jakarta_Sans',sans-serif]">
                      BOTANY ALUMNI ASSOCIATION
                      <span className="block text-xs sm:text-base md:text-lg font-black text-amber-200 mt-0.5">
                        {language === 'bn' ? 'জগন্নাথ বিশ্ববিদ্যালয়, ঢাকা' : 'Jagannath University, Dhaka'}
                      </span>
                    </h1>
                    <p className="text-[10px] sm:text-xs font-medium text-emerald-100/90 tracking-normal font-sans leading-tight">
                      9-10 Chittaranjan Ave, Dhaka 1100.
                    </p>
                    <div className="pt-0.5">
                      <span className="text-[10px] sm:text-xs font-bold text-white bg-[#004d38] px-3 py-0.5 rounded-full border border-amber-400/70 shadow-xs inline-block tracking-wide font-sans whitespace-nowrap">
                        Membership Application Form
                      </span>
                    </div>
                  </div>

                  {/* Photo Box Top Right */}
                  <div className="shrink-0 flex flex-col items-center font-sans">
                    <div className="w-16 h-20 sm:w-22 sm:h-26 border-2 border-amber-300 bg-[#004d38] rounded-md flex flex-col items-center justify-center text-center p-0.5 overflow-hidden shadow-inner relative">
                      {photo ? (
                        <img
                          src={photo}
                          alt="Applicant Photo"
                          className="w-full h-full object-cover rounded-sm"
                        />
                      ) : (
                        <div className="space-y-1 text-emerald-100 px-1">
                          <User className="w-6 h-6 sm:w-8 sm:h-8 mx-auto text-amber-300" />
                          <span className="text-[9px] sm:text-[10px] font-bold block leading-tight text-white">
                            Photo
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Form Body Fields (All in English) */}
                <div className="space-y-3.5 text-xs sm:text-sm font-sans">
                  
                  {/* Top Row: Date & Membership ID */}
                  <div className="flex flex-row justify-between items-center gap-2 mb-2 bg-emerald-50/50 p-2 sm:p-2.5 rounded-lg border border-emerald-200/80">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 text-xs sm:text-sm shrink-0">
                        Date:
                      </span>
                      <div className="min-w-[120px] border border-gray-400 rounded px-2.5 py-1 text-xs sm:text-sm font-bold font-mono text-gray-900 bg-white shadow-2xs">
                        {dateStr || '—'}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 text-xs sm:text-sm shrink-0">
                        Membership ID:
                      </span>
                      <div className="min-w-[140px] border border-gray-400 rounded px-2.5 py-1 text-xs sm:text-sm font-extrabold font-mono text-[#006a4e] bg-white shadow-2xs">
                        {memId || '—'}
                      </div>
                    </div>
                  </div>

                  {/* 1. Name of the Alumni: */}
                  <div className="space-y-2 border-b border-gray-300 pb-3">
                    <div className="font-bold text-[#004d38] text-xs sm:text-sm">
                      1. Name of the Alumni:
                    </div>
                    
                    <div className="grid grid-cols-1 gap-2 pl-0 sm:pl-4">
                      {/* In English : */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                        <span className="w-full sm:w-28 font-semibold text-gray-800 shrink-0 text-xs sm:text-sm">
                          In English <span className="hidden sm:inline float-right mr-1">:</span>
                        </span>
                        <div className="flex-1 border border-gray-400 rounded px-3 py-1.5 text-xs sm:text-sm font-bold text-gray-900 bg-white uppercase font-mono shadow-2xs">
                          {nameEn || '—'}
                        </div>
                      </div>

                      {/* In Bangla : */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                        <span className="w-full sm:w-28 font-semibold text-gray-800 shrink-0 text-xs sm:text-sm">
                          In Bangla <span className="hidden sm:inline float-right mr-1">:</span>
                        </span>
                        <div className="flex-1 border border-gray-400 rounded px-3 py-1.5 text-xs sm:text-sm font-bold text-gray-900 bg-white shadow-2xs">
                          {nameBn || '—'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 2. Information regarding degree earned from the Department of Botany: */}
                  <div className="space-y-2.5 border-b border-gray-300 pb-3">
                    <div className="font-bold text-[#004d38] text-xs sm:text-sm">
                      2. Information regarding degree earned from the Department of Botany:
                    </div>

                    <div className="space-y-2 pl-0 sm:pl-4">
                      {/* i) BSc Honours */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs sm:text-sm bg-gray-50/80 p-2 sm:p-0 rounded border border-gray-200 sm:border-none">
                        <span className="w-full sm:w-28 font-semibold text-gray-800 shrink-0">
                          i) BSc Honours <span className="hidden sm:inline float-right mr-1">:</span>
                        </span>
                        
                        <div className="grid grid-cols-3 sm:flex sm:flex-1 sm:items-center gap-1.5 sm:gap-x-2">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 flex-1">
                            <span className="text-gray-700 text-[11px] sm:text-xs shrink-0 font-medium">Session:</span>
                            <div className="w-full border border-gray-400 rounded px-2 py-1 text-xs font-bold font-mono text-gray-900 bg-white">
                              {bscSess || '—'}
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 w-full sm:w-32">
                            <span className="text-gray-700 text-[11px] sm:text-xs shrink-0 font-medium">Passing Year:</span>
                            <div className="w-full border border-gray-400 rounded px-2 py-1 text-xs font-bold font-mono text-gray-900 bg-white">
                              {bscYr || '—'}
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 w-full sm:w-36">
                            <span className="text-gray-700 text-[11px] sm:text-xs shrink-0 font-medium">Batch:</span>
                            <div className="w-full border border-gray-400 rounded px-2 py-1 text-xs font-bold text-gray-900 bg-white">
                              {bscBt || '—'}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* ii) MSc */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs sm:text-sm bg-gray-50/80 p-2 sm:p-0 rounded border border-gray-200 sm:border-none">
                        <span className="w-full sm:w-28 font-semibold text-gray-800 shrink-0">
                          ii) MSc <span className="hidden sm:inline float-right mr-1">:</span>
                        </span>
                        
                        <div className="grid grid-cols-3 sm:flex sm:flex-1 sm:items-center gap-1.5 sm:gap-x-2">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 flex-1">
                            <span className="text-gray-700 text-[11px] sm:text-xs shrink-0 font-medium">Session:</span>
                            <div className="w-full border border-gray-400 rounded px-2 py-1 text-xs font-mono text-gray-900 bg-white">
                              {mscSess || '—'}
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 w-full sm:w-32">
                            <span className="text-gray-700 text-[11px] sm:text-xs shrink-0 font-medium">Passing Year:</span>
                            <div className="w-full border border-gray-400 rounded px-2 py-1 text-xs font-mono text-gray-900 bg-white">
                              {mscYr || '—'}
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 w-full sm:w-36">
                            <span className="text-gray-700 text-[11px] sm:text-xs shrink-0 font-medium">Batch:</span>
                            <div className="w-full border border-gray-400 rounded px-2 py-1 text-xs text-gray-900 bg-white">
                              {mscBt || '—'}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* iii) MPhil & iv) PhD */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                        <div className="flex items-center gap-2 text-xs sm:text-sm">
                          <span className="w-20 sm:w-28 font-semibold text-gray-800 shrink-0">
                            iii) MPhil <span className="hidden sm:inline float-right mr-1">:</span>
                          </span>
                          <div className="flex items-center gap-1.5 flex-1">
                            <span className="text-gray-700 text-[11px] sm:text-xs shrink-0 font-medium">Passing Year:</span>
                            <div className="w-full border border-gray-400 rounded px-2 py-1 text-xs text-gray-900 bg-white font-mono">
                              {mphilYr || '—'}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs sm:text-sm">
                          <span className="w-20 sm:w-28 font-semibold text-gray-800 shrink-0">
                            iv) PhD <span className="hidden sm:inline float-right mr-1">:</span>
                          </span>
                          <div className="flex items-center gap-1.5 flex-1">
                            <span className="text-gray-700 text-[11px] sm:text-xs shrink-0 font-medium">Passing Year:</span>
                            <div className="w-full border border-gray-400 rounded px-2 py-1 text-xs text-gray-900 bg-white font-mono">
                              {phdYr || '—'}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* NB: Attached document */}
                      <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-gray-800 text-xs bg-emerald-50/80 p-2 sm:p-2.5 rounded border border-emerald-200">
                        <div className="flex items-start sm:items-center gap-1.5 font-medium">
                          <span className="inline-block w-2 h-2 bg-[#006a4e] shrink-0 mt-1 sm:mt-0 rounded-full"></span>
                          <span>
                            <strong className="text-emerald-950">NB:</strong> Attach a copy of certificate/marksheet/testimonial of BSc/MSc degree.
                          </span>
                        </div>

                        {docData || docName ? (
                          <div className="shrink-0 flex items-center gap-2">
                            {docData ? (
                              <button
                                type="button"
                                onClick={() => {
                                  if (docData.startsWith('data:image/') || docData.startsWith('http')) {
                                    const html = `
                                        <!DOCTYPE html>
                                        <html>
                                          <head>
                                            <title>${docName || 'Degree Certificate / Marksheet'}</title>
                                            <style>
                                              body { margin:0; background:#0f172a; display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:100vh; color:#fff; font-family:sans-serif; }
                                              img { max-width:95%; max-height:90vh; border-radius:8px; box-shadow:0 10px 25px rgba(0,0,0,0.5); object-fit:contain; }
                                              .header { margin-bottom:12px; font-size:14px; color:#cbd5e1; }
                                            </style>
                                          </head>
                                          <body>
                                            <div class="header">📄 ${docName || 'Degree Certificate / Marksheet Document'}</div>
                                            <img src="${docData}" alt="Certificate Document" />
                                          </body>
                                        </html>
                                      `;
                                    // iOS Safari frequently fails to render document.write into a fresh
                                    // about:blank tab. Serving the HTML from a blob URL works everywhere.
                                    const blob = new Blob([html], { type: 'text/html' });
                                    const url = URL.createObjectURL(blob);
                                    const win = window.open(url, '_blank');
                                    if (win) {
                                      setTimeout(() => URL.revokeObjectURL(url), 60000);
                                    } else {
                                      URL.revokeObjectURL(url);
                                    }
                                  } else {
                                    const link = document.createElement('a');
                                    link.href = docData;
                                    link.target = '_blank';
                                    link.download = docName || 'degree_certificate_marksheet';
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                  }
                                }}
                                className="px-3 py-1 bg-[#006a4e] hover:bg-[#00523d] active:scale-95 text-white rounded-md font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                                title={language === 'bn' ? 'সংযুক্ত ডিগ্রি সার্টিফিকেট/মার্শিট দেখুন বা ডাউনলোড করুন' : 'View or download degree certificate'}
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>{language === 'bn' ? 'সংযুক্ত সনদ/ফাইল দেখুন' : 'View Document'}</span>
                                {docName && <span className="font-mono text-[10px] opacity-90 max-w-[120px] truncate">({docName})</span>}
                              </button>
                            ) : (
                              <div className="shrink-0 flex items-center gap-1.5 bg-white px-2 py-0.5 rounded border border-emerald-400 text-emerald-800 font-semibold text-xs">
                                <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="font-mono">{docName}</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-amber-700 font-semibold italic bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            {language === 'bn' ? 'কোনো সনদ বা পেপার সংলগ্ন করা হয়নি' : 'No document attached'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 3. Personal Information: */}
                  <div className="space-y-2.5 border-b border-gray-300 pb-3">
                    <div className="font-bold text-[#004d38] text-xs sm:text-sm">
                      3. Personal Information:
                    </div>

                    <div className="space-y-2 pl-0 sm:pl-4">
                      {/* Father's Name */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                        <span className="w-full sm:w-36 font-semibold text-gray-800 shrink-0 text-xs sm:text-sm">
                          Father's Name <span className="hidden sm:inline float-right mr-1">:</span>
                        </span>
                        <div className="flex-1 border border-gray-400 rounded px-3 py-1.5 text-xs sm:text-sm text-gray-900 bg-white font-medium shadow-2xs">
                          {fName || '—'}
                        </div>
                      </div>

                      {/* Mother's Name */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                        <span className="w-full sm:w-36 font-semibold text-gray-800 shrink-0 text-xs sm:text-sm">
                          Mother's Name <span className="hidden sm:inline float-right mr-1">:</span>
                        </span>
                        <div className="flex-1 border border-gray-400 rounded px-3 py-1.5 text-xs sm:text-sm text-gray-900 bg-white font-medium shadow-2xs">
                          {mName || '—'}
                        </div>
                      </div>

                      {/* Present Address */}
                      <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3">
                        <span className="w-full sm:w-36 font-semibold text-gray-800 shrink-0 text-xs sm:text-sm pt-0.5">
                          Present Address <span className="hidden sm:inline float-right mr-1">:</span>
                        </span>
                        <div className="flex-1 border border-gray-400 rounded px-3 py-1.5 text-xs sm:text-sm text-gray-900 bg-white min-h-[38px] leading-relaxed shadow-2xs">
                          {presAddr || '—'}
                        </div>
                      </div>

                      {/* Permanent Address: Village, Post, Upazila, District */}
                      <div className="space-y-1.5 bg-gray-50/70 p-2 sm:p-0 rounded border border-gray-200 sm:border-none">
                        <span className="w-full sm:w-36 font-semibold text-gray-800 shrink-0 text-xs sm:text-sm block">
                          Permanent Address <span className="hidden sm:inline float-right mr-1">:</span>
                        </span>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 flex-1">
                            <span className="text-gray-700 text-[11px] sm:text-xs shrink-0 font-medium">Village:</span>
                            <div className="w-full border border-gray-400 rounded px-2 py-1 text-xs text-gray-900 bg-white">
                              {pVillage || '—'}
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 flex-1">
                            <span className="text-gray-700 text-[11px] sm:text-xs shrink-0 font-medium">Post:</span>
                            <div className="w-full border border-gray-400 rounded px-2 py-1 text-xs text-gray-900 bg-white">
                              {pPost || '—'}
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 flex-1">
                            <span className="text-gray-700 text-[11px] sm:text-xs shrink-0 font-medium">Upazila:</span>
                            <div className="w-full border border-gray-400 rounded px-2 py-1 text-xs text-gray-900 bg-white">
                              {pUpazila || '—'}
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 flex-1">
                            <span className="text-gray-700 text-[11px] sm:text-xs shrink-0 font-medium">District:</span>
                            <div className="w-full border border-gray-400 rounded px-2 py-1 text-xs text-gray-900 bg-white">
                              {pDistrict || '—'}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Date of Birth & Email */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-800 shrink-0 text-xs sm:text-sm">
                            Date of Birth:
                          </span>

                          <div className="flex items-center gap-1">
                            <div className="w-10 text-center border border-gray-400 rounded px-1 py-1 text-xs font-mono font-bold text-gray-900 bg-white">
                              {dDay ? String(dDay).padStart(2, '0') : 'DD'}
                            </div>
                            <span className="text-gray-400 font-bold text-xs">/</span>
                            <div className="w-10 text-center border border-gray-400 rounded px-1 py-1 text-xs font-mono font-bold text-gray-900 bg-white">
                              {dMonth ? String(dMonth).padStart(2, '0') : 'MM'}
                            </div>
                            <span className="text-gray-400 font-bold text-xs">/</span>
                            <div className="w-16 text-center border border-gray-400 rounded px-1 py-1 text-xs font-mono font-bold text-gray-900 bg-white">
                              {dYear || 'YYYY'}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-800 text-xs sm:text-sm shrink-0">
                            Email:
                          </span>
                          <div className="w-full border border-gray-400 rounded px-2.5 py-1 text-xs sm:text-sm text-gray-900 bg-white truncate font-medium">
                            {em || '—'}
                          </div>
                        </div>
                      </div>

                      {/* Phone Number & Blood Group */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-20 sm:w-28 font-semibold text-gray-800 shrink-0 text-xs sm:text-sm">
                            Phone:
                          </span>
                          <div className="w-full border border-gray-400 rounded px-2.5 py-1 text-xs sm:text-sm font-mono font-bold text-gray-900 bg-white">
                            {ph || '—'}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-800 text-xs sm:text-sm shrink-0">
                            Blood Group:
                          </span>
                          <div className="w-full border border-gray-400 rounded px-2.5 py-1 text-xs font-bold text-rose-700 bg-white font-mono">
                            {bg || '—'}
                          </div>
                        </div>
                      </div>

                      {/* NID Number */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                        <span className="w-full sm:w-36 font-semibold text-gray-800 shrink-0 text-xs sm:text-sm">
                          NID Number <span className="hidden sm:inline float-right mr-1">:</span>
                        </span>
                        <div className="flex-1 border border-gray-400 rounded px-3 py-1 text-xs sm:text-sm font-mono font-bold text-gray-900 bg-white">
                          {nid || '—'}
                        </div>
                      </div>

                      {/* Occupation */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                        <span className="w-full sm:w-36 font-semibold text-gray-800 shrink-0 text-xs sm:text-sm">
                          Occupation <span className="hidden sm:inline float-right mr-1">:</span>
                        </span>
                        <div className="flex-1 border border-gray-400 rounded px-3 py-1.5 text-xs sm:text-sm text-gray-900 bg-white font-medium flex items-center justify-between">
                          <span>{occ || '—'}</span>
                          {otherOcc && (
                            <span className="text-gray-500 text-xs italic">({otherOcc})</span>
                          )}
                        </div>
                      </div>

                      {/* Organization & Position */}
                      {org && (
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                          <span className="w-full sm:w-36 font-semibold text-gray-800 shrink-0 text-xs sm:text-sm">
                            Organization / Position <span className="hidden sm:inline float-right mr-1">:</span>
                          </span>
                          <div className="flex-1 border border-gray-400 rounded px-3 py-1.5 text-xs sm:text-sm text-gray-900 bg-white font-medium">
                            {org}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 4. Declaration Line & Signature */}
                  <div className="pt-2 pb-2 bg-emerald-50/60 p-3 rounded-lg border border-emerald-200">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-[#006a4e] text-white rounded flex items-center justify-center font-bold text-xs shrink-0">
                          ✓
                        </div>
                        <span className="font-semibold text-gray-900 text-xs sm:text-sm">
                          I ensure that information mentioned above is complete and correct.
                        </span>
                      </div>

                      {/* Signature Preview */}
                      <div className="text-right shrink-0">
                        <span className="text-[10px] text-gray-500 block font-sans">Applicant's Signature:</span>
                        {sigUrl ? (
                          <div className="inline-block border border-gray-400 rounded bg-white p-1 mt-0.5 shadow-2xs">
                            <img src={sigUrl} alt="Signature" className="h-8 max-w-[140px] object-contain" />
                          </div>
                        ) : (
                          <div className="font-serif italic font-bold text-gray-900 text-xs border-b border-gray-700 pb-0.5 px-3 mt-0.5 inline-block">
                            {sigName || '—'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 5. Official Verification & Payment Summary */}
                  <div className="mt-2 pt-2 border-t border-dashed border-gray-400 font-sans">
                    <div className="bg-emerald-50/90 border border-emerald-300 rounded-lg p-2.5 sm:p-3 space-y-2 text-xs">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#006a4e]"></span>
                          <span className="font-bold text-gray-900">Membership Category:</span>
                          <span className="font-extrabold text-[#004d38] bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                            {memType}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900">Fee Amount:</span>
                          <span className={`font-black font-mono text-sm px-2 py-0.5 rounded border ${
                            pMethod === 'Unpaid' || selectedMember.paymentStatus === 'unpaid' || trxId === 'UNPAID'
                              ? 'text-red-700 bg-red-100 border-red-300'
                              : 'text-[#006a4e] bg-white border-emerald-300'
                          }`}>
                            ৳ {fee}/- ({
                              pMethod === 'Unpaid' || selectedMember.paymentStatus === 'unpaid' || trxId === 'UNPAID'
                                ? 'Unpaid'
                                : selectedMember.paymentStatus === 'paid'
                                ? 'PAID'
                                : 'PENDING'
                            })
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-emerald-200/80 font-mono text-xs text-gray-800">
                        <div>
                          <span className="text-gray-500 block text-[10px] font-sans">Method:</span>
                          <strong className="uppercase">{pMethod}</strong>
                        </div>
                        <div>
                          <span className="text-gray-500 block text-[10px] font-sans">Sender Mobile:</span>
                          <strong>{sender || '—'}</strong>
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <span className="text-gray-500 block text-[10px] font-sans">TrxID:</span>
                          <strong className="text-emerald-950 bg-white px-1.5 py-0.5 rounded border border-emerald-300 inline-block font-bold">
                            {trxId || '—'}
                          </strong>
                        </div>
                        <div>
                          <span className="text-gray-500 block text-[10px] font-sans">Approval Status:</span>
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold font-sans inline-block ${
                            selectedMember.status === 'approved'
                              ? 'bg-emerald-600 text-white'
                              : selectedMember.status === 'rejected'
                              ? 'bg-red-600 text-white'
                              : 'bg-amber-500 text-white'
                          }`}>
                            {selectedMember.status === 'approved' ? '✓ Approved' : selectedMember.status === 'rejected' ? '✕ Rejected' : '⏳ Pending'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Quick Status Modifiers & Admin Actions (no-print) */}
              <div className="no-print flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-700">Change Status:</span>
                  <button
                    onClick={() => handleUpdateMemberStatus(selectedMember.id, 'approved', selectedMember.status === 'approved' ? undefined : { markPaid: false })}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedMember.status === 'approved'
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                    }`}
                  >
                    ✓ Approve
                  </button>
                  <button
                    onClick={() => handleUpdateMemberStatus(selectedMember.id, 'pending')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedMember.status === 'pending' || !selectedMember.status || selectedMember.status === 'payment_pending'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                    }`}
                  >
                    Pending
                  </button>
                  <button
                    onClick={() => handleUpdateMemberStatus(selectedMember.id, 'rejected')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedMember.status === 'rejected'
                        ? 'bg-red-600 text-white shadow-xs'
                        : 'bg-red-100 text-red-800 hover:bg-red-200'
                    }`}
                  >
                    ✕ Reject
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {selectedMember.email && (
                    <button
                      type="button"
                      onClick={() =>
                        handleOpenEmailModal({
                          name: selectedMember.applicantNameBn || selectedMember.fullName || 'Member',
                          email: selectedMember.email!,
                          formNo: selectedMember.formNo,
                          membershipId: selectedMember.membershipId,
                        })
                      }
                      className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
                      title={language === 'bn' ? 'সদস্যকে ইমেইল পাঠান' : 'Send Email to Member'}
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>{language === 'bn' ? 'ইমেইল পাঠান' : 'Send Email'}</span>
                    </button>
                  )}
                  <button
                    onClick={() => confirmSingleDelete(selectedMember.id, nameBn || nameEn || 'Member', selectedMember.formNo)}
                    className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    title="Delete member application"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-600" />
                    <span>Delete</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownloadMemberPdf(selectedMember)}
                    disabled={isGeneratingMemberPdf}
                    className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                    title={language === 'bn' ? 'অফিসিয়াল আবেদনপত্রের PDF ডাউনলোড করুন' : 'Download Official PDF'}
                  >
                    {isGeneratingMemberPdf ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Download className="w-3.5 h-3.5" />
                    )}
                    <span>{language === 'bn' ? 'PDF ডাউনলোড' : 'Download PDF'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePrintMemberForm(selectedMember)}
                    className="px-4 py-2 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                    title={language === 'bn' ? 'আবেদনপত্র প্রিন্ট করুন' : 'Print Form'}
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'প্রিন্ট করুন' : 'Print Form'}</span>
                  </button>
                  <button
                    onClick={() => setSelectedMember(null)}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </>
  );
};
