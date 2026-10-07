const mongoose = require('mongoose');

const allocationSchema = new mongoose.Schema({
  application: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: true,
  },
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
  allocatedAt: {
    type: Date,
    default: Date.now,
  },
  hoursCompleted: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

module.exports = mongoose.model('Allocation', allocationSchema);
