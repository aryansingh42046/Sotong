import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, async (req, res, next) => {
  try {
    const avatars = await prisma.avatar.findMany({ where: { userId: req.user.id } });
    res.json(avatars);
  } catch (err) { next(err); }
});

router.post('/', authenticate, async (req, res, next) => {
  try {
    const { name, gender, skinTone, hairStyle, hairColor, facialFeatures, clothing, accessories } = req.body;
    const avatar = await prisma.avatar.create({
      data: { userId: req.user.id, name, gender, skinTone, hairStyle, hairColor, facialFeatures, clothing, accessories },
    });
    res.status(201).json(avatar);
  } catch (err) { next(err); }
});

router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const avatar = await prisma.avatar.findFirst({ where: { id: req.params.id, userId: req.user.id } });
    if (!avatar) return res.status(404).json({ error: 'Avatar not found' });
    const updated = await prisma.avatar.update({ where: { id: req.params.id }, data: req.body });
    res.json(updated);
  } catch (err) { next(err); }
});

router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const avatar = await prisma.avatar.findFirst({ where: { id: req.params.id, userId: req.user.id } });
    if (!avatar) return res.status(404).json({ error: 'Avatar not found' });
    await prisma.avatar.delete({ where: { id: req.params.id } });
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
});

router.post('/:id/set-default', authenticate, async (req, res, next) => {
  try {
    await prisma.avatar.updateMany({ where: { userId: req.user.id }, data: { isDefault: false } });
    await prisma.avatar.update({ where: { id: req.params.id }, data: { isDefault: true } });
    await prisma.user.update({ where: { id: req.user.id }, data: { defaultAvatarId: req.params.id } });
    res.json({ message: 'Default avatar set' });
  } catch (err) { next(err); }
});

export default router;
