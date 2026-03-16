import mongoose from 'mongoose';

const offerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Offer title is required'],
      trim: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
    },
    companyName: { type: String, trim: true },
    companyLogo: { type: String },

    description: { type: String, maxlength: 5000 },
    requirements: { type: String },
    technologies: [{ type: String, trim: true }],

    location: { type: String, trim: true },
    isRemote: { type: Boolean, default: false },
    contractType: {
      type: String,
      enum: ['stage', 'alternance', 'cdi', 'cdd', 'freelance'],
      default: 'stage',
    },
    duration: { type: String },
    isPaid: { type: Boolean },
    salary: { type: String },
    publishedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date },

    // Source
    source: {
      type: String,
      enum: ['manual', 'indeed', 'linkedin', 'scraper'],
      default: 'manual',
    },
    externalId: { type: String },
    externalUrl: { type: String },

    school: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      index: true,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

offerSchema.index({ title: 'text', technologies: 'text', companyName: 'text' });
offerSchema.index({ externalId: 1, source: 1 }, { unique: true, sparse: true });

export default mongoose.model('Offer', offerSchema);
