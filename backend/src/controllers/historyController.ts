import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler.js';

const prisma = new PrismaClient();

export const getConversations = async (req: Request, res: Response) => {
  const conversations = await prisma.conversation.findMany({
    where: { userId: req.user!.userId },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      module: true,
      title: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: { messages: true },
      },
    },
  });

  res.json({
    success: true,
    data: { conversations },
  });
};

export const getConversation = async (req: Request, res: Response) => {
  const id = req.params.id as string;

  const conversation = await prisma.conversation.findFirst({
    where: {
      id,
      userId: req.user!.userId,
    },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!conversation) {
    throw new AppError('Conversation not found', 404);
  }

  res.json({
    success: true,
    data: { conversation },
  });
};

export const deleteConversation = async (req: Request, res: Response) => {
  const id = req.params.id as string;

  const conversation = await prisma.conversation.findFirst({
    where: {
      id,
      userId: req.user!.userId,
    },
  });

  if (!conversation) {
    throw new AppError('Conversation not found', 404);
  }

  await prisma.conversation.delete({
    where: { id },
  });

  res.json({
    success: true,
    message: 'Conversation deleted',
  });
};
