const mongoose = require('mongoose');

const opportunitySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Opportunity title is required'],
    trim: true,
  },
  type: {
    type: String,
    enum: ['internship', 'project'],
    required: [true, 'Type must be either internship or project'],
    default: 'internship',
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
  requiredSkills: {
    type: [String],
    default: [],
  },
  capacity: {
    type: Number,
    required: [true, 'Capacity is required'],
    min: [1, 'Capacity must be at least 1'],
    default: 1,
  },
  department: {
    type: String,
    trim: true,
    default: '',
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['open', 'closed'],
    default: 'open',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Opportunity', opportunitySchema);
