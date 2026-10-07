const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const FacultyProfile = require('../models/FacultyProfile');
const Opportunity = require('../models/Opportunity');
const Application = require('../models/Application');
const Allocation = require('../models/Allocation');

/**
 * @desc    Get system-wide analytics overview
 * @route   GET /api/admin/analytics/overview
 * @access  Private (Admin)
 */
const getAnalyticsOverview = async (req, res, next) => {
  try {
    // User counts by role
    const userRoleCounts = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
        },
      },
    ]);

    const usersByRole = { student: 0, faculty: 0, admin: 0 };
    userRoleCounts.forEach((item) => {
      if (item._id && usersByRole[item._id] !== undefined) {
        usersByRole[item._id] = item.count;
      }
    });

    // Opportunity metrics
    const totalOpportunities = await Opportunity.countDocuments();
    const openOpportunities = await Opportunity.countDocuments({ status: 'open' });
    const closedOpportunities = await Opportunity.countDocuments({ status: 'closed' });

    // Applications grouped by status
    const applicationStatusCounts = await Application.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const applicationsByStatus = {
      applied: 0,
      under_review: 0,
      approved: 0,
      rejected: 0,
      waitlisted: 0,
      allocated: 0,
    };

    let totalApplications = 0;
    applicationStatusCounts.forEach((item) => {
      if (item._id) {
        applicationsByStatus[item._id] = item.count;
        totalApplications += item.count;
      }
    });

    // Total allocations
    const totalAllocations = await Allocation.countDocuments();

    // Average match score
    const avgScoreResult = await Application.aggregate([
      {
        $group: {
          _id: null,
          avgScore: { $avg: '$matchScore' },
        },
      },
    ]);

    const averageMatchScore = avgScoreResult.length > 0 ? Math.round(avgScoreResult[0].avgScore || 0) : 0;

    res.status(200).json({
      success: true,
      analytics: {
        users: {
          total: usersByRole.student + usersByRole.faculty + usersByRole.admin,
          ...usersByRole,
        },
        opportunities: {
          total: totalOpportunities,
          open: openOpportunities,
          closed: closedOpportunities,
        },
        applications: {
          total: totalApplications,
          byStatus: applicationsByStatus,
        },
        allocations: {
          total: totalAllocations,
        },
        averageMatchScore,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get department-wise and skill-wise distribution analytics
 * @route   GET /api/admin/analytics/department
 * @access  Private (Admin)
 */
const getDepartmentAnalytics = async (req, res, next) => {
  try {
    // 1. Opportunities by Department
    const opportunitiesByDept = await Opportunity.aggregate([
      {
        $group: {
          _id: { $ifNull: ['$department', 'Unspecified'] },
          count: { $sum: 1 },
          totalCapacity: { $sum: '$capacity' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // 2. Students by Department
    const studentsByDept = await StudentProfile.aggregate([
      {
        $group: {
          _id: { $ifNull: ['$department', 'Unspecified'] },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // 3. Top in-demand required skills
    const topSkills = await Opportunity.aggregate([
      { $unwind: '$requiredSkills' },
      {
        $group: {
          _id: '$requiredSkills',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // 4. Allocations by Opportunity Type
    const allocationsByType = await Allocation.aggregate([
      {
        $lookup: {
          from: 'opportunities',
          localField: 'opportunity',
          foreignField: '_id',
          as: 'opp',
        },
      },
      { $unwind: '$opp' },
      {
        $group: {
          _id: '$opp.type',
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      departmentAnalytics: {
        opportunitiesByDepartment: opportunitiesByDept.map((d) => ({
          department: d._id || 'Unassigned',
          postingsCount: d.count,
          totalCapacity: d.totalCapacity,
        })),
        studentsByDepartment: studentsByDept.map((d) => ({
          department: d._id || 'Unassigned',
          studentCount: d.count,
        })),
        topRequiredSkills: topSkills.map((s) => ({
          skill: s._id,
          demandCount: s.count,
        })),
        allocationsByType: allocationsByType.map((a) => ({
          type: a._id,
          count: a.count,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    List all registered users with profiles
 * @route   GET /api/admin/users
 * @access  Private (Admin)
 */
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });

    const enhancedUsers = await Promise.all(
      users.map(async (u) => {
        let profile = null;
        if (u.role === 'student') {
          profile = await StudentProfile.findOne({ user: u._id });
        } else if (u.role === 'faculty') {
          profile = await FacultyProfile.findOne({ user: u._id });
        }
        return {
          id: u._id,
          name: u.name,
          email: u.email,
          role: u.role,
          createdAt: u.createdAt,
          profile,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: enhancedUsers.length,
      users: enhancedUsers,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change user role
 * @route   PUT /api/admin/users/:id/role
 * @access  Private (Admin)
 */
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const validRoles = ['student', 'faculty', 'admin'];

    if (!role || !validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Role must be one of: ${validRoles.join(', ')}`,
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.role = role;
    await user.save();

    // Auto-create associated profile if missing
    if (role === 'student') {
      const sp = await StudentProfile.findOne({ user: user._id });
      if (!sp) await StudentProfile.create({ user: user._id });
    } else if (role === 'faculty') {
      const fp = await FacultyProfile.findOne({ user: user._id });
      if (!fp) await FacultyProfile.create({ user: user._id });
    }

    res.status(200).json({
      success: true,
      message: `User role successfully updated to '${role}'`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAnalyticsOverview,
  getDepartmentAnalytics,
  getAllUsers,
  updateUserRole,
};
