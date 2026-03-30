import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoSanitize from 'express-mongo-sanitize';
import passport from 'passport';
import { globalErrorHandler, notFound } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';

// Routes
import authRoutes from './routes/authRoutes.js';

import userRoutes from './routes/userRoutes.js';
import companyRoutes from './routes/companyRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import offerRoutes from './routes/offerRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import schoolRoutes from './routes/schoolRoutes.js';
import experienceRoutes from './routes/experienceRoutes.js';

import './config/passport.js';

const app = express();

// ── Security middleware ───────────────────────────────
app.use(helmet());
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
].filter(Boolean);
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);
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
app.use('/api/v1/company', companyRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/offers', offerRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/schools', schoolRoutes);
app.use('/api/v1/experiences', experienceRoutes);

// ── Health check ─────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'LINK API', timestamp: new Date().toISOString() });
});

// ── 404 & Error handlers ─────────────────────────────
app.use(notFound);
app.use(globalErrorHandler);

export default app;
