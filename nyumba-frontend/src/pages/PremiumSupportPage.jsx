import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { sendPremiumSupportTicket } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FaSpinner, FaPaperPlane } from 'react-icons/fa';

const PremiumSupportPage = () => {
    const { authUser } = useAuth();
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    // --- THIS IS THE FIX ---
    // We create a variable to hold the correct membership name.
    const getMembershipType = () => {
        const subType = authUser?.subscriptionType;
        if (subType === 'landlord_pro') {
            return 'Landlord Pro';
        }
        if (subType === 'tenant_premium') {
            return 'Tenant Premium';
        }
        return 'Premium'; // A safe default
    };
    // --- END OF FIX ---

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!subject || !message) {
            toast.error('Please fill in both the subject and message fields.');
            return;
        }

        setLoading(true);
        try {
            const { data } = await sendPremiumSupportTicket({ subject, message });
            toast.success(data.message);
            setSubject('');
            setMessage('');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send support ticket.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pt-24 max-w-2xl mx-auto pb-12">
            <div className="bg-card-color p-8 rounded-lg border border-border-color backdrop-blur-sm">
                <h1 className="text-3xl font-bold text-text-color text-center mb-6">Premium Support</h1>
                {/* --- USE THE NEW VARIABLE HERE --- */}
                <p className="text-subtle-text-color text-center mb-6">
                    As a {getMembershipType()} member, your requests are our top priority.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="subject" className="block text-sm font-medium text-subtle-text-color mb-1">
                            Subject
                        </label>
                        <input 
                            type="text"
                            id="subject"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="e.g., Issue with a listing"
                            className="w-full p-3 bg-bg-color rounded-md border border-border-color focus:outline-none focus:ring-2 focus:ring-accent-color text-text-color"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="message" className="block text-sm font-medium text-subtle-text-color mb-1">
                            How can we help?
                        </label>
                        <textarea
                            id="message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows="8"
                            placeholder="Please describe your issue in detail..."
                            className="w-full p-3 bg-bg-color rounded-md border border-border-color focus:outline-none focus:ring-2 focus:ring-accent-color text-text-color"
                            required
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading} 
                        className="w-full flex items-center justify-center gap-2 bg-accent-color text-white font-bold py-3 rounded-md hover:bg-accent-hover-color transition-colors disabled:bg-subtle-text-color"
                    >
                        {loading ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
                        Send Support Ticket
                    </button>
                </form>
            </div>
        </div>
    );
};

export default PremiumSupportPage;