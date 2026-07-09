import { Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.model';
import cloudinary from '../config/cloudinary';
import { sendSuccess, getPagination, buildPaginationMeta } from '../utils/response';
import { AppError } from '../middleware/error.middleware';
import { AuthRequest } from '../middleware/auth.middleware';

import Product from '../models/Product.model';
import Service from '../models/Service.model';
import Category from '../models/Category.model';

// ── Get Public Profile ────────────────────────────────────────────
export const getPublicProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username: (username as string).toLowerCase() });
    if (!user) throw new AppError('User not found', 404);

    // Increment views if viewer is not the profile owner
    if (!req.user || req.user.userId !== user._id.toString()) {
      user.viewsCount = (user.viewsCount || 0) + 1;
      await user.save();
    }

    const userObj = user.toJSON();

    // Fetch active products and services belonging to this user
    const [products, services] = await Promise.all([
      Product.find({ sellerId: user._id, status: 'ACTIVE' }).populate('category', 'name slug').lean(),
      Service.find({ providerId: user._id, status: 'ACTIVE' }).populate('category', 'name slug').lean(),
    ]);

    sendSuccess(res, {
      ...userObj,
      id: user._id.toString(),
      products: products.map(p => ({ ...p, id: p._id.toString() })),
      services: services.map(s => ({ ...s, id: s._id.toString() })),
    });
  } catch (err) {
    next(err);
  }
};

// ── Update Profile ────────────────────────────────────────────────
export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { fullName, bio, phone, address, city, country, skills, portfolioLinks, socialLinks } = req.body;
    const file = req.file as (Express.Multer.File & { path: string; filename: string }) | undefined;

    const update: Record<string, unknown> = {};
    if (fullName !== undefined) update['profile.fullName'] = fullName;
    if (bio !== undefined) update['profile.bio'] = bio;
    if (phone !== undefined) update['profile.phone'] = phone;
    if (address !== undefined) update['profile.address'] = address;
    if (city !== undefined) update['profile.city'] = city;
    if (country !== undefined) update['profile.country'] = country;
    if (skills !== undefined) update['profile.skills'] = typeof skills === 'string' ? JSON.parse(skills) : skills;
    if (portfolioLinks !== undefined) update['profile.portfolioLinks'] = typeof portfolioLinks === 'string' ? JSON.parse(portfolioLinks) : portfolioLinks;
    if (socialLinks !== undefined) update['profile.socialLinks'] = typeof socialLinks === 'string' ? JSON.parse(socialLinks) : socialLinks;

    if (file) {
      update['profile.avatarUrl'] = file.path;
    }

    const user = await User.findByIdAndUpdate(
      req.user!.userId,
      { $set: update },
      { new: true, select: '-passwordHash -emailVerifyToken -resetPasswordToken -resetPasswordExpiry' }
    ).lean();

    if (!user) throw new AppError('User not found', 404);
    sendSuccess(res, { ...user, id: (user._id as { toString(): string }).toString() }, 'Profile updated');
  } catch (err) {
    next(err);
  }
};

// ── Change Password ───────────────────────────────────────────────
export const changePassword = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user!.userId);
    if (!user) throw new AppError('User not found', 404);

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) throw new AppError('Current password is incorrect', 400);

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    await user.save();

    sendSuccess(res, null, 'Password changed successfully');
  } catch (err) {
    next(err);
  }
};

// ── Get All Users (Admin) ─────────────────────────────────────────
export const getAllUsers = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page, limit, search, role } = req.query;
    const { page: p, limit: l, skip } = getPagination(page as string, limit as string);

    const query: Record<string, unknown> = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { 'profile.fullName': { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(query).select('-passwordHash -emailVerifyToken -resetPasswordToken').skip(skip).limit(l).lean(),
      User.countDocuments(query),
    ]);

    sendSuccess(res, { users: users.map(u => ({ ...u, id: (u._id as { toString(): string }).toString() })), ...buildPaginationMeta(total, p, l) });
  } catch (err) {
    next(err);
  }
};

// ── Delete Account ────────────────────────────────────────────────
export const deleteAccount = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { password } = req.body;
    const user = await User.findById(req.user!.userId);
    if (!user) throw new AppError('User not found', 404);

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new AppError('Incorrect password', 400);

    if (user.profile.avatarUrl) {
      const publicId = user.profile.avatarUrl.split('/').pop()?.split('.')[0];
      if (publicId) await cloudinary.uploader.destroy(`localhub/avatars/${publicId}`).catch(() => {});
    }

    await User.findByIdAndDelete(req.user!.userId);
    res.clearCookie('refreshToken');
    sendSuccess(res, null, 'Account deleted');
  } catch (err) {
    next(err);
  }
};

// ── Upload Avatar ──────────────────────────────────────────────────
export const uploadAvatar = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const file = req.file as (Express.Multer.File & { path: string }) | undefined;
    if (!file) throw new AppError('No avatar file provided', 400);

    const user = await User.findById(req.user!.userId);
    if (!user) throw new AppError('User not found', 404);

    if (user.profile.avatarUrl) {
      const publicId = user.profile.avatarUrl.split('/').pop()?.split('.')[0];
      if (publicId) await cloudinary.uploader.destroy(`localhub/avatars/${publicId}`).catch(() => {});
    }

    user.profile.avatarUrl = file.path;
    await user.save();

    sendSuccess(res, { avatarUrl: file.path }, 'Avatar uploaded successfully');
  } catch (err) {
    next(err);
  }
};

// ── Update Role ───────────────────────────────────────────────────
export const updateRole = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { role } = req.body;
    if (!['USER', 'SELLER', 'SERVICE_PROVIDER'].includes(role)) {
      throw new AppError('Invalid role', 400);
    }

    const user = await User.findByIdAndUpdate(
      req.user!.userId,
      { role },
      { new: true, select: '-passwordHash -emailVerifyToken -resetPasswordToken' }
    ).lean();

    if (!user) throw new AppError('User not found', 404);
    sendSuccess(res, { ...user, id: (user._id as { toString(): string }).toString() }, 'Role updated successfully');
  } catch (err) {
    next(err);
  }
};

// ── Toggle Suspend (Admin) ────────────────────────────────────────
export const toggleSuspend = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { suspend, reason } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { isSuspended: suspend, suspendReason: reason || null },
      { new: true, select: '-passwordHash -emailVerifyToken -resetPasswordToken' }
    ).lean();

    if (!user) throw new AppError('User not found', 404);
    sendSuccess(res, { ...user, id: (user._id as { toString(): string }).toString() }, `User status updated successfully`);
  } catch (err) {
    next(err);
  }
};

