const tenantContext = (req, res, next) => {
  if (!req.user || !req.user.tenantId) {
    return res.status(403).json({ status: 'fail', message: 'Tenant context is required' });
  }

  req.tenantId = req.user.tenantId;
  next();
};

module.exports = { tenantContext };
