import { Router } from 'express'
import handler from '../../handlers/main/developer/handler.js'

const router = new Router();

router.get('/developer/:name', handler.searchDeveloper);

export default router;
