import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import { connectDB } from './src/config/database.js';
import { generalLimiter } from './src/middleware/rateLimit.js';

// Route imports
import authRoutes from './src/routes/auth.js';
import eventRoutes from './src/routes/events.js';
import bookingRoutes from './src/routes/bookings.js';
import ticketRoutes from './src/routes/tickets.js';
import reviewRoutes from './src/routes/reviews.js';
import analyticsRoutes from './src/routes/analytics.js';
import adminRoutes from './src/routes/admin.js';
import notificationRoutes from './src/routes/notifications.js';
import categoryRoutes from './src/routes/categories.js';
import userRoutes from './src/routes/users.js';
import uploadRoutes from './src/routes/upload.js';
import certificateRoutes from './src/routes/certificates.js';
import waitlistRoutes from './src/routes/waitlist.js';
import networkingRoutes from './src/routes/networking.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy (for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(mongoSanitize());
app.use(hpp());

// CORS
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'https://eventhub.io',
  'https://eventhub-frontend-nu.vercel.app',
  'https://eventhub-d8306ea9.netlify.app',
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || /^https:\/\/eventhub-frontend-[a-z0-9]+-ragadeepans-projects\.vercel\.app$/.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression & logging
app.use(compression());
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// Rate limiting
app.use('/api/', generalLimiter);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' }));

// API routes
app.use('/api/auth',          authRoutes);
app.use('/api/events',        eventRoutes);
app.use('/api/bookings',      bookingRoutes);
app.use('/api/tickets',       ticketRoutes);
app.use('/api/reviews',       reviewRoutes);
app.use('/api/analytics',     analyticsRoutes);
app.use('/api/admin',         adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/categories',    categoryRoutes);
app.use('/api/users',         userRoutes);
app.use('/api/upload',        uploadRoutes);
app.use('/api/certificates',  certificateRoutes);
app.use('/api/waitlist',      waitlistRoutes);
app.use('/api/networking',    networkingRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  const status = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' && status === 500 ? 'Internal Server Error' : err.message;
  res.status(status).json({ success: false, message, ...(process.env.NODE_ENV === 'development' && { stack: err.stack }) });
});

// Connect DB & start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`\n🚀 EventHub API running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV}`);
    console.log(`🔗 Health: http://localhost:${PORT}/health\n`);
  });
}).catch(err => { console.error('DB connection failed:', err); process.exit(1); });

export default app;
