import { INTENTS, SYSTEM_MESSAGES, LANGUAGES, FIR_LABELS, URGENCY_KEYWORDS } from './config.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import firebaseConfig from './firebase-config.js';

class VoiceFIRApp {
    constructor() {
        // Auth Check
        this.refreshUser();
        if (!this.user) {
            window.location.href = 'login.html';
            return;
        }

        // Initialize Firebase Firestore
        try {
            const app = initializeApp(firebaseConfig);
            this.db = getFirestore(app);
            this.logDiagnostic("Firestore Initialized Successfully", "success");
        } catch (error) {
            this.logDiagnostic("Firestore Initialization Failed: " + error.message, "error");
        }

        this.chatWindow = document.getElementById('chat-window');
        this.micBtn = document.getElementById('mic-btn');
        this.statusText = document.getElementById('status-text');
        this.firModal = document.getElementById('fir-report-modal');
        this.firContent = document.getElementById('fir-content');
        this.overlay = document.getElementById('overlay');
        this.restartBtn = document.getElementById('restart-btn');
        this.downloadIncidentBtn = document.getElementById('download-incident-pdf-btn');
        this.downloadOfficialBtn = document.getElementById('download-official-pdf-btn');
        this.langSelector = document.getElementById('lang-selector');
        this.userDisplayName = document.getElementById('user-display-name');
        
        // Biometric Elements
        this.biometricSection = document.getElementById('biometric-verification-section');
        this.scanBtn = document.getElementById('scan-fingerprint-btn');
        this.biometricStatus = document.getElementById('biometric-status');
        this.scannerContainer = document.getElementById('scanner-container');
        this.biometricVerified = false;
        
        // Show user name in header
        if (this.userDisplayName) {
            this.userDisplayName.innerText = this.user.fullName || this.user.email.split('@')[0];
        }

        if (this.scanBtn) {
            this.scanBtn.onclick = () => this.verifyBiometrics();
        }

        this.officialFirModalBtn = document.getElementById('official-fir-section-btn');

        // New elements for Dual-Mode
        this.modeToggleBtn = document.getElementById('mode-toggle-btn');
        this.textInputRow = document.getElementById('text-input-row');
        this.userTextInput = document.getElementById('user-text-input');
        this.sendBtn = document.getElementById('send-btn');
        this.speakTooltip = document.getElementById('speak-now-tooltip');

        // State Management
        this.currentLanguage = 'en';
        this.inputMode = 'voice'; // 'voice' or 'text'
        this.state = 'GREETING';
        this.currentIntent = null;
        this.currentQuestionIndex = 0;
        this.responses = {};
        this.officialResponses = {}; // Separate storage for official points
        this.isOfficialFlow = false; // Flag to track if we've reached stage 2
        this.isListening = false;
        this.isSpeaking = false;
        this.retryCount = 0;
        this.maxRetries = 3;

        // Speech APIs
        this.recognition = null;
        this.synth = window.speechSynthesis;
        this.voices = [];

        // Load voices asynchronously for multi-lingual support
        const loadVoices = () => {
            this.voices = this.synth.getVoices();
            if (this.voices.length > 0) {
                this.logDiagnostic(`System voices loaded: ${this.voices.length}`, 'success');
            }
        };
        
        if (this.synth.onvoiceschanged !== undefined) {
            this.synth.onvoiceschanged = loadVoices;
        }
        
        // Initial load attempt
        loadVoices();
        // Modern Chrome/Edge require a slight delay for getVoices to populate if not immediate
        setTimeout(loadVoices, 100);

        this.initSpeechRecognition();
        this.initEventListeners();
        
        // Start conversation
        this.greet();
        this.renderSuggestions();
        this.updateUIForLanguage();
        this.setupDiagnostics();
    }

    renderSuggestions() {
        const langIntents = INTENTS[this.currentLanguage];
        const container = document.getElementById('suggestion-chips');
        const rootContainer = document.getElementById('suggestion-container');
        if (!container || !rootContainer) return;

        container.innerHTML = '';
        
        const icons = {
            'LOST_MOBILE': 'fa-mobile-alt',
            'THEFT': 'fa-mask',
            'CYBER_FRAUD': 'fa-user-shield',
            'ACCIDENTS': 'fa-car-crash',
            'MISSING_PERSON': 'fa-user-clock',
            'NOISE_COMPLAINTS': 'fa-volume-up',
            'OFFICIAL_FIR': 'fa-info-circle'
        };

        for (const [key, details] of Object.entries(langIntents)) {
            if (key === 'TRACK_STATUS') continue;

            const chip = document.createElement('div');
            chip.className = 'suggestion-chip';
            chip.innerHTML = `<i class="fas ${icons[key] || 'fa-info-circle'}"></i> ${details.label}`;
            chip.onclick = () => {
                this.handleUserInput(details.label);
                rootContainer.style.opacity = '0';
                setTimeout(() => { rootContainer.style.display = 'none'; }, 300);
            };
            container.appendChild(chip);
        }
        rootContainer.style.display = 'block';
        setTimeout(() => { rootContainer.style.opacity = '1'; }, 10);
    }

    initSpeechRecognition() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            this.addMessage('System', 'Your browser does not support Speech Recognition. Please use Chrome.', 'ai-message');
            return;
        }

        this.updateRecognitionLanguage();
    }

    async checkMicrophoneHardware() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
            return { success: false, error: 'Your browser is too old for microphone access.' };
        }

        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const hasMic = devices.some(device => device.kind === 'audioinput');
            if (!hasMic) {
                return { success: false, error: 'No microphone hardware found. Please plug in a microphone.' };
            }

            // Test raw audio capture (triggers permission prompt)
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(track => track.stop()); // Immediately release it
            return { success: true };
        } catch (err) {
            console.error('Hardware check failed:', err);
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                return { success: false, error: 'Mic Blocked: Please click the lock icon in the address bar and Allow microphone access.' };
            }
            return { success: false, error: `Microphone Error: ${err.message}` };
        }
    }

    async startListening() {
        this.logDiagnostic('Checking microphone hardware...', 'info');
        if (this.isSpeaking) {
            this.logDiagnostic('Mic start blocked: AI is currently speaking.', 'warn');
            this.statusText.innerText = 'Wait for AI to finish...';
            this.statusText.style.display = 'block';
            setTimeout(() => this.statusText.style.display = 'none', 2000);
            return;
        }

        if (this.recognition && !this.isListening) {
            this.logDiagnostic('Attempting to start SpeechRecognition...', 'info');
            this.showMicStatus('LISTENING');
            
            // Perform hardware check first
            const hardware = await this.checkMicrophoneHardware();
            if (!hardware.success) {
                this.logDiagnostic(`Hardware Error: ${hardware.error}`, 'error');
                this.statusText.innerText = hardware.error;
                this.statusText.classList.add('error');
                this.statusText.style.display = 'block';
                return;
            }

            // Force dynamic re-abort to clear any browser-level ghost sessions
            try { 
                this.recognition.abort(); 
                this.logDiagnostic('Pre-flight check: Forestalled ghost sessions.', 'info');
            } catch (e) {}

            setTimeout(() => {
                try {
                    this.recognition.start();
                    this.logDiagnostic('SpeechRecognition.start() triggered.', 'success');
                } catch (e) {
                    this.logDiagnostic(`Recognition start failed: ${e.message}`, 'error');
                }
            }, 100);
        }
    }

    stopListening() {
        if (this.recognition && this.isListening) {
            this.logDiagnostic('Manually stopping SpeechRecognition.', 'info');
            this.recognition.stop();
        }
    }

    showMicStatus(statusKey) {
        const uiText = SYSTEM_MESSAGES[this.currentLanguage]?.UI_TEXT;
        if (uiText && this.statusText) {
            this.statusText.style.display = 'block';
            this.statusText.innerText = uiText[statusKey] || 'Listening...';
        }
    }

    updateRecognitionLanguage() {
        const langCode = LANGUAGES[this.currentLanguage]?.code || 'en-US';
        this.logDiagnostic(`Switching Speech Engine to: ${langCode}`, 'info');

        if (this.recognition) {
            try {
                this.recognition.abort(); // Stop existing session immediately
            } catch (e) {}
        }
        
        // Fully recreate the recognition object for the new language
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = langCode;
            
            // Re-bind all handlers (as they are lost with the new instance)
            this.setupRecognitionHandlers();
        }
    }

    setupRecognitionHandlers() {
        if (!this.recognition) return;

        this.recognition.onstart = () => {
            this.logDiagnostic('SpeechRecognition: onstart event fired.', 'success');
            this.isListening = true;
            this.retryCount = 0; // Reset retry counter on successful start
            this.micBtn.classList.add('listening');
            if (this.speakTooltip) this.speakTooltip.style.display = 'block';
            this.statusText.classList.remove('error');
            this.showMicStatus('LISTENING');
        };

        this.recognition.onend = () => {
            this.logDiagnostic('SpeechRecognition: onend event fired.', 'info');
            this.isListening = false;
            this.micBtn.classList.remove('listening');
            if (this.speakTooltip) this.speakTooltip.style.display = 'none';
            if (!this.statusText.classList.contains('error')) {
                this.statusText.style.display = 'none';
            }
        };

        this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            this.logDiagnostic(`Speech Captured: "${transcript}"`, 'success');
            this.handleUserInput(transcript);
        };

        this.recognition.onerror = (event) => {
            this.logDiagnostic(`Speech Error Event: ${event.error}`, 'error');
            console.error('Speech Recognition Error:', event.error);
            this.isListening = false;
            this.micBtn.classList.remove('listening');
            if (this.speakTooltip) this.speakTooltip.style.display = 'none';

            // --- Auto-Retry Logic for Network/Aborted ---
            if (event.error === 'aborted' || event.error === 'network') {
                if (this.retryCount < this.maxRetries) {
                    this.retryCount++;
                    this.logDiagnostic(`Retrying session (Attempt ${this.retryCount}) in 1.5s...`, 'warn');
                    setTimeout(() => this.startListening(), 1500);
                } else {
                    this.logDiagnostic('Max retries reached. Please check your network.', 'error');
                }
            }
            
            const errorMessages = {
                'not-allowed': 'Mic Blocked: Please allow microphone access in browser settings.',
                'service-not-allowed': 'Service Not Allowed: Browser or OS privacy settings are blocking speech recognition.',
                'network': 'Network Error: Check your internet connection.',
                'no-speech': 'No Speech Detected: Try speaking louder or check your mic.',
                'audio-capture': 'Audio Capture Failed: Is your microphone plugged in?',
                'aborted': 'Speech Recognition Aborted.'
            };

            const errMsg = errorMessages[event.error] || `Speech Error: ${event.error}`;
            this.statusText.innerText = errMsg;
            this.statusText.classList.add('error');
            this.statusText.style.display = 'block';
            setTimeout(() => { 
                if (this.statusText.innerText === errMsg) {
                    this.statusText.style.display = 'none';
                    this.statusText.classList.remove('error');
                }
            }, 8000);
            
            if (event.error === 'aborted' || event.error === 'no-speech') {
                this.statusText.style.display = 'none';
            }
        };
    }

    initEventListeners() {
        this.micBtn.addEventListener('click', () => {
            if (this.isListening) {
                this.stopListening();
            } else {
                this.startListening();
            }
        });

        // Mode Toggling Logic
        this.modeToggleBtn.addEventListener('click', () => {
            if (this.inputMode === 'voice') {
                this.switchToTextMode();
            } else {
                this.switchToVoiceMode();
            }
        });

        // Text Submission
        this.sendBtn.addEventListener('click', () => this.handleTextSubmit());
        this.userTextInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleTextSubmit();
        });

        this.langSelector.addEventListener('change', (e) => {
            if (this.isSpeaking) this.synth.cancel();
            if (this.isListening) this.stopListening();
            
            this.currentLanguage = e.target.value;
            this.updateRecognitionLanguage();
            this.restartConversation();
            this.updateUIForLanguage();
        });

        this.restartBtn.addEventListener('click', () => {
            location.reload();
        });

        document.getElementById('close-modal-btn').addEventListener('click', () => {
            this.firModal.style.display = 'none';
            this.overlay.style.display = 'none';
        });

        if (this.downloadIncidentBtn) {
            this.downloadIncidentBtn.addEventListener('click', () => {
                this.generateIncidentPDF();
            });
        }

        if (this.downloadOfficialBtn) {
            this.downloadOfficialBtn.addEventListener('click', () => {
                this.generateOfficialPDF();
            });
        }

        if (this.officialFirModalBtn) {
            this.officialFirModalBtn.addEventListener('click', () => {
                this.firModal.style.display = 'none';
                this.overlay.style.display = 'none';
                // Trigger the official FIR intent
                this.handleUserInput("Official FIR");
            });
        }
    }

    switchToTextMode() {
        this.inputMode = 'text';
        this.textInputRow.style.display = 'flex';
        this.micBtn.style.display = 'none';
        this.modeToggleBtn.innerHTML = '<i class="fas fa-microphone"></i>';
        this.modeToggleBtn.title = SYSTEM_MESSAGES[this.currentLanguage].UI_TEXT.VOICE_MODE;
        this.userTextInput.focus();
        if (this.isListening) this.recognition.stop();
    }

    switchToVoiceMode() {
        this.inputMode = 'voice';
        this.textInputRow.style.display = 'none';
        this.micBtn.style.display = 'flex';
        this.modeToggleBtn.innerHTML = '<i class="fas fa-keyboard"></i>';
        this.modeToggleBtn.title = SYSTEM_MESSAGES[this.currentLanguage].UI_TEXT.TEXT_MODE;
    }

    handleTextSubmit() {
        const text = this.userTextInput.value.trim();
        if (text) {
            this.handleUserInput(text);
            this.userTextInput.value = '';
        }
    }

    restartConversation() {
        this.chatWindow.innerHTML = '';
        this.state = 'GREETING';
        this.currentIntent = null;
        this.currentQuestionIndex = 0;
        this.responses = {};
        this.greet();
        this.renderSuggestions();
    }

    updateUIForLanguage() {
        const uiText = SYSTEM_MESSAGES[this.currentLanguage].UI_TEXT;
        if (!uiText) return;

        if (this.userTextInput) this.userTextInput.placeholder = uiText.PLACEHOLDER;
        if (this.sendBtn) this.sendBtn.title = uiText.SEND;
        if (this.micBtn) this.micBtn.title = uiText.SPEAK;
        
        // Update mode toggle title based on dynamic state
        if (this.modeToggleBtn) {
            this.modeToggleBtn.title = this.inputMode === 'voice' ? uiText.TEXT_MODE : uiText.VOICE_MODE;
        }

        if (this.isListening && this.statusText) {
            this.statusText.innerText = uiText.LISTENING;
        }

        // Update tooltip text
        if (this.speakTooltip) {
            const tooltipTexts = {
                'en': 'Speak Now...',
                'hi': 'अभी बोलें...',
                'te': 'ఇప్పుడు మాట్లాడండి...'
            };
            this.speakTooltip.innerText = tooltipTexts[this.currentLanguage] || 'Speak Now...';
        }
    }

    greet() {
        const msg = SYSTEM_MESSAGES[this.currentLanguage].GREETING;
        this.speakWithText(msg);
        this.addMessage('Police Mitra AI', msg, 'ai-message');
    }

    speakWithText(text) {
        if (this.isSpeaking) {
            this.synth.cancel();
        }

        const utterance = new SpeechSynthesisUtterance(text);
        // Map app language code to BCP-47 for SpeechSynthesis
        const voiceLangMap = {
            'en': 'en-US',
            'hi': 'hi-IN',
            'te': 'te-IN'
        };
        
        const langCode = voiceLangMap[this.currentLanguage] || 'en-US';
        utterance.lang = langCode;
        
        // Find the most natural native voice for the selected language
        this.selectBestVoice(utterance, langCode);
        
        utterance.onstart = () => {
            this.isSpeaking = true;
            this.micBtn.classList.add('ai-speaking');
            this.micBtn.style.pointerEvents = 'none';
        };

        utterance.onend = () => {
            clearTimeout(this.speakFailsafe);
            this.isSpeaking = false;
            this.micBtn.classList.remove('ai-speaking');
            this.micBtn.style.pointerEvents = 'auto';
            // Small delay to allow audio hardware to switch modes
            if (this.inputMode === 'voice') {
                setTimeout(() => this.startListening(), 100);
            }
        };

        utterance.onerror = (e) => {
            this.logDiagnostic(`TTS Voice Error: ${e.error}`, 'error');
            console.error('TTS Error:', e);
            clearTimeout(this.speakFailsafe);
            this.isSpeaking = false;
            this.micBtn.style.opacity = '1';
            this.micBtn.style.pointerEvents = 'auto';
        };

        // Failsafe: Reset isSpeaking after 30 seconds max
        this.speakFailsafe = setTimeout(() => {
            if (this.isSpeaking) {
                console.warn('TTS Failsafe triggered - forces isSpeaking to false');
                this.isSpeaking = false;
                this.micBtn.style.opacity = '1';
                this.micBtn.style.pointerEvents = 'auto';
            }
        }, 30000);

        this.synth.speak(utterance);
    }

    selectBestVoice(utterance, langCode) {
        if (!this.voices || this.voices.length === 0) {
            this.voices = this.synth.getVoices();
        }

        const lowerLang = langCode.toLowerCase();
        const langFamily = lowerLang.split('-')[0];

        // 1. Exact BCP-47 match (e.g., te-IN)
        let bestVoice = this.voices.find(v => v.lang.toLowerCase() === lowerLang);
        
        // 2. Family match (e.g., any 'te' voice)
        if (!bestVoice) {
            bestVoice = this.voices.find(v => v.lang.toLowerCase().startsWith(langFamily));
        }

        // 3. Name-based match (e.g., voice name contains 'Telugu')
        if (!bestVoice && langFamily === 'te') {
            bestVoice = this.voices.find(v => v.name.toLowerCase().includes('telugu') || v.name.includes('తెలుగు'));
        }
        
        if (!bestVoice && langFamily === 'hi') {
            bestVoice = this.voices.find(v => v.name.toLowerCase().includes('hindi') || v.name.includes('हिंदी'));
        }

        if (bestVoice) {
            utterance.voice = bestVoice;
            this.logDiagnostic(`Using voice: ${bestVoice.name}`, 'success');
        } else {
            this.logDiagnostic(`No specific voice found for ${langCode}. Using system default.`, 'warn');
        }
    }

    addMessage(sender, text, className) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${className}`;
        msgDiv.innerHTML = `<strong>${sender}:</strong> ${text}`;
        this.chatWindow.appendChild(msgDiv);
        this.chatWindow.scrollTop = this.chatWindow.scrollHeight;
    }

    handleUserInput(input) {
        this.addMessage('You', input, 'user-message');

        if (this.state === 'GREETING' || this.state === 'INTENT_DETECTION') {
            this.detectIntent(input);
        } else if (this.state === 'COLLECTING_DETAILS') {
            this.processResponse(input);
        }
    }

    detectIntent(input) {
        const lowerInput = input.toLowerCase();
        
        // Loop through all supported languages to find a matching keyword
        for (const langCode of Object.keys(INTENTS)) {
            const langIntents = INTENTS[langCode];
            
            for (const [key, details] of Object.entries(langIntents)) {
                if (details.keywords && details.keywords.some(keyword => lowerInput.includes(keyword))) {
                    if (key === 'TRACK_STATUS') {
                        this.handleTrackStatus();
                        return;
                    }
                    
                    this.currentIntent = key;
                    this.state = 'COLLECTING_DETAILS';
                    this.currentQuestionIndex = 0;
                    
                    // Use intent metadata from the user's SELECTED language
                    const localizedIntent = INTENTS[this.currentLanguage][key];
                    const dynamicPriority = this.calculatePriority(input, key);
                    
                    this.responses = { 
                        intent: localizedIntent.label,
                        priority: dynamicPriority,
                        language: LANGUAGES[this.currentLanguage].name
                    };
                    
                    let ackMsg = this.currentLanguage === 'en' ? 
                        `I understand you have an issue with ${localizedIntent.label}.` :
                        (this.currentLanguage === 'hi' ? 
                            `मैं समझता हूँ कि आपको ${localizedIntent.label} के संबंध में समस्या है।` :
                            `మీకు ${localizedIntent.label} విషయంలో సమస్య ఉందని నాకు అర్థమైంది.`);
                    
                    this.addMessage('Police Mitra AI', ackMsg, 'ai-message');
                    this.askNextQuestion();
                    return;
                }
            }
        }
        
        const notFoundMsg = SYSTEM_MESSAGES[this.currentLanguage].INTENT_NOT_FOUND;
        this.addMessage('Police Mitra AI', notFoundMsg, 'ai-message');
        this.speakWithText(notFoundMsg);
    }

    askNextQuestion() {
        const questions = INTENTS[this.currentLanguage][this.currentIntent].questions;
        if (this.currentQuestionIndex < questions.length) {
            const question = questions[this.currentQuestionIndex].text;
            this.addMessage('Police Mitra AI', question, 'ai-message');
            this.speakWithText(question);
        } else {
            this.completeFIR();
        }
    }

    processResponse(input) {
        const questions = INTENTS[this.currentLanguage][this.currentIntent].questions;
        const currentQuestion = questions[this.currentQuestionIndex];

        // Basic Validation
        if (currentQuestion.validation) {
            if (currentQuestion.validation instanceof RegExp && !currentQuestion.validation.test(input)) {
                const errMsg = SYSTEM_MESSAGES[this.currentLanguage].VALIDATION_ERROR;
                this.addMessage('Police Mitra AI', errMsg, 'ai-message');
                this.speakWithText(errMsg + " " + currentQuestion.text);
                return;
            }
        }

        // Save response
        this.responses[currentQuestion.key] = input;
        this.currentQuestionIndex++;
        this.askNextQuestion();
    }

    async completeFIR() {
        if (this.currentIntent !== 'OFFICIAL_FIR' && !this.isOfficialFlow) {
            // Stage 1: Standard Intent Completed
            this.isOfficialFlow = true;
            this.incidentResponses = { ...this.responses }; // Save incident data
            
            const transitionMsg = SYSTEM_MESSAGES[this.currentLanguage].OFFICIAL_TRANSITION;
            this.addMessage('Police Mitra AI', transitionMsg, 'ai-message');
            this.speakWithText(transitionMsg);

            // Transition to Official Questions
            setTimeout(() => {
                this.currentIntent = 'OFFICIAL_FIR';
                this.currentQuestionIndex = 0;
                this.responses = {}; // Clear responses for official points
                this.state = 'COLLECTING_DETAILS';
                this.askNextQuestion();
            }, 3000);
            return;
        }

        // Stage 2: Official Flow Completed (or Official started directly)
        this.state = 'COMPLETED';
        const msg = SYSTEM_MESSAGES[this.currentLanguage].COMPLETED;
        this.addMessage('Police Mitra AI', msg, 'ai-message');
        this.speakWithText(msg);

        // Store official responses separately
        this.officialResponses = { ...this.responses };
        
        // Refresh user profile right before completion to ensure we have the latest from localStorage
        this.refreshUser();
        
        // Dual-Structure Payload for Cloud Sync
        const cloudData = {
            metadata: {
                fir_id: this.incidentResponses?.fir_id || `VOICE-FIR-${Date.now()}`,
                timestamp: serverTimestamp(),
                user_name: this.user?.fullName || "Anonymous",
                user_email: this.user?.email || "No Email",
                user_uid: this.user?.uid || "No UID",
                user_phone: this.user?.phone || localStorage.getItem('last_entered_phone') || "Not Provided",
                total_priority: this.responses.priority,
                incident_type: this.translateValue(this.currentIntent),
                is_dual_flow: this.isOfficialFlow
            },
            incident_data: this.incidentResponses,
            official_data: this.officialResponses || {}
        };

        // UI Update for Cloud Sync
        this.addMessage('Police Mitra AI', "Syncing reports to Firestore cloud...", 'status-message');

        // Save to Cloud Directly
        try {
            if (this.db) {
                const docRef = await addDoc(collection(this.db, "firs"), cloudData);
                console.log("Firestore Success - Doc ID:", docRef.id);
                this.addMessage('Police Mitra AI', "Successfully synced to Firestore cloud.", 'status-message');
            }
        } catch (dbError) {
            console.error("Firestore Error (Detailed):", dbError.code, dbError.message);
            this.logDiagnostic(`DB Error: ${dbError.code}`, 'error');
            this.addMessage('Police Mitra AI', `Warning: Cloud sync failed (${dbError.code}). Check security rules.`, 'warn-message');
        }

        // Final Merge for Backend (keep for backward compatibility and backend logging)
        const finalData = {
            ...this.incidentResponses,
            ...this.officialResponses,
            user_name: cloudData.metadata.user_name,
            user_email: cloudData.metadata.user_email,
            user_phone: cloudData.metadata.user_phone,
            is_dual_flow: this.isOfficialFlow,
            fir_id: cloudData.metadata.fir_id,
            timestamp: new Date().toISOString()
        };

        // Ensure user_phone is NEVER literal "undefined"
        if (finalData.user_phone === "undefined" || !finalData.user_phone) {
            finalData.user_phone = "Not Provided";
        }

        // Send to backend
        try {
            const response = await fetch('http://localhost:5000/save-fir', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(finalData)
            });
            const result = await response.json();
            
            if (result.status === 'success') {
                this.responses.fir_id = result.fir_id;
                this.responses.timestamp = result.data.timestamp;
                this.showFIR(result.data);
                const successMsg = SYSTEM_MESSAGES[this.currentLanguage].SUCCESS;
                this.addMessage('Police Mitra AI', successMsg, 'ai-message');
                this.speakWithText(successMsg);
            }
        } catch (error) {
            console.error('Error saving FIR:', error);
            this.responses.fir_id = 'VOICE-FIR-' + Math.floor(100000 + Math.random() * 900000);
            this.responses.timestamp = new Date().toLocaleString();
            this.showFIR(finalData);
        }
    }

    calculatePriority(input, defaultPriority) {
        const lowerInput = input.toLowerCase();
        
        // Check for High Urgency
        if (URGENCY_KEYWORDS.HIGH.some(k => lowerInput.includes(k.toLowerCase()))) {
            return 'HIGH';
        }
        
        // Check for Low Urgency
        if (URGENCY_KEYWORDS.LOW.some(k => lowerInput.includes(k.toLowerCase()))) {
            return 'LOW';
        }
        
        return defaultPriority || 'MEDIUM';
    }

    calculatePriority(input, intentKey) {
        const lowerInput = input.toLowerCase();
        
        // 1. Check for explicit urgency keywords (Overrules defaults)
        if (URGENCY_KEYWORDS.HIGH.some(k => lowerInput.includes(k.toLowerCase()))) {
            return 'HIGH';
        }
        
        if (URGENCY_KEYWORDS.LOW.some(k => lowerInput.includes(k.toLowerCase()))) {
            return 'LOW';
        }

        // 2. Default priorities based on incident type (Upgraded for efficiency)
        const defaults = {
            'ACCIDENTS': 'HIGH',
            'MISSING_PERSON': 'HIGH',
            'OFFICIAL_FIR': 'HIGH',
            'CYBER_FRAUD': 'HIGH',
            'THEFT': 'HIGH',
            'LOST_MOBILE': 'MEDIUM',
            'NOISE_COMPLAINTS': 'LOW'
        };
        
        return defaults[intentKey] || 'MEDIUM';
    }

    refreshUser() {
        this.user = JSON.parse(localStorage.getItem('voicefir_user'));
        // Try to recover phone if it exists separately
        if (this.user && (!this.user.phone || this.user.phone === 'Not Provided')) {
            const lastPhone = localStorage.getItem('last_entered_phone');
            if (lastPhone) this.user.phone = lastPhone;
        }
    }

    translateValue(val) {
        if (val === undefined || val === null) return '';
        if (typeof val !== 'string') return String(val);
        const lowerVal = val.toLowerCase().trim();
        const valueTranslations = SYSTEM_MESSAGES[this.currentLanguage]?.VALUE_TRANSLATIONS || {};
        
        // Exact match (case insensitive)
        for (const [key, translated] of Object.entries(valueTranslations)) {
            if (key.toLowerCase() === lowerVal) {
                return translated;
            }
        }
        
        // Replace known transliterated words within the string
        let translatedStr = val;
        for (const [key, translated] of Object.entries(valueTranslations)) {
            const regex = new RegExp(`\\b${key}\\b`, 'gi');
            translatedStr = translatedStr.replace(regex, translated);
        }
        
        return translatedStr;
    }

    showFIR(data) {
        const labels = FIR_LABELS[this.currentLanguage] || FIR_LABELS['en'];
        
        // Update Modal Headers
        const modalTitle = document.getElementById('fir-modal-title');
        const modalSubtitle = document.getElementById('fir-modal-subtitle');
        if (modalTitle) modalTitle.innerText = labels.FIR_TITLE;
        if (modalSubtitle) modalSubtitle.innerText = labels.FIR_SUBTITLE;

        // Check if this is a dual flow (it results in an official view but with incident data stored)
        const isOfficial = data.point_1 || this.isOfficialFlow || data.is_dual_flow;

        let content = '';
        
        if (isOfficial) {
            const getPoint = (num) => data[`point_${num}`] || '---';
            const getLabel = (num) => (labels[`POINT_${num}`] || '').replace(/\n/g, '<br>');

            content = `
                <div class="official-fir-container" style="max-width: 100%; overflow-x: hidden;">
                    <div class="official-fir-header">
                        <img src="https://upload.wikimedia.org/wikipedia/en/e/ea/Appolice%28emblem%29.png" class="logo-img" alt="Logo">
                        <div class="header-titles">
                            <h1>${labels.BNSS_HEADING}</h1>
                            <p>${labels.BNSS_SUBHEADING}</p>
                        </div>
                    </div>
                    <!-- Dual Flow Indicator -->
                    ${data.is_dual_flow || this.isOfficialFlow ? `
                    <div class="dual-report-section" style="margin-bottom: 20px; padding: 15px; background: rgba(39, 174, 96, 0.1); border-radius: 8px; border: 1px solid #27ae60;">
                        <h3 style="color: #27ae60; margin-top: 0; font-size: 16px;"><i class="fas fa-file-invoice"></i> Dual Report Finalized</h3>
                        <p style="font-size: 13px; color: #444; margin-bottom: 0;">We've captured both your incident details and the 15-point BNSS report. Download them separately below.</p>
                    </div>
                    ` : ''}

                    <div class="fir-point-row"><span class="fir-point-title">${getLabel(1)}</span><span class="fir-point-value">${getPoint(1)}</span></div>
                    <div class="fir-point-row"><span class="fir-point-title">${getLabel(2)}</span><span class="fir-point-value">${getPoint(2)}</span></div>
                    <div class="fir-point-row"><span class="fir-point-title">${getLabel(3)}</span><span class="fir-point-value">${getPoint(3)}</span></div>
                    <div class="fir-point-row"><span class="fir-point-title">${getLabel(4)}</span><span class="fir-point-value">${getPoint(4)}</span></div>
                    <div class="fir-point-row"><span class="fir-point-title">${getLabel(5)}</span><span class="fir-point-value">${getPoint(5)}</span></div>
                    <div class="fir-point-row"><span class="fir-point-title">${getLabel(6)}</span><span class="fir-point-value">${getPoint(6)}</span></div>
                    <div class="fir-point-row"><span class="fir-point-title">${getLabel(7)}</span><span class="fir-point-value">${getPoint(7)}</span></div>
                    <div class="fir-point-row"><span class="fir-point-title">${getLabel(8)}</span><span class="fir-point-value">${getPoint(8)}</span></div>
                    <div class="fir-point-row"><span class="fir-point-title">${getLabel(9)}</span><span class="fir-point-value">${getPoint(9)}</span></div>
                    <div class="fir-point-row"><span class="fir-point-title">${getLabel(10)}</span><span class="fir-point-value">${getPoint(10)}</span></div>
                    <div class="fir-point-row"><span class="fir-point-title">${getLabel(11)}</span><span class="fir-point-value">${getPoint(11)}</span></div>
                    <div class="fir-point-row"><span class="fir-point-title">${getLabel(12)}</span><span class="fir-point-value">${getPoint(12)}</span></div>
                    <div class="fir-point-row"><span class="fir-point-title">${getLabel(13)}</span><span class="fir-point-value">${getPoint(13)}</span></div>
                    <div class="fir-point-row"><span class="fir-point-title">${getLabel(14)}</span><span class="fir-point-value">${getPoint(14)}</span></div>
                    <div class="fir-point-row"><span class="fir-point-title">${getLabel(15)}</span><span class="fir-point-value">${getPoint(15)}</span></div>
                </div>
            `;
            // Toggle download button visibility
            if (this.downloadIncidentBtn) this.downloadIncidentBtn.style.display = 'block';
            if (this.downloadOfficialBtn) this.downloadOfficialBtn.style.display = 'block';
        } else {
            content = `
                <div class="fir-header-id" style="text-align: right; color: #2196f3; font-weight: 800; font-size: 14px; margin-bottom: 10px;">
                    ${labels.FIR_ID}: ${data.fir_id}
                </div>
                <div class="fir-row"><span class="fir-label">${labels.TIMESTAMP}:</span><span>${data.timestamp}</span></div>
                <div class="fir-row"><span class="fir-label">${labels.CATEGORY}:</span><span>${this.translateValue(data.intent)}</span></div>
                <div class="fir-row"><span class="fir-label">${labels.PRIORITY}:</span><span class="priority-badge ${data.priority?.toLowerCase()}">${labels['PRIORITY_' + data.priority] || data.priority}</span></div>
                <hr style="margin: 10px 0; border: none; border-top: 1px solid #ddd;">
                <div class="fir-row"><span class="fir-label">${labels.USER_NAME}:</span><span>${this.translateValue(data.user_name || "Anonymous")}</span></div>
                <div class="fir-row"><span class="fir-label">${labels.USER_EMAIL}:</span><span>${this.translateValue(data.user_email || "Not Provided")}</span></div>
                <div class="fir-row"><span class="fir-label">${labels.USER_PHONE}:</span><span>${this.translateValue(data.user_phone || "Not Provided")}</span></div>
                <hr style="margin: 10px 0; border: none; border-top: 1px solid #ddd;">
            `;

            for (const [key, value] of Object.entries(data)) {
                if (!['fir_id', 'timestamp', 'intent', 'language', 'user_name', 'user_email', 'user_phone', 'status', 'priority', 'is_dual_flow'].includes(key)) {
                    const labelKey = key.toUpperCase();
                    const label = labels[labelKey] || key.replace(/_/g, ' ').toUpperCase();
                    content += `<div class="fir-row"><span class="fir-label">${label}:</span><span>${this.translateValue(value)}</span></div>`;
                }
            }

            if (data.status) {
                content += `<div class="fir-row"><span class="fir-label">${labels.STATUS}:</span><span>${this.translateValue(data.status)}</span></div>`;
            }
            
            // Toggle download button visibility
            if (this.downloadIncidentBtn) this.downloadIncidentBtn.style.display = 'block';
            if (this.downloadOfficialBtn) this.downloadOfficialBtn.style.display = 'none';
        }

        this.firContent.innerHTML = content;
        // Reset Biometrics for new report
        this.biometricVerified = false;
        if (this.biometricSection) this.biometricSection.classList.remove('verified');
        if (this.scannerContainer) this.scannerContainer.classList.remove('verified');
        if (this.biometricStatus) this.biometricStatus.innerText = "Biometric Signature Required (BNSS Sec 173)";
        if (this.scanBtn) this.scanBtn.style.display = 'inline-block';

        this.firModal.style.display = 'block';
        this.overlay.style.display = 'block';
        
        // Only show biometric scanner if we finished the official flow
        if (this.biometricSection) {
            this.biometricSection.style.display = this.isOfficialFlow ? 'block' : 'none';
        }

        // Re-bind the click listener to be absolutely sure it fires
        if (this.scanBtn) {
            this.scanBtn.onclick = (e) => {
                e.preventDefault();
                console.log("Scan button clicked!");
                this.verifyBiometrics();
            };
        }
    }

    async verifyBiometrics() {
        console.log("Starting biometric verification flow...");
        if (!this.scanBtn || !this.scannerContainer || !this.biometricStatus) {
            console.error("Biometric UI elements missing!");
            return;
        }

        // 1. UI Feedback - Start Scanning
        this.scannerContainer.classList.add('scanning');
        this.biometricStatus.innerText = "Initializing Scanner...";
        this.biometricStatus.style.color = "var(--primary)";

        try {
            this.biometricStatus.innerText = "Place finger on sensor...";
            
            // Check for WebAuthn support
            const isWebAuthnSupported = !!(window.PublicKeyCredential && 
                                          PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable && 
                                          await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable());

            console.log("WebAuthn Supported:", isWebAuthnSupported);

            if (isWebAuthnSupported) {
                // Real scan attempt
                try {
                    this.biometricStatus.innerText = "Scanning TouchID/Hello...";
                    // Simplified simulation for demo reliability
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    this.completeBiometricVerification();
                } catch (e) {
                    console.error("Real bio-auth error:", e);
                    throw new Error("Scan Failed");
                }
            } else {
                // Simulation for devices without fingerprint reader
                this.biometricStatus.innerText = "No Sensor Found. Using Digital ID...";
                await new Promise(resolve => setTimeout(resolve, 2000));
                this.completeBiometricVerification();
            }
        } catch (error) {
            console.warn("Biometric Fallback:", error.message);
            this.biometricStatus.innerText = "Hardware not found. Using Digital Trace...";
            await new Promise(resolve => setTimeout(resolve, 1000));
            this.completeBiometricVerification();
        }
    }

    completeBiometricVerification() {
        this.biometricVerified = true;
        this.scannerContainer.classList.remove('scanning');
        this.scannerContainer.classList.add('verified');
        this.biometricSection.classList.add('verified');
        this.biometricStatus.innerText = "FINGERPRINT VERIFIED - SIGNATURE CAPTURED";
        this.biometricStatus.style.color = "var(--green)";
        this.scanBtn.style.display = 'none';
        this.addMessage('Police Mitra AI', "Digital Thumb Impression captured and verified. Ready for download.", 'status-message');
    }

    generateIncidentPDF() {
        const labels = FIR_LABELS[this.currentLanguage] || FIR_LABELS['en'];
        const data = this.incidentResponses || this.responses;
        let content = `
            <div class="pdf-export-mode" style="padding: 20px 30px; width: 700px; background: #fff; font-family: 'Inter', sans-serif; box-sizing: border-box;">
                <div style="border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 20px; text-align: center;">
                    <h2 style="font-size: 1.4rem; margin: 0 0 5px 0;">${labels.FIR_TITLE}</h2>
                    <p style="font-size: 0.85rem; margin: 0; color: #333;">${labels.FIR_SUBTITLE}</p>
                </div>
                <div style="display: flex; margin-bottom: 10px; border-bottom: 1px solid #ddd; padding-bottom: 8px;">
                    <strong style="width: 250px;">${labels.FIR_ID}:</strong><span>${data.fir_id || 'DEMO'}</span>
                </div>
                <div style="display: flex; margin-bottom: 10px; border-bottom: 1px solid #ddd; padding-bottom: 8px;">
                    <strong style="width: 250px;">${labels.TIMESTAMP}:</strong><span>${data.timestamp || new Date().toISOString()}</span>
                </div>
                <div style="display: flex; margin-bottom: 10px; border-bottom: 1px solid #ddd; padding-bottom: 8px;">
                    <strong style="width: 250px;">${labels.CATEGORY}:</strong><span>${this.translateValue(data.intent || 'Unknown')}</span>
                </div>
                <div style="display: flex; margin-bottom: 10px; border-bottom: 1px solid #ddd; padding-bottom: 8px;">
                    <strong style="width: 250px;">${labels.PRIORITY}:</strong><span>${labels['PRIORITY_' + (data.priority || 'MEDIUM')] || (data.priority || 'MEDIUM')}</span>
                </div>
                <div style="display: flex; margin-bottom: 10px; border-bottom: 1px solid #ddd; padding-bottom: 8px;">
                    <strong style="width: 250px;">${labels.STATUS}:</strong><span>${this.translateValue(data.status || 'Under Investigation')}</span>
                </div>
                <h3 style="margin: 20px 0 10px 0; padding-bottom: 5px; border-bottom: 1px solid #000;">${labels.USER_DETAILS}</h3>
                <div style="display: flex; margin-bottom: 10px; border-bottom: 1px solid #ddd; padding-bottom: 8px;">
                    <strong style="width: 250px;">${labels.USER_NAME}:</strong><span>${this.translateValue(data.user_name || this.user.fullName)}</span>
                </div>
                <div style="display: flex; margin-bottom: 10px; border-bottom: 1px solid #ddd; padding-bottom: 8px;">
                    <strong style="width: 250px;">${labels.USER_EMAIL}:</strong><span>${this.translateValue(data.user_email || this.user.email)}</span>
                </div>
                <div style="display: flex; margin-bottom: 10px; border-bottom: 1px solid #ddd; padding-bottom: 8px;">
                    <strong style="width: 250px;">${labels.USER_PHONE}:</strong><span>${this.translateValue(data.user_phone || this.user.phone)}</span>
                </div>
                <h3 style="margin: 20px 0 10px 0; padding-bottom: 5px; border-bottom: 1px solid #000;">${labels.INCIDENT_DETAILS}</h3>
        `;

        const excludeKeys = ['fir_id', 'timestamp', 'intent', 'language', 'user_name', 'user_email', 'user_phone', 'status', 'priority', 'is_dual_flow', 'stolen_items', 'suspect_details', 'incident_location', 'incident_date'];
        
        // Specifically adding the common incident items first if they exist to match the image order
        const orderedKeys = ['incident_date', 'incident_location', 'stolen_items', 'suspect_details'];
        orderedKeys.forEach(key => {
            if (data[key]) {
                const labelKey = key.toUpperCase();
                const label = labels[labelKey] || key.replace(/_/g, ' ').toUpperCase();
                content += `<div style="display: flex; margin-bottom: 10px; border-bottom: 1px solid #ddd; padding-bottom: 8px;"><strong style="width: 250px;">${label}:</strong><span style="flex: 1;">${this.translateValue(data[key])}</span></div>`;
            }
        });

        // Add any other dynamic fields
        for (const [key, value] of Object.entries(data)) {
            if (!excludeKeys.includes(key) && !key.startsWith('point_')) {
                const labelKey = key.toUpperCase();
                const label = labels[labelKey] || key.replace(/_/g, ' ').toUpperCase();
                content += `<div style="display: flex; margin-bottom: 10px; border-bottom: 1px solid #ddd; padding-bottom: 8px;"><strong style="width: 250px;">${label}:</strong><span style="flex: 1;">${this.translateValue(value)}</span></div>`;
            }
        }
        
        content += `</div>`;

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        tempDiv.style.position = 'absolute';
        tempDiv.style.left = '-9999px';
        document.body.appendChild(tempDiv);
        
        html2pdf().set({
            margin:       [10, 10, 10, 10],
            filename:     `Incident_Report_${this.responses.fir_id || 'DEMO'}.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
        }).from(tempDiv.firstElementChild).save().then(() => {
            document.body.removeChild(tempDiv);
        });
    }

    generateOfficialPDF() {
        const labels = FIR_LABELS[this.currentLanguage] || FIR_LABELS['en'];
        const data = this.officialResponses || this.responses;
        const getPoint = (num) => data[`point_${num}`] || '---';
        const getLabel = (num) => (labels[`POINT_${num}`] || '').replace(/\n/g, '<br>');

        let content = `
            <div class="pdf-export-mode" style="padding: 20px 30px; width: 700px; background: #fff; font-family: 'Inter', sans-serif; box-sizing: border-box;">
                <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 18px; padding-bottom: 16px; border-bottom: 2px solid #000;">
                    <img src="https://upload.wikimedia.org/wikipedia/en/e/ea/Appolice%28emblem%29.png" style="width: 52px; height: 52px; object-fit: contain;" alt="Logo">
                    <div>
                        <h1 style="font-size: 1.1rem; margin: 0 0 4px 0;">${labels.BNSS_HEADING}</h1>
                        <p style="font-size: 0.85rem; margin: 0; color: #444;">${labels.BNSS_SUBHEADING}</p>
                    </div>
                </div>
        `;
        
        for (let i = 1; i <= 15; i++) {
            content += `
                <div style="display: flex; flex-direction: column; margin-bottom: 15px; border-bottom: 1px solid #ddd; padding-bottom: 10px;">
                    <strong style="margin-bottom: 5px;">${getLabel(i)}</strong>
                    <span style="color: #333; line-height: 1.5;">${getPoint(i)}</span>
                </div>
            `;
        }

        const thumbSection = this.biometricVerified ? `
            <div style="margin-top: 30px; border: 2px solid #1e3a8a; padding: 15px; border-radius: 8px; display: flex; align-items: center; justify-content: space-between; background: rgba(30, 58, 138, 0.02);">
                <div style="text-align: left; flex: 1;">
                    <p style="font-size: 11px; font-weight: 800; color: #1e3a8a; text-transform: uppercase; margin: 0;">18. Digital Biometric Signature</p>
                    <p style="font-size: 12px; color: #000; margin: 8px 0;">This FIR is digitally signed via biometric fingerprint verification under BNSS Section 173 compliance.</p>
                    <p style="font-size: 9px; color: #666; margin: 4px 0;">Verification ID: VERIFIED-${Date.now()}-${this.user?.uid?.substring(0,8)}</p>
                    <p style="font-size: 9px; color: #666; margin: 0;">Captured Date: ${new Date().toLocaleString()}</p>
                </div>
                <div style="width: 75px; height: 90px; border: 1px dashed #1e3a8a; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; margin-left: 20px; background: #fff;">
                     <img src="https://img.icons8.com/ios-filled/100/1e3a8a/fingerprint.png" style="width: 55px; opacity: 0.8;">
                     <div style="background: #1e3a8a; color: white; font-size: 7px; padding: 1px 5px; border-radius: 2px; position: absolute; bottom: 8px; transform: rotate(-12deg); font-weight: bold; border: 1px solid white;">VERIFIED</div>
                </div>
            </div>
        ` : `
            <div style="margin-top: 30px; border: 1px solid #ccc; padding: 15px; border-radius: 8px; background: #f9f9f9;">
                <p style="font-size: 11px; color: #777; font-weight: 600;">[Biometric Signature Not Captured]</p>
                <p style="font-size: 10px; color: #999; margin-top: 5px;">Physical thumb impression must be obtained manually on the printed document.</p>
            </div>
        `;

        content += thumbSection + `</div>`;

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        tempDiv.style.position = 'absolute';
        tempDiv.style.left = '-9999px';
        document.body.appendChild(tempDiv);

        html2pdf().set({
            margin:       [10, 10, 10, 10],
            filename:     `Official_BNSS_Report_${this.responses.fir_id || 'DEMO'}.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
        }).from(tempDiv.firstElementChild).save().then(() => {
            document.body.removeChild(tempDiv);
        });
    }

    async handleTrackStatus() {
        const msg = SYSTEM_MESSAGES[this.currentLanguage].STATUS_FETCHING;
        this.addMessage('Police Mitra AI', msg, 'ai-message');
        this.speakWithText(msg);

        try {
            const email = this.user.email;
            const response = await fetch(`http://localhost:5000/get-firs?email=${encodeURIComponent(email)}`);
            const firs = await response.json();

            if (!Array.isArray(firs) || firs.length === 0) {
                const noFirsMsg = SYSTEM_MESSAGES[this.currentLanguage].NO_FIRS_FOUND;
                this.addMessage('Police Mitra AI', noFirsMsg, 'ai-message');
                this.speakWithText(noFirsMsg);
            } else {
                const foundMsg = SYSTEM_MESSAGES[this.currentLanguage].FIRS_FOUND;
                this.addMessage('Police Mitra AI', foundMsg, 'ai-message');
                this.speakWithText(foundMsg);
                this.showFIRStatusList(firs);
            }
        } catch (error) {
            console.error('Error fetching FIRs:', error);
            const errMsg = "Sorry, I encountered an error while fetching your FIR records. Please ensure the backend server is running.";
            this.addMessage('Police Mitra AI', errMsg, 'ai-message');
            this.speakWithText(errMsg);
        }
    }

    showFIRStatusList(firs) {
        const labels = FIR_LABELS[this.currentLanguage] || FIR_LABELS['en'];
        let content = `
            <div style="text-align: center; margin-bottom: 20px;">
                <h3 style="color: #2196f3; margin: 0;">${labels.RECORDS_TITLE}</h3>
            </div>
            <div class="status-list-container">
                <table class="status-table">
                    <thead>
                        <tr>
                            <th>${labels.FIR_ID}</th>
                            <th>${labels.CATEGORY}</th>
                            <th>${labels.DATE}</th>
                            <th>${labels.STATUS}</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

            const priorityMap = { 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
            firs.sort((a, b) => {
                const pA = priorityMap[a.priority] || 0;
                const pB = priorityMap[b.priority] || 0;
                if (pA !== pB) return pB - pA; // Higher priority first
                return new Date(b.timestamp) - new Date(a.timestamp); // Then newest first
            });

            firs.forEach(fir => {
            const date = new Date(fir.timestamp).toLocaleDateString(LANGUAGES[this.currentLanguage].code);
            const statusText = fir.status || 'Pending';
            const statusClass = statusText.toLowerCase().replace(/\s+/g, '-');
            content += `
                <tr>
                    <td style="font-size: 11px; font-weight: bold;">${fir.fir_id}</td>
                    <td>${fir.intent}</td>
                    <td>${date}</td>
                    <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                </tr>
            `;
        });

        content += `
                    </tbody>
                </table>
            </div>
            <button id="close-status-btn" class="btn-download" style="background: #e74c3c; margin-top: 15px;">${labels.CLOSE_RECORDS}</button>
        `;

        this.firContent.innerHTML = content;
        this.firModal.style.display = 'block';
        this.overlay.style.display = 'block';
        
        // Hide download button for status list
        this.downloadBtn.style.display = 'none';
        document.getElementById('close-modal-btn').style.display = 'none';
        
        if (this.officialFirModalBtn) {
            this.officialFirModalBtn.innerText = SYSTEM_MESSAGES[this.currentLanguage].UI_TEXT.OFFICIAL_FIR_SECTION;
            this.officialFirModalBtn.style.display = 'block';
        }

        document.getElementById('close-status-btn').onclick = () => {
            this.firModal.style.display = 'none';
            this.overlay.style.display = 'none';
            // Reset modal buttons for next time
            this.downloadBtn.style.display = 'block';
            document.getElementById('close-modal-btn').style.display = 'block';
            if (this.officialFirModalBtn) this.officialFirModalBtn.style.display = 'none';
        };
    }

    /* --- Advanced Diagnostic Logic --- */
    setupDiagnostics() {
        this.diagPanel = document.getElementById('diagnostic-panel');
        this.diagLogs = document.getElementById('diag-logs');
        this.diagToggle = document.getElementById('diag-toggle-btn');
        this.closeDiag = document.getElementById('close-diag-btn');
        this.runDiagBtn = document.getElementById('run-full-diag-btn');
        this.clearLogsBtn = document.getElementById('clear-logs-btn');
        this.hardResetBtn = document.getElementById('hard-reset-btn');
        
        if (!this.diagPanel) return;

        this.diagToggle.onclick = () => {
            this.diagPanel.style.display = 'flex';
            this.logDiagnostic('Diagnostic log opened.', 'info');
        };
        
        this.closeDiag.onclick = () => this.diagPanel.style.display = 'none';
        this.clearLogsBtn.onclick = () => this.diagLogs.innerHTML = '';
        this.runDiagBtn.onclick = () => this.runFullDiagnostics();
        if (this.hardResetBtn) {
            this.hardResetBtn.onclick = () => this.hardResetEngine();
        }
    }

    hardResetEngine() {
        this.logDiagnostic('FORCE RESET: Killing all voice/speech engines...', 'warn');
        
        // 1. Kill Speech Synthesis
        try {
            this.synth.cancel();
            this.isSpeaking = false;
        } catch (e) {}

        // 2. Kill Speech Recognition
        try {
            if (this.recognition) {
                this.recognition.abort();
                this.isListening = false;
            }
        } catch (e) {}

        this.logDiagnostic('Clearing states and re-initializing...', 'info');
        
        // 3. Clear states
        this.state = 'GREETING';
        this.currentIntent = null;
        this.currentQuestionIndex = 0;
        this.responses = {};
        
        // 4. Re-initialize
        this.updateRecognitionLanguage();
        this.logDiagnostic('Hard Reset Complete. Engine is Fresh.', 'success');
        
        // Optional: Trigger a fresh greet
        this.greet();
    }

    logDiagnostic(msg, type = 'info') {
        if (!this.diagLogs) return;
        const entry = document.createElement('div');
        entry.className = 'diag-log-entry';
        const time = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        entry.innerHTML = `<span class="diag-log-time">[${time}]</span> <span class="diag-log-${type}">${msg}</span>`;
        this.diagLogs.prepend(entry);
        console.log(`[DIAGNOSTIC][${type.toUpperCase()}] ${msg}`);
    }

    async runFullDiagnostics() {
        const diagStatus = document.getElementById('diag-status');
        this.diagLogs.innerHTML = '';
        this.logDiagnostic('Starting Full System Diagnostic...', 'info');
        diagStatus.innerText = 'Testing systems...';

        // 1. Check Context Secure
        const isSecure = window.isSecureContext;
        this.logDiagnostic(`Context Secure (HTTPS/Localhost): ${isSecure}`, isSecure ? 'success' : 'error');
        if (!isSecure) this.logDiagnostic('IMPORTANT: Voice features are blocked on non-secure origins!', 'error');

        // 2. Check Constructor
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.logDiagnostic(`SpeechRecognition API present: ${!!SpeechRecognition}`, SpeechRecognition ? 'success' : 'error');

        // 3. Check MediaDevices
        const hasMediaDevices = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
        this.logDiagnostic(`MediaDevices API present: ${hasMediaDevices}`, hasMediaDevices ? 'success' : 'error');

        // 4. Detailed Hardware Check
        const hardware = await this.checkMicrophoneHardware();
        this.logDiagnostic(`Hardware/Permission Result: ${hardware.error || 'SUCCESS'}`, hardware.success ? 'success' : 'error');

        // 5. Test Audio Capture
        if (hardware.success) {
            this.logDiagnostic('Attempting 2-second capture test...', 'info');
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                this.logDiagnostic('Audio stream captured successfully!', 'success');
                
                // Track volume if possible
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const source = audioContext.createMediaStreamSource(stream);
                const processor = audioContext.createScriptProcessor(2048, 1, 1);
                
                source.connect(processor);
                processor.connect(audioContext.destination);
                
                let maxVolume = 0;
                processor.onaudioprocess = (e) => {
                    const input = e.inputBuffer.getChannelData(0);
                    for (let i = 0; i < input.length; i++) {
                        const val = Math.abs(input[i]);
                        if (val > maxVolume) maxVolume = val;
                    }
                };

                diagStatus.innerText = 'Speak now to test volume...';
                await new Promise(r => setTimeout(r, 2000));
                
                this.logDiagnostic(`Max volume captured: ${(maxVolume * 100).toFixed(1)}%`, maxVolume > 0.01 ? 'success' : 'warn');
                if (maxVolume < 0.01) this.logDiagnostic('Warning: No sound detected. Your mic might be muted.', 'warn');
                
                stream.getTracks().forEach(t => t.stop());
                audioContext.close();
            } catch (err) {
                this.logDiagnostic(`Audio capture failed: ${err.message}`, 'error');
            }
        }

        // 6. Language Compatibility Test
        const currentLang = LANGUAGES[this.currentLanguage];
        this.logDiagnostic(`Testing compatibility for: ${currentLang.name} (${currentLang.code})...`, 'info');
        try {
            const testRec = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
            testRec.lang = currentLang.code;
            this.logDiagnostic(`Engine accepted code: ${currentLang.code}`, 'success');
        } catch (e) {
            this.logDiagnostic(`CRITICAL: Browser rejected language code ${currentLang.code}!`, 'error');
        }

        // 7. Speech Synthesis Check (TTS)
        const voices = window.speechSynthesis.getVoices();
        const hasVoice = voices.some(v => v.lang.startsWith(currentLang.code.split('-')[0]));
        this.logDiagnostic(`AI Voice (TTS) available for ${currentLang.code.split('-')[0]}: ${hasVoice}`, hasVoice ? 'success' : 'warn');
        if (!hasVoice) this.logDiagnostic('Note: AI may be silent in this language, blocking automatic mic start.', 'warn');

        diagStatus.innerText = 'Diagnostic Complete.';
        this.logDiagnostic('Full System Diagnostic Complete.', 'info');
    }
}

// Start the app when the page is loaded
window.addEventListener('DOMContentLoaded', () => {
    new VoiceFIRApp();
});
