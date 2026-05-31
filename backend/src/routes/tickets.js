import { Router } from 'express';
import Ticket from '../models/Ticket.js';
import { protect } from '../middleware/auth.js';
import { asyncHandler, sendSuccess, AppError } from '../utils/apiResponse.js';

const router = Router();
router.use(protect);

router.get('/', asyncHandler(async (req, res) => {
  const tickets = await Ticket.find({ user: req.user._id, status: { $ne: 'cancelled' } })
    .populate('event', 'title banner startDate endDate venue status slug')
    .sort({ createdAt: -1 });
  sendSuccess(res, { tickets });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const ticket = await Ticket.findOne({ _id: req.params.id, user: req.user._id })
    .populate('event', 'title banner startDate endDate venue organizer status slug certificateEnabled')
    .populate('booking', 'bookingId status totalAmount');
  if (!ticket) throw new AppError('Ticket not found', 404);
  sendSuccess(res, { ticket });
}));

router.get('/booking/:bookingId', asyncHandler(async (req, res) => {
  const tickets = await Ticket.find({ booking: req.params.bookingId, user: req.user._id })
    .populate('event', 'title banner startDate endDate venue');
  sendSuccess(res, { tickets });
}));

export default router;
