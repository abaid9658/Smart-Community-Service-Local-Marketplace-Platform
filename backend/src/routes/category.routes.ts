import { Router } from 'express';
import { getCategories, createCategory, deleteCategory } from '../controllers/category.controller';
import { authenticate } from '../middleware/auth.middleware';
import { isAdmin } from '../middleware/rbac.middleware';

const router = Router();

router.get('/', getCategories);
router.post('/', authenticate, isAdmin, createCategory);
router.delete('/:id', authenticate, isAdmin, deleteCategory);

export default router;
