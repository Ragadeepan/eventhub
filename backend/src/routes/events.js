import { Router } from 'express';
import { getEvents, getEventBySlug, getEventById, createEvent, updateEvent, deleteEvent, publishEvent, getOrganizerEvents, getTrendingEvents, getFeaturedEvents, getEventAttendees, bookmarkEvent, getSavedEvents } from '../controllers/eventController.js';
import { protect, restrictTo, optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/',                              optionalAuth, getEvents);
router.get('/trending',                      getTrendingEvents);
router.get('/featured',                      getFeaturedEvents);
router.get('/my-events',                     protect, restrictTo('organizer', 'admin'), getOrganizerEvents);
router.get('/saved',                         protect, getSavedEvents);
router.get('/slug/:slug',                    optionalAuth, getEventBySlug);
router.get('/:id',                           optionalAuth, getEventById);
router.get('/:id/attendees',                 protect, restrictTo('organizer', 'admin', 'staff'), getEventAttendees);
router.post('/',                             protect, restrictTo('organizer', 'admin'), createEvent);
router.patch('/:id',                         protect, restrictTo('organizer', 'admin'), updateEvent);
router.patch('/:id/publish',                 protect, restrictTo('organizer', 'admin'), publishEvent);
router.delete('/:id',                        protect, restrictTo('organizer', 'admin'), deleteEvent);
router.post('/:id/bookmark',                 protect, bookmarkEvent);

export default router;
