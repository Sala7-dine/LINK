import Experience from '../models/Experience.js';

const getAllExperiences = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = {};

    if (search) {
      query.$text = { $search: search };
    }

    const total = await Experience.countDocuments(query);
    const experiences = await Experience.find(query)
      .populate('author', 'name avatar promotion role')
      .sort('-createdAt')
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.status(200).json({
      status: 'success',
      total,
      page: Number(page),
      data: { experiences },
    });
  } catch (err) {
    next(err);
  }
};

const getMyExperiences = async (req, res, next) => {
  try {
    const experiences = await Experience.find({ author: req.user._id }).sort('-createdAt');

    res.status(200).json({
      status: 'success',
      data: { experiences },
    });
  } catch (err) {
    next(err);
  }
};

const createExperience = async (req, res, next) => {
  try {
    const experience = await Experience.create({
      companyName: req.body.companyName,
      experienceType: req.body.experienceType,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      location: req.body.location,
      description: req.body.description,
      technologies: req.body.technologies,
      companyLinkedinUrl: req.body.companyLinkedinUrl,
      companyWebsiteUrl: req.body.companyWebsiteUrl,
      author: req.user._id,
    });

    const populatedExperience = await experience.populate('author', 'name avatar promotion role');

    res.status(201).json({
      status: 'success',
      data: { experience: populatedExperience },
    });
  } catch (err) {
    next(err);
  }
};

export { getAllExperiences, getMyExperiences, createExperience };
