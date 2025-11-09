import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { googleLogin as googleLoginApi } from '../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext'; // 1. IMPORT useAuth

const GoogleLoginButton = () => {
    const { login } = useAuth(); // 2. GET THE LOGIN FUNCTION
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (!googleClientId || googleClientId === 'placeholder-google-client-id') {
        return null;
    }

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const idToken = credentialResponse.credential;
            const { data } = await googleLoginApi(idToken);
            
            // 3. USE THE CONTEXT'S LOGIN FUNCTION
            // This will handle setting local storage, state, AND the redirect.
            login(data); 
            
        } catch (error) {
            toast.error(error.response?.data?.message || 'Google Login failed');
        }
    };

    const handleGoogleError = () => {
        toast.error('Google Login was unsuccessful. Please try again.');
    };

    return (
        <div className="flex justify-center">
            <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError} useOneTap theme="outline" shape="pill" />
        </div>
    );
};
export default GoogleLoginButton;