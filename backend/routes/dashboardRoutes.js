const express = require('express');
const router = express.Router();
const { getDashboardStats, getRiskTrends } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

router.get('/stats', protect, getDashboardStats);
router.get('/risk-trends', protect, getRiskTrends);

module.exports = router;