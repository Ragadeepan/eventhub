import { Router } from 'express';
import { registerWithEmail, loginWithEmail, loginWithFirebase, getMe, updateMe, changePassword, logout } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimit.js';

const router = Router();

router.post('/register',  authLimiter, registerWithEmail);
router.post('/login',     authLimiter, loginWithEmail);
router.post('/firebase',  authLimiter, loginWithFirebase);
router.post('/logout',    protect,     logout);
router.get('/me',         protect,     getMe);
router.patch('/me',       protect,     updateMe);
router.patch('/password', protect,     changePassword);

export default router;
