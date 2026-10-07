const Opportunity = require('../models/Opportunity');
const Application = require('../models/Application');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { sendOpportunityBroadcast } = require('../services/emailService');
const { validateRequired } = require('../utils/validators');

/**
 * @desc    List all open opportunities with search & filter
 * @route   GET /api/opportunities
 * @access  Private (Any logged-in user)
 */
const getOpportunities = async (req, res, next) => {
  try {
    const { type, department, skill, search, status } = req.query;

    const query = {};

    // By default, show open postings unless specified
    if (status) {
      query.status = status;
    } else {
      query.status = 'open';
    }

    if (type) {
      query.type = type;
    }

    if (department && department !== 'All') {
      query.department = new RegExp(`^${department}$`, 'i');
    }

    if (skill) {
      query.requiredSkills = { $in: [new RegExp(skill, 'i')] };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
        { requiredSkills: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const opportunities = await Opportunity.find(query)
      .populate('postedBy', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: opportunities.length,
      opportunities,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single opportunity by ID
 * @route   GET /api/opportunities/:id
 * @access  Private (Any logged-in user)
 */
const getOpportunityById = async (req, res, next) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id)
      .populate('postedBy', 'name email role');

    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: 'Opportunity not found',
      });
    }

    // Also get application count for this opportunity
    const applicationCount = await Application.countDocuments({ opportunity: opportunity._id });
    const allocatedCount = await Application.countDocuments({ opportunity: opportunity._id, status: 'allocated' });

    res.status(200).json({
      success: true,
      opportunity,
      stats: {
        totalApplications: applicationCount,
        allocatedCount,
        availableSlots: Math.max(0, opportunity.capacity - allocatedCount),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new opportunity and dispatch broadcast alerts to all students
 * @route   POST /api/opportunities
 * @access  Private (Faculty, Admin)
 */
const createOpportunity = async (req, res, next) => {
  try {
    const { title, type, description, requiredSkills, capacity, department } = req.body;

    const missing = validateRequired(req.body, ['title', 'type', 'capacity']);
    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missing.join(', ')}`,
      });
    }

    const skillsArray = Array.isArray(requiredSkills)
      ? requiredSkills
      : typeof requiredSkills === 'string'
      ? requiredSkills.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    const opportunity = await Opportunity.create({
      title: title.trim(),
      type,
      description: description || '',
      requiredSkills: skillsArray,
      capacity: Number(capacity) || 1,
      department: department || '',
      postedBy: req.user.id,
      status: 'open',
    });

    await opportunity.populate('postedBy', 'name email role');

    // Asynchronously broadcast email & in-app notifications to all registered students
    try {
      const students = await User.find({ role: 'student' }).select('_id email name');
      const studentEmails = students.map((s) => s.email).filter(Boolean);

      if (studentEmails.length > 0) {
        // Send email broadcast
        await sendOpportunityBroadcast({ studentEmails, opportunity });

        // Create in-app notifications for each student
        const notificationDocs = students.map((s) => ({
          user: s._id,
          message: `New ${opportunity.type === 'internship' ? 'internship' : 'project'} posted: "${opportunity.title}" (${opportunity.department || 'All Departments'})`,
          type: 'new_opportunity',
        }));

        if (notificationDocs.length > 0) {
          await Notification.insertMany(notificationDocs);
        }
      }
    } catch (broadcastError) {
      console.error('[Broadcast Error]', broadcastError.message);
      // Non-blocking for posting creation
    }

    res.status(201).json({
      success: true,
      message: 'Opportunity created and broadcasted to all students successfully',
      opportunity,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an opportunity
 * @route   PUT /api/opportunities/:id
 * @access  Private (Faculty - own only, Admin)
 */
const updateOpportunity = async (req, res, next) => {
  try {
    let opportunity = await Opportunity.findById(req.params.id);

    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: 'Opportunity not found',
      });
    }

    // Ownership check: Admin can edit any; Faculty can only edit own posting
    if (req.user.role !== 'admin' && opportunity.postedBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this opportunity posting',
      });
    }

    const { title, type, description, requiredSkills, capacity, department, status } = req.body;

    if (title !== undefined) opportunity.title = title.trim();
    if (type !== undefined) opportunity.type = type;
    if (description !== undefined) opportunity.description = description;
    if (capacity !== undefined) opportunity.capacity = Number(capacity);
    if (department !== undefined) opportunity.department = department;
    if (status !== undefined) opportunity.status = status;

    if (requiredSkills !== undefined) {
      opportunity.requiredSkills = Array.isArray(requiredSkills)
        ? requiredSkills
        : typeof requiredSkills === 'string'
        ? requiredSkills.split(',').map((s) => s.trim()).filter(Boolean)
        : [];
    }

    await opportunity.save();
    await opportunity.populate('postedBy', 'name email role');

    res.status(200).json({
      success: true,
      message: 'Opportunity updated successfully',
      opportunity,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete / Close an opportunity
 * @route   DELETE /api/opportunities/:id
 * @access  Private (Faculty - own only, Admin)
 */
const deleteOpportunity = async (req, res, next) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);

    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: 'Opportunity not found',
      });
    }

    // Ownership check
    if (req.user.role !== 'admin' && opportunity.postedBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this opportunity posting',
      });
    }

    await Opportunity.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Opportunity removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    List postings created by the logged-in faculty
 * @route   GET /api/opportunities/mine
 * @access  Private (Faculty)
 */
const getMyOpportunities = async (req, res, next) => {
  try {
    const opportunities = await Opportunity.find({ postedBy: req.user.id })
      .sort({ createdAt: -1 });

    // Enhance each with applicant counts
    const enhanced = await Promise.all(
      opportunities.map(async (opp) => {
        const totalApps = await Application.countDocuments({ opportunity: opp._id });
        const allocatedApps = await Application.countDocuments({ opportunity: opp._id, status: 'allocated' });
        return {
          ...opp.toObject(),
          totalApplications: totalApps,
          allocatedCount: allocatedApps,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: enhanced.length,
      opportunities: enhanced,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOpportunities,
  getOpportunityById,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
  getMyOpportunities,
};
