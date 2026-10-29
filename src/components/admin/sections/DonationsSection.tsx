import React from 'react';
import { HeartHandshake, Wallet, Search, Filter, X, Download, Printer, Plus, Trash2, ChevronLeft, ChevronRight, Copy } from 'lucide-react';
import { useAdminData } from '../AdminDataContext';

export const DonationsSection = () => {
  const {
    language,
    activeTab,
    allDonations,
    totalDonationAmount,
    donationSearchTerm,
    setDonationSearchTerm,
    donationMethodFilter,
    setDonationMethodFilter,
    filteredDonations,
    paginatedDonations,
    donationStartIndex,
    donationEndIndex,
    donationPage,
    totalDonationPages,
    totalDonationCount,
    handleDonationPageChange,
    setSelectedDonation,
    handleDeleteDonation,
    setIsAddDonationModalOpen,
    handleExportDonationsCsv,
    showToast,
  } = useAdminData();

  return (
    <>
        {activeTab === 'donations' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header Banner */}
            <div className="bg-gradient-to-br from-[#881337] via-[#9f1239] to-[#4c0519] text-white p-5 sm:p-6 rounded-2xl border-2 border-rose-400/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="space-y-1 z-10">
                <div className="flex items-center gap-2">
                  <span className="bg-amber-400 text-rose-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    ALUMNI FUND REGISTER
                  </span>
                  <span className="bg-rose-500/30 text-rose-100 text-[11px] font-bold px-2 py-0.5 rounded-full">
                    {allDonations.length} {language === 'bn' ? 'টি ডোনেশন এন্ট্রি' : 'Donations'}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black font-serif-bn flex items-center gap-2">
                  <HeartHandshake className="w-6 h-6 text-amber-300 shrink-0" />
                  <span>{language === 'bn' ? 'ডোনেশন ফি ও অ্যাসোসিয়েশন তহবিল রেজিস্টার' : 'Donation Fees & Alumni Fund Register'}</span>
                </h2>
                <p className="text-xs sm:text-sm text-rose-100/90 font-medium max-w-2xl">
                  {language === 'bn'
                    ? 'উদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশনের তহবিলে জমাকৃত সকল অনুদান, ডোনার তালিকা ও মাধ্যমভিত্তিক পূর্ণাঙ্গ হিসাব।'
                    : 'Real-time record of all donations, contributor details, and payment medium breakdowns.'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center flex-wrap gap-2.5 z-10">
                <button
                  type="button"
                  onClick={() => setIsAddDonationModalOpen(true)}
                  className="px-4 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-rose-950 font-black rounded-xl text-xs shadow-lg transition-all transform active:scale-95 flex items-center gap-2 cursor-pointer border border-amber-200"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>{language === 'bn' ? 'নতুন ডোনেশন এন্ট্রি' : 'Add Donation'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportDonationsCsv}
                  className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-white/20 cursor-pointer shadow-xs"
                >
                  <Download className="w-4 h-4 text-amber-300" />
                  <span>{language === 'bn' ? 'সিএসভি ডাউনলোড' : 'CSV Export'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-white/20 cursor-pointer shadow-xs"
                >
                  <Printer className="w-4 h-4 text-rose-200" />
                  <span>{language === 'bn' ? 'প্রিন্ট' : 'Print'}</span>
                </button>
              </div>
            </div>

            {/* KPI Highlight Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              {/* Box 1: Total Donation Fund */}
              <div className="bg-white p-4 rounded-2xl border-2 border-rose-500/40 shadow-sm col-span-2 sm:col-span-1 lg:col-span-2">
                <div className="flex items-center justify-between text-xs text-rose-900 font-bold mb-1">
                  <span>{language === 'bn' ? 'সর্বমোট সংগৃহীত অনুদান' : 'Total Donations'}</span>
                  <Wallet className="w-4 h-4 text-rose-600" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-rose-950 font-mono tracking-tight">
                  ৳ {totalDonationAmount.toLocaleString('bn-BD')}
                </div>
                <div className="text-[11px] text-rose-700 font-semibold mt-1">
                  {allDonations.length} {language === 'bn' ? 'জন দাতার অনুদান' : 'Donors count'}
                </div>
              </div>

              {/* Box 2: bKash Collection */}
              <div className="bg-white p-3.5 rounded-2xl border border-pink-200 shadow-2xs">
                <div className="flex items-center justify-between text-xs text-pink-700 font-bold mb-1">
                  <span>বিকাশ (bKash)</span>
                  <span className="w-2 h-2 rounded-full bg-[#D12053]" />
                </div>
                <div className="text-lg font-black text-gray-900 font-mono">
                  ৳ {allDonations.filter(d => (d.paymentMethod || '').toLowerCase().includes('bkash')).reduce((s, c) => s + (Number(c.amount) || 0), 0).toLocaleString('bn-BD')}
                </div>
                <div className="text-[10px] text-gray-500 font-medium mt-0.5">
                  {allDonations.filter(d => (d.paymentMethod || '').toLowerCase().includes('bkash')).length} টি পেমেন্ট
                </div>
              </div>

              {/* Box 3: Nagad Collection */}
              <div className="bg-white p-3.5 rounded-2xl border border-orange-200 shadow-2xs">
                <div className="flex items-center justify-between text-xs text-orange-700 font-bold mb-1">
                  <span>নগদ (Nagad)</span>
                  <span className="w-2 h-2 rounded-full bg-[#F7941D]" />
                </div>
                <div className="text-lg font-black text-gray-900 font-mono">
                  ৳ {allDonations.filter(d => (d.paymentMethod || '').toLowerCase().includes('nagad')).reduce((s, c) => s + (Number(c.amount) || 0), 0).toLocaleString('bn-BD')}
                </div>
                <div className="text-[10px] text-gray-500 font-medium mt-0.5">
                  {allDonations.filter(d => (d.paymentMethod || '').toLowerCase().includes('nagad')).length} টি পেমেন্ট
                </div>
              </div>

              {/* Box 4: Rocket Collection */}
              <div className="bg-white p-3.5 rounded-2xl border border-purple-200 shadow-2xs">
                <div className="flex items-center justify-between text-xs text-purple-700 font-bold mb-1">
                  <span>রকেট (Rocket)</span>
                  <span className="w-2 h-2 rounded-full bg-[#8C3494]" />
                </div>
                <div className="text-lg font-black text-gray-900 font-mono">
                  ৳ {allDonations.filter(d => (d.paymentMethod || '').toLowerCase().includes('rocket')).reduce((s, c) => s + (Number(c.amount) || 0), 0).toLocaleString('bn-BD')}
                </div>
                <div className="text-[10px] text-gray-500 font-medium mt-0.5">
                  {allDonations.filter(d => (d.paymentMethod || '').toLowerCase().includes('rocket')).length} টি পেমেন্ট
                </div>
              </div>

              {/* Box 5: Bank & Cash Collection */}
              <div className="bg-white p-3.5 rounded-2xl border border-emerald-200 shadow-2xs">
                <div className="flex items-center justify-between text-xs text-emerald-700 font-bold mb-1">
                  <span>ব্যাংক / ক্যাশ</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                </div>
                <div className="text-lg font-black text-gray-900 font-mono">
                  ৳ {allDonations.filter(d => !(d.paymentMethod || '').toLowerCase().includes('bkash') && !(d.paymentMethod || '').toLowerCase().includes('nagad') && !(d.paymentMethod || '').toLowerCase().includes('rocket')).reduce((s, c) => s + (Number(c.amount) || 0), 0).toLocaleString('bn-BD')}
                </div>
                <div className="text-[10px] text-gray-500 font-medium mt-0.5">
                  {allDonations.filter(d => !(d.paymentMethod || '').toLowerCase().includes('bkash') && !(d.paymentMethod || '').toLowerCase().includes('nagad') && !(d.paymentMethod || '').toLowerCase().includes('rocket')).length} টি পেমেন্ট
                </div>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-rose-200/80 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                {/* Search Input */}
                <div className="relative w-full sm:w-96">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={donationSearchTerm}
                    onChange={(e) => setDonationSearchTerm(e.target.value)}
                    placeholder={language === 'bn' ? 'দাতার নাম, মোবাইল, TrxID বা ব্যাচ দিয়ে খুঁজুন...' : 'Search by name, phone, TrxID, batch...'}
                    className="w-full pl-9.5 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all font-medium"
                  />
                  {donationSearchTerm && (
                    <button
                      type="button"
                      onClick={() => setDonationSearchTerm('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Method Filter Buttons */}
                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
                  <span className="text-xs font-bold text-gray-500 shrink-0 mr-1">
                    <Filter className="w-3.5 h-3.5 inline mr-1" />
                    {language === 'bn' ? 'মাধ্যম:' : 'Method:'}
                  </span>
                  {[
                    { id: 'all', label: 'সকল মাধ্যম' },
                    { id: 'bkash', label: 'বিকাশ' },
                    { id: 'nagad', label: 'নগদ' },
                    { id: 'rocket', label: 'রকেট' },
                    { id: 'bank', label: 'ব্যাংক' },
                    { id: 'cash', label: 'ক্যাশ / অফলাইন' }
                  ].map((m) => {
                    const isSelected = donationMethodFilter === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setDonationMethodFilter(m.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                          isSelected
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {m.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Donation Records List / Table */}
            <div id="admin-donations-list-container" className="bg-white rounded-2xl border border-rose-200/80 shadow-xs overflow-hidden">
              <div className="p-4 bg-rose-50/50 border-b border-rose-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HeartHandshake className="w-4 h-4 text-rose-700" />
                  <span className="text-xs font-black text-rose-950">
                    {language === 'bn' ? 'ডোনেশন হিসাব তালিকা' : 'Donation Records'} ({filteredDonations.length})
                  </span>
                </div>
                <span className="text-xs font-bold text-rose-900 bg-rose-100 px-2.5 py-0.5 rounded-full">
                  মোট: ৳ {filteredDonations.reduce((s, d) => s + (Number(d.amount) || 0), 0).toLocaleString('bn-BD')}
                </span>
              </div>

              {filteredDonations.length === 0 ? (
                <div className="p-12 text-center space-y-3">
                  <div className="w-14 h-14 bg-rose-50 text-rose-400 rounded-full flex items-center justify-center mx-auto">
                    <HeartHandshake className="w-7 h-7" />
                  </div>
                  <h3 className="font-bold text-gray-800 text-sm">
                    {language === 'bn' ? 'কোনো ডোনেশন রেকর্ড পাওয়া যায়নি' : 'No donation records found'}
                  </h3>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto">
                    {language === 'bn'
                      ? 'নতুন কোনো অনুদান যোগ করতে উপরে "নতুন ডোনেশন এন্ট্রি" বাটনে ক্লিক করুন।'
                      : 'Click "Add Donation" button above to record a new donation.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsAddDonationModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'ডোনেশন এন্ট্রি করুন' : 'Add Donation'}</span>
                  </button>
                </div>
              ) : (
                <>
                  {/* Mobile Card View (sm and down) */}
                  <div className="block md:hidden divide-y divide-gray-100">
                    {paginatedDonations.map((d, idx) => (
                      <div
                        key={d.id || idx}
                        onClick={() => setSelectedDonation(d)}
                        className="p-4 space-y-3 hover:bg-rose-50/40 transition-colors cursor-pointer"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="text-[10px] font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded inline-block border border-rose-200">
                              {d.receiptNo}
                            </div>
                            <h4 className="font-black text-sm text-gray-900 mt-1">
                              {d.payerNameBn || d.payerName}
                            </h4>
                            {d.payerName && d.payerName !== d.payerNameBn && (
                              <p className="text-xs text-gray-600">{d.payerName}</p>
                            )}
                            {(d.batch || d.session) && (
                              <p className="text-[11px] font-semibold text-emerald-800 mt-0.5">
                                {d.batch && `ব্যাচ: ${d.batch}`} {d.session && `(${d.session})`}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <span className="text-base font-black text-rose-800 font-mono">
                              ৳ {(Number(d.amount) || 0).toLocaleString('bn-BD')}
                            </span>
                            <div className="mt-1">
                              <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                d.paymentMethod?.toLowerCase().includes('bkash')
                                  ? 'bg-pink-100 text-[#D12053] border border-pink-200'
                                  : d.paymentMethod?.toLowerCase().includes('nagad')
                                  ? 'bg-orange-100 text-[#F7941D] border border-orange-200'
                                  : d.paymentMethod?.toLowerCase().includes('rocket')
                                  ? 'bg-purple-100 text-[#8C3494] border border-purple-200'
                                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              }`}>
                                {d.paymentMethod || 'Manual'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="text-xs text-gray-600 grid grid-cols-2 gap-2 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                          <div>
                            <span className="text-gray-400 block text-[10px]">মোবাইল / প্রেরক</span>
                            <span className="font-mono font-bold text-gray-800">{d.phone || d.senderNumber || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 block text-[10px]">ট্রানজেকশন আইডি</span>
                            <span className="font-mono font-bold text-rose-900 select-all">{d.transactionId || 'N/A'}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
                          <span>{d.createdAt ? new Date(d.createdAt).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}</span>
                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => handleDeleteDonation(d.id)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop Table View (md and up) */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#881337] text-white uppercase text-[11px] tracking-wider font-semibold">
                        <tr>
                          <th className="py-3.5 px-3">#</th>
                          <th className="py-3.5 px-4">{language === 'bn' ? 'আইডি' : 'ID'}</th>
                          <th className="py-3.5 px-4">{language === 'bn' ? 'দাতার নাম ও পরিচিতি' : 'Donor Info'}</th>
                          <th className="py-3.5 px-4">{language === 'bn' ? 'মোবাইল নম্বর' : 'Phone'}</th>
                          <th className="py-3.5 px-4">{language === 'bn' ? 'অনুদানের পরিমাণ' : 'Amount'}</th>
                          <th className="py-3.5 px-4">{language === 'bn' ? 'পেমেন্ট মাধ্যম' : 'Medium / Method'}</th>
                          <th className="py-3.5 px-4">{language === 'bn' ? 'প্রেরক নম্বর ও TrxID' : 'Sender & TrxID'}</th>
                          <th className="py-3.5 px-4">{language === 'bn' ? 'তারিখ ও সময়' : 'Date & Time'}</th>
                          <th className="py-3.5 px-4 text-right">{language === 'bn' ? 'অ্যাকশন' : 'Actions'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {paginatedDonations.map((d, idx) => {
                          const isBkash = d.paymentMethod?.toLowerCase().includes('bkash');
                          const isNagad = d.paymentMethod?.toLowerCase().includes('nagad');
                          const isRocket = d.paymentMethod?.toLowerCase().includes('rocket');
                          return (
                            <tr
                              key={d.id || idx}
                              onClick={() => setSelectedDonation(d)}
                              className="hover:bg-rose-50/50 transition-colors cursor-pointer group"
                            >
                              <td className="py-3.5 px-3 text-gray-500 font-mono font-bold">
                                {donationStartIndex + idx + 1}
                              </td>
                              <td className="py-3.5 px-4 font-mono font-bold text-rose-900">
                                <span className="bg-rose-50 border border-rose-200 px-2 py-0.5 rounded text-[11px]">
                                  {d.receiptNo}
                                </span>
                              </td>
                              <td className="py-3.5 px-4">
                                <div className="font-black text-gray-900 text-sm">
                                  {d.payerNameBn || d.payerName}
                                </div>
                                {d.payerName && d.payerName !== d.payerNameBn && (
                                  <div className="text-[11px] text-gray-500">{d.payerName}</div>
                                )}
                                {(d.batch || d.session) && (
                                  <div className="text-[11px] font-bold text-emerald-800">
                                    {d.batch && `ব্যাচ: ${d.batch}`} {d.session && `(${d.session})`}
                                  </div>
                                )}
                                {d.note && (
                                  <div className="text-[10px] text-gray-500 italic mt-0.5 line-clamp-1">
                                    "{d.note}"
                                  </div>
                                )}
                              </td>
                              <td className="py-3.5 px-4 font-mono font-bold text-gray-800">
                                {d.phone || d.senderNumber || '—'}
                              </td>
                              <td className="py-3.5 px-4">
                                <span className="text-sm sm:text-base font-black text-rose-950 font-mono bg-rose-100/70 border border-rose-300/80 px-2.5 py-1 rounded-xl shadow-2xs">
                                  ৳ {(Number(d.amount) || 0).toLocaleString('bn-BD')}
                                </span>
                              </td>
                              <td className="py-3.5 px-4">
                                <span
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black shadow-2xs ${
                                    isBkash
                                      ? 'bg-pink-100 text-[#D12053] border border-pink-300'
                                      : isNagad
                                      ? 'bg-orange-100 text-[#c75e00] border border-orange-300'
                                      : isRocket
                                      ? 'bg-purple-100 text-[#8C3494] border border-purple-300'
                                      : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                  }`}
                                >
                                  <span className="w-2 h-2 rounded-full bg-current" />
                                  <span>{d.paymentMethod || 'Manual'}</span>
                                </span>
                              </td>
                              <td className="py-3.5 px-4">
                                <div className="text-xs font-mono font-bold text-gray-800">
                                  {d.senderNumber || d.phone || '—'}
                                </div>
                                <div
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (d.transactionId) {
                                      navigator.clipboard.writeText(d.transactionId);
                                      showToast(language === 'bn' ? 'TrxID কপি হয়েছে!' : 'TrxID Copied!');
                                    }
                                  }}
                                  className="text-[11px] font-mono font-bold text-rose-900 hover:text-rose-700 flex items-center gap-1 cursor-pointer select-all"
                                  title="Click to copy TrxID"
                                >
                                  <span>{d.transactionId || 'N/A'}</span>
                                  <Copy className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                              </td>
                              <td className="py-3.5 px-4 text-xs text-gray-600">
                                <div>{d.createdAt ? new Date(d.createdAt).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</div>
                                <div className="text-[10px] text-gray-400 font-mono">
                                  {d.createdAt ? new Date(d.createdAt).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }) : ''}
                                </div>
                              </td>
                              <td className="py-3.5 px-4 text-right space-x-1.5" onClick={(e) => e.stopPropagation()}>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteDonation(d.id)}
                                  className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors cursor-pointer inline-flex items-center"
                                  title={language === 'bn' ? 'ডোনেশন ডিলিট' : 'Delete Donation'}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Admin 10-Item Donation Pagination Bar */}
                  {totalDonationPages > 1 && (
                    <div className="bg-rose-50/60 border-t border-rose-100 p-3.5 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="text-xs font-bold text-rose-950 text-center sm:text-left">
                        {language === 'bn' ? (
                          <span>
                            মোট <strong className="text-rose-700">{totalDonationCount}</strong> টি রেকর্ডের মধ্যে{' '}
                            <strong className="text-gray-900">{donationStartIndex + 1} - {donationEndIndex}</strong> পর্যন্ত দেখানো হচ্ছে{' '}
                            <span className="text-gray-500 font-normal">(পৃষ্ঠা {donationPage} / {totalDonationPages})</span>
                          </span>
                        ) : (
                          <span>
                            Showing <strong className="text-gray-900">{donationStartIndex + 1} - {donationEndIndex}</strong> of{' '}
                            <strong className="text-rose-700">{totalDonationCount}</strong> records{' '}
                            <span className="text-gray-500 font-normal">(Page {donationPage} of {totalDonationPages})</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleDonationPageChange(donationPage - 1)}
                          disabled={donationPage === 1}
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                            donationPage === 1
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                              : 'bg-white hover:bg-rose-100 text-rose-900 border border-rose-200 shadow-2xs cursor-pointer active:scale-95'
                          }`}
                        >
                          <ChevronLeft className="w-4 h-4" />
                          <span>{language === 'bn' ? 'পূর্ববর্তী' : 'Previous'}</span>
                        </button>

                        <div className="flex items-center gap-1">
                          {Array.from({ length: totalDonationPages }, (_, i) => i + 1).map((pageNum) => (
                            <button
                              key={pageNum}
                              type="button"
                              onClick={() => handleDonationPageChange(pageNum)}
                              className={`min-w-[32px] h-[32px] px-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center ${
                                pageNum === donationPage
                                  ? 'bg-rose-700 text-white shadow-xs scale-105 ring-2 ring-rose-300'
                                  : 'bg-white hover:bg-rose-50 text-gray-700 border border-gray-200'
                              }`}
                            >
                              {pageNum}
                            </button>
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDonationPageChange(donationPage + 1)}
                          disabled={donationPage === totalDonationPages}
                          className={`inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
                            donationPage === totalDonationPages
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                              : 'bg-rose-700 hover:bg-rose-800 text-white shadow-xs cursor-pointer active:scale-95 ring-1 ring-rose-600'
                          }`}
                        >
                          <span>{language === 'bn' ? 'পরবর্তী' : 'Next'}</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
    </>
  );
};
