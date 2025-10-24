import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser, googleLogin } from '../services/api';
import { GoogleLogin } from '@react-oauth/google';
import { toast } from 'react-toastify';
import { FaUserPlus } from 'react-icons/fa'; 

const RegisterPage = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '', whatsappNumber: '' });
    const [loading, setLoading] = useState(false); // Added loading state
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        setLoading(true); // Set loading
        try {
            await registerUser(formData);
            toast.success('Registration successful! Please log in.');
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false); // Unset loading
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const res = await googleLogin(credentialResponse.credential);
            localStorage.setItem('user', JSON.stringify(res.data));
            toast.success('Google registration successful!');
            navigate('/');
            window.location.reload(); 
        } catch (error) {
            toast.error(error.response?.data?.message || 'Google registration failed');
        }
    };

    return (
        <div className="pt-24 min-h-screen flex items-center justify-center py-12 px-4">
            <div className="max-w-md w-full bg-slate-900/50 border border-slate-800 backdrop-blur-sm rounded-lg shadow-xl p-8 space-y-6">
                
                {/* Header */}
                <div className="text-center">
                    <FaUserPlus className="mx-auto h-12 w-auto text-sky-500" />
                    <h1 className="text-3xl font-bold text-white mt-4">
                        Create Your Account
                    </h1>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input 
                        type="text" 
                        name="name" 
                        placeholder="Name" 
                        onChange={handleChange} 
                        className="w-full p-3 bg-slate-800/50 rounded-md border border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 text-white placeholder-slate-500" 
                        required 
                    />
                    <input 
                        type="email" 
                        name="email" 
                        placeholder="Email" 
                        onChange={handleChange} 
                        className="w-full p-3 bg-slate-800/50 rounded-md border border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 text-white placeholder-slate-500" 
                        required 
                    />
                    <input 
                        type="password" 
                        name="password" 
                        placeholder="Password" 
                        onChange={handleChange} 
                        className="w-full p-3 bg-slate-800/50 rounded-md border border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 text-white placeholder-slate-500" 
                        required 
                    />
                    <input 
                        type="password" 
                        name="confirmPassword" 
                        placeholder="Confirm Password" 
                        onChange={handleChange} 
                        className="w-full p-3 bg-slate-800/50 rounded-md border border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 text-white placeholder-slate-500" 
                        required 
                    />
                    <input 
                        type="text" 
                        name="whatsappNumber" 
                        placeholder="Phone Number" 
                        onChange={handleChange} 
                        className="w-full p-3 bg-slate-800/50 rounded-md border border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 text-white placeholder-slate-500" 
                        required 
                    />
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-sky-500 text-white font-bold py-3 rounded-md hover:bg-sky-600 transition-colors disabled:bg-slate-600"
                    >
                        {loading ? 'Creating Account...' : 'Register'}
                    </button>
                </form>

                <div className="mt-4 text-center">
                    {/* Google Sign-in */}
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
                            
                            <div className="w-full bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition duration-150">
                                <GoogleLogin 
                                    onSuccess={handleGoogleSuccess} 
                                    onError={() => { toast.error('Google Sign-Up Failed'); }} 
                                    width="100%"
                                    theme="outline"
                                    size="large"
                                    text="signup_with"
                                />
                            </div>
                        </>
                    )}

                    {/* Login Link */}
                    <p className="mt-6 text-slate-400">
                        Already have an account?{' '}
                        <Link to="/login" className="font-medium text-sky-400 hover:underline hover:text-sky-300">
                            Login here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;