import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';

type Period = 'weekly' | 'monthly' | 'yearly';

function getDateRange(period: Period): { start: Date; end: Date } {
  const now = new Date();
  if (period === 'weekly') {
    const day = now.getDay();
    const start = new Date(now);
    start.setDate(now.getDate() - day);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  } else if (period === 'monthly') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    return { start, end };
  } else {
    const start = new Date(now.getFullYear(), 0, 1);
    const end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
    return { start, end };
  }
}

export async function getSummary(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.user!.userId;
  const period = (req.query.period as Period) || 'monthly';
  const { start, end } = getDateRange(period);

  const [incomeAgg, expenseAgg] = await Promise.all([
    prisma.transaction.aggregate({
      where: { userId, type: 'INCOME', date: { gte: start, lte: end } },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { userId, type: 'EXPENSE', date: { gte: start, lte: end } },
      _sum: { amount: true },
    }),
  ]);

  const totalIncome = incomeAgg._sum.amount ?? 0;
  const totalExpenses = expenseAgg._sum.amount ?? 0;
  const totalSavings = totalIncome - totalExpenses;
  const efficiencyScore =
    totalIncome > 0 ? Math.min(100, Math.round((totalSavings / totalIncome) * 100)) : 0;

  // Compare to previous period savings
  const periodMs = end.getTime() - start.getTime();
  const prevStart = new Date(start.getTime() - periodMs);
  const prevEnd = new Date(start.getTime() - 1);

  const [prevIncome, prevExpense] = await Promise.all([
    prisma.transaction.aggregate({
      where: { userId, type: 'INCOME', date: { gte: prevStart, lte: prevEnd } },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { userId, type: 'EXPENSE', date: { gte: prevStart, lte: prevEnd } },
      _sum: { amount: true },
    }),
  ]);

  const prevSavings = (prevIncome._sum.amount ?? 0) - (prevExpense._sum.amount ?? 0);
  const savingsChange =
    prevSavings !== 0 ? Math.round(((totalSavings - prevSavings) / Math.abs(prevSavings)) * 100) : 0;

  res.json({
    period,
    totalIncome,
    totalExpenses,
    totalSavings,
    efficiencyScore,
    savingsChangePercent: savingsChange,
  });
}

export async function getTrend(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.user!.userId;
  const period = (req.query.period as Period) || 'weekly';
  const { start, end } = getDateRange(period);

  const transactions = await prisma.transaction.findMany({
    where: { userId, type: 'EXPENSE', date: { gte: start, lte: end } },
    select: { amount: true, date: true },
  });

  // Group by day label
  const buckets: Record<string, number> = {};

  if (period === 'weekly') {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    days.forEach((d) => (buckets[d] = 0));
    transactions.forEach((t) => {
      const label = days[new Date(t.date).getDay()];
      buckets[label] = (buckets[label] ?? 0) + t.amount;
    });
  } else if (period === 'monthly') {
    // Group by week number in month
    for (let w = 1; w <= 5; w++) buckets[`W${w}`] = 0;
    transactions.forEach((t) => {
      const d = new Date(t.date).getDate();
      const week = Math.ceil(d / 7);
      const label = `W${week}`;
      buckets[label] = (buckets[label] ?? 0) + t.amount;
    });
  } else {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    months.forEach((m) => (buckets[m] = 0));
    transactions.forEach((t) => {
      const label = months[new Date(t.date).getMonth()];
      buckets[label] = (buckets[label] ?? 0) + t.amount;
    });
  }

  const data = Object.entries(buckets).map(([label, amount]) => ({ label, amount }));
  res.json({ period, data });
}

export async function getCategoryBreakdown(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.user!.userId;
  const period = (req.query.period as Period) || 'monthly';
  const { start, end } = getDateRange(period);

  const result = await prisma.transaction.groupBy({
    by: ['categoryId'],
    where: { userId, type: 'EXPENSE', date: { gte: start, lte: end } },
    _sum: { amount: true },
    orderBy: { _sum: { amount: 'desc' } },
  });

  const totalSpend = result.reduce((acc, r) => acc + (r._sum.amount ?? 0), 0);

  const categories = await prisma.category.findMany({
    where: { id: { in: result.map((r) => r.categoryId) } },
  });

  const catMap = new Map(categories.map((c) => [c.id, c]));

  const data = result.map((r) => {
    const cat = catMap.get(r.categoryId);
    const amount = r._sum.amount ?? 0;
    return {
      categoryId: r.categoryId,
      category: cat,
      amount,
      percentOfTotal: totalSpend > 0 ? Math.round((amount / totalSpend) * 100) : 0,
    };
  });

  res.json({ period, totalSpend, data });
}
