import { Router } from 'express';
import { createReview, getReviews, replyToReview, deleteReview } from '../controllers/review.controller';
import { authenticate } from '../middleware/auth.middleware';
import { isAdmin } from '../middleware/rbac.middleware';

const router = Router();

router.get('/', getReviews);
router.post('/', authenticate, createReview);
router.put('/:id/reply', authenticate, replyToReview);
router.delete('/:id', authenticate, isAdmin, deleteReview);

export default router;
