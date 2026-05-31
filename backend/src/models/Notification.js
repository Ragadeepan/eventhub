import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type:    { type: String, enum: ['booking_confirmed', 'booking_cancelled', 'event_reminder', 'event_update', 'event_cancelled', 'waitlist_available', 'ticket_transfer', 'review_reply', 'connection_request', 'system', 'certificate_ready'], required: true },
  title:   { type: String, required: true, maxlength: 100 },
  message: { type: String, required: true, maxlength: 500 },
  link:    { type: String },
  image:   { type: String },
  isRead:  { type: Boolean, default: false, index: true },
  readAt:  { type: Date },
  data:    { type: mongoose.Schema.Types.Mixed },
  expiresAt: { type: Date, index: { expireAfterSeconds: 0 } },
}, { timestamps: true });

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

notificationSchema.statics.createAndSend = async function (notificationData) {
  const notification = await this.create(notificationData);
  return notification;
};

export default mongoose.model('Notification', notificationSchema);
