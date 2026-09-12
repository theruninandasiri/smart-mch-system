const express = require('express');
const router = express.Router();
const {
  registerMother,
  getMothers,
  getMotherById,
  getMotherByBarcode,
  updateMother
} = require('../controllers/motherController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Only MOH officers and midwives can register mothers
router.post('/', protect, authorize('moh_officer', 'midwife'), registerMother);

// All authenticated users can view
router.get('/', protect, getMothers);
router.get('/barcode/:barcodeId', protect, getMotherByBarcode);
router.get('/:id', protect, getMotherById);

// Only MOH officers and midwives can update — mothers CANNOT edit
router.put('/:id', protect, authorize('moh_officer', 'midwife'), updateMother);

module.exports = router;