// src/utils/facebookAuth.js - UPDATED VERSION WITH BETTER ERROR HANDLING
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, FacebookAuthProvider } from 'firebase/auth';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

let app;
let auth;
let provider;

try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    provider = new FacebookAuthProvider();
    
    provider.setCustomParameters({
        display: 'popup'
    });
} catch (error) {
    console.error('Firebase initialization error:', error);
}

export const signInWithFacebook = async () => {
    try {
        if (!auth || !provider) {
            throw new Error('Firebase not initialized. Please check your configuration.');
        }

        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        const credential = FacebookAuthProvider.credentialFromResult(result);
        const token = credential?.accessToken;

        console.log('Facebook sign-in successful:', {
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
        console.error('Facebook sign-in error:', error);
        
        let errorMessage = 'Failed to sign in with Facebook';
        
        // Handle specific Firebase error codes
        if (error.code === 'auth/account-exists-with-different-credential') {
            errorMessage = 'This email is already registered with a different sign-in method (Google or traditional). Please use that method to log in.';
        } else if (error.code === 'auth/popup-closed-by-user') {
            errorMessage = 'Sign-in cancelled';
        } else if (error.code === 'auth/popup-blocked') {
            errorMessage = 'Pop-up blocked. Please allow pop-ups for this site';
        } else if (error.code === 'auth/cancelled-popup-request') {
            errorMessage = 'Sign-in cancelled';
        } else if (error.code === 'auth/network-request-failed') {
            errorMessage = 'Network error. Please check your connection';
        } else if (error.code === 'auth/invalid-credential') {
            errorMessage = 'Invalid Facebook credentials';
        } else if (error.code === 'auth/operation-not-allowed') {
            errorMessage = 'Facebook sign-in is not enabled. Please contact support.';
        }

        return {
            success: false,
            error: errorMessage,
            errorCode: error.code
        };
    }
};

export const debugFacebookAuth = () => {
    const config = {
        firebaseInitialized: !!app,
        authInitialized: !!auth,
        providerInitialized: !!provider,
        hasApiKey: !!import.meta.env.VITE_FIREBASE_API_KEY,
        hasAuthDomain: !!import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        hasProjectId: !!import.meta.env.VITE_FIREBASE_PROJECT_ID,
        configured: !!app && !!auth && !!provider
    };
    
    console.log('🔍 Facebook Auth Debug:', config);
    return config;
};