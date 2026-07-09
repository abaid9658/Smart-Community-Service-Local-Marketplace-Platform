import { Response } from 'express';

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export const sendSuccess = (
  res: Response,
  data: unknown,
  message = 'Success',
  statusCode = 200,
  pagination?: PaginationMeta
): void => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
    ...(pagination && { pagination }),
  });
};

export const sendError = (res: Response, message: string, statusCode = 400): void => {
  res.status(statusCode).json({ success: false, message });
};

export const getPagination = (page: string | undefined, limit: string | undefined) => {
  const p = Math.max(1, parseInt(page || '1', 10));
  const l = Math.min(50, Math.max(1, parseInt(limit || '12', 10)));
  const skip = (p - 1) * l;
  return { page: p, limit: l, skip };
};

export const buildPaginationMeta = (total: number, page: number, limit: number): PaginationMeta => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit),
});
