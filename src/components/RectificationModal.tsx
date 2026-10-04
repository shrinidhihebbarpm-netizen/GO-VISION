import React from 'react';

interface RectificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RectificationModal: React.FC<RectificationModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-[#f5f0e8] border-3 border-[#1a1a1a] bauhaus-shadow-lg w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden text-left">
        {/* Header */}
        <div className="bg-[#1a1a1a] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#ffcc00] text-[22px]">gavel</span>
            <h2 className="font-['Space_Grotesk'] text-base font-bold uppercase tracking-tight">
              Section 154 Rectification: Step-by-Step Procedure
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-white/10 hover:bg-[#e63b2e] border border-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 font-['Inter'] text-xs text-[#1a1a1a]">
          <div className="p-3 bg-[#faf7f2] border-2 border-[#1a1a1a]">
            <span className="font-['Space_Grotesk'] font-bold text-xs uppercase text-[#0055ff] block mb-1">
              Plain Language Overview:
            </span>
            <p className="leading-relaxed">
              Section 154 of the Income Tax Act allows you to correct arithmetic mistakes or mismatch in TDS credit without paying any filing fees or visiting an income tax office.
            </p>
          </div>

          <div className="space-y-3 font-['Space_Grotesk']">
            <div className="p-3 bg-[#ffffff] border-2 border-[#1a1a1a]">
              <span className="font-bold text-[#e63b2e] uppercase block">Step 1: Verify Form 26AS &amp; AIS</span>
              <p className="text-xs text-[#4a4a4a] font-['Inter'] mt-1">
                Log into e-filing portal (eportal.incometax.gov.in). Check whether the deductor has deposited the TDS and whether the TAN matches your Form 16.
              </p>
            </div>

            <div className="p-3 bg-[#ffffff] border-2 border-[#1a1a1a]">
              <span className="font-bold text-[#e63b2e] uppercase block">Step 2: Navigate to Services → Rectification</span>
              <p className="text-xs text-[#4a4a4a] font-['Inter'] mt-1">
                Select 'Income Tax' under Order Passed to be Rectified. Select Assessment Year and the Section 143(1) Intimation Order number.
              </p>
            </div>

            <div className="p-3 bg-[#ffffff] border-2 border-[#1a1a1a]">
              <span className="font-bold text-[#e63b2e] uppercase block">Step 3: Select Request Type 'Tax Credit Mismatch'</span>
              <p className="text-xs text-[#4a4a4a] font-['Inter'] mt-1">
                Enter the corrected TDS figures matching 26AS. You do not need to recompute your entire income or upload revised XML.
              </p>
            </div>

            <div className="p-3 bg-[#ffffff] border-2 border-[#1a1a1a]">
              <span className="font-bold text-[#e63b2e] uppercase block">Step 4: E-Verify &amp; Download Acknowledgement</span>
              <p className="text-xs text-[#4a4a4a] font-['Inter'] mt-1">
                E-verify using Aadhaar OTP. The CPC typically processes rectification requests within 15–30 days and cancels the demand notice automatically.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#eee9e0] border-t-2 border-[#1a1a1a] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#1a1a1a] text-white hover:bg-[#ffcc00] hover:text-[#1a1a1a] font-['Space_Grotesk'] text-xs font-bold uppercase border border-[#1a1a1a] transition-colors cursor-pointer"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
