import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { getForumPostById, getForumReplies, createForumReply, deleteForumPost, deleteForumReply } from '../services/api';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaTrash, FaUserCheck, FaCrown } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { confirmAlert } from 'react-confirm-alert';

// A component for the main post content
const PostContent = ({ post, onDelete }) => {
    const { authUser } = useAuth();
    const user = post.user;
    const isOwner = authUser._id === user._id;
    const isVerified = user.isVerified || user.isPremiumTenant;

    return (
        <div className="bg-card-color p-6 rounded-lg border border-border-color mb-8">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <img 
                        src={user.profilePicture} 
                        alt={user.name} 
                        className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-text-color">{user.name}</span>
                            {user.isVerified && (
                                <span className="text-xs text-white bg-gradient-to-r from-blue-500 to-purple-500 px-1.5 py-0.5 rounded-full font-bold" title="Verified Landlord"><FaUserCheck /></span>
                            )}
                            {user.isPremiumTenant && (
                                <span className="text-xs text-black bg-gradient-to-r from-yellow-400 to-orange-500 px-1.5 py-0.5 rounded-full font-bold" title="Premium Tenant"><FaCrown /></span>
                            )}
                        </div>
                        <p className="text-sm text-subtle-text-color">{new Date(post.createdAt).toLocaleString()}</p>
                    </div>
                </div>
                {(isOwner || authUser.isAdmin) && (
                    <button 
                        onClick={onDelete}
                        className="text-red-500 hover:text-red-400" 
                        title="Delete Post"
                    >
                        <FaTrash />
                    </button>
                )}
            </div>
            <h1 className="text-3xl font-bold text-text-color mb-4">{post.title}</h1>
            <p className="text-text-color whitespace-pre-wrap leading-relaxed">{post.content}</p>
        </div>
    );
};

// A component for a single reply
const ReplyContent = ({ reply, onDelete }) => {
    const { authUser } = useAuth();
    const user = reply.user;
    const isOwner = authUser._id === user._id;

    return (
        <div className="bg-card-color p-4 rounded-lg border border-border-color flex gap-4">
            <img 
                src={user.profilePicture} 
                alt={user.name} 
                className="w-10 h-10 rounded-full object-cover mt-1"
            />
            <div className="flex-1">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-text-color">{user.name}</span>
                        {user.isVerified && (
                            <span className="text-xs text-white bg-gradient-to-r from-blue-500 to-purple-500 px-1.5 py-0.5 rounded-full font-bold" title="Verified Landlord"><FaUserCheck /></span>
                        )}
                        {user.isPremiumTenant && (
                            <span className="text-xs text-black bg-gradient-to-r from-yellow-400 to-orange-500 px-1.5 py-0.5 rounded-full font-bold" title="Premium Tenant"><FaCrown /></span>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-subtle-text-color">{new Date(reply.createdAt).toLocaleString()}</span>
                        {(isOwner || authUser.isAdmin) && (
                            <button 
                                onClick={() => onDelete(reply._id)}
                                className="text-red-500 hover:text-red-400" 
                                title="Delete Reply"
                            >
                                <FaTrash size={14} />
                            </button>
                        )}
                    </div>
                </div>
                <p className="text-text-color mt-2">{reply.content}</p>
            </div>
        </div>
    );
};

const PostDetailPage = () => {
    const [post, setPost] = useState(null);
    const [replies, setReplies] = useState([]);
    const [newReplyContent, setNewReplyContent] = useState('');
    const { postId } = useParams();
    const { authUser } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPostAndReplies = async () => {
            try {
                const [postData, repliesData] = await Promise.all([
                    getForumPostById(postId),
                    getForumReplies(postId)
                ]);
                setPost(postData.data);
                setReplies(repliesData.data);
            } catch (error) {
                toast.error('Failed to load post and replies.');
                navigate('/forum');
            }
        };
        fetchPostAndReplies();
    }, [postId, navigate]);

    const handleCreateReply = async (e) => {
        e.preventDefault();
        if (!newReplyContent.trim()) {
            toast.error('Reply content is required.');
            return;
        }
        
        try {
            const { data: newReply } = await createForumReply({
                postId,
                content: newReplyContent
            });
            setReplies([...replies, newReply]); // Add new reply to the bottom
            setNewReplyContent('');
            toast.success('Reply added!');
        } catch (error) {
            toast.error('Failed to add reply.');
        }
    };

    const handleDeletePost = () => {
        confirmAlert({
            title: 'Delete Post',
            message: 'Are you sure you want to delete this post and all its replies? This cannot be undone.',
            buttons: [
                { label: 'Yes', onClick: async () => {
                    try {
                        await deleteForumPost(postId);
                        toast.success('Post deleted.');
                        navigate(`/forum/category/${post.category}`);
                    } catch (error) {
                        toast.error('Failed to delete post.');
                    }
                }},
                { label: 'No' }
            ]
        });
    };

    const handleDeleteReply = (replyId) => {
        confirmAlert({
            title: 'Delete Reply',
            message: 'Are you sure you want to delete this reply?',
            buttons: [
                { label: 'Yes', onClick: async () => {
                    try {
                        await deleteForumReply(replyId);
                        setReplies(replies.filter(r => r._id !== replyId));
                        toast.success('Reply deleted.');
                    } catch (error) {
                        toast.error('Failed to delete reply.');
                    }
                }},
                { label: 'No' }
            ]
        });
    };

    if (!post) {
        return null; // The auth loader will cover this
    }

    return (
        <div className="pt-24 max-w-4xl mx-auto pb-12">
            <div className="mb-4">
                <Link to={post.category ? `/forum/category/${post.category._id}` : '/forum'} className="flex items-center gap-2 text-sm text-accent-color hover:text-accent-hover-color mb-2">
                    <FaArrowLeft /> Back to Posts
                </Link>
            </div>

            {/* Main Post */}
            <PostContent post={post} onDelete={handleDeletePost} />

            {/* Replies Section */}
            <h2 className="text-2xl font-bold text-text-color mb-4">{replies.length} Replies</h2>
            <div className="space-y-4 mb-8">
                {replies.length === 0 ? (
                    <p className="text-subtle-text-color">No replies yet.</p>
                ) : (
                    replies.map(reply => (
                        <ReplyContent key={reply._id} reply={reply} onDelete={handleDeleteReply} />
                    ))
                )}
            </div>

            {/* New Reply Form */}
            <form onSubmit={handleCreateReply} className="bg-card-color p-6 rounded-lg border border-border-color space-y-4">
                <h3 className="text-xl font-bold text-text-color">Leave a Reply</h3>
                <textarea
                    placeholder={`Replying as ${authUser.name}...`}
                    rows="5"
                    value={newReplyContent}
                    onChange={(e) => setNewReplyContent(e.target.value)}
                    className="w-full p-3 bg-bg-color rounded-md border border-border-color focus:outline-none focus:ring-2 focus:ring-accent-color text-text-color"
                />
                <div className="text-right">
                    <button
                        type="submit"
                        className="bg-accent-color text-white font-bold py-2 px-6 rounded-lg hover:bg-accent-hover-color transition-colors"
                    >
                        Submit Reply
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PostDetailPage;