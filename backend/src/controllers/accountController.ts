import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export async function getAccounts(req: AuthRequest, res: Response): Promise<void> {
  const accounts = await prisma.account.findMany({
    where: { userId: req.user!.userId },
    orderBy: { createdAt: 'asc' },
  });
  res.json(accounts);
}

export async function createAccount(req: AuthRequest, res: Response): Promise<void> {
  const { name, type, currency } = req.body;
  const account = await prisma.account.create({
    data: { name, type, currency, userId: req.user!.userId },
  });
  res.status(201).json(account);
}

export async function updateAccount(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const account = await prisma.account.findFirst({ where: { id, userId: req.user!.userId } });
  if (!account) {
    res.status(404).json({ error: 'Not Found', message: 'Account not found' });
    return;
  }
  const updated = await prisma.account.update({
    where: { id },
    data: { name: req.body.name, type: req.body.type, currency: req.body.currency },
  });
  res.json(updated);
}

export async function deleteAccount(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const account = await prisma.account.findFirst({ where: { id, userId: req.user!.userId } });
  if (!account) {
    res.status(404).json({ error: 'Not Found', message: 'Account not found' });
    return;
  }
  await prisma.account.delete({ where: { id } });
  res.json({ message: 'Account deleted' });
}
