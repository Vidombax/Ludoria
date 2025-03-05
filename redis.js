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
        const value = await redisClient.get(key);
        if (typeof value === "object") {
            logger.info('Данных нет в Redis записываем...');
        }
        else {
            logger.info(`Подгружены данные из Redis по ключу ${key}`);
        }
        return value;
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

export async function deleteKeysWithPattern(pattern) {
    let cursor = '0';
    let keys = [];

    do {
        const reply = await redisClient.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
        cursor = reply[0];
        keys = keys.concat(reply[1]);
    } while (cursor !== '0');

    if (keys.length > 0) {
        await redisClient.del(...keys);
        logger.info(`Удалено ключей: ${keys.length}`);
    } else {
        logger.info('Ключи не найдены.');
    }
}