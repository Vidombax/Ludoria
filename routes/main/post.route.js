import { Router } from 'express'
import { authenticateToken } from '../../middleware/auth.js'
import handler from '../../handlers/main/post/handler.js'
import { uploadPostPicture } from '../../services/files_uploader.js'

const router = new Router();

router.post('/post', uploadPostPicture.single('file'), authenticateToken, handler.createPost);
router.get('/post/:id', handler.getPost);
router.get('/user-posts/:id', handler.getUserPosts);
router.post('/update-post', authenticateToken, handler.updatePost);
router.post('/rate-post', authenticateToken, handler.ratePost);
router.get('/new-post', handler.getNewestPost);
router.delete('/delete-post/:id', authenticateToken, handler.deletePost);

export default router;