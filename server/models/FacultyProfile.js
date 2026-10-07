const mongoose = require('mongoose');

const facultyProfileSchema = new mongoose.Schema({
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
  designation: {
    type: String,
    trim: true,
    default: '',
  },
}, { timestamps: true });

module.exports = mongoose.model('FacultyProfile', facultyProfileSchema);
