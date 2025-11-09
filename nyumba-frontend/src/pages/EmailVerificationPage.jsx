import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { verifyEmail } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FaCheckCircle, FaExclamationTriangle, FaSpinner } from 'react-icons/fa';

const EmailVerificationPage = () => {
    const { token } = useParams();
    const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (token) {
            const verify = async () => {
                try {
                    const { data } = await verifyEmail(token);
                    // Log the user in and save their data
                    login(data); 
                    setStatus('success');
                    // Redirect to home (or profile completion) will be handled by login()
                } catch (err) {
                    setError(err.response?.data?.message || 'Verification failed.');
                    setStatus('error');
                }
            };
            verify();
        } else {
            // If no token, just show an info page
            setStatus('info');
        }
    }, [token, login, navigate]);

    return (
        <div className="pt-24 min-h-screen flex items-center justify-center">
            <div className="max-w-md w-full bg-card-color p-8 rounded-lg border border-border-color text-center">
                {status === 'loading' && (
                    <>
                        <FaSpinner className="animate-spin text-accent-color h-16 w-16 mx-auto mb-6" />
                        <h1 className="text-3xl font-bold text-text-color">Verifying...</h1>
                        <p className="text-subtle-text-color mt-2">Please wait while we verify your email.</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <FaCheckCircle className="text-green-500 h-16 w-16 mx-auto mb-6" />
                        <h1 className="text-3xl font-bold text-text-color">Success!</h1>
                        <p className="text-subtle-text-color mt-2">Your email has been verified. You are now being redirected...</p>
                        <Link to="/" className="inline-block mt-4 bg-accent-color text-white font-bold py-2 px-4 rounded-md hover:bg-accent-hover-color">
                            Go to Homepage
                        </Link>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <FaExclamationTriangle className="text-red-500 h-16 w-16 mx-auto mb-6" />
                        <h1 className="text-3xl font-bold text-text-color">Verification Failed</h1>
                        <p className="text-red-400 mt-2">{error}</p>
                        <Link to="/login" className="inline-block mt-4 bg-accent-color text-white font-bold py-2 px-4 rounded-md hover:bg-accent-hover-color">
                            Back to Login
                        </Link>
                    </>
                )}
                
                {status === 'info' && (
                    <>
                        <FaCheckCircle className="text-blue-500 h-16 w-16 mx-auto mb-6" />
                        <h1 className="text-3xl font-bold text-text-color">Check Your Email</h1>
                        <p className="text-subtle-text-color mt-2">
                            If you just registered, please check your inbox for a verification link.
                        </p>
                        <Link to="/login" className="inline-block mt-4 bg-accent-color text-white font-bold py-2 px-4 rounded-md hover:bg-accent-hover-color">
                            Back to Login
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
};

export default EmailVerificationPage;