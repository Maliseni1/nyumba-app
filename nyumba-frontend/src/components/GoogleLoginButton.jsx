import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { googleLogin as googleLoginApi } from '../services/api';
import { toast } from 'react-toastify';

const GoogleLoginButton = () => {
    const navigate = useNavigate();

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const idToken = credentialResponse.credential;
            const { data } = await googleLoginApi(idToken);
            localStorage.setItem('user', JSON.stringify(data));
            navigate('/');
            window.location.reload();
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