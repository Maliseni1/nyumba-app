import React, { useState, useEffect } from 'react';
import { getAdminStats, getAllUsers, getVerificationRequests } from '../services/api';
import { toast } from 'react-toastify';
import StatsCards from '../components/admin/StatsCards';
import UserList from '../components/admin/UserList';
import VerificationQueue from '../components/admin/VerificationQueue';
import { FaSpinner } from 'react-icons/fa'; // Import spinner

const AdminDashboardPage = () => {
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [statsResponse, usersResponse, requestsResponse] = await Promise.all([
                    getAdminStats(),
                    getAllUsers(),
                    getVerificationRequests()
                ]);

                setStats(statsResponse.data);
                setUsers(usersResponse.data);
                setRequests(requestsResponse.data);
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
            {/* --- 1. UPDATED TEXT --- */}
            <h1 className="text-4xl font-bold text-text-color mb-8">Admin Dashboard</h1>
            
            {loading ? (
                // --- 2. UPDATED LOADING STATE ---
                <div className="text-center text-subtle-text-color flex items-center justify-center gap-3 py-10">
                    <FaSpinner className="animate-spin text-accent-color" />
                    Loading admin data...
                </div>
            ) : (
                stats && (
                    <>
                        {/* This component will need to be updated */}
                        <StatsCards stats={stats} />
                        
                        <div>
                            {/* --- 3. UPDATED TEXT --- */}
                            <h2 className="text-2xl font-bold text-text-color mb-4">Pending Verifications</h2>
                            {/* This component will need to be updated */}
                            <VerificationQueue requests={requests} setRequests={setRequests} />
                        </div>

                        <div>
                            {/* --- 4. UPDATED TEXT --- */}
                            <h2 className="text-2xl font-bold text-text-color mb-4">All Users</h2>
                            {/* This component will need to be updated */}
                            <UserList users={users} />
                        </div>
                    </>
                )
            )}
        </div>
    );
};

export default AdminDashboardPage;