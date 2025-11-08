const mongoose = require('mongoose');

const forumReplySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ForumPost',
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    upvotes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
}, {
    timestamps: true,
});

// Update post reply count when a new reply is created
forumReplySchema.post('save', async function(doc) {
    try {
        await mongoose.model('ForumPost').findByIdAndUpdate(doc.post, {
            $inc: { replyCount: 1 }
        });
    } catch (error) {
        console.error("Error updating post reply count after save:", error);
    }
});

// Update post reply count when a reply is removed
forumReplySchema.post('remove', async function(doc) {
    try {
        await mongoose.model('ForumPost').findByIdAndUpdate(doc.post, {
            $inc: { replyCount: -1 }
        });
    } catch (error) {
        console.error("Error updating post reply count after remove:", error);
    }
});

const ForumReply = mongoose.model('ForumReply', forumReplySchema);

module.exports = ForumReply;