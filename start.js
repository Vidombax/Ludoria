import express from 'express'
import dotenv from 'dotenv';
dotenv.config();

import { redisClient } from "./redis.js";

import userMainRouter from './routes/main/user.route.js'
import gameMainRouter from './routes/main/game.route.js'

const app = express();

app.use(express.json());


app.use('/', userMainRouter);
app.use('/', gameMainRouter);

const PORT = process.env.PORT || 3001;
app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);
    await redisClient;
});
