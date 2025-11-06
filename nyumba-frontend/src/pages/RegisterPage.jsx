import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser, googleLogin } from '../services/api';
import { GoogleLogin } from '@react-oauth/google';
import { toast } from 'react-toastify';
import { FaUserPlus } from 'react-icons/fa'; 

const RegisterPage = () => {
    const [formData, setFormData] = useState({ 
        name: '', 
        email: '', 
        password: '', 
        confirmPassword: '', 
        whatsappNumber: '',
        role: 'tenant',
        referralCode: ''
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        // ... (function is unchanged)
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        setLoading(true);
        try {
            await registerUser(formData);
            toast.success('Registration successful! Please log in.');
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        // ... (function is unchanged)
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
            {/* --- 1. UPDATED CARD --- */}
            <div className="max-w-md w-full bg-card-color border border-border-color backdrop-blur-sm rounded-lg shadow-xl p-8 space-y-6">
                
                <div className="text-center">
                    {/* --- 2. UPDATED ICON/TEXT --- */}
                    <FaUserPlus className="mx-auto h-12 w-auto text-accent-color" />
                    <h1 className="text-3xl font-bold text-text-color mt-4">
                        Create Your Account
                    </h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* --- 3. UPDATED INPUTS --- */}
                    <input 
                        type="text" 
                        name="name" 
                        placeholder="Name" 
                        onChange={handleChange} 
                        className="w-full p-3 bg-bg-color rounded-md border border-border-color focus:outline-none focus:ring-2 focus:ring-accent-color text-text-color placeholder-subtle-text-color" 
                        required 
                    />
                    <input 
                        type="email" 
                        name="email" 
                        placeholder="Email" 
                        onChange={handleChange} 
                        className="w-full p-3 bg-bg-color rounded-md border border-border-color focus:outline-none focus:ring-2 focus:ring-accent-color text-text-color placeholder-subtle-text-color" 
                        required 
                    />
                    <input 
                        type="password" 
                        name="password" 
                        placeholder="Password" 
                        onChange={handleChange} 
                        className="w-full p-3 bg-bg-color rounded-md border border-border-color focus:outline-none focus:ring-2 focus:ring-accent-color text-text-color placeholder-subtle-text-color" 
                        required 
                    />
                    <input 
                        type="password" 
                        name="confirmPassword" 
                        placeholder="Confirm Password" 
                        onChange={handleChange} 
                        className="w-full p-3 bg-bg-color rounded-md border border-border-color focus:outline-none focus:ring-2 focus:ring-accent-color text-text-color placeholder-subtle-text-color" 
                        required 
                    />
                    <input 
                        type="text" 
                        name="whatsappNumber" 
                        placeholder="Phone Number" 
                        onChange={handleChange} 
                        className="w-full p-3 bg-bg-color rounded-md border border-border-color focus:outline-none focus:ring-2 focus:ring-accent-color text-text-color placeholder-subtle-text-color" 
                        required 
                    />
                    <input 
                        type="text" 
                        name="referralCode" 
                        placeholder="Referral Code (Optional)" 
                        onChange={handleChange} 
                        value={formData.referralCode.toUpperCase()}
                        className="w-full p-3 bg-bg-color rounded-md border border-border-color focus:outline-none focus:ring-2 focus:ring-accent-color text-text-color placeholder-subtle-text-color" 
                    />

                    {/* --- 4. UPDATED RADIO/LABELS --- */}
                    <div className="pt-2">
                        <label className="block text-sm font-medium text-subtle-text-color mb-2">I am a...</label>
                        <div className="flex gap-x-6">
                            <div className="flex items-center">
                                <input
                                    type="radio"
                                    name="role"
                                    id="role-tenant"
                                    value="tenant"
                                    checked={formData.role === 'tenant'}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-accent-color focus:ring-accent-color border-border-color bg-bg-color"
                                />
                                <label htmlFor="role-tenant" className="ml-2 block text-sm text-subtle-text-color">
                                    Tenant
                                </label>
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="radio"
                                    name="role"
                                    id="role-landlord"
                                    value="landlord"
                                    checked={formData.role === 'landlord'}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-accent-color focus:ring-accent-color border-border-color bg-bg-color"
                                />
                                <label htmlFor="role-landlord" className="ml-2 block text-sm text-subtle-text-color">
                                    Landlord
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* --- 5. UPDATED BUTTON --- */}
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-accent-color text-white font-bold py-3 rounded-md hover:bg-accent-hover-color transition-colors disabled:bg-subtle-text-color"
                    >
                        {loading ? 'Creating Account...' : 'Register'}
                    </button>
                </form>

                <div className="mt-4 text-center">
                    {import.meta.env.VITE_GOOGLE_CLIENT_ID && import.meta.env.VITE_GOOGLE_CLIENT_ID !== 'placeholder-google-client-id' && (
                        <>
                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    {/* --- 6. UPDATED DIVIDER --- */}
                                    <div className="w-full border-t border-border-color"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    {/* --- 7. UPDATED 'OR' SPAN --- */}
                                    <span className="bg-card-color px-2 text-subtle-text-color">OR</span>
                                </div>
                            </div>
                            
                            {/* --- 8. UPDATED GOOGLE BUTTON WRAPPER --- */}
                            <div className="w-full bg-card-color border border-border-color rounded-lg shadow-sm hover:bg-bg-color transition duration-150">
                                <GoogleLogin 
                                    onSuccess={handleGoogleSuccess} 
                                    onError={() => { toast.error('Google Sign-Up Failed'); }} 
                                    width="100%"
                                    theme="outline" // 'outline' theme works well on both light and dark
                                    size="large"
                                    text="signup_with"
                                />
                            </div>
                        </>
                    )}

                    {/* --- 9. UPDATED TEXT/LINK --- */}
                    <p className="mt-6 text-subtle-text-color">
                        Already have an account?{' '}
                        <Link to="/login" className="font-medium text-accent-color hover:underline">
                            Login here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;