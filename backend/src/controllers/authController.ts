import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  getRefreshTokenExpiry,
} from '../services/tokenService';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';

export async function register(req: Request, res: Response): Promise<void> {
  const { name, email, password, currency = 'USD' } = req.body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    res.status(409).json({ error: 'Conflict', message: 'Email already registered' });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { name, email, passwordHash, currency },
  });

  // Create default "Main Savings" account
  await prisma.account.create({
    data: { name: 'Main Savings', type: 'SAVINGS', userId: user.id, currency },
  });

  const accessToken = signAccessToken({ userId: user.id, email: user.email });
  const refreshToken = signRefreshToken({ userId: user.id, email: user.email });
  await prisma.refreshToken.create({
    data: { token: refreshToken, userId: user.id, expiresAt: getRefreshTokenExpiry() },
  });

  res.status(201).json({
    accessToken,
    refreshToken,
    user: { id: user.id, name: user.name, email: user.email, currency: user.currency, theme: user.theme },
  });
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    res.status(401).json({ error: 'Unauthorized', message: 'Invalid credentials' });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: 'Unauthorized', message: 'Invalid credentials' });
    return;
  }

  const accessToken = signAccessToken({ userId: user.id, email: user.email });
  const refreshToken = signRefreshToken({ userId: user.id, email: user.email });
  await prisma.refreshToken.create({
    data: { token: refreshToken, userId: user.id, expiresAt: getRefreshTokenExpiry() },
  });

  res.json({
    accessToken,
    refreshToken,
    user: { id: user.id, name: user.name, email: user.email, currency: user.currency, theme: user.theme, avatarUrl: user.avatarUrl },
  });
}

export async function refresh(req: Request, res: Response): Promise<void> {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    res.status(400).json({ error: 'Bad Request', message: 'refreshToken is required' });
    return;
  }

  const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
  if (!stored || stored.expiresAt < new Date()) {
    res.status(401).json({ error: 'Unauthorized', message: 'Invalid or expired refresh token' });
    return;
  }

  try {
    const payload = verifyRefreshToken(refreshToken);
    // Rotate: delete old, create new
    await prisma.refreshToken.delete({ where: { token: refreshToken } });
    const newAccessToken = signAccessToken({ userId: payload.userId, email: payload.email });
    const newRefreshToken = signRefreshToken({ userId: payload.userId, email: payload.email });
    await prisma.refreshToken.create({
      data: { token: newRefreshToken, userId: payload.userId, expiresAt: getRefreshTokenExpiry() },
    });
    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch {
    await prisma.refreshToken.delete({ where: { token: refreshToken } }).catch(() => {});
    res.status(401).json({ error: 'Unauthorized', message: 'Token verification failed' });
  }
}

export async function logout(req: Request, res: Response): Promise<void> {
  const { refreshToken } = req.body;
  if (refreshToken) {
    await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
  }
  res.json({ message: 'Logged out successfully' });
}

export async function getMe(req: AuthRequest, res: Response): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    select: { id: true, name: true, email: true, currency: true, theme: true, avatarUrl: true, createdAt: true },
  });
  if (!user) {
    res.status(404).json({ error: 'Not Found', message: 'User not found' });
    return;
  }
  res.json(user);
}

export async function updateProfile(req: AuthRequest, res: Response): Promise<void> {
  const { name, currency, theme } = req.body;
  const user = await prisma.user.update({
    where: { id: req.user!.userId },
    data: { name, currency, theme },
    select: { id: true, name: true, email: true, currency: true, theme: true, avatarUrl: true },
  });
  res.json(user);
}
