import { Router } from 'express';
import { prisma } from '../lib/prisma';

export const companyRouter = Router();

companyRouter.get('/', async (_req, res, next) => {
  try {
    const companies = await prisma.companySimulation.findMany({
      orderBy: { name: 'asc' },
    });
    res.json(companies);
  } catch (e) {
    next(e);
  }
});
