const School = require('../models/School');
const User = require('../models/User');
const crypto = require('crypto');
const fs = require('fs');
const emailService = require('../services/emailService');

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
    const school = await School.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!school) return res.status(404).json({ status: 'fail', message: 'School not found' });
    res.status(200).json({ status: 'success', data: { school } });
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/schools/:id/import-students  (admin - CSV bulk import)
const importStudents = async (req, res, next) => {
  try {
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
        const user = await User.create({
          name,
          email,
          promotion,
          school: req.params.id,
          tenantId: req.params.id,
          role: 'student',
          password: Math.random().toString(36).slice(-10),
        });

        const resetToken = crypto.randomBytes(32).toString('hex');
        user.passwordResetToken = resetToken;
        user.passwordResetExpires = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
        await user.save({ validateBeforeSave: false });

        try {
          await emailService.sendPasswordResetEmail(user.email, resetToken);
          invited++;
        } catch (emailError) {
          emailFailures.push(user.email);
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
    next(err);
  }
};

module.exports = { getSchools, createSchool, updateSchool, importStudents };
