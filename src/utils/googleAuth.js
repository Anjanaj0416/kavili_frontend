// src/utils/googleAuth.js
// Google Authentication utility functions
// Note: You need to set up Firebase in your project first

// Import Firebase modules (make sure firebase is installed: npm install firebase)
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

// Firebase configuration
// These values come from your .env file
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
let app;
let auth;
let provider;

try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    provider = new GoogleAuthProvider();
    
    // Optional: Force account selection every time
    provider.setCustomParameters({
        prompt: 'select_account'
    });
} catch (error) {
    console.error('Firebase initialization error:', error);
}

/**
 * Sign in with Google using Firebase Authentication
 * @returns {Promise<{success: boolean, user?: object, error?: string}>}
 */
export const signInWithGoogle = async () => {
    try {
        if (!auth || !provider) {
            throw new Error('Firebase not initialized. Please check your configuration.');
        }

        const result = await signInWithPopup(auth, provider);
        
        // The signed-in user info
        const user = result.user;
        
        // Google Access Token (if needed for API calls)
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential?.accessToken;

        console.log('Google sign-in successful:', {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName
        });

        return {
            success: true,
            user: {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                emailVerified: user.emailVerified
            },
            accessToken: token
        };
    } catch (error) {
        console.error('Google sign-in error:', error);
        
        // Handle specific error cases
        let errorMessage = 'Failed to sign in with Google';
        
        if (error.code === 'auth/popup-closed-by-user') {
            errorMessage = 'Sign-in cancelled';
        } else if (error.code === 'auth/popup-blocked') {
            errorMessage = 'Pop-up blocked. Please allow pop-ups for this site';
        } else if (error.code === 'auth/cancelled-popup-request') {
            errorMessage = 'Sign-in cancelled';
        } else if (error.code === 'auth/network-request-failed') {
            errorMessage = 'Network error. Please check your connection';
        }

        return {
            success: false,
            error: errorMessage
        };
    }
};

/**
 * Sign out from Google
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const signOutGoogle = async () => {
    try {
        if (!auth) {
            throw new Error('Firebase not initialized');
        }

        await auth.signOut();
        console.log('Google sign-out successful');
        
        return {
            success: true
        };
    } catch (error) {
        console.error('Google sign-out error:', error);
        return {
            success: false,
            error: 'Failed to sign out'
        };
    }
};

/**
 * Get current Google user
 * @returns {object|null}
 */
export const getCurrentGoogleUser = () => {
    if (!auth) {
        return null;
    }
    return auth.currentUser;
};

/**
 * Check if user is signed in with Google
 * @returns {boolean}
 */
export const isGoogleSignedIn = () => {
    if (!auth) {
        return false;
    }
    return auth.currentUser !== null;
};

export default {
    signInWithGoogle,
    signOutGoogle,
    getCurrentGoogleUser,
    isGoogleSignedIn
};

provider.setCustomParameters({
    prompt: 'select_account'
});