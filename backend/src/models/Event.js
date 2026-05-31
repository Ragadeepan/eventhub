import mongoose from 'mongoose';

const speakerSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  title:     String,
  company:   String,
  bio:       { type: String, maxlength: 1000 },
  avatar:    String,
  social: { twitter: String, linkedin: String, website: String },
}, { _id: true });

const scheduleItemSchema = new mongoose.Schema({
  time:        { type: String, required: true },
  title:       { type: String, required: true },
  description: String,
  speaker:     String,
  location:    String,
  type:        { type: String, enum: ['talk', 'workshop', 'break', 'networking', 'other'], default: 'talk' },
}, { _id: true });

const ticketTypeSchema = new mongoose.Schema({
  name:           { type: String, required: true },
  description:    String,
  price:          { type: Number, required: true, min: 0 },
  quantity:       { type: Number, required: true, min: 0 },
  sold:           { type: Number, default: 0 },
  maxPerBooking:  { type: Number, default: 10 },
  perks:          [String],
  saleStartDate:  Date,
  saleEndDate:    Date,
  isVisible:      { type: Boolean, default: true },
  isFeatured:     { type: Boolean, default: false },
  color:          { type: String, default: '#6366f1' },
}, { _id: true });

const eventSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true, maxlength: 200, index: 'text' },
  slug:        { type: String, unique: true, lowercase: true },
  description: { type: String, required: true, maxlength: 10000, index: 'text' },
  shortDescription: { type: String, maxlength: 300 },
  organizer:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  staff:       [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  category:    { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  tags:        [{ type: String, lowercase: true }],
  banner:      { type: String, required: true },
  bannerPublicId: String,
  gallery:     [{ url: String, publicId: String }],
  status:      { type: String, enum: ['draft', 'published', 'cancelled', 'completed', 'postponed'], default: 'draft', index: true },
  type:        { type: String, enum: ['in-person', 'virtual', 'hybrid'], required: true },
  isPrivate:   { type: Boolean, default: false },
  isFeatured:  { type: Boolean, default: false, index: true },
  isTrending:  { type: Boolean, default: false },
  venue: {
    name:     String,
    address:  String,
    city:     { type: String, index: true },
    state:    String,
    country:  { type: String, index: true },
    zipCode:  String,
    mapUrl:   String,
    virtualLink: String,
    coordinates: {
      lat: Number,
      lng: Number,
    },
  },
  startDate:   { type: Date, required: true, index: true },
  endDate:     { type: Date, required: true },
  timezone:    { type: String, default: 'UTC' },
  ticketTypes: [ticketTypeSchema],
  speakers:    [speakerSchema],
  schedule:    [scheduleItemSchema],
  maxAttendees:    { type: Number },
  registeredCount: { type: Number, default: 0 },
  checkInCount:    { type: Number, default: 0 },
  waitlistEnabled: { type: Boolean, default: true },
  requiresApproval: { type: Boolean, default: false },
  certificateEnabled: { type: Boolean, default: false },
  networkingEnabled:  { type: Boolean, default: true },
  refundPolicy:    { type: String, maxlength: 2000 },
  termsAndConditions: { type: String, maxlength: 5000 },
  faq:         [{ question: String, answer: String }],
  stats: {
    views:        { type: Number, default: 0 },
    bookmarks:    { type: Number, default: 0 },
    shares:       { type: Number, default: 0 },
    revenue:      { type: Number, default: 0 },
    avgRating:    { type: Number, default: 0 },
    reviewCount:  { type: Number, default: 0 },
  },
  seoMeta: {
    title:       String,
    description: String,
    keywords:    [String],
  },
  publishedAt: Date,
  cancelledAt: Date,
  cancelReason: String,
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

eventSchema.virtual('availableTickets').get(function () {
  return this.ticketTypes?.reduce((sum, t) => sum + Math.max(0, t.quantity - t.sold), 0) ?? 0;
});

eventSchema.virtual('isSoldOut').get(function () {
  return this.availableTickets === 0;
});

eventSchema.virtual('isPast').get(function () {
  return new Date() > this.endDate;
});

eventSchema.index({ title: 'text', description: 'text', tags: 'text' });
eventSchema.index({ startDate: 1, status: 1 });
eventSchema.index({ 'venue.city': 1, 'venue.country': 1 });
eventSchema.index({ organizer: 1, status: 1 });
eventSchema.index({ isFeatured: 1, isTrending: 1, status: 1 });

eventSchema.pre('save', function (next) {
  if (!this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim() + '-' + Date.now();
  }
  if (!this.shortDescription) {
    this.shortDescription = this.description.slice(0, 297) + '...';
  }
  next();
});

export default mongoose.model('Event', eventSchema);
