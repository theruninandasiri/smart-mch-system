const express = require('express');
const router = express.Router();
const {
  registerChild,
  registerMultipleChildren,
  getChildrenByMother,
  getChildById,
  getChildByChildId,
  getSiblings,
  addGrowthRecord,
  addClinicVisit,
  getGrowthRecords,
} = require('../controllers/childController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('moh_officer', 'midwife'), registerChild);
router.post('/multiple', protect, authorize('moh_officer', 'midwife'), registerMultipleChildren);
router.get('/mother/:motherId', protect, getChildrenByMother);
router.get('/childid/:childId', protect, getChildByChildId);
router.get('/:id/siblings', protect, getSiblings);
router.get('/:id/growth', protect, getGrowthRecords);
router.get('/:id', protect, getChildById);
router.post('/:id/growth', protect, authorize('moh_officer', 'midwife'), addGrowthRecord);
router.post('/:id/visit', protect, authorize('moh_officer', 'midwife'), addClinicVisit);

module.exports = router;