const asyncHandler = require('express-async-handler');
const Conversation = require('../models/conversationModel');
const Message = require('../models/messageModel');
// --- 1. IMPORT Listing and User MODELS ---
const { Listing } = require('../models/listingModel');
const User = require('../models/userModel'); 
const mongoose = require('mongoose');
// --- 2. IMPORT FIREBASE ADMIN ---
const admin = require('firebase-admin');

// --- 3. NEW HELPER FUNCTION: sendPushNotification ---
const sendPushNotification = async (recipientId, senderName, messageText, conversationId) => {
    try {
        // 1. Find the recipient's user document
        const recipient = await User.findById(recipientId);
        if (!recipient || !recipient.fcmTokens || recipient.fcmTokens.length === 0) {
            console.log(`User ${recipientId} has no FCM tokens, skipping push notification.`);
            return;
        }

        // 2. Craft the notification message
        const payload = {
            notification: {
                title: `New message from ${senderName}`,
                body: messageText,
                sound: 'default'
            },
            data: {
                type: 'NEW_MESSAGE',
                conversationId: conversationId.toString()
            }
        };

        // 3. Send the message to all devices for that user
        const response = await admin.messaging().sendToDevice(recipient.fcmTokens, payload);
        
        // 4. Clean up any invalid/stale tokens
        const tokensToRemove = [];
        response.results.forEach((result, index) => {
            const error = result.error;
            if (error) {
                console.error('Failed to send push notification:', error);
                // Check for codes indicating an invalid or unregistered token
                if (error.code === 'messaging/invalid-registration-token' ||
                    error.code === 'messaging/registration-token-not-registered') {
                    tokensToRemove.push(recipient.fcmTokens[index]);
                }
            }
        });

        if (tokensToRemove.length > 0) {
            console.log(`Removing stale FCM tokens: ${tokensToRemove}`);
            await User.updateOne(
                { _id: recipientId },
                { $pullAll: { fcmTokens: tokensToRemove } }
            );
        }

    } catch (error) {
        console.error('Error sending push notification:', error);
    }
};

// --- getConversations (unchanged) ---
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
        {
            $addFields: {
                "otherUserDetails.isPremiumTenant": {
                    $and: [
                        { $eq: ["$otherUserDetails.subscriptionStatus", "active"] },
                        { $eq: ["$otherUserDetails.subscriptionType", "tenant_premium"] }
                    ]
                }
            }
        },
        {
            $sort: { 
                "otherUserDetails.isPremiumTenant": -1, 
                "otherUserDetails.name": 1
            }
        },
        {
            $project: {
                _id: "$otherUserDetails._id",
                name: "$otherUserDetails.name",
                profilePicture: "$otherUserDetails.profilePicture",
                conversationId: "$_id",
                isPremiumTenant: "$otherUserDetails.isPremiumTenant"
            }
        }
    ]);
    res.status(200).json(conversations);
});

// --- getMessages (unchanged) ---
const getMessages = asyncHandler(async (req, res) => {
    const { conversationId } = req.params;
    const messages = await Message.find({ conversationId }).populate("sender", "name profilePicture").sort({ createdAt: 1 });
    res.status(200).json(messages);
});

// --- createConversation (unchanged) ---
const createConversation = asyncHandler(async (req, res) => {
    const { receiverId, listingId } = req.body;
    const senderId = req.user._id;

    if (!receiverId) { res.status(400); throw new Error("Receiver ID is required"); }
    
    let conversation = await Conversation.findOne({ participants: { $all: [senderId, receiverId] } });

    if (!conversation) {
        conversation = await Conversation.create({ participants: [senderId, receiverId] });
        if (listingId) {
            try {
                // Use the imported Listing model (fixed from original)
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

// --- 4. sendMessage (UPDATED) ---
const sendMessage = asyncHandler(async (req, res) => {
    const { conversationId } = req.params;
    const { message } = req.body;
    const senderId = req.user._id;
    const senderName = req.user.name; // Get sender's name

    if (!message) { res.status(400); throw new Error("Message text is required"); }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) { res.status(404); throw new Error("Conversation not found"); }

    const newMessage = await Message.create({ conversationId, sender: senderId, message: message, readBy: [senderId] });
    const populatedMessage = await Message.findById(newMessage._id).populate("sender", "name profilePicture");

    const io = req.app.get('io');
    const userSocketMap = req.app.get('userSocketMap');
    
    // Loop through all participants in the conversation
    conversation.participants.forEach(participantId => {
        const participantIdString = participantId.toString();
        
        // Don't send to self
        if (participantIdString === senderId.toString()) return; 

        // 1. Send via Socket.io (for web users)
        const participantSocketId = userSocketMap[participantIdString];
        if (participantSocketId) {
            io.to(participantSocketId).emit("newMessage", populatedMessage);
        }

        // 2. Send Push Notification (for mobile users)
        // We run this in the background (no await) so it doesn't block the API response
        sendPushNotification(
            participantIdString, 
            senderName, 
            message,
            conversationId
        );
    });

    res.status(201).json(populatedMessage);
});

// --- markAsRead (unchanged) ---
const markAsRead = asyncHandler(async (req, res) => {
    const { id: conversationId } = req.params;
    const userId = req.user._id;
    await Message.updateMany(
        { conversationId: conversationId, sender: { $ne: userId } },
        { $addToSet: { readBy: userId } }
    );
    res.status(200).json({ message: "Conversation marked as read" });
});

module.exports = { getConversations, getMessages, createConversation, sendMessage, markAsRead };