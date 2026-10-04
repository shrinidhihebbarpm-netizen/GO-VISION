import React, { useState } from 'react';
import { ConversationTurn } from '../types';
import { downloadIcsFile } from '../utils/icsGenerator';
import { soundController } from '../utils/audioSynthesizer';

interface SessionTranscriptProps {
  turns: ConversationTurn[];
  onResetSession: () => void;
  onOpenRectificationModal: () => void;
  onOpenDraftModal: () => void;
  activeNoticeId: string;
}

export const SessionTranscript: React.FC<SessionTranscriptProps> = ({
  turns,
  onResetSession,
  onOpenRectificationModal,
  onOpenDraftModal,
  activeNoticeId
}) => {
  const [isPlayingTurn1User, setIsPlayingTurn1User] = useState(false);
  const [isPlayingAssistantAudio, setIsPlayingAssistantAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(40);

  const handlePlayUserAudio = () => {
    if (isPlayingTurn1User) {
      soundController.stopSpeaking();
      setIsPlayingTurn1User(false);
      return;
    }
    setIsPlayingTurn1User(true);
    soundController.playBeep(440, 'sine', 0.2);
    soundController.speakText(
      'When is the deadline for my income tax notice and what should I do?',
      'en',
      () => setIsPlayingTurn1User(false)
    );
  };

  const handlePlayAssistantAudio = (text: string) => {
    if (isPlayingAssistantAudio) {
      soundController.stopSpeaking();
      setIsPlayingAssistantAudio(false);
      return;
    }
    setIsPlayingAssistantAudio(true);
    soundController.playBeep(580, 'sine', 0.15);
    setAudioProgress(10);
    const interval = setInterval(() => {
      setAudioProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 20;
      });
    }, 800);

    soundController.speakText(
      'The statutory deadline to respond to your Section 143(1) intimation is March 24, 2025. 4 days remaining.',
      'en',
      () => {
        clearInterval(interval);
        setIsPlayingAssistantAudio(false);
        setAudioProgress(100);
      }
    );
  };

  const handleExportIcs = () => {
    downloadIcsFile({
      title: 'Respond to Tax Notice Sec 143(1)',
      description: 'Deadline to submit online rectification under Section 154 or pay demand. Coercive penalty applies post-deadline.',
      dueDate: '2025-03-24',
      noticeRef: 'IT-NOTICE-143-1-DEMAND.pdf',
      filename: 'notice_demand_143_1.ics'
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Conversation Container Header */}
      <div className="bg-[#ffffff] border-2 border-[#1a1a1a] bauhaus-shadow p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 bg-[#ffcc00] border-2 border-[#1a1a1a] flex items-center justify-center">
            <span className="w-2 h-2 bg-[#e63b2e]" />
          </div>
          <div className="flex flex-col">
            <h2 className="font-['Space_Grotesk'] text-base text-[#1a1a1a] font-bold uppercase leading-tight">
              Session Transcript &amp; Local Tool Calls
            </h2>
            <span className="font-['Space_Grotesk'] text-xs text-[#4a4a4a]">
              Document in Context: <strong className="text-[#1a1a1a] font-bold uppercase">IT-NOTICE-143-1-DEMAND.PDF (SCANNED)</strong>
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-['Space_Grotesk'] text-xs text-[#1a1a1a] font-bold bg-[#ffcc00] border border-[#1a1a1a] px-2 py-0.5">
            {turns.length} Turns Recorded
          </span>
          <button
            onClick={onResetSession}
            className="p-1 border border-[#1a1a1a] bg-[#ffffff] hover:bg-[#ffcc00] text-[#1a1a1a] flex items-center justify-center transition-colors cursor-pointer"
            title="Reset Conversation"
          >
            <span className="material-symbols-outlined text-[18px]">restart_alt</span>
          </button>
        </div>
      </div>

      {/* CONVERSATION FEED */}
      <div className="flex flex-col gap-6">
        {/* Render Each Turn */}
        {turns.map((turn, index) => (
          <React.Fragment key={turn.id || index}>
            {/* User Voice Bubble */}
            {turn.type === 'user' && (
              <div className="flex flex-col items-end gap-1.5 ml-4 md:ml-10">
                <div className="bg-[#1a1a1a] text-white border-2 border-[#1a1a1a] bauhaus-shadow p-4 w-full">
                  {/* Audio Player Ribbon */}
                  <div className="flex items-center justify-between pb-2 border-b border-white/20">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[18px] text-[#ffcc00]">mic</span>
                      <span className="font-['Space_Grotesk'] text-xs font-bold uppercase tracking-wider text-[#ffcc00]">
                        Citizen Voice Input {index > 0 ? `(Turn ${index + 1})` : ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-white/80 font-['Space_Grotesk'] text-xs">
                      <span>Duration: {turn.duration || '3.8s'}</span>
                      <span>•</span>
                      <span>{turn.timestamp}</span>
                    </div>
                  </div>

                  {/* Audio Playback Pill */}
                  <div className="flex items-center gap-3 bg-white/10 border border-white/20 p-2 my-2.5">
                    <button
                      onClick={handlePlayUserAudio}
                      className="w-7 h-7 bg-[#ffcc00] text-[#1a1a1a] border border-[#1a1a1a] flex items-center justify-center hover:bg-white transition-colors shrink-0 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {isPlayingTurn1User ? 'pause' : 'play_arrow'}
                      </span>
                    </button>
                    {/* Static micro waveform preview */}
                    <div className="flex items-center gap-1 flex-1 h-4">
                      {[2, 3, 4, 2, 4, 3, 1, 3, 4, 2, 3, 1, 3, 2, 4, 2].map((height, i) => (
                        <span
                          key={i}
                          className={`w-1 bg-[#ffcc00] h-${height} ${isPlayingTurn1User ? 'animate-pulse' : ''}`}
                          style={{ height: `${height * 3}px` }}
                        />
                      ))}
                    </div>
                    <span className="font-['Space_Grotesk'] text-xs text-[#ffcc00] font-bold">
                      {isPlayingTurn1User ? 'Playing...' : '0:00 / 0:03.8'}
                    </span>
                  </div>

                  {/* Transcribed Indic Text */}
                  <p className="font-['Space_Grotesk'] text-base font-bold text-white pt-1">
                    {turn.textIndic}
                  </p>

                  {/* Real-time Parallel English Transcript Badge */}
                  {turn.textEnglish && (
                    <div className="mt-2 pt-2 border-t border-white/20 flex items-center gap-2 text-white/90 font-['Inter'] text-xs">
                      <span className="material-symbols-outlined text-[16px] text-[#ffcc00]">translate</span>
                      <span>
                        <strong className="font-['Space_Grotesk'] uppercase text-[#ffcc00]">[Transcribed EN]:</strong>{' '}
                        {turn.textEnglish}
                      </span>
                    </div>
                  )}
                </div>
                <span className="font-['Space_Grotesk'] text-xs text-[#4a4a4a] font-bold pr-1">
                  Audio buffered &amp; processed locally via Whisper.tflite
                </span>
              </div>
            )}

            {/* Function Call Invocation (if present) */}
            {turn.functionCall && (
              <div className="flex flex-col gap-1 mr-4 md:mr-10">
                <div className="bg-[#eee9e0] border-2 border-[#1a1a1a] bauhaus-shadow-sm p-3 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-[#1a1a1a]">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[20px] text-[#0055ff]">memory</span>
                      <span className="font-['Space_Grotesk'] text-xs font-bold uppercase">
                        Gemma 4 Local Function Call Invocation
                      </span>
                      <span className="px-2 py-0.5 border border-[#1a1a1a] bg-[#ffcc00] font-['Space_Grotesk'] text-xs text-[#1a1a1a] font-bold">
                        Latency: {turn.functionCall.latencyMs}ms
                      </span>
                    </div>
                    <span className="font-['Space_Grotesk'] text-xs text-[#e63b2e] font-bold uppercase flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">check_circle</span>
                      Executed
                    </span>
                  </div>
                  {/* Function Call Code Box */}
                  <div className="bg-[#1a1a1a] text-white border-2 border-[#1a1a1a] p-3 font-['Space_Grotesk'] text-xs flex flex-col gap-1 overflow-x-auto">
                    <div>
                      <span className="text-[#ffcc00] font-bold">CALL →</span>{' '}
                      <span className="text-[#d6e3ff] font-semibold">{turn.functionCall.name}</span>
                      (notice_id=<span className="text-[#ffcc00]">"{turn.functionCall.args.notice_id}"</span>, jurisdiction=<span className="text-[#ffcc00]">"{turn.functionCall.args.jurisdiction}"</span>)
                    </div>
                    <div className="text-white/80 pl-4 border-l border-white/30 mt-1">
                      <span className="text-white/50">⌊ Returns:</span> {JSON.stringify(turn.functionCall.returnValue)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Assistant Spoken & Written Multilingual Response */}
            {turn.assistantResponse && (
              <div className="flex flex-col gap-1 mr-4 md:mr-10">
                <div className="bg-[#ffffff] border-2 border-[#1a1a1a] bauhaus-shadow-lg p-5 flex flex-col gap-4">
                  {/* Header Banner */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b-2 border-[#1a1a1a] gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 bg-[#ffcc00] border-2 border-[#1a1a1a] flex items-center justify-center font-['Space_Grotesk'] font-bold text-xs text-[#1a1a1a]">
                        GV
                      </div>
                      <span className="font-['Space_Grotesk'] text-base text-[#1a1a1a] font-bold uppercase">
                        Go Vision Assistant
                      </span>
                      <span className="font-['Space_Grotesk'] text-xs bg-[#1a1a1a] text-white font-bold px-2 py-0.5 border border-[#1a1a1a] uppercase">
                        Gemma 4 E4B Offline
                      </span>
                    </div>
                    {/* Spoken Audio Badge */}
                    <div className="flex items-center gap-2 text-[#4a4a4a] font-['Space_Grotesk'] text-xs bg-[#eee9e0] border border-[#1a1a1a] px-2.5 py-1">
                      <span className="material-symbols-outlined text-[16px] text-[#0055ff]">record_voice_over</span>
                      <span>Indic-Parler-TTS (Kannada Voice • {turn.assistantResponse.audioDuration})</span>
                    </div>
                  </div>

                  {/* Native Audio Waveform Player Bar */}
                  <div className="flex items-center gap-3 bg-[#eee9e0] border-2 border-[#1a1a1a] p-3">
                    <button
                      onClick={() => handlePlayAssistantAudio(turn.assistantResponse!.english)}
                      className="w-8 h-8 bg-[#1a1a1a] text-white border-2 border-[#1a1a1a] flex items-center justify-center hover:bg-[#e63b2e] transition-colors shrink-0 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {isPlayingAssistantAudio ? 'pause' : 'play_arrow'}
                      </span>
                    </button>
                    <div className="flex-1 flex flex-col gap-1.5">
                      <div className="flex items-center justify-between font-['Space_Grotesk'] text-xs text-[#1a1a1a] font-bold">
                        <span className="uppercase">
                          {isPlayingAssistantAudio ? 'Spoken Explanation Audio Streaming...' : 'Generated Spoken Explanation'}
                        </span>
                        <span>{turn.assistantResponse.audioDuration} (WAV 22kHz PCM)</span>
                      </div>
                      <div className="w-full bg-[#e2ddd4] border border-[#1a1a1a] h-2 overflow-hidden">
                        <div
                          className="bg-[#1a1a1a] h-full transition-all duration-300"
                          style={{ width: `${audioProgress}%` }}
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => handlePlayAssistantAudio(turn.assistantResponse!.english)}
                      className="border border-[#1a1a1a] bg-[#ffffff] text-[#1a1a1a] hover:bg-[#ffcc00] p-1 transition-colors cursor-pointer"
                      title="Replay Audio"
                    >
                      <span className="material-symbols-outlined text-[18px]">replay</span>
                    </button>
                  </div>

                  {/* Multilingual Extracted Statutory Information */}
                  <div className="flex flex-col gap-3">
                    {/* Kannada Primary Response */}
                    <div className="p-3 bg-[#faf7f2] border-2 border-[#1a1a1a]">
                      <span className="font-['Space_Grotesk'] text-xs font-bold text-[#1a1a1a] uppercase block mb-1">
                        ಕನ್ನಡ ವಿವರಣೆ (Kannada Explanation):
                      </span>
                      <p className="font-['Space_Grotesk'] text-base text-[#1a1a1a] font-semibold leading-relaxed">
                        “ನಿಮ್ಮ ಆದಾಯ ತೆರಿಗೆ ಸೆಕ್ಷನ್ 143(1) ನೋಟಿಸ್‌ಗೆ ಉತ್ತರಿಸಲು ಕೊನೆಯ ದಿನಾಂಕ{' '}
                        <strong className="bg-[#e63b2e] text-white px-1.5 py-0.5 border border-[#1a1a1a] font-bold">
                          ಮಾರ್ಚ್ 24, 2025
                        </strong>{' '}
                        (ಇನ್ನು{' '}
                        <strong className="bg-[#ffcc00] text-[#1a1a1a] px-1.5 py-0.5 border border-[#1a1a1a] font-bold">
                          4 ದಿನಗಳು
                        </strong>{' '}
                        ಮಾತ್ರ ಬಾಕಿ ಉಳಿದಿದೆ). ನಿಮ್ಮ ಪರವಾಗಿ ಕ್ಯಾಲೆಂಡರ್ ರಿಮೈಂಡರ್ (.ics) ರಚಿಸಬೇಕೆ ಅಥವಾ ಸೆಕ್ಷನ್ 154 ಅಡಿಯಲ್ಲಿ ತಿದ್ದುಪಡಿ ಪ್ರಕ್ರಿಯೆಯನ್ನು ತಿಳಿಸಬೇಕೆ?”
                      </p>
                    </div>

                    {/* English Parallel Translation Card */}
                    <div className="p-3 bg-[#eee9e0] border-2 border-[#1a1a1a]">
                      <span className="font-['Space_Grotesk'] text-xs font-bold text-[#4a4a4a] uppercase block mb-1">
                        English Statutory Meaning:
                      </span>
                      <p className="font-['Inter'] text-sm text-[#1a1a1a] leading-normal">
                        “The statutory deadline to respond to your Section 143(1) Intimation is{' '}
                        <strong className="bg-[#e63b2e] text-white px-1 font-bold">
                          March 24, 2025 (4 days remaining)
                        </strong>. Would you like me to generate a calendar reminder (.ics file) or guide you through a Rectification petition under Section 154?”
                      </p>
                    </div>
                  </div>

                  {/* Quick Action Statutory Remedies Buttons */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      onClick={handleExportIcs}
                      className="flex items-center gap-1.5 bg-[#1a1a1a] text-white hover:bg-[#e63b2e] border-2 border-[#1a1a1a] px-3 py-1.5 font-['Space_Grotesk'] text-xs font-bold uppercase bauhaus-shadow-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">calendar_add_on</span>
                      <span>Export .ics Reminder</span>
                    </button>

                    <button
                      onClick={onOpenRectificationModal}
                      className="flex items-center gap-1.5 bg-[#eee9e0] hover:bg-[#ffcc00] text-[#1a1a1a] border-2 border-[#1a1a1a] px-3 py-1.5 font-['Space_Grotesk'] text-xs font-bold uppercase bauhaus-shadow-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">gavel</span>
                      <span>Explain Rectification Steps (Sec 154)</span>
                    </button>

                    <button
                      onClick={onOpenDraftModal}
                      className="flex items-center gap-1.5 bg-[#eee9e0] hover:bg-[#ffcc00] text-[#1a1a1a] border-2 border-[#1a1a1a] px-3 py-1.5 font-['Space_Grotesk'] text-xs font-bold uppercase bauhaus-shadow-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">help_outline</span>
                      <span>Draft Formal Response</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Action Completed Offline Result */}
            {turn.actionCompleted && (
              <div className="flex flex-col gap-1 mr-4 md:mr-10">
                <div className="bg-[#ffffff] border-2 border-[#1a1a1a] bauhaus-shadow-lg p-5 flex flex-col gap-3">
                  <div className="flex items-center justify-between border-b-2 border-[#1a1a1a] pb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 bg-[#ffcc00] border-2 border-[#1a1a1a] flex items-center justify-center font-['Space_Grotesk'] font-bold text-xs text-[#1a1a1a]">
                        GV
                      </div>
                      <span className="font-['Space_Grotesk'] text-base text-[#1a1a1a] font-bold uppercase">
                        Action Completed Offline
                      </span>
                    </div>
                    <span className="font-['Space_Grotesk'] text-xs text-white bg-[#1a1a1a] px-2.5 py-0.5 border border-[#1a1a1a] font-bold uppercase flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">check</span>
                      Success
                    </span>
                  </div>

                  {/* Code execution summary */}
                  <div className="bg-[#1a1a1a] text-white border-2 border-[#1a1a1a] p-3 font-['Space_Grotesk'] text-xs">
                    <div>
                      <span className="text-[#ffcc00] font-bold">FUNCTION:</span>{' '}
                      <span className="text-[#d6e3ff] font-semibold">{turn.actionCompleted.functionName}</span>(
                      {turn.actionCompleted.details})
                    </div>
                  </div>

                  {/* Calendar Event File Pill */}
                  <div className="p-3 bg-[#eee9e0] border-2 border-[#1a1a1a] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 bg-[#ffcc00] border-2 border-[#1a1a1a] flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[24px] text-[#1a1a1a]">event_available</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-['Space_Grotesk'] text-sm font-bold text-[#1a1a1a] uppercase">
                          {turn.actionCompleted.fileName || 'notice_demand_143_1.ics'} Generated
                        </span>
                        <span className="font-['Space_Grotesk'] text-xs text-[#4a4a4a]">
                          {turn.actionCompleted.alarmText || 'Alarm set for March 17, March 23 & March 24, 2025 (9:00 AM IST)'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <button
                        onClick={handleExportIcs}
                        className="px-3 py-1.5 bg-[#1a1a1a] hover:bg-[#e63b2e] text-white font-['Space_Grotesk'] text-xs font-bold uppercase border-2 border-[#1a1a1a] bauhaus-shadow-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer"
                      >
                        Open in Device Calendar
                      </button>
                    </div>
                  </div>

                  {/* Spoken Confirmation Feedback */}
                  {turn.actionCompleted.spokenConfirmation && (
                    <p className="font-['Inter'] text-xs text-[#4a4a4a] italic">
                      Spoken aloud: “{turn.actionCompleted.spokenConfirmation}”
                    </p>
                  )}
                </div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
