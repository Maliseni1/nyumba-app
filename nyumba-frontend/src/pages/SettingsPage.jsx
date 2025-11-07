import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext'; 
// --- 1. IMPORT deleteAccount and confirmAlert ---
import { changePassword, deleteAccount } from '../services/api';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { 
    FaSignOutAlt, 
    FaKey, 
    FaSpinner, 
    FaChevronDown, 
    FaChevronUp, 
    FaMoon, 
    FaSun,
    FaExclamationTriangle // <-- New icon
} from 'react-icons/fa';
import { Switch } from '@headlessui/react';
import { useTheme } from '../context/ThemeContext';

const SettingsPage = () => {
    const navigate = useNavigate();
    const { logout } = useAuth(); 
    const { theme, toggleTheme } = useTheme();

    const [loading, setLoading] = useState(false);
    // --- 2. ADD NEW LOADING STATE FOR DELETE ---
    const [deleteLoading, setDeleteLoading] = useState(false);

    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPasswordForm, setShowPasswordForm] = useState(false);

    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const handlePasswordSubmit = async (e) => {
        // ... (This function is unchanged)
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
            setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
            setShowPasswordForm(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to change password.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        // ... (This function is unchanged)
        logout(); 
        toast.success("You have been logged out.");
        navigate('/login');
    };

    // --- 3. ADD NEW HANDLER FOR DELETION ---
    const handleDeleteAccount = () => {
        confirmAlert({
            customUI: ({ onClose }) => (
                <div className="react-confirm-alert-body">
                    <h1 className="flex items-center gap-3 text-red-500">
                        <FaExclamationTriangle />
                        Delete Account?
                    </h1>
                    <p>Are you sure you want to delete your account? This will be scheduled for 30 days from now.</p>
                    <p>You can cancel this by logging back in within 30 days. This action cannot be undone after that.</p>
                    <div className="react-confirm-alert-button-group">
                        <button
                            onClick={async () => {
                                setDeleteLoading(true);
                                try {
                                    await deleteAccount();
                                    toast.success("Your account is scheduled for deletion.");
                                    logout(); // Log the user out immediately
                                    navigate('/login');
                                } catch (error) {
                                    toast.error(error.response?.data?.message || 'Failed to schedule deletion.');
                                } finally {
                                    setDeleteLoading(false);
                                    onClose();
                                }
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            Yes, Delete It
                        </button>
                        <button onClick={onClose}>
                            Cancel
                        </button>
                    </div>
                </div>
            )
        });
    };

    return (
        <div className="pt-24 max-w-2xl mx-auto pb-12">
            <div className="bg-card-color p-8 rounded-lg border border-border-color backdrop-blur-sm">
                <h1 className="text-3xl font-bold text-text-color text-center mb-6">Settings</h1>

                <div className="space-y-6">

                    {/* --- Theme Toggle Section (Unchanged) --- */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-text-color flex items-center gap-2">
                            {theme === 'dark' ? <FaMoon /> : <FaSun />} Appearance
                        </h2>
                        <div className="flex justify-between items-center p-4 bg-bg-color rounded-md border border-border-color">
                            <span className="font-medium text-text-color">
                                {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                            </span>
                            <Switch
                                checked={theme === 'dark'}
                                onChange={toggleTheme}
                                className={`${
                                theme === 'dark' ? 'bg-accent-color' : 'bg-slate-300'
                                } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                            >
                                <span
                                className={`${
                                    theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                                />
                            </Switch>
                        </div>
                    </div>

                    {/* --- Password Section (Unchanged) --- */}
                    <div className="pt-6 border-t border-border-color space-y-4">
                        <h2 className="text-xl font-bold text-text-color flex items-center gap-2">
                            <FaKey /> Security
                        </h2>
                        <button
                            onClick={() => setShowPasswordForm(!showPasswordForm)}
                            className="w-full flex justify-between items-center text-left p-4 bg-bg-color rounded-md border border-border-color hover:bg-border-color transition-colors"
                        >
                            <span className="font-medium text-text-color">Change Password</span>
                            {showPasswordForm 
                                ? <FaChevronUp className="text-subtle-text-color" />
                                : <FaChevronDown className="text-subtle-text-color" />
                            }
                        </button>
                        {showPasswordForm && (
                            <form onSubmit={handlePasswordSubmit} className="space-y-4 pt-4 border-t border-border-color">
                                <div>
                                    <label className="block text-sm font-medium text-subtle-text-color mb-1">Old Password</label>
                                    <input 
                                        type="password"
                                        name="oldPassword"
                                        value={passwordData.oldPassword}
                                        onChange={handlePasswordChange}
                                        className="w-full p-3 bg-bg-color rounded-md border border-border-color focus:outline-none focus:ring-2 focus:ring-accent-color text-text-color"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-subtle-text-color mb-1">New Password</label>
                                    <input 
                                        type="password"
                                        name="newPassword"
                                        value={passwordData.newPassword}
                                        onChange={handlePasswordChange}
                                        className="w-full p-3 bg-bg-color rounded-md border border-border-color focus:outline-none focus:ring-2 focus:ring-accent-color text-text-color"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-subtle-text-color mb-1">Confirm New Password</label>
                                    <input 
                                        type="password"
                                        name="confirmPassword"
                                        value={passwordData.confirmPassword}
                                        onChange={handlePasswordChange}
                                        className="w-full p-3 bg-bg-color rounded-md border border-border-color focus:outline-none focus:ring-2 focus:ring-accent-color text-text-color"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex items-center justify-center gap-2 bg-accent-color text-white font-bold py-3 rounded-md hover:bg-accent-hover-color transition-colors disabled:bg-subtle-text-color"
                                >
                                    {loading ? <FaSpinner className="animate-spin" /> : 'Update Password'}
                                </button>
                            </form>
                        )}
                    </div>
                    
                    {/* --- Logout Section (Unchanged) --- */}
                    <div className="pt-6 border-t border-border-color space-y-4">
                         <h2 className="text-xl font-bold text-text-color flex items-center gap-2">
                            <FaSignOutAlt /> Account Actions
                        </h2>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 bg-slate-700 text-white font-bold py-3 rounded-md hover:bg-slate-600 transition-colors"
                        >
                            Logout
                        </button>
                    </div>

                    {/* --- 4. NEW DANGER ZONE SECTION --- */}
                    <div className="pt-6 border-t border-red-500/30 space-y-4">
                         <h2 className="text-xl font-bold text-red-500 flex items-center gap-2">
                            <FaExclamationTriangle /> Danger Zone
                        </h2>
                        <p className="text-subtle-text-color text-sm">
                            This action is permanent. Your account will be scheduled for deletion and all your data will be permanently removed after 30 days. You can cancel this by logging in within this period.
                        </p>
                        <button
                            onClick={handleDeleteAccount}
                            disabled={deleteLoading}
                            className="w-full flex items-center justify-center gap-2 bg-red-600 text-white font-bold py-3 rounded-md hover:bg-red-700 transition-colors disabled:bg-red-400"
                        >
                            {deleteLoading ? <FaSpinner className="animate-spin" /> : 'Delete My Account'}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default SettingsPage;