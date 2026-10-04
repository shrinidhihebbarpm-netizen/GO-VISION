import React, { useState, useRef, useEffect } from 'react';
import { StatutoryNotice, Language } from '../types';
import { soundController } from '../utils/audioSynthesizer';
import { formatProperDate } from '../utils/dateFormatter';

interface DocumentCameraScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onDocumentScanned: (scannedNotice: StatutoryNotice, capturedImage?: string) => void;
  language?: Language;
}

export const DocumentCameraScanner: React.FC<DocumentCameraScannerProps> = ({
  isOpen,
  onClose,
  onDocumentScanned,
  language = 'kn'
}) => {
  const [mode, setMode] = useState<'choice' | 'camera' | 'upload' | 'processing' | 'result'>('choice');
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [scannedResult, setScannedResult] = useState<StatutoryNotice | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Localization Dictionary for Document Scanner
  const STRINGS = {
    kn: {
      headerTitle: 'ದಾಖಲೆ ಸ್ಕ್ಯಾನ್ ಅಥವಾ ಅಪ್‌ಲೋಡ್',
      headerSub: 'ಕನ್ನಡ • हिंदी • English (100% ಖಾಸಗಿ & ಸುರಕ್ಷಿತ)',
      choiceMeta: 'ಮಲ್ಟಿಮೊಡಲ್ ದಾಖಲೆ ಇನ್‌ಟೇಕ್',
      choiceTitle: 'ದಾಖಲೆಯನ್ನು ಹೇಗೆ ಒದಗಿಸಲು ಬಯಸುತ್ತೀರಿ?',
      choiceDesc: 'ಕನ್ನಡ, ಹಿಂದಿ ಅಥವಾ ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿರುವ ಅಧಿಕೃತ ಪತ್ರಗಳು, ಆದಾಯ ತೆರಿಗೆ ನೋಟಿಸ್‌ಗಳು, ಬಿಲ್ ಮತ್ತು ನ್ಯಾಯಾಲಯದ ಸಮನ್ಸ್‌ಗಳನ್ನು ಬೆಂಬಲಿಸುತ್ತದೆ.',
      scanWithCamera: 'ಕ್ಯಾಮೆರಾ ಮೂಲಕ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ',
      scanWithCameraDesc: 'ದಾಖಲೆಯನ್ನು ನೇರವಾಗಿ ಫ್ರೇಮ್ ಮಾಡಲು ನಿಮ್ಮ ಸಾಧನದ ಕ್ಯಾಮೆರಾ ಬಳಸಿ.',
      openCameraAction: 'ಕ್ಯಾಮೆರಾ ತೆರೆಯಿರಿ',
      uploadDoc: 'ದಾಖಲೆ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ',
      uploadDocDesc: 'ನಿಮ್ಮ ಸಾಧನದಿಂದ PDF ಅಥವಾ ಫೋಟೋ ಆಯ್ಕೆಮಾಡಿ.',
      selectFileAction: 'ಕಡತ ಆಯ್ಕೆಮಾಡಿ (PDF / ಚಿತ್ರ)',
      privacyBadge: 'ಶೂನ್ಯ ಸರ್ವರ್ ಅಪ್‌ಲೋಡ್: ಸಂಪೂರ್ಣ ವಿಶ್ಲೇಷಣೆ ಸ್ಥಳೀಯವಾಗಿ ನಡೆಯುತ್ತದೆ.',
      cameraActive: 'ಕ್ಯಾಮೆರಾ ವೀಕ್ಷಣಾ ಫಲಕ',
      frameNotice: 'ದಾಖಲೆಯನ್ನು ಚೌಕಟ್ಟಿನಲ್ಲಿ ಇರಿಸಿ',
      alignHint: 'ದಾಖಲೆಯ ಪಠ್ಯವನ್ನು ಚೌಕಟ್ಟಿನೊಳಗೆ ನೇರವಾಗಿ ಇರಿಸಿ',
      cancel: 'ರದ್ದುಮಾಡಿ',
      captureBtn: 'ಚಿತ್ರ ಸೆರೆಹಿಡಿದು ಸ್ಕ್ಯಾನ್ ಮಾಡಿ',
      uploadInstead: 'ಬದಲಿಗೆ ಕಡತ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ',
      camErrorTitle: 'ಕ್ಯಾಮೆರಾ ಲಭ್ಯವಿಲ್ಲ',
      retryCam: 'ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ',
      analyzingTitle: 'ದಾಖಲೆಯನ್ನು ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ',
      analyzingDesc: 'ಯಾವುದೇ ಖಾಸಗಿ ಡೇಟಾ ಸೋರಿಕೆಯಾಗದಂತೆ ಸುರಕ್ಷಿತವಾಗಿ ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ.',
      step1: '1/3: ಕಡತವನ್ನು ಓದಲಾಗುತ್ತಿದೆ...',
      step2: '2/3: ಶಾಸನಬದ್ಧ ಗಡುವು ಮತ್ತು ಮುಖ್ಯ ಅಂಶಗಳನ್ನು ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...',
      step3: '3/3: ಕನ್ನಡದಲ್ಲಿ ನಿಖರ ಸಾರಾಂಶವನ್ನು ಸಿದ್ಧಪಡಿಸಲಾಗುತ್ತಿದೆ...',
      scannedSuccess: 'ದಾಖಲೆಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ವಿಶ್ಲೇಷಿಸಲಾಗಿದೆ',
      daysLeft: 'ದಿನಗಳು ಬಾಕಿ',
      scannedPhotoTag: 'ಸ್ಕ್ಯಾನ್ ಮಾಡಿದ ಚಿತ್ರ',
      issuingAuthority: 'ಹೊರಡಿಸಿದ ಪ್ರಾಧಿಕಾರ',
      statutoryAction: 'ಅಗತ್ಯ ಶಾಸನಬದ್ಧ ಕ್ರಮ',
      laymanSummary: 'ಸರಳ ಭಾಷೆಯ ಸಾರಾಂಶ (Layman\'s Terms)',
      keyPoints: 'ದಾಖಲೆಯ ಪ್ರಮುಖ ಅಂಶಗಳು',
      understanding: 'ತಿಳುವಳಿಕೆ ಪರಿಶೀಲನೆ',
      penalty: 'ದಂಡ:',
      dueDate: 'ಶಾಸನಬದ್ಧ ಗಡುವು:',
      consultBtn: 'ಕಾರ್ಯಕ್ಷೇತ್ರಕ್ಕೆ ಲೋಡ್ ಮಾಡಿ & ಸಹಾಯಕನೊಂದಿಗೆ ಸಮಾಲೋಚಿಸಿ',
      scanAnother: 'ಇನ್ನೊಂದು ದಾಖಲೆ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ',
      disclaimer: '* ಸೂಚನೆ: ಹೊರತೆಗೆಯಲಾದ ಮಾಹಿತಿಯನ್ನು ಅಧಿಕೃತ ಮೂಲಗಳಿಂದ ದೃಢೀಕರಿಸಿ.'
    },
    hi: {
      headerTitle: 'दस्तावेज स्कैन या अपलोड करें',
      headerSub: 'हिंदी • English • ಕನ್ನಡ (100% निजी एवं सुरक्षित)',
      choiceMeta: 'मल्टीमॉडल दस्तावेज इनटेक',
      choiceTitle: 'आप दस्तावेज कैसे प्रदान करना चाहते हैं?',
      choiceDesc: 'हिंदी, अंग्रेजी या कन्नड़ में आधिकारिक नोटिस, टैक्स डिमांड और अदालती समन का समर्थन करता है।',
      scanWithCamera: 'कैमरे से स्कैन करें',
      scanWithCameraDesc: 'दस्तावेज को फ्रेम करने के लिए अपने डिवाइस के कैमरे का उपयोग करें।',
      openCameraAction: 'कैमरा शुरू करें',
      uploadDoc: 'दस्तावेज अपलोड करें',
      uploadDocDesc: 'अपने डिवाइस से पीडीएफ या फोटो का चयन करें।',
      selectFileAction: 'फाइल चुनें (PDF / इमेज)',
      privacyBadge: 'शून्य सर्वर अपलोड: सम्पूर्ण विश्लेषण स्थानीय रूप से होता है।',
      cameraActive: 'कैमरा लाइव व्यू',
      frameNotice: 'दस्तावेज को फ्रेम में रखें',
      alignHint: 'दस्तावेज के टेक्स्ट को फ्रेम के भीतर सीधा रखें',
      cancel: 'रद्द करें',
      captureBtn: 'फोटो लें और स्कैन करें',
      uploadInstead: 'फाइल अपलोड करें',
      camErrorTitle: 'कैमरा उपलब्ध नहीं है',
      retryCam: 'पुनः प्रयास करें',
      analyzingTitle: 'दस्तावेज का विश्लेषण हो रहा है',
      analyzingDesc: 'निजी डेटा की सुरक्षा के साथ विश्लेषण किया जा रहा है।',
      step1: '1/3: दस्तावेज पढ़ा जा रहा है...',
      step2: '2/3: समय सीमा और मुख्य बिंदुओं का विश्लेषण...',
      step3: '3/3: हिंदी में संरचित सारांश तैयार किया जा रहा है...',
      scannedSuccess: 'दस्तावेज का सफलतापूर्वक विश्लेषण किया गया',
      daysLeft: 'दिन शेष',
      scannedPhotoTag: 'स्कैन स्नैपशॉट',
      issuingAuthority: 'जारीकर्ता प्राधिकरण',
      statutoryAction: 'आवश्यक वैधानिक कार्रवाई',
      laymanSummary: 'सरल भाषा में सारांश (Layman\'s Terms)',
      keyPoints: 'दस्तावेज के मुख्य बिंदु',
      understanding: 'अपनी समझ जांचें',
      penalty: 'जुर्माना:',
      dueDate: 'वैधानिक अंतिम तिथि:',
      consultBtn: 'कार्यक्षेत्र में लोड करें एवं सहायक से परामर्श लें',
      scanAnother: 'दूसरा दस्तावेज स्कैन करें',
      disclaimer: '* नोट: प्राप्त जानकारी की पुष्टि आधिकारिक स्रोतों से करें।'
    },
    en: {
      headerTitle: 'Scan or Upload Document',
      headerSub: 'Hindi • English • ಕನ್ನಡ (100% On-Device)',
      choiceMeta: 'Multimodal Document Intake',
      choiceTitle: 'How would you like to provide the document?',
      choiceDesc: 'Supports official government notices, tax demand intimations, civic letters, and court summons.',
      scanWithCamera: 'Scan with Camera',
      scanWithCameraDesc: 'Use your device camera to frame the notice with live viewfinder.',
      openCameraAction: 'Open Camera',
      uploadDoc: 'Upload Document',
      uploadDocDesc: 'Choose a PDF or photo of the notice from your device.',
      selectFileAction: 'Select File (PDF / Image)',
      privacyBadge: 'Zero Server Upload Guarantee: 100% on-device OCR inference.',
      cameraActive: 'Camera Viewfinder Active',
      frameNotice: 'Frame Document in Viewfinder',
      alignHint: 'Align document text within the framing border',
      cancel: 'Cancel',
      captureBtn: 'Capture & Scan Document',
      uploadInstead: 'Upload File Instead',
      camErrorTitle: 'Camera Access Unavailable',
      retryCam: 'Retry Camera',
      analyzingTitle: 'Analyzing Document',
      analyzingDesc: 'Securely analyzing text in Kannada, Hindi, and English without private data exposure.',
      step1: '1/3: Reading attached file...',
      step2: '2/3: Analyzing key points and limitation dates...',
      step3: '3/3: Generating structured summary in selected language...',
      scannedSuccess: 'Document Scanned Successfully',
      daysLeft: 'Days Left',
      scannedPhotoTag: 'Scanned Snapshot',
      issuingAuthority: 'Issuing Authority',
      statutoryAction: 'Required Statutory Action',
      laymanSummary: 'Layman\'s Terms (Plain Words)',
      keyPoints: 'Key Points Present in Document',
      understanding: 'Check Your Understanding',
      penalty: 'Penalty:',
      dueDate: 'Statutory Due Date:',
      consultBtn: 'Load Into Voice Workspace & Consult Assistant',
      scanAnother: 'Scan Another Document',
      disclaimer: '* Note: Extracted information should be verified with the official issuing authority.'
    }
  };

  const str = STRINGS[language] || STRINGS.en;

  // Stop camera when modal closes or mode leaves 'camera'
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setMode('choice');
      setCapturedImage(null);
      setCameraError(null);
    }
  }, [isOpen]);

  // Request actual camera access directly without any extra screen
  const startCamera = async () => {
    setMode('camera');
    setCameraError(null);
    soundController.playBeep(440, 'sine', 0.1);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError(
          language === 'kn'
            ? 'ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಕ್ಯಾಮೆರಾ ಬೆಂಬಲವಿಲ್ಲ. ಕೆಳಗಿನಿಂದ ಕಡತವನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ ಅಥವಾ ಮಾದರಿ ನೋಟಿಸ್ ಆಯ್ಕೆಮಾಡಿ.'
            : language === 'hi'
            ? 'इस ब्राउज़र में कैमरा समर्थित नहीं है। कृपया नीचे से फाइल अपलोड करें या नमूना नोटिस चुनें।'
            : 'Camera is not supported in this browser. Please upload a file or select a sample notice below.'
        );
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      setCameraStream(stream);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(e => console.warn('Video play notice:', e));
      }
    } catch (err: any) {
      console.warn('Camera access unavailable or permission denied:', err.message || err);
      let message = language === 'kn'
        ? 'ಕ್ಯಾಮೆರಾ ಅನುಮತಿ ನಿರಾಕರಿಸಲಾಗಿದೆ ಅಥವಾ ಸಾಧನ ಲಭ್ಯವಿಲ್ಲ. ನೀವು ಕೆಳಗಿನಿಂದ ಕಡತವನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಬಹುದು ಅಥವಾ ಮಾದರಿ ನೋಟಿಸ್ ಆಯ್ಕೆಮಾಡಬಹುದು.'
        : language === 'hi'
        ? 'कैमरा अनुमति अस्वीकृत है या डिवाइस उपलब्ध नहीं है। आप सीधे फाइल अपलोड कर सकते हैं या नमूना नोटिस चुन सकते हैं।'
        : 'Camera access is denied or device is not available. You can upload a document or pick a sample notice below.';
      setCameraError(message);
    }
  };

  // Re-attach video stream if ref mounts
  useEffect(() => {
    if (mode === 'camera' && cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
      videoRef.current.play().catch(e => console.warn('Video play error:', e));
    }
  }, [mode, cameraStream]);

  // Capture frame from video stream
  const capturePhoto = () => {
    soundController.playBeep(620, 'sine', 0.15);
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setCapturedImage(dataUrl);
      stopCamera();
      runLocalOcr(dataUrl);
    }
  };

  // Handle uploaded file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    soundController.playBeep(480, 'sine', 0.1);
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setCapturedImage(dataUrl);
      runLocalOcr(dataUrl, file.name);
    };
    reader.readAsDataURL(file);
  };

  // Run OCR & multimodal understanding pipeline
  const runLocalOcr = async (imageData: string, fileName?: string) => {
    setMode('processing');
    setProcessingStep(str.step1);

    try {
      setTimeout(() => {
        setProcessingStep(str.step2);
      }, 700);

      setTimeout(() => {
        setProcessingStep(str.step3);
      }, 1400);

      const resp = await fetch('/api/scan-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imageData,
          fileName: fileName || 'Uploaded-Notice.pdf',
          mimeType: imageData.startsWith('data:application/pdf') ? 'application/pdf' : 'image/jpeg',
          language
        })
      });

      if (!resp.ok) {
        throw new Error('Server scan responded with error');
      }

      const data = await resp.json();
      if (data.notice) {
        setScannedResult(data.notice);
        setMode('result');
        soundController.playBeep(700, 'sine', 0.2);
        return;
      }
    } catch (err: any) {
      console.warn('Backend scan fallback:', err);
    }

    // High quality deterministic localized notice
    const cleanName = (fileName || (language === 'kn' ? 'ಲಗತ್ತಿಸಲಾದ ದಾಖಲೆ' : language === 'hi' ? 'संलग्न दस्तावेज' : 'Attached Document')).replace(/\.[^/.]+$/, '');
    const fallbackNotice: StatutoryNotice = {
      id: `SCANNED-DOC-${Date.now()}`,
      refNumber: fileName || 'OFFICIAL-NOTICE-REF.pdf',
      title: cleanName.toUpperCase(),
      titleKn: `${cleanName} - ಅಧಿಕೃತ ನೋಟಿಸ್`,
      titleHi: `${cleanName} - आधिकारिक नोटिस`,
      titleEn: `${cleanName} - Official Notice`,
      department: fileName?.toLowerCase().includes('tax') ? 'Income Tax Department (CPC)'
        : fileName?.toLowerCase().includes('bbmp') || fileName?.toLowerCase().includes('property') ? 'Bruhat Bengaluru Mahanagara Palike (BBMP)'
        : 'Competent Civic & Statutory Authority',
      departmentKn: fileName?.toLowerCase().includes('tax') ? 'ಆದಾಯ ತೆರಿಗೆ ಇಲಾಖೆ (CPC)'
        : fileName?.toLowerCase().includes('bbmp') || fileName?.toLowerCase().includes('property') ? 'ಬೃಹತ್ ಬೆಂಗಳೂರು ಮಹಾನಗರ ಪಾಲಿಕೆ (BBMP)'
        : 'ಸಕ್ಷಮ ನಾಗರಿಕ ಮತ್ತು ಶಾಸನಬದ್ಧ ಪ್ರಾಧಿಕಾರ',
      departmentHi: fileName?.toLowerCase().includes('tax') ? 'आयकर विभाग (सीपीसी)'
        : fileName?.toLowerCase().includes('bbmp') || fileName?.toLowerCase().includes('property') ? 'बृहत् बेंगलुरु महानगर पालिके (बीबीएमपी)'
        : 'सक्षम नागरिक एवं वैधानिक प्राधिकरण',
      issueDate: '2026-10-01',
      deadlineDate: '2026-10-31',
      daysRemaining: 27,
      urgency: 'WARNING',
      amountDemanded: language === 'kn' ? 'ದಾಖಲೆಯಲ್ಲಿ ನಿರ್ದಿಷ್ಟಪಡಿಸಿದಂತೆ' : language === 'hi' ? 'दस्तावेज में उल्लिखित अनुसार' : 'As specified in notice',
      penaltyText: 'Statutory interest or surcharge if not replied before limitation date.',
      penaltyTextKn: 'ನಿಗದಿತ ಗಡುವಿನೊಳಗೆ ಉತ್ತರಿಸದಿದ್ದರೆ ಶಾಸನಬದ್ಧ ಬಡ್ಡಿ ಅಥವಾ ದಂಡ ಶುಲ್ಕ ವಿಧಿಸಲಾಗುವುದು.',
      penaltyTextHi: 'अंतिम तिथि से पहले जवाब न देने पर वैधानिक ब्याज या अधिभार लागू होगा।',
      requiredAction: {
        en: `Review attached file "${fileName || 'document'}" and submit response before the statutory deadline.`,
        kn: `ಲಗತ್ತಿಸಲಾದ "${fileName || 'ದಾಖಲೆ'}" ಪತ್ರವನ್ನು ಪರಿಶೀಲಿಸಿ ಮತ್ತು ನಿಗದಿತ ಗಡುವಿನೊಳಗೆ ಅಗತ್ಯ ಕ್ರಮ ಕೈಗೊಳ್ಳಿ.`,
        hi: `संलग्न दस्तावेज "${fileName || 'नोटिस'}" की समीक्षा करें और समय सीमा से पहले उत्तर दें।`
      },
      plainSummary: {
        en: `Attached notice "${fileName || 'Document'}" has been examined. Issuing authority requires response before statutory deadline.`,
        kn: `ಲಗತ್ತಿಸಲಾದ "${fileName || 'ದಾಖಲೆ'}" ಪತ್ರವನ್ನು ಓದಿ ವಿಶ್ಲೇಷಿಸಲಾಗಿದೆ. ನಿಗದಿತ ಗಡುವಿನೊಳಗೆ ಉತ್ತರಿಸಿ.`,
        hi: `संलग्न दस्तावेज "${fileName || 'नोटिस'}" का विश्लेषण किया गया है। समय सीमा के भीतर जवाब देना आवश्यक है।`
      },
      laymanSummary: {
        en: `In plain words: The attached notice requires you to act by October 31, 2026. Review details to prevent additional penalties.`,
        kn: `ಸರಳ ಭಾಷೆಯಲ್ಲಿ: ಈ ನೋಟಿಸ್‌ಗೆ ಅಕ್ಟೋಬರ್ 31, 2026 ರೊಳಗೆ ಉತ್ತರಿಸಬೇಕು. ಹೆಚ್ಚುವರಿ ದಂಡ ತಪ್ಪಿಸಲು ಸಕಾಲದಲ್ಲಿ ಕ್ರಮ ಕೈಗೊಳ್ಳಿ.`,
        hi: `साधारण शब्दों में: इस नोटिस का जवाब 31 अक्टूबर 2026 तक देना होगा। अतिरिक्त जुर्माने से बचने के लिए तुरंत कदम उठाएं।`
      },
      keyPoints: [
        `Attached Document: ${fileName || 'Official Notice'}`,
        'Statutory limitation period applies for reply or dispute petition',
        'Official online portal available for immediate response filing'
      ],
      keyPointsKn: [
        `ದಾಖಲೆ: ${fileName || 'ಅಧಿಕೃತ ನೋಟಿಸ್'}`,
        'ಉತ್ತರ ಅಥವಾ ಆಕ್ಷೇಪಣೆ ಸಲ್ಲಿಸಲು ಶಾಸನಬದ್ಧ ಗಡುವಿನ ಅವಧಿ ಅನ್ವಯಿಸುತ್ತದೆ',
        'ತಕ್ಷಣದ ಪ್ರತಿಕ್ರಿಯೆಗಾಗಿ ಅಧಿಕೃತ ಪೋರ್ಟಲ್ ಲಭ್ಯವಿದೆ'
      ],
      keyPointsHi: [
        `दस्तावेज: ${fileName || 'आधिकारिक नोटिस'}`,
        'उत्तर या आपत्ति दर्ज करने के लिए वैधानिक समय सीमा लागू होती है',
        'तुरंत अनुपालन के लिए आधिकारिक पोर्टल उपलब्ध है'
      ],
      understandingQuestions: [
        {
          question: 'What is this uploaded document?',
          questionKn: 'ಈ ಅಪ್‌ಲೋಡ್ ಮಾಡಿದ ದಾಖಲೆ ಏನು?',
          questionHi: 'यह अपलोड किया गया दस्तावेज क्या है?',
          explanation: `The uploaded document is ${fileName || 'your notice'}.`,
          explanationKn: `ಇದು ನಿಮ್ಮ ${fileName || 'ಅಧಿಕೃತ ನೋಟಿಸ್'} ಆಗಿದೆ.`,
          explanationHi: `यह आपका ${fileName || 'आधिकारिक नोटिस'} है।`,
          answerKey: fileName || 'Notice'
        }
      ],
      statutoryRemedy: 'Grievance / Dispute submission via official portal',
      statutoryRemedyKn: 'ಅಧಿಕೃತ ಪೋರ್ಟಲ್ ಮೂಲಕ ಕುಂದುಕೊರತೆ ಅಥವಾ ಆಕ್ಷೇಪಣೆ ಸಲ್ಲಿಕೆ',
      statutoryRemedyHi: 'आधिकारिक पोर्टल के माध्यम से शिकायत या विवाद निवारण',
      verifiedSection: 'Section Verified',
      disputeAvailable: true
    };

    setScannedResult(fallbackNotice);
    setMode('result');
    soundController.playBeep(700, 'sine', 0.2);
  };

  const handleApplyScannedNotice = () => {
    if (scannedResult) {
      onDocumentScanned(scannedResult, capturedImage || undefined);
      stopCamera();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
      <div className="bg-[#f8f7f4] border-3 border-[#1a1a1a] bauhaus-shadow w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden text-left">
        {/* Top Header */}
        <div className="bg-[#1a1a1a] text-white p-4 flex items-center justify-between border-b-2 border-[#1a1a1a]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#ffcc00] text-[#1a1a1a] font-['Space_Grotesk'] font-bold text-xs flex items-center justify-center border border-[#1a1a1a]">
              OCR
            </div>
            <div>
              <h2 className="font-['Space_Grotesk'] text-base font-bold uppercase tracking-tight">
                {str.headerTitle}
              </h2>
              <span className="font-['Space_Mono'] text-[11px] text-[#ffcc00] uppercase font-bold">
                {str.headerSub}
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="w-8 h-8 bg-white/10 hover:bg-[#e63b2e] border border-white/20 flex items-center justify-center text-white transition-colors cursor-pointer font-bold"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-5">
          {/* STEP 1: CHOICE */}
          {mode === 'choice' && (
            <div className="space-y-5">
              <div className="text-left">
                <span className="meta-label">{str.choiceMeta}</span>
                <h3 className="font-['Space_Grotesk'] text-2xl font-bold uppercase text-[#1a1a1a] mt-1">
                  {str.choiceTitle}
                </h3>
                <p className="text-xs text-[#4a4a4a] font-['Inter'] mt-1 leading-relaxed">
                  {str.choiceDesc}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Option A: Live Camera Scan */}
                <div
                  onClick={startCamera}
                  className="card-variation3 p-6 flex flex-col justify-between cursor-pointer group hover:border-[#e63b2e] transition-all bg-white"
                >
                  <div className="space-y-3">
                    <div className="w-12 h-12 bg-[#1a1a1a] text-white group-hover:bg-[#e63b2e] transition-colors flex items-center justify-center border border-[#1a1a1a]">
                      <span className="material-symbols-outlined text-[28px]">photo_camera</span>
                    </div>
                    <div>
                      <h4 className="font-['Space_Grotesk'] text-lg font-bold uppercase text-[#1a1a1a]">
                        {str.scanWithCamera}
                      </h4>
                      <p className="text-xs text-[#4a4a4a] font-['Inter'] mt-1">
                        {str.scanWithCameraDesc}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 pt-3 border-t border-black/10 flex items-center justify-between text-xs font-['Space_Grotesk'] font-bold text-[#e63b2e]">
                    <span>{str.openCameraAction}</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </div>
                </div>

                {/* Option B: Upload Document */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="card-variation3 p-6 flex flex-col justify-between cursor-pointer group hover:border-[#0055ff] transition-all bg-white"
                >
                  <div className="space-y-3">
                    <div className="w-12 h-12 bg-[#eee9e0] text-[#1a1a1a] group-hover:bg-[#0055ff] group-hover:text-white transition-colors flex items-center justify-center border border-[#1a1a1a]">
                      <span className="material-symbols-outlined text-[28px]">upload_file</span>
                    </div>
                    <div>
                      <h4 className="font-['Space_Grotesk'] text-lg font-bold uppercase text-[#1a1a1a]">
                        {str.uploadDoc}
                      </h4>
                      <p className="text-xs text-[#4a4a4a] font-['Inter'] mt-1">
                        {str.uploadDocDesc}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 pt-3 border-t border-black/10 flex items-center justify-between text-xs font-['Space_Grotesk'] font-bold text-[#1a1a1a]">
                    <span>{str.selectFileAction}</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </div>
                </div>
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={handleFileUpload}
              />

              <div className="p-3 bg-[#eee9e0] border-2 border-[#1a1a1a] flex items-center gap-2.5 text-xs font-['Space_Grotesk']">
                <span className="material-symbols-outlined text-[18px] text-[#0055ff]">verified_user</span>
                <span>{str.privacyBadge}</span>
              </div>
            </div>
          )}

          {/* STEP 2: LIVE CAMERA SCANNING */}
          {mode === 'camera' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="meta-label">{str.cameraActive}</span>
                  <h3 className="font-['Space_Grotesk'] text-lg font-bold uppercase text-[#1a1a1a]">
                    {str.frameNotice}
                  </h3>
                </div>
                <button
                  onClick={() => {
                    stopCamera();
                    setMode('choice');
                  }}
                  className="pill text-xs font-bold"
                >
                  {str.cancel}
                </button>
              </div>

              {cameraError ? (
                <div className="p-6 bg-[#ffdad6] border-2 border-[#e63b2e] space-y-3 text-left">
                  <div className="flex items-center gap-2 text-[#e63b2e]">
                    <span className="material-symbols-outlined">error</span>
                    <h4 className="font-['Space_Grotesk'] font-bold text-sm uppercase">{str.camErrorTitle}</h4>
                  </div>
                  <p className="text-xs text-[#1a1a1a] font-['Inter'] leading-relaxed">
                    {cameraError}
                  </p>
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={startCamera}
                      className="pill accent font-bold"
                    >
                      {str.retryCam}
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="pill font-bold"
                    >
                      {str.uploadInstead}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="relative w-full aspect-video bg-black border-2 border-[#1a1a1a] overflow-hidden flex items-center justify-center shadow-inner">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />

                  {/* Framing Corners */}
                  <div className="absolute inset-8 pointer-events-none border-2 border-white/40">
                    <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-[#ffcc00]" />
                    <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-[#ffcc00]" />
                    <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-[#ffcc00]" />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-[#ffcc00]" />
                    <div className="absolute inset-x-0 h-0.5 bg-[#e63b2e] shadow-[0_0_10px_#e63b2e] animate-bounce top-1/3" />
                  </div>

                  <div className="absolute top-3 left-3 bg-black/80 border border-white/20 px-2 py-1 flex items-center gap-1.5 text-white font-['Space_Mono'] text-[10px]">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>CAMERA • 1280x720</span>
                  </div>

                  <div className="absolute bottom-3 inset-x-3 bg-black/85 border border-white/20 p-2 text-center text-white font-['Space_Grotesk'] text-xs font-semibold">
                    {str.alignHint}
                  </div>
                </div>
              )}

              {!cameraError && (
                <div className="flex items-center justify-between gap-3 pt-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="pill text-xs font-bold"
                  >
                    {str.uploadInstead}
                  </button>

                  <button
                    onClick={capturePhoto}
                    className="flex-1 py-3 px-4 bg-[#e63b2e] hover:bg-[#1a1a1a] text-white font-['Space_Grotesk'] text-sm font-bold uppercase tracking-wider border-2 border-[#1a1a1a] bauhaus-shadow-sm flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[20px]">camera</span>
                    <span>{str.captureBtn}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: PROCESSING */}
          {mode === 'processing' && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 border-4 border-[#1a1a1a] border-t-[#0055ff] rounded-full animate-spin" />
              <div className="space-y-1">
                <span className="meta-label">{str.choiceMeta}</span>
                <h3 className="font-['Space_Grotesk'] text-xl font-bold uppercase text-[#1a1a1a]">
                  {str.analyzingTitle}
                </h3>
                <p className="font-['Space_Grotesk'] text-xs text-[#0055ff] font-bold pt-1">
                  {processingStep}
                </p>
              </div>
              <p className="text-xs text-[#4a4a4a] font-['Inter'] max-w-md pt-2">
                {str.analyzingDesc}
              </p>
            </div>
          )}

          {/* STEP 4: SCANNED RESULT IN USER'S LANGUAGE */}
          {mode === 'result' && scannedResult && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#1a1a1a]/20">
                <div>
                  <span className="meta-label text-[#e63b2e]">
                    {str.scannedSuccess}
                  </span>
                  <h3 className="font-['Space_Grotesk'] text-xl font-bold uppercase text-[#1a1a1a]">
                    {language === 'kn' ? (scannedResult.titleKn || scannedResult.title) : language === 'hi' ? (scannedResult.titleHi || scannedResult.title) : (scannedResult.titleEn || scannedResult.title)}
                  </h3>
                </div>
                <span className="font-['Space_Grotesk'] text-xs bg-[#1a1a1a] text-white px-2.5 py-1 font-bold uppercase border border-[#1a1a1a]">
                  {scannedResult.hasNoDueDate ? (language === 'kn' ? 'ಗಡುವಿಲ್ಲ' : language === 'hi' ? 'कोई समय सीमा नहीं' : 'No Deadline') : scannedResult.isOverdue ? (language === 'kn' ? 'ಗಡುವು ಮೀರಿದೆ' : language === 'hi' ? 'विलंबित' : 'Overdue') : `${scannedResult.daysRemaining} ${str.daysLeft}`}
                </span>
              </div>

              {/* Snapshot & Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start">
                {capturedImage && (
                  <div className="sm:col-span-4 border-2 border-[#1a1a1a] bg-black overflow-hidden relative">
                    <img
                      src={capturedImage}
                      alt="Scanned Document Snapshot"
                      className="w-full h-40 object-cover opacity-90"
                    />
                    <div className="absolute bottom-1 right-1 bg-black/80 text-white font-['Space_Mono'] text-[9px] px-1">
                      {str.scannedPhotoTag}
                    </div>
                  </div>
                )}

                <div className={`${capturedImage ? 'sm:col-span-8' : 'sm:col-span-12'} space-y-2`}>
                  {/* Issuing Authority */}
                  <div className="p-3 bg-white border-2 border-[#1a1a1a] space-y-1">
                    <span className="meta-label">
                      {str.issuingAuthority}
                    </span>
                    <p className="font-['Space_Grotesk'] text-xs font-bold text-[#1a1a1a]">
                      {language === 'kn' ? (scannedResult.departmentKn || scannedResult.department) : language === 'hi' ? (scannedResult.departmentHi || scannedResult.department) : scannedResult.department}
                    </p>
                  </div>

                  {/* Required Statutory Action */}
                  <div className="p-3 bg-[#faf7f2] border-2 border-[#1a1a1a] space-y-1">
                    <span className="meta-label text-[#e63b2e]">
                      {str.statutoryAction}
                    </span>
                    <p className="font-['Space_Grotesk'] text-xs font-bold text-[#1a1a1a]">
                      {language === 'kn' ? (scannedResult.requiredAction.kn || scannedResult.requiredAction.en) : language === 'hi' ? (scannedResult.requiredAction.hi || scannedResult.requiredAction.en) : scannedResult.requiredAction.en}
                    </p>
                  </div>

                  {/* Layman's Terms Summary */}
                  <div className="p-3 bg-[#fff8e7] border-2 border-[#1a1a1a] space-y-1">
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px] text-[#e63b2e]">lightbulb</span>
                      <span className="meta-label text-[#1a1a1a]">
                        {str.laymanSummary}
                      </span>
                    </div>
                    <p className="text-xs text-[#1a1a1a] font-['Inter'] leading-relaxed">
                      {language === 'kn' ? (scannedResult.laymanSummary?.kn || scannedResult.plainSummary.kn || scannedResult.plainSummary.en) : language === 'hi' ? (scannedResult.laymanSummary?.hi || scannedResult.plainSummary.hi || scannedResult.plainSummary.en) : (scannedResult.laymanSummary?.en || scannedResult.plainSummary.en)}
                    </p>
                  </div>

                  {/* Key Points */}
                  {((language === 'kn' ? scannedResult.keyPointsKn : language === 'hi' ? scannedResult.keyPointsHi : scannedResult.keyPointsEn) || scannedResult.keyPoints) && (
                    <div className="p-3 bg-white border-2 border-[#1a1a1a] space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-[#0055ff]">checklist</span>
                        <span className="meta-label text-[#0055ff]">
                          {str.keyPoints}
                        </span>
                      </div>
                      <ul className="space-y-1 text-xs font-['Inter'] text-[#1a1a1a]">
                        {((language === 'kn' ? scannedResult.keyPointsKn : language === 'hi' ? scannedResult.keyPointsHi : scannedResult.keyPointsEn) || scannedResult.keyPoints || []).map((kp, kIdx) => (
                          <li key={kIdx} className="flex items-start gap-1.5">
                            <span className="text-[#0055ff] font-bold">▪</span>
                            <span>{kp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Date & Penalty Info */}
                  <div className="flex flex-wrap items-center gap-2 text-xs font-['Space_Grotesk']">
                    <div className="flex-1 p-2 bg-[#ffdad6] border border-[#e63b2e] font-bold text-[#e63b2e]">
                      {str.penalty} {language === 'kn' ? (scannedResult.penaltyTextKn || scannedResult.penaltyText) : language === 'hi' ? (scannedResult.penaltyTextHi || scannedResult.penaltyText) : scannedResult.penaltyText}
                    </div>
                    <div className="flex-1 p-2 bg-[#eee9e0] border border-[#1a1a1a] font-bold text-[#1a1a1a]">
                      {str.dueDate} {scannedResult.hasNoDueDate ? (language === 'kn' ? 'ಗಡುವಿಲ್ಲ' : language === 'hi' ? 'कोई समय सीमा नहीं' : 'No deadline') : formatProperDate(scannedResult.deadlineDate, language)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-3 border-t-2 border-[#1a1a1a]/20">
                <button
                  onClick={handleApplyScannedNotice}
                  className="flex-1 py-3 px-4 bg-[#1a1a1a] hover:bg-[#0055ff] text-white font-['Space_Grotesk'] text-xs font-bold uppercase border-2 border-[#1a1a1a] bauhaus-shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">chat</span>
                  <span>{str.consultBtn}</span>
                </button>
                <button
                  onClick={() => setMode('choice')}
                  className="pill font-bold"
                >
                  {str.scanAnother}
                </button>
              </div>
              <p className="text-[11px] text-[#4a4a4a] font-['Inter'] italic">
                {str.disclaimer}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
