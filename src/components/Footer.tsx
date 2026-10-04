import React, { useState } from 'react';
import { ConversationTurn } from '../types';

interface FooterProps {
  turns: ConversationTurn[];
  onPurgeCache: () => void;
}

export const Footer: React.FC<FooterProps> = ({ turns, onPurgeCache }) => {
  const [purgeSuccess, setPurgeSuccess] = useState(false);

  const handleExportJson = () => {
    const sessionData = {
      app: 'Go Vision Offline Citizen AI',
      version: 'v4.2-local',
      runtime: 'Gemma 4 E4B Quantized ONNX',
      airgapStatus: '100% Offline (No Cloud)',
      timestamp: new Date().toISOString(),
      profile: {
        maskedPan: 'ABCDE****F',
        type: 'Salaried Individual'
      },
      turnsRecorded: turns
    };

    const blob = new Blob([JSON.stringify(sessionData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `govision_session_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePurge = () => {
    onPurgeCache();
    setPurgeSuccess(true);
    setTimeout(() => setPurgeSuccess(false), 2500);
  };

  return (
    <>
      {/* BOTTOM OPERATIONAL FOOTER / LOCAL PRIVACY TELEMETRY STRIP */}
      <div className="w-full bg-[#e8e3da] border-t-2 border-[#1a1a1a] py-4 mt-8">
        <div className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Privacy Verification Core Statement */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 border-2 border-[#1a1a1a] bg-[#1a1a1a] text-white flex items-center justify-center shrink-0 bauhaus-shadow-sm">
              <span className="material-symbols-outlined text-[24px]">security</span>
            </div>
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-2">
                <span className="font-['Space_Grotesk'] text-xs font-bold uppercase text-[#1a1a1a]">
                  Zero Cloud Audio Transmission
                </span>
                <span className="font-['Space_Grotesk'] text-[10px] bg-[#e63b2e] text-white border border-[#1a1a1a] px-1.5 py-0.2 font-bold uppercase">
                  100% AIR-GAPPED
                </span>
              </div>
              <p className="font-['Inter'] text-xs text-[#4a4a4a] leading-tight">
                Raw PCM audio resides purely in volatility RAM. Wiped immediately post-inference. No audio samples or transcripts ever touch an external server.
              </p>
            </div>
          </div>

          {/* Injected Session Profile & Data Purge Tools */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 font-['Space_Grotesk'] text-xs text-[#1a1a1a] bg-[#ffffff] border-2 border-[#1a1a1a] px-3 py-1.5 bauhaus-shadow-sm">
              <span className="text-[#4a4a4a]">Profile:</span>
              <span className="font-bold text-[#1a1a1a]">Masked PAN ABCDE****F</span>
              <span className="text-[#4a4a4a]">• Salaried</span>
            </div>

            <button
              onClick={handleExportJson}
              className="flex items-center gap-1 bg-[#ffffff] hover:bg-[#ffcc00] text-[#1a1a1a] font-['Space_Grotesk'] text-xs font-bold uppercase border-2 border-[#1a1a1a] px-3 py-1.5 bauhaus-shadow-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px] text-[#0055ff]">download</span>
              <span>Export Session (.json)</span>
            </button>

            <button
              onClick={handlePurge}
              className="flex items-center gap-1 bg-[#e63b2e] text-white hover:bg-[#1a1a1a] font-['Space_Grotesk'] text-xs font-bold uppercase border-2 border-[#1a1a1a] px-3 py-1.5 bauhaus-shadow-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">
                {purgeSuccess ? 'check' : 'delete_sweep'}
              </span>
              <span>{purgeSuccess ? 'RAM Flushed (0 KB)' : 'Purge Audio Cache'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="w-full bg-[#e8e3da] border-t-2 border-[#1a1a1a] py-8">
        <div className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col items-center md:items-start gap-1">
            <div className="flex items-center gap-2">
              <span className="font-['Space_Grotesk'] text-lg font-bold text-[#1a1a1a] uppercase">
                Go Vision
              </span>
              <span className="font-['Space_Grotesk'] text-xs text-[#1a1a1a] font-bold border border-[#1a1a1a] px-1.5 py-0.2 bg-[#ffcc00]">
                v4.2-local
              </span>
            </div>
            <p className="font-['Inter'] text-xs text-[#4a4a4a]">
              Sovereign offline legal assistant for citizen empowerment and statutory compliance.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="px-2.5 py-1 border border-[#1a1a1a] bg-[#ffffff] font-['Space_Grotesk'] text-xs text-[#1a1a1a] font-bold uppercase">
              Gemma 4 E4B
            </span>
            <span className="px-2.5 py-1 border border-[#1a1a1a] bg-[#ffffff] font-['Space_Grotesk'] text-xs text-[#1a1a1a] font-bold uppercase">
              Apache 2.0
            </span>
            <span className="px-2.5 py-1 border border-[#1a1a1a] bg-[#e63b2e] text-white font-['Space_Grotesk'] text-xs font-bold uppercase">
              Zero Cloud Telemetry
            </span>
            <span className="px-2.5 py-1 border border-[#1a1a1a] bg-[#ffffff] font-['Space_Grotesk'] text-xs text-[#1a1a1a] font-bold uppercase">
              100% Local SQLite
            </span>
          </div>
        </div>
      </footer>
    </>
  );
};
