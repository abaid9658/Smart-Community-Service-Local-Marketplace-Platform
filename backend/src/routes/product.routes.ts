import { Router } from 'express';
import {
  createProduct, getProducts, getProduct, updateProduct,
  deleteProduct, addProductImages, moderateProduct, getMyProducts,
} from '../controllers/product.controller';
import { authenticate, optionalAuth } from '../middleware/auth.middleware';
import { isAdmin, isSellerOrProvider } from '../middleware/rbac.middleware';
import { uploadProductImages } from '../middleware/upload.middleware';

const router = Router();

router.get('/', optionalAuth, getProducts);
router.get('/my', authenticate, getMyProducts);
router.get('/:id', optionalAuth, getProduct);

router.post('/', authenticate, isSellerOrProvider, uploadProductImages.array('images', 8), createProduct);
router.put('/:id', authenticate, updateProduct);
router.delete('/:id', authenticate, deleteProduct);
router.post('/:id/images', authenticate, uploadProductImages.array('images', 8), addProductImages);

// Admin
router.put('/:id/moderate', authenticate, isAdmin, moderateProduct);

export default router;
