import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { verifyFirebaseToken } from '../config/firebase.js';
import { AppError, asyncHandler, sendSuccess } from '../utils/apiResponse.js';

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

const createSendToken = (user, statusCode, res, message = 'Success') => {
  const token = signToken(user._id);
  user.password = undefined;
  sendSuccess(res, { token, user }, message, statusCode);
};

export const registerWithEmail = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, role = 'attendee' } = req.body;
  const allowedRoles = ['attendee', 'organizer'];
  if (!allowedRoles.includes(role)) throw new AppError('Invalid role specified', 400);
  if (await User.findOne({ email })) throw new AppError('Email already registered. Please log in.', 409);

  const user = await User.create({ firstName, lastName, email, password, role, loginProvider: 'email' });
  await Notification.create({ user: user._id, type: 'system', title: 'Welcome to EventHub! 🎉', message: 'Your account has been created. Start exploring events today!' });
  createSendToken(user, 201, res, 'Account created successfully');
});

export const loginWithEmail = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new AppError('Please provide email and password', 400);

  const user = await User.findOne({ email }).select('+password');
  if (!user || !user.password) throw new AppError('Invalid credentials', 401);
  if (!await user.comparePassword(password)) throw new AppError('Invalid credentials', 401);
  if (user.isBanned) throw new AppError('Account suspended. Contact support.', 403);

  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });
  createSendToken(user, 200, res, 'Logged in successfully');
});

export const loginWithFirebase = asyncHandler(async (req, res) => {
  const { idToken, role = 'attendee' } = req.body;
  if (!idToken) throw new AppError('Firebase ID token required', 400);

  const firebaseUser = await verifyFirebaseToken(idToken);
  let user = await User.findOne({ $or: [{ firebaseUid: firebaseUser.uid }, { email: firebaseUser.email }] });

  if (!user) {
    const nameParts = (firebaseUser.name || 'EventHub User').split(' ');
    user = await User.create({
      firebaseUid:   firebaseUser.uid,
      email:         firebaseUser.email,
      firstName:     nameParts[0] || 'User',
      lastName:      nameParts.slice(1).join(' ') || 'Account',
      avatar:        firebaseUser.picture,
      isVerified:    firebaseUser.email_verified,
      role:          ['attendee', 'organizer'].includes(role) ? role : 'attendee',
      loginProvider: 'google',
    });
    await Notification.create({ user: user._id, type: 'system', title: 'Welcome to EventHub! 🎉', message: 'Your account has been created via Google.' });
  } else {
    if (!user.firebaseUid) { user.firebaseUid = firebaseUser.uid; }
    user.lastLoginAt = new Date();
    if (firebaseUser.picture && !user.avatar) user.avatar = firebaseUser.picture;
    await user.save({ validateBeforeSave: false });
  }

  if (user.isBanned) throw new AppError('Account suspended. Contact support.', 403);
  createSendToken(user, 200, res, 'Logged in successfully');
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('savedEvents', 'title banner startDate status');
  sendSuccess(res, { user });
});

export const updateMe = asyncHandler(async (req, res) => {
  const disallowed = ['password', 'role', 'email', 'isBanned', 'isAdmin', 'firebaseUid'];
  disallowed.forEach(f => delete req.body[f]);
  const user = await User.findByIdAndUpdate(req.user._id, req.body, { new: true, runValidators: true });
  sendSuccess(res, { user }, 'Profile updated successfully');
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');
  if (!await user.comparePassword(currentPassword)) throw new AppError('Current password is incorrect', 400);
  user.password = newPassword;
  await user.save();
  createSendToken(user, 200, res, 'Password changed successfully');
});

export const logout = asyncHandler(async (req, res) => {
  sendSuccess(res, {}, 'Logged out successfully');
});
