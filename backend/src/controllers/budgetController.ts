import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

function currentMonthYear() {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
}

export async function getBudgets(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.user!.userId;
  const { month, year } = req.query as Record<string, string>;
  const m = month ? parseInt(month) : currentMonthYear().month;
  const y = year ? parseInt(year) : currentMonthYear().year;

  const budgets = await prisma.budget.findMany({
    where: { userId, month: m, year: y },
    include: { category: true },
  });

  // Calculate current spend per category
  const start = new Date(y, m - 1, 1);
  const end = new Date(y, m, 0, 23, 59, 59);

  const enriched = await Promise.all(
    budgets.map(async (b) => {
      const spent = await prisma.transaction.aggregate({
        where: { userId, categoryId: b.categoryId, type: 'EXPENSE', date: { gte: start, lte: end } },
        _sum: { amount: true },
      });
      const spentAmount = spent._sum.amount ?? 0;
      return {
        ...b,
        spentAmount,
        remainingAmount: b.amount - spentAmount,
        percentUsed: b.amount > 0 ? Math.min(100, Math.round((spentAmount / b.amount) * 100)) : 0,
        isNearLimit: spentAmount >= b.amount * 0.8,
        isOverLimit: spentAmount > b.amount,
      };
    })
  );

  res.json(enriched);
}

export async function createBudget(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.user!.userId;
  const { categoryId, amount, period, month, year } = req.body;
  const m = month ?? currentMonthYear().month;
  const y = year ?? currentMonthYear().year;

  const budget = await prisma.budget.create({
    data: { categoryId, userId, amount, period: period ?? 'MONTHLY', month: m, year: y },
    include: { category: true },
  });
  res.status(201).json(budget);
}

export async function updateBudget(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const budget = await prisma.budget.findFirst({ where: { id, userId: req.user!.userId } });
  if (!budget) {
    res.status(404).json({ error: 'Not Found', message: 'Budget not found' });
    return;
  }
  const updated = await prisma.budget.update({
    where: { id },
    data: { amount: req.body.amount, period: req.body.period },
    include: { category: true },
  });
  res.json(updated);
}

export async function deleteBudget(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const budget = await prisma.budget.findFirst({ where: { id, userId: req.user!.userId } });
  if (!budget) {
    res.status(404).json({ error: 'Not Found', message: 'Budget not found' });
    return;
  }
  await prisma.budget.delete({ where: { id } });
  res.json({ message: 'Budget deleted' });
}

export async function checkBudgetAlerts(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.user!.userId;
  const { month, year } = currentMonthYear();
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);

  const budgets = await prisma.budget.findMany({
    where: { userId, month, year },
    include: { category: true },
  });

  const alerts = await Promise.all(
    budgets.map(async (b) => {
      const spent = await prisma.transaction.aggregate({
        where: { userId, categoryId: b.categoryId, type: 'EXPENSE', date: { gte: start, lte: end } },
        _sum: { amount: true },
      });
      const spentAmount = spent._sum.amount ?? 0;
      const percent = b.amount > 0 ? (spentAmount / b.amount) * 100 : 0;
      return {
        budget: b,
        spentAmount,
        percent: Math.round(percent),
        isNearLimit: percent >= 80 && percent < 100,
        isOverLimit: percent >= 100,
      };
    })
  );

  const triggered = alerts.filter((a) => a.isNearLimit || a.isOverLimit);
  res.json(triggered);
}
