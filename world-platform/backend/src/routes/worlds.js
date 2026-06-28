import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Globe data — all public worlds with position
router.get('/globe', async (req, res, next) => {
  try {
    const worlds = await prisma.world.findMany({
      where: { isPublic: true },
      select: { id: true, name: true, description: true, thumbnailUrl: true, globePosition: true, globeColor: true, worldCapacity: true, visibility: true, _count: { select: { members: true } } },
    });
    res.json(worlds);
  } catch (err) { next(err); }
});

router.get('/search', authenticate, async (req, res, next) => {
  try {
    const { q } = req.query;
    const worlds = await prisma.world.findMany({
      where: { isPublic: true, ...(q && { OR: [{ name: { contains: q, mode: 'insensitive' } }, { description: { contains: q, mode: 'insensitive' } }] }) },
      take: 20,
      select: { id: true, name: true, description: true, thumbnailUrl: true, globeColor: true, _count: { select: { members: true } } },
    });
    res.json(worlds);
  } catch (err) { next(err); }
});

router.get('/', authenticate, async (req, res, next) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    const skip = (page - 1) * limit;
    const [worlds, total] = await Promise.all([
      prisma.world.findMany({ where: { isPublic: true }, skip: +skip, take: +limit, orderBy: { createdAt: 'desc' }, select: { id: true, name: true, description: true, thumbnailUrl: true, globeColor: true, createdAt: true, _count: { select: { members: true } } } }),
      prisma.world.count({ where: { isPublic: true } }),
    ]);
    res.json({ worlds, total, page: +page, limit: +limit });
  } catch (err) { next(err); }
});

router.post('/', authenticate, async (req, res, next) => {
  try {
    const { name, description, globePosition, globeColor, visibility } = req.body;
    const world = await prisma.world.create({
      data: {
        ownerId: req.user.id, name, description, globePosition, globeColor: globeColor || '#6366f1',
        visibility: visibility || 'public', isPublic: visibility !== 'private',
        worldDesign: { floors: [{ floorNumber: 1, floorName: 'Fire', gridWidth: 100, gridHeight: 100, rooms: [], furniture: [] }] },
      },
    });
    // Add owner as member with owner role
    const ownerRole = await prisma.role.create({
      data: { worldId: world.id, roleName: 'Owner', isDefault: false, permissions: { all: true } },
    });
    await prisma.worldMember.create({ data: { userId: req.user.id, worldId: world.id, roleId: ownerRole.id } });
    res.status(201).json(world);
  } catch (err) { next(err); }
});

router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const world = await prisma.world.findUnique({
      where: { id: req.params.id },
      include: { owner: { select: { id: true, username: true } }, _count: { select: { members: true } } },
    });
    if (!world) return res.status(404).json({ error: 'World not found' });
    res.json(world);
  } catch (err) { next(err); }
});

router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const world = await prisma.world.findFirst({ where: { id: req.params.id, ownerId: req.user.id } });
    if (!world) return res.status(403).json({ error: 'Not the world owner' });
    const updated = await prisma.world.update({ where: { id: req.params.id }, data: req.body });
    res.json(updated);
  } catch (err) { next(err); }
});

router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const world = await prisma.world.findFirst({ where: { id: req.params.id, ownerId: req.user.id } });
    if (!world) return res.status(403).json({ error: 'Not the world owner' });
    await prisma.world.delete({ where: { id: req.params.id } });
    res.json({ message: 'World deleted' });
  } catch (err) { next(err); }
});

router.get('/:id/members', authenticate, async (req, res, next) => {
  try {
    const members = await prisma.worldMember.findMany({
      where: { worldId: req.params.id },
      include: { user: { select: { id: true, username: true, profilePictureUrl: true } }, role: { select: { roleName: true } } },
    });
    res.json(members);
  } catch (err) { next(err); }
});

router.post('/:id/join', authenticate, async (req, res, next) => {
  try {
    const world = await prisma.world.findUnique({ where: { id: req.params.id } });
    if (!world) return res.status(404).json({ error: 'World not found' });
    if (world.visibility === 'private') return res.status(403).json({ error: 'World is private' });

    const existing = await prisma.worldMember.findUnique({ where: { userId_worldId: { userId: req.user.id, worldId: req.params.id } } });
    if (existing) return res.status(409).json({ error: 'Already a member' });

    let memberRole = await prisma.role.findFirst({ where: { worldId: req.params.id, isDefault: true } });
    if (!memberRole) {
      memberRole = await prisma.role.create({ data: { worldId: req.params.id, roleName: 'Member', isDefault: true, permissions: {} } });
    }
    const member = await prisma.worldMember.create({ data: { userId: req.user.id, worldId: req.params.id, roleId: memberRole.id } });
    res.status(201).json(member);
  } catch (err) { next(err); }
});

router.post('/:id/leave', authenticate, async (req, res, next) => {
  try {
    await prisma.worldMember.delete({ where: { userId_worldId: { userId: req.user.id, worldId: req.params.id } } });
    res.json({ message: 'Left world' });
  } catch (err) { next(err); }
});

router.put('/:id/visibility', authenticate, async (req, res, next) => {
  try {
    const world = await prisma.world.findFirst({ where: { id: req.params.id, ownerId: req.user.id } });
    if (!world) return res.status(403).json({ error: 'Not the world owner' });
    const { visibility } = req.body;
    const updated = await prisma.world.update({ where: { id: req.params.id }, data: { visibility, isPublic: visibility !== 'private' } });
    res.json(updated);
  } catch (err) { next(err); }
});

router.post('/:worldId/enter', authenticate, async (req, res, next) => {
  try {
    const { avatarId } = req.body;
    const world = await prisma.world.findUnique({ where: { id: req.params.worldId }, select: { id: true } });
    if (!world) return res.status(404).json({ error: 'World not found' });

    const avatar = await prisma.avatar.findFirst({
      where: { id: avatarId, userId: req.user.id },
      select: { id: true },
    });
    if (!avatar) return res.status(403).json({ error: 'Avatar not found' });

    const sessionData = {
      avatarId,
      lastActivity: new Date(),
      positionX: 50,
      positionY: 50,
      floorNumber: 1,
    };

    const existingSession = await prisma.worldSession.findFirst({
      where: { userId: req.user.id, worldId: req.params.worldId },
      select: { id: true },
    });

    const session = existingSession
      ? await prisma.worldSession.update({ where: { id: existingSession.id }, data: sessionData })
      : await prisma.worldSession.create({
          data: { userId: req.user.id, worldId: req.params.worldId, ...sessionData },
        });
    res.json(session);
  } catch (err) { next(err); }
});

export default router;
