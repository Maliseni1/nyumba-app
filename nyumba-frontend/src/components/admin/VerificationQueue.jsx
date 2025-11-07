import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { approveVerification, rejectVerification } from '../../services/api';
import { FaCheck, FaTimes } from 'react-icons/fa';

const VerificationQueue = ({ requests, setRequests }) => {
    const [loadingId, setLoadingId] = useState(null);

    const handleAction = async (id, action) => {
        // ... (function is unchanged)
        setLoadingId(id);
        try {
            const apiCall = action === 'approve' ? approveVerification : rejectVerification;
            const { data } = await apiCall(id);
            setRequests(data);
            toast.success(`User ${action}d successfully!`);
        } catch (error) {
            toast.error('Failed to update verification status.');
        } finally {
            setLoadingId(null);
        }
    };

    if (requests.length === 0) {
        return (
            // --- 1. UPDATED CARD ---
            <div className="bg-card-color p-6 rounded-lg border border-border-color text-center">
                <p className="text-subtle-text-color">No pending verification requests.</p>
            </div>
        );
    }

    return (
        // --- 2. UPDATED CARD ---
        <div className="bg-card-color rounded-lg border border-border-color overflow-hidden">
            <table className="min-w-full divide-y divide-border-color">
                {/* --- 3. UPDATED TABLE HEAD --- */}
                <thead className="bg-bg-color">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-subtle-text-color uppercase tracking-wider">User</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-subtle-text-color uppercase tracking-wider">Role</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-subtle-text-color uppercase tracking-wider">Subscription</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-subtle-text-color uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                {/* --- 4. UPDATED TABLE BODY --- */}
                <tbody className="divide-y divide-border-color">
                    {requests.map((user) => (
                        <tr key={user._id} className="hover:bg-bg-color">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 h-10 w-10">
                                        <img className="h-10 w-10 rounded-full object-cover" src={user.profilePicture} alt={user.name} />
                                    </div>
                                    <div className="ml-4">
                                        <div className="text-sm font-medium text-text-color">{user.name}</div>
                                        <div className="text-sm text-subtle-text-color">{user.email}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-subtle-text-color capitalize">{user.role}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                {/* Semantic colors are fine */}
                                {user.subscriptionStatus === 'active' ? (
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-500/20 text-green-400">
                                        Active
                                    </span>
                                ) : (
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-500/20 text-red-400">
                                        Inactive
                                    </span>
                                )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                {/* Semantic colors are fine */}
                                <button
                                    onClick={() => handleAction(user._id, 'approve')}
                                    disabled={loadingId === user._id}
                                    className="text-green-400 hover:text-green-300 mr-3 disabled:opacity-50"
                                    title="Approve"
                                >
                                    <FaCheck />
                                </button>
                                <button
                                    onClick={() => handleAction(user._id, 'reject')}
                                    disabled={loadingId === user._id}
                                    className="text-red-400 hover:text-red-300 disabled:opacity-50"
                                    title="Reject"
                                >
                                    <FaTimes />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default VerificationQueue;