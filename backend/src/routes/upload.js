import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { uploadEventBanner, uploadAvatar } from '../config/cloudinary.js';
import { asyncHandler, sendSuccess } from '../utils/apiResponse.js';
import { uploadLimiter } from '../middleware/rateLimit.js';

const router = Router();
router.use(protect, uploadLimiter);

router.post('/avatar', uploadAvatar.single('avatar'), asyncHandler(async (req, res) => {
  if (!req.file) throw new Error('No file uploaded');
  sendSuccess(res, { url: req.file.path, publicId: req.file.filename }, 'Avatar uploaded');
}));

router.post('/event-banner', uploadEventBanner.single('banner'), asyncHandler(async (req, res) => {
  if (!req.file) throw new Error('No file uploaded');
  sendSuccess(res, { url: req.file.path, publicId: req.file.filename }, 'Banner uploaded');
}));

export default router;
