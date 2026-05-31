import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const bookingTicketSchema = new mongoose.Schema({
  ticketTypeId:   { type: mongoose.Schema.Types.ObjectId, required: true },
  ticketTypeName: { type: String, required: true },
  quantity:       { type: Number, required: true, min: 1 },
  unitPrice:      { type: Number, required: true, min: 0 },
  subtotal:       { type: Number, required: true, min: 0 },
}, { _id: false });

const bookingSchema = new mongoose.Schema({
  bookingId:    { type: String, unique: true, default: () => `BKG-${uuidv4().slice(0, 8).toUpperCase()}` },
  user:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  event:        { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
  tickets:      [bookingTicketSchema],
  totalAmount:  { type: Number, required: true, min: 0 },
  currency:     { type: String, default: 'USD' },
  status:       { type: String, enum: ['pending', 'confirmed', 'cancelled', 'refunded', 'failed'], default: 'pending', index: true },
  paymentStatus: { type: String, enum: ['unpaid', 'paid', 'partial', 'refunded'], default: 'unpaid' },
  paymentMethod: { type: String, enum: ['card', 'paypal', 'bank_transfer', 'free', 'other'] },
  paymentIntentId: String,
  paymentDetails: mongoose.Schema.Types.Mixed,
  couponCode:    String,
  discountAmount: { type: Number, default: 0 },
  attendeeName:  String,
  attendeeEmail: String,
  attendeePhone: String,
  groupAttendees: [{
    name:  String,
    email: String,
    phone: String,
  }],
  specialRequirements: String,
  notes:         String,
  cancelledAt:   Date,
  cancelReason:  String,
  refundedAt:    Date,
  refundAmount:  Number,
  checkedInAt:   Date,
  confirmedAt:   Date,
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

bookingSchema.index({ user: 1, event: 1 });
bookingSchema.index({ status: 1, paymentStatus: 1 });
bookingSchema.index({ createdAt: -1 });

export default mongoose.model('Booking', bookingSchema);
