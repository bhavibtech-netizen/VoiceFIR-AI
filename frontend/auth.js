import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    GoogleAuthProvider, 
    signInWithPopup, 
    signInWithRedirect,
    getRedirectResult,
    onAuthStateChanged,
    signOut,
    setPersistence,
    browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import firebaseConfig from "./firebase-config.js";

// Initialize Firebase
let auth;
try {
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    setPersistence(auth, browserLocalPersistence);
} catch (error) {
    console.error("Firebase Initialization Error:", error);
}

// --- Handle Redirect Result (Post-Login) ---
if (auth) {
    getRedirectResult(auth).then((result) => {
        if (result && result.user) {
            const user = result.user;
            const existingInfo = JSON.parse(localStorage.getItem('voicefir_user') || '{}');
            localStorage.setItem('voicefir_user', JSON.stringify({ 
                fullName: user.displayName, 
                email: user.email, 
                uid: user.uid,
                photoURL: user.photoURL,
                phone: user.phoneNumber || existingInfo.phone || 'Not Provided'
            }));
            window.location.href = 'index.html';
        }
    }).catch((error) => {
        console.error("Redirect Auth Error:", error);
        if (error.message.includes('missing initial state')) {
            alert("Storage access error. Please ensure third-party cookies are allowed or try a non-private window.");
        }
    });
}

const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const googleBtn = document.getElementById('google-login') || document.getElementById('google-signup');

// --- Signup Logic ---
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fullName = document.getElementById('full-name').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const password = document.getElementById('password').value;

        try {
            if (auth && firebaseConfig.apiKey !== "YOUR_API_KEY") {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
                // Save additional profile info to localStorage for the chat
                const profile = { fullName, email, phone, uid: user.uid };
                localStorage.setItem('voicefir_user', JSON.stringify(profile));
                window.location.href = 'index.html';
            } else {
                // DEMO MODE FALLBACK
                console.warn("Using Demo Mode (Firebase not configured)");
                const profile = { fullName, email, phone, uid: "demo-user-" + Date.now() };
                localStorage.setItem('voicefir_user', JSON.stringify(profile));
                alert("Demo Account Created Successfully!");
                window.location.href = 'index.html';
            }
        } catch (error) {
            alert("Signup Error: " + error.message);
        }
    });
}

// --- Login Logic ---
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const phoneInput = document.getElementById('phone');
        const phone = phoneInput ? phoneInput.value.trim() : 'Not Provided';
        
        if (phone && phone !== 'Not Provided') {
            localStorage.setItem('last_entered_phone', phone);
        }

        try {
            if (auth && firebaseConfig.apiKey !== "YOUR_API_KEY") {
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
                // Get existing info or use what we have
                const existingInfo = JSON.parse(localStorage.getItem('voicefir_user') || '{}');
                const finalPhone = phone !== 'Not Provided' ? phone : (existingInfo.phone || 'Not Provided');
                
                localStorage.setItem('voicefir_user', JSON.stringify({ 
                    email: email, 
                    uid: user.uid, 
                    fullName: user.displayName || existingInfo.fullName || "Logged In User", 
                    phone: finalPhone 
                }));
                window.location.href = 'index.html';
            } else {
                // DEMO MODE FALLBACK
                console.warn("Using Demo Mode (Firebase not configured)");
                if (email && password) {
                    const existingInfo = JSON.parse(localStorage.getItem('voicefir_user') || '{}');
                    const finalPhone = phone !== 'Not Provided' ? phone : (existingInfo.phone || 'Not Provided');
                    
                    localStorage.setItem('voicefir_user', JSON.stringify({ 
                        email: email, 
                        fullName: existingInfo.fullName || "Demo User", 
                        phone: finalPhone, 
                        uid: "demo-id" 
                    }));
                    window.location.href = 'index.html';
                }
            }
        } catch (error) {
            let friendlyMsg = error.message;
            if (error.code === 'auth/invalid-credential') {
                friendlyMsg = "Invalid email or password. Please verify your credentials or click 'Sign Up' below to create a new account.";
            } else if (error.code === 'auth/user-not-found') {
                friendlyMsg = "Account not found. Please click 'Sign Up' below to create a new account.";
            } else if (error.code === 'auth/wrong-password') {
                friendlyMsg = "Incorrect password. Please try again.";
            }
            alert("Login Error: " + friendlyMsg);
        }
    });
}

// --- Google Auth Logic ---
if (googleBtn) {
    googleBtn.addEventListener('click', async () => {
        try {
            if (auth && firebaseConfig.apiKey !== "YOUR_API_KEY") {
                const provider = new GoogleAuthProvider();
                // Switching to Redirect to avoid 'missing initial state' popup errors
                await signInWithRedirect(auth, provider);
            } else {
                // DEMO MODE FALLBACK
                const existingInfo = JSON.parse(localStorage.getItem('voicefir_user') || '{}');
                localStorage.setItem('voicefir_user', JSON.stringify({ 
                    fullName: "Google Demo User", 
                    email: "google@demo.com", 
                    uid: "g-demo",
                    phone: existingInfo.phone || 'Not Provided'
                }));
                window.location.href = 'index.html';
            }
        } catch (error) {
            let friendlyMsg = error.message;
            if (error.code === 'auth/unauthorized-domain') {
                friendlyMsg = "This domain (localhost) is not authorized in your Firebase console. Please add 'localhost' to your authorized domains in Firebase Authentication settings.";
            } else if (error.message.includes('missing initial state')) {
                friendlyMsg = "Initial state missing. This often happens if third-party cookies are blocked or you are in Private/Incognito mode. Please try a normal window or use Email/Password login.";
            }
            alert("Google Auth Error: " + friendlyMsg);
        }
    });
}

// --- Auth State Observer ---
if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname === '/VoiceFIR-AI/') {
    const user = JSON.parse(localStorage.getItem('voicefir_user'));
    if (!user) {
        window.location.href = 'login.html';
    }
}

export function logout() {
    localStorage.removeItem('voicefir_user');
    if (auth) signOut(auth);
    window.location.href = 'login.html';
}
