import db from '../../../db.js'
import { getRedisValue, setRedisValue } from '../../../redis.js'
import logger from '../../../logger.js'

class GenreHandler {
    async getAllGenres(req, res) {
        const funcName = 'getAllGenres';

        const client = await db.connect();

        try {
            let genresInfo = await getRedisValue(`genres`);
            if (genresInfo !== null) {
                res.status(200).json({ message: 'Получили данные об игре', data: JSON.parse(genresInfo) });
                logger.info(`${funcName}: Получили данные с редиса`);
            }
            else {
                const genres = await client.query('SELECT * FROM genres');

                if (genres.rows.length > 0) {
                    await setRedisValue(`genres`, JSON.stringify(genres.rows));
                    res.status(200).json({ message: 'Получили жанры', data: genres.rows });
                }
                else {
                    res.status(400).json({ message: 'Список жанров пустой' });
                }
            }
        }
        catch (e) {
            logger.error(`${funcName}: Ошибка получения всех жанров:`, e);
            res.status(500).json({ message: 'Ошибка на стороне сервера' });
        }
        finally {
            client.release();
        }
    }
}

export default new GenreHandler();
