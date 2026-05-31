import Event from '../models/Event.js';
import Booking from '../models/Booking.js';
import Ticket from '../models/Ticket.js';
import User from '../models/User.js';
import Waitlist from '../models/Waitlist.js';
import { asyncHandler, sendSuccess, AppError } from '../utils/apiResponse.js';
import { subDays, format, startOfDay, endOfDay, eachDayOfInterval } from 'date-fns';

export const getOrganizerAnalytics = asyncHandler(async (req, res) => {
  const organizerId = req.user._id;
  const days = parseInt(req.query.days) || 30;
  const startDate = subDays(new Date(), days);

  const [events, bookings, totalStats] = await Promise.all([
    Event.find({ organizer: organizerId }),
    Booking.find({ event: { $in: (await Event.find({ organizer: organizerId }, '_id')).map(e => e._id) }, createdAt: { $gte: startDate } }).populate('event', 'title'),
    Event.aggregate([
      { $match: { organizer: organizerId } },
      { $group: { _id: null, totalRevenue: { $sum: '$stats.revenue' }, totalViews: { $sum: '$stats.views' }, totalRegistered: { $sum: '$registeredCount' }, totalCheckIns: { $sum: '$checkInCount' } } },
    ]),
  ]);

  const stats = totalStats[0] || { totalRevenue: 0, totalViews: 0, totalRegistered: 0, totalCheckIns: 0 };
  const dateRange = eachDayOfInterval({ start: startDate, end: new Date() });
  const revenueByDay = dateRange.map(date => {
    const dayBookings = bookings.filter(b => format(new Date(b.createdAt), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'));
    return { date: format(date, 'MMM dd'), revenue: dayBookings.reduce((sum, b) => sum + b.totalAmount, 0), bookings: dayBookings.length };
  });

  const ticketsByType = await Booking.aggregate([
    { $match: { event: { $in: events.map(e => e._id) } } },
    { $unwind: '$tickets' },
    { $group: { _id: '$tickets.ticketTypeName', count: { $sum: '$tickets.quantity' }, revenue: { $sum: '$tickets.subtotal' } } },
    { $sort: { count: -1 } },
  ]);

  const topEvents = events.sort((a, b) => b.stats.revenue - a.stats.revenue).slice(0, 5).map(e => ({
    id: e._id, title: e.title, revenue: e.stats.revenue, views: e.stats.views, registered: e.registeredCount, checkIns: e.checkInCount, conversionRate: e.stats.views > 0 ? ((e.registeredCount / e.stats.views) * 100).toFixed(1) : 0,
  }));

  const attendanceRate = stats.totalRegistered > 0 ? ((stats.totalCheckIns / stats.totalRegistered) * 100).toFixed(1) : 0;
  const conversionRate = stats.totalViews > 0 ? ((stats.totalRegistered / stats.totalViews) * 100).toFixed(1) : 0;

  sendSuccess(res, {
    overview: { ...stats, attendanceRate, conversionRate, totalEvents: events.length, activeEvents: events.filter(e => e.status === 'published').length },
    revenueByDay,
    ticketsByType,
    topEvents,
  });
});

export const getAdminAnalytics = asyncHandler(async (req, res) => {
  const [userStats, eventStats, bookingStats, recentBookings] = await Promise.all([
    User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
    Event.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Booking.aggregate([{ $group: { _id: '$status', count: { $sum: 1 }, revenue: { $sum: '$totalAmount' } } }]),
    Booking.find({ status: 'confirmed' }).sort({ createdAt: -1 }).limit(10).populate('user', 'firstName lastName avatar').populate('event', 'title'),
  ]);

  const startDate = subDays(new Date(), 30);
  const dailySignups = await User.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);

  sendSuccess(res, { userStats, eventStats, bookingStats, recentBookings, dailySignups });
});

export const getEventAnalytics = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.eventId);
  if (!event) throw new AppError('Event not found', 404);

  const [bookings, checkedIn, waitlist] = await Promise.all([
    Booking.find({ event: event._id, status: 'confirmed' }).populate('user', 'firstName lastName email'),
    Ticket.countDocuments({ event: event._id, isCheckedIn: true }),
    Waitlist.countDocuments({ event: event._id, status: 'waiting' }),
  ]);

  const ticketBreakdown = event.ticketTypes.map(t => ({
    name: t.name, price: t.price, quantity: t.quantity, sold: t.sold, available: t.quantity - t.sold, revenue: t.price * t.sold,
  }));

  sendSuccess(res, {
    event: { id: event._id, title: event.title, status: event.status, startDate: event.startDate },
    stats: { totalBookings: bookings.length, checkedIn, waitlisted: waitlist, revenue: event.stats.revenue, views: event.stats.views, avgRating: event.stats.avgRating },
    ticketBreakdown,
  });
});
