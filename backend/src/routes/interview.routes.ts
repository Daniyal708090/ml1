import { Router } from 'express';
import { z } from 'zod';
import { InterviewMode, InterviewTrack } from '@prisma/client';
import { authenticate } from '../middleware/auth';
import {
  completeInterview,
  getInterviewHistory,
  startInterview,
  submitAnswer,
} from '../services/interview.service';
import { prisma } from '../lib/prisma';

export const interviewRouter = Router();
interviewRouter.use(authenticate);

interviewRouter.post('/start', async (req, res, next) => {
  try {
    const body = z
      .object({
        track: z.nativeEnum(InterviewTrack),
        mode: z.nativeEnum(InterviewMode),
        companySimulationId: z.string().optional(),
      })
      .parse(req.body);
    const result = await startInterview(req.user!.userId, body);
    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
});

interviewRouter.post('/:id/answer', async (req, res, next) => {
  try {
    const { content, codeSnippet } = z
      .object({ content: z.string().min(1), codeSnippet: z.string().optional() })
      .parse(req.body);
    const result = await submitAnswer(req.user!.userId, req.params.id, content, codeSnippet);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

interviewRouter.post('/:id/complete', async (req, res, next) => {
  try {
    await completeInterview(req.user!.userId, req.params.id);
    res.json({ success: true });
  } catch (e) {
    next(e);
  }
});

interviewRouter.get('/history', async (req, res, next) => {
  try {
    const history = await getInterviewHistory(req.user!.userId);
    res.json(history);
  } catch (e) {
    next(e);
  }
});

interviewRouter.get('/:id', async (req, res, next) => {
  try {
    const interview = await prisma.interview.findFirst({
      where: { id: req.params.id, userId: req.user!.userId },
      include: {
        messages: { orderBy: { createdAt: 'asc' } },
        answers: { include: { analysis: { include: { scores: true } } } },
        companySimulation: true,
      },
    });
    if (!interview) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    res.json(interview);
  } catch (e) {
    next(e);
  }
});
