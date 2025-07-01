import axios from 'axios'
import db from '../../../db.js'
import {deleteRedisValue, getRedisValue, setRedisValue} from '../../../redis.js'
import logger from '../../../logger.js'

async function processDevelopers(gameDataForDB, idGame, client) {
    const funcName = 'processDevelopers';

    let developers = [];

    for (let i = 0; i < gameDataForDB.developers.length; i++) {
        const findDeveloperInDB = await client.query(
            'SELECT * FROM developers ' +
            'WHERE name = $1',
            [gameDataForDB.developers[i].name]
        );

        if (findDeveloperInDB.rows.length > 0) {
            logger.info(`${funcName}: Разработчик ${gameDataForDB.developers[i].name} есть в БД, связываем его с игрой`);
            const addDeveloperToGame = await client.query(
                'INSERT INTO developers_to_game (id_game, id_developer) VALUES ($1, $2) ' +
                'RETURNING *',
                [idGame, findDeveloperInDB.rows[0].id_developer]
            );

            if (i === gameDataForDB.developers.length - 1) {
                const getDevelopersByGame = await client.query(
                    'SELECT developers.name, developers.logo, developers.id_developer FROM developers ' +
                    'INNER JOIN public.developers_to_game dtg ' +
                    'ON developers.id_developer = dtg.id_developer ' +
                    'WHERE dtg.id_game = $1', [idGame]
                );

                developers.push(getDevelopersByGame.rows);
            }
        } else {
            logger.info(`${funcName}: Не нашли разработчика в БД, создаем запись`);
            const createDeveloper = await client.query(
                'INSERT INTO developers (name, logo) VALUES ($1, null) ' +
                'RETURNING *',
                [gameDataForDB.developers[i].name]
            );

            developers.push(createDeveloper.rows[0]);

            if (i === gameDataForDB.developers.length - 1) {
                const getDevelopersByGame = await client.query(
                    'SELECT developers.name, developers.logo, developers.id_developer FROM developers ' +
                    'INNER JOIN public.developers_to_game dtg ' +
                    'ON developers.id_developer = dtg.id_developer ' +
                    'WHERE dtg.id_game = $1', [idGame]
                );

                developers.push(getDevelopersByGame.rows);
            }

            logger.info(`${funcName}: Связываем разработчика ${gameDataForDB.developers[i].name} с игрой`);
            const addDeveloperToGame = await client.query(
                'INSERT INTO developers_to_game (id_game, id_developer) VALUES ($1, $2)',
                [idGame, createDeveloper.rows[0].id_developer]
            );
        }
    }

    return developers;
}

class GameHandler {
    async getGameInfo(req, res) {
        const funcName = 'getGameInfo';

        const { id } = req.params;
        let dataForRedis = {};

        const client = await db.connect();

        try {
            let gameInfo = await getRedisValue(`game-info:${id}`);

            if (gameInfo !== null) {
                res.status(200).json({ message: 'Получили данные об игре', game: JSON.parse(gameInfo), status_rawg: false });
                logger.info(`${funcName}: Получили данные с редиса`);
            }
            else {
                await client.query('BEGIN');

                const getGameInfo = await client.query(
                    'SELECT * FROM games ' +
                    'WHERE id_game = $1',
                    [id]
                );

                if (getGameInfo.rows.length > 0) {
                    const getGenresByGame = await client.query(
                        'SELECT genres.name, genres.id_genre FROM genres ' +
                        'INNER JOIN public.genre_to_game gtg ' +
                        'ON genres.id_genre = gtg.id_genre ' +
                        'WHERE gtg.id_game = $1',
                        [id]
                    );

                    const getGameScore = await client.query(
                        'SELECT AVG(score) as game_score FROM scores ' +
                        'WHERE id_game = $1',
                        [id]
                    );

                    if (getGameInfo.rows[0].description === null) {
                        logger.info(`${funcName}: Отправляем запрос в RAWG для получение описания для игры ${getGameInfo.rows[0].name}`);
                        const getInfoAboutGame = await axios.get(`https://api.rawg.io/api/games/${getGameInfo.rows[0].id_from_rawg}?key=${process.env.RAWG_API}&search_precise=true`);

                        let gameDataForDB = {};
                        gameDataForDB.description = getInfoAboutGame.data.description_raw;
                        gameDataForDB.developers = getInfoAboutGame.data.publishers;

                        logger.info(`${funcName}: Получили данные с RAWG и создали JSON объект`);
                        logger.info(`${funcName}: ` + JSON.stringify(gameDataForDB));

                        const updateGameDescription = await client.query(
                            'UPDATE games SET description = $1 ' +
                            'WHERE id_game = $2 ' +
                            'RETURNING *',
                            [gameDataForDB.description, id]
                        );

                        dataForRedis = { ...updateGameDescription.rows[0] };

                        if (gameDataForDB.developers.length > 0) {
                            logger.info(`${funcName}: Проверяем добавлены ли разработчики в нашу базу`);
                            let developers = [];

                            for (let i = 0; i < gameDataForDB.developers.length; i++) {
                                const findDeveloperInDB = await client.query(
                                    'SELECT * FROM developers ' +
                                    'WHERE name = $1',
                                    [gameDataForDB.developers[i].name]
                                );

                                if (findDeveloperInDB.rows.length > 0) {
                                    logger.info(`${funcName}: Разработчик ${gameDataForDB.developers[i].name} есть в БД связываем его с игрой`);
                                    const addDeveloperToGame = await client.query(
                                        'INSERT INTO developers_to_game (id_game, id_developer) VALUES ($1, $2) ' +
                                        'RETURNING *',
                                        [id, findDeveloperInDB.rows[0].id_developer]
                                    );

                                    if (i === gameDataForDB.developers.length - 1) {
                                        const getDevelopersByGame = await client.query(
                                            'SELECT developers.name, developers.logo, developers.id_developer FROM developers ' +
                                            'INNER JOIN public.developers_to_game dtg ' +
                                            'ON developers.id_developer = dtg.id_developer ' +
                                            'WHERE dtg.id_game = $1', [id]
                                        );

                                        developers.push(getDevelopersByGame.rows);
                                        dataForRedis.developers = developers;
                                    }
                                }
                                else {
                                    logger.info(`${funcName}: Не нашли разработчика в БД создаем запись`);
                                    const createDeveloper = await client.query(
                                        'INSERT INTO developers (name, logo) VALUES ($1, null) ' +
                                        'RETURNING *',
                                        [gameDataForDB.developers[i].name]
                                    );

                                    developers.push(createDeveloper.rows[0]);

                                    if (i === gameDataForDB.developers.length - 1) {
                                        dataForRedis.developers = developers;
                                    }

                                    logger.info(`${funcName}: Связываем разработчика ${gameDataForDB.developers[i].name} с игрой`);
                                    const addDeveloperToGame = await client.query(
                                        'INSERT INTO developers_to_game (id_game, id_developer) VALUES ($1, $2)',
                                        [id, createDeveloper.rows[0].id_developer]
                                    );
                                }
                            }

                        }
                        else {
                            logger.info(`${funcName}: С RAWG не получили никаких разработчиков`);
                            dataForRedis.developers = [];
                        }

                        dataForRedis.genres = getGenresByGame.rows;
                        if (getGameScore.rows[0].game_score !== null) {
                            dataForRedis.score = parseFloat(getGameScore.rows[0].game_score).toFixed(2);
                        }
                        else {
                            dataForRedis.score = null;
                        }

                        logger.info(`${funcName}: Собрали JSON объект для клиента`);

                        await setRedisValue(`game-info:${id}`, JSON.stringify(dataForRedis));
                        res.status(200).json({ message: 'Получили данные об игре', game: dataForRedis, status_rawg: false });
                    }
                    else {
                        logger.info(`${funcName}: Все данные присутствуют отправляем`);

                        dataForRedis = { ...getGameInfo.rows[0] };

                        const getDevelopersByGame = await client.query(
                            'SELECT developers.name, developers.logo, developers.id_developer FROM developers ' +
                            'INNER JOIN public.developers_to_game dtg ' +
                            'ON developers.id_developer = dtg.id_developer ' +
                            'WHERE dtg.id_game = $1', [id]
                        );

                        dataForRedis.developers = getDevelopersByGame.rows;
                        dataForRedis.genres = getGenresByGame.rows;
                        if (getGameScore.rows[0].game_score !== null) {
                            dataForRedis.score = parseFloat(getGameScore.rows[0].game_score).toFixed(2);
                        }
                        else {
                            dataForRedis.score = null;
                        }

                        logger.info(`${funcName}: Собрали JSON объект для клиента`);

                        await setRedisValue(`game-info:${id}`, JSON.stringify(dataForRedis));
                        res.status(200).json({ message: 'Получили данные об игре', game: dataForRedis, status_rawg: false });
                    }
                }
                else {
                    logger.info(`${funcName}: Не нашли игру по основному ID. Проверяем по ID RAWG`);
                    const getInfoAboutGame = await axios.get(`https://api.rawg.io/api/games/${id}?key=${process.env.RAWG_API}&search_precise=true`);

                    let gameDataForDB = {};
                    let idGame;
                    let isFoundByIdRAWG = false;

                    gameDataForDB.developers = getInfoAboutGame.data.developers;
                    gameDataForDB.genres = getInfoAboutGame.data.genres;

                    if (getInfoAboutGame.data) {
                        const checkIdByRawg = await client.query(
                            'SELECT * FROM games ' +
                            'WHERE id_from_rawg = $1',
                            [getInfoAboutGame.data.id]
                        );

                        if (checkIdByRawg.rows.length > 0) {
                            logger.info(`${funcName}: Игра есть в базе нашли по ID RAWG: ${id}`);
                            idGame = checkIdByRawg.rows[0].id_game;

                            dataForRedis = { ...checkIdByRawg.rows[0] };

                            const getGameScore = await client.query(
                                'SELECT AVG(score) as game_score FROM scores ' +
                                'WHERE id_game = $1',
                                [idGame]
                            );

                            if (getGameScore.rows[0].game_score !== null) {
                                dataForRedis.score = parseFloat(getGameScore.rows[0].game_score).toFixed(2);
                            }
                            else {
                                dataForRedis.score = null;
                            }


                            isFoundByIdRAWG = true;
                        }
                        else {
                            logger.info(`${funcName}: Добавляем игру в БД`);

                            gameDataForDB.name = getInfoAboutGame.data.name_original;
                            gameDataForDB.main_picture = getInfoAboutGame.data.background_image;
                            gameDataForDB.description = getInfoAboutGame.data.description;
                            gameDataForDB.release_date = getInfoAboutGame.data.released;
                            gameDataForDB.id_from_rawg = getInfoAboutGame.data.id;

                            const addGameToDB = await client.query(
                                'INSERT INTO games (name, main_picture, description, release_date, id_from_rawg) ' +
                                'VALUES ($1, $2, $3, $4, $5) ' +
                                'RETURNING *',
                                [
                                    gameDataForDB.name,
                                    gameDataForDB.main_picture,
                                    gameDataForDB.description,
                                    gameDataForDB.release_date,
                                    gameDataForDB.id_from_rawg
                                ]
                            );

                            idGame = addGameToDB.rows[0].id_game;

                            dataForRedis = { ...addGameToDB.rows };

                            dataForRedis.score = null;
                        }

                        if (gameDataForDB.genres.length > 0) {
                            if (isFoundByIdRAWG !== true) {
                                logger.info(`${funcName}: Связываем жанры с игрой`);
                                for (let i = 0; i < gameDataForDB.genres.length; i++) {
                                    const getGenreFromDB = await client.query(
                                        'SELECT * FROM genres ' +
                                        'WHERE name = $1',
                                        [gameDataForDB.genres[i].name]
                                    );

                                    const addGenreToGame = await client.query(
                                        'INSERT INTO genre_to_game (id_game, id_genre) VALUES ($1, $2)',
                                        [idGame, getGenreFromDB.rows[0].id_genre]
                                    );
                                }
                            }

                            const getGenresByGame = await client.query(
                                'SELECT genres.name, genres.id_genre FROM genres ' +
                                'INNER JOIN public.genre_to_game gtg ' +
                                'ON genres.id_genre = gtg.id_genre ' +
                                'WHERE gtg.id_game = $1',
                                [idGame]
                            );

                            dataForRedis.genres = getGenresByGame.rows;
                        }

                        if (gameDataForDB.developers.length > 0) {
                            logger.info(`${funcName}: Проверяем добавлены ли разработчики в нашу базу`);
                            let developers = [];

                            if (isFoundByIdRAWG === true) {
                                const getDevelopersByGame = await client.query(
                                    'SELECT developers.name, developers.logo, developers.id_developer FROM developers ' +
                                    'INNER JOIN public.developers_to_game dtg ' +
                                    'ON developers.id_developer = dtg.id_developer ' +
                                    'WHERE dtg.id_game = $1', [idGame]
                                );

                                if (getDevelopersByGame.rows.length > 0) {
                                    developers.push(getDevelopersByGame.rows);
                                    dataForRedis.developers = developers[0];
                                }
                                else {
                                    const developers = await processDevelopers(gameDataForDB, idGame, client);
                                    dataForRedis.developers = developers;
                                }
                            }
                            else {
                                const developers = await processDevelopers(gameDataForDB, idGame, client);
                                dataForRedis.developers = developers;
                            }
                        }
                        else {
                            logger.info(`${funcName}: С RAWG не получили никаких разработчиков`);
                            dataForRedis.developers = [];
                        }

                        logger.info(`${funcName}: Собрали JSON объект для клиента`);

                        await setRedisValue(`game-info:${idGame}`, JSON.stringify(dataForRedis));
                        await deleteRedisValue(`page-released-date:1`);
                        res.status(200).json({ message: 'Получили данные об игре', game: dataForRedis, status_rawg: true });

                    }
                    else {
                        res.status(404).json({ message: 'Данной игры не было найдено' });
                    }
                }

                await client.query('COMMIT');
            }
        }
        catch (e) {
            await client.query('ROLLBACK');
            logger.error(`${funcName}: Ошибка получение информации игры:`, e);
            res.status(500).json({ message: 'Ошибка на стороне сервера' });
        }
        finally {
            client.release();
        }
    }
    async getGamesByReleaseDate(req, res) {
        const funcName = 'getGamesByReleaseDate';

        const { page = 1 } = req.query;
        const limit = 20
        const offset = (page - 1) * limit;

        const client = await db.connect();

        try {
            let pageInfo = await getRedisValue(`page-released-date:${page}`);

            if (pageInfo !== null) {
                pageInfo = JSON.parse(pageInfo);

                const response = {
                    message: pageInfo.message,
                    data: pageInfo.data,
                    pagination: pageInfo.pagination
                };

                res.status(200).json(response);
                logger.info(`${funcName}: Получили данные с редиса`);
            }
            else {

                await client.query('BEGIN');

                const { rows } = await client.query(
                    'SELECT id_game, name, main_picture, release_date, id_from_rawg FROM games ' +
                    'ORDER BY release_date DESC LIMIT $1 OFFSET $2',
                    [limit, offset]
                );

                if (rows.length > 0) {
                    logger.info(`${funcName}: Добавляем ключ, что игра не из RAWG и данные для игр на главной странице`);

                    for (const row of rows) {
                        const getGenresByGame = await client.query(
                            'SELECT genres.name FROM genres ' +
                            'INNER JOIN public.genre_to_game gtg ' +
                            'ON genres.id_genre = gtg.id_genre ' +
                            'WHERE gtg.id_game = $1',
                            [row.id_game]
                        );

                        const getGameScore = await client.query(
                            'SELECT AVG(score) as game_score FROM scores ' +
                            'WHERE id_game = $1',
                            [row.id_game]
                        );

                        const getDevelopersByGame = await client.query(
                            'SELECT developers.name FROM developers ' +
                            'INNER JOIN public.developers_to_game dtg ' +
                            'ON developers.id_developer = dtg.id_developer ' +
                            'WHERE dtg.id_game = $1',
                            [row.id_game]
                        );

                        row.genres = getGenresByGame.rows;
                        row.score = getGameScore.rows[0].game_score;
                        row.developers = getDevelopersByGame.rows;
                        row.isRAWG = false;
                    }
                }
                else {
                    logger.info(`${funcName}: Игры из базы закончились`);
                }

                logger.info(`${funcName}: Теперь получаем игры с RAWG`);
                const getGames = await axios.get(`https://api.rawg.io/api/games?key=${process.env.RAWG_API}&ordering=released&search_precise=true&page=${page}&page_size=${limit}`);

                let rowsFromRAWG = [];

                for (const value of getGames.data.results) {
                    const isNameUnique = rows.every(row => row.name !== value.name);
                    if (isNameUnique) {
                        let rawgJSON = {};
                        rawgJSON.name = value.name;
                        rawgJSON.main_picture = value.background_image;
                        rawgJSON.release_date = value.released;
                        rawgJSON.id_from_rawg = value.id;
                        rawgJSON.isRAWG = true;

                        rowsFromRAWG.push(rawgJSON);
                    }
                }


                rowsFromRAWG.push(...rows);
                rowsFromRAWG.sort((a, b) => b.release_date - a.release_date);

                const totalCount = getGames.data.count
                const totalPages = Math.ceil(totalCount / limit);

                let pageForRedis = JSON.stringify({
                    message: 'Получили данные',
                    data: rowsFromRAWG,
                    pagination: {
                        total: parseInt(totalCount),
                        totalPages,
                        currentPage: parseInt(page),
                        limit: parseInt(limit)
                    }
                });

                await setRedisValue(`page-released-date:${page}`, pageForRedis);

                res.status(200).json(
                    {
                        message: 'Получили данные',
                        data: rowsFromRAWG,
                        pagination: {
                            total: parseInt(totalCount),
                            totalPages,
                            currentPage: parseInt(page),
                            limit: parseInt(limit)
                        }
                    }
                );

                await client.query('COMMIT');
            }
        }
        catch (e) {
            await client.query('ROLLBACK');
            logger.error(`${funcName}: Ошибка получения страницы:`, e);
            res.status(500).json({ message: 'Ошибка на стороне сервера' });
        }
        finally {
            client.release();
        }
    }
    async searchGameByName(req, res) {
        const funcName = 'searchGameByName';

        const { name } = req.body;

        const client = await db.connect();

        try {
            await client.query('BEGIN');

            const getGamesByName = await client.query(
                'SELECT id_game AS id, name, main_picture, release_date, id_from_rawg FROM games ' +
                'WHERE LOWER(name) LIKE $1',
                [`%${name}%`]
            );

            for (const gamesByNameElement of getGamesByName.rows) {
                gamesByNameElement.isRAWG = false;
            }

            if (getGamesByName.rows.length < 15) {
                logger.info(`${funcName}: Данных по поиску с нашей базы не хватило добавляем еще из RAWG`);
                const pageSize = 15 - getGamesByName.rows.length;
                let rowsFromRAWG = [];
                const getGamesBySearch = await axios.get(`https://api.rawg.io/api/games?key=${process.env.RAWG_API}&search=${name}&search_precise=true&page_size=${pageSize}`);

                for (const value of getGamesBySearch.data.results) {
                    const isNameUnique = getGamesByName.rows.every(row => row.name !== value.name);
                    if (isNameUnique) {
                        let rawgJSON = {};
                        rawgJSON.name = value.name;
                        rawgJSON.main_picture = value.background_image;
                        rawgJSON.release_date = value.released;
                        rawgJSON.id = value.id;
                        rawgJSON.isRAWG = true;

                        rowsFromRAWG.push(rawgJSON);
                    }
                }

                rowsFromRAWG.push(...getGamesByName.rows);

                const sortedData = [...rowsFromRAWG].sort((a, b) => {
                   if (a.isRAWG === b.isRAWG) return 0;
                    if (a.isRAWG === false) return -1;
                    return 1;
                });

                res.status(200).json({ message: 'Получили данные по поиску', data: sortedData});
            }
            else {
                for (const row of getGamesByName.rows) {
                    row.isRAWG = false;
                }
                res.status(200).json({ message: 'Получили данные по поиску', data: getGamesByName.rows });
            }

            await client.query('COMMIT');
        }
        catch (e) {
            await client.query('ROLLBACK');
            logger.error(`${funcName}: Ошибка поиска игры:`, e);
            res.status(500).json({ message: 'Ошибка на стороне сервера' });
        }
        finally {
            client.release();
        }
    }
    async getFeedbacksByGame(req, res) {
        const funcName = 'getFeedbacksByGame';

        const { id } = req.params;
        const client = await db.connect();

        try {
            const getFeedbackByRedis = await getRedisValue(`feedback-to-game:${id}`);
            if (getFeedbackByRedis !== null) {
                res.status(200).json({ message: 'Получили отзывы по игре', data: JSON.parse(getFeedbackByRedis), count: JSON.parse(getFeedbackByRedis).length });
                logger.info(`${funcName}: Получили данные с редиса`);
            }
            else {
                await client.query('BEGIN');

                const getFeedbacks = await client.query(
                    'SELECT id_feedback, id_user, description, header, create_date FROM feedbacks ' +
                    'WHERE id_game = $1',
                    [id]
                );

                if (getFeedbacks.rows.length) {
                    for (const feedback of getFeedbacks.rows) {
                        const getNegativeScore = await client.query(
                            'SELECT COUNT(score) AS negative FROM feedback_score ' +
                            'WHERE id_feedback = $1 AND score = false',
                            [feedback.id_feedback]
                        );

                        const getPositiveScore = await client.query(
                            'SELECT COUNT(score) AS positive FROM feedback_score ' +
                            'WHERE id_feedback = $1 AND score = true',
                            [feedback.id_feedback]
                        );

                        const getUserData = await client.query(
                            'SELECT name, photo FROM users ' +
                            'WHERE id_user = $1',
                            [feedback.id_user]
                        );

                        feedback.feedback_score = getPositiveScore.rows[0].positive - getNegativeScore.rows[0].negative;
                        feedback.user_name = getUserData.rows[0].name;
                        feedback.user_photo = getUserData.rows[0].photo;
                    }

                    await setRedisValue(`feedback-to-game:${id}`, JSON.stringify(getFeedbacks.rows));
                    res.status(200).json({ message: 'Получили отзывы по игре', data: getFeedbacks.rows, count: getFeedbacks.rows.length });
                }
                else {
                    res.status(200).json({ message: 'Отзывов по игре не было найдено' });
                }

                await client.query('COMMIT');
            }
        }
        catch (e) {
            await client.query('ROLLBACK');
            logger.error(`${funcName}: Ошибка получения отзывов об игре:`, e);
            res.status(500).json({ message: 'Ошибка на стороне сервера' });
        }
        finally {
            client.release();
        }
    }
    async getSubsToGame(req, res) {
        const funcName = 'getSubsToGame';

        const { id } = req.params;

        const client = await db.connect();

        try {
            await client.query('BEGIN');

            let index = 0;

            const data = {
                complete: 0,
                playing: 0,
                dropped: 0,
                planned: 0,
            };

            for (let [type, value] of Object.entries(data)) {
                const sub = await client.query(
                    'SELECT COUNT(*) FROM following_to_game ' +
                    'WHERE follow_type = $1 AND id_following = $2', [index, id]
                );
                data[type] = Number(sub.rows[0].count);

                index++;
            }

            res.status(200).json({ message: 'Получили список', data: data });

            await client.query('COMMIT');
        }
        catch (e) {
            await client.query('ROLLBACK');
            logger.error(`${funcName}: Ошибка получения подписок на игру:`, e);
            res.status(500).json({ message: 'Ошибка на стороне сервера' });
        }
        finally {
            client.release();
        }
    }
    async getGamesByPopularity(req, res) {
        const funcName = 'getGamesByPopularity';

        const { page = 1 } = req.query;
        const limit = 20
        const offset = (page - 1) * limit;

        const client = await db.connect();

        try {
            if (page < 1) {
                return res.status(400).json({ message: 'Номер страницы должен быть положительным числом' });
            }

            const { rows } = await client.query(`
                SELECT
                    g.id_game,
                    g.name,
                    g.main_picture,
                    g.release_date,
                    g.id_from_rawg,
                    COALESCE(AVG(s.score)::float, 0) AS game_score,
                    (COUNT(f.id_game)::int + COUNT(p.id_game)::int + COUNT(s.id_game)::int) AS popularity_score,
                    COALESCE(ARRAY_AGG(DISTINCT gen.name) FILTER (WHERE gen.name IS NOT NULL), '{}') AS genres,
                    COALESCE(ARRAY_AGG(DISTINCT dev.name) FILTER (WHERE dev.name IS NOT NULL), '{}') AS developers
                FROM games g
                         LEFT JOIN genre_to_game gtg ON g.id_game = gtg.id_game
                         LEFT JOIN genres gen ON gtg.id_genre = gen.id_genre
                         LEFT JOIN developers_to_game dtg ON g.id_game = dtg.id_game
                         LEFT JOIN developers dev ON dtg.id_developer = dev.id_developer
                         LEFT JOIN scores s ON g.id_game = s.id_game
                         LEFT JOIN feedbacks f ON g.id_game = f.id_game
                         LEFT JOIN posts p ON g.id_game = p.id_game
                GROUP BY g.id_game, g.name, g.main_picture, g.release_date, g.id_from_rawg
                ORDER BY
                    popularity_score DESC
                LIMIT $1 OFFSET $2`,
                [limit, offset]
            );

            const countResult = await client.query('SELECT COUNT(*)::int AS total_count FROM games');
            const totalCount = countResult.rows[0].total_count;

            const totalPages = Math.ceil(totalCount / limit);

            res.status(200).json({
                message: 'Игры по популярности',
                data: rows.map(row => ({
                    id_game: row.id_game,
                    name: row.name,
                    main_picture: row.main_picture,
                    release_date: row.release_date,
                    id_from_rawg: row.id_from_rawg,
                    score: row.game_score,
                    genres: row.genres.filter(Boolean),
                    developers: row.developers.filter(Boolean),
                    count_feedbacks: row.count_feedbacks,
                    count_posts: row.count_posts,
                    count_scores: row.count_scores,
                    popularity_score: row.popularity_score
                })),
                pagination: {
                    totalItems: totalCount,
                    totalPages,
                    currentPage: page,
                    limit
                }
            });
        }
        catch (e) {
            logger.error(`${funcName}: Ошибка получения популярных игр:`, e);
            res.status(500).json({ message: 'Ошибка на стороне сервера' });
        }
        finally {
            client.release();
        }
    }
    async getGamesOnGamesPage(req, res) {
        const funcName = 'getGamesOnGamesPage';

        const developers = req.query.developers ? req.query.developers.split(',') : [];
        const genres = req.query.genres ? req.query.genres.split(',') : [];
        const scores = req.query.scores ? req.query.scores.split(',') : [];
        const following = req.query.following ? req.query.following.split(',') : [];

        const client = await db.connect();
    
        try {
            await client.query('BEGIN');

            let query = '';

            if (scores.length > 0) {
                query += ` AND s.score = ANY (ARRAY[${scores}])`;
            }

            if (genres.length > 0) {
                query += ` AND id_genre = ANY (ARRAY[${genres}])`;
            }

            if (developers.length > 0) {
                query += ` AND id_developer = ANY (ARRAY[${developers}])`;
            }

            if (following.length > 0) {
                query += ` AND fo = ANY (ARRAY[${following}])`;
            }

            const games = await client.query(query);

            if (games.rows.length > 0) {
                res.status(200).json({ message: 'Получили список игр', data: games.rows });
            }
            else {
                res.status(200).json({ message: 'Список игр по фильтрам пустой' });
            }
    
            await client.query('COMMIT');
        }
        catch (e) {
            await client.query('ROLLBACK');
            logger.error(`${funcName}: Ошибка получения игр:`, e);
            res.status(500).json({ message: 'Ошибка на стороне сервера' });
        }
        finally {
            client.release();
        }
    }
}

export default new GameHandler();
