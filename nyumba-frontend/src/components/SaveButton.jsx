import React from 'react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { toggleSaveListing } from '../services/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const SaveButton = ({ listingId }) => {
    const { authUser, setAuthUser } = useAuth();
    const navigate = useNavigate();

    if (!authUser) {
        return null; // Don't show the button if the user is not logged in
    }

    const isSaved = authUser.savedListings?.includes(listingId);

    const handleToggleSave = async (e) => {
        e.preventDefault(); // Prevent link navigation if on a card
        e.stopPropagation();

        if (!authUser) {
            toast.info("Please log in to save listings.");
            navigate('/login');
            return;
        }

        try {
            const { data } = await toggleSaveListing(listingId);

            // Update the user in our global state and localStorage
            const updatedUser = { ...authUser, savedListings: data.savedListings };
            setAuthUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));

            toast.success(data.message);
        } catch (error) {
            toast.error("Could not update saved listings.");
        }
    };

    return (
        <button
            onClick={handleToggleSave}
            className="bg-transparent p-2 rounded-full text-white hover:text-red-500 transition-colors"
            aria-label={isSaved ? 'Unsave listing' : 'Save listing'}
        >
            {isSaved ? <FaHeart className="text-red-500" size={20} /> : <FaRegHeart size={20} />}
        </button>
    );
};

export default SaveButton;