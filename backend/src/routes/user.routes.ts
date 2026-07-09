import { Router } from 'express';
import {
  getPublicProfile, updateProfile, uploadAvatar as uploadAvatarCtrl,
  updateRole, getAllUsers, toggleSuspend,
} from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';
import { isAdmin } from '../middleware/rbac.middleware';
import { uploadAvatar } from '../middleware/upload.middleware';

const router = Router();

router.get('/profile/:username', getPublicProfile);
router.put('/profile', authenticate, updateProfile);
router.post('/avatar', authenticate, uploadAvatar.single('avatar'), uploadAvatarCtrl);
router.put('/role', authenticate, updateRole);

// Admin
router.get('/', authenticate, isAdmin, getAllUsers);
router.put('/:id/suspend', authenticate, isAdmin, toggleSuspend);

export default router;
