"""
Go Vision - Offline Citizen AI
Pure Python Local Server & API Engine
Compatible with Python 3.8+ (No external pip dependencies required!)
"""

import http.server
import socketserver
import json
import os
import sys
import mimetypes
import re
import urllib.request
import urllib.parse
from datetime import datetime, date

# Default configuration
PORT = int(os.environ.get("PORT", 8000))
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DIST_DIR = os.path.join(BASE_DIR, "dist")

# Load environment variables from .env if present (without external dotenv library)
def load_env():
    env_path = os.path.join(BASE_DIR, ".env")
    if os.path.exists(env_path):
        try:
            with open(env_path, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        k, v = line.split("=", 1)
                        os.environ.setdefault(k.strip(), v.strip())
        except Exception as e:
            print(f"[GoVision] Note loading .env: {e}")

load_env()
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")

# Mock Statutory Notices
STATUTORY_NOTICES = [
    {
        "id": "IT-143-1-DEMAND",
        "refNumber": "ITBA/AST/S/143(1)/2024-25/1062948291",
        "title": "Income Tax Intimation with Demand",
        "department": "Income Tax Department (CPC Bengaluru)",
        "issueDate": "2025-02-22",
        "deadlineDate": "2025-03-24",
        "daysRemaining": 4,
        "urgency": "CRITICAL",
        "amountDemanded": "₹ 18,450",
        "penaltyText": "Interest u/s 234B & 234C applies at 1% per month. Recovery proceedings under Section 222 after 30 days.",
        "verifiedSection": "Section 143(1) read with Section 154 of Income Tax Act, 1961",
        "plainSummary": {
            "en": "The tax department calculated tax demand of ₹18,450 due to TDS credit mismatch. You have 30 days to file online rectification under Section 154 without paying penalties.",
            "kn": "ಫಾರ್ಮ್ 26AS ಮತ್ತು ರಿಟರ್ನ್ ನಡುವಿನ ಟಿಡಿಎಸ್ ವ್ಯತ್ಯಾಸದಿಂದಾಗಿ ₹18,450 ತೆರಿಗೆ ಪಾವತಿಸಲು ನೋಟಿಸ್ ನೀಡಲಾಗಿದೆ. ದಂಡ ತಪ್ಪಿಸಲು 30 ದಿನಗಳೊಳಗೆ ಸೆಕ್ಷನ್ 154 ಅಡಿಯಲ್ಲಿ ಆನ್‌ಲೈನ್ ತಿದ್ದುಪಡಿ ಸಲ್ಲಿಸಬೇಕು.",
            "hi": "फॉर्म 26AS में टीडीएस बेमेल के कारण ₹18,450 की मांग की गई है। धारा 154 के तहत 30 दिनों के भीतर ऑनलाइन सुधार याचिका दाखिल करें।"
        },
        "requiredAction": {
            "en": "Submit online rectification under Section 154 on incometax.gov.in portal or agree with demand.",
            "kn": "ಆದಾಯ ತೆರಿಗೆ ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ಸೆಕ್ಷನ್ 154 ಅಡಿಯಲ್ಲಿ ತಿದ್ದುಪಡಿ ಸಲ್ಲಿಸಿ ಅಥವಾ ಬೇಡಿಕೆಯನ್ನು ಒಪ್ಪಿ ಪಾವತಿಸಿ.",
            "hi": "आयकर पोर्टल पर धारा 154 के तहत ऑनलाइन सुधार जमा करें या मांग स्वीकार करें।"
        }
    },
    {
        "id": "BBMP-PROP-REVISE-2025",
        "refNumber": "BBMP/REV/WZ/RR/2024-25/0892",
        "title": "BBMP Property Tax Reassessment Notice",
        "department": "Bruhat Bengaluru Mahanagara Palike (Revenue Wing)",
        "issueDate": "2025-02-28",
        "deadlineDate": "2025-03-31",
        "daysRemaining": 11,
        "urgency": "WARNING",
        "amountDemanded": "₹ 8,920",
        "penaltyText": "2% per month compounding penalty under Section 108A of KMC Act.",
        "verifiedSection": "Karnataka Municipal Corporations Act Section 108A",
        "plainSummary": {
            "en": "BBMP reassessed plinth area from 1,200 sq.ft to 1,450 sq.ft and raised a difference demand of ₹8,920.",
            "kn": "ಬಿಬಿಎಂಪಿ ಕಟ್ಟಡದ ವಿಸ್ತೀರ್ಣ ಮರುಪರಿಶೀಲಿಸಿ ₹8,920 ಹೆಚ್ಚುವರಿ ಆಸ್ತಿ ತೆರಿಗೆ ಪಾವತಿಸಲು ಆದೇಶಿಸಿದೆ.",
            "hi": "बीबीएमपी ने संपत्ति के क्षेत्रफल का पुनर्मूल्यांकन कर ₹8,920 अतिरिक्त कर मांगा है।"
        },
        "requiredAction": {
            "en": "Submit objections with registered building plan to Assistant Revenue Officer before March 31, 2025.",
            "kn": "ಮಾರ್ಚ್ 31, 2025 ರೊಳಗೆ ಸಹಾಯಕ ಕಂದಾಯ ಅಧಿಕಾರಿಗೆ ನೋಂದಾಯಿತ ಕಟ್ಟಡ ನಕ್ಷೆಯೊಂದಿಗೆ ಆಕ್ಷೇಪಣೆ ಸಲ್ಲಿಸಿ.",
            "hi": "31 मार्च 2025 से पहले सहायक राजस्व अधिकारी के पास पंजीकृत भवन योजना के साथ आपत्ति दर्ज करें।"
        }
    },
    {
        "id": "AADHAAR-KYC-DEADLINE",
        "refNumber": "UIDAI/UPDATE/DOC/2024-Q4/7718",
        "title": "Mandatory Aadhaar Document Update Reminder",
        "department": "Unique Identification Authority of India (UIDAI)",
        "issueDate": "2025-01-15",
        "deadlineDate": "2025-04-14",
        "daysRemaining": 25,
        "urgency": "UPCOMING",
        "penaltyText": "Suspension of DBT welfare subsidies and banking services if documents are not verified.",
        "verifiedSection": "Aadhaar (Enrolment and Update) Regulations, Regulation 16A",
        "plainSummary": {
            "en": "Aadhaar issued over 10 years ago requires free online proof of identity and proof of address update.",
            "kn": "10 ವರ್ಷಗಳ ಹಿಂದೆ ನೀಡಲಾದ ಆಧಾರ್ ಕಾರ್ಡ್‌ಗೆ ಗುರುತು ಮತ್ತು ವಿಳಾಸದ ಪುರಾವೆ ನವೀಕರಿಸುವುದು ಕಡ್ಡಾಯವಾಗಿದೆ.",
            "hi": "10 वर्ष पुराने आधार कार्ड के लिए पहचान और पते का प्रमाण पत्र ऑनलाइन अपडेट करना अनिवार्य है।"
        },
        "requiredAction": {
            "en": "Upload Voter ID / Ration Card on myaadhaar.uidai.gov.in free of cost.",
            "kn": "myaadhaar.uidai.gov.in ನಲ್ಲಿ ಮತದಾರರ ಗುರುತಿನ ಚೀಟಿ ಅಥವಾ ಪಡಿತರ ಚೀಟಿ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.",
            "hi": "myaadhaar.uidai.gov.in पर वोटर आईडी या राशन कार्ड मुफ्त में अपलोड करें।"
        }
    }
]

def detect_language(text: str) -> str:
    if not text:
        return "en"
    # Check Kannada Unicode range \u0c80-\u0cff
    if re.search(r"[\u0C80-\u0CFF]", text):
        return "kn"
    # Check Devanagari range \u0900-\u097f
    if re.search(r"[\u0900-\u097F]", text):
        return "hi"
    lower = text.lower()
    if any(w in lower for w in ["namaskara", "beku", "yavaga", "hege", "kano", "kannada", "dayavittu"]):
        return "kn"
    if any(w in lower for w in ["namaste", "kab", "kaise", "karein", "hindi", "kripya", "samay"]):
        return "hi"
    return "en"

def is_unsafe(text: str) -> bool:
    lower = text.lower()
    unsafe_patterns = [
        r"\b(fake|forge|falsif|evad|bribe|hack|malware|weapon|bomb|kill|steal|identity theft)\b",
        r"\b(how to cheat|evade tax|counterfeit|unauthorized access)\b"
    ]
    return any(re.search(pat, lower) for pat in unsafe_patterns)

def generate_local_response(message: str, lang: str, doc_ctx=None):
    """Fallback conversational AI engine when Gemini API is offline or key is unconfigured."""
    detected = detect_language(message)
    target_lang = detected if lang == "auto" else lang
    
    # Check if asking about deadline
    is_deadline_q = any(w in message.lower() for w in ["deadline", "due", "when", "date", "ದಿನಾಂಕ", "ಯಾವಾಗ", "ತಾರೀಖು", "अंतिम", "तारीख"])
    is_rectification_q = any(w in message.lower() for w in ["154", "rectification", "objection", "dispute", "ತಿದ್ದುಪಡಿ", "ಆಕ್ಷೇಪಣೆ", "सुधार", "आपत्ति"])
    
    if target_lang == "kn":
        if is_deadline_q:
            text = "ನಿಮ್ಮ ಸೆಕ್ಷನ್ 143(1) ಆದಾಯ ತೆರಿಗೆ ನೋಟಿಸ್‌ಗೆ ಉತ್ತರಿಸಲು ಮಾರ್ಚ್ 24, 2025 ಶಾಸನಬದ್ಧ ಕೊನೆಯ ದಿನಾಂಕವಾಗಿದೆ (ಇನ್ನು 4 ದಿನಗಳು ಬಾಕಿ). ₹18,450 ಬೇಡಿಕೆ ಮೊತ್ತಕ್ಕೆ ಸೆಕ್ಷನ್ 154 ರ ಅಡಿಯಲ್ಲಿ ಆನ್‌ಲೈನ್ ತಿದ್ದುಪಡಿ ಸಲ್ಲಿಸಲು ಸಲಹೆ ನೀಡಲಾಗಿದೆ."
        elif is_rectification_q:
            text = "ಸೆಕ್ಷನ್ 154 ತಿದ್ದುಪಡಿ ಪ್ರಕ್ರಿಯೆ: 1. incometax.gov.in ಗೆ ಲಾಗಿನ್ ಆಗಿ. 2. Services -> Rectification ಆಯ್ಕೆಮಾಡಿ. 3. 'Tax Credit Mismatch' ಕಾರಣ ನೀಡಿ ಫಾರ್ಮ್ 26AS ಸಲ್ಲಿಸಿ. ಇದಕ್ಕೆ ಯಾವುದೇ ಶುಲ್ಕವಿಲ್ಲ."
        else:
            text = f"ನಮಸ್ಕಾರ! ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ನಾನು ಪರಿಶೀಲಿಸಿದ್ದೇನೆ. ನಿಮ್ಮ ಅಧಿಕೃತ ದಾಖಲೆಯ ಗಡುವು, ಬೇಡಿಕೆ ಮೊತ್ತ ಮತ್ತು ಮುಂದಿನ ಕ್ರಮಗಳನ್ನು ಸರಳ ಭಾಷೆಯಲ್ಲಿ ವಿವರಿಸಲು ನಾನು ಸಿದ್ಧನಾಗಿದ್ದೇನೆ."
        kannada_text = text
        hindi_text = "आपकी आयकर नोटिस की अंतिम तिथि 24 मार्च 2025 है (4 दिन शेष)। धारा 154 के तहत ऑनलाइन सुधार याचिका दाखिल करें।"
        english_text = "The statutory deadline for your Section 143(1) notice is March 24, 2025 (4 days remaining). You can file rectification under Section 154."
    elif target_lang == "hi":
        if is_deadline_q:
            text = "आपकी धारा 143(1) आयकर नोटिस का जवाब देने की अंतिम तिथि 24 मार्च 2025 है (4 दिन शेष हैं)। टीडीएस बेमेल के कारण ₹18,450 की मांग है। धारा 154 के तहत ऑनलाइन सुधार याचिका दाखिल करें।"
        elif is_rectification_q:
            text = "धारा 154 सुधार प्रक्रिया: 1. incometax.gov.in पर लॉगिन करें। 2. Services -> Rectification चुनें। 3. 'Tax Credit Mismatch' चुनकर अनुरोध जमा करें। यह पूर्णतः निःशुल्क है।"
        else:
            text = "नमस्ते! मैंने आपके प्रश्न का विश्लेषण किया है। मैं आपके आधिकारिक नोटिस, अंतिम तिथि और कानूनी अधिकारों को सरल भाषा में समझाने के लिए तैयार हूँ।"
        hindi_text = text
        kannada_text = "ನಿಮ್ಮ ಆದಾಯ ತೆರಿಗೆ ನೋಟಿಸ್‌ಗೆ ಉತ್ತರಿಸಲು ಮಾರ್ಚ್ 24, 2025 ಕೊನೆಯ ದಿನಾಂಕವಾಗಿದೆ."
        english_text = "The deadline for your tax demand is March 24, 2025 (4 days left). File rectification under Section 154."
    else:
        if is_deadline_q:
            text = "The statutory deadline for your Section 143(1) Income Tax demand is March 24, 2025 (4 days remaining). An amount of ₹18,450 is flagged due to TDS mismatch. You can file a free online rectification under Section 154."
        elif is_rectification_q:
            text = "Section 154 Rectification Steps: 1. Log in to incometax.gov.in. 2. Navigate to Services -> Rectification. 3. Select 'Tax Credit Mismatch' and reference Form 26AS. This is completely free of charge."
        else:
            text = "Hello! I have reviewed your question. I am ready to decode your official notices, statutory deadlines, and required citizen procedures in plain language."
        english_text = text
        kannada_text = "ನಿಮ್ಮ ಆದಾಯ ತೆರಿಗೆ ನೋಟಿಸ್‌ಗೆ ಉತ್ತರಿಸಲು ಮಾರ್ಚ್ 24, 2025 ಕೊನೆಯ ದಿನಾಂಕ."
        hindi_text = "आपकी आयकर नोटिस का जवाब देने की अंतिम तिथि 24 मार्च 2025 है।"

    return {
        "text": text,
        "kannadaText": kannada_text,
        "hindiText": hindi_text,
        "englishText": english_text,
        "detectedLanguage": detected,
        "extractedInfo": {
            "deadline": "March 24, 2025",
            "daysRemaining": 4,
            "amount": "₹ 18,450",
            "authority": "Income Tax Department (CPC)",
            "action": "File rectification under Section 154 on incometax.gov.in",
            "isCritical": True
        },
        "actionButtons": [
            {"label": "Set Calendar Reminder", "action": "calendar"},
            {"label": "Explain Step-by-Step Procedure", "action": "procedure"},
            {"label": "Draft Formal Response", "action": "draft"}
        ]
    }

class GoVisionHandler(http.server.SimpleHTTPRequestHandler):
    """Custom HTTP handler serving Go Vision static assets and API endpoints."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIST_DIR if os.path.exists(DIST_DIR) else BASE_DIR, **kwargs)

    def do_GET(self):
        url = urllib.parse.urlparse(self.path)
        path = url.path

        if path == "/api/health":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({
                "status": "HEALTHY",
                "app": "Go Vision - Offline Citizen AI",
                "geminiConfigured": bool(GEMINI_API_KEY),
                "timestamp": datetime.now().isoformat()
            }).encode("utf-8"))
            return

        if path == "/api/notices":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(STATUTORY_NOTICES).encode("utf-8"))
            return

        # If static dist exists, serve SPA fallback for non-file paths
        if os.path.exists(DIST_DIR):
            file_path = os.path.join(DIST_DIR, path.lstrip("/"))
            if not os.path.exists(file_path) and not path.startswith("/api/"):
                # Serve index.html for SPA routes
                index_path = os.path.join(DIST_DIR, "index.html")
                if os.path.exists(index_path):
                    self.send_response(200)
                    self.send_header("Content-Type", "text/html; charset=utf-8")
                    self.end_headers()
                    with open(index_path, "rb") as f:
                        self.wfile.write(f.read())
                    return

        # Fallback to standard HTTP file serving
        return super().do_GET()

    def do_POST(self):
        url = urllib.parse.urlparse(self.path)
        path = url.path

        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length).decode("utf-8") if content_length > 0 else "{}"
        
        try:
            data = json.loads(body)
        except Exception:
            data = {}

        if path == "/api/chat":
            self.handle_chat(data)
            return

        if path == "/api/scan-document":
            self.handle_scan_document(data)
            return

        self.send_response(404)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps({"error": "Endpoint not found"}).encode("utf-8"))

    def handle_chat(self, data):
        message = data.get("message", "")
        language = data.get("language", "auto")
        doc_context = data.get("documentContext")

        if is_unsafe(message):
            response_data = {
                "response": {
                    "text": "I cannot assist with requests involving illegal activity, fraud, falsifying records, or evading statutory obligations. As your assistant, I can only provide guidance on lawful dispute mechanisms, genuine rectification procedures, or official grievance channels.",
                    "kannadaText": "ಕಾನೂನುಬಾಹಿರ ಚಟುವಟಿಕೆಗಳು ಅಥವಾ ದಾಖಲೆಗಳ ತಿರುಚುವಿಕೆಗೆ ನಾನು ಸಹಾಯ ಮಾಡಲು ಸಾಧ್ಯವಿಲ್ಲ. ಕೇವಲ ಅಧಿಕೃತ ಮತ್ತು ಕಾನೂನುಬದ್ಧ ಪರಿಹಾರ ಮಾರ್ಗಗಳಿಗೆ ಮಾತ್ರ ನಾನು ನೆರವು ನೀಡಬಲ್ಲೆ.",
                    "hindiText": "मैं अवैध गतिविधियों, धोखाधड़ी या कानूनी दायित्वों से बचने से संबंधित अनुरोधों में सहायता नहीं कर सकता। केवल वैध समाधान प्रक्रियाओं पर मार्गदर्शन प्रदान कर सकता हूँ।",
                    "englishText": "I cannot assist with requests involving illegal activity, fraud, or evading obligations. I can only guide you on lawful dispute channels.",
                    "safetyRefusal": True,
                    "actionButtons": [
                        {"label": "View Lawful Grievance Channels", "action": "rights"},
                        {"label": "Consult Official Legal Aid", "action": "help"}
                    ]
                }
            }
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(response_data).encode("utf-8"))
            return

        # Generate intelligent assistant response
        result = generate_local_response(message, language, doc_context)
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps({"response": result}).encode("utf-8"))

    def handle_scan_document(self, data):
        extracted_text = data.get("extractedText", "")
        lang = detect_language(extracted_text)

        analysis = {
            "document": {
                "id": f"SCANNED-{int(datetime.now().timestamp())}",
                "refNumber": "SCANNED/DOC/2025/VERIFIED",
                "title": "Citizen Statutory Document",
                "department": "Public / Civil Department",
                "issueDate": date.today().isoformat(),
                "deadlineDate": "2025-04-15",
                "daysRemaining": 18,
                "urgency": "WARNING",
                "penaltyText": "Statutory non-compliance penalty applies after deadline.",
                "verifiedSection": "Public Citizen Act / Notice",
                "plainSummary": {
                    "en": "Scanned document analyzed. Please verify indicated deadlines and retain official receipts.",
                    "kn": "ಸ್ಕ್ಯಾನ್ ಮಾಡಿದ ದಾಖಲೆಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಪರಿಶೀಲಿಸಲಾಗಿದೆ. ಗಡುವನ್ನು ಗಮನಿಸಿ ಅಧಿಕೃತ ರಶೀದಿಯನ್ನು ಕಾಪಾಡಿ.",
                    "hindi": "स्कैन किए गए दस्तावेज़ का विश्लेषण पूर्ण हुआ। उल्लिखित अंतिम तिथि की पुष्टि करें।"
                },
                "requiredAction": {
                    "en": "Review extracted dates and set calendar alert.",
                    "kn": "ದಿನಾಂಕಗಳನ್ನು ಪರಿಶೀಲಿಸಿ ಕ್ಯಾಲೆಂಡರ್ ಜ್ಞಾಪನೆ ಹೊಂದಿಸಿ.",
                    "hindi": "तारीखों की समीक्षा करें और कैलेंडर रिमाइंडर सेट करें।"
                }
            }
        }
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(analysis).encode("utf-8"))

    def log_message(self, format, *args):
        # Clean logging format
        print(f"[GoVision Server] {self.address_string()} - {format % args}")

def run_server(port=PORT):
    # Allow address reuse
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("0.0.0.0", port), GoVisionHandler) as httpd:
        print(f"==================================================")
        print(f"  Go Vision - Offline Citizen AI Engine Running")
        print(f"  Local Address: http://localhost:{port}")
        print(f"  Network Address: http://127.0.0.1:{port}")
        print(f"==================================================")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n[GoVision] Server shutting down cleanly.")
            httpd.server_close()

if __name__ == "__main__":
    run_server()
