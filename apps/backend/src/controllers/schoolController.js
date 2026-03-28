import School from '../models/School.js';
import User from '../models/User.js';
import crypto from 'crypto';
import fs from 'fs';
import { sendPasswordResetEmail } from '../services/emailService.js';

const ensureSchoolAccess = (req, schoolId) => {
  if (req.user.role !== 'school_admin') return true;
  return String(req.user.tenantId) === String(schoolId);
};

const createAndInviteStudent = async ({ schoolId, name, email, promotion }) => {
  const user = await User.create({
    name,
    email,
    promotion,
    school: schoolId,
    tenantId: schoolId,
    role: 'student',
    password: Math.random().toString(36).slice(-10),
  });

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.passwordResetToken = resetToken;
  user.passwordResetExpires = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
  await user.save({ validateBeforeSave: false });

  await sendPasswordResetEmail(user.email, resetToken);
  return user;
};

// GET /api/v1/schools (superadmin)
const getSchools = async (req, res, next) => {
  try {
    const schools = await School.find().sort('-createdAt');
    res.status(200).json({ status: 'success', data: { schools } });
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/schools (superadmin)
const createSchool = async (req, res, next) => {
  try {
    const school = await School.create(req.body);
    res.status(201).json({ status: 'success', data: { school } });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/v1/schools/:id (admin or superadmin)
const updateSchool = async (req, res, next) => {
  try {
    const school = await School.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!school) return res.status(404).json({ status: 'fail', message: 'School not found' });
    res.status(200).json({ status: 'success', data: { school } });
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/schools/:id/import-students  (admin - CSV bulk import)
const importStudents = async (req, res, next) => {
  try {
    if (!ensureSchoolAccess(req, req.params.id)) {
      return res
        .status(403)
        .json({ status: 'fail', message: 'You can only import students for your own school' });
    }

    if (!req.file) return res.status(400).json({ status: 'fail', message: 'No CSV file uploaded' });
    const csv = fs.readFileSync(req.file.path, 'utf-8');
    const lines = csv.split('\n').slice(1).filter(Boolean);
    let created = 0;
    let invited = 0;
    const emailFailures = [];

    for (const line of lines) {
      const [name, email, promotion] = line.split(',').map((s) => s.trim());
      if (!email) continue;
      const exists = await User.findOne({ email });
      if (!exists) {
        try {
          await createAndInviteStudent({ schoolId: req.params.id, name, email, promotion });
          invited++;
        } catch (emailError) {
          emailFailures.push(email);
        }

        created++;
      }
    }

    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(200).json({
      status: 'success',
      message: `Imported ${created} students. Invitation emails sent: ${invited}.`,
      data: { created, invited, emailFailures },
    });
  } catch (err) {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(err);
  }
};

// POST /api/v1/schools/:id/invite-student (admin - single invite)
const inviteStudent = async (req, res, next) => {
  try {
    if (!ensureSchoolAccess(req, req.params.id)) {
      return res
        .status(403)
        .json({ status: 'fail', message: 'You can only invite students for your own school' });
    }

    const { name, email, promotion } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ status: 'fail', message: 'Email already exists' });
    }

    await createAndInviteStudent({ schoolId: req.params.id, name, email, promotion });

    res.status(201).json({
      status: 'success',
      message: 'Student invited successfully. Password setup email sent.',
    });
  } catch (err) {
    next(err);
  }
};

export { getSchools, createSchool, updateSchool, importStudents, inviteStudent };
