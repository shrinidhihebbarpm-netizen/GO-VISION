import React, { useState } from 'react';
import { Language } from '../types';

interface RightsViewProps {
  language: Language;
  onOpenDraftModal: () => void;
  onOpenRectificationModal: () => void;
}

export const RightsView: React.FC<RightsViewProps> = ({
  language,
  onOpenDraftModal,
  onOpenRectificationModal
}) => {
  const [selectedRemedy, setSelectedRemedy] = useState<'sec154' | 'sec246a' | 'bbmp' | 'rti'>('sec154');

  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 md:px-6 lg:px-8 py-8 flex flex-col gap-6 text-left">
      {/* Top Banner */}
      <div className="bg-[#ffffff] border-2 border-[#1a1a1a] bauhaus-shadow p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-[#0055ff]" />
            <h1 className="font-['Space_Grotesk'] text-2xl font-bold uppercase text-[#1a1a1a]">
              Citizen Legal Rights &amp; Statutory Remedies
            </h1>
          </div>
          <p className="font-['Inter'] text-xs text-[#4a4a4a] mt-1">
            Empowering citizens with statutory rights to challenge bureaucratic errors, unfair tax demands, and arbitrary penalties.
          </p>
        </div>

        <button
          onClick={onOpenDraftModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#ffcc00] hover:bg-[#e6b800] text-[#1a1a1a] font-['Space_Grotesk'] text-xs font-bold uppercase border-2 border-[#1a1a1a] bauhaus-shadow-sm transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">edit_document</span>
          <span>Draft Formal Response Letter</span>
        </button>
      </div>

      {/* Grid: Left Remedy Navigation (4 Cols) / Right Detail Content (8 Cols) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left List */}
        <div className="md:col-span-4 flex flex-col gap-2">
          <button
            onClick={() => setSelectedRemedy('sec154')}
            className={`p-4 text-left border-2 font-['Space_Grotesk'] transition-all cursor-pointer flex flex-col ${
              selectedRemedy === 'sec154'
                ? 'bg-[#1a1a1a] text-white border-[#1a1a1a] bauhaus-shadow'
                : 'bg-[#ffffff] text-[#1a1a1a] border-[#1a1a1a] hover:bg-[#eee9e0]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase">Section 154 Rectification</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-[#ffcc00] text-[#1a1a1a] font-bold border border-[#1a1a1a]">
                Zero Fee
              </span>
            </div>
            <span className="text-[11px] opacity-80 mt-1 font-['Inter']">
              Income Tax Act — Clerical &amp; TDS mismatch corrections
            </span>
          </button>

          <button
            onClick={() => setSelectedRemedy('sec246a')}
            className={`p-4 text-left border-2 font-['Space_Grotesk'] transition-all cursor-pointer flex flex-col ${
              selectedRemedy === 'sec246a'
                ? 'bg-[#1a1a1a] text-white border-[#1a1a1a] bauhaus-shadow'
                : 'bg-[#ffffff] text-[#1a1a1a] border-[#1a1a1a] hover:bg-[#eee9e0]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase">Section 246A Appeal</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-[#e63b2e] text-white font-bold border border-[#1a1a1a]">
                30-Day Limit
              </span>
            </div>
            <span className="text-[11px] opacity-80 mt-1 font-['Inter']">
              Appeal to CIT (Appeals) for disputed tax liability
            </span>
          </button>

          <button
            onClick={() => setSelectedRemedy('bbmp')}
            className={`p-4 text-left border-2 font-['Space_Grotesk'] transition-all cursor-pointer flex flex-col ${
              selectedRemedy === 'bbmp'
                ? 'bg-[#1a1a1a] text-white border-[#1a1a1a] bauhaus-shadow'
                : 'bg-[#ffffff] text-[#1a1a1a] border-[#1a1a1a] hover:bg-[#eee9e0]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase">BBMP Property Tax Sec 108A</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-[#0055ff] text-white font-bold border border-[#1a1a1a]">
                Local Body
              </span>
            </div>
            <span className="text-[11px] opacity-80 mt-1 font-['Inter']">
              Objection to Assistant Revenue Officer against zoning reassessment
            </span>
          </button>

          <button
            onClick={() => setSelectedRemedy('rti')}
            className={`p-4 text-left border-2 font-['Space_Grotesk'] transition-all cursor-pointer flex flex-col ${
              selectedRemedy === 'rti'
                ? 'bg-[#1a1a1a] text-white border-[#1a1a1a] bauhaus-shadow'
                : 'bg-[#ffffff] text-[#1a1a1a] border-[#1a1a1a] hover:bg-[#eee9e0]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase">RTI Act Section 6(1)</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-[#ffcc00] text-[#1a1a1a] font-bold border border-[#1a1a1a]">
                Statutory Right
              </span>
            </div>
            <span className="text-[11px] opacity-80 mt-1 font-['Inter']">
              Right to Information application for civic delays &amp; verification
            </span>
          </button>
        </div>

        {/* Right Detail Card */}
        <div className="md:col-span-8 bg-[#ffffff] border-2 border-[#1a1a1a] bauhaus-shadow p-6 flex flex-col gap-4">
          {selectedRemedy === 'sec154' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b-2 border-[#1a1a1a]">
                <h2 className="font-['Space_Grotesk'] text-lg font-bold uppercase text-[#1a1a1a]">
                  Section 154: Rectification of Mistake Apparent from Record
                </h2>
                <span className="px-2 py-0.5 bg-[#ffcc00] border border-[#1a1a1a] text-xs font-bold font-['Space_Grotesk']">
                  No Court Visit Needed
                </span>
              </div>

              <div className="p-3 bg-[#faf7f2] border-2 border-[#1a1a1a] text-xs font-['Inter'] text-[#1a1a1a] leading-relaxed">
                Under Section 154 of the Income Tax Act, 1961, an Assessing Officer or CPC may rectify any mistake apparent from the record. This is the fastest, completely free remedy when you receive an intimation under Section 143(1) with demand due to TDS credit mismatch.
              </div>

              <div className="space-y-2">
                <h3 className="font-['Space_Grotesk'] text-xs font-bold uppercase text-[#1a1a1a]">
                  When can you file under Section 154?
                </h3>
                <ul className="list-disc pl-5 text-xs text-[#4a4a4a] space-y-1 font-['Inter']">
                  <li>TDS entered in return does not match Form 26AS / AIS due to late employer filing.</li>
                  <li>Advance tax or self-assessment tax paid via Challan 280 was omitted by automated CPC intake.</li>
                  <li>Arithmetic or calculation error in computation of Section 234A/B/C interest.</li>
                  <li>Exemption u/s 10 (HRA, gratuity, leave encashment) was erroneously disallowed.</li>
                </ul>
              </div>

              <div className="p-3 bg-[#eee9e0] border-2 border-[#1a1a1a] flex items-center justify-between">
                <div>
                  <span className="font-['Space_Grotesk'] text-xs font-bold uppercase block text-[#1a1a1a]">
                    Statutory Limitation Timeframe:
                  </span>
                  <span className="text-xs text-[#4a4a4a] font-['Inter']">
                    Must be filed within 4 years from the end of the financial year in which the order was passed.
                  </span>
                </div>
                <button
                  onClick={onOpenRectificationModal}
                  className="px-3 py-1.5 bg-[#1a1a1a] text-white hover:bg-[#ffcc00] hover:text-[#1a1a1a] font-['Space_Grotesk'] text-xs font-bold uppercase border border-[#1a1a1a] transition-colors cursor-pointer"
                >
                  View Step-by-Step Guide
                </button>
              </div>
            </div>
          )}

          {selectedRemedy === 'sec246a' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b-2 border-[#1a1a1a]">
                <h2 className="font-['Space_Grotesk'] text-lg font-bold uppercase text-[#1a1a1a]">
                  Section 246A: Appeal to Commissioner of Income Tax (Appeals)
                </h2>
                <span className="px-2 py-0.5 bg-[#e63b2e] text-white border border-[#1a1a1a] text-xs font-bold font-['Space_Grotesk']">
                  Strict 30 Days
                </span>
              </div>

              <div className="p-3 bg-[#ffdad6] border-2 border-[#1a1a1a] text-xs font-['Inter'] text-[#1a1a1a] leading-relaxed">
                If the dispute is not a clerical error but an interpretation of law or an assessment order passed by an officer denying deductions, you have the statutory right to appeal before CIT(A) via Electronic Form 35.
              </div>

              <div className="space-y-2">
                <h3 className="font-['Space_Grotesk'] text-xs font-bold uppercase text-[#1a1a1a]">
                  Key Requirements:
                </h3>
                <ul className="list-disc pl-5 text-xs text-[#4a4a4a] space-y-1 font-['Inter']">
                  <li>Form 35 must be filed within 30 days from the date of service of notice of demand.</li>
                  <li>Payment of 20% disputed tax is usually required for stay of demand pending appeal.</li>
                  <li>Faceless Appeals mechanism allows submissions entirely online without physical hearing.</li>
                </ul>
              </div>

              <button
                onClick={onOpenDraftModal}
                className="w-full py-2 bg-[#ffcc00] hover:bg-[#e6b800] text-[#1a1a1a] font-['Space_Grotesk'] text-xs font-bold uppercase border-2 border-[#1a1a1a] bauhaus-shadow-sm transition-all cursor-pointer"
              >
                Generate Draft Appeal Grounds
              </button>
            </div>
          )}

          {selectedRemedy === 'bbmp' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b-2 border-[#1a1a1a]">
                <h2 className="font-['Space_Grotesk'] text-lg font-bold uppercase text-[#1a1a1a]">
                  BBMP Property Tax Objection u/s 108A
                </h2>
                <span className="px-2 py-0.5 bg-[#0055ff] text-white border border-[#1a1a1a] text-xs font-bold font-['Space_Grotesk']">
                  Municipal Act
                </span>
              </div>

              <div className="p-3 bg-[#faf7f2] border-2 border-[#1a1a1a] text-xs font-['Inter'] text-[#1a1a1a] leading-relaxed">
                Under Karnataka Municipal Corporations Act Sec 108A, citizens can challenge property tax reassessment notices or zonal reclassification discrepancies by filing a written objection with supporting building plan and utility bills.
              </div>

              <button
                onClick={onOpenDraftModal}
                className="w-full py-2 bg-[#1a1a1a] hover:bg-[#e63b2e] text-white font-['Space_Grotesk'] text-xs font-bold uppercase border-2 border-[#1a1a1a] bauhaus-shadow-sm transition-all cursor-pointer"
              >
                Generate BBMP Objection Letter
              </button>
            </div>
          )}

          {selectedRemedy === 'rti' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b-2 border-[#1a1a1a]">
                <h2 className="font-['Space_Grotesk'] text-lg font-bold uppercase text-[#1a1a1a]">
                  Right to Information (RTI) Section 6(1)
                </h2>
                <span className="px-2 py-0.5 bg-[#ffcc00] border border-[#1a1a1a] text-xs font-bold font-['Space_Grotesk']">
                  Mandatory 30-Day Response
                </span>
              </div>

              <div className="p-3 bg-[#faf7f2] border-2 border-[#1a1a1a] text-xs font-['Inter'] text-[#1a1a1a] leading-relaxed">
                If a civic body or tax authority fails to process your rectification, subsidy disbursement, or land record mutation, you can file an RTI under Section 6(1) to compel disclosure of file movements and daily progress.
              </div>

              <button
                onClick={onOpenDraftModal}
                className="w-full py-2 bg-[#ffcc00] hover:bg-[#e6b800] text-[#1a1a1a] font-['Space_Grotesk'] text-xs font-bold uppercase border-2 border-[#1a1a1a] bauhaus-shadow-sm transition-all cursor-pointer"
              >
                Generate Standard RTI Template
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
