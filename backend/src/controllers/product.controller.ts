import { Request, Response, NextFunction } from 'express';
import Product from '../models/Product.model';
import Category from '../models/Category.model';
import cloudinary from '../config/cloudinary';
import { uploadToCloudinary } from '../middleware/upload.middleware';
import { sendSuccess, getPagination, buildPaginationMeta } from '../utils/response';
import { AppError } from '../middleware/error.middleware';
import { AuthRequest } from '../middleware/auth.middleware';
import { generateSlug } from '../utils/helpers';

// ── Create Product ────────────────────────────────────────────────
export const createProduct = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { title, description, price, discountPrice, stock, categoryId, tags, location, city } = req.body;
    const files = req.files as (Express.Multer.File & { buffer: Buffer })[];

    const slug = generateSlug(title);

    // Upload images to Cloudinary via buffer stream
    const uploadedImages = files && files.length > 0
      ? await Promise.all(
          files.map(async (f, i) => {
            const result = await uploadToCloudinary(f.buffer, 'products');
            return { url: result.secure_url, publicId: result.public_id, isPrimary: i === 0, order: i };
          })
        )
      : [];

    const product = await Product.create({
      sellerId: req.user!.userId,
      title,
      slug,
      description,
      price: parseFloat(price),
      discountPrice: discountPrice ? parseFloat(discountPrice) : undefined,
      stock: parseInt(stock) || 1,
      categoryId: categoryId || null,
      tags: tags ? JSON.parse(tags) : [],
      location,
      city,
      status: 'PENDING_APPROVAL',
      images: uploadedImages,
    });

    const populated = await Product.findById(product._id).populate('category', 'name slug').lean();
    sendSuccess(res, { ...populated, id: product._id.toString() }, 'Product created and pending approval', 201);
  } catch (err) {
    next(err);
  }
};

// ── Get Products (public) ─────────────────────────────────────────
export const getProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page, limit, search, categoryId, minPrice, maxPrice, city, sort } = req.query;
    const { page: p, limit: l, skip } = getPagination(page as string, limit as string);

    const query: Record<string, unknown> = { status: 'ACTIVE' };

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

    const [products, total] = await Promise.all([
      Product.find(query).sort(sortBy).skip(skip).limit(l)
        .populate('seller', 'username profile.fullName profile.avatarUrl profile.averageRating profile.isVerified')
        .populate('category', 'name slug')
        .lean(),
      Product.countDocuments(query),
    ]);

    sendSuccess(res, {
      products: products.map(p => ({ ...p, id: (p._id as { toString(): string }).toString() })),
      ...buildPaginationMeta(total, p, l),
    });
  } catch (err) {
    next(err);
  }
};

// ── Get Single Product ────────────────────────────────────────────
export const getProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndUpdate(
      id,
      { $inc: { viewsCount: 1 } },
      { new: true }
    ).populate('seller', 'username profile.fullName profile.avatarUrl profile.averageRating profile.isVerified profile.city')
      .populate('category', 'name slug')
      .lean();

    if (!product) throw new AppError('Product not found', 404);
    sendSuccess(res, { ...product, id: (product._id as { toString(): string }).toString() });
  } catch (err) {
    next(err);
  }
};

// ── Update Product ────────────────────────────────────────────────
export const updateProduct = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) throw new AppError('Product not found', 404);

    if (product.sellerId.toString() !== req.user!.userId && !['ADMIN', 'SUPER_ADMIN'].includes(req.user!.role)) {
      throw new AppError('Not authorized', 403);
    }

    const { title, description, price, discountPrice, stock, categoryId, tags, location, city } = req.body;
    const files = req.files as (Express.Multer.File & { path: string; filename: string })[];

    if (title) { product.title = title; product.slug = generateSlug(title); }
    if (description) product.description = description;
    if (price) product.price = parseFloat(price);
    if (discountPrice !== undefined) product.discountPrice = discountPrice ? parseFloat(discountPrice) : undefined;
    if (stock) product.stock = parseInt(stock);
    if (categoryId !== undefined) product.categoryId = categoryId || null;
    if (tags) product.tags = JSON.parse(tags);
    if (location !== undefined) product.location = location;
    if (city !== undefined) product.city = city;
    if (files?.length) {
      const newImages = await Promise.all(files.map(async (f, i) => {
        const result = await uploadToCloudinary((f as any).buffer, 'products');
        return {
          url: result.secure_url,
          publicId: result.public_id,
          isPrimary: product.images.length === 0 && i === 0,
          order: product.images.length + i,
        };
      }));
      product.images.push(...newImages);
    }

    if (['ADMIN', 'SUPER_ADMIN'].includes(req.user!.role) && req.body.status) {
      product.status = req.body.status;
    } else {
      product.status = 'PENDING_APPROVAL';
    }

    await product.save();
    sendSuccess(res, { ...product.toJSON(), id: product._id.toString() }, 'Product updated');
  } catch (err) {
    next(err);
  }
};

// ── Delete Product ────────────────────────────────────────────────
export const deleteProduct = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) throw new AppError('Product not found', 404);

    if (product.sellerId.toString() !== req.user!.userId && !['ADMIN', 'SUPER_ADMIN'].includes(req.user!.role)) {
      throw new AppError('Not authorized', 403);
    }

    // Delete images from Cloudinary
    for (const img of product.images) {
      if (img.publicId) await cloudinary.uploader.destroy(img.publicId).catch(() => {});
    }

    await Product.findByIdAndDelete(id);
    sendSuccess(res, null, 'Product deleted');
  } catch (err) {
    next(err);
  }
};

// ── My Products ───────────────────────────────────────────────────
export const getMyProducts = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page, limit } = req.query;
    const { page: p, limit: l, skip } = getPagination(page as string, limit as string);

    const [products, total] = await Promise.all([
      Product.find({ sellerId: req.user!.userId }).sort({ createdAt: -1 }).skip(skip).limit(l).lean(),
      Product.countDocuments({ sellerId: req.user!.userId }),
    ]);

    sendSuccess(res, {
      products: products.map(pr => ({ ...pr, id: (pr._id as { toString(): string }).toString() })),
      ...buildPaginationMeta(total, p, l),
    });
  } catch (err) {
    next(err);
  }
};

// ── Add Product Images ─────────────────────────────────────────────
export const addProductImages = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const files = req.files as (Express.Multer.File & { path: string; filename: string })[];

    if (!files || files.length === 0) throw new AppError('No files uploaded', 400);

    const product = await Product.findById(id);
    if (!product) throw new AppError('Product not found', 404);

    if (product.sellerId.toString() !== req.user!.userId && !['ADMIN', 'SUPER_ADMIN'].includes(req.user!.role)) {
      throw new AppError('Not authorized', 403);
    }

    product.images.push(...files.map((f, i) => ({
      url: f.path,
      publicId: f.filename,
      isPrimary: product.images.length === 0 && i === 0,
      order: product.images.length + i,
    })));

    await product.save();
    sendSuccess(res, { ...product.toJSON(), id: product._id.toString() }, 'Images added successfully');
  } catch (err) {
    next(err);
  }
};

// ── Moderate Product (Admin) ───────────────────────────────────────
export const moderateProduct = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
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

    const product = await Product.findByIdAndUpdate(id, { status: targetStatus }, { new: true });
    if (!product) throw new AppError('Product not found', 404);

    const AdminLog = (await import('../models/AdminLog.model')).default;
    await AdminLog.create({
      adminId: req.user!.userId,
      action: status === 'ACTIVE' ? 'LISTING_APPROVED' : 'LISTING_REJECTED',
      targetType: 'product',
      targetId: id,
      note: reason,
    });

    sendSuccess(res, { ...product.toJSON(), id: product._id.toString() }, `Product status set to ${status}`);
  } catch (err) {
    next(err);
  }
};

