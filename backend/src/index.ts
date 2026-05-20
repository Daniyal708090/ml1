import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './lib/logger';
import { redis } from './lib/redis';
import { authRouter } from './routes/auth.routes';
import { interviewRouter } from './routes/interview.routes';
import { userRouter } from './routes/user.routes';
import { companyRouter } from './routes/company.routes';
import { registerChatHandlers } from './websocket/chat.handler';

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: { origin: env.CORS_ORIGIN, credentials: true },
});

app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(
  rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRouter);
app.use('/api/interviews', interviewRouter);
app.use('/api/users', userRouter);
app.use('/api/companies', companyRouter);

app.use(errorHandler);
registerChatHandlers(io);

async function bootstrap() {
  try {
    await redis.connect().catch(() => {
      logger.warn('Redis unavailable — caching disabled');
    });
  } catch {
    logger.warn('Redis connection skipped');
  }

  httpServer.listen(env.PORT, () => {
    logger.info(`API listening on http://localhost:${env.PORT}`);
  });
}

bootstrap().catch((err) => {
  logger.error('Failed to start server', err);
  process.exit(1);
});
