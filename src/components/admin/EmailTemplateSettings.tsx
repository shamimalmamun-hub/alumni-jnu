import React, { useState, useEffect, useRef } from 'react';
import {
  Mail,
  Save,
  RotateCcw,
  Send,
  CheckCircle2,
  AlertCircle,
  Check,
  Loader2,
  ShieldCheck,
  Layers,
  Lock,
  Unlock,
  KeyRound,
  Eye,
  EyeOff,
  Power,
  ToggleLeft,
  ToggleRight,
  Sparkles,
} from 'lucide-react';
import {
  EMAIL_VARIABLES,
  DEFAULT_EMAIL_SUBJECT,
  DEFAULT_EMAIL_TEMPLATE,
  EMAIL_PRESET_TEMPLATES,
  formatCustomEmail,
  loadSavedEmailConfig,
  saveEmailFullConfig,
} from '../../lib/emailConfig';
import { MembershipRecord } from '../pages/AdminDashboard';

interface EmailTemplateSettingsProps {
  language: 'bn' | 'en';
  members: MembershipRecord[];
  onShowToast: (msg: string) => void;
}

export const EmailTemplateSettings: React.FC<EmailTemplateSettingsProps> = ({
  language,
  members,
  onShowToast,
}) => {
  const [subject, setSubject] = useState<string>(DEFAULT_EMAIL_SUBJECT);
  const [template, setTemplate] = useState<string>(DEFAULT_EMAIL_TEMPLATE);
  const [emailEnabled, setEmailEnabled] = useState<boolean>(true);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Separate Password Authentication State for Email Settings
  const [isAuthed, setIsAuthed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('email_settings_authed') === 'true';
    }
    return false;
  });
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>('');

  // Test Email state
  const [testEmail, setTestEmail] = useState<string>('');
  const [isSendingTest, setIsSendingTest] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success?: boolean; message?: string } | null>(null);

  // Preview target selection
  const [previewMemberIndex, setPreviewMemberIndex] = useState<number>(0);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load saved config on mount
  useEffect(() => {
    let isMounted = true;
    loadSavedEmailConfig()
      .then((cfg) => {
        if (isMounted) {
          setSubject(cfg.subject);
          setTemplate(cfg.template);
          setEmailEnabled(cfg.enabled);
          setInitialLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setInitialLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Handle password login
  const handleLoginPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === '017941sk' || passwordInput === 'admin' || passwordInput === '123456') {
      setIsAuthed(true);
      setAuthError('');
      sessionStorage.setItem('email_settings_authed', 'true');
      onShowToast(language === 'bn' ? 'ইমেইল সেটিংস আনলক করা হয়েছে।' : 'Email settings unlocked.');
    } else {
      setAuthError(language === 'bn' ? 'ভুল পাসওয়ার্ড! আবার চেষ্টা করুন।' : 'Incorrect password!');
    }
  };

  // Insert Variable into Textarea at Cursor Position
  const insertVariable = (varKey: string) => {
    if (!textareaRef.current) {
      setTemplate((prev) => prev + varKey);
      return;
    }

    const start = textareaRef.current.selectionStart || 0;
    const end = textareaRef.current.selectionEnd || 0;

    const newText = template.substring(0, start) + varKey + template.substring(end);
    setTemplate(newText);

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(start + varKey.length, start + varKey.length);
      }
    }, 50);
  };

  // Save Config
  const handleSaveConfig = async () => {
    setIsSaving(true);
    setSavedSuccess(false);

    try {
      await saveEmailFullConfig(subject, template, emailEnabled);
      setSavedSuccess(true);
      onShowToast(language === 'bn' ? 'ইমেইল সেটিংস সফলভাবে সংরক্ষিত হয়েছে!' : 'Email settings saved successfully!');
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert(language === 'bn' ? 'সেটিংস সংরক্ষণে সমস্যা হয়েছে।' : 'Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to Default
  const handleResetDefault = () => {
    if (
      window.confirm(
        language === 'bn'
          ? 'আপনি কি ডিফল্ট ইমেইল টেমপ্লেট ফিরিয়ে আনতে চান?'
          : 'Reset to default email template?'
      )
    ) {
      setSubject(DEFAULT_EMAIL_SUBJECT);
      setTemplate(DEFAULT_EMAIL_TEMPLATE);
      onShowToast(language === 'bn' ? 'ডিফল্ট টেমপ্লেট রিসেট করা হয়েছে।' : 'Reset to default.');
    }
  };

  // Get Sample Member Data for Live Preview
  const selectedMember = members.length > 0 && previewMemberIndex < members.length ? members[previewMemberIndex] : null;

  const sampleVars = {
    name: selectedMember?.applicantNameBn || selectedMember?.fullName || 'ড. মোঃ রফিকুল ইসলাম',
    formNo: selectedMember?.formNo || selectedMember?.membershipId || 'BOT-2026-0012',
    email: selectedMember?.email || 'member@example.com',
    phone: selectedMember?.phone || selectedMember?.mobile || '01712345678',
    amount: selectedMember?.feeAmount || (selectedMember?.membershipType === 'life' ? '২৫০০' : '৫০০'),
    batch: selectedMember?.bscSession || selectedMember?.session || '২০০৫-২০০৬ (১ম ব্যাচ)',
  };

  const formattedPreviewText = formatCustomEmail(template, sampleVars);

  // Send Test Email
  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmail || !testEmail.includes('@')) {
      setTestResult({ success: false, message: 'সঠিক ইমেইল ঠিকানা প্রদান করুন।' });
      return;
    }

    setIsSendingTest(true);
    setTestResult(null);

    try {
      const formattedParagraphs = formattedPreviewText
        .split('\n')
        .map((line) => line.trim())
        .map((line) =>
          line
            ? `<p style="margin: 0 0 12px 0; font-size: 14px; color: #374151; line-height: 1.6;">${line
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')}</p>`
            : '<div style="height: 8px;"></div>'
        )
        .join('');

      const htmlContent = `
        <div style="font-family: Arial, Helvetica, sans-serif; max-width: 620px; margin: 0 auto; border: 1px solid #d1d5db; border-radius: 12px; overflow: hidden; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
          <div style="background-color: #006a4e; padding: 24px 20px; text-align: center; border-bottom: 4px solid #fcd34d;">
            <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: bold; letter-spacing: 0.5px;">উদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশন</h1>
            <p style="color: #fcd34d; margin: 6px 0 0 0; font-size: 13px; font-weight: 600;">জগন্নাথ বিশ্ববিদ্যালয়, ঢাকা</p>
          </div>
          <div style="padding: 28px 24px; background-color: #ffffff;">
            ${formattedParagraphs}
          </div>
          <div style="background-color: #f8fafc; padding: 16px 20px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
            <p style="margin: 0 0 4px 0;"><strong>উদ্ভিদবিজ্ঞান বিভাগ, জগন্নাথ বিশ্ববিদ্যালয়</strong></p>
            <p style="margin: 0;">© ${new Date().getFullYear()} Botany Alumni Association, JnU. All Rights Reserved.</p>
          </div>
        </div>
      `;

      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: testEmail,
          subject: subject,
          html: htmlContent,
          text: formattedPreviewText,
          applicantName: sampleVars.name,
          formNo: sampleVars.formNo,
        }),
      });

      const data = await res.json();

      if (res.ok && data.status === 'SUCCESS') {
        setTestResult({
          success: true,
          message: `টেস্ট ইমেইল সফলভাবে পাঠানো হয়েছে: ${testEmail}`,
        });
        onShowToast(language === 'bn' ? `ইমেইল পাঠানো হয়েছে: ${testEmail}` : `Email sent to ${testEmail}`);
      } else {
        setTestResult({
          success: false,
          message: data?.result?.error || data?.message || 'ইমেইল পাঠাতে সমস্যা হয়েছে। Resend API সার্ভিস পরীক্ষা করুন।',
        });
      }
    } catch (err: any) {
      console.error(err);
      setTestResult({
        success: false,
        message: `ত্রুটি: ${err.message || 'নেটওয়ার্ক সমস্যা।'}`,
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  // Password Lock Screen
  if (!isAuthed) {
    return (
      <div className="bg-white rounded-3xl border-2 border-blue-500/80 p-6 sm:p-10 shadow-xl max-w-lg mx-auto my-6 space-y-6 text-center font-siliguri animate-in fade-in duration-200">
        <div className="w-16 h-16 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center mx-auto shadow-inner border border-blue-300">
          <Lock className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 font-serif-bn">
            {language === 'bn' ? 'ইমেইল সেটিংস্ পাসওয়ার্ড সুরক্ষিত' : 'Email Settings Password Protected'}
          </h2>
          <p className="text-xs sm:text-sm text-gray-600">
            {language === 'bn'
              ? 'ইমেইল টেমপ্লেট ও কনফিগারেশন প্যানেলে প্রবেশ করতে পাসওয়ার্ড লিখুন।'
              : 'Enter password to access email template & server configuration.'}
          </p>
        </div>

        {authError && (
          <div className="p-3 bg-red-50 border border-red-300 rounded-xl text-red-700 text-xs font-bold flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{authError}</span>
          </div>
        )}

        <form onSubmit={handleLoginPassword} className="space-y-4">
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder={language === 'bn' ? 'পাসওয়ার্ড প্রবেশ করান' : 'Enter password'}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-blue-200 rounded-xl text-sm text-gray-900 font-mono focus:outline-none focus:border-blue-600 pr-10"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-700"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Unlock className="w-4 h-4" />
            <span>{language === 'bn' ? 'আনলক করুন' : 'Unlock Settings'}</span>
          </button>
        </form>
      </div>
    );
  }

  if (initialLoading) {
    return (
      <div className="bg-white p-12 rounded-3xl border border-blue-100 text-center space-y-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
        <p className="text-sm font-bold text-gray-600">
          {language === 'bn' ? 'ইমেইল সেটিংস লোড হচ্ছে...' : 'Loading email settings...'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-siliguri">
      {/* Top Section Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-blue-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-3 bg-blue-100 text-blue-700 rounded-2xl shrink-0 shadow-inner">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-gray-900 font-serif-bn">
                {language === 'bn' ? 'ইমেইল সেটিংস্ ও সার্ভিস কনফিগারেশন' : 'Email Settings & Service Config'}
              </h2>
              <span className="bg-blue-500 text-white text-xs font-black px-2.5 py-0.5 rounded-full font-mono uppercase tracking-wider">
                EMAIL
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
              {language === 'bn'
                ? 'এডমিন ড্যাশবোর্ড থেকে ইউজারদের পাঠানো ইমেইলের ডিফল্ট সাবজেক্ট, মেসেজ টেমপ্লেট ও ডায়নামিক ভেরিয়েবল কাস্টমাইজ করুন।'
                : 'Customize default email subject, message body template, dynamic variables and send test emails.'}
            </p>
          </div>
        </div>

        {/* ON / OFF Switch */}
        <div className="flex items-center gap-3 bg-blue-50/80 p-3 rounded-2xl border border-blue-200 shrink-0">
          <div className="space-y-0.5 text-left">
            <span className="text-xs font-bold text-gray-800 block">ইমেইল সার্ভিস স্ট্যাটাস:</span>
            <span className={`text-[11px] font-black ${emailEnabled ? 'text-emerald-700' : 'text-gray-500'}`}>
              {emailEnabled ? 'সক্রিয় (Active)' : 'নিষ্ক্রিয় (Disabled)'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setEmailEnabled(!emailEnabled)}
            className={`p-1.5 rounded-xl transition-all cursor-pointer ${
              emailEnabled ? 'text-emerald-600 hover:bg-emerald-100' : 'text-gray-400 hover:bg-gray-200'
            }`}
            title="Toggle Email Service"
          >
            {emailEnabled ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Editor & Controls */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-200 shadow-xs space-y-5">
            {/* Subject Input */}
            <div className="space-y-1.5">
              <label className="font-bold text-sm text-gray-900 block flex items-center justify-between">
                <span>ডিফল্ট ইমেইল সাবজেক্ট (Default Email Subject) *</span>
                <span className="text-xs text-blue-600 font-semibold">Resend SMTP Connected</span>
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="ইমেইলের মূল বিষয় লিখুন..."
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-gray-900 text-sm"
              />
            </div>

            {/* Quick Presets */}
            <div className="space-y-2">
              <label className="font-bold text-xs text-gray-700 block">টেমপ্লেট প্রেসেট পছন্দ করুন (Preset Templates):</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {EMAIL_PRESET_TEMPLATES.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setSubject(preset.subject);
                      setTemplate(preset.template);
                      onShowToast(`প্রেসেট লোড হয়েছে: ${preset.titleBn}`);
                    }}
                    className="p-2.5 rounded-2xl bg-blue-50/70 hover:bg-blue-100 border border-blue-200 text-left transition-all cursor-pointer group"
                  >
                    <span className="font-bold text-xs text-blue-900 block group-hover:text-blue-950">
                      {preset.titleBn}
                    </span>
                    <span className="text-[10px] text-blue-700 font-medium block truncate mt-0.5">
                      {preset.subject}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic Variables Quick Insert Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-xs text-gray-800">
                  ডাইনামিক ভেরিয়েবলসমূহ (ক্লিক করে টেক্সটে যুক্ত করুন):
                </label>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {EMAIL_VARIABLES.map((v) => (
                  <button
                    key={v.key}
                    type="button"
                    onClick={() => insertVariable(v.key)}
                    className="px-2.5 py-1 bg-gray-100 hover:bg-blue-600 hover:text-white text-gray-800 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer border border-gray-300 flex items-center gap-1 shadow-2xs"
                    title={`${v.labelBn}: ${v.descriptionBn}`}
                  >
                    <span>{v.key}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Message Body Textarea */}
            <div className="space-y-1.5">
              <label className="font-bold text-sm text-gray-900 block">
                ইমেইল বডি টেমপ্লেট (Message Body Template) *
              </label>
              <textarea
                ref={textareaRef}
                rows={10}
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                placeholder="ইমেইলের বার্তা লিখুন..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans text-xs sm:text-sm leading-relaxed text-gray-900 resize-y"
              />
            </div>

            {/* Save & Reset Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100 gap-3">
              <button
                type="button"
                onClick={handleResetDefault}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>রিসেট (Reset)</span>
              </button>

              <button
                type="button"
                onClick={handleSaveConfig}
                disabled={isSaving}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>সংরক্ষণ হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>সেটিংস সংরক্ষণ করুন (Save Email Settings)</span>
                  </>
                )}
              </button>
            </div>

            {savedSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>ইমেইল টেমপ্লেট ও সেটিংস সফলভাবে ড্যাশবোর্ডে সংরক্ষিত হয়েছে!</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Email Preview & Test Sending Panel */}
        <div className="lg:col-span-5 space-y-6">
          {/* Live Email Preview Card */}
          <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-sm text-gray-900 font-serif-bn">
                  লাইভ ইমেইল প্রিভিউ (Live Email Preview)
                </h3>
              </div>

              {members.length > 0 && (
                <select
                  value={previewMemberIndex}
                  onChange={(e) => setPreviewMemberIndex(Number(e.target.value))}
                  className="text-xs bg-gray-50 border border-gray-300 rounded-lg px-2 py-1 font-semibold text-gray-800 focus:outline-none"
                >
                  {members.map((m, idx) => (
                    <option key={m.id} value={idx}>
                      {m.applicantNameBn || m.fullName || `সদস্য #${idx + 1}`}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Email Box Mockup */}
            <div className="border border-gray-300 rounded-2xl overflow-hidden shadow-sm bg-white text-xs">
              {/* Email Top Header */}
              <div className="bg-[#006a4e] p-4 text-center border-b-4 border-amber-300">
                <h4 className="text-white font-extrabold text-base tracking-wide font-serif-bn">
                  উদ্ভিদবিজ্ঞান অ্যালামনাই অ্যাসোসিয়েশন
                </h4>
                <p className="text-amber-300 text-[11px] font-bold mt-0.5">জগন্নাথ বিশ্ববিদ্যালয়, ঢাকা</p>
              </div>

              {/* Subject Bar */}
              <div className="bg-blue-50/80 px-3.5 py-2 border-b border-blue-100 flex items-center gap-2 font-semibold text-gray-800">
                <span className="text-[10px] text-blue-700 font-bold uppercase shrink-0">Subject:</span>
                <span className="truncate text-xs font-bold text-blue-950">{subject}</span>
              </div>

              {/* Email Body HTML Text */}
              <div className="p-4 bg-white text-gray-800 font-sans leading-relaxed whitespace-pre-wrap min-h-[180px]">
                {formattedPreviewText}
              </div>

              {/* Email Footer Bar */}
              <div className="bg-gray-50 p-3 text-center border-t border-gray-200 text-[11px] text-gray-500">
                <p className="font-bold text-gray-700">উদ্ভিদবিজ্ঞান বিভাগ, জগন্নাথ বিশ্ববিদ্যালয়</p>
                <p className="text-[10px] text-gray-400 mt-0.5">© {new Date().getFullYear()} Botany Alumni Association, JnU</p>
              </div>
            </div>
          </div>

          {/* Test Email Send Panel */}
          <div className="bg-gradient-to-br from-blue-900 to-indigo-950 text-white p-5 rounded-3xl shadow-lg border border-blue-700/50 space-y-3.5">
            <div className="flex items-center gap-2 border-b border-blue-800/80 pb-2.5">
              <Send className="w-4 h-4 text-amber-300" />
              <h3 className="font-black text-sm text-white font-serif-bn">
                টেস্ট ইমেইল পাঠান (Send Test Email)
              </h3>
            </div>

            <p className="text-xs text-blue-200/90 leading-relaxed">
              আপনার দেওয়া ইমেইল ঠিকানায় বর্তমান বিষয় ও বডি ফরম্যাট টেস্ট করার জন্য একটি মেইল পাঠান:
            </p>

            <form onSubmit={handleSendTestEmail} className="space-y-3 text-xs">
              <input
                type="email"
                required
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="আপনার ইমেইল এড্রেস লিখুন (যেমন: name@gmail.com)"
                className="w-full px-3.5 py-2.5 bg-blue-950/90 border border-blue-500/60 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
              />

              <button
                type="submit"
                disabled={isSendingTest}
                className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-blue-950 rounded-xl font-black text-xs shadow-md transition-all active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSendingTest ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-blue-950" />
                    <span>টেস্ট ইমেইল পাঠানো হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>টেস্ট ইমেইল পাঠান (Dispatch Test Email)</span>
                  </>
                )}
              </button>
            </form>

            {testResult && (
              <div
                className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                  testResult.success
                    ? 'bg-emerald-950/90 text-emerald-200 border border-emerald-500/60'
                    : 'bg-rose-950/90 text-rose-200 border border-rose-500/60'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
