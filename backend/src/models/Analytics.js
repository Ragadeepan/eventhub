import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
  event:       { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
  organizer:   { type: mongoose.Schema.Types.ObjectId, ref: 'User',  required: true, index: true },
  date:        { type: Date, required: true, index: true },
  period:      { type: String, enum: ['hourly', 'daily', 'weekly', 'monthly'], default: 'daily' },
  metrics: {
    views:          { type: Number, default: 0 },
    uniqueVisitors: { type: Number, default: 0 },
    bookings:       { type: Number, default: 0 },
    revenue:        { type: Number, default: 0 },
    ticketsSold:    { type: Number, default: 0 },
    checkIns:       { type: Number, default: 0 },
    cancellations:  { type: Number, default: 0 },
    refunds:        { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 },
    avgTicketPrice: { type: Number, default: 0 },
  },
  trafficSources: {
    direct:   { type: Number, default: 0 },
    social:   { type: Number, default: 0 },
    organic:  { type: Number, default: 0 },
    referral: { type: Number, default: 0 },
    email:    { type: Number, default: 0 },
  },
  deviceBreakdown: {
    mobile:  { type: Number, default: 0 },
    desktop: { type: Number, default: 0 },
    tablet:  { type: Number, default: 0 },
  },
  demographics: {
    ageGroups: mongoose.Schema.Types.Mixed,
    countries: mongoose.Schema.Types.Mixed,
    cities:    mongoose.Schema.Types.Mixed,
  },
}, { timestamps: true });

analyticsSchema.index({ event: 1, date: 1, period: 1 }, { unique: true });
analyticsSchema.index({ organizer: 1, date: -1 });

export default mongoose.model('Analytics', analyticsSchema);
