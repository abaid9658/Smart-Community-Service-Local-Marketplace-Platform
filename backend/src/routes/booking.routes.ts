import { Router } from 'express';
import {
  createBooking, updateBookingStatus, getMyBookings,
  getProviderBookings, getBooking,
} from '../controllers/booking.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authenticate, createBooking);
router.get('/my', authenticate, getMyBookings);
router.get('/provider', authenticate, getProviderBookings);
router.get('/:id', authenticate, getBooking);
router.put('/:id/status', authenticate, updateBookingStatus);

export default router;
