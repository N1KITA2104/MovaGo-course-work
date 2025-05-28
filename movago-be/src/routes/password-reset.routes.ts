import { Router } from 'express';
import * as passwordResetController from '../controllers/password-reset.controller';

const router = Router();

router.post('/request', passwordResetController.requestPasswordReset);
router.post('/verify', passwordResetController.verifyResetCode);
router.post('/reset', passwordResetController.resetPassword);

export default router;
