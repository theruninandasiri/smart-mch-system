const Vaccination = require('../models/Vaccination');
const Child = require('../models/Child');

// Sri Lanka National Immunization Program schedule
const NIP_SCHEDULE = [
  { vaccineName: 'BCG', ageInMonths: 0 },
  { vaccineName: 'OPV 0', ageInMonths: 0 },
  { vaccineName: 'Hepatitis B (Birth)', ageInMonths: 0 },
  { vaccineName: 'DTP-HepB-Hib 1 + OPV 1', ageInMonths: 2 },
  { vaccineName: 'DTP-HepB-Hib 2 + OPV 2', ageInMonths: 4 },
  { vaccineName: 'DTP-HepB-Hib 3 + OPV 3', ageInMonths: 6 },
  { vaccineName: 'MR 1', ageInMonths: 9 },
  { vaccineName: 'JE 1', ageInMonths: 12 },
  { vaccineName: 'MR 2 + DTP Booster', ageInMonths: 18 },
  { vaccineName: 'JE 2', ageInMonths: 24 },
  { vaccineName: 'DTP Booster 2 + OPV 4', ageInMonths: 60 },
];

// @desc    Initialize vaccination schedule for a child (based on NIP)
// @route   POST /api/vaccination/init/:childId
const initVaccinationSchedule = async (req, res) => {
  try {
    const child = await Child.findById(req.params.childId);
    if (!child) return res.status(404).json({ message: 'Child not found' });

    const existing = await Vaccination.findOne({ child: req.params.childId });
    if (existing) return res.status(400).json({ message: 'Vaccination schedule already initialized' });

    const dob = new Date(child.dateOfBirth);

    const vaccines = NIP_SCHEDULE.map(v => {
      const scheduledDate = new Date(dob);
      scheduledDate.setMonth(scheduledDate.getMonth() + v.ageInMonths);
      return { vaccineName: v.vaccineName, scheduledDate };
    });

    const record = await Vaccination.create({ child: req.params.childId, vaccines });
    return res.status(201).json(record);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get vaccination record for a child
// @route   GET /api/vaccination/:childId
const getVaccinationRecord = async (req, res) => {
  try {
    const record = await Vaccination.findOne({ child: req.params.childId })
      .populate('vaccines.givenBy', 'name role');
    if (!record) return res.status(404).json({ message: 'No vaccination record found' });
    return res.json(record);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Update a single vaccine entry (mark as given, missed, etc.)
// @route   PUT /api/vaccination/:childId/vaccine/:vaccineId
const updateVaccineEntry = async (req, res) => {
  try {
    const { status, givenDate, batchNumber, notes } = req.body;

    const record = await Vaccination.findOne({ child: req.params.childId });
    if (!record) return res.status(404).json({ message: 'Vaccination record not found' });

    const vaccine = record.vaccines.id(req.params.vaccineId);
    if (!vaccine) return res.status(404).json({ message: 'Vaccine entry not found' });

    vaccine.status = status || vaccine.status;
    vaccine.givenDate = givenDate || vaccine.givenDate;
    vaccine.batchNumber = batchNumber || vaccine.batchNumber;
    vaccine.notes = notes || vaccine.notes;
    vaccine.givenBy = req.user._id;

    await record.save();
    return res.json(record);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { initVaccinationSchedule, getVaccinationRecord, updateVaccineEntry };