import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User from '../models/User.model';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../config/jwt';
import { sendEmail, emailTemplates } from '../config/nodemailer';
import { sendSuccess } from '../utils/response';
import { AppError } from '../middleware/error.middleware';
import { AuthRequest } from '../middleware/auth.middleware';

const ALLOWED_ROLES = ['USER', 'SELLER', 'SERVICE_PROVIDER'];

// ── Register ─────────────────────────────────────────────────────
export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, username, password, fullName, role } = req.body;

    const existing = await User.findOne({ $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }] });
    if (existing) throw new AppError('Email or username already taken', 409);

    const passwordHash = await bcrypt.hash(password, 12);
    const emailVerifyToken = crypto.randomBytes(32).toString('hex');
    const assignedRole = ALLOWED_ROLES.includes(role) ? role : 'USER';

    const user = await User.create({
      email: email.toLowerCase(),
      username: username.toLowerCase(),
      passwordHash,
      role: assignedRole,
      emailVerifyToken,
      profile: { fullName: fullName || username },
    });

    const verifyLink = `${process.env.FRONTEND_URL}/verify-email?token=${emailVerifyToken}`;
    await sendEmail({
      to: email,
      subject: 'Verify your LocalHub account',
      html: emailTemplates.verifyEmail(fullName || username, verifyLink),
    }).catch(() => {});

    const accessToken = signAccessToken({ userId: user._id.toString(), role: user.role });
    const refreshToken = signRefreshToken({ userId: user._id.toString(), role: user.role });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    sendSuccess(res, {
      accessToken,
      user: {
        id: user._id.toString(),
        email: user.email,
        username: user.username,
        role: user.role,
        profile: user.profile,
        isEmailVerified: user.isEmailVerified,
      },
    }, 'Registration successful. Please verify your email.', 201);
  } catch (err) {
    next(err);
  }
};

// ── Login ─────────────────────────────────────────────────────────
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) throw new AppError('Invalid credentials', 401);

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new AppError('Invalid credentials', 401);

    if (user.isSuspended) throw new AppError('Your account has been suspended. Contact support.', 403);

    user.lastSeen = new Date();
    user.isOnline = true;
    await user.save();

    const accessToken = signAccessToken({ userId: user._id.toString(), role: user.role });
    const refreshToken = signRefreshToken({ userId: user._id.toString(), role: user.role });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    sendSuccess(res, {
      accessToken,
      user: {
        id: user._id.toString(),
        email: user.email,
        username: user.username,
        role: user.role,
        profile: user.profile,
        isEmailVerified: user.isEmailVerified,
      },
    }, 'Login successful');
  } catch (err) {
    next(err);
  }
};

// ── Refresh Token ─────────────────────────────────────────────────
export const refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) throw new AppError('No refresh token', 401);

    const payload = verifyRefreshToken(token);
    const user = await User.findById(payload.userId).lean();
    if (!user) throw new AppError('User not found', 401);

    const accessToken = signAccessToken({ userId: payload.userId, role: payload.role });
    sendSuccess(res, { accessToken });
  } catch (err) {
    next(err);
  }
};

// ── Logout ────────────────────────────────────────────────────────
export const logout = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (req.user) {
      await User.findByIdAndUpdate(req.user.userId, { isOnline: false, lastSeen: new Date() });
    }
    res.clearCookie('refreshToken');
    sendSuccess(res, null, 'Logged out successfully');
  } catch (err) {
    next(err);
  }
};

// ── Verify Email ──────────────────────────────────────────────────
export const verifyEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { token } = req.query;
    const user = await User.findOne({ emailVerifyToken: token as string });
    if (!user) throw new AppError('Invalid or expired verification token', 400);

    user.isEmailVerified = true;
    user.emailVerifyToken = undefined;
    await user.save();

    sendSuccess(res, null, 'Email verified successfully');
  } catch (err) {
    next(err);
  }
};

// ── Forgot Password ───────────────────────────────────────────────
export const forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpiry = new Date(Date.now() + 60 * 60 * 1000);
      await user.save();

      const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
      await sendEmail({
        to: email,
        subject: 'Reset your LocalHub password',
        html: emailTemplates.forgotPassword(user.profile.fullName, resetLink),
      }).catch(() => {});
    }

    // Always return success to prevent email enumeration
    sendSuccess(res, null, 'If that email exists, a reset link has been sent.');
  } catch (err) {
    next(err);
  }
};

// ── Reset Password ────────────────────────────────────────────────
export const resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { token, password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiry: { $gt: new Date() },
    });
    if (!user) throw new AppError('Invalid or expired reset token', 400);

    user.passwordHash = await bcrypt.hash(password, 12);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save();

    sendSuccess(res, null, 'Password reset successfully');
  } catch (err) {
    next(err);
  }
};

// ── Get Me ────────────────────────────────────────────────────────
export const getMe = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.user!.userId).lean();
    if (!user) throw new AppError('User not found', 404);
    sendSuccess(res, {
      id: (user._id as { toString(): string }).toString(),
      email: user.email,
      username: user.username,
      role: user.role,
      profile: user.profile,
      viewsCount: user.viewsCount || 0,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
    });
  } catch (err) {
    next(err);
  }
};
