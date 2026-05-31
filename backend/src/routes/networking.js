import { Router } from 'express';
import User from '../models/User.js';
import Booking from '../models/Booking.js';
import { protect } from '../middleware/auth.js';
import { asyncHandler, sendSuccess, AppError } from '../utils/apiResponse.js';

const router = Router();
router.use(protect);

router.get('/event/:eventId/attendees', asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ event: req.params.eventId, status: 'confirmed' })
    .populate('user', 'firstName lastName displayName avatar bio interests location')
    .limit(50);
  const attendees = bookings.map(b => b.user).filter(u => u && u._id.toString() !== req.user._id.toString());
  sendSuccess(res, { attendees });
}));

router.get('/connections', asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('connections', 'firstName lastName displayName avatar bio location interests');
  sendSuccess(res, { connections: user.connections });
}));

router.post('/connect/:userId', asyncHandler(async (req, res) => {
  const targetUser = await User.findById(req.params.userId);
  if (!targetUser) throw new AppError('User not found', 404);
  if (req.user.connections?.includes(req.params.userId)) throw new AppError('Already connected', 409);
  await User.findByIdAndUpdate(req.user._id, { $addToSet: { connections: req.params.userId }, $inc: { 'stats.connectionsCount': 1 } });
  await User.findByIdAndUpdate(req.params.userId, { $addToSet: { connections: req.user._id }, $inc: { 'stats.connectionsCount': 1 } });
  sendSuccess(res, {}, 'Connected successfully');
}));

router.delete('/disconnect/:userId', asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { $pull: { connections: req.params.userId }, $inc: { 'stats.connectionsCount': -1 } });
  await User.findByIdAndUpdate(req.params.userId, { $pull: { connections: req.user._id }, $inc: { 'stats.connectionsCount': -1 } });
  sendSuccess(res, {}, 'Disconnected');
}));

export default router;
