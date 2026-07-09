import { Router } from 'express';
import { createPaymentIntent, confirmPayment, getPaymentHistory } from '../controllers/payment.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Protected routes (webhook handled in server.ts before express.json())
router.post('/create-intent', authenticate, createPaymentIntent as any);
router.post('/confirm', authenticate, confirmPayment as any);
router.get('/history', authenticate, getPaymentHistory as any);

export default router;
