import { Router } from 'express';
import { createReport, getMyReports } from '../controllers/report.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authenticate, createReport);
router.get('/my', authenticate, getMyReports);

export default router;
