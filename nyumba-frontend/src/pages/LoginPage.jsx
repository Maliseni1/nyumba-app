import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { loginUser, resendVerificationEmail } from '../services/api';
import { toast } from 'react-toastify';
import GoogleLoginButton from '../components/GoogleLoginButton';
import { useAuth } from '../context/AuthContext';
// --- 1. IMPORT ICONS ---
import { FaSpinner, FaEye, FaEyeSlash } from 'react-icons/fa';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showResend, setShowResend] = useState(false);
    // --- 2. NEW STATE for password visibility ---
    const [showPassword, setShowPassword] = useState(false);
    
    const navigate = useNavigate();
    const location = useLocation();
    const { login, authUser, isAuthLoading } = useAuth(); 

    // RedirectIfLoggedIn logic (unchanged)
    useEffect(() => {
        if (!isAuthLoading && authUser) {
            navigate('/');
        }
    }, [authUser, isAuthLoading, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setShowResend(false);
        try {
            const { data } = await loginUser({ email, password });
            login(data);
        } catch (error) {
            const message = error.response?.data?.message || 'Login failed';
            toast.error(message);
            if (message.includes('Please verify your email')) {
                setShowResend(true);
            }
        } finally {
            setLoading(false);
        }
    };
    
    const handleResend = async () => {
        if (!email) {
            toast.error('Please enter your email address above to resend.');
            return;
        }
        setLoading(true);
        try {
            const { data } = await resendVerificationEmail({ email }); // Pass email as object
            toast.success(data.message);
            setShowResend(false);
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
                    
                    {/* --- 3. NEW PASSWORD INPUT WRAPPER --- */}
                    <div className="relative">
                        <input 
                            type={showPassword ? 'text' : 'password'} 
                            placeholder="Password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            className="w-full p-3 bg-bg-color rounded-md border border-border-color focus:outline-none focus:ring-2 focus:ring-accent-color text-text-color" 
                            required 
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 px-3 flex items-center text-subtle-text-color hover:text-text-color"
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>
                    {/* --- END OF WRAPPER --- */}


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