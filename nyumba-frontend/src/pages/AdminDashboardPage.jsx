import React, { useState, useEffect } from 'react';
import { getAdminStats, getAllUsers, getVerificationRequests } from '../services/api'; // <-- 1. Import new function
import { toast } from 'react-toastify';
import StatsCards from '../components/admin/StatsCards';
import UserList from '../components/admin/UserList';
import VerificationQueue from '../components/admin/VerificationQueue'; // <-- 2. Import new component

const AdminDashboardPage = () => {
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [requests, setRequests] = useState([]); // <-- 3. Add new state for requests
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Fetch all data in parallel
                const [statsResponse, usersResponse, requestsResponse] = await Promise.all([
                    getAdminStats(),
                    getAllUsers(),
                    getVerificationRequests() // <-- 4. Fetch verification requests
                ]);

                setStats(statsResponse.data);
                setUsers(usersResponse.data);
                setRequests(requestsResponse.data); // <-- 5. Set new state
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
        <div className="pt-24 max-w-7xl mx-auto pb-12 px-4 space-y-8">
            <h1 className="text-4xl font-bold text-white mb-8">Admin Dashboard</h1>
            
            {loading ? (
                <div className="text-center text-slate-400">Loading admin data...</div>
            ) : (
                stats && (
                    <>
                        <StatsCards stats={stats} />
                        
                        {/* --- 6. Add new Verification Queue section --- */}
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-4">Pending Verifications</h2>
                            <VerificationQueue requests={requests} setRequests={setRequests} />
                        </div>

                        {/* --- Existing User List --- */}
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-4">All Users</h2>
                            <UserList users={users} />
                        </div>
                    </>
                )
            )}
        </div>
    );
};

export default AdminDashboardPage;