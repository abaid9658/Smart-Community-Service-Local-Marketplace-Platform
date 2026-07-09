import { Request, Response, NextFunction } from 'express';
import Report from '../models/Report.model';
import { sendSuccess, getPagination, buildPaginationMeta } from '../utils/response';
import { AppError } from '../middleware/error.middleware';
import { AuthRequest } from '../middleware/auth.middleware';

// ── Create Report ─────────────────────────────────────────────────
export const createReport = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { reportedUserId, productId, serviceId, reason, description } = req.body;

    const report = await Report.create({
      reporterId: req.user!.userId,
      reportedUserId: reportedUserId || null,
      productId: productId || null,
      serviceId: serviceId || null,
      reason,
      description,
      status: 'PENDING',
    });

    sendSuccess(res, { ...report.toJSON(), id: report._id.toString() }, 'Report submitted', 201);
  } catch (err) {
    next(err);
  }
};

// ── List Reports (Admin) ──────────────────────────────────────────
export const listReports = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page, limit, status } = req.query;
    const { page: p, limit: l, skip } = getPagination(page as string, limit as string);

    const query: Record<string, unknown> = {};
    if (status) query.status = status;

    const [reports, total] = await Promise.all([
      Report.find(query).sort({ createdAt: -1 }).skip(skip).limit(l)
        .populate('reporter', 'username profile.fullName')
        .populate('reportedUser', 'username profile.fullName')
        .lean(),
      Report.countDocuments(query),
    ]);

    sendSuccess(res, {
      reports: reports.map(r => ({ ...r, id: (r._id as { toString(): string }).toString() })),
      ...buildPaginationMeta(total, p, l),
    });
  } catch (err) {
    next(err);
  }
};

// ── Update Report (Admin) ─────────────────────────────────────────
export const updateReport = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, adminNote } = req.body;

    const report = await Report.findByIdAndUpdate(
      id,
      { status, adminNote },
      { new: true }
    );
    if (!report) throw new AppError('Report not found', 404);

    sendSuccess(res, { ...report.toJSON(), id: report._id.toString() }, 'Report updated');
  } catch (err) {
    next(err);
  }
};

// ── Get My Reports ─────────────────────────────────────────────────
export const getMyReports = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page, limit } = req.query;
    const { page: p, limit: l, skip } = getPagination(page as string, limit as string);

    const [reports, total] = await Promise.all([
      Report.find({ reporterId: req.user!.userId }).sort({ createdAt: -1 }).skip(skip).limit(l)
        .populate('reportedUser', 'username profile.fullName')
        .populate('product', 'title')
        .populate('service', 'title')
        .lean(),
      Report.countDocuments({ reporterId: req.user!.userId }),
    ]);

    sendSuccess(res, {
      reports: reports.map(r => ({ ...r, id: (r._id as { toString(): string }).toString() })),
      ...buildPaginationMeta(total, p, l),
    });
  } catch (err) {
    next(err);
  }
};
