import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { adminGetAllAds, adminCreateAd, adminUpdateAd, adminDeleteAd } from '../../services/api';
import { FaSpinner, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle, FaUpload } from 'react-icons/fa';

// Must match the backend adModel.js
const adLocationOptions = [
    'homepage_banner',
    'listing_sidebar',
    'search_results_top'
];

const AdManager = () => {
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentAd, setCurrentAd] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [formData, setFormData] = useState({
        companyName: '',
        linkUrl: '',
        location: adLocationOptions[0],
        isActive: false,
        expiresAt: '',
    });

    const fetchAds = async () => {
        try {
            setLoading(true);
            const { data } = await adminGetAllAds();
            setAds(data);
        } catch (error) {
            toast.error('Could not fetch ads.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAds();
    }, []);

    const resetForm = () => {
        setIsEditing(false);
        setCurrentAd(null);
        setImageFile(null);
        setImagePreview('');
        setFormData({
            companyName: '',
            linkUrl: '',
            location: adLocationOptions[0],
            isActive: false,
            expiresAt: '',
        });
    };

    const handleEditClick = (ad) => {
        setIsEditing(true);
        setCurrentAd(ad);
        setImageFile(null);
        setImagePreview(ad.imageUrl); // Show existing image
        setFormData({
            companyName: ad.companyName,
            linkUrl: ad.linkUrl,
            location: ad.location,
            isActive: ad.isActive,
            expiresAt: ad.expiresAt ? new Date(ad.expiresAt).toISOString().split('T')[0] : '', // Format date for input
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

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!isEditing && !imageFile) {
            toast.error('An ad image is required when creating a new ad.');
            return;
        }

        setLoading(true);
        
        const data = new FormData();
        data.append('companyName', formData.companyName);
        data.append('linkUrl', formData.linkUrl);
        data.append('location', formData.location);
        data.append('isActive', formData.isActive);
        if (formData.expiresAt) {
            data.append('expiresAt', formData.expiresAt);
        }
        if (imageFile) {
            data.append('image', imageFile);
        }

        try {
            if (isEditing) {
                await adminUpdateAd(currentAd._id, data);
                toast.success('Ad updated successfully!');
            } else {
                await adminCreateAd(data);
                toast.success('Ad created successfully!');
            }
            resetForm();
            await fetchAds(); // Refresh the list
        } catch (error) {
            toast.error(error.response?.data?.message || 'Action failed.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (adId) => {
        if (window.confirm('Are you sure you want to permanently delete this ad?')) {
            setLoading(true);
            try {
                await adminDeleteAd(adId);
                toast.success('Ad deleted.');
                await fetchAds(); // Refresh the list
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to delete ad.');
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
                        {isEditing ? 'Edit Ad' : 'Create New Ad'}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="companyName" className={labelStyle}>Advertiser Name</label>
                            <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} className={inputStyle} required />
                        </div>
                        <div>
                            <label htmlFor="linkUrl" className={labelStyle}>Link URL (starts with https://)</label>
                            <input type="url" name="linkUrl" value={formData.linkUrl} onChange={handleChange} className={inputStyle} placeholder="https://company.com" required />
                        </div>
                        <div>
                            <label htmlFor="location" className={labelStyle}>Ad Location</label>
                            <select name="location" value={formData.location} onChange={handleChange} className={inputStyle}>
                                {adLocationOptions.map(loc => (
                                    <option key={loc} value={loc}>{loc}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="image" className={labelStyle}>Ad Image</label>
                            <input type="file" name="image" id="image" accept="image/png, image/jpeg, image/gif" onChange={handleImageChange} className="w-full text-sm text-subtle-text-color file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent-color/10 file:text-accent-color hover:file:bg-accent-color/20" />
                            {imagePreview && (
                                <img src={imagePreview} alt="Ad preview" className="mt-4 w-full h-auto rounded-lg border border-border-color object-cover" />
                            )}
                        </div>
                        <div>
                            <label htmlFor="expiresAt" className={labelStyle}>Expires At (Optional)</label>
                            <input type="date" name="expiresAt" value={formData.expiresAt} onChange={handleChange} className={inputStyle} />
                        </div>
                        <div className="flex items-center gap-2">
                            <input type="checkbox" name="isActive" id="isActive" checked={formData.isActive} onChange={handleChange} className="h-4 w-4 rounded text-accent-color border-border-color focus:ring-accent-color" />
                            <label htmlFor="isActive" className="text-sm font-medium text-text-color">Set to Active?</label>
                        </div>
                        
                        <div className="flex gap-2">
                            <button type="submit" disabled={loading} className="flex-1 flex items-center justify-center gap-2 bg-accent-color text-white font-bold py-3 rounded-md hover:bg-accent-hover-color transition-colors disabled:bg-subtle-text-color">
                                {loading ? <FaSpinner className="animate-spin" /> : (isEditing ? 'Update Ad' : 'Create Ad')}
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
                    <h3 className="text-xl font-bold text-text-color p-4 border-b border-border-color">Ad Inventory</h3>
                    {loading && !ads.length ? (
                        <div className="p-6 text-center text-subtle-text-color"><FaSpinner className="animate-spin mx-auto" /></div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm text-left text-subtle-text-color">
                                <thead className="text-xs text-subtle-text-color uppercase bg-bg-color">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Status</th>
                                        <th scope="col" className="px-6 py-3">Image</th>
                                        <th scope="col" className="px-6 py-3">Company</th>
                                        <th scope="col" className="px-6 py-3">Location</th>
                                        <th scope="col" className="px-6 py-3">Expires</th>
                                        <th scope="col" className="px-6 py-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-color">
                                    {ads.map(ad => (
                                        <tr key={ad._id} className="hover:bg-bg-color">
                                            <td className="px-6 py-4">
                                                {ad.isActive ? (
                                                    <FaCheckCircle className="text-green-500" title="Active" />
                                                ) : (
                                                    <FaTimesCircle className="text-red-500" title="Inactive" />
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <img src={ad.imageUrl} alt={ad.companyName} className="h-10 w-20 object-contain rounded-sm" />
                                            </td>
                                            <td className="px-6 py-4 font-medium text-text-color">{ad.companyName}</td>
                                            <td className="px-6 py-4">{ad.location}</td>
                                            <td className="px-6 py-4">{ad.expiresAt ? new Date(ad.expiresAt).toLocaleDateString() : 'N/A'}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-4">
                                                    <button onClick={() => handleEditClick(ad)} className="text-accent-color hover:text-accent-hover-color" title="Edit">
                                                        <FaEdit />
                                                    </button>
                                                    <button onClick={() => handleDelete(ad._id)} className="text-red-500 hover:text-red-400" title="Delete">
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdManager;