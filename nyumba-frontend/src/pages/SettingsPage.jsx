import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { FaSignOutAlt } from 'react-icons/fa';

const SettingsPage = () => {
    const navigate = useNavigate();
    const { setAuthUser } = useAuth();

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

                <div className="space-y-4">
                    <p className="text-slate-400 text-center">Manage your application settings and account actions here.</p>

                    <div className="pt-4 border-t border-slate-800">
                         <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 bg-slate-700 text-white font-bold py-3 rounded-md hover:bg-slate-600 transition-colors"
                        >
                            <FaSignOutAlt /> Logout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;