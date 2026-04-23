import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AppError } from './errorHandler.js';

const prisma = new PrismaClient();

// Get today's date at midnight UTC
function getTodayDate(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

// Check if user has exceeded their daily quota
export const checkUsageQuota = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?.userId;

  if (!userId) {
    throw new AppError('Authentication required', 401);
  }

  // Get user with their role and limits
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      dailyLimit: true,
      isBlocked: true,
      role: true,
    },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Check if user is blocked
  if (user.isBlocked) {
    throw new AppError('Your account has been suspended. Please contact support.', 403);
  }

  // Admins have unlimited access
  if (user.role === 'admin') {
    return next();
  }

  const today = getTodayDate();

  // Get or create today's usage record
  const usageRecord = await prisma.usageRecord.upsert({
    where: {
      userId_date: {
        userId: userId,
        date: today,
      },
    },
    update: {},
    create: {
      userId: userId,
      date: today,
      count: 0,
    },
  });

  // Check if user has exceeded their daily limit
  if (usageRecord.count >= user.dailyLimit) {
    throw new AppError(
      `Daily limit of ${user.dailyLimit} queries reached. Please try again tomorrow or upgrade your account.`,
      429
    );
  }

  // Store the usage record ID for incrementing after successful request
  (req as any).usageRecordId = usageRecord.id;

  next();
};

// Increment usage after successful chat request
export const incrementUsage = async (usageRecordId: string) => {
  await prisma.usageRecord.update({
    where: { id: usageRecordId },
    data: { count: { increment: 1 } },
  });
};

// Get user's current usage stats
export const getUserUsageStats = async (userId: string) => {
  const today = getTodayDate();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      dailyLimit: true,
      role: true,
    },
  });

  const usageRecord = await prisma.usageRecord.findUnique({
    where: {
      userId_date: {
        userId: userId,
        date: today,
      },
    },
  });

  return {
    used: usageRecord?.count || 0,
    limit: user?.dailyLimit || 20,
    remaining: Math.max(0, (user?.dailyLimit || 20) - (usageRecord?.count || 0)),
    role: user?.role || 'user',
  };
};
