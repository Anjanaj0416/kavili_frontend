// src/utils/facebookAuth.js
// Facebook Authentication utility functions using Firebase
// IMPROVED VERSION with better error handling and debugging

import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInWithPopup, FacebookAuthProvider } from 'firebase/auth';

// Firebase configuration (same as Google auth)
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase (only if not already initialized)
let app;
let auth;
let provider;

try {
    // Check if Firebase is already initialized
    if (getApps().length === 0) {
        app = initializeApp(firebaseConfig);
        console.log('✅ Firebase initialized for Facebook auth');
    } else {
        app = getApps()[0];
        console.log('✅ Using existing Firebase instance');
    }
    
    auth = getAuth(app);
    provider = new FacebookAuthProvider();
    
    // Request specific permissions
    provider.addScope('email');
    provider.addScope('public_profile');
    
    // Optional: Force account selection
    provider.setCustomParameters({
        display: 'popup'
    });
    
    console.log('✅ Facebook auth provider configured successfully');
} catch (error) {
    console.error('❌ Firebase initialization error:', error);
    console.error('Please check your Firebase configuration in .env file');
}

/**
 * Sign in with Facebook using Firebase Authentication
 * @returns {Promise<{success: boolean, user?: object, error?: string}>}
 */
export const signInWithFacebook = async () => {
    console.log('🔵 Facebook sign-in initiated...');
    
    try {
        // Check if Firebase is initialized
        if (!auth || !provider) {
            throw new Error('Firebase not initialized. Please check your configuration.');
        }

        // Check if environment variables are set
        if (!import.meta.env.VITE_FIREBASE_API_KEY) {
            throw new Error('Firebase API key not found in environment variables');
        }

        console.log('🔵 Opening Facebook authentication popup...');
        const result = await signInWithPopup(auth, provider);
        
        // The signed-in user info
        const user = result.user;
        
        // Facebook Access Token (if needed for API calls)
        const credential = FacebookAuthProvider.credentialFromResult(result);
        const token = credential?.accessToken;

        console.log('✅ Facebook sign-in successful:', {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName
        });

        // Parse name into first and last name
        const nameParts = user.displayName ? user.displayName.split(' ') : ['', ''];
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        return {
            success: true,
            user: {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                firstName: firstName,
                lastName: lastName,
                photoURL: user.photoURL,
                emailVerified: user.emailVerified
            },
            accessToken: token
        };
    } catch (error) {
        console.error('❌ Facebook sign-in error:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        
        // Handle specific error cases with detailed messages
        let errorMessage = 'Failed to sign in with Facebook';
        
        if (error.code === 'auth/operation-not-allowed') {
            errorMessage = 'Facebook authentication is not enabled. Please contact support.';
            console.error('🔧 FIX: Enable Facebook authentication in Firebase Console:');
            console.error('   1. Go to Firebase Console → Authentication → Sign-in method');
            console.error('   2. Enable Facebook provider');
            console.error('   3. Add your Facebook App ID and App Secret');
            console.error('   4. Make sure Facebook app is in Live mode (not Development)');
        } else if (error.code === 'auth/popup-closed-by-user') {
            errorMessage = 'Sign-in cancelled';
        } else if (error.code === 'auth/popup-blocked') {
            errorMessage = 'Pop-up blocked. Please allow pop-ups for this site';
            console.error('🔧 FIX: Enable popups in your browser settings');
        } else if (error.code === 'auth/cancelled-popup-request') {
            errorMessage = 'Sign-in cancelled';
        } else if (error.code === 'auth/network-request-failed') {
            errorMessage = 'Network error. Please check your connection';
        } else if (error.code === 'auth/account-exists-with-different-credential') {
            errorMessage = 'An account already exists with the same email address but different sign-in credentials. Try signing in with Google instead.';
        } else if (error.code === 'auth/invalid-credential') {
            errorMessage = 'Invalid Facebook credentials. Please try again';
        } else if (error.code === 'auth/user-disabled') {
            errorMessage = 'This account has been disabled';
        } else if (error.code === 'auth/unauthorized-domain') {
            errorMessage = 'This domain is not authorized. Please contact support.';
            console.error('🔧 FIX: Add this domain to Firebase authorized domains:');
            console.error('   Firebase Console → Authentication → Settings → Authorized domains');
        }
        
        return {
            success: false,
            error: errorMessage,
            errorCode: error.code
        };
    }
};

/**
 * Sign out the current user
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const signOutFacebook = async () => {
    try {
        if (!auth) {
            throw new Error('Firebase not initialized');
        }
        
        await auth.signOut();
        console.log('✅ Facebook sign-out successful');
        
        return {
            success: true
        };
    } catch (error) {
        console.error('❌ Facebook sign-out error:', error);
        return {
            success: false,
            error: 'Failed to sign out'
        };
    }
};

// Export auth instance for debugging (optional)
export const getFacebookAuth = () => auth;

// Debug function to check configuration
export const debugFacebookAuth = () => {
    console.log('🔍 Facebook Auth Configuration:');
    console.log('   Firebase App:', !!app);
    console.log('   Auth Instance:', !!auth);
    console.log('   Facebook Provider:', !!provider);
    console.log('   API Key Set:', !!import.meta.env.VITE_FIREBASE_API_KEY);
    console.log('   Project ID:', import.meta.env.VITE_FIREBASE_PROJECT_ID);
    
    if (!import.meta.env.VITE_FIREBASE_API_KEY) {
        console.error('❌ Firebase API key is missing!');
        console.error('   Add VITE_FIREBASE_API_KEY to your .env file');
    }
    
    return {
        configured: !!app && !!auth && !!provider,
        hasApiKey: !!import.meta.env.VITE_FIREBASE_API_KEY
    };
};