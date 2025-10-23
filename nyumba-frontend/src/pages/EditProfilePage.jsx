import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserProfile, updateUserProfile } from '../services/api';
import { toast } from 'react-toastify';

const EditProfilePage = () => {
    const [formData, setFormData] = useState({ name: '', email: '', whatsappNumber: '', bio: '' });
    const [profilePicture, setProfilePicture] = useState(null);
    const [preview, setPreview] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data } = await getUserProfile();
                setFormData({ name: data.name, email: data.email, whatsappNumber: data.whatsappNumber || '', bio: data.bio || '' });
                setPreview(data.profilePicture);
            } catch (error) {
                toast.error('Could not load profile data.');
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfilePicture(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const profileData = new FormData();
        profileData.append('name', formData.name);
        profileData.append('email', formData.email);
        profileData.append('whatsappNumber', formData.whatsappNumber);
        profileData.append('bio', formData.bio);
        if (profilePicture) {
            profileData.append('profilePicture', profilePicture);
        }

        try {
            const { data } = await updateUserProfile(profileData);
            // Update user in localStorage
            const storedUser = JSON.parse(localStorage.getItem('user'));
            storedUser.name = data.name;
            localStorage.setItem('user', JSON.stringify(storedUser));

            toast.success('Profile updated successfully!');
            navigate('/profile');
            window.location.reload(); // To refresh navbar
        } catch (error) {
            toast.error('Failed to update profile.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pt-24 min-h-screen">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold text-white mb-6">Edit Profile</h1>
                <form onSubmit={handleSubmit} className="bg-slate-900/50 p-8 rounded-lg border border-slate-800 backdrop-blur-sm space-y-6">
                    <div className="flex items-center space-x-6">
                        <img src={preview} alt="Profile preview" className="w-24 h-24 rounded-full object-cover border-2 border-sky-500" />
                        <div>
                            <label htmlFor="profilePicture" className="cursor-pointer bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                                Change Picture
                            </label>
                            <input type="file" id="profilePicture" name="profilePicture" onChange={handleFileChange} className="hidden" accept="image/*" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-3 bg-slate-800/50 border border-slate-700 rounded-md text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500" required />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Bio</label>
                        <textarea name="bio" value={formData.bio} onChange={handleChange} placeholder="Tell us a little about yourself" rows="4" className="w-full p-3 bg-slate-800/50 border border-slate-700 rounded-md text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"></textarea>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">WhatsApp Number</label>
                        <input type="text" name="whatsappNumber" value={formData.whatsappNumber} onChange={handleChange} className="w-full p-3 bg-slate-800/50 border border-slate-700 rounded-md text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500" />
                    </div>

                    <button type="submit" className="w-full bg-sky-500 text-white p-3 rounded-md font-semibold hover:bg-sky-600 transition-colors" disabled={loading}>
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EditProfilePage;