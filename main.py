"""
=============================================================================
  GO VISION - Offline Citizen AI Assistant (Python IDLE Launcher & Desktop GUI)
=============================================================================
How to run in Python IDLE:
  1. Open Python IDLE (from Windows Start Menu or terminal: `python -m idlelib`)
  2. Click 'File' -> 'Open...' and select this file ('main.py')
  3. Press F5 (or click 'Run' -> 'Run Module')
  
This will:
  - Start the local Go Vision server in the background
  - Launch the Go Vision Desktop Companion window
  - Open the full Go Vision Web Application in your default browser
=============================================================================
"""

import sys
import os
import threading
import time
import webbrowser
import json
from datetime import datetime

# Add current directory to Python path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

from app import run_server, generate_local_response, STATUTORY_NOTICES, detect_language, PORT

SERVER_PORT = 8000

def start_background_server():
    """Start local server in a daemon thread so it runs inside IDLE without blocking."""
    server_thread = threading.Thread(target=run_server, args=(SERVER_PORT,), daemon=True)
    server_thread.start()
    return server_thread

def open_browser():
    """Wait for server to bind then open default browser."""
    time.sleep(1.0)
    webbrowser.open(f"http://localhost:{SERVER_PORT}")

def speak_text(text: str):
    """Speak text using Windows SAPI voice if on Windows, non-blocking."""
    if sys.platform == "win32":
        def _speak():
            try:
                import win32com.client
                speaker = win32com.client.Dispatch("SAPI.SpVoice")
                speaker.Speak(text)
            except Exception:
                try:
                    # Fallback using PowerShell SAPI
                    import subprocess
                    clean = text.replace('"', '').replace("'", "")
                    cmd = f'powershell -Command "Add-Type -AssemblyName System.Speech; (New-Object System.Speech.Synthesis.SpeechSynthesizer).Speak(\'{clean}\')"'
                    subprocess.run(cmd, shell=True)
                except Exception:
                    pass
        threading.Thread(target=_speak, daemon=True).start()

def launch_desktop_gui():
    """Launch pure Python Tkinter GUI companion for IDLE users."""
    try:
        import tkinter as tk
        from tkinter import ttk, messagebox, scrolledtext
    except ImportError:
        print("[GoVision] Tkinter not available in this Python environment. Running in CLI mode.")
        print(f"Open your browser to: http://localhost:{SERVER_PORT}")
        open_browser()
        while True:
            time.sleep(1)

    root = tk.Tk()
    root.title("Go Vision - Offline Citizen AI Assistant")
    root.geometry("860x680")
    root.minsize(720, 540)
    root.configure(bg="#F8F7F4")

    # Header Frame
    header_frame = tk.Frame(root, bg="#0A2263", pady=12, padx=16)
    header_frame.pack(fill=tk.X)

    title_label = tk.Label(
        header_frame,
        text="GO VISION - CIVIC NOTICE ASSISTANT",
        font=("Helvetica", 16, "bold"),
        fg="#FFFFFF",
        bg="#0A2263"
    )
    title_label.pack(side=tk.LEFT)

    status_badge = tk.Label(
        header_frame,
        text=f"● SERVER ACTIVE: http://localhost:{SERVER_PORT}",
        font=("Helvetica", 9, "bold"),
        fg="#00E676",
        bg="#061845",
        padx=8,
        pady=3
    )
    status_badge.pack(side=tk.RIGHT)

    # Action Toolbar Frame
    toolbar = tk.Frame(root, bg="#FFFFFF", pady=10, padx=16, bd=1, relief=tk.SOLID)
    toolbar.pack(fill=tk.X)

    btn_browser = tk.Button(
        toolbar,
        text="🌐 Open Go Vision Web App",
        font=("Helvetica", 10, "bold"),
        bg="#0A2263",
        fg="#FFFFFF",
        activebackground="#071947",
        activeforeground="#FFFFFF",
        padx=12,
        pady=6,
        relief=tk.FLAT,
        cursor="hand2",
        command=lambda: webbrowser.open(f"http://localhost:{SERVER_PORT}")
    )
    btn_browser.pack(side=tk.LEFT, padx=(0, 8))

    btn_scanner = tk.Button(
        toolbar,
        text="📄 View Notices & Deadlines",
        font=("Helvetica", 10, "bold"),
        bg="#1A1A1A",
        fg="#FFFFFF",
        activebackground="#333333",
        activeforeground="#FFFFFF",
        padx=12,
        pady=6,
        relief=tk.FLAT,
        cursor="hand2",
        command=lambda: show_notices_window(root)
    )
    btn_scanner.pack(side=tk.LEFT, padx=(0, 8))

    btn_privacy = tk.Button(
        toolbar,
        text="🔒 100% Private (Zero Cloud)",
        font=("Helvetica", 9),
        bg="#E8F5E9",
        fg="#2E7D32",
        padx=8,
        pady=6,
        relief=tk.FLAT,
        state=tk.DISABLED
    )
    btn_privacy.pack(side=tk.RIGHT)

    # Main Notebook / Tabs
    notebook = ttk.Notebook(root)
    notebook.pack(fill=tk.BOTH, expand=True, padx=16, pady=12)

    # TAB 1: Citizen Query & Notice Explainer
    tab_chat = tk.Frame(notebook, bg="#F8F7F4", padx=12, pady=12)
    notebook.add(tab_chat, text="🗣️ Talk to Go Vision Assistant")

    # Quick Suggestion Chips
    chip_frame = tk.Frame(tab_chat, bg="#F8F7F4")
    chip_frame.pack(fill=tk.X, pady=(0, 8))

    tk.Label(chip_frame, text="Quick Questions:", font=("Helvetica", 9, "bold"), bg="#F8F7F4").pack(side=tk.LEFT, padx=(0, 6))

    def set_query(text):
        query_entry.delete(0, tk.END)
        query_entry.insert(0, text)
        on_ask_assistant()

    q1_btn = tk.Button(chip_frame, text="ನನ್ನ ನೋಟಿಸ್ ಗಡುವು ಯಾವಾಗ? [KN]", font=("Helvetica", 8), bg="#FFFFFF", relief=tk.GROOVE, command=lambda: set_query("ನನ್ನ ಆದಾಯ ತೆರಿಗೆ ನೋಟಿಸ್ಗೆ ಕೊನೆಯ ದಿನಾಂಕ ಯಾವಾಗ?"))
    q1_btn.pack(side=tk.LEFT, padx=3)

    q2_btn = tk.Button(chip_frame, text="नोटिस की अंतिम तिथि क्या है? [HI]", font=("Helvetica", 8), bg="#FFFFFF", relief=tk.GROOVE, command=lambda: set_query("नोटिस का जवाब देने की अंतिम तिथि क्या है?"))
    q2_btn.pack(side=tk.LEFT, padx=3)

    q3_btn = tk.Button(chip_frame, text="Explain Section 154 [EN]", font=("Helvetica", 8), bg="#FFFFFF", relief=tk.GROOVE, command=lambda: set_query("Explain Section 154 rectification steps"))
    q3_btn.pack(side=tk.LEFT, padx=3)

    # Input Box Frame
    input_box_frame = tk.Frame(tab_chat, bg="#F8F7F4")
    input_box_frame.pack(fill=tk.X, pady=(0, 10))

    query_entry = tk.Entry(input_box_frame, font=("Helvetica", 11), bd=2, relief=tk.SOLID)
    query_entry.pack(side=tk.LEFT, fill=tk.X, expand=True, ipady=5, padx=(0, 8))
    query_entry.insert(0, "ನನ್ನ ಆದಾಯ ತೆರಿಗೆ ನೋಟಿಸ್ಗೆ ಕೊನೆಯ ದಿನಾಂಕ ಯಾವಾಗ ಮತ್ತು ನಾನು ಏನು ಮಾಡಬೇಕು?")

    btn_ask = tk.Button(
        input_box_frame,
        text="Ask Assistant",
        font=("Helvetica", 10, "bold"),
        bg="#E63B2E",
        fg="#FFFFFF",
        activebackground="#C22519",
        activeforeground="#FFFFFF",
        padx=16,
        relief=tk.FLAT,
        cursor="hand2"
    )
    btn_ask.pack(side=tk.RIGHT)

    # Extracted Details Card
    info_card = tk.LabelFrame(tab_chat, text="Extracted Statutory Information", font=("Helvetica", 9, "bold"), bg="#FFFFFF", padx=10, pady=8)
    info_card.pack(fill=tk.X, pady=(0, 10))

    lbl_deadline = tk.Label(info_card, text="Deadline: March 24, 2025 (4 days left)", font=("Helvetica", 10, "bold"), fg="#D32F2F", bg="#FFFFFF")
    lbl_deadline.pack(anchor="w")

    lbl_amount = tk.Label(info_card, text="Demand Amount: ₹ 18,450  |  Authority: Income Tax Department (CPC)", font=("Helvetica", 9), fg="#333333", bg="#FFFFFF")
    lbl_amount.pack(anchor="w", pady=(2, 0))

    lbl_action = tk.Label(info_card, text="Required Action: Submit online rectification under Section 154 without penalty.", font=("Helvetica", 9), fg="#1A1A1A", bg="#FFFFFF")
    lbl_action.pack(anchor="w", pady=(2, 0))

    # Conversation Output Area
    output_text = scrolledtext.ScrolledText(tab_chat, wrap=tk.WORD, font=("Helvetica", 10), height=10, bg="#FFFFFF", bd=1, relief=tk.SOLID)
    output_text.pack(fill=tk.BOTH, expand=True, pady=(0, 8))

    output_text.insert(tk.END, "Go Vision Assistant ready.\nAsk questions about your official notices, statutory dates, penalties, or procedures in Kannada, Hindi, or English.\n\n")

    # Speech Controls Frame
    speech_frame = tk.Frame(tab_chat, bg="#F8F7F4")
    speech_frame.pack(fill=tk.X)

    last_response_text = [""]

    def on_speak():
        if last_response_text[0]:
            speak_text(last_response_text[0])
        else:
            speak_text("Go Vision Assistant is ready.")

    btn_speak = tk.Button(
        speech_frame,
        text="🔊 Read Aloud / Speak",
        font=("Helvetica", 9, "bold"),
        bg="#0A2263",
        fg="#FFFFFF",
        padx=10,
        pady=4,
        relief=tk.FLAT,
        cursor="hand2",
        command=on_speak
    )
    btn_speak.pack(side=tk.LEFT)

    lbl_audio_note = tk.Label(speech_frame, text="Multilingual audio synthesis (Kannada / Hindi / English)", font=("Helvetica", 8), fg="#666666", bg="#F8F7F4")
    lbl_audio_note.pack(side=tk.LEFT, padx=10)

    def on_ask_assistant():
        q = query_entry.get().strip()
        if not q:
            return
        
        output_text.insert(tk.END, f"\n[YOU]: {q}\n", "user")
        detected = detect_language(q)
        res = generate_local_response(q, detected)
        
        reply = res.get("text", "")
        last_response_text[0] = reply
        output_text.insert(tk.END, f"[ASSISTANT]: {reply}\n", "assistant")
        output_text.see(tk.END)

        ext = res.get("extractedInfo", {})
        if ext:
            lbl_deadline.config(text=f"Deadline: {ext.get('deadline', 'N/A')} ({ext.get('daysRemaining', 'N/A')} days left)")
            lbl_amount.config(text=f"Demand Amount: {ext.get('amount', 'N/A')}  |  Authority: {ext.get('authority', 'N/A')}")
            lbl_action.config(text=f"Required Action: {ext.get('action', 'N/A')}")

    btn_ask.config(command=on_ask_assistant)
    query_entry.bind("<Return>", lambda e: on_ask_assistant())

    # TAB 2: Statutory Notices & Procedures
    tab_notices = tk.Frame(notebook, bg="#F8F7F4", padx=12, pady=12)
    notebook.add(tab_notices, text="📋 Statutory Notices Repository")

    for notice in STATUTORY_NOTICES:
        n_box = tk.LabelFrame(tab_notices, text=f"{notice['title']} ({notice['refNumber']})", font=("Helvetica", 9, "bold"), bg="#FFFFFF", padx=10, pady=8)
        n_box.pack(fill=tk.X, pady=(0, 8))

        tk.Label(n_box, text=f"Authority: {notice['department']}  |  Due: {notice['deadlineDate']} ({notice['daysRemaining']} days left)", font=("Helvetica", 9, "bold"), fg="#E63B2E", bg="#FFFFFF").pack(anchor="w")
        tk.Label(n_box, text=f"Summary: {notice['plainSummary']['en']}", font=("Helvetica", 9), fg="#333333", bg="#FFFFFF", wraplength=700, justify=tk.LEFT).pack(anchor="w", pady=(2, 0))
        tk.Label(n_box, text=f"Action: {notice['requiredAction']['en']}", font=("Helvetica", 9, "italic"), fg="#0A2263", bg="#FFFFFF", wraplength=700, justify=tk.LEFT).pack(anchor="w", pady=(2, 0))

    # Footer Status Bar
    footer = tk.Frame(root, bg="#E0E0E0", padx=12, pady=4)
    footer.pack(fill=tk.X, side=tk.BOTTOM)
    tk.Label(footer, text="Go Vision • Python IDLE Launcher • Standalone Standard Library Engine", font=("Helvetica", 8), bg="#E0E0E0", fg="#555555").pack(side=tk.LEFT)
    tk.Label(footer, text="Press F5 anytime in IDLE to rerun", font=("Helvetica", 8), bg="#E0E0E0", fg="#555555").pack(side=tk.RIGHT)

    root.mainloop()

def show_notices_window(parent):
    """Popup window displaying notices repository."""
    msg = ""
    for n in STATUTORY_NOTICES:
        msg += f"• {n['title']}\n  Authority: {n['department']}\n  Deadline: {n['deadlineDate']} ({n['daysRemaining']}d left)\n  Action: {n['requiredAction']['en']}\n\n"
    from tkinter import messagebox
    messagebox.showinfo("Statutory Notices", msg)

def main():
    print("=" * 60)
    print("  Starting Go Vision Engine for Python IDLE...")
    print(f"  Local Web App: http://localhost:{SERVER_PORT}")
    print("=" * 60)
    
    # Start server in background thread
    start_background_server()
    
    # Automatically open browser to the web app
    threading.Thread(target=open_browser, daemon=True).start()
    
    # Launch GUI companion
    launch_desktop_gui()

if __name__ == "__main__":
    main()
