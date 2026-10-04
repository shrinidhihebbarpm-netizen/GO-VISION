# 🐍 Running Go Vision Locally in Python IDLE

This guide explains how to run **Go Vision - Offline Citizen AI Assistant** on your computer using **Python IDLE**.

---

## ⚡ Quick Start (In 3 Simple Steps)

### Method 1: Using Python IDLE (Standard)
1. **Open Python IDLE**:
   - On Windows: Press `Win` key, type **IDLE**, and press `Enter`.
   - Or run from command prompt / terminal:
     ```bash
     python -m idlelib
     ```
2. **Open the script**:
   - In IDLE, click **File** ➔ **Open...** (or press `Ctrl + O`).
   - Navigate to this folder and select [`main.py`](file:///C:/Users/Shrinidhi/antigravity/Go-Vision---Offline-Citizen-AI/main.py).
3. **Run the Module**:
   - Press **`F5`** on your keyboard (or click **Run** ➔ **Run Module** in the menu).

🎉 **What happens automatically**:
- The local Go Vision server starts in the background on `http://localhost:8000`.
- Your default web browser will automatically open the modern Go Vision web app.
- A native desktop companion GUI window will appear with voice and text query tools.

---

### Method 2: One-Click Launcher (Windows)
Double-click [`run_in_idle.bat`](file:///C:/Users/Shrinidhi/antigravity/Go-Vision---Offline-Citizen-AI/run_in_idle.bat) in the project directory.

---

### Method 3: Command Line / Terminal
```bash
python main.py
```
Or for headless / server-only mode:
```bash
python app.py
```

---

## 🌟 Key Features in Python IDLE

1. **Zero External Dependencies**:
   - Uses **100% Python Standard Library** (`tkinter`, `http.server`, `urllib`, `threading`, `json`, `webbrowser`).
   - No `pip install` required to run!

2. **Multilingual Notice Understanding**:
   - Ask questions or speak queries in **Kannada (`ಕನ್ನಡ`)**, **Hindi (`हिंदी`)**, or **English**.
   - Automatic language detection.
   - Summarizes deadlines, demanded amounts, and required statutory procedures (e.g., Section 154 rectification).

3. **Dual Interface**:
   - **Modern Web App**: Full responsive user interface in your web browser.
   - **Desktop Companion GUI**: Native Tkinter desktop control panel for easy notice inspection and speech testing.

---

## ⚙️ Configuration (Optional)

To enable live Gemini API generation, copy `.env.example` to `.env` and set your key:
```ini
GEMINI_API_KEY=your_gemini_api_key_here
```
*(If no API key is provided, Go Vision automatically uses its built-in offline legal reasoning engine without errors!)*
