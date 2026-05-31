import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const certificateSchema = new mongoose.Schema({
  certificateId: { type: String, unique: true, default: () => `CERT-${uuidv4().slice(0, 10).toUpperCase()}` },
  user:          { type: mongoose.Schema.Types.ObjectId, ref: 'User',  required: true, index: true },
  event:         { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  booking:       { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  holderName:    { type: String, required: true },
  eventName:     { type: String, required: true },
  eventDate:     { type: Date,   required: true },
  certificateType: { type: String, enum: ['attendance', 'participation', 'completion', 'speaker', 'organizer'], default: 'attendance' },
  issuerName:    { type: String, required: true },
  issuerTitle:   String,
  template:      { type: String, default: 'default' },
  pdfUrl:        String,
  pdfPublicId:   String,
  isVerified:    { type: Boolean, default: true },
  issuedAt:      { type: Date, default: Date.now },
  expiresAt:     Date,
  metadata:      mongoose.Schema.Types.Mixed,
}, { timestamps: true });

certificateSchema.index({ user: 1, event: 1 });

export default mongoose.model('Certificate', certificateSchema);
