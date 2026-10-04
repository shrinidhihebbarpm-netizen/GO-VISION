import React from 'react';

interface SampleQueriesProps {
  onSelectQuery: (indicText: string, englishText: string, contextNoticeId?: string) => void;
}

export const SampleQueries: React.FC<SampleQueriesProps> = ({ onSelectQuery }) => {
  const samples = [
    {
      indic: '“ನನ್ನ ಆದಾಯ ತೆರಿಗೆ ನೋಟಿಸ್‌ಗೆ ಕೊನೆಯ ದಿನಾಂಕ ಯಾವಾಗ?”',
      english: '“When is my deadline for the Income Tax notice?”',
      noticeId: 'IT-143-1-DEMAND'
    },
    {
      indic: '“इस नोटिस के खिलाफ अपील कैसे करें?”',
      english: '“How do I dispute this demand under section 246A?”',
      noticeId: 'IT-143-1-DEMAND'
    },
    {
      indic: '“ADD REMINDER FOR FORM 16 PART A TO MY CALENDAR”',
      english: 'Syncs locally to device calendar format (.ics)',
      noticeId: 'IT-143-1-DEMAND'
    },
    {
      indic: '“MARK ‘VERIFY 26AS’ STEP AS COMPLETED”',
      english: 'Updates local SQLite compliance checklist',
      noticeId: 'IT-143-1-DEMAND'
    }
  ];

  return (
    <div className="bg-[#ffffff] border-2 border-[#1a1a1a] bauhaus-shadow p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between border-b-2 border-[#1a1a1a] pb-2">
        <span className="font-['Space_Grotesk'] text-sm font-bold uppercase text-[#1a1a1a]">
          Tap or Speak Sample Queries
        </span>
        <span className="font-['Space_Grotesk'] text-xs text-[#4a4a4a] font-bold">
          KN • HI • EN
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {samples.map((sample, idx) => (
          <button
            key={idx}
            onClick={() => onSelectQuery(sample.indic, sample.english, sample.noticeId)}
            className="text-left p-3 bg-[#faf7f2] hover:bg-[#ffcc00] border-2 border-[#1a1a1a] bauhaus-shadow-sm transition-all group flex items-start gap-2.5 cursor-pointer active:translate-x-[1px] active:translate-y-[1px]"
          >
            <span className="material-symbols-outlined text-[20px] text-[#0055ff] mt-0.5 group-hover:text-[#1a1a1a] transition-colors">
              volume_up
            </span>
            <div className="flex flex-col">
              <span className="font-['Space_Grotesk'] text-xs font-bold text-[#1a1a1a] uppercase leading-snug">
                {sample.indic}
              </span>
              <span className="font-['Inter'] text-xs text-[#4a4a4a] mt-0.5">
                {sample.english}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
