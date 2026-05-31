import { Router } from 'express';
import Certificate from '../models/Certificate.js';
import Booking from '../models/Booking.js';
import Event from '../models/Event.js';
import { protect } from '../middleware/auth.js';
import { asyncHandler, sendSuccess, AppError } from '../utils/apiResponse.js';

const router = Router();

// Public verification
router.get('/verify/:certificateId', asyncHandler(async (req, res) => {
  const cert = await Certificate.findOne({ certificateId: req.params.certificateId })
    .populate('user', 'firstName lastName displayName')
    .populate('event', 'title startDate');
  if (!cert) throw new AppError('Certificate not found or invalid', 404);
  sendSuccess(res, { certificate: cert, isValid: cert.isVerified });
}));

router.use(protect);

router.get('/my', asyncHandler(async (req, res) => {
  const certs = await Certificate.find({ user: req.user._id }).populate('event', 'title banner startDate').sort({ issuedAt: -1 });
  sendSuccess(res, { certificates: certs });
}));

router.post('/generate', asyncHandler(async (req, res) => {
  const { eventId } = req.body;
  const event = await Event.findById(eventId).populate('organizer', 'displayName');
  if (!event) throw new AppError('Event not found', 404);
  if (!event.certificateEnabled) throw new AppError('Certificates not enabled for this event', 400);
  const booking = await Booking.findOne({ user: req.user._id, event: eventId, status: 'confirmed' });
  if (!booking) throw new AppError('You must have a confirmed booking to receive a certificate', 403);
  const existing = await Certificate.findOne({ user: req.user._id, event: eventId });
  if (existing) return sendSuccess(res, { certificate: existing }, 'Certificate already generated');

  const cert = await Certificate.create({
    user:       req.user._id,
    event:      eventId,
    booking:    booking._id,
    holderName: req.user.fullName,
    eventName:  event.title,
    eventDate:  event.startDate,
    issuerName: event.organizer.displayName,
    issuerTitle: 'Event Organizer',
  });

  await cert.populate([{ path: 'user', select: 'firstName lastName' }, { path: 'event', select: 'title startDate' }]);
  sendSuccess(res, { certificate: cert }, 'Certificate generated', 201);
}));

export default router;
