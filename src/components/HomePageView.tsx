import React, { useState } from 'react';
import { Language, VoiceOutputLanguage, InputLanguageSetting, ConversationTurn, StatutoryNotice, ViewMode } from '../types';
import { downloadIcsFile } from '../utils/icsGenerator';

interface HomePageViewProps {
  language: Language;
  onSelectLanguage: (lang: Language) => void;
  inputLanguage: InputLanguageSetting;
  onSelectInputLanguage: (lang: InputLanguageSetting) => void;
  detectedLanguage: Language;
  voiceOutputLanguage: VoiceOutputLanguage;
  onSelectVoiceOutputLanguage: (lang: VoiceOutputLanguage) => void;
  isVoiceResponseEnabled: boolean;
  onToggleVoiceResponse: () => void;
  onTestVoiceOutput: (lang: VoiceOutputLanguage) => void;
  isListening: boolean;
  interimTranscript: string;
  onToggleVoiceListening: () => void;
  onSendMessage: (text: string, forcedLang?: Language) => void;
  turns: ConversationTurn[];
  isProcessing: boolean;
  speakingTurnId: string | null;
  onPlayAssistantVoice: (turn: ConversationTurn, forcedVoiceLang?: VoiceOutputLanguage) => void;
  onStopAssistantVoice: () => void;
  noticesList: StatutoryNotice[];
  onOpenScanner: () => void;
  onSelectNotice: (notice: StatutoryNotice) => void;
  onNavigateToView: (view: ViewMode) => void;
  onActionButtonClick: (action: string) => void;
}

export const HomePageView: React.FC<HomePageViewProps> = ({
  language,
  onSelectLanguage,
  inputLanguage,
  onSelectInputLanguage,
  detectedLanguage,
  voiceOutputLanguage,
  onSelectVoiceOutputLanguage,
  isVoiceResponseEnabled,
  onToggleVoiceResponse,
  onTestVoiceOutput,
  isListening,
  interimTranscript,
  onToggleVoiceListening,
  onSendMessage,
  turns,
  isProcessing,
  speakingTurnId,
  onPlayAssistantVoice,
  onStopAssistantVoice,
  noticesList,
  onOpenScanner,
  onSelectNotice,
  onNavigateToView,
  onActionButtonClick
}) => {
  const [reminderSavedMap, setReminderSavedMap] = useState<Record<string, boolean>>({});
  const [homeTextInput, setHomeTextInput] = useState<string>('');

  const handleExportReminder = (notice: StatutoryNotice, e: React.MouseEvent) => {
    e.stopPropagation();
    downloadIcsFile({
      title: notice.title,
      description: notice.requiredAction[language] || notice.requiredAction.en,
      dueDate: notice.deadlineDate,
      noticeRef: notice.refNumber,
      filename: `${notice.id.toLowerCase()}_reminder.ics`
    });

    setReminderSavedMap(prev => ({ ...prev, [notice.id]: true }));
    setTimeout(() => {
      setReminderSavedMap(prev => ({ ...prev, [notice.id]: false }));
    }, 3500);
  };

  const recentUserTurn = [...turns].reverse().find(t => t.type === 'user');
  const recentAssistantTurn = [...turns].reverse().find(t => t.type === 'assistant');

  return (
    <div className="w-full min-h-screen bg-[#EEF4FF] flex flex-col items-center justify-start py-4 sm:py-6 px-3 sm:px-6 text-slate-800">
      {/* Top Banner to switch to Bauhaus Workstation view if desired */}
      <div className="w-full max-w-4xl mb-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-slate-700 font-['Space_Grotesk'] uppercase tracking-wider">
            Go Vision Home Page UI
          </span>
        </div>
        <button
          onClick={() => onNavigateToView('voice-agent')}
          className="flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-xs font-['Space_Grotesk'] font-bold text-[#0A2263] shadow-xs transition-all cursor-pointer"
          title="Switch to 3-column workstation view"
        >
          <span className="material-symbols-outlined text-[15px] text-[#e63b2e]">dashboard</span>
          <span>Switch to Workstation View</span>
        </button>
      </div>

      {/* Main Container Card */}
      <div className="w-full max-w-4xl bg-white shadow-xl rounded-2xl overflow-hidden border border-slate-200 flex flex-col mb-16">
        {/* BEGIN: MainHeader */}
        <header className="bg-[#0A2263] text-white pt-5 pb-4 px-5 sm:px-8 shadow-md">
          {/* Top Row: Logo, Offline Badge, Voice Output Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              {/* Logo Icon */}
              <div className="w-10 h-10 rounded-full bg-blue-500/25 border border-blue-400/50 flex items-center justify-center shadow-inner">
                <svg
                  className="w-5 h-5 text-blue-200"
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
                <h1 className="text-xl font-bold tracking-tight leading-none text-white font-['Space_Grotesk']">
                  Go Vision
                </h1>
                <p className="text-[12px] text-blue-200/90 font-medium tracking-wide mt-0.5">
                  Civic Notice Assistant
                </p>
              </div>
            </div>

            {/* Offline Status Badge & Controls */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center space-x-1.5 bg-[#061845] border border-emerald-500/50 px-3 py-1 rounded-full shadow-inner">
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

              {/* Voice Mute/Unmute */}
              <button
                onClick={onToggleVoiceResponse}
                className="flex items-center gap-1 px-2.5 py-1 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-xs font-['Space_Grotesk'] font-bold text-white transition-colors cursor-pointer"
                title="Toggle spoken responses"
              >
                <span className="material-symbols-outlined text-[15px] text-[#e63b2e]">
                  {isVoiceResponseEnabled ? 'volume_up' : 'volume_off'}
                </span>
                <span className="text-[11px]">{isVoiceResponseEnabled ? 'Voice ON' : 'Mute'}</span>
              </button>
            </div>
          </div>

          {/* Second Row: Voice Output Selection & Auto-Detect Language Settings */}
          <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-blue-800/60">
            {/* Voice Output Language Options */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-[10px] font-['Space_Mono'] font-bold uppercase tracking-wider text-blue-200 pr-1">
                Voice Output:
              </span>
              <button
                onClick={() => onSelectVoiceOutputLanguage('auto')}
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition cursor-pointer ${
                  voiceOutputLanguage === 'auto'
                    ? 'bg-white text-[#0A2263] shadow-xs'
                    : 'text-blue-200 hover:text-white bg-blue-900/40'
                }`}
                title="Spoken voice automatically matches your detected language"
              >
                ⚡ Auto-Detect
              </button>
              <button
                onClick={() => onSelectVoiceOutputLanguage('kn')}
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition cursor-pointer ${
                  voiceOutputLanguage === 'kn'
                    ? 'bg-[#e63b2e] text-white shadow-xs'
                    : 'text-blue-200 hover:text-white bg-blue-900/40'
                }`}
                title="Voice output in Kannada"
              >
                ಕನ್ನಡ
              </button>
              <button
                onClick={() => onSelectVoiceOutputLanguage('hi')}
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition cursor-pointer ${
                  voiceOutputLanguage === 'hi'
                    ? 'bg-[#e63b2e] text-white shadow-xs'
                    : 'text-blue-200 hover:text-white bg-blue-900/40'
                }`}
                title="Voice output in Hindi"
              >
                हिंदी
              </button>
              <button
                onClick={() => onSelectVoiceOutputLanguage('en')}
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition cursor-pointer ${
                  voiceOutputLanguage === 'en'
                    ? 'bg-[#e63b2e] text-white shadow-xs'
                    : 'text-blue-200 hover:text-white bg-blue-900/40'
                }`}
                title="Voice output in English"
              >
                English
              </button>

              <button
                onClick={() => onTestVoiceOutput(voiceOutputLanguage)}
                className="px-2 py-0.5 rounded bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30 text-[10px] font-bold text-cyan-200 flex items-center gap-1 cursor-pointer transition"
                title="Hear sample speech in selected voice"
              >
                <span className="material-symbols-outlined text-[13px]">play_arrow</span>
                <span>Test Voice</span>
              </button>
            </div>

            {/* Input Language & Auto-Detect Badge */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-[10px] font-['Space_Mono'] text-emerald-300 font-bold bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded">
                ⚡ Auto-Detected: {detectedLanguage === 'kn' ? 'ಕನ್ನಡ' : detectedLanguage === 'hi' ? 'हिंदी' : 'English'}
              </span>
              <button
                onClick={() => onSelectLanguage('en')}
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition cursor-pointer ${
                  language === 'en' ? 'bg-white text-[#0A2263]' : 'text-blue-200 hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => onSelectLanguage('hi')}
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition cursor-pointer ${
                  language === 'hi' ? 'bg-white text-[#0A2263]' : 'text-blue-200 hover:text-white'
                }`}
              >
                हिंदी
              </button>
              <button
                onClick={() => onSelectLanguage('kn')}
                className={`px-2 py-0.5 rounded text-[11px] font-bold font-['Noto_Sans_Kannada'] transition cursor-pointer ${
                  language === 'kn' ? 'bg-white text-[#0A2263]' : 'text-blue-200 hover:text-white'
                }`}
              >
                ಕನ್ನಡ
              </button>
            </div>
          </div>
        </header>

        {/* BEGIN: MainContent Area */}
        <main className="p-5 sm:p-8 space-y-6 flex-1 text-left bg-slate-50/60">
          {/* 1. HERO SECTION: Zero Server Upload */}
          <section className="bg-gradient-to-b from-[#F0FDFB] to-[#F5FAFF] border border-cyan-100 rounded-2xl p-5 shadow-xs relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-xs">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path
                    d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="space-y-1.5 flex-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100/90 text-blue-800 text-[10px] font-bold uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                  Zero Server Upload • 100% Private
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug font-['Space_Grotesk']">
                  Understand your government notice in simple language.
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-0.5 font-['Inter']">
                  Translate complex legal words into clear steps in Hindi, Kannada, or English. 100% on-device &amp; private.
                </p>
              </div>
            </div>

            {/* Safe Documents Guarantee Ribbon */}
            <div className="mt-4 bg-blue-50/90 border border-blue-100 rounded-xl p-3 flex items-center gap-2.5">
              <svg className="w-5 h-5 text-emerald-600 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path
                  d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p className="text-xs text-slate-700 leading-tight">
                Your documents stay safely on this device. <span className="font-bold text-blue-950">No internet required for scanning or confidential review.</span>
              </p>
            </div>
          </section>

          {/* 2. PUBLIC SERVICE READER BANNER */}
          <section className="relative rounded-2xl overflow-hidden shadow-sm h-28 bg-gradient-to-r from-[#0C2250] to-[#143B80] p-5 flex flex-col justify-end text-white">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#93c5fd_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />
            <div className="absolute -right-6 -bottom-8 w-44 h-44 bg-blue-400/20 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10">
              <div className="inline-block text-[10px] font-extrabold tracking-widest text-cyan-300 uppercase mb-1">
                Public Service Reader
              </div>
              <p className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug font-['Space_Grotesk']">
                Paper letters decoded into simple action items
              </p>
            </div>
          </section>

          {/* 3. PRIMARY ACTION TILES (Scan or Upload & Talk to Assistant) */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Box 1: Scan or Upload Document */}
            <div
              onClick={onOpenScanner}
              className="bg-[#0B2568] hover:bg-[#081d52] transition-all rounded-2xl p-5 flex flex-col justify-between text-white cursor-pointer shadow-md group border border-blue-900"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path
                        d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="text-[10px] font-['Space_Mono'] font-bold bg-[#ffdad6] text-[#e63b2e] px-2 py-0.5 rounded-full uppercase">
                    EN • HI • KN
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white font-['Space_Grotesk']">
                  Scan or Upload Document
                </h3>
                <p className="text-xs text-blue-200 mt-1 font-['Inter'] leading-relaxed">
                  Scan with camera access or upload PDF/photo in Hindi, English, or Kannada.
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-blue-800/80 flex items-center justify-between text-xs font-bold font-['Space_Grotesk'] text-cyan-200">
                <span>Start Camera Scanner / Upload →</span>
                <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </div>
            </div>

            {/* Box 2: Talk to Go Vision Assistant (Voice First) */}
            <div className="bg-white hover:bg-slate-50 transition-all border border-blue-200/80 rounded-2xl p-5 flex flex-col justify-between text-slate-800 shadow-md">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="text-[10px] font-['Space_Mono'] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full uppercase">
                    Voice Primary
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 font-['Space_Grotesk']">
                  Talk to Go Vision Assistant
                </h3>
                <p className="text-xs text-slate-600 mt-1 font-['Inter'] leading-relaxed">
                  Speak naturally in Kannada, Hindi, or English. The assistant auto-detects language and explains deadlines and steps.
                </p>
              </div>

              {/* Master Push-To-Talk Mic Button Row */}
              <div className="mt-5 pt-3 border-t border-slate-200 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <button
                    onClick={onToggleVoiceListening}
                    className={`flex-1 py-2.5 px-4 rounded-xl text-white font-['Space_Grotesk'] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer shadow-sm ${
                      isListening ? 'bg-[#e63b2e] animate-pulse' : 'bg-[#0A2263] hover:bg-[#071947]'
                    }`}
                    title={isListening ? 'Click to submit voice' : 'Click to speak'}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {isListening ? 'stop' : 'mic'}
                    </span>
                    <span>{isListening ? 'Listening Live... (Tap to Send)' : 'Tap to Speak (or Hold Spacebar)'}</span>
                  </button>

                  <button
                    onClick={() => onNavigateToView('voice-agent')}
                    className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold font-['Space_Grotesk'] transition cursor-pointer"
                    title="Open full conversation terminal"
                  >
                    Open Chat
                  </button>
                </div>

                {/* Accessible text input bar */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (homeTextInput.trim() && !isProcessing) {
                      onSendMessage(homeTextInput);
                      setHomeTextInput('');
                    }
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={homeTextInput}
                    onChange={(e) => setHomeTextInput(e.target.value)}
                    placeholder="Or type questions in Kannada, Hindi, or English..."
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-['Space_Grotesk'] focus:outline-none focus:border-[#0A2263] focus:bg-white transition"
                  />
                  <button
                    type="submit"
                    disabled={!homeTextInput.trim() || isProcessing}
                    className="px-4 py-2 bg-[#0A2263] hover:bg-[#071947] disabled:opacity-40 text-white rounded-xl text-xs font-bold font-['Space_Grotesk'] uppercase tracking-wider transition cursor-pointer"
                  >
                    Send
                  </button>
                </form>
              </div>
            </div>
          </section>

          {/* Live Voice Transcript Banner if active or recently spoken */}
          {(isListening || isProcessing || recentAssistantTurn || recentUserTurn) && (
            <section className="bg-white border-2 border-[#0A2263] rounded-2xl p-4 sm:p-5 shadow-sm space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#e63b2e] animate-ping" />
                  <span className="text-xs font-bold font-['Space_Grotesk'] text-slate-900 uppercase">
                    {isListening ? 'Voice Input: Speaking...' : isProcessing ? 'Assistant Thinking...' : 'Voice Conversation Context'}
                  </span>
                </div>
                <span className="text-[10px] font-['Space_Mono'] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  ⚡ Auto-Detected: {detectedLanguage === 'kn' ? 'Kannada (ಕನ್ನಡ)' : detectedLanguage === 'hi' ? 'Hindi (हिंदी)' : 'English'}
                </span>
              </div>

              {/* Show most recent user voice/text query */}
              {recentUserTurn && (
                <div className="flex items-start gap-2.5 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="material-symbols-outlined text-[18px] text-blue-800 shrink-0 mt-0.5">
                    record_voice_over
                  </span>
                  <div className="flex-1 text-left">
                    <div className="flex items-center justify-between text-[10px] font-['Space_Mono'] text-slate-500 mb-0.5">
                      <span className="font-bold text-slate-700">YOU (VOICE/TEXT)</span>
                      <span>{recentUserTurn.timestamp}</span>
                    </div>
                    <p className="text-xs sm:text-sm font-['Space_Grotesk'] font-medium text-slate-800">
                      “{recentUserTurn.text}”
                    </p>
                    {recentUserTurn.secondaryText && (
                      <p className="text-[11px] text-slate-500 mt-0.5 italic">
                        {recentUserTurn.secondaryText}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {isListening && interimTranscript && (
                <div className="p-3 bg-blue-50 border-2 border-dashed border-[#e63b2e] rounded-xl text-left">
                  <div className="text-[10px] font-['Space_Mono'] font-bold text-[#e63b2e] uppercase mb-1">
                    Live Speech Recognition:
                  </div>
                  <p className="text-sm font-['Space_Grotesk'] text-slate-800 font-medium">
                    “{interimTranscript}...”
                  </p>
                </div>
              )}

              {isProcessing && (
                <div className="flex items-center gap-2 text-xs font-['Space_Mono'] text-slate-600 py-1">
                  <span className="w-3.5 h-3.5 border-2 border-[#0A2263] border-t-transparent rounded-full animate-spin" />
                  <span>Assistant is analyzing notice context and formulating response...</span>
                </div>
              )}

              {recentAssistantTurn && (
                <div className="space-y-3">
                  <p className="text-sm sm:text-base font-['Space_Grotesk'] font-medium text-slate-900 leading-relaxed">
                    {recentAssistantTurn.text}
                  </p>

                  {recentAssistantTurn.extractedInfo && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-['Space_Grotesk'] bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      {recentAssistantTurn.extractedInfo.deadline && (
                        <div>
                          <span className="text-[10px] text-slate-500 block uppercase">Deadline</span>
                          <strong className="text-rose-600 font-bold">{recentAssistantTurn.extractedInfo.deadline}</strong>
                        </div>
                      )}
                      {recentAssistantTurn.extractedInfo.amount && (
                        <div>
                          <span className="text-[10px] text-slate-500 block uppercase">Amount</span>
                          <strong className="text-slate-800 font-bold">{recentAssistantTurn.extractedInfo.amount}</strong>
                        </div>
                      )}
                      {recentAssistantTurn.extractedInfo.authority && (
                        <div>
                          <span className="text-[10px] text-slate-500 block uppercase">Authority</span>
                          <strong className="text-slate-800 text-[11px] truncate block">{recentAssistantTurn.extractedInfo.authority}</strong>
                        </div>
                      )}
                      {recentAssistantTurn.extractedInfo.action && (
                        <div>
                          <span className="text-[10px] text-slate-500 block uppercase">Action</span>
                          <strong className="text-slate-800 text-[11px] truncate block">{recentAssistantTurn.extractedInfo.action}</strong>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {recentAssistantTurn.actionButtons?.map((btn, bIdx) => (
                      <button
                        key={bIdx}
                        onClick={() => onActionButtonClick(btn.action)}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                          bIdx === 0 ? 'bg-[#0A2263] text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}

                    {/* Listen audio buttons */}
                    <div className="flex items-center gap-1 ml-auto bg-slate-100 px-2 py-0.5 rounded-full text-xs">
                      {speakingTurnId === recentAssistantTurn.id ? (
                        <button
                          onClick={onStopAssistantVoice}
                          className="text-[#e63b2e] font-bold flex items-center gap-1 cursor-pointer animate-pulse"
                        >
                          <span className="material-symbols-outlined text-[14px]">stop</span>
                          <span>Stop Voice</span>
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => onPlayAssistantVoice(recentAssistantTurn)}
                            className="text-[#0A2263] font-bold flex items-center gap-1 hover:underline cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[14px]">volume_up</span>
                            <span>Play ({voiceOutputLanguage.toUpperCase()})</span>
                          </button>
                          <span className="text-slate-300">•</span>
                          <button onClick={() => onPlayAssistantVoice(recentAssistantTurn, 'kn')} className="hover:text-blue-800 cursor-pointer">ಕನ್ನಡ</button>
                          <span className="text-slate-300">•</span>
                          <button onClick={() => onPlayAssistantVoice(recentAssistantTurn, 'hi')} className="hover:text-blue-800 cursor-pointer">हिंदी</button>
                          <span className="text-slate-300">•</span>
                          <button onClick={() => onPlayAssistantVoice(recentAssistantTurn, 'en')} className="hover:text-blue-800 cursor-pointer">EN</button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Quick Voice Prompt Suggestions */}
          <section className="space-y-2">
            <span className="text-xs font-bold font-['Space_Grotesk'] text-slate-500 uppercase tracking-wider block">
              Tap or Speak Common Notice Questions:
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onSendMessage('ನನ್ನ ನೋಟಿಸ್‌ಗೆ ಕೊನೆಯ ದಿನಾಂಕ ಯಾವಾಗ ಮತ್ತು ನಾನು ಏನು ಮಾಡಬೇಕು?', 'kn')}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-full text-xs font-medium text-slate-700 shadow-2xs transition cursor-pointer"
              >
                “ನನ್ನ ನೋಟಿಸ್‌ಗೆ ಕೊನೆಯ ದಿನಾಂಕ ಯಾವಾಗ?” [ಕನ್ನಡ]
              </button>
              <button
                onClick={() => onSendMessage('नोटिस का जवाब देने की अंतिम तिथि और आवश्यक कदम क्या हैं?', 'hi')}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-full text-xs font-medium text-slate-700 shadow-2xs transition cursor-pointer"
              >
                “नोटिस की अंतिम तिथि क्या है?” [हिंदी]
              </button>
              <button
                onClick={() => onSendMessage('Explain the Section 154 rectification steps in simple language', 'en')}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-full text-xs font-medium text-slate-700 shadow-2xs transition cursor-pointer"
              >
                “Explain Section 154 rectification steps” [English]
              </button>
              <button
                onClick={() => onSendMessage('Add this statutory deadline to my calendar with alarms', 'en')}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-full text-xs font-medium text-slate-700 shadow-2xs transition cursor-pointer"
              >
                “Add calendar reminder with alarms”
              </button>
            </div>
          </section>

          {/* 4. MY UPCOMING DEADLINES SECTION */}
          <section className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-slate-900 font-['Space_Grotesk']">My Upcoming Deadlines</h2>
                <span className="bg-rose-100 text-rose-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  {noticesList.length} Active Notices
                </span>
              </div>
              <button
                onClick={() => onNavigateToView('my-deadlines')}
                className="text-xs font-bold text-blue-700 hover:underline cursor-pointer"
              >
                View Full Calendar →
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {noticesList.map((notice) => (
                <article
                  key={notice.id}
                  onClick={() => onSelectNotice(notice)}
                  className={`bg-white rounded-2xl border-l-[4px] p-4 shadow-sm space-y-2.5 cursor-pointer hover:border-blue-300 transition-all border border-slate-200 ${
                    notice.urgency === 'CRITICAL' ? 'border-l-rose-500' : notice.urgency === 'WARNING' ? 'border-l-amber-500' : 'border-l-emerald-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                      notice.urgency === 'CRITICAL' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      <svg className="w-3 h-3 text-current" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                        <path d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Due: {notice.deadlineDate} ({notice.daysRemaining}d left)
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono font-medium">{notice.refNumber.replace('.pdf', '')}</span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-tight font-['Space_Grotesk']">
                      {notice.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">{notice.department}</p>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-2.5 text-xs text-slate-700 leading-relaxed border border-slate-100">
                    <span className="font-bold text-slate-900 block mb-0.5">Required Action:</span>
                    {notice.requiredAction[language] || notice.requiredAction.en}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-mono">
                      <span>{notice.amountDemanded ? `Demand: ${notice.amountDemanded}` : notice.verifiedSection}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => handleExportReminder(notice, e)}
                        className="flex items-center space-x-1 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
                        type="button"
                      >
                        <svg className="w-3 h-3 text-blue-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span>{reminderSavedMap[notice.id] ? 'Reminder Saved!' : 'Set Reminder'}</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectNotice(notice);
                          onSendMessage(`Explain the statutory details and deadline for notice: ${notice.title}`);
                        }}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold rounded-lg transition cursor-pointer"
                      >
                        Ask Voice
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* 5. HOW GO VISION PROTECTS YOU (3-STEP CITIZEN GUARANTEE) */}
          <section className="pt-3 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 font-['Space_Grotesk']">
                How Go Vision Protects You
              </h2>
              <span className="text-xs font-semibold text-slate-500">3-Step Guarantee</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-blue-200 text-blue-900 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  1
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-xs font-bold text-slate-900">No Internet Needed</h3>
                  <p className="text-[11px] text-slate-600 leading-relaxed font-['Inter']">
                    Translation and legal reading occur entirely inside your phone hardware. Your confidential records never travel over cloud servers.
                  </p>
                </div>
              </div>

              <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-blue-200 text-blue-900 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  2
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-xs font-bold text-slate-900">Explains in Plain Words</h3>
                  <p className="text-[11px] text-slate-600 leading-relaxed font-['Inter']">
                    Extracts fine print, legal threats, and statutory deadlines into conversational bullet points you can act on right away.
                  </p>
                </div>
              </div>

              <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-blue-200 text-blue-900 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  3
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-xs font-bold text-slate-900">Never Miss Penalties</h3>
                  <p className="text-[11px] text-slate-600 leading-relaxed font-['Inter']">
                    Auto-calculates response timeframes and provides audio reminders in your mother tongue before interest accrues.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* BEGIN: Fixed Bottom Navigation Bar */}
      <nav className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 px-6 py-2 flex items-center justify-around z-40 text-slate-500 shadow-lg max-w-4xl mx-auto rounded-t-2xl">
        <button
          onClick={() => onNavigateToView('voice-agent')}
          className="flex flex-col items-center group cursor-pointer"
        >
          <div className="px-4 py-1 rounded-full transition bg-blue-100 text-[#0B2568]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path
                d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="text-[10px] font-bold mt-0.5 text-[#0B2568]">
            Home
          </span>
        </button>

        <button
          onClick={onOpenScanner}
          className="flex flex-col items-center group cursor-pointer text-slate-500 hover:text-[#0B2568]"
        >
          <div className="px-4 py-1 rounded-full transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path
                d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="text-[10px] font-medium mt-0.5">
            Scan Notice
          </span>
        </button>

        <button
          onClick={() => onNavigateToView('voice-agent')}
          className="flex flex-col items-center group cursor-pointer text-slate-500 hover:text-[#0B2568]"
        >
          <div className="px-4 py-1 rounded-full transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="text-[10px] font-medium mt-0.5">
            Voice Assistant
          </span>
        </button>

        <button
          onClick={() => onNavigateToView('my-deadlines')}
          className="flex flex-col items-center group cursor-pointer text-slate-500 hover:text-[#0B2568]"
        >
          <div className="px-4 py-1 rounded-full transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="text-[10px] font-medium mt-0.5">
            Deadlines
          </span>
        </button>

        <button
          onClick={() => onNavigateToView('legal-rights')}
          className="flex flex-col items-center group cursor-pointer text-slate-500 hover:text-[#0B2568]"
        >
          <div className="px-4 py-1 rounded-full transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="text-[10px] font-medium mt-0.5">
            Remedies &amp; Rights
          </span>
        </button>
      </nav>
    </div>
  );
};
