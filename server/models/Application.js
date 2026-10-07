const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  opportunity: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Opportunity',
    required: true,
  },
  status: {
    type: String,
    enum: ['applied', 'under_review', 'approved', 'rejected', 'waitlisted', 'allocated'],
    default: 'applied',
  },
  matchScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  appliedAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt timestamp on save
applicationSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

// Compound unique index to prevent duplicate applications from same student to same opportunity
applicationSchema.index({ student: 1, opportunity: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
