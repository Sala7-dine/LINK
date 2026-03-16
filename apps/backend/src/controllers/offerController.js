import Offer from '../models/Offer.js';
import Application from '../models/Application.js';
import { fetchAndStore } from '../services/aggregatorService.js';

const getOfferScope = (req) => {
  if (req.user.role === 'company_admin') return { postedBy: req.user._id };
  if (req.tenantId) return { tenantId: req.tenantId };
  return {};
};

// GET /api/v1/offers
const getOffers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, location, remote, tech, contractType, source } = req.query;
    const query = { isActive: true, ...getOfferScope(req) };
    if (location) query.location = new RegExp(location, 'i');
    if (remote === 'true') query.isRemote = true;
    if (tech) query.technologies = new RegExp(tech, 'i');
    if (contractType) query.contractType = contractType;
    if (source) query.source = source;
    if (search) query.$text = { $search: search };

    const total = await Offer.countDocuments(query);
    const offers = await Offer.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort('-publishedAt');

    res.status(200).json({ status: 'success', total, page: Number(page), data: { offers } });
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/offers/:id
const getOffer = async (req, res, next) => {
  try {
    const offer = await Offer.findOne({ _id: req.params.id, ...getOfferScope(req) }).populate('company', 'name logo city averageRating');
    if (!offer) return res.status(404).json({ status: 'fail', message: 'Offer not found' });
    res.status(200).json({ status: 'success', data: { offer } });
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/offers (admin)
const createOffer = async (req, res, next) => {
  try {
    let payload;
    if (req.user.role === 'company_admin') {
      if (!req.body.companyName) {
        return res.status(400).json({ status: 'fail', message: 'companyName is required for company admin offers' });
      }
      payload = {
        ...req.body,
        postedBy: req.user._id,
        source: 'manual',
      };
    } else {
      payload = {
        ...req.body,
        school: req.tenantId,
        tenantId: req.tenantId,
        postedBy: req.user._id,
      };
    }

    const offer = await Offer.create(payload);
    res.status(201).json({ status: 'success', data: { offer } });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/v1/offers/:id (admin)
const deleteOffer = async (req, res, next) => {
  try {
    const offer = await Offer.findOneAndDelete({ _id: req.params.id, ...getOfferScope(req) });
    if (!offer) return res.status(404).json({ status: 'fail', message: 'Offer not found' });
    res.status(204).json({ status: 'success', data: null });
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/offers/sync  – fetch from external APIs
const syncExternalOffers = async (req, res, next) => {
  try {
    const { keywords = 'stage développeur', location = 'Maroc' } = req.body;
    const count = await fetchAndStore(keywords, location);
    res.status(200).json({ status: 'success', message: `Synced ${count} new offers` });
  } catch (err) {
    next(err);
  }
};

// ── Kanban / Applications ─────────────────────────────────

// GET /api/v1/offers/applications/me
const getMyApplications = async (req, res, next) => {
  try {
    if (!req.tenantId) {
      return res.status(403).json({ status: 'fail', message: 'Tenant context is required for student applications' });
    }
    const applications = await Application.find({ student: req.user._id, tenantId: req.tenantId })
      .populate('offer', 'title companyName location contractType technologies')
      .sort('-updatedAt');
    res.status(200).json({ status: 'success', data: { applications } });
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/offers/:id/apply
const applyToOffer = async (req, res, next) => {
  try {
    if (!req.tenantId) {
      return res.status(403).json({ status: 'fail', message: 'Tenant context is required for applications' });
    }

    const application = await Application.create({
      student: req.user._id,
      offer: req.params.id,
      tenantId: req.tenantId,
      status: req.body.status || 'interested',
    });
    res.status(201).json({ status: 'success', data: { application } });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/v1/offers/applications/:id
const updateApplicationStatus = async (req, res, next) => {
  try {
    if (!req.tenantId) {
      return res.status(403).json({ status: 'fail', message: 'Tenant context is required for applications' });
    }

    const application = await Application.findOneAndUpdate(
      { _id: req.params.id, student: req.user._id, tenantId: req.tenantId },
      { status: req.body.status, notes: req.body.notes },
      { new: true, runValidators: true }
    );
    if (!application) return res.status(404).json({ status: 'fail', message: 'Application not found' });
    res.status(200).json({ status: 'success', data: { application } });
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/offers/company/applicants (company_admin)
const getCompanyApplicants = async (req, res, next) => {
  try {
    const { status, search, sortBy = 'recent' } = req.query;
    const offerFilter = req.user.role === 'company_admin'
      ? { postedBy: req.user._id }
      : {};

    const offers = await Offer.find(offerFilter).select('_id title companyName');
    const offerIds = offers.map((o) => o._id);

    if (offerIds.length === 0) {
      return res.status(200).json({ status: 'success', data: { applications: [] } });
    }

    const appQuery = { offer: { $in: offerIds } };
    if (status) appQuery.status = status;

    let sort = { createdAt: -1 };
    if (sortBy === 'oldest') sort = { createdAt: 1 };
    if (sortBy === 'status') sort = { status: 1, createdAt: -1 };

    const applications = await Application.find(appQuery)
      .populate('offer', 'title companyName location contractType')
      .populate('student', 'name email avatar promotion bio skills githubUrl linkedinUrl portfolio projects')
      .sort(sort);

    const normalizedSearch = search?.trim().toLowerCase();
    const filteredApplications = normalizedSearch
      ? applications.filter((app) => {
          const candidateName = app.student?.name?.toLowerCase() || '';
          const candidateEmail = app.student?.email?.toLowerCase() || '';
          const offerTitle = app.offer?.title?.toLowerCase() || '';
          return candidateName.includes(normalizedSearch)
            || candidateEmail.includes(normalizedSearch)
            || offerTitle.includes(normalizedSearch);
        })
      : applications;

    res.status(200).json({ status: 'success', data: { applications: filteredApplications } });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/v1/offers/company/applications/:id/status (company_admin)
const updateCompanyApplicationStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const allowedStatuses = ['interview', 'accepted', 'rejected'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        status: 'fail',
        message: `Status must be one of: ${allowedStatuses.join(', ')}`,
      });
    }

    const application = await Application.findById(req.params.id).populate('offer', 'postedBy title companyName');
    if (!application) {
      return res.status(404).json({ status: 'fail', message: 'Application not found' });
    }

    if (
      req.user.role === 'company_admin'
      && String(application.offer?.postedBy) !== String(req.user._id)
    ) {
      return res.status(403).json({ status: 'fail', message: 'You can only update applications for your own offers' });
    }

    application.status = status;
    if (typeof notes === 'string') application.notes = notes;
    await application.save();

    await application.populate('student', 'name email avatar promotion bio skills githubUrl linkedinUrl portfolio projects');

    res.status(200).json({ status: 'success', data: { application } });
  } catch (err) {
    next(err);
  }
};

export {
  getOffers, getOffer, createOffer, deleteOffer, syncExternalOffers,
  getMyApplications, applyToOffer, updateApplicationStatus, getCompanyApplicants, updateCompanyApplicationStatus,
};
