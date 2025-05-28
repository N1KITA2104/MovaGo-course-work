import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { adminMiddleware } from '../middleware/admin.middleware';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/profile', authMiddleware, authController.getUserProfile);
router.get('/users/:id', authController.getUserById);
router.put('/profile', authMiddleware, authController.updateUserProfile);
router.post(
    '/profile/photo',
    authMiddleware,
    authController.upload.single('profilePhoto'),
    authController.uploadProfilePhoto
);
router.delete('/profile/photo', authMiddleware, authController.deleteProfilePhoto);
router.get('/users', authMiddleware, adminMiddleware, authController.getAllUsers);
router.put('/users/:id/role', authMiddleware, adminMiddleware, authController.updateUserRole);
router.put('/users/:id/status', authMiddleware, adminMiddleware, authController.updateUserStatus);
router.delete('/users/:id', authMiddleware, adminMiddleware, authController.deleteUser);
router.post('/complete-lesson', authMiddleware, authController.completeLesson);

export default router;
