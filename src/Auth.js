// Firebase Authentication Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBFxw2DJsdWHF5ODd0WcxzE3_OsFaXwiL8",
    authDomain: "kimbinotes.firebaseapp.com",
    projectId: "kimbinotes",
    storageBucket: "kimbinotes.firebasestorage.app",
    messagingSenderId: "133017364214",
    appId: "1:133017364214:web:1993e4d267103fe0ef2ed7",
    measurementId: "G-63H25HJWE4"
  };

let auth;
let app;
let db;

// Initialize Firebase
function initFirebase() {
    // Wait for Firebase SDK to be available
    if (typeof firebase === 'undefined' || typeof firebase.initializeApp !== 'function') {
        console.error('CRITICAL: Firebase SDK is not loaded. Ensure the CDN script tags are present and loaded.');
        console.error('Firebase scripts should be loaded before auth.js in the HTML head section.');
        console.error('Current window.firebase:', typeof firebase);
        alert('System Error: Firebase SDK not loaded. Please refresh the page. If the error persists, check your internet connection and that Firebase CDN scripts are accessible.');
        return null;
    }
    
    if (!app) {
        try {
            console.log('Initializing Firebase app with config:', firebaseConfig);
            console.log('Firebase SDK available:', typeof firebase);
            console.log('Firebase apps:', firebase.apps);
            
            // Check if Firebase app is already initialized
            if (firebase.apps && firebase.apps.length > 0) {
                console.log('Firebase app already exists, using existing instance');
                app = firebase.app();
            } else {
                // App doesn't exist, initialize it
                console.log('Creating new Firebase app...');
                if (!firebaseConfig || !firebaseConfig.apiKey) {
                    throw new Error('Firebase config is missing or incomplete. Please check your firebaseConfig object in auth.js');
                }
                app = firebase.initializeApp(firebaseConfig);
                console.log('Firebase app created successfully');
            }
            
            auth = firebase.auth();
            console.log('Firebase initialized successfully.');
            console.log('Auth instance created:', !!auth);
            return auth;
        } catch (err) {
            console.error('Failed to initialize Firebase:', err);
            console.error('Error details:', {
                message: err.message,
                code: err.code,
                name: err.name
            });
            console.error('Firebase config object:', firebaseConfig);
            console.error('Firebase available:', typeof firebase);
            alert('System Error: Failed to initialize Firebase.\n\nError: ' + err.message + '\n\nPlease check the browser console (F12) for more details.');
            return null;
        }
    }
    return auth;
}

// Initialize Firestore
function initFirestore() {
    if (db) return db;
    const firebaseAuth = initFirebase();
    if (!firebaseAuth) return null;
    if (typeof firebase.firestore !== 'function') {
        console.error('Firestore SDK not loaded.');
        return null;
    }
    db = firebase.firestore();
    return db;
}

// Email validation function
function validateEmail(email) {
    if (!email || typeof email !== 'string') {
        return { isValid: false, message: 'Email is required' };
    }
    
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
        return { isValid: false, message: 'Email is required' };
    }
    
    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
        return { isValid: false, message: 'Please enter a valid email address' };
    }
    
    // Additional checks
    if (trimmedEmail.length > 254) {
        return { isValid: false, message: 'Email address is too long' };
    }
    
    const localPart = trimmedEmail.split('@')[0];
    if (localPart.length > 64) {
        return { isValid: false, message: 'Email address is invalid' };
    }
    
    return { isValid: true, message: '' };
}

// Password validation function
function validatePassword(password) {
    if (!password || typeof password !== 'string') {
        return { isValid: false, message: 'Password is required' };
    }
    
    if (password.length < 6) {
        return { isValid: false, message: 'Password must be at least 6 characters long' };
    }
    
    if (password.length > 128) {
        return { isValid: false, message: 'Password is too long' };
    }
    
    // Check for common weak passwords
    const commonPasswords = ['password', '123456', '123456789', 'qwerty', 'abc123', 'password123'];
    if (commonPasswords.includes(password.toLowerCase())) {
        return { isValid: false, message: 'Please choose a stronger password' };
    }
    
    return { isValid: true, message: '' };
}

// Sign Up Function
async function signUp(email, password, fullName) {
    console.log('Attempting sign up for:', email);
    
    // Validate inputs before Firebase call
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
        return { data: null, error: { message: emailValidation.message, code: 'invalid-email' } };
    }
    
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
        return { data: null, error: { message: passwordValidation.message, code: 'invalid-password' } };
    }
    
    if (!fullName || typeof fullName !== 'string' || !fullName.trim()) {
        return { data: null, error: { message: 'Full name is required', code: 'invalid-name' } };
    }
    
    const firebaseAuth = initFirebase();
    if (!firebaseAuth) return { error: { message: 'Firebase not initialized' } };

    try {
        const userCredential = await firebaseAuth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Update profile with display name
        if (fullName && user) {
            await user.updateProfile({
                displayName: fullName
            });
        }

        // Store user profile in Firestore
        try {
            const firestore = initFirestore();
            if (firestore && user?.uid) {
                await firestore.collection('users').doc(user.uid).set({
                    uid: user.uid,
                    email: user.email,
                    displayName: fullName,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });
            }
        } catch (err) {
            console.error('Failed to save user profile:', err);
        }
        
        console.log('Sign up successful:', user);
        return { data: { user: user }, error: null };
    } catch (error) {
        console.error('Sign up error:', error);
        return { data: null, error: { message: error.message, code: error.code } };
    }
}

// Sign In Function
async function signIn(email, password) {
    console.log('Attempting sign in for:', email);
    
    // Validate inputs before Firebase call
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
        return { data: null, error: { message: emailValidation.message, code: 'invalid-email' } };
    }
    
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
        return { data: null, error: { message: passwordValidation.message, code: 'invalid-password' } };
    }
    
    const firebaseAuth = initFirebase();
    if (!firebaseAuth) return { error: { message: 'Firebase not initialized' } };

    try {
        const userCredential = await firebaseAuth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        console.log('Sign in successful:', user);
        return { data: { user: user }, error: null };
    } catch (error) {
        console.error('Sign in error:', error);
        return { data: null, error: { message: error.message, code: error.code } };
    }
}

// Save/merge user profile (can be used after sign in)
async function saveUserProfile(userData) {
    try {
        const firestore = initFirestore();
        if (!firestore || !userData?.uid) return;
        await firestore.collection('users').doc(userData.uid).set({
            uid: userData.uid,
            email: userData.email || '',
            displayName: userData.displayName || '',
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
    } catch (err) {
        console.error('saveUserProfile error:', err);
    }
}

// Fetch all users (requires Firestore rules to allow admin read)
async function fetchAllUsers() {
    try {
        const firestore = initFirestore();
        if (!firestore) return [];
        const snapshot = await firestore.collection('users').orderBy('createdAt', 'desc').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (err) {
        console.error('fetchAllUsers error:', err);
        return [];
    }
}

// Sign Out Function
async function signOut() {
    const firebaseAuth = initFirebase();
    if (!firebaseAuth) return { error: { message: 'Firebase not initialized' } };

    try {
        await firebaseAuth.signOut();
        console.log('Sign out successful');
        return { error: null };
    } catch (error) {
        console.error('Sign out error:', error);
        return { error: { message: error.message, code: error.code } };
    }
}

// Get Current User
async function getCurrentUser() {
    const firebaseAuth = initFirebase();
    if (!firebaseAuth) return null;

    try {
        const user = firebaseAuth.currentUser;
        if (user) {
            return {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                emailVerified: user.emailVerified
            };
        }
        return null;
    } catch (error) {
        console.error('Error getting current user:', error);
        return null;
    }
}

// Listen for auth state changes
function onAuthStateChanged(callback) {
    const firebaseAuth = initFirebase();
    if (!firebaseAuth) return null;
    
    return firebaseAuth.onAuthStateChanged(callback);
}

// Send password reset email
async function resetPassword(email) {
    console.log('Attempting password reset for:', email);

    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
        return { data: null, error: { message: emailValidation.message, code: 'invalid-email' } };
    }

    const firebaseAuth = initFirebase();
    if (!firebaseAuth) return { error: { message: 'Firebase not initialized' } };

    try {
        await firebaseAuth.sendPasswordResetEmail(email);
        console.log('Password reset email sent');
        return { data: true, error: null };
    } catch (error) {
        console.error('Password reset error:', error);
        return { data: null, error: { message: error.message, code: error.code } };
    }
}

// Admin helper
const ADMIN_EMAIL = 'luxeshop@gmail.com';

function isAdmin(email) {
    if (!email || typeof email !== 'string') return false;
    return email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();
}

// Export functions to window
window.auth = {
    initFirebase,
    signUp,
    signIn,
    signOut,
    getCurrentUser,
    onAuthStateChanged,
    validateEmail,
    validatePassword,
    initFirestore,
    saveUserProfile,
    fetchAllUsers,
    isAdmin,
    resetPassword,
    ADMIN_EMAIL
};