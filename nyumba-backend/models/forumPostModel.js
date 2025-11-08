const mongoose = require('mongoose');

const forumPostSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ForumCategory',
        required: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    content: {
        type: String,
        required: true,
    },
    upvotes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    replyCount: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
});

// Update category post count when a new post is created
forumPostSchema.post('save', async function(doc) {
    try {
        await mongoose.model('ForumCategory').findByIdAndUpdate(doc.category, {
            $inc: { postCount: 1 }
        });
    } catch (error) {
        console.error("Error updating category post count after save:", error);
    }
});

// Update category post count when a post is removed
forumPostSchema.post('remove', async function(doc) {
    try {
        await mongoose.model('ForumCategory').findByIdAndUpdate(doc.category, {
            $inc: { postCount: -1 }
        });
    } catch (error) {
        console.error("Error updating category post count after remove:", error);
    }
});


const ForumPost = mongoose.model('ForumPost', forumPostSchema);

module.exports = ForumPost;