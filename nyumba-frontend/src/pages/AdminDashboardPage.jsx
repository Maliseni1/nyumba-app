import React, { useState, useEffect } from 'react';
import { getAdminStats, getAllUsers } from '../services/api';
import { toast } from 'react-toastify';
import StatsCards from '../components/admin/StatsCards';
import UserList from '../components/admin/UserList';

const AdminDashboardPage = () => {
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Fetch data from our two new endpoints in parallel
                const [statsResponse, usersResponse] = await Promise.all([
                    getAdminStats(),
                    getAllUsers()
                ]);

                setStats(statsResponse.data);
                setUsers(usersResponse.data);
            } catch (error) {
                toast.error("Could not fetch admin data. You may not be authorized.");
                console.error("Admin fetch error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="pt-24 max-w-7xl mx-auto pb-12 px-4">
            <h1 className="text-4xl font-bold text-white mb-8">Admin Dashboard</h1>
            {loading ? (
                <div className="text-center text-slate-400">Loading admin data...</div>
            ) : (
                stats && users.length > 0 && (
                    <div>
                        <StatsCards stats={stats} />
                        <UserList users={users} />
                    </div>
                )
            )}
        </div>
    );
};

export default AdminDashboardPage;