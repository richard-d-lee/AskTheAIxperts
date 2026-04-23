import { Router } from 'express';
import {
  getConversations,
  getConversation,
  deleteConversation,
} from '../controllers/historyController.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

router.get('/', authenticate, asyncHandler(getConversations));
router.get('/:id', authenticate, asyncHandler(getConversation));
router.delete('/:id', authenticate, asyncHandler(deleteConversation));

export default router;
