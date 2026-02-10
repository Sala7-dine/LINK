// User roles
const ROLES = Object.freeze({ STUDENT: 'student', ADMIN: 'admin', SUPERADMIN: 'superadmin' });

// Application statuses (Kanban)
const APPLICATION_STATUS = Object.freeze({
  INTERESTED: 'interested',
  APPLIED: 'applied',
  INTERVIEW: 'interview',
  REJECTED: 'rejected',
  ACCEPTED: 'accepted',
});

// Review statuses
const REVIEW_STATUS = Object.freeze({ PENDING: 'pending', APPROVED: 'approved', REJECTED: 'rejected', FLAGGED: 'flagged' });

// Contract types
const CONTRACT_TYPES = Object.freeze(['stage', 'alternance', 'cdi', 'cdd', 'freelance']);

// Tech environments
const TECH_ENV = Object.freeze({ LEGACY: 'legacy', MIXED: 'mixed', MODERN: 'modern' });

// Pagination defaults
const PAGINATION = Object.freeze({ DEFAULT_LIMIT: 20, MAX_LIMIT: 100 });

module.exports = { ROLES, APPLICATION_STATUS, REVIEW_STATUS, CONTRACT_TYPES, TECH_ENV, PAGINATION };
