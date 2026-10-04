// Comprehensive Date Formatting & Expiry Assessment Utilities

export interface DateAnalysisResult {
  hasNoDueDate: boolean;
  isOverdue: boolean;
  daysRemaining: number | null;
  daysOverdue: number;
  formattedDeadline: string | null;
  formattedIssueDate: string | null;
  statusBadge: {
    en: string;
    kn: string;
    hi: string;
  };
}

const MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MONTHS_KN = ['ಜನವರಿ', 'ಫೆಬ್ರವರಿ', 'ಮಾರ್ಚ್', 'ಏಪ್ರಿಲ್', 'ಮೇ', 'ಜೂನ್', 'ಜುಲೈ', 'ಆಗಸ್ಟ್', 'ಸೆಪ್ಟೆಂಬರ್', 'ಅಕ್ಟೋಬರ್', 'ನವೆಂಬರ್', 'ಡಿಸೆಂಬರ್'];
const MONTHS_HI = ['जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'];

/**
 * Parses and formats a date string cleanly into human-readable format.
 * Returns empty string if no valid date is provided or date indicates 'none' / 'not mentioned'.
 */
export function formatProperDate(dateStr?: string | null, lang: 'kn' | 'hi' | 'en' = 'en'): string {
  if (!dateStr) return '';
  const trimmed = dateStr.trim();
  const lower = trimmed.toLowerCase();
  
  if (
    lower.includes('none') ||
    lower.includes('not mentioned') ||
    lower.includes('not specified') ||
    lower.includes('no immediate') ||
    lower.includes('n/a') ||
    lower === 'null' ||
    lower === 'undefined'
  ) {
    return '';
  }

  try {
    const d = new Date(trimmed);
    if (isNaN(d.getTime())) {
      // If direct Date constructor fails, try simple regex for DD-MM-YYYY or YYYY-MM-DD
      const isoMatch = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
      if (isoMatch) {
        const year = parseInt(isoMatch[1], 10);
        const month = parseInt(isoMatch[2], 10) - 1;
        const day = parseInt(isoMatch[3], 10);
        return formatParts(day, month, year, lang);
      }
      const indMatch = trimmed.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
      if (indMatch) {
        const day = parseInt(indMatch[1], 10);
        const month = parseInt(indMatch[2], 10) - 1;
        const year = parseInt(indMatch[3], 10);
        return formatParts(day, month, year, lang);
      }
      return trimmed;
    }

    const day = d.getDate();
    const month = d.getMonth();
    const year = d.getFullYear();
    return formatParts(day, month, year, lang);
  } catch {
    return trimmed;
  }
}

function formatParts(day: number, monthIndex: number, year: number, lang: 'kn' | 'hi' | 'en'): string {
  if (monthIndex < 0 || monthIndex > 11) return `${day}/${monthIndex + 1}/${year}`;

  if (lang === 'kn') {
    return `${day} ${MONTHS_KN[monthIndex]} ${year}`;
  }
  if (lang === 'hi') {
    return `${day} ${MONTHS_HI[monthIndex]} ${year}`;
  }
  return `${MONTHS_EN[monthIndex]} ${day}, ${year}`;
}

/**
 * Checks whether the deadline is overdue, upcoming, or non-existent.
 */
export function checkDateStatus(deadlineStr?: string | null, issueDateStr?: string | null): DateAnalysisResult {
  const formattedIssueDate = formatProperDate(issueDateStr);

  if (!deadlineStr) {
    return {
      hasNoDueDate: true,
      isOverdue: false,
      daysRemaining: null,
      daysOverdue: 0,
      formattedDeadline: null,
      formattedIssueDate,
      statusBadge: {
        en: 'No Due Date Specified',
        kn: 'ಯಾವುದೇ ಅಂತಿಮ ಗಡುವನ್ನು ನಮೂದಿಸಲಾಗಿಲ್ಲ',
        hi: 'कोई देय तिथि उल्लिखित नहीं है'
      }
    };
  }

  const trimmed = deadlineStr.trim().toLowerCase();
  if (
    trimmed.includes('none') ||
    trimmed.includes('not mentioned') ||
    trimmed.includes('not specified') ||
    trimmed.includes('no immediate') ||
    trimmed.includes('n/a') ||
    trimmed === 'null' ||
    trimmed === 'undefined'
  ) {
    return {
      hasNoDueDate: true,
      isOverdue: false,
      daysRemaining: null,
      daysOverdue: 0,
      formattedDeadline: null,
      formattedIssueDate,
      statusBadge: {
        en: 'No Due Date Specified',
        kn: 'ಯಾವುದೇ ಅಂತಿಮ ಗಡುವನ್ನು ನಮೂದಿಸಲಾಗಿಲ್ಲ',
        hi: 'कोई देय तिथि उल्लिखित नहीं है'
      }
    };
  }

  const deadlineDate = new Date(deadlineStr);
  if (isNaN(deadlineDate.getTime())) {
    return {
      hasNoDueDate: true,
      isOverdue: false,
      daysRemaining: null,
      daysOverdue: 0,
      formattedDeadline: null,
      formattedIssueDate,
      statusBadge: {
        en: 'No Due Date Specified',
        kn: 'ಯಾವುದೇ ಅಂತಿಮ ಗಡುವನ್ನು ನಮೂದಿಸಲಾಗಿಲ್ಲ',
        hi: 'कोई देय तिथि उल्लिखित नहीं है'
      }
    };
  }

  const now = new Date();
  const dNorm = new Date(deadlineDate.getFullYear(), deadlineDate.getMonth(), deadlineDate.getDate());
  const nNorm = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const diffTime = dNorm.getTime() - nNorm.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  const formattedDeadline = formatProperDate(deadlineStr);

  if (diffDays < 0) {
    const overdueCount = Math.abs(diffDays);
    return {
      hasNoDueDate: false,
      isOverdue: true,
      daysRemaining: diffDays,
      daysOverdue: overdueCount,
      formattedDeadline,
      formattedIssueDate,
      statusBadge: {
        en: `Passed Due Date by ${overdueCount} Days`,
        kn: `ಅಂತಿಮ ಗಡುವು ಮೀರಿದೆ (${overdueCount} ದಿನಗಳು ಕಳೆದಿವೆ)`,
        hi: `देय तिथि समाप्त (${overdueCount} दिन बीत चुके हैं)`
      }
    };
  }

  return {
    hasNoDueDate: false,
    isOverdue: false,
    daysRemaining: diffDays,
    daysOverdue: 0,
    formattedDeadline,
    formattedIssueDate,
    statusBadge: {
      en: diffDays === 0 ? 'Due Today' : `${diffDays} Days Remaining`,
      kn: diffDays === 0 ? 'ಇಂದೇ ಕೊನೆಯ ದಿನಾಂಕ' : `${diffDays} ದಿನಗಳು ಬಾಕಿ ಇವೆ`,
      hi: diffDays === 0 ? 'आज अंतिम तिथि है' : `${diffDays} दिन शेष हैं`
    }
  };
}

/**
 * Returns a human-friendly string for the due status based on language.
 */
export function getDueStatusText(
  doc: {
    deadlineDate?: string | null;
    isOverdue?: boolean;
    daysRemaining?: number | null;
    daysOverdue?: number;
    hasNoDueDate?: boolean;
  },
  lang: 'kn' | 'hi' | 'en' = 'en'
): { badge: string; description: string; isOverdue: boolean; hasNoDueDate: boolean } {
  const status = checkDateStatus(doc.deadlineDate);
  const isOverdue = doc.isOverdue || status.isOverdue;
  const hasNoDueDate = doc.hasNoDueDate || status.hasNoDueDate;
  const daysOverdue = doc.daysOverdue || status.daysOverdue;
  const daysRemaining = doc.daysRemaining !== undefined && doc.daysRemaining !== null ? doc.daysRemaining : status.daysRemaining;
  const properDeadline = formatProperDate(doc.deadlineDate, lang);

  if (hasNoDueDate || !properDeadline) {
    return {
      badge: lang === 'kn' ? 'ಯಾವುದೇ ಅಂತಿಮ ಗಡುವಿಲ್ಲ' : lang === 'hi' ? 'कोई देय तिथि नहीं' : 'No Due Date',
      description: lang === 'kn' ? 'ಈ ದಾಖಲೆಯಲ್ಲಿ ಯಾವುದೇ ಅಂತಿಮ ಗಡುವನ್ನು ನಮೂದಿಸಲಾಗಿಲ್ಲ (ಮಾಹಿತಿ ಉದ್ದೇಶದ ದಾಖಲೆ).' : lang === 'hi' ? 'इस दस्तावेज में कोई देय तिथि उल्लिखित नहीं है (सूचनात्मक दस्तावेज)।' : 'No due date is mentioned in this document (Informational notice).',
      isOverdue: false,
      hasNoDueDate: true
    };
  }

  if (isOverdue) {
    return {
      badge: lang === 'kn' ? `ಅಂತಿಮ ಗಡುವು ಮೀರಿದೆ (${daysOverdue} ದಿನಗಳು ಕಳೆದಿವೆ)` : lang === 'hi' ? `देय तिथि समाप्त (${daysOverdue} दिन का विलंब)` : `Passed Due Date (${daysOverdue} days overdue)`,
      description: lang === 'kn' ? `⚠️ ಈ ದಾಖಲೆಯ ಅಂತಿಮ ದಿನಾಂಕ ${properDeadline} ರಂದು ಮೀರಿದೆ (${daysOverdue} ದಿನಗಳು ಕಳೆದಿವೆ). ದಂಡ ತಪ್ಪಿಸಲು ತುರ್ತಾಗಿ ಕ್ರಮ ಕೈಗೊಳ್ಳಿ.` : lang === 'hi' ? `⚠️ यह दस्तावेज ${properDeadline} को अपनी देय तिथि पार कर चुका है (${daysOverdue} दिन का विलंब)। तुरंत कार्रवाई आवश्यक है।` : `⚠️ This document has passed its due date on ${properDeadline} (Overdue by ${daysOverdue} days). Immediate action is required.`,
      isOverdue: true,
      hasNoDueDate: false
    };
  }

  return {
    badge: lang === 'kn' ? `${daysRemaining} ದಿನಗಳು ಬಾಕಿ` : lang === 'hi' ? `${daysRemaining} दिन शेष` : `${daysRemaining} Days Left`,
    description: lang === 'kn' ? `ಅಂತಿಮ ಗಡುವು: ${properDeadline} (ಇನ್ನು ${daysRemaining} ದಿನಗಳು ಬಾಕಿ).` : lang === 'hi' ? `अंतिम तिथि: ${properDeadline} (${daysRemaining} दिन शेष)।` : `Due Date: ${properDeadline} (${daysRemaining} days remaining).`,
    isOverdue: false,
    hasNoDueDate: false
  };
}
