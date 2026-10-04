import React, { useState } from 'react';
import { ViewMode, Language } from '../types';

interface HeaderProps {
  currentView: ViewMode;
  onSelectView: (view: ViewMode) => void;
  language: Language;
  onSelectLanguage: (lang: Language) => void;
  onOpenScanner: () => void;
  isAirplaneMode: boolean;
  onToggleAirplaneMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onSelectView,
  language,
  onSelectLanguage,
  onOpenScanner,
  isAirplaneMode,
  onToggleAirplaneMode
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#ffffff] border-b-2 border-[#1a1a1a]">
      <div className="h-20 max-w-[1280px] mx-auto px-4 md:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Brand Logo / Identity */}
        <div 
          onClick={() => onSelectView('voice-agent')}
          className="flex items-center gap-3 min-w-max cursor-pointer select-none"
        >
          <div className="w-10 h-10 bg-[#ffcc00] border-2 border-[#1a1a1a] bauhaus-shadow-sm flex items-center justify-center font-bold text-xl text-[#1a1a1a] font-['Space_Grotesk']">
            GV
          </div>
          <div className="flex flex-col">
            <span className="font-['Space_Grotesk'] text-xl text-[#1a1a1a] font-bold tracking-tight leading-none uppercase">
              Go Vision
            </span>
            <span className="font-['Space_Grotesk'] text-[11px] text-[#4a4a4a] font-bold tracking-widest uppercase mt-1">
              Offline Citizen AI
            </span>
          </div>
        </div>

        {/* Bauhaus Airplane Status Pill */}
        <button
          onClick={onToggleAirplaneMode}
          title="Click to toggle Airplane Mode simulation"
          className="hidden xl:flex items-center gap-2 px-3 py-1.5 bg-[#eee9e0] hover:bg-[#e2ddd4] border-2 border-[#1a1a1a] rounded-none bauhaus-shadow-sm transition-colors cursor-pointer"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isAirplaneMode ? 'bg-[#e63b2e]' : 'bg-emerald-500'} opacity-75`}></span>
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isAirplaneMode ? 'bg-[#e63b2e]' : 'bg-emerald-500'}`}></span>
          </span>
          <span className="font-['Space_Grotesk'] text-xs font-bold uppercase tracking-wider text-[#1a1a1a]">
            {isAirplaneMode ? 'Airplane Mode Ready • Local Gemma 4 E4B (Quantized)' : 'Online Connected • 100% Local Inference'}
          </span>
        </button>

        {/* Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1.5">
          <button
            onClick={() => onSelectView('document-scanner')}
            className={`px-3 py-1.5 font-['Space_Grotesk'] text-xs uppercase font-bold tracking-wider border-2 transition-all cursor-pointer ${
              currentView === 'document-scanner'
                ? 'bg-[#1a1a1a] text-white border-[#1a1a1a] bauhaus-shadow-sm'
                : 'text-[#1a1a1a] border-transparent hover:border-[#1a1a1a] hover:bg-[#eee9e0]'
            }`}
          >
            Scanner & Explainer
          </button>

          <button
            onClick={() => onSelectView('my-deadlines')}
            className={`relative px-3 py-1.5 font-['Space_Grotesk'] text-xs uppercase font-bold tracking-wider border-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              currentView === 'my-deadlines'
                ? 'bg-[#1a1a1a] text-white border-[#1a1a1a] bauhaus-shadow-sm'
                : 'text-[#1a1a1a] border-transparent hover:border-[#1a1a1a] hover:bg-[#eee9e0]'
            }`}
          >
            <span>Deadlines</span>
            <span className="px-1.5 py-0.2 bg-[#e63b2e] text-white font-['Space_Grotesk'] text-[10px] font-bold border border-[#1a1a1a]">
              2 urgent
            </span>
          </button>

          <button
            onClick={() => onSelectView('legal-rights')}
            className={`px-3 py-1.5 font-['Space_Grotesk'] text-xs uppercase font-bold tracking-wider border-2 transition-all cursor-pointer ${
              currentView === 'legal-rights'
                ? 'bg-[#1a1a1a] text-white border-[#1a1a1a] bauhaus-shadow-sm'
                : 'text-[#1a1a1a] border-transparent hover:border-[#1a1a1a] hover:bg-[#eee9e0]'
            }`}
          >
            Rights & Remedies
          </button>

          <button
            onClick={() => onSelectView('voice-agent')}
            className={`px-3 py-1.5 font-['Space_Grotesk'] text-xs uppercase font-bold tracking-wider border-2 transition-all cursor-pointer ${
              currentView === 'voice-agent'
                ? 'bg-[#1a1a1a] text-white border-[#1a1a1a] bauhaus-shadow-sm'
                : 'text-[#1a1a1a] border-transparent hover:border-[#1a1a1a] hover:bg-[#eee9e0]'
            }`}
          >
            Voice Agent
          </button>

          <button
            onClick={() => onSelectView('system-health')}
            className={`px-3 py-1.5 font-['Space_Grotesk'] text-xs uppercase font-bold tracking-wider border-2 transition-all cursor-pointer ${
              currentView === 'system-health'
                ? 'bg-[#1a1a1a] text-white border-[#1a1a1a] bauhaus-shadow-sm'
                : 'text-[#1a1a1a] border-transparent hover:border-[#1a1a1a] hover:bg-[#eee9e0]'
            }`}
          >
            System Health
          </button>
        </nav>

        {/* Right Header Actions */}
        <div className="flex items-center gap-2.5">
          {/* Mobile Screen Toggle */}
          <button
            onClick={() => onSelectView(currentView === 'mobile-app' ? 'voice-agent' : 'mobile-app')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#0055ff] hover:bg-[#0044cc] text-white border-2 border-[#1a1a1a] bauhaus-shadow-sm font-['Space_Grotesk'] text-xs font-bold uppercase transition-all cursor-pointer"
            title="Toggle between Bauhaus Workstation and Mobile Screen"
          >
            <span className="material-symbols-outlined text-[16px]">
              {currentView === 'mobile-app' ? 'desktop_windows' : 'smartphone'}
            </span>
            <span className="hidden sm:inline">
              {currentView === 'mobile-app' ? 'Workstation' : 'Mobile App'}
            </span>
          </button>

          {/* Language Switcher Strip */}
          <div className="hidden sm:flex items-center border-2 border-[#1a1a1a] bg-[#e8e3da] p-0.5">
            <button
              onClick={() => onSelectLanguage('en')}
              className={`px-2.5 py-1 font-['Space_Grotesk'] text-xs font-bold uppercase transition-colors cursor-pointer ${
                language === 'en'
                  ? 'bg-white text-[#1a1a1a] border border-[#1a1a1a] shadow-xs'
                  : 'text-[#4a4a4a] hover:text-[#1a1a1a]'
              }`}
            >
              English
            </button>
            <button
              onClick={() => onSelectLanguage('hi')}
              className={`px-2.5 py-1 font-['Space_Grotesk'] text-xs font-bold uppercase transition-colors cursor-pointer ${
                language === 'hi'
                  ? 'bg-white text-[#1a1a1a] border border-[#1a1a1a] shadow-xs'
                  : 'text-[#4a4a4a] hover:text-[#1a1a1a]'
              }`}
            >
              हिंदी
            </button>
            <button
              onClick={() => onSelectLanguage('kn')}
              className={`px-2.5 py-1 font-['Space_Grotesk'] text-xs font-bold uppercase transition-colors cursor-pointer ${
                language === 'kn'
                  ? 'bg-white text-[#1a1a1a] border border-[#1a1a1a] shadow-xs'
                  : 'text-[#4a4a4a] hover:text-[#1a1a1a]'
              }`}
            >
              ಕನ್ನಡ
            </button>
          </div>

          {/* Scan CTA Button */}
          <button
            onClick={onOpenScanner}
            className="flex items-center gap-1.5 bg-[#ffcc00] text-[#1a1a1a] border-2 border-[#1a1a1a] px-3.5 py-2 font-['Space_Grotesk'] font-bold text-xs uppercase tracking-wider bauhaus-shadow-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">document_scanner</span>
            <span className="hidden md:inline">Scan Notice</span>
          </button>

          {/* Profile Avatar with Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-9 h-9 border-2 border-[#1a1a1a] bg-[#0055ff] hover:bg-[#0044cc] flex items-center justify-center shrink-0 cursor-pointer transition-colors"
              aria-label="Profile Details"
            >
              <span className="material-symbols-outlined text-white text-[18px]">person</span>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white border-2 border-[#1a1a1a] bauhaus-shadow-lg p-3 z-50 text-left">
                <div className="flex items-center justify-between pb-2 border-b border-[#1a1a1a]">
                  <span className="font-['Space_Grotesk'] text-xs font-bold uppercase text-[#1a1a1a]">
                    Citizen Identity
                  </span>
                  <span className="px-1.5 py-0.2 bg-[#ffdad6] text-[#e63b2e] text-[10px] font-bold border border-[#1a1a1a]">
                    Air-Gapped
                  </span>
                </div>
                <div className="mt-2 space-y-1 text-xs font-['Space_Grotesk']">
                  <p className="text-[#4a4a4a]">Masked PAN: <strong className="text-[#1a1a1a]">ABCDE****F</strong></p>
                  <p className="text-[#4a4a4a]">Category: <strong className="text-[#1a1a1a]">Salaried Individual</strong></p>
                  <p className="text-[#4a4a4a]">Jurisdiction: <strong className="text-[#1a1a1a]">Ward 12, Bengaluru</strong></p>
                  <p className="text-[#4a4a4a]">Local SQLite: <strong className="text-emerald-700">Encrypted (AES-256)</strong></p>
                </div>
                <button
                  onClick={() => setShowProfileMenu(false)}
                  className="w-full mt-3 py-1 bg-[#1a1a1a] text-white text-xs font-bold uppercase font-['Space_Grotesk'] border border-[#1a1a1a] hover:bg-[#ffcc00] hover:text-[#1a1a1a] transition-colors"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
