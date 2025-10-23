// nyumba-backend/routes/uploadRoutes.js
const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Configure Cloudinary with environment variables
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Use multer for memory storage to handle file streams
const storage = multer.memoryStorage();
const upload = multer({ storage });

// This is a helper function that uploads a file buffer to Cloudinary
const handleUpload = (buffer) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { resource_type: 'auto' },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );
        const readableStream = new Readable();
        readableStream.push(buffer);
        readableStream.push(null);
        readableStream.pipe(uploadStream);
    });
};

// Define the new upload route.
// 'upload.array('images', 10)' means we expect multiple files, under the field name 'images', with a max of 10.
router.post('/', protect, upload.array('images', 10), async (req, res) => {
    try {
        const urls = [];
        for (const file of req.files) {
            const result = await handleUpload(file.buffer);
            urls.push(result.secure_url);
        }
        res.status(200).json({ message: 'Images uploaded successfully', urls });
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        res.status(500).json({ message: 'Error uploading images', error });
    }
});

module.exports = router;