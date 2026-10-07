const Opportunity = require('../models/Opportunity');
const StudentProfile = require('../models/StudentProfile');
const Application = require('../models/Application');
const { rankOpportunities } = require('../services/matchingEngine');

/**
 * @desc    Get AI-ranked opportunity recommendations for the logged-in student
 * @route   GET /api/match/recommendations
 * @access  Private (Student)
 */
const getRecommendations = async (req, res, next) => {
  try {
    const studentProfile = await StudentProfile.findOne({ user: req.user.id });

    // Fetch all open opportunities
    const opportunities = await Opportunity.find({ status: 'open' })
      .populate('postedBy', 'name email department');

    if (!opportunities || opportunities.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        recommendations: [],
      });
    }

    // Rank opportunities using matching engine
    const ranked = rankOpportunities(studentProfile, opportunities);

    // Also check which opportunities the student has already applied for
    const existingApplications = await Application.find({ student: req.user.id });
    const appliedOppIds = new Set(existingApplications.map((a) => a.opportunity.toString()));

    const recommendations = ranked.map((opp) => ({
      ...opp,
      hasApplied: appliedOppIds.has(opp._id.toString()),
    }));

    res.status(200).json({
      success: true,
      count: recommendations.length,
      recommendations,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRecommendations,
};
