import React, { useState } from 'react';
import { Language, VoiceOutputLanguage, StatutoryNotice } from '../types';
import { MOCK_NOTICES } from '../data/mockNotices';
import { downloadIcsFile } from '../utils/icsGenerator';

interface MobileAssistantViewProps {
  language: Language;
  onSelectLanguage: (lang: Language) => void;
  voiceOutputLanguage?: VoiceOutputLanguage;
  onSelectVoiceOutputLanguage?: (lang: VoiceOutputLanguage) => void;
  onOpenScanner: () => void;
  onOpenVoiceAgent: () => void;
  onSelectNoticeDetail: (notice: StatutoryNotice) => void;
  onSwitchToWorkstation: () => void;
}

export const MobileAssistantView: React.FC<MobileAssistantViewProps> = ({
  language,
  onSelectLanguage,
  voiceOutputLanguage = 'auto',
  onSelectVoiceOutputLanguage,
  onOpenScanner,
  onOpenVoiceAgent,
  onSelectNoticeDetail,
  onSwitchToWorkstation
}) => {
  const [activeTab, setActiveTab] = useState<'home' | 'scan' | 'deadlines' | 'help'>('home');
  const [reminderSetMap, setReminderSetMap] = useState<Record<string, boolean>>({});

  const handleSetReminder = (notice: StatutoryNotice, e: React.MouseEvent) => {
    e.stopPropagation();
    downloadIcsFile({
      title: notice.title,
      description: notice.requiredAction[language] || notice.requiredAction.en,
      dueDate: notice.deadlineDate,
      noticeRef: notice.refNumber,
      filename: `${notice.id.toLowerCase()}_reminder.ics`
    });

    setReminderSetMap(prev => ({ ...prev, [notice.id]: true }));
    setTimeout(() => {
      setReminderSetMap(prev => ({ ...prev, [notice.id]: false }));
    }, 3000);
  };

  return (
    <div className="w-full flex flex-col items-center justify-center py-6 px-2 min-h-screen bg-[#EEF4FF]">
      {/* Top Banner to switch back to Desktop Workstation */}
      <div className="w-full max-w-[440px] mb-3 flex items-center justify-between px-2">
        <button
          onClick={onSwitchToWorkstation}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1a1a1a] text-white text-xs font-['Space_Grotesk'] font-bold uppercase rounded shadow-sm hover:bg-[#ffcc00] hover:text-[#1a1a1a] transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">desktop_windows</span>
          <span>Switch to Bauhaus Workstation</span>
        </button>
        <span className="text-[11px] font-bold text-slate-500 font-['Space_Grotesk']">
          Phone Viewport
        </span>
      </div>

      {/* Mobile iOS Frame Container */}
      <div className="w-full max-w-[440px] bg-[#EEF4FF] flex flex-col min-h-[850px] relative pb-28 shadow-2xl rounded-2xl overflow-hidden border border-slate-300">
        {/* BEGIN: MainHeader */}
        <header className="bg-[#0A2263] text-white pt-4 pb-4 px-4 sticky top-0 z-40 shadow-md">
          {/* Top Row: Logo, Offline Badge, Profile */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              {/* Logo Icon */}
              <div className="w-9 h-9 rounded-full bg-blue-500/20 border border-blue-400/40 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-blue-300"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.2"
                  viewBox="0 0 24 24"
                >
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight leading-none text-white font-['Plus_Jakarta_Sans']">
                  Go Vision
                </h1>
                <p className="text-[11px] text-blue-200/90 font-medium tracking-wide mt-0.5">
                  Civic Notice Assistant
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2.5">
              {/* Offline Status Badge */}
              <div className="flex items-center space-x-1 bg-[#061845] border border-emerald-500/40 px-2.5 py-1 rounded-full shadow-inner">
                <svg className="w-3.5 h-3.5 text-emerald-400" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    clipRule="evenodd"
                    d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 00-7.5 0v3h7.5z"
                    fillRule="evenodd"
                  />
                </svg>
                <span className="text-[10px] font-bold text-emerald-400 tracking-wider">
                  OFFLINE 100%
                </span>
              </div>
              {/* Profile Button */}
              <button
                aria-label="User Profile"
                onClick={onSwitchToWorkstation}
                className="w-8 h-8 rounded-full bg-blue-700/60 flex items-center justify-center text-blue-200 hover:text-white border border-blue-500/30 cursor-pointer"
                type="button"
              >
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path
                    d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Language & Voice Output Selector Bar */}
          <div className="flex flex-wrap items-center justify-between mt-3 pt-2 border-t border-blue-800/40 text-[11px]">
            <div className="flex items-center gap-1 text-blue-200">
              <span className="text-[10px] font-['Space_Mono'] font-bold">Voice:</span>
              <button
                onClick={() => onSelectVoiceOutputLanguage && onSelectVoiceOutputLanguage('auto')}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                  voiceOutputLanguage === 'auto' ? 'bg-white text-[#0A2263]' : 'text-blue-200 hover:text-white'
                }`}
                title="Auto-detect voice"
              >
                Auto
              </button>
              <button
                onClick={() => onSelectVoiceOutputLanguage && onSelectVoiceOutputLanguage('kn')}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                  voiceOutputLanguage === 'kn' ? 'bg-[#e63b2e] text-white' : 'text-blue-200 hover:text-white'
                }`}
                title="Kannada voice output"
              >
                ಕನ್ನಡ
              </button>
              <button
                onClick={() => onSelectVoiceOutputLanguage && onSelectVoiceOutputLanguage('hi')}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                  voiceOutputLanguage === 'hi' ? 'bg-[#e63b2e] text-white' : 'text-blue-200 hover:text-white'
                }`}
                title="Hindi voice output"
              >
                हिंदी
              </button>
              <button
                onClick={() => onSelectVoiceOutputLanguage && onSelectVoiceOutputLanguage('en')}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                  voiceOutputLanguage === 'en' ? 'bg-[#e63b2e] text-white' : 'text-blue-200 hover:text-white'
                }`}
                title="English voice output"
              >
                EN
              </button>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={() => onSelectLanguage('en')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                  language === 'en'
                    ? 'bg-white text-[#0A2263] shadow-sm'
                    : 'text-blue-200 hover:text-white'
                }`}
                type="button"
              >
                EN
              </button>
              <button
                onClick={() => onSelectLanguage('hi')}
                className={`px-2 py-0.5 rounded text-[10px] font-semibold transition cursor-pointer ${
                  language === 'hi'
                    ? 'bg-white text-[#0A2263] shadow-sm'
                    : 'text-blue-200 hover:text-white'
                }`}
                type="button"
              >
                हिंदी
              </button>
              <button
                onClick={() => onSelectLanguage('kn')}
                className={`px-2 py-0.5 rounded text-[10px] font-semibold font-['Noto_Sans_Kannada'] transition cursor-pointer ${
                  language === 'kn'
                    ? 'bg-white text-[#0A2263] shadow-sm'
                    : 'text-blue-200 hover:text-white'
                }`}
                type="button"
              >
                ಕನ್ನಡ
              </button>
            </div>
          </div>
        </header>

        {/* BEGIN: MainContent */}
        <main className="px-4 pt-4 space-y-4 flex-1 text-left">
          {/* BEGIN: Hero Card */}
          <section className="bg-gradient-to-b from-[#F0FDFB] to-[#F5FAFF] border border-cyan-100 rounded-2xl p-4 hero-shadow relative overflow-hidden">
            <div className="flex items-start gap-3">
              {/* Icon Badge */}
              <div className="w-9 h-9 rounded-xl bg-emerald-100/90 text-emerald-700 flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path
                    d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="space-y-1.5 flex-1">
                {/* Pill tag */}
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-100/80 text-blue-700 text-[10px] font-bold uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  Zero Server Upload
                </div>
                {/* Title */}
                <h2 className="text-base font-bold text-slate-900 leading-snug">
                  Understand your government notice in simple language.
                </h2>
                {/* Description */}
                <p className="text-[12px] text-slate-600 leading-relaxed pt-0.5">
                  Translate complex legal words into clear steps in Hindi, Kannada, or English. 100% on-device &amp; private.
                </p>
              </div>
            </div>
            {/* Safe Documents Info Box */}
            <div className="mt-3.5 bg-blue-50/90 border border-blue-100/90 rounded-xl p-2.5 flex items-center gap-2.5">
              <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path
                  d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p className="text-[11.5px] text-slate-700 leading-tight">
                Your documents stay safely on this phone. <span className="font-bold text-blue-900">No internet needed.</span>
              </p>
            </div>
          </section>

          {/* BEGIN: Public Service Reader Banner */}
          <section className="relative rounded-2xl overflow-hidden shadow-sm h-28 bg-gradient-to-r from-[#0C2250] to-[#143B80] p-4 flex flex-col justify-end text-white">
            <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#93c5fd_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />
            <div className="absolute -right-6 -bottom-8 w-36 h-36 bg-blue-400/20 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10">
              <div className="inline-block text-[9.5px] font-extrabold tracking-widest text-cyan-300 uppercase mb-1">
                Public Service Reader
              </div>
              <p className="text-sm font-bold text-white tracking-tight leading-snug">
                Paper letters decoded into simple action items
              </p>
            </div>
          </section>

          {/* BEGIN: Primary Action Buttons */}
          <section className="space-y-2.5">
            {/* Scan a Notice Button */}
            <div
              onClick={onOpenScanner}
              className="bg-[#0B2568] hover:bg-[#091f58] transition-colors rounded-2xl p-3.5 flex items-center justify-between text-white cursor-pointer shadow-md"
            >
              <div className="flex items-center space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path
                      d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Scan a Notice</h3>
                  <p className="text-[11px] text-blue-200">Take photo or upload PDF</p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-blue-600/40 flex items-center justify-center text-white">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>

            {/* Talk to Go Vision Button */}
            <div
              onClick={onOpenVoiceAgent}
              className="bg-white hover:bg-slate-50 transition-colors border border-blue-100 rounded-2xl p-3.5 flex items-center justify-between text-slate-800 cursor-pointer card-shadow"
            >
              <div className="flex items-center space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Talk to Go Vision</h3>
                  <p className="text-[11px] text-slate-500">Ask questions by voice in your language</p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-blue-50/70 flex items-center justify-center text-slate-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.757 3.63 8.25 4.51 8.25H6.75z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>

            {/* Engine Status Info Row */}
            <div className="flex items-center justify-between pt-1 px-1 text-[11px] text-slate-500 font-medium">
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Gemma 2B Civic Engine: Ready</span>
              </div>
              <button
                onClick={onSwitchToWorkstation}
                className="text-blue-900 hover:text-blue-700 font-semibold flex items-center gap-1 cursor-pointer"
                type="button"
              >
                Engine Health
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M4 6h16M4 12h16M4 18h7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </section>

          {/* BEGIN: Upcoming Deadlines Section */}
          <section className="pt-2 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <h2 className="text-[15px] font-bold text-slate-900">My Upcoming Deadlines</h2>
                <span className="bg-rose-100 text-rose-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  3 Active
                </span>
              </div>
              <button
                onClick={onSwitchToWorkstation}
                className="text-[11px] font-semibold text-blue-700 hover:underline cursor-pointer"
              >
                View All
              </button>
            </div>

            {/* Notice 1: Property Tax */}
            <article
              onClick={() => onSelectNoticeDetail(MOCK_NOTICES[1])}
              className="bg-white rounded-2xl border-l-[3.5px] border-l-rose-500 border-y border-r border-slate-100 p-3.5 card-shadow space-y-2.5 cursor-pointer hover:border-blue-300 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-100">
                  <svg className="w-3 h-3 text-rose-500" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                    <path d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Due in 3 days — 14 Oct 2026
                </span>
                <span className="text-[10px] text-slate-400 font-mono font-medium">Ref: BBMP-REV/492</span>
              </div>
              <div>
                <h3 className="text-[13.5px] font-bold text-slate-900 leading-tight">
                  Municipal Property Tax Assessment Notice
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Bruhat Bengaluru Mahanagara Palike (BBMP)</p>
              </div>
              <div className="bg-rose-50/70 rounded-xl p-2.5 text-[11px] text-slate-700 leading-relaxed border border-rose-100/60">
                <span className="font-bold text-rose-700 block mb-0.5">Required Action:</span>
                Submit objection form or pay revised assessment difference online to avoid 2% monthly statutory interest.
              </div>
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center space-x-1.5 text-[11px] font-medium text-slate-600">
                  <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>Sec 108A Verified</span>
                </div>
                <button
                  onClick={(e) => handleSetReminder(MOCK_NOTICES[1], e)}
                  className="flex items-center space-x-1 px-3 py-1 bg-blue-50 text-blue-800 text-[11px] font-bold rounded-full hover:bg-blue-100 transition-colors cursor-pointer"
                  type="button"
                >
                  <svg className="w-3 h-3 text-blue-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>{reminderSetMap['BBMP-REV-492'] ? 'Reminder Saved!' : 'Set Reminder'}</span>
                </button>
              </div>
            </article>

            {/* Notice 2: Aadhaar e-KYC */}
            <article
              onClick={() => onSelectNoticeDetail(MOCK_NOTICES[2])}
              className="bg-white rounded-2xl border-l-[3.5px] border-l-amber-500 border-y border-r border-slate-100 p-3.5 card-shadow space-y-2.5 cursor-pointer hover:border-blue-300 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
                  <svg className="w-3 h-3 text-amber-600" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                    <path d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Due in 18 days — 29 Oct 2026
                </span>
                <span className="text-[10px] text-slate-400 font-mono font-medium">FCSD-7710</span>
              </div>
              <div>
                <h3 className="text-[13.5px] font-bold text-slate-900 leading-tight">
                  Aadhaar - Ration Card e-KYC Linking
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Dept of Food &amp; Civil Supplies</p>
              </div>
              <div className="bg-slate-50/90 rounded-xl p-2.5 text-[11px] text-slate-700 leading-relaxed border border-slate-100">
                <span className="font-bold text-slate-900 block mb-0.5">Required Action:</span>
                Visit nearest Fair Price Shop or Grama One center for biometric verification to continue monthly quota.
              </div>
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center space-x-1.5 text-[11px] font-medium text-slate-600">
                  <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M7.864 4.243A7.5 7.5 0 0119.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 004.5 10.5a7.464 7.464 0 01-1.15 3.993m1.989 3.559A11.209 11.209 0 008.25 10.5a3.75 3.75 0 117.5 0c0 .527-.021 1.049-.064 1.565M12 10.5a1.5 1.5 0 011.5 1.5v.75m-3.75 2.25h.008v.008h-.008v-.008z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>Biometric Center Required</span>
                </div>
                <button
                  onClick={(e) => handleSetReminder(MOCK_NOTICES[2], e)}
                  className="flex items-center space-x-1 px-3 py-1 bg-blue-50 text-blue-800 text-[11px] font-bold rounded-full hover:bg-blue-100 transition-colors cursor-pointer"
                  type="button"
                >
                  <svg className="w-3 h-3 text-blue-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>{reminderSetMap['FCSD-7710'] ? 'Reminder Saved!' : 'Set Reminder'}</span>
                </button>
              </div>
            </article>

            {/* Notice 3: PM Kisan */}
            <article
              onClick={() => onSelectNoticeDetail(MOCK_NOTICES[3])}
              className="bg-white rounded-2xl border-l-[3.5px] border-l-emerald-500 border-y border-r border-slate-100 p-3.5 card-shadow space-y-2.5 cursor-pointer hover:border-blue-300 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                  <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                    <path d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Due in 45 days — 25 Nov 2026
                </span>
                <span className="text-[10px] text-slate-400 font-mono font-medium">PM-KISAN/KR</span>
              </div>
              <div>
                <h3 className="text-[13.5px] font-bold text-slate-900 leading-tight">
                  Kisan Samman Nidhi Annual Land Record Update
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Department of Agriculture &amp; Farmers Welfare</p>
              </div>
              <div className="bg-blue-50/50 rounded-xl p-2.5 text-[11px] text-slate-700 leading-relaxed border border-blue-100/60">
                <span className="font-bold text-blue-900 block mb-0.5">Required Action:</span>
                Self-attest RTC land revenue receipt online or at Seva Kendra to maintain active installment status.
              </div>
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center space-x-1.5 text-[11px] font-medium text-slate-600">
                  <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>Self-Attestation Eligible</span>
                </div>
                <button
                  onClick={(e) => handleSetReminder(MOCK_NOTICES[3], e)}
                  className="flex items-center space-x-1 px-3 py-1 bg-blue-50 text-blue-800 text-[11px] font-bold rounded-full hover:bg-blue-100 transition-colors cursor-pointer"
                  type="button"
                >
                  <svg className="w-3 h-3 text-blue-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>{reminderSetMap['PM-KISAN-KR'] ? 'Reminder Saved!' : 'Set Reminder'}</span>
                </button>
              </div>
            </article>
          </section>

          {/* BEGIN: Guarantee & Features Section */}
          <section className="pt-3 pb-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <h2 className="text-[14px] font-bold text-slate-900">How Go Vision Protects You</h2>
              <span className="text-[10px] font-semibold text-slate-500">3-Step Guarantee</span>
            </div>

            {/* Step 1 Card */}
            <div className="bg-blue-50/70 border border-blue-100/80 rounded-2xl p-3.5 flex items-start gap-3">
              <div className="w-6 h-6 rounded-lg bg-blue-200/80 text-blue-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                1
              </div>
              <div className="space-y-0.5">
                <h3 className="text-xs font-bold text-slate-900">No Internet Needed</h3>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Translation and legal reading occur entirely inside your phone hardware. Your confidential records never travel over cloud servers.
                </p>
              </div>
            </div>

            {/* Step 2 Card */}
            <div className="bg-blue-50/70 border border-blue-100/80 rounded-2xl p-3.5 flex items-start gap-3">
              <div className="w-6 h-6 rounded-lg bg-blue-200/80 text-blue-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                2
              </div>
              <div className="space-y-0.5">
                <h3 className="text-xs font-bold text-slate-900">Explains in Plain Words</h3>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Extracts fine print, legal threats, and statutory deadlines into conversational bullet points you can act on right away.
                </p>
              </div>
            </div>

            {/* Step 3 Card */}
            <div className="bg-blue-50/70 border border-blue-100/80 rounded-2xl p-3.5 flex items-start gap-3">
              <div className="w-6 h-6 rounded-lg bg-blue-200/80 text-blue-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                3
              </div>
              <div className="space-y-0.5">
                <h3 className="text-xs font-bold text-slate-900">Never Miss Penalties</h3>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Auto-calculates response timeframes and provides audio reminders in your mother tongue before interest accrues.
                </p>
              </div>
            </div>

            {/* Floating Central CTA */}
            <div className="pt-3 pb-2 flex justify-center">
              <button
                onClick={onOpenScanner}
                className="bg-[#0B2568] hover:bg-[#071947] text-white px-5 py-2.5 rounded-full font-bold text-xs shadow-lg flex items-center gap-2 border border-blue-400/20 active:scale-95 transition-transform cursor-pointer"
                type="button"
              >
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path
                    d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>Scan Notice</span>
                <span className="w-1.5 h-1.5 rounded-full bg-blue-300 ml-0.5" />
              </button>
            </div>
          </section>
        </main>

        {/* BEGIN: BottomNavigationBar */}
        <nav className="fixed bottom-0 max-w-[440px] w-full bg-white border-t border-slate-200/80 px-6 py-2 flex items-center justify-between z-50 text-slate-500 shadow-md">
          {/* Nav Item 1: Home */}
          <button
            onClick={() => setActiveTab('home')}
            className="flex flex-col items-center group cursor-pointer"
          >
            <div className={`px-4 py-0.5 rounded-full transition ${activeTab === 'home' ? 'bg-blue-100 text-[#0B2568]' : 'text-slate-500'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path
                  d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className={`text-[10px] font-bold mt-0.5 ${activeTab === 'home' ? 'text-[#0B2568]' : 'text-slate-500'}`}>
              Home
            </span>
          </button>

          {/* Nav Item 2: Scan */}
          <button
            onClick={onOpenScanner}
            className="flex flex-col items-center text-slate-500 hover:text-slate-800 transition cursor-pointer"
          >
            <div className="px-2 py-0.5">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h3v3h-3v-3zM16.5 16.5h3v3h-3v-3z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-[10px] font-semibold mt-0.5">Scan</span>
          </button>

          {/* Nav Item 3: Deadlines */}
          <button
            onClick={() => setActiveTab('deadlines')}
            className="flex flex-col items-center text-slate-500 hover:text-slate-800 transition cursor-pointer"
          >
            <div className={`px-2 py-0.5 ${activeTab === 'deadlines' ? 'text-[#0B2568]' : ''}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-[10px] font-semibold mt-0.5">Deadlines</span>
          </button>

          {/* Nav Item 4: Help */}
          <button
            onClick={onSwitchToWorkstation}
            className="flex flex-col items-center text-slate-500 hover:text-slate-800 transition cursor-pointer"
          >
            <div className="px-2 py-0.5">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-[10px] font-semibold mt-0.5">Help</span>
          </button>
        </nav>
      </div>
    </div>
  );
};
