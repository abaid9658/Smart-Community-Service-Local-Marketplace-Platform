import { Request, Response, NextFunction } from 'express';
import Review from '../models/Review.model';
import User from '../models/User.model';
import Booking from '../models/Booking.model';
import { sendSuccess, getPagination, buildPaginationMeta } from '../utils/response';
import { AppError } from '../middleware/error.middleware';
import { AuthRequest } from '../middleware/auth.middleware';

// ── Create Review ─────────────────────────────────────────────────
export const createReview = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { revieweeId, serviceId, productId, bookingId, rating, comment } = req.body;

    if (revieweeId === req.user!.userId) throw new AppError('Cannot review yourself', 400);

    // Check for existing review on same booking
    if (bookingId) {
      const existing = await Review.findOne({ bookingId, reviewerId: req.user!.userId });
      if (existing) throw new AppError('Already reviewed this booking', 409);

      // Verify booking is completed and belongs to user
      const booking = await Booking.findById(bookingId);
      if (!booking || booking.status !== 'COMPLETED') throw new AppError('Can only review completed bookings', 400);
      if (booking.clientId.toString() !== req.user!.userId) throw new AppError('Not authorized to review this booking', 403);
    }

    const review = await Review.create({
      reviewerId: req.user!.userId,
      revieweeId,
      serviceId: serviceId || null,
      productId: productId || null,
      bookingId: bookingId || null,
      rating: parseInt(rating),
      comment,
      isVerified: !!bookingId,
    });

    // Update reviewee's average rating
    const stats = await Review.aggregate([
      { $match: { revieweeId: review.revieweeId } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);

    if (stats.length) {
      await User.findByIdAndUpdate(revieweeId, {
        'profile.averageRating': Math.round(stats[0].avg * 10) / 10,
        'profile.totalReviews': stats[0].count,
      });
    }

    const populated = await Review.findById(review._id)
      .populate('reviewer', 'username profile.fullName profile.avatarUrl')
      .lean();

    sendSuccess(res, { ...populated, id: (populated!._id as { toString(): string }).toString() }, 'Review submitted', 201);
  } catch (err) {
    next(err);
  }
};

// ── Get Reviews for User/Service/Product ──────────────────────────
export const getReviews = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId, serviceId, productId, page, limit } = req.query;
    const { page: p, limit: l, skip } = getPagination(page as string, limit as string);

    const query: Record<string, unknown> = {};
    if (userId) query.revieweeId = userId;
    if (serviceId) query.serviceId = serviceId;
    if (productId) query.productId = productId;

    const [reviews, total] = await Promise.all([
      Review.find(query).sort({ createdAt: -1 }).skip(skip).limit(l)
        .populate('reviewer', 'username profile.fullName profile.avatarUrl')
        .lean(),
      Review.countDocuments(query),
    ]);

    sendSuccess(res, {
      reviews: reviews.map(r => ({ ...r, id: (r._id as { toString(): string }).toString() })),
      ...buildPaginationMeta(total, p, l),
    });
  } catch (err) {
    next(err);
  }
};

// ── Reply to Review ───────────────────────────────────────────────
export const replyToReview = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { reply } = req.body;

    const review = await Review.findById(id);
    if (!review) throw new AppError('Review not found', 404);
    if (review.revieweeId.toString() !== req.user!.userId) throw new AppError('Not authorized', 403);

    review.reply = reply;
    await review.save();

    sendSuccess(res, { ...review.toJSON(), id: review._id.toString() }, 'Reply added');
  } catch (err) {
    next(err);
  }
};

// ── Delete Review (Admin) ──────────────────────────────────────────
export const deleteReview = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const review = await Review.findById(id);
    if (!review) throw new AppError('Review not found', 404);

    await Review.findByIdAndDelete(id);

    // Update reviewee rating stats
    const stats = await Review.aggregate([
      { $match: { revieweeId: review.revieweeId } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);

    if (stats.length) {
      await User.findByIdAndUpdate(review.revieweeId, {
        'profile.averageRating': Math.round(stats[0].avg * 10) / 10,
        'profile.totalReviews': stats[0].count,
      });
    } else {
      await User.findByIdAndUpdate(review.revieweeId, {
        'profile.averageRating': 0,
        'profile.totalReviews': 0,
      });
    }

    sendSuccess(res, null, 'Review deleted');
  } catch (err) {
    next(err);
  }
};
