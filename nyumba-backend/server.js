const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const cron = require('node-cron'); // 1. IMPORT NODE-CRON

// 2. IMPORT MODELS NEEDED FOR DELETION
const User = require('./models/userModel');
const Listing = require('./models/listingModel');
const Conversation = require('./models/conversationModel');
const Message = require('./models/messageModel');

// Configure dotenv to load from the correct path
dotenv.config({ path: path.join(__dirname, '.env') });

const requiredEnvVars = [
    'MONGO_URI',
    'JWT_SECRET',
    'GOOGLE_CLIENT_ID',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET'
];

// Allow placeholder values for development
const isValidEnvVar = (value) => {
    return value && value.trim() !== '' && value !== 'undefined';
};

const missingVars = requiredEnvVars.filter(varName => !isValidEnvVar(process.env[varName]));
if (missingVars.length > 0) {
    console.error("FATAL ERROR: Missing required environment variables!");
    console.error("Please make sure your backend/.env file contains all of the following:");
    missingVars.forEach(varName => console.error(`- ${varName}`));
    process.exit(1);
}

const userRoutes = require('./routes/userRoutes');
const listingRoutes = require('./routes/listingRoutes');
const messageRoutes = require('./routes/messageRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const rewardRoutes = require('./routes/rewardRoutes'); // <-- 1. IMPORT REWARD ROUTES

connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ['http://localhost:5173', 'https://nyumba-app.vercel.app'],
        methods: ["GET", "POST"]
    },
    transports: ['websocket']
});

// CORS configuration
const corsOptions = {
    origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'https://nyumba-app.vercel.app',
        'https://nyumba-app-git-master-maliseni1.vercel.app',
        // Add your production frontend URL here
        process.env.FRONTEND_URL
    ].filter(Boolean), // Remove undefined values
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const userSocketMap = {};
app.set('io', io);
app.set('userSocketMap', userSocketMap);

app.use('/api/users', userRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/rewards', rewardRoutes); // <-- 2. USE REWARD ROUTES

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId && userId !== "undefined") {
        userSocketMap[userId] = socket.id;
    }
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on('disconnect', () => {
        if (userId && userId !== "undefined") {
            delete userSocketMap[userId];
        }
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
});


// --- 3. NEW: SCHEDULED JOB FOR ACCOUNT DELETION ---
// This runs once every day at midnight ('0 0 * * *')
console.log('Setting up daily job for account deletion...');
cron.schedule('0 0 * * *', async () => {
    console.log('RUNNING DAILY CRON JOB: Checking for accounts pending deletion...');
    try {
        // Find users whose grace period has expired
        const usersToDelete = await User.find({
            isScheduledForDeletion: true,
            deletionScheduledAt: { $lte: new Date() } // Find users whose date is in the past
        });

        if (usersToDelete.length === 0) {
            console.log('CRON JOB: No accounts are due for deletion.');
            return;
        }

        console.log(`CRON JOB: Found ${usersToDelete.length} user(s) for permanent deletion.`);

        for (const user of usersToDelete) {
            console.log(`CRON JOB: Deleting user ${user.email} (ID: ${user._id})`);

            // 1. Delete all their listings
            await Listing.deleteMany({ owner: user._id });
            
            // 2. Delete all their conversations
            await Conversation.deleteMany({ participants: user._id });
            
            // 3. Delete all their messages
            await Message.deleteMany({ sender: user._id });
            
            // 4. (Optional) Remove them from other users' saved listings
            // This is complex, but we'll do a basic version:
            await User.updateMany(
                { savedListings: user._id },
                { $pull: { savedListings: user._id } }
            );

            // 5. Delete the user themselves
            await User.deleteOne({ _id: user._id });
            
            console.log(`CRON JOB: Successfully deleted user ${user.email}.`);
        }
    } catch (error) {
        console.error('CRON JOB ERROR: Failed during account deletion process:', error);
    }
});
// --- END OF SCHEDULED JOB ---


server.listen(PORT, () => {
    console.log(`Nyumba backend server is running successfully on port ${PORT}`);
});