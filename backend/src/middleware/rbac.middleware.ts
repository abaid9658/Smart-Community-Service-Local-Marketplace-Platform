import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';

type Role = 'USER' | 'SELLER' | 'SERVICE_PROVIDER' | 'ADMIN' | 'SUPER_ADMIN';

export const authorize = (...roles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }
    if (!roles.includes(req.user.role as Role)) {
      res.status(403).json({
        success: false,
        message: `Access denied. Required roles: ${roles.join(', ')}`,
      });
      return;
    }
    next();
  };
};

export const isAdmin = authorize('ADMIN', 'SUPER_ADMIN');
export const isSuperAdmin = authorize('SUPER_ADMIN');
export const isSellerOrProvider = authorize('SELLER', 'SERVICE_PROVIDER', 'ADMIN', 'SUPER_ADMIN');
export const isProvider = authorize('SERVICE_PROVIDER', 'ADMIN', 'SUPER_ADMIN');
