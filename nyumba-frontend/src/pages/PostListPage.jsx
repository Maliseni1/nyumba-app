import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getForumPosts, createForumPost, getForumCategories } from '../services/api';
import { toast } from 'react-toastify';
import { FaPlus, FaComments, FaArrowLeft, FaUserCheck, FaCrown } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

// A component for a single post row
const PostRow = ({ post }) => {
    const user = post.user;
    const isVerified = user.isVerified || user.isPremiumTenant;

    return (
        <li className="hover:bg-bg-color transition-colors">
            <Link to={`/forum/post/${post._id}`} className="flex items-center p-4 gap-4">
                <img 
                    src={user.profilePicture} 
                    alt={user.name} 
                    className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-text-color mb-1">{post.title}</h3>
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-subtle-text-color">by</span>
                        <span className="font-medium text-text-color">{user.name}</span>
                        {user.isVerified && (
                            <span 
                                className="text-xs text-white bg-gradient-to-r from-blue-500 to-purple-500 px-1.5 py-0.5 rounded-full font-bold flex items-center gap-1"
                                title="Verified Landlord"
                            >
                                <FaUserCheck />
                            </span>
                        )}
                        {user.isPremiumTenant && (
                            <span 
                                className="text-xs text-black bg-gradient-to-r from-yellow-400 to-orange-500 px-1.5 py-0.5 rounded-full font-bold flex items-center gap-1"
                                title="Premium Tenant"
                            >
                                <FaCrown />
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex flex-col items-end text-right ml-4">
                    <span className="font-bold text-text-color text-lg">{post.replyCount}</span>
                    <span className="text-subtle-text-color text-sm">Replies</span>
                </div>
            </Link>
        </li>
    );
};

const PostListPage = () => {
    const [posts, setPosts] = useState([]);
    const [category, setCategory] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newPostTitle, setNewPostTitle] = useState('');
    const [newPostContent, setNewPostContent] = useState('');
    const { categoryId } = useParams();

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                // Fetch both category details and posts
                const [postsData, categoriesData] = await Promise.all([
                    getForumPosts(categoryId),
                    getForumCategories()
                ]);
                
                setPosts(postsData.data);
                
                // Find the specific category to show its title
                const currentCategory = categoriesData.data.find(c => c._id === categoryId);
                setCategory(currentCategory);
                
            } catch (error) {
                toast.error('Failed to load posts.');
            }
        };
        fetchPosts();
    }, [categoryId]);

    const handleCreatePost = async (e) => {
        e.preventDefault();
        if (!newPostTitle.trim() || !newPostContent.trim()) {
            toast.error('Title and content are required.');
            return;
        }
        
        try {
            const { data: newPost } = await createForumPost({
                categoryId,
                title: newPostTitle,
                content: newPostContent
            });
            setPosts([newPost, ...posts]); // Add new post to the top
            setNewPostTitle('');
            setNewPostContent('');
            setShowCreateForm(false);
            toast.success('Post created!');
        } catch (error) {
            toast.error('Failed to create post.');
        }
    };

    return (
        <div className="pt-24 max-w-4xl mx-auto pb-12">
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <Link to="/forum" className="flex items-center gap-2 text-sm text-accent-color hover:text-accent-hover-color mb-2">
                        <FaArrowLeft /> Back to Categories
                    </Link>
                    <h1 className="text-4xl font-bold text-text-color">
                        {category ? category.title : 'Loading...'}
                    </h1>
                </div>
                <button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="flex items-center gap-2 bg-accent-color text-white font-bold py-2 px-4 rounded-lg hover:bg-accent-hover-color transition-colors"
                >
                    <FaPlus /> {showCreateForm ? 'Cancel' : 'New Post'}
                </button>
            </div>

            {/* New Post Form */}
            {showCreateForm && (
                <form onSubmit={handleCreatePost} className="bg-card-color p-6 rounded-lg border border-border-color mb-8 space-y-4">
                    <input 
                        type="text"
                        placeholder="Post Title"
                        value={newPostTitle}
                        onChange={(e) => setNewPostTitle(e.target.value)}
                        className="w-full p-3 bg-bg-color rounded-md border border-border-color focus:outline-none focus:ring-2 focus:ring-accent-color text-text-color"
                    />
                    <textarea
                        placeholder="What's on your mind?"
                        rows="5"
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                        className="w-full p-3 bg-bg-color rounded-md border border-border-color focus:outline-none focus:ring-2 focus:ring-accent-color text-text-color"
                    />
                    <div className="text-right">
                        <button
                            type="submit"
                            className="bg-accent-color text-white font-bold py-2 px-6 rounded-lg hover:bg-accent-hover-color transition-colors"
                        >
                            Submit Post
                        </button>
                    </div>
                </form>
            )}

            {/* Post List */}
            <div className="bg-card-color border border-border-color rounded-lg overflow-hidden">
                <ul className="divide-y divide-border-color">
                    {posts.length === 0 ? (
                        <li className="p-6 text-center text-subtle-text-color">
                            No posts in this category yet. Be the first!
                        </li>
                    ) : (
                        posts.map(post => (
                            <PostRow key={post._id} post={post} />
                        ))
                    )}
                </ul>
            </div>
        </div>
    );
};

export default PostListPage;