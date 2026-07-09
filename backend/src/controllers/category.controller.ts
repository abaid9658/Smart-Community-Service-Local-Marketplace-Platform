import { Request, Response, NextFunction } from 'express';
import Category from '../models/Category.model';
import Product from '../models/Product.model';
import Service from '../models/Service.model';
import { sendSuccess } from '../utils/response';
import { AppError } from '../middleware/error.middleware';
import { AuthRequest } from '../middleware/auth.middleware';

// ── Get All Categories ────────────────────────────────────────────
export const getCategories = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const categories = await Category.find({ parentId: null }).sort({ name: 1 }).lean();

    // Attach children + counts
    const enriched = await Promise.all(
      categories.map(async (cat) => {
        const [children, productCount, serviceCount] = await Promise.all([
          Category.find({ parentId: cat._id }).lean(),
          Product.countDocuments({ categoryId: cat._id, status: 'ACTIVE' }),
          Service.countDocuments({ categoryId: cat._id, status: 'ACTIVE' }),
        ]);
        return {
          ...cat,
          id: cat._id.toString(),
          children: children.map(c => ({ ...c, id: c._id.toString() })),
          _count: { products: productCount, services: serviceCount },
        };
      })
    );

    sendSuccess(res, enriched);
  } catch (err) {
    next(err);
  }
};

// ── Create Category (Admin) ───────────────────────────────────────
export const createCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, description, iconUrl, parentId } = req.body;
    const slug = name.toLowerCase().replace(/\s+/g, '-');

    const existing = await Category.findOne({ slug });
    if (existing) throw new AppError('Category already exists', 409);

    const category = await Category.create({
      name,
      slug,
      description,
      iconUrl,
      parentId: parentId || null,
    });

    sendSuccess(res, { ...category.toJSON(), id: category._id.toString() }, 'Category created', 201);
  } catch (err) {
    next(err);
  }
};

// ── Delete Category (Admin) ───────────────────────────────────────
export const deleteCategory = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    await Category.findByIdAndDelete(id);
    sendSuccess(res, null, 'Category deleted');
  } catch (err) {
    next(err);
  }
};
