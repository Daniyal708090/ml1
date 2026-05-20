import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import type { AuthPayload } from '../middleware/auth';
import { streamInterviewerReply } from '../services/ai-engine.service';
import { prisma } from '../lib/prisma';

export function registerChatHandlers(io: Server): void {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) {
      next(new Error('Unauthorized'));
      return;
    }
    try {
      const payload = jwt.verify(token, env.JWT_SECRET) as AuthPayload;
      socket.data.user = payload;
      next();
    } catch {
      next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const user = socket.data.user as AuthPayload;

    socket.on('join-interview', (interviewId: string) => {
      socket.join(`interview:${interviewId}`);
    });

    socket.on('chat-message', async (payload: { interviewId: string; content: string }) => {
      const interview = await prisma.interview.findFirst({
        where: { id: payload.interviewId, userId: user.userId },
      });
      if (!interview) return;

      await prisma.chatMessage.create({
        data: { interviewId: payload.interviewId, role: 'user', content: payload.content },
      });

      const history = await prisma.chatMessage.findMany({
        where: { interviewId: payload.interviewId },
        orderBy: { createdAt: 'asc' },
        take: 20,
      });

      const messages = history.map((m) => ({
        role: m.role as 'user' | 'assistant' | 'system',
        content: m.content,
      }));

      socket.to(`interview:${payload.interviewId}`).emit('typing', true);

      let full = '';
      await streamInterviewerReply(messages, (chunk) => {
        full += chunk;
        socket.emit('chat-chunk', { chunk });
      });

      await prisma.chatMessage.create({
        data: { interviewId: payload.interviewId, role: 'assistant', content: full },
      });

      io.to(`interview:${payload.interviewId}`).emit('typing', false);
      io.to(`interview:${payload.interviewId}`).emit('chat-complete', { content: full });
    });
  });
}
