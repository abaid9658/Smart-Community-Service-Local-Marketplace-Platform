import { Response, NextFunction } from 'express';
import Booking from '../models/Booking.model';
import Service from '../models/Service.model';
import Notification from '../models/Notification.model';
import { sendSuccess, getPagination, buildPaginationMeta } from '../utils/response';
import { AppError } from '../middleware/error.middleware';
import { AuthRequest } from '../middleware/auth.middleware';
import { emitToUser } from '../socket/socket.server';

// ── Create Booking ────────────────────────────────────────────────
export const createBooking = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { serviceId, scheduledDate, scheduledTime, notes, packageName } = req.body;

    const service = await Service.findById(serviceId);
    if (!service || service.status !== 'ACTIVE') throw new AppError('Service not found or unavailable', 404);
    if (service.providerId.toString() === req.user!.userId) throw new AppError('Cannot book your own service', 400);

    // Resolve price from selected package
    let totalPrice = service.price;
    if (packageName && service.packages?.length) {
      const pkg = service.packages.find((p: any) => p.name.toLowerCase() === packageName.toLowerCase());
      if (pkg) totalPrice = pkg.price;
    }

    const booking = await Booking.create({
      serviceId,
      clientId: req.user!.userId,
      providerId: service.providerId,
      scheduledDate: new Date(scheduledDate),
      scheduledTime,
      notes,
      packageName: packageName || undefined,
      totalPrice,
      status: 'PENDING',
      paymentStatus: 'PENDING',
    });

    // Notify provider
    const notif = await Notification.create({
      userId: service.providerId,
      type: 'BOOKING_REQUEST',
      title: 'New Booking Request',
      message: `You have a new booking request for "${service.title}"`,
      link: `/dashboard/bookings/${booking._id}`,
    });

    emitToUser(service.providerId.toString(), 'notification:received', {
      id: notif._id.toString(),
      userId: notif.userId.toString(),
      type: notif.type,
      title: notif.title,
      message: notif.message,
      link: notif.link,
      isRead: notif.isRead,
      createdAt: notif.createdAt,
    });

    const populated = await Booking.findById(booking._id)
      .populate('service', 'title price')
      .populate('client', 'username profile.fullName profile.avatarUrl')
      .lean();

    sendSuccess(res, { ...populated, id: (populated!._id as { toString(): string }).toString() }, 'Booking created', 201);
  } catch (err) {
    next(err);
  }
};

// ── Get My Bookings ───────────────────────────────────────────────
export const getMyBookings = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page, limit, status, role } = req.query;
    const { page: p, limit: l, skip } = getPagination(page as string, limit as string);

    const query: Record<string, unknown> =
      role === 'provider'
        ? { providerId: req.user!.userId }
        : { clientId: req.user!.userId };

    if (status) query.status = status;

    const [bookings, total] = await Promise.all([
      Booking.find(query).sort({ createdAt: -1 }).skip(skip).limit(l)
        .populate('service', 'title price images')
        .populate('client', 'username profile.fullName profile.avatarUrl')
        .populate('provider', 'username profile.fullName profile.avatarUrl')
        .lean(),
      Booking.countDocuments(query),
    ]);

    sendSuccess(res, {
      bookings: bookings.map(b => ({ ...b, id: (b._id as { toString(): string }).toString() })),
      ...buildPaginationMeta(total, p, l),
    });
  } catch (err) {
    next(err);
  }
};

// ── Update Booking Status ─────────────────────────────────────────
export const updateBookingStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, cancellationReason } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) throw new AppError('Booking not found', 404);

    const isProvider = booking.providerId.toString() === req.user!.userId;
    const isClient = booking.clientId.toString() === req.user!.userId;

    if (!isProvider && !isClient) throw new AppError('Not authorized', 403);

    const VALID_TRANSITIONS: Record<string, string[]> = {
      PENDING: ['ACCEPTED', 'REJECTED', 'CANCELLED'],
      ACCEPTED: ['IN_PROGRESS', 'CANCELLED'],
      IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
    };

    const allowed = VALID_TRANSITIONS[booking.status] || [];
    if (!allowed.includes(status)) throw new AppError(`Cannot transition from ${booking.status} to ${status}`, 400);

    booking.status = status;
    if (cancellationReason) booking.cancellationReason = cancellationReason;
    if (status === 'COMPLETED') booking.completedAt = new Date();

    await booking.save();

    // Notify the other party
    const notifyUserId = isProvider ? booking.clientId.toString() : booking.providerId.toString();
    const notifMsg: Record<string, string> = {
      ACCEPTED: 'Your booking has been accepted!',
      REJECTED: 'Your booking was declined.',
      CANCELLED: 'A booking was cancelled.',
      COMPLETED: 'Your booking has been marked as completed.',
    };

    const notif = await Notification.create({
      userId: notifyUserId,
      type: `BOOKING_${status}`,
      title: `Booking ${status.charAt(0) + status.slice(1).toLowerCase()}`,
      message: notifMsg[status] || `Booking status updated to ${status}`,
      link: `/dashboard/bookings/${booking._id}`,
    });

    emitToUser(notifyUserId, 'notification:received', {
      id: notif._id.toString(),
      userId: notif.userId.toString(),
      type: notif.type,
      title: notif.title,
      message: notif.message,
      link: notif.link,
      isRead: notif.isRead,
      createdAt: notif.createdAt,
    });

    sendSuccess(res, { ...booking.toJSON(), id: booking._id.toString() }, `Booking ${status.toLowerCase()}`);
  } catch (err) {
    next(err);
  }
};

// ── Get Provider Bookings ──────────────────────────────────────────
export const getProviderBookings = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page, limit, status } = req.query;
    const { page: p, limit: l, skip } = getPagination(page as string, limit as string);

    const query: Record<string, unknown> = { providerId: req.user!.userId };
    if (status) query.status = status;

    const [bookings, total] = await Promise.all([
      Booking.find(query).sort({ createdAt: -1 }).skip(skip).limit(l)
        .populate('service', 'title price images')
        .populate('client', 'username profile.fullName profile.avatarUrl')
        .populate('provider', 'username profile.fullName profile.avatarUrl')
        .lean(),
      Booking.countDocuments(query),
    ]);

    sendSuccess(res, {
      bookings: bookings.map(b => ({ ...b, id: (b._id as { toString(): string }).toString() })),
      ...buildPaginationMeta(total, p, l),
    });
  } catch (err) {
    next(err);
  }
};

// ── Get Single Booking ─────────────────────────────────────────────
export const getBooking = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id)
      .populate('service', 'title price images description providerId')
      .populate('client', 'username profile.fullName profile.avatarUrl profile.phone')
      .populate('provider', 'username profile.fullName profile.avatarUrl profile.phone')
      .lean();

    if (!booking) throw new AppError('Booking not found', 404);

    if (booking.clientId.toString() !== req.user!.userId && booking.providerId.toString() !== req.user!.userId) {
      throw new AppError('Not authorized to view this booking', 403);
    }

    sendSuccess(res, { ...booking, id: (booking._id as { toString(): string }).toString() });
  } catch (err) {
    next(err);
  }
};

