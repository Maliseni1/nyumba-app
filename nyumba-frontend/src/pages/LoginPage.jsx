import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { loginUser } from '../services/api';
import { toast } from 'react-toastify';
import GoogleLoginButton from '../components/GoogleLoginButton';


const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const redirectTo = location.state?.redirectTo || '/';

    useEffect(() => {
        if (localStorage.getItem('user')) {
            navigate('/');
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await loginUser({ email, password });
            localStorage.setItem('user', JSON.stringify(data));
            navigate(redirectTo);
            window.location.reload();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pt-24 min-h-screen flex items-center justify-center">
            <div className="max-w-md w-full bg-slate-900/50 p-8 rounded-lg border border-slate-800 backdrop-blur-sm">
                <h1 className="text-4xl font-bold text-white text-center mb-6">Login</h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 bg-slate-800/50 rounded-md border border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 text-white" required />
                    <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 bg-slate-800/50 rounded-md border border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 text-white" required />
                    <button type="submit" disabled={loading} className="w-full bg-sky-500 text-white font-bold py-3 rounded-md hover:bg-sky-600 transition-colors disabled:bg-slate-600">
                        {loading ? 'Authenticating...' : 'Authenticate'}
                    </button>
                </form>
                <div className="text-center mt-4 text-slate-400">No account? <Link to="/register" className="text-sky-400 hover:underline">Create one</Link></div>
                {import.meta.env.VITE_GOOGLE_CLIENT_ID && import.meta.env.VITE_GOOGLE_CLIENT_ID !== 'placeholder-google-client-id' && (
                    <>
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-700"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="bg-slate-900/80 px-2 text-slate-500">OR</span>
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