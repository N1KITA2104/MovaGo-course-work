import { Router } from 'express';
import * as lessonsController from '../controllers/lesson.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { adminMiddleware } from '../middleware/admin.middleware';

const router = Router();

router.get('/', authMiddleware, lessonsController.getAllLessons);
router.get('/:id', authMiddleware, lessonsController.getLessonById);

router.get('/web/paginated', authMiddleware, lessonsController.getPaginatedLessons);
router.post('/web/batch', authMiddleware, lessonsController.getLessonsByIds);

router.post('/', authMiddleware, adminMiddleware, lessonsController.createLesson);
router.put('/:id', authMiddleware, adminMiddleware, lessonsController.updateLesson);
router.delete('/:id', authMiddleware, adminMiddleware, lessonsController.deleteLesson);

export default router;
