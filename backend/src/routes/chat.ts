import { Router } from 'express';
import { handleChat, getUsageStats } from '../controllers/chatController.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { checkUsageQuota } from '../middleware/usageQuota.js';
import { chatLimiter } from '../middleware/rateLimit.js';

const router = Router();

// Get user's usage statistics
router.get('/usage', authenticate, asyncHandler(getUsageStats));

// Main chat endpoint with rate limiting and usage quota
router.post(
  '/:module',
  chatLimiter,
  authenticate,
  asyncHandler(checkUsageQuota),
  asyncHandler(handleChat)
);

export default router;
