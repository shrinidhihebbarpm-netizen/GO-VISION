import React, { useState } from 'react';
import { MOCK_NOTICES } from '../data/mockNotices';
import { StatutoryNotice, Language } from '../types';
import { downloadIcsFile } from '../utils/icsGenerator';
import { formatProperDate, checkDateStatus } from '../utils/dateFormatter';

interface DeadlinesViewProps {
  language: Language;
  onSelectNoticeForVoice: (notice: StatutoryNotice) => void;
  onOpenRectificationModal: () => void;
}

export const DeadlinesView: React.FC<DeadlinesViewProps> = ({
  language,
  onSelectNoticeForVoice,
  onOpenRectificationModal
}) => {
  const [filter, setFilter] = useState<'all' | 'critical' | 'completed'>('all');
  const [completedMap, setCompletedMap] = useState<Record<string, boolean>>({});

  const toggleCompleted = (id: string) => {
    setCompletedMap(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredNotices = MOCK_NOTICES.filter(notice => {
    if (filter === 'completed') return completedMap[notice.id];
    if (filter === 'critical') return (notice.urgency === 'CRITICAL' || notice.isOverdue) && !completedMap[notice.id];
    return true;
  });

  const handleExportIcs = (notice: StatutoryNotice) => {
    if (notice.hasNoDueDate || !notice.deadlineDate) return;
    downloadIcsFile({
      title: notice.title,
      description: notice.requiredAction[language] || notice.requiredAction.en,
      dueDate: notice.deadlineDate,
      noticeRef: notice.refNumber,
      filename: `${notice.id.toLowerCase()}_deadline.ics`
    });
  };

  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 md:px-6 lg:px-8 py-8 flex flex-col gap-6 text-left">
      {/* Top Banner */}
      <div className="bg-[#ffffff] border-2 border-[#1a1a1a] bauhaus-shadow p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-[#e63b2e]" />
            <h1 className="font-['Space_Grotesk'] text-2xl font-bold uppercase text-[#1a1a1a]">
              Statutory Deadlines &amp; Calendar Schedule
            </h1>
          </div>
          <p className="font-['Inter'] text-xs text-[#4a4a4a] mt-1">
            Track statutory limitation periods across Income Tax, BBMP Municipal assessments, and Aadhaar e-KYC.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center border-2 border-[#1a1a1a] bg-[#eee9e0] p-0.5">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 font-['Space_Grotesk'] text-xs font-bold uppercase transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-[#1a1a1a] text-white'
                : 'text-[#4a4a4a] hover:text-[#1a1a1a]'
            }`}
          >
            All Notices ({MOCK_NOTICES.length})
          </button>
          <button
            onClick={() => setFilter('critical')}
            className={`px-3 py-1 font-['Space_Grotesk'] text-xs font-bold uppercase transition-all cursor-pointer flex items-center gap-1 ${
              filter === 'critical'
                ? 'bg-[#e63b2e] text-white'
                : 'text-[#4a4a4a] hover:text-[#1a1a1a]'
            }`}
          >
            <span>Urgent</span>
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1 font-['Space_Grotesk'] text-xs font-bold uppercase transition-all cursor-pointer ${
              filter === 'completed'
                ? 'bg-[#1a1a1a] text-white'
                : 'text-[#4a4a4a] hover:text-[#1a1a1a]'
            }`}
          >
            Resolved ({Object.values(completedMap).filter(Boolean).length})
          </button>
        </div>
      </div>

      {/* Deadlines List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredNotices.map((notice) => {
          const isDone = completedMap[notice.id];
          const dateStatus = checkDateStatus(notice.deadlineDate, notice.issueDate);
          const hasNoDue = notice.hasNoDueDate || dateStatus.hasNoDueDate || !notice.deadlineDate;
          const isOverdue = notice.isOverdue || dateStatus.isOverdue || (dateStatus.daysRemaining !== null && dateStatus.daysRemaining < 0);
          const daysLeft = dateStatus.daysRemaining ?? notice.daysRemaining;

          return (
            <div
              key={notice.id}
              className={`bg-[#ffffff] border-2 border-[#1a1a1a] bauhaus-shadow p-5 flex flex-col justify-between transition-all ${
                isDone ? 'opacity-60 bg-[#eee9e0]' : isOverdue ? 'border-red-600 bg-red-50/30' : ''
              }`}
            >
              <div>
                {/* Header row */}
                <div className="flex items-center justify-between pb-3 border-b-2 border-[#1a1a1a]">
                  <div className="flex items-center gap-2 flex-wrap">
                    {hasNoDue ? (
                      <span className="px-2 py-0.5 font-['Space_Grotesk'] text-xs font-bold uppercase border border-[#1a1a1a] bg-blue-100 text-blue-950">
                        {language === 'kn' ? 'ಯಾವುದೇ ಅಂತಿಮ ಗಡುವಿಲ್ಲ' : language === 'hi' ? 'कोई देय तिथि नहीं' : 'No Due Date'}
                      </span>
                    ) : isOverdue ? (
                      <span className="px-2 py-0.5 font-['Space_Grotesk'] text-xs font-bold uppercase border border-red-800 bg-[#e63b2e] text-white flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">warning</span>
                        {language === 'kn' ? `ಅಂತಿಮ ಗಡುವು ಮೀರಿದೆ (${dateStatus.daysOverdue || Math.abs(daysLeft || 0)} ದಿನಗಳ ಹಿಂದೆ)` :
                         language === 'hi' ? `समय समाप्त (${dateStatus.daysOverdue || Math.abs(daysLeft || 0)} दिन पहले)` :
                         `Past Due Date (${dateStatus.daysOverdue || Math.abs(daysLeft || 0)}d ago)`}
                      </span>
                    ) : (
                      <span
                        className={`px-2 py-0.5 font-['Space_Grotesk'] text-xs font-bold uppercase border border-[#1a1a1a] ${
                          notice.urgency === 'CRITICAL' || (daysLeft !== null && daysLeft !== undefined && daysLeft <= 3)
                            ? 'bg-[#e63b2e] text-white'
                            : 'bg-[#ffcc00] text-[#1a1a1a]'
                        }`}
                      >
                        {daysLeft === 0 
                          ? (language === 'kn' ? 'ಇಂದೇ ಕೊನೆಯ ದಿನಾಂಕ' : language === 'hi' ? 'आज ही अंतिम तिथि' : 'Due Today')
                          : `${daysLeft} ${language === 'kn' ? 'ದಿನಗಳು ಬಾಕಿ ಇವೆ' : language === 'hi' ? 'दिन शेष' : 'Days Left'}`}
                      </span>
                    )}
                    <span className="font-['Space_Grotesk'] text-xs font-bold text-[#4a4a4a]">
                      {notice.refNumber}
                    </span>
                  </div>
                  <button
                    onClick={() => toggleCompleted(notice.id)}
                    className={`flex items-center gap-1 px-2.5 py-0.5 border border-[#1a1a1a] font-['Space_Grotesk'] text-xs font-bold uppercase cursor-pointer ${
                      isDone
                        ? 'bg-emerald-600 text-white'
                        : 'bg-[#faf7f2] hover:bg-emerald-100 text-[#1a1a1a]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      {isDone ? 'check_box' : 'check_box_outline_blank'}
                    </span>
                    <span>{isDone ? 'Resolved' : 'Mark Done'}</span>
                  </button>
                </div>

                {/* Notice Title & Department */}
                <div className="pt-3">
                  <h3 className="font-['Space_Grotesk'] text-base font-bold uppercase text-[#1a1a1a]">
                    {notice.title}
                  </h3>
                  <p className="font-['Inter'] text-xs text-[#4a4a4a] mt-0.5">
                    {notice.department}
                  </p>
                </div>

                {/* Plain Words Action Box */}
                <div className="mt-3 p-3 bg-[#faf7f2] border-2 border-[#1a1a1a] space-y-1">
                  <span className="font-['Space_Grotesk'] text-[11px] font-bold uppercase text-[#e63b2e] block">
                    Statutory Action Required:
                  </span>
                  <p className="font-['Inter'] text-xs text-[#1a1a1a] leading-relaxed">
                    {notice.requiredAction[language] || notice.requiredAction.en}
                  </p>
                </div>

                {/* Penalties & Remedy */}
                <div className="mt-3 text-xs font-['Space_Grotesk'] text-[#4a4a4a] space-y-1">
                  {notice.issueDate && (
                    <p>
                      <strong className="text-[#1a1a1a]">Issued Date:</strong> {formatProperDate(notice.issueDate, language)}
                    </p>
                  )}
                  {hasNoDue ? (
                    <p className="text-blue-900 font-medium">
                      <strong className="text-[#1a1a1a]">Due Date:</strong> {language === 'kn' ? 'ಯಾವುದೇ ಅಂತಿಮ ಗಡುವು ಉಲ್ಲೇಖಿಸಿಲ್ಲ (ಮಾಹಿತಿ ದಾಖಲೆ)' : language === 'hi' ? 'कोई देय तिथि उल्लिखित नहीं है (केवल सूचना)' : 'No due date specified (Informational record)'}
                    </p>
                  ) : (
                    <p className={isOverdue ? 'text-red-700 font-bold' : ''}>
                      <strong className="text-[#1a1a1a]">Due Date:</strong> {formatProperDate(notice.deadlineDate, language)} {isOverdue ? `(⚠️ ${language === 'kn' ? 'ಗಡುವು ಮೀರಿದೆ' : language === 'hi' ? 'समय समाप्त' : 'PAST DUE DATE'})` : '(9:00 AM IST)'}
                    </p>
                  )}
                  {notice.penaltyText && (
                    <p>
                      <strong className="text-[#1a1a1a]">Penalty:</strong> {notice.penaltyText}
                    </p>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-4 mt-4 border-t-2 border-[#1a1a1a]">
                {!hasNoDue && (
                  <button
                    onClick={() => handleExportIcs(notice)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#ffcc00] hover:bg-[#e6b800] text-[#1a1a1a] border-2 border-[#1a1a1a] font-['Space_Grotesk'] text-xs font-bold uppercase bauhaus-shadow-sm transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">event_available</span>
                    <span>Sync .ics Event</span>
                  </button>
                )}

                <button
                  onClick={() => onSelectNoticeForVoice(notice)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1a1a1a] hover:bg-[#e63b2e] text-white border-2 border-[#1a1a1a] font-['Space_Grotesk'] text-xs font-bold uppercase bauhaus-shadow-sm transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">record_voice_over</span>
                  <span>Ask Gemma 4</span>
                </button>

                {notice.id === 'IT-143-1-DEMAND' && (
                  <button
                    onClick={onOpenRectificationModal}
                    className="flex items-center gap-1 px-3 py-1.5 bg-[#eee9e0] hover:bg-white text-[#1a1a1a] border-2 border-[#1a1a1a] font-['Space_Grotesk'] text-xs font-bold uppercase cursor-pointer"
                  >
                    <span>Sec 154 Steps</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
