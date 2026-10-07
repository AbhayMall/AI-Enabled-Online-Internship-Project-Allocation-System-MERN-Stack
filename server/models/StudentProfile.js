const mongoose = require('mongoose');

const studentProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  department: {
    type: String,
    trim: true,
    default: '',
  },
  year: {
    type: Number,
    min: 1,
    max: 5,
    default: 1,
  },
  skills: {
    type: [String],
    default: [],
  },
  resumeUrl: {
    type: String,
    default: '',
  },
  resumeParsedSkills: {
    type: [String],
    default: [],
  },
  preferences: {
    type: [String],
    default: [],
  },
}, { timestamps: true });

module.exports = mongoose.model('StudentProfile', studentProfileSchema);
