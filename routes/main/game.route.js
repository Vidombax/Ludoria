import { Router } from 'express'
import handler from '../../handlers/main/game/handler.js'
import { requestManager } from '../../middleware/request_manager.js'

const router = new Router();

router.post('/game-info/:id', handler.getGameInfo);
router.post('/game-by-release-date', handler.getGamesByReleaseDate);
router.post('/search-game', handler.searchGameByName);
router.post('/feedback-by-game/:id', handler.getFeedbacksByGame);
router.get('/subs-by-game/:id', handler.getSubsToGame);
router.get('/popularity-game', handler.getGamesByPopularity);
router.post('/games-by-query', requestManager, handler.getGamesByQueries);

export default router;
