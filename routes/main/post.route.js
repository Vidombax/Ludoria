import { Router } from 'express'
import { authenticateToken } from '../../middleware/auth.js'
import handler from '../../handlers/main/post/handler.js'

const router = new Router();

router.post('/post', authenticateToken, handler.createPost);
router.post('/update-post', authenticateToken, handler.updatePost);
router.post('/rate-post', authenticateToken, handler.ratePost);
router.get('/new-post', handler.getNewestPost);

export default router;