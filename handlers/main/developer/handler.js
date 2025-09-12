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
               return res.status(200).json({ message: 'Получили имена разработчиков', developers: developers.slice(0, 4) });
            }

            if (developers.length < 5) {
                logger.info(`${funcName}: Получили ${developers.length} разработчиков обращаемся к RAWG`);
                let pageNumber = 1;

                while (developers.length !== 5) {
                    const rawgDevelopers = await axios.get(`https://api.rawg.io/api/developers?key=${process.env.RAWG_API}&page=${pageNumber}&page_size=250`);

                    let i = 0;
                    for (const rawgDeveloper of rawgDevelopers.data.results) {
                        const isNameUnique = developers.every(row => row.name !== rawgDeveloper.name);
                        if (isNameUnique) {
                            if (rawgDeveloper.name.toLowerCase().includes(name)) {
                                let rawgJSON = {
                                    id: rawgDeveloper.id,
                                    name: rawgDeveloper.name,
                                    isRAWG: true
                                };

                                developers.push(rawgJSON);
                                logger.info(`${funcName}: Добавили разработчика ${rawgJSON.name}`);
                                i++;
                            }

                            if (developers.length >= 5) {
                                break;
                            }
                        }
                    }

                    if (i !== 0) {
                        logger.info(`${funcName}: Добавили ${i} разработчиков из RAWG`);
                    }
                    else {
                        logger.info(`${funcName}: Не нашли разработчиков по имени на странице номер ${pageNumber}`);
                    }

                    pageNumber++;
                }

                res.status(200).json({ message: 'Получили имена разработчиков', developers: developers.slice(0, 4) });
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
