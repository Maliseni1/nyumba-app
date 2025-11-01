const asyncHandler = require('express-async-handler');

// Middleware to check if the user is an admin
const admin = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        res.status(403); // 403 Forbidden
        throw new Error('Not authorized as an admin');
    }
};

module.exports = { admin };