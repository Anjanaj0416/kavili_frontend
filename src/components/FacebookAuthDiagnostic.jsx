// FacebookAuthDiagnostic.jsx
// Temporary diagnostic component to help debug Facebook authentication
// Add this to your register page temporarily to check configuration

import React, { useEffect, useState } from 'react';
import { debugFacebookAuth } from '../utils/facebookAuth';

export default function FacebookAuthDiagnostic() {
    const [diagnostics, setDiagnostics] = useState(null);

    useEffect(() => {
        // Run diagnostics when component mounts
        const results = debugFacebookAuth();
        setDiagnostics(results);

        // Also check environment variables
        const envCheck = {
            hasApiKey: !!import.meta.env.VITE_FIREBASE_API_KEY,
            hasAuthDomain: !!import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
            hasProjectId: !!import.meta.env.VITE_FIREBASE_PROJECT_ID,
            hasStorageBucket: !!import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
            hasMessagingSenderId: !!import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
            hasAppId: !!import.meta.env.VITE_FIREBASE_APP_ID,
            projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'NOT SET'
        };

        console.log('🔍 Environment Variables Check:', envCheck);
    }, []);

    if (!diagnostics) {
        return null;
    }

    // Only show in development
    if (import.meta.env.MODE !== 'development') {
        return null;
    }

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            background: diagnostics.configured ? '#10b981' : '#ef4444',
            color: 'white',
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            zIndex: 9999,
            maxWidth: '300px'
        }}>
            <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                {diagnostics.configured ? '✅ Firebase Configured' : '❌ Configuration Error'}
            </div>
            <div style={{ fontSize: '11px', opacity: 0.9 }}>
                {diagnostics.configured 
                    ? 'If Facebook login still fails, check Firebase Console'
                    : 'Check browser console for details'}
            </div>
        </div>
    );
}

// TEMPORARY USAGE:
// Add this to your register.jsx file:
//
// import FacebookAuthDiagnostic from '../components/FacebookAuthDiagnostic';
//
// Then inside your Register component's return statement:
//
// <FacebookAuthDiagnostic />
//
// This will show a small status indicator in the bottom-right corner
// Remove it once Facebook auth is working!