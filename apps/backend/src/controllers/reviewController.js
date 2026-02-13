const Review = require('../models/Review');
const Company = require('../models/Company');

const recalcCompanyRating = async (companyId) => {
  const stats = await Review.aggregate([
    { $match: { company: companyId, status: 'approved' } },
    { $group: { _id: '$company', avgRating: { $avg: '$globalRating' }, count: { $sum: 1 } } },
  ]);
  if (stats.length > 0) {
    await Company.findByIdAndUpdate(companyId, {
      averageRating: Math.round(stats[0].avgRating * 10) / 10,
      reviewCount: stats[0].count,
    });
  }
};

// GET /api/v1/reviews  or  /api/v1/companies/:companyId/reviews
const getReviews = async (req, res, next) => {
  try {
    const { companyId } = req.params;
    const { page = 1, limit = 10, status = 'approved' } = req.query;
    const query = { status };
    if (companyId) query.company = companyId;

    const total = await Review.countDocuments(query);
    const reviews = await Review.find(query)
      .populate({ path: 'author', select: 'name avatar promotion', match: { isActive: true } })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort('-createdAt');

    res.status(200).json({ status: 'success', total, page: Number(page), data: { reviews } });
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/companies/:companyId/reviews
const createReview = async (req, res, next) => {
  try {
    const review = await Review.create({
      ...req.body,
      company: req.params.companyId,
      author: req.user._id,
      school: req.user.school,
      attachments: req.files ? req.files.map((f) => `/uploads/${f.filename}`) : [],
    });
    res.status(201).json({ status: 'success', data: { review } });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/v1/reviews/:id
const updateReview = async (req, res, next) => {
  try {
    const review = await Review.findOne({ _id: req.params.id, author: req.user._id });
    if (!review) return res.status(404).json({ status: 'fail', message: 'Review not found or not yours' });
    Object.assign(review, req.body);
    review.status = 'pending'; // re-moderate after edit
    await review.save();
    res.status(200).json({ status: 'success', data: { review } });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/v1/reviews/:id
const deleteReview = async (req, res, next) => {
  try {
    const filter = req.user.role === 'student'
      ? { _id: req.params.id, author: req.user._id }
      : { _id: req.params.id };
    const review = await Review.findOneAndDelete(filter);
    if (!review) return res.status(404).json({ status: 'fail', message: 'Review not found' });
    await recalcCompanyRating(review.company);
    res.status(204).json({ status: 'success', data: null });
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/reviews/:id/like
const likeReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ status: 'fail', message: 'Review not found' });

    const idx = review.likes.indexOf(req.user._id);
    if (idx === -1) {
      review.likes.push(req.user._id);
      review.likesCount += 1;
    } else {
      review.likes.splice(idx, 1);
      review.likesCount -= 1;
    }
    await review.save();
    res.status(200).json({ status: 'success', data: { likesCount: review.likesCount } });
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/reviews/:id/flag
const flagReview = async (req, res, next) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { flaggedBy: req.user._id }, status: 'flagged' },
      { new: true }
    );
    if (!review) return res.status(404).json({ status: 'fail', message: 'Review not found' });
    res.status(200).json({ status: 'success', message: 'Review flagged for moderation' });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/v1/reviews/:id/moderate (admin)
const moderateReview = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ status: 'fail', message: 'Status must be approved or rejected' });
    }
    const review = await Review.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!review) return res.status(404).json({ status: 'fail', message: 'Review not found' });
    if (status === 'approved') await recalcCompanyRating(review.company);
    res.status(200).json({ status: 'success', data: { review } });
  } catch (err) {
    next(err);
  }
};

module.exports = { getReviews, createReview, updateReview, deleteReview, likeReview, flagReview, moderateReview };
