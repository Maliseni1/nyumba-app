const asyncHandler = require('express-async-handler');
const Conversation = require('../models/conversationModel');
const Message = require('../models/messageModel');
const Listing = require('../models/listingModel');
const mongoose = require('mongoose');

// --- 1. THIS FUNCTION IS UPDATED ---
const getConversations = asyncHandler(async (req, res) => {
    const userId = new mongoose.Types.ObjectId(req.user._id);

    const conversations = await Conversation.aggregate([
        { $match: { participants: userId } },
        { $unwind: "$participants" },
        { $match: { participants: { $ne: userId } } },
        { 
            $lookup: { 
                from: "users", 
                localField: "participants", 
                foreignField: "_id", 
                as: "otherUserDetails" 
            } 
        },
        { $unwind: "$otherUserDetails" },

        // --- NEW STAGES TO SORT BY PREMIUM STATUS ---
        {
            $addFields: {
                // Manually re-create the 'isPremiumTenant' virtual logic
                "otherUserDetails.isPremiumTenant": {
                    $and: [
                        { $eq: ["$otherUserDetails.subscriptionStatus", "active"] },
                        { $eq: ["$otherUserDetails.subscriptionType", "tenant_premium"] }
                    ]
                }
            }
        },
        // Sort by premium status (true comes first), then by name
        {
            $sort: { 
                "otherUserDetails.isPremiumTenant": -1, // -1 means descending
                "otherUserDetails.name": 1 // 1 means ascending
            }
        },
        // --- END OF NEW STAGES ---

        {
            $project: {
                _id: "$otherUserDetails._id",
                name: "$otherUserDetails.name",
                profilePicture: "$otherUserDetails.profilePicture",
                conversationId: "$_id",
                // --- 2. PASS THE NEW STATUS TO THE FRONTEND ---
                isPremiumTenant: "$otherUserDetails.isPremiumTenant"
            }
        }
    ]);
    res.status(200).json(conversations);
});

const getMessages = asyncHandler(async (req, res) => {
    // ... (This function is unchanged)
    const { conversationId } = req.params;
    const messages = await Message.find({ conversationId }).populate("sender", "name profilePicture").sort({ createdAt: 1 });
    res.status(200).json(messages);
});

const createConversation = asyncHandler(async (req, res) => {
    // ... (This function is unchanged)
    const { receiverId, listingId } = req.body;
    const senderId = req.user._id;

    if (!receiverId) { res.status(400); throw new Error("Receiver ID is required"); }
    
    let conversation = await Conversation.findOne({ participants: { $all: [senderId, receiverId] } });

    if (!conversation) {
        conversation = await Conversation.create({ participants: [senderId, receiverId] });
        if (listingId) {
            try {
                await Listing.findByIdAndUpdate(listingId, {
                    $inc: { 'analytics.inquiries': 1 }
                });
            } catch (analyticsError) {
                console.error("Failed to update inquiry analytics:", analyticsError);
            }
        }
    }
    res.status(201).json(conversation);
});

const sendMessage = asyncHandler(async (req, res) => {
    // ... (This function is unchanged)
    const { conversationId } = req.params;
    const { message } = req.body;
    const senderId = req.user._id;
    if (!message) { res.status(400); throw new Error("Message text is required"); }
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) { res.status(404); throw new Error("Conversation not found"); }
    const newMessage = await Message.create({ conversationId, sender: senderId, message: message, readBy: [senderId] });
    const populatedMessage = await Message.findById(newMessage._id).populate("sender", "name profilePicture");
    const io = req.app.get('io');
    const userSocketMap = req.app.get('userSocketMap');
    conversation.participants.forEach(participantId => {
        const participantSocketId = userSocketMap[participantId.toString()];
        if (participantSocketId) {
            io.to(participantSocketId).emit("newMessage", populatedMessage);
        }
    });
    res.status(201).json(populatedMessage);
});

const markAsRead = asyncHandler(async (req, res) => {
    // ... (This function is unchanged)
    const { id: conversationId } = req.params;
    const userId = req.user._id;
    await Message.updateMany(
        { conversationId: conversationId, sender: { $ne: userId } },
        { $addToSet: { readBy: userId } }
    );
    res.status(200).json({ message: "Conversation marked as read" });
});

module.exports = { getConversations, getMessages, createConversation, sendMessage, markAsRead };