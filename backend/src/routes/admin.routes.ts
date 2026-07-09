import { Router } from 'express';
import {
  getDashboardStats,
  getAdminLogs, getPendingListings,
} from '../controllers/admin.controller';
import { listReports as getReports, updateReport } from '../controllers/report.controller';
import { authenticate } from '../middleware/auth.middleware';
import { isAdmin } from '../middleware/rbac.middleware';

const router = Router();

router.use(authenticate, isAdmin);

router.get('/stats', getDashboardStats);
router.get('/pending-listings', getPendingListings);
router.get('/reports', getReports);
router.put('/reports/:id', updateReport);
router.get('/logs', getAdminLogs);

export default router;
