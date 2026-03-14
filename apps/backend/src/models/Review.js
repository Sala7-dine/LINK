const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
      index: true,
    },

    // Ratings
    globalRating: { type: Number, required: true, min: 1, max: 5 },
    technicalRating: { type: Number, min: 1, max: 5 },
    mentorshipRating: { type: Number, min: 1, max: 5 },
    ambiance: { type: Number, min: 1, max: 5 },

    // Details
    techEnvironment: {
      type: String,
      enum: ['legacy', 'mixed', 'modern'],
    },
    isPaid: { type: Boolean },
    salary: { type: Number },
    duration: { type: String },
    startDate: { type: Date },
    title: { type: String, trim: true, maxlength: 150 },
    content: {
      type: String,
      required: [true, 'Review content is required'],
      minlength: [50, 'Review must be at least 50 characters'],
      maxlength: 3000,
    },
    pros: { type: String, maxlength: 500 },
    cons: { type: String, maxlength: 500 },
    missionDescription: { type: String, maxlength: 500 },

    // Attachments
    attachments: [{ type: String }],

    // Social
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    likesCount: { type: Number, default: 0 },

    // Moderation
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'flagged'],
      default: 'pending',
    },
    flaggedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    // Anonymization
    isAnonymous: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// One review per user per company
reviewSchema.index({ company: 1, author: 1 }, { unique: true });
reviewSchema.index({ tenantId: 1, company: 1, status: 1 });

module.exports = mongoose.model('Review', reviewSchema);
