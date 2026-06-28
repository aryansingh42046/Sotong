import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/', authenticate, async (req, res, next) => {
  try {
    const { reportedUserId, reportedMessageId, worldId, reason } = req.body;
    const report = await prisma.report.create({
      data: { reporterId: req.user.id, reportedUserId, reportedMessageId, worldId, reason },
    });
    res.status(201).json(report);
  } catch (err) { next(err); }
});

export default router;
