import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';

export async function getTransactions(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.user!.userId;
  const {
    page = '1',
    limit = '20',
    type,
    categoryId,
    accountId,
    from,
    to,
  } = req.query as Record<string, string>;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const where: Record<string, unknown> = { userId };

  if (type) where['type'] = type;
  if (categoryId) where['categoryId'] = categoryId;
  if (accountId) where['accountId'] = accountId;
  if (from || to) {
    where['date'] = {
      ...(from ? { gte: new Date(from) } : {}),
      ...(to ? { lte: new Date(to) } : {}),
    };
  }

  const [total, transactions] = await Promise.all([
    prisma.transaction.count({ where }),
    prisma.transaction.findMany({
      where,
      include: { category: true, account: { select: { id: true, name: true } } },
      orderBy: { date: 'desc' },
      skip,
      take: parseInt(limit),
    }),
  ]);

  res.json({ total, page: parseInt(page), limit: parseInt(limit), data: transactions });
}

export async function createTransaction(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.user!.userId;
  const { type, amount, currency, categoryId, accountId, date, notes, receiptUrl } = req.body;

  const account = await prisma.account.findFirst({ where: { id: accountId, userId } });
  if (!account) {
    res.status(404).json({ error: 'Not Found', message: 'Account not found' });
    return;
  }

  const [transaction] = await prisma.$transaction([
    prisma.transaction.create({
      data: {
        type,
        amount,
        currency: currency || account.currency,
        categoryId,
        accountId,
        userId,
        date: date ? new Date(date) : new Date(),
        notes,
        receiptUrl,
      },
      include: { category: true, account: { select: { id: true, name: true } } },
    }),
    prisma.account.update({
      where: { id: accountId },
      data: { balance: { increment: type === 'INCOME' ? amount : -amount } },
    }),
  ]);

  res.status(201).json(transaction);
}

export async function updateTransaction(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.user!.userId;
  const { id } = req.params;

  const existing = await prisma.transaction.findFirst({ where: { id, userId } });
  if (!existing) {
    res.status(404).json({ error: 'Not Found', message: 'Transaction not found' });
    return;
  }

  // Reverse old balance effect
  const oldEffect = existing.type === 'INCOME' ? -existing.amount : existing.amount;
  const { type, amount, currency, categoryId, date, notes } = req.body;

  // Apply new balance effect
  const newEffect = type === 'INCOME' ? amount : -amount;

  const [updated] = await prisma.$transaction([
    prisma.transaction.update({
      where: { id },
      data: { type, amount, currency, categoryId, date: date ? new Date(date) : undefined, notes },
      include: { category: true, account: { select: { id: true, name: true } } },
    }),
    prisma.account.update({
      where: { id: existing.accountId },
      data: { balance: { increment: oldEffect + newEffect } },
    }),
  ]);

  res.json(updated);
}

export async function deleteTransaction(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.user!.userId;
  const { id } = req.params;

  const existing = await prisma.transaction.findFirst({ where: { id, userId } });
  if (!existing) {
    res.status(404).json({ error: 'Not Found', message: 'Transaction not found' });
    return;
  }

  const reversal = existing.type === 'INCOME' ? -existing.amount : existing.amount;

  await prisma.$transaction([
    prisma.transaction.delete({ where: { id } }),
    prisma.account.update({
      where: { id: existing.accountId },
      data: { balance: { increment: reversal } },
    }),
  ]);

  res.json({ message: 'Transaction deleted' });
}
