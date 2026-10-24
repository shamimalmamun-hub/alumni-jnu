import React, { useState, useEffect } from 'react';
import { Megaphone, Save, Eye, RotateCcw, Radio } from 'lucide-react';
import { useAdminData } from '../AdminDataContext';

export const AnnouncementsSection: React.FC = () => {
  const { language, activeTab, announcement, isSavingAnnouncement, handleSaveAnnouncement } = useAdminData();

  const [formData, setFormData] = useState({
    badgeBn: announcement.badgeBn || 'ঘোষণা',
    badgeEn: announcement.badgeEn || 'Bulletin',
    textBn: announcement.textBn || '',
    isActive: announcement.isActive !== false,
  });

  useEffect(() => {
    setFormData({
      badgeBn: announcement.badgeBn || 'ঘোষণা',
      badgeEn: announcement.badgeEn || 'Bulletin',
      textBn: announcement.textBn || '',
      isActive: announcement.isActive !== false,
    });
  }, [announcement]);

  if (activeTab !== 'announcements') return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.textBn.trim()) {
      alert(language === 'bn' ? 'অনুগ্রহ করে ঘোষণার মূল বিবরণ লিখুন।' : 'Please enter announcement text.');
      return;
    }
    handleSaveAnnouncement({
      badgeBn: formData.badgeBn,
      badgeEn: formData.badgeEn,
      textBn: formData.textBn,
      textEn: formData.textBn,
      isActive: formData.isActive,
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 font-siliguri">
      {/* Top Banner Header */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-emerald-100 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#006a4e] flex items-center justify-center shrink-0 border border-emerald-200">
              <Megaphone className="w-5 h-5 text-[#006a4e]" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 font-serif-bn leading-tight">
                {language === 'bn' ? 'স্ক্রোলিং বুলেটিন ও মূল বাতায়নের ঘোষণা' : 'Live Website Bulletin & Announcement'}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {language === 'bn'
                  ? 'ওয়েবসাইটের শীর্ষ ব্যানারে চলমান স্ক্রোলিং টেক্সট ও জরুরি ঘোষণা তাৎক্ষণিকভাবে আপডেট করুন।'
                  : 'Instantly update the moving marquee bulletin and announcements displayed across the website header.'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
              formData.isActive
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-gray-100 text-gray-600 border border-gray-300'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${formData.isActive ? 'text-emerald-600 animate-pulse' : 'text-gray-400'}`} />
            <span>{formData.isActive ? (language === 'bn' ? 'বাতায়নে সক্রিয়' : 'Live on Site') : (language === 'bn' ? 'নিষ্ক্রিয়' : 'Inactive')}</span>
          </span>
        </div>
      </div>

      {/* Live Preview Card */}
      <div className="bg-white rounded-2xl border border-emerald-200 p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-[#006a4e]" />
            <span>{language === 'bn' ? 'লাইভ প্রিভিউ (ওয়েবসাইটে যেমন দেখাবে)' : 'Live Website Preview'}</span>
          </span>
          <span className="text-[11px] text-gray-400">
            {language === 'bn' ? 'হেডার ব্যানার সেকশন' : 'Header Ticker Component'}
          </span>
        </div>

        {/* Ticker Simulator */}
        <div className="bg-[#eaf4ec] py-2.5 px-3.5 rounded-xl border border-emerald-300 flex items-center gap-3 overflow-hidden">
          <div className="bg-[#15803d] text-white px-3 py-1 rounded-full text-xs font-bold shrink-0 shadow-xs flex items-center gap-1">
            <Megaphone className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? (formData.badgeBn || 'ঘোষণা') : (formData.badgeEn || 'Bulletin')}</span>
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-xs sm:text-sm font-bold text-emerald-950 truncate">
              {formData.isActive ? (
                formData.textBn || (
                  <span className="text-gray-400 italic">{language === 'bn' ? 'কোনো ঘোষণা টেক্সট দেওয়া হয়নি' : 'No announcement text set'}</span>
                )
              ) : (
                <span className="text-gray-500 italic">[{language === 'bn' ? 'ঘোষণা বর্তমানে নিষ্ক্রিয় রয়েছে' : 'Announcement is currently disabled'}]</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Announcement Edit Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-emerald-100 p-5 sm:p-6 shadow-xs space-y-5">
        <h3 className="font-bold text-base text-gray-900 font-serif-bn border-b border-gray-100 pb-3 flex items-center gap-2">
          <Megaphone className="w-4 h-4 text-[#006a4e]" />
          <span>{language === 'bn' ? 'ঘোষণা সম্পাদনা ও প্রকাশনা ফর্ম' : 'Announcement Editor & Publisher'}</span>
        </h3>

        {/* Status Toggle & Badge */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-700">
              {language === 'bn' ? 'প্রকাশনা স্ট্যাটাস' : 'Publish Status'}
            </label>
            <div className="flex items-center gap-3 pt-1">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#006a4e]"></div>
                <span className="ml-2.5 text-xs font-bold text-gray-800">
                  {formData.isActive
                    ? (language === 'bn' ? 'বাতায়নে প্রদর্শন চালু' : 'Visible on site')
                    : (language === 'bn' ? 'লুকিয়ে রাখুন (অফ)' : 'Hidden')}
                </span>
              </label>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-700">
              {language === 'bn' ? 'ব্যাজ লেবেল (বাংলা)' : 'Badge Label (Bangla)'}
            </label>
            <input
              type="text"
              value={formData.badgeBn}
              onChange={(e) => setFormData({ ...formData, badgeBn: e.target.value })}
              placeholder="যেমন: ঘোষণা, জরুরি বিজ্ঞপ্তি, ইভেন্ট"
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:border-[#006a4e] focus:ring-1 focus:ring-[#006a4e]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-700">
              {language === 'bn' ? 'ব্যাজ লেবেল (English)' : 'Badge Label (English)'}
            </label>
            <input
              type="text"
              value={formData.badgeEn}
              onChange={(e) => setFormData({ ...formData, badgeEn: e.target.value })}
              placeholder="e.g. Bulletin, Notice, Urgent"
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:border-[#006a4e] focus:ring-1 focus:ring-[#006a4e]"
            />
          </div>
        </div>

        {/* Bengali Announcement Text */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-gray-800 flex items-center justify-between">
            <span>{language === 'bn' ? 'ঘোষণার মূল বিবরণ (বাংলা) *' : 'Announcement Text (Bangla) *'}</span>
            <span className="text-[11px] text-gray-400 font-mono">{formData.textBn.length} অক্ষর</span>
          </label>
          <textarea
            rows={4}
            value={formData.textBn}
            onChange={(e) => setFormData({ ...formData, textBn: e.target.value })}
            placeholder="ওয়েবসাইটে স্ক্রোলিং টিকারে যে ঘোষণাটি প্রদর্শিত হবে তা লিখুন..."
            className="w-full px-4 py-3 border border-gray-300 rounded-xl text-xs sm:text-sm font-medium text-gray-900 focus:outline-none focus:border-[#006a4e] focus:ring-1 focus:ring-[#006a4e] leading-relaxed"
            required
          />
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            {announcement.updatedAt ? (
              <span>
                {language === 'bn' ? 'সর্বশেষ আপডেট: ' : 'Last Updated: '}
                <strong className="font-mono">{new Date(announcement.updatedAt).toLocaleString('bn-BD')}</strong>
              </span>
            ) : (
              <span>{language === 'bn' ? 'ওয়েবসাইটে তাৎক্ষণিক প্রযোজ্য হবে।' : 'Changes apply immediately to live site.'}</span>
            )}
          </p>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => {
                setFormData({
                  badgeBn: 'ঘোষণা',
                  badgeEn: 'Bulletin',
                  textBn: '২০২৬ সালের নভেম্বরে নতুন কার্যনির্বাহী কমিটি নির্বাচনের লক্ষ্যে সাধারণ সদস্য এবং আজীবন সদস্য সংগ্রহ চলমান রয়েছে। আজই ফরম পূরণ করে আপনার সদস্যপদ নিশ্চিত করুন।',
                  isActive: true,
                });
              }}
              className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'রিসেট' : 'Reset'}</span>
            </button>

            <button
              type="submit"
              disabled={isSavingAnnouncement}
              className="flex-1 sm:flex-none px-6 py-2.5 bg-[#006a4e] hover:bg-[#00523d] text-white rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4 text-amber-300" />
              <span>
                {isSavingAnnouncement
                  ? (language === 'bn' ? 'সংরক্ষণ হচ্ছে...' : 'Saving...')
                  : (language === 'bn' ? 'সংরক্ষণ করুন ও মূল বাতায়নে প্রকাশ করুন' : 'Save & Publish Live')}
              </span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
