import { Router } from 'express';
import {
  createService, getServices, getService, updateService,
  deleteService, moderateService, getMyServices,
} from '../controllers/service.controller';
import { authenticate, optionalAuth } from '../middleware/auth.middleware';
import { isAdmin, isProvider } from '../middleware/rbac.middleware';
import { uploadServiceImages } from '../middleware/upload.middleware';

const router = Router();

router.get('/', optionalAuth, getServices);
router.get('/my', authenticate, getMyServices);
router.get('/:id', optionalAuth, getService);

router.post('/', authenticate, isProvider, uploadServiceImages.array('images', 8), createService);
router.put('/:id', authenticate, updateService);
router.delete('/:id', authenticate, deleteService);

// Admin
router.put('/:id/moderate', authenticate, isAdmin, moderateService);

export default router;
