const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    slug: { type: String, unique: true, lowercase: true },
    logo: { type: String },
    website: { type: String },
    city: { type: String, trim: true },
    country: { type: String, default: 'Morocco' },
    sector: { type: String, trim: true },
    size: {
      type: String,
      enum: ['startup', 'pme', 'mid', 'enterprise'],
    },
    description: { type: String, maxlength: 1000 },
    technologies: [{ type: String, trim: true }],

    // Aggregated stats (denormalized for performance)
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },

    // Moderation
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

companySchema.pre('save', function (next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
  }
  next();
});

companySchema.index({ name: 'text', city: 'text', technologies: 'text' });

module.exports = mongoose.model('Company', companySchema);
