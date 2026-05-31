import rateLimit from 'express-rate-limit';

const createLimiter = (windowMs, max, message) =>
  rateLimit({ windowMs, max, message: { success: false, message }, standardHeaders: true, legacyHeaders: false });

export const generalLimiter = createLimiter(
  parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  parseInt(process.env.RATE_LIMIT_MAX) || 100,
  'Too many requests from this IP, please try again later.'
);

export const authLimiter = createLimiter(15 * 60 * 1000, 10, 'Too many login attempts, please try again in 15 minutes.');

export const bookingLimiter = createLimiter(60 * 1000, 5, 'Too many booking attempts, please slow down.');

export const uploadLimiter = createLimiter(60 * 60 * 1000, 20, 'Too many uploads, please try again later.');
