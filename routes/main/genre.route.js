import { Router } from 'express'
import handler from '../../handlers/main/genre/handler.js'

const router = new Router();

router.get('/genres', handler.getAllGenres);

export default router;
