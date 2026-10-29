import React from 'react';
import { LayoutDashboard, CheckCircle2, Clock, CircleOff, Search, Download, Trash2, Eye, RefreshCw, Mail, ChevronLeft, ChevronRight, Check, X, Copy, Award, FileText } from 'lucide-react';
import { useAdminData } from '../AdminDataContext';

export const MemberApplications = () => {
  const {
    language,
    activeTab,
    navigateTab,
    memberships,
    loading,
    pendingCount,
    unpaidCount,
    approvedCount,
    lifetimeCount,
    filteredMemberships,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    paymentFilter,
    setPaymentFilter,
    selectedMemberIds,
    setSelectedMemberIds,
    setBulkDeleteModalOpen,
    toggleSelectMember,
    toggleSelectAll,
    handleUpdateMemberStatus,
    showToast,
    handleOpenEmailModal,
    setSelectedMember,
    confirmSingleDelete,
    adminStartIndex,
    adminPage,
    totalAdminPages,
    adminEndIndex,
    totalAdminMembersCount,
    paginatedAdminMemberships,
    handleAdminPageChange,
    handleExportCSV,
  } = useAdminData();

  return (
    <>
        {(activeTab === 'overview' || activeTab === 'unregistered' || activeTab === 'unpaid' || activeTab === 'registered' || activeTab === 'lifetime' || activeTab === 'memberships') && (
          <div className="space-y-5 animate-in fade-in duration-300">
            {/* View Switcher: All Applications vs Unregistered vs Registered vs Lifetime */}
            <div className="bg-white p-2 sm:p-2.5 rounded-2xl border border-emerald-100 shadow-xs flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-1.5 p-1 bg-emerald-50/70 rounded-xl border border-emerald-100/80 w-full sm:w-auto overflow-x-auto">
                <button
                  onClick={() => navigateTab('overview')}
                  className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap ${
                    activeTab === 'overview'
                      ? 'bg-[#004d38] text-white shadow-sm'
                      : 'text-gray-700 hover:bg-white/80'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-amber-300" />
                  <span>{language === 'bn' ? 'সকল আবেদন' : 'All Applications'}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    activeTab === 'overview' ? 'bg-emerald-700 text-white' : 'bg-gray-200 text-gray-700'
                  }`}>
                    {memberships.length}
                  </span>
                </button>

                <button
                  onClick={() => navigateTab('unregistered')}
                  className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap ${
                    activeTab === 'unregistered'
                      ? 'bg-amber-400 text-amber-950 shadow-sm'
                      : 'text-gray-700 hover:bg-white/80'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 text-amber-800" />
                  <span>{language === 'bn' ? 'অপেক্ষমান আবেদন' : 'Pending'}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    activeTab === 'unregistered' ? 'bg-amber-500/30 text-amber-950' : 'bg-gray-200 text-gray-700'
                  }`}>
                    {pendingCount}
                  </span>
                </button>

                <button
                  onClick={() => navigateTab('unpaid')}
                  className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap ${
                    activeTab === 'unpaid'
                      ? 'bg-red-700 text-white shadow-sm'
                      : 'text-gray-700 hover:bg-white/80'
                  }`}
                >
                  <CircleOff className="w-3.5 h-3.5 text-red-600" />
                  <span>{language === 'bn' ? 'অপরিশোধিত সদস্য' : 'Unpaid Members'}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    activeTab === 'unpaid' ? 'bg-red-600/30 text-red-100' : 'bg-gray-200 text-gray-700'
                  }`}>
                    {unpaidCount}
                  </span>
                </button>

                <button
                  onClick={() => navigateTab('registered')}
                  className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap ${
                    activeTab === 'registered'
                      ? 'bg-[#006a4e] text-white shadow-sm'
                      : 'text-gray-700 hover:bg-white/80'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                  <span>{language === 'bn' ? 'নিবন্ধিত সদস্য' : 'Registered'}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    activeTab === 'registered' ? 'bg-emerald-800 text-emerald-100' : 'bg-gray-200 text-gray-700'
                  }`}>
                    {approvedCount}
                  </span>
                </button>

                <button
                  onClick={() => navigateTab('lifetime')}
                  className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap ${
                    activeTab === 'lifetime'
                      ? 'bg-amber-500 text-amber-950 shadow-sm'
                      : 'text-gray-700 hover:bg-white/80'
                  }`}
                >
                  <Award className="w-3.5 h-3.5 text-amber-950" />
                  <span>{language === 'bn' ? 'আজীবন সদস্য' : 'Lifetime'}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    activeTab === 'lifetime' ? 'bg-amber-200 text-amber-950' : 'bg-gray-200 text-gray-700'
                  }`}>
                    {lifetimeCount}
                  </span>
                </button>
              </div>

              {/* Action Buttons: Export CSV */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={handleExportCSV}
                  className="w-full sm:w-auto px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-[#006a4e] border-2 border-emerald-300 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>{language === 'bn' ? 'এক্সেল / সিএসভি ডাউনলোড' : 'Export CSV'}</span>
                </button>
              </div>
            </div>

            {/* Contextual Information Banner */}
            {activeTab === 'overview' && (
              <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100/50 border-2 border-emerald-300/80 p-4 rounded-2xl flex items-start gap-3.5 shadow-xs">
                <div className="p-2 bg-[#006a4e] text-white rounded-xl shadow-xs shrink-0 mt-0.5">
                  <FileText className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div className="text-xs text-emerald-950 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-black text-sm text-emerald-950">
                      {language === 'bn' ? 'কেন্দ্রীয় সদস্যপদ আবেদন তালিকা' : 'Central Membership Applications'}
                    </h3>
                    <span className="bg-amber-200 text-amber-950 text-[10px] font-black px-2 py-0.5 rounded-full border border-amber-300">
                      {language === 'bn' ? `অপেক্ষমান আবেদন: ${pendingCount} টি` : `Pending: ${pendingCount}`}
                    </span>
                    <span className="bg-emerald-200 text-emerald-950 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-300">
                      {language === 'bn' ? `অনুমোদিত: ${approvedCount} জন` : `Approved: ${approvedCount}`}
                    </span>
                  </div>
                  <p className="text-emerald-900/90 leading-relaxed font-medium">
                    {language === 'bn'
                      ? 'নিবন্ধন ফরমের মাধ্যমে জমাকৃত সকল আবেদন সরাসরি এখানে প্রদর্শিত হচ্ছে। নতুন আবেদনকারী সাবমিট করলে স্বয়ংক্রিয়ভাবে তালিকায় যুক্ত হয়। TrxID ও তথ্য যাচাই করে "এপ্রুভ করুন" বাটনে ক্লিক করুন।'
                      : 'All member applications are listed below in real-time. Verify details and click "Approve" to activate membership.'}
                  </p>
                </div>
              </div>
            )}
            {activeTab === 'unregistered' && (
              <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-100/50 border-2 border-amber-300/80 p-4 rounded-2xl flex items-start gap-3.5 shadow-xs">
                <div className="p-2 bg-amber-500 text-white rounded-xl shadow-xs shrink-0 mt-0.5">
                  <Clock className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div className="text-xs text-amber-950 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-black text-sm text-amber-950">
                      {language === 'bn' ? 'অনিবন্ধিত আবেদন তালিকা (ট্রানজেকশন যাচাই অপেক্ষমান)' : 'Unregistered Applications (Pending Verification)'}
                    </h3>
                    <span className="bg-amber-200 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded-full border border-amber-300">
                      অপেক্ষমান: {pendingCount} টি
                    </span>
                  </div>
                  <p className="text-amber-900/90 leading-relaxed font-medium">
                    {language === 'bn'
                      ? 'প্রতিটি আবেদনকারীর প্রদত্ত TrxID ও প্রেরক নম্বর মিলিয়ে আপনার বিকাশ/ব্যাংক একাউন্টে ফি জমা হওয়া নিশ্চিত করুন। ট্রানজেকশন সঠিক থাকলে সরাসরি "✓ এপ্রুভ করুন" বাটনে ক্লিক করুন। এপ্রুভ করার সাথে সাথে আবেদনকারী নিবন্ধিত তালিকায় চলে যাবে।'
                      : 'Verify each applicant\'s TrxID and Sender Number. Once payment is confirmed, click "Approve" to automatically move them to the Registered List.'}
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'unpaid' && (
              <div className="bg-gradient-to-r from-red-50 via-rose-50 to-red-100/50 border-2 border-red-300/80 p-4 rounded-2xl flex items-start gap-3.5 shadow-xs">
                <div className="p-2 bg-red-600 text-white rounded-xl shadow-xs shrink-0 mt-0.5">
                  <CircleOff className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div className="text-xs text-red-950 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-black text-sm text-red-950">
                      {language === 'bn' ? 'অপরিশোধিত সদস্য তালিকা (পেমেন্ট বাকি রয়েছে)' : 'Unpaid Members List (Payment Pending)'}
                    </h3>
                    <span className="bg-red-200 text-red-900 text-[10px] font-black px-2 py-0.5 rounded-full border border-red-300">
                      অপরিশোধিত: {unpaidCount} জন
                    </span>
                  </div>
                  <p className="text-red-900/90 leading-relaxed font-medium">
                    {language === 'bn'
                      ? 'এই তালিকায় শুধুমাত্র সেই সদস্য রয়েছে যাদের আবেদন এপ্রুভ করা হয়েছে কিন্তু মেম্বারশিপ ফি এখনো পরিশোধ হয়নি (Unpaid)। পেমেন্ট নিশ্চিত হলে "Paid (নিবন্ধিত করুন)" বাটনে ক্লিক করে তাদের নিবন্ধিত তালিকায় যুক্ত করুন।'
                      : 'Showing only approved applications whose membership fee has not been paid yet (Unpaid). Once payment is confirmed, click "Paid (Approve)" to move them to the Registered List.'}
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'registered' && (
              <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100/50 border-2 border-emerald-300/80 p-4 rounded-2xl flex items-start gap-3.5 shadow-xs">
                <div className="p-2 bg-[#006a4e] text-white rounded-xl shadow-xs shrink-0 mt-0.5">
                  <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div className="text-xs text-emerald-950 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-black text-sm text-emerald-950">
                      {language === 'bn' ? 'নিবন্ধিত অ্যালামনাই সদস্যবৃন্দ (অনুমোদিত ও সক্রিয়)' : 'Registered Alumni Members (Verified & Approved)'}
                    </h3>
                    <span className="bg-emerald-200 text-emerald-900 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-300">
                      মোট নিবন্ধিত: {approvedCount} জন
                    </span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-emerald-900/90 leading-relaxed font-medium">
                      {language === 'bn'
                        ? 'এই তালিকায় অনুমোদিত অ্যালামনাই সদস্যদের তথ্য সংরক্ষিত রয়েছে। এখান থেকে আবেদনপত্র ও সনদ ভিউ বা প্রিন্ট করা যাবে।'
                        : 'These members have verified payment and approved status. You can view applications, and print certificates.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'lifetime' && (
              <div className="bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-100/60 border-2 border-amber-400/80 p-4 rounded-2xl flex items-start gap-3.5 shadow-xs">
                <div className="p-2 bg-amber-500 text-amber-950 rounded-xl shadow-xs shrink-0 mt-0.5">
                  <Award className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div className="text-xs text-amber-950 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-black text-sm text-amber-950">
                      {language === 'bn' ? 'আজীবন সদস্য তালিকা (Lifetime Members)' : 'Lifetime Members List'}
                    </h3>
                    <span className="bg-amber-200 text-amber-950 text-[10px] font-black px-2 py-0.5 rounded-full border border-amber-300">
                      মোট আজীবন সদস্য: {lifetimeCount} জন
                    </span>
                  </div>
                  <p className="text-amber-900/90 leading-relaxed font-medium">
                    {language === 'bn'
                      ? 'নিবন্ধন ফর্মে "আজীবন সদস্য" (Life Member - ফি ৳২৫০০/-) নির্বাচন করা এবং অনুমোদিত (Approved) সদস্যদের তালিকা এখানে প্রদর্শিত হয়। আবেদন এপ্রুভ না হওয়া পর্যন্ত এই তালিকায় আসবে না।'
                      : 'Showing approved members who selected "Life Member" (Fee ৳2500/-). Applications appear here only after approval.'}
                  </p>
                </div>
              </div>
            )}

            {/* Filter & Search Bar */}
            <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-xs grid grid-cols-1 sm:grid-cols-12 gap-3">
              {/* Search Box */}
              <div className="sm:col-span-6 relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={language === 'bn' ? 'নাম, ফরম নং, মোবাইল, ইমেইল বা ট্রানজেকশন...' : 'Search by name, form no, mobile, email...'}
                  className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#006a4e] focus:bg-white transition-all font-medium"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Status Filter */}
              <div className="sm:col-span-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#006a4e] font-semibold text-gray-700 cursor-pointer"
                >
                  <option value="all">{language === 'bn' ? 'সকল স্ট্যাটাস' : 'All Status'}</option>
                  <option value="approved">{language === 'bn' ? 'অনুমোদিত (Approved)' : 'Approved'}</option>
                  <option value="pending">{language === 'bn' ? 'বিবেচনাধীন (Pending)' : 'Pending'}</option>
                  <option value="rejected">{language === 'bn' ? 'বাতিল (Rejected)' : 'Rejected'}</option>
                </select>
              </div>

              {/* Payment Filter */}
              <div className="sm:col-span-3">
                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#006a4e] font-semibold text-gray-700 cursor-pointer"
                >
                  <option value="all">{language === 'bn' ? 'সকল পেমেন্ট' : 'All Payments'}</option>
                  <option value="paid">{language === 'bn' ? 'পেইড (Paid)' : 'Paid'}</option>
                  <option value="unpaid">{language === 'bn' ? 'অপরিশোধিত (Unpaid)' : 'Unpaid'}</option>
                </select>
              </div>
            </div>

            {/* Bulk Selection Bar if any selected */}
            {selectedMemberIds.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-xs animate-in fade-in slide-in-from-top-1">
                <div className="flex items-center gap-2 text-xs font-bold text-red-900">
                  <span className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-xs">
                    {selectedMemberIds.length}
                  </span>
                  <span>
                    {language === 'bn'
                      ? `${selectedMemberIds.length} জন সদস্য নির্বাচন করা হয়েছে`
                      : `${selectedMemberIds.length} members selected`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedMemberIds([])}
                    className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    {language === 'bn' ? 'নির্বাচন বাতিল' : 'Deselect All'}
                  </button>
                  <button
                    onClick={() => setBulkDeleteModalOpen(true)}
                    className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>
                      {language === 'bn'
                        ? `নির্বাচিত ${selectedMemberIds.length} জন সদস্য ডিলিট করুন`
                        : `Delete Selected (${selectedMemberIds.length})`}
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* Applications Table */}
            <div id="admin-members-list-container" className="bg-white rounded-2xl border border-emerald-100 shadow-xs overflow-hidden">
              {loading ? (
                <div className="py-16 text-center text-xs text-gray-500 space-y-3">
                  <div className="w-9 h-9 border-3 border-[#006a4e] border-t-transparent rounded-full animate-spin mx-auto" />
                  <p>{language === 'bn' ? 'আবেদন ডাটা লোড হচ্ছে...' : 'Loading applications...'}</p>
                </div>
              ) : filteredMemberships.length === 0 ? (
                <div className="py-16 text-center text-xs text-gray-400 space-y-2">
                  <FileText className="w-10 h-10 mx-auto text-gray-300" />
                  <p className="font-bold text-gray-700 text-sm">
                    {language === 'bn' ? 'কোনো আবেদন খুঁজে পাওয়া যায়নি' : 'No applications found'}
                  </p>
                  <p className="text-[11px] text-gray-400">
                    {language === 'bn' ? 'অনুগ্রহ করে সার্চ বা ফিল্টার পরিবর্তন করে পুনরায় চেষ্টা করুন।' : 'Try changing your search filters.'}
                  </p>
                </div>
              ) : (
                <>
                  {/* Mobile Cards View (Visible on small screens < md) */}
                  <div className="block md:hidden divide-y divide-emerald-100/70">
                    {paginatedAdminMemberships.map((m, idx) => {
                      const absoluteIndex = adminStartIndex + idx + 1;
                      const isSelected = selectedMemberIds.includes(m.id);
                      return (
                        <div
                          key={m.id}
                          className={`p-3.5 sm:p-4 space-y-3 transition-colors ${
                            isSelected ? 'bg-red-50/40' : 'hover:bg-emerald-50/30'
                          }`}
                        >
                          {/* Top Row: Checkbox, Index, Form No, Status */}
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleSelectMember(m.id)}
                                className="w-4 h-4 rounded text-[#006a4e] focus:ring-0 cursor-pointer accent-[#006a4e]"
                              />
                              <span className="font-mono text-gray-400 text-xs font-bold">#{absoluteIndex}</span>
                              <span className="font-mono text-xs font-bold bg-gray-100 text-gray-800 px-2 py-0.5 rounded border border-gray-200">
                                {m.formNo || m.id.slice(-6)}
                              </span>
                            </div>

                            {/* Status Dropdown */}
                            <select
                              value={m.status === 'payment_pending' ? 'pending' : (m.status || 'pending')}
                              onChange={(e) => handleUpdateMemberStatus(m.id, e.target.value as any)}
                              className={`text-[11px] font-bold px-2 py-1 rounded-lg border focus:outline-none cursor-pointer transition-all ${
                                m.status === 'approved'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-1 ring-emerald-300'
                                  : m.status === 'rejected'
                                  ? 'bg-red-50 text-red-800 border-red-300 ring-1 ring-red-300'
                                  : 'bg-amber-50 text-amber-800 border-amber-300 ring-1 ring-amber-300'
                              }`}
                            >
                              <option value="pending">{language === 'bn' ? 'বিবেচনাধীন' : 'Pending'}</option>
                              <option value="approved">{language === 'bn' ? 'অনুমোদিত' : 'Approved'}</option>
                              <option value="rejected">{language === 'bn' ? 'বাতিল' : 'Rejected'}</option>
                            </select>
                          </div>

                          {/* Member Info Row */}
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold overflow-hidden shrink-0 text-sm shadow-xs">
                              {m.userPhotoUrl ? (
                                <img src={m.userPhotoUrl} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <span>{(m.applicantNameBn || m.fullName || 'ম').charAt(0)}</span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0 space-y-0.5">
                              <h4 className="font-bold text-gray-900 text-sm leading-snug">
                                {m.applicantNameBn || m.fullName}
                              </h4>
                              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-gray-600">
                                <span>{m.batch || '—'}</span>
                                {m.session && (
                                  <span className="text-emerald-700 font-mono font-semibold">({m.session})</span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-xs font-mono text-gray-700">
                                <span className="font-bold">{m.mobile}</span>
                              </div>
                            </div>
                          </div>

                          {/* Fee & Payment Badge Box */}
                          <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200/70 flex flex-wrap items-center justify-between gap-1.5 text-xs">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-[#006a4e] font-mono">৳ {m.feeAmount || '৫০০'}</span>
                              <span className="text-gray-400">•</span>
                              {m.paymentMethod === 'Unpaid' || m.paymentStatus === 'unpaid' ? (
                                <span className="font-extrabold text-red-800 bg-red-100 border border-red-300 px-2 py-0.5 rounded text-[11px] font-mono uppercase">
                                  Unpaid
                                </span>
                              ) : (
                                <span className="text-gray-700 font-bold bg-white px-1.5 py-0.5 rounded border border-gray-200">
                                  {m.paymentMethod || 'Manual'}
                                </span>
                              )}
                            </div>
                            {m.transactionId && m.transactionId !== 'UNPAID' ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigator.clipboard.writeText(m.transactionId || '');
                                  showToast(language === 'bn' ? `TrxID কপি হয়েছে: ${m.transactionId}` : `TrxID copied: ${m.transactionId}`);
                                }}
                                className="font-mono text-[11px] font-black text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded cursor-pointer active:scale-95 flex items-center gap-1 hover:bg-rose-100 transition-colors"
                                title="কপি করতে ক্লিক করুন"
                              >
                                <span>Trx: {m.transactionId}</span>
                                <Copy className="w-3 h-3 text-rose-500" />
                              </button>
                            ) : (
                              <span className="text-[10px] text-red-600 font-bold italic">পরিশোধ বাকি (Unpaid)</span>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-wrap items-center justify-between gap-2 pt-1.5 border-t border-gray-100">
                            <div className="flex items-center gap-1.5">
                              {m.status !== 'approved' || m.paymentStatus !== 'paid' || m.paymentMethod === 'Unpaid' ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateMemberStatus(m.id, 'approved', m.status === 'approved' ? { markPaid: true } : { markPaid: false })}
                                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-black transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                                    title={language === 'bn' ? 'পেমেন্ট প্রাপ্তির পর Paid চিহ্নিত করে নিবন্ধিত তালিকায় স্থানান্তর করুন' : 'Mark as Paid & Approve Member'}
                                  >
                                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                                    <span>
                                      {m.status === 'approved'
                                        ? (language === 'bn' ? 'Paid (নিবন্ধিত করুন)' : 'Mark Paid')
                                        : (language === 'bn' ? 'এপ্রুভ করুন' : 'Approve')}
                                    </span>
                                  </button>
                                </>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black bg-emerald-100 text-emerald-900 border border-emerald-300">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                                  <span>{language === 'bn' ? 'অনুমোদিত' : 'Approved'}</span>
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5">
                              {m.email && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleOpenEmailModal({
                                      name: m.applicantNameBn || m.fullName || 'Member',
                                      email: m.email!,
                                      formNo: m.formNo,
                                      membershipId: m.membershipId,
                                    })
                                  }
                                  className="px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                                  title={language === 'bn' ? 'ইমেইল পাঠান' : 'Send Email'}
                                >
                                  <Mail className="w-3.5 h-3.5" />
                                  <span>{language === 'bn' ? 'ইমেইল' : 'Email'}</span>
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => setSelectedMember(m)}
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-50 text-[#006a4e] hover:bg-emerald-100 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                                title={language === 'bn' ? 'সদস্য ফরম ভিউ করুন' : 'View Member Form'}
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>{language === 'bn' ? 'ফরম' : 'Form'}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => confirmSingleDelete(m.id, m.applicantNameBn || m.fullName || 'Member', m.formNo)}
                                className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                                title={language === 'bn' ? 'ডিলিট করুন' : 'Delete'}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Desktop Table View (Visible on md and up) */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#004d38] text-white uppercase text-[11px] tracking-wider font-semibold">
                        <tr>
                          <th className="py-3.5 px-3 w-10 text-center">
                            <input
                              type="checkbox"
                              checked={
                                filteredMemberships.length > 0 &&
                                filteredMemberships.every((m) => selectedMemberIds.includes(m.id))
                              }
                              onChange={() => toggleSelectAll(filteredMemberships)}
                              className="w-4 h-4 rounded text-[#006a4e] focus:ring-0 cursor-pointer accent-[#006a4e]"
                              title={language === 'bn' ? 'সবগুলো নির্বাচন করুন' : 'Select All'}
                            />
                          </th>
                          <th className="py-3.5 px-3">#</th>
                          <th className="py-3 px-2 xl:px-4">{language === 'bn' ? 'ফরম নং' : 'Form No'}</th>
                          <th className="py-3 px-2 xl:px-4">{language === 'bn' ? 'আবেদনকারীর নাম ও ছবি' : 'Applicant'}</th>
                          <th className="py-3 px-2 xl:px-4">{language === 'bn' ? 'ব্যাচ ও সেশন' : 'Batch / Session'}</th>
                          <th className="py-3 px-2 xl:px-4">{language === 'bn' ? 'মোবাইল ও ইমেইল' : 'Contact'}</th>
                          <th className="py-3 px-2 xl:px-4">{language === 'bn' ? 'ফি ও ট্রানজেকশন' : 'Fee & Payment'}</th>
                          <th className="py-3 px-2 xl:px-4">{language === 'bn' ? 'অনুমোদন স্থিতি' : 'Status'}</th>
                          <th className="py-3 px-2 xl:px-4 text-right">{language === 'bn' ? 'অ্যাকশন' : 'Actions'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {paginatedAdminMemberships.map((m, idx) => {
                          const absoluteIndex = adminStartIndex + idx + 1;
                          const isSelected = selectedMemberIds.includes(m.id);
                          return (
                            <tr
                              key={m.id}
                              className={`transition-colors cursor-pointer group ${
                                isSelected ? 'bg-red-50/40 hover:bg-red-50/70' : 'hover:bg-emerald-50/50'
                              }`}
                              onClick={() => setSelectedMember(m)}
                            >
                              <td className="py-3.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleSelectMember(m.id)}
                                  className="w-4 h-4 rounded text-[#006a4e] focus:ring-0 cursor-pointer accent-[#006a4e]"
                                />
                              </td>
                              <td className="py-3.5 px-3 font-mono text-gray-400 text-[11px]">
                                {absoluteIndex}
                              </td>
                              <td className="py-3 px-2 xl:px-4">
                                <span className="font-mono text-[11px] font-bold bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded border border-gray-200 whitespace-nowrap">
                                  {m.formNo || m.id.slice(-6)}
                                </span>
                              </td>
                              <td className="py-3 px-2 xl:px-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold overflow-hidden shrink-0 text-xs shadow-2xs">
                                    {m.userPhotoUrl ? (
                                      <img src={m.userPhotoUrl} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                      <span>{(m.applicantNameBn || m.fullName || 'ম').charAt(0)}</span>
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="font-bold text-gray-900 group-hover:text-[#006a4e] truncate max-w-[120px] xl:max-w-[170px]">
                                      {m.applicantNameBn || m.fullName}
                                    </div>
                                    {m.occupation && (
                                      <div className="text-[10px] text-gray-500 truncate max-w-[120px] xl:max-w-[170px]">{m.occupation}</div>
                                    )}
                                    {(m.degreeDocData || m.degreeDocName) && (
                                      <div className="mt-0.5">
                                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-300 px-1.5 py-0.2 rounded font-medium">
                                          <FileText className="w-3 h-3 text-emerald-600" />
                                          <span>সনদ সংলগ্ন</span>
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-2 xl:px-4">
                                <div className="font-semibold text-gray-900 whitespace-nowrap">{m.batch || '—'}</div>
                                <div className="text-[10px] text-emerald-700 font-mono whitespace-nowrap">{m.session || '—'}</div>
                              </td>
                              <td className="py-3 px-2 xl:px-4">
                                <div className="font-mono font-bold text-gray-800 whitespace-nowrap text-[11px] xl:text-xs">{m.mobile}</div>
                                {m.email && (
                                  <div className="text-[10px] text-gray-500 truncate max-w-[110px]">{m.email}</div>
                                )}
                              </td>
                              <td className="py-3 px-2 xl:px-4">
                                <div className="font-bold text-[#006a4e] font-mono text-sm whitespace-nowrap">৳ {m.feeAmount || '৫০০'}</div>
                                <div className="text-[10px] xl:text-[11px] text-gray-700 font-mono flex items-center gap-1.5 flex-wrap mt-0.5">
                                  {m.paymentMethod === 'Unpaid' || m.paymentStatus === 'unpaid' ? (
                                    <span className="font-extrabold text-red-800 bg-red-100 border border-red-300 px-1.5 py-0.5 rounded uppercase text-[10px]">
                                      Unpaid
                                    </span>
                                  ) : (
                                    <span className="font-bold text-gray-800 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200 whitespace-nowrap text-[10px]">
                                      {m.paymentMethod || 'Manual'}
                                    </span>
                                  )}
                                  {m.transactionId && m.transactionId !== 'UNPAID' && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        navigator.clipboard.writeText(m.transactionId || '');
                                        showToast(language === 'bn' ? `TrxID কপি হয়েছে: ${m.transactionId}` : `TrxID copied: ${m.transactionId}`);
                                      }}
                                      className="min-w-0 font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded flex items-center gap-1 hover:bg-rose-100 transition-colors cursor-pointer"
                                      title={language === 'bn' ? 'TrxID কপি করতে ক্লিক করুন' : 'Click to copy TrxID'}
                                    >
                                      <span className="truncate max-w-[90px]">Trx: {m.transactionId}</span>
                                      <Copy className="w-3 h-3 text-rose-500 shrink-0" />
                                    </button>
                                  )}
                                </div>
                                {m.senderNumber && (
                                  <div className="text-[10px] text-gray-500 font-mono mt-0.5">
                                    প্রেরক: <span className="font-bold text-gray-700">{m.senderNumber}</span>
                                  </div>
                                )}
                              </td>
                              <td className="py-3 px-2 xl:px-4" onClick={(e) => e.stopPropagation()}>
                                {m.status === 'approved' && m.paymentStatus === 'paid' && m.paymentMethod !== 'Unpaid' ? (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] xl:text-xs font-black bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-2xs whitespace-nowrap">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                                    <span>{language === 'bn' ? 'অনুমোদিত' : 'Approved'}</span>
                                  </span>
                                ) : m.paymentMethod === 'Unpaid' || m.paymentStatus === 'unpaid' ? (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] xl:text-xs font-black bg-red-100 text-red-950 border border-red-300 shadow-2xs whitespace-nowrap">
                                    <Clock className="w-3 h-3 text-red-700" />
                                    <span>{language === 'bn' ? 'অনিবন্ধিত (Unpaid)' : 'Unpaid'}</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] xl:text-xs font-black bg-amber-100 text-amber-950 border border-amber-300 shadow-2xs whitespace-nowrap">
                                    <Clock className="w-3 h-3 text-amber-700" />
                                    <span>{language === 'bn' ? 'যাচাই অপেক্ষমান' : 'Pending'}</span>
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-2 xl:px-4 text-right align-middle" onClick={(e) => e.stopPropagation()}>
                                <div className="inline-flex flex-wrap items-center justify-end gap-1 xl:gap-1.5">
                                {m.status !== 'approved' || m.paymentStatus !== 'paid' || m.paymentMethod === 'Unpaid' ? (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateMemberStatus(m.id, 'approved', m.status === 'approved' ? { markPaid: true } : { markPaid: false })}
                                      className="px-2 xl:px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-[10px] xl:text-xs font-black inline-flex items-center gap-1 shadow-sm transition-all cursor-pointer hover:shadow whitespace-nowrap"
                                      title={language === 'bn' ? 'পেমেন্ট পেয়ে থাকলে Paid চিহ্নিত করে নিবন্ধিত তালিকায় স্থানান্তরিত করুন' : 'Mark as Paid & Move to Registered List'}
                                    >
                                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                                      <span>
                                        {m.status === 'approved'
                                          ? (language === 'bn' ? 'Paid (নিবন্ধিত করুন)' : 'Mark Paid')
                                          : (language === 'bn' ? 'এপ্রুভ করুন' : 'Approve')}
                                      </span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setSelectedMember(m)}
                                      className="p-1.5 rounded-lg bg-emerald-50 text-[#006a4e] hover:bg-emerald-100 transition-colors cursor-pointer inline-flex items-center"
                                      title={language === 'bn' ? 'সদস্য ফরম ও পূর্ণ বিবরণ' : 'View Member Form'}
                                    >
                                      <Eye className="w-4 h-4" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => confirmSingleDelete(m.id, m.applicantNameBn || m.fullName || 'Member', m.formNo)}
                                      className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors cursor-pointer inline-flex items-center"
                                      title={language === 'bn' ? 'আবেদন ডিলিট' : 'Delete Application'}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => setSelectedMember(m)}
                                      className="p-1.5 rounded-lg bg-emerald-50 text-[#006a4e] hover:bg-emerald-100 transition-colors cursor-pointer inline-flex items-center"
                                      title={language === 'bn' ? 'সদস্য ফরম ও সনদ প্রিন্ট' : 'View Form & Certificate'}
                                    >
                                      <Eye className="w-4 h-4" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateMemberStatus(m.id, 'pending')}
                                      className="p-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-amber-100 hover:text-amber-800 transition-colors cursor-pointer inline-flex items-center"
                                      title={language === 'bn' ? 'পুনরায় অনিবন্ধিত তালিকায় স্থানান্তর করুন' : 'Revert to Unregistered'}
                                    >
                                      <RefreshCw className="w-4 h-4" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => confirmSingleDelete(m.id, m.applicantNameBn || m.fullName || 'Member', m.formNo)}
                                      className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors cursor-pointer inline-flex items-center"
                                      title={language === 'bn' ? 'সদস্য ডিলিট করুন' : 'Delete Member'}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </>
                                )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Admin 10-Item Pagination Bar */}
                  {totalAdminPages > 1 && (
                    <div className="bg-[#f4f8f5] border-t border-emerald-100 p-3.5 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="text-xs font-bold text-gray-700 text-center sm:text-left">
                        {language === 'bn' ? (
                          <span>
                            মোট <strong className="text-[#006a4e]">{totalAdminMembersCount}</strong> জনের মধ্যে{' '}
                            <strong className="text-gray-900">{adminStartIndex + 1} - {adminEndIndex}</strong> পর্যন্ত দেখানো হচ্ছে{' '}
                            <span className="text-gray-500 font-normal">(পৃষ্ঠা {adminPage} / {totalAdminPages})</span>
                          </span>
                        ) : (
                          <span>
                            Showing <strong className="text-gray-900">{adminStartIndex + 1} - {adminEndIndex}</strong> of{' '}
                            <strong className="text-[#006a4e]">{totalAdminMembersCount}</strong> records{' '}
                            <span className="text-gray-500 font-normal">(Page {adminPage} of {totalAdminPages})</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleAdminPageChange(adminPage - 1)}
                          disabled={adminPage === 1}
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                            adminPage === 1
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                              : 'bg-white hover:bg-emerald-50 text-[#006a4e] border border-emerald-300 shadow-2xs cursor-pointer active:scale-95'
                          }`}
                        >
                          <ChevronLeft className="w-4 h-4" />
                          <span>{language === 'bn' ? 'পূর্ববর্তী' : 'Previous'}</span>
                        </button>

                        <div className="flex items-center gap-1">
                          {Array.from({ length: totalAdminPages }, (_, i) => i + 1).map((pageNum) => (
                            <button
                              key={pageNum}
                              type="button"
                              onClick={() => handleAdminPageChange(pageNum)}
                              className={`min-w-[32px] h-[32px] px-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center ${
                                pageNum === adminPage
                                  ? 'bg-[#006a4e] text-white shadow-xs scale-105 ring-2 ring-emerald-300'
                                  : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
                              }`}
                            >
                              {pageNum}
                            </button>
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleAdminPageChange(adminPage + 1)}
                          disabled={adminPage === totalAdminPages}
                          className={`inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
                            adminPage === totalAdminPages
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                              : 'bg-[#006a4e] hover:bg-[#00523d] text-white shadow-xs cursor-pointer active:scale-95 ring-1 ring-emerald-700'
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
