import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import argon2 from 'argon2';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
    },
    password: {
      type: String,
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['student', 'school_admin', 'company_admin', 'super_admin'],
      default: 'student',
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      index: true,
    },
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
    },
    avatar: { type: String },
    bio: { type: String, maxlength: 500 },
    githubUrl: { type: String },
    linkedinUrl: { type: String },
    portfolio: { type: String },

    // Contact
    phone: { type: String, trim: true },
    address: { type: String, trim: true },

    // Profile / CV
    skills: [{ type: String, trim: true }],
    frontendSkills: [{ type: String, trim: true }],
    backendSkills: [{ type: String, trim: true }],
    toolSkills: [{ type: String, trim: true }],
    softSkills: [{ type: String, trim: true }],
    languages: [{ type: String, trim: true }],
    hobbies: [{ type: String, trim: true }],
    
    educations: [
      {
        school: { type: String, required: true },
        degree: { type: String, required: true },
        startDate: { type: Date, required: true },
        endDate: { type: Date },
        description: { type: String },
      }
    ],

    projects: [
      {
        title: String,
        description: String,
        githubUrl: String,
        liveUrl: String,
        technologies: [String],
      },
    ],
    promotion: { type: String, trim: true },
    graduationYear: { type: Number },

    // OAuth
    oauthId: { type: String },
    oauthProvider: {
      type: String,
      enum: ['google', 'github', 'linkedin', null],
      default: null,
    },

    // Account status
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    verificationToken: { type: String, select: false },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    refreshToken: { type: String, select: false },
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS || 10);
  this.password = await bcrypt.hash(this.password, saltRounds);
  next();
});

// Keep legacy school field in sync while transitioning to tenantId.
userSchema.pre('save', function (next) {
  if (!this.tenantId && this.school) this.tenantId = this.school;
  if (!this.school && this.tenantId) this.school = this.tenantId;
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (typeof this.password === 'string' && this.password.startsWith('$argon2')) {
    return argon2.verify(this.password, candidatePassword);
  }
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove sensitive fields from JSON output
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  delete obj.verificationToken;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  return obj;
};

export default mongoose.model('User', userSchema);
