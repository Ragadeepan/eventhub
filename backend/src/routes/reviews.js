import { Router } from 'express';
import Review from '../models/Review.js';
import Booking from '../models/Booking.js';
import { protect } from '../middleware/auth.js';
import { asyncHandler, sendSuccess, AppError, getPaginationParams, buildPaginationMeta } from '../utils/apiResponse.js';

const router = Router();

router.get('/event/:eventId', asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaginationParams(req.query);
  const [reviews, total] = await Promise.all([
    Review.find({ event: req.params.eventId, isApproved: true }).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('user', 'firstName lastName avatar'),
    Review.countDocuments({ event: req.params.eventId, isApproved: true }),
  ]);
  const stats = await Review.aggregate([
    { $match: { event: new (await import('mongoose')).default.Types.ObjectId(req.params.eventId), isApproved: true } },
    { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 }, dist: { $push: '$rating' } } },
  ]);
  sendSuccess(res, { reviews, pagination: buildPaginationMeta(total, page, limit), stats: stats[0] || { avg: 0, count: 0 } });
}));

router.use(protect);

router.post('/', asyncHandler(async (req, res) => {
  const { eventId, rating, title, body, aspects } = req.body;
  const existingBooking = await Booking.findOne({ user: req.user._id, event: eventId, status: 'confirmed' });
  if (!existingBooking) throw new AppError('You can only review events you have attended', 403);
  const existing = await Review.findOne({ user: req.user._id, event: eventId });
  if (existing) throw new AppError('You have already reviewed this event', 409);
  const review = await Review.create({ event: eventId, user: req.user._id, booking: existingBooking._id, rating, title, body, aspects, isVerifiedAttendee: true });
  await review.populate('user', 'firstName lastName avatar');
  sendSuccess(res, { review }, 'Review submitted', 201);
}));

router.patch('/:id', asyncHandler(async (req, res) => {
  const review = await Review.findOne({ _id: req.params.id, user: req.user._id });
  if (!review) throw new AppError('Review not found', 404);
  const { rating, title, body, aspects } = req.body;
  Object.assign(review, { rating, title, body, aspects });
  await review.save();
  sendSuccess(res, { review }, 'Review updated');
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const review = await Review.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!review) throw new AppError('Review not found', 404);
  sendSuccess(res, {}, 'Review deleted');
}));

router.post('/:id/helpful', asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw new AppError('Review not found', 404);
  const hasVoted = review.helpfulVoters.includes(req.user._id);
  if (hasVoted) {
    review.helpfulVoters.pull(req.user._id);
    review.helpful = Math.max(0, review.helpful - 1);
  } else {
    review.helpfulVoters.push(req.user._id);
    review.helpful += 1;
  }
  await review.save();
  sendSuccess(res, { helpful: review.helpful, voted: !hasVoted });
}));

export default router;
