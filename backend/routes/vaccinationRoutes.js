const express = require('express');
const router = express.Router();
const {
  initVaccinationSchedule,
  getVaccinationRecord,
  updateVaccineEntry,
} = require('../controllers/vaccinationController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/init/:childId', protect, authorize('moh_officer', 'midwife'), initVaccinationSchedule);
router.get('/:childId', protect, getVaccinationRecord);
router.put('/:childId/vaccine/:vaccineId', protect, authorize('moh_officer', 'midwife'), updateVaccineEntry);

module.exports = router;