import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createListing, getListingById, updateListing, reverseGeocode } from '../services/api';
import { toast } from 'react-toastify';
import ImageUpload from '../components/ImageUpload';
import imageCompression from 'browser-image-compression';
// --- 1. IMPORT CAPACITOR & CAMERA PLUGINS ---
import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
// --- 2. IMPORT NEW ICONS ---
import { FaCrosshairs, FaVideo, FaTimesCircle, FaCamera } from 'react-icons/fa';

const amenityOptions = [
    'Pet Friendly',
    'Furnished',
    'WiFi Included',
    'Parking Available',
    'Security',
    'Borehole',
    'Pool'
];

// --- 3. NEW HELPER FUNCTION (converts native path to a File object) ---
const fetchFile = async (path) => {
    const response = await fetch(path);
    const blob = await response.blob();
    return new File([blob], path.substring(path.lastIndexOf('/') + 1), {
        type: blob.type
    });
};


const ListingFormPage = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        location: '',
        bedrooms: '',
        bathrooms: '',
        propertyType: 'House',
        amenities: [],
    });
    const [images, setImages] = useState([]);
    const [videoFile, setVideoFile] = useState(null);
    const [videoPreview, setVideoPreview] = useState(null);
    const [existingVideoUrl, setExistingVideoUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isLocating, setIsLocating] = useState(false);
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = Boolean(id);
    
    // --- 4. CHECK IF ON NATIVE PLATFORM ---
    const isNative = Capacitor.isNativePlatform();

    useEffect(() => {
        if (isEditMode) {
            // ... (fetchListing logic is unchanged)
            const fetchListing = async () => {
                try {
                    const { data } = await getListingById(id);
                    setFormData({
                        title: data.title,
                        description: data.description,
                        price: data.price,
                        location: data.location?.address || data.location || '',
                        bedrooms: data.bedrooms,
                        bathrooms: data.bathrooms,
                        propertyType: data.propertyType,
                        amenities: data.amenities || [],
                    });
                    setImages(data.images);
                    if (data.videoUrl) {
                        setVideoPreview(data.videoUrl);
                        setExistingVideoUrl(data.videoUrl);
                    }
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

    const handleAmenityChange = (e) => {
        // ... (unchanged)
        const { value, checked } = e.target;
        setFormData(prevData => {
            if (checked) {
                return { ...prevData, amenities: [...new Set([...prevData.amenities, value])] };
            } else {
                return { ...prevData, amenities: prevData.amenities.filter(amenity => amenity !== value) };
            }
        });
    };

    const handleVideoChange = (e) => {
        // ... (unchanged)
        const file = e.target.files[0];
        if (file) {
            if (file.size > 100 * 1024 * 1024) { // 100MB limit (matches backend)
                toast.error("Video file is too large. Max size is 100MB.");
                return;
            }
            if (!['video/mp4', 'video/webm', 'video/quicktime'].includes(file.type)) {
                toast.error("Invalid file type. Please upload MP4, WebM, or MOV.");
                return;
            }
            setVideoFile(file);
            setVideoPreview(URL.createObjectURL(file));
            setExistingVideoUrl(null); 
        }
    };

    const handleRemoveVideo = () => {
        // ... (unchanged)
        setVideoFile(null);
        setVideoPreview(null);
        setExistingVideoUrl(null);
    };

    const handleUseCurrentLocation = () => {
        // ... (unchanged, will be updated later for native geolocation)
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
                    const { data } = await reverseGeocode({ lat: latitude, lng: longitude });
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
            { enableHighAccuracy: true }
        );
    };
    
    // --- 5. NEW: NATIVE CAMERA HANDLERS ---
    const handleTakeImage = async () => {
        try {
            const photo = await Camera.getPhoto({
                quality: 90,
                allowEditing: true,
                resultType: CameraResultType.Uri, // Use Uri to get a file path
                source: CameraSource.Camera // Only allow camera
            });
            
            if (photo.webPath) {
                // Convert the native webPath to a File object
                const file = await fetchFile(photo.webPath);
                setImages(prevImages => [...prevImages, file]);
            }
        } catch (error) {
            if (error.message.includes('permission')) {
                toast.error('Camera permission is required.');
            } else {
                console.error("Camera error:", error);
            }
        }
    };

    const handleTakeVideo = async () => {
        try {
            // Note: Capacitor Camera plugin captures video as MP4
            const video = await Camera.getPhoto({
                quality: 90,
                resultType: CameraResultType.Uri,
                source: CameraSource.Camera, // Only allow camera
                mediaTypes: 'video' // Specify video
            });
            
            if (video.webPath) {
                const file = await fetchFile(video.webPath);
                if (file.size > 100 * 1024 * 1024) {
                    toast.error("Video file is too large. Max size is 100MB.");
                    return;
                }
                setVideoFile(file);
                setVideoPreview(video.webPath); // Use webPath for native preview
                setExistingVideoUrl(null);
            }
        } catch (error) {
            if (error.message.includes('permission')) {
                toast.error('Camera permission is required.');
            } else {
                console.error("Camera error:", error);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const listingData = new FormData();

        Object.keys(formData).forEach(key => {
            if (key !== 'amenities') {
                listingData.append(key, formData[key]);
            }
        });
        formData.amenities.forEach(amenity => {
            listingData.append('amenities', amenity);
        });

        if (videoFile) {
            listingData.append('video', videoFile);
        } else if (isEditMode && existingVideoUrl) {
            listingData.append('existingVideoUrl', existingVideoUrl);
        }

        const compressionOptions = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
        };

        try {
            // Separate existing URLs from new File objects
            const newImageFiles = images.filter(image => image instanceof File);
            const existingImageUrls = images.filter(image => typeof image === 'string');
            
            toast.info("Compressing images... please wait.");
            
            // Compress only the new File objects
            const compressedImageFiles = await Promise.all(
                newImageFiles.map(file => imageCompression(file, compressionOptions))
            );
            
            compressedImageFiles.forEach(file => listingData.append('images', file, file.name));

            if (isEditMode) {
                existingImageUrls.forEach(url => listingData.append('existingImages', url));
            }

            if (isEditMode) {
                await updateListing(id, listingData);
                toast.success('Listing updated successfully!');
            } else {
                const { data: newListing } = await createListing(listingData);
                toast.success('Listing created successfully!');
                navigate(`/listing/${newListing._id}`);
            }
            sessionStorage.setItem('profileDataStale', 'true');
            if (isEditMode) navigate(`/listing/${id}`);

        } catch (error) {
            console.error("Submission error:", error);
            toast.error(error.response?.data?.message || 'An error occurred during submission.');
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = "w-full p-3 bg-bg-color rounded-md border border-border-color focus:outline-none focus:ring-2 focus:ring-accent-color text-text-color placeholder-subtle-text-color";

    return (
        <div className="pt-24 max-w-2xl mx-auto pb-12">
            <form onSubmit={handleSubmit} className="bg-card-color p-8 rounded-lg border border-border-color backdrop-blur-sm space-y-6">
                <h1 className="text-3xl font-bold text-text-color text-center mb-6">{isEditMode ? 'Edit Listing' : 'Create a New Listing'}</h1>
                
                {/* --- Text Inputs (unchanged) --- */}
                <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="Property Title" className={inputStyle} required />
                <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" className={`${inputStyle} h-32`} required />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <input type="number" name="price" value={formData.price} onChange={handleChange} placeholder="Price (K)" className={inputStyle} required />
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
                            className="flex items-center gap-2 text-sm text-accent-color hover:text-accent-hover-color mt-2 disabled:text-subtle-text-color"
                        >
                            {isLocating ? (
                                <><div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"></div> Locating...</>
                            ) : (
                                <><FaCrosshairs /> Use My Current Location</>
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
                
                {/* --- Amenities (unchanged) --- */}
                <div>
                    <label className="block text-sm font-medium text-text-color mb-3">Amenities</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {amenityOptions.map(amenity => (
                            <label key={amenity} className="flex items-center gap-2 text-subtle-text-color">
                                <input
                                    type="checkbox"
                                    name="amenities"
                                    value={amenity}
                                    checked={formData.amenities.includes(amenity)}
                                    onChange={handleAmenityChange}
                                    className="h-4 w-4 rounded text-accent-color border-border-color focus:ring-accent-color"
                                />
                                {amenity}
                            </label>
                        ))}
                    </div>
                </div>

                {/* --- 6. UPDATED IMAGE UPLOAD SECTION --- */}
                <div>
                    <label className="block text-sm font-medium text-text-color mb-3">Images (Max 5)</label>
                    {isNative && (
                        <button 
                            type="button" 
                            onClick={handleTakeImage}
                            className="flex items-center justify-center gap-2 w-full p-3 mb-3 bg-emerald-500 text-white font-semibold rounded-lg shadow-md hover:bg-emerald-600 transition-colors"
                        >
                            <FaCamera /> Use Camera
                        </button>
                    )}
                    <ImageUpload images={images} setImages={setImages} />
                </div>
                
                {/* --- 7. UPDATED VIDEO UPLOAD SECTION --- */}
                <div>
                    <label className="block text-sm font-medium text-text-color mb-3">Video Tour (Optional)</label>
                    <p className="text-xs text-subtle-text-color mb-2">Upload one short video (MP4, MOV) under 100MB.</p>
                    {isNative && (
                         <button 
                            type="button" 
                            onClick={handleTakeVideo}
                            className="flex items-center justify-center gap-2 w-full p-3 mb-3 bg-emerald-500 text-white font-semibold rounded-lg shadow-md hover:bg-emerald-600 transition-colors"
                        >
                            <FaVideo /> Record Video
                        </button>
                    )}
                    {videoPreview ? (
                        <div className="relative">
                            <video src={videoPreview} controls className="w-full h-auto rounded-lg border border-border-color" />
                            <button
                                type="button"
                                onClick={handleRemoveVideo}
                                className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                                title="Remove video"
                            >
                                <FaTimesCircle />
                            </button>
                        </div>
                    ) : (
                        <input
                            type="file"
                            name="video"
                            accept="video/mp4,video/webm,video/quicktime"
                            onChange={handleVideoChange}
                            className="w-full text-sm text-subtle-text-color file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent-color/10 file:text-accent-color hover:file:bg-accent-color/20"
                        />
                    )}
                </div>
                
                <button 
                    type="submit" 
                    disabled={loading} 
                    className="w-full bg-accent-color text-white font-bold py-3 rounded-md hover:bg-accent-hover-color transition-colors disabled:bg-subtle-text-color"
                >
                    {loading ? 'Submitting...' : (isEditMode ? 'Update Listing' : 'Create Listing')}
                </button>
            </form>
        </div>
    );
};

export default ListingFormPage;