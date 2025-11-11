import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../services/api';
import GoogleLoginButton from '../components/GoogleLoginButton'; // Use the component
import { toast } from 'react-toastify';
// --- 1. IMPORT ICONS ---
import { FaUserPlus, FaEye, FaEyeSlash, FaSpinner } from 'react-icons/fa'; 

// --- 2. NEW PASSWORD STRENGTH COMPONENT ---
const PasswordStrengthMeter = ({ password }) => {
    const getStrength = () => {
        let score = 0;
        if (password.length >= 8) score++;      // Length 8+
        if (/[A-Z]/.test(password)) score++;    // Uppercase
        if (/[0-9]/.test(password)) score++;    // Number
        if (/[^A-Za-z0-9]/.test(password)) score++; // Symbol
        return score;
    };

    const strength = getStrength();
    
    // Don't show meter if password is empty
    if (password.length === 0) return null;

    const width = `${(strength / 4) * 100}%`;
    const color = [
        'bg-red-500', // 0 or 1
        'bg-red-500', // 1
        'bg-yellow-500', // 2
        'bg-blue-500', // 3
        'bg-green-500' // 4
    ][strength];
    const label = ['Very Weak', 'Weak', 'Medium', 'Strong', 'Very Strong'][strength];

    return (
        <div className="mt-2">
            <div className="h-2 w-full bg-border-color rounded-full">
                <div
                    className={`h-2 rounded-full transition-all duration-300 ${color}`}
                    style={{ width: width }}
                ></div>
            </div>
            <p className={`text-xs mt-1 ${color.replace('bg-', 'text-')}`}>{label}</p>
        </div>
    );
};
// --- END OF NEW COMPONENT ---

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
    // --- 3. NEW STATE for password visibility ---
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
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
        setLoading(true);
        try {
            // Send only the required data, not confirmPassword
            const { confirmPassword, ...dataToSubmit } = formData;
            const { data } = await registerUser(dataToSubmit);
            toast.success(data.message || 'Registration successful! Please check your email.');
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    // This page only handles manual registration now
    // GoogleLoginButton handles its own logic

    return (
        <div className="pt-24 min-h-screen flex items-center justify-center py-12 px-4">
            <div className="max-w-md w-full bg-card-color border border-border-color backdrop-blur-sm rounded-lg shadow-xl p-8 space-y-6">
                
                <div className="text-center">
                    <FaUserPlus className="mx-auto h-12 w-auto text-accent-color" />
                    <h1 className="text-3xl font-bold text-text-color mt-4">
                        Create Your Account
                    </h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
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
                    
                    {/* --- 4. PASSWORD 1 WITH TOGGLE AND METER --- */}
                    <div className="relative">
                        <input 
                            type={showPassword ? 'text' : 'password'} 
                            name="password" 
                            placeholder="Password" 
                            onChange={handleChange} 
                            className="w-full p-3 bg-bg-color rounded-md border border-border-color focus:outline-none focus:ring-2 focus:ring-accent-color text-text-color placeholder-subtle-text-color" 
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
                    <PasswordStrengthMeter password={formData.password} />
                    {/* --- END OF PASSWORD 1 --- */}

                    {/* --- 5. PASSWORD 2 WITH TOGGLE --- */}
                    <div className="relative">
                        <input 
                            type={showConfirmPassword ? 'text' : 'password'} 
                            name="confirmPassword" 
                            placeholder="Confirm Password" 
                            onChange={handleChange} 
                            className="w-full p-3 bg-bg-color rounded-md border border-border-color focus:outline-none focus:ring-2 focus:ring-accent-color text-text-color placeholder-subtle-text-color" 
                            required 
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute inset-y-0 right-0 px-3 flex items-center text-subtle-text-color hover:text-text-color"
                        >
                            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>
                    {/* --- END OF PASSWORD 2 --- */}

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

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-accent-color text-white font-bold py-3 rounded-md hover:bg-accent-hover-color transition-colors disabled:bg-subtle-text-color"
                    >
                        {loading ? <FaSpinner className="animate-spin mx-auto" /> : 'Register'}
                    </button>
                </form>

                <div className="mt-4 text-center">
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