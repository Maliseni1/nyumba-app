import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { approveVerification, rejectVerification } from '../../services/api';
import { FaCheck, FaTimes } from 'react-icons/fa';

const VerificationQueue = ({ requests, setRequests }) => {
    const [loadingId, setLoadingId] = useState(null);

    const handleAction = async (id, action) => {
        setLoadingId(id);
        try {
            const apiCall = action === 'approve' ? approveVerification : rejectVerification;
            const { data } = await apiCall(id);
            setRequests(data); // The backend returns the new list of pending requests
            toast.success(`User ${action}d successfully!`);
        } catch (error) {
            toast.error('Failed to update verification status.');
        } finally {
            setLoadingId(null);
        }
    };

    if (requests.length === 0) {
        return (
            <div className="bg-slate-900/50 p-6 rounded-lg border border-slate-800 text-center">
                <p className="text-slate-400">No pending verification requests.</p>
            </div>
        );
    }

    return (
        <div className="bg-slate-900/50 rounded-lg border border-slate-800 overflow-hidden">
            <table className="min-w-full divide-y divide-slate-800">
                <thead className="bg-slate-800/50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">User</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Role</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Subscription</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                    {requests.map((user) => (
                        <tr key={user._id} className="hover:bg-slate-800/40">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 h-10 w-10">
                                        <img className="h-10 w-10 rounded-full object-cover" src={user.profilePicture} alt={user.name} />
                                    </div>
                                    <div className="ml-4">
                                        <div className="text-sm font-medium text-white">{user.name}</div>
                                        <div className="text-sm text-slate-400">{user.email}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300 capitalize">{user.role}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
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