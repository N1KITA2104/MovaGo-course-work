import { Router } from 'express';
import * as statsController from '../controllers/stats.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/category-stats', authMiddleware, statsController.getUserCategoryStats);
router.get('/recommended-lessons', authMiddleware, statsController.getRecommendedLessons);
router.get('/recent-lessons', authMiddleware, statsController.getRecentLessons);

export default router;
