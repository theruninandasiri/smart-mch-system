const express = require('express');
const router = express.Router();
const { 
  createRiskAssessment, 
  getAssessmentsByMother 
} = require('../controllers/riskController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createRiskAssessment);
router.get('/:motherId', protect, getAssessmentsByMother);

module.exports = router;