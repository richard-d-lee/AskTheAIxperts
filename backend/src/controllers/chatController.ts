import { Request, Response } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler.js';
import { getModule, isValidModule } from '../modules/index.js';
import { validateQuestion, consolidateResponses, queryAllLLMs } from '../services/llm/index.js';
import { incrementUsage, getUserUsageStats } from '../middleware/usageQuota.js';
import type { ChatResponse, ExpertResponse } from '../types/index.js';

const prisma = new PrismaClient();

const chatSchema = z.object({
  question: z.string().min(1, 'Question is required').max(2000, 'Question too long'),
  conversationId: z.string().uuid().optional(),
});

export const getUsageStats = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const stats = await getUserUsageStats(userId);

  res.json({
    success: true,
    data: stats,
  });
};

export const handleChat = async (req: Request, res: Response) => {
  const moduleType = req.params.module as string;

  if (!isValidModule(moduleType)) {
    throw new AppError(`Invalid module: ${moduleType}. Valid modules are: healthcare, legal, travel, insurance, financial`, 400);
  }

  const validation = chatSchema.safeParse(req.body);

  if (!validation.success) {
    throw new AppError(validation.error.errors[0].message, 400);
  }

  const { question, conversationId } = validation.data;
  const userId = req.user!.userId;
  const usageRecordId = (req as any).usageRecordId;

  const moduleConfig = getModule(moduleType)!;

  // Layer 1: Validate the question
  const validationResult = await validateQuestion(
    moduleConfig.validationPrompt,
    question
  );

  if (!validationResult.valid) {
    // Don't count invalid questions against quota
    const response: ChatResponse = {
      validation: validationResult,
      expertResponses: [],
      consolidation: null,
      conversationId: conversationId || '',
    };

    return res.json({
      success: true,
      data: response,
    });
  }

  // Increment usage BEFORE making expensive API calls
  // This prevents users from spamming requests
  if (usageRecordId) {
    await incrementUsage(usageRecordId);
  }

  // Layer 2: Query all LLMs in parallel
  const expertResponses: ExpertResponse[] = await queryAllLLMs(
    moduleConfig.systemPrompt,
    question
  );

  // Filter out failed responses for consolidation
  const successfulResponses = expertResponses.filter(
    (r) => !r.error && r.response.length > 0
  );

  // Layer 3: Consolidate responses
  let consolidation = null;
  if (successfulResponses.length >= 2) {
    consolidation = await consolidateResponses(question, successfulResponses);
  } else if (successfulResponses.length === 1) {
    consolidation = {
      summary: successfulResponses[0].response,
      agreements: ['Only one AI responded successfully'],
      disagreements: [],
      consensusScore: 100,
      recommendation: 'Consider the single response but be aware only one AI was available.',
    };
  }

  // Create or update conversation
  let conversation;
  if (conversationId) {
    conversation = await prisma.conversation.findFirst({
      where: { id: conversationId, userId },
    });

    if (!conversation) {
      throw new AppError('Conversation not found', 404);
    }

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });
  } else {
    // Create new conversation with title from question
    const title = question.length > 50
      ? question.substring(0, 50) + '...'
      : question;

    conversation = await prisma.conversation.create({
      data: {
        userId,
        module: moduleType,
        title,
      },
    });
  }

  // Save user message
  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      role: 'user',
      content: question,
    },
  });

  // Save assistant response
  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      role: 'assistant',
      content: consolidation?.summary || 'No response available',
      expertResponses: expertResponses as any,
      consensus: consolidation as any,
    },
  });

  // Get updated usage stats to return to frontend
  const usageStats = await getUserUsageStats(userId);

  const response: ChatResponse = {
    validation: validationResult,
    expertResponses,
    consolidation,
    conversationId: conversation.id,
  };

  res.json({
    success: true,
    data: response,
    usage: usageStats,
  });
};
