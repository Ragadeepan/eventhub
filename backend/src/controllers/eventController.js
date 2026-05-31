import Event from '../models/Event.js';
import Category from '../models/Category.js';
import Booking from '../models/Booking.js';
import Ticket from '../models/Ticket.js';
import { AppError, asyncHandler, sendSuccess, getPaginationParams, buildPaginationMeta } from '../utils/apiResponse.js';

const buildEventQuery = (query) => {
  const filter = { status: 'published' };
  if (query.search) filter.$text = { $search: query.search };
  if (query.category) filter.category = query.category;
  if (query.city) filter['venue.city'] = new RegExp(query.city, 'i');
  if (query.country) filter['venue.country'] = new RegExp(query.country, 'i');
  if (query.type) filter.type = query.type;
  if (query.isFeatured === 'true') filter.isFeatured = true;
  if (query.isTrending === 'true') filter.isTrending = true;
  if (query.isFree === 'true') filter['ticketTypes.price'] = 0;
  if (query.dateFrom) filter.startDate = { $gte: new Date(query.dateFrom) };
  if (query.dateTo) filter.endDate = { ...(filter.endDate || {}), $lte: new Date(query.dateTo) };
  if (!query.dateFrom && !query.past) filter.startDate = { $gte: new Date() };
  return filter;
};

export const getEvents = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaginationParams(req.query);
  const filter   = buildEventQuery(req.query);
  const sortMap  = { newest: { createdAt: -1 }, oldest: { createdAt: 1 }, soonest: { startDate: 1 }, popular: { 'stats.views': -1 }, rating: { 'stats.avgRating': -1 } };
  const sort     = sortMap[req.query.sort] || { startDate: 1 };

  const [events, total] = await Promise.all([
    Event.find(filter).sort(sort).skip(skip).limit(limit).populate('organizer', 'firstName lastName avatar displayName').populate('category', 'name slug icon color gradient').select('-gallery -schedule -speakers -faq -termsAndConditions -refundPolicy'),
    Event.countDocuments(filter),
  ]);

  sendSuccess(res, { events, pagination: buildPaginationMeta(total, page, limit) });
});

export const getEventBySlug = asyncHandler(async (req, res) => {
  const event = await Event.findOne({ slug: req.params.slug, status: { $in: ['published', 'cancelled', 'completed'] } })
    .populate('organizer', 'firstName lastName avatar displayName bio website social stats')
    .populate('category', 'name slug icon color')
    .populate('staff', 'firstName lastName avatar');

  if (!event) throw new AppError('Event not found', 404);
  await Event.findByIdAndUpdate(event._id, { $inc: { 'stats.views': 1 } });
  sendSuccess(res, { event });
});

export const getEventById = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id)
    .populate('organizer', 'firstName lastName avatar displayName bio')
    .populate('category', 'name slug icon color');
  if (!event) throw new AppError('Event not found', 404);
  sendSuccess(res, { event });
});

export const createEvent = asyncHandler(async (req, res) => {
  const eventData = { ...req.body, organizer: req.user._id };
  if (!eventData.banner && req.file) eventData.banner = req.file.path;
  const event = await Event.create(eventData);
  await Category.findByIdAndUpdate(event.category, { $inc: { eventCount: 1 } });
  sendSuccess(res, { event }, 'Event created successfully', 201);
});

export const updateEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) throw new AppError('Event not found', 404);
  if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') throw new AppError('Not authorized to edit this event', 403);
  const disallowed = ['organizer', 'stats', 'registeredCount', 'checkInCount'];
  disallowed.forEach(f => delete req.body[f]);
  const updated = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  sendSuccess(res, { event: updated }, 'Event updated successfully');
});

export const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) throw new AppError('Event not found', 404);
  if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') throw new AppError('Not authorized', 403);
  await Event.findByIdAndUpdate(req.params.id, { status: 'cancelled', cancelledAt: new Date() });
  sendSuccess(res, {}, 'Event cancelled successfully');
});

export const publishEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) throw new AppError('Event not found', 404);
  if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') throw new AppError('Not authorized', 403);
  if (!event.ticketTypes?.length) throw new AppError('Add at least one ticket type before publishing', 400);
  const updated = await Event.findByIdAndUpdate(req.params.id, { status: 'published', publishedAt: new Date() }, { new: true });
  sendSuccess(res, { event: updated }, 'Event published successfully');
});

export const getOrganizerEvents = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaginationParams(req.query);
  const filter = { organizer: req.user._id };
  if (req.query.status) filter.status = req.query.status;
  const [events, total] = await Promise.all([
    Event.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('category', 'name icon'),
    Event.countDocuments(filter),
  ]);
  sendSuccess(res, { events, pagination: buildPaginationMeta(total, page, limit) });
});

export const getTrendingEvents = asyncHandler(async (req, res) => {
  const events = await Event.find({ status: 'published', startDate: { $gte: new Date() } })
    .sort({ 'stats.views': -1, 'stats.avgRating': -1 })
    .limit(8)
    .populate('organizer', 'displayName avatar')
    .populate('category', 'name icon color');
  sendSuccess(res, { events });
});

export const getFeaturedEvents = asyncHandler(async (req, res) => {
  const events = await Event.find({ status: 'published', isFeatured: true, startDate: { $gte: new Date() } })
    .sort({ startDate: 1 })
    .limit(6)
    .populate('organizer', 'displayName avatar')
    .populate('category', 'name icon color');
  sendSuccess(res, { events });
});

export const getEventAttendees = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) throw new AppError('Event not found', 404);
  if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin' && req.user.role !== 'staff') throw new AppError('Not authorized', 403);

  const { page, limit, skip } = getPaginationParams(req.query);
  const [tickets, total] = await Promise.all([
    Ticket.find({ event: req.params.id, status: { $ne: 'cancelled' } })
      .skip(skip).limit(limit)
      .populate('user', 'firstName lastName email avatar')
      .populate('booking', 'bookingId createdAt status attendeeName attendeeEmail'),
    Ticket.countDocuments({ event: req.params.id, status: { $ne: 'cancelled' } }),
  ]);

  const attendees = tickets.map(t => ({
    _id: t._id,
    firstName: t.user?.firstName || (t.holderName || t.booking?.attendeeName || '').split(' ')[0] || '',
    lastName: t.user?.lastName || (t.holderName || t.booking?.attendeeName || '').split(' ').slice(1).join(' ') || '',
    email: t.user?.email || t.holderEmail || t.booking?.attendeeEmail || '',
    avatar: t.user?.avatar,
    ticketTypeName: t.ticketTypeName,
    ticketStatus: t.status,
    isCheckedIn: t.isCheckedIn,
    checkedInAt: t.checkedInAt,
    bookedAt: t.booking?.createdAt,
    bookingId: t.booking?.bookingId,
  }));

  sendSuccess(res, { attendees, pagination: buildPaginationMeta(total, page, limit) });
});

export const getSavedEvents = asyncHandler(async (req, res) => {
  const user = await req.user.populate({ path: 'savedEvents', populate: [{ path: 'organizer', select: 'firstName lastName displayName avatar' }, { path: 'category', select: 'name icon color' }] });
  sendSuccess(res, { events: user.savedEvents || [] });
});

export const bookmarkEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) throw new AppError('Event not found', 404);
  const user = req.user;
  const isSaved = user.savedEvents?.includes(req.params.id);
  if (isSaved) {
    user.savedEvents = user.savedEvents.filter(id => id.toString() !== req.params.id);
    await Event.findByIdAndUpdate(req.params.id, { $inc: { 'stats.bookmarks': -1 } });
  } else {
    user.savedEvents = [...(user.savedEvents || []), req.params.id];
    await Event.findByIdAndUpdate(req.params.id, { $inc: { 'stats.bookmarks': 1 } });
  }
  await user.save({ validateBeforeSave: false });
  sendSuccess(res, { bookmarked: !isSaved }, isSaved ? 'Event removed from saved' : 'Event saved');
});
