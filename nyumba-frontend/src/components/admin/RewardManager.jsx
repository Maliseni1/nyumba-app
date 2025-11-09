import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { adminGetAllRewards, adminCreateReward, adminUpdateReward, adminDeleteReward } from '../../services/api';
import { FaSpinner, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const RewardManager = () => {
    const [rewards, setRewards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentReward, setCurrentReward] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        pointsCost: '',
        type: 'LISTING_PRIORITY',
        role: 'all',
        durationInDays: '',
        cashValue: '',
        isActive: true,
    });

    const fetchRewards = async () => {
        try {
            const { data } = await adminGetAllRewards();
            setRewards(data);
        } catch (error) {
            toast.error('Could not fetch rewards.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRewards();
    }, []);

    const resetForm = () => {
        setIsEditing(false);
        setCurrentReward(null);
        setFormData({
            title: '',
            description: '',
            pointsCost: '',
            type: 'LISTING_PRIORITY',
            role: 'all',
            durationInDays: '',
            cashValue: '',
            isActive: true,
        });
    };

    const handleEditClick = (reward) => {
        setIsEditing(true);
        setCurrentReward(reward);
        setFormData({
            title: reward.title,
            description: reward.description,
            pointsCost: reward.pointsCost,
            type: reward.type,
            role: reward.role,
            durationInDays: reward.durationInDays || '',
            cashValue: reward.cashValue || '',
            isActive: reward.isActive,
        });
        window.scrollTo(0, 0); // Scroll to top
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        const dataToSubmit = {
            ...formData,
            pointsCost: Number(formData.pointsCost),
            durationInDays: formData.durationInDays ? Number(formData.durationInDays) : null,
            cashValue: formData.cashValue ? Number(formData.cashValue) : null,
        };

        try {
            if (isEditing) {
                await adminUpdateReward(currentReward._id, dataToSubmit);
                toast.success('Reward updated successfully!');
            } else {
                await adminCreateReward(dataToSubmit);
                toast.success('Reward created successfully!');
            }
            resetForm();
            await fetchRewards(); // Refresh the list
        } catch (error) {
            toast.error(error.response?.data?.message || 'Action failed.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (rewardId) => {
        if (window.confirm('Are you sure you want to deactivate this reward?')) {
            setLoading(true);
            try {
                await adminDeleteReward(rewardId);
                toast.success('Reward deactivated.');
                await fetchRewards(); // Refresh the list
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to deactivate reward.');
            } finally {
                setLoading(false);
            }
        }
    };

    const inputStyle = "w-full p-3 bg-bg-color rounded-md border border-border-color focus:outline-none focus:ring-2 focus:ring-accent-color text-text-color";
    const labelStyle = "block text-sm font-medium text-subtle-text-color mb-1";

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Form Section */}
            <div className="md:col-span-1">
                <div className="bg-card-color rounded-lg border border-border-color p-6 sticky top-24">
                    <h3 className="text-xl font-bold text-text-color mb-4">
                        {isEditing ? 'Edit Reward' : 'Create New Reward'}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="title" className={labelStyle}>Title</label>
                            <input type="text" name="title" value={formData.title} onChange={handleChange} className={inputStyle} required />
                        </div>
                        <div>
                            <label htmlFor="description" className={labelStyle}>Description</label>
                            <textarea name="description" value={formData.description} onChange={handleChange} rows="3" className={inputStyle} required />
                        </div>
                        <div>
                            <label htmlFor="pointsCost" className={labelStyle}>Points Cost</label>
                            <input type="number" name="pointsCost" value={formData.pointsCost} onChange={handleChange} className={inputStyle} required />
                        </div>
                        <div>
                            <label htmlFor="type" className={labelStyle}>Type</label>
                            <select name="type" value={formData.type} onChange={handleChange} className={inputStyle}>
                                <option value="LISTING_PRIORITY">LISTING_PRIORITY</option>
                                <option value="CASHBACK">CASHBACK</option>
                                <option value="DISCOUNT_VOUCHER">DISCOUNT_VOUCHER</option>
                                <option value="OTHER">OTHER</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="role" className={labelStyle}>For Role</label>
                            <select name="role" value={formData.role} onChange={handleChange} className={inputStyle}>
                                <option value="all">All Users</option>
                                <option value="landlord">Landlord Only</option>
                                <option value="tenant">Tenant Only</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="durationInDays" className={labelStyle}>Duration (Days)</label>
                            <input type="number" name="durationInDays" value={formData.durationInDays} onChange={handleChange} className={inputStyle} placeholder="For LISTING_PRIORITY" />
                        </div>
                        <div>
                            <label htmlFor="cashValue" className={labelStyle}>Cash Value (e.g., 50)</label>
                            <input type="number" name="cashValue" value={formData.cashValue} onChange={handleChange} className={inputStyle} placeholder="For CASHBACK" />
                        </div>
                        <div className="flex items-center gap-2">
                            <input type="checkbox" name="isActive" id="isActive" checked={formData.isActive} onChange={handleChange} className="h-4 w-4 rounded text-accent-color border-border-color focus:ring-accent-color" />
                            <label htmlFor="isActive" className="text-sm font-medium text-text-color">Is Active?</label>
                        </div>
                        
                        <div className="flex gap-2">
                            <button type="submit" disabled={loading} className="flex-1 flex items-center justify-center gap-2 bg-accent-color text-white font-bold py-3 rounded-md hover:bg-accent-hover-color transition-colors disabled:bg-subtle-text-color">
                                {loading ? <FaSpinner className="animate-spin" /> : (isEditing ? 'Update' : 'Create')}
                            </button>
                            {isEditing && (
                                <button type="button" onClick={resetForm} className="bg-subtle-text-color/20 text-text-color font-bold py-3 px-4 rounded-md hover:bg-subtle-text-color/40">
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>

            {/* List Section */}
            <div className="md:col-span-2">
                <div className="bg-card-color rounded-lg border border-border-color overflow-hidden">
                    <h3 className="text-xl font-bold text-text-color p-4 border-b border-border-color">All Rewards</h3>
                    {loading && !rewards.length ? (
                        <div className="p-6 text-center text-subtle-text-color"><FaSpinner className="animate-spin mx-auto" /></div>
                    ) : (
                        <table className="min-w-full text-sm text-left text-subtle-text-color">
                            <thead className="text-xs text-subtle-text-color uppercase bg-bg-color">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Status</th>
                                    <th scope="col" className="px-6 py-3">Title</th>
                                    <th scope="col" className="px-6 py-3">Cost</th>
                                    <th scope="col" className="px-6 py-3">Role</th>
                                    <th scope="col" className="px-6 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-color">
                                {rewards.map(reward => (
                                    <tr key={reward._id} className="hover:bg-bg-color">
                                        <td className="px-6 py-4">
                                            {reward.isActive ? (
                                                <FaCheckCircle className="text-green-500" title="Active" />
                                            ) : (
                                                <FaTimesCircle className="text-red-500" title="Inactive" />
                                            )}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-text-color">{reward.title}</td>
                                        <td className="px-6 py-4">{reward.pointsCost}</td>
                                        <td className="px-6 py-4 capitalize">{reward.role}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-4">
                                                <button onClick={() => handleEditClick(reward)} className="text-accent-color hover:text-accent-hover-color" title="Edit">
                                                    <FaEdit />
                                                </button>
                                                {reward.isActive && (
                                                    <button onClick={() => handleDelete(reward._id)} className="text-red-500 hover:text-red-400" title="Deactivate">
                                                        <FaTrash />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RewardManager;