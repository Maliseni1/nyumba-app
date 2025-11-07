import React from 'react';
import { FaCheckCircle } from 'react-icons/fa';

// --- (Helper functions are unchanged, they use semantic colors which is correct) ---
const getSubscriptionStatus = (status) => { /* ... */ };
const getVerificationStatus = (status) => { /* ... */ };

const UserList = ({ users }) => {
    return (
        // --- 1. UPDATED CARD ---
        <div className="bg-card-color rounded-lg border border-border-color overflow-hidden">
            <div className="p-4 border-b border-border-color">
                {/* --- 2. UPDATED TEXT --- */}
                <h3 className="text-xl font-bold text-text-color">All Users</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left text-subtle-text-color">
                    {/* --- 3. UPDATED TABLE HEAD --- */}
                    <thead className="text-xs text-subtle-text-color uppercase bg-bg-color">
                        <tr>
                            <th scope="col" className="px-6 py-3">Name</th>
                            <th scope="col" className="px-6 py-3">Email</th>
                            <th scope="col" className="px-6 py-3">Role</th>
                            <th scope="col" className="px-6 py-3">Subscription</th>
                            <th scope="col" className="px-6 py-3">Verification</th>
                            <th scope="col" className="px-6 py-3">Joined On</th>
                        </tr>
                    </thead>
                    {/* --- 4. UPDATED TABLE BODY --- */}
                    <tbody className="divide-y divide-border-color">
                        {users.map(user => (
                            <tr key={user._id} className="hover:bg-bg-color">
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
                                    {getSubscriptionStatus(user.subscriptionStatus)}
                                </td>
                                <td className="px-6 py-4">
                                    {getVerificationStatus(user.verificationStatus)}
                                </td>
                                <td className="px-6 py-4">{new Date(user.createdAt).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserList;