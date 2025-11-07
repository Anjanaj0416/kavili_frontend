import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { signInWithGoogle } from '../utils/googleAuth';
import { signInWithFacebook } from '../utils/facebookAuth';
import FacebookAuthDiagnostic from '../components/FacebookAuthDiagnostic';

export default function Register() {
    const navigate = useNavigate();
    const [googleLoading, setGoogleLoading] = useState(false);
    const [facebookLoading, setFacebookLoading] = useState(false);

    // Handle Google Sign-In
    const handleGoogleSignIn = async () => {
        setGoogleLoading(true);
        try {
            const result = await signInWithGoogle();
            
            if (result.success && result.user) {
                toast.success('Google authentication successful! Please complete your profile.');
                
                // Parse name into first and last name
                const nameParts = result.user.displayName ? result.user.displayName.split(' ') : ['', ''];
                const firstName = nameParts[0] || '';
                const lastName = nameParts.slice(1).join(' ') || '';

                // Prepare user data for profile completion
                const googleUserData = {
                    providerId: result.user.uid,
                    providerName: 'google',
                    email: result.user.email,
                    displayName: result.user.displayName,
                    firstName: firstName,
                    lastName: lastName,
                    photoURL: result.user.photoURL
                };

                // Store in sessionStorage for CompleteProfile page
                sessionStorage.setItem('socialUserData', JSON.stringify(googleUserData));

                // Navigate to complete profile page
                navigate('/complete-profile', { 
                    state: { socialUserData: googleUserData }
                });
            } else {
                toast.error(result.error || 'Failed to sign in with Google. Please try again.');
            }
        } catch (error) {
            console.error('Google sign-in error:', error);
            toast.error('An error occurred during Google sign-in. Please try again.');
        } finally {
            setGoogleLoading(false);
        }
    };

    // Handle Facebook Sign-In
    const handleFacebookSignIn = async () => {
        setFacebookLoading(true);
        try {
            const result = await signInWithFacebook();
            
            if (result.success && result.user) {
                toast.success('Facebook authentication successful! Please complete your profile.');
                
                // Prepare user data for profile completion
                const facebookUserData = {
                    providerId: result.user.uid,
                    providerName: 'facebook',
                    email: result.user.email,
                    displayName: result.user.displayName,
                    firstName: result.user.firstName,
                    lastName: result.user.lastName,
                    photoURL: result.user.photoURL
                };

                // Store in sessionStorage for CompleteProfile page
                sessionStorage.setItem('socialUserData', JSON.stringify(facebookUserData));

                // Navigate to complete profile page
                navigate('/complete-profile', { 
                    state: { socialUserData: facebookUserData }
                });
            } else {
                toast.error(result.error || 'Failed to sign in with Facebook. Please try again.');
            }
        } catch (error) {
            console.error('Facebook sign-in error:', error);
            toast.error('An error occurred during Facebook sign-in. Please try again.');
        } finally {
            setFacebookLoading(false);
        }
    };

    const handleBackClick = () => {
        navigate('/');
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Decorative */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-orange-400 via-red-500 to-pink-500 relative overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-black opacity-10"></div>
                    <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full opacity-70"></div>
                    <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-br from-pink-400 to-red-500 rounded-full opacity-60"></div>
                    <div className="absolute left-50 top-1/3 w-48 h-48 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full opacity-60"></div>
                    <div className="absolute left-70 top-2/3 w-40 h-40 bg-gradient-to-br from-red-500 to-orange-600 rounded-full opacity-50"></div>
                    <div className="absolute left-[300px] top-1/2 w-56 h-56 bg-gradient-to-br from-orange-600 to-red-600 rounded-full opacity-40"></div>
                </div>
                <div className="w-full h-full flex items-center justify-center my-9">
                    <span className="text-6xl font-bold text-white flex text-center">Register</span>
                </div>
            </div>

            {/* Right Side - Registration Form */}
            <div className="flex items-center justify-center p-4 w-full lg:w-1/2">
                <div className="w-full max-w-md">
                    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6">
                            <h2 className="text-3xl font-bold text-white text-center">Create Account</h2>
                            <p className="text-white text-center mt-2 text-sm">Choose your preferred sign-in method</p>
                        </div>

                        {/* Content */}
                        <div className="p-8">
                            <div className="space-y-6">
                                {/* Info Message */}
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <p className="text-sm text-blue-800">
                                        <strong>📝 Registration Process:</strong><br />
                                        1. Sign in with Google or Facebook<br />
                                        2. Complete your profile with additional details<br />
                                        3. Start shopping!
                                    </p>
                                </div>

                                {/* Google Sign-In Button */}
                                <button
                                    onClick={handleGoogleSignIn}
                                    disabled={googleLoading || facebookLoading}
                                    className="w-full bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 py-3 px-4 rounded-lg font-semibold transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed shadow-md hover:shadow-lg flex items-center justify-center gap-3"
                                >
                                    {googleLoading ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                                            <span>Connecting with Google...</span>
                                        </div>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                            </svg>
                                            <span>Continue with Google</span>
                                        </>
                                    )}
                                </button>

                                {/* Facebook Sign-In Button */}
                                <button
                                    onClick={handleFacebookSignIn}
                                    disabled={googleLoading || facebookLoading}
                                    className="w-full bg-[#1877F2] hover:bg-[#166FE5] text-white py-3 px-4 rounded-lg font-semibold transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md hover:shadow-lg flex items-center justify-center gap-3"
                                >
                                    {facebookLoading ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>Connecting with Facebook...</span>
                                        </div>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                            </svg>
                                            <span>Continue with Facebook</span>
                                        </>
                                    )}
                                </button>

                                {/* Divider */}
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-300"></div>
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-2 bg-white text-gray-500">or</span>
                                    </div>
                                </div>

                                {/* Login Link */}
                                <div className="text-center">
                                    <p className="text-sm text-gray-600">
                                        Already have an account?{' '}
                                        <button
                                            onClick={() => navigate('/login')}
                                            className="font-semibold text-orange-600 hover:text-orange-700 transition-colors"
                                        >
                                            Sign in here
                                        </button>
                                    </p>
                                </div>

                                {/* Back Button */}
                                <button
                                    onClick={handleBackClick}
                                    className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-lg font-semibold transition-colors duration-200"
                                >
                                    ← Back to Home
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <FacebookAuthDiagnostic />
        </div>
    );
}