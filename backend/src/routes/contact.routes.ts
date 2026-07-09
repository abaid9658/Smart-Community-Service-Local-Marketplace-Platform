import { Router } from 'express';
import { submitContact } from '../controllers/contact.controller';

const router = Router();

// Public endpoint - no authentication required (contact form for guests)
router.post('/', submitContact);

export default router;
