import passport from 'passport';

const authenticate = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err) return next(err);
    if (!user) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized: invalid or expired token' });
    }
    req.user = user;
    next();
  })(req, res, next);
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: `Access denied: requires role(s) ${roles.join(', ')}`,
      });
    }
    next();
  };
};

export { authenticate, authorize };
