import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '25mb' }));

// Safety check for illicit/harmful requests
const HARMFUL_KEYWORDS = [
  'fake pan', 'fake aadhar', 'fake aadhaar', 'forge', 'forgery', 'evade tax',
  'bribe', 'hack portal', 'bypass law', 'counterfeit', 'stolen id', 'identity theft',
  'evade police', 'fake receipt', 'fraudulent', 'exploit loophole'
];

function isUnsafeRequest(query: string): boolean {
  const lower = query.toLowerCase();
  return HARMFUL_KEYWORDS.some(kw => lower.includes(kw));
}

function detectTextLanguage(text: string): 'kn' | 'hi' | 'en' {
  if (!text) return 'en';
  // Check Kannada Unicode block
  if (/[\u0C80-\u0CFF]/.test(text)) return 'kn';
  // Check Devanagari (Hindi) Unicode block
  if (/[\u0900-\u097F]/.test(text)) return 'hi';
  
  const lower = text.toLowerCase();
  // Kannada transliterated keywords
  if (/\b(namaskara|yavaga|beku|hege|madodu|kanoonu|dinaanka|nanna|enu|madbeku|uttarisi|mahiti|adhikara|dhanda|salaha|vivarisi|nodi|illi|idu|neevu|matte|tumba|dayavittu)\b/i.test(lower)) {
    return 'kn';
  }
  // Hindi transliterated keywords
  if (/\b(namaste|kaise|karein|karna|kya|kab|vivran|apeel|shukriya|bataiye|jankari|samay|tarikh|shulk|kripya|mujhe|batao|mera|meri|kahiye|aap|hai|hain|nahi|kijiye)\b/i.test(lower)) {
    return 'hi';
  }
  return 'en';
}

// POST /api/chat - Conversational assistant endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const {
      message,
      history = [],
      documentContext,
      imageBase64,
      language = 'auto',
      voiceOutputLang = 'auto'
    } = req.body;

    if (!message && !imageBase64) {
      return res.status(400).json({ error: 'Message or document image is required' });
    }

    const detectedUserLang = message ? detectTextLanguage(message) : (language !== 'auto' ? language : 'en');
    const effectiveTargetLang = language === 'auto' ? detectedUserLang : language;

    // Safety policy check
    if (message && isUnsafeRequest(message)) {
      return res.json({
        response: {
          text: "I cannot assist with requests involving illegal activity, fraud, falsifying records, or evading statutory obligations. As your assistant, I can only provide guidance on lawful dispute mechanisms, genuine rectification procedures, or official grievance channels.",
          kannadaText: "ಕಾನೂನುಬಾಹಿರ ಚಟುವಟಿಕೆಗಳು, ವಂಚನೆ ಅಥವಾ ದಾಖಲೆಗಳ ತಿರುಚುವಿಕೆಗೆ ನಾನು ಸಹಾಯ ಮಾಡಲು ಸಾಧ್ಯವಿಲ್ಲ. ಅಧಿಕೃತ ಮತ್ತು ಕಾನೂನುಬದ್ಧ ಪರಿಹಾರ ಮಾರ್ಗಗಳಿಗೆ ಮಾತ್ರ ನಾನು ನೆರವು ನೀಡಬಲ್ಲೆ.",
          hindiText: "मैं अवैध गतिविधियों, धोखाधड़ी या कानूनी दायित्वों से बचने से संबंधित अनुरोधों में सहायता नहीं कर सकता। मैं केवल वैध समाधान प्रक्रियाओं या आधिकारिक शिकायत चैनलों पर मार्गदर्शन प्रदान कर सकता हूँ।",
          englishText: "I cannot assist with requests involving illegal activity, fraud, falsifying records, or evading statutory obligations. As your assistant, I can only provide guidance on lawful dispute mechanisms, genuine rectification procedures, or official grievance channels.",
          detectedLanguage: detectedUserLang,
          safetyRefusal: true,
          actionButtons: [
            { label: 'View Lawful Grievance Channels', action: 'rights' },
            { label: 'Consult Official Legal Aid', action: 'help' }
          ]
        }
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // System instructions for the Assistant
    const systemPrompt = `You are "Go Vision Assistant", an empathetic, highly capable civic and official document assistant.
IDENTITY & BOUNDARIES:
- Refer to yourself solely as "Assistant" or "Go Vision Assistant".
- You communicate warmly, concisely, and naturally.
- You understand Hindi, English, and Kannada.
- The user's input/detected language is: "${effectiveTargetLang.toUpperCase()}".
- Analyze official documents, government notices, tax letters, court summons, educational records, and civic circulars.
- Identify dates, deadlines, amounts, department names, instructions, and required actions.
- Always distinguish extracted facts from assumptions, and recommend verifying important legal or financial decisions with an official authority.
- Provide a general summary of the document in layman terms (avoid legal jargon, explain what it means in plain words).
- Provide an "understandingCheck" with 2-3 questions/key points to properly check that the citizen understands the document correctly before taking action.
- Provide an "expiryNotice" indicating if the document is expiring soon (within 7 days or overdue) so the user gets an immediate reminder.

SAFETY & INTEGRITY:
- Refuse requests that involve illegal activity, fraud, evasion of taxes/law, falsifying certificates, or unauthorized access. Be polite, concise, and redirect the user toward a lawful alternative.

OUTPUT REQUIREMENT:
You MUST respond with a valid JSON object following this exact schema:
{
  "detectedLanguage": "kn" | "hi" | "en",
  "text": "Primary conversational response in the user's language (${effectiveTargetLang === 'kn' ? 'Kannada' : effectiveTargetLang === 'hi' ? 'Hindi' : 'English'})",
  "kannadaText": "Clear explanation in Kannada (ಕನ್ನಡ)",
  "hindiText": "Clear explanation in Hindi (हिंदी)",
  "englishText": "Clear explanation in English",
  "laymanSummary": "Clear general summary of the document in simple layman terms without legal jargon",
  "understandingCheck": [
    {
      "question": "Question to verify citizen understands what this notice requires",
      "explanation": "Clear answer confirming the correct understanding"
    }
  ],
  "expiryNotice": {
    "isExpiringSoon": boolean,
    "daysRemaining": number,
    "deadline": "string",
    "penaltyWarning": "string"
  },
  "extractedInfo": {
    "deadline": "string (YYYY-MM-DD or readable date if present)",
    "daysRemaining": number,
    "amount": "string (e.g. ₹ 18,450)",
    "authority": "string (issuing department)",
    "action": "string (immediate recommended action)",
    "isCritical": boolean,
    "isExpiringSoon": boolean
  },
  "actionButtons": [
    { "label": "string", "action": "calendar" | "procedure" | "draft" | "rights" | "help" }
  ],
  "safetyRefusal": boolean
}`;

    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      // High-fidelity fallback response if API key is not configured
      let fallbackText = `I have reviewed your inquiry regarding ${documentContext?.title || 'the document'}. `;
      let knFallback = `ದಾಖಲೆಯ ವಿವರಗಳನ್ನು ಪರಿಶೀಲಿಸಲಾಗಿದೆ. `;
      let hiFallback = `दस्तावेज के विवरण की समीक्षा की गई है। `;

      const isExpiring = documentContext ? documentContext.daysRemaining <= 7 : false;

      if (documentContext) {
        fallbackText += `According to the notice from ${documentContext.department}, the statutory deadline is ${documentContext.deadlineDate} (${documentContext.daysRemaining} days remaining). You should ${documentContext.requiredAction.en}.`;
        knFallback += `${documentContext.department} ನೀಡಿದ ನೋಟಿಸ್‌ಗೆ ಉತ್ತರಿಸಲು ${documentContext.deadlineDate} ಕೊನೆಯ ದಿನಾಂಕ (${documentContext.daysRemaining} ದಿನಗಳು ಬಾಕಿ). ${documentContext.plainSummary.kn}`;
        hiFallback += `${documentContext.department} द्वारा जारी नोटिस का जवाब देने की अंतिम तिथि ${documentContext.deadlineDate} है। ${documentContext.plainSummary.hi}`;
      } else {
        fallbackText += `I am ready to assist. You can speak to me, ask questions about official procedures, or scan/upload a document in English, Hindi, or Kannada.`;
        knFallback += `ನಾನು ನೆರವು ನೀಡಲು ಸಿದ್ಧನಿದ್ದೇನೆ. ನೀವು ಕನ್ನಡ, ಹಿಂದಿ ಅಥವಾ ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿ ಮಾತನಾಡಬಹುದು ಅಥವಾ ದಾಖಲೆಗಳನ್ನು ಸ್ಕ್ಯಾನ್ ಮಾಡಬಹುದು.`;
        hiFallback += `मैं सहायता के लिए तैयार हूँ। आप मुझसे हिंदी, अंग्रेजी या कन्नड़ में पूछ सकते हैं या दस्तावेज स्कैन कर सकते हैं।`;
      }

      const primaryText = effectiveTargetLang === 'kn' ? knFallback : effectiveTargetLang === 'hi' ? hiFallback : fallbackText;

      return res.json({
        response: {
          text: primaryText,
          kannadaText: knFallback,
          hindiText: hiFallback,
          englishText: fallbackText,
          detectedLanguage: detectedUserLang,
          laymanSummary: documentContext?.laymanSummary?.en || (documentContext ? `In plain words: The notice requires action by ${documentContext.deadlineDate}. Do not ignore it to prevent penalty charges.` : undefined),
          understandingCheck: documentContext?.understandingQuestions?.map((q: any) => ({
            question: q.question,
            explanation: q.explanation
          })) || (documentContext ? [
            {
              question: `What is the final deadline to respond?`,
              explanation: `${documentContext.deadlineDate} (${documentContext.daysRemaining} days left). Acting before this date avoids further penalty.`
            },
            {
              question: `Can you request rectification or dispute this notice?`,
              explanation: documentContext.disputeAvailable ? 'Yes, you can file an objection or rectification before the deadline.' : 'You must complete the required verification as instructed.'
            }
          ] : undefined),
          expiryNotice: documentContext ? {
            isExpiringSoon: isExpiring,
            daysRemaining: documentContext.daysRemaining,
            deadline: documentContext.deadlineDate,
            penaltyWarning: documentContext.penaltyText
          } : undefined,
          extractedInfo: documentContext ? {
            deadline: documentContext.deadlineDate,
            amount: documentContext.amountDemanded || 'Not specified',
            authority: documentContext.department,
            action: documentContext.requiredAction.en,
            daysRemaining: documentContext.daysRemaining,
            isCritical: documentContext.urgency === 'CRITICAL',
            isExpiringSoon: isExpiring
          } : undefined,
          actionButtons: documentContext ? [
            { label: 'Set Calendar Reminder', action: 'calendar' },
            { label: 'Explain Step-by-Step Procedure', action: 'procedure' },
            { label: 'Draft Formal Response', action: 'draft' }
          ] : [
            { label: 'Scan or Upload Notice', action: 'scan' },
            { label: 'Check Upcoming Deadlines', action: 'deadlines' }
          ]
        }
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });

    // Build contents for gemini-3.8-flash
    const contents: any[] = [];

    // Prior conversation turns
    for (const h of history.slice(-6)) {
      if (h.role && h.text) {
        contents.push({
          role: h.role === 'user' ? 'user' : 'model',
          parts: [{ text: h.text }]
        });
      }
    }

    // Current turn parts
    const currentParts: any[] = [];

    if (documentContext) {
      currentParts.push({
        text: `[Active Document Context]:
Document Title: ${documentContext.title}
Reference: ${documentContext.refNumber}
Authority: ${documentContext.department}
Assessed Amount / Demand: ${documentContext.amountDemanded || 'N/A'}
Deadline: ${documentContext.deadlineDate} (${documentContext.daysRemaining} days remaining)
Action Required: ${documentContext.requiredAction.en}
Statutory Remedy: ${documentContext.statutoryRemedy}`
      });
    }

    if (imageBase64) {
      const mimeMatch = imageBase64.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
      if (mimeMatch) {
        currentParts.push({
          inlineData: {
            mimeType: mimeMatch[1],
            data: mimeMatch[2]
          }
        });
      }
    }

    if (message) {
      currentParts.push({ text: message });
    } else {
      currentParts.push({ text: "Please analyze this scanned document. Extract the issuing authority, key deadline, any demanded amount or fee, instructions, and provide a clear explanation in simple language." });
    }

    contents.push({
      role: 'user',
      parts: currentParts
    });

    const candidateModels = [
      'gemma-4-31b-it',
      'gemma-4-26b-a4b-it',
      'gemma-3-27b-it',
      'gemini-3.8-flash'
    ];
    let response: any = null;
    let chosenModel = 'gemini-3.8-flash';

    for (const modelName of candidateModels) {
      try {
        response = await ai.models.generateContent({
          model: modelName,
          contents,
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: 'application/json',
            temperature: 0.2,
          }
        });
        if (response && response.text) {
          chosenModel = modelName;
          break;
        }
      } catch (modelErr: any) {
        console.warn(`Model candidate ${modelName} failed or unavailable, checking next:`, modelErr.message);
      }
    }

    if (!response || !response.text) {
      throw new Error('All model candidates failed to return content');
    }

    let rawReply = response.text || '';
    let parsed: any = null;

    try {
      const cleanJson = rawReply.replace(/^```json/i, '').replace(/```$/i, '').trim();
      parsed = JSON.parse(cleanJson);
    } catch {
      parsed = {
        text: rawReply,
        detectedLanguage: detectedUserLang
      };
    }

    const primaryText = parsed.text || "I have analyzed your request.";
    const knText = parsed.kannadaText || (detectedUserLang === 'kn' ? primaryText : undefined);
    const hiText = parsed.hindiText || (detectedUserLang === 'hi' ? primaryText : undefined);
    const enText = parsed.englishText || (detectedUserLang === 'en' ? primaryText : undefined);

    const actionButtons = parsed.actionButtons && parsed.actionButtons.length > 0
      ? parsed.actionButtons
      : [
          { label: 'Set Calendar Reminder', action: 'calendar' },
          { label: 'Explain Step-by-Step Procedure', action: 'procedure' },
          { label: 'Draft Formal Response', action: 'draft' }
        ];

    const isExpiring = documentContext ? documentContext.daysRemaining <= 7 : false;

    return res.json({
      response: {
        text: primaryText,
        kannadaText: knText,
        hindiText: hiText,
        englishText: enText,
        detectedLanguage: parsed.detectedLanguage || detectedUserLang,
        laymanSummary: parsed.laymanSummary || documentContext?.laymanSummary?.en || (documentContext ? `In plain words: The notice requires action by ${documentContext.deadlineDate}. Do not ignore it to prevent penalty charges.` : undefined),
        understandingCheck: parsed.understandingCheck || (documentContext?.understandingQuestions ? documentContext.understandingQuestions.map((q: any) => ({
          question: q.question,
          explanation: q.explanation
        })) : undefined),
        expiryNotice: parsed.expiryNotice || (documentContext ? {
          isExpiringSoon: isExpiring,
          daysRemaining: documentContext.daysRemaining,
          deadline: documentContext.deadlineDate,
          penaltyWarning: documentContext.penaltyText
        } : undefined),
        modelUsed: chosenModel,
        extractedInfo: parsed.extractedInfo || (documentContext ? {
          deadline: documentContext.deadlineDate,
          amount: documentContext.amountDemanded || 'See details',
          authority: documentContext.department,
          action: documentContext.requiredAction.en,
          daysRemaining: documentContext.daysRemaining,
          isCritical: documentContext.urgency === 'CRITICAL',
          isExpiringSoon: isExpiring
        } : undefined),
        actionButtons,
        safetyRefusal: parsed.safetyRefusal || false
      }
    });
  } catch (err: any) {
    console.error('API /api/chat error:', err);
    return res.status(500).json({
      error: 'An error occurred while analyzing the document or request.',
      message: err.message
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Go Vision server listening on port ${port}`);
  });
}

startServer();
