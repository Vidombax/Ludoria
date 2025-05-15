import { Router } from 'express'
import { authenticateToken } from '../../middleware/auth.js'
import handler from '../../handlers/admin/user/handler.js'

const router = new Router();

router.post('/admin-report', handler.completeReport);

export default router;