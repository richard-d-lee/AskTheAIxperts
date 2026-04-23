import { Router } from 'express';
import { handleChat } from '../controllers/chatController.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

router.post('/:module', authenticate, asyncHandler(handleChat));

export default router;
