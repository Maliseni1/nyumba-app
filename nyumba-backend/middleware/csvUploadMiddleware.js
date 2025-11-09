const multer = require('multer');
const path = require('path');

// Configure storage for CSV files
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // We'll store CSVs in a temporary 'uploads/csv' folder
        cb(null, 'uploads/csv/'); 
    },
    filename: function (req, file, cb) {
        // Create a unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter to only accept .csv
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.mimetype === 'application/vnd.ms-excel') {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only .csv files are allowed.'), false);
    }
};

const csvUpload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 5 // 5MB file size limit
    }
});

module.exports = csvUpload;