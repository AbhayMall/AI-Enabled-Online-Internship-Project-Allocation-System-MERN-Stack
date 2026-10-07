const FacultyProfile = require('../models/FacultyProfile');
const User = require('../models/User');

/**
 * @desc    Get current faculty's profile
 * @route   GET /api/faculty/profile
 * @access  Private (Faculty)
 */
const getFacultyProfile = async (req, res, next) => {
  try {
    let profile = await FacultyProfile.findOne({ user: req.user.id }).populate('user', 'name email role createdAt');

    if (!profile) {
      profile = await FacultyProfile.create({
        user: req.user.id,
      });
      profile = await profile.populate('user', 'name email role createdAt');
    }

    res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update current faculty's profile
 * @route   PUT /api/faculty/profile
 * @access  Private (Faculty)
 */
const updateFacultyProfile = async (req, res, next) => {
  try {
    const { department, designation, name } = req.body;

    let profile = await FacultyProfile.findOne({ user: req.user.id });
    if (!profile) {
      profile = new FacultyProfile({ user: req.user.id });
    }

    if (department !== undefined) profile.department = department;
    if (designation !== undefined) profile.designation = designation;

    await profile.save();

    if (name) {
      await User.findByIdAndUpdate(req.user.id, { name: name.trim() });
    }

    profile = await FacultyProfile.findOne({ user: req.user.id }).populate('user', 'name email role createdAt');

    res.status(200).json({
      success: true,
      message: 'Faculty profile updated successfully',
      profile,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFacultyProfile,
  updateFacultyProfile,
};
