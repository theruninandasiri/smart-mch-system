const crypto = require('crypto');
const Child = require('../models/Child');
const Mother = require('../models/Mother');

// @desc    Register a single child (post-delivery)
// @route   POST /api/children
const registerChild = async (req, res) => {
  try {
    const {
      motherId, name, dateOfBirth, gender,
      birthWeight, birthHeight, bloodGroup,
      multipleBirthType, birthOrder, tempLabel,
    } = req.body;

    const mother = await Mother.findById(motherId);

    if (!mother) {
      return res.status(404).json({
        message: 'Mother not found'
      });
    }

    const child = await Child.create({
      mother: motherId,
      motherNic: mother.nic,
      name,
      dateOfBirth,
      gender,
      birthWeight,
      birthHeight,
      bloodGroup,
      multipleBirthType: multipleBirthType || 'single',
      birthOrder: birthOrder || 1,
      tempLabel,
    });

    await Mother.findByIdAndUpdate(
      motherId,
      { status: 'postnatal' }
    );

    return res.status(201).json(child);

  } catch (error) {
    console.error('REGISTER CHILD ERROR:', error);

    return res.status(500).json({
      message: error.message
    });
  }
};


// @desc    Register multiple children from one delivery
// @route   POST /api/children/multiple
const registerMultipleChildren = async (req, res) => {
  try {
    const {
      motherId,
      dateOfBirth,
      multipleBirthType,
      babies
    } = req.body;

    if (!Array.isArray(babies) || babies.length < 2) {
      return res.status(400).json({
        message: 'At least 2 babies required for multiple birth.'
      });
    }

    const mother = await Mother.findById(motherId);

    if (!mother) {
      return res.status(404).json({
        message: 'Mother not found'
      });
    }

    const multipleBirthGroupId = crypto.randomUUID();

    // Get existing children count for this mother
    const existingCount = await Child.countDocuments({
      mother: motherId
    });

    const docs = babies.map((baby, index) => ({
      mother: motherId,
      motherNic: mother.nic,

      childNumber: existingCount + index + 1,

      childId:
        `CHD-${mother.nic}-${existingCount + index + 1}-${Date.now() + index}`,

      name: baby.name,
      dateOfBirth,
      gender: baby.gender,
      birthWeight: baby.birthWeight,
      birthHeight: baby.birthHeight,
      bloodGroup: baby.bloodGroup,

      multipleBirthType:
        multipleBirthType ||
        (
          babies.length === 2
            ? 'twin'
            : babies.length === 3
              ? 'triplet'
              : 'multiple'
        ),

      birthOrder: index + 1,
      multipleBirthGroupId,

      tempLabel:
        baby.tempLabel ||
        `Baby ${String.fromCharCode(65 + index)}`,
    }));

    const children = await Child.insertMany(docs);

    await Mother.findByIdAndUpdate(
      motherId,
      { status: 'postnatal' }
    );

    return res.status(201).json(children);

  } catch (error) {
    console.error('REGISTER MULTIPLE CHILDREN ERROR:', error);

    return res.status(500).json({
      message: error.message
    });
  }
};


// @desc    Get all children for a mother
// @route   GET /api/children/mother/:motherId
const getChildrenByMother = async (req, res) => {
  try {
    const children = await Child.find({
      mother: req.params.motherId
    }).sort({
      dateOfBirth: 1,
      birthOrder: 1
    });

    return res.json(children);

  } catch (error) {
    console.error('GET CHILDREN BY MOTHER ERROR:', error);

    return res.status(500).json({
      message: error.message
    });
  }
};


// @desc    Get child by ID
// @route   GET /api/children/:id
const getChildById = async (req, res) => {
  try {
    const child = await Child.findById(req.params.id)
      .populate(
        'mother',
        'nic mohArea barcodeId'
      );

    if (!child) {
      return res.status(404).json({
        message: 'Child not found'
      });
    }

    return res.json(child);

  } catch (error) {
    console.error('GET CHILD BY ID ERROR:', error);

    return res.status(500).json({
      message: error.message
    });
  }
};


// @desc    Get child by childId
// @route   GET /api/children/childid/:childId
const getChildByChildId = async (req, res) => {
  try {
    const child = await Child.findOne({
      childId: req.params.childId
    }).populate(
      'mother',
      'nic mohArea barcodeId'
    );

    if (!child) {
      return res.status(404).json({
        message: 'Child not found'
      });
    }

    return res.json(child);

  } catch (error) {
    console.error('GET CHILD BY CHILD ID ERROR:', error);

    return res.status(500).json({
      message: error.message
    });
  }
};


// @desc    Get siblings from same delivery
// @route   GET /api/children/:id/siblings
const getSiblings = async (req, res) => {
  try {
    const child = await Child.findById(req.params.id);

    if (!child) {
      return res.status(404).json({
        message: 'Child not found'
      });
    }

    if (!child.multipleBirthGroupId) {
      return res.json([]);
    }

    const siblings = await Child.find({
      multipleBirthGroupId: child.multipleBirthGroupId,
      _id: { $ne: child._id },
    }).sort({
      birthOrder: 1
    });

    return res.json(siblings);

  } catch (error) {
    console.error('GET SIBLINGS ERROR:', error);

    return res.status(500).json({
      message: error.message
    });
  }
};


// @desc    Add a growth record
// @route   POST /api/children/:id/growth
const addGrowthRecord = async (req, res) => {
  try {
    const {
      ageInMonths,
      weight,
      height,
      headCircumference,
      notes
    } = req.body;

    // Validate required fields
    if (
      ageInMonths === undefined ||
      ageInMonths === '' ||
      weight === undefined ||
      weight === '' ||
      height === undefined ||
      height === ''
    ) {
      return res.status(400).json({
        message: 'Age, weight, and height are required.'
      });
    }

    // Find child
    const child = await Child.findById(req.params.id);

    if (!child) {
      return res.status(404).json({
        message: 'Child not found'
      });
    }

    // Convert input values to numbers
    const growthRecord = {
      date: new Date(),

      ageInMonths: Number(ageInMonths),

      weight: Number(weight),

      height: Number(height),

      headCircumference:
        headCircumference !== undefined &&
        headCircumference !== ''
          ? Number(headCircumference)
          : undefined,

      notes: notes || undefined
    };

    // Validate numeric values
    if (
      !Number.isFinite(growthRecord.ageInMonths) ||
      !Number.isFinite(growthRecord.weight) ||
      !Number.isFinite(growthRecord.height)
    ) {
      return res.status(400).json({
        message: 'Age, weight, and height must be valid numbers.'
      });
    }

    if (
      growthRecord.headCircumference !== undefined &&
      !Number.isFinite(growthRecord.headCircumference)
    ) {
      return res.status(400).json({
        message: 'Head circumference must be a valid number.'
      });
    }

    // Add growth record
    child.growthRecords.push(growthRecord);

    // Save child
    await child.save();

    return res.status(201).json(child);

  } catch (error) {
    console.error('ADD GROWTH RECORD ERROR:', error);

    return res.status(500).json({
      message: error.message,
      error: error.name
    });
  }
};


// @desc    Add a clinic visit log
// @route   POST /api/children/:id/visit
const addClinicVisit = async (req, res) => {
  try {
    const {
      visitDate,
      weight,
      height,
      notes,
      nextVisitDate
    } = req.body;

    const child = await Child.findById(req.params.id);

    if (!child) {
      return res.status(404).json({
        message: 'Child not found'
      });
    }

    child.clinicVisits.push({
      visitDate,
      recordedBy: req.user._id,
      weight,
      height,
      notes,
      nextVisitDate,
    });

    await child.save();

    return res.status(201).json(child);

  } catch (error) {
    console.error('ADD CLINIC VISIT ERROR:', error);

    return res.status(500).json({
      message: error.message
    });
  }
};


// @desc    Get growth records for a child
// @route   GET /api/children/:id/growth
const getGrowthRecords = async (req, res) => {
  try {
    const child = await Child.findById(
      req.params.id,
      'growthRecords dateOfBirth gender childId'
    );

    if (!child) {
      return res.status(404).json({
        message: 'Child not found'
      });
    }

    return res.json(child);

  } catch (error) {
    console.error('GET GROWTH RECORDS ERROR:', error);

    return res.status(500).json({
      message: error.message,
      error: error.name
    });
  }
};


// Export all controller functions
module.exports = {
  registerChild,
  registerMultipleChildren,
  getChildrenByMother,
  getChildById,
  getChildByChildId,
  getSiblings,
  addGrowthRecord,
  addClinicVisit,
  getGrowthRecords,
};