const multer = require('multer');
const { storage } = require('../config/cloudinary');

const upload = multer({
    storage,
    limits: {
        // --- UPDATED: Increased limit from 5MB to 100MB for video ---
        fileSize: 1024 * 1024 * 100 // 100 Megabytes
    }
});

module.exports = upload;