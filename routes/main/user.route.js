import { Router } from 'express'
import { authenticateToken } from '../../middleware/auth.js'
import handler from '../../handlers/main/user/handler.js'
import { uploadProfilePicture } from '../../services/files_uploader.js'

const router = new Router();

router.post('/register', handler.createUser);
router.post('/update', authenticateToken, handler.updateUser);
router.post('/update-photo', uploadProfilePicture.single('file'), handler.updateUserPhoto);
router.post('/login', handler.authorizationUser);
router.post('/user/:id', handler.getUser);
router.post('/user-following/:id', authenticateToken, handler.getFollowingGameByUser);
router.get('/sub-to-game/:iduser/:idgame', authenticateToken, handler.getSubscribeToGameByUser);
router.post('/subscribe', authenticateToken, handler.subscribeToGame);
router.post('/unsubscribe', authenticateToken, handler.unsubscribeToGame);
router.post('/rate-game', authenticateToken, handler.rateGame);
router.get('/get-rate/:iduser/:idgame', authenticateToken, handler.getUserScore);
router.post('/feedback', authenticateToken, handler.createFeedback);
router.post('/rate-feedback', authenticateToken, handler.rateFeedback);
router.post('/comment', authenticateToken, handler.createComment);
router.post('/rate-comment', authenticateToken, handler.rateComment);
router.delete('/delete-comment/:idcomment', authenticateToken, handler.deleteComment);
router.post('/user-following-query/:id', authenticateToken, handler.getFollowingGamesByQueries);
router.post('/report', authenticateToken, handler.createReport);
router.get('/friends/:id', authenticateToken, handler.getFriendsList);
router.post('/friend', authenticateToken, handler.handlerFriendRequest);

export default router;
