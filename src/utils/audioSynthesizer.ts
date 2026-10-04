/**
 * Web Audio, Multilingual Speech Synthesis & Speech Recognition with Auto-Language Detection
 */

export type VoiceLanguageOption = 'auto' | 'kn' | 'hi' | 'en' | 'kn-IN' | 'hi-IN' | 'en-IN';

export function detectLanguage(text: string): 'kn' | 'hi' | 'en' {
  if (!text) return 'en';
  // Check Kannada Unicode block
  if (/[\u0C80-\u0CFF]/.test(text)) return 'kn';
  // Check Devanagari (Hindi) Unicode block
  if (/[\u0900-\u097F]/.test(text)) return 'hi';
  
  const lower = text.toLowerCase();
  // Kannada romanized common vocabulary
  if (/\b(namaskara|yavaga|beku|hege|madodu|kanoonu|dinaanka|nanna|enu|madbeku|uttarisi|mahiti|adhikara|dhanda|salaha|vivarisi|nodi|illi|idu|neevu|matte|tumba|dayavittu)\b/i.test(lower)) {
    return 'kn';
  }
  // Hindi romanized common vocabulary
  if (/\b(namaste|kaise|karein|karna|kya|kab|vivran|apeel|shukriya|bataiye|jankari|samay|tarikh|shulk|kripya|mujhe|batao|mera|meri|kahiye|aap|hai|hain|nahi|kijiye)\b/i.test(lower)) {
    return 'hi';
  }
  return 'en';
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
}

class AudioController {
  private audioCtx: AudioContext | null = null;
  private recognition: SpeechRecognitionInstance | null = null;
  public isSpeaking = false;
  public isListening = false;
  public speechEnabled = true;

  private getAudioContext(): AudioContext {
    if (!this.audioCtx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioCtx();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  public playBeep(freq = 440, type: OscillatorType = 'sine', duration = 0.15) {
    try {
      const ctx = this.getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn('AudioContext not permitted yet', e);
    }
  }

  /**
   * Speaks the response aloud in Kannada, Hindi, or English, with auto-detection support
   */
  public speakText(text: string, voiceOption: VoiceLanguageOption = 'auto', onEnd?: () => void) {
    if (!this.speechEnabled) {
      if (onEnd) onEnd();
      return;
    }

    if (!('speechSynthesis' in window)) {
      if (onEnd) setTimeout(onEnd, 1000);
      return;
    }

    try {
      window.speechSynthesis.cancel();
      // Remove markdown/symbols before reading
      const cleanText = text
        .replace(/[*_#`[\]()]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 600);

      if (!cleanText) {
        if (onEnd) onEnd();
        return;
      }

      // Determine target language for speech engine
      const targetLang = voiceOption === 'auto' ? detectLanguage(cleanText) : voiceOption;
      
      let bcp47 = 'en-IN';
      if (targetLang === 'kn') bcp47 = 'kn-IN';
      else if (targetLang === 'hi') bcp47 = 'hi-IN';
      else bcp47 = 'en-IN';

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.lang = bcp47;

      // Select best matching voice from browser speech engine
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        const matched = voices.find(v => 
          v.lang.toLowerCase().replace('_', '-').startsWith(bcp47.toLowerCase()) ||
          v.lang.toLowerCase().startsWith(targetLang)
        );
        if (matched) {
          utterance.voice = matched;
        }
      }

      utterance.onend = () => {
        this.isSpeaking = false;
        if (onEnd) onEnd();
      };
      utterance.onerror = () => {
        this.isSpeaking = false;
        if (onEnd) onEnd();
      };

      this.isSpeaking = true;
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis error:', err);
      this.isSpeaking = false;
      if (onEnd) onEnd();
    }
  }

  /**
   * Helper to speak an assistant turn choosing the appropriate text translation
   * based on the chosen voice output setting ('auto', 'kn', 'hi', or 'en')
   */
  public speakAssistantTurn(
    turn: {
      text: string;
      kannadaText?: string;
      hindiText?: string;
      englishText?: string;
      detectedLanguage?: 'kn' | 'hi' | 'en';
    },
    voiceOption: VoiceLanguageOption,
    onEnd?: () => void
  ) {
    if (!this.speechEnabled) {
      if (onEnd) onEnd();
      return;
    }

    let textToSpeak = turn.text;
    let effectiveVoice: VoiceLanguageOption = voiceOption;

    if (voiceOption === 'kn') {
      textToSpeak = turn.kannadaText || turn.text;
      effectiveVoice = 'kn';
    } else if (voiceOption === 'hi') {
      textToSpeak = turn.hindiText || turn.text;
      effectiveVoice = 'hi';
    } else if (voiceOption === 'en') {
      textToSpeak = turn.englishText || turn.text;
      effectiveVoice = 'en';
    } else {
      // Auto-detect mode
      const detected = turn.detectedLanguage || detectLanguage(turn.text);
      effectiveVoice = detected;
      if (detected === 'kn' && turn.kannadaText) {
        textToSpeak = turn.kannadaText;
      } else if (detected === 'hi' && turn.hindiText) {
        textToSpeak = turn.hindiText;
      } else if (detected === 'en' && turn.englishText) {
        textToSpeak = turn.englishText;
      }
    }

    this.speakText(textToSpeak, effectiveVoice, onEnd);
  }

  public stopSpeaking() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.isSpeaking = false;
  }

  public isSpeechRecognitionSupported(): boolean {
    return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
  }

  public startSpeechRecognition(params: {
    langCode?: string;
    onInterim?: (text: string) => void;
    onResult: (finalText: string, detectedLanguage: 'kn' | 'hi' | 'en') => void;
    onError?: (errMessage: string) => void;
    onStart?: () => void;
    onEnd?: () => void;
  }): boolean {
    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionClass) {
      if (params.onError) {
        params.onError('Speech recognition is not supported in this browser. Please use Chrome/Edge or type your question.');
      }
      return false;
    }

    try {
      if (this.recognition) {
        this.recognition.abort();
      }

      this.stopSpeaking();
      const recog: SpeechRecognitionInstance = new SpeechRecognitionClass();
      recog.continuous = false;
      recog.interimResults = true;
      recog.lang = params.langCode || 'kn-IN';

      recog.onstart = () => {
        this.isListening = true;
        this.playBeep(520, 'sine', 0.1);
        if (params.onStart) params.onStart();
      };

      recog.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        if (interimTranscript && params.onInterim) {
          params.onInterim(interimTranscript);
        }

        if (finalTranscript) {
          this.isListening = false;
          this.playBeep(420, 'sine', 0.12);
          const detected = detectLanguage(finalTranscript);
          params.onResult(finalTranscript.trim(), detected);
        }
      };

      recog.onerror = (event: any) => {
        this.isListening = false;
        console.warn('Speech recognition error:', event.error);
        if (params.onError) {
          if (event.error === 'not-allowed') {
            params.onError('Microphone permission was denied. Please allow microphone access in your browser.');
          } else if (event.error === 'no-speech') {
            params.onError('No speech detected. Please speak into your microphone and try again.');
          } else {
            params.onError(`Voice recognition notice: ${event.error}. You can also type your question.`);
          }
        }
      };

      recog.onend = () => {
        this.isListening = false;
        if (params.onEnd) params.onEnd();
      };

      recog.start();
      this.recognition = recog;
      return true;
    } catch (err: any) {
      console.error('Failed to start speech recognition:', err);
      if (params.onError) params.onError(err.message || 'Could not start voice recognition.');
      return false;
    }
  }

  public stopSpeechRecognition() {
    if (this.recognition) {
      this.recognition.stop();
      this.isListening = false;
    }
  }
}

export const soundController = new AudioController();
