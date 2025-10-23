import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser, googleLogin } from '../services/api';
import { GoogleLogin } from '@react-oauth/google';
import { toast } from 'react-toastify';

const RegisterPage = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '', whatsappNumber: '' });
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
        try {
            await registerUser(formData);
            toast.success('Registration successful! Please log in.');
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const res = await googleLogin(credentialResponse.credential);
            localStorage.setItem('user', JSON.stringify(res.data));
            toast.success('Google registration successful!');
            navigate('/');
            window.location.reload(); // This forces the refresh
        } catch (error) {
            toast.error(error.response?.data?.message || 'Google registration failed');
        }
    };

    return (
        <div className="container mx-auto p-4 max-w-md">
            <h1 className="text-2xl font-bold mb-4">Register</h1>
            <form onSubmit={handleSubmit}>
                <input type="text" name="name" placeholder="Name" onChange={handleChange} className="w-full p-2 mb-4 border rounded" required />
                <input type="email" name="email" placeholder="Email" onChange={handleChange} className="w-full p-2 mb-4 border rounded" required />
                <input type="password" name="password" placeholder="Password" onChange={handleChange} className="w-full p-2 mb-4 border rounded" required />
                <input type="password" name="confirmPassword" placeholder="Confirm Password" onChange={handleChange} className="w-full p-2 mb-4 border rounded" required />
                <input type="text" name="whatsappNumber" placeholder="Phone Number" onChange={handleChange} className="w-full p-2 mb-4 border rounded" required />
                <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">Register</button>
            </form>
             <div className="mt-4 text-center">
                <p>Already have an account? <Link to="/login" className="text-blue-500">Login here</Link></p>
                {import.meta.env.VITE_GOOGLE_CLIENT_ID && import.meta.env.VITE_GOOGLE_CLIENT_ID !== 'placeholder-google-client-id' && (
                    <>
                        <div className="my-4">OR</div>
                        <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => { toast.error('Google Sign-Up Failed'); }} />
                    </>
                )}
            </div>
        </div>
    );
};

export default RegisterPage;