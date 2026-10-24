import React from 'react';
import { Trash2 } from 'lucide-react';
import { useAdminData } from '../AdminDataContext';

export const DeleteConfirmModals = () => {
  const {
    language,
    memberToDelete,
    setMemberToDelete,
    isDeleting,
    executeSingleDelete,
    selectedMemberIds,
    bulkDeleteModalOpen,
    setBulkDeleteModalOpen,
    executeBulkDelete,
  } = useAdminData();

  return (
    <>
      {/* ================= MODAL: SINGLE MEMBER DELETE CONFIRMATION ================= */}
      {memberToDelete && (
        <div className="fixed inset-0 bg-black/75 z-60 flex items-center justify-center p-4 font-siliguri animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border-2 border-red-500 text-center">
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <Trash2 className="w-7 h-7" />
            </div>
            
            <div className="space-y-1.5">
              <h3 className="font-extrabold text-lg text-gray-900 font-serif-bn">
                {language === 'bn' ? 'সদস্যপদ মুছে ফেলার নিশ্চিতকরণ' : 'Confirm Member Deletion'}
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                {language === 'bn' ? (
                  <>
                    আপনি কি নিশ্চিতভাবে <strong className="text-red-700">"{memberToDelete.name}"</strong>
                    {memberToDelete.formNo ? ` (ফরম: ${memberToDelete.formNo})` : ''}-এর নিবন্ধিত ডাটা ও সনদ স্থায়ীভাবে মুছে ফেলতে চান?
                  </>
                ) : (
                  <>
                    Are you sure you want to permanently delete the member data for <strong>"{memberToDelete.name}"</strong>?
                  </>
                )}
              </p>
              <p className="text-[11px] text-amber-700 bg-amber-50 py-1.5 px-3 rounded-lg border border-amber-200 font-semibold">
                ⚠️ {language === 'bn' ? 'এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।' : 'This action cannot be undone.'}
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setMemberToDelete(null)}
                disabled={isDeleting}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
              >
                {language === 'bn' ? 'না, বাতিল' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={executeSingleDelete}
                disabled={isDeleting}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-colors cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{language === 'bn' ? 'মুছে ফেলা হচ্ছে...' : 'Deleting...'}</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'হ্যাঁ, নিশ্চিত ডিলিট করুন' : 'Yes, Delete Permanently'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: BULK DELETE CONFIRMATION ================= */}
      {bulkDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/75 z-60 flex items-center justify-center p-4 font-siliguri animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border-2 border-red-500 text-center">
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <Trash2 className="w-7 h-7" />
            </div>
            
            <div className="space-y-1.5">
              <h3 className="font-extrabold text-lg text-gray-900 font-serif-bn">
                {language === 'bn' ? 'একাধিক সদস্য মুছে ফেলার নিশ্চিতকরণ' : 'Confirm Bulk Deletion'}
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                {language === 'bn' ? (
                  <>
                    আপনি নির্বাচিত <strong className="text-red-700">{selectedMemberIds.length} জন সদস্যের</strong> সকল নিবন্ধিত তথ্য ও আবেদন স্থায়ীভাবে ডাটাবেজ থেকে মুছে ফেলতে যাচ্ছেন।
                  </>
                ) : (
                  <>
                    You are about to permanently delete <strong>{selectedMemberIds.length} selected members</strong>.
                  </>
                )}
              </p>
              <p className="text-[11px] text-amber-700 bg-amber-50 py-1.5 px-3 rounded-lg border border-amber-200 font-semibold">
                ⚠️ {language === 'bn' ? 'এই প্রক্রিয়াটি স্থায়ী এবং আর ফেরত আনা যাবে না।' : 'This action is irreversible.'}
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setBulkDeleteModalOpen(false)}
                disabled={isDeleting}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
              >
                {language === 'bn' ? 'না, বাতিল' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={executeBulkDelete}
                disabled={isDeleting}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-colors cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{language === 'bn' ? 'মুছে ফেলা হচ্ছে...' : 'Deleting...'}</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>
                      {language === 'bn'
                        ? `হ্যাঁ, ${selectedMemberIds.length} জনই ডিলিট করুন`
                        : `Yes, Delete All ${selectedMemberIds.length}`}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
