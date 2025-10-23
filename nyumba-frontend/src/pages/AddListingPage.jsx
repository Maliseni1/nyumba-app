// nyumba-frontend/src/pages/AddListingPage.jsx
import React, { useState } from 'react';
import { createListing } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const AddListingPage = () => {
    const [formData, setFormData] = useState({
        title: '',
        address: '',
        bedrooms: '',
        bathrooms: '',
        rent: '',
        description: '',
    });
    const [photos, setPhotos] = useState([]);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePhotoChange = (e) => {
        const newFiles = Array.from(e.target.files);
        // This new logic adds the new files to any existing ones
        setPhotos((prevPhotos) => [...prevPhotos, ...newFiles]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (photos.length === 0) {
            setError('Please select at least one photo.');
            setIsLoading(false);
            return;
        }
        
        // We combine the text data and the photo files into one object
        const submissionData = { ...formData, photos };

        try {
            await createListing(submissionData);
            toast.success('Listing created successfully!');
            navigate('/profile'); // Redirect to profile page to see the new listing
        } catch (err) {
            console.error('Failed to create listing:', err);
            setError(err.response?.data?.message || 'Failed to create listing. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-4 max-w-2xl">
            <h1 className="text-2xl font-bold mb-4">Add New Listing</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" name="title" placeholder="Title" onChange={handleChange} required className="w-full p-2 border" />
                <input type="text" name="address" placeholder="Address" onChange={handleChange} required className="w-full p-2 border" />
                <input type="number" name="bedrooms" placeholder="Bedrooms" onChange={handleChange} required className="w-full p-2 border" />
                <input type="number" name="bathrooms" placeholder="Bathrooms" onChange={handleChange} required className="w-full p-2 border" />
                <input type="number" name="rent" placeholder="Rent per month" onChange={handleChange} required className="w-full p-2 border" />
                <textarea name="description" placeholder="Description" onChange={handleChange} className="w-full p-2 border"></textarea>
                
                <div>
                    <label className="block mb-2">Photos (select multiple):</label>
                    <input 
                        type="file" 
                        name="photos" 
                        onChange={handlePhotoChange} 
                        multiple // This attribute allows multiple file selection
                        accept="image/*" 
                        required 
                        className="w-full p-2 border" 
                    />
                </div>

                {/* Optional: Show image previews */}
                <div className="flex flex-wrap gap-2 mt-4">
                    {photos.map((photo, index) => (
                        <img 
                            key={index}
                            src={URL.createObjectURL(photo)} 
                            alt={`preview ${index}`}
                            className="w-24 h-24 object-cover rounded"
                        />
                    ))}
                </div>

                {error && <p className="text-red-500">{error}</p>}
                
                <button type="submit" disabled={isLoading} className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400">
                    {isLoading ? 'Creating...' : 'Create Listing'}
                </button>
            </form>
        </div>
    );
};

export default AddListingPage;