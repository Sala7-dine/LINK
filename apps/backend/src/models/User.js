const mongoose = require('mongoose');
const argon2 = require('argon2');

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
      enum: ['student', 'admin', 'superadmin'],
      default: 'student',
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

    // Profile / CV
    skills: [{ type: String, trim: true }],
    softSkills: [{ type: String, trim: true }],
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
  this.password = await argon2.hash(this.password);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return argon2.verify(this.password, candidatePassword);
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

module.exports = mongoose.model('User', userSchema);
