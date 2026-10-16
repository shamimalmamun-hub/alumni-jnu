import React from 'react';
import { X, HeartHandshake, CheckCircle2, Copy, Printer } from 'lucide-react';
import { useAdminData } from '../AdminDataContext';

export const DonationReceiptModal = () => {
  const {
    language,
    selectedDonation,
    setSelectedDonation,
    showToast,
  } = useAdminData();

  return (
    <>
      {/* ================= MODAL: DONATION DETAILS & MONEY RECEIPT ================= */}
      {selectedDonation && (() => {
        const d = selectedDonation;
        const dName = d.payerNameBn || d.payerName || 'সম্মানিত অ্যালামনাই ডোনার';
        const dNameEn = d.payerName;
        const dPhone = d.phone || d.senderNumber || '—';
        const dMethod = d.paymentMethod || 'Manual';
        const dTrx = d.transactionId || '—';
        const dSender = d.senderNumber || '—';
        const dAmount = Number(d.amount) || 0;
        const dDate = d.createdAt ? new Date(d.createdAt).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';
        const dTime = d.createdAt ? new Date(d.createdAt).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }) : '';
        const isBkash = dMethod.toLowerCase().includes('bkash');
        const isNagad = dMethod.toLowerCase().includes('nagad');
        const isRocket = dMethod.toLowerCase().includes('rocket');

        return (
          <div className="fixed inset-0 bg-black/75 z-60 flex items-center justify-center p-3 sm:p-4 font-siliguri animate-in fade-in duration-150 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 space-y-5 shadow-2xl border-2 border-rose-500/40 relative my-auto">
              {/* Close button */}
              <button
                type="button"
                onClick={() => setSelectedDonation(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 p-2 rounded-full cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Receipt Header */}
              <div className="text-center space-y-1.5 border-b-2 border-dashed border-rose-200 pb-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-black uppercase tracking-wider">
                  <HeartHandshake className="w-3.5 h-3.5" />
                  <span>অফিসিয়াল ডোনেশন মানি রসিদ (MONEY RECEIPT)</span>
                </div>
                <h3 className="font-black text-xl text-[#006a4e] font-serif-bn">
                  উদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশন
                </h3>
                <p className="text-xs text-gray-600 font-medium">
                  জগন্নাথ বিশ্ববিদ্যালয়, ঢাকা-১১০০
                </p>
                <div className="flex items-center justify-between text-xs text-gray-600 pt-2 px-2">
                  <span className="font-mono font-bold bg-gray-100 px-2.5 py-1 rounded-lg border border-gray-200">
                    রসিদ নং: <strong className="text-rose-900">{d.receiptNo}</strong>
                  </span>
                  <span className="font-medium">
                    তারিখ: <strong className="text-gray-900">{dDate}</strong>
                  </span>
                </div>
              </div>

              {/* Donor & Payment Details Card */}
              <div className="bg-rose-50/50 rounded-2xl p-4 sm:p-5 border border-rose-200/80 space-y-3.5 text-xs text-gray-700">
                {/* Donor Name & Batch */}
                <div className="flex items-start justify-between gap-2 border-b border-rose-100 pb-3">
                  <div>
                    <span className="text-[11px] text-gray-500 font-bold block">দাতার নাম (Donor Name):</span>
                    <span className="text-base font-black text-gray-900 font-serif-bn">{dName}</span>
                    {dNameEn && dNameEn !== dName && (
                      <span className="text-xs text-gray-600 block">{dNameEn}</span>
                    )}
                  </div>
                  {(d.batch || d.session) && (
                    <div className="text-right">
                      <span className="text-[11px] text-gray-500 font-bold block">ব্যাচ / সেশন:</span>
                      <span className="text-xs font-black text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded inline-block">
                        {d.batch && `ব্যাচ ${d.batch}`} {d.session && `(${d.session})`}
                      </span>
                    </div>
                  )}
                </div>

                {/* Amount Paid - Prominent Box */}
                <div className="bg-white p-3.5 rounded-xl border-2 border-rose-300 shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-rose-800 font-bold block">অনুদানের পরিমাণ (Donation Amount):</span>
                    <span className="text-xs text-gray-500">অ্যাসোসিয়েশন কল্যাণ ও উন্নয়ন তহবিল</span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-rose-900 font-mono tracking-tight">
                    ৳ {dAmount.toLocaleString('bn-BD')}
                  </div>
                </div>

                {/* Payment Medium & Transaction Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="bg-white p-3 rounded-xl border border-rose-100 space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 block uppercase">পেমেন্ট মাধ্যম (Payment Method)</span>
                    <div className="flex items-center gap-1.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                        isBkash
                          ? 'bg-pink-100 text-[#D12053] border border-pink-300'
                          : isNagad
                          ? 'bg-orange-100 text-[#c75e00] border border-orange-300'
                          : isRocket
                          ? 'bg-purple-100 text-[#8C3494] border border-purple-300'
                          : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      }`}>
                        {dMethod}
                      </span>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-rose-100 space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 block uppercase">মোবাইল / প্রেরক নম্বর</span>
                    <span className="font-mono font-bold text-gray-900 text-xs">{dPhone}</span>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-rose-100 space-y-1 sm:col-span-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">ট্রানজেকশন আইডি (TrxID)</span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(dTrx);
                          showToast(language === 'bn' ? 'TrxID কপি হয়েছে' : 'TrxID copied');
                        }}
                        className="text-[10px] text-rose-700 font-bold hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" />
                        <span>কপি</span>
                      </button>
                    </div>
                    <span className="font-mono font-black text-rose-950 text-sm select-all block">{dTrx}</span>
                  </div>
                </div>

                {/* Optional Note */}
                {d.note && (
                  <div className="bg-white p-3 rounded-xl border border-gray-200">
                    <span className="text-[10px] text-gray-400 font-bold block uppercase">মন্তব্য / নোট (Note)</span>
                    <p className="text-xs text-gray-700 font-sans italic mt-0.5">{d.note}</p>
                  </div>
                )}
              </div>

              {/* Status and Verification Badge */}
              <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-100 pt-3">
                <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>যাচাইকৃত ডোনেশন ও জমা নিশ্চিত</span>
                </div>
                <span className="text-[11px] font-mono text-gray-400">{dTime}</span>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-between gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const txt = `[উদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশন - ডোনেশন রসিদ]
রসিদ নং: ${d.receiptNo}
দাতার নাম: ${dName}
ব্যাচ/সেশন: ${d.batch || ''} ${d.session || ''}
মোবাইল: ${dPhone}
অনুদানের পরিমাণ: ৳ ${dAmount}
পেমেন্ট মাধ্যম: ${dMethod}
প্রেরক নম্বর: ${dSender}
TrxID: ${dTrx}
তারিখ: ${dDate} ${dTime}`;
                    navigator.clipboard.writeText(txt);
                    showToast(language === 'bn' ? 'ডোনেশন বিবরণ কপি হয়েছে।' : 'Donation details copied.');
                  }}
                  className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'কপি করুন' : 'Copy'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all shadow-md active:scale-95"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'রসিদ প্রিন্ট' : 'Print Receipt'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedDonation(null)}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                  >
                    {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
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
