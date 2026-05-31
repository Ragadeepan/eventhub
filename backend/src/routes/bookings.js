import { Router } from 'express';
import { createBooking, getMyBookings, getBookingById, cancelBooking, checkInTicket } from '../controllers/bookingController.js';
import { protect, restrictTo } from '../middleware/auth.js';
import { bookingLimiter } from '../middleware/rateLimit.js';

const router = Router();

router.use(protect);

router.post('/',                                bookingLimiter, createBooking);
router.get('/',                                 getMyBookings);
router.get('/:id',                              getBookingById);
router.patch('/:id/cancel',                     cancelBooking);
router.post('/check-in/:eventId',               restrictTo('organizer', 'staff', 'admin'), checkInTicket);

export default router;
