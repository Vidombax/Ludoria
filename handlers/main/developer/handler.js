import db from '../../../db.js'
import logger from '../../../logger.js'
import axios from 'axios'

class DeveloperHandler {
    async searchDeveloper(req, res) {
        const funcName = 'searchDeveloper';

        const { name } = req.params;

        const client = await db.connect();

        try {
            const { rows } = await client.query(
                `SELECT id_developer, name FROM developers WHERE LOWER(name) LIKE '%' || $1 || '%' LIMIT 5`,
                [name.toLowerCase()]
            );

            let developers = rows;

            if (developers.length >= 5) {
               logger.info(`${funcName}: Получили 5 или больше разработчиков к RAWG не обращаемся`);
               return res.status(200).json({ message: 'Получили имена разработчиков', developers: developers.slice(0, 5) });
            }

            if (developers.length < 5) {
                logger.info(`${funcName}: Получили ${developers.length} разработчиков с БД обращаемся к RAWG`);

                let pageNumber = 1;
                let isTimeout = false;
                let timeoutId;

                timeoutId = setTimeout(() => {
                    isTimeout = true;
                    logger.info(`${funcName}: Таймаут 12 секунд, возвращаем что есть`);
                    if (!res.headersSent) {
                        res.status(200).json({
                            message: 'Получили имена разработчиков',
                            developers: developers.slice(0, 5)
                        });
                    }
                }, 12000);

                while (developers.length < 5 && !isTimeout) {
                    try {
                        const rawgDevelopers = await axios.get(
                            `https://api.rawg.io/api/developers?key=${process.env.RAWG_API}&page=${pageNumber}&page_size=250`
                        );

                        let addedCount = 0;
                        for (const rawgDeveloper of rawgDevelopers.data.results) {
                            if (developers.length >= 5 || isTimeout) break;

                            const isNameUnique = developers.every(row => row.name !== rawgDeveloper.name);
                            if (isNameUnique && rawgDeveloper.name.toLowerCase().includes(name.toLowerCase())) {
                                developers.push({
                                    id_developer: rawgDeveloper.id,
                                    name: rawgDeveloper.name,
                                    isRAWG: true
                                });
                                addedCount++;
                                logger.info(`${funcName}: Добавили разработчика ${rawgDeveloper.name}`);
                            }
                        }

                        if (addedCount > 0) {
                            logger.info(`${funcName}: Добавили ${addedCount} разработчиков из RAWG`);
                        } else {
                            logger.info(`${funcName}: Не нашли разработчиков по имени на странице номер ${pageNumber}`);
                        }

                        pageNumber++;

                        // Если это последняя страница, выходим
                        if (!rawgDevelopers.data.next) {
                            logger.info(`${funcName}: Достигнут конец списка разработчиков RAWG`);
                            break;
                        }

                        await new Promise(resolve => setTimeout(resolve, 100));

                    } catch (error) {
                        logger.error(`${funcName}: Ошибка при запросе к RAWG:`, error);
                        break;
                    }
                }

                clearTimeout(timeoutId);

                if (!res.headersSent) {
                    return res.status(200).json({
                        message: 'Получили имена разработчиков',
                        developers: developers.slice(0, 5)
                    });
                }
            }
        }
        catch (e) {
            logger.error(`${funcName}: Ошибка поиска разработчика:`, e);
            res.status(500).json({ message: 'Ошибка на стороне сервера' });
        }
        finally {
            client.release();
        }
    }
}

export default new DeveloperHandler();
