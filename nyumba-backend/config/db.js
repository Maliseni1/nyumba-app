// nyumba-backend/config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // The MONGO_URI will be loaded into process.env from our server.js file
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is not defined. Check your .env file.');
        }
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`DATABASE CONNECTION ERROR: ${error.message}`);
        process.exit(1); // Exit the application with an error
    }
};

module.exports = connectDB;