import { Router } from 'express';
import { z } from 'zod';
import * as authService from '../services/authService.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post('/register', async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);
    const user = await authService.registerUser(data);
    res.status(201).json({ message: 'Registration successful. Check your email to verify.', user });
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ error: err.errors });
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);
    const tokens = await authService.loginUser(data);
    res.json(tokens);
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ error: err.errors });
    next(err);
  }
});

router.post('/verify-email', async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'Token required' });
    await authService.verifyEmail(token);
    res.json({ message: 'Email verified successfully' });
  } catch (err) {
    next(err);
  }
});

router.post('/refresh-token', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ error: 'Refresh token required' });
    const tokens = await authService.refreshAccessToken(refreshToken);
    res.json(tokens);
  } catch (err) {
    next(err);
  }
});

router.get('/verify', authenticate, (req, res) => {
  res.json({ user: req.user });
});

router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out' });
});

export default router;
