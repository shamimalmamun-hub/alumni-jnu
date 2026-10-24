import React from 'react';
import { HeartHandshake, X, Loader2, Check } from 'lucide-react';
import { useAdminData } from '../AdminDataContext';

export const AddDonationModal = () => {
  const {
    language,
    isAddDonationModalOpen,
    setIsAddDonationModalOpen,
    newDonationData,
    setNewDonationData,
    isSavingDonation,
    handleSaveManualDonation,
  } = useAdminData();

  return (
    <>
      {/* ================= MODAL: MANUAL DONATION ENTRY ================= */}
      {isAddDonationModalOpen && (
        <div className="fixed inset-0 bg-black/75 z-60 flex items-center justify-center p-3 sm:p-4 font-siliguri animate-in fade-in duration-150 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-4 shadow-2xl border-2 border-rose-500/40 relative my-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-rose-100 text-rose-700 rounded-xl">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base sm:text-lg text-gray-900 font-serif-bn">
                    {language === 'bn' ? 'নতুন ডোনেশন এন্ট্রি যুক্ত করুন' : 'Record New Donation'}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {language === 'bn' ? 'অফলাইন/অনলাইন অনুদানের বিস্তারিত তথ্য সংরক্ষণ করুন' : 'Save offline or direct contribution details'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddDonationModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 bg-gray-100 p-2 rounded-full cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveManualDonation} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Donor Name BN */}
                <div className="space-y-1">
                  <label className="font-bold text-gray-700 block">
                    {language === 'bn' ? 'দাতার নাম (বাংলায়) *' : 'Donor Name (Bengali) *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={newDonationData.payerNameBn}
                    onChange={(e) => setNewDonationData({ ...newDonationData, payerNameBn: e.target.value })}
                    placeholder="উদা: প্রফেসর ড. মো: রফিকুল ইসলাম"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-medium"
                  />
                </div>

                {/* Donor Name EN */}
                <div className="space-y-1">
                  <label className="font-bold text-gray-700 block">
                    {language === 'bn' ? 'দাতার নাম (ইংরেজিতে)' : 'Donor Name (English)'}
                  </label>
                  <input
                    type="text"
                    value={newDonationData.payerName}
                    onChange={(e) => setNewDonationData({ ...newDonationData, payerName: e.target.value })}
                    placeholder="e.g. Prof. Dr. Rafiqul Islam"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-medium"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className="font-bold text-gray-700 block">
                    {language === 'bn' ? 'মোবাইল নম্বর' : 'Phone Number'}
                  </label>
                  <input
                    type="text"
                    value={newDonationData.phone}
                    onChange={(e) => setNewDonationData({ ...newDonationData, phone: e.target.value })}
                    placeholder="017XXXXXXXX"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-mono font-medium"
                  />
                </div>

                {/* Batch */}
                <div className="space-y-1">
                  <label className="font-bold text-gray-700 block">
                    {language === 'bn' ? 'ব্যাচ / সেশন' : 'Batch / Session'}
                  </label>
                  <input
                    type="text"
                    value={newDonationData.batch}
                    onChange={(e) => setNewDonationData({ ...newDonationData, batch: e.target.value })}
                    placeholder="১ম ব্যাচ (২০০৫-০৬)"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-medium"
                  />
                </div>

                {/* Amount */}
                <div className="space-y-1">
                  <label className="font-black text-rose-900 block">
                    {language === 'bn' ? 'অনুদানের পরিমাণ (টাকা) *' : 'Amount (BDT) *'}
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newDonationData.amount}
                    onChange={(e) => setNewDonationData({ ...newDonationData, amount: e.target.value })}
                    placeholder="5000"
                    className="w-full px-3 py-2 bg-rose-50/60 border-2 border-rose-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-mono font-black text-base text-rose-900"
                  />
                </div>

                {/* Payment Method */}
                <div className="space-y-1">
                  <label className="font-bold text-gray-700 block">
                    {language === 'bn' ? 'পেমেন্ট মাধ্যম (Method) *' : 'Payment Method *'}
                  </label>
                  <select
                    value={newDonationData.paymentMethod}
                    onChange={(e) => setNewDonationData({ ...newDonationData, paymentMethod: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-bold"
                  >
                    <option value="bKash">bKash (বিকাশ)</option>
                    <option value="Nagad">Nagad (নগদ)</option>
                    <option value="Rocket">Rocket (রকেট)</option>
                    <option value="Bank Transfer">Bank Transfer (ব্যাংক ট্রান্সফার)</option>
                    <option value="Cash / Offline">Cash / Offline (ক্যাশ / সরাসরি অনুদান)</option>
                  </select>
                </div>

                {/* Sender Number */}
                <div className="space-y-1">
                  <label className="font-bold text-gray-700 block">
                    {language === 'bn' ? 'প্রেরক নম্বর / ব্যাংক অ্যাকাউন্ট' : 'Sender No / Account'}
                  </label>
                  <input
                    type="text"
                    value={newDonationData.senderNumber}
                    onChange={(e) => setNewDonationData({ ...newDonationData, senderNumber: e.target.value })}
                    placeholder="01XXXXXXXXX"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-mono"
                  />
                </div>

                {/* Transaction ID */}
                <div className="space-y-1">
                  <label className="font-bold text-gray-700 block">
                    {language === 'bn' ? 'ট্রানজেকশন আইডি (TrxID)' : 'Transaction ID'}
                  </label>
                  <input
                    type="text"
                    value={newDonationData.transactionId}
                    onChange={(e) => setNewDonationData({ ...newDonationData, transactionId: e.target.value })}
                    placeholder="BL12345678"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-mono"
                  />
                </div>
              </div>

              {/* Note */}
              <div className="space-y-1">
                <label className="font-bold text-gray-700 block">
                  {language === 'bn' ? 'মন্তব্য বা উদ্দেশ্য (Note / Purpose)' : 'Note / Purpose'}
                </label>
                <textarea
                  rows={2}
                  value={newDonationData.note}
                  onChange={(e) => setNewDonationData({ ...newDonationData, note: e.target.value })}
                  placeholder="উদা: পুনর্মিলনী উপলক্ষে বিশেষ অনুদান"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-medium resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddDonationModalOpen(false)}
                  disabled={isSavingDonation}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSavingDonation}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black shadow-md flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSavingDonation ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>{language === 'bn' ? 'সংরক্ষণ হচ্ছে...' : 'Saving...'}</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{language === 'bn' ? 'ডোনেশন সংরক্ষণ করুন' : 'Save Donation'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
