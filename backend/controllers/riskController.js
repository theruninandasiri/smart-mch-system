const RiskAssessment = require('../models/RiskAssessment');
const Mother = require('../models/Mother');

const calculateRisk = (data) => {
  let riskLevel = 'low';
  let isHypertension = false;
  let isAnemia = false;
  let isDepression = false;

  if (
    data.bloodPressureSystolic >= 140 ||
    data.bloodPressureDiastolic >= 90
  ) {
    isHypertension = true;
    riskLevel = 'high';
  } else if (
    data.bloodPressureSystolic >= 130 ||
    data.bloodPressureDiastolic >= 80
  ) {
    riskLevel = 'medium';
  }

  if (data.hemoglobin < 7) {
    isAnemia = true;
    riskLevel = 'high';
  } else if (data.hemoglobin < 11) {
    isAnemia = true;

    if (riskLevel !== 'high') {
      riskLevel = 'medium';
    }
  }

  if (data.epdsScore >= 13) {
    isDepression = true;

    if (riskLevel !== 'high') {
      riskLevel = 'medium';
    }
  }

  return {
    riskLevel,
    isHypertension,
    isAnemia,
    isDepression
  };
};


// @desc Create risk assessment
// @route POST /api/risk
const createRiskAssessment = async (req, res) => {
  try {
    const {
      motherId,
      bloodPressureSystolic,
      bloodPressureDiastolic,
      weight,
      hemoglobin,
      fetalHeartRate,
      fetalHeartRates,
      epdsScore,
      notes
    } = req.body;

    const mother = await Mother.findById(motherId);

    if (!mother) {
      return res.status(404).json({
        message: 'Mother not found'
      });
    }

    const { 
      riskLevel,
      isHypertension,
      isAnemia,
      isDepression
    } = calculateRisk({
      bloodPressureSystolic,
      bloodPressureDiastolic,
      hemoglobin,
      epdsScore
    });

    /*
     * For a single fetus, keep the original fetalHeartRate field.
     * For multiple fetuses, store each fetal heart rate separately.
     */
    let savedFetalHeartRates = [];

    if (Array.isArray(fetalHeartRates)) {
      savedFetalHeartRates = fetalHeartRates
        .filter(item =>
          item &&
          item.heartRate !== '' &&
          item.heartRate !== null &&
          item.heartRate !== undefined
        )
        .map((item, index) => ({
          fetusNumber: item.fetusNumber || index + 1,
          heartRate: Number(item.heartRate)
        }));
    }

   const assessment = await RiskAssessment.create({
  mother: motherId,
  bloodPressureSystolic,
  bloodPressureDiastolic,
  weight,
  hemoglobin,
  fetalHeartRates: req.body.fetalHeartRates || [],
  epdsScore,
  notes,
  riskLevel,
  isHypertension,
  isAnemia,
  isDepression,
});

    await Mother.findByIdAndUpdate(
      motherId,
      { riskLevel }
    );

    return res.status(201).json({
      assessment,

      alerts: {
        hypertension: isHypertension,
        anemia: isAnemia,
        depression: isDepression,
        riskLevel,
        fetalHeartRates: req.body.fetalHeartRates || [],
      }
    });

  } catch (error) {
    console.error('CREATE RISK ASSESSMENT ERROR:', error);

    return res.status(500).json({
      message: error.message
    });
  }
};


// @desc Get assessments by mother
// @route GET /api/risk/mother/:motherId
const getAssessmentsByMother = async (req, res) => {
  try {
    const assessments = await RiskAssessment
      .find({ mother: req.params.motherId })
      .sort({ createdAt: -1 });

    return res.json(assessments);

  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};


module.exports = {
  createRiskAssessment,
  getAssessmentsByMother
};