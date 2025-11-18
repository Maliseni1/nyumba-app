import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { googleLogin as googleLoginApi } from '../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { FaGoogle } from 'react-icons/fa';

// --- 1. IMPORT CAPACITOR PLUGINS ---
import { Capacitor } from '@capacitor/core';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';

const GoogleLoginButton = () => {
    const { login } = useAuth();
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    
    // --- 2. CHECK IF WE ARE IN THE NATIVE APP ---
    const isNative = Capacitor.isNativePlatform();

    if (!googleClientId || googleClientId === 'placeholder-google-client-id') {
        return null;
    }

    // --- 3. HANDLER FOR WEB-BASED LOGIN ---
    const handleWebGoogleSuccess = async (credentialResponse) => {
        try {
            const idToken = credentialResponse.credential;
            const { data } = await googleLoginApi(idToken);
            login(data); 
        } catch (error) {
            toast.error(error.response?.data?.message || 'Google Login failed');
        }
    };

    const handleWebGoogleError = () => {
        toast.error('Google Login was unsuccessful. Please try again.');
    };
    
    // --- 4. HANDLER FOR NATIVE MOBILE APP LOGIN ---
    const handleNativeGoogleLogin = async () => {
        try {
            // This opens the phone's native Google account picker
            const result = await GoogleAuth.signIn();
            
            if (result.authentication.idToken) {
                // Send the native token to our backend, just like the web version
                const { data } = await googleLoginApi(result.authentication.idToken);
                login(data);
            } else {
                toast.error('Could not get Google token. Please try again.');
            }
        } catch (error) {
            console.error("Native Google login error", error);
            toast.error('Google Login failed. Please try again.');
        }
    };

    // --- 5. RENDER THE CORRECT BUTTON ---
    return (
        <div className="flex justify-center">
            {isNative ? (
                // --- RENDER NATIVE BUTTON ---
                <button
                    type="button"
                    onClick={handleNativeGoogleLogin}
                    className="flex items-center justify-center gap-3 w-full px-4 py-3 bg-card-color border border-border-color rounded-full shadow-sm text-text-color hover:bg-border-color focus:outline-none focus:ring-2 focus:ring-accent-color focus:ring-offset-2 transition-colors"
                >
                    <FaGoogle />
                    <span className="font-semibold">Sign in with Google</span>
                </button>
            ) : (
                // --- RENDER WEB BUTTON ---
                <GoogleLogin 
                    onSuccess={handleWebGoogleSuccess} 
                    onError={handleWebGoogleError} 
                    useOneTap 
                    theme="outline" 
                    shape="pill" 
                />
            )}
        </div>
    );
};

export default GoogleLoginButton;