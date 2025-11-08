const mongoose = require('mongoose');

const forumCategorySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
    },
    // We can add a simple post count for performance
    postCount: {
        type: Number,
        default: 0,
    }
}, {
    timestamps: true,
});

const ForumCategory = mongoose.model('ForumCategory', forumCategorySchema);

module.exports = ForumCategory;