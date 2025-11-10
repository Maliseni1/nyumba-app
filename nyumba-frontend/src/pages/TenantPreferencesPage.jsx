import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getTenantPreferences, updateTenantPreferences } from '../services/api';
import { FaSpinner, FaSave } from 'react-icons/fa';

// These must match the backend models
const amenityOptions = [
    'Pet Friendly',
    'Furnished',
    'WiFi Included',
    'Parking Available',
    'Security',
    'Borehole',
    'Pool'
];
const propertyTypes = ['House', 'Apartment', 'Land', 'Commercial'];

const TenantPreferencesPage = () => {
    const [formData, setFormData] = useState({
        location: '',
        propertyTypes: [],
        minPrice: '',
        maxPrice: '',
        minBedrooms: '1',
        minBathrooms: '1',
        amenities: [],
        notifyImmediately: true,
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchPreferences = async () => {
            try {
                const { data } = await getTenantPreferences();
                if (data) {
                    // Populate form with existing data
                    setFormData({
                        location: data.location || '',
                        propertyTypes: data.propertyTypes || [],
                        minPrice: data.minPrice || '',
                        maxPrice: data.maxPrice || '',
                        minBedrooms: data.minBedrooms || '1',
                        minBathrooms: data.minBathrooms || '1',
                        amenities: data.amenities || [],
                        notifyImmediately: data.notifyImmediately !== false, // Default to true
                    });
                }
            } catch (error) {
                toast.error('Could not load your preferences.');
            } finally {
                setLoading(false);
            }
        };
        fetchPreferences();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === 'checkbox') {
            // Handle array fields (amenities, propertyTypes)
            const arrayName = name;
            const arrayValue = value;
            setFormData(prevData => {
                if (checked) {
                    return { ...prevData, [arrayName]: [...prevData[arrayName], arrayValue] };
                } else {
                    return { ...prevData, [arrayName]: prevData[arrayName].filter(item => item !== arrayValue) };
                }
            });
        } else if (name === 'notifyImmediately') {
            // Handle the notification toggle
            setFormData(prevData => ({
                ...prevData,
                notifyImmediately: checked,
            }));
        } else {
            // Handle regular text/number inputs
            setFormData(prevData => ({
                ...prevData,
                [name]: value,
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            // Clean data before sending
            const dataToSubmit = {
                ...formData,
                minPrice: formData.minPrice ? Number(formData.minPrice) : null,
                maxPrice: formData.maxPrice ? Number(formData.maxPrice) : null,
                minBedrooms: Number(formData.minBedrooms),
                minBathrooms: Number(formData.minBathrooms),
            };
            
            const { data } = await updateTenantPreferences(dataToSubmit);
            setFormData(data); // Re-set form with saved data
            toast.success('Your preferences have been saved!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save preferences.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="pt-48 flex justify-center items-center">
                <FaSpinner className="animate-spin text-accent-color h-12 w-12" />
            </div>
        );
    }

    const inputStyle = "w-full p-3 bg-bg-color rounded-md border border-border-color focus:outline-none focus:ring-2 focus:ring-accent-color text-text-color";
    const labelStyle = "block text-sm font-medium text-text-color mb-2";

    return (
        <div className="pt-24 max-w-2xl mx-auto pb-12">
            <form onSubmit={handleSubmit} className="bg-card-color p-8 rounded-lg border border-border-color backdrop-blur-sm space-y-6">
                <h1 className="text-3xl font-bold text-text-color text-center mb-6">My Property Preferences</h1>
                <p className="text-subtle-text-color text-center -mt-4 mb-6">
                    Set your preferences here to get instant email notifications when a matching property is listed.
                </p>

                {/* --- Location --- */}
                <div>
                    <label htmlFor="location" className={labelStyle}>Preferred Location</label>
                    <input type="text" name="location" id="location" value={formData.location} onChange={handleChange} placeholder="e.g., Roma, Lusaka" className={inputStyle} />
                    <p className="text-xs text-subtle-text-color mt-1">Leave blank to search all locations.</p>
                </div>
                
                {/* --- Price Range --- */}
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="minPrice" className={labelStyle}>Min Price (K)</label>
                        <input type="number" name="minPrice" id="minPrice" value={formData.minPrice} onChange={handleChange} placeholder="e.g., 5000" className={inputStyle} />
                    </div>
                    <div>
                        <label htmlFor="maxPrice" className={labelStyle}>Max Price (K)</label>
                        <input type="number" name="maxPrice" id="maxPrice" value={formData.maxPrice} onChange={handleChange} placeholder="e.g., 15000" className={inputStyle} />
                    </div>
                </div>

                {/* --- Beds & Baths --- */}
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="minBedrooms" className={labelStyle}>Min Bedrooms</label>
                        <select name="minBedrooms" id="minBedrooms" value={formData.minBedrooms} onChange={handleChange} className={inputStyle}>
                            <option value="1">1+</option>
                            <option value="2">2+</option>
                            <option value="3">3+</option>
                            <option value="4">4+</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="minBathrooms" className={labelStyle}>Min Bathrooms</label>
                        <select name="minBathrooms" id="minBathrooms" value={formData.minBathrooms} onChange={handleChange} className={inputStyle}>
                            <option value="1">1+</option>
                            <option value="2">2+</option>
                            <option value="3">3+</option>
                        </select>
                    </div>
                </div>
                
                {/* --- Property Types --- */}
                <div>
                    <label className={labelStyle}>Property Type</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {propertyTypes.map(type => (
                            <label key={type} className="flex items-center gap-2 text-subtle-text-color">
                                <input
                                    type="checkbox"
                                    name="propertyTypes"
                                    value={type}
                                    checked={formData.propertyTypes.includes(type)}
                                    onChange={handleChange}
                                    className="h-4 w-4 rounded text-accent-color border-border-color focus:ring-accent-color"
                                />
                                {type}
                            </label>
                        ))}
                    </div>
                </div>

                {/* --- Amenities --- */}
                <div>
                    <label className={labelStyle}>Required Amenities</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {amenityOptions.map(amenity => (
                            <label key={amenity} className="flex items-center gap-2 text-subtle-text-color">
                                <input
                                    type="checkbox"
                                    name="amenities"
                                    value={amenity}
                                    checked={formData.amenities.includes(amenity)}
                                    onChange={handleChange}
                                    className="h-4 w-4 rounded text-accent-color border-border-color focus:ring-accent-color"
                                />
                                {amenity}
                            </label>
                        ))}
                    </div>
                </div>
                
                {/* --- Notification Toggle --- */}
                <div className="border-t border-border-color pt-6">
                    <label className="flex items-center justify-between gap-2 text-text-color">
                        <span className="font-medium">Enable Instant Match Notifications</span>
                        <input
                            type="checkbox"
                            name="notifyImmediately"
                            checked={formData.notifyImmediately}
                            onChange={handleChange}
                            className="h-6 w-12 rounded-full text-accent-color border-border-color focus:ring-accent-color"
                        />
                    </label>
                    <p className="text-xs text-subtle-text-color mt-1">
                        If this is on, we'll email you the moment a property matching your criteria is posted.
                    </p>
                </div>

                <button 
                    type="submit" 
                    disabled={saving} 
                    className="w-full flex items-center justify-center gap-2 bg-accent-color text-white font-bold py-3 rounded-md hover:bg-accent-hover-color transition-colors disabled:bg-subtle-text-color"
                >
                    {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
                    Save Preferences
                </button>
            </form>
        </div>
    );
};

export default TenantPreferencesPage;