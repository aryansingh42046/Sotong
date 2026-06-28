import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

const friendshipWhere = (userId, otherId) => {
  const [a, b] = [userId, otherId].sort();
  return { userId1: a, userId2: b };
};

router.get('/', authenticate, async (req, res, next) => {
  try {
    const friends = await prisma.friendship.findMany({
      where: { OR: [{ userId1: req.user.id }, { userId2: req.user.id }], status: 'accepted' },
      include: { user1: { select: { id: true, username: true, profilePictureUrl: true } }, user2: { select: { id: true, username: true, profilePictureUrl: true } } },
    });
    res.json(friends.map(f => f.userId1 === req.user.id ? f.user2 : f.user1));
  } catch (err) { next(err); }
});

router.post('/request/:userId', authenticate, async (req, res, next) => {
  try {
    const [a, b] = [req.user.id, req.params.userId].sort();
    const existing = await prisma.friendship.findUnique({ where: { userId1_userId2: { userId1: a, userId2: b } } });
    if (existing) return res.status(409).json({ error: 'Already exists' });
    const friendship = await prisma.friendship.create({ data: { userId1: a, userId2: b, status: 'pending' } });
    res.status(201).json(friendship);
  } catch (err) { next(err); }
});

router.get('/requests', authenticate, async (req, res, next) => {
  try {
    const requests = await prisma.friendship.findMany({
      where: { userId2: req.user.id, status: 'pending' },
      include: { user1: { select: { id: true, username: true, profilePictureUrl: true } } },
    });
    res.json(requests);
  } catch (err) { next(err); }
});

router.post('/accept/:requestId', authenticate, async (req, res, next) => {
  try {
    const f = await prisma.friendship.findFirst({ where: { id: req.params.requestId, userId2: req.user.id, status: 'pending' } });
    if (!f) return res.status(404).json({ error: 'Request not found' });
    await prisma.friendship.update({ where: { id: req.params.requestId }, data: { status: 'accepted' } });
    res.json({ message: 'Accepted' });
  } catch (err) { next(err); }
});

router.post('/reject/:requestId', authenticate, async (req, res, next) => {
  try {
    await prisma.friendship.deleteMany({ where: { id: req.params.requestId, userId2: req.user.id } });
    res.json({ message: 'Rejected' });
  } catch (err) { next(err); }
});

router.delete('/:userId', authenticate, async (req, res, next) => {
  try {
    const [a, b] = [req.user.id, req.params.userId].sort();
    await prisma.friendship.deleteMany({ where: { userId1: a, userId2: b } });
    res.json({ message: 'Removed' });
  } catch (err) { next(err); }
});

router.post('/:userId/mute', authenticate, async (req, res, next) => {
  try {
    const [a, b] = [req.user.id, req.params.userId].sort();
    await prisma.friendship.update({ where: { userId1_userId2: { userId1: a, userId2: b } }, data: { isMuted: true } });
    res.json({ message: 'Muted' });
  } catch (err) { next(err); }
});

export default router;
