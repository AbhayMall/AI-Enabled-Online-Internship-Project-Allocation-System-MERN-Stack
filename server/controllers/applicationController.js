const Application = require('../models/Application');
const Opportunity = require('../models/Opportunity');
const StudentProfile = require('../models/StudentProfile');
const Allocation = require('../models/Allocation');
const Notification = require('../models/Notification');
const { calculateMatchScore } = require('../services/matchingEngine');

/**
 * @desc    Apply to an opportunity
 * @route   POST /api/applications/:opportunityId
 * @access  Private (Student)
 */
const applyToOpportunity = async (req, res, next) => {
  try {
    const { opportunityId } = req.params;

    const opportunity = await Opportunity.findById(opportunityId);
    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: 'Opportunity not found',
      });
    }

    if (opportunity.status === 'closed') {
      return res.status(400).json({
        success: false,
        message: 'This opportunity is closed and no longer accepting applications',
      });
    }

    // Check if duplicate
    const existingApplication = await Application.findOne({
      student: req.user.id,
      opportunity: opportunityId,
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted an application for this opportunity',
      });
    }

    // Fetch student profile to compute match score
    const studentProfile = await StudentProfile.findOne({ user: req.user.id });
    const matchAnalysis = calculateMatchScore(studentProfile, opportunity);

    const application = await Application.create({
      student: req.user.id,
      opportunity: opportunityId,
      status: 'applied',
      matchScore: matchAnalysis.score,
    });

    // Notify the faculty member who posted the opportunity
    if (opportunity.postedBy) {
      await Notification.create({
        user: opportunity.postedBy,
        message: `New student application received for "${opportunity.title}" (Match: ${matchAnalysis.score}%)`,
        type: 'new_application',
      });
    }

    await application.populate([
      { path: 'opportunity', populate: { path: 'postedBy', select: 'name email' } },
      { path: 'student', select: 'name email' },
    ]);

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      application,
      matchAnalysis,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Withdraw an application
 * @route   DELETE /api/applications/:id
 * @access  Private (Student - own only)
 */
const withdrawApplication = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    // Check ownership
    if (application.student.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to withdraw this application',
      });
    }

    // If allocated, remove allocation record too
    if (application.status === 'allocated') {
      await Allocation.findOneAndDelete({ application: application._id });
    }

    await Application.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Application withdrawn successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    List own applications
 * @route   GET /api/applications/mine
 * @access  Private (Student)
 */
const getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ student: req.user.id })
      .populate({
        path: 'opportunity',
        populate: { path: 'postedBy', select: 'name email department' },
      })
      .sort({ appliedAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    List applications received for faculty postings
 * @route   GET /api/applications/received
 * @access  Private (Faculty, Admin)
 */
const getReceivedApplications = async (req, res, next) => {
  try {
    let opportunityIds = [];

    if (req.user.role === 'admin') {
      const allOpps = await Opportunity.find().select('_id');
      opportunityIds = allOpps.map((o) => o._id);
    } else {
      const facultyOpps = await Opportunity.find({ postedBy: req.user.id }).select('_id');
      opportunityIds = facultyOpps.map((o) => o._id);
    }

    const { status, opportunityId } = req.query;
    const filter = {
      opportunity: { $in: opportunityIds },
    };

    if (status) {
      filter.status = status;
    }

    if (opportunityId) {
      filter.opportunity = opportunityId;
    }

    const applications = await Application.find(filter)
      .populate('opportunity')
      .populate('student', 'name email role')
      .sort({ appliedAt: -1 });

    // Enhance with student profile details (skills, resume, department)
    const enhancedApplications = await Promise.all(
      applications.map(async (app) => {
        const studentProfile = await StudentProfile.findOne({ user: app.student._id });
        return {
          ...app.toObject(),
          studentProfile: studentProfile || null,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: enhancedApplications.length,
      applications: enhancedApplications,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update application status (approve, reject, waitlist, allocate)
 * @route   PUT /api/applications/:id/status
 * @access  Private (Faculty, Admin)
 */
const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status, hoursCompleted } = req.body;
    const validStatuses = ['applied', 'under_review', 'approved', 'rejected', 'waitlisted', 'allocated'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const application = await Application.findById(req.params.id)
      .populate('opportunity')
      .populate('student', 'name email');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    // Verify ownership of opportunity
    if (
      req.user.role !== 'admin' &&
      application.opportunity.postedBy.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to manage applications for this posting',
      });
    }

    application.status = status;
    await application.save();

    let allocation = null;

    // Handle allocation creation if marked as allocated
    if (status === 'allocated') {
      allocation = await Allocation.findOneAndUpdate(
        { application: application._id },
        {
          application: application._id,
          student: application.student._id,
          opportunity: application.opportunity._id,
          allocatedAt: new Date(),
          hoursCompleted: hoursCompleted !== undefined ? Number(hoursCompleted) : 0,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    } else {
      // If status reverted from allocated, remove allocation
      await Allocation.findOneAndDelete({ application: application._id });
    }

    // Send notification to student
    const readableStatus = status.replace('_', ' ').toUpperCase();
    await Notification.create({
      user: application.student._id,
      message: `Your application for "${application.opportunity.title}" is now: ${readableStatus}`,
      type: 'status_update',
    });

    res.status(200).json({
      success: true,
      message: `Application status updated to ${status}`,
      application,
      allocation,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  applyToOpportunity,
  withdrawApplication,
  getMyApplications,
  getReceivedApplications,
  updateApplicationStatus,
};
