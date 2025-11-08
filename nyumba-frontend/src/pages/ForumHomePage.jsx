import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getForumCategories } from '../services/api';
import { toast } from 'react-toastify';
import { FaComments, FaChalkboardTeacher, FaUserTie, FaChevronRight } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

// Helper to get a dynamic icon
const getCategoryIcon = (title) => {
    if (title.toLowerCase().includes('landlord')) {
        return <FaUserTie className="w-8 h-8 text-amber-400" />;
    }
    if (title.toLowerCase().includes('tenant')) {
        return <FaChalkboardTeacher className="w-8 h-8 text-sky-400" />;
    }
    return <FaComments className="w-8 h-8 text-emerald-400" />;
};

const ForumHomePage = () => {
    const [categories, setCategories] = useState([]);
    const { authUser } = useAuth(); // We can use this to show admin-only features later

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { data } = await getForumCategories();
                setCategories(data);
            } catch (error) {
                toast.error('Failed to load forum categories.');
            }
        };
        fetchCategories();
    }, []);

    return (
        <div className="pt-24 max-w-4xl mx-auto pb-12">
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-text-color mb-3">Community Hub</h1>
                <p className="text-lg text-subtle-text-color">
                    Ask questions, share advice, and connect with other tenants and landlords.
                </p>
            </div>

            <div className="bg-card-color border border-border-color rounded-lg overflow-hidden">
                <ul className="divide-y divide-border-color">
                    {categories.length === 0 ? (
                        <li className="p-6 text-center text-subtle-text-color">
                            No forum categories have been created yet.
                        </li>
                    ) : (
                        categories.map(category => (
                            <li key={category._id} className="hover:bg-bg-color transition-colors">
                                <Link 
                                    to={`/forum/category/${category._id}`} 
                                    className="flex items-center p-6 gap-6"
                                >
                                    <div className="flex-shrink-0 w-16 h-16 bg-bg-color border border-border-color rounded-lg flex items-center justify-center">
                                        {getCategoryIcon(category.title)}
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-xl font-bold text-text-color mb-1">{category.title}</h2>
                                        <p className="text-subtle-text-color">{category.description}</p>
                                    </div>
                                    <div className="flex flex-col items-end text-right ml-4">
                                        <span className="font-bold text-text-color text-lg">{category.postCount}</span>
                                        <span className="text-subtle-text-color text-sm">Posts</span>
                                    </div>
                                    <FaChevronRight className="text-subtle-text-color flex-shrink-0" />
                                </Link>
                            </li>
                        ))
                    )}
                </ul>
            </div>
        </div>
    );
};

export default ForumHomePage;