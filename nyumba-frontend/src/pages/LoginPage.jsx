import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
// --- 1. IMPORT resendVerificationEmail ---
import { loginUser, resendVerificationEmail } from '../services/api';
import { toast } from 'react-toastify';
import GoogleLoginButton from '../components/GoogleLoginButton';
import { useAuth } from '../context/AuthContext';
import { FaSpinner } from 'react-icons/fa'; // Import spinner

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    // --- 2. NEW STATE for resend link ---
    const [showResend, setShowResend] = useState(false);
    
    const navigate = useNavigate();
    const location = useLocation();
    const { login, authUser, isAuthLoading } = useAuth(); 

    const redirectTo = location.state?.redirectTo || '/';

    useEffect(() => {
        if (!isAuthLoading && authUser) {
            navigate('/');
        }
    }, [authUser, isAuthLoading, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setShowResend(false); // Hide link on new attempt
        try {
            const { data } = await loginUser({ email, password });
            login(data); // This now handles the redirect logic
            // No need to navigate here, login() does it.
        } catch (error) {
            const message = error.response?.data?.message || 'Login failed';
            toast.error(message);
            // --- 3. CHECK FOR VERIFICATION ERROR ---
            if (message.includes('Please verify your email')) {
                setShowResend(true);
            }
        } finally {
            setLoading(false);
        }
    };
    
    // --- 4. NEW HANDLER for resend ---
    const handleResend = async () => {
        if (!email) {
            toast.error('Please enter your email address above to resend.');
            return;
        }
        setLoading(true);
        try {
            const { data } = await resendVerificationEmail(email);
            toast.success(data.message);
            setShowResend(false); // Hide link after success
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to resend email.');
        } finally {
            setLoading(false);
        }
    };

    if (isAuthLoading) {
       return (
            <div className="pt-48 flex justify-center items-center">
                <FaSpinner className="animate-spin text-accent-color h-12 w-12" />
            </div>
       );
    }

    return (
        <div className="pt-24 min-h-screen flex items-center justify-center">
            <div className="max-w-md w-full bg-card-color p-8 rounded-lg border border-border-color backdrop-blur-sm">
                <h1 className="text-4xl font-bold text-text-color text-center mb-6">Login</h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <input 
                        type="email" 
                        placeholder="Email Address" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        className="w-full p-3 bg-bg-color rounded-md border border-border-color focus:outline-none focus:ring-2 focus:ring-accent-color text-text-color" 
                        required 
                    />
                    <input 
                        type="password" 
                        placeholder="Password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        className="w-full p-3 bg-bg-color rounded-md border border-border-color focus:outline-none focus:ring-2 focus:ring-accent-color text-text-color" 
                        required 
                    />

                    <div className="text-right">
                        <Link to="/forgotpassword" className="text-sm text-accent-color hover:underline">
                            Forgot Password?
                        </Link>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading} 
                        className="w-full bg-accent-color text-white font-bold py-3 rounded-md hover:bg-accent-hover-color transition-colors disabled:bg-subtle-text-color"
                    >
                        {loading ? <FaSpinner className="animate-spin mx-auto" /> : 'Login'}
                    </button>
                </form>

                {/* --- 5. NEW RESEND LINK SECTION --- */}
                {showResend && (
                    <div className="text-center mt-4">
                        <p className="text-subtle-text-color">
                            Didn't get an email? 
                            <button 
                                onClick={handleResend} 
                                className="text-accent-color hover:underline ml-1"
                                disabled={loading}
                            >
                                Resend verification link
                            </button>
                        </p>
                    </div>
                )}

                <div className="text-center mt-4 text-subtle-text-color">
                    No account? <Link to="/register" className="text-accent-color hover:underline">Create one</Link>
                </div>
                
                {import.meta.env.VITE_GOOGLE_CLIENT_ID && import.meta.env.VITE_GOOGLE_CLIENT_ID !== 'placeholder-google-client-id' && (
                    <>
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-border-color"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="bg-card-color px-2 text-subtle-text-color">OR</span>
                            </div>
                        </div>
                        <GoogleLoginButton />
                    </>
                )}
            </div>
        </div>
    );
};
export default LoginPage;