import React, { useState, useEffect } from 'react';
import { permissionManager, DevicePermissionsState } from '../utils/permissionManager';
import { soundController } from '../utils/audioSynthesizer';
import { Language } from '../types';

interface DevicePermissionsToggleProps {
  language?: Language;
  compact?: boolean;
}

export const DevicePermissionsToggle: React.FC<DevicePermissionsToggleProps> = ({
  language = 'en',
  compact = false
}) => {
  const [permState, setPermState] = useState<DevicePermissionsState>(permissionManager.getState());
  const [isTogglingCam, setIsTogglingCam] = useState(false);
  const [isTogglingMic, setIsTogglingMic] = useState(false);

  useEffect(() => {
    const unsub = permissionManager.subscribe(setPermState);
    return () => unsub();
  }, []);

  const handleToggleCamera = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsTogglingCam(true);
    soundController.playBeep(520, 'sine', 0.1);
    await permissionManager.toggleCamera();
    setIsTogglingCam(false);
  };

  const handleToggleMicrophone = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsTogglingMic(true);
    soundController.playBeep(520, 'sine', 0.1);
    await permissionManager.toggleMicrophone();
    setIsTogglingMic(false);
  };

  const isCamOn = permState.camera === 'granted';
  const isMicOn = permState.microphone === 'granted';

  const camLabel = language === 'kn' ? 'ಕ್ಯಾಮೆರಾ' : language === 'hi' ? 'कैमरा' : 'Camera';
  const micLabel = language === 'kn' ? 'ಮೈಕ್' : language === 'hi' ? 'माइक' : 'Mic';

  if (compact) {
    return (
      <div className="flex items-center gap-1 bg-[#eee9e0] border-2 border-[#1a1a1a] p-0.5">
        {/* Camera Toggle */}
        <button
          onClick={handleToggleCamera}
          disabled={isTogglingCam}
          className={`flex items-center gap-1 px-2 py-1 text-[11px] font-['Space_Grotesk'] font-bold border transition-colors cursor-pointer ${
            isCamOn ? 'bg-emerald-500 text-white border-[#1a1a1a]' : 'bg-white text-[#4a4a4a] border-transparent hover:text-[#1a1a1a]'
          }`}
          title={isCamOn ? 'Camera permission is active (Click to revoke)' : 'Click to enable Camera access'}
        >
          <span className="material-symbols-outlined text-[14px]">photo_camera</span>
          <span>{camLabel}: {isCamOn ? 'ON' : 'OFF'}</span>
        </button>

        {/* Mic Toggle */}
        <button
          onClick={handleToggleMicrophone}
          disabled={isTogglingMic}
          className={`flex items-center gap-1 px-2 py-1 text-[11px] font-['Space_Grotesk'] font-bold border transition-colors cursor-pointer ${
            isMicOn ? 'bg-emerald-500 text-white border-[#1a1a1a]' : 'bg-white text-[#4a4a4a] border-transparent hover:text-[#1a1a1a]'
          }`}
          title={isMicOn ? 'Microphone permission is active (Click to revoke)' : 'Click to enable Microphone access'}
        >
          <span className="material-symbols-outlined text-[14px]">mic</span>
          <span>{micLabel}: {isMicOn ? 'ON' : 'OFF'}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2 bg-[#fcfbf9] border-2 border-[#1a1a1a] p-1.5 shadow-xs">
      {/* Camera Toggle */}
      <button
        onClick={handleToggleCamera}
        disabled={isTogglingCam}
        className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-['Space_Grotesk'] font-bold border-2 transition-all cursor-pointer ${
          isCamOn 
            ? 'bg-emerald-600 text-white border-[#1a1a1a] shadow-[2px_2px_0px_#1a1a1a]' 
            : 'bg-white text-[#1a1a1a] border-[#1a1a1a] hover:bg-slate-100'
        }`}
        title={isCamOn ? 'Camera permission is active' : 'Toggle camera access'}
      >
        <span className={`material-symbols-outlined text-[16px] ${isCamOn ? 'text-white' : 'text-[#0055ff]'}`}>photo_camera</span>
        <span>{camLabel}</span>
        <span className={`px-1 text-[10px] font-mono border ${isCamOn ? 'bg-white text-emerald-800 border-white' : 'bg-slate-200 text-slate-700 border-slate-400'}`}>
          {isCamOn ? 'ON' : 'OFF'}
        </span>
      </button>

      {/* Mic Toggle */}
      <button
        onClick={handleToggleMicrophone}
        disabled={isTogglingMic}
        className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-['Space_Grotesk'] font-bold border-2 transition-all cursor-pointer ${
          isMicOn 
            ? 'bg-emerald-600 text-white border-[#1a1a1a] shadow-[2px_2px_0px_#1a1a1a]' 
            : 'bg-white text-[#1a1a1a] border-[#1a1a1a] hover:bg-slate-100'
        }`}
        title={isMicOn ? 'Microphone permission is active' : 'Toggle microphone access'}
      >
        <span className={`material-symbols-outlined text-[16px] ${isMicOn ? 'text-white' : 'text-[#e63b2e]'}`}>mic</span>
        <span>{micLabel}</span>
        <span className={`px-1 text-[10px] font-mono border ${isMicOn ? 'bg-white text-emerald-800 border-white' : 'bg-slate-200 text-slate-700 border-slate-400'}`}>
          {isMicOn ? 'ON' : 'OFF'}
        </span>
      </button>
    </div>
  );
};
