import Offer from '../models/Offer.js';
import Application from '../models/Application.js';
import { fetchAndStore } from '../services/aggregatorService.js';

// GET /api/v1/offers
const getOffers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, location, remote, tech, contractType, source } = req.query;
    const query = { isActive: true, tenantId: req.tenantId };
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
    const offer = await Offer.findOne({ _id: req.params.id, tenantId: req.tenantId }).populate('company', 'name logo city averageRating');
    if (!offer) return res.status(404).json({ status: 'fail', message: 'Offer not found' });
    res.status(200).json({ status: 'success', data: { offer } });
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/offers (admin)
const createOffer = async (req, res, next) => {
  try {
    const offer = await Offer.create({ ...req.body, school: req.tenantId, tenantId: req.tenantId });
    res.status(201).json({ status: 'success', data: { offer } });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/v1/offers/:id (admin)
const deleteOffer = async (req, res, next) => {
  try {
    const offer = await Offer.findOneAndDelete({ _id: req.params.id, tenantId: req.tenantId });
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

export {
  getOffers, getOffer, createOffer, deleteOffer, syncExternalOffers,
  getMyApplications, applyToOffer, updateApplicationStatus,
};
