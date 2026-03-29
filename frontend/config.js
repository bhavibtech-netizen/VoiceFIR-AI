// Multi-language Configuration for VoiceFIR AI
export const LANGUAGES = {
    'en': { name: 'English', code: 'en-US' },
    'hi': { name: 'Hindi (हिंदी)', code: 'hi-IN' },
    'te': { name: 'Telugu (తెలుగు)', code: 'te-IN' }
};

export const SYSTEM_MESSAGES = {
    'en': {
        "GREETING": "Hello, I am your Police Mitra AI assistant. Please tell me your issue.",
        "INTENT_NOT_FOUND": "I'm sorry, I couldn't clearly understand. Could you please specify if it's related to a Lost Mobile, Theft, Cyber Fraud, Accident, Missing Person, or Noise Complaint?",
        "VALIDATION_ERROR": "I'm sorry, that response seems invalid. Could you please provide the correct information again?",
        "COMPLETED": "Thank you. Your details have been collected successfully. I am now generating your FIR.",
        "SUCCESS": "Your FIR has been generated successfully.",
        "STATUS_FETCHING": "Fetching your FIR records. Please wait...",
        "NO_FIRS_FOUND": "I couldn't find any FIR records associated with your account.",
        "FIRS_FOUND": "I found your FIR records. You can check the status below:",
        "UI_TEXT": {
            "PLACEHOLDER": "Type your response here...",
            "SEND": "Send Message",
            "SPEAK": "Speak to AI",
            "TEXT_MODE": "Switch to Text Input",
            "VOICE_MODE": "Switch to Voice Input",
            "LISTENING": "Listening...",
            "SENDER_NAME": "Police Mitra AI",
            "USER_NAME": "You",
            "TITLE": "VoiceFIR AI",
            "SUBTITLE": "Police Mitra Assistant",
            "OFFICIAL_FIR_SECTION": "Official FIR"
        },
        "VALUE_TRANSLATIONS": {
            "Under Investigation": "Under Investigation",
            "Completed": "Completed",
            "Not Provided": "Not Provided",
            "Logged In User": "Logged In User",
            "avunu": "Yes",
            "kaadu": "No",
            "pramadham": "Accident",
            "bandi": "Vehicle"
        },
        "OFFICIAL_TRANSITION": "Excellent. Those incident details have been recorded. To finish, I will now ask the 15 official points for the BNSS Section 173 report."
    },
    'hi': {
        "GREETING": "नमस्ते, मैं आपका पुलिस मित्र एआई सहायक हूं। कृपया मुझे अपनी समस्या बताएं।",
        "INTENT_NOT_FOUND": "क्षमा करें, मैं स्पष्ट रूप से समझ नहीं पाया। क्या आप कृपया बता सकते हैं कि यह खोए हुए मोबाइल, चोरी, साइबर धोखाधड़ी, दुर्घटना, लापता व्यक्ति या शोर की शिकायत से संबंधित है?",
        "VALIDATION_ERROR": "क्षमा करें, वह प्रतिक्रिया अमान्य लगती है। क्या आप कृपया फिर से सही जानकारी प्रदान कर सकते हैं?",
        "COMPLETED": "धन्यवाद। आपके विवरण सफलतापूर्वक एकत्र कर लिए गए हैं। मैं अब आपकी एफआईआर (FIR) तैयार कर रहा हूं।",
        "SUCCESS": "आपकी एफआईआर सफलतापूर्वक तैयार हो गई है।",
        "STATUS_FETCHING": "आपकी एफआईआर रिकॉर्ड प्राप्त किए जा रहे हैं। कृपया प्रतीक्षा करें...",
        "NO_FIRS_FOUND": "मुझे आपके खाते से जुड़ा कोई एफआईआर रिकॉर्ड नहीं मिला।",
        "FIRS_FOUND": "मुझे आपके एफआईआर रिकॉर्ड मिल गए हैं। आप नीचे स्थिति देख सकते हैं:",
        "UI_TEXT": {
            "PLACEHOLDER": "अपनी प्रतिक्रिया यहाँ टाइप करें...",
            "SEND": "संदेश भेजें",
            "SPEAK": "एआई से बात करें",
            "TEXT_MODE": "टेक्स्ट इनपुट पर स्विच करें",
            "VOICE_MODE": "वॉयस इनपुट पर स्विच करें",
            "LISTENING": "सुन रहा हूँ...",
            "SENDER_NAME": "पुलिस मित्र एआई",
            "USER_NAME": "आप",
            "TITLE": "VoiceFIR AI",
            "SUBTITLE": "पुलिस मित्र सहायक",
            "OFFICIAL_FIR_SECTION": "आधिकारिक एफआईआर अनुभाग"
        },
        "VALUE_TRANSLATIONS": {
            "Under Investigation": "जांच के अधीन",
            "Completed": "पूरा हुआ",
            "Not Provided": "प्रदान नहीं किया गया",
            "Logged In User": "लॉग इन उपयोगकर्ता",
            "avunu": "हां",
            "kaadu": "नहीं",
            "pramadham": "दुर्घटना",
            "bandi": "वाहन",
            "yes": "हां",
            "no": "नहीं"
        },
        "OFFICIAL_TRANSITION": "बहुत बढ़िया। वे घटना विवरण दर्ज कर लिए गए हैं। अंत में, अब मैं बीएनएसएस धारा 173 की रिपोर्ट के लिए 15 आधिकारिक बिंदु पूछूंगा।"
    },
    'te': {
        "GREETING": "నమస్కారం, నేను మీ పోలీసు మిత్ర AI అసిస్టెంట్ ని. దయచేసి మీ సమస్యను నాకు తెలియజేయండి.",
        "INTENT_NOT_FOUND": "క్షమించండి, నాకు స్పష్టంగా అర్థం కాలేదు. ఇది మొబైల్ పోగొట్టుకోవడం, దొంగతనం, సైబర్ మోసం, ప్రమాదం, తప్పిపోయిన వ్యక్తి లేదా శబ్ద కాలుష్య ఫిర్యాదుకు సంబంధించిందా అని మీరు దయచేసి పేర్కొనగలరా?",
        "VALIDATION_ERROR": "క్షమించండి, ఆ సమాధానం చెల్లదు. దయచేసి సరైన సమాచారాన్ని మళ్ళీ అందించగలరా?",
        "COMPLETED": "ధన్యవాదాలు. మీ వివరాలు విజయవంతంగా సేకరించబడ్డాయి. నేను ఇప్పుడు మీ ఎఫ్ఐఆర్ (FIR)ను సిద్ధం చేస్తున్నాను.",
        "SUCCESS": "మీ ఎఫ్ఐఆర్ విజయవంతంగా రూపొందించబడింది.",
        "STATUS_FETCHING": "మీ ఎఫ్ఐఆర్ రికార్డులను సేకరిస్తున్నాము. దయచేసి వేచి ఉండండి...",
        "NO_FIRS_FOUND": "మీ ఖాతాతో అనుబంధించబడిన ఎఫ్ఐఆర్ రికార్డులేవీ నాకు కనిపించలేదు.",
        "FIRS_FOUND": "నేను మీ ఎఫ్ఐఆర్ రికార్డులను కనుగొన్నాను. మీరు దిగువ స్థితిని తనిఖీ చేయవచ్చు:",
        "UI_TEXT": {
            "PLACEHOLDER": "మీ ప్రతిస్పందనను ఇక్కడ టైప్ చేయండి...",
            "SEND": "సందేశం పంపండి",
            "SPEAK": "AI తో మాట్లాడండి",
            "TEXT_MODE": "టెక్స్ట్ ఇన్పుట్ కు మారండి",
            "VOICE_MODE": "వాయిస్ ఇన్పుట్ కు మారండి",
            "LISTENING": "వింటున్నాను...",
            "SENDER_NAME": "పోలీసు మిత్ర AI",
            "USER_NAME": "మీరు",
            "TITLE": "VoiceFIR AI",
            "SUBTITLE": "పోలీసు మిత్ర సహాయకుడు",
            "OFFICIAL_FIR_SECTION": "అధికారిక ఎఫ్ఐఆర్ విభాగం"
        },
        "VALUE_TRANSLATIONS": {
            "Under Investigation": "విచారణలో ఉంది",
            "Completed": "పూర్తయింది",
            "Not Provided": "అందించబడలేదు",
            "Logged In User": "లాగిన్ అయిన వినియోగదారు",
            "avunu": "అవును",
            "kaadu": "కాదు",
            "pramadham": "ప్రమాదం",
            "bandi": "వాహనం",
            "yes": "అవును",
            "no": "కాదు"
        },
        "OFFICIAL_TRANSITION": "చాలా బాగుంది. ఆ సమాచారం నమోదైంది. చివరగా, నేను ఇప్పుడు BNSS సెక్షన్ 173 నివేదిక కోసం 15 అధికారిక అంశాలను అడుగుతాను."
    }
};

export const INTENTS = {
    'en': {
        "LOST_MOBILE": {
            "label": "Lost Mobile",
            "priority": "MEDIUM",
            "keywords": ["lost mobile", "phone lost", "missing phone", "stolen phone", "mobile phone"],
            "questions": [
                { "key": "incident_date", "text": "When did you lose it?" },
                { "key": "incident_location", "text": "Where did it happen?" },
                { "key": "mobile_model", "text": "What is the mobile model name?" },
                { "key": "imei_number", "text": "Do you know the 15-digit IMEI number?", "validation": /^\d{15}$/ }
            ]
        },
        "THEFT": {
            "label": "Theft",
            "priority": "MEDIUM",
            "keywords": ["theft", "stolen", "burglary", "robbery", "thief"],
            "questions": [
                { "key": "incident_date", "text": "When did the theft occur?" },
                { "key": "incident_location", "text": "Where did it happen?" },
                { "key": "stolen_items", "text": "What items were stolen?" },
                { "key": "suspect_details", "text": "Do you have any description of the suspect?" }
            ]
        },
        "CYBER_FRAUD": {
            "label": "Cyber Fraud",
            "priority": "MEDIUM",
            "keywords": ["cyber fraud", "online fraud", "money stolen online", "bank fraud", "scam"],
            "questions": [
                { "key": "fraud_date", "text": "When did the transaction happen?" },
                { "key": "fraud_amount", "text": "What was the total amount involved?" },
                { "key": "platform", "text": "On which platform did it happen?" },
                { "key": "transaction_id", "text": "Do you have a transaction ID?" }
            ]
        },
        "ACCIDENTS": {
            "label": "Accident",
            "priority": "HIGH",
            "keywords": ["accident", "crash", "collision", "hit and run", "vehicle accident"],
            "questions": [
                { "key": "accident_type", "text": "What type of accident occurred?" },
                { "key": "incident_location", "text": "Where did it happen?" },
                { "key": "injuries", "text": "Are there any injuries reported?" },
                { "key": "vehicle_number", "text": "What is the vehicle number involved?" }
            ]
        },
        "MISSING_PERSON": {
            "label": "Missing Person",
            "priority": "HIGH",
            "keywords": ["missing person", "person missing", "lost person", "disappeared"],
            "questions": [
                { "key": "person_name", "text": "What is the name of the missing person?" },
                { "key": "last_seen_date", "text": "When was the person last seen?" },
                { "key": "last_seen_location", "text": "Where was the person last seen?" },
                { "key": "person_description", "text": "Can you provide a description of the person (age, clothing, etc.)?" }
            ]
        },
        "NOISE_COMPLAINTS": {
            "label": "Noise Complaint",
            "priority": "LOW",
            "keywords": ["noise", "loud speaker", "disturbance", "party noise", "construction noise"],
            "questions": [
                { "key": "noise_source", "text": "What is the source of the noise? (e.g., party, construction, speaker)" },
                { "key": "incident_location", "text": "Where is the noise coming from?" },
                { "key": "duration", "text": "How long has the noise been going on?" }
            ]
        },
        "TRACK_STATUS": {
            "label": "Track FIR Status",
            "keywords": ["track", "status", "check fir", "my fir", "records"],
            "questions": []
        },
        "OFFICIAL_FIR": {
            "label": "Official FIR (BNSS Section 173)",
            "priority": "HIGH",
            "keywords": ["official", "formal", "bnss", "detailed report", "police complaint", "app", "section 173"],
            "questions": [
                { "key": "point_1", "text": "1. Please provide the District, Police Station Name, Year, FIR Number, and Date." },
                { "key": "point_2", "text": "2. Provide details of the relevant Acts and Sections." },
                { "key": "point_3", "text": "3. Regarding the occurrence of the offense: Please provide the Day, Date and Time from, Date and time to, and General Diary Entry details." },
                { "key": "point_4", "text": "4. What is the Type of Information? (Written or Oral)" },
                { "key": "point_5", "text": "5. For the Place of Occurrence, provide the Distance and Direction from the Police Station, Beat No, and the full exact address including PIN." },
                { "key": "point_6", "text": "6. Please provide the Informant's full details: Name, Father or Husband's name, Date of Birth or Age, Nationality, Caste, Passport details if any, Occupation, Mobile Number, and Full Address." },
                { "key": "point_7", "text": "7. Provide Details of known, suspected, or unknown accused with full particulars." },
                { "key": "point_8", "text": "8. Reasons for delay in reporting (if any)?" },
                { "key": "point_9", "text": "9. Particulars of properties stolen or involved." },
                { "key": "point_10", "text": "10. Total value of property stolen." },
                { "key": "point_11", "text": "11. Inquest Report / U.D. Case No. if any." },
                { "key": "point_12", "text": "12. Full Contents of the complaint or statement." },
                { "key": "point_13", "text": "13. Action taken: Registered, Refused, or Transferred? (Include Officer Rank/No)" },
                { "key": "point_14", "text": "14. Confirmation: Do you provide your Digital Signature / Thumb impression? (Yes/No)" },
                { "key": "point_15", "text": "15. Date and time of dispatch to the court?" }
            ]
        }
    },
    'hi': {
        "LOST_MOBILE": {
            "label": "खोయా हुआ मोबाइल",
            "keywords": ["खोయా", "मोबाइल", "फोन"],
            "questions": [
                { "key": "incident_date", "text": "आपने इसे कब खोయా?" },
                { "key": "incident_location", "text": "यह कहां हुआ?" },
                { "key": "mobile_model", "text": "मोबाइल मॉडल का नाम क्या है?" },
                { "key": "imei_number", "text": "क्या आप 15-अंकों का IMEI नंबर जानते हैं?", "validation": /^\d{15}$/ }
            ]
        },
        "THEFT": {
            "label": "चोरी",
            "priority": "MEDIUM",
            "keywords": ["चोरी", "दबाना"],
            "questions": [
                { "key": "incident_date", "text": "దొంగతనం ఎప్పుడు జరిగింది?" },
                { "key": "incident_location", "text": "ఇది ఎక్కడ జరిగింది?" },
                { "key": "stolen_items", "text": "ఏ వస్తువులు దొంగిలించబడ్డాయి?" },
                { "key": "suspect_details", "text": "నిందితుల గురించి ఏవైనా వివరాలు ఉన్నాయా?" }
            ]
        },
        "CYBER_FRAUD": {
            "label": "సైబర్ మోసం",
            "keywords": ["సైబర్", "మోసం", "డబ్బులు"],
            "questions": [
                { "key": "fraud_date", "text": "లావాదేవీ ఎప్పుడు జరిగింది?" },
                { "key": "fraud_amount", "text": "మొత్తం ఎంత డబ్బు పోయింది?" },
                { "key": "platform", "text": "ఇది ఏ ప్లాట్‌ఫారమ్‌లో జరిగింది?" }
            ]
        },
        "ACCIDENTS": {
            "label": "ప్రమాదం",
            "keywords": ["ప్రమాదం", "యాక్సిడెంట్"],
            "questions": [
                { "key": "accident_type", "text": "ఎటువంటి ప్రమాదం జరిగింది?" },
                { "key": "incident_location", "text": "ఇది ఎక్కడ జరిగింది?" },
                { "key": "injuries", "text": "ఎవరికైనా గాయాలయ్యాయా?" }
            ]
        },
        "MISSING_PERSON": {
            "label": "తప్పిపోయిన వ్యక్తి",
            "keywords": ["తప్పిపోయిన", "వ్యక్తి"],
            "questions": [
                { "key": "person_name", "text": "తప్పిపోయిన వ్యక్తి పేరు ఏమిటి?" },
                { "key": "last_seen_date", "text": "ఆ వ్యక్తి చివరిసారిగా ఎప్పుడు కనిపించారు?" }
            ]
        },
        "NOISE_COMPLAINTS": {
            "label": "శబ్ద కాలుష్య ఫిర్యాదు",
            "keywords": ["శబ్దం", "అరుపులు"],
            "questions": [
                { "key": "noise_source", "text": "శబ్దం ఎక్కడి నుండి వస్తోంది? (ఉదా: పార్టీ, నిర్మాణం)" },
                { "key": "incident_location", "text": "శబ్దం ఎక్కడ వస్తోంది?" }
            ]
        },
        "TRACK_STATUS": {
            "label": "ఎఫ్ఐఆర్ స్థితిని ట్రాక్ చేయండి",
            "keywords": ["ట్రాక్", "స్థితి"],
            "questions": []
        },
        "OFFICIAL_FIR": {
            "label": "आधिकारिक एफआईआर (बीएनएसएस धारा 173)",
            "priority": "HIGH",
            "keywords": ["आधिकारिक", "औपचारिक", "बीएनएसएस", "विस्तृत रिपोर्ट", "पुलिस शिकायत"],
            "questions": [
                { "key": "point_1", "text": "1. कृपया जिला, पुलिस स्टेशन का नाम, वर्ष, एफआईआर संख्या और दिनांक प्रदान करें।" },
                { "key": "point_2", "text": "2. प्रासंगिक अधिनियमों और धाराओं का विवरण दें।" },
                { "key": "point_3", "text": "3. अपराध की घटना के संबंध में: कृपया दिन, दिनांक और समय, और जनरल डायरी प्रविष्टि का विवरण दें।" },
                { "key": "point_4", "text": "4. सूचना का प्रकार क्या है? (लिखित या मौखिक)" },
                { "key": "point_5", "text": "5. घटनास्थल के लिए, पुलिस स्टेशन से दूरी और दिशा, बीट नंबर, और पिन सहित पूरा सटीक पता प्रदान करें।" },
                { "key": "point_6", "text": "6. कृपया सूचनाकर्ता का पूरा विवरण दें: नाम, पिता/पति का नाम, जन्म तिथि/उम्र, राष्ट्रीयता, जाति, पासपोर्ट विवरण (यदि कोई हो), व्यवसाय, मोबाइल नंबर और पूरा पता।" },
                { "key": "point_7", "text": "7. ज्ञात, संदिग्ध या अज्ञात अभियुक्तों का पूरा विवरण प्रदान करें।" },
                { "key": "point_8", "text": "8. रिपोर्ट दर्ज करने में देरी का कारण (यदि कोई हो)?" },
                { "key": "point_9", "text": "9. चोरी की गई या शामिल संपत्तियों का विवरण।" },
                { "key": "point_10", "text": "10. चोरी की गई संपत्ति का कुल मूल्य।" },
                { "key": "point_11", "text": "11. पूछताछ रिपोर्ट या यू.डी. केस नंबर यदि कोई हो।" },
                { "key": "point_12", "text": "12. शिकायत या बयान की पूरी सामग्री।" },
                { "key": "point_13", "text": "13. की गई कार्रवाई: पंजीकृत, स्थानांतरित या इनकार? (अधिकारी का रैंक/नंबर)" },
                { "key": "point_14", "text": "14. पुष्टि: क्या आप अपने डिजिटल हस्ताक्षर प्रदान करते हैं? (हां/नहीं)" },
                { "key": "point_15", "text": "15. अदालत में भेजने का दिन और समय?" }
            ]
        }
    },
    'te': {
        "LOST_MOBILE": {
            "label": "మొబైల్ పోగొట్టుకోవడం",
            "keywords": ["మొబైల్", "ఫోన్", "పోయి"],
            "questions": [
                { "key": "incident_date", "text": "దీనిని మీరు ఎప్పుడు పోగొట్టుకున్నారు?" },
                { "key": "incident_location", "text": "ఇది ఎక్కడ జరిగింది?" },
                { "key": "mobile_model", "text": "మొబైల్ మోడల్ పేరు ఏమిటి?" },
                { "key": "imei_number", "text": "మీకు 15 అంకెల IMEI నంబర్ తెలుసా?", "validation": /^\d{15}$/ }
            ]
        },
        "THEFT": {
            "label": "దొంగతనం",
            "priority": "MEDIUM",
            "keywords": ["దొంగతనం", "దొంగలు", "పోయాయి"],
            "questions": [
                { "key": "incident_date", "text": "దొంగతనం ఎప్పుడు జరిగింది?" },
                { "key": "incident_location", "text": "ఇది ఎక్కడ జరిగింది?" },
                { "key": "stolen_items", "text": "ఏ వస్తువులు దొంగిలించబడ్డాయి?" },
                { "key": "suspect_details", "text": "నిందితుల గురించి ఏవైనా వివరాలు ఉన్నాయా?" }
            ]
        },
        "CYBER_FRAUD": {
            "label": "సైబర్ మోసం",
            "keywords": ["సైబర్", "మోసం", "డబ్బులు"],
            "questions": [
                { "key": "fraud_date", "text": "లావాదేవీ ఎప్పుడు జరిగింది?" },
                { "key": "fraud_amount", "text": "మొత్తం ఎంత డబ్బు పోయింది?" },
                { "key": "platform", "text": "ఇది ఏ ప్లాట్‌ఫారమ్‌లో జరిగింది?" }
            ]
        },
        "ACCIDENTS": {
            "label": "ప్రమాదం",
            "keywords": ["ప్రమాదం", "యాక్సిడెంట్"],
            "questions": [
                { "key": "accident_type", "text": "ఎటువంటి ప్రమాదం జరిగింది?" },
                { "key": "incident_location", "text": "ఇది ఎక్కడ జరిగింది?" },
                { "key": "injuries", "text": "ఎవరికైనా గాయాలయ్యాయా?" }
            ]
        },
        "MISSING_PERSON": {
            "label": "తప్పిపోయిన వ్యక్తి",
            "keywords": ["తప్పిపోయిన", "వ్యక్తి"],
            "questions": [
                { "key": "person_name", "text": "తప్పిపోయిన వ్యక్తి పేరు ఏమిటి?" },
                { "key": "last_seen_date", "text": "ఆ వ్యక్తి చివరిసారిగా ఎప్పుడు కనిపించారు?" }
            ]
        },
        "NOISE_COMPLAINTS": {
            "label": "శబ్ద కాలుష్య ఫిర్యాదు",
            "keywords": ["శబ్దం", "అరుపులు"],
            "questions": [
                { "key": "noise_source", "text": "శబ్దం ఎక్కడి నుండి వస్తోంది? (ఉదా: పార్టీ, నిర్మాణం)" },
                { "key": "incident_location", "text": "శబ్దం ఎక్కడ వస్తోంది?" }
            ]
        },
        "TRACK_STATUS": {
            "label": "ఎఫ్ఐఆర్ స్థితిని ట్రాక్ చేయండి",
            "keywords": ["ట్రాక్", "స్థితి"],
            "questions": []
        },
        "OFFICIAL_FIR": {
            "label": "అధికారిక ఎఫ్ఐఆర్ (బిఎన్ఎస్ఎస్ సెక్షన్ 173)",
            "priority": "HIGH",
            "keywords": ["అధికారిక", "ఫార్మల్", "బిఎన్ఎస్ఎస్", "వివరణాత్మక రిపోర్ట్", "పోలీస్ ఫిర్యాదు"],
            "questions": [
                { "key": "point_1", "text": "1. దయచేసి జిల్లా, పోలీస్ స్టేషన్ పేరు, సంవత్సరం, ఎఫ్ఐఆర్ నంబర్ మరియు తేదీని అందించండి." },
                { "key": "point_2", "text": "2. చట్టాలు మరియు సెక్షన్ల వివరాలను ఇవ్వండి." },
                { "key": "point_3", "text": "3. నేరం జరిగిన వివరం గురించి: దయచేసి రోజు, తేదీ మరియు సమయం (నుండి, వరకు) మరియు జనరల్ డైరీ ఎంట్రీ వివరాలను ఇవ్వండి." },
                { "key": "point_4", "text": "4. సమాచార రకం ఏమిటి? (లిఖితపూర్వక లేదా మౌఖిక)" },
                { "key": "point_5", "text": "5. సంఘటన జరిగిన ప్రదేశం కోసం, పోలీస్ స్టేషన్ నుండి దూరం మరియు దిశ, బీట్ నంబర్ మరియు పిన్ తో సహా పూర్తి చిరునామాను అందించండి." },
                { "key": "point_6", "text": "6. దయచేసి ఫిర్యాదుదారు పూర్తి వివరాలను ఇవ్వండి: పేరు, తండ్రి/భర్త పేరు, పుట్టిన తేదీ/వయస్సు, జాతీయత, కులం, పాస్‌పోర్ట్ వివరాలు, వృత్తి, మొబైల్ నంబర్ మరియు పూర్తి చిరునామా." },
                { "key": "point_7", "text": "7. తెలిసిన, అనుమానిత లేదా తెలియని నిందితుల పూర్తి వివరాలను ఇవ్వండి." },
                { "key": "point_8", "text": "8. రిపోర్ట్ చేయడంలో ఆలస్యానికి కారణం (ఏదైనా ఉంటే)?" },
                { "key": "point_9", "text": "9. దొంగిలించబడిన లేదా పాల్గొన్న ఆస్తుల వివరాలు." },
                { "key": "point_10", "text": "10. దొంగిలించబడిన ఆస్తి మొత్తం విలువ." },
                { "key": "point_11", "text": "11. విచారణ రిపోర్ట్ లేదా యూ.డీ. కేసు నంబర్ ఏదైనా ఉంటే." },
                { "key": "point_12", "text": "12. ఫిర్యాదు సారాంశం." },
                { "key": "point_13", "text": "13. తీసుకున్న చర్య: కేసు నమోదు, బదిలీ లేదా నిరాకరణ? (అధికారి హోదా/నంబర్ తో)" },
                { "key": "point_14", "text": "14. ధృవీకరణ: మీరు మీ డిజిటల్ సంతకం ఇస్తారా? (అవును/కాదు)" },
                { "key": "point_15", "text": "15. కోర్టుకు పంపిన రోజు మరియు సమయం?" }
            ]
        }
    }
};

export const FIR_LABELS = {
    'en': {
        "FIR_TITLE": "FIRST INFORMATION REPORT (FIR)",
        "FIR_SUBTITLE": "Police Mitra AI Assistant – Generated Report",
        "FIR_ID": "FIR ID",
        "TIMESTAMP": "Timestamp",
        "CATEGORY": "Category",
        "PRIORITY": "Priority",
        "DATE": "Date",
        "STATUS": "Status",
        "USER_DETAILS": "User Details",
        "USER_NAME": "Name",
        "USER_EMAIL": "Email",
        "USER_PHONE": "Phone",
        "INCIDENT_DATE": "Incident Date",
        "INCIDENT_LOCATION": "Incident Location",
        "STOLEN_ITEMS": "Stolen Items",
        "SUSPECT_DETAILS": "Suspect Details",
        "INCIDENT_DETAILS": "Incident Details",
        "PRIORITY_HIGH": "High",
        "PRIORITY_MEDIUM": "Med",
        "PRIORITY_LOW": "Low",
        "BNSS_HEADING": "FIRST INFORMATION REPORT",
        "BNSS_SUBHEADING": "(Under Section 173 BNSS)",
        "POINT_1": "1. District, P.S., Year, FIR No., Date",
        "POINT_2": "2. Acts & Section(s)",
        "POINT_3": "3. a) Occurrence of Offence: Day, Date & Time From, Date & Time To, Prior To, Time Period\n   b) Information Received at P.S.: Date & Time\n   c) General Diary Reference: Entry No, Date & Time",
        "POINT_4": "4. Type of Information",
        "POINT_5": "5. Place of Occurrence: a) Distance and Direction From P.S., Beat No.\n   b) Address: Place, Area/Mandal, Street/Village, City/District, State, PIN",
        "POINT_6": "6. Complainant / Informant: a) Name b) Father's/Husband's Name c) DOB, Age d) Nationality, Caste e) Passport Details f) Occupation, Mobile No g) Address",
        "POINT_7": "7. Details of known/suspected/unknown accused with full particulars:",
        "POINT_8": "8. Reasons for delay in reporting",
        "POINT_9": "9. Particulars of properties stolen",
        "POINT_10": "10. Total value of property",
        "POINT_11": "11. Inquest Report / U.D. Case No.",
        "POINT_12": "12. Contents of the complaint",
        "POINT_13": "13. Action taken",
        "POINT_14": "14. Signature / Thumb impression",
        "POINT_15": "15. Despatch Info",
        "DOWNLOAD_PDF": "Download PDF Report",
        "CLOSE": "Close",
        "RECORDS_TITLE": "MY FIR RECORDS",
        "CLOSE_RECORDS": "Close Records"
    },
    'hi': {
        "FIR_TITLE": "प्रथम सूचना रिपोर्ट (FIR)",
        "FIR_SUBTITLE": "पुलिस मित्र एआई सहायक – तैयार रिपोर्ट",
        "FIR_ID": "एफआईఆర్ आईडी",
        "TIMESTAMP": "समय",
        "CATEGORY": "श्रेणी",
        "PRIORITY": "प्राथमिकता",
        "DATE": "दिनांक",
        "STATUS": "स्थिति",
        "USER_DETAILS": "उपयोगकर्ता विवरण",
        "USER_NAME": "नाम",
        "USER_EMAIL": "ईमेल",
        "USER_PHONE": "फोन",
        "INCIDENT_DATE": "घटना की तारीख",
        "INCIDENT_LOCATION": "घटना स्थल",
        "STOLEN_ITEMS": "चोरी का सामान",
        "SUSPECT_DETAILS": "संदिग्ध विवरण",
        "INCIDENT_DETAILS": "घटना का विवरण",
        "PRIORITY_HIGH": "उच्च (High)",
        "PRIORITY_MEDIUM": "मध्यम (Med)",
        "PRIORITY_LOW": "निम्न (Low)",
        "BNSS_HEADING": "प्रथम सूचना रिपोर्ट",
        "BNSS_SUBHEADING": "(धारा 173 बी.ఎన్.ఎస్‌.ఎస్‌ के तहत)",
        "POINT_1": "1. जिला, थाना, वर्ष, एफआईआर संख्या, दिनांक",
        "POINT_2": "2. अधिनियम और धारा(एँ)",
        "POINT_3": "3. a) अपराध की घटना: दिन, दिनांक और समय\n   b) पी.एस. में प्राप्त सूचना: दिनांक और समय\n   c) जनरल डायरी संदर्भ: प्रविष्टि संख्या, दिनांक और समय",
        "POINT_4": "4. सूचना का प्रकार",
        "POINT_5": "5. घटनास्थल: a) पी.एस. से दूरी और दिशा, बीट नंबर\n   b) पता: स्थान, क्षेत्र/मंडल, सड़क/गांव, शहर/जिला, राज्य, पिन",
        "POINT_6": "6. शिकायतकर्ता / सूचना देने वाला: a) नाम b) पिता/पति का नाम c) जन्म तिथि, आयु d) राष्ट्रीयता, जाति e) पासपोर्ट विवरण f) व्यवसाय, मोबाइल नंबर g) पता",
        "POINT_7": "7. ज्ञात/संदिग्ध/अज्ञात आरोपियों का पूर्ण विवरण:",
        "POINT_8": "8. देरी के कारण",
        "POINT_9": "9. चोरी की गई संपत्तियां",
        "POINT_10": "10. संपत्ति का कुल मूल्य",
        "POINT_11": "11. पूछताछ रिपोर्ट",
        "POINT_12": "12. शिकायत की सामग्री",
        "POINT_13": "13. की गई कार्रवाई",
        "POINT_14": "14. हस्ताक्षर",
        "POINT_15": "15. भेजने का विवरण",
        "DOWNLOAD_PDF": "पीडीएफ रिपोर्ट डाउनलोड करें",
        "CLOSE": "बंद करें",
        "RECORDS_TITLE": "मेरे एफआईआर रिकॉर्ड",
        "CLOSE_RECORDS": "रिकॉर्ड बंद करें"
    },
    'te': {
        "FIR_TITLE": "ప్రథమ సమాచార నివేదిక (FIR)",
        "FIR_SUBTITLE": "పోలీసు మిత్ర AI సహాయకుడు – రూపొందించిన నివేదిక",
        "FIR_ID": "ఎఫ్ఐఆర్ ఐడి",
        "TIMESTAMP": "సమయం",
        "CATEGORY": "వర్గం",
        "PRIORITY": "ప్రాధాన్యత",
        "DATE": "తేదీ",
        "STATUS": "స్థితి",
        "USER_DETAILS": "వినియోగదారు వివరాలు",
        "USER_NAME": "పేరు",
        "USER_EMAIL": "ఈమెయిల్",
        "USER_PHONE": "ఫొన్",
        "INCIDENT_DATE": "సంఘటన తేదీ",
        "INCIDENT_LOCATION": "సంఘటన స్థలం",
        "STOLEN_ITEMS": "దొంగిలించబడిన వస్తువులు",
        "SUSPECT_DETAILS": "నిందితుల వివరాలు",
        "INCIDENT_DETAILS": "సంఘటన వివరాలు",
        "PRIORITY_HIGH": "High (అధిక)",
        "PRIORITY_MEDIUM": "Medium (మధ్యమ)",
        "PRIORITY_LOW": "Low (తక్కువ)",
        "BNSS_HEADING": "ప్రథమ సమాచార నివేదిక",
        "BNSS_SUBHEADING": "(సెక్షన్ 173 BNSS కింద)",
        "POINT_1": "1. జిల్లా, పి.ఎస్., సంవత్సరం, ఎఫ్.ఐ.ఆర్ నెం., తేదీ",
        "POINT_2": "2. చట్టాలు & సెక్షన్(లు)",
        "POINT_3": "3. a) నేరం జరిగిన వివరం: రోజు, తేదీ & సమయం నుండి, తేదీ & సమయం వరకు\n   b) పోలీస్ స్టేషన్లో అందిన సమాచారం: తేదీ & సమయం\n   c) జనరల్ డైరీ రిఫరెన్స్: ఎంట్రీ నెం, తేదీ & సమయం",
        "POINT_4": "4. సమాచార రకం",
        "POINT_5": "5. ఘటన జరిగిన ప్రదేశం: a) పోలీస్ స్టేషన్ నుండి దూరం మరియు దిశ, బీట్ నెం.\n   b) చిరునామా: ప్రదేశం, ప్రాంతం/మండలం, వీధి/గ్రామం, నగరం/జిల్లా, రాష్ట్రం, పిన్",
        "POINT_6": "6. ఫిర్యాదుదారు / సమాచారకర్త: a) పేరు b) తండ్రి/భర్త పేరు c) పుట్టిన తేదీ, వయస్సు d) జాతీయత, కులం e) పాస్‌పోర్ట్ వివరాలు f) వృత్తి, మొబైల్ నెంబర్ g) చిరునామా",
        "POINT_7": "7. తెలిసిన/అనుమానిత/తెలియని నిందితుల పూర్తి వివరాలు:",
        "POINT_8": "8. ఆలస్యానికి కారణాలు",
        "POINT_9": "9. దొంగిలించబడిన ఆస్తులు",
        "POINT_10": "10. ఆస్తి మొత్తం విలువ",
        "POINT_11": "11. విచారణ నివేదిక",
        "POINT_12": "12. ఫిర్యాదు సారాంశం",
        "POINT_13": "13. తీసుకున్న చర్య",
        "POINT_14": "14. సంతకం",
        "POINT_15": "15. పంపిన వివరాలు",
        "DOWNLOAD_PDF": "PDF నివేదికను డౌన్లోడ్ చేయండి",
        "CLOSE": "మూసివేయి",
        "RECORDS_TITLE": "నా ఎఫ్ఐఆర్ రికార్డులు",
        "CLOSE_RECORDS": "రికార్డులను మూసివేయి"
    }
};

export const URGENCY_KEYWORDS = {
    'HIGH': [
        'emergency', 'help', 'danger', 'blood', 'accident', 'weapon', 'immediately', 'dying', 'hurt', 'urgent', 'life', 'stolen', 'fraud', 'robbery', 'attack',
        'आपातकाल', 'मदद', 'खतरा', 'खून', 'दुर्घटना', 'हथियार', 'तुरंत', 'जल्द', 'जान', 'चोरी', 'धोखाधड़ी', 'हमला',
        'అత్యవసరం', 'సహాయం', 'ప్రమాదం', 'రక్తం', 'ఆయుధం', 'వెంటనే', 'తొందరగా', 'ప్రాణం', 'దొంగతనం', 'మోసం', 'దాడి'
    ],
    'LOW': [
        'minor', 'noise', 'garbage', 'lost', 'just asking', 'small', 'nuisance', 'query', 'info',
        'मामूली', 'शोर', 'कचरा', 'खोया', 'बस पूछ रहा हूँ', 'छोटा', 'परेशानी', 'पूछताछ', 'जानकारी',
        'చిన్న', 'శబ్దం', 'చెత్త', 'పోగొట్టుకున్నాను', 'కేవలం అడుగుతున్నాను', 'తక్కువ', 'ప్రశ్న', 'సమాచారం'
    ]
};
