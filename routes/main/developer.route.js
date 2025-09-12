import { Router } from 'express'
import handler from '../../handlers/main/developer/handler.js'
import { requestManager } from '../../middleware/request_manager.js'

const router = new Router();

router.get('/developer/:name', requestManager, handler.searchDeveloper);

export default router;
