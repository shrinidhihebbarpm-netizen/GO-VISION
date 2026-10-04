import React, { useState } from 'react';

interface ResponseDraftModalProps {
  isOpen: boolean;
  onClose: () => void;
  noticeRef?: string;
}

export const ResponseDraftModal: React.FC<ResponseDraftModalProps> = ({
  isOpen,
  onClose,
  noticeRef = 'IT-NOTICE-143-1-DEMAND.pdf'
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const letterText = `To,
The Assessing Officer / Central Processing Centre,
Income Tax Department, Bengaluru - 560500.

Subject: Formal Response & Rectification Petition u/s 154 against Intimation u/s 143(1)
Reference: Notice / Intimation Ref No: ${noticeRef}
PAN: ABCDE****F | Assessment Year: 2024-25

Respected Sir/Madam,

I am in receipt of the Intimation under Section 143(1) of the Income Tax Act, 1961, dated 22nd February 2025, demanding an alleged payable amount of ₹ 18,450.

In this regard, I respectfully submit as under:
1. The discrepancy arose solely due to a clerical mismatch between TDS claimed in Schedule TDS-1 and credit appearing in Form 26AS at the time of automated intake.
2. My deductor has subsequently filed the revised Form 24Q quarterly statement and the full tax credit of ₹ 18,450 is now duly visible and reconciled in my Annual Information Statement (AIS) and Form 26AS.
3. As per Board Circular No. 8/2011 and Section 205 of the Income Tax Act, where tax has been deducted at source, the assessee shall not be called upon to pay the tax himself.

PRAYER:
In view of the above apparent clerical record, it is prayed that:
a) The demand of ₹ 18,450 be rectified and cancelled under Section 154 of the Act.
b) No coercive recovery proceedings or interest u/s 220(2) be initiated pending processing.

Yours faithfully,
[Citizen Assessee Name]
Masked PAN: ABCDE****F
Date: ${new Date().toLocaleDateString('en-IN')}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(letterText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-[#f5f0e8] border-3 border-[#1a1a1a] bauhaus-shadow-lg w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden text-left">
        {/* Header */}
        <div className="bg-[#1a1a1a] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#ffcc00] text-[22px]">description</span>
            <h2 className="font-['Space_Grotesk'] text-base font-bold uppercase tracking-tight">
              Draft Formal Response Letter (Sec 154)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-white/10 hover:bg-[#e63b2e] border border-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Text Container */}
        <div className="p-6 overflow-y-auto flex-1 font-['Space_Grotesk']">
          <div className="p-4 bg-white border-2 border-[#1a1a1a] font-mono text-xs whitespace-pre-wrap leading-relaxed text-[#1a1a1a]">
            {letterText}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#eee9e0] border-t-2 border-[#1a1a1a] flex items-center justify-between">
          <span className="text-xs font-['Space_Grotesk'] text-[#4a4a4a]">
            Ready to copy or upload to Income Tax e-filing portal
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-[#ffcc00] hover:bg-[#e6b800] text-[#1a1a1a] font-['Space_Grotesk'] text-xs font-bold uppercase border-2 border-[#1a1a1a] bauhaus-shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">
                {copied ? 'check' : 'content_copy'}
              </span>
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Letter'}</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#1a1a1a] text-white hover:bg-white hover:text-[#1a1a1a] font-['Space_Grotesk'] text-xs font-bold uppercase border border-[#1a1a1a] transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
