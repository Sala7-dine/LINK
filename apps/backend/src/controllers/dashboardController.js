import User from '../models/User.js';
import Review from '../models/Review.js';
import Application from '../models/Application.js';
import Company from '../models/Company.js';
import School from '../models/School.js';

// GET /api/v1/dashboard  (school_admin – tenant-scoped)
const getDashboard = async (req, res, next) => {
  try {
    const tenantId = req.tenantId;
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalStudents,
      _placedStudents,
      reviewsThisMonth,
      applicationsThisMonth,
      topCompanies,
      applicationsByStatus,
    ] = await Promise.all([
      User.countDocuments({ tenantId, role: 'student', isActive: true }),
      Application.countDocuments({ tenantId, status: 'accepted' }),
      Review.countDocuments({ tenantId, createdAt: { $gte: firstDayOfMonth } }),
      Application.countDocuments({ tenantId, createdAt: { $gte: firstDayOfMonth } }),
      Application.aggregate([
        { $match: { tenantId, status: 'accepted' } },
        { $lookup: { from: 'offers', localField: 'offer', foreignField: '_id', as: 'offerData' } },
        { $unwind: '$offerData' },
        { $group: { _id: '$offerData.companyName', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      Application.aggregate([
        { $match: { tenantId } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);

    const placementRate =
      totalStudents > 0
        ? Math.round(
            ((applicationsByStatus.find((s) => s._id === 'accepted')?.count || 0) / totalStudents) *
              100
          )
        : 0;

    res.status(200).json({
      status: 'success',
      data: {
        kpis: {
          totalStudents,
          placementRate,
          reviewsThisMonth,
          applicationsThisMonth,
        },
        topCompanies,
        applicationsByStatus,
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/dashboard/superadmin  (super_admin)
const getSuperAdminDashboard = async (req, res, next) => {
  try {
    const [totalSchools, totalUsers, totalReviews, totalCompanies] = await Promise.all([
      School.countDocuments({ isActive: true }),
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

export { getDashboard, getSuperAdminDashboard };
