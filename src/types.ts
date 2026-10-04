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
  department: string;
  issueDate: string;
  deadlineDate: string;
  daysRemaining: number;
  urgency: 'CRITICAL' | 'WARNING' | 'UPCOMING';
  penaltyText: string;
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
    explanation: string;
    answerKey: string;
  }>;
  statutoryRemedy: string;
  verifiedSection: string;
  amountDemanded?: string;
  disputeAvailable: boolean;
  capturedImage?: string;
}

export interface ExtractedInfo {
  deadline?: string;
  daysRemaining?: number;
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
  kannadaText?: string;
  hindiText?: string;
  englishText?: string;
  laymanSummary?: string;
  understandingCheck?: Array<{
    question: string;
    explanation: string;
  }>;
  expiryNotice?: {
    isExpiringSoon: boolean;
    daysRemaining: number;
    deadline: string;
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
