import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';

export async function getGoals(req: AuthRequest, res: Response): Promise<void> {
  const goals = await prisma.goal.findMany({
    where: { userId: req.user!.userId },
    orderBy: { createdAt: 'desc' },
  });
  const enriched = goals.map((g) => ({
    ...g,
    progressPercent: g.targetAmount > 0 ? Math.min(100, Math.round((g.savedAmount / g.targetAmount) * 100)) : 0,
  }));
  res.json(enriched);
}

export async function createGoal(req: AuthRequest, res: Response): Promise<void> {
  const { name, targetAmount, currency, targetDate, icon, color } = req.body;
  const goal = await prisma.goal.create({
    data: {
      userId: req.user!.userId,
      name,
      targetAmount,
      currency: currency ?? 'USD',
      targetDate: targetDate ? new Date(targetDate) : null,
      icon: icon ?? 'star',
      color: color ?? '#2D6A4F',
    },
  });
  res.status(201).json(goal);
}

export async function updateGoal(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const goal = await prisma.goal.findFirst({ where: { id, userId: req.user!.userId } });
  if (!goal) {
    res.status(404).json({ error: 'Not Found', message: 'Goal not found' });
    return;
  }
  const { name, targetAmount, savedAmount, currency, targetDate, icon, color } = req.body;
  const updated = await prisma.goal.update({
    where: { id },
    data: { name, targetAmount, savedAmount, currency, targetDate: targetDate ? new Date(targetDate) : undefined, icon, color },
  });
  res.json({
    ...updated,
    progressPercent: updated.targetAmount > 0 ? Math.min(100, Math.round((updated.savedAmount / updated.targetAmount) * 100)) : 0,
  });
}

export async function deleteGoal(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const goal = await prisma.goal.findFirst({ where: { id, userId: req.user!.userId } });
  if (!goal) {
    res.status(404).json({ error: 'Not Found', message: 'Goal not found' });
    return;
  }
  await prisma.goal.delete({ where: { id } });
  res.json({ message: 'Goal deleted' });
}
