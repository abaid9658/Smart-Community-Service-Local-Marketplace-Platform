import { Request as ExpressRequest, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../config/jwt';
import User from '../models/User.model';

export interface AuthRequest extends ExpressRequest {
  user?: {
    userId: string;
    role: string;
    email: string;
    isSuspended: boolean;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : req.cookies?.accessToken;

    if (!token) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.userId).select('role email isSuspended').lean();

    if (!user) {
      res.status(401).json({ success: false, message: 'User not found' });
      return;
    }

    if (user.isSuspended) {
      res.status(403).json({ success: false, message: 'Account suspended' });
      return;
    }

    req.user = {
      userId: (user._id as { toString(): string }).toString(),
      role: user.role,
      email: user.email,
      isSuspended: user.isSuspended,
    };
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

export const optionalAuth = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    if (token) {
      const payload = verifyAccessToken(token);
      req.user = { userId: payload.userId, role: payload.role, email: '', isSuspended: false };
    }
  } catch {
    // no-op — optional auth
  }
  next();
};

export const requireRole = (...roles: string[]) =>
  (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ success: false, message: 'Insufficient permissions' });
      return;
    }
    next();
  };
