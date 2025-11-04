const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

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

server.listen(PORT, () => {
    console.log(`Nyumba backend server is running successfully on port ${PORT}`);
});