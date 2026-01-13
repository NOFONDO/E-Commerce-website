// Firebase Authentication Configuration
// Replace these values with your Firebase project configuration
// You can find these in Firebase Console > Project Settings > General > Your apps
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

// Sign Up Function
async function signUp(email, password, fullName) {
    console.log('Attempting sign up for:', email);
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

// Export functions to window
window.auth = {
    initFirebase,
    signUp,
    signIn,
    signOut,
    getCurrentUser,
    onAuthStateChanged
};