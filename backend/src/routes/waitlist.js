import { Router } from 'express';
import Waitlist from '../models/Waitlist.js';
import Event from '../models/Event.js';
import { protect } from '../middleware/auth.js';
import { asyncHandler, sendSuccess, AppError } from '../utils/apiResponse.js';

const router = Router();
router.use(protect);

router.post('/', asyncHandler(async (req, res) => {
  const { eventId, ticketTypeId, quantity = 1 } = req.body;
  const event = await Event.findById(eventId);
  if (!event) throw new AppError('Event not found', 404);
  const existing = await Waitlist.findOne({ event: eventId, user: req.user._id });
  if (existing) throw new AppError('You are already on the waitlist', 409);
  const position = (await Waitlist.countDocuments({ event: eventId, status: 'waiting' })) + 1;
  const entry = await Waitlist.create({ event: eventId, user: req.user._id, ticketTypeId, quantity, position, email: req.user.email });
  sendSuccess(res, { entry, position }, `Added to waitlist at position ${position}`, 201);
}));

router.delete('/:eventId', asyncHandler(async (req, res) => {
  const entry = await Waitlist.findOneAndDelete({ event: req.params.eventId, user: req.user._id });
  if (!entry) throw new AppError('Not found on waitlist', 404);
  sendSuccess(res, {}, 'Removed from waitlist');
}));

router.get('/my', asyncHandler(async (req, res) => {
  const entries = await Waitlist.find({ user: req.user._id, status: 'waiting' }).populate('event', 'title banner startDate');
  sendSuccess(res, { entries });
}));

export default router;
