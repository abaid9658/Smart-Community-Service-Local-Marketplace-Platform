import { Response, NextFunction } from 'express';
import User from '../models/User.model';
import Product from '../models/Product.model';
import Service from '../models/Service.model';
import Booking from '../models/Booking.model';
import Report from '../models/Report.model';
import AdminLog from '../models/AdminLog.model';
import { sendSuccess, getPagination, buildPaginationMeta } from '../utils/response';
import { AppError } from '../middleware/error.middleware';
import { AuthRequest } from '../middleware/auth.middleware';

// ── Admin Dashboard Stats ─────────────────────────────────────────
export const getDashboardStats = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const [
      totalUsers, totalProducts, totalServices, totalBookings,
      pendingProducts, pendingServices, pendingReports,
      recentUsers, recentBookings, usersByRole, bookingsByStatus, monthlyUsers,
      revenueAgg, monthlyRevenueAgg,
    ] = await Promise.all([
      User.countDocuments({ role: { $nin: ['ADMIN', 'SUPER_ADMIN'] } }),
      Product.countDocuments(),
      Service.countDocuments(),
      Booking.countDocuments(),
      Product.countDocuments({ status: 'PENDING_APPROVAL' }),
      Service.countDocuments({ status: 'PENDING_APPROVAL' }),
      Report.countDocuments({ status: 'PENDING' }),
      User.find({ role: { $nin: ['ADMIN', 'SUPER_ADMIN'] } }).sort({ createdAt: -1 }).limit(5).select('-passwordHash -emailVerifyToken -resetPasswordToken').lean(),
      Booking.find().sort({ createdAt: -1 }).limit(5)
        .populate('service', 'title')
        .populate('client', 'username profile.fullName')
        .lean(),
      User.aggregate([
        { $match: { role: { $nin: ['ADMIN', 'SUPER_ADMIN'] } } },
        { $group: { _id: '$role', count: { $sum: 1 } } }
      ]),
      Booking.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      User.find({ role: { $nin: ['ADMIN', 'SUPER_ADMIN'] }, createdAt: { $gte: sixMonthsAgo } }).select('createdAt').lean(),
      // Total revenue from completed/paid bookings
      Booking.aggregate([
        { $match: { paymentStatus: { $in: ['COMPLETED', 'PAID'] } } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } },
      ]),
      // Monthly revenue for last 6 months
      Booking.aggregate([
        { $match: { paymentStatus: { $in: ['COMPLETED', 'PAID'] }, createdAt: { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
            revenue: { $sum: '$totalPrice' },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
    ]);

    const totalRevenue = revenueAgg[0]?.total || 0;
    const monthlyRevenue = monthlyRevenueAgg.map((m: any) => ({
      month: new Date(m._id.year, m._id.month - 1).toLocaleDateString('en', { month: 'short', year: '2-digit' }),
      revenue: m.revenue,
      bookings: m.count,
    }));

    sendSuccess(res, {
      totalUsers, totalProducts, totalServices, totalBookings,
      pendingApprovals: pendingProducts + pendingServices,
      pendingReports,
      totalRevenue,
      monthlyRevenue,
      recentUsers: recentUsers.map(u => ({ ...u, id: (u._id as { toString(): string }).toString() })),
      recentBookings: recentBookings.map(b => ({ ...b, id: (b._id as { toString(): string }).toString() })),
      usersByRole: usersByRole.map(r => ({ role: r._id, _count: { role: r.count } })),
      bookingsByStatus: bookingsByStatus.map(b => ({ status: b._id, _count: { status: b.count } })),
      monthlyUsers,
    });
  } catch (err) {
    next(err);
  }
};

// ── Suspend / Unsuspend User ──────────────────────────────────────
export const toggleUserSuspension = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { suspend, reason } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { isSuspended: suspend, suspendReason: reason || null },
      { new: true, select: '-passwordHash -emailVerifyToken -resetPasswordToken' }
    );
    if (!user) throw new AppError('User not found', 404);

    await AdminLog.create({
      adminId: req.user!.userId,
      action: suspend ? 'USER_SUSPENDED' : 'USER_UNSUSPENDED',
      targetType: 'user',
      targetId: id,
      note: reason,
    });

    sendSuccess(res, { ...user.toJSON(), id: user._id.toString() }, `User ${suspend ? 'suspended' : 'unsuspended'}`);
  } catch (err) {
    next(err);
  }
};

// ── Approve / Reject Listing ──────────────────────────────────────
export const updateListingStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { type, id } = req.params;
    const { status, reason } = req.body;

    let listing;
    if (type === 'product') {
      listing = await Product.findByIdAndUpdate(id, { status }, { new: true });
    } else if (type === 'service') {
      listing = await Service.findByIdAndUpdate(id, { status }, { new: true });
    } else {
      throw new AppError('Invalid listing type', 400);
    }

    if (!listing) throw new AppError('Listing not found', 404);

    await AdminLog.create({
      adminId: req.user!.userId,
      action: status === 'ACTIVE' ? 'LISTING_APPROVED' : 'LISTING_REJECTED',
      targetType: type,
      targetId: id,
      note: reason,
    });

    sendSuccess(res, { ...listing.toJSON(), id: (listing._id as { toString(): string }).toString() }, `Listing ${status.toLowerCase()}`);
  } catch (err) {
    next(err);
  }
};

// ── Get Pending Listings ──────────────────────────────────────────
export const getPendingListings = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page, limit } = req.query;
    const { page: p, limit: l, skip } = getPagination(page as string, limit as string);

    const half = Math.floor(l / 2);

    const [products, services, productCount, serviceCount] = await Promise.all([
      Product.find({ status: 'PENDING_APPROVAL' }).sort({ createdAt: -1 }).skip(skip).limit(half)
        .populate('seller', 'username profile.fullName profile.avatarUrl').lean(),
      Service.find({ status: 'PENDING_APPROVAL' }).sort({ createdAt: -1 }).skip(skip).limit(l - half)
        .populate('provider', 'username profile.fullName profile.avatarUrl').lean(),
      Product.countDocuments({ status: 'PENDING_APPROVAL' }),
      Service.countDocuments({ status: 'PENDING_APPROVAL' }),
    ]);

    sendSuccess(res, {
      products: products.map(p => ({ ...p, id: (p._id as { toString(): string }).toString() })),
      services: services.map(s => ({ ...s, id: (s._id as { toString(): string }).toString() })),
      ...buildPaginationMeta(productCount + serviceCount, p, l),
    });
  } catch (err) {
    next(err);
  }
};

// ── Get Admin Logs ────────────────────────────────────────────────
export const getAdminLogs = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page, limit } = req.query;
    const { page: p, limit: l, skip } = getPagination(page as string, limit as string);

    const [logs, total] = await Promise.all([
      AdminLog.find().sort({ createdAt: -1 }).skip(skip).limit(l)
        .populate('admin', 'username profile.fullName profile.avatarUrl').lean(),
      AdminLog.countDocuments(),
    ]);

    sendSuccess(res, {
      logs: logs.map(log => ({ ...log, id: (log._id as { toString(): string }).toString() })),
      ...buildPaginationMeta(total, p, l),
    });
  } catch (err) {
    next(err);
  }
};
