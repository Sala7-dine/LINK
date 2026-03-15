import mongoose from 'mongoose';

const schoolSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'School name is required'],
      trim: true,
      unique: true,
    },
    domain: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    logo: { type: String },
    primaryColor: { type: String, default: '#6C63FF' },
    secondaryColor: { type: String, default: '#F4F4FF' },
    city: { type: String },
    country: { type: String, default: 'Morocco' },
    website: { type: String },
    adminEmail: { type: String },

    // SaaS plan
    plan: {
      type: String,
      enum: ['free', 'premium'],
      default: 'free',
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

schoolSchema.pre('save', function (next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, '-');
  }
  next();
});

export default mongoose.model('School', schoolSchema);
