import mongoose from 'mongoose';

const experienceSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: [120, 'Company name cannot exceed 120 characters'],
    },
    experienceType: {
      type: String,
      enum: ['first_year_internship', 'second_year_internship', 'second_year_cdi'],
      required: [true, 'Experience type is required'],
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
      validate: {
        validator(value) {
          return !this.startDate || value >= this.startDate;
        },
        message: 'End date must be after start date',
      },
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
      maxlength: [120, 'Location cannot exceed 120 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    technologies: [{ type: String, trim: true }],
    companyLinkedinUrl: {
      type: String,
      trim: true,
      match: [/^https?:\/\/.+/i, 'LinkedIn URL must be valid'],
    },
    companyWebsiteUrl: {
      type: String,
      trim: true,
      match: [/^https?:\/\/.+/i, 'Website URL must be valid'],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

experienceSchema.index({ createdAt: -1 });
experienceSchema.index({ companyName: 'text', location: 'text', description: 'text', technologies: 'text' });

export default mongoose.model('Experience', experienceSchema);
