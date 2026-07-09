import { Response, NextFunction } from 'express';
import Notification from '../models/Notification.model';
import { sendSuccess, getPagination, buildPaginationMeta } from '../utils/response';
import { AppError } from '../middleware/error.middleware';
import { AuthRequest } from '../middleware/auth.middleware';

// ── List Notifications ────────────────────────────────────────────
export const listNotifications = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page, limit } = req.query;
    const { page: p, limit: l, skip } = getPagination(page as string, limit as string);

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find({ userId: req.user!.userId }).sort({ createdAt: -1 }).skip(skip).limit(l).lean(),
      Notification.countDocuments({ userId: req.user!.userId }),
      Notification.countDocuments({ userId: req.user!.userId, isRead: false }),
    ]);

    sendSuccess(res, {
      notifications: notifications.map(n => ({ ...n, id: (n._id as { toString(): string }).toString() })),
      unreadCount,
      ...buildPaginationMeta(total, p, l),
    });
  } catch (err) {
    next(err);
  }
};

export const getNotifications = listNotifications;

// ── Mark as Read ──────────────────────────────────────────────────
export const markAsRead = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    if (id === 'all') {
      await Notification.updateMany({ userId: req.user!.userId }, { isRead: true });
      sendSuccess(res, null, 'All notifications marked as read');
      return;
    }

    const notif = await Notification.findById(id);
    if (!notif) throw new AppError('Notification not found', 404);
    if (notif.userId.toString() !== req.user!.userId) throw new AppError('Not authorized', 403);

    notif.isRead = true;
    await notif.save();
    sendSuccess(res, { ...notif.toJSON(), id: notif._id.toString() }, 'Marked as read');
  } catch (err) {
    next(err);
  }
};

export const markRead = markAsRead;

export const markAllRead = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    await Notification.updateMany({ userId: req.user!.userId }, { isRead: true });
    sendSuccess(res, null, 'All notifications marked as read');
  } catch (err) {
    next(err);
  }
};

// ── Delete Notification ───────────────────────────────────────────
export const deleteNotification = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const notif = await Notification.findById(id);
    if (!notif) throw new AppError('Notification not found', 404);
    if (notif.userId.toString() !== req.user!.userId) throw new AppError('Not authorized', 403);

    await Notification.findByIdAndDelete(id);
    sendSuccess(res, null, 'Notification deleted');
  } catch (err) {
    next(err);
  }
};
