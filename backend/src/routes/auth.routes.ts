import { Router } from 'express';
import { z } from 'zod';
import { loginUser, logoutUser, refreshAccessToken, registerUser } from '../services/auth.service';

export const authRouter = Router();

authRouter.post('/register', async (req, res, next) => {
  try {
    const body = z
      .object({
        email: z.string().email(),
        password: z.string().min(8),
        name: z.string().min(2),
      })
      .parse(req.body);
    const tokens = await registerUser(body);
    res.status(201).json(tokens);
  } catch (e) {
    next(e);
  }
});

authRouter.post('/login', async (req, res, next) => {
  try {
    const body = z.object({ email: z.string().email(), password: z.string() }).parse(req.body);
    const tokens = await loginUser(body.email, body.password);
    res.json(tokens);
  } catch (e) {
    next(e);
  }
});

authRouter.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = z.object({ refreshToken: z.string() }).parse(req.body);
    const tokens = await refreshAccessToken(refreshToken);
    res.json(tokens);
  } catch (e) {
    next(e);
  }
});

authRouter.post('/logout', async (req, res, next) => {
  try {
    const { refreshToken } = z.object({ refreshToken: z.string() }).parse(req.body);
    await logoutUser(refreshToken);
    res.json({ success: true });
  } catch (e) {
    next(e);
  }
});
