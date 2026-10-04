export type Language = 'en' | 'hi' | 'kn';
export type VoiceOutputLanguage = 'auto' | 'kn' | 'hi' | 'en';
export type InputLanguageSetting = 'auto' | 'kn' | 'hi' | 'en';

export type ViewMode = 
  | 'voice-agent' 
  | 'document-scanner' 
  | 'my-deadlines' 
  | 'legal-rights' 
  | 'system-health' 
  | 'mobile-app';

export interface StatutoryNotice {
  id: string;
  refNumber: string;
  title: string;
  titleEn?: string;
  titleKn?: string;
  titleHi?: string;
  department: string;
  departmentEn?: string;
  departmentKn?: string;
  departmentHi?: string;
  issueDate: string;
  deadlineDate?: string | null;
  daysRemaining?: number | null;
  isOverdue?: boolean;
  daysOverdue?: number;
  hasNoDueDate?: boolean;
  formattedDeadline?: string;
  formattedIssueDate?: string;
  urgency: 'CRITICAL' | 'WARNING' | 'UPCOMING';
  penaltyText: string;
  penaltyTextKn?: string;
  penaltyTextHi?: string;
  requiredAction: {
    en: string;
    kn: string;
    hi: string;
  };
  plainSummary: {
    en: string;
    kn: string;
    hi: string;
  };
  laymanSummary?: {
    en: string;
    kn: string;
    hi: string;
  };
  understandingQuestions?: Array<{
    question: string;
    questionKn?: string;
    questionHi?: string;
    explanation: string;
    explanationKn?: string;
    explanationHi?: string;
    answerKey?: string;
  }>;
  keyPoints?: string[];
  keyPointsKn?: string[];
  keyPointsHi?: string[];
  keyPointsEn?: string[];
  statutoryRemedy: string;
  statutoryRemedyKn?: string;
  statutoryRemedyHi?: string;
  verifiedSection: string;
  amountDemanded?: string;
  disputeAvailable: boolean;
  capturedImage?: string;
  attachedFile?: {
    name: string;
    size?: string;
    mimeType?: string;
    previewUrl?: string;
  };
}

export interface ExtractedInfo {
  deadline?: string | null;
  issueDate?: string | null;
  formattedDeadline?: string | null;
  formattedIssueDate?: string | null;
  daysRemaining?: number | null;
  isOverdue?: boolean;
  daysOverdue?: number;
  hasNoDueDate?: boolean;
  amount?: string;
  authority?: string;
  action?: string;
  isCritical?: boolean;
  isExpiringSoon?: boolean;
}

export interface ActionButton {
  label: string;
  action: 'calendar' | 'procedure' | 'draft' | 'scan' | 'rights' | 'help' | string;
}

export interface ConversationTurn {
  id: string;
  type: 'user' | 'assistant';
  timestamp: string;
  text: string;
  secondaryText?: string;
  duration?: string;
  language?: Language;
  detectedLanguage?: Language;
  selectedDisplayLang?: Language;
  kannadaText?: string;
  hindiText?: string;
  englishText?: string;
  laymanSummary?: string | { en: string; kn: string; hi: string };
  laymanSummaryKn?: string;
  laymanSummaryHi?: string;
  laymanSummaryEn?: string;
  keyPoints?: string[];
  keyPointsKn?: string[];
  keyPointsHi?: string[];
  keyPointsEn?: string[];
  attachedFile?: {
    name: string;
    size?: string;
    type?: string;
    mimeType?: string;
    previewUrl?: string;
  };
  understandingCheck?: Array<{
    question: string;
    questionKn?: string;
    questionHi?: string;
    explanation: string;
    explanationKn?: string;
    explanationHi?: string;
  }>;
  expiryNotice?: {
    isExpiringSoon?: boolean;
    isOverdue?: boolean;
    hasNoDueDate?: boolean;
    daysRemaining?: number | null;
    daysOverdue?: number;
    deadline?: string | null;
    formattedDeadline?: string;
    penaltyWarning?: string;
  };
  extractedInfo?: ExtractedInfo;
  actionButtons?: ActionButton[];
  safetyRefusal?: boolean;
  isSpeaking?: boolean;
  activeVoiceLang?: VoiceOutputLanguage;
  // Backward compatibility fields
  textIndic?: string;
  textEnglish?: string;
  functionCall?: {
    name: string;
    args: Record<string, any>;
    latencyMs: number;
    returnValue: Record<string, any>;
  };
  assistantResponse?: {
    kannada: string;
    english: string;
    audioDuration: string;
  };
  actionCompleted?: {
    functionName: string;
    details: string;
    fileName?: string;
    eventDate?: string;
    alarmText?: string;
    spokenConfirmation?: string;
  };
}
