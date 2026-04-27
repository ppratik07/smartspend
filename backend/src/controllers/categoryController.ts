import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';

export async function getCategories(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.user!.userId;
  const categories = await prisma.category.findMany({
    where: { OR: [{ userId: null }, { userId }] },
    orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
  });
  res.json(categories);
}

export async function createCategory(req: AuthRequest, res: Response): Promise<void> {
  const { name, icon, color } = req.body;
  const category = await prisma.category.create({
    data: { name, icon, color, isDefault: false, userId: req.user!.userId },
  });
  res.status(201).json(category);
}

export async function updateCategory(req: AuthRequest, res: Response): Promise<void> {
  const id = req.params.id as string;
  const category = await prisma.category.findFirst({
    where: { id, userId: req.user!.userId },
  });
  if (!category) {
    res.status(404).json({ error: 'Not Found', message: 'Category not found or is a system default' });
    return;
  }
  const updated = await prisma.category.update({
    where: { id },
    data: { name: req.body.name, icon: req.body.icon, color: req.body.color },
  });
  res.json(updated);
}

export async function deleteCategory(req: AuthRequest, res: Response): Promise<void> {
  const id = req.params.id as string;
  const category = await prisma.category.findFirst({
    where: { id, userId: req.user!.userId },
  });
  if (!category) {
    res.status(404).json({ error: 'Not Found', message: 'Category not found or is a system default' });
    return;
  }
  const txCount = await prisma.transaction.count({ where: { categoryId: id } });
  if (txCount > 0) {
    res.status(409).json({ error: 'Conflict', message: 'Cannot delete category with existing transactions' });
    return;
  }
  await prisma.category.delete({ where: { id } });
  res.json({ message: 'Category deleted' });
}
