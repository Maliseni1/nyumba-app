import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { completeProfile } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaUserTie, FaSpinner } from 'react-icons/fa';

const CompleteProfilePage = () => {
    const [role, setRole] = useState('');
    const [whatsappNumber, setWhatsappNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth(); // Get the login function to update the user
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!role) {
            toast.error('Please select an account type.');
            return;
        }
        if (!whatsappNumber) {
            toast.error('Please enter your WhatsApp number.');
            return;
        }

        setLoading(true);
        try {
            const { data } = await completeProfile({ role, whatsappNumber });
            // Use the login function to update the authUser everywhere
            login(data); 
            toast.success('Profile completed successfully!');
            navigate('/'); // Navigate to home
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to complete profile.');
            setLoading(false);
        }
    };

    return (
        <div className="pt-24 min-h-screen flex items-center justify-center">
            <div className="max-w-md w-full bg-card-color p-8 rounded-lg border border-border-color backdrop-blur-sm">
                <h1 className="text-4xl font-bold text-text-color text-center mb-6">Complete Your Profile</h1>
                <p className="text-subtle-text-color text-center mb-6">
                    Welcome! Just one more step. Please tell us about yourself.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-text-color mb-2">I am a...</label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setRole('tenant')}
                                className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all ${
                                    role === 'tenant' ? 'border-accent-color bg-accent-color/10' : 'border-border-color hover:bg-bg-color'
                                }`}
                            >
                                <FaUser className={`w-10 h-10 mb-2 ${role === 'tenant' ? 'text-accent-color' : 'text-subtle-text-color'}`} />
                                <span className="font-semibold text-text-color">Tenant</span>
                                <span className="text-xs text-subtle-text-color">I'm looking for a home</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole('landlord')}
                                className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all ${
                                    role === 'landlord' ? 'border-accent-color bg-accent-color/10' : 'border-border-color hover:bg-bg-color'
                                }`}
                            >
                                <FaUserTie className={`w-10 h-10 mb-2 ${role === 'landlord' ? 'text-accent-color' : 'text-subtle-text-color'}`} />
                                <span className="font-semibold text-text-color">Landlord</span>
                                <span className="text-xs text-subtle-text-color">I'm listing a property</span>
                            </button>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="whatsappNumber" className="block text-sm font-medium text-text-color mb-2">
                            WhatsApp Number
                        </label>
                        <input 
                            type="tel" 
                            id="whatsappNumber"
                            placeholder="e.g., +260977123456" 
                            value={whatsappNumber} 
                            onChange={(e) => setWhatsappNumber(e.target.value)} 
                            className="w-full p-3 bg-bg-color rounded-md border border-border-color focus:outline-none focus:ring-2 focus:ring-accent-color text-text-color" 
                            required 
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading} 
                        className="w-full bg-accent-color text-white font-bold py-3 rounded-md hover:bg-accent-hover-color transition-colors disabled:bg-subtle-text-color"
                    >
                        {loading ? <FaSpinner className="animate-spin mx-auto" /> : 'Save and Continue'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CompleteProfilePage;