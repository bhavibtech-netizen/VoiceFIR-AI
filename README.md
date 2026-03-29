# VoiceFIR AI – Police Mitra Voice FIR System

A full-stack, voice-to-voice conversational AI system designed for filing police FIRs through natural speech.

## Features
- **Natural Voice Conversation**: AI greets and asks follow-up questions using voice.
- **Intent Recognition**: Automated categorization of incidents (Lost Mobile, Theft, Cyber Fraud).
- **Dynamic Questions**: Smart data collection based on the incident type.
- **Full-Stack Integration**: Flask backend with Firebase Firestore storage.
- **Instant FIR Generation**: Creates an official FIR document with a unique ID.
- **PDF Export**: Download the report as a PDF using `jsPDF`.

## Setup Instructions

### Backend (Python Flask)
1. Navigate to the `backend/` directory.
2. The setup has already been partially done. To start the server:
   ```powershell
   .\start_backend.ps1
   ```
   Or manually:
   ```powershell
   .\venv\Scripts\activate
   python app.py
   ```
3. The backend runs at `http://localhost:5000`.

### Frontend
1. Simply open `frontend/index.html` in a modern browser (Google Chrome highly recommended for Speech Recognition).

## Tech Stack
- **Frontend**: HTML5, CSS3, JavaScript (ES6+).
- **Voice APIs**: Web Speech API (`SpeechRecognition` & `SpeechSynthesis`).
- **Backend**: Python Flask.
- **Database**: Firebase Firestore.
- **PDF Generation**: `jsPDF`.
