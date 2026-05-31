import mongoose from 'mongoose';

const waitlistSchema = new mongoose.Schema({
  event:     { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User',  required: true, index: true },
  ticketTypeId: { type: mongoose.Schema.Types.ObjectId, required: true },
  quantity:  { type: Number, default: 1, min: 1 },
  position:  { type: Number, required: true },
  status:    { type: String, enum: ['waiting', 'notified', 'expired', 'converted'], default: 'waiting', index: true },
  notifiedAt: Date,
  expiresAt:  Date,
  email:     { type: String, required: true },
  phone:     String,
}, { timestamps: true });

waitlistSchema.index({ event: 1, user: 1 }, { unique: true });
waitlistSchema.index({ event: 1, position: 1 });

export default mongoose.model('Waitlist', waitlistSchema);
