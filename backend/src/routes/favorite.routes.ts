import { Router } from 'express';
import { toggleFavorite, getMyFavorites } from '../controllers/favorite.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticate, getMyFavorites);
router.post('/toggle', authenticate, toggleFavorite);

export default router;
