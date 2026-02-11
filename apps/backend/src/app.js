const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const passport = require('passport');

const { globalErrorHandler, notFound } = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

// Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const companyRoutes = require('./routes/companyRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const offerRoutes = require('./routes/offerRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const schoolRoutes = require('./routes/schoolRoutes');

require('./config/passport');

const app = express();

// ── Security middleware ───────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(mongoSanitize());

// ── Body parsing ─────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ── Logging ──────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ── Passport ─────────────────────────────────────────
app.use(passport.initialize());

// ── Static files (uploads) ───────────────────────────
app.use('/uploads', express.static('uploads'));

// ── Rate limiting ────────────────────────────────────
app.use('/api', apiLimiter);

// ── Routes ───────────────────────────────────────────
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/companies', companyRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/offers', offerRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/schools', schoolRoutes);

// ── Health check ─────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'LINK API', timestamp: new Date().toISOString() });
});

// ── 404 & Error handlers ─────────────────────────────
app.use(notFound);
app.use(globalErrorHandler);

module.exports = app;
