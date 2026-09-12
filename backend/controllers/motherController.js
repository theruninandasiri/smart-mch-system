const Mother = require('../models/Mother');

const registerMother = async (req, res) => {
  try {
    const { nic, dateOfBirth, address, mohArea, midwifeArea, bloodGroup,
            pregnancyNumber, lmpDate, edd } = req.body;

    const motherExists = await Mother.findOne({ nic });
    if (motherExists) {
      return res.status(400).json({ message: 'Mother already registered' });
    }

    const barcodeId = 'MCH' + Date.now();
    const mother = await Mother.create({
      ...req.body, barcodeId
    });

    return res.status(201).json(mother);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getMothers = async (req, res) => {
  try {
    let query = {};

    // If midwife — only show mothers from their assigned area
    if (req.user.role === 'midwife' && req.user.area) {
      query = { midwifeArea: req.user.area };
    }

    const mothers = await Mother.find(query);
    return res.json(mothers);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getMotherById = async (req, res) => {
  try {
    const mother = await Mother.findById(req.params.id);
    if (!mother) {
      return res.status(404).json({ message: 'Mother not found' });
    }
    return res.json(mother);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getMotherByBarcode = async (req, res) => {
  try {
    const mother = await Mother.findOne({ barcodeId: req.params.barcodeId });
    if (!mother) {
      return res.status(404).json({ message: 'Mother not found' });
    }
    return res.json(mother);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Fields a mother is allowed to edit on her own record.
// Everything else (clinical, obstetric, risk, area assignment, etc.)
// stays controlled by midwives/MOH officers.
const MOTHER_SELF_EDITABLE_FIELDS = [
  'phone',
  'email',
  'address',
  'preferredLanguage',
  'emergencyContactName',
  'emergencyContactRelationship',
  'emergencyContactPhone',
];

const updateMother = async (req, res) => {
  try {
    const mother = await Mother.findById(req.params.id);
    if (!mother) {
      return res.status(404).json({ message: 'Mother not found' });
    }

    let updates = req.body;

    if (req.user.role === 'mother') {
      // A mother may only ever update her own record
      if (mother.nic !== req.user.nic) {
        return res.status(403).json({ message: 'Not authorized to update this record' });
      }

      // ...and only a limited set of contact-type fields
      updates = {};
      MOTHER_SELF_EDITABLE_FIELDS.forEach((field) => {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      });
    }

    const updated = await Mother.findByIdAndUpdate(
      req.params.id, updates, { new: true, runValidators: true }
    );
    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { registerMother, getMothers, getMotherById, getMotherByBarcode, updateMother };