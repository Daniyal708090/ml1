import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '../lib/prisma';
import { env } from '../config/env';
import type { AuthPayload } from '../middleware/auth';

const SALT_ROUNDS = 12;

export async function registerUser(data: {
  email: string;
  password: string;
  name: string;
}) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw new Error('Email already registered');

  const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: {
      email: data.email,
      passwordHash,
      name: data.name,
      analytics: { create: {} },
    },
    select: { id: true, email: true, name: true, preferredTrack: true, targetLevel: true },
  });

  return createTokens(user.id, user.email);
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('Invalid credentials');

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new Error('Invalid credentials');

  return createTokens(user.id, user.email);
}

async function createTokens(userId: string, email: string) {
  const payload: AuthPayload = { userId, email };
  const accessToken = jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] });

  const refreshToken = crypto.randomBytes(48).toString('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + env.REFRESH_TOKEN_EXPIRES_DAYS);

  await prisma.session.create({
    data: { userId, refreshToken, expiresAt },
  });

  return { accessToken, refreshToken, userId, email };
}

export async function refreshAccessToken(refreshToken: string) {
  const session = await prisma.session.findUnique({
    where: { refreshToken },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    throw new Error('Invalid refresh token');
  }

  const payload: AuthPayload = { userId: session.userId, email: session.user.email };
  const accessToken = jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] });
  return { accessToken };
}

export async function logoutUser(refreshToken: string) {
  await prisma.session.deleteMany({ where: { refreshToken } });
}
