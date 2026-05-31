import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  firebaseUid: { type: String, unique: true, sparse: true },
  email:       { type: String, required: true, unique: true, lowercase: true, trim: true, match: [/^\S+@\S+\.\S+$/, 'Invalid email'] },
  password:    { type: String, minlength: 8, select: false },
  firstName:   { type: String, required: true, trim: true, maxlength: 50 },
  lastName:    { type: String, required: true, trim: true, maxlength: 50 },
  displayName: { type: String, trim: true },
  avatar:      { type: String, default: null },
  avatarPublicId: String,
  role:        { type: String, enum: ['attendee', 'organizer', 'staff', 'admin'], default: 'attendee' },
  phone:       { type: String, trim: true },
  bio:         { type: String, maxlength: 500 },
  location:    { type: String },
  website:     { type: String },
  social: {
    twitter:   String,
    linkedin:  String,
    instagram: String,
    github:    String,
    website:   String,
  },
  interests:   [{ type: String }],
  isVerified:  { type: Boolean, default: false },
  isActive:    { type: Boolean, default: true },
  isBanned:    { type: Boolean, default: false },
  banReason:   String,
  lastLoginAt: Date,
  loginProvider: { type: String, enum: ['email', 'google', 'github'], default: 'email' },
  preferences: {
    emailNotifications: { type: Boolean, default: true },
    pushNotifications:  { type: Boolean, default: true },
    newsletterOptIn:    { type: Boolean, default: false },
    language:           { type: String, default: 'en' },
    timezone:           { type: String, default: 'UTC' },
  },
  stats: {
    eventsAttended: { type: Number, default: 0 },
    eventsOrganized: { type: Number, default: 0 },
    totalSpent:     { type: Number, default: 0 },
    connectionsCount: { type: Number, default: 0 },
  },
  connections:      [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  savedEvents:      [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
  resetPasswordToken:   { type: String, select: false },
  resetPasswordExpires: { type: Date,   select: false },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ 'location': 'text', 'bio': 'text', 'displayName': 'text' });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.pre('save', function (next) {
  if (!this.displayName) this.displayName = `${this.firstName} ${this.lastName}`;
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toPublicJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpires;
  delete obj.firebaseUid;
  return obj;
};

export default mongoose.model('User', userSchema);
