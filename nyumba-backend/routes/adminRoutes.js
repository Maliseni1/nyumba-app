const express = require('express');
const router = express.Router();
const { getAppStats, getAllUsers } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

// All routes in this file are first protected (login required)
// and then checked for admin status (admin required).

// GET /api/admin/stats
router.route('/stats').get(protect, admin, getAppStats);

// GET /api/admin/users
router.route('/users').get(protect, admin, getAllUsers);

module.exports = router;