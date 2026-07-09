import { Response, NextFunction } from 'express';
import Favorite from '../models/Favorite.model';
import { sendSuccess } from '../utils/response';
import { AppError } from '../middleware/error.middleware';
import { AuthRequest } from '../middleware/auth.middleware';

// ── Toggle Favorite ───────────────────────────────────────────────
export const toggleFavorite = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { productId, serviceId } = req.body;
    if (!productId && !serviceId) throw new AppError('productId or serviceId required', 400);

    const query: Record<string, unknown> = { userId: req.user!.userId };
    if (productId) query.productId = productId;
    if (serviceId) query.serviceId = serviceId;

    const existing = await Favorite.findOne(query);

    if (existing) {
      await Favorite.findByIdAndDelete(existing._id);
      sendSuccess(res, { isFavorite: false }, 'Removed from favorites');
    } else {
      const fav = await Favorite.create({
        userId: req.user!.userId,
        productId: productId || null,
        serviceId: serviceId || null,
      });
      sendSuccess(res, { isFavorite: true, id: fav._id.toString() }, 'Added to favorites');
    }
  } catch (err) {
    next(err);
  }
};

// ── List Favorites ────────────────────────────────────────────────
export const getMyFavorites = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const favorites = await Favorite.find({ userId: req.user!.userId })
      .populate({
        path: 'product',
        populate: { path: 'seller', select: 'username profile.fullName profile.avatarUrl' },
      })
      .populate({
        path: 'service',
        populate: { path: 'provider', select: 'username profile.fullName profile.avatarUrl' },
      })
      .sort({ createdAt: -1 })
      .lean();

    sendSuccess(res, favorites.map(f => ({ ...f, id: (f._id as { toString(): string }).toString() })));
  } catch (err) {
    next(err);
  }
};
