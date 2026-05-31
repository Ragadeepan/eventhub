import { Router } from 'express';
import User from '../models/User.js';
import Event from '../models/Event.js';
import Booking from '../models/Booking.js';
import { protect, restrictTo } from '../middleware/auth.js';
import { asyncHandler, sendSuccess, AppError, getPaginationParams, buildPaginationMeta } from '../utils/apiResponse.js';

const router = Router();
router.use(protect, restrictTo('admin'));

// Users
router.get('/users', asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaginationParams(req.query);
  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  if (req.query.search) filter.$or = [{ email: new RegExp(req.query.search, 'i') }, { firstName: new RegExp(req.query.search, 'i') }, { lastName: new RegExp(req.query.search, 'i') }];
  const [users, total] = await Promise.all([User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit), User.countDocuments(filter)]);
  sendSuccess(res, { users, pagination: buildPaginationMeta(total, page, limit) });
}));

router.patch('/users/:id/ban', asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isBanned: true, banReason: req.body.reason }, { new: true });
  if (!user) throw new AppError('User not found', 404);
  sendSuccess(res, { user }, 'User banned');
}));

router.patch('/users/:id/unban', asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isBanned: false, banReason: null }, { new: true });
  if (!user) throw new AppError('User not found', 404);
  sendSuccess(res, { user }, 'User unbanned');
}));

router.patch('/users/:id/role', asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!['attendee', 'organizer', 'staff', 'admin'].includes(role)) throw new AppError('Invalid role', 400);
  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
  if (!user) throw new AppError('User not found', 404);
  sendSuccess(res, { user }, 'Role updated');
}));

// Events
router.get('/events', asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaginationParams(req.query);
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.search) filter.$or = [{ title: new RegExp(req.query.search, 'i') }, { 'venue.city': new RegExp(req.query.search, 'i') }];
  const [events, total] = await Promise.all([Event.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('organizer', 'firstName lastName email'), Event.countDocuments(filter)]);
  sendSuccess(res, { events, pagination: buildPaginationMeta(total, page, limit) });
}));

router.patch('/events/:id/feature', asyncHandler(async (req, res) => {
  const event = await Event.findByIdAndUpdate(req.params.id, { isFeatured: req.body.featured, isTrending: req.body.trending }, { new: true });
  if (!event) throw new AppError('Event not found', 404);
  sendSuccess(res, { event }, 'Event updated');
}));

// Dashboard stats
router.get('/stats', asyncHandler(async (req, res) => {
  const [totalUsers, totalEvents, totalBookings, revenue] = await Promise.all([
    User.countDocuments(),
    Event.countDocuments({ status: 'published' }),
    Booking.countDocuments({ status: 'confirmed' }),
    Booking.aggregate([{ $match: { status: 'confirmed', paymentStatus: 'paid' } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
  ]);
  sendSuccess(res, { totalUsers, totalEvents, totalBookings, totalRevenue: revenue[0]?.total || 0 });
}));

export default router;
