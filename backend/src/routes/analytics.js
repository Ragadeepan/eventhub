import { Router } from 'express';
import { getOrganizerAnalytics, getAdminAnalytics, getEventAnalytics } from '../controllers/analyticsController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = Router();
router.use(protect);

router.get('/organizer',           restrictTo('organizer', 'admin'), getOrganizerAnalytics);
router.get('/admin',               restrictTo('admin'), getAdminAnalytics);
router.get('/event/:eventId',      restrictTo('organizer', 'admin', 'staff'), getEventAnalytics);

export default router;
