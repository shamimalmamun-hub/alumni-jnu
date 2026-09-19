import React, { useEffect, useState } from 'react';
import { Users, UserCheck, Shield, HeartHandshake, Save, RotateCcw, CheckCircle2 } from 'lucide-react';
import { db } from '../../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { CommunityStatsData } from '../CommunityStatsWidget';

interface CommunityStatsAdminEditorProps {
  language: 'bn' | 'en';
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const DEFAULT_STATS: CommunityStatsData = {
  mode: 'manual',
  totalMembers: 1240,
  lifeMembers: 793,
  committeeMembers: 35,
  donorMembers: 29,
  suffix: '+',
  titleBn: 'আমাদের অ্যালামনাই পরিবার',
  titleEn: 'Our Growing Community',
  subBn: 'জগন্নাথ বিশ্ববিদ্যালয় উদ্ভিদবিজ্ঞান বিভাগের সকল ব্যাচের প্রাক্তন ও বর্তমান সদস্যদের সম্মিলিত শক্তি',
  subEn: 'Uniting generations of Botany Alumni from Jagannath University, Dhaka',
};

export const CommunityStatsAdminEditor: React.FC<CommunityStatsAdminEditorProps> = ({
  language,
  onShowToast,
}) => {
  const [formData, setFormData] = useState<CommunityStatsData>(DEFAULT_STATS);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const docRef = doc(db, 'site_settings', 'community_stats');
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data() as CommunityStatsData;
          setFormData({
            ...DEFAULT_STATS,
            ...data,
          });
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
      const docRef = doc(db, 'site_settings', 'community_stats');
      await setDoc(docRef, {
        ...formData,
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      setSaveSuccess(true);
      onShowToast(
        language === 'bn'
          ? 'কমিউনিটি পরিসংখ্যান সফলভাবে আপডেট ও সেভ হয়েছে!'
          : 'Community stats settings updated successfully!',
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
      setFormData(DEFAULT_STATS);
    }
  };

  const toBnNumber = (val: number | string | undefined) => {
    if (val === undefined || val === null) return '';
    const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return val
      .toString()
      .split('')
      .map((d) => bnDigits[parseInt(d, 10)] ?? d)
      .join('');
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-emerald-200 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-[#006a4e] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-gray-600 font-medium text-sm">
          {language === 'bn' ? 'কমিউনিটি পরিসংখ্যান লোড হচ্ছে...' : 'Loading stats settings...'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#004d38] via-[#006a4e] to-[#004d38] rounded-2xl p-6 text-white shadow-md relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight">
            {language === 'bn' ? 'কমিউনিটি পরিসংখ্যান সেটিংস' : 'Our Growing Community Stats Editor'}
          </h2>
          <p className="text-emerald-100 text-sm mt-1 max-w-2xl">
            {language === 'bn'
              ? 'হোমপেইজের "ওয়েবসাইট পৃষ্ঠপোষক" এর নিচে প্রদর্শিত মোট সদস্য, আজীবন সদস্য, কমিটি সদস্য ও দাতা সদস্যের সংখ্যা ও শিরোনাম এখান থেকে সরাসরি এডিট করুন।'
              : 'Customize the live statistics numbers and titles displayed under the Website Sponsor section on the homepage.'}
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

      {/* Success Notification Alert */}
      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center gap-3 text-emerald-900 text-sm font-semibold animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>
            {language === 'bn'
              ? 'অভিনন্দন! আপনার এডিট করা পরিসংখ্যান হোমপেইজে লাইভ আপডেট হয়ে গেছে।'
              : 'Success! Your updated statistics are now live on the homepage.'}
          </span>
        </div>
      )}

      {/* Form Container */}
      <div className="bg-white rounded-2xl p-6 border border-emerald-200 shadow-xs space-y-6">
        <form onSubmit={handleSave} className="space-y-6">
            {/* Mode Selection */}
            <div>
              <label className="block font-bold text-sm text-gray-800 mb-2">
                {language === 'bn' ? 'কাউন্টার মোড (Count Mode)' : 'Count Mode'}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, mode: 'manual' })}
                  className={`p-3.5 rounded-xl border-2 text-left transition-all cursor-pointer ${
                    formData.mode === 'manual'
                      ? 'border-[#006a4e] bg-[#eaf8ee] text-[#004d38]'
                      : 'border-gray-200 hover:border-gray-300 bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="font-bold text-sm flex items-center justify-between">
                    <span>{language === 'bn' ? 'ম্যানুয়াল সংখ্যা (Manual)' : 'Manual Custom Count'}</span>
                    {formData.mode === 'manual' && <CheckCircle2 className="w-4 h-4 text-[#006a4e]" />}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {language === 'bn' ? 'আপনার সেট করা নির্দিষ্ট সংখ্যা দেখাবে।' : 'Display fixed custom numbers.'}
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, mode: 'auto' })}
                  className={`p-3.5 rounded-xl border-2 text-left transition-all cursor-pointer ${
                    formData.mode === 'auto'
                      ? 'border-[#006a4e] bg-[#eaf8ee] text-[#004d38]'
                      : 'border-gray-200 hover:border-gray-300 bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="font-bold text-sm flex items-center justify-between">
                    <span>{language === 'bn' ? 'ডাটাবেজ অটো (Auto)' : 'Auto Database Sync'}</span>
                    {formData.mode === 'auto' && <CheckCircle2 className="w-4 h-4 text-[#006a4e]" />}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {language === 'bn' ? 'ডাটাবেজে নতুন সদস্য যুক্ত হলে বাড়বে।' : 'Auto-increments with registrations.'}
                  </p>
                </button>
              </div>
            </div>

            {/* Stat Numbers Grid */}
            <div className="border-t border-gray-100 pt-5 space-y-4">
              <h3 className="font-bold text-base text-[#004d38] flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{language === 'bn' ? 'কার্ডের সংখ্যাসমূহ (Numbers)' : 'Card Stat Numbers'}</span>
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
                    {language === 'bn' ? 'সাধারণ ও নিবন্ধিত সকল অ্যালামনাই' : 'General & registered alumni'}
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
                    {language === 'bn' ? 'আজীবন সদস্যপদ গ্রহণকারী' : 'Permanent life members'}
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
                    {language === 'bn' ? 'কার্যনির্বাহী ও আহ্বায়ক কমিটি' : 'Executive & Advisory bodies'}
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
                    {language === 'bn' ? 'তহবিল ও বিশেষ অনুদান প্রদানকারী' : 'Donors & special patrons'}
                  </span>
                </div>
              </div>

              {/* Number Suffix */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {language === 'bn' ? 'সংখ্যার শেষের চিহ্ন (Suffix)' : 'Number Suffix (e.g. +)'}
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
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#006a4e] focus:outline-none"
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
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#006a4e] focus:outline-none"
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
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#006a4e] focus:outline-none"
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
                  {language === 'bn' ? 'পরিবর্তনগুলো সেভ করুন' : 'Save Changes'}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
};
