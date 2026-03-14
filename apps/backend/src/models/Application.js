const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    offer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Offer',
      required: true,
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['interested', 'applied', 'interview', 'rejected', 'accepted'],
      default: 'interested',
    },
    notes: { type: String, maxlength: 500 },
    appliedAt: { type: Date },
  },
  { timestamps: true }
);

applicationSchema.index({ student: 1, offer: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
