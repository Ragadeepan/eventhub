import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  event:   { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User',  required: true, index: true },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  rating:  { type: Number, required: true, min: 1, max: 5 },
  title:   { type: String, maxlength: 100 },
  body:    { type: String, required: true, maxlength: 2000 },
  pros:    [{ type: String, maxlength: 200 }],
  cons:    [{ type: String, maxlength: 200 }],
  photos:  [{ url: String, publicId: String }],
  aspects: {
    organization: { type: Number, min: 1, max: 5 },
    venue:        { type: Number, min: 1, max: 5 },
    content:      { type: Number, min: 1, max: 5 },
    networking:   { type: Number, min: 1, max: 5 },
    value:        { type: Number, min: 1, max: 5 },
  },
  isVerifiedAttendee: { type: Boolean, default: false },
  isApproved:         { type: Boolean, default: true },
  isFeatured:         { type: Boolean, default: false },
  helpful:     { type: Number, default: 0 },
  helpfulVoters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  reply: {
    body:        String,
    repliedAt:   Date,
    repliedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
}, { timestamps: true });

reviewSchema.index({ event: 1, user: 1 }, { unique: true });
reviewSchema.index({ event: 1, rating: -1 });
reviewSchema.index({ event: 1, isApproved: 1, createdAt: -1 });

reviewSchema.statics.calcAverageRating = async function (eventId) {
  const stats = await this.aggregate([
    { $match: { event: eventId, isApproved: true } },
    { $group: { _id: '$event', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  if (stats.length > 0) {
    await mongoose.model('Event').findByIdAndUpdate(eventId, {
      'stats.avgRating':   Math.round(stats[0].avgRating * 10) / 10,
      'stats.reviewCount': stats[0].count,
    });
  }
};

reviewSchema.post('save', function () { this.constructor.calcAverageRating(this.event); });
reviewSchema.post('findOneAndDelete', function (doc) { if (doc) doc.constructor.calcAverageRating(doc.event); });

export default mongoose.model('Review', reviewSchema);
