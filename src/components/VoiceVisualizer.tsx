import React, { useState, useEffect, useRef } from 'react';
import { soundController } from '../utils/audioSynthesizer';

interface VoiceVisualizerProps {
  onProcessSpokenQuery: (transcribedText: string, englishText: string) => void;
  selectedLanguage: 'en' | 'hi' | 'kn';
  isRecording: boolean;
  setIsRecording: (recording: boolean) => void;
}

export const VoiceVisualizer: React.FC<VoiceVisualizerProps> = ({
  onProcessSpokenQuery,
  selectedLanguage,
  isRecording,
  setIsRecording
}) => {
  const [seconds, setSeconds] = useState(8);
  const [dbfs, setDbfs] = useState(-18.4);
  const [statusText, setStatusText] = useState('LISTENING (Kannada / English)');
  const [streamingTranscript, setStreamingTranscript] = useState('“...ಕ್ಯಾಲೆಂಡರ್ ರಿಮೈಂಡರ್ ಸೇರಿಸಿ...”');
  const timerRef = useRef<number | null>(null);

  // Update status based on language
  useEffect(() => {
    if (!isRecording) {
      if (selectedLanguage === 'kn') {
        setStatusText('LISTENING (Kannada / English)');
        setStreamingTranscript('“...ಕ್ಯಾಲೆಂಡರ್ ರಿಮೈಂಡರ್ ಸೇರಿಸಿ...”');
      } else if (selectedLanguage === 'hi') {
        setStatusText('LISTENING (Hindi / English)');
        setStreamingTranscript('“...इस नोटिस के खिलाफ अपील कैसे करें?...”');
      } else {
        setStatusText('LISTENING (English Focus)');
        setStreamingTranscript('“...When is the deadline for income tax notice?...”');
      }
    }
  }, [selectedLanguage, isRecording]);

  const startListening = () => {
    if (isRecording) return;
    setIsRecording(true);
    soundController.playBeep(520, 'sine', 0.1);
    setStatusText('CAPTURING AUDIO (16kHz PCM)...');
    
    // Simulate real decibel meter fluctuations
    timerRef.current = window.setInterval(() => {
      setSeconds(prev => {
        if (prev >= 30) {
          stopListening();
          return 30;
        }
        return prev + 1;
      });
      setDbfs(-(Math.random() * 12 + 10));
    }, 1000);
  };

  const stopListening = () => {
    if (!isRecording) return;
    setIsRecording(false);
    soundController.playBeep(380, 'sine', 0.15);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    setStatusText('PROCESSING WITH GEMMA 4 LOCALLY...');
    
    setTimeout(() => {
      setStatusText(
        selectedLanguage === 'kn'
          ? 'LISTENING (Kannada / English)'
          : selectedLanguage === 'hi'
          ? 'LISTENING (Hindi / English)'
          : 'LISTENING (English)'
      );
      
      // Emit a processed turn
      if (selectedLanguage === 'kn') {
        onProcessSpokenQuery(
          'ನನ್ನ ನೋಟಿಸ್‌ನ ದಂಡ ಮತ್ತು ಅಪೀಲ್ ಕೊನೆಯ ದಿನಾಂಕವೇನು?',
          'What is the penalty and appeal deadline for my notice?'
        );
      } else if (selectedLanguage === 'hi') {
        onProcessSpokenQuery(
          'क्या मुझे धारा 154 के तहत सुधार याचिका दायर करनी चाहिए?',
          'Should I file a rectification petition under Section 154?'
        );
      } else {
        onProcessSpokenQuery(
          'Summarize my statutory remedies and deadline for BBMP notice',
          'Summarize my statutory remedies and deadline for BBMP notice'
        );
      }
    }, 900);
  };

  // Keyboard shortcut Spacebar listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.code === 'Space' && 
        !e.repeat && 
        document.activeElement?.tagName !== 'INPUT' && 
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        startListening();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' && isRecording) {
        e.preventDefault();
        stopListening();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording, selectedLanguage]);

  // Waveform heights variation
  const waveformBars = [
    { bg: 'bg-[#ffcc00]', h: isRecording ? 'h-14' : 'h-6', delay: '0ms' },
    { bg: 'bg-[#e63b2e]', h: isRecording ? 'h-24' : 'h-12', delay: '80ms' },
    { bg: 'bg-[#0055ff]', h: isRecording ? 'h-28' : 'h-20', delay: '150ms' },
    { bg: 'bg-[#ffcc00]', h: isRecording ? 'h-28' : 'h-24', delay: '240ms' },
    { bg: 'bg-white', h: isRecording ? 'h-20' : 'h-16', delay: '70ms' },
    { bg: 'bg-[#e63b2e]', h: isRecording ? 'h-16' : 'h-8', delay: '190ms' },
    { bg: 'bg-[#ffcc00]', h: isRecording ? 'h-22' : 'h-14', delay: '110ms' },
    { bg: 'bg-[#0055ff]', h: isRecording ? 'h-28' : 'h-26', delay: '300ms' },
    { bg: 'bg-[#ffcc00]', h: isRecording ? 'h-24' : 'h-20', delay: '180ms' },
    { bg: 'bg-[#e63b2e]', h: isRecording ? 'h-18' : 'h-10', delay: '90ms' },
    { bg: 'bg-white', h: isRecording ? 'h-24' : 'h-16', delay: '220ms' },
    { bg: 'bg-[#0055ff]', h: isRecording ? 'h-28' : 'h-28', delay: '130ms' },
    { bg: 'bg-[#ffcc00]', h: isRecording ? 'h-22' : 'h-18', delay: '260ms' },
    { bg: 'bg-[#e63b2e]', h: isRecording ? 'h-16' : 'h-8', delay: '50ms' },
    { bg: 'bg-[#0055ff]', h: isRecording ? 'h-20' : 'h-14', delay: '160ms' },
    { bg: 'bg-[#ffcc00]', h: isRecording ? 'h-26' : 'h-22', delay: '280ms' },
    { bg: 'bg-white', h: isRecording ? 'h-18' : 'h-12', delay: '100ms' },
    { bg: 'bg-[#e63b2e]', h: isRecording ? 'h-12' : 'h-6', delay: '200ms' },
  ];

  return (
    <div className="relative overflow-hidden bg-[#1a1a1a] text-white border-2 border-[#1a1a1a] bauhaus-shadow-lg p-5 flex flex-col justify-between min-h-[480px]">
      {/* Geometric Corner Accents */}
      <div className="absolute top-0 right-0 w-8 h-8 bg-[#ffcc00] border-l-2 border-b-2 border-[#1a1a1a] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-6 h-6 bg-[#e63b2e] border-t-2 border-r-2 border-[#1a1a1a] pointer-events-none" />

      {/* Terminal Top State Bar */}
      <div className="relative z-10 flex items-center justify-between border-b-2 border-white/20 pb-3">
        <div className="flex items-center gap-2 bg-white/10 border border-white/30 px-2.5 py-1">
          <span className="relative flex h-2.5 w-2.5">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isRecording ? 'bg-[#e63b2e]' : 'bg-[#ffcc00]'} opacity-75`} />
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isRecording ? 'bg-[#e63b2e]' : 'bg-[#ffcc00]'}`} />
          </span>
          <span className={`font-['Space_Grotesk'] text-xs font-bold tracking-wider uppercase ${isRecording ? 'text-[#ffcc00]' : 'text-white'}`}>
            {statusText}
          </span>
        </div>
        <div className="flex items-center gap-1.5 font-['Space_Grotesk'] text-xs text-white bg-black/60 border border-white/20 px-2 py-1">
          <span className="material-symbols-outlined text-[14px] text-[#e63b2e]">radio_button_checked</span>
          <span>
            00:{seconds < 10 ? `0${seconds}` : seconds} / 00:30 Max
          </span>
        </div>
      </div>

      {/* Center Audio Waveform Spectrum Visualization */}
      <div className="relative z-10 my-auto py-6 flex flex-col items-center justify-center">
        {/* Equalizer Bars Container */}
        <div className="w-full flex items-center justify-center h-28 gap-1.5 px-2 bg-black/40 border border-white/20 py-3">
          {waveformBars.map((bar, idx) => (
            <span
              key={idx}
              className={`w-2 ${bar.bg} rounded-none border border-black transition-all duration-150 ${bar.h} ${
                isRecording ? 'animate-bounce' : 'animate-pulse'
              }`}
              style={{ animationDelay: bar.delay }}
            />
          ))}
        </div>

        {/* Live Speech Decibel / Acoustic Meter */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-white/90 font-['Space_Grotesk'] text-xs">
          <span className="flex items-center gap-1 bg-black/50 px-2 py-0.5 border border-white/20">
            <span className="material-symbols-outlined text-[14px] text-[#ffcc00]">equalizer</span>
            {dbfs.toFixed(1)} dBFS
          </span>
          <span>•</span>
          <span className="bg-black/50 px-2 py-0.5 border border-white/20">16-bit Int PCM</span>
          <span>•</span>
          <span className="text-[#ffcc00] font-bold bg-black/50 px-2 py-0.5 border border-[#ffcc00]">
            Silero Speech Detected
          </span>
        </div>

        {/* Streaming Live Transcript Preview */}
        <div className="mt-4 w-full bg-black/70 border-2 border-[#ffcc00] p-3 text-center">
          <p className="font-['Space_Grotesk'] text-base text-[#ffcc00] font-bold italic tracking-wide">
            {streamingTranscript}
          </p>
        </div>
      </div>

      {/* Bottom Action: Master Push-to-Talk Button */}
      <div className="relative z-10 flex flex-col items-center gap-2 mt-2">
        <button
          onMouseDown={startListening}
          onMouseUp={stopListening}
          onTouchStart={(e) => { e.preventDefault(); startListening(); }}
          onTouchEnd={(e) => { e.preventDefault(); stopListening(); }}
          className={`group relative w-full flex items-center justify-center gap-2 py-3.5 px-4 font-['Space_Grotesk'] text-base font-bold uppercase tracking-wider border-2 border-white bauhaus-shadow transition-all cursor-pointer select-none ${
            isRecording
              ? 'bg-[#e63b2e] text-white translate-x-[2px] translate-y-[2px] shadow-none'
              : 'bg-[#ffcc00] text-[#1a1a1a] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none'
          }`}
        >
          <span className={`material-symbols-outlined text-[24px] ${isRecording ? 'animate-pulse' : ''}`}>
            {isRecording ? 'radio_button_checked' : 'mic'}
          </span>
          <span>
            {isRecording ? 'Release to Process Voice...' : 'Hold to Speak / ಸ್ಪೀಕ್ ಮಾಡಿ'}
          </span>
        </button>

        <span className="font-['Space_Grotesk'] text-xs text-white/70">
          Keyboard Shortcut:{' '}
          <kbd className="px-2 py-0.5 bg-black/80 border border-white/40 font-['Space_Grotesk'] text-[11px] text-[#ffcc00] font-bold">
            Hold Spacebar
          </kbd>{' '}
          • Release to Process
        </span>
      </div>
    </div>
  );
};
