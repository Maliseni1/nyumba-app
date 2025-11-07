import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { loginUser } from '../services/api';
import { toast } from 'react-toastify';
import GoogleLoginButton from '../components/GoogleLoginButton';
import { useAuth } from '../context/AuthContext'; // Import useAuth

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    // 1. Get the new login function and loading state
    const { login, authUser, isAuthLoading } = useAuth(); 

    const redirectTo = location.state?.redirectTo || '/';

    useEffect(() => {
        // 2. Wait for auth to finish loading before redirecting
        if (!isAuthLoading && authUser) {
            navigate('/');
        }
    }, [authUser, isAuthLoading, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await loginUser({ email, password });
            // 3. Use the login function from context
            login(data); 
            navigate(redirectTo);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };
    
    // 4. Don't render the form if we are still checking auth
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
                        {loading ? 'Authenticating...' : 'Authenticate'}
                    </button>
                </form>
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