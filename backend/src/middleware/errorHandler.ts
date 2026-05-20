import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../lib/logger';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof ZodError) {
    res.status(400).json({ error: 'Validation failed', details: err.flatten() });
    return;
  }

  const message = err instanceof Error ? err.message : 'Internal server error';
  logger.error(message, { stack: err instanceof Error ? err.stack : undefined });

  const isDbDown =
    message.includes("Can't reach database") ||
    message.includes('ECONNREFUSED') ||
    message.includes('P1001');

  if (isDbDown) {
    res.status(503).json({
      error: 'Database is not available. Run: cd backend && npx prisma db push',
    });
    return;
  }

  res.status(500).json({ error: message });
}
