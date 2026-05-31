import Booking from '../models/Booking.js';
import Ticket from '../models/Ticket.js';
import Event from '../models/Event.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { generateQRCode } from '../services/qrService.js';
import { AppError, asyncHandler, sendSuccess, getPaginationParams, buildPaginationMeta } from '../utils/apiResponse.js';

export const createBooking = asyncHandler(async (req, res) => {
  const { eventId, tickets: ticketSelections, attendeeName, attendeeEmail, attendeePhone, groupAttendees, specialRequirements } = req.body;

  const event = await Event.findById(eventId);
  if (!event) throw new AppError('Event not found', 404);
  if (event.status !== 'published') throw new AppError('This event is not available for booking', 400);
  if (new Date() > event.endDate) throw new AppError('This event has already ended', 400);

  // Validate ticket selections & calculate totals
  let totalAmount = 0;
  const bookingTickets = [];

  for (const selection of ticketSelections) {
    const ticketType = event.ticketTypes.id(selection.ticketTypeId);
    if (!ticketType) throw new AppError(`Ticket type not found: ${selection.ticketTypeId}`, 404);
    const available = ticketType.quantity - ticketType.sold;
    if (selection.quantity > available) throw new AppError(`Only ${available} tickets left for ${ticketType.name}`, 400);
    if (selection.quantity > ticketType.maxPerBooking) throw new AppError(`Maximum ${ticketType.maxPerBooking} tickets per booking for ${ticketType.name}`, 400);

    const subtotal = ticketType.price * selection.quantity;
    totalAmount += subtotal;
    bookingTickets.push({ ticketTypeId: selection.ticketTypeId, ticketTypeName: ticketType.name, quantity: selection.quantity, unitPrice: ticketType.price, subtotal });
  }

  // Create booking
  const booking = await Booking.create({
    user: req.user._id,
    event: eventId,
    tickets: bookingTickets,
    totalAmount,
    status: 'confirmed',
    paymentStatus: totalAmount === 0 ? 'paid' : 'unpaid',
    paymentMethod: totalAmount === 0 ? 'free' : undefined,
    attendeeName:  attendeeName  || req.user.fullName,
    attendeeEmail: attendeeEmail || req.user.email,
    attendeePhone: attendeePhone || req.user.phone,
    groupAttendees,
    specialRequirements,
    confirmedAt: new Date(),
  });

  // Update ticket sold counts
  for (const selection of ticketSelections) {
    await Event.updateOne(
      { _id: eventId, 'ticketTypes._id': selection.ticketTypeId },
      { $inc: { 'ticketTypes.$.sold': selection.quantity, registeredCount: selection.quantity, 'stats.revenue': bookingTickets.find(b => b.ticketTypeId.toString() === selection.ticketTypeId)?.subtotal || 0 } }
    );
  }

  // Generate QR tickets
  const createdTickets = [];
  for (const bookingTicket of bookingTickets) {
    for (let i = 0; i < bookingTicket.quantity; i++) {
      const ticket = new Ticket({
        booking: booking._id,
        event: eventId,
        user: req.user._id,
        ticketTypeId: bookingTicket.ticketTypeId,
        ticketTypeName: bookingTicket.ticketTypeName,
        price: bookingTicket.unitPrice,
        holderName:  booking.attendeeName,
        holderEmail: booking.attendeeEmail,
        holderPhone: booking.attendeePhone,
      });

      const { qrCodeBase64, qrData } = await generateQRCode({
        ticketId:  ticket.ticketId,
        eventId:   eventId,
        bookingId: booking.bookingId,
        userId:    req.user._id.toString(),
        issued:    new Date().toISOString(),
      });

      ticket.qrCode     = qrCodeBase64;
      ticket.qrCodeData = qrData;
      await ticket.save();
      createdTickets.push(ticket);
    }
  }

  // Notification
  await Notification.create({
    user: req.user._id,
    type: 'booking_confirmed',
    title: 'Booking Confirmed! 🎟️',
    message: `Your booking for "${event.title}" has been confirmed. Your tickets are ready!`,
    link: `/my-tickets/${booking._id}`,
    data: { bookingId: booking._id, eventId },
  });

  // Update user stats
  await User.findByIdAndUpdate(req.user._id, { $inc: { 'stats.totalSpent': totalAmount } });

  const populatedBooking = await Booking.findById(booking._id).populate('event', 'title banner startDate venue');
  sendSuccess(res, { booking: populatedBooking, tickets: createdTickets }, 'Booking confirmed successfully', 201);
});

export const getMyBookings = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaginationParams(req.query);
  const filter = { user: req.user._id };
  if (req.query.status) filter.status = req.query.status;

  const [bookings, total] = await Promise.all([
    Booking.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('event', 'title banner startDate endDate venue status slug'),
    Booking.countDocuments(filter),
  ]);

  sendSuccess(res, { bookings, pagination: buildPaginationMeta(total, page, limit) });
});

export const getBookingById = asyncHandler(async (req, res) => {
  const booking = await Booking.findOne({ _id: req.params.id, user: req.user._id })
    .populate('event', 'title banner startDate endDate venue organizer certificateEnabled')
    .populate('user', 'firstName lastName email');

  if (!booking) throw new AppError('Booking not found', 404);
  const tickets = await Ticket.find({ booking: booking._id });
  sendSuccess(res, { booking, tickets });
});

export const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findOne({ _id: req.params.id, user: req.user._id });
  if (!booking) throw new AppError('Booking not found', 404);
  if (booking.status !== 'confirmed') throw new AppError('This booking cannot be cancelled', 400);

  const event = await Event.findById(booking.event);
  const hoursUntilEvent = (new Date(event.startDate) - new Date()) / (1000 * 60 * 60);
  if (hoursUntilEvent < 24) throw new AppError('Bookings cannot be cancelled within 24 hours of the event', 400);

  booking.status = 'cancelled';
  booking.cancelledAt = new Date();
  booking.cancelReason = req.body.reason;
  await booking.save();

  // Restore ticket counts
  for (const t of booking.tickets) {
    await Event.updateOne(
      { _id: booking.event, 'ticketTypes._id': t.ticketTypeId },
      { $inc: { 'ticketTypes.$.sold': -t.quantity, registeredCount: -t.quantity } }
    );
  }

  await Ticket.updateMany({ booking: booking._id }, { status: 'cancelled', cancelledAt: new Date() });

  sendSuccess(res, { booking }, 'Booking cancelled successfully');
});

export const checkInTicket = asyncHandler(async (req, res) => {
  const { qrData } = req.body;
  const ticket = await Ticket.findOne({ qrCodeData: qrData }).populate('event user');
  if (!ticket) throw new AppError('Invalid ticket', 404);
  if (ticket.status !== 'active') throw new AppError(`Ticket is ${ticket.status}`, 400);
  if (ticket.isCheckedIn) throw new AppError('Ticket already checked in', 400);
  if (ticket.event._id.toString() !== req.params.eventId) throw new AppError('Ticket does not belong to this event', 400);

  ticket.isCheckedIn = true;
  ticket.checkedInAt = new Date();
  ticket.checkedInBy = req.user._id;
  ticket.status = 'used';
  await ticket.save();

  await Event.findByIdAndUpdate(ticket.event._id, { $inc: { checkInCount: 1 } });

  sendSuccess(res, { ticket, attendee: ticket.user }, 'Check-in successful! ✅');
});
