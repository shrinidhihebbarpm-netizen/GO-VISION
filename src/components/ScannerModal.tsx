import React, { useState } from 'react';
import { StatutoryNotice, Language } from '../types';
import { MOCK_NOTICES } from '../data/mockNotices';
import { downloadIcsFile } from '../utils/icsGenerator';

interface ScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onSelectForVoiceSession: (notice: StatutoryNotice) => void;
}

export const ScannerModal: React.FC<ScannerModalProps> = ({
  isOpen,
  onClose,
  language,
  onSelectForVoiceSession
}) => {
  const [selectedNotice, setSelectedNotice] = useState<StatutoryNotice>(MOCK_NOTICES[0]);
  const [isScanning, setIsScanning] = useState(false);
  const [activeTab, setActiveTab] = useState<'sample' | 'upload'>('sample');

  if (!isOpen) return null;

  const handleSimulateScan = (notice: StatutoryNotice) => {
    setSelectedNotice(notice);
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
    }, 1200);
  };

  const handleExportIcs = () => {
    downloadIcsFile({
      title: selectedNotice.title,
      description: selectedNotice.requiredAction[language] || selectedNotice.requiredAction.en,
      dueDate: selectedNotice.deadlineDate,
      noticeRef: selectedNotice.refNumber,
      filename: `${selectedNotice.id.toLowerCase()}_deadline.ics`
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-[#f5f0e8] border-3 border-[#1a1a1a] bauhaus-shadow-lg w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden text-left">
        {/* Modal Top Bar */}
        <div className="bg-[#1a1a1a] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-[#ffcc00] border-2 border-[#1a1a1a] flex items-center justify-center text-[#1a1a1a] font-['Space_Grotesk'] font-bold text-xs">
              GV
            </div>
            <div>
              <h2 className="font-['Space_Grotesk'] text-base font-bold uppercase tracking-tight">
                Document Scanner &amp; Plain Legal Explainer
              </h2>
              <span className="font-['Space_Grotesk'] text-xs text-[#ffcc00] uppercase font-bold">
                Local On-Device OCR • 0 Bytes Sent to Cloud
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-white/10 hover:bg-[#e63b2e] border border-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-6">
          {/* Preset Notice Switcher */}
          <div className="flex flex-col gap-2">
            <span className="font-['Space_Grotesk'] text-xs font-bold uppercase text-[#4a4a4a]">
              Select Citizen Notice or Document to Analyze:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {MOCK_NOTICES.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleSimulateScan(n)}
                  className={`p-2.5 text-left border-2 font-['Space_Grotesk'] text-xs transition-all cursor-pointer flex flex-col justify-between ${
                    selectedNotice.id === n.id
                      ? 'border-[#1a1a1a] bg-[#ffcc00] text-[#1a1a1a] bauhaus-shadow-sm font-bold'
                      : 'border-[#1a1a1a] bg-[#ffffff] text-[#1a1a1a] hover:bg-[#eee9e0]'
                  }`}
                >
                  <span className="uppercase text-[11px] font-bold line-clamp-1">{n.title}</span>
                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-[#1a1a1a]/20">
                    <span className="text-[10px] text-[#4a4a4a]">{n.refNumber}</span>
                    <span
                      className={`text-[9px] px-1 py-0.2 border border-[#1a1a1a] font-bold uppercase ${
                        n.urgency === 'CRITICAL' ? 'bg-[#e63b2e] text-white' : 'bg-[#d6e3ff] text-[#1a1a1a]'
                      }`}
                    >
                      {n.daysRemaining}d left
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Scanner Viewport & OCR Simulation */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Visual Document Scan Card (5 Cols) */}
            <div className="md:col-span-5 bg-[#ffffff] border-2 border-[#1a1a1a] bauhaus-shadow p-4 relative overflow-hidden flex flex-col items-center">
              <div className="w-full flex items-center justify-between pb-2 border-b-2 border-[#1a1a1a] mb-3">
                <span className="font-['Space_Grotesk'] text-xs font-bold uppercase text-[#1a1a1a]">
                  Physical Notice Preview
                </span>
                <span className="font-['Space_Grotesk'] text-[10px] bg-[#1a1a1a] text-white px-2 py-0.5 uppercase">
                  {selectedNotice.refNumber}
                </span>
              </div>

              {/* Document Simulator Container */}
              <div className="w-full bg-[#faf7f2] border-2 border-dashed border-[#1a1a1a] p-4 relative min-h-[260px] flex flex-col justify-between text-xs font-['Space_Grotesk']">
                {/* Laser scan animation when processing */}
                {isScanning && (
                  <div className="absolute inset-x-0 h-1 bg-[#e63b2e] shadow-[0_0_8px_#e63b2e] top-0 animate-bounce z-20" />
                )}

                <div className="space-y-2 opacity-90">
                  <div className="flex justify-between items-start border-b border-black/20 pb-1">
                    <span className="font-bold uppercase text-[#1a1a1a]">{selectedNotice.department}</span>
                    <span className="text-[10px] text-[#4a4a4a]">DATE: {selectedNotice.issueDate}</span>
                  </div>
                  <p className="font-bold text-[13px] text-[#1a1a1a] uppercase leading-tight pt-1">
                    {selectedNotice.title}
                  </p>
                  <p className="text-[11px] text-[#4a4a4a] leading-relaxed">
                    Notice under section {selectedNotice.verifiedSection}. Assessment of difference payable: {selectedNotice.amountDemanded || 'Mandatory compliance'}.
                  </p>
                  <div className="p-2 bg-[#ffdad6] border border-[#e63b2e] text-[#e63b2e] font-bold text-[10px] uppercase">
                    WARNING: Response required before {selectedNotice.deadlineDate} to prevent statutory penalties.
                  </div>
                </div>

                <div className="pt-2 border-t border-black/20 flex justify-between items-center text-[10px] text-[#4a4a4a]">
                  <span>Local ONNX Model: Active</span>
                  <span className="text-[#0055ff] font-bold">100% On-Device</span>
                </div>
              </div>

              <div className="w-full flex items-center justify-between gap-2 mt-3">
                <button
                  onClick={() => handleSimulateScan(selectedNotice)}
                  className="flex-1 py-1.5 bg-[#eee9e0] hover:bg-[#ffcc00] border-2 border-[#1a1a1a] font-['Space_Grotesk'] text-xs font-bold uppercase transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">qr_code_scanner</span>
                  <span>Re-Scan OCR</span>
                </button>
                <button
                  onClick={() => {
                    onSelectForVoiceSession(selectedNotice);
                    onClose();
                  }}
                  className="flex-1 py-1.5 bg-[#1a1a1a] hover:bg-[#e63b2e] text-white border-2 border-[#1a1a1a] font-['Space_Grotesk'] text-xs font-bold uppercase transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">record_voice_over</span>
                  <span>Ask by Voice</span>
                </button>
              </div>
            </div>

            {/* Extracted Statutory Information & Meaning (7 Cols) */}
            <div className="md:col-span-7 flex flex-col gap-4">
              {/* Highlight Strip */}
              <div className="bg-[#ffffff] border-2 border-[#1a1a1a] bauhaus-shadow p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between border-b-2 border-[#1a1a1a] pb-2">
                  <span className="font-['Space_Grotesk'] text-sm font-bold uppercase text-[#1a1a1a]">
                    Statutory Fine Print Decoded
                  </span>
                  <span
                    className={`font-['Space_Grotesk'] text-xs px-2 py-0.5 border border-[#1a1a1a] font-bold uppercase ${
                      selectedNotice.urgency === 'CRITICAL'
                        ? 'bg-[#e63b2e] text-white'
                        : 'bg-[#ffcc00] text-[#1a1a1a]'
                    }`}
                  >
                    Due in {selectedNotice.daysRemaining} Days
                  </span>
                </div>

                {/* Multilingual Plain Words Summary */}
                <div className="p-3 bg-[#faf7f2] border-2 border-[#1a1a1a]">
                  <span className="font-['Space_Grotesk'] text-xs font-bold uppercase text-[#0055ff] block mb-1">
                    Plain Language Explanation:
                  </span>
                  <p className="font-['Space_Grotesk'] text-sm font-semibold text-[#1a1a1a] leading-relaxed">
                    {selectedNotice.plainSummary[language] || selectedNotice.plainSummary.en}
                  </p>
                </div>

                {/* Layman's Terms Plain Words Summary */}
                <div className="p-3 bg-[#fff8e7] border-2 border-[#1a1a1a]">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="material-symbols-outlined text-[16px] text-[#e63b2e]">lightbulb</span>
                    <span className="font-['Space_Grotesk'] text-xs font-bold uppercase text-[#1a1a1a]">
                      Layman's Terms (Plain Everyday Words):
                    </span>
                  </div>
                  <p className="font-['Inter'] text-xs font-medium text-[#1a1a1a] leading-relaxed">
                    {selectedNotice.laymanSummary ? (selectedNotice.laymanSummary[language] || selectedNotice.laymanSummary.en) : selectedNotice.plainSummary.en}
                  </p>
                </div>

                {/* Understanding Checklist */}
                {selectedNotice.understandingQuestions && (
                  <div className="p-3 bg-white border-2 border-[#1a1a1a] space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-[#0055ff]">fact_check</span>
                      <span className="font-['Space_Grotesk'] text-xs font-bold uppercase text-[#0055ff]">
                        Check Your Understanding (Points Verified):
                      </span>
                    </div>
                    <div className="space-y-1">
                      {selectedNotice.understandingQuestions.map((uq, idx) => (
                        <div key={idx} className="p-2 bg-[#faf7f2] border border-[#1a1a1a]/20 text-xs">
                          <span className="font-bold font-['Space_Grotesk'] text-[#1a1a1a] block">
                            {idx + 1}. {uq.question}
                          </span>
                          <span className="text-[11px] text-[#4a4a4a] font-['Inter'] mt-0.5 block">
                            ✓ {uq.explanation}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Required Action */}
                <div className="p-3 bg-[#eee9e0] border-2 border-[#1a1a1a]">
                  <span className="font-['Space_Grotesk'] text-xs font-bold uppercase text-[#e63b2e] block mb-1">
                    Required Action to Avoid Penalties:
                  </span>
                  <p className="font-['Inter'] text-xs font-medium text-[#1a1a1a] leading-relaxed">
                    {selectedNotice.requiredAction[language] || selectedNotice.requiredAction.en}
                  </p>
                </div>

                {/* Penalty & Interest details */}
                <div className="flex flex-col sm:flex-row gap-2 font-['Space_Grotesk'] text-xs">
                  <div className="flex-1 p-2 bg-[#ffdad6] border border-[#1a1a1a]">
                    <span className="text-[10px] text-[#e63b2e] font-bold uppercase block">Threat / Penalty:</span>
                    <span className="font-bold text-[#1a1a1a]">{selectedNotice.penaltyText}</span>
                  </div>
                  <div className="flex-1 p-2 bg-[#d6e3ff] border border-[#1a1a1a]">
                    <span className="text-[10px] text-[#0055ff] font-bold uppercase block">Statutory Remedy:</span>
                    <span className="font-bold text-[#1a1a1a]">{selectedNotice.statutoryRemedy}</span>
                  </div>
                </div>

                {/* Quick Action Footer */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t-2 border-[#1a1a1a]">
                  <button
                    onClick={handleExportIcs}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#ffcc00] hover:bg-[#e6b800] text-[#1a1a1a] border-2 border-[#1a1a1a] font-['Space_Grotesk'] text-xs font-bold uppercase bauhaus-shadow-sm transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                    <span>Download .ics Reminder</span>
                  </button>

                  <button
                    onClick={() => {
                      onSelectForVoiceSession(selectedNotice);
                      onClose();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1a1a1a] hover:bg-[#e63b2e] text-white border-2 border-[#1a1a1a] font-['Space_Grotesk'] text-xs font-bold uppercase bauhaus-shadow-sm transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">mic</span>
                    <span>Consult Voice Agent</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
