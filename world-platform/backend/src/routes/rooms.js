import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';

const router = Router({ mergeParams: true });

router.get('/', authenticate, async (req, res, next) => {
  try {
    const rooms = await prisma.room.findMany({ where: { worldId: req.params.worldId } });
    res.json(rooms);
  } catch (err) { next(err); }
});

router.post('/', authenticate, async (req, res, next) => {
  try {
    const world = await prisma.world.findFirst({ where: { id: req.params.worldId, ownerId: req.user.id } });
    if (!world) return res.status(403).json({ error: 'Forbidden' });
    const room = await prisma.room.create({ data: { worldId: req.params.worldId, ...req.body } });
    res.status(201).json(room);
  } catch (err) { next(err); }
});

router.put('/:roomId', authenticate, async (req, res, next) => {
  try {
    const world = await prisma.world.findFirst({ where: { id: req.params.worldId, ownerId: req.user.id } });
    if (!world) return res.status(403).json({ error: 'Forbidden' });
    const room = await prisma.room.update({ where: { id: req.params.roomId }, data: req.body });
    res.json(room);
  } catch (err) { next(err); }
});

router.delete('/:roomId', authenticate, async (req, res, next) => {
  try {
    const world = await prisma.world.findFirst({ where: { id: req.params.worldId, ownerId: req.user.id } });
    if (!world) return res.status(403).json({ error: 'Forbidden' });
    await prisma.room.delete({ where: { id: req.params.roomId } });
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
});

router.post('/:roomId/lock', authenticate, async (req, res, next) => {
  try {
    const room = await prisma.room.update({ where: { id: req.params.roomId }, data: { isLocked: req.body.locked ?? true } });
    res.json(room);
  } catch (err) { next(err); }
});

export default router;
