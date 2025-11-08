import React, { useState } from 'react';
import { FaCheckCircle, FaTrash, FaUserSlash, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { adminBanUser, adminDeleteUser } from '../../services/api';

// Helper function to style subscription status
const getSubscriptionStatus = (status, type) => {
    if (status === 'active') {
        let text = 'Active';
        if (type === 'landlord_pro') text = 'Landlord Pro';
        if (type === 'tenant_premium') text = 'Tenant Premium';
        return <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-green-500/20 text-green-400">{text}</span>;
    }
    if (status === 'past_due') {
        return <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400">Past Due</span>;
    }
    return <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-subtle-text-color/20 text-subtle-text-color">Inactive</span>;
};

// Helper function to style verification status
const getVerificationStatus = (status) => {
    if (status === 'approved') {
        return <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400">Approved</span>;
    }
    if (status === 'pending') {
        return <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400">Pending</span>;
    }
    if (status === 'rejected') {
        return <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400">Rejected</span>;
    }
    return <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-subtle-text-color/20 text-subtle-text-color">Not Applied</span>;
};

// --- 1. ACCEPT `setUsers` PROP ---
const UserList = ({ users, setUsers }) => {
    const [loadingId, setLoadingId] = useState(null);

    // --- 2. ADD BAN HANDLER ---
    const handleBan = (user) => {
        confirmAlert({
            title: user.isBanned ? 'Unban User' : 'Ban User',
            message: `Are you sure you want to ${user.isBanned ? 'unban' : 'ban'} ${user.name}?`,
            buttons: [
                {
                    label: user.isBanned ? 'Yes, Unban' : 'Yes, Ban',
                    onClick: async () => {
                        setLoadingId(user._id);
                        try {
                            const { data } = await adminBanUser(user._id);
                            setUsers(data); // Refresh the user list
                            toast.success(`User ${user.isBanned ? 'unbanned' : 'banned'} successfully.`);
                        } catch (error) {
                            toast.error(error.response?.data?.message || 'Action failed.');
                        } finally {
                            setLoadingId(null);
                        }
                    }
                },
                {
                    label: 'No'
                }
            ]
        });
    };

    // --- 3. ADD DELETE HANDLER ---
    const handleDelete = (user) => {
        confirmAlert({
            title: 'Delete User',
            message: `Are you sure you want to PERMANENTLY delete ${user.name}? This action cannot be undone.`,
            buttons: [
                {
                    label: 'Yes, Delete Permanently',
                    onClick: async () => {
                        setLoadingId(user._id);
                        try {
                            const { data } = await adminDeleteUser(user._id);
                            setUsers(data); // Refresh the user list
                            toast.success('User deleted successfully.');
                        } catch (error) {
                            toast.error(error.response?.data?.message || 'Action failed.');
                        } finally {
                            setLoadingId(null);
                        }
                    },
                    className: 'react-confirm-alert-button-danger'
                },
                {
                    label: 'No'
                }
            ]
        });
    };

    return (
        <div className="bg-card-color rounded-lg border border-border-color overflow-hidden">
            <div className="p-4 border-b border-border-color">
                <h3 className="text-xl font-bold text-text-color">All Users</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left text-subtle-text-color">
                    <thead className="text-xs text-subtle-text-color uppercase bg-bg-color">
                        <tr>
                            <th scope="col" className="px-6 py-3">Name</th>
                            <th scope="col" className="px-6 py-3">Email</th>
                            <th scope="col" className="px-6 py-3">Role</th>
                            <th scope="col" className="px-6 py-3">Subscription</th>
                            <th scope="col" className="px-6 py-3">Verification</th>
                            <th scope="col" className="px-6 py-3">Joined On</th>
                            <th scope="col" className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border-color">
                        {users.map(user => (
                            <tr key={user._id} className={`hover:bg-bg-color ${user.isBanned ? 'opacity-50 bg-red-900/10' : ''}`}>
                                <td className="px-6 py-4 font-medium text-text-color flex items-center gap-3">
                                    <img src={user.profilePicture} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                                    <span>{user.name}</span>
                                    {user.isVerified && (
                                        <FaCheckCircle className="text-sky-400" title="Verified" />
                                    )}
                                </td>
                                <td className="px-6 py-4">{user.email}</td>
                                <td className="px-6 py-4 capitalize">
                                    {user.isAdmin ? (
                                        <span className="text-yellow-400 font-semibold">Admin</span>
                                    ) : (
                                        user.role
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    {getSubscriptionStatus(user.subscriptionStatus, user.subscriptionType)}
                                </td>
                                <td className="px-6 py-4">
                                    {getVerificationStatus(user.verificationStatus)}
                                </td>
                                <td className="px-6 py-4">{new Date(user.createdAt).toLocaleDateString()}</td>
                                <td className="px-6 py-4">
                                    {/* --- 4. HOOK UP BUTTONS --- */}
                                    <div className="flex gap-4">
                                        {loadingId === user._id ? (
                                            <FaSpinner className="animate-spin" />
                                        ) : (
                                            <>
                                                <button 
                                                    onClick={() => handleBan(user)} 
                                                    className={user.isBanned ? "text-green-500 hover:text-green-400" : "text-yellow-500 hover:text-yellow-400"} 
                                                    title={user.isBanned ? "Unban User" : "Ban User"}
                                                    disabled={user.isAdmin}
                                                >
                                                    <FaUserSlash />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(user)} 
                                                    className="text-red-500 hover:text-red-400"
                                                    title="Delete User"
                                                    disabled={user.isAdmin}
                                                >
                                                    <FaTrash />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserList;