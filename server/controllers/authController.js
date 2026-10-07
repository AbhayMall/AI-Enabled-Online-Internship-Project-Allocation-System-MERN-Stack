const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const FacultyProfile = require('../models/FacultyProfile');
const generateToken = require('../utils/generateToken');
const { isValidEmail, validateRoleEmailDomain, validateRequired } = require('../utils/validators');

/**
 * @desc    Register a new user (student / faculty / admin)
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, department, designation, year } = req.body;

    const missing = validateRequired(req.body, ['name', 'email', 'password']);
    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missing.join(', ')}`,
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email format',
      });
    }

    const assignedRole = role && ['student', 'faculty', 'admin'].includes(role) ? role : 'student';

    // Strict Institutional Domain Verification
    const domainCheck = validateRoleEmailDomain(email, assignedRole);
    if (!domainCheck.valid) {
      return res.status(400).json({
        success: false,
        message: domainCheck.message,
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email: email.toLowerCase().trim() });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'A user with this institutional email address already exists',
      });
    }

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: assignedRole,
    });

    // Auto-create respective role profile
    if (assignedRole === 'student') {
      await StudentProfile.create({
        user: user._id,
        department: department || '',
        year: year ? Number(year) : 1,
      });
    } else if (assignedRole === 'faculty') {
      await FacultyProfile.create({
        user: user._id,
        department: department || '',
        designation: designation || 'Assistant Professor',
      });
    }

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const missing = validateRequired(req.body, ['email', 'password']);
    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Find user by email and explicitly select password field
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid institutional email or password',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid institutional email or password',
      });
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get logged in user profile
 * @route   GET /api/auth/me
 * @access  Private (Logged in user)
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User record not found',
      });
    }

    let profile = null;
    if (user.role === 'student') {
      profile = await StudentProfile.findOne({ user: user._id });
    } else if (user.role === 'faculty') {
      profile = await FacultyProfile.findOne({ user: user._id });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        profile,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
};
