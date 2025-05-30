import redis from 'redis'
import dotenv from 'dotenv'
import logger from './logger.js'

dotenv.config();

const redisClient = redis.createClient({
    url: `${process.env.REDIS_HOST}`
});

(async () => {
    await redisClient.connect();
})();

redisClient.on("connect", () => {
    logger.info('Redis connect OK');
});

redisClient.on('error', (err) => {
    logger.error('Ошибка Redis:', err);
});

export { redisClient };

export async function getRedisValue(key) {
    try {
        return await redisClient.get(key);
    } catch (err) {
        logger.error(`Ошибка при получении значения из Redis: ${err}`);
        throw err;
    }
}

export async function setRedisValue(key, value) {
    try {
        await redisClient.set(key, value);
        logger.info(`Значение записано в Redis по ключу ${key}`);
    } catch (err) {
        logger.error(`Ошибка при записи значения в Redis: ${err}`);
        throw err;
    }
}

export async function deleteRedisValue(key) {
    try {
        await redisClient.del(key);
        logger.info(`Данные в Redis по ключу ${key} удалены`);
    } catch (err) {
        logger.error(`Ошибка удаления данных из Redis: ${err}`)
    }
}