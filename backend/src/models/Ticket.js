import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const ticketSchema = new mongoose.Schema({
  ticketId:      { type: String, unique: true, default: () => `TKT-${uuidv4().slice(0, 10).toUpperCase()}` },
  booking:       { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, index: true },
  event:         { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
  user:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  ticketTypeId:  { type: mongoose.Schema.Types.ObjectId, required: true },
  ticketTypeName: { type: String, required: true },
  price:         { type: Number, required: true, min: 0 },
  seatNumber:    String,
  holderName:    { type: String, required: true },
  holderEmail:   { type: String, required: true },
  holderPhone:   String,
  qrCode:        { type: String },
  qrCodeData:    { type: String },
  status:        { type: String, enum: ['active', 'used', 'cancelled', 'transferred'], default: 'active', index: true },
  isCheckedIn:   { type: Boolean, default: false },
  checkedInAt:   Date,
  checkedInBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  transferredTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  transferredAt: Date,
  cancelledAt:   Date,
  pdfUrl:        String,
  metadata:      mongoose.Schema.Types.Mixed,
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

ticketSchema.index({ user: 1, status: 1 });
ticketSchema.index({ event: 1, isCheckedIn: 1 });
ticketSchema.index({ qrCodeData: 1 });

export default mongoose.model('Ticket', ticketSchema);
