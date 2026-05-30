import { Router } from 'express';
import { handleCreate, handleGet, handleJoin, handleExtend, handleClose } from '../controllers/room.controller.js';
import { handleReport } from '../controllers/admin.controller.js';
import { requireOwner } from '../middleware/token.middleware.js';
import { roomCreateLimiter, roomJoinLimiter, roomExtendLimiter } from '../middleware/rateLimit.middleware.js';

const router = Router();

router.post('/', roomCreateLimiter, handleCreate);
router.get('/:id', handleGet);
router.post('/:id/join', roomJoinLimiter, handleJoin);
router.post('/:id/extend', roomExtendLimiter, requireOwner, handleExtend);
router.delete('/:id', requireOwner, handleClose);
router.post('/:id/report', handleReport);

export default router;
