import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { FaSignOutAlt, FaKey, FaSpinner, FaChevronDown, FaChevronUp } from 'react-icons/fa'; // 1. Import new icons
import { changePassword } from '../services/api';

const SettingsPage = () => {
    const navigate = useNavigate();
    const { setAuthUser } = useAuth();

    const [loading, setLoading] = useState(false);
    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    
    // --- 2. ADD NEW STATE TO TOGGLE THE FORM ---
    const [showPasswordForm, setShowPasswordForm] = useState(false);

    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        const { oldPassword, newPassword, confirmPassword } = passwordData;

        if (newPassword !== confirmPassword) {
            toast.error('New passwords do not match.');
            return;
        }
        if (newPassword.length < 6) {
            toast.error('New password must be at least 6 characters.');
            return;
        }

        setLoading(true);
        try {
            const { data } = await changePassword({ oldPassword, newPassword });
            toast.success(data.message);
            // Reset form and hide it
            setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
            setShowPasswordForm(false); // <-- 4. Hide form on success
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to change password.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        setAuthUser(null);
        toast.success("You have been logged out.");
        navigate('/login');
    };

    return (
        <div className="pt-24 max-w-2xl mx-auto pb-12">
            <div className="bg-slate-900/50 p-8 rounded-lg border border-slate-800 backdrop-blur-sm">
                <h1 className="text-3xl font-bold text-white text-center mb-6">Settings</h1>

                <div className="space-y-6"> {/* Use space-y-6 for consistent spacing */}

                    {/* --- 3. PASSWORD SECTION WITH TOGGLE --- */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <FaKey /> Security
                        </h2>
                        
                        {/* The Toggle Button */}
                        <button
                            onClick={() => setShowPasswordForm(!showPasswordForm)}
                            className="w-full flex justify-between items-center text-left p-4 bg-slate-800/50 rounded-md border border-slate-700 hover:bg-slate-800 transition-colors"
                        >
                            <span className="font-medium text-white">Change Password</span>
                            {showPasswordForm 
                                ? <FaChevronUp className="text-slate-400" />
                                : <FaChevronDown className="text-slate-400" />
                            }
                        </button>

                        {/* --- The Collapsible Form --- */}
                        {showPasswordForm && (
                            <form onSubmit={handlePasswordSubmit} className="space-y-4 pt-4 border-t border-slate-800">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Old Password</label>
                                    <input 
                                        type="password"
                                        name="oldPassword"
                                        value={passwordData.oldPassword}
                                        onChange={handlePasswordChange}
                                        className="w-full p-3 bg-slate-800/50 rounded-md border border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 text-white"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">New Password</label>
                                    <input 
                                        type="password"
                                        name="newPassword"
                                        value={passwordData.newPassword}
                                        onChange={handlePasswordChange}
                                        className="w-full p-3 bg-slate-800/50 rounded-md border border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 text-white"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Confirm New Password</label>
                                    <input 
                                        type="password"
                                        name="confirmPassword"
                                        value={passwordData.confirmPassword}
                                        onChange={handlePasswordChange}
                                        className="w-full p-3 bg-slate-800/50 rounded-md border border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 text-white"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex items-center justify-center gap-2 bg-sky-500 text-white font-bold py-3 rounded-md hover:bg-sky-600 transition-colors disabled:bg-slate-600"
                                >
                                    {loading ? <FaSpinner className="animate-spin" /> : 'Update Password'}
                                </button>
                            </form>
                        )}
                    </div>
                    
                    {/* --- EXISTING LOGOUT SECTION --- */}
                    <div className="pt-6 border-t border-slate-800 space-y-4">
                         <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <FaSignOutAlt /> Account Actions
                        </h2>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 bg-slate-700 text-white font-bold py-3 rounded-md hover:bg-slate-600 transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;