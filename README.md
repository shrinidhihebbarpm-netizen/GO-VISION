# Go Vision - Offline Citizen AI Assistant

> Sovereign offline legal and civic notice assistant for citizen empowerment, multimodal voice queries, statutory compliance, and zero cloud transmission.

---

## 🐍 How to Run Locally in Python IDLE (Zero Setup Required)

You can run this application directly in **any Python IDLE** without needing Node.js or installing extra packages!

### Steps:
1. Open **Python IDLE** (search for **IDLE** in Windows Start menu or run `python -m idlelib`).
2. Go to **File** ➔ **Open...** and select [`main.py`](main.py).
3. Press **`F5`** (or click **Run** ➔ **Run Module**).

### What happens:
- The local Python server automatically starts in the background at `http://localhost:8000`.
- Your default web browser opens with the Go Vision Web Interface.
- A native desktop companion GUI window appears with interactive voice and text query tools.

*(You can also simply double-click [`run_in_idle.bat`](run_in_idle.bat) on Windows to start!)*

For detailed instructions, see [PYTHON_IDLE_GUIDE.md](PYTHON_IDLE_GUIDE.md).

---

## ⚡ Option 2: Run with Node.js & TypeScript

**Prerequisites:** Node.js (v18+)

1. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```
2. Build the frontend:
   ```bash
   npm run build
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌍 Multilingual Voice & Civic Intelligence

- **Multilingual Support**: Kannada (`ಕನ್ನಡ`), Hindi (`हिंदी`), and English with auto-detection.
- **Voice-First**: Natural voice input and spoken audio responses.
- **Document Intelligence**: Understands notices, extracts dates, amounts, deadlines, and required actions.
- **Statutory Deadlines**: Visual alerts, countdowns, and one-click `.ics` calendar reminders.
- **100% Privacy Protection**: Zero unnecessary cloud exposure, permission checks for camera & microphone.

---

## 📁 Repository Structure

```
├── main.py                     # Primary entry point for Python IDLE (F5 to run)
├── app.py                      # Pure Python server & API engine
├── run_in_idle.bat             # One-click Windows batch launcher for IDLE
├── PYTHON_IDLE_GUIDE.md        # Illustrated Python IDLE guide
├── requirements.txt            # Optional Python dependencies
├── server.ts                   # Node.js + Express + WebSocket backend
├── package.json                # Node.js dependencies & scripts
├── vite.config.ts              # Vite 8 configuration
├── src/
│   ├── App.tsx                 # Main Go Vision application component
│   ├── components/             # React UI components
│   ├── data/                   # Mock statutory notices repository
│   └── utils/                  # Speech synthesis, ICS generator, date formatters
└── dist/                       # Pre-built web application assets (for Python serving)
```

---

## 🔒 Configuration

Copy `.env.example` to `.env` and set your key:
```ini
GEMINI_API_KEY=your_gemini_api_key_here
```
*(If no API key is provided, the built-in offline legal reasoning engine handles notice queries automatically!)*