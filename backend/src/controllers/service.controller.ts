import { Request, Response, NextFunction } from 'express';
import Service from '../models/Service.model';
import Category from '../models/Category.model';
import cloudinary from '../config/cloudinary';
import { uploadToCloudinary } from '../middleware/upload.middleware';
import { sendSuccess, getPagination, buildPaginationMeta } from '../utils/response';
import { AppError } from '../middleware/error.middleware';
import { AuthRequest } from '../middleware/auth.middleware';
import { generateSlug } from '../utils/helpers';

// ── Create Service ────────────────────────────────────────────────
export const createService = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { title, description, price, deliveryDays, revisions, categoryId, tags, location, city, faq, packages } = req.body;
    const files = req.files as (Express.Multer.File & { buffer: Buffer })[];

    const slug = generateSlug(title);

    // Upload images to Cloudinary via buffer stream
    const uploadedImages = files && files.length > 0
      ? await Promise.all(
          files.map(async (f, i) => {
            const result = await uploadToCloudinary(f.buffer, 'services');
            return { url: result.secure_url, publicId: result.public_id, isPrimary: i === 0, order: i };
          })
        )
      : [];

    const service = await Service.create({
      providerId: req.user!.userId,
      title,
      slug,
      description,
      price: parseFloat(price),
      deliveryDays: parseInt(deliveryDays) || 1,
      revisions: parseInt(revisions) || 1,
      categoryId: categoryId || null,
      tags: tags ? JSON.parse(tags) : [],
      location,
      city,
      faq: faq ? JSON.parse(faq) : [],
      packages: packages ? JSON.parse(packages) : [],
      status: 'PENDING_APPROVAL',
      images: uploadedImages,
    });

    sendSuccess(res, { ...service.toJSON(), id: service._id.toString() }, 'Service created and pending approval', 201);
  } catch (err) {
    next(err);
  }
};

// ── Get Services (public) ─────────────────────────────────────────
export const getServices = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page, limit, search, categoryId, minPrice, maxPrice, city, sort } = req.query;
    const { page: p, limit: l, skip } = getPagination(page as string, limit as string);

    const query: Record<string, unknown> = { status: 'ACTIVE', isAvailable: true };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (categoryId) query.categoryId = categoryId;
    if (city) query.city = { $regex: city, $options: 'i' };
    let parsedMin = NaN;
    let parsedMax = NaN;
    if (minPrice && minPrice !== 'null' && minPrice !== 'undefined' && minPrice !== '') {
      parsedMin = parseFloat(minPrice as string);
    }
    if (maxPrice && maxPrice !== 'null' && maxPrice !== 'undefined' && maxPrice !== '') {
      parsedMax = parseFloat(maxPrice as string);
    }

    if (!isNaN(parsedMin) || !isNaN(parsedMax)) {
      const priceQuery: Record<string, number> = {};
      if (!isNaN(parsedMin)) priceQuery.$gte = parsedMin;
      if (!isNaN(parsedMax)) priceQuery.$lte = parsedMax;
      query.price = priceQuery;
    }

    const sortMap: Record<string, Record<string, 1 | -1>> = {
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      newest: { createdAt: -1 },
      popular: { viewsCount: -1 },
    };
    const sortBy = sortMap[sort as string] || { createdAt: -1 };

    const [services, total] = await Promise.all([
      Service.find(query).sort(sortBy).skip(skip).limit(l)
        .populate('provider', 'username profile.fullName profile.avatarUrl profile.averageRating profile.isVerified')
        .populate('category', 'name slug')
        .lean(),
      Service.countDocuments(query),
    ]);

    sendSuccess(res, {
      services: services.map(s => ({ ...s, id: (s._id as { toString(): string }).toString() })),
      ...buildPaginationMeta(total, p, l),
    });
  } catch (err) {
    next(err);
  }
};

// ── Get Single Service ────────────────────────────────────────────
export const getService = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const service = await Service.findByIdAndUpdate(
      id,
      { $inc: { viewsCount: 1 } },
      { new: true }
    ).populate('provider', 'username profile.fullName profile.avatarUrl profile.averageRating profile.isVerified profile.city profile.bio')
      .populate('category', 'name slug')
      .lean();

    if (!service) throw new AppError('Service not found', 404);
    sendSuccess(res, { ...service, id: (service._id as { toString(): string }).toString() });
  } catch (err) {
    next(err);
  }
};

// ── Update Service ────────────────────────────────────────────────
export const updateService = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const service = await Service.findById(id);
    if (!service) throw new AppError('Service not found', 404);

    if (service.providerId.toString() !== req.user!.userId && !['ADMIN', 'SUPER_ADMIN'].includes(req.user!.role)) {
      throw new AppError('Not authorized', 403);
    }

    const { title, description, price, deliveryDays, revisions, categoryId, tags, location, city, faq, packages, isAvailable } = req.body;
    const files = req.files as (Express.Multer.File & { path: string; filename: string })[];

    if (title) { service.title = title; service.slug = generateSlug(title); }
    if (description) service.description = description;
    if (price) service.price = parseFloat(price);
    if (deliveryDays) service.deliveryDays = parseInt(deliveryDays);
    if (revisions) service.revisions = parseInt(revisions);
    if (categoryId !== undefined) service.categoryId = categoryId || null;
    if (tags) service.tags = JSON.parse(tags);
    if (location !== undefined) service.location = location;
    if (city !== undefined) service.city = city;
    if (faq) service.faq = JSON.parse(faq);
    if (packages) service.packages = JSON.parse(packages);
    if (isAvailable !== undefined) service.isAvailable = isAvailable === 'true' || isAvailable === true;
    if (files?.length) {
      const newImages = await Promise.all(files.map(async (f, i) => {
        const result = await uploadToCloudinary((f as any).buffer, 'services');
        return {
          url: result.secure_url,
          publicId: result.public_id,
          isPrimary: service.images.length === 0 && i === 0,
          order: service.images.length + i,
        };
      }));
      service.images.push(...newImages);
    }

    if (['ADMIN', 'SUPER_ADMIN'].includes(req.user!.role) && req.body.status) {
      service.status = req.body.status;
    } else {
      service.status = 'PENDING_APPROVAL';
    }

    await service.save();
    sendSuccess(res, { ...service.toJSON(), id: service._id.toString() }, 'Service updated');
  } catch (err) {
    next(err);
  }
};

// ── Delete Service ────────────────────────────────────────────────
export const deleteService = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const service = await Service.findById(id);
    if (!service) throw new AppError('Service not found', 404);

    if (service.providerId.toString() !== req.user!.userId && !['ADMIN', 'SUPER_ADMIN'].includes(req.user!.role)) {
      throw new AppError('Not authorized', 403);
    }

    for (const img of service.images) {
      if (img.publicId) await cloudinary.uploader.destroy(img.publicId).catch(() => {});
    }

    await Service.findByIdAndDelete(id);
    sendSuccess(res, null, 'Service deleted');
  } catch (err) {
    next(err);
  }
};

// ── My Services ───────────────────────────────────────────────────
export const getMyServices = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page, limit } = req.query;
    const { page: p, limit: l, skip } = getPagination(page as string, limit as string);

    const [services, total] = await Promise.all([
      Service.find({ providerId: req.user!.userId }).sort({ createdAt: -1 }).skip(skip).limit(l).lean(),
      Service.countDocuments({ providerId: req.user!.userId }),
    ]);

    sendSuccess(res, {
      services: services.map(s => ({ ...s, id: (s._id as { toString(): string }).toString() })),
      ...buildPaginationMeta(total, p, l),
    });
  } catch (err) {
    next(err);
  }
};

// ── Moderate Service (Admin) ───────────────────────────────────────
export const moderateService = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    let { status, action, reason } = req.body;
    let targetStatus = status || action;

    if (targetStatus) {
      targetStatus = targetStatus.toUpperCase();
      if (targetStatus === 'APPROVE' || targetStatus === 'APPROVED') targetStatus = 'ACTIVE';
      if (targetStatus === 'REJECT') targetStatus = 'REJECTED';
    }

    if (!['ACTIVE', 'REJECTED', 'ARCHIVED'].includes(targetStatus)) {
      throw new AppError('Invalid status', 400);
    }

    const service = await Service.findByIdAndUpdate(id, { status: targetStatus }, { new: true });
    if (!service) throw new AppError('Service not found', 404);

    const AdminLog = (await import('../models/AdminLog.model')).default;
    await AdminLog.create({
      adminId: req.user!.userId,
      action: status === 'ACTIVE' ? 'LISTING_APPROVED' : 'LISTING_REJECTED',
      targetType: 'service',
      targetId: id,
      note: reason,
    });

    sendSuccess(res, { ...service.toJSON(), id: service._id.toString() }, `Service status set to ${status}`);
  } catch (err) {
    next(err);
  }
};

