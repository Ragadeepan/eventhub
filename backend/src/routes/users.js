import { Router } from 'express';
import User from '../models/User.js';
import Event from '../models/Event.js';
import { protect } from '../middleware/auth.js';
import { asyncHandler, sendSuccess, AppError } from '../utils/apiResponse.js';

const router = Router();

router.get('/:id/profile', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('firstName lastName displayName avatar bio location website social stats interests role createdAt');
  if (!user || !user.isActive) throw new AppError('User not found', 404);
  sendSuccess(res, { user });
}));

router.get('/:id/events', asyncHandler(async (req, res) => {
  const events = await Event.find({ organizer: req.params.id, status: 'published' }).sort({ startDate: -1 }).limit(10).select('title banner startDate venue stats');
  sendSuccess(res, { events });
}));

router.use(protect);

router.get('/me/saved-events', asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate({ path: 'savedEvents', match: { status: 'published' }, populate: [{ path: 'category', select: 'name icon color' }, { path: 'organizer', select: 'displayName avatar' }] });
  sendSuccess(res, { events: user.savedEvents });
}));

export default router;
