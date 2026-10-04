import React from 'react';
import { Language } from '../types';

interface AudioControlsProps {
  selectedLanguage: Language;
  onSelectLanguage: (lang: Language) => void;
  sileroVadEnabled: boolean;
  onToggleSileroVad: () => void;
}

export const AudioControls: React.FC<AudioControlsProps> = ({
  selectedLanguage,
  onSelectLanguage,
  sileroVadEnabled,
  onToggleSileroVad
}) => {
  return (
    <div className="bg-[#ffffff] border-2 border-[#1a1a1a] bauhaus-shadow p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between border-b-2 border-[#1a1a1a] pb-2">
        <span className="font-['Space_Grotesk'] text-sm font-bold uppercase text-[#1a1a1a]">
          Audio &amp; Recognition Controls
        </span>
        <span className="font-['Space_Grotesk'] text-xs text-white font-bold bg-[#1a1a1a] px-2 py-0.5 border border-[#1a1a1a] uppercase">
          Engine Ready
        </span>
      </div>

      {/* Recognition Language Selector Chips */}
      <div className="flex flex-col gap-1.5">
        <label className="font-['Space_Grotesk'] text-xs text-[#4a4a4a] font-bold uppercase">
          Spoken Language Auto-Detect Focus
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => onSelectLanguage('kn')}
            className={`flex items-center justify-center gap-1 py-1.5 px-2 border-2 border-[#1a1a1a] font-['Space_Grotesk'] text-xs font-bold uppercase transition-all cursor-pointer ${
              selectedLanguage === 'kn'
                ? 'bg-[#1a1a1a] text-white bauhaus-shadow-sm'
                : 'bg-[#eee9e0] text-[#1a1a1a] hover:bg-[#ffcc00]'
            }`}
          >
            <span>ಕನ್ನಡ</span>
            {selectedLanguage === 'kn' && (
              <span className="material-symbols-outlined text-[14px]">check_circle</span>
            )}
          </button>

          <button
            onClick={() => onSelectLanguage('hi')}
            className={`flex items-center justify-center gap-1 py-1.5 px-2 border-2 border-[#1a1a1a] font-['Space_Grotesk'] text-xs font-bold uppercase transition-all cursor-pointer ${
              selectedLanguage === 'hi'
                ? 'bg-[#1a1a1a] text-white bauhaus-shadow-sm'
                : 'bg-[#eee9e0] text-[#1a1a1a] hover:bg-[#ffcc00]'
            }`}
          >
            <span>हिंदी</span>
            {selectedLanguage === 'hi' && (
              <span className="material-symbols-outlined text-[14px]">check_circle</span>
            )}
          </button>

          <button
            onClick={() => onSelectLanguage('en')}
            className={`flex items-center justify-center gap-1 py-1.5 px-2 border-2 border-[#1a1a1a] font-['Space_Grotesk'] text-xs font-bold uppercase transition-all cursor-pointer ${
              selectedLanguage === 'en'
                ? 'bg-[#1a1a1a] text-white bauhaus-shadow-sm'
                : 'bg-[#eee9e0] text-[#1a1a1a] hover:bg-[#ffcc00]'
            }`}
          >
            <span>English</span>
            {selectedLanguage === 'en' && (
              <span className="material-symbols-outlined text-[14px]">check_circle</span>
            )}
          </button>
        </div>
      </div>

      {/* Silence Auto-Stop (VAD) Toggle */}
      <div className="flex items-center justify-between pt-2 mt-1 bg-[#eee9e0] border-2 border-[#1a1a1a] p-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-[#0055ff]">graphic_eq</span>
          <div className="flex flex-col">
            <span className="font-['Space_Grotesk'] text-xs font-bold uppercase text-[#1a1a1a]">
              Silence Auto-Stop (Silero VAD)
            </span>
            <span className="font-['Inter'] text-xs text-[#4a4a4a]">
              Submits query automatically after 1.2s silence
            </span>
          </div>
        </div>

        <button
          onClick={onToggleSileroVad}
          className="relative inline-flex items-center cursor-pointer select-none"
          role="switch"
          aria-checked={sileroVadEnabled}
        >
          <div
            className={`w-11 h-6 border-2 border-[#1a1a1a] transition-colors relative ${
              sileroVadEnabled ? 'bg-[#ffcc00]' : 'bg-[#e2ddd4]'
            }`}
          >
            <div
              className={`w-4 h-4 bg-white border-2 border-[#1a1a1a] absolute top-[2px] transition-transform ${
                sileroVadEnabled ? 'left-[22px]' : 'left-[2px]'
              }`}
            />
          </div>
        </button>
      </div>
    </div>
  );
};
