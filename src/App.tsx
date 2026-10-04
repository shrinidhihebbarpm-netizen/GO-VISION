import React, { useState, useEffect, useRef } from 'react';
import { ViewMode, Language, VoiceOutputLanguage, InputLanguageSetting, ConversationTurn, StatutoryNotice } from './types';
import { MOCK_NOTICES } from './data/mockNotices';
import { downloadIcsFile } from './utils/icsGenerator';
import { soundController, detectLanguage } from './utils/audioSynthesizer';
import { ScannerModal } from './components/ScannerModal';
import { RectificationModal } from './components/RectificationModal';
import { ResponseDraftModal } from './components/ResponseDraftModal';
import { DocumentCameraScanner } from './components/DocumentCameraScanner';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('voice-agent');
  const [activeNoticeId, setActiveNoticeId] = useState<string>('IT-143-1-DEMAND');
  
  // Multilingual & Voice Configuration
  const [inputLanguage, setInputLanguage] = useState<InputLanguageSetting>('auto');
  const [detectedLanguage, setDetectedLanguage] = useState<Language>('kn');
  const [voiceOutputLanguage, setVoiceOutputLanguage] = useState<VoiceOutputLanguage>('auto');
  const [speakingTurnId, setSpeakingTurnId] = useState<string | null>(null);

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

  // Conversation turns
  const [turns, setTurns] = useState<ConversationTurn[]>([
    {
      id: 'turn-welcome',
      type: 'assistant',
      timestamp: '10:40 AM',
      text: 'ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ Go Vision ಸಹಾಯಕ (Assistant). ನಿಮ್ಮ ಸರ್ಕಾರಿ ನೋಟಿಸ್‌ಗಳು, ತೆರಿಗೆ ಪತ್ರಗಳು ಅಥವಾ ನಾಗರಿಕ ದಾಖಲೆಗಳ ಬಗ್ಗೆ ನೀವು ನೇರವಾಗಿ ಮಾತನಾಡಬಹುದು. ನಾನು ಕನ್ನಡ, ಹಿಂದಿ ಮತ್ತು ಇಂಗ್ಲಿಷ್ ಭಾಷೆಗಳನ್ನು ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಗುರುತಿಸುತ್ತೇನೆ (Auto-detect).',
      secondaryText: '[EN] Hello! I am your Go Vision Assistant. You can speak to me naturally about your official notices and civic documents. I auto-detect Kannada, Hindi, and English.',
      language: 'kn',
      detectedLanguage: 'kn',
      kannadaText: 'ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ Go Vision ಸಹಾಯಕ (Assistant). ನಿಮ್ಮ ಸರ್ಕಾರಿ ನೋಟಿಸ್‌ಗಳು, ತೆರಿಗೆ ಪತ್ರಗಳು ಅಥವಾ ನಾಗರಿಕ ದಾಖಲೆಗಳ ಬಗ್ಗೆ ನೀವು ನೇರವಾಗಿ ಮಾತನಾಡಬಹುದು.',
      hindiText: 'नमस्ते! मैं आपका Go Vision सहायक (Assistant) हूँ। आप अपने सरकारी नोटिस या नागरिक दस्तावेजों के बारे में मुझसे सीधे बोलकर बात कर सकते हैं।',
      englishText: 'Hello! I am your Go Vision Assistant. You can speak naturally about your official notices and civic documents.',
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
      secondaryText: '[EN] When is my income tax notice deadline and what are my next steps?',
      detectedLanguage: 'kn'
    },
    {
      id: 'turn-2',
      type: 'assistant',
      timestamp: '10:42 AM',
      text: 'ನಿಮ್ಮ ಸೆಕ್ಷನ್ 143(1) ಆದಾಯ ತೆರಿಗೆ ನೋಟಿಸ್‌ಗೆ ಉತ್ತರಿಸಲು ಮಾರ್ಚ್ 24, 2025 ಕೊನೆಯ ದಿನಾಂಕ (ಇನ್ನು 4 ದಿನಗಳು ಮಾತ್ರ ಬಾಕಿ ಉಳಿದಿದೆ). ಫಾರ್ಮ್ 26AS ನಡುವಿನ ವ್ಯತ್ಯಾಸದಿಂದ ₹18,450 ಮೊತ್ತವನ್ನು ಪಾವತಿಸಲು ತಿಳಿಸಲಾಗಿದೆ. ದಂಡ ತಪ್ಪಿಸಲು ಸೆಕ್ಷನ್ 154 ಅಡಿಯಲ್ಲಿ ಆನ್‌ಲೈನ್ ತಿದ್ದುಪಡಿ ಸಲ್ಲಿಸಬೇಕು.',
      secondaryText: '[EN] The statutory deadline to respond to your Section 143(1) notice is March 24, 2025 (4 days remaining). An amount of ₹18,450 has been flagged due to TDS mismatch. You should submit an online rectification under Section 154.',
      language: 'kn',
      detectedLanguage: 'kn',
      kannadaText: 'ನಿಮ್ಮ ಸೆಕ್ಷನ್ 143(1) ಆದಾಯ ತೆರಿಗೆ ನೋಟಿಸ್‌ಗೆ ಉತ್ತರಿಸಲು ಮಾರ್ಚ್ 24, 2025 ಕೊನೆಯ ದಿನಾಂಕ (ಇನ್ನು 4 ದಿನಗಳು ಮಾತ್ರ ಬಾಕಿ ಉಳಿದಿದೆ). ಫಾರ್ಮ್ 26AS ನಡುವಿನ ವ್ಯತ್ಯಾಸದಿಂದ ₹18,450 ಮೊತ್ತವನ್ನು ಪಾವತಿಸಲು ತಿಳಿಸಲಾಗಿದೆ. ದಂಡ ತಪ್ಪಿಸಲು ಸೆಕ್ಷನ್ 154 ಅಡಿಯಲ್ಲಿ ಆನ್‌ಲೈನ್ ತಿದ್ದುಪಡಿ ಸಲ್ಲಿಸಬೇಕು.',
      hindiText: 'आपकी धारा 143(1) आयकर नोटिस का जवाब देने की अंतिम तिथि 24 मार्च 2025 है (4 दिन शेष)। टीडीएस अंतर के कारण ₹18,450 की मांग की गई है। धारा 154 के तहत ऑनलाइन सुधार याचिका दायर करें।',
      englishText: 'The statutory deadline for your Section 143(1) notice is March 24, 2025 (4 days remaining). Demanded amount is ₹18,450 due to TDS mismatch. File online rectification under Section 154.',
      laymanSummary: 'In plain words: The tax department calculated ₹18,450 tax due to a mismatch between what your employer reported and your return. If this is a clerical error, you can submit a rectification online without paying. But you must act within 4 days (by March 24) to avoid 1% monthly penalty interest.',
      understandingCheck: [
        {
          question: 'Do you immediately have to pay ₹18,450?',
          explanation: 'No! If your TDS credit was valid, you can file a free rectification petition under Section 154 without paying the demand.'
        },
        {
          question: 'What is the absolute deadline to submit your response?',
          explanation: 'March 24, 2025 (only 4 days remaining). Beyond this, statutory monthly interest applies.'
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

  // Speak assistant response helper
  const handlePlayAssistantVoice = (turn: ConversationTurn, forcedVoiceLang?: VoiceOutputLanguage) => {
    const chosen = forcedVoiceLang || voiceOutputLanguage;
    soundController.stopSpeaking();
    setSpeakingTurnId(turn.id);
    soundController.speakAssistantTurn(
      {
        text: turn.text,
        kannadaText: turn.kannadaText,
        hindiText: turn.hindiText,
        englishText: turn.englishText,
        detectedLanguage: turn.detectedLanguage
      },
      chosen,
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
        secondaryText: reply.englishText && finalDetectedLang !== 'en' ? reply.englishText : (reply.kannadaText && finalDetectedLang !== 'kn' ? reply.kannadaText : undefined),
        kannadaText: reply.kannadaText,
        hindiText: reply.hindiText,
        englishText: reply.englishText,
        detectedLanguage: finalDetectedLang,
        safetyRefusal: reply.safetyRefusal,
        laymanSummary: reply.laymanSummary || activeNotice.laymanSummary?.en,
        understandingCheck: reply.understandingCheck || (activeNotice.understandingQuestions ? activeNotice.understandingQuestions.map(q => ({
          question: q.question,
          explanation: q.explanation
        })) : undefined),
        expiryNotice: reply.expiryNotice || {
          isExpiringSoon: activeNotice.daysRemaining <= 7,
          daysRemaining: activeNotice.daysRemaining,
          deadline: activeNotice.deadlineDate,
          penaltyWarning: activeNotice.penaltyText
        },
        extractedInfo: reply.extractedInfo || (activeNotice ? {
          deadline: activeNotice.deadlineDate,
          daysRemaining: activeNotice.daysRemaining,
          amount: activeNotice.amountDemanded || 'See details',
          authority: activeNotice.department,
          action: activeNotice.requiredAction.en,
          isCritical: activeNotice.urgency === 'CRITICAL',
          isExpiringSoon: activeNotice.daysRemaining <= 7
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
        secondaryText: `[EN] ${activeNotice.plainSummary.en}`,
        kannadaText: `${activeNotice.title}: ಉತ್ತರಿಸಲು ಕೊನೆಯ ದಿನಾಂಕ ${activeNotice.deadlineDate}. ${activeNotice.plainSummary.kn}`,
        hindiText: `${activeNotice.title}: अंतिम तिथि ${activeNotice.deadlineDate}। ${activeNotice.plainSummary.hi}`,
        englishText: `${activeNotice.title}: Deadline is ${activeNotice.deadlineDate}. ${activeNotice.plainSummary.en}`,
        detectedLanguage: currentDetected,
        laymanSummary: activeNotice.laymanSummary?.en,
        understandingCheck: activeNotice.understandingQuestions ? activeNotice.understandingQuestions.map(q => ({
          question: q.question,
          explanation: q.explanation
        })) : undefined,
        expiryNotice: {
          isExpiringSoon: activeNotice.daysRemaining <= 7,
          daysRemaining: activeNotice.daysRemaining,
          deadline: activeNotice.deadlineDate,
          penaltyWarning: activeNotice.penaltyText
        },
        extractedInfo: {
          deadline: activeNotice.deadlineDate,
          daysRemaining: activeNotice.daysRemaining,
          amount: activeNotice.amountDemanded || 'See document',
          authority: activeNotice.department,
          action: activeNotice.requiredAction.en,
          isCritical: activeNotice.urgency === 'CRITICAL',
          isExpiringSoon: activeNotice.daysRemaining <= 7
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
    
    // Add to notice list
    setNoticesList(prev => {
      if (prev.some(n => n.id === scannedNotice.id)) return prev;
      return [scannedNotice, ...prev];
    });

    setActiveNoticeId(scannedNotice.id);
    setCurrentView('voice-agent');

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userTurn: ConversationTurn = {
      id: `turn-user-scan-${Date.now()}`,
      type: 'user',
      timestamp: timeStr,
      text: `ನಾನು ಹೊಸ ದಾಖಲೆಯನ್ನು ಸ್ಕ್ಯಾನ್ ಮಾಡಿದ್ದೇನೆ: ${scannedNotice.title} (${scannedNotice.refNumber})`,
      secondaryText: `[EN] I scanned a new document: ${scannedNotice.title} (${scannedNotice.refNumber})`
    };

    const isExpiring = scannedNotice.daysRemaining <= 7;

    const assistantTurn: ConversationTurn = {
      id: `turn-assistant-scan-${Date.now()}`,
      type: 'assistant',
      timestamp: timeStr,
      text: `ದಾಖಲೆಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ವಿಶ್ಲೇಷಿಸಲಾಗಿದೆ. ${scannedNotice.department} ನೀಡಿದ ಈ ನೋಟಿಸ್‌ಗೆ ಉತ್ತರಿಸಲು ${scannedNotice.deadlineDate} ಕೊನೆಯ ದಿನಾಂಕ (${scannedNotice.daysRemaining} ದಿನಗಳು ಬಾಕಿ). ${scannedNotice.plainSummary.kn}`,
      secondaryText: `[EN] Successfully analyzed the document. The deadline issued by ${scannedNotice.department} is ${scannedNotice.deadlineDate} (${scannedNotice.daysRemaining} days remaining). ${scannedNotice.plainSummary.en}`,
      laymanSummary: scannedNotice.laymanSummary?.en || `In plain words: The notice requires action by ${scannedNotice.deadlineDate}. Don't miss this deadline to prevent penalties.`,
      understandingCheck: scannedNotice.understandingQuestions ? scannedNotice.understandingQuestions.map(q => ({
        question: q.question,
        explanation: q.explanation
      })) : [
        {
          question: `When is the final deadline to act?`,
          explanation: `${scannedNotice.deadlineDate} (${scannedNotice.daysRemaining} days left).`
        },
        {
          question: `What happens if you miss this date?`,
          explanation: scannedNotice.penaltyText || 'Penalties or interest may apply.'
        }
      ],
      expiryNotice: {
        isExpiringSoon: isExpiring,
        daysRemaining: scannedNotice.daysRemaining,
        deadline: scannedNotice.deadlineDate,
        penaltyWarning: scannedNotice.penaltyText
      },
      extractedInfo: {
        deadline: scannedNotice.deadlineDate,
        daysRemaining: scannedNotice.daysRemaining,
        amount: scannedNotice.amountDemanded || 'See notice',
        authority: scannedNotice.department,
        action: scannedNotice.requiredAction.en,
        isCritical: scannedNotice.urgency === 'CRITICAL',
        isExpiringSoon: isExpiring
      },
      actionButtons: [
        { label: 'Set Calendar Reminder', action: 'calendar' },
        { label: 'Explain Step-by-Step Procedure', action: 'procedure' },
        { label: 'Draft Formal Response', action: 'draft' }
      ]
    };

    setTurns(prev => [...prev, userTurn, assistantTurn]);

    if (isVoiceResponseEnabled) {
      setSpeakingTurnId(assistantTurn.id);
      soundController.speakAssistantTurn(
        {
          text: assistantTurn.text,
          kannadaText: assistantTurn.kannadaText,
          hindiText: assistantTurn.hindiText,
          englishText: assistantTurn.englishText,
          detectedLanguage: 'kn'
        },
        voiceOutputLanguage,
        () => setSpeakingTurnId(null)
      );
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
        {/* EXPIRING DOCUMENT REMINDER BANNER */}
        {(() => {
          const expiringNotice = noticesList.find(n => n.daysRemaining <= 7);
          if (!expiringNotice) return null;
          return (
            <div className="bg-[#e63b2e] text-white p-3.5 border-2 border-[#1a1a1a] shadow-[4px_4px_0px_#1a1a1a] flex flex-wrap items-center justify-between gap-3 text-left">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white text-[#e63b2e] flex items-center justify-center font-bold shrink-0">
                  <span className="material-symbols-outlined text-[24px] animate-pulse">alarm</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-[#ffcc00] text-[#1a1a1a] text-[10px] font-['Space_Mono'] font-bold px-1.5 py-0.2 uppercase border border-[#1a1a1a]">
                      Expiring in {expiringNotice.daysRemaining} Days
                    </span>
                    <h4 className="font-['Space_Grotesk'] text-sm font-bold uppercase tracking-tight">
                      Statutory Notice Expiry Reminder: {expiringNotice.title}
                    </h4>
                  </div>
                  <p className="text-xs text-white/90 font-['Inter'] mt-0.5">
                    Authority: <strong>{expiringNotice.department}</strong> • Statutory Due Date: <strong>{expiringNotice.deadlineDate}</strong>. {expiringNotice.penaltyText}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleExportIcs(expiringNotice)}
                  className="px-2.5 py-1.5 bg-white hover:bg-[#ffcc00] text-[#1a1a1a] font-['Space_Grotesk'] text-xs font-bold uppercase border border-[#1a1a1a] shadow-[2px_2px_0px_#1a1a1a] cursor-pointer flex items-center gap-1 transition-all"
                  title="Export .ics calendar reminder"
                >
                  <span className="material-symbols-outlined text-[16px]">calendar_add_on</span>
                  <span>Set Calendar Reminder</span>
                </button>
                <button
                  onClick={() => handleRequestBrowserNotification(expiringNotice)}
                  className="px-2.5 py-1.5 bg-[#1a1a1a] hover:bg-black text-white font-['Space_Grotesk'] text-xs font-bold uppercase border border-white shadow-[2px_2px_0px_#ffffff] cursor-pointer flex items-center gap-1 transition-all"
                  title="Receive desktop notification"
                >
                  <span className="material-symbols-outlined text-[16px]">notifications_active</span>
                  <span>Browser Alert</span>
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
                  <span className="meta-label mb-0">Assistant / Citizen Voice Session</span>
                  <span className="px-2 py-0.5 bg-[#ffdad6] text-[#e63b2e] border border-[#1a1a1a] text-[10px] font-['Space_Mono'] font-bold">
                    ⚡ Auto-Detected: {detectedLanguage === 'kn' ? 'ಕನ್ನಡ (Kannada)' : detectedLanguage === 'hi' ? 'हिंदी (Hindi)' : 'English'}
                  </span>
                </div>

                {/* Voice Output Options: Kannada, English, Hindi, Auto */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center bg-white border-2 border-[#1a1a1a] p-1 gap-1 text-xs font-['Space_Grotesk'] shadow-xs">
                    <span className="text-[10px] font-['Space_Mono'] font-bold uppercase text-[#4a4a4a] px-1">
                      Voice Output:
                    </span>
                    <button
                      onClick={() => setVoiceOutputLanguage('auto')}
                      className={`px-2 py-0.5 text-xs font-bold border transition-colors cursor-pointer ${
                        voiceOutputLanguage === 'auto'
                          ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]'
                          : 'border-transparent text-[#1a1a1a] hover:bg-black/5'
                      }`}
                      title="Voice matches user language automatically"
                    >
                      ⚡ Auto
                    </button>
                    <button
                      onClick={() => setVoiceOutputLanguage('kn')}
                      className={`px-2 py-0.5 text-xs font-bold border transition-colors cursor-pointer ${
                        voiceOutputLanguage === 'kn'
                          ? 'bg-[#e63b2e] text-white border-[#e63b2e]'
                          : 'border-transparent text-[#1a1a1a] hover:bg-black/5'
                      }`}
                      title="Voice output in Kannada (ಕನ್ನಡ)"
                    >
                      ಕನ್ನಡ
                    </button>
                    <button
                      onClick={() => setVoiceOutputLanguage('hi')}
                      className={`px-2 py-0.5 text-xs font-bold border transition-colors cursor-pointer ${
                        voiceOutputLanguage === 'hi'
                          ? 'bg-[#e63b2e] text-white border-[#e63b2e]'
                          : 'border-transparent text-[#1a1a1a] hover:bg-black/5'
                      }`}
                      title="Voice output in Hindi (हिंदी)"
                    >
                      हिंदी
                    </button>
                    <button
                      onClick={() => setVoiceOutputLanguage('en')}
                      className={`px-2 py-0.5 text-xs font-bold border transition-colors cursor-pointer ${
                        voiceOutputLanguage === 'en'
                          ? 'bg-[#e63b2e] text-white border-[#e63b2e]'
                          : 'border-transparent text-[#1a1a1a] hover:bg-black/5'
                      }`}
                      title="Voice output in English"
                    >
                      English
                    </button>

                    <button
                      onClick={() => handleTestVoiceOutput(voiceOutputLanguage)}
                      className="ml-1 px-1.5 py-0.5 bg-[#eee9e0] hover:bg-[#ffcc00] border border-[#1a1a1a] text-[10px] font-['Space_Mono'] font-bold flex items-center gap-0.5 cursor-pointer"
                      title="Test selected voice output"
                    >
                      <span className="material-symbols-outlined text-[13px]">play_arrow</span>
                      <span>Test</span>
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
                    <span className="hidden sm:inline">{isVoiceResponseEnabled ? 'Voice: ON' : 'Voice: MUTE'}</span>
                  </button>
                </div>
              </div>

              <h1 className="font-['Space_Grotesk'] text-4xl sm:text-5xl font-bold tracking-tight leading-none uppercase mt-2">
                GO VISION
              </h1>

              {/* Status & Active Document Bar */}
              <div className="flex flex-wrap items-center gap-6 sm:gap-8 mt-3 pt-1">
                <div>
                  <span className="meta-label">Role</span>
                  <span className="font-bold text-xs sm:text-sm font-['Space_Grotesk'] text-[#1a1a1a]">
                    Go Vision Assistant
                  </span>
                </div>
                <div>
                  <span className="meta-label">Voice Output</span>
                  <span className="font-bold text-xs sm:text-sm font-['Space_Grotesk'] text-[#e63b2e] uppercase">
                    {voiceOutputLanguage === 'auto' ? 'Auto-Detect' : voiceOutputLanguage === 'kn' ? 'Kannada (ಕನ್ನಡ)' : voiceOutputLanguage === 'hi' ? 'Hindi (हिंदी)' : 'English'}
                  </span>
                </div>
                <div>
                  <span className="meta-label">Active Document in Context</span>
                  <button
                    onClick={() => setIsNoticeSelectorOpen(true)}
                    className="font-bold text-xs sm:text-sm font-['Space_Grotesk'] text-[#1a1a1a] underline hover:text-[#e63b2e] cursor-pointer text-left flex items-center gap-1"
                    title="Change active notice context"
                  >
                    <span>{activeNotice.refNumber.replace('.pdf', '')}</span>
                    <span className="material-symbols-outlined text-[14px]">tune</span>
                  </button>
                </div>
              </div>

              {/* Box: Scan or Upload Document in Hindi, English, or Kannada */}
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
                        Scan or Upload Document
                      </span>
                      <span className="px-1.5 py-0.5 bg-[#ffdad6] text-[#e63b2e] border border-[#1a1a1a] text-[10px] font-['Space_Mono'] font-bold">
                        EN • HI • KN
                      </span>
                    </div>
                    <p className="text-xs text-[#4a4a4a] font-['Inter'] mt-0.5">
                      Scan or upload document which is in Hindi, English, or Kannada
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-['Space_Grotesk'] font-bold text-[#e63b2e] pl-4 shrink-0">
                  <span className="hidden sm:inline">Scan / Upload</span>
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
                      {turn.type === 'user' ? 'YOU' : 'ASSISTANT'}
                    </span>
                  </div>

                  <div className="bubble-content flex-1">
                    {/* User Message */}
                    {turn.type === 'user' && (
                      <div className="bg-white border-2 border-[#1a1a1a] p-4 shadow-[3px_3px_0px_#1a1a1a]">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-['Space_Mono'] font-bold text-[#e63b2e] bg-[#ffdad6] px-1.5 py-0.5 border border-[#1a1a1a]">
                            ⚡ Auto-Detected: {turn.detectedLanguage === 'kn' ? 'Kannada (ಕನ್ನಡ)' : turn.detectedLanguage === 'hi' ? 'Hindi (हिंदी)' : 'English'}
                          </span>
                          <span className="text-[10px] font-['Space_Mono'] opacity-50">Voice/Text</span>
                        </div>
                        <p className="text-base sm:text-lg font-medium leading-relaxed font-['Space_Grotesk'] text-[#1a1a1a]">
                          {turn.text}
                        </p>
                        {turn.secondaryText && (
                          <p className="text-xs sm:text-sm opacity-60 mt-1 font-['Inter']">
                            {turn.secondaryText}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Assistant Message */}
                    {turn.type === 'assistant' && (
                      <div className="card-variation3 space-y-3">
                        <p className="text-base sm:text-lg font-['Space_Grotesk'] font-medium leading-relaxed text-[#1a1a1a]">
                          {turn.text}
                        </p>

                        {turn.secondaryText && (
                          <p className="text-xs sm:text-sm text-[#4a4a4a] border-t border-[#1a1a1a]/10 pt-2 font-['Inter']">
                            {turn.secondaryText}
                          </p>
                        )}

                        {/* Layman's Terms Summary Card */}
                        {turn.laymanSummary && (
                          <div className="p-3 bg-[#fff8e7] border-2 border-[#1a1a1a] shadow-[2px_2px_0px_#1a1a1a] space-y-1">
                            <div className="flex items-center gap-1.5 text-[#1a1a1a]">
                              <span className="material-symbols-outlined text-[18px] text-[#e63b2e]">lightbulb</span>
                              <span className="font-['Space_Grotesk'] text-xs font-bold uppercase tracking-wider">
                                Layman's Terms Summary (Plain Words)
                              </span>
                            </div>
                            <p className="font-['Inter'] text-xs sm:text-sm text-[#1a1a1a] leading-relaxed">
                              {turn.laymanSummary}
                            </p>
                          </div>
                        )}

                        {/* Check Understanding: Key Points Verified */}
                        {turn.understandingCheck && turn.understandingCheck.length > 0 && (
                          <div className="p-3.5 bg-white border-2 border-[#1a1a1a] shadow-[2px_2px_0px_#1a1a1a] space-y-2">
                            <div className="flex items-center justify-between border-b border-[#1a1a1a]/15 pb-1.5">
                              <div className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[18px] text-[#0055ff]">fact_check</span>
                                <span className="font-['Space_Grotesk'] text-xs font-bold uppercase text-[#1a1a1a]">
                                  Check Your Understanding (Key Points Verified)
                                </span>
                              </div>
                              <span className="text-[10px] font-['Space_Mono'] font-bold bg-[#eee9e0] px-1.5 py-0.5 border border-[#1a1a1a]">
                                Comprehension Check
                              </span>
                            </div>
                            <div className="space-y-1.5 pt-1">
                              {turn.understandingCheck.map((check, cIdx) => (
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
                                    <span className="font-bold text-[#e63b2e]">Verified Understanding: </span>
                                    {check.explanation}
                                  </div>
                                </details>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Expiring Document Alert */}
                        {turn.expiryNotice && turn.expiryNotice.isExpiringSoon && (
                          <div className="p-3 bg-[#ffdad6] border-2 border-[#e63b2e] shadow-[3px_3px_0px_#e63b2e] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                              <span className="material-symbols-outlined text-[#e63b2e] text-[22px] animate-pulse">alarm</span>
                              <div>
                                <span className="font-['Space_Grotesk'] text-xs font-bold uppercase text-[#e63b2e] block">
                                  Expiring Notice Alert • {turn.expiryNotice.daysRemaining} Days Left
                                </span>
                                <span className="text-xs text-[#1a1a1a] font-['Inter']">
                                  Due date: <strong>{turn.expiryNotice.deadline}</strong>. {turn.expiryNotice.penaltyWarning || 'Action required to avoid additional penalty interest.'}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => handleExportIcs(activeNotice)}
                              className="shrink-0 px-3 py-1.5 bg-[#e63b2e] hover:bg-[#1a1a1a] text-white font-['Space_Grotesk'] text-xs font-bold uppercase border border-[#1a1a1a] shadow-[2px_2px_0px_#1a1a1a] cursor-pointer flex items-center gap-1.5"
                            >
                              <span className="material-symbols-outlined text-[16px]">calendar_add_on</span>
                              <span>Set Calendar Reminder</span>
                            </button>
                          </div>
                        )}

                        {/* Safety Refusal Notice (if applicable) */}
                        {turn.safetyRefusal && (
                          <div className="p-3 bg-[#ffdad6] border border-[#e63b2e] text-[#e63b2e] text-xs font-['Space_Grotesk'] font-bold">
                            Policy Notice: Requests involving fraud, illegal falsification, or evasion cannot be supported. Lawful alternatives are provided below.
                          </div>
                        )}

                        {/* Extracted Key Information Card */}
                        {turn.extractedInfo && (
                          <div className="mt-3 p-3.5 bg-[#faf7f2] border-2 border-[#1a1a1a] space-y-2">
                            <span className="meta-label text-[#e63b2e]">Extracted Notice Facts</span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-['Space_Grotesk']">
                              {turn.extractedInfo.deadline && (
                                <div className="p-2 bg-white border border-[#1a1a1a]">
                                  <span className="meta-label">Statutory Deadline</span>
                                  <strong className="text-sm text-[#e63b2e] block">
                                    {turn.extractedInfo.deadline} ({turn.extractedInfo.daysRemaining}d remaining)
                                  </strong>
                                </div>
                              )}
                              {turn.extractedInfo.amount && (
                                <div className="p-2 bg-white border border-[#1a1a1a]">
                                  <span className="meta-label">Demanded Amount</span>
                                  <strong className="text-sm text-[#1a1a1a] block">
                                    {turn.extractedInfo.amount}
                                  </strong>
                                </div>
                              )}
                              {turn.extractedInfo.authority && (
                                <div className="p-2 bg-white border border-[#1a1a1a]">
                                  <span className="meta-label">Issuing Authority</span>
                                  <strong className="text-xs text-[#1a1a1a] block">
                                    {turn.extractedInfo.authority}
                                  </strong>
                                </div>
                              )}
                              {turn.extractedInfo.action && (
                                <div className="p-2 bg-white border border-[#1a1a1a]">
                                  <span className="meta-label">Required Next Step</span>
                                  <strong className="text-xs text-[#1a1a1a] block">
                                    {turn.extractedInfo.action}
                                  </strong>
                                </div>
                              )}
                            </div>
                            <span className="text-[10px] text-[#4a4a4a] italic block pt-1">
                              * Information extracted from document. Please verify key details with official sources.
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
                              {btn.label}
                            </button>
                          ))}

                          {/* Voice Output Buttons: Auto, Kannada, Hindi, English */}
                          <div className="flex flex-wrap items-center gap-1.5 bg-black/5 p-1 border border-[#1a1a1a]">
                            <span className="text-[10px] font-['Space_Mono'] uppercase font-bold px-1 text-[#4a4a4a]">
                              Listen:
                            </span>
                            {speakingTurnId === turn.id ? (
                              <button
                                onClick={handleStopAssistantVoice}
                                className="px-2 py-1 bg-[#e63b2e] text-white border border-[#1a1a1a] text-xs font-['Space_Grotesk'] font-bold flex items-center gap-1 cursor-pointer animate-pulse"
                              >
                                <span className="material-symbols-outlined text-[14px]">stop</span>
                                <span>Stop Voice</span>
                              </button>
                            ) : (
                              <>
                                <button
                                  onClick={() => handlePlayAssistantVoice(turn)}
                                  className="px-2 py-1 bg-white hover:bg-[#1a1a1a] hover:text-white border border-[#1a1a1a] text-xs font-['Space_Grotesk'] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                                  title={`Read aloud (${voiceOutputLanguage === 'auto' ? 'Auto-Detect' : voiceOutputLanguage.toUpperCase()})`}
                                >
                                  <span className="material-symbols-outlined text-[14px] text-[#e63b2e]">volume_up</span>
                                  <span>Read ({voiceOutputLanguage === 'auto' ? 'Auto' : voiceOutputLanguage.toUpperCase()})</span>
                                </button>
                                <button
                                  onClick={() => handlePlayAssistantVoice(turn, 'kn')}
                                  className={`px-2 py-1 border border-[#1a1a1a] text-xs font-['Space_Grotesk'] font-bold cursor-pointer transition-colors ${
                                    voiceOutputLanguage === 'kn' ? 'bg-[#ffdad6] text-[#e63b2e]' : 'bg-white hover:bg-black/5'
                                  }`}
                                  title="Play voice output in Kannada (ಕನ್ನಡ)"
                                >
                                  ಕನ್ನಡ
                                </button>
                                <button
                                  onClick={() => handlePlayAssistantVoice(turn, 'hi')}
                                  className={`px-2 py-1 border border-[#1a1a1a] text-xs font-['Space_Grotesk'] font-bold cursor-pointer transition-colors ${
                                    voiceOutputLanguage === 'hi' ? 'bg-[#ffdad6] text-[#e63b2e]' : 'bg-white hover:bg-black/5'
                                  }`}
                                  title="Play voice output in Hindi (हिंदी)"
                                >
                                  हिंदी
                                </button>
                                <button
                                  onClick={() => handlePlayAssistantVoice(turn, 'en')}
                                  className={`px-2 py-1 border border-[#1a1a1a] text-xs font-['Space_Grotesk'] font-bold cursor-pointer transition-colors ${
                                    voiceOutputLanguage === 'en' ? 'bg-[#ffdad6] text-[#e63b2e]' : 'bg-white hover:bg-black/5'
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
                    )}
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
                  <span>Assistant is thinking and reviewing document context...</span>
                </div>
              )}
            </div>

            {/* Bottom Text Input & Privacy Guarantee */}
            <div className="border-t-2 border-[#1a1a1a] pt-3 mt-auto text-left space-y-2">
              {/* Optional Text input bar for accessibility */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage(textInput);
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Or type questions/instructions in Kannada, Hindi, or English..."
                  className="flex-1 bg-white border-2 border-[#1a1a1a] px-3.5 py-2 text-xs font-['Space_Grotesk'] text-[#1a1a1a] focus:outline-none focus:border-[#e63b2e]"
                />
                <button
                  type="submit"
                  disabled={!textInput.trim() || isProcessing}
                  className="px-4 py-2 bg-[#1a1a1a] hover:bg-[#e63b2e] disabled:opacity-40 text-white font-['Space_Grotesk'] text-xs font-bold uppercase border-2 border-[#1a1a1a] cursor-pointer transition-colors"
                >
                  Send
                </button>
              </form>

              <div className="flex items-center justify-between text-left">
                <span className="meta-label">
                  Voice input is primary • 0 KB sent to unverified endpoints • Data strictly private
                </span>
                <span className="text-[10px] font-['Space_Mono'] text-[#4a4a4a]">
                  Hold Spacebar to speak
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
                    Scan or Upload
                  </span>
                  <span className="text-[10px] text-[#4a4a4a] font-['Space_Mono'] block">
                    Hindi, English or Kannada
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-['Space_Grotesk'] font-bold bg-[#1a1a1a] text-white px-2 py-0.5 uppercase group-hover:bg-[#e63b2e] transition-colors">
                Intake
              </span>
            </div>

            <span className="meta-label">Ask Naturally (Tap to Speak)</span>
            <div className="flex flex-col gap-2 mt-2.5">
              <button
                onClick={() => handleSendMessage(
                  'ನನ್ನ ನೋಟಿಸ್‌ಗೆ ಕೊನೆಯ ದಿನಾಂಕ ಯಾವಾಗ ಮತ್ತು ನಾನು ಏನು ಮಾಡಬೇಕು?',
                  'kn'
                )}
                className="pill text-left"
              >
                “ನನ್ನ ನೋಟಿಸ್‌ಗೆ ಕೊನೆಯ ದಿನಾಂಕ ಯಾವಾಗ?” [ಕನ್ನಡ]
              </button>
              <button
                onClick={() => handleSendMessage(
                  'नोटिस का जवाब देने की अंतिम तिथि और आवश्यक कार्रवाई क्या है?',
                  'hi'
                )}
                className="pill text-left"
              >
                “नोटिस की अंतिम तिथि क्या है?” [हिंदी]
              </button>
              <button
                onClick={() => handleSendMessage(
                  'Explain the Section 154 rectification steps in simple language',
                  'en'
                )}
                className="pill text-left"
              >
                “Explain Section 154 rectification steps” [English]
              </button>
              <button
                onClick={() => handleSendMessage(
                  'ಈ ನೋಟಿಸ್ ವಿರುದ್ಧ ಕಾನೂನುಬದ್ಧವಾಗಿ ಆಕ್ಷೇಪಿಸುವುದು ಹೇಗೆ?',
                  'kn'
                )}
                className="pill text-left"
              >
                “ಕಾನೂನುಬದ್ಧವಾಗಿ ಆಕ್ಷೇಪಿಸುವುದು ಹೇಗೆ?” [ಕನ್ನಡ]
              </button>
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-black/10">
            <span className="meta-label">Assistant Status</span>
            <p className="text-xs font-bold font-['Space_Grotesk'] text-[#1a1a1a] mt-0.5">
              Go Vision Assistant
            </p>
            <p className="text-xs font-['Space_Mono'] opacity-60">
              Voice First • Auto-Detect • Kannada • Hindi • English
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
              Zero Server Audio Retention
            </p>
            <p className="text-[11px] font-['Space_Mono'] opacity-60">
              Private Citizen Multimodal Workspace
            </p>
          </div>
        </div>
      </section>

      {/* Camera Document Scanner & Uploader Modal */}
      <DocumentCameraScanner
        isOpen={isDocScannerOpen}
        onClose={() => setIsDocScannerOpen(false)}
        onDocumentScanned={handleDocumentScanned}
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
