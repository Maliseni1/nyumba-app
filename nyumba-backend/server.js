const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const cron = require('node-cron'); 

// IMPORT MODELS
const User = require('./models/userModel');
const { Listing } = require('./models/listingModel');
const Conversation = require('./models/conversationModel');
const Message = require('./models/messageModel');

// Configure dotenv
dotenv.config({ path: path.join(__dirname, '.env') });

// --- Environment Variable Check (unchanged) ---
const requiredEnvVars = [
    'MONGO_URI',
    'JWT_SECRET',
    'GOOGLE_CLIENT_ID',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET'
];
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
// --- End Env Check ---

const userRoutes = require('./routes/userRoutes');
const listingRoutes = require('./routes/listingRoutes');
const messageRoutes = require('./routes/messageRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const rewardRoutes = require('./routes/rewardRoutes');
const forumRoutes = require('./routes/forumRoutes');
const adRoutes = require('./routes/adRoutes'); // <-- 1. IMPORT NEW AD ROUTES

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

// --- CORS Configuration (unchanged) ---
const whitelist = [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://nyumba-app.vercel.app',
    'https://nyumba-app-git-master-maliseni1.vercel.app',
    process.env.FRONTEND_URL
].filter(Boolean);
const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || whitelist.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.error('CORS Error: Origin not allowed:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};
app.options('*', cors(corsOptions));
app.use(cors(corsOptions));
// --- END OF CORS ---

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
app.use('/api/rewards', rewardRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/ads', adRoutes); // <-- 2. USE NEW AD ROUTES

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

io.on('connection', (socket) => {
    // ... (socket logic unchanged)
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


// --- SCHEDULED JOB (unchanged) ---
console.log('Setting up daily job for account deletion...');
cron.schedule('0 0 * * *', async () => {
    // ... (cron job logic unchanged)
    console.log('RUNNING DAILY CRON JOB: Checking for accounts pending deletion...');
    try {
        const usersToDelete = await User.find({
            isScheduledForDeletion: true,
            deletionScheduledAt: { $lte: new Date() } 
        });

        if (usersToDelete.length === 0) {
            console.log('CRON JOB: No accounts are due for deletion.');
            return;
        }

        console.log(`CRON JOB: Found ${usersToDelete.length} user(s) for permanent deletion.`);

        for (const user of usersToDelete) {
            console.log(`CRON JOB: Deleting user ${user.email} (ID: ${user._id})`);
            await Listing.deleteMany({ owner: user._id });
            await Conversation.deleteMany({ participants: user._id });
            await Message.deleteMany({ sender: user._id });
            await User.updateMany(
                { savedListings: user._id },
                { $pull: { savedListings: user._id } }
            );
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