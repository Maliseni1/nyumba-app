import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createListing, getListingById, updateListing, reverseGeocode } from '../services/api'; // <-- 1. Import reverseGeocode
import { toast } from 'react-toastify';
import ImageUpload from '../components/ImageUpload';
import imageCompression from 'browser-image-compression';
import { FaCrosshairs } from 'react-icons/fa'; // <-- 2. Import icon

const ListingFormPage = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        location: '',
        bedrooms: '',
        bathrooms: '',
        propertyType: 'House',
    });
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isLocating, setIsLocating] = useState(false); // <-- 3. Add locating state
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = Boolean(id);

    useEffect(() => {
        if (isEditMode) {
            const fetchListing = async () => {
                try {
                    const { data } = await getListingById(id);
                    setFormData({
                        title: data.title,
                        description: data.description,
                        price: data.price,
                        // Handle both old string locations and new object locations
                        location: data.location?.address || data.location || '',
                        bedrooms: data.bedrooms,
                        bathrooms: data.bathrooms,
                        propertyType: data.propertyType,
                    });
                    setImages(data.images);
                } catch (error) {
                    toast.error("Could not fetch listing details.");
                    navigate('/profile');
                }
            };
            fetchListing();
        }
    }, [id, isEditMode, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // --- 4. NEW FUNCTION FOR GETTING CURRENT LOCATION ---
    const handleUseCurrentLocation = () => {
        if (!navigator.geolocation) {
            toast.error('Geolocation is not supported by your browser.');
            return;
        }
        
        setIsLocating(true);
        toast.info('Getting your current location...');
        
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    // Call the new API function
                    const { data } = await reverseGeocode({ lat: latitude, lng: longitude });
                    
                    // Update the form state with the address
                    setFormData(prevData => ({ ...prevData, location: data.address }));
                    toast.success('Location found!');
                } catch (error) {
                    toast.error(error.response?.data?.message || 'Could not find a valid address.');
                } finally {
                    setIsLocating(false);
                }
            },
            (error) => {
                toast.error('Unable to retrieve your location. Please check browser permissions.');
                setIsLocating(false);
            },
            { enableHighAccuracy: true } // Request high accuracy
        );
    };

    // --- (handleSubmit function is unchanged) ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const listingData = new FormData();
        Object.keys(formData).forEach(key => listingData.append(key, formData[key]));

        const compressionOptions = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
        };

        try {
            const newImageFiles = images.filter(image => typeof image !== 'string');
            toast.info("Compressing images... please wait.");
            const compressedImageFiles = await Promise.all(
                newImageFiles.map(file => imageCompression(file, compressionOptions))
            );
            compressedImageFiles.forEach(file => listingData.append('images', file, file.name));

            const existingImageUrls = images.filter(image => typeof image === 'string');
            if (isEditMode) {
                existingImageUrls.forEach(url => listingData.append('existingImages', url));
            }

            if (isEditMode) {
                await updateListing(id, listingData);
                toast.success('Listing updated successfully!');
                sessionStorage.setItem('profileDataStale', 'true');
                navigate(`/listing/${id}`);
            } else {
                const { data: newListing } = await createListing(listingData);
                toast.success('Listing created successfully!');
                sessionStorage.setItem('profileDataStale', 'true');
                navigate(`/listing/${newListing._id}`);
            }
        } catch (error) {
            console.error("Submission error:", error);
            toast.error(error.response?.data?.message || 'An error occurred during submission.');
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = "w-full p-3 bg-slate-800/50 rounded-md border border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 text-white";

    return (
        <div className="pt-24 max-w-2xl mx-auto pb-12">
            <form onSubmit={handleSubmit} className="bg-slate-900/50 p-8 rounded-lg border border-slate-800 backdrop-blur-sm space-y-6">
                <h1 className="text-3xl font-bold text-white text-center mb-6">{isEditMode ? 'Edit Listing' : 'Create a New Listing'}</h1>
                <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="Property Title" className={inputStyle} required />
                <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" className={`${inputStyle} h-32`} required />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <input type="number" name="price" value={formData.price} onChange={handleChange} placeholder="Price (K)" className={inputStyle} required />
                    
                    {/* --- 5. UPDATED LOCATION INPUT WITH BUTTON --- */}
                    <div>
                        <input 
                            type="text" 
                            name="location" 
                            value={formData.location} 
                            onChange={handleChange} 
                            placeholder="Location (e.g., Lusaka)" 
                            className={inputStyle} 
                            required 
                        />
                        <button 
                            type="button" 
                            onClick={handleUseCurrentLocation} 
                            disabled={isLocating}
                            className="flex items-center gap-2 text-sm text-sky-400 hover:text-sky-300 mt-2 disabled:text-slate-500"
                        >
                            {isLocating ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"></div>
                                    Locating...
                                </>
                            ) : (
                                <>
                                    <FaCrosshairs />
                                    Use My Current Location
                                </>
                            )}
                        </button>
                    </div>

                    <input type="number" name="bedrooms" value={formData.bedrooms} onChange={handleChange} placeholder="Bedrooms" className={inputStyle} required />
                    <input type="number" name="bathrooms" value={formData.bathrooms} onChange={handleChange} placeholder="Bathrooms" className={inputStyle} required />
                </div>
                <select name="propertyType" value={formData.propertyType} onChange={handleChange} className={inputStyle}>
                    <option>House</option>
                    <option>Apartment</option>
                    <option>Land</option>
                    <option>Commercial</option>
                </select>
                <ImageUpload images={images} setImages={setImages} />
                <button type="submit" disabled={loading} className="w-full bg-sky-500 text-white font-bold py-3 rounded-md hover:bg-sky-600 transition-colors disabled:bg-slate-600">
                    {loading ? 'Submitting...' : (isEditMode ? 'Update Listing' : 'Create Listing')}
                </button>
            </form>
        </div>
    );
};
export default ListingFormPage;