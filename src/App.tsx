import React, { useState, useEffect, useRef } from 'react';
import { ViewMode, Language, VoiceOutputLanguage, InputLanguageSetting, ConversationTurn, StatutoryNotice } from './types';
import { MOCK_NOTICES } from './data/mockNotices';
import { downloadIcsFile } from './utils/icsGenerator';
import { soundController, detectLanguage } from './utils/audioSynthesizer';
import { formatProperDate, getDueStatusText, checkDateStatus } from './utils/dateFormatter';
import { ScannerModal } from './components/ScannerModal';
import { RectificationModal } from './components/RectificationModal';
import { ResponseDraftModal } from './components/ResponseDraftModal';
import { DocumentCameraScanner } from './components/DocumentCameraScanner';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('voice-agent');
  const [activeNoticeId, setActiveNoticeId] = useState<string>('IT-143-1-DEMAND');
  
  // Multilingual & Voice Configuration
  const [selectedLanguage, setSelectedLanguage] = useState<InputLanguageSetting>('auto');
  const [inputLanguage, setInputLanguage] = useState<InputLanguageSetting>('auto');
  const [detectedLanguage, setDetectedLanguage] = useState<Language>('kn');
  const [voiceOutputLanguage, setVoiceOutputLanguage] = useState<VoiceOutputLanguage>('auto');
  const [speakingTurnId, setSpeakingTurnId] = useState<string | null>(null);
  const chatFileInputRef = useRef<HTMLInputElement | null>(null);

  // Turn-level Language & Voice Preferences (allows switching summary & voice language after generation)
  const [turnLanguages, setTurnLanguages] = useState<Record<string, 'kn' | 'hi' | 'en'>>({});
  const [turnVoiceLangs, setTurnVoiceLangs] = useState<Record<string, VoiceOutputLanguage>>({});

  // Localization Dictionary for Strict Single-Language UI
  const UI_TEXT = {
    kn: {
      appTitle: 'GO VISION',
      role: 'ಪಾತ್ರ: Go Vision ಸಹಾಯಕ',
      headerBadge: 'ಸಹಾಯಕ / ನಾಗರಿಕ ಧ್ವನಿ ಸಮಾಲೋಚನೆ',
      autoDetected: '⚡ ಸ್ವಯಂ-ಪತ್ತೆ: ಕನ್ನಡ',
      langSelectorLabel: 'ಭಾಷೆ:',
      selectedLanguage: 'ಆಯ್ದ ಭಾಷೆ: ಕನ್ನಡ',
      activeDoc: 'ಸಕ್ರಿಯ ದಾಖಲೆ:',
      changeDoc: 'ದಾಖಲೆ ಬದಲಾಯಿಸಿ',
      scanUploadTitle: 'ದಾಖಲೆ ಸ್ಕ್ಯಾನ್ ಅಥವಾ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ',
      scanUploadSubtitle: 'ದಾಖಲೆಯ ಶೀರ್ಷಿಕೆ ಸ್ವಯಂ ಪತ್ತೆಹಚ್ಚಿ, ಪೂರ್ಣ ಪಠ್ಯವನ್ನು ಓದಿ ಮುಖ್ಯ ಅಂಶಗಳ ಸಾರಾಂಶ ನೀಡುತ್ತದೆ',
      scanUploadBtn: 'ಸ್ಕ್ಯಾನ್ / ಅಪ್‌ಲೋಡ್',
      attachDocTooltip: 'ದಾಖಲೆ ಲಗತ್ತಿಸಿ (PDF / ಚಿತ್ರ)',
      attachedBadge: 'ಲಗತ್ತಿಸಲಾದ ಕಡತ',
      readingAttached: 'ಕಡತವನ್ನು ಪರಿಶೀಲಿಸಿ ಸ್ವಯಂ-ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...',
      expiringAlert: '⚠️ ಶಾಸನಬದ್ಧ ನೋಟಿಸ್ ಅವಧಿ ಮುಕ್ತಾಯ ಜ್ಞಾಪನೆ',
      overdueAlert: '⚠️ ಶಾಸನಬದ್ಧ ಅಂತಿಮ ಗಡುವು ಮೀರಿದೆ!',
      passedDueDate: 'ಅಂತಿಮ ಗಡುವು ಮೀರಿದೆ',
      daysOverdue: 'ದಿನಗಳು ಕಳೆದಿವೆ',
      noDueDate: 'ಯಾವುದೇ ಅಂತಿಮ ಗಡುವಿಲ್ಲ (ಮಾಹಿತಿ ಉದ್ದೇಶ)',
      switchSummaryLang: 'ಸಾರಾಂಶ ಮತ್ತು ಧ್ವನಿ ಭಾಷೆ:',
      voiceLangLabel: 'ಧ್ವನಿ ಭಾಷೆ:',
      issueDate: 'ನೀಡಿದ ದಿನಾಂಕ',
      daysLeft: 'ದಿನಗಳು ಬಾಕಿ',
      setCalendar: 'ಕ್ಯಾಲೆಂಡರ್ ಜ್ಞಾಪನೆ',
      browserAlert: 'ಬ್ರೌಸರ್ ಎಚ್ಚರಿಕೆ',
      authority: 'ಹೊರಡಿಸಿದ ಪ್ರಾಧಿಕಾರ',
      dueDate: 'ಶಾಸನಬದ್ಧ ಅಂತಿಮ ದಿನಾಂಕ',
      penaltyLabel: 'ದಂಡ / ಶಾಸನಬದ್ಧ ಬಡ್ಡಿ',
      demandedAmount: 'ಬೇಡಿಕೆ ಮೊತ್ತ',
      requiredAction: 'ಅಗತ್ಯ ಮುಂದಿನ ಕ್ರಮ',
      plainSummary: 'ಸರಳ ಸಾರಾಂಶ',
      laymanSummaryTitle: 'ಸರಳ ಭಾಷೆಯ ಸಾರಾಂಶ (Layman\'s Terms)',
      keyPointsTitle: 'ದಾಖಲೆಯ ಪ್ರಮುಖ ಅಂಶಗಳು (Key Points)',
      understandingTitle: 'ತಿಳುವಳಿಕೆ ಪರಿಶೀಲನೆ (Comprehension Check)',
      verifiedUnderstanding: 'ದೃಢೀಕರಿಸಿದ ವಿವರಣೆ:',
      extractedFacts: 'ದಾಖಲೆಯಿಂದ ಪಡೆದ ಪ್ರಮುಖ ಮಾಹಿತಿ',
      listen: 'ಧ್ವನಿ ಆಲಿಸಿ:',
      readAloud: 'ಧ್ವನಿಯಲ್ಲಿ ಓದಿ',
      stopVoice: 'ಧ್ವನಿ ನಿಲ್ಲಿಸಿ',
      askNaturally: 'ಧ್ವನಿಯಲ್ಲಿ ಕೇಳಿ (ಮಾತನಾಡಲು ಒತ್ತಿ)',
      sampleQuestions: [
        'ನನ್ನ ಆದಾಯ ತೆರಿಗೆ ನೋಟಿಸ್‌ಗೆ ಕೊನೆಯ ದಿನಾಂಕ ಯಾವಾಗ ಮತ್ತು ನಾನು ಏನು ಮಾಡಬೇಕು?',
        'ಸೆಕ್ಷನ್ 154 ತಿದ್ದುಪಡಿ ಪ್ರಕ್ರಿಯೆಯನ್ನು ಸರಳ ಭಾಷೆಯಲ್ಲಿ ವಿವರಿಸಿ',
        'ಈ ನೋಟಿಸ್ ವಿರುದ್ಧ ಕಾನೂನುಬದ್ಧವಾಗಿ ಆಕ್ಷೇಪಣೆ ಸಲ್ಲಿಸುವುದು ಹೇಗೆ?',
        'ಹೆಚ್ಚುವರಿ ದಂಡ ಅಥವಾ ಬಡ್ಡಿಯನ್ನು ತಪ್ಪಿಸಲು ನಾನು ಏನು ಮಾಡಬೇಕು?'
      ],
      statusTitle: 'Go Vision ಸಹಾಯಕ ಸ್ಥಿತಿ',
      statusSub: 'ಧ್ವನಿ ಪ್ರಥಮ • ಕನ್ನಡ ಭಾಷೆ ಸಕ್ರಿಯವಾಗಿದೆ',
      inputPlaceholder: 'ಕನ್ನಡದಲ್ಲಿ ಪ್ರಶ್ನೆ ಅಥವಾ ಸೂಚನೆಗಳನ್ನು ಟೈಪ್ ಮಾಡಿ ಅಥವಾ ಧ್ವನಿ ಬಳಸಿ...',
      send: 'ಕಳುಹಿಸಿ',
      privacyFooter: 'ಧ್ವನಿ ಪ್ರಥಮ • ಯಾವುದೇ ಡೇಟಾ ಉಳಿಸುವುದಿಲ್ಲ • ಖಾಸಗಿ ನಾಗರಿಕ ಸಹಾಯಕ',
      spacebarHint: 'ಸ್ಪೇಸ್‌ಬಾರ್ ಒತ್ತಿ ಹಿಡಿದು ಮಾತನಾಡಿ',
      voiceOn: 'ಧ್ವನಿ: ಆನ್',
      voiceMute: 'ಧ್ವನಿ: ಮ್ಯೂಟ್'
    },
    en: {
      appTitle: 'GO VISION',
      role: 'Role: Go Vision Assistant',
      headerBadge: 'Assistant / Citizen Voice Session',
      autoDetected: '⚡ Auto-Detected: English',
      langSelectorLabel: 'Language:',
      selectedLanguage: 'Selected Language: English',
      activeDoc: 'Active Document:',
      changeDoc: 'Change Notice Context',
      scanUploadTitle: 'Scan or Upload Document',
      scanUploadSubtitle: 'Auto-detects document heading, reads entire text neatly & extracts key points in English',
      scanUploadBtn: 'Scan / Upload',
      attachDocTooltip: 'Attach document file (PDF / Image)',
      attachedBadge: 'Attached Document',
      readingAttached: 'Reading attached file and auto-detecting document details neatly...',
      expiringAlert: '⚠️ Statutory Notice Expiry Reminder',
      overdueAlert: '⚠️ Statutory Due Date Passed!',
      passedDueDate: 'Passed Due Date',
      daysOverdue: 'Days Overdue',
      noDueDate: 'No Due Date Mentioned (Informational)',
      switchSummaryLang: 'Summary & Voice Language:',
      voiceLangLabel: 'Voice Language:',
      issueDate: 'Issue Date',
      daysLeft: 'Days Left',
      setCalendar: 'Set Calendar Reminder',
      browserAlert: 'Browser Alert',
      authority: 'Issuing Authority',
      dueDate: 'Statutory Due Date',
      penaltyLabel: 'Penalty / Statutory Surcharge',
      demandedAmount: 'Demanded Amount',
      requiredAction: 'Required Next Step',
      plainSummary: 'Plain Summary',
      laymanSummaryTitle: 'Layman\'s Terms Summary (Plain Words)',
      keyPointsTitle: 'Key Points Present in Document',
      understandingTitle: 'Check Your Understanding (Comprehension Check)',
      verifiedUnderstanding: 'Verified Understanding:',
      extractedFacts: 'Extracted Notice Facts',
      listen: 'Listen:',
      readAloud: 'Read Aloud',
      stopVoice: 'Stop Voice',
      askNaturally: 'Ask Naturally (Tap to Speak)',
      sampleQuestions: [
        'When is my income tax notice deadline and what should I do?',
        'Explain Section 154 rectification steps in simple language',
        'How can I legally dispute or appeal against this notice?',
        'What immediate actions prevent extra interest and penalty?'
      ],
      statusTitle: 'Go Vision Assistant Status',
      statusSub: 'Voice First • English Active',
      inputPlaceholder: 'Type questions or instructions in English, or use voice...',
      send: 'Send',
      privacyFooter: 'Voice input is primary • 0 KB sent to unverified endpoints • Data strictly private',
      spacebarHint: 'Hold Spacebar to speak',
      voiceOn: 'Voice: ON',
      voiceMute: 'Voice: MUTE'
    },
    hi: {
      appTitle: 'GO VISION',
      role: 'भूमिका: Go Vision सहायक',
      headerBadge: 'सहायक / नागरिक वॉइस सत्र',
      autoDetected: '⚡ स्वतः-पहचाना गया: हिंदी',
      langSelectorLabel: 'भाषा:',
      selectedLanguage: 'चयनित भाषा: हिंदी',
      activeDoc: 'सक्रिय दस्तावेज:',
      changeDoc: 'दस्तावेज बदलें',
      scanUploadTitle: 'दस्तावेज स्कैन या अपलोड करें',
      scanUploadSubtitle: 'दस्तावेज शीर्षक स्वतः पहचानें, पूरा पाठ पढ़ें और मुख्य बिंदुओं का सारांश प्राप्त करें',
      scanUploadBtn: 'स्कैन / अपलोड',
      attachDocTooltip: 'दस्तावेज संलग्न करें (PDF / चित्र)',
      attachedBadge: 'संलग्न दस्तावेज',
      readingAttached: 'संलग्न दस्तावेज पढ़ा जा रहा है और विवरण का विश्लेषण किया जा रहा है...',
      expiringAlert: '⚠️ वैधानिक नोटिस समाप्ति अनुस्मारक',
      overdueAlert: '⚠️ वैधानिक देय तिथि समाप्त हो चुकी है!',
      passedDueDate: 'देय तिथि समाप्त',
      daysOverdue: 'दिन का विलंब',
      noDueDate: 'कोई देय तिथि उल्लिखित नहीं है (केवल सूचना)',
      switchSummaryLang: 'सारांश और आवाज़ की भाषा:',
      voiceLangLabel: 'आवाज़ की भाषा:',
      issueDate: 'जारी करने की तिथि',
      daysLeft: 'दिन शेष',
      setCalendar: 'कैलेंडर अनुस्मारक',
      browserAlert: 'ब्राउज़र अलर्ट',
      authority: 'जारीकर्ता प्राधिकरण',
      dueDate: 'वैधानिक देय तिथि',
      penaltyLabel: 'जुर्माना / वैधानिक अधिभार',
      demandedAmount: 'मांग राशि',
      requiredAction: 'आवश्यक अगला कदम',
      plainSummary: 'सरल सारांश',
      laymanSummaryTitle: 'सरल भाषा में सारांश (Layman\'s Terms)',
      keyPointsTitle: 'दस्तावेज के मुख्य बिंदु (Key Points)',
      understandingTitle: 'अपनी समझ जांचें (Comprehension Check)',
      verifiedUnderstanding: 'सत्यापित समझ:',
      extractedFacts: 'दस्तावेज से प्राप्त मुख्य तथ्य',
      listen: 'आवाज़ सुनें:',
      readAloud: 'आवाज़ में पढ़ें',
      stopVoice: 'आवाज़ रोकें',
      askNaturally: 'आसानी से पूछें (बोलने के लिए टैप करें)',
      sampleQuestions: [
        'मेरे आयकर नोटिस की अंतिम तिथि कब है और मुझे क्या करना चाहिए?',
        'धारा 154 सुधार प्रक्रिया को सरल भाषा में समझाएं',
        'इस नोटिस के खिलाफ कानूनी रूप से आपत्ति कैसे दर्ज करें?',
        'अतिरिक्त जुर्माना या ब्याज से बचने के लिए क्या कदम उठाएं?'
      ],
      statusTitle: 'Go Vision सहायक स्थिति',
      statusSub: 'वॉइस प्रथम • हिंदी भाषा सक्रिय',
      inputPlaceholder: 'हिंदी में प्रश्न या निर्देश टाइप करें या वॉइस का उपयोग करें...',
      send: 'भेजें',
      privacyFooter: 'वॉइस इनपुट प्राथमिक है • कोई व्यक्तिगत डेटा संग्रहीत नहीं होता • निजी नागरिक सहायक',
      spacebarHint: 'बोलने के लिए स्पेसबार दबाकर रखें',
      voiceOn: 'आवाज़: ऑन',
      voiceMute: 'आवाज़: म्यूट'
    }
  };

  const getEffectiveLang = (): 'kn' | 'hi' | 'en' => {
    if (selectedLanguage === 'auto') {
      return detectedLanguage || 'kn';
    }
    return selectedLanguage;
  };

  const currentLang = getEffectiveLang();
  const t = UI_TEXT[currentLang];

  // Helper functions for language switching
  const handleSelectLanguage = (lang: InputLanguageSetting) => {
    setSelectedLanguage(lang);
    if (lang === 'auto') {
      setInputLanguage('auto');
      setVoiceOutputLanguage('auto');
    } else {
      setInputLanguage(lang);
      setVoiceOutputLanguage(lang);
      setDetectedLanguage(lang);
    }
  };

  const getTurnMainText = (turn: ConversationTurn, lang: 'kn' | 'hi' | 'en'): string => {
    if (lang === 'kn' && turn.kannadaText) return turn.kannadaText;
    if (lang === 'hi' && turn.hindiText) return turn.hindiText;
    if (lang === 'en' && turn.englishText) return turn.englishText;
    return turn.text;
  };

  const getTurnLaymanSummary = (turn: ConversationTurn, lang: 'kn' | 'hi' | 'en'): string | undefined => {
    if (lang === 'kn') {
      return turn.laymanSummaryKn || (typeof turn.laymanSummary === 'object' && turn.laymanSummary !== null ? turn.laymanSummary.kn : undefined) || (typeof turn.laymanSummary === 'string' ? turn.laymanSummary : undefined);
    }
    if (lang === 'hi') {
      return turn.laymanSummaryHi || (typeof turn.laymanSummary === 'object' && turn.laymanSummary !== null ? turn.laymanSummary.hi : undefined) || (typeof turn.laymanSummary === 'string' ? turn.laymanSummary : undefined);
    }
    return turn.laymanSummaryEn || (typeof turn.laymanSummary === 'object' && turn.laymanSummary !== null ? turn.laymanSummary.en : undefined) || (typeof turn.laymanSummary === 'string' ? turn.laymanSummary : undefined);
  };

  const getTurnKeyPoints = (turn: ConversationTurn, lang: 'kn' | 'hi' | 'en'): string[] | undefined => {
    if (lang === 'kn' && turn.keyPointsKn && turn.keyPointsKn.length > 0) return turn.keyPointsKn;
    if (lang === 'hi' && turn.keyPointsHi && turn.keyPointsHi.length > 0) return turn.keyPointsHi;
    if (lang === 'en' && turn.keyPointsEn && turn.keyPointsEn.length > 0) return turn.keyPointsEn;
    return turn.keyPoints;
  };

  const getTurnUnderstandingCheck = (turn: ConversationTurn, lang: 'kn' | 'hi' | 'en') => {
    if (!turn.understandingCheck) return undefined;
    return turn.understandingCheck.map(check => ({
      question: lang === 'kn' ? (check.questionKn || check.question) : lang === 'hi' ? (check.questionHi || check.question) : check.question,
      explanation: lang === 'kn' ? (check.explanationKn || check.explanation) : lang === 'hi' ? (check.explanationHi || check.explanation) : check.explanation
    }));
  };

  const getActionButtonLabel = (action: string, defaultLabel: string, lang: 'kn' | 'hi' | 'en'): string => {
    if (lang === 'kn') {
      if (action === 'calendar') return 'ಕ್ಯಾಲೆಂಡರ್ ಜ್ಞಾಪನೆ ಹೊಂದಿಸಿ';
      if (action === 'procedure') return 'ಹಂತ-ಹಂತದ ವಿಧಾನ ತಿಳಿಸಿ';
      if (action === 'draft') return 'ಅಧಿಕೃತ ಪ್ರತಿಕ್ರಿಯೆ ಕರಡು';
      if (action === 'scan') return 'ದಾಖಲೆ ಸ್ಕ್ಯಾನ್ / ಅಪ್‌ಲೋಡ್';
      if (action === 'deadlines') return 'ಗಡುವುಗಳ ಪಟ್ಟಿ ಪರಿಶೀಲಿಸಿ';
      if (action === 'rights') return 'ಕಾನೂನುಬದ್ಧ ಪರಿಹಾರಗಳು';
      if (action === 'help') return 'ಕಾನೂನು ನೆರವು ಪಡೆಯಿರಿ';
    } else if (lang === 'hi') {
      if (action === 'calendar') return 'कैलेंडर अनुस्मारक सेट करें';
      if (action === 'procedure') return 'चरण-दर-चरण प्रक्रिया समझें';
      if (action === 'draft') return 'औपचारिक उत्तर तैयार करें';
      if (action === 'scan') return 'दस्तावेज स्कैन या अपलोड करें';
      if (action === 'deadlines') return 'आगामी समय सीमाएं देखें';
      if (action === 'rights') return 'वैधानिक समाधान चैनल देखें';
      if (action === 'help') return 'कानूनी सहायता प्राप्त करें';
    }
    return defaultLabel;
  };

  // Turn-level Language & Voice Switchers
  const handleSwitchTurnLanguage = (turnId: string, lang: 'kn' | 'hi' | 'en') => {
    setTurnLanguages(prev => ({ ...prev, [turnId]: lang }));
    setTurnVoiceLangs(prev => ({ ...prev, [turnId]: lang }));
    soundController.playBeep(580, 'sine', 0.1);
  };

  const handleSwitchTurnVoiceOnly = (turnId: string, voiceLang: VoiceOutputLanguage) => {
    setTurnVoiceLangs(prev => ({ ...prev, [turnId]: voiceLang }));
    soundController.playBeep(520, 'sine', 0.1);
  };

  const getTurnActiveLang = (turn: ConversationTurn): 'kn' | 'hi' | 'en' => {
    if (turnLanguages[turn.id]) return turnLanguages[turn.id];
    if (turn.selectedDisplayLang) return turn.selectedDisplayLang;
    return currentLang;
  };

  const getTurnVoiceLang = (turn: ConversationTurn): VoiceOutputLanguage => {
    if (turnVoiceLangs[turn.id]) return turnVoiceLangs[turn.id];
    return getTurnActiveLang(turn);
  };

  // Voice Input States
  const [isListening, setIsListening] = useState<boolean>(false);
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [textInput, setTextInput] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isVoiceResponseEnabled, setIsVoiceResponseEnabled] = useState<boolean>(true);

  // Active Notice Context
  const [noticesList, setNoticesList] = useState<StatutoryNotice[]>(MOCK_NOTICES);
  const activeNotice = noticesList.find(n => n.id === activeNoticeId) || noticesList[0];

  // Conversation turns with dedicated single-language texts
  const [turns, setTurns] = useState<ConversationTurn[]>([
    {
      id: 'turn-welcome',
      type: 'assistant',
      timestamp: '10:40 AM',
      text: 'ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ Go Vision ಸಹಾಯಕ. ನಿಮ್ಮ ಸರ್ಕಾರಿ ನೋಟಿಸ್‌ಗಳು, ತೆರಿಗೆ ಪತ್ರಗಳು ಅಥವಾ ನಾಗರಿಕ ದಾಖಲೆಗಳ ಬಗ್ಗೆ ನೀವು ಮುಕ್ತವಾಗಿ ಮಾತನಾಡಬಹುದು ಅಥವಾ ದಾಖಲೆಗಳನ್ನು ಸ್ಕ್ಯಾನ್ ಮಾಡಬಹುದು.',
      language: 'kn',
      detectedLanguage: 'kn',
      kannadaText: 'ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ Go Vision ಸಹಾಯಕ. ನಿಮ್ಮ ಸರ್ಕಾರಿ ನೋಟಿಸ್‌ಗಳು, ತೆರಿಗೆ ಪತ್ರಗಳು ಅಥವಾ ನಾಗರಿಕ ದಾಖಲೆಗಳ ಬಗ್ಗೆ ನೀವು ಮುಕ್ತವಾಗಿ ಮಾತನಾಡಬಹುದು ಅಥವಾ ದಾಖಲೆಗಳನ್ನು ಸ್ಕ್ಯಾನ್ ಮಾಡಬಹುದು.',
      hindiText: 'नमस्ते! मैं आपका Go Vision सहायक हूँ। आप अपने सरकारी नोटिस या नागरिक दस्तावेजों के बारे में मुझसे सीधे बात कर सकते हैं या दस्तावेज स्कैन कर सकते हैं।',
      englishText: 'Hello! I am your Go Vision Assistant. You can speak naturally about your official notices, tax letters, or civic documents, or scan a document.',
      laymanSummary: 'In plain words: I am your legal and civic document explainer. Show me any official notice, letter, or summons, and I will explain what it means in simple everyday words without legal jargon.',
      laymanSummaryKn: 'ಸರಳ ಭಾಷೆಯಲ್ಲಿ: ನಾನು ನಿಮ್ಮ ಅಧಿಕೃತ ದಾಖಲೆ ವಿಶ್ಲೇಷಕ ಸಹಾಯಕ. ನಿಮ್ಮ ಯಾವುದೇ ಸರ್ಕಾರಿ ನೋಟಿಸ್, ಪತ್ರ ಅಥವಾ ಸಮನ್ಸ್ ತೋರಿಸಿ, ನಾನು ಅದನ್ನು ಕಾನೂನು ಗೋಜುಗಳಿಲ್ಲದೆ ಸರಳ ಮಾತುಗಳಲ್ಲಿ ವಿವರಿಸುತ್ತೇನೆ.',
      laymanSummaryHi: 'साधारण शब्दों में: मैं आपका कानूनी और नागरिक दस्तावेज सहायक हूँ। मुझे कोई भी सरकारी नोटिस या पत्र दिखाएं, मैं बिना किसी कानूनी जटिलता के सरल शब्दों में उसका अर्थ समझाऊंगा।',
      laymanSummaryEn: 'In plain words: I am your legal and civic document explainer. Show me any official notice, letter, or summons, and I will explain what it means in simple everyday words without legal jargon.',
      keyPoints: [
        'Voice-first official and statutory document assistance',
        'Automatic language detection with pure single-language display in Kannada, English, or Hindi',
        'Direct calendar deadline reminders and comprehension checks'
      ],
      keyPointsKn: [
        'ಧ್ವನಿ ಆಧಾರಿತ ಅಧಿಕೃತ ಮತ್ತು ಶಾಸನಬದ್ಧ ದಾಖಲೆಗಳ ನೆರವು',
        'ಕನ್ನಡ, ಇಂಗ್ಲಿಷ್ ಅಥವಾ ಹಿಂದಿಯಲ್ಲಿ ಪ್ರತ್ಯೇಕ ಶುದ್ಧ ಭಾಷಾ ಪ್ರದರ್ಶನ',
        'ನೇರ ಕ್ಯಾಲೆಂಡರ್ ಗಡುವು ಜ್ಞಾಪನೆಗಳು ಮತ್ತು ತಿಳುವಳಿಕೆ ಪರಿಶೀಲನೆ'
      ],
      keyPointsHi: [
        'वॉइस-आधारित आधिकारिक और वैधानिक दस्तावेज सहायता',
        'कन्नड़, अंग्रेजी या हिंदी में स्पष्ट एकल-भाषा प्रदर्शन',
        'सीधे कैलेंडर समाप्ति अनुस्मारक और समझ की जांच'
      ],
      keyPointsEn: [
        'Voice-first official and statutory document assistance',
        'Automatic language detection with pure single-language display in Kannada, English, or Hindi',
        'Direct calendar deadline reminders and comprehension checks'
      ],
      extractedInfo: {
        deadline: 'March 24, 2025',
        daysRemaining: 4,
        amount: '₹ 18,450',
        authority: 'Income Tax Department (CPC)',
        action: 'Submit online rectification under Section 154 for TDS credit mismatch',
        isCritical: true
      },
      actionButtons: [
        { label: 'Set Calendar Reminder', action: 'calendar' },
        { label: 'Explain Section 154 Procedure', action: 'procedure' },
        { label: 'Draft Formal Response', action: 'draft' }
      ]
    },
    {
      id: 'turn-1',
      type: 'user',
      timestamp: '10:42 AM',
      text: 'ನನ್ನ ಆದಾಯ ತೆರಿಗೆ ನೋಟಿಸ್ಗೆ ಕೊನೆಯ ದಿನಾಂಕ ಯಾವಾಗ ಮತ್ತು ನಾನು ಏನು ಮಾಡಬೇಕು?',
      kannadaText: 'ನನ್ನ ಆದಾಯ ತೆರಿಗೆ ನೋಟಿಸ್ಗೆ ಕೊನೆಯ ದಿನಾಂಕ ಯಾವಾಗ ಮತ್ತು ನಾನು ಏನು ಮಾಡಬೇಕು?',
      hindiText: 'मेरे आयकर नोटिस की अंतिम तिथि कब है और मुझे क्या करना चाहिए?',
      englishText: 'When is my income tax notice deadline and what should I do?',
      detectedLanguage: 'kn'
    },
    {
      id: 'turn-2',
      type: 'assistant',
      timestamp: '10:42 AM',
      text: 'ನಿಮ್ಮ ಸೆಕ್ಷನ್ 143(1) ಆದಾಯ ತೆರಿಗೆ ನೋಟಿಸ್‌ಗೆ ಉತ್ತರಿಸಲು ಮಾರ್ಚ್ 24, 2025 ಕೊನೆಯ ದಿನಾಂಕ (ಇನ್ನು 4 ದಿನಗಳು ಮಾತ್ರ ಬಾಕಿ ಉಳಿದಿದೆ). ಫಾರ್ಮ್ 26AS ನಡುವಿನ ವ್ಯತ್ಯಾಸದಿಂದ ₹18,450 ಮೊತ್ತವನ್ನು ಪಾವತಿಸಲು ತಿಳಿಸಲಾಗಿದೆ. ದಂಡ ತಪ್ಪಿಸಲು ಸೆಕ್ಷನ್ 154 ಅಡಿಯಲ್ಲಿ ಆನ್‌ಲೈನ್ ತಿದ್ದುಪಡಿ ಸಲ್ಲಿಸಬೇಕು.',
      language: 'kn',
      detectedLanguage: 'kn',
      kannadaText: 'ನಿಮ್ಮ ಸೆಕ್ಷನ್ 143(1) ಆದಾಯ ತೆರಿಗೆ ನೋಟಿಸ್‌ಗೆ ಉತ್ತರಿಸಲು ಮಾರ್ಚ್ 24, 2025 ಕೊನೆಯ ದಿನಾಂಕ (ಇನ್ನು 4 ದಿನಗಳು ಮಾತ್ರ ಬಾಕಿ ಉಳಿದಿದೆ). ಫಾರ್ಮ್ 26AS ನಡುವಿನ ವ್ಯತ್ಯಾಸದಿಂದ ₹18,450 ಮೊತ್ತವನ್ನು ಪಾವತಿಸಲು ತಿಳಿಸಲಾಗಿದೆ. ದಂಡ ತಪ್ಪಿಸಲು ಸೆಕ್ಷನ್ 154 ಅಡಿಯಲ್ಲಿ ಆನ್‌ಲೈನ್ ತಿದ್ದುಪಡಿ ಸಲ್ಲಿಸಬೇಕು.',
      hindiText: 'आपकी धारा 143(1) आयकर नोटिस का जवाब देने की अंतिम तिथि 24 मार्च 2025 है (4 दिन शेष)। टीडीएस अंतर के कारण ₹18,450 की मांग की गई है। धारा 154 के तहत ऑनलाइन सुधार याचिका दायर करें।',
      englishText: 'The statutory deadline for your Section 143(1) notice is March 24, 2025 (4 days remaining). Demanded amount is ₹18,450 due to TDS mismatch. File online rectification under Section 154.',
      laymanSummary: 'In plain words: The tax department calculated ₹18,450 tax due to a mismatch between what your employer reported and your return. If this is a clerical error, you can submit a rectification online without paying. But you must act within 4 days (by March 24) to avoid 1% monthly penalty interest.',
      laymanSummaryKn: 'ಸರಳ ಭಾಷೆಯಲ್ಲಿ: ಉದ್ಯೋಗದಾತರು ವರದಿ ಮಾಡಿದ ಟಿಡಿಎಸ್ ಮತ್ತು ನಿಮ್ಮ ರಿಟರ್ನ್ ನಡುವೆ ₹18,450 ವ್ಯತ್ಯಾಸವಿದೆ. ಇದು ತಪ್ಪಾಗಿದ್ದರೆ, ಹಣ ಪಾವತಿಸದೆ ಆನ್‌ಲೈನ್‌ನಲ್ಲಿ ತಿದ್ದುಪಡಿ ಸಲ್ಲಿಸಬಹುದು. ಆದರೆ 1% ಮಾಸಿಕ ಬಡ್ಡಿ ತಪ್ಪಿಸಲು 4 ದಿನಗಳೊಳಗೆ (ಮಾರ್ಚ್ 24) ಉತ್ತರಿಸಿ.',
      laymanSummaryHi: 'साधारण शब्दों में: टीडीएस विसंगति के कारण ₹18,450 की मांग है। यदि यह लिपिकीय त्रुटि है तो आप बिना भुगतान किए ऑनलाइन सुधार कर सकते हैं। 1% ब्याज से बचने के लिए 4 दिनों में जवाब दें।',
      laymanSummaryEn: 'In plain words: The tax department calculated ₹18,450 tax due to a mismatch between what your employer reported and your return. If this is a clerical error, you can submit a rectification online without paying. But you must act within 4 days (by March 24) to avoid 1% monthly penalty interest.',
      keyPoints: [
        'Section 143(1) intimation issued for ₹18,450 tax adjustment',
        'TDS reported by deductor does not match claimed credit in Form 26AS',
        'Online rectification under Section 154 available before March 24, 2025'
      ],
      keyPointsKn: [
        '₹18,450 ತೆರಿಗೆ ಹೊಂದಾಣಿಕೆಗಾಗಿ ಸೆಕ್ಷನ್ 143(1) ಅಡಿಯಲ್ಲಿ ನೋಟಿಸ್ ನೀಡಲಾಗಿದೆ',
        'ಉದ್ಯೋಗದಾತರು ವರದಿ ಮಾಡಿದ ಟಿಡಿಎಸ್ ಮತ್ತು ಫಾರ್ಮ್ 26AS ಕ್ರೆಡಿಟ್ ನಡುವೆ ವ್ಯತ್ಯಾಸವಿದೆ',
        'ಮಾರ್ಚ್ 24, 2025 ರೊಳಗೆ ಸೆಕ್ಷನ್ 154 ಅಡಿಯಲ್ಲಿ ಆನ್‌ಲೈನ್ ತಿದ್ದುಪಡಿ ಸಲ್ಲಿಸಲು ಅವಕಾಶವಿದೆ'
      ],
      keyPointsHi: [
        '₹18,450 कर समायोजन के लिए धारा 143(1) के तहत सूचना जारी की गई',
        'कंपनी द्वारा जमा टीडीएस फॉर्म 26AS के क्रेडिट से मेल नहीं खाता',
        '24 मार्च 2025 से पहले धारा 154 के तहत ऑनलाइन सुधार दाखिल किया जा सकता है'
      ],
      keyPointsEn: [
        'Section 143(1) intimation issued for ₹18,450 tax adjustment',
        'TDS reported by deductor does not match claimed credit in Form 26AS',
        'Online rectification under Section 154 available before March 24, 2025'
      ],
      understandingCheck: [
        {
          question: 'Do you immediately have to pay ₹18,450?',
          questionKn: 'ನೀವು ತಕ್ಷಣವೇ ₹18,450 ಪಾವತಿಸಬೇಕೇ?',
          questionHi: 'क्या आपको तुरंत ₹18,450 का भुगतान करना होगा?',
          explanation: 'No! If your TDS credit was valid, you can file a free rectification petition under Section 154 without paying the demand.',
          explanationKn: 'ಇಲ್ಲ! ನಿಮ್ಮ ಟಿಡಿಎಸ್ ದಾಖಲೆಗಳು ಸರಿಯಾಗಿದ್ದರೆ, ಹಣ ಪಾವತಿಸದೆ ಸೆಕ್ಷನ್ 154 ಅಡಿಯಲ್ಲಿ ಆನ್‌ಲೈನ್ ತಿದ್ದುಪಡಿ ಸಲ್ಲಿಸಬಹುದು.',
          explanationHi: 'नहीं! यदि आपका टीडीएस सही है, तो आप बिना भुगतान किए धारा 154 के तहत ऑनलाइन सुधार दर्ज कर सकते हैं।'
        },
        {
          question: 'What is the absolute deadline to submit your response?',
          questionKn: 'ಉತ್ತರಿಸಲು ಅಂತಿಮ ಗಡುವು ಯಾವಾಗ?',
          questionHi: 'जवाब देने की अंतिम तिथि क्या है?',
          explanation: 'March 24, 2025 (only 4 days remaining). Beyond this, statutory monthly interest applies.',
          explanationKn: 'ಮಾರ್ಚ್ 24, 2025 (4 ದಿನಗಳು ಮಾತ್ರ ಬಾಕಿ). ನಂತರ ಸೆಕ್ಷನ್ 220(2) ರ ಅಡಿಯಲ್ಲಿ ಪ್ರತಿ ತಿಂಗಳು 1% ಬಡ್ಡಿ ಬೀಳುತ್ತದೆ.',
          explanationHi: '24 मार्च 2025 (4 दिन शेष)। इसके बाद धारा 220(2) के तहत 1% मासिक ब्याज लगना शुरू हो जाएगा।'
        }
      ],
      expiryNotice: {
        isExpiringSoon: true,
        daysRemaining: 4,
        deadline: '2025-03-24',
        penaltyWarning: '1% per month statutory interest applies post-deadline.'
      },
      extractedInfo: {
        deadline: '2025-03-24',
        daysRemaining: 4,
        amount: '₹ 18,450',
        authority: 'Income Tax Department (CPC)',
        action: 'File rectification under Section 154 or pay demand',
        isCritical: true,
        isExpiringSoon: true
      },
      actionButtons: [
        { label: 'Set Calendar Reminder', action: 'calendar' },
        { label: 'Explain Step-by-Step Procedure', action: 'procedure' },
        { label: 'Draft Formal Response', action: 'draft' }
      ]
    }
  ]);

  // Modals
  const [isDocScannerOpen, setIsDocScannerOpen] = useState(false);
  const [isNoticeSelectorOpen, setIsNoticeSelectorOpen] = useState(false);
  const [isRectificationOpen, setIsRectificationOpen] = useState(false);
  const [isDraftOpen, setIsDraftOpen] = useState(false);

  // Sync voice response preference with controller
  useEffect(() => {
    soundController.speechEnabled = isVoiceResponseEnabled;
  }, [isVoiceResponseEnabled]);

  // Map speech recognition code based on input preference or detected language
  const getSpeechLocale = (): string => {
    if (inputLanguage === 'kn') return 'kn-IN';
    if (inputLanguage === 'hi') return 'hi-IN';
    if (inputLanguage === 'en') return 'en-IN';
    // When auto-detecting, start with detectedLanguage or fallback to 'kn-IN'
    return detectedLanguage === 'hi' ? 'hi-IN' : detectedLanguage === 'en' ? 'en-IN' : 'kn-IN';
  };

  // Start or Stop Voice Input
  const toggleVoiceListening = () => {
    if (isListening) {
      soundController.stopSpeechRecognition();
      setIsListening(false);
      setInterimTranscript('');
      soundController.playBeep(380, 'sine', 0.15);
    } else {
      setVoiceError(null);
      setInterimTranscript('');
      
      const success = soundController.startSpeechRecognition({
        langCode: getSpeechLocale(),
        onStart: () => {
          setIsListening(true);
        },
        onInterim: (text) => {
          setInterimTranscript(text);
          const liveDetected = detectLanguage(text);
          if (liveDetected) {
            setDetectedLanguage(liveDetected);
          }
        },
        onResult: (finalText, detected) => {
          setIsListening(false);
          setInterimTranscript('');
          setDetectedLanguage(detected);
          handleSendMessage(finalText, detected);
        },
        onError: (err) => {
          setIsListening(false);
          setVoiceError(err);
        },
        onEnd: () => {
          setIsListening(false);
        }
      });

      if (!success) {
        setIsListening(false);
      }
    }
  };

  // Speak assistant response helper with turn language & voice preference
  const handlePlayAssistantVoice = (turn: ConversationTurn, forcedVoiceLang?: VoiceOutputLanguage) => {
    const activeLang = getTurnActiveLang(turn);
    const chosenVoice = forcedVoiceLang || getTurnVoiceLang(turn) || voiceOutputLanguage;
    const targetVoiceLang: 'kn' | 'hi' | 'en' = chosenVoice === 'auto' ? activeLang : chosenVoice;

    soundController.stopSpeaking();
    setSpeakingTurnId(turn.id);

    const primaryText = getTurnMainText(turn, targetVoiceLang);
    const layman = getTurnLaymanSummary(turn, targetVoiceLang);
    const speechText = layman ? `${primaryText}. ${layman}` : primaryText;

    soundController.speakText(
      speechText,
      targetVoiceLang,
      () => {
        setSpeakingTurnId(null);
      }
    );
  };

  const handleStopAssistantVoice = () => {
    soundController.stopSpeaking();
    setSpeakingTurnId(null);
  };

  // Quick Voice Output Test
  const handleTestVoiceOutput = (lang: VoiceOutputLanguage) => {
    const target = lang === 'auto' ? detectedLanguage : lang;
    let sample = '';
    if (target === 'kn') {
      sample = 'ನಮಸ್ಕಾರ! ಇದು Go Vision ಸಹಾಯಕನ ಕನ್ನಡ ಧ್ವನಿ ಔಟ್‌ಪುಟ್.';
    } else if (target === 'hi') {
      sample = 'नमस्ते! यह Go Vision सहायक का हिंदी आवाज़ आउटपुट है।';
    } else {
      sample = 'Hello! This is Go Vision Assistant voice output in English.';
    }
    soundController.speakText(sample, target);
  };

  // Process user message (via voice or text) with Gemini backend
  const handleSendMessage = async (userText: string, forcedDetectedLang?: Language) => {
    if (!userText.trim()) return;

    const currentDetected = forcedDetectedLang || detectLanguage(userText);
    setDetectedLanguage(currentDetected);

    soundController.playBeep(500, 'sine', 0.1);
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Append user message
    const userTurn: ConversationTurn = {
      id: `turn-user-${Date.now()}`,
      type: 'user',
      timestamp: timeStr,
      text: userText.trim(),
      kannadaText: currentDetected === 'kn' ? userText.trim() : undefined,
      hindiText: currentDetected === 'hi' ? userText.trim() : undefined,
      englishText: currentDetected === 'en' ? userText.trim() : undefined,
      detectedLanguage: currentDetected
    };

    setTurns(prev => [...prev, userTurn]);
    setTextInput('');
    setIsProcessing(true);

    try {
      // Call backend API /api/chat
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          history: turns.map(t => ({ role: t.type === 'user' ? 'user' : 'model', text: t.text })),
          documentContext: activeNotice,
          language: inputLanguage === 'auto' ? currentDetected : inputLanguage,
          voiceOutputLang: voiceOutputLanguage
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      const reply = data.response;

      const finalDetectedLang: Language = reply.detectedLanguage || currentDetected;
      setDetectedLanguage(finalDetectedLang);

      const assistantTurn: ConversationTurn = {
        id: `turn-assistant-${Date.now()}`,
        type: 'assistant',
        timestamp: timeStr,
        text: reply.text || 'I have analyzed your request based on the document.',
        kannadaText: reply.kannadaText || (finalDetectedLang === 'kn' ? reply.text : undefined),
        hindiText: reply.hindiText || (finalDetectedLang === 'hi' ? reply.text : undefined),
        englishText: reply.englishText || (finalDetectedLang === 'en' ? reply.text : undefined),
        detectedLanguage: finalDetectedLang,
        safetyRefusal: reply.safetyRefusal,
        laymanSummary: reply.laymanSummary || activeNotice.laymanSummary?.en,
        laymanSummaryKn: reply.laymanSummaryKn || (typeof reply.laymanSummary === 'object' ? reply.laymanSummary.kn : activeNotice.laymanSummary?.kn),
        laymanSummaryHi: reply.laymanSummaryHi || (typeof reply.laymanSummary === 'object' ? reply.laymanSummary.hi : activeNotice.laymanSummary?.hi),
        laymanSummaryEn: reply.laymanSummaryEn || (typeof reply.laymanSummary === 'object' ? reply.laymanSummary.en : (typeof reply.laymanSummary === 'string' ? reply.laymanSummary : activeNotice.laymanSummary?.en)),
        understandingCheck: reply.understandingCheck || (activeNotice.understandingQuestions ? activeNotice.understandingQuestions.map((q: any) => ({
          question: q.question,
          explanation: q.explanation
        })) : undefined),
        expiryNotice: reply.expiryNotice || {
          isExpiringSoon: (activeNotice.daysRemaining ?? 999) <= 7,
          daysRemaining: activeNotice.daysRemaining ?? null,
          deadline: activeNotice.deadlineDate ?? null,
          penaltyWarning: activeNotice.penaltyText
        },
        extractedInfo: reply.extractedInfo || (activeNotice ? {
          deadline: activeNotice.deadlineDate ?? null,
          daysRemaining: activeNotice.daysRemaining ?? null,
          amount: activeNotice.amountDemanded || 'See details',
          authority: activeNotice.department,
          action: activeNotice.requiredAction.en,
          isCritical: activeNotice.urgency === 'CRITICAL',
          isExpiringSoon: (activeNotice.daysRemaining ?? 999) <= 7
        } : undefined),
        actionButtons: reply.actionButtons || [
          { label: 'Set Calendar Reminder', action: 'calendar' },
          { label: 'Explain Step-by-Step Procedure', action: 'procedure' },
          { label: 'Draft Formal Response', action: 'draft' }
        ]
      };

      setTurns(prev => [...prev, assistantTurn]);
      setIsProcessing(false);

      // Voice response with chosen voice output language
      if (isVoiceResponseEnabled) {
        setSpeakingTurnId(assistantTurn.id);
        soundController.speakAssistantTurn(
          {
            text: assistantTurn.text,
            kannadaText: assistantTurn.kannadaText,
            hindiText: assistantTurn.hindiText,
            englishText: assistantTurn.englishText,
            detectedLanguage: finalDetectedLang
          },
          voiceOutputLanguage,
          () => setSpeakingTurnId(null)
        );
      }
    } catch (err: any) {
      console.warn('Network chat fallback:', err);
      // Clean, polite conversational fallback
      const fallbackTurn: ConversationTurn = {
        id: `turn-fallback-${Date.now()}`,
        type: 'assistant',
        timestamp: timeStr,
        text: currentDetected === 'kn'
          ? `${activeNotice.title} ಕುರಿತು: ಉತ್ತರಿಸಲು ಕೊನೆಯ ದಿನಾಂಕ ${activeNotice.deadlineDate} (${activeNotice.daysRemaining} ದಿನಗಳು ಬಾಕಿ). ನೀವು ${activeNotice.requiredAction.kn}.`
          : currentDetected === 'hi'
          ? `${activeNotice.title} के बारे में: नोटिस का जवाब देने की अंतिम तिथि ${activeNotice.deadlineDate} है (${activeNotice.daysRemaining} दिन शेष)। ${activeNotice.requiredAction.hi}`
          : `Regarding your query about ${activeNotice.title}: The statutory deadline is ${activeNotice.deadlineDate} (${activeNotice.daysRemaining} days remaining). You are advised to ${activeNotice.requiredAction.en}.`,
        kannadaText: `${activeNotice.title}: ಉತ್ತರಿಸಲು ಕೊನೆಯ ದಿನಾಂಕ ${activeNotice.deadlineDate} (${activeNotice.daysRemaining} ದಿನಗಳು ಬಾಕಿ). ${activeNotice.requiredAction.kn}`,
        hindiText: `${activeNotice.title}: अंतिम तिथि ${activeNotice.deadlineDate} (${activeNotice.daysRemaining} दिन शेष)। ${activeNotice.requiredAction.hi}`,
        englishText: `${activeNotice.title}: Deadline is ${activeNotice.deadlineDate} (${activeNotice.daysRemaining} days remaining). ${activeNotice.requiredAction.en}`,
        detectedLanguage: currentDetected,
        laymanSummary: activeNotice.laymanSummary?.en,
        laymanSummaryKn: activeNotice.laymanSummary?.kn,
        laymanSummaryHi: activeNotice.laymanSummary?.hi,
        laymanSummaryEn: activeNotice.laymanSummary?.en,
        understandingCheck: activeNotice.understandingQuestions ? activeNotice.understandingQuestions.map(q => ({
          question: q.question,
          explanation: q.explanation
        })) : undefined,
        expiryNotice: {
          isExpiringSoon: (activeNotice.daysRemaining ?? 999) <= 7,
          daysRemaining: activeNotice.daysRemaining ?? null,
          deadline: activeNotice.deadlineDate ?? null,
          penaltyWarning: activeNotice.penaltyText
        },
        extractedInfo: {
          deadline: activeNotice.deadlineDate ?? null,
          daysRemaining: activeNotice.daysRemaining ?? null,
          amount: activeNotice.amountDemanded || 'See document',
          authority: activeNotice.department,
          action: activeNotice.requiredAction.en,
          isCritical: activeNotice.urgency === 'CRITICAL',
          isExpiringSoon: (activeNotice.daysRemaining ?? 999) <= 7
        },
        actionButtons: [
          { label: 'Set Calendar Reminder', action: 'calendar' },
          { label: 'Explain Step-by-Step Procedure', action: 'procedure' },
          { label: 'Draft Formal Response', action: 'draft' }
        ]
      };

      setTurns(prev => [...prev, fallbackTurn]);
      setIsProcessing(false);

      if (isVoiceResponseEnabled) {
        setSpeakingTurnId(fallbackTurn.id);
        soundController.speakAssistantTurn(
          {
            text: fallbackTurn.text,
            kannadaText: fallbackTurn.kannadaText,
            hindiText: fallbackTurn.hindiText,
            englishText: fallbackTurn.englishText,
            detectedLanguage: currentDetected
          },
          voiceOutputLanguage,
          () => setSpeakingTurnId(null)
        );
      }
    }
  };

  // Handle scanned/uploaded document
  const handleDocumentScanned = (scannedNotice: StatutoryNotice, capturedImage?: string) => {
    soundController.playBeep(640, 'sine', 0.2);
    
    // Evaluate dates & overdue/no-due-date status
    const dateStatus = checkDateStatus(scannedNotice.deadlineDate, scannedNotice.issueDate);
    const hasNoDueDate = scannedNotice.hasNoDueDate || dateStatus.hasNoDueDate;
    const isOverdue = scannedNotice.isOverdue || dateStatus.isOverdue;
    const daysOverdue = scannedNotice.daysOverdue || dateStatus.daysOverdue;
    const daysRemaining = hasNoDueDate ? null : (scannedNotice.daysRemaining !== undefined && scannedNotice.daysRemaining !== null ? scannedNotice.daysRemaining : dateStatus.daysRemaining);
    const properDeadline = hasNoDueDate ? null : (scannedNotice.formattedDeadline || dateStatus.formattedDeadline || formatProperDate(scannedNotice.deadlineDate, 'en'));
    const properDeadlineKn = hasNoDueDate ? null : formatProperDate(scannedNotice.deadlineDate, 'kn');
    const properDeadlineHi = hasNoDueDate ? null : formatProperDate(scannedNotice.deadlineDate, 'hi');
    const properIssueDate = scannedNotice.formattedIssueDate || dateStatus.formattedIssueDate || formatProperDate(scannedNotice.issueDate, 'en');

    const enrichedNotice: StatutoryNotice = {
      ...scannedNotice,
      hasNoDueDate,
      isOverdue,
      daysOverdue,
      daysRemaining,
      deadlineDate: hasNoDueDate ? null : scannedNotice.deadlineDate,
      formattedDeadline: properDeadline || undefined,
      formattedIssueDate: properIssueDate || undefined
    };

    // Add to notice list
    setNoticesList(prev => {
      if (prev.some(n => n.id === enrichedNotice.id)) return prev;
      return [enrichedNotice, ...prev];
    });

    setActiveNoticeId(enrichedNotice.id);
    setCurrentView('voice-agent');

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const docTitle = currentLang === 'kn' ? (enrichedNotice.titleKn || enrichedNotice.title) : currentLang === 'hi' ? (enrichedNotice.titleHi || enrichedNotice.title) : (enrichedNotice.titleEn || enrichedNotice.title);
    const docDept = currentLang === 'kn' ? (enrichedNotice.departmentKn || enrichedNotice.department) : currentLang === 'hi' ? (enrichedNotice.departmentHi || enrichedNotice.department) : enrichedNotice.department;
    const userText = currentLang === 'kn' ? `ನಾನು ಹೊಸ ದಾಖಲೆಯನ್ನು ಸ್ಕ್ಯಾನ್ ಮಾಡಿದ್ದೇನೆ: ${docTitle}` : currentLang === 'hi' ? `मैंने नया दस्तावेज स्कैन किया है: ${docTitle}` : `I scanned a new document: ${docTitle}`;

    const userTurn: ConversationTurn = {
      id: `turn-user-scan-${Date.now()}`,
      type: 'user',
      timestamp: timeStr,
      text: userText,
      kannadaText: `ನಾನು ಹೊಸ ದಾಖಲೆಯನ್ನು ಸ್ಕ್ಯಾನ್ ಮಾಡಿದ್ದೇನೆ: ${enrichedNotice.titleKn || enrichedNotice.title}`,
      hindiText: `मैंने नया दस्तावेज स्कैन किया है: ${enrichedNotice.titleHi || enrichedNotice.title}`,
      englishText: `I scanned a new document: ${enrichedNotice.titleEn || enrichedNotice.title}`,
      detectedLanguage: currentLang
    };

    const isExpiring = !hasNoDueDate && !isOverdue && daysRemaining !== null && daysRemaining <= 7;
    const primarySummary = currentLang === 'kn' ? (enrichedNotice.plainSummary.kn || enrichedNotice.plainSummary.en) : currentLang === 'hi' ? (enrichedNotice.plainSummary.hi || enrichedNotice.plainSummary.en) : enrichedNotice.plainSummary.en;

    const knDeadlinePhrase = hasNoDueDate
      ? 'ಯಾವುದೇ ಅಂತಿಮ ಗಡುವನ್ನು ನಮೂದಿಸಲಾಗಿಲ್ಲ (ಮಾಹಿತಿ ಉದ್ದೇಶದ ದಾಖಲೆ)'
      : isOverdue
      ? `ಅಂತಿಮ ಗಡುವು ${properDeadlineKn} ರಂದು ಮೀರಿದೆ (${daysOverdue} ದಿನಗಳು ಕಳೆದಿವೆ)`
      : `ಅಂತಿಮ ಗಡುವು: ${properDeadlineKn} (ಇನ್ನು ${daysRemaining} ದಿನಗಳು ಬಾಕಿ)`;

    const hiDeadlinePhrase = hasNoDueDate
      ? 'कोई देय तिथि उल्लिखित नहीं है (केवल सूचनात्मक दस्तावेज)'
      : isOverdue
      ? `देय तिथि ${properDeadlineHi} को समाप्त हो चुकी है (${daysOverdue} दिन का विलंब)`
      : `अंतिम तिथि: ${properDeadlineHi} (${daysRemaining} दिन शेष)`;

    const enDeadlinePhrase = hasNoDueDate
      ? 'No due date is mentioned in this document (Informational notice)'
      : isOverdue
      ? `Statutory due date passed on ${properDeadline} (${daysOverdue} days overdue)`
      : `Statutory deadline is ${properDeadline} (${daysRemaining} days remaining)`;

    const assistantTurn: ConversationTurn = {
      id: `turn-assistant-scan-${Date.now()}`,
      type: 'assistant',
      timestamp: timeStr,
      text: primarySummary,
      kannadaText: `ದಾಖಲೆ '${docTitle}' ಯಶಸ್ವಿಯಾಗಿ ಪರಿಶೀಲಿಸಲಾಗಿದೆ. ${docDept} ನೀಡಿದ ಈ ನೋಟಿಸ್‌ಗೆ ${knDeadlinePhrase}. ${enrichedNotice.plainSummary.kn || enrichedNotice.plainSummary.en}`,
      hindiText: `दस्तावेज '${docTitle}' का सफलतापूर्वक विश्लेषण किया गया। ${docDept} द्वारा जारी नोटिस की ${hiDeadlinePhrase}। ${enrichedNotice.plainSummary.hi || enrichedNotice.plainSummary.en}`,
      englishText: `Successfully analyzed the document '${docTitle}'. Issued by ${docDept}. ${enDeadlinePhrase}. ${enrichedNotice.plainSummary.en}`,
      detectedLanguage: currentLang,
      laymanSummary: enrichedNotice.laymanSummary?.en || (hasNoDueDate ? 'In plain words: No deadline is mentioned in this document. It is informational.' : isOverdue ? `In plain words: The statutory deadline passed on ${properDeadline}. Respond immediately to avoid additional penalties.` : `In plain words: The notice requires action by ${properDeadline}. Do not ignore it to prevent penalty charges.`),
      laymanSummaryKn: enrichedNotice.laymanSummary?.kn || (hasNoDueDate ? 'ಸರಳ ಭಾಷೆಯಲ್ಲಿ: ಈ ದಾಖಲೆಯಲ್ಲಿ ಯಾವುದೇ ಅಂತಿಮ ದಿನಾಂಕವನ್ನು ನಮೂದಿಸಲಾಗಿಲ್ಲ. ಇದು ಮಾಹಿತಿ ಉದ್ದೇಶದ ದಾಖಲೆಯಾಗಿದೆ.' : isOverdue ? `ಸರಳ ಭಾಷೆಯಲ್ಲಿ: ಈ ನೋಟಿಸ್‌ನ ಅಂತಿಮ ಗಡುವು ${properDeadlineKn} ರಂದು ಮೀರಿದೆ. ದಂಡ ತಪ್ಪಿಸಲು ತುರ್ತಾಗಿ ಉತ್ತರಿಸಿ.` : `ಸರಳ ಭಾಷೆಯಲ್ಲಿ: ಈ ನೋಟಿಸ್‌ಗೆ ${properDeadlineKn} ರೊಳಗೆ ಉತ್ತರಿಸಬೇಕು. ಹೆಚ್ಚುವರಿ ದಂಡವನ್ನು ತಪ್ಪಿಸಲು ಸಕಾಲದಲ್ಲಿ ಕ್ರಮ ಕೈಗೊಳ್ಳಿ.`),
      laymanSummaryHi: enrichedNotice.laymanSummary?.hi || (hasNoDueDate ? 'साधारण शब्दों में: इस दस्तावेज में कोई देय तिथि उल्लिखित नहीं है। यह केवल एक सूचनात्मक रिकॉर्ड है।' : isOverdue ? `साधारण शब्दों में: इस नोटिस की देय तिथि ${properDeadlineHi} को समाप्त हो चुकी है। अतिरिक्त जुर्माने से बचने के लिए तुरंत जवाब दें।` : `साधारण शब्दों में: इस नोटिस का अनुपालन ${properDeadlineHi} तक करना आवश्यक है ताकि जुर्माने से बचा जा सके।`),
      laymanSummaryEn: enrichedNotice.laymanSummary?.en || (hasNoDueDate ? 'In plain words: No deadline is mentioned in this document. It is informational.' : isOverdue ? `In plain words: The statutory deadline passed on ${properDeadline}. Respond immediately to avoid additional penalties.` : `In plain words: The notice requires action by ${properDeadline}. Do not ignore it to prevent penalty charges.`),
      keyPoints: enrichedNotice.keyPoints,
      keyPointsKn: enrichedNotice.keyPointsKn,
      keyPointsHi: enrichedNotice.keyPointsHi,
      keyPointsEn: enrichedNotice.keyPointsEn,
      understandingCheck: enrichedNotice.understandingQuestions ? enrichedNotice.understandingQuestions.map(q => ({
        question: q.question,
        questionKn: q.questionKn,
        questionHi: q.questionHi,
        explanation: q.explanation,
        explanationKn: q.explanationKn,
        explanationHi: q.explanationHi
      })) : [
        {
          question: hasNoDueDate ? `Is there an urgent deadline to respond?` : `When is the statutory deadline?`,
          questionKn: hasNoDueDate ? `ಉತ್ತರಿಸಲು ತುರ್ತು ಗಡುವು ಇದೆಯೇ?` : `ಶಾಸನಬದ್ಧ ಅಂತಿಮ ಗಡುವು ಯಾವಾಗ?`,
          questionHi: hasNoDueDate ? `क्या जवाब देने की कोई अंतिम तिथि है?` : `वैधानिक अंतिम तिथि कब है?`,
          explanation: hasNoDueDate ? 'No immediate deadline is specified in this document.' : isOverdue ? `The deadline passed on ${properDeadline} (${daysOverdue} days overdue).` : `${properDeadline} (${daysRemaining} days remaining).`,
          explanationKn: hasNoDueDate ? 'ಯಾವುದೇ ಅಂತಿಮ ಗಡುವನ್ನು ನಮೂದಿಸಲಾಗಿಲ್ಲ.' : isOverdue ? `ಅಂತಿಮ ದಿನಾಂಕ ${properDeadlineKn} ರಂದು ಮೀರಿದೆ (${daysOverdue} ದಿನಗಳು ಕಳೆದಿವೆ).` : `${properDeadlineKn} (ಇನ್ನು ${daysRemaining} ದಿನಗಳು ಬಾಕಿ).`,
          explanationHi: hasNoDueDate ? 'कोई अंतिम तिथि उल्लिखित नहीं है।' : isOverdue ? `अंतिम तिथि ${properDeadlineHi} को समाप्त हो चुकी है (${daysOverdue} दिन का विलंब)।` : `${properDeadlineHi} (${daysRemaining} दिन शेष हैं)।`
        }
      ],
      expiryNotice: hasNoDueDate ? undefined : {
        isExpiringSoon: isExpiring,
        isOverdue: isOverdue,
        daysOverdue: daysOverdue,
        hasNoDueDate: false,
        daysRemaining: daysRemaining,
        deadline: properDeadline,
        penaltyWarning: currentLang === 'kn' ? (enrichedNotice.penaltyTextKn || enrichedNotice.penaltyText) : enrichedNotice.penaltyText
      },
      extractedInfo: {
        deadline: hasNoDueDate ? null : properDeadline,
        formattedDeadline: properDeadline || null,
        issueDate: enrichedNotice.issueDate,
        formattedIssueDate: properIssueDate || null,
        daysRemaining: daysRemaining,
        isOverdue: isOverdue,
        daysOverdue: daysOverdue,
        hasNoDueDate: hasNoDueDate,
        amount: enrichedNotice.amountDemanded || 'See notice',
        authority: docDept,
        action: currentLang === 'kn' ? (enrichedNotice.requiredAction.kn || enrichedNotice.requiredAction.en) : currentLang === 'hi' ? (enrichedNotice.requiredAction.hi || enrichedNotice.requiredAction.en) : enrichedNotice.requiredAction.en,
        isCritical: enrichedNotice.urgency === 'CRITICAL' || isOverdue,
        isExpiringSoon: isExpiring
      },
      actionButtons: hasNoDueDate ? [
        { label: getActionButtonLabel('procedure', 'Explain Step-by-Step Procedure', currentLang), action: 'procedure' },
        { label: getActionButtonLabel('draft', 'Draft Formal Response', currentLang), action: 'draft' }
      ] : isOverdue ? [
        { label: getActionButtonLabel('procedure', 'Emergency Settlement Procedure', currentLang), action: 'procedure' },
        { label: getActionButtonLabel('draft', 'Draft Overdue Notice Response', currentLang), action: 'draft' }
      ] : [
        { label: getActionButtonLabel('calendar', 'Set Calendar Reminder', currentLang), action: 'calendar' },
        { label: getActionButtonLabel('procedure', 'Explain Step-by-Step Procedure', currentLang), action: 'procedure' },
        { label: getActionButtonLabel('draft', 'Draft Formal Response', currentLang), action: 'draft' }
      ]
    };

    setTurns(prev => [...prev, userTurn, assistantTurn]);

    if (isVoiceResponseEnabled) {
      setSpeakingTurnId(assistantTurn.id);
      handlePlayAssistantVoice(assistantTurn);
    }
  };

  // Direct File Attachment Handler from Chat Form
  const handleChatFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name;
    const fileSize = `${(file.size / 1024).toFixed(1)} KB`;
    const mimeType = file.type || (fileName.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/jpeg');

    setIsProcessing(true);
    soundController.playBeep(440, 'sine', 0.15);

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Instantly append user turn with attached file card
    const userTurn: ConversationTurn = {
      id: `turn-user-file-${Date.now()}`,
      type: 'user',
      timestamp: timeStr,
      text: currentLang === 'kn' ? `ಲಗತ್ತಿಸಲಾದ ಕಡತ: ${fileName}` : currentLang === 'hi' ? `संलग्न फाइल: ${fileName}` : `Attached file: ${fileName}`,
      kannadaText: `ಲಗತ್ತಿಸಲಾದ ಕಡತ: ${fileName}`,
      hindiText: `संलग्न फाइल: ${fileName}`,
      englishText: `Attached file: ${fileName}`,
      detectedLanguage: currentLang,
      attachedFile: {
        name: fileName,
        size: fileSize,
        type: mimeType
      }
    };

    setTurns(prev => [...prev, userTurn]);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = (reader.result as string).split(',')[1] || '';
          const res = await fetch('/api/scan-document', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              imageBase64: base64Data,
              fileName: fileName,
              mimeType: mimeType,
              language: currentLang
            })
          });

          if (!res.ok) {
            throw new Error(`Document scanner returned ${res.status}`);
          }

          const data = await res.json();
          const scannedNotice: StatutoryNotice = data.notice;

          // Date evaluation & formatting
          const dateStatus = checkDateStatus(scannedNotice.deadlineDate, scannedNotice.issueDate);
          const hasNoDueDate = scannedNotice.hasNoDueDate || dateStatus.hasNoDueDate;
          const isOverdue = scannedNotice.isOverdue || dateStatus.isOverdue;
          const daysOverdue = scannedNotice.daysOverdue || dateStatus.daysOverdue;
          const daysRemaining = hasNoDueDate ? null : (scannedNotice.daysRemaining !== undefined && scannedNotice.daysRemaining !== null ? scannedNotice.daysRemaining : dateStatus.daysRemaining);
          const properDeadline = hasNoDueDate ? null : (scannedNotice.formattedDeadline || dateStatus.formattedDeadline || formatProperDate(scannedNotice.deadlineDate, 'en'));
          const properDeadlineKn = hasNoDueDate ? null : formatProperDate(scannedNotice.deadlineDate, 'kn');
          const properDeadlineHi = hasNoDueDate ? null : formatProperDate(scannedNotice.deadlineDate, 'hi');
          const properIssueDate = scannedNotice.formattedIssueDate || dateStatus.formattedIssueDate || formatProperDate(scannedNotice.issueDate, 'en');

          const enrichedNotice: StatutoryNotice = {
            ...scannedNotice,
            hasNoDueDate,
            isOverdue,
            daysOverdue,
            daysRemaining,
            deadlineDate: hasNoDueDate ? null : scannedNotice.deadlineDate,
            formattedDeadline: properDeadline || undefined,
            formattedIssueDate: properIssueDate || undefined
          };

          setNoticesList(prev => {
            if (prev.some(n => n.id === enrichedNotice.id)) return prev;
            return [enrichedNotice, ...prev];
          });
          setActiveNoticeId(enrichedNotice.id);

          const docTitle = currentLang === 'kn' ? (enrichedNotice.titleKn || enrichedNotice.title) : currentLang === 'hi' ? (enrichedNotice.titleHi || enrichedNotice.title) : (enrichedNotice.titleEn || enrichedNotice.title);
          const docDept = currentLang === 'kn' ? (enrichedNotice.departmentKn || enrichedNotice.department) : currentLang === 'hi' ? (enrichedNotice.departmentHi || enrichedNotice.department) : enrichedNotice.department;
          const primarySummary = currentLang === 'kn' ? (enrichedNotice.plainSummary.kn || enrichedNotice.plainSummary.en) : currentLang === 'hi' ? (enrichedNotice.plainSummary.hi || enrichedNotice.plainSummary.en) : enrichedNotice.plainSummary.en;

          const knDeadlinePhrase = hasNoDueDate
            ? 'ಯಾವುದೇ ಅಂತಿಮ ಗಡುವನ್ನು ನಮೂದಿಸಲಾಗಿಲ್ಲ (ಮಾಹಿತಿ ಉದ್ದೇಶದ ದಾಖಲೆ)'
            : isOverdue
            ? `ಅಂತಿಮ ಗಡುವು ${properDeadlineKn} ರಂದು ಮೀರಿದೆ (${daysOverdue} ದಿನಗಳು ಕಳೆದಿವೆ)`
            : `ಅಂತಿಮ ಗಡುವು: ${properDeadlineKn} (ಇನ್ನು ${daysRemaining} ದಿನಗಳು ಬಾಕಿ)`;

          const hiDeadlinePhrase = hasNoDueDate
            ? 'कोई देय तिथि उल्लिखित नहीं है (केवल सूचनात्मक दस्तावेज)'
            : isOverdue
            ? `देय तिथि ${properDeadlineHi} को समाप्त हो चुकी है (${daysOverdue} दिन का विलंब)`
            : `अंतिम तिथि: ${properDeadlineHi} (${daysRemaining} दिन शेष)`;

          const enDeadlinePhrase = hasNoDueDate
            ? 'No due date is mentioned in this document (Informational notice)'
            : isOverdue
            ? `Statutory due date passed on ${properDeadline} (${daysOverdue} days overdue)`
            : `Statutory deadline is ${properDeadline} (${daysRemaining} days remaining)`;

          const isExpiring = !hasNoDueDate && !isOverdue && daysRemaining !== null && daysRemaining <= 7;

          const assistantTurn: ConversationTurn = {
            id: `turn-assistant-file-${Date.now()}`,
            type: 'assistant',
            timestamp: timeStr,
            text: primarySummary,
            kannadaText: `ದಾಖಲೆ '${docTitle}' ಯಶಸ್ವಿಯಾಗಿ ಓದಲಾಗಿದೆ ಮತ್ತು ವಿಶ್ಲೇಷಿಸಲಾಗಿದೆ. ${docDept} ನೀಡಿದ ಈ ನೋಟಿಸ್‌ಗೆ ${knDeadlinePhrase}. ${enrichedNotice.plainSummary.kn || enrichedNotice.plainSummary.en}`,
            hindiText: `दस्तावेज '${docTitle}' का सफलतापूर्वक अध्ययन किया गया। ${docDept} द्वारा जारी इस नोटिस की ${hiDeadlinePhrase}। ${enrichedNotice.plainSummary.hi || enrichedNotice.plainSummary.en}`,
            englishText: `Neatly analyzed document '${docTitle}'. Issued by ${docDept}. ${enDeadlinePhrase}. ${enrichedNotice.plainSummary.en}`,
            detectedLanguage: currentLang,
            laymanSummary: enrichedNotice.laymanSummary?.en || (hasNoDueDate ? 'In plain words: No deadline is mentioned in this document. It is informational.' : isOverdue ? `In plain words: The statutory deadline passed on ${properDeadline}. Respond immediately to avoid additional penalties.` : `In plain words: The notice requires action by ${properDeadline}. Do not ignore it to prevent penalty charges.`),
            laymanSummaryKn: enrichedNotice.laymanSummary?.kn || (hasNoDueDate ? 'ಸರಳ ಭಾಷೆಯಲ್ಲಿ: ಈ ದಾಖಲೆಯಲ್ಲಿ ಯಾವುದೇ ಅಂತಿಮ ದಿನಾಂಕವನ್ನು ನಮೂದಿಸಲಾಗಿಲ್ಲ. ಇದು ಮಾಹಿತಿ ಉದ್ದೇಶದ ದಾಖಲೆಯಾಗಿದೆ.' : isOverdue ? `ಸರಳ ಭಾಷೆಯಲ್ಲಿ: ಈ ನೋಟಿಸ್‌ನ ಅಂತಿಮ ಗಡುವು ${properDeadlineKn} ರಂದು ಮೀರಿದೆ. ದಂಡ ತಪ್ಪಿಸಲು ತುರ್ತಾಗಿ ಉತ್ತರಿಸಿ.` : `ಸರಳ ಭಾಷೆಯಲ್ಲಿ: ಈ ನೋಟಿಸ್‌ಗೆ ${properDeadlineKn} ರೊಳಗೆ ಉತ್ತರಿಸಬೇಕು. ಹೆಚ್ಚುವರಿ ದಂಡವನ್ನು ತಪ್ಪಿಸಲು ಸಕಾಲದಲ್ಲಿ ಕ್ರಮ ಕೈಗೊಳ್ಳಿ.`),
            laymanSummaryHi: enrichedNotice.laymanSummary?.hi || (hasNoDueDate ? 'साधारण शब्दों में: इस दस्तावेज में कोई देय तिथि उल्लिखित नहीं है। यह केवल एक सूचनात्मक रिकॉर्ड है।' : isOverdue ? `साधारण शब्दों में: इस नोटिस की देय तिथि ${properDeadlineHi} को समाप्त हो चुकी है। अतिरिक्त जुर्माने से बचने के लिए तुरंत जवाब दें।` : `साधारण शब्दों में: इस नोटिस का अनुपालन ${properDeadlineHi} तक करना आवश्यक है ताकि जुर्माने से बचा जा सके।`),
            laymanSummaryEn: enrichedNotice.laymanSummary?.en || (hasNoDueDate ? 'In plain words: No deadline is mentioned in this document. It is informational.' : isOverdue ? `In plain words: The statutory deadline passed on ${properDeadline}. Respond immediately to avoid additional penalties.` : `In plain words: The notice requires action by ${properDeadline}. Do not ignore it to prevent penalty charges.`),
            keyPoints: enrichedNotice.keyPoints,
            keyPointsKn: enrichedNotice.keyPointsKn,
            keyPointsHi: enrichedNotice.keyPointsHi,
            keyPointsEn: enrichedNotice.keyPointsEn,
            understandingCheck: enrichedNotice.understandingQuestions ? enrichedNotice.understandingQuestions.map(q => ({
              question: q.question,
              questionKn: q.questionKn,
              questionHi: q.questionHi,
              explanation: q.explanation,
              explanationKn: q.explanationKn,
              explanationHi: q.explanationHi
            })) : [
              {
                question: hasNoDueDate ? `Is there an urgent deadline to respond?` : `When is the statutory deadline?`,
                questionKn: hasNoDueDate ? `ಉತ್ತರಿಸಲು ತುರ್ತು ಗಡುವು ಇದೆಯೇ?` : `ಶಾಸನಬದ್ಧ ಅಂತಿಮ ಗಡುವು ಯಾವಾಗ?`,
                questionHi: hasNoDueDate ? `क्या जवाब देने की कोई अंतिम तिथि है?` : `वैधानिक अंतिम तिथि कब है?`,
                explanation: hasNoDueDate ? 'No immediate deadline is specified in this document.' : isOverdue ? `The deadline passed on ${properDeadline} (${daysOverdue} days overdue).` : `${properDeadline} (${daysRemaining} days remaining).`,
                explanationKn: hasNoDueDate ? 'ಯಾವುದೇ ಅಂತಿಮ ಗಡುವನ್ನು ನಮೂದಿಸಲಾಗಿಲ್ಲ.' : isOverdue ? `ಅಂತಿಮ ದಿನಾಂಕ ${properDeadlineKn} ರಂದು ಮೀರಿದೆ (${daysOverdue} ದಿನಗಳು ಕಳೆದಿವೆ).` : `${properDeadlineKn} (ಇನ್ನು ${daysRemaining} ದಿನಗಳು ಬಾಕಿ).`,
                explanationHi: hasNoDueDate ? 'कोई अंतिम तिथि उल्लिखित नहीं है।' : isOverdue ? `अंतिम तिथि ${properDeadlineHi} को समाप्त हो चुकी है (${daysOverdue} दिन का विलंब)।` : `${properDeadlineHi} (${daysRemaining} दिन शेष हैं)।`
              }
            ],
            expiryNotice: hasNoDueDate ? undefined : {
              isExpiringSoon: isExpiring,
              isOverdue: isOverdue,
              daysOverdue: daysOverdue,
              hasNoDueDate: false,
              daysRemaining: daysRemaining,
              deadline: properDeadline,
              penaltyWarning: currentLang === 'kn' ? (enrichedNotice.penaltyTextKn || enrichedNotice.penaltyText) : enrichedNotice.penaltyText
            },
            extractedInfo: {
              deadline: hasNoDueDate ? null : properDeadline,
              formattedDeadline: properDeadline || null,
              issueDate: enrichedNotice.issueDate,
              formattedIssueDate: properIssueDate || null,
              daysRemaining: daysRemaining,
              isOverdue: isOverdue,
              daysOverdue: daysOverdue,
              hasNoDueDate: hasNoDueDate,
              amount: enrichedNotice.amountDemanded || 'See details',
              authority: docDept,
              action: currentLang === 'kn' ? (enrichedNotice.requiredAction.kn || enrichedNotice.requiredAction.en) : currentLang === 'hi' ? (enrichedNotice.requiredAction.hi || enrichedNotice.requiredAction.en) : enrichedNotice.requiredAction.en,
              isCritical: enrichedNotice.urgency === 'CRITICAL' || isOverdue,
              isExpiringSoon: isExpiring
            },
            actionButtons: hasNoDueDate ? [
              { label: getActionButtonLabel('procedure', 'Explain Step-by-Step Procedure', currentLang), action: 'procedure' },
              { label: getActionButtonLabel('draft', 'Draft Formal Response', currentLang), action: 'draft' }
            ] : isOverdue ? [
              { label: getActionButtonLabel('procedure', 'Emergency Settlement Procedure', currentLang), action: 'procedure' },
              { label: getActionButtonLabel('draft', 'Draft Overdue Notice Response', currentLang), action: 'draft' }
            ] : [
              { label: getActionButtonLabel('calendar', 'Set Calendar Reminder', currentLang), action: 'calendar' },
              { label: getActionButtonLabel('procedure', 'Explain Step-by-Step Procedure', currentLang), action: 'procedure' },
              { label: getActionButtonLabel('draft', 'Draft Formal Response', currentLang), action: 'draft' }
            ]
          };

          setTurns(prev => [...prev, assistantTurn]);
          setIsProcessing(false);

          if (isVoiceResponseEnabled) {
            setSpeakingTurnId(assistantTurn.id);
            handlePlayAssistantVoice(assistantTurn);
          }
        } catch (innerErr) {
          console.error('File scan parsing error:', innerErr);
          setIsProcessing(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('File read error:', err);
      setIsProcessing(false);
    }

    if (chatFileInputRef.current) {
      chatFileInputRef.current.value = '';
    }
  };

  const handleExportIcs = (notice: StatutoryNotice) => {
    downloadIcsFile({
      title: notice.title,
      description: notice.requiredAction.en,
      dueDate: notice.deadlineDate,
      noticeRef: notice.refNumber,
      filename: `${notice.id.toLowerCase()}_deadline.ics`
    });
  };

  const handleRequestBrowserNotification = (notice: StatutoryNotice) => {
    if (!('Notification' in window)) {
      handleExportIcs(notice);
      return;
    }
    if (Notification.permission === 'granted') {
      new Notification(`⚠️ Statutory Expiry Alert: ${notice.title}`, {
        body: `Due on ${notice.deadlineDate} (${notice.daysRemaining} days left). Authority: ${notice.department}. ${notice.requiredAction.en}`
      });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(perm => {
        if (perm === 'granted') {
          new Notification(`⚠️ Statutory Expiry Alert: ${notice.title}`, {
            body: `Due on ${notice.deadlineDate} (${notice.daysRemaining} days left). Authority: ${notice.department}.`
          });
        }
      });
    }
  };

  // Action button clicks
  const handleActionButtonClick = (action: string) => {
    if (action === 'calendar') {
      handleExportIcs(activeNotice);
    } else if (action === 'procedure') {
      setIsRectificationOpen(true);
    } else if (action === 'draft') {
      setIsDraftOpen(true);
    } else if (action === 'scan') {
      setIsDocScannerOpen(true);
    } else if (action === 'rights' || action === 'help') {
      setCurrentView('legal-rights');
    } else if (action === 'deadlines') {
      setCurrentView('my-deadlines');
    }
  };

  // Keyboard shortcut: Spacebar hold to talk
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.code === 'Space' &&
        !e.repeat &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        if (!isListening) toggleVoiceListening();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' && isListening) {
        e.preventDefault();
        toggleVoiceListening();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isListening]);

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col md:grid md:grid-cols-[80px_1fr_400px] bg-[#f8f7f4] text-[#1a1a1a] font-['Inter']">
      {/* Sidebar Navigation */}
      <aside className="border-b md:border-b-0 md:border-r-2 border-[#1a1a1a] flex md:flex-col items-center justify-between md:justify-start py-3 px-4 md:px-0 md:py-8 gap-4 md:gap-10 bg-white shrink-0 z-20">
        <div 
          onClick={() => setCurrentView('voice-agent')}
          className="w-11 h-11 bg-[#1a1a1a] text-white flex items-center justify-center font-['Space_Grotesk'] font-bold text-lg cursor-pointer select-none"
          title="Go Vision Assistant"
        >
          GV
        </div>

        <div className="flex md:flex-col items-center gap-6 md:gap-8">
          <button
            onClick={() => setCurrentView('voice-agent')}
            className={`material-symbols-outlined nav-icon text-[24px] cursor-pointer transition-opacity ${
              currentView === 'voice-agent' ? 'opacity-100 text-[#1a1a1a]' : 'opacity-40 hover:opacity-100'
            }`}
            title="Voice Conversation"
          >
            chat_bubble
          </button>

          <button
            onClick={() => setCurrentView('document-scanner')}
            className={`material-symbols-outlined nav-icon text-[24px] cursor-pointer transition-opacity ${
              currentView === 'document-scanner' ? 'opacity-100 text-[#1a1a1a]' : 'opacity-40 hover:opacity-100'
            }`}
            title="Notice Explainer & Documents"
          >
            folder_open
          </button>

          <button
            onClick={() => setCurrentView('my-deadlines')}
            className={`material-symbols-outlined nav-icon text-[24px] cursor-pointer transition-opacity ${
              currentView === 'my-deadlines' ? 'opacity-100 text-[#1a1a1a]' : 'opacity-40 hover:opacity-100'
            }`}
            title="Deadlines & Calendar Schedule"
          >
            calendar_today
          </button>

          <button
            onClick={() => setCurrentView('legal-rights')}
            className={`material-symbols-outlined nav-icon text-[24px] cursor-pointer transition-opacity ${
              currentView === 'legal-rights' ? 'opacity-100 text-[#1a1a1a]' : 'opacity-40 hover:opacity-100'
            }`}
            title="Lawful Rights & Remedies"
          >
            gavel
          </button>
        </div>

        <button
          onClick={() => setCurrentView('system-health')}
          className={`material-symbols-outlined nav-icon text-[24px] cursor-pointer transition-opacity md:mt-auto ${
            currentView === 'system-health' ? 'opacity-100 text-[#1a1a1a]' : 'opacity-40 hover:opacity-100'
          }`}
          title="Privacy & Audio Health"
        >
          verified_user
        </button>
      </aside>

      {/* Main Workspace Column */}
      <section className="flex-1 flex flex-col justify-between p-4 md:p-8 gap-6 overflow-y-auto min-w-0">
        {/* EXPIRING / OVERDUE DOCUMENT BANNER */}
        {(() => {
          // Priority 1: Check for Overdue notices
          const overdueNotice = noticesList.find(n => n.isOverdue || (n.daysRemaining !== null && n.daysRemaining !== undefined && n.daysRemaining < 0));
          if (overdueNotice) {
            const noticeTitle = currentLang === 'kn' ? (overdueNotice.titleKn || overdueNotice.title) : currentLang === 'hi' ? (overdueNotice.titleHi || overdueNotice.title) : (overdueNotice.titleEn || overdueNotice.title);
            const noticeDept = currentLang === 'kn' ? (overdueNotice.departmentKn || overdueNotice.department) : currentLang === 'hi' ? (overdueNotice.departmentHi || overdueNotice.department) : overdueNotice.department;
            const overdueDays = overdueNotice.daysOverdue || Math.abs(overdueNotice.daysRemaining || 0);
            const properDate = formatProperDate(overdueNotice.deadlineDate, currentLang);
            return (
              <div className="bg-[#b91c1c] text-white p-3.5 border-2 border-[#1a1a1a] shadow-[4px_4px_0px_#1a1a1a] flex flex-wrap items-center justify-between gap-3 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-white text-[#b91c1c] flex items-center justify-center font-bold shrink-0">
                    <span className="material-symbols-outlined text-[24px] animate-bounce">warning</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="bg-[#fee2e2] text-[#b91c1c] text-[10px] font-['Space_Mono'] font-bold px-1.5 py-0.2 uppercase border border-[#1a1a1a]">
                        {currentLang === 'kn' ? `${overdueDays} ದಿನಗಳು ಕಳೆದಿವೆ` : currentLang === 'hi' ? `${overdueDays} दिन का विलंब` : `${overdueDays} Days Overdue`}
                      </span>
                      <h4 className="font-['Space_Grotesk'] text-sm font-bold uppercase tracking-tight text-white">
                        {t.overdueAlert}: {noticeTitle}
                      </h4>
                    </div>
                    <p className="text-xs text-white/95 font-['Inter'] mt-0.5">
                      {t.authority}: <strong>{noticeDept}</strong> • {t.dueDate}: <strong>{currentLang === 'kn' ? `${properDate} ರಂದು ಗಡುವು ಮೀರಿದೆ` : currentLang === 'hi' ? `${properDate} को समाप्त` : `Passed on ${properDate}`}</strong>. {currentLang === 'kn' ? 'ದಂಡ ಅಥವಾ ಶಾಸನಬದ್ಧ ಬಡ್ಡಿಯನ್ನು ತಪ್ಪಿಸಲು ತಕ್ಷಣ ಕ್ರಮ ಕೈಗೊಳ್ಳಿ.' : currentLang === 'hi' ? 'अतिरिक्त जुर्माने से बचने के लिए तुरंत जवाब दें।' : 'Immediate compliance or response is required to avoid penal interest.'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleActionButtonClick('procedure')}
                    className="px-2.5 py-1.5 bg-white hover:bg-[#ffcc00] text-[#1a1a1a] font-['Space_Grotesk'] text-xs font-bold uppercase border border-[#1a1a1a] shadow-[2px_2px_0px_#1a1a1a] cursor-pointer flex items-center gap-1 transition-all"
                  >
                    <span className="material-symbols-outlined text-[16px]">emergency</span>
                    <span>{currentLang === 'kn' ? 'ತುರ್ತು ಪರಿಹಾರ' : currentLang === 'hi' ? 'आपातकालीन समाधान' : 'Emergency Action'}</span>
                  </button>
                  <button
                    onClick={() => handleRequestBrowserNotification(overdueNotice)}
                    className="px-2.5 py-1.5 bg-[#1a1a1a] hover:bg-black text-white font-['Space_Grotesk'] text-xs font-bold uppercase border border-white shadow-[2px_2px_0px_#ffffff] cursor-pointer flex items-center gap-1 transition-all"
                  >
                    <span className="material-symbols-outlined text-[16px]">notifications_active</span>
                    <span>{t.browserAlert}</span>
                  </button>
                </div>
              </div>
            );
          }

          // Priority 2: Check for Expiring notices (<= 7 days, has due date, not overdue)
          const expiringNotice = noticesList.find(n => !n.hasNoDueDate && !n.isOverdue && n.daysRemaining !== null && n.daysRemaining !== undefined && n.daysRemaining <= 7);
          if (!expiringNotice) return null;
          const noticeTitle = currentLang === 'kn' ? (expiringNotice.titleKn || expiringNotice.title) : currentLang === 'hi' ? (expiringNotice.titleHi || expiringNotice.title) : (expiringNotice.titleEn || expiringNotice.title);
          const noticeDept = currentLang === 'kn' ? (expiringNotice.departmentKn || expiringNotice.department) : currentLang === 'hi' ? (expiringNotice.departmentHi || expiringNotice.department) : expiringNotice.department;
          const noticePenalty = currentLang === 'kn' ? (expiringNotice.penaltyTextKn || expiringNotice.penaltyText) : currentLang === 'hi' ? (expiringNotice.penaltyTextHi || expiringNotice.penaltyText) : expiringNotice.penaltyText;
          const properDate = formatProperDate(expiringNotice.deadlineDate, currentLang);
          return (
            <div className="bg-[#e63b2e] text-white p-3.5 border-2 border-[#1a1a1a] shadow-[4px_4px_0px_#1a1a1a] flex flex-wrap items-center justify-between gap-3 text-left">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white text-[#e63b2e] flex items-center justify-center font-bold shrink-0">
                  <span className="material-symbols-outlined text-[24px] animate-pulse">alarm</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-[#ffcc00] text-[#1a1a1a] text-[10px] font-['Space_Mono'] font-bold px-1.5 py-0.2 uppercase border border-[#1a1a1a]">
                      {expiringNotice.daysRemaining} {t.daysLeft}
                    </span>
                    <h4 className="font-['Space_Grotesk'] text-sm font-bold uppercase tracking-tight">
                      {t.expiringAlert}: {noticeTitle}
                    </h4>
                  </div>
                  <p className="text-xs text-white/90 font-['Inter'] mt-0.5">
                    {t.authority}: <strong>{noticeDept}</strong> • {t.dueDate}: <strong>{properDate}</strong>. {noticePenalty}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleExportIcs(expiringNotice)}
                  className="px-2.5 py-1.5 bg-white hover:bg-[#ffcc00] text-[#1a1a1a] font-['Space_Grotesk'] text-xs font-bold uppercase border border-[#1a1a1a] shadow-[2px_2px_0px_#1a1a1a] cursor-pointer flex items-center gap-1 transition-all"
                  title={t.setCalendar}
                >
                  <span className="material-symbols-outlined text-[16px]">calendar_add_on</span>
                  <span>{t.setCalendar}</span>
                </button>
                <button
                  onClick={() => handleRequestBrowserNotification(expiringNotice)}
                  className="px-2.5 py-1.5 bg-[#1a1a1a] hover:bg-black text-white font-['Space_Grotesk'] text-xs font-bold uppercase border border-white shadow-[2px_2px_0px_#ffffff] cursor-pointer flex items-center gap-1 transition-all"
                  title={t.browserAlert}
                >
                  <span className="material-symbols-outlined text-[16px]">notifications_active</span>
                  <span>{t.browserAlert}</span>
                </button>
              </div>
            </div>
          );
        })()}

        {/* VIEW 1: Main Conversational Voice Workspace */}
        {currentView === 'voice-agent' && (
          <>
            {/* Header Content */}
            <div className="header-content text-left">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="meta-label mb-0">{t.headerBadge}</span>
                  <span className="px-2 py-0.5 bg-[#ffdad6] text-[#e63b2e] border border-[#1a1a1a] text-[10px] font-['Space_Mono'] font-bold">
                    {selectedLanguage === 'auto' ? t.autoDetected : t.selectedLanguage}
                  </span>
                </div>

                {/* Language Selection: Auto, Kannada, Hindi, English */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center bg-white border-2 border-[#1a1a1a] p-1 gap-1 text-xs font-['Space_Grotesk'] shadow-xs">
                    <span className="text-[10px] font-['Space_Mono'] font-bold uppercase text-[#4a4a4a] px-1">
                      {t.langSelectorLabel}
                    </span>
                    <button
                      onClick={() => handleSelectLanguage('auto')}
                      className={`px-2 py-0.5 text-xs font-bold border transition-colors cursor-pointer ${
                        selectedLanguage === 'auto'
                          ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]'
                          : 'border-transparent text-[#1a1a1a] hover:bg-black/5'
                      }`}
                      title="Automatic language detection"
                    >
                      ⚡ Auto
                    </button>
                    <button
                      onClick={() => handleSelectLanguage('kn')}
                      className={`px-2 py-0.5 text-xs font-bold border transition-colors cursor-pointer ${
                        selectedLanguage === 'kn'
                          ? 'bg-[#e63b2e] text-white border-[#e63b2e]'
                          : 'border-transparent text-[#1a1a1a] hover:bg-black/5'
                      }`}
                      title="Display & Voice in Kannada (ಕನ್ನಡ)"
                    >
                      ಕನ್ನಡ
                    </button>
                    <button
                      onClick={() => handleSelectLanguage('hi')}
                      className={`px-2 py-0.5 text-xs font-bold border transition-colors cursor-pointer ${
                        selectedLanguage === 'hi'
                          ? 'bg-[#e63b2e] text-white border-[#e63b2e]'
                          : 'border-transparent text-[#1a1a1a] hover:bg-black/5'
                      }`}
                      title="Display & Voice in Hindi (हिंदी)"
                    >
                      हिंदी
                    </button>
                    <button
                      onClick={() => handleSelectLanguage('en')}
                      className={`px-2 py-0.5 text-xs font-bold border transition-colors cursor-pointer ${
                        selectedLanguage === 'en'
                          ? 'bg-[#e63b2e] text-white border-[#e63b2e]'
                          : 'border-transparent text-[#1a1a1a] hover:bg-black/5'
                      }`}
                      title="Display & Voice in English"
                    >
                      English
                    </button>

                    <button
                      onClick={() => handleTestVoiceOutput(voiceOutputLanguage)}
                      className="ml-1 px-1.5 py-0.5 bg-[#eee9e0] hover:bg-[#ffcc00] border border-[#1a1a1a] text-[10px] font-['Space_Mono'] font-bold flex items-center gap-0.5 cursor-pointer"
                      title="Test selected voice output"
                    >
                      <span className="material-symbols-outlined text-[13px]">play_arrow</span>
                      <span>{currentLang === 'kn' ? 'ಪರೀಕ್ಷಿಸಿ' : currentLang === 'hi' ? 'जांचें' : 'Test'}</span>
                    </button>
                  </div>

                  {/* Voice Response Toggle */}
                  <button
                    onClick={() => setIsVoiceResponseEnabled(!isVoiceResponseEnabled)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white border-2 border-[#1a1a1a] text-xs font-['Space_Grotesk'] font-bold uppercase hover:bg-black/5 transition-colors cursor-pointer"
                    title="Toggle spoken responses"
                  >
                    <span className="material-symbols-outlined text-[16px] text-[#e63b2e]">
                      {isVoiceResponseEnabled ? 'volume_up' : 'volume_off'}
                    </span>
                    <span className="hidden sm:inline">{isVoiceResponseEnabled ? t.voiceOn : t.voiceMute}</span>
                  </button>
                </div>
              </div>

              <h1 className="font-['Space_Grotesk'] text-4xl sm:text-5xl font-bold tracking-tight leading-none uppercase mt-2">
                GO VISION
              </h1>

              {/* Status & Active Document Bar */}
              <div className="flex flex-wrap items-center gap-6 sm:gap-8 mt-3 pt-1">
                <div>
                  <span className="meta-label">{currentLang === 'kn' ? 'ಪಾತ್ರ' : currentLang === 'hi' ? 'भूमिका' : 'Role'}</span>
                  <span className="font-bold text-xs sm:text-sm font-['Space_Grotesk'] text-[#1a1a1a]">
                    {currentLang === 'kn' ? 'Go Vision ಸಹಾಯಕ' : currentLang === 'hi' ? 'Go Vision सहायक' : 'Go Vision Assistant'}
                  </span>
                </div>
                <div>
                  <span className="meta-label">{t.langSelectorLabel}</span>
                  <span className="font-bold text-xs sm:text-sm font-['Space_Grotesk'] text-[#e63b2e] uppercase">
                    {selectedLanguage === 'auto' ? t.autoDetected : selectedLanguage === 'kn' ? 'ಕನ್ನಡ (Kannada)' : selectedLanguage === 'hi' ? 'हिंदी (Hindi)' : 'English'}
                  </span>
                </div>
                <div>
                  <span className="meta-label">{t.activeDoc}</span>
                  <button
                    onClick={() => setIsNoticeSelectorOpen(true)}
                    className="font-bold text-xs sm:text-sm font-['Space_Grotesk'] text-[#1a1a1a] underline hover:text-[#e63b2e] cursor-pointer text-left flex items-center gap-1"
                    title={t.changeDoc}
                  >
                    <span>{currentLang === 'kn' ? (activeNotice.titleKn || activeNotice.title) : currentLang === 'hi' ? (activeNotice.titleHi || activeNotice.title) : (activeNotice.titleEn || activeNotice.title)}</span>
                    <span className="material-symbols-outlined text-[14px]">tune</span>
                  </button>
                </div>
              </div>

              {/* Box: Scan or Upload Document in Kannada, English, or Hindi */}
              <div
                onClick={() => setIsDocScannerOpen(true)}
                className="border-2 border-[#1a1a1a] bg-white p-3.5 shadow-[4px_4px_0px_#1a1a1a] flex items-center justify-between cursor-pointer hover:border-[#e63b2e] hover:shadow-[4px_4px_0px_#e63b2e] transition-all group mt-4 select-none"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#1a1a1a] group-hover:bg-[#e63b2e] text-white flex items-center justify-center transition-colors shrink-0">
                    <span className="material-symbols-outlined text-[22px]">document_scanner</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-['Space_Grotesk'] text-sm font-bold uppercase tracking-wider text-[#1a1a1a]">
                        {t.scanUploadTitle}
                      </span>
                      <span className="px-1.5 py-0.5 bg-[#ffdad6] text-[#e63b2e] border border-[#1a1a1a] text-[10px] font-['Space_Mono'] font-bold">
                        {currentLang === 'kn' ? 'ಕನ್ನಡ' : currentLang === 'hi' ? 'हिंदी' : 'ENGLISH'}
                      </span>
                    </div>
                    <p className="text-xs text-[#4a4a4a] font-['Inter'] mt-0.5">
                      {t.scanUploadSubtitle}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-['Space_Grotesk'] font-bold text-[#e63b2e] pl-4 shrink-0">
                  <span className="hidden sm:inline">{t.scanUploadBtn}</span>
                  <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </div>
              </div>
            </div>

            {/* Conversational Transcript Feed */}
            <div className="transcript-thread flex flex-col gap-6 text-left my-2 flex-1">
              {turns.map((turn, index) => (
                <div key={turn.id || index} className="chat-bubble flex gap-4 sm:gap-6 items-start">
                  <div className="bubble-meta w-20 sm:w-24 shrink-0 pt-1">
                    <span className="meta-label">{turn.timestamp}</span>
                    <span className={`meta-label opacity-100 font-bold ${
                      turn.type === 'user' ? 'text-[#1a1a1a]' : 'text-[#e63b2e]'
                    }`}>
                      {turn.type === 'user' ? (currentLang === 'kn' ? 'ನೀವು' : currentLang === 'hi' ? 'आप' : 'YOU') : (currentLang === 'kn' ? 'ಸಹಾಯಕ' : currentLang === 'hi' ? 'सहायक' : 'ASSISTANT')}
                    </span>
                  </div>

                  <div className="bubble-content flex-1">
                    {/* User Message */}
                    {turn.type === 'user' && (
                      <div className="bg-white border-2 border-[#1a1a1a] p-4 shadow-[3px_3px_0px_#1a1a1a]">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-['Space_Mono'] font-bold text-[#e63b2e] bg-[#ffdad6] px-1.5 py-0.5 border border-[#1a1a1a]">
                            {currentLang === 'kn' ? 'ಕನ್ನಡ' : currentLang === 'hi' ? 'हिंदी' : 'English'}
                          </span>
                          <span className="text-[10px] font-['Space_Mono'] opacity-50">
                            {turn.attachedFile ? t.attachedBadge : (currentLang === 'kn' ? 'ಧ್ವನಿ / ಪಠ್ಯ' : currentLang === 'hi' ? 'वॉइस / टेक्स्ट' : 'Voice/Text')}
                          </span>
                        </div>

                        {/* Attached File Preview Card */}
                        {turn.attachedFile && (
                          <div className="flex items-center gap-2 mb-2 p-2 bg-[#f8f7f4] border border-[#1a1a1a] text-xs font-['Space_Grotesk']">
                            <span className="material-symbols-outlined text-[18px] text-[#e63b2e]">attach_file</span>
                            <span className="font-bold text-[#1a1a1a]">{turn.attachedFile.name}</span>
                            <span className="text-[10px] font-mono text-[#666]">({turn.attachedFile.size || 'Attached'})</span>
                            <span className="ml-auto text-[10px] bg-[#ffdad6] text-[#e63b2e] px-1.5 py-0.5 border border-[#1a1a1a] font-bold">
                              {t.attachedBadge}
                            </span>
                          </div>
                        )}

                        <p className="text-base sm:text-lg font-medium leading-relaxed font-['Space_Grotesk'] text-[#1a1a1a]">
                          {getTurnMainText(turn, currentLang)}
                        </p>
                      </div>
                    )}

                    {/* Assistant Message */}
                    {turn.type === 'assistant' && (() => {
                      const turnActiveLang = getTurnActiveLang(turn);
                      const turnVoiceLang = getTurnVoiceLang(turn);
                      const isOverdue = turn.extractedInfo?.isOverdue || turn.expiryNotice?.isOverdue;
                      const hasNoDueDate = turn.extractedInfo?.hasNoDueDate || turn.expiryNotice?.hasNoDueDate;
                      const daysOverdue = turn.extractedInfo?.daysOverdue || turn.expiryNotice?.daysOverdue || 0;
                      const properDeadline = formatProperDate(turn.extractedInfo?.deadline || turn.expiryNotice?.deadline, turnActiveLang);
                      const properIssueDate = formatProperDate(turn.extractedInfo?.issueDate, turnActiveLang);

                      return (
                        <div className="card-variation3 space-y-3">
                          {/* Turn-Level Summary & Voice Language Switcher Bar */}
                          <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-[#eee9e0] border-2 border-[#1a1a1a] shadow-[2px_2px_0px_#1a1a1a]">
                            <div className="flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-[18px] text-[#e63b2e]">translate</span>
                              <span className="font-['Space_Grotesk'] text-xs font-bold uppercase tracking-wider text-[#1a1a1a]">
                                {turnActiveLang === 'kn' ? 'ಸಾರಾಂಶ & ಧ್ವನಿ ಭಾಷೆ:' : turnActiveLang === 'hi' ? 'सारांश और आवाज़ की भाषा:' : 'Summary & Voice Language:'}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-1">
                              <button
                                onClick={() => handleSwitchTurnLanguage(turn.id, 'kn')}
                                className={`px-2.5 py-1 text-xs font-['Space_Grotesk'] font-bold border-2 transition-all cursor-pointer ${
                                  turnActiveLang === 'kn'
                                    ? 'bg-[#e63b2e] text-white border-[#1a1a1a] shadow-[2px_2px_0px_#1a1a1a]'
                                    : 'bg-white text-[#1a1a1a] border-[#1a1a1a] hover:bg-black/5'
                                }`}
                                title="Switch summary & voice to Kannada (ಕನ್ನಡ)"
                              >
                                ಕನ್ನಡ (Kannada)
                              </button>
                              <button
                                onClick={() => handleSwitchTurnLanguage(turn.id, 'en')}
                                className={`px-2.5 py-1 text-xs font-['Space_Grotesk'] font-bold border-2 transition-all cursor-pointer ${
                                  turnActiveLang === 'en'
                                    ? 'bg-[#e63b2e] text-white border-[#1a1a1a] shadow-[2px_2px_0px_#1a1a1a]'
                                    : 'bg-white text-[#1a1a1a] border-[#1a1a1a] hover:bg-black/5'
                                }`}
                                title="Switch summary & voice to English"
                              >
                                English
                              </button>
                              <button
                                onClick={() => handleSwitchTurnLanguage(turn.id, 'hi')}
                                className={`px-2.5 py-1 text-xs font-['Space_Grotesk'] font-bold border-2 transition-all cursor-pointer ${
                                  turnActiveLang === 'hi'
                                    ? 'bg-[#e63b2e] text-white border-[#1a1a1a] shadow-[2px_2px_0px_#1a1a1a]'
                                    : 'bg-white text-[#1a1a1a] border-[#1a1a1a] hover:bg-black/5'
                                }`}
                                title="Switch summary & voice to Hindi (हिंदी)"
                              >
                                हिंदी (Hindi)
                              </button>
                            </div>
                          </div>

                          {/* Primary Assistant Explanation */}
                          <p className="text-base sm:text-lg font-['Space_Grotesk'] font-medium leading-relaxed text-[#1a1a1a]">
                            {getTurnMainText(turn, turnActiveLang)}
                          </p>

                          {/* Key Points Present in Document Card */}
                          {getTurnKeyPoints(turn, turnActiveLang) && getTurnKeyPoints(turn, turnActiveLang)!.length > 0 && (
                            <div className="p-3.5 bg-white border-2 border-[#1a1a1a] shadow-[2px_2px_0px_#1a1a1a] space-y-2">
                              <div className="flex items-center gap-1.5 text-[#1a1a1a] border-b border-[#1a1a1a]/15 pb-1">
                                <span className="material-symbols-outlined text-[18px] text-[#e63b2e]">format_list_bulleted</span>
                                <span className="font-['Space_Grotesk'] text-xs font-bold uppercase tracking-wider">
                                  {turnActiveLang === 'kn' ? 'ದಾಖಲೆಯ ಪ್ರಮುಖ ಅಂಶಗಳು (Key Points)' : turnActiveLang === 'hi' ? 'दस्तावेज के मुख्य बिंदु (Key Points)' : 'Key Points Present in Document'}
                                </span>
                              </div>
                              <ul className="space-y-1.5 pt-1">
                                {getTurnKeyPoints(turn, turnActiveLang)!.map((point, ptIdx) => (
                                  <li key={ptIdx} className="font-['Inter'] text-xs sm:text-sm text-[#1a1a1a] flex items-start gap-2">
                                    <span className="text-[#e63b2e] font-bold">•</span>
                                    <span>{point}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Layman's Terms Summary Card (Dynamic Single Language) */}
                          {getTurnLaymanSummary(turn, turnActiveLang) && (
                            <div className="p-3 bg-[#fff8e7] border-2 border-[#1a1a1a] shadow-[2px_2px_0px_#1a1a1a] space-y-1">
                              <div className="flex items-center gap-1.5 text-[#1a1a1a]">
                                <span className="material-symbols-outlined text-[18px] text-[#e63b2e]">lightbulb</span>
                                <span className="font-['Space_Grotesk'] text-xs font-bold uppercase tracking-wider">
                                  {turnActiveLang === 'kn' ? 'ಸರಳ ಭಾಷೆಯ ಸಾರಾಂಶ (Layman\'s Terms)' : turnActiveLang === 'hi' ? 'सरल भाषा में सारांश (Layman\'s Terms)' : 'Layman\'s Terms Summary (Plain Words)'}
                                </span>
                              </div>
                              <p className="font-['Inter'] text-xs sm:text-sm text-[#1a1a1a] leading-relaxed">
                                {getTurnLaymanSummary(turn, turnActiveLang)}
                              </p>
                            </div>
                          )}

                          {/* Check Understanding: Key Points Verified */}
                          {getTurnUnderstandingCheck(turn, turnActiveLang) && getTurnUnderstandingCheck(turn, turnActiveLang)!.length > 0 && (
                            <div className="p-3.5 bg-white border-2 border-[#1a1a1a] shadow-[2px_2px_0px_#1a1a1a] space-y-2">
                              <div className="flex items-center justify-between border-b border-[#1a1a1a]/15 pb-1.5">
                                <div className="flex items-center gap-1.5">
                                  <span className="material-symbols-outlined text-[18px] text-[#0055ff]">fact_check</span>
                                  <span className="font-['Space_Grotesk'] text-xs font-bold uppercase text-[#1a1a1a]">
                                    {turnActiveLang === 'kn' ? 'ತಿಳುವಳಿಕೆ ಪರಿಶೀಲನೆ (Comprehension Check)' : turnActiveLang === 'hi' ? 'अपनी समझ जांचें (Comprehension Check)' : 'Check Your Understanding (Comprehension Check)'}
                                  </span>
                                </div>
                                <span className="text-[10px] font-['Space_Mono'] font-bold bg-[#eee9e0] px-1.5 py-0.5 border border-[#1a1a1a]">
                                  {turnActiveLang === 'kn' ? 'ತಿಳುವಳಿಕೆ ಪರೀಕ್ಷೆ' : turnActiveLang === 'hi' ? 'समझ की जांच' : 'Comprehension Check'}
                                </span>
                              </div>
                              <div className="space-y-1.5 pt-1">
                                {getTurnUnderstandingCheck(turn, turnActiveLang)!.map((check, cIdx) => (
                                  <details key={cIdx} className="group border border-[#1a1a1a]/25 p-2 bg-[#faf7f2] cursor-pointer">
                                    <summary className="font-['Space_Grotesk'] text-xs font-bold text-[#1a1a1a] flex items-center justify-between list-none">
                                      <span className="flex items-center gap-2">
                                        <span className="w-4 h-4 rounded-full bg-[#1a1a1a] text-white flex items-center justify-center text-[10px] shrink-0 font-mono">
                                          {cIdx + 1}
                                        </span>
                                        <span>{check.question}</span>
                                      </span>
                                      <span className="material-symbols-outlined text-[16px] group-open:rotate-180 transition-transform">
                                        expand_more
                                      </span>
                                    </summary>
                                    <div className="mt-2 pt-2 border-t border-[#1a1a1a]/15 text-xs text-[#333] font-['Inter'] pl-6">
                                      <span className="font-bold text-[#e63b2e]">{turnActiveLang === 'kn' ? 'ದೃಢೀಕರಿಸಿದ ವಿವರಣೆ: ' : turnActiveLang === 'hi' ? 'सत्यापित समझ: ' : 'Verified Understanding: '}</span>
                                      {check.explanation}
                                    </div>
                                  </details>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* OVERDUE DOCUMENT ALERT */}
                          {isOverdue && (
                            <div className="p-3 bg-[#b91c1c] text-white border-2 border-[#1a1a1a] shadow-[3px_3px_0px_#1a1a1a] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="flex items-center gap-2.5">
                                <span className="material-symbols-outlined text-white text-[24px] animate-bounce">warning</span>
                                <div>
                                  <span className="font-['Space_Grotesk'] text-xs font-bold uppercase text-white block">
                                    {turnActiveLang === 'kn' ? '⚠️ ಅಂತಿಮ ಗಡುವು ಮೀರಿದೆ' : turnActiveLang === 'hi' ? '⚠️ वैधानिक देय तिथि समाप्त' : '⚠️ STATUTORY DUE DATE PASSED'}
                                    {daysOverdue > 0 ? ` • ${daysOverdue} ${turnActiveLang === 'kn' ? 'ದಿನಗಳು ಕಳೆದಿವೆ' : turnActiveLang === 'hi' ? 'दिन का विलंब' : 'days overdue'}` : ''}
                                  </span>
                                  <span className="text-xs text-white/95 font-['Inter']">
                                    {turnActiveLang === 'kn'
                                      ? `ಈ ದಾಖಲೆಯ ಅಂತಿಮ ದಿನಾಂಕ ${properDeadline} ರಂದು ಮೀರಿದೆ (${daysOverdue} ದಿನಗಳು ಕಳೆದಿವೆ). ದಂಡ ಅಥವಾ ಶಾಸನಬದ್ಧ ಬಡ್ಡಿಯನ್ನು ತಪ್ಪಿಸಲು ತಕ್ಷಣ ಕ್ರಮ ಕೈಗೊಳ್ಳಿ.`
                                      : turnActiveLang === 'hi'
                                      ? `यह दस्तावेज ${properDeadline} को अपनी देय तिथि पार कर चुका है (${daysOverdue} दिन का विलंब)। अतिरिक्त जुर्माने से बचने के लिए तत्काल कार्रवाई करें।`
                                      : `This document has passed its statutory due date on ${properDeadline} (Overdue by ${daysOverdue} days). Immediate action is required.`}
                                  </span>
                                </div>
                              </div>
                              <button
                                onClick={() => handleActionButtonClick('procedure')}
                                className="shrink-0 px-3 py-1.5 bg-white hover:bg-[#ffcc00] text-[#1a1a1a] font-['Space_Grotesk'] text-xs font-bold uppercase border border-[#1a1a1a] shadow-[2px_2px_0px_#1a1a1a] cursor-pointer flex items-center gap-1.5"
                              >
                                <span className="material-symbols-outlined text-[16px] text-[#b91c1c]">emergency</span>
                                <span>{turnActiveLang === 'kn' ? 'ತುರ್ತು ಪರಿಹಾರ' : turnActiveLang === 'hi' ? 'आपातकालीन समाधान' : 'Emergency Action'}</span>
                              </button>
                            </div>
                          )}

                          {/* INFORMATIONAL / NO DUE DATE BANNER */}
                          {hasNoDueDate && (
                            <div className="p-2.5 bg-[#eee9e0] border border-[#1a1a1a] flex items-center gap-2 text-xs font-['Space_Grotesk'] font-bold text-[#4a4a4a]">
                              <span className="material-symbols-outlined text-[18px] text-[#0055ff]">info</span>
                              <span>
                                {turnActiveLang === 'kn' ? 'ಈ ದಾಖಲೆಯಲ್ಲಿ ಯಾವುದೇ ಅಂತಿಮ ಗಡುವನ್ನು ನಮೂದಿಸಲಾಗಿಲ್ಲ (ಮಾಹಿತಿ ಉದ್ದೇಶದ ದಾಖಲೆ)' : turnActiveLang === 'hi' ? 'इस दस्तावेज में कोई देय तिथि उल्लिखित नहीं है (केवल सूचनात्मक रिकॉर्ड)' : 'No due date is mentioned in this document (Informational notice)'}
                              </span>
                            </div>
                          )}

                          {/* UPCOMING EXPIRING ALERT (Only when due date is present and not overdue) */}
                          {!hasNoDueDate && !isOverdue && turn.expiryNotice && turn.expiryNotice.isExpiringSoon && (
                            <div className="p-3 bg-[#ffdad6] border-2 border-[#e63b2e] shadow-[3px_3px_0px_#e63b2e] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="flex items-center gap-2.5">
                                <span className="material-symbols-outlined text-[#e63b2e] text-[22px] animate-pulse">alarm</span>
                                <div>
                                  <span className="font-['Space_Grotesk'] text-xs font-bold uppercase text-[#e63b2e] block">
                                    {turnActiveLang === 'kn' ? '⚠️ ಶಾಸನಬದ್ಧ ನೋಟಿಸ್ ಅವಧಿ ಮುಕ್ತಾಯ ಜ್ಞಾಪನೆ' : turnActiveLang === 'hi' ? '⚠️ वैधानिक नोटिस समाप्ति अनुस्मारक' : '⚠️ Statutory Notice Expiry Reminder'} • {turn.expiryNotice.daysRemaining} {turnActiveLang === 'kn' ? 'ದಿನಗಳು ಬಾಕಿ' : turnActiveLang === 'hi' ? 'दिन शेष' : 'Days Left'}
                                  </span>
                                  <span className="text-xs text-[#1a1a1a] font-['Inter']">
                                    {turnActiveLang === 'kn' ? 'ಶಾಸನಬದ್ಧ ಅಂತಿಮ ದಿನಾಂಕ:' : turnActiveLang === 'hi' ? 'वैधानिक देय तिथि:' : 'Statutory Due Date:'} <strong>{properDeadline}</strong>. {turn.expiryNotice.penaltyWarning || (turnActiveLang === 'kn' ? 'ಹೆಚ್ಚುವರಿ ದಂಡವನ್ನು ತಪ್ಪಿಸಲು ಸಕಾಲದಲ್ಲಿ ಕ್ರಮ ಕೈಗೊಳ್ಳಿ.' : turnActiveLang === 'hi' ? 'अतिरिक्त जुर्माने से बचने के लिए समय पर कार्रवाई करें।' : 'Action required to avoid additional penalty interest.')}
                                  </span>
                                </div>
                              </div>
                              <button
                                onClick={() => handleExportIcs(activeNotice)}
                                className="shrink-0 px-3 py-1.5 bg-[#e63b2e] hover:bg-[#1a1a1a] text-white font-['Space_Grotesk'] text-xs font-bold uppercase border border-[#1a1a1a] shadow-[2px_2px_0px_#1a1a1a] cursor-pointer flex items-center gap-1.5"
                              >
                                <span className="material-symbols-outlined text-[16px]">calendar_add_on</span>
                                <span>{turnActiveLang === 'kn' ? 'ಕ್ಯಾಲೆಂಡರ್ ಜ್ಞಾಪನೆ' : turnActiveLang === 'hi' ? 'कैलेंडर अनुस्मारक' : 'Set Calendar Reminder'}</span>
                              </button>
                            </div>
                          )}

                          {/* Safety Refusal Notice (if applicable) */}
                          {turn.safetyRefusal && (
                            <div className="p-3 bg-[#ffdad6] border border-[#e63b2e] text-[#e63b2e] text-xs font-['Space_Grotesk'] font-bold">
                              Policy Notice: Requests involving fraud, illegal evasion, or falsification cannot be supported. Lawful procedures are provided below.
                            </div>
                          )}

                          {/* Extracted Key Information Card */}
                          {turn.extractedInfo && (
                            <div className="mt-3 p-3.5 bg-[#faf7f2] border-2 border-[#1a1a1a] space-y-2">
                              <span className="meta-label text-[#e63b2e]">
                                {turnActiveLang === 'kn' ? 'ದಾಖಲೆಯಿಂದ ಪಡೆದ ಪ್ರಮುಖ ಮಾಹಿತಿ' : turnActiveLang === 'hi' ? 'दस्तावेज से प्राप्त मुख्य तथ्य' : 'Extracted Notice Facts'}
                              </span>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-['Space_Grotesk']">
                                {/* Due Date: only shown if there is a due date */}
                                {!hasNoDueDate && properDeadline && (
                                  <div className={`p-2 border ${isOverdue ? 'bg-[#fee2e2] border-[#b91c1c]' : 'bg-white border-[#1a1a1a]'}`}>
                                    <span className={`meta-label ${isOverdue ? 'text-[#b91c1c] font-bold' : ''}`}>
                                      {isOverdue ? (turnActiveLang === 'kn' ? 'ಅಂತಿಮ ಗಡುವು ಮೀರಿದೆ' : turnActiveLang === 'hi' ? 'देय तिथि समाप्त' : 'PASSED DUE DATE') : (turnActiveLang === 'kn' ? 'ಶಾಸನಬದ್ಧ ಅಂತಿಮ ದಿನಾಂಕ' : turnActiveLang === 'hi' ? 'वैधानिक देय तिथि' : 'Statutory Due Date')}
                                    </span>
                                    <strong className={`text-sm block ${isOverdue ? 'text-[#b91c1c]' : 'text-[#e63b2e]'}`}>
                                      {properDeadline} {isOverdue ? `(${daysOverdue} ${turnActiveLang === 'kn' ? 'ದಿನಗಳು ಕಳೆದಿವೆ' : turnActiveLang === 'hi' ? 'दिन का विलंब' : 'days overdue'})` : turn.extractedInfo.daysRemaining !== null ? `(${turn.extractedInfo.daysRemaining} ${turnActiveLang === 'kn' ? 'ದಿನಗಳು ಬಾಕಿ' : turnActiveLang === 'hi' ? 'दिन शेष' : 'days left'})` : ''}
                                    </strong>
                                  </div>
                                )}
                                {/* Issue Date: proper formatted date */}
                                {properIssueDate && (
                                  <div className="p-2 bg-white border border-[#1a1a1a]">
                                    <span className="meta-label">
                                      {turnActiveLang === 'kn' ? 'ನೀಡಿದ ದಿನಾಂಕ' : turnActiveLang === 'hi' ? 'जारी करने की तिथि' : 'Issue Date'}
                                    </span>
                                    <strong className="text-xs text-[#1a1a1a] block">
                                      {properIssueDate}
                                    </strong>
                                  </div>
                                )}
                                {turn.extractedInfo.amount && (
                                  <div className="p-2 bg-white border border-[#1a1a1a]">
                                    <span className="meta-label">
                                      {turnActiveLang === 'kn' ? 'ಬೇಡಿಕೆ ಮೊತ್ತ' : turnActiveLang === 'hi' ? 'मांग राशि' : 'Demanded Amount'}
                                    </span>
                                    <strong className="text-sm text-[#1a1a1a] block">
                                      {turn.extractedInfo.amount}
                                    </strong>
                                  </div>
                                )}
                                {turn.extractedInfo.authority && (
                                  <div className="p-2 bg-white border border-[#1a1a1a]">
                                    <span className="meta-label">
                                      {turnActiveLang === 'kn' ? 'ಹೊರಡಿಸಿದ ಪ್ರಾಧಿಕಾರ' : turnActiveLang === 'hi' ? 'जारीकर्ता प्राधिकरण' : 'Issuing Authority'}
                                    </span>
                                    <strong className="text-xs text-[#1a1a1a] block">
                                      {turn.extractedInfo.authority}
                                    </strong>
                                  </div>
                                )}
                                {turn.extractedInfo.action && (
                                  <div className="p-2 bg-white border border-[#1a1a1a]">
                                    <span className="meta-label">
                                      {turnActiveLang === 'kn' ? 'ಅಗತ್ಯ ಮುಂದಿನ ಕ್ರಮ' : turnActiveLang === 'hi' ? 'आवश्यक अगला कदम' : 'Required Action'}
                                    </span>
                                    <strong className="text-xs text-[#1a1a1a] block">
                                      {turn.extractedInfo.action}
                                    </strong>
                                  </div>
                                )}
                              </div>
                              <span className="text-[10px] text-[#4a4a4a] italic block pt-1">
                                * {turnActiveLang === 'kn' ? 'ದಾಖಲೆಯಿಂದ ಪಡೆದ ನಿಖರ ಮಾಹಿತಿ. ಅಧಿಕೃತ ಮೂಲಗಳಿಂದ ದೃಢೀಕರಿಸಿ.' : turnActiveLang === 'hi' ? 'दस्तावेज से प्राप्त जानकारी। कृपया आधिकारिक स्रोतों से पुष्टि करें।' : 'Information verified from document. Check official records.'}
                              </span>
                            </div>
                          )}

                          {/* Action Buttons & Multilingual Voice Output */}
                          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-[#1a1a1a]/15">
                            {turn.actionButtons?.map((btn, bIdx) => (
                              <button
                                key={bIdx}
                                onClick={() => handleActionButtonClick(btn.action)}
                                className={`pill ${bIdx === 0 ? 'accent' : ''}`}
                              >
                                {getActionButtonLabel(btn.action, btn.label, turnActiveLang)}
                              </button>
                            ))}

                            {/* Voice Output Section: Direct Playback & Language Switchers */}
                            <div className="flex flex-wrap items-center gap-1.5 bg-black/5 p-1 border border-[#1a1a1a] ml-auto">
                              <span className="text-[10px] font-['Space_Mono'] uppercase font-bold px-1 text-[#4a4a4a]">
                                {t.listen}
                              </span>
                              {speakingTurnId === turn.id ? (
                                <button
                                  onClick={handleStopAssistantVoice}
                                  className="px-2 py-1 bg-[#e63b2e] text-white border border-[#1a1a1a] text-xs font-['Space_Grotesk'] font-bold flex items-center gap-1 cursor-pointer animate-pulse"
                                >
                                  <span className="material-symbols-outlined text-[14px]">stop</span>
                                  <span>{t.stopVoice}</span>
                                </button>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handlePlayAssistantVoice(turn)}
                                    className="px-2 py-1 bg-white hover:bg-[#1a1a1a] hover:text-white border border-[#1a1a1a] text-xs font-['Space_Grotesk'] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                                    title={`Read Aloud in ${turnActiveLang.toUpperCase()}`}
                                  >
                                    <span className="material-symbols-outlined text-[14px] text-[#e63b2e]">volume_up</span>
                                    <span>{t.readAloud} ({turnActiveLang.toUpperCase()})</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      handleSwitchTurnVoiceOnly(turn.id, 'kn');
                                      handlePlayAssistantVoice(turn, 'kn');
                                    }}
                                    className={`px-2 py-1 border border-[#1a1a1a] text-xs font-['Space_Grotesk'] font-bold cursor-pointer transition-colors ${
                                      turnVoiceLang === 'kn' ? 'bg-[#ffdad6] text-[#e63b2e]' : 'bg-white hover:bg-black/5'
                                    }`}
                                    title="Play voice output in Kannada (ಕನ್ನಡ)"
                                  >
                                    ಕನ್ನಡ
                                  </button>
                                  <button
                                    onClick={() => {
                                      handleSwitchTurnVoiceOnly(turn.id, 'hi');
                                      handlePlayAssistantVoice(turn, 'hi');
                                    }}
                                    className={`px-2 py-1 border border-[#1a1a1a] text-xs font-['Space_Grotesk'] font-bold cursor-pointer transition-colors ${
                                      turnVoiceLang === 'hi' ? 'bg-[#ffdad6] text-[#e63b2e]' : 'bg-white hover:bg-black/5'
                                    }`}
                                    title="Play voice output in Hindi (हिंदी)"
                                  >
                                    हिंदी
                                  </button>
                                  <button
                                    onClick={() => {
                                      handleSwitchTurnVoiceOnly(turn.id, 'en');
                                      handlePlayAssistantVoice(turn, 'en');
                                    }}
                                    className={`px-2 py-1 border border-[#1a1a1a] text-xs font-['Space_Grotesk'] font-bold cursor-pointer transition-colors ${
                                      turnVoiceLang === 'en' ? 'bg-[#ffdad6] text-[#e63b2e]' : 'bg-white hover:bg-black/5'
                                    }`}
                                    title="Play voice output in English"
                                  >
                                    English
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              ))}

              {/* Live interim transcript when speaking */}
              {isListening && interimTranscript && (
                <div className="chat-bubble flex gap-4 sm:gap-6 items-start animate-pulse">
                  <div className="bubble-meta w-20 sm:w-24 shrink-0 pt-1">
                    <span className="meta-label">LIVE</span>
                    <span className="meta-label opacity-100 font-bold text-[#e63b2e]">SPEAKING</span>
                  </div>
                  <div className="bubble-content flex-1 bg-black/5 border-2 border-dashed border-[#e63b2e] p-3">
                    <p className="text-base font-['Space_Grotesk'] text-[#1a1a1a]">
                      “{interimTranscript}...”
                    </p>
                  </div>
                </div>
              )}

              {/* Processing Spinner */}
              {isProcessing && (
                <div className="flex items-center gap-2 text-xs font-['Space_Mono'] text-[#4a4a4a] ml-28 py-2">
                  <span className="w-3 h-3 border-2 border-[#1a1a1a] border-t-transparent rounded-full animate-spin" />
                  <span>{currentLang === 'kn' ? 'ಸಹಾಯಕರು ದಾಖಲೆಯನ್ನು ವಿಶ್ಲೇಷಿಸುತ್ತಿದ್ದಾರೆ...' : currentLang === 'hi' ? 'सहायक दस्तावेज का विश्लेषण कर रहे हैं...' : 'Assistant is thinking and reviewing document context...'}</span>
                </div>
              )}
            </div>

            {/* Bottom Text Input & Privacy Guarantee */}
            <div className="border-t-2 border-[#1a1a1a] pt-3 mt-auto text-left space-y-2">
              {/* Hidden file input for chat bar */}
              <input
                type="file"
                ref={chatFileInputRef}
                onChange={handleChatFileSelect}
                accept="application/pdf,image/*"
                className="hidden"
              />

              {/* Text & File input bar for accessibility */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage(textInput);
                }}
                className="flex items-center gap-2"
              >
                {/* File Attachment Button */}
                <button
                  type="button"
                  onClick={() => chatFileInputRef.current?.click()}
                  disabled={isProcessing}
                  className="px-3 py-2 bg-white hover:bg-[#ffdad6] text-[#1a1a1a] border-2 border-[#1a1a1a] cursor-pointer flex items-center gap-1.5 transition-colors shrink-0 disabled:opacity-40"
                  title={t.attachDocTooltip}
                >
                  <span className="material-symbols-outlined text-[18px] text-[#e63b2e]">attach_file</span>
                  <span className="text-xs font-['Space_Grotesk'] font-bold hidden sm:inline">
                    {currentLang === 'kn' ? 'ಕಡತ ಲಗತ್ತಿಸಿ' : currentLang === 'hi' ? 'फाइल संलग्न करें' : 'Attach File'}
                  </span>
                </button>

                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder={t.inputPlaceholder}
                  className="flex-1 bg-white border-2 border-[#1a1a1a] px-3.5 py-2 text-xs font-['Space_Grotesk'] text-[#1a1a1a] focus:outline-none focus:border-[#e63b2e]"
                />
                <button
                  type="submit"
                  disabled={!textInput.trim() || isProcessing}
                  className="px-4 py-2 bg-[#1a1a1a] hover:bg-[#e63b2e] disabled:opacity-40 text-white font-['Space_Grotesk'] text-xs font-bold uppercase border-2 border-[#1a1a1a] cursor-pointer transition-colors"
                >
                  {t.send}
                </button>
              </form>

              <div className="flex items-center justify-between text-left">
                <span className="meta-label">
                  {t.privacyFooter}
                </span>
                <span className="text-[10px] font-['Space_Mono'] text-[#4a4a4a]">
                  {t.spacebarHint}
                </span>
              </div>
            </div>
          </>
        )}

        {/* VIEW 2: Document Scanner & Active Notices */}
        {currentView === 'document-scanner' && (
          <div className="flex flex-col gap-6 text-left">
            <div>
              <span className="meta-label">Document Repository</span>
              <h1 className="font-['Space_Grotesk'] text-3xl font-bold uppercase mt-1">
                Notice Explainer &amp; Documents
              </h1>
              <p className="text-xs text-[#4a4a4a] mt-1 font-['Inter']">
                Select any official notice or scan a new document in English, Hindi, or Kannada.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {noticesList.map((notice) => (
                <div
                  key={notice.id}
                  onClick={() => {
                    setActiveNoticeId(notice.id);
                    setCurrentView('voice-agent');
                    handleSendMessage(`Please explain the statutory notice: ${notice.title}`);
                  }}
                  className={`card-variation3 p-5 flex flex-col justify-between cursor-pointer transition-transform hover:-translate-y-1 ${
                    activeNoticeId === notice.id ? 'border-[#e63b2e]' : ''
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-[#1a1a1a]/20">
                      <span className="meta-label">{notice.refNumber}</span>
                      <span className={`text-[10px] font-['Space_Mono'] font-bold px-1.5 py-0.5 border border-[#1a1a1a] ${notice.urgency === 'CRITICAL' ? 'bg-[#e63b2e] text-white' : 'bg-black/5 text-[#1a1a1a]'}`}>
                        {notice.daysRemaining}d left
                      </span>
                    </div>
                    <h3 className="font-['Space_Grotesk'] text-base font-bold uppercase mt-2 text-[#1a1a1a]">
                      {notice.title}
                    </h3>
                    <p className="text-xs text-[#4a4a4a] mt-1 font-['Inter']">
                      {notice.plainSummary.en}
                    </p>
                  </div>
                  <div className="mt-4 pt-2 border-t border-[#1a1a1a]/10 flex justify-between items-center text-xs font-['Space_Grotesk'] font-bold">
                    <span className="text-[#e63b2e]">Ask Assistant About Notice →</span>
                    <span>Due: {notice.deadlineDate}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t-2 border-[#1a1a1a] pt-4 flex gap-3">
              <button
                onClick={() => setIsDocScannerOpen(true)}
                className="pill accent font-bold"
              >
                Scan or Upload New Document
              </button>
              <button
                onClick={() => setCurrentView('voice-agent')}
                className="pill font-bold"
              >
                ← Return to Conversation
              </button>
            </div>
          </div>
        )}

        {/* VIEW 3: Deadlines & Calendar Schedule */}
        {currentView === 'my-deadlines' && (
          <div className="flex flex-col gap-6 text-left">
            <div>
              <span className="meta-label">Schedule &amp; Timelines</span>
              <h1 className="font-['Space_Grotesk'] text-3xl font-bold uppercase mt-1">
                Statutory Deadlines &amp; Calendar Reminders
              </h1>
            </div>

            <div className="flex flex-col gap-4">
              {noticesList.map((notice) => (
                <div key={notice.id} className="card-variation3 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="meta-label">{notice.department} • {notice.refNumber}</span>
                    <h3 className="font-['Space_Grotesk'] text-lg font-bold uppercase text-[#1a1a1a] mt-0.5">
                      {notice.title}
                    </h3>
                    <p className="text-xs text-[#4a4a4a] mt-1 font-['Inter']">
                      {notice.requiredAction.en}
                    </p>
                    <p className="text-xs font-bold text-[#e63b2e] font-['Space_Grotesk'] mt-1">
                      Due: {notice.deadlineDate} ({notice.daysRemaining} days left)
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => downloadIcsFile({
                        title: notice.title,
                        description: notice.requiredAction.en,
                        dueDate: notice.deadlineDate,
                        noticeRef: notice.refNumber
                      })}
                      className="pill accent"
                    >
                      Export .ics
                    </button>
                    <button
                      onClick={() => {
                        setActiveNoticeId(notice.id);
                        setCurrentView('voice-agent');
                        handleSendMessage(`Explain statutory limitations and calendar deadline for ${notice.title}`);
                      }}
                      className="pill"
                    >
                      Ask by Voice
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t-2 border-[#1a1a1a] pt-4">
              <button
                onClick={() => setCurrentView('voice-agent')}
                className="pill font-bold"
              >
                ← Return to Conversation
              </button>
            </div>
          </div>
        )}

        {/* VIEW 4: Lawful Rights & Legal Remedies */}
        {currentView === 'legal-rights' && (
          <div className="flex flex-col gap-6 text-left">
            <div>
              <span className="meta-label">Citizen Protection</span>
              <h1 className="font-['Space_Grotesk'] text-3xl font-bold uppercase mt-1">
                Lawful Rights, Procedures &amp; Remedies
              </h1>
              <p className="text-xs text-[#4a4a4a] mt-1 font-['Inter']">
                Official statutory avenues to dispute unfair demands, correct arithmetic errors, and file administrative grievances.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="card-variation3 p-5 space-y-2">
                <span className="meta-label text-[#e63b2e]">Income Tax Act</span>
                <h3 className="font-['Space_Grotesk'] text-base font-bold uppercase">Section 154 Rectification</h3>
                <p className="text-xs text-[#4a4a4a] font-['Inter'] leading-relaxed">
                  Completely free online statutory remedy when TDS credit or advance tax mismatch leads to incorrect demand intimations under Section 143(1).
                </p>
                <button onClick={() => setIsRectificationOpen(true)} className="pill mt-2">
                  View Step-by-Step Procedure
                </button>
              </div>

              <div className="card-variation3 p-5 space-y-2">
                <span className="meta-label text-[#e63b2e]">Appellate Remedy</span>
                <h3 className="font-['Space_Grotesk'] text-base font-bold uppercase">Section 246A Appeal</h3>
                <p className="text-xs text-[#4a4a4a] font-['Inter'] leading-relaxed">
                  Lawful appeal to Commissioner of Income Tax (Appeals) via electronic Form 35 within 30 days of demand notice.
                </p>
                <button onClick={() => setIsDraftOpen(true)} className="pill mt-2">
                  Draft Objection Grounds
                </button>
              </div>

              <div className="card-variation3 p-5 space-y-2">
                <span className="meta-label text-[#e63b2e]">Municipal Code</span>
                <h3 className="font-['Space_Grotesk'] text-base font-bold uppercase">BBMP Property Tax Section 108A</h3>
                <p className="text-xs text-[#4a4a4a] font-['Inter'] leading-relaxed">
                  Written objection to Assistant Revenue Officer against zoning reassessment or incorrect plinth measurement.
                </p>
                <button onClick={() => setIsDraftOpen(true)} className="pill mt-2">
                  Generate Objection Letter
                </button>
              </div>

              <div className="card-variation3 p-5 space-y-2">
                <span className="meta-label text-[#e63b2e]">Transparency Act</span>
                <h3 className="font-['Space_Grotesk'] text-base font-bold uppercase">Right to Information (RTI)</h3>
                <p className="text-xs text-[#4a4a4a] font-['Inter'] leading-relaxed">
                  Section 6(1) petition to compel disclosure of daily file movements when civic offices delay benefits or record updates.
                </p>
                <button onClick={() => setIsDraftOpen(true)} className="pill mt-2">
                  Prepare RTI Query
                </button>
              </div>
            </div>

            <div className="border-t-2 border-[#1a1a1a] pt-4">
              <button
                onClick={() => setCurrentView('voice-agent')}
                className="pill font-bold"
              >
                ← Return to Conversation
              </button>
            </div>
          </div>
        )}

        {/* VIEW 5: Privacy & Audio Telemetry */}
        {currentView === 'system-health' && (
          <div className="flex flex-col gap-6 text-left">
            <div>
              <span className="meta-label">Privacy &amp; Security Verification</span>
              <h1 className="font-['Space_Grotesk'] text-3xl font-bold uppercase mt-1">
                Privacy, Permissions &amp; Data Safeguards
              </h1>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="card-variation3 p-5">
                <span className="meta-label">Microphone &amp; Audio Processing</span>
                <h3 className="font-['Space_Grotesk'] text-base font-bold uppercase mt-1">Direct Voice Intake</h3>
                <p className="text-xs text-[#4a4a4a] mt-2">
                  Microphone audio is accessed only when you explicitly press the speak button or hold Spacebar. Audio samples are never stored or repurposed.
                </p>
                <div className="mt-3 text-xs font-['Space_Mono'] font-bold text-emerald-700">
                  STATUS: PERMISSION PROTECTED
                </div>
              </div>

              <div className="card-variation3 p-5">
                <span className="meta-label">Document Security</span>
                <h3 className="font-['Space_Grotesk'] text-base font-bold uppercase mt-1">Volatile Notice Parsing</h3>
                <p className="text-xs text-[#4a4a4a] mt-2">
                  Documents scanned via camera or uploaded are processed solely for extracting your deadlines, amounts, and action items.
                </p>
                <div className="mt-3 text-xs font-['Space_Mono'] font-bold text-emerald-700">
                  STATUS: ZERO UNNECESSARY EXPOSURE
                </div>
              </div>
            </div>

            <div className="border-t-2 border-[#1a1a1a] pt-4">
              <button
                onClick={() => setCurrentView('voice-agent')}
                className="pill font-bold"
              >
                ← Return to Conversation
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Interaction Panel Column (Voice & Interaction Hub) */}
      <section className="interaction-panel bg-white border-t-2 md:border-t-0 md:border-l-2 border-[#1a1a1a] flex flex-col shrink-0 text-left">
        {/* Visualizer & Spoken State Box */}
        <div className="visualizer-box p-5 md:p-6 bg-[#1a1a1a] text-white flex flex-col justify-end space-y-4">
          <div className="flex items-center justify-between">
            <span className="meta-label text-white/60 mb-0">Voice Interaction Hub</span>
            <span className={`text-[10px] font-['Space_Mono'] font-bold px-1.5 py-0.5 border ${
              isListening ? 'bg-[#e63b2e] border-white text-white animate-pulse' : 'border-white/30 text-white/70'
            }`}>
              {isListening ? 'LISTENING LIVE' : 'VOICE READY'}
            </span>
          </div>

          <div>
            <h2 className="font-['Space_Grotesk'] text-xl md:text-2xl font-bold tracking-wide">
              {inputLanguage === 'auto' ? `AUTO-DETECT [${detectedLanguage.toUpperCase()}]` : inputLanguage === 'kn' ? 'ಕನ್ನಡ (KANNADA)' : inputLanguage === 'hi' ? 'हिंदी (HINDI)' : 'ENGLISH FOCUS'}
            </h2>
            <p className="text-[11px] font-['Space_Mono'] text-white/70 mt-0.5">
              Spoken responses: <strong className="text-[#e63b2e] uppercase">{voiceOutputLanguage === 'auto' ? 'Auto-Detect' : voiceOutputLanguage === 'kn' ? 'Kannada' : voiceOutputLanguage === 'hi' ? 'Hindi' : 'English'}</strong>
            </p>
          </div>

          {/* Equalizer Wave Grid */}
          <div className="wave-grid">
            {[0.1, 0.3, 0.2, 0.5, 0.4, 0.6, 0.2, 0.1, 0.4, 0.5, 0.3, 0.2].map((delay, i) => (
              <div
                key={i}
                className="wave-bar bg-[#e63b2e]"
                style={{
                  animationDelay: `${delay}s`,
                  animationDuration: isListening ? '0.35s' : '1.2s',
                  height: isListening ? `${Math.floor(Math.random() * 70 + 25)}%` : '20%'
                }}
              />
            ))}
          </div>

          {/* SECTION A: Auto-Detect User Language Selection */}
          <div className="pt-2 border-t border-white/15 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-['Space_Mono'] uppercase tracking-wider text-white/70">
                User Language Input:
              </span>
              <span className="text-[10px] font-['Space_Mono'] font-bold text-[#e63b2e]">
                ⚡ {detectedLanguage === 'kn' ? 'ಕನ್ನಡ' : detectedLanguage === 'hi' ? 'हिंदी' : 'English'}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1">
              <button
                onClick={() => setInputLanguage('auto')}
                className={`py-1 text-[11px] font-['Space_Grotesk'] font-bold border transition-colors cursor-pointer text-center ${
                  inputLanguage === 'auto' ? 'bg-[#e63b2e] border-[#e63b2e] text-white' : 'border-white/30 text-white hover:border-white'
                }`}
                title="Automatically detect whether you speak or type in Kannada, Hindi, or English"
              >
                ⚡ Auto
              </button>
              <button
                onClick={() => {
                  setInputLanguage('kn');
                  setDetectedLanguage('kn');
                }}
                className={`py-1 text-[11px] font-['Space_Grotesk'] font-bold border transition-colors cursor-pointer text-center ${
                  inputLanguage === 'kn' ? 'bg-[#e63b2e] border-[#e63b2e] text-white' : 'border-white/30 text-white hover:border-white'
                }`}
              >
                ಕನ್ನಡ
              </button>
              <button
                onClick={() => {
                  setInputLanguage('hi');
                  setDetectedLanguage('hi');
                }}
                className={`py-1 text-[11px] font-['Space_Grotesk'] font-bold border transition-colors cursor-pointer text-center ${
                  inputLanguage === 'hi' ? 'bg-[#e63b2e] border-[#e63b2e] text-white' : 'border-white/30 text-white hover:border-white'
                }`}
              >
                हिंदी
              </button>
              <button
                onClick={() => {
                  setInputLanguage('en');
                  setDetectedLanguage('en');
                }}
                className={`py-1 text-[11px] font-['Space_Grotesk'] font-bold border transition-colors cursor-pointer text-center ${
                  inputLanguage === 'en' ? 'bg-[#e63b2e] border-[#e63b2e] text-white' : 'border-white/30 text-white hover:border-white'
                }`}
              >
                English
              </button>
            </div>
          </div>

          {/* SECTION B: Voice Output Option (Kannada, English, Hindi, Auto) */}
          <div className="pt-2 border-t border-white/15 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-['Space_Mono'] uppercase tracking-wider text-white/70">
                Voice Output Language:
              </span>
              <button
                onClick={() => handleTestVoiceOutput(voiceOutputLanguage)}
                className="text-[10px] font-['Space_Mono'] text-white hover:text-[#e63b2e] underline cursor-pointer flex items-center gap-0.5"
                title="Test audio voice playback"
              >
                <span className="material-symbols-outlined text-[12px]">volume_up</span>
                <span>Test Voice</span>
              </button>
            </div>
            <div className="grid grid-cols-4 gap-1">
              <button
                onClick={() => setVoiceOutputLanguage('auto')}
                className={`py-1 text-[11px] font-['Space_Grotesk'] font-bold border transition-colors cursor-pointer text-center ${
                  voiceOutputLanguage === 'auto' ? 'bg-[#e63b2e] border-[#e63b2e] text-white' : 'border-white/30 text-white hover:border-white'
                }`}
                title="Assistant voice matches user language"
              >
                ⚡ Auto
              </button>
              <button
                onClick={() => setVoiceOutputLanguage('kn')}
                className={`py-1 text-[11px] font-['Space_Grotesk'] font-bold border transition-colors cursor-pointer text-center ${
                  voiceOutputLanguage === 'kn' ? 'bg-[#e63b2e] border-[#e63b2e] text-white' : 'border-white/30 text-white hover:border-white'
                }`}
                title="Voice speaks in Kannada"
              >
                ಕನ್ನಡ
              </button>
              <button
                onClick={() => setVoiceOutputLanguage('hi')}
                className={`py-1 text-[11px] font-['Space_Grotesk'] font-bold border transition-colors cursor-pointer text-center ${
                  voiceOutputLanguage === 'hi' ? 'bg-[#e63b2e] border-[#e63b2e] text-white' : 'border-white/30 text-white hover:border-white'
                }`}
                title="Voice speaks in Hindi"
              >
                हिंदी
              </button>
              <button
                onClick={() => setVoiceOutputLanguage('en')}
                className={`py-1 text-[11px] font-['Space_Grotesk'] font-bold border transition-colors cursor-pointer text-center ${
                  voiceOutputLanguage === 'en' ? 'bg-[#e63b2e] border-[#e63b2e] text-white' : 'border-white/30 text-white hover:border-white'
                }`}
                title="Voice speaks in English"
              >
                English
              </button>
            </div>
          </div>
        </div>

        {/* Primary Master Voice Button (Circular Floating CTA) */}
        <button
          onClick={toggleVoiceListening}
          className={`record-btn w-20 h-20 bg-[#e63b2e] text-white rounded-full flex items-center justify-center -mt-10 mx-auto z-10 shadow-[0_10px_30px_rgba(230,59,46,0.3)] transition-transform active:scale-95 cursor-pointer border-2 border-white ${
            isListening ? 'animate-pulse scale-110' : 'hover:scale-105'
          }`}
          title={isListening ? 'Click to submit voice' : 'Click to speak naturally'}
        >
          <span className="material-symbols-outlined text-[2.5rem]">
            {isListening ? 'stop' : 'mic'}
          </span>
        </button>

        {/* Voice Error Notification */}
        {voiceError && (
          <div className="mx-6 mt-2 p-2 bg-[#ffdad6] border border-[#e63b2e] text-[#e63b2e] text-[11px] font-['Space_Grotesk'] font-bold">
            {voiceError}
          </div>
        )}

        {/* Side Info Panel */}
        <div className="side-info p-6 md:p-8 flex-1 flex flex-col justify-between">
          <div>
            {/* Small Box: Scan or Upload Document in Side Info */}
            <div
              onClick={() => setIsDocScannerOpen(true)}
              className="border-2 border-[#1a1a1a] bg-[#f8f7f4] hover:bg-white p-3 shadow-[3px_3px_0px_#1a1a1a] cursor-pointer mb-5 flex items-center justify-between transition-all group select-none"
            >
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[20px] text-[#e63b2e] group-hover:scale-110 transition-transform">
                  photo_camera
                </span>
                <div>
                  <span className="font-['Space_Grotesk'] text-xs font-bold uppercase block text-[#1a1a1a]">
                    {t.scanUploadBtn}
                  </span>
                  <span className="text-[10px] text-[#4a4a4a] font-['Space_Mono'] block">
                    {currentLang === 'kn' ? 'ಕನ್ನಡ ಅಥವಾ ಇಂಗ್ಲಿಷ್ ಕಡತ' : currentLang === 'hi' ? 'हिंदी या अंग्रेजी फाइल' : 'English or Indian Languages'}
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-['Space_Grotesk'] font-bold bg-[#1a1a1a] text-white px-2 py-0.5 uppercase group-hover:bg-[#e63b2e] transition-colors">
                {currentLang === 'kn' ? 'ಸ್ಕ್ಯಾನ್' : currentLang === 'hi' ? 'स्कैन' : 'Intake'}
              </span>
            </div>

            <span className="meta-label">{t.askNaturally}</span>
            <div className="flex flex-col gap-2 mt-2.5">
              {t.sampleQuestions.map((questionText, qIdx) => (
                <button
                  key={qIdx}
                  onClick={() => handleSendMessage(questionText, currentLang)}
                  className="pill text-left"
                >
                  “{questionText}”
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-black/10">
            <span className="meta-label">{t.statusTitle}</span>
            <p className="text-xs font-bold font-['Space_Grotesk'] text-[#1a1a1a] mt-0.5">
              {currentLang === 'kn' ? 'Go Vision ಸಹಾಯಕ' : currentLang === 'hi' ? 'Go Vision सहायक' : 'Go Vision Assistant'}
            </p>
            <p className="text-xs font-['Space_Mono'] opacity-60">
              {t.statusSub}
            </p>
          </div>
        </div>

        {/* Secure Banner at bottom */}
        <div className="secure-banner p-4 md:px-8 md:py-4 border-t border-[#1a1a1a]/10 flex items-center gap-3">
          <span className="material-symbols-outlined text-[#e63b2e] text-[22px]">
            verified_user
          </span>
          <div>
            <p className="text-xs font-bold font-['Space_Grotesk'] text-[#1a1a1a]">
              {currentLang === 'kn' ? 'ಶೂನ್ಯ ಸರ್ವರ್ ಆಡಿಯೋ ಸಂಗ್ರಹಣೆ' : currentLang === 'hi' ? 'शून्य सर्वर ऑडियो प्रतिधारण' : 'Zero Server Audio Retention'}
            </p>
            <p className="text-[11px] font-['Space_Mono'] opacity-60">
              {currentLang === 'kn' ? 'ಖಾಸಗಿ ನಾಗರಿಕ ಮಲ್ಟಿಮೊಡಲ್ ವ್ಯವಸ್ಥೆ' : currentLang === 'hi' ? 'निजी नागरिक मल्टीमॉडल कार्यक्षेत्र' : 'Private Citizen Multimodal Workspace'}
            </p>
          </div>
        </div>
      </section>

      {/* Camera Document Scanner & Uploader Modal */}
      <DocumentCameraScanner
        isOpen={isDocScannerOpen}
        onClose={() => setIsDocScannerOpen(false)}
        onDocumentScanned={handleDocumentScanned}
        language={currentLang}
      />

      {/* Notice Selector Modal */}
      {isNoticeSelectorOpen && (
        <ScannerModal
          isOpen={isNoticeSelectorOpen}
          onClose={() => setIsNoticeSelectorOpen(false)}
          language={detectedLanguage}
          onSelectForVoiceSession={(notice) => {
            setActiveNoticeId(notice.id);
            setIsNoticeSelectorOpen(false);
            handleSendMessage(`Explain the statutory details and deadline for notice: ${notice.title}`);
          }}
        />
      )}

      {/* Step-by-Step Procedure Modal */}
      <RectificationModal
        isOpen={isRectificationOpen}
        onClose={() => setIsRectificationOpen(false)}
      />

      {/* Draft Formal Response Modal */}
      <ResponseDraftModal
        isOpen={isDraftOpen}
        onClose={() => setIsDraftOpen(false)}
        noticeRef={activeNotice.refNumber}
      />
    </div>
  );
}
