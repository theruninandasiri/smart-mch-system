const Mother = require('../models/Mother');
const RiskAssessment = require('../models/RiskAssessment');

const getDashboardStats = async (req, res) => {
  try {
    const [totalMothers, highRisk, mediumRisk, lowRisk, pregnant, delivered, postnatal] = await Promise.all([
      Mother.countDocuments(),
      Mother.countDocuments({ riskLevel: 'high' }),
      Mother.countDocuments({ riskLevel: 'medium' }),
      Mother.countDocuments({ riskLevel: 'low' }),
      Mother.countDocuments({ status: 'pregnant' }),
      Mother.countDocuments({ status: 'delivered' }),
      Mother.countDocuments({ status: 'postnatal' }),
    ]);

    return res.json({ totalMothers, highRisk, mediumRisk, lowRisk, pregnant, delivered, postnatal });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getRiskTrends = async (req, res) => {
  try {
    const trends = await RiskAssessment.aggregate([
      {
        $group: {
          _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
          avgRiskScore: {
            $avg: {
              $cond: {
                if:   { $eq: ['$riskLevel', 'high'] },
                then: 2,
                else: {
                  $cond: {
                    if:   { $eq: ['$riskLevel', 'medium'] },
                    then: 1,
                    else: 0,
                  },
                },
              },
            },
          },
          highCount:   { $sum: { $cond: [{ $eq: ['$riskLevel', 'high'] },   1, 0] } },
          mediumCount: { $sum: { $cond: [{ $eq: ['$riskLevel', 'medium'] }, 1, 0] } },
          lowCount:    { $sum: { $cond: [{ $eq: ['$riskLevel', 'low'] },    1, 0] } },
          total:       { $sum: 1 },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 6 },
    ]);
    return res.json(trends);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboardStats, getRiskTrends };