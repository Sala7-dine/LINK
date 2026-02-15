const User = require('../models/User');
const Review = require('../models/Review');
const Application = require('../models/Application');
const Company = require('../models/Company');

// GET /api/v1/dashboard  (admin – school-scoped)
const getDashboard = async (req, res, next) => {
  try {
    const schoolId = req.user.school;
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalStudents,
      placedStudents,
      reviewsThisMonth,
      applicationsThisMonth,
      topCompanies,
      applicationsByStatus,
    ] = await Promise.all([
      User.countDocuments({ school: schoolId, role: 'student', isActive: true }),
      Application.countDocuments({ status: 'accepted' }).populate({ path: 'student', match: { school: schoolId } }),
      Review.countDocuments({ school: schoolId, createdAt: { $gte: firstDayOfMonth } }),
      Application.aggregate([
        { $lookup: { from: 'users', localField: 'student', foreignField: '_id', as: 'studentData' } },
        { $unwind: '$studentData' },
        { $match: { 'studentData.school': schoolId, createdAt: { $gte: firstDayOfMonth } } },
        { $count: 'total' },
      ]),
      Application.aggregate([
        { $lookup: { from: 'users', localField: 'student', foreignField: '_id', as: 'studentData' } },
        { $unwind: '$studentData' },
        { $match: { 'studentData.school': schoolId, status: 'accepted' } },
        { $lookup: { from: 'offers', localField: 'offer', foreignField: '_id', as: 'offerData' } },
        { $unwind: '$offerData' },
        { $group: { _id: '$offerData.companyName', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      Application.aggregate([
        { $lookup: { from: 'users', localField: 'student', foreignField: '_id', as: 'studentData' } },
        { $unwind: '$studentData' },
        { $match: { 'studentData.school': schoolId } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);

    const placementRate = totalStudents > 0
      ? Math.round((applicationsByStatus.find((s) => s._id === 'accepted')?.count || 0) / totalStudents * 100)
      : 0;

    res.status(200).json({
      status: 'success',
      data: {
        kpis: {
          totalStudents,
          placementRate,
          reviewsThisMonth,
          applicationsThisMonth: applicationsThisMonth[0]?.total || 0,
        },
        topCompanies,
        applicationsByStatus,
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/dashboard/superadmin  (superadmin)
const getSuperAdminDashboard = async (req, res, next) => {
  try {
    const [totalSchools, totalUsers, totalReviews, totalCompanies] = await Promise.all([
      require('../models/School').countDocuments({ isActive: true }),
      User.countDocuments({ isActive: true }),
      Review.countDocuments({ status: 'approved' }),
      Company.countDocuments({ status: 'approved' }),
    ]);

    res.status(200).json({
      status: 'success',
      data: { totalSchools, totalUsers, totalReviews, totalCompanies },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboard, getSuperAdminDashboard };
