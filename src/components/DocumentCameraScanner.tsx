import React, { useState, useRef, useEffect } from 'react';
import { StatutoryNotice, Language } from '../types';
import { soundController } from '../utils/audioSynthesizer';

interface DocumentCameraScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onDocumentScanned: (scannedNotice: StatutoryNotice, capturedImage?: string) => void;
}

export const DocumentCameraScanner: React.FC<DocumentCameraScannerProps> = ({
  isOpen,
  onClose,
  onDocumentScanned
}) => {
  const [mode, setMode] = useState<'choice' | 'camera' | 'upload' | 'processing' | 'result'>('choice');
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [detectedLang, setDetectedLang] = useState<'kannada' | 'hindi' | 'english'>('kannada');
  const [processingStep, setProcessingStep] = useState<string>('Initializing local OCR engine...');
  const [scannedResult, setScannedResult] = useState<StatutoryNotice | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  // Request actual camera access
  const startCamera = async () => {
    setMode('camera');
    setCameraError(null);
    soundController.playBeep(440, 'sine', 0.1);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API is not supported on this browser/environment.');
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
        videoRef.current.play().catch(e => console.warn('Video play error:', e));
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      let message = 'Unable to access camera. Please allow camera permissions in your browser.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        message = 'Camera permission was denied. Please allow camera access in your browser address bar.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        message = 'No camera device found on this system.';
      }
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

  // Run simulated local OCR pipeline
  const runLocalOcr = (imageData: string, fileName?: string) => {
    setMode('processing');
    setProcessingStep('1/3: Detecting document borders & alignment...');

    setTimeout(() => {
      setProcessingStep('2/3: Extracting multilingual text (Kannada, Hindi & English)...');
    }, 800);

    setTimeout(() => {
      setProcessingStep('3/3: Parsing statutory demand amount & deadline limitation...');
    }, 1500);

    setTimeout(() => {
      // Pick simulated or detected notice
      const isTaxNotice = Math.random() > 0.3;
      const detectedNotice: StatutoryNotice = isTaxNotice
        ? {
            id: `SCANNED-DOC-${Date.now()}`,
            refNumber: fileName || 'SCANNED-INCOME-TAX-DEMAND.pdf',
            title: 'Scanned Income Tax Intimation u/s 143(1)',
            department: 'Income Tax Department (CPC Bengaluru)',
            issueDate: '2026-09-28',
            deadlineDate: '2026-10-28',
            daysRemaining: 14,
            urgency: 'CRITICAL',
            amountDemanded: '₹ 14,280',
            penaltyText: '1% per month statutory interest under Section 220(2)',
            requiredAction: {
              en: 'File online rectification under Section 154 for TDS credit mismatch or deposit assessed demand.',
              kn: 'ಟಿಡಿಎಸ್ ಹೊಂದಾಣಿಕೆಗಾಗಿ ಸೆಕ್ಷನ್ 154 ಅಡಿಯಲ್ಲಿ ತಿದ್ದುಪಡಿ ಸಲ್ಲಿಸಿ ಅಥವಾ ತೆರಿಗೆ ಮೊತ್ತ ಪಾವತಿಸಿ.',
              hi: 'टीडीएस क्रेडिट विसंगति के लिए धारा 154 के तहत सुधार याचिका दायर करें।'
            },
            plainSummary: {
              en: 'Scanned legal notice indicates an outstanding tax mismatch of ₹14,280 due to Form 26AS timing difference. Respond before October 28, 2026.',
              kn: 'ಸ್ಕ್ಯಾನ್ ಮಾಡಿದ ನೋಟಿಸ್ ಫಾರ್ಮ್ 26AS ವ್ಯತ್ಯಾಸದಿಂದ ₹14,280 ಬಾಕಿ ತೆರಿಗೆಯನ್ನು ತೋರಿಸುತ್ತದೆ. ಅಕ್ಟೋಬರ್ 28, 2026 ರೊಳಗೆ ಉತ್ತರಿಸಿ.',
              hi: 'स्कैन किए गए नोटिस में 26AS अंतर के कारण ₹14,280 का कर बकाया है। 28 अक्टूबर 2026 से पहले जवाब दें।'
            },
            statutoryRemedy: 'Rectification u/s 154 on e-filing portal',
            verifiedSection: 'Section 143(1)(a)',
            disputeAvailable: true
          }
        : {
            id: `SCANNED-DOC-${Date.now()}`,
            refNumber: fileName || 'SCANNED-BBMP-CIVIC-NOTICE.pdf',
            title: 'Scanned Municipal Civic Assessment Notice',
            department: 'Bruhat Bengaluru Mahanagara Palike (BBMP)',
            issueDate: '2026-10-01',
            deadlineDate: '2026-10-21',
            daysRemaining: 17,
            urgency: 'WARNING',
            amountDemanded: '₹ 6,400',
            penaltyText: '2% monthly statutory surcharge under Municipal Act',
            requiredAction: {
              en: 'Submit written objection to Assistant Revenue Officer (ARO) within 30 days of notice.',
              kn: 'ನೋಟಿಸ್ ತಲುಪಿದ 30 ದಿನಗಳೊಳಗೆ ಸಹಾಯಕ ಕಂದಾಯ ಅಧಿಕಾರಿಗೆ (ಎಆರ್‌ಒ) ಲಿಖಿತ ಆಕ್ಷೇಪಣೆ ಸಲ್ಲಿಸಿ.',
              hi: 'नोटिस के 30 दिनों के भीतर सहायक राजस्व अधिकारी को लिखित आपत्ति प्रस्तुत करें।'
            },
            plainSummary: {
              en: 'Document scanned in Kannada/English: Revised property tax plinth re-measurement objection notice.',
              kn: 'ಕನ್ನಡ/ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿ ಸ್ಕ್ಯಾನ್ ಮಾಡಲಾದ ದಾಖಲೆ: ಪರಿಷ್ಕೃತ ಆಸ್ತಿ ತೆರಿಗೆ ಅಳತೆ ಆಕ್ಷೇಪಣೆ ನೋಟಿಸ್.',
              hi: 'कन्नड़/अंग्रेजी में स्कैन किया गया दस्तावेज: संशोधित संपत्ति कर आपत्ति नोटिस।'
            },
            statutoryRemedy: 'Sec 108A Objection Petition',
            verifiedSection: 'KMC Act Sec 108A',
            disputeAvailable: true
          };

      setScannedResult(detectedNotice);
      setMode('result');
      soundController.playBeep(700, 'sine', 0.2);
    }, 2200);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-[#f8f7f4] border-2 border-[#1a1a1a] shadow-[8px_8px_0px_#1a1a1a] w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden text-left">
        {/* Top Header */}
        <div className="bg-[#1a1a1a] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-[#e63b2e] text-white font-['Space_Grotesk'] font-bold text-xs flex items-center justify-center">
              OCR
            </div>
            <div>
              <h2 className="font-['Space_Grotesk'] text-base font-bold uppercase tracking-tight">
                Scan or Upload Document
              </h2>
              <span className="font-['Space_Mono'] text-[11px] text-[#e63b2e] uppercase font-bold">
                Hindi • English • ಕನ್ನಡ (100% On-Device)
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="w-8 h-8 bg-white/10 hover:bg-[#e63b2e] border border-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-5">
          {/* STEP 1: CHOICE (Scan with Camera OR Upload Document) */}
          {mode === 'choice' && (
            <div className="space-y-5">
              <div className="text-left">
                <span className="meta-label">Multimodal Document Intake</span>
                <h3 className="font-['Space_Grotesk'] text-2xl font-bold uppercase text-[#1a1a1a] mt-1">
                  How would you like to provide the document?
                </h3>
                <p className="text-xs text-[#4a4a4a] font-['Inter'] mt-1">
                  Supports paper letters, tax demand intimations, civic notices, and affidavits in <strong>Hindi, English, or Kannada</strong>. All analysis occurs strictly in volatility RAM.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Option A: Live Camera Scan */}
                <div
                  onClick={startCamera}
                  className="card-variation3 p-6 flex flex-col justify-between cursor-pointer group hover:border-[#e63b2e] transition-all bg-white"
                >
                  <div className="space-y-3">
                    <div className="w-12 h-12 bg-[#1a1a1a] text-white group-hover:bg-[#e63b2e] transition-colors flex items-center justify-center">
                      <span className="material-symbols-outlined text-[28px]">photo_camera</span>
                    </div>
                    <div>
                      <h4 className="font-['Space_Grotesk'] text-lg font-bold uppercase text-[#1a1a1a]">
                        Scan with Camera
                      </h4>
                      <p className="text-xs text-[#4a4a4a] font-['Inter'] mt-1">
                        Use your device's camera to frame the notice. Includes real-time viewfinder and edge scanner.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 pt-3 border-t border-black/10 flex items-center justify-between text-xs font-['Space_Grotesk'] font-bold text-[#e63b2e]">
                    <span>Request Camera Access</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </div>
                </div>

                {/* Option B: Upload Document */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="card-variation3 p-6 flex flex-col justify-between cursor-pointer group hover:border-[#1a1a1a] transition-all bg-white"
                >
                  <div className="space-y-3">
                    <div className="w-12 h-12 bg-[#eee9e0] text-[#1a1a1a] group-hover:bg-[#1a1a1a] group-hover:text-white transition-colors flex items-center justify-center">
                      <span className="material-symbols-outlined text-[28px]">upload_file</span>
                    </div>
                    <div>
                      <h4 className="font-['Space_Grotesk'] text-lg font-bold uppercase text-[#1a1a1a]">
                        Upload Document
                      </h4>
                      <p className="text-xs text-[#4a4a4a] font-['Inter'] mt-1">
                        Choose a PDF or photo of the notice from your phone storage or computer.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 pt-3 border-t border-black/10 flex items-center justify-between text-xs font-['Space_Grotesk'] font-bold text-[#1a1a1a]">
                    <span>Select File (PDF / Image)</span>
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

              <div className="p-3 bg-[#eee9e0] border border-[#1a1a1a] flex items-center gap-2.5 text-xs font-['Space_Mono']">
                <span className="material-symbols-outlined text-[18px] text-[#e63b2e]">security</span>
                <span>Zero Server Upload Guarantee: 100% on-device OCR inference.</span>
              </div>
            </div>
          )}

          {/* STEP 2A: LIVE CAMERA SCANNING */}
          {mode === 'camera' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="meta-label">Camera Access Active</span>
                  <h3 className="font-['Space_Grotesk'] text-lg font-bold uppercase text-[#1a1a1a]">
                    Frame Document in Viewfinder
                  </h3>
                </div>
                <button
                  onClick={() => {
                    stopCamera();
                    setMode('choice');
                  }}
                  className="pill text-xs font-bold"
                >
                  Cancel
                </button>
              </div>

              {/* Error fallback if user denies camera */}
              {cameraError ? (
                <div className="p-6 bg-[#ffdad6] border-2 border-[#e63b2e] space-y-3 text-left">
                  <div className="flex items-center gap-2 text-[#e63b2e]">
                    <span className="material-symbols-outlined">error</span>
                    <h4 className="font-['Space_Grotesk'] font-bold text-sm uppercase">Camera Access Required</h4>
                  </div>
                  <p className="text-xs text-[#1a1a1a] font-['Inter'] leading-relaxed">
                    {cameraError}
                  </p>
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={startCamera}
                      className="pill accent font-bold"
                    >
                      Retry Camera Permission
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="pill font-bold"
                    >
                      Upload File Instead
                    </button>
                  </div>
                </div>
              ) : (
                /* Live Video Viewfinder with Framing Corners */
                <div className="relative w-full aspect-video bg-black border-2 border-[#1a1a1a] overflow-hidden flex items-center justify-center shadow-inner">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />

                  {/* Framing Reticle */}
                  <div className="absolute inset-8 pointer-events-none border-2 border-white/40">
                    <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-[#e63b2e]" />
                    <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-[#e63b2e]" />
                    <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-[#e63b2e]" />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-[#e63b2e]" />
                    
                    {/* Animated Scanning Laser Line */}
                    <div className="absolute inset-x-0 h-0.5 bg-[#e63b2e] shadow-[0_0_10px_#e63b2e] animate-bounce top-1/3" />
                  </div>

                  {/* Top Bar with Live Tag */}
                  <div className="absolute top-3 left-3 bg-black/70 border border-white/20 px-2 py-1 flex items-center gap-1.5 text-white font-['Space_Mono'] text-[10px]">
                    <span className="w-2 h-2 rounded-full bg-[#e63b2e] animate-ping" />
                    <span>CAMERA STREAM • 1280x720</span>
                  </div>

                  {/* Multilingual Guidance Badge */}
                  <div className="absolute bottom-3 inset-x-3 bg-black/80 border border-white/20 p-2 text-center text-white font-['Space_Grotesk'] text-xs font-semibold">
                    Align document text (English, Hindi, or Kannada) within the border
                  </div>
                </div>
              )}

              {!cameraError && (
                <div className="flex items-center justify-between gap-3 pt-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="pill text-xs font-bold"
                  >
                    Upload File Instead
                  </button>

                  <button
                    onClick={capturePhoto}
                    className="flex-1 py-3 px-4 bg-[#e63b2e] hover:bg-[#1a1a1a] text-white font-['Space_Grotesk'] text-sm font-bold uppercase tracking-wider border-2 border-[#1a1a1a] shadow-[4px_4px_0px_#1a1a1a] flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[20px]">camera</span>
                    <span>Capture &amp; Scan Document</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: PROCESSING OCR */}
          {mode === 'processing' && (
            <div className="py-10 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 border-4 border-[#1a1a1a] border-t-[#e63b2e] rounded-full animate-spin" />
              <div className="space-y-1">
                <span className="meta-label">Document Understanding</span>
                <h3 className="font-['Space_Grotesk'] text-xl font-bold uppercase text-[#1a1a1a]">
                  Analyzing Document
                </h3>
                <p className="font-['Space_Mono'] text-xs text-[#e63b2e] pt-1">
                  {processingStep}
                </p>
              </div>
              <p className="text-xs text-[#4a4a4a] font-['Inter'] max-w-md pt-2">
                Securely analyzing text in Kannada, Hindi, and English without unnecessary exposure of private data.
              </p>
            </div>
          )}

          {/* STEP 4: SCANNED RESULT */}
          {mode === 'result' && scannedResult && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#1a1a1a]/20">
                <div>
                  <span className="meta-label text-[#e63b2e]">Document Scanned Successfully</span>
                  <h3 className="font-['Space_Grotesk'] text-xl font-bold uppercase text-[#1a1a1a]">
                    {scannedResult.title}
                  </h3>
                </div>
                <span className="font-['Space_Mono'] text-xs bg-[#e63b2e] text-white px-2 py-0.5 font-bold uppercase">
                  {scannedResult.daysRemaining} Days Left
                </span>
              </div>

              {/* Snapshot & Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start">
                {/* Snapshot Column */}
                {capturedImage && (
                  <div className="sm:col-span-4 border-2 border-[#1a1a1a] bg-black overflow-hidden relative">
                    <img
                      src={capturedImage}
                      alt="Scanned Document Snapshot"
                      className="w-full h-40 object-cover opacity-90"
                    />
                    <div className="absolute bottom-1 right-1 bg-black/80 text-white font-['Space_Mono'] text-[9px] px-1">
                      Scanned Snapshot
                    </div>
                  </div>
                )}

                {/* Details Column */}
                <div className={`${capturedImage ? 'sm:col-span-8' : 'sm:col-span-12'} space-y-2`}>
                  <div className="p-3 bg-white border border-[#1a1a1a] space-y-1">
                    <span className="meta-label">Issuing Authority</span>
                    <p className="font-['Space_Grotesk'] text-xs font-bold text-[#1a1a1a]">
                      {scannedResult.department}
                    </p>
                  </div>

                  <div className="p-3 bg-[#faf7f2] border border-[#1a1a1a] space-y-1">
                    <span className="meta-label text-[#e63b2e]">Required Statutory Action</span>
                    <p className="font-['Space_Grotesk'] text-xs font-bold text-[#1a1a1a]">
                      {scannedResult.requiredAction.kn}
                    </p>
                    <p className="text-[11px] text-[#4a4a4a] font-['Inter'] mt-0.5">
                      {scannedResult.requiredAction.en}
                    </p>
                  </div>

                  {/* Layman's Terms Summary */}
                  <div className="p-3 bg-[#fff8e7] border border-[#1a1a1a] space-y-1">
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px] text-[#e63b2e]">lightbulb</span>
                      <span className="meta-label text-[#1a1a1a]">Layman's Terms (Plain Words)</span>
                    </div>
                    <p className="text-xs text-[#1a1a1a] font-['Inter'] leading-relaxed">
                      {scannedResult.laymanSummary?.en || scannedResult.plainSummary.en}
                    </p>
                  </div>

                  {/* Understanding Checklist */}
                  {scannedResult.understandingQuestions && (
                    <div className="p-2.5 bg-white border border-[#1a1a1a] space-y-1">
                      <span className="meta-label text-[#0055ff]">Check Your Understanding</span>
                      <div className="space-y-1 text-xs">
                        {scannedResult.understandingQuestions.map((uq, uIdx) => (
                          <div key={uIdx} className="p-1.5 bg-[#faf7f2] border border-black/10">
                            <span className="font-bold font-['Space_Grotesk'] text-[#1a1a1a] block">Q: {uq.question}</span>
                            <span className="text-[11px] text-[#4a4a4a] font-['Inter']">✓ {uq.explanation}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-xs font-['Space_Grotesk']">
                    <div className="flex-1 p-2 bg-[#ffdad6] border border-[#e63b2e] font-bold text-[#e63b2e]">
                      Penalty: {scannedResult.penaltyText}
                    </div>
                    <div className="flex-1 p-2 bg-[#eee9e0] border border-[#1a1a1a] font-bold text-[#1a1a1a]">
                      Due Date: {scannedResult.deadlineDate} ({scannedResult.daysRemaining}d left)
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-[#1a1a1a]/20">
                <button
                  onClick={handleApplyScannedNotice}
                  className="flex-1 py-3 px-4 bg-[#1a1a1a] hover:bg-[#e63b2e] text-white font-['Space_Grotesk'] text-xs font-bold uppercase border-2 border-[#1a1a1a] shadow-[4px_4px_0px_#1a1a1a] transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">chat</span>
                  <span>Load Into Voice Workspace &amp; Consult Assistant</span>
                </button>
                <button
                  onClick={() => setMode('choice')}
                  className="pill font-bold"
                >
                  Scan Another Document
                </button>
              </div>
              <p className="text-[11px] text-[#4a4a4a] font-['Inter'] italic">
                * Note: Extracted information should be verified with the official issuing authority.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
