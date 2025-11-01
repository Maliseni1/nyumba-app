import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { forgotPassword } from '../services/api'; // We'll add this to api.js next
import { Link } from 'react-router-dom';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        try {
            await forgotPassword({ email });
            toast.success('Password reset email sent! Please check your inbox.');
            setMessage('An email has been sent to you. Please check your inbox (and spam folder).');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send email');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pt-24 min-h-screen flex items-center justify-center">
            <div className="max-w-md w-full bg-slate-900/50 p-8 rounded-lg border border-slate-800 backdrop-blur-sm">
                <h1 className="text-4xl font-bold text-white text-center mb-6">Forgot Password</h1>
                {!message ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <p className="text-slate-400 text-center">
                            Enter the email address associated with your account and we'll send you a link to reset your password.
                        </p>
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3 bg-slate-800/50 rounded-md border border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 text-white"
                            required
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-sky-500 text-white font-bold py-3 rounded-md hover:bg-sky-600 transition-colors disabled:bg-slate-600"
                        >
                            {loading ? 'Sending...' : 'Send Reset Link'}
                        </button>
                    </form>
                ) : (
                    <p className="text-green-400 text-center">{message}</p>
                )}
                <div className="text-center mt-6 text-slate-400">
                    <Link to="/login" className="text-sky-400 hover:underline">
                        &larr; Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;