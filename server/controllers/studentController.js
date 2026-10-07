const StudentProfile = require('../models/StudentProfile');
const User = require('../models/User');
const { parseResume } = require('../services/resumeParser');
const path = require('path');

/**
 * @desc    Get current student's profile
 * @route   GET /api/students/profile
 * @access  Private (Student)
 */
const getStudentProfile = async (req, res, next) => {
  try {
    let profile = await StudentProfile.findOne({ user: req.user.id }).populate('user', 'name email role createdAt');

    if (!profile) {
      // Create if missing
      profile = await StudentProfile.create({
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
 * @desc    Update current student's profile
 * @route   PUT /api/students/profile
 * @access  Private (Student)
 */
const updateStudentProfile = async (req, res, next) => {
  try {
    const { department, year, skills, preferences, name } = req.body;

    let profile = await StudentProfile.findOne({ user: req.user.id });
    if (!profile) {
      profile = new StudentProfile({ user: req.user.id });
    }

    if (department !== undefined) profile.department = department;
    if (year !== undefined) profile.year = Number(year);
    if (skills !== undefined) {
      profile.skills = Array.isArray(skills) ? skills : skills.split(',').map((s) => s.trim()).filter(Boolean);
    }
    if (preferences !== undefined) {
      profile.preferences = Array.isArray(preferences) ? preferences : preferences.split(',').map((p) => p.trim()).filter(Boolean);
    }

    await profile.save();

    // If name is updated, update User record too
    if (name) {
      await User.findByIdAndUpdate(req.user.id, { name: name.trim() });
    }

    profile = await StudentProfile.findOne({ user: req.user.id }).populate('user', 'name email role createdAt');

    res.status(200).json({
      success: true,
      message: 'Student profile updated successfully',
      profile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Upload resume, parse skills & update profile
 * @route   POST /api/students/resume
 * @access  Private (Student)
 */
const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please select a resume file (PDF) to upload',
      });
    }

    const filePath = req.file.path;
    const resumeUrl = `/uploads/${req.file.filename}`;

    // Parse resume for skills
    const parsedData = await parseResume(filePath);

    let profile = await StudentProfile.findOne({ user: req.user.id });
    if (!profile) {
      profile = new StudentProfile({ user: req.user.id });
    }

    profile.resumeUrl = resumeUrl;
    profile.resumeParsedSkills = parsedData.skills;

    await profile.save();
    profile = await StudentProfile.findOne({ user: req.user.id }).populate('user', 'name email role createdAt');

    res.status(200).json({
      success: true,
      message: `Resume uploaded and analyzed successfully. Extracted ${parsedData.skills.length} technical skills.`,
      extractedSkills: parsedData.skills,
      profile,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStudentProfile,
  updateStudentProfile,
  uploadResume,
};
