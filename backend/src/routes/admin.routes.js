import { Router } from 'express';
import { handleAdminClose, handleGetReports } from '../controllers/admin.controller.js';
import { requireAdmin } from '../middleware/admin.middleware.js';

const router = Router();

router.get('/reports', requireAdmin, handleGetReports);
router.delete('/room/:id', requireAdmin, handleAdminClose);

export default router;
