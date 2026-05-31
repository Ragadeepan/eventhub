import jwt from 'jsonwebtoken';
import { verifyFirebaseToken } from '../config/firebase.js';
import User from '../models/User.js';
import { AppError } from '../utils/apiResponse.js';

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) throw new AppError('Not authenticated. Please log in.', 401);

    const token = authHeader.split(' ')[1];
    let userId;

    // Try JWT first, then Firebase
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.id;
    } catch {
      try {
        const firebaseUser = await verifyFirebaseToken(token);
        const user = await User.findOne({ firebaseUid: firebaseUser.uid });
        if (!user) throw new AppError('User not found. Please register.', 401);
        req.user = user;
        return next();
      } catch {
        throw new AppError('Invalid or expired token. Please log in again.', 401);
      }
    }

    const user = await User.findById(userId).select('+password');
    if (!user) throw new AppError('User belonging to this token no longer exists.', 401);
    if (user.isBanned) throw new AppError('Your account has been suspended. Contact support.', 403);

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

export const restrictTo = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new AppError('You do not have permission to perform this action.', 403));
  }
  next();
};

export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return next();

    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id);
    } catch {
      try {
        const firebaseUser = await verifyFirebaseToken(token);
        req.user = await User.findOne({ firebaseUid: firebaseUser.uid });
      } catch { /* ignore */ }
    }
    next();
  } catch { next(); }
};
