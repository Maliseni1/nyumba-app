import React from 'react';
import { FaCheckCircle } from 'react-icons/fa';

// Helper function to get color-coded status badges
const getSubscriptionStatus = (status) => {
    switch (status) {
        case 'active':
            return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-500/20 text-green-400">Active</span>;
        case 'past_due':
        case 'cancelled':
            return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-500/20 text-red-400 capitalize">{status}</span>;
        case 'inactive':
        default:
            return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-slate-600/50 text-slate-300">Inactive</span>;
    }
};

const getVerificationStatus = (status) => {
    switch (status) {
        case 'approved':
            return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-500/20 text-green-400">Approved</span>;
        case 'pending':
            return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-500/20 text-yellow-400">Pending</span>;
        case 'rejected':
            return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-500/20 text-red-400">Rejected</span>;
        case 'not_applied':
        default:
            return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-slate-600/50 text-slate-300">Not Applied</span>;
    }
};

const UserList = ({ users }) => {
    return (
        <div className="bg-slate-900/50 rounded-lg border border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-800">
                <h3 className="text-xl font-bold text-white">All Users</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left text-slate-400">
                    <thead className="text-xs text-slate-300 uppercase bg-slate-800/50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Name</th>
                            <th scope="col" className="px-6 py-3">Email</th>
                            <th scope="col" className="px-6 py-3">Role</th>
                            {/* --- 1. ADD NEW HEADERS --- */}
                            <th scope="col" className="px-6 py-3">Subscription</th>
                            <th scope="col" className="px-6 py-3">Verification</th>
                            <th scope="col" className="px-6 py-3">Joined On</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {users.map(user => (
                            <tr key={user._id} className="hover:bg-slate-800/40">
                                <td className="px-6 py-4 font-medium text-white flex items-center gap-3">
                                    <img src={user.profilePicture} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                                    <span>{user.name}</span>
                                    {/* --- 2. ADD VERIFIED BADGE --- */}
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
                                
                                {/* --- 3. ADD NEW DATA CELLS --- */}
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