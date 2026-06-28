import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import { sendVerificationEmail } from './emailService.js';

export const registerUser = async ({ email, username, password }) => {
  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });
  if (existing) {
    throw Object.assign(new Error(existing.email === email ? 'Email already in use' : 'Username taken'), { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { email, username, passwordHash },
    select: { id: true, email: true, username: true },
  });

  const verifyToken = jwt.sign({ userId: user.id, purpose: 'email-verify' }, process.env.JWT_SECRET, { expiresIn: '24h' });

  try {
    await sendVerificationEmail(email, verifyToken);
  } catch (error) {
    if (process.env.NODE_ENV === 'production') {
      throw Object.assign(new Error('Account created, but verification email failed to send'), { status: 502 });
    }
    console.error('Verification email failed in non-production mode:', error?.message || error);
  }

  return user;
};

export const loginUser = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user?.passwordHash) throw Object.assign(new Error('Invalid credentials'), { status: 401 });

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw Object.assign(new Error('Invalid credentials'), { status: 401 });

  return generateTokens(user);
};

export const verifyEmail = async (token) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (decoded.purpose !== 'email-verify') throw new Error('Invalid token');

  await prisma.user.update({
    where: { id: decoded.userId },
    data: { emailVerified: true },
  });
};

export const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );
  const refreshToken = jwt.sign(
    { userId: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
  return { accessToken, refreshToken, user: { id: user.id, email: user.email, username: user.username } };
};

export const refreshAccessToken = async (refreshToken) => {
  const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
  if (!user) throw Object.assign(new Error('User not found'), { status: 401 });
  return generateTokens(user);
};
