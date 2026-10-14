import React, { useEffect, useState } from 'react';
import { Users, UserCheck, Shield, HeartHandshake, Save, RotateCcw, CheckCircle2, SlidersHorizontal, Lock } from 'lucide-react';
import { db } from '../../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { CommunityStatsData, DEFAULT_MANUAL_STATS } from '../CommunityStatsWidget';

interface CommunityStatsAdminEditorProps {
  language: 'bn' | 'en';
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const LOCAL_STORAGE_KEY = 'baajnu_community_stats';

export const CommunityStatsAdminEditor: React.FC<CommunityStatsAdminEditorProps> = ({
  language,
  onShowToast,
}) => {
  const [formData, setFormData] = useState<CommunityStatsData>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_MANUAL_STATS, ...JSON.parse(saved), mode: 'manual' };
      }
    } catch (e) {
      console.warn('localStorage error:', e);
    }
    return DEFAULT_MANUAL_STATS;
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        // 1. Try server API
        try {
          const apiRes = await fetch('/api/community-stats');
          if (apiRes.ok) {
            const apiData = await apiRes.json();
            if (apiData && typeof apiData === 'object') {
              const merged = { ...DEFAULT_MANUAL_STATS, ...apiData, mode: 'manual' as const };
              setFormData(merged);
              localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged));
            }
          }
        } catch (apiErr) {
          console.warn('Could not fetch /api/community-stats:', apiErr);
        }

        // 2. Try Firestore doc
        try {
          const docRef = doc(db, 'site_settings', 'community_stats');
          const snap = await getDoc(docRef);
          if (snap.exists()) {
            const data = snap.data() as CommunityStatsData;
            const merged = {
              ...DEFAULT_MANUAL_STATS,
              ...data,
              mode: 'manual' as const,
            };
            setFormData(merged);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged));
          }
        } catch (firestoreErr) {
          console.warn('Could not fetch Firestore community stats:', firestoreErr);
        }
      } catch (err) {
        console.error('Error fetching community stats settings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      setSaving(true);
      const payload: CommunityStatsData = {
        ...formData,
        mode: 'manual', // Strictly manual - Auto Sync turned off
      };

      // 1. Save to local storage
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(payload));
      } catch (e) {
        console.warn('localStorage save warning:', e);
      }

      // 2. Broadcast window event for immediate UI update without refresh
      window.dispatchEvent(
        new CustomEvent('community-stats-updated', { detail: payload })
      );

      // 3. Save to server persistent API
      try {
        await fetch('/api/community-stats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } catch (apiErr) {
        console.warn('Server API save warning:', apiErr);
      }

      // 4. Save to Firestore
      try {
        const docRef = doc(db, 'site_settings', 'community_stats');
        await setDoc(docRef, {
          ...payload,
          updatedAt: new Date().toISOString(),
        }, { merge: true });
      } catch (fireErr: any) {
        console.warn('Firestore doc save warning (saved locally & on server):', fireErr);
      }

      setSaveSuccess(true);
      onShowToast(
        language === 'bn'
          ? 'আমাদের অ্যালামনাই পরিবারের ম্যানুয়াল পরিসংখ্যান সফলভাবে সেভ হয়েছে!'
          : 'Alumni family manual stats updated successfully!',
        'success'
      );
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      console.error('Error saving community stats:', err);
      onShowToast(
        language === 'bn'
          ? 'সেভ করতে সমস্যা হয়েছে: ' + (err.message || '')
          : 'Failed to save settings: ' + (err.message || ''),
        'error'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefault = () => {
    if (window.confirm(
      language === 'bn'
        ? 'আপনি কি নিশ্চিত যে ডিফল্ট মানে রিসেট করতে চান?'
        : 'Are you sure you want to reset to default values?'
    )) {
      setFormData(DEFAULT_MANUAL_STATS);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-emerald-200 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-[#006a4e] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-gray-600 font-medium text-sm">
          {language === 'bn' ? 'কমিউটি পরিসংখ্যান লোড হচ্ছে...' : 'Loading stats settings...'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#004d38] via-[#006a4e] to-[#004d38] rounded-2xl p-6 text-white shadow-md relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
            <h2 className="text-2xl font-black tracking-tight">
              {language === 'bn' ? 'আমাদের অ্যালামনাই পরিবার — পরিসংখ্যান নিয়ন্ত্রণ' : 'Our Alumni Family — Stats Controller'}
            </h2>
            <span className="px-2.5 py-1 rounded-full text-xs font-black bg-amber-400 text-amber-950 inline-flex items-center gap-1 shadow-xs">
              <Lock className="w-3 h-3" />
              {language === 'bn' ? 'Auto Sync বন্ধ (শুধু ম্যানুয়াল)' : 'Auto Sync OFF (Manual Only)'}
            </span>
          </div>
          <p className="text-emerald-100 text-sm max-w-2xl leading-relaxed">
            {language === 'bn'
              ? 'হোমপেইজের "আমাদের অ্যালামনাই পরিবার" উইজেটের সংখ্যাসমূহ সম্পূর্ণ ম্যানুয়ালি নিয়ন্ত্রিত। ডাটাবেজের স্বয়ংক্রিয় সিঙ্ক বন্ধ রাখা হয়েছে, তাই এখানে আপনি যে সংখ্যা দিবেন ঠিক তাই হোমপেইজে স্থায়ীভাবে প্রদর্শিত হবে।'
              : 'The "Our Alumni Family" widget on the homepage is strictly manual. Auto Sync is disabled, so the exact numbers you enter here will remain locked and displayed permanently on the homepage.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center gap-1.5 border border-white/20 cursor-pointer"
            title="Reset to default"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'ডিফল্ট মান' : 'Reset'}</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-amber-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{language === 'bn' ? 'সেভ করুন' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Mode Information Card: Auto Sync OFF Alert */}
      <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-xs">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-black text-emerald-950">
              {language === 'bn' ? 'মোড স্ট্যাটাস: শুধুমাত্র ম্যানুয়াল মোড সক্রিয় (Manual Only)' : 'Mode Status: Strictly Manual (Auto Sync OFF)'}
            </h4>
            <p className="text-xs text-emerald-800 mt-0.5">
              {language === 'bn'
                ? 'ডাটাবেজ অটো-কাউন্টার বন্ধ রয়েছে। অ্যাডমিন প্যানেল থেকে নিচের ইনপুটগুলোতে আপনার কাঙ্ক্ষিত সংখ্যা দিয়ে সেভ করুন।'
                : 'Database auto-increment is turned off. Enter your desired verified numbers below and save.'}
            </p>
          </div>
        </div>
        <div className="px-3 py-1.5 rounded-lg bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
          <span>{language === 'bn' ? 'অটো-সিঙ্ক নিষ্ক্রিয়' : 'Auto Sync Disabled'}</span>
        </div>
      </div>

      {/* Success Notification Alert */}
      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center gap-3 text-emerald-900 text-sm font-semibold animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>
            {language === 'bn'
              ? 'অভিনন্দন! আপনার এডিট করা ম্যানুয়াল পরিসংখ্যান হোমপেইজে সরাসরি আপডেট হয়ে গেছে।'
              : 'Success! Your updated manual statistics are now live on the homepage.'}
          </span>
        </div>
      )}

      {/* Form Container */}
      <div className="bg-white rounded-2xl p-6 border border-emerald-200 shadow-xs space-y-6">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Stat Numbers Grid */}
          <div className="space-y-4">
            <h3 className="font-bold text-base text-[#004d38] flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>{language === 'bn' ? 'কার্ডের ম্যানুয়াল সংখ্যাসমূহ (Manual Stat Numbers)' : 'Manual Card Stat Numbers'}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 1. Total Members */}
              <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200 space-y-1.5">
                <label className="block text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{language === 'bn' ? '১. মোট সদস্য (Total Members)' : '1. Total Members'}</span>
                </label>
                <input
                  type="number"
                  value={formData.totalMembers ?? ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      totalMembers: e.target.value === '' ? '' : parseInt(e.target.value, 10) || 0,
                    })
                  }
                  placeholder="1240"
                  className="w-full border-2 border-emerald-300 rounded-lg px-3 py-2 font-mono font-bold text-lg text-emerald-950 bg-white focus:outline-none focus:ring-2 focus:ring-[#006a4e]"
                />
                <span className="text-[11px] text-gray-500 block">
                  {language === 'bn' ? 'সাধারণ ও নিবন্ধিত সকল অ্যালামনাই সংখ্যা' : 'General & registered alumni count'}
                </span>
              </div>

              {/* 2. Life Members */}
              <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200 space-y-1.5">
                <label className="block text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{language === 'bn' ? '২. মোট আজীবন সদস্য (Life Member)' : '2. Life Member'}</span>
                </label>
                <input
                  type="number"
                  value={formData.lifeMembers ?? ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      lifeMembers: e.target.value === '' ? '' : parseInt(e.target.value, 10) || 0,
                    })
                  }
                  placeholder="793"
                  className="w-full border-2 border-emerald-300 rounded-lg px-3 py-2 font-mono font-bold text-lg text-emerald-950 bg-white focus:outline-none focus:ring-2 focus:ring-[#006a4e]"
                />
                <span className="text-[11px] text-gray-500 block">
                  {language === 'bn' ? 'আজীবন সদস্যপদ গ্রহণকারীর সংখ্যা' : 'Permanent life members count'}
                </span>
              </div>

              {/* 3. Committee Members */}
              <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200 space-y-1.5">
                <label className="block text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{language === 'bn' ? '৩. কমিটি সদস্য (Executive Committee)' : '3. Executive Committee'}</span>
                </label>
                <input
                  type="number"
                  value={formData.committeeMembers ?? ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      committeeMembers: e.target.value === '' ? '' : parseInt(e.target.value, 10) || 0,
                    })
                  }
                  placeholder="35"
                  className="w-full border-2 border-emerald-300 rounded-lg px-3 py-2 font-mono font-bold text-lg text-emerald-950 bg-white focus:outline-none focus:ring-2 focus:ring-[#006a4e]"
                />
                <span className="text-[11px] text-gray-500 block">
                  {language === 'bn' ? 'কার্যনির্বাহী ও আহ্বায়ক কমিটির সদস্য সংখ্যা' : 'Executive & Advisory bodies count'}
                </span>
              </div>

              {/* 4. Donor Members */}
              <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200 space-y-1.5">
                <label className="block text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                  <HeartHandshake className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{language === 'bn' ? '৪. দাতা ও ট্রাস্টি সদস্য (Donor & Trustee)' : '4. Donor Member'}</span>
                </label>
                <input
                  type="number"
                  value={formData.donorMembers ?? ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      donorMembers: e.target.value === '' ? '' : parseInt(e.target.value, 10) || 0,
                    })
                  }
                  placeholder="29"
                  className="w-full border-2 border-emerald-300 rounded-lg px-3 py-2 font-mono font-bold text-lg text-emerald-950 bg-white focus:outline-none focus:ring-2 focus:ring-[#006a4e]"
                />
                <span className="text-[11px] text-gray-500 block">
                  {language === 'bn' ? 'তহবিল ও বিশেষ অনুদান প্রদানকারী সংখ্যা' : 'Donors & special patrons count'}
                </span>
              </div>
            </div>

            {/* Number Suffix */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {language === 'bn' ? 'সংখ্যার শেষের চিহ্ন (Suffix, যেমন: +)' : 'Number Suffix (e.g. +)'}
              </label>
              <input
                type="text"
                value={formData.suffix ?? '+'}
                onChange={(e) => setFormData({ ...formData, suffix: e.target.value })}
                placeholder="+"
                className="w-32 border border-gray-300 rounded-lg px-3 py-1.5 text-sm font-bold font-mono focus:ring-2 focus:ring-[#006a4e] focus:outline-none"
              />
            </div>
          </div>

          {/* Titles and Subtitles */}
          <div className="border-t border-gray-100 pt-5 space-y-4">
            <h3 className="font-bold text-base text-[#004d38]">
              {language === 'bn' ? 'উইজেটের শিরোনাম ও বিবরণ (Titles)' : 'Section Titles & Subtitle'}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {language === 'bn' ? 'বাংলা শিরোনাম' : 'Bengali Title'}
                </label>
                <input
                  type="text"
                  value={formData.titleBn || ''}
                  onChange={(e) => setFormData({ ...formData, titleBn: e.target.value })}
                  placeholder="আমাদের অ্যালামনাই পরিবার"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#006a4e] focus:outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {language === 'bn' ? 'ইংরেজি শিরোনাম' : 'English Title'}
                </label>
                <input
                  type="text"
                  value={formData.titleEn || ''}
                  onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                  placeholder="Our Growing Community"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#006a4e] focus:outline-none font-medium"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {language === 'bn' ? 'বাংলা সাবটাইটেল (ঐচ্ছিক)' : 'Bengali Subtitle (Optional)'}
                </label>
                <input
                  type="text"
                  value={formData.subBn || ''}
                  onChange={(e) => setFormData({ ...formData, subBn: e.target.value })}
                  placeholder="জগন্নাথ বিশ্ববিদ্যালয় উদ্ভিদবিজ্ঞান বিভাগের সকল ব্যাচের প্রাক্তন ও বর্তমান সদস্যদের সম্মিলিত শক্তি"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#006a4e] focus:outline-none font-medium"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 bg-[#006a4e] hover:bg-[#00523b] text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              <span>
                {language === 'bn' ? 'ম্যানুয়াল পরিসংখ্যান সেভ করুন' : 'Save Manual Changes'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
