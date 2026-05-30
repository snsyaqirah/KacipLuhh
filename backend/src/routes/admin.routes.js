import { Router } from 'express';
import { handleAdminClose } from '../controllers/admin.controller.js';
import { requireAdmin } from '../middleware/admin.middleware.js';

const router = Router();

router.delete('/room/:id', requireAdmin, handleAdminClose);

export default router;
