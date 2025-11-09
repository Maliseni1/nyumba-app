import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getForumCategories, createForumCategory } from '../../services/api';
import { FaComments, FaPlus, FaSpinner, FaChevronRight } from 'react-icons/fa';

const ForumCategoryManager = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newCategory, setNewCategory] = useState({ title: '', description: '' });
    const [createLoading, setCreateLoading] = useState(false);

    // Fetch existing categories on load
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { data } = await getForumCategories();
                setCategories(data);
            } catch (error) {
                toast.error('Could not fetch forum categories.');
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    const handleChange = (e) => {
        setNewCategory({ ...newCategory, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newCategory.title || !newCategory.description) {
            toast.error('Title and Description are required.');
            return;
        }

        setCreateLoading(true);
        try {
            const { data } = await createForumCategory(newCategory);
            setCategories([data, ...categories]); // Add new category to the top
            setNewCategory({ title: '', description: '' }); // Reset form
            toast.success('Category created successfully!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create category.');
        } finally {
            setCreateLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Create Category Form */}
            <div className="md:col-span-1">
                <div className="bg-card-color rounded-lg border border-border-color p-6">
                    <h3 className="text-xl font-bold text-text-color mb-4">Create New Category</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-subtle-text-color mb-1">Title</label>
                            <input
                                type="text"
                                name="title"
                                id="title"
                                value={newCategory.title}
                                onChange={handleChange}
                                placeholder="e.g., Landlord Tips"
                                className="w-full p-3 bg-bg-color rounded-md border border-border-color focus:outline-none focus:ring-2 focus:ring-accent-color text-text-color"
                            />
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-subtle-text-color mb-1">Description</label>
                            <textarea
                                name="description"
                                id="description"
                                value={newCategory.description}
                                onChange={handleChange}
                                rows="3"
                                placeholder="What is this category for?"
                                className="w-full p-3 bg-bg-color rounded-md border border-border-color focus:outline-none focus:ring-2 focus:ring-accent-color text-text-color"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={createLoading}
                            className="w-full flex items-center justify-center gap-2 bg-accent-color text-white font-bold py-3 rounded-md hover:bg-accent-hover-color transition-colors disabled:bg-subtle-text-color"
                        >
                            {createLoading ? <FaSpinner className="animate-spin" /> : <FaPlus />}
                            Create Category
                        </button>
                    </form>
                </div>
            </div>

            {/* Existing Categories List */}
            <div className="md:col-span-2">
                <div className="bg-card-color rounded-lg border border-border-color overflow-hidden">
                    <div className="p-4 border-b border-border-color">
                        <h3 className="text-xl font-bold text-text-color">Existing Categories</h3>
                    </div>
                    {loading ? (
                        <div className="p-6 text-center text-subtle-text-color">
                            <FaSpinner className="animate-spin mx-auto" />
                        </div>
                    ) : (
                        <ul className="divide-y divide-border-color">
                            {categories.length === 0 ? (
                                <li className="p-6 text-center text-subtle-text-color">No categories found.</li>
                            ) : (
                                categories.map(category => (
                                    <li key={category._id} className="p-4 flex justify-between items-center">
                                        <div>
                                            <h4 className="font-bold text-text-color">{category.title}</h4>
                                            <p className="text-sm text-subtle-text-color">{category.description}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="font-bold text-text-color">{category.postCount}</span>
                                            <p className="text-sm text-subtle-text-color">Posts</p>
                                        </div>
                                    </li>
                                ))
                            )}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForumCategoryManager;