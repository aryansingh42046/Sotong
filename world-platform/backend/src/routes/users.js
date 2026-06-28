import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, username: true, bio: true, profilePictureUrl: true, defaultAvatarId: true, emailVerified: true, createdAt: true },
    });
    res.json(user);
  } catch (err) { next(err); }
});

router.get('/search', authenticate, async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);
    const users = await prisma.user.findMany({
      where: { OR: [{ username: { contains: q, mode: 'insensitive' } }, { email: { contains: q, mode: 'insensitive' } }] },
      select: { id: true, username: true, profilePictureUrl: true },
      take: 20,
    });
    res.json(users);
  } catch (err) { next(err); }
});

router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: { id: true, username: true, bio: true, profilePictureUrl: true, createdAt: true },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) { next(err); }
});

router.put('/:id', authenticate, async (req, res, next) => {
  try {
    if (req.params.id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    const { bio, username } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { ...(bio !== undefined && { bio }), ...(username && { username }) },
      select: { id: true, email: true, username: true, bio: true },
    });
    res.json(user);
  } catch (err) { next(err); }
});

export default router;
