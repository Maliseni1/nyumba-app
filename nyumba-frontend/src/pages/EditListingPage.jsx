// nyumba-frontend/src/pages/EditListingPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getListingById, updateListing } from '../services/api';
import { toast } from 'react-toastify'; // Import toast

const EditListingPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '', address: '', bedrooms: '', bathrooms: '', rent: '', description: '',
    });
    const [existingPhotos, setExistingPhotos] = useState([]);
    const [newPhotos, setNewPhotos] = useState([]);
    const [isLoading, setIsLoading] = useState(true); // Start as true
    const [error, setError] = useState('');

    // Replace the entire useEffect block with this one

    useEffect(() => {
        const fetchListing = async () => {
            setIsLoading(true);
            try {
                const response = await getListingById(id);
                const listing = response.data;

                setFormData({
                    title: listing.title,
                    address: listing.address,
                    bedrooms: listing.bedrooms,
                    bathrooms: listing.bathrooms,
                    rent: listing.rent,
                    description: listing.description || '',
                });
            
                // --- THIS IS THE NEW, SMARTER LOGIC ---
                let photos = [];
                if (listing.photoUrls && listing.photoUrls.length > 0) {
                    photos = listing.photoUrls; // Use the new array if it has images
                } else if (listing.photoUrl) {
                    photos = [listing.photoUrl]; // Otherwise, use the old field and put it in an array
                }
                setExistingPhotos(photos);
                // ------------------------------------

            } catch (err) {
                setError('Failed to fetch listing data.');
                toast.error('Failed to fetch listing data.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchListing();
    }, [id]);
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePhotoChange = (e) => {
        const files = Array.from(e.target.files);
        setNewPhotos((prevPhotos) => [...prevPhotos, ...files]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        const submissionData = { ...formData, photos: newPhotos };

        try {
            await updateListing(id, submissionData);
            toast.success('Listing updated successfully!'); // <-- Use styled toast
            navigate('/profile');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update listing.');
            toast.error(err.response?.data?.message || 'Failed to update listing.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return <p className="text-center mt-8">Loading Editor...</p>;

    return (
        <div className="container mx-auto p-4 max-w-2xl">
            <h1 className="text-2xl font-bold mb-4">Edit Listing</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" name="title" value={formData.title} onChange={handleChange} required className="w-full p-2 border" />
                <input type="text" name="address" value={formData.address} onChange={handleChange} required className="w-full p-2 border" />
                <input type="number" name="bedrooms" value={formData.bedrooms} onChange={handleChange} required className="w-full p-2 border" />
                <input type="number" name="bathrooms" value={formData.bathrooms} onChange={handleChange} required className="w-full p-2 border" />
                <input type="number" name="rent" value={formData.rent} onChange={handleChange} required className="w-full p-2 border" />
                <textarea name="description" value={formData.description} onChange={handleChange} className="w-full p-2 border"></textarea>

                <div className="my-4">
                    <label className="block mb-2 font-semibold">Current Photos:</label>
                    <div className="flex flex-wrap gap-2">
                        {existingPhotos.length > 0 ? (
                            existingPhotos.map((photo, index) => (
                                <img key={index} src={photo} alt={`existing ${index}`} className="w-24 h-24 object-cover rounded" />
                            ))
                        ) : (<p>No current photos.</p>)}
                    </div>
                </div>

                <div>
                    <label className="block mb-2 font-semibold">Upload New Photos (this will replace all old photos):</label>
                    <input type="file" name="photos" onChange={handlePhotoChange} multiple accept="image/*" className="w-full p-2 border" />
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                    {newPhotos.map((photo, index) => (
                        <img key={index} src={URL.createObjectURL(photo)} alt={`preview ${index}`} className="w-24 h-24 object-cover rounded"/>
                    ))}
                </div>

                {error && <p className="text-red-500">{error}</p>}
                <button type="submit" disabled={isLoading} className="bg-green-500 text-white px-4 py-2 rounded disabled:bg-gray-400">
                    {isLoading ? 'Updating...' : 'Update Listing'}
                </button>
            </form>
        </div>
    );
};

export default EditListingPage;