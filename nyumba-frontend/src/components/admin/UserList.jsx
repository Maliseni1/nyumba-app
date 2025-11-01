import React from 'react';

const UserList = ({ users }) => {
    return (
        <div className="bg-slate-800 rounded-lg">
            <div className="p-4 border-b border-slate-700">
                <h3 className="text-xl font-bold text-white">All Users</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-400">
                    <thead className="text-xs text-slate-300 uppercase bg-slate-700/50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Name</th>
                            <th scope="col" className="px-6 py-3">Email</th>
                            <th scope="col" className="px-6 py-3">Role</th>
                            <th scope="col" className="px-6 py-3">Admin</th>
                            <th scope="col" className="px-6 py-3">Joined On</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user._id} className="bg-slate-800 border-b border-slate-700 hover:bg-slate-700/50">
                                <td className="px-6 py-4 font-medium text-white flex items-center gap-3">
                                    <img src={user.profilePicture} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                                    {user.name}
                                </td>
                                <td className="px-6 py-4">{user.email}</td>
                                <td className="px-6 py-4 capitalize">
                                    {user.role}
                                </td>
                                <td className="px-6 py-4">
                                    {user.isAdmin ? (
                                        <span className="bg-green-500/20 text-green-400 text-xs font-medium px-2.5 py-0.5 rounded-full">Admin</span>
                                    ) : (
                                        <span className="bg-slate-600/50 text-slate-300 text-xs font-medium px-2.5 py-0.5 rounded-full">User</span>
                                    )}
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