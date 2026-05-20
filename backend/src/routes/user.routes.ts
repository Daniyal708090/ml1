import { Router } from 'express';
import { z } from 'zod';
import { InterviewTrack, SeniorityLevel } from '@prisma/client';
import { authenticate } from '../middleware/auth';
import { prisma } from '../lib/prisma';

export const userRouter = Router();
userRouter.use(authenticate);

userRouter.get('/me', async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        preferredTrack: true,
        targetLevel: true,
        targetCompanies: true,
        githubUsername: true,
        leetcodeUsername: true,
        analytics: true,
      },
    });
    res.json(user);
  } catch (e) {
    next(e);
  }
});

userRouter.patch('/me', async (req, res, next) => {
  try {
    const body = z
      .object({
        name: z.string().optional(),
        preferredTrack: z.nativeEnum(InterviewTrack).optional(),
        targetLevel: z.nativeEnum(SeniorityLevel).optional(),
        targetCompanies: z.array(z.string()).optional(),
        githubUsername: z.string().optional(),
        leetcodeUsername: z.string().optional(),
      })
      .parse(req.body);

    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: body,
    });
    res.json(user);
  } catch (e) {
    next(e);
  }
});

userRouter.get('/progress', async (req, res, next) => {
  try {
    const [analytics, snapshots] = await Promise.all([
      prisma.userAnalytics.findUnique({ where: { userId: req.user!.userId } }),
      prisma.progressSnapshot.findMany({
        where: { userId: req.user!.userId },
        orderBy: { date: 'asc' },
        take: 90,
      }),
    ]);
    res.json({ analytics, snapshots });
  } catch (e) {
    next(e);
  }
});
