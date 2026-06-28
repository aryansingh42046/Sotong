import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

const PROFANITY = ['spam', 'badword']; // extend as needed
const filterContent = (text) => {
  let filtered = text;
  PROFANITY.forEach(w => { filtered = filtered.replace(new RegExp(`\\b${w}\\b`, 'gi'), '***'); });
  return filtered;
};

router.get('/rooms/:roomId', authenticate, async (req, res, next) => {
  try {
    const { cursor, limit = 50 } = req.query;
    const messages = await prisma.message.findMany({
      where: { roomId: req.params.roomId, ...(cursor && { createdAt: { lt: new Date(cursor) } }) },
      orderBy: { createdAt: 'desc' },
      take: +limit,
      include: { user: { select: { id: true, username: true, profilePictureUrl: true } } },
    });
    res.json(messages.reverse());
  } catch (err) { next(err); }
});

router.post('/rooms/:roomId', authenticate, async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ error: 'Empty message' });
    const room = await prisma.room.findUnique({ where: { id: req.params.roomId }, include: { world: true } });
    if (!room) return res.status(404).json({ error: 'Room not found' });

    const filteredContent = filterContent(content);
    const isFiltered = filteredContent !== content;
    const retentionDays = room.world.messageRetentionDays;
    const expiresAt = new Date(Date.now() + retentionDays * 86400000);

    const message = await prisma.message.create({
      data: { userId: req.user.id, roomId: req.params.roomId, worldId: room.worldId, content: filteredContent, isFiltered, expiresAt },
      include: { user: { select: { id: true, username: true } } },
    });
    res.status(201).json(message);
  } catch (err) { next(err); }
});

router.delete('/:messageId', authenticate, async (req, res, next) => {
  try {
    const msg = await prisma.message.findUnique({
      where: { id: req.params.messageId },
      include: { room: { select: { worldId: true } } },
    });
    if (!msg) return res.status(404).json({ error: 'Message not found' });
    if (msg.userId !== req.user.id) {
      const worldId = msg.worldId || msg.room?.worldId;
      if (!worldId) return res.status(403).json({ error: 'Not allowed to delete this message' });

      const world = await prisma.world.findUnique({ where: { id: worldId }, select: { ownerId: true } });
      const membership = await prisma.worldMember.findUnique({
        where: { userId_worldId: { userId: req.user.id, worldId } },
        include: { role: { select: { permissions: true } } },
      });

      const isOwner = world?.ownerId === req.user.id;
      const hasAllPermissions = !!(membership?.role?.permissions && membership.role.permissions.all === true);
      if (!isOwner && !hasAllPermissions) return res.status(403).json({ error: 'Not allowed to delete this message' });
    }
    await prisma.message.delete({ where: { id: req.params.messageId } });
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
});

// DMs
router.get('/direct/:userId', authenticate, async (req, res, next) => {
  try {
    const messages = await prisma.directMessage.findMany({
      where: { OR: [{ senderId: req.user.id, recipientId: req.params.userId }, { senderId: req.params.userId, recipientId: req.user.id }] },
      orderBy: { createdAt: 'asc' },
      take: 100,
    });
    res.json(messages);
  } catch (err) { next(err); }
});

router.post('/direct/:userId', authenticate, async (req, res, next) => {
  try {
    const { content } = req.body;
    const dm = await prisma.directMessage.create({
      data: { senderId: req.user.id, recipientId: req.params.userId, content },
    });
    res.status(201).json(dm);
  } catch (err) { next(err); }
});

export default router;
