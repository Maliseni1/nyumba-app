const multer = require('multer');
const { storage } = require('../config/cloudinary');

const upload = multer({
    storage,
    limits: {
        fileSize: 1024 * 1024 * 5 // 5 Megabytes
    }
});

module.exports = upload;