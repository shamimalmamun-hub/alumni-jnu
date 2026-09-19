import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Save,
  RotateCcw,
  Send,
  CheckCircle2,
  AlertCircle,
  Smartphone,
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
  ShieldAlert,
} from 'lucide-react';
import {
  SMS_VARIABLES,
  DEFAULT_SMS_TEMPLATE,
  SMS_PRESET_TEMPLATES,
  formatCustomSMS,
  loadSavedSMSConfig,
  saveSMSFullConfig,
  calculateSMSStats,
} from '../../lib/smsConfig';
import { dispatchPaymentSMS } from '../../lib/smsService';
import { MembershipRecord } from '../pages/AdminDashboard';

interface SMSTemplateSettingsProps {
  language: 'bn' | 'en';
  members: MembershipRecord[];
  onShowToast: (msg: string) => void;
}

export const SMSTemplateSettings: React.FC<SMSTemplateSettingsProps> = ({
  language,
  members,
  onShowToast,
}) => {
  const [template, setTemplate] = useState<string>(DEFAULT_SMS_TEMPLATE);
  const [smsEnabled, setSmsEnabled] = useState<boolean>(true);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Separate Password Authentication State for SMS Settings
  const [isAuthed, setIsAuthed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('sms_settings_authed') === 'true';
    }
    return false;
  });
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>('');

  // Test SMS state
  const [testPhone, setTestPhone] = useState<string>('');
  const [isSendingTest, setIsSendingTest] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success?: boolean; message?: string } | null>(null);

  // Preview target selection
  const [previewMemberIndex, setPreviewMemberIndex] = useState<number>(0);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load saved config (template + ON/OFF status) on mount
  useEffect(() => {
    let isMounted = true;
    loadSavedSMSConfig()
      .then((cfg) => {
        if (isMounted) {
          setTemplate(cfg.template);
          setSmsEnabled(cfg.enabled);
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

  // Handle password login for SMS settings
  const handleLoginPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === '017941sk') {
      setIsAuthed(true);
      setAuthError('');
      setPasswordInput('');
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('sms_settings_authed', 'true');
      }
      onShowToast(language === 'bn' ? 'এসএমএস সেটিংস আনলক সফল হয়েছে!' : 'SMS settings unlocked successfully!');
    } else {
      setAuthError(
        language === 'bn'
          ? 'ভুল পাসওয়ার্ড! সঠিক পাসওয়ার্ড প্রদান করুন।'
          : 'Incorrect password! Please enter the correct password.'
      );
    }
  };

  const handleLock = () => {
    setIsAuthed(false);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('sms_settings_authed');
    }
    onShowToast(language === 'bn' ? 'এসএমএস সেটিংস লক করা হয়েছে।' : 'SMS settings locked.');
  };

  // Toggle SMS ON/OFF status
  const handleToggleSMSService = async (newStatus: boolean) => {
    setSmsEnabled(newStatus);
    setIsSaving(true);
    const res = await saveSMSFullConfig({ template, enabled: newStatus }, 'Admin');
    setIsSaving(false);
    if (res.success) {
      setSavedSuccess(true);
      onShowToast(
        language === 'bn'
          ? newStatus
            ? 'এসএমএস সেবা সফলভাবে অন (ON) করা হয়েছে! এখন বার্তা পাঠানো হবে।'
            : 'এসএমএস সেবা বন্ধ (OFF) করা হয়েছে! এখন থেকে কোনো এসএমএস যাবে না।'
          : newStatus
          ? 'SMS service enabled (ON)!'
          : 'SMS service disabled (OFF)!'
      );
      setTimeout(() => setSavedSuccess(false), 3000);
    } else {
      alert(language === 'bn' ? `স্ট্যাটাস সেভ করতে সমস্যা: ${res.error}` : `Failed to save status: ${res.error}`);
    }
  };

  // Determine preview sample member
  const sampleMember = members.length > 0 && previewMemberIndex < members.length
    ? members[previewMemberIndex]
    : {
        id: 'sample_01',
        fullName: 'ড. মোঃ রফিকুল ইসলাম',
        applicantNameBn: 'ড. মোঃ রফিকুল ইসলাম',
        applicantNameEn: 'Dr. Md. Rafiqul Islam',
        formNo: 'BOT-2026-0012',
        mobile: '01712345678',
        feeAmount: '৫০০',
        transactionId: 'BKASH987123',
        batch: '২০০৫-২০০৬ (১ম ব্যাচ)',
      };

  const previewMessage = formatCustomSMS(template, sampleMember);
  const stats = calculateSMSStats(template);
  const previewStats = calculateSMSStats(previewMessage);

  // Insert variable tag into textarea at cursor
  const handleInsertVariable = (key: string) => {
    if (!textareaRef.current) {
      setTemplate((prev) => `${prev} ${key}`);
      return;
    }

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const newText = text.substring(0, start) + key + text.substring(end);

    setTemplate(newText);
    setSavedSuccess(false);

    // Reposition cursor after tag
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + key.length, start + key.length);
    }, 50);

    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  // Save full configuration
  const handleSave = async () => {
    if (!template.trim()) {
      alert(language === 'bn' ? 'এসএমএস বডি টেক্সট খালি রাখা যাবে না।' : 'SMS body cannot be empty.');
      return;
    }

    setIsSaving(true);
    const res = await saveSMSFullConfig({ template, enabled: smsEnabled }, 'Admin');
    setIsSaving(false);

    if (res.success) {
      setSavedSuccess(true);
      onShowToast(
        language === 'bn'
          ? `এসএমএস সেটিং ও টেমপ্লেট সফলভাবে সেভ হয়েছে! (স্ট্যাটাস: ${smsEnabled ? 'অন' : 'অফ'})`
          : `SMS settings saved successfully! (Status: ${smsEnabled ? 'ON' : 'OFF'})`
      );
      setTimeout(() => setSavedSuccess(false), 4000);
    } else {
      alert(language === 'bn' ? `সেভ করতে সমস্যা হয়েছে: ${res.error}` : `Save failed: ${res.error}`);
    }
  };

  // Reset to default
  const handleResetDefault = () => {
    if (
      window.confirm(
        language === 'bn'
          ? 'আপনি কি ডিফল্ট অফিসিয়াল এসএমএস টেমপ্লেটে ফিরে যেতে চান?'
          : 'Reset to default official SMS template?'
      )
    ) {
      setTemplate(DEFAULT_SMS_TEMPLATE);
      setSavedSuccess(false);
      onShowToast(language === 'bn' ? 'ডিফল্ট টেমপ্লেট লোড হয়েছে। সেভ করতে সেভ বাটনে চাপুন।' : 'Default template loaded.');
    }
  };

  // Send Test SMS
  const handleSendTestSMS = async () => {
    const cleanPhone = testPhone.trim();
    if (!cleanPhone || cleanPhone.length < 11) {
      alert(
        language === 'bn'
          ? 'অনুগ্রহ করে একটি সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017xxxxxxxx)'
          : 'Please enter a valid 11-digit mobile number'
      );
      return;
    }

    if (!smsEnabled) {
      alert(
        language === 'bn'
          ? 'এসএমএস সেবা বন্ধ (OFF) অবস্থায় আছে। টেস্ট এসএমএস পাঠানোর জন্য প্রথমে সেবাটি "অন (ON)" করুন।'
          : 'SMS service is OFF. Please turn ON the service to send test messages.'
      );
      return;
    }

    setIsSendingTest(true);
    setTestResult(null);

    try {
      const testMember = {
        fullName: 'টেস্ট প্রাপক',
        applicantNameBn: 'টেস্ট প্রাপক',
        formNo: 'BOT-TEST-0001',
        mobile: cleanPhone,
        feeAmount: '৫০০',
        transactionId: 'TEST12345',
        batch: 'টেস্ট ব্যাচ',
      };

      const finalMsg = formatCustomSMS(template, testMember);

      const res = await dispatchPaymentSMS({
        mobile: cleanPhone,
        name: testMember.fullName,
        amount: '৫০০',
        tranId: 'TEST12345',
        formNo: 'BOT-TEST-0001',
        message: finalMsg,
      });

      if (res.success) {
        setTestResult({
          success: true,
          message:
            language === 'bn'
              ? `${cleanPhone} নম্বরে টেস্ট এসএমএস সফলভাবে পাঠানো হয়েছে!`
              : `Test SMS sent to ${cleanPhone} successfully!`,
        });
        onShowToast(
          language === 'bn'
            ? `${cleanPhone} নম্বরে টেস্ট এসএমএস পাঠানো হয়েছে!`
            : `Test SMS dispatched successfully!`
        );
      } else {
        setTestResult({
          success: false,
          message:
            language === 'bn'
              ? `এসএমএস পাঠানো যায়নি: ${res.error || 'গেটওয়ে ত্রুটি'}`
              : `SMS failed: ${res.error || 'Gateway error'}`,
        });
      }
    } catch (e: any) {
      setTestResult({
        success: false,
        message: `Error: ${e?.message || 'Failed to dispatch'}`,
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="bg-white rounded-2xl p-12 border border-gray-100 shadow-xs flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 text-[#006a4e] animate-spin mb-3" />
        <p className="text-gray-500 text-sm font-medium">
          {language === 'bn' ? 'এসএমএস কনফিগারেশন লোড হচ্ছে...' : 'Loading SMS configuration...'}
        </p>
      </div>
    );
  }

  /* ----------------------------------------------------
   * Dedicated Password Login Model for SMS Settings
   * ---------------------------------------------------- */
  if (!isAuthed) {
    return (
      <div className="max-w-xl mx-auto my-6 sm:my-10 p-4 sm:p-6" id="sms-settings-login-portal">
        <div className="bg-gradient-to-b from-gray-900 via-emerald-950 to-gray-900 rounded-3xl p-6 sm:p-8 text-white shadow-2xl border border-emerald-500/30 backdrop-blur-md space-y-6 relative overflow-hidden">
          {/* Subtle Ambient Light Effect */}
          <div className="absolute -top-16 -right-16 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Header Badge & Title */}
          <div className="text-center space-y-3 relative z-10">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-400/30 rounded-2xl flex items-center justify-center mx-auto text-amber-300 shadow-inner">
              <KeyRound className="w-8 h-8 animate-pulse" />
            </div>
            
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-xs font-bold text-emerald-300">
              <Lock className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'এসএমএস সিকিউরিটি গেটওয়ে' : 'SMS Security Gateway'}</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {language === 'bn' ? 'এসএমএস সেটিংস এক্সেস ভেরিফিকেশন' : 'SMS Settings Access Verification'}
            </h2>
            <p className="text-xs sm:text-sm text-emerald-200/80 leading-relaxed max-w-md mx-auto">
              {language === 'bn'
                ? 'এসএমএস কনফিগারেশন, অটো-মেসেজ ON/OFF বা টেমপ্লেট পরিবর্তনের জন্য সিকিউরিটি পাসওয়ার্ড প্রদান করুন।'
                : 'Enter the security password to view, modify templates, or change SMS ON/OFF settings.'}
            </p>
          </div>

          {/* Password Form */}
          <form onSubmit={handleLoginPassword} className="space-y-4 relative z-10 max-w-sm mx-auto">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-emerald-200">
                {language === 'bn' ? 'সিকিউরিটি পাসওয়ার্ড প্রবেশ করান:' : 'Security Password:'}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setAuthError('');
                  }}
                  placeholder="পাসওয়ার্ড লিখুন..."
                  autoFocus
                  className="w-full px-4 py-3 bg-gray-800/90 border border-emerald-500/40 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 rounded-xl text-white placeholder-gray-400 outline-none transition-all font-mono text-sm pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {authError && (
              <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-xs text-rose-200 font-bold flex items-center gap-2 animate-shake">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-amber-950 font-black rounded-xl text-sm transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Unlock className="w-4 h-4" />
              <span>{language === 'bn' ? 'আনলক করুন' : 'Unlock Settings'}</span>
            </button>
          </form>

          {/* Footer Security Notice */}
          <div className="text-center pt-2 border-t border-emerald-900/60 text-[11px] text-gray-400 relative z-10 flex items-center justify-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === 'bn' ? 'অননুমোদিত পরিবর্তন রোধে সুরক্ষিত এলাকা' : 'Protected section against unauthorized changes'}</span>
          </div>
        </div>
      </div>
    );
  }

  /* ----------------------------------------------------
   * Unlocked Full SMS Settings View
   * ---------------------------------------------------- */
  return (
    <div className="space-y-6" id="sms-template-settings-container">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#004d38] to-[#006a4e] rounded-2xl p-5 sm:p-6 text-white shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold text-emerald-200 backdrop-blur-xs">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'কাস্টম এসএমএস বডি ও ডেলিভারি কন্ট্রোল' : 'Custom SMS & Delivery Control'}</span>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-xs ${
                smsEnabled 
                  ? 'bg-emerald-500 text-white border-emerald-400' 
                  : 'bg-rose-500 text-white border-rose-400'
              }`}>
                <span className={`w-2 h-2 rounded-full ${smsEnabled ? 'bg-white animate-ping' : 'bg-gray-200'}`} />
                {smsEnabled ? (language === 'bn' ? 'অন (ON) - চালু' : 'ON - Active') : (language === 'bn' ? 'অফ (OFF) - বন্ধ' : 'OFF - Disabled')}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              {language === 'bn'
                ? 'সদস্য এসএমএস ডেলিভারি (ON/OFF) ও বডি টেক্সট সেটিংস'
                : 'Member SMS Delivery (ON/OFF) & Body Text Settings'}
            </h2>
            <p className="text-emerald-100/90 text-xs sm:text-sm max-w-3xl leading-relaxed">
              {language === 'bn'
                ? 'এখানে সুইচ এর মাধ্যমে বার্তা পাঠানো অন/অফ করতে পারবেন। এবং অনুমোদিত সদস্যদের প্রেরিত বার্তার ডায়নামিক ফরম্যাট পরিবর্তন করতে পারবেন।'
                : 'Toggle message sending ON/OFF and customize template body text for all alumni member notifications.'}
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start md:self-center shrink-0">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer shadow-md transition-all active:scale-95 ${
                savedSuccess
                  ? 'bg-emerald-500 text-white'
                  : 'bg-amber-400 hover:bg-amber-300 text-amber-950'
              }`}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{language === 'bn' ? 'সেভ হচ্ছে...' : 'Saving...'}</span>
                </>
              ) : savedSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{language === 'bn' ? 'সংরক্ষিত হয়েছে!' : 'Saved!'}</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{language === 'bn' ? 'সেটিংস সেভ করুন' : 'Save Settings'}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleLock}
              className="p-2.5 bg-emerald-950/70 hover:bg-emerald-950 text-emerald-200 border border-emerald-400/30 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105"
              title={language === 'bn' ? 'সিকিউরিটি লক করুন' : 'Lock settings'}
            >
              <Lock className="w-4 h-4 text-amber-300" />
              <span className="hidden sm:inline">{language === 'bn' ? 'লক করুন' : 'Lock'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Prominent OFF / ON Delivery Toggle Card */}
      <div className={`p-5 sm:p-6 rounded-2xl border-2 transition-all shadow-xs ${
        smsEnabled 
          ? 'bg-emerald-50/80 border-emerald-300/80' 
          : 'bg-rose-50/80 border-rose-300/80'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`p-2 rounded-xl ${smsEnabled ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>
                <Power className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                  <span>{language === 'bn' ? 'স্বয়ংক্রিয় এসএমএস ডেলিভারি সুইচ (SMS Delivery Switch)' : 'SMS Delivery Master Switch'}</span>
                </h3>
                <p className="text-xs text-gray-600 font-medium">
                  {smsEnabled
                    ? (language === 'bn' ? 'মেসেজ সেবা বর্তমানে অন (ON) আছে। সদস্য নিবন্ধনে অটোমেটিক এসএমএস পাঠানো হবে।' : 'SMS delivery is ON. Automated messages will be sent.')
                    : (language === 'bn' ? 'মেসেজ সেবা বর্তমানে অফ (OFF) রয়েছে। সিস্টেম থেকে কোনো অটোমেটিক এসএমএস যাবে না।' : 'SMS delivery is OFF. No automated messages will be sent.')}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
            <span className={`text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-lg ${
              smsEnabled ? 'text-emerald-800 bg-emerald-200/80' : 'text-rose-800 bg-rose-200/80'
            }`}>
              {smsEnabled ? 'সক্রিয় (ON)' : 'নিষ্ক্রিয় (OFF)'}
            </span>

            {/* Custom Toggle Switch */}
            <button
              type="button"
              onClick={() => handleToggleSMSService(!smsEnabled)}
              disabled={isSaving}
              className={`w-16 h-9 rounded-full p-1 transition-colors duration-200 ease-in-out cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                smsEnabled ? 'bg-emerald-600 focus:ring-emerald-500' : 'bg-gray-400 focus:ring-gray-400'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out flex items-center justify-center ${
                  smsEnabled ? 'translate-x-7 text-emerald-600' : 'translate-x-0 text-gray-500'
                }`}
              >
                <Power className="w-4 h-4" />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Editor & Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Columns: Template Editor & Variables */}
        <div className="lg:col-span-7 space-y-6">
          {/* Editor Card */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-emerald-50 text-[#006a4e] rounded-lg">
                  <MessageSquare className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-bold text-gray-900">
                  {language === 'bn' ? 'এসএমএস বডি টেক্সট এডিটর' : 'SMS Body Text Editor'}
                </h3>
              </div>
              <button
                type="button"
                onClick={handleResetDefault}
                className="text-xs text-gray-500 hover:text-emerald-700 flex items-center gap-1 font-semibold transition-colors cursor-pointer"
                title={language === 'bn' ? 'ডিফল্ট টেক্সট রিস্টোর করুন' : 'Reset to default text'}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'ডিফল্ট টেক্সট' : 'Reset Default'}</span>
              </button>
            </div>

            {/* Variable Tags Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-600 font-medium">
                <span className="text-emerald-800 font-semibold">
                  {language === 'bn'
                    ? 'ক্লিক করে ডায়নামিক ভেরিয়েবল যোগ করুন:'
                    : 'Click tags to insert dynamic placeholders:'}
                </span>
                <span className="text-[11px] text-gray-400">
                  {language === 'bn' ? 'স্বয়ংক্রিয়ভাবে তথ্য বসবে' : 'Replaced with member data'}
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {SMS_VARIABLES.map((v) => (
                  <button
                    key={v.key}
                    type="button"
                    onClick={() => handleInsertVariable(v.key)}
                    className="px-2.5 py-1 bg-gray-50 hover:bg-emerald-50 hover:border-emerald-300 text-gray-700 hover:text-emerald-800 border border-gray-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer group active:scale-95"
                    title={`${v.labelBn} (${v.example})`}
                  >
                    <span className="font-mono text-emerald-700 font-bold">{v.key}</span>
                    <span className="text-gray-500 text-[11px] group-hover:text-emerald-700">
                      ({v.labelBn})
                    </span>
                    {copiedKey === v.key ? (
                      <Check className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <span className="text-[10px] text-gray-400 group-hover:text-emerald-600">+</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Textarea Input */}
            <div className="space-y-2">
              <label htmlFor="sms-body-template-input" className="sr-only">
                SMS Body Template
              </label>
              <div className="relative">
                <textarea
                  id="sms-body-template-input"
                  ref={textareaRef}
                  value={template}
                  onChange={(e) => {
                    setTemplate(e.target.value);
                    setSavedSuccess(false);
                  }}
                  rows={6}
                  className="w-full p-3.5 text-sm font-sans bg-gray-50/70 focus:bg-white border border-gray-200 focus:border-[#006a4e] focus:ring-2 focus:ring-[#006a4e]/20 rounded-xl transition-all resize-y leading-relaxed text-gray-800"
                  placeholder="এসএমএস এর বডি টেক্সট এখানে লিখুন..."
                />
              </div>

              {/* Character & Part Counter */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs py-1 px-1 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center gap-3">
                  <span className="font-medium text-gray-600">
                    {language === 'bn' ? 'অক্ষর সংখ্যা:' : 'Characters:'}{' '}
                    <strong className="text-gray-900 font-mono text-sm">{stats.length}</strong>
                  </span>
                  <span className="text-gray-300">|</span>
                  <span className="font-medium text-gray-600">
                    {language === 'bn' ? 'আনুমানিক পার্ট:' : 'Parts:'}{' '}
                    <strong
                      className={`font-mono text-sm ${
                        stats.smsCount > 1 ? 'text-amber-600' : 'text-emerald-700'
                      }`}
                    >
                      {stats.smsCount} {language === 'bn' ? 'এসএমএস' : 'SMS'}
                    </strong>
                  </span>
                  <span className="text-gray-300">|</span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-600">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        stats.isUnicode ? 'bg-amber-500' : 'bg-blue-500'
                      }`}
                    />
                    {stats.isUnicode ? 'বাংলা / ইউনিকোড (Unicode)' : 'ইংরেজি / GSM'}
                  </span>
                </div>

                <span className="text-[11px] text-gray-400">
                  {stats.isUnicode
                    ? language === 'bn'
                      ? '১ম পার্ট ৭০ অক্ষর, পরবর্তী প্রতি পার্ট ৬৭ অক্ষর'
                      : '1st part 70 chars, then 67 chars'
                    : '160 chars per SMS'}
                </span>
              </div>
            </div>

            {/* Save & Status Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="text-xs text-gray-500">
                <span className="text-gray-500 font-medium">
                  {language === 'bn'
                    ? 'প্রয়োজন অনুযায়ী ডায়নামিক ট্যাগ নির্বাচন করে মেসেজ বডি কাস্টমাইজ করুন।'
                    : 'Customize your message using the available dynamic tags above.'}
                </span>
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className={`px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-all active:scale-95 ${
                    savedSuccess
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#006a4e] hover:bg-[#004d38] text-white'
                  }`}
                >
                  {isSaving ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : savedSuccess ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {isSaving
                      ? language === 'bn'
                        ? 'সেভ হচ্ছে...'
                        : 'Saving...'
                      : savedSuccess
                      ? language === 'bn'
                        ? 'সেভ হয়েছে!'
                        : 'Saved!'
                      : language === 'bn'
                      ? 'সংরক্ষণ করুন'
                      : 'Save Settings'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Preset Templates Library */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-amber-50 text-amber-700 rounded-lg">
                  <Layers className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-bold text-gray-900">
                  {language === 'bn' ? 'তৈরিকৃত টেমপ্লেট লাইব্রেরি' : 'Preset Template Library'}
                </h3>
              </div>
              <span className="text-xs text-gray-400">
                {language === 'bn' ? 'ক্লিক করে লোড করুন' : 'Click to load'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SMS_PRESET_TEMPLATES.map((preset) => (
                <div
                  key={preset.id}
                  onClick={() => {
                    setTemplate(preset.template);
                    setSavedSuccess(false);
                  }}
                  className="p-3.5 rounded-xl border border-gray-200 hover:border-[#006a4e] bg-gray-50/50 hover:bg-emerald-50/30 transition-all cursor-pointer group space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-gray-800 group-hover:text-[#006a4e] transition-colors">
                      {preset.titleBn}
                    </h4>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white border border-gray-200 text-gray-600 font-semibold group-hover:border-emerald-300">
                      ব্যবহার করুন
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-600 line-clamp-2 leading-relaxed">
                    {preset.template}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Test SMS Sender */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                <Send className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  {language === 'bn' ? 'সরাসরি টেস্ট এসএমএস পাঠান' : 'Send Test SMS'}
                </h3>
                <p className="text-[11px] text-gray-500">
                  {language === 'bn'
                    ? 'আপনার নিজের নম্বরে টেস্ট মেসেজ পাঠিয়ে ফরম্যাটিং ও ডেলিভারি পরীক্ষা করুন।'
                    : 'Dispatch a test message to your own number to test delivery.'}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="tel"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  placeholder="017XXXXXXXX"
                  className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#006a4e] rounded-xl outline-none font-mono"
                />
              </div>

              <button
                type="button"
                onClick={handleSendTestSMS}
                disabled={isSendingTest || !smsEnabled}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95 shrink-0"
              >
                {isSendingTest ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{language === 'bn' ? 'পাঠানো হচ্ছে...' : 'Sending...'}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'টেস্ট পাঠান' : 'Send Test'}</span>
                  </>
                )}
              </button>
            </div>

            {!smsEnabled && (
              <p className="text-xs text-rose-600 font-bold bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                ⚠️ {language === 'bn' ? 'এসএমএস সেবা বন্ধ (OFF) অবস্থায় থাকায় টেস্ট মেসেজ পাঠানো স্থগিত রয়েছে।' : 'SMS service is OFF. Test sending is disabled.'}
              </p>
            )}

            {testResult && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  testResult.success
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right 5 Columns: Smartphone Live Preview & Gateway Info */}
        <div className="lg:col-span-5 space-y-6">
          {/* Live Mobile Device Mockup Preview */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-purple-50 text-purple-700 rounded-lg">
                  <Smartphone className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-bold text-gray-900">
                  {language === 'bn' ? 'লাইভ মেসেজ প্রিভিউ' : 'Live SMS Preview'}
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                {language === 'bn' ? 'রিয়েল-টাইম' : 'Real-time'}
              </span>
            </div>

            {/* Member Sample Selector if members exist */}
            {members.length > 0 && (
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-gray-500">
                  {language === 'bn' ? 'নমুনা সদস্য নির্বাচন করুন:' : 'Preview with member data:'}
                </label>
                <select
                  value={previewMemberIndex}
                  onChange={(e) => setPreviewMemberIndex(Number(e.target.value))}
                  className="w-full text-xs p-2 bg-gray-50 border border-gray-200 rounded-lg outline-none text-gray-800"
                >
                  <option value={9999}>ড. মোঃ রফিকুল ইসলাম (নমুনা ডেমো)</option>
                  {members.slice(0, 15).map((m, idx) => (
                    <option key={m.id} value={idx}>
                      {m.applicantNameBn || m.fullName} ({m.formNo || m.mobile || 'No Form'})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Mobile Phone Mockup Frame */}
            <div className="max-w-[340px] mx-auto bg-gray-900 p-3 rounded-[32px] shadow-lg border-4 border-gray-800">
              {/* Phone Speaker & Camera Notch */}
              <div className="w-24 h-4 bg-black rounded-full mx-auto mb-2 flex items-center justify-center">
                <div className="w-2.5 h-2.5 bg-gray-800 rounded-full mr-1.5" />
                <div className="w-8 h-1 bg-gray-800 rounded-full" />
              </div>

              {/* Phone Screen Screen */}
              <div className="bg-[#f0f2f5] rounded-[24px] overflow-hidden min-h-[380px] flex flex-col justify-between p-3">
                {/* SMS Header */}
                <div className="bg-white rounded-xl p-2.5 text-center shadow-2xs border border-gray-100">
                  <div className="w-8 h-8 rounded-full bg-[#006a4e] text-white mx-auto flex items-center justify-center text-xs font-bold mb-1 shadow-2xs">
                    BA
                  </div>
                  <div className="text-xs font-bold text-gray-900">8809648906169</div>
                  <div className="text-[10px] text-gray-400">Botany Alumni Association</div>
                </div>

                {/* SMS Message Bubble */}
                <div className="my-auto py-3 space-y-2">
                  <div className="text-center">
                    <span className="text-[10px] text-gray-400 bg-white/70 px-2 py-0.5 rounded-full">
                      আজ {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="bg-white rounded-2xl rounded-tl-xs p-3.5 shadow-xs border border-gray-200/70 text-gray-800 text-xs leading-relaxed space-y-2">
                    <p className="whitespace-pre-wrap break-words">{previewMessage}</p>

                    <div className="text-[9px] text-gray-400 text-right flex items-center justify-end gap-1">
                      <span>{previewStats.length} অক্ষর ({previewStats.smsCount} পার্ট)</span>
                      <Check className="w-3 h-3 text-blue-500" />
                    </div>
                  </div>
                </div>

                {/* Phone Bottom Bar */}
                <div className="bg-white rounded-full p-2 px-3 flex items-center justify-between text-gray-400 text-[11px] shadow-2xs border border-gray-100">
                  <span>টেক্সট মেসেজ...</span>
                  <Send className="w-3.5 h-3.5 text-[#006a4e]" />
                </div>
              </div>
            </div>
          </div>

          {/* Gateway Status & Info */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg">
                <ShieldCheck className="w-4 h-4" />
              </span>
              <h3 className="text-sm font-bold text-gray-900">
                {language === 'bn' ? 'এসএমএস গেটওয়ে স্ট্যাটাস' : 'SMS Gateway Status'}
              </h3>
            </div>

            <div className="space-y-2 text-xs divide-y divide-gray-100">
              <div className="flex items-center justify-between py-1.5">
                <span className="text-gray-500">{language === 'bn' ? 'সার্ভিস স্ট্যাটাস:' : 'Service Status:'}</span>
                <span className={`font-bold ${smsEnabled ? 'text-emerald-700' : 'text-rose-600'}`}>
                  {smsEnabled ? 'চালু (ON)' : 'বন্ধ (OFF)'}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-gray-500">{language === 'bn' ? 'সার্ভিস প্রোভাইডার:' : 'Provider:'}</span>
                <span className="font-bold text-gray-800">BulkSMSBD API</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-gray-500">{language === 'bn' ? 'প্রেরক আইডি (Sender ID):' : 'Sender ID:'}</span>
                <span className="font-mono font-bold text-[#006a4e]">8809648906169</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-gray-500">{language === 'bn' ? 'গেটওয়ে সংযোগ:' : 'Connection:'}</span>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  সক্রিয় (Active)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

