import { Router } from 'express';
import {
  signup, login, logout, refresh, verifyEmail, resendVerification,
  forgotPassword, resetPassword
} from '../controllers/authController.js';
import { validate } from '../middleware/validate.js';
import { authLimiter, resendVerificationLimiter } from '../middleware/rateLimiter.js';
import {
  signupSchema, loginSchema, verifyEmailSchema, forgotPasswordSchema, resetPasswordSchema
} from '../../../shared/schemas.js';

const router = Router();

router.post('/signup', authLimiter, validate(signupSchema), signup);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/logout', logout);
router.post('/refresh', refresh);
router.post('/verify-email', validate(verifyEmailSchema), verifyEmail);
router.post('/resend-verification', resendVerificationLimiter, resendVerification);
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password/:token', authLimiter, validate(resetPasswordSchema), resetPassword);

export default router;
