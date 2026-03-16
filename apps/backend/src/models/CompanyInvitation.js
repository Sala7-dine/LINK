import mongoose from 'mongoose';

const companyInvitationSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    companyName: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ['company_admin'],
      default: 'company_admin',
    },
    invitationToken: {
      type: String,
      required: true,
      unique: true,
      select: false,
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'expired', 'revoked'],
      default: 'pending',
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  },
  { timestamps: true }
);

companyInvitationSchema.index({ email: 1, status: 1 });
companyInvitationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('CompanyInvitation', companyInvitationSchema);
