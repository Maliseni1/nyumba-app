const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// This file should be loaded after dotenv has been configured in server.js
// so process.env variables will be available.
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'nyumba-app', // Folder name in Cloudinary
    allowed_formats: ['jpeg', 'png', 'jpg'],
  },
});

const upload = multer({ storage: storage });

module.exports = upload;