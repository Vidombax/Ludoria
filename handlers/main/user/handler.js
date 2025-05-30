import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import axios from 'axios'
import db from '../../../db.js'
import {getRedisValue, setRedisValue, deleteRedisValue} from '../../../redis.js'
import logger from '../../../logger.js'

class UserHandler {
    async createUser(req, res) {
        const funcName = 'createUser';

        const { name, email, password } = req.body;

        const client = await db.connect();

        try {
            await client.query('BEGIN');

            //Ищем аккаунты на эту почту
            const getUser = await client.query(
                'SELECT email_user FROM users ' +
                'WHERE email_user = $1',
                [email]
            );

            if (getUser.rows.length === 0) {
                const hashedPassword = await bcrypt.hash(password, 10);

                //Создаем новый аккаунт
                const createUser = await client.query(
                    'INSERT INTO users (name, email_user, password_user, user_role) ' +
                    'VALUES ($1, $2, $3, 0)' +
                    'RETURNING *',
                    [name.trim(), email, hashedPassword]
                );

                const token = jwt.sign(
                    { email: email },
                    process.env.SECRET_KEY,
                    { expiresIn: '24h' }
                );

                res.status(201).json({ token, message: 'Пользователь был зарегистрирован', id: createUser.rows[0].id_user });
            }
            else {
                res.status(409).json({ message: 'На эту почту уже существует аккаунт' });
            }
            await client.query('COMMIT');
        }
        catch (e) {
            await client.query('ROLLBACK');
            logger.error(`${funcName}: Ошибка создания пользователя:`, e);
            res.status(500).json({ message: 'Ошибка создания пользователя' });
        }
        finally {
            client.release();
        }
    }
    async updateUser(req, res) {
        const funcName = 'updateUser';

        const data = req.body;

        const client = await db.connect();

        try {
            await client.query('BEGIN');

            //Сначала нужно понять что именно нам надо поменять
            const getUserInfo = await client.query(
                'SELECT * FROM users ' +
                'WHERE id_user = $1',
                [data.id]
            );

            if (getUserInfo.rows.length > 0) {
                let needChangeInfo = {};
                for (const key in getUserInfo.rows[0]) {
                    //Если есть разница между данными полученными и из базы
                    if (data[key] !== undefined && data[key] !== getUserInfo.rows[0][key]) {
                        if (key === 'password_user') {
                            const isPasswordMatch = await bcrypt.compare(data[key], getUserInfo.rows[0][key]);

                            if (!isPasswordMatch) {
                                data.password_user = await bcrypt.hash(data.password_user, 10);
                                needChangeInfo[key] = data.password_user;
                            }
                        }
                        else if (data[key] !== getUserInfo.rows[0][key]) {
                            needChangeInfo[key] = data[key];
                        }
                    }
                }

                if (Object.keys(needChangeInfo).length > 0) {
                    logger.info(`${funcName}: Данные которые нужно обновить`, needChangeInfo);

                    const setClause = Object.keys(needChangeInfo)
                        .map((key, index) => `${key} = $${index + 2}`)
                        .join(', ');

                    const query = `
                        UPDATE users
                        SET ${setClause}
                        WHERE id_user = $1
                    `;

                    const values = [data.id, ...Object.values(needChangeInfo)];

                    await client.query(query, values);

                    await deleteRedisValue(`user:${data.id}`);

                    res.status(200).json({ message: 'Данные обновлены' });
                }
                else {
                    logger.info(`${funcName}: Данные пользователя ${data.id} такие же, не обновляем`);
                    res.status(200).json({ message: 'Данные обновлены' });
                }
            }
            else {
                res.status(404).json({ message: 'Пользователя с таким ID не было найдено' });
            }

            await client.query('COMMIT');
        }
        catch (e) {
            await client.query('ROLLBACK');
            logger.error(`${funcName}: Ошибка обновления пользователя:`, e);
            res.status(500).json({ message: 'Ошибка на стороне сервера' });
        }
        finally {
            client.release();
        }
    }
    async updateUserPhoto(req, res) {
        const funcName = 'updateUserPhoto';

        if (!req.file) {
            return res.status(400).json({ message: 'Файл не был загружен' });
        }

        const photoName = '/profilePictures/' + req.file.filename;
        const { id } = req.body;

        const client = await db.connect();

        try {
            await client.query('BEGIN');

            const user = await client.query(
                'UPDATE users SET photo = $1 ' +
                'WHERE id_user = $2 ' +
                'RETURNING photo',
                [photoName, id]
            );

            await deleteRedisValue(`user:${id}`);

            res.status(200).json({ message: 'Фотография обновлена', photo: user.rows[0].photo });

            await client.query('COMMIT');
        }
        catch (e) {
            await client.query('ROLLBACK');
            logger.error(`${funcName}: Ошибка обновления фотографии:`, e);
            res.status(500).json({ message: 'Ошибка на стороне сервера' });
        }
        finally {
            client.release();
        }
    }
    async authorizationUser(req, res) {
        const funcName = 'authorizationUser';

        const { email, password } = req.body;

        const client = await db.connect();
        try {
            await client.query('BEGIN');

            //Ищем пользователя
            const getUser = await client.query(
                'SELECT * from users ' +
                'WHERE email_user = $1',
                [email]
            );

            if (getUser.rows.length !== 0) {
                const isValidPassword = await bcrypt.compare(password, getUser.rows[0].password_user)
                if (isValidPassword) {
                    const token = jwt.sign(
                        { email: email },
                        process.env.SECRET_KEY,
                        { expiresIn: '24h' }
                    );

                    res.json({ token, message: 'Пользователь был найден', id: getUser.rows[0].id_user, userRole: getUser.rows[0].user_role });
                }
                else {
                    res.status(403).json({ message: 'Неправильный пароль' });
                }
            }
            else {
                res.status(404).json({ message: 'Пользователя с данной почтой не найдено' });
            }

            await client.query('COMMIT');
        }
        catch (e) {
            await client.query('ROLLBACK');
            logger.error(`${funcName}: Ошибка авторизации пользователя:`, e);
            res.status(500).json({ message: 'Ошибка на стороне сервера' });
        }
        finally {
            client.release();
        }
    }
    async getUser(req, res) {
        const funcName = 'getUser';

        const { id } = req.params;
        const client = await db.connect();

        try {
            let userInfo = await getRedisValue(`user:${id}`);
            let followingInfo = await getRedisValue(`user-following:${id}`);
            let feedbackInfo = await getRedisValue(`user-feedback:${id}`);

            if (userInfo !== null && followingInfo !== null && feedbackInfo !== null) {
                res.status(200).json({ message: 'Пользователь найден', data: JSON.parse(userInfo), following: JSON.parse(followingInfo), feedbacks: JSON.parse(feedbackInfo) });
                logger.info(`${funcName}: Получили данные с редиса`);
            }
            else {
                await client.query('BEGIN');

                const getUser = await client.query(
                    'SELECT name, photo, email_user, gender, age FROM users ' +
                    'WHERE id_user = $1',
                    [id]
                );

                let feedbackData = {};
                if (feedbackInfo === null) {
                    const getFeedbackByUser = await client.query(
                        'SELECT feedbacks.id_feedback, s.id_user, g.main_picture, g.name, feedbacks.description, s.score, g.id_game ' +
                        'FROM feedbacks INNER JOIN public.games g ON g.id_game = feedbacks.id_game ' +
                        'LEFT JOIN scores s ON g.id_game = s.id_game AND s.id_user = $1 ' +
                        'WHERE feedbacks.id_user = $1',
                        [id]
                    );

                    for (const feedback of getFeedbackByUser.rows) {
                        const getScoreToFeedback = await client.query(
                            'SELECT COUNT(CASE WHEN score = TRUE THEN 1 END) - COUNT(CASE WHEN score = FALSE THEN 1 END) AS feedback_score ' +
                            'FROM feedback_score ' +
                            'WHERE id_feedback = $1',
                            [feedback.id_feedback]
                        );
                        feedback.feedback_score = getScoreToFeedback.rows[0].feedback_score;
                    }

                    feedbackData = getFeedbackByUser.rows;
                    await setRedisValue(`user-feedback:${id}`, JSON.stringify(feedbackData));
                }
                else {
                    feedbackData = { ...JSON.parse(feedbackInfo) };
                }

                let dataFollowing = {};
                if (followingInfo === null) {
                    let index = 0;
                    dataFollowing = {
                        complete: 0,
                        playing: 0,
                        dropped: 0,
                        planned: 0,
                    };

                    for (let [type] of Object.entries(dataFollowing)) {
                        const sub = await client.query(
                            'SELECT COUNT(*) FROM following_to_game ' +
                            'WHERE follow_type = $1 AND id_follower = $2', [index, id]
                        );
                        dataFollowing[type] = Number(sub.rows[0].count);

                        index++;
                    }

                    await setRedisValue(`user-following:${id}`, JSON.stringify(dataFollowing));
                }
                else {
                    dataFollowing = { ...JSON.parse(followingInfo) };
                }

                if (getUser.rows.length > 0) {
                    if (userInfo === null) {
                        await setRedisValue(`user:${id}`, JSON.stringify(getUser.rows[0]));
                        res.status(200).json({ message: 'Пользователь найден', data: getUser.rows[0], following: dataFollowing, feedbacks: feedbackData });
                    }
                    else {
                        res.status(200).json({ message: 'Пользователь найден', data: JSON.parse(userInfo), following: dataFollowing, feedbacks: feedbackData });
                    }
                }
                else {
                    res.status(404).json({ message: 'Пользователь не найден' });
                }

                await client.query('COMMIT');
            }
        }
        catch (e) {
            await client.query('ROLLBACK');
            logger.error(`${funcName}: Ошибка по получению данных пользователя:`, e);
            res.status(500).json({ message: 'Ошибка на стороне сервера' });
        }
        finally {
            client.release();
        }
    }
    async getSubscribeToGameByUser(req, res) {
        const funcName = 'getSubscribeToGameByUser';

        const {iduser, idgame} = req.params;

        const client = await db.connect();

        try {
            await client.query('BEGIN');

            const sub = await client.query(
                'SELECT * FROM following_to_game ' +
                'WHERE id_follower = $1 AND id_following = $2',
                [iduser, idgame]
            );

            if (sub.rows.length > 0) {
                res.status(200).json({ message: sub.rows[0].follow_type });
            }
            else {
                res.status(200).json({ message: '' });
            }

            await client.query('COMMIT');
        }
        catch (e) {
            await client.query('ROLLBACK');
            logger.error(`${funcName}: Ошибка получения статуса подписки на игру:`, e);
            res.status(500).json({ message: 'Ошибка на стороне сервера' });
        }
        finally {
            client.release();
        }
    }
    async subscribeToGame(req, res) {
        const funcName = 'subscribeToGame';

        const { idUser, idGame, followType, nameGame } = req.body;

        const client = await db.connect();
        try {
            await client.query('BEGIN');

            //Проверяем есть ли эта игра в БД
            const getGame = await client.query(
                'SELECT * from games ' +
                'WHERE id_game = $1',
                [idGame]
            );

            if (getGame.rows.length > 0) {
                const getFollow = await client.query(
                    'SELECT * FROM following_to_game ' +
                    'WHERE id_follower = $1 AND id_following = $2',
                    [idUser, idGame]
                );

                if (getFollow.rows.length > 0) {
                    const update = await client.query(
                        'UPDATE following_to_game SET follow_type = $1 ' +
                        'WHERE id_follow = $2',
                        [followType, getFollow.rows[0].id_follow]
                    );

                    res.status(200).json({ message: 'Статус обновлен' });
                }
                else {
                    const sub = await client.query(
                        'INSERT INTO following_to_game (id_follower, id_following, follow_type)' +
                        ' VALUES ($1, $2, $3)',
                        [idUser, idGame, followType]
                    );

                    await deleteRedisValue(`user-following:${idUser}`);
                    await deleteRedisValue(`sub-game-by-user:${idUser}`);
                    res.status(200).json({ message: 'Игра добавлена в список' });
                }
            }
            else {
                logger.info(`${funcName}: Игры нету в нашей базе отправляем запрос в RAWG`);

                const getGameFromRAWG = await axios.get(`https://api.rawg.io/api/games?key=${process.env.RAWG_API}&search=${encodeURIComponent(nameGame)}&search_precise=true`);

                if (getGameFromRAWG.data.results.length > 0) {
                    logger.info(`${funcName}: Получили данные с RAWG создаем JSON объект для передачи в БД`);

                    let gameDataForDB = {};
                    let gameInfo = getGameFromRAWG.data.results[0];
                    let genreInfo = getGameFromRAWG.data.results[0].genres;

                    gameDataForDB.name = gameInfo.name;
                    gameDataForDB.cover = gameInfo.background_image;
                    gameDataForDB.description = gameInfo.description ?? null;
                    gameDataForDB.release_date = gameInfo.released ?? null;
                    gameDataForDB.id_from_rawg = gameInfo.id;

                    logger.info(`${funcName}: Сгенерировали JSON объект с данными игры`);
                    logger.info(`${funcName}: ` + JSON.stringify(gameDataForDB));

                    logger.info(`${funcName}: Сгенерировали JSON объект с жанрами`);
                    logger.info(JSON.stringify(genreInfo));

                    const addGameToDB = await client.query(
                        'INSERT INTO games (name, main_picture, description, release_date, id_from_rawg) ' +
                        'VALUES ($1, $2, $3, $4, $5) ' +
                        'RETURNING *',
                        [
                            gameDataForDB.name,
                            gameDataForDB.cover,
                            gameDataForDB.description,
                            gameDataForDB.release_date,
                            gameDataForDB.id_from_rawg
                        ]
                    );

                    logger.info(`${funcName}: Игра была добавлена в БД`);

                    for (let i = 0; i < genreInfo.length; i++) {
                        const getGenresFromDB = await client.query(
                            'SELECT * FROM genres ' +
                            'WHERE name = $1',
                            [genreInfo[i].name]
                        );

                        if (getGenresFromDB.rows.length > 0) {
                            logger.info(`${funcName}: Жанр ${genreInfo[i].name} уже есть в базе привязываем жанр к игре`);
                            const addGenreToGame = await client.query(
                                'INSERT INTO genre_to_game (id_game, id_genre) VALUES ($1, $2)',
                                [addGameToDB.rows[0].id_game, getGenresFromDB.rows[0].id_genre]
                            );
                        }
                        else {
                            logger.info(`${funcName}: Жанра ${genreInfo[i].name} нет в базе добавляем`);
                            const addGenreToDB = await client.query(
                                'INSERT INTO genres (name) VALUES ($1) ' +
                                'RETURNING *',
                                [genreInfo[i].name]
                            );

                            logger.info(`${funcName}: Привязываем жанр ${genreInfo[i].name} к игре`);

                            const addGenreToGame = await client.query(
                                'INSERT INTO genre_to_game (id_game, id_genre) VALUES ($1, $2)',
                                [addGameToDB.rows[0].id_game, addGenreToDB.rows[0].id_genre]
                            );
                        }
                    }

                    logger.info(`${funcName}: Выполнили подготовку к подписанию на игру, подписываем пользователя на игру`);

                    const sub = await client.query(
                        'INSERT INTO following_to_game (id_follower, id_following, follow_type)' +
                        ' VALUES ($1, $2, $3)',
                        [idUser, addGameToDB.rows[0].id_game, followType]
                    );

                    await deleteRedisValue(`user-following:${idUser}`);
                    await deleteRedisValue(`sub-game-by-user:${idUser}`);
                    res.status(200).json({ message: 'Подписка была оформлена' });
                }
                else {
                    logger.info(`${funcName}: В RAWG не нашли информацию по названию: ${nameGame}`);
                    res.status(404).json({ message: 'Не нашли информацию по игре'});
                }
            }

            await client.query('COMMIT');
        }
        catch (e) {
            await client.query('ROLLBACK');
            logger.error(`${funcName}: Ошибка подписки на игру:`, e);
            res.status(500).json({ message: 'Ошибка на стороне сервера' });
        }
        finally {
            client.release();
        }
    }
    async unsubscribeToGame(req, res) {
        const funcName = 'unsubscribeToGame';

        const { idUser, idGame } = req.body;

        const client = await db.connect();
        try {
            await client.query('BEGIN');

            const unsub = await client.query(
                'DELETE FROM following_to_game ' +
                'WHERE id_follower = $1 AND id_following = $2',
                [idUser, idGame]
            );

            await deleteRedisValue(`user-following:${idUser}`);
            await deleteRedisValue(`sub-game-by-user:${idUser}`);
            res.status(200).json({ message: 'Игра удалена из списка' });

            await client.query('COMMIT');
        }
        catch (e) {
            await client.query('ROLLBACK');
            logger.error(`${funcName}: Ошибка отписки от игры:`, e);
            res.status(500).json({ message: 'Ошибка на стороне сервера' });
        }
        finally {
            client.release();
        }
    }
    async rateGame(req, res) {
        const funcName = 'rateGame';

        const { newScore, idUser, idGame } = req.body;

        const client = await db.connect();

        try {
            await client.query('BEGIN');

            //Проверяем есть ли изначально оценка
            const getScore = await client.query(
                'SELECT * FROM scores ' +
                'WHERE id_user = $1 AND id_game = $2',
                [idUser, idGame]
            );

            if (getScore.rows.length > 0) {
                if (getScore.rows[0].score !== newScore) {
                    const updateScore = await client.query(
                        'UPDATE scores SET score = $1 ' +
                        'WHERE id_user = $2 AND id_game = $3',
                        [newScore, idUser, idGame]
                    );

                    await deleteRedisValue(`sub-game-by-user:${idUser}`);
                    await deleteRedisValue(`user-following:${idUser}`);
                    await deleteRedisValue(`game-info:${idGame}`);
                    await deleteRedisValue('page-released-date:1');
                    res.status(200).json({ message: 'Оценка обновлена' });
                }
                else {
                    logger.info(`${funcName}: Оценка точно такая же не обновляем`);
                    res.status(200).json({ message: 'Оценка обновлена' });
                }
            }
            else {
                const createScore = await client.query(
                    'INSERT INTO scores (id_user, id_game, score) ' +
                    'VALUES ($1, $2, $3)',
                    [idUser, idGame, newScore]
                );

                await deleteRedisValue(`sub-game-by-user:${idUser}`);
                await deleteRedisValue(`user-following:${idUser}`);
                await deleteRedisValue(`game-info:${idGame}`);
                await deleteRedisValue('page-released-date:1');
                res.status(200).json({ message: 'Оценка поставлена' });
            }

            await client.query('COMMIT');
        }
        catch (e) {
            await client.query('ROLLBACK');
            logger.error(`${funcName}: Ошибка оценки игры:`, e);
            res.status(500).json({ message: 'Ошибка на стороне сервера' });
        }
        finally {
            client.release();
        }
    }
    async getUserScore(req, res) {
        const funcName = 'getUserScrore';

        const { iduser, idgame } = req.params;

        const client = await db.connect();

        try {
            await client.query('BEGIN');

            const score = await client.query(
                'SELECT score FROM scores ' +
                'WHERE id_user = $1 AND id_game = $2',
                [iduser, idgame]
            );

            if (score.rows.length > 0) {
                res.status(200).json({ message: score.rows[0].score });
            }
            else {
                res.status(200).json({ message: 'Оценки нету' });
            }

            await client.query('COMMIT');
        }
        catch (e) {
            await client.query('ROLLBACK');
            logger.error(`${funcName}: Ошибка получение оценки игры от пользователя:`, e);
            res.status(500).json({ message: 'Ошибка на стороне сервера' });
        }
        finally {
            client.release();
        }
    }
    async createFeedback(req, res) {
        const funcName = 'createFeedback';
        const { idUser, idGame, header, description } = req.body;

        const client = await db.connect();

        try {
            await client.query('BEGIN');

            //Находим есть ли такой отзыв
            const getFeedback = await client.query(
                'SELECT * FROM feedbacks ' +
                'WHERE id_user = $1 AND id_game = $2',
                [idUser, idGame]
            );

            if (getFeedback.rows.length > 0) {
                if (getFeedback.rows[0].description !== description.trim() || getFeedback.rows[0].header !== header.trim()) {
                    const updateFeedback = await client.query('UPDATE feedbacks SET description = $1, header = $2 ' +
                        'WHERE id_user = $3 AND id_game = $4 ' +
                        'RETURNING *',
                        [description.trim(), header.trim(), idUser, idGame]
                    );

                    await deleteRedisValue(`feedback-to-game:${idGame}`);
                    await deleteRedisValue(`user-feedback:${idUser}`);
                    res.status(200).json({ message: 'Отзыв обновлен', data: updateFeedback.rows[0] });
                }
                else {
                    logger.info(`${funcName}: Отзыв точно такой же не обновляем`);
                    res.status(200).json({ message: 'Отзыв обновлен' });
                }
            }
            else {
                const createFeedback = await client.query(
                    'INSERT INTO feedbacks (id_user, id_game, description, header, create_date) ' +
                    'VALUES ($1, $2, $3, $4, CURRENT_DATE) ' +
                    'RETURNING *',
                    [idUser, idGame, description.trim(), header.trim()]
                );

                const getUser = await client.query(
                    'SELECT * FROM users ' +
                    'WHERE id_user = $1',
                    [idUser]
                );

                const data = {
                    id_feedback: createFeedback.rows[0].id_feedback,
                    id_game: createFeedback.rows[0].id_game,
                    description: createFeedback.rows[0].description,
                    id_user: idUser,
                    user_name: getUser.rows[0].name,
                    user_photo: getUser.rows[0].photo,
                    feedback_score: 0,
                    header: createFeedback.rows[0].header,
                    create_date: createFeedback.rows[0].create_date
                }

                await deleteRedisValue(`feedback-to-game:${idGame}`);
                await deleteRedisValue(`user-feedback:${idUser}`);
                res.status(200).json({ message: 'Отзыв создан', data: data });
            }

            await client.query('COMMIT');
        }
        catch (e) {
            await client.query('ROLLBACK');
            logger.error(`${funcName}: Ошибка создания отзыва:`, e);
            res.status(500).json({ message: 'Ошибка на стороне сервера' });
        }
        finally {
            client.release();
        }
    }
    async rateFeedback(req, res) {
        const funcName = 'rateFeedback';

        const { idUser, idFeedback, score } = req.body;

        const client = await db.connect();

        try {
            await client.query('BEGIN');

            //Проверяем есть ли оценка на отзыв
            const getScore = await client.query(
                'SELECT * FROM feedback_score ' +
                'WHERE id_user = $1 AND id_feedback = $2',
                [idUser, idFeedback]
            );

            if (getScore.rows.length > 0) {

                const { rows } = await client.query(
                    'SELECT id_game, feedbacks.id_user FROM feedbacks ' +
                    'INNER JOIN public.feedback_score fs ' +
                    'ON feedbacks.id_feedback = fs.id_feedback ' +
                    'WHERE feedbacks.id_feedback = $1',
                    [getScore.rows[0].id_feedback]
                );

                if (getScore.rows[0].score !== score) {
                    const updateScore = await client.query(
                        'UPDATE feedback_score SET score = $1 ' +
                        'WHERE id_user = $2 AND id_feedback = $3',
                        [score, idUser, idFeedback]
                    );

                    await deleteRedisValue(`feedback-to-game:${rows[0].id_game}`);
                    await deleteRedisValue(`user-feedback:${rows[0].id_user}`);
                    res.status(200).json({ message: 'Обновили оценку' });
                }
                else {
                    logger.info(`${funcName}: Оценка точно такая же не обновляем`);
                    res.status(200).json({ message: 'Не обновляем' });
                }
            }
            else {
                const createScore = await client.query(
                    'INSERT INTO feedback_score (id_feedback, id_user, score) ' +
                    'VALUES ($1, $2, $3) ' +
                    'RETURNING *',
                    [idFeedback, idUser, score]
                );

                const { rows } = await client.query(
                    'SELECT id_game, feedbacks.id_user FROM feedbacks ' +
                    'INNER JOIN public.feedback_score fs ' +
                    'ON feedbacks.id_feedback = fs.id_feedback ' +
                    'WHERE feedbacks.id_feedback = $1',
                    [createScore.rows[0].id_feedback]
                );

                await deleteRedisValue(`feedback-to-game:${rows[0].id_game}`);
                await deleteRedisValue(`user-feedback:${rows[0].id_user}`);

                res.status(200).json({ message: 'Поставили оценку' });
            }

            await client.query('COMMIT');
        }
        catch (e) {
            await client.query('ROLLBACK');
            logger.error(`${funcName}: Ошибка оценки отзыва:`, e);
            res.status(500).json({ message: 'Ошибка на стороне сервера' });
        }
        finally {
            client.release();
        }
    }
    async createComment(req, res) {
        const funcName = 'createComment';

        const { idPost, idUser, comment } = req.body;

        const client = await db.connect();

        try {
            await client.query('BEGIN');

            //Проверяем есть ли такой комментарий
            const getComment = await client.query(
                'SELECT * FROM comments ' +
                'WHERE id_post = $1 AND id_user = $2',
                [idPost, idUser]
            );

            if (getComment.rows.length > 0) {
                if (getComment.rows[0].comment !== comment) {
                    const updateComment = await client.query(
                        'UPDATE comments SET comment = $1 ' +
                        'WHERE id_post = $2 AND id_user = $3',
                        [comment, idPost, idUser]
                    );

                    res.status(200).json({ message: 'Комментарий обновлен' });
                }
                else {
                    logger.info(`${funcName}: Комментарий такой же не меняем`);
                    res.status(200).json({ message: 'Комментарий обновлен' });
                }
            }
            else {
                const createComment = await client.query(
                    'INSERT INTO comments (id_post, id_user, comment) ' +
                    'VALUES ($1, $2, $3)',
                    [idPost, idUser, comment.trim()]
                );
                res.status(200).json({ message: 'Комментарий создан' });
            }

            await client.query('COMMIT');
        }
        catch (e) {
            await client.query('ROLLBACK');
            logger.error(`${funcName}: Ошибка создания комментария:`, e);
            res.status(500).json({ message: 'Ошибка на стороне сервера' });
        }
        finally {
            client.release();
        }
    }
    async rateComment(req, res) {
        const funcName = 'rateComment';

        const { idComment, idUser, score } = req.body;

        const client = await db.connect();

        try {
            await client.query('BEGIN');

            const getRate = await client.query(
                'SELECT * FROM comment_scores ' +
                'WHERE id_user = $1 AND id_comment = $2',
                [idUser, idComment]
            );

            if (getRate.rows.length > 0) {
                if (getRate.rows[0].score !== score) {
                    const updateRate = await client.query(
                        'UPDATE comment_scores SET score = $1 ' +
                        'WHERE id_user = $2 AND id_comment = $3',
                        [score, idUser, idComment]
                    );
                    res.status(200).json({ message: 'Оценка обновлена' });
                }
                else {
                    logger.info(`${funcName}: Оценка такая же не обновляем`);
                    res.status(200).json({ message: 'Оценка обновлена' });
                }
            }
            else {
                const createRate = await client.query(
                    'INSERT INTO comment_scores (id_comment, id_user, score) ' +
                    'VALUES ($1, $2, $3)',
                    [idComment, idUser, score]
                );
                res.status(200).json({ message: 'Оцена создана' });
            }

            await client.query('COMMIT');
        }
        catch (e) {
            await client.query('ROLLBACK');
            logger.error(`${funcName}: Ошибка оценки комментария:`, e);
            res.status(500).json({ message: 'Ошибка на стороне сервера' });
        }
        finally {
            client.release();
        }
    }
    async deleteComment(req, res) {
        const funcName = 'deleteComment';

        const { idcomment } = req.params;

        const client = await db.connect();

        try {
            await client.query('BEGIN');

            //Проверяем есть ли оценки на этот комментарий
            const getRates = await client.query(
                'SELECT * FROM comment_scores ' +
                'WHERE id_comment = $1',
                [idcomment]
            );

            if (getRates.rows.length > 0) {
                const deleteRates = await client.query(
                    'DELETE FROM comment_scores ' +
                    'WHERE id_comment = $1',
                    [idcomment]
                );
                logger.info(`${funcName}: Удалили оценки на комментарий`);
            }

            const deleteComment = await client.query(
                'DELETE FROM comments ' +
                'WHERE id_comment = $1',
                [idcomment]
            );

            res.status(200).json({ message: 'Комментарий удален' });

            await client.query('COMMIT');
        }
        catch (e) {
            await client.query('ROLLBACK');
            logger.error(`${funcName}: Ошибка удаления комментария:`, e);
            res.status(500).json({ message: 'Ошибка на стороне сервера' });
        }
        finally {
            client.release();
        }
    }
    async getFollowingGameByUser(req, res) {
        const funcName = 'getFollowingGameByUser';
        const { id } = req.params;

        const client = await db.connect();

        try {
            const getGenresByFollowsGames = await client.query('SELECT DISTINCT genres.id_genre, genres.name\n' +
                'FROM genres\n' +
                '         INNER JOIN public.genre_to_game gtg ON genres.id_genre = gtg.id_genre\n' +
                '         JOIN public.games g ON g.id_game = gtg.id_game\n' +
                '         JOIN public.following_to_game ftg ON g.id_game = ftg.id_following\n' +
                'WHERE ftg.id_follower = $1\n' +
                'ORDER BY genres.id_genre', [id]
            );

            const getDevelopersByFollowsGames = await client.query('SELECT DISTINCT d.id_developer, d.name\n' +
                'FROM public.developers d\n' +
                '         JOIN public.developers_to_game dtg ON d.id_developer = dtg.id_developer\n' +
                '         JOIN public.games g ON g.id_game = dtg.id_game\n' +
                '         JOIN public.following_to_game ftg ON g.id_game = ftg.id_following\n' +
                'WHERE ftg.id_follower = $1\n' +
                'ORDER BY d.id_developer', [id]
            );

            const filters = {
                genres: getGenresByFollowsGames.rows,
                developers: getDevelopersByFollowsGames.rows
            }

            let followingInfo = await getRedisValue(`sub-game-by-user:${id}`);
            if (followingInfo !== null) {
                res.status(200).json({ message: 'Получили список игр', data: JSON.parse(followingInfo), filters: filters });
                logger.info(`${funcName}: Получили данные с редиса`);
            }
            else {
                await client.query('BEGIN');

                let dataFollowing;
                let index = 0;

                dataFollowing = {
                    complete: [],
                    playing: [],
                    dropped: [],
                    planned: [],
                };

                for (let [type] of Object.entries(dataFollowing)) {
                    const sub = await client.query('SELECT games.id_game, games.name, s.score, ftg.follow_type FROM games ' +
                        'INNER JOIN public.following_to_game ftg on games.id_game = ftg.id_following ' +
                        'LEFT JOIN scores s ON games.id_game = s.id_game AND s.id_user = $1 ' +
                        'WHERE ftg.id_follower = $1 AND ftg.follow_type = $2', [id, index]
                    );

                    dataFollowing[type] = sub.rows;

                    index++;
                }

                await setRedisValue(`sub-game-by-user:${id}`, JSON.stringify(dataFollowing));
                res.status(200).json({ message: 'Получили список игр', data: dataFollowing, filters: filters});

                await client.query('COMMIT');
            }
        }
        catch (e) {
            await client.query('ROLLBACK');
            logger.error(`${funcName}: Ошибка получения списка игр пользователя:`, e);
            res.status(500).json({ message: 'Ошибка на стороне сервера' });
        }
        finally {
            client.release();
        }
    }
    async getFollowingGamesByQueries(req, res) {
        const funcName = 'getFollowingGamesByQueries';

        const id = req.params.id;
        const developers = req.query.developers ? req.query.developers.split(',') : [];
        const genres = req.query.genres ? req.query.genres.split(',') : [];
        const scores = req.query.scores ? req.query.scores.split(',') : [];

        const client = await db.connect();
    
        try {
            await client.query('BEGIN');

            let query = 'SELECT DISTINCT games.id_game, games.name, s.score, ftg.follow_type\n' +
                'FROM following_to_game ftg\n' +
                '         JOIN games ON games.id_game = ftg.id_following\n' +
                '         LEFT JOIN scores s ON games.id_game = s.id_game AND s.id_user = $1\n' +
                '         LEFT JOIN developers_to_game dtg ON games.id_game = dtg.id_game\n' +
                '         LEFT JOIN genre_to_game gtg ON games.id_game = gtg.id_game\n' +
                'WHERE ftg.id_follower = $1'
            ;

            if (scores.length > 0) {
                query += ` AND s.score = ANY (ARRAY[${scores}])`;
            }

            if (genres.length > 0) {
                query += ` AND id_genre = ANY (ARRAY[${genres}])`;
            }

            if (developers.length > 0) {
                query += ` AND id_developer = ANY (ARRAY[${developers}])`;
            }

            let dataFollowing;

            dataFollowing = {
                complete: [],
                playing: [],
                dropped: [],
                planned: [],
            };

            const games = await client.query(query, [id]);

            games.rows.forEach(game => {
                switch (game.follow_type) {
                    case 0:
                        dataFollowing.complete.push(game);
                        break;
                    case 1:
                        dataFollowing.playing.push(game);
                        break;
                    case 2:
                        dataFollowing.dropped.push(game);
                        break;
                    case 3:
                        dataFollowing.planned.push(game);
                        break;
                    default:
                        console.warn(`${funcName}: Unknown follow_type: ${game.follow_type}`);
                }
            });

            if (games.rows.length > 0) {
                res.status(200).json({ message: 'Получили список игр', data: dataFollowing });
            }
            else {
                res.status(200).json({ message: 'Список игр по фильтрам пустой' });
            }
    
            await client.query('COMMIT');
        }
        catch (e) {
            await client.query('ROLLBACK');
            logger.error(`${funcName}: Ошибка получения игр по фильтрам:`, e);
            res.status(500).json({ message: 'Ошибка на стороне сервера' });
        }
        finally {
            client.release();
        }
    }
    async createReport(req, res) {
        const funcName = 'createReport';

        const { id_reporter, id_intruder, id_comment, type_report } = req.body;

        const client = await db.connect();
    
        try {
            await client.query('BEGIN');

            const report = await client.query(
                'INSERT INTO reports (id_reporter, id_intruder, id_comment, type_report, is_complete) ' +
                'VALUES ($1, $2, $3, $4, false) RETURNING *',
                [id_reporter, id_intruder, id_comment, type_report]
            );

            if (report.rows.length > 0) {
                res.status(200).json({ message: 'Жалоба отправлена'});
            }
            else {
                res.status(400).json({ message: 'Ошибка отправки жалобы' });
            }
    
            await client.query('COMMIT');
        }
        catch (e) {
            await client.query('ROLLBACK');
            logger.error(`${funcName}: Ошибка создания жалобы:`, e);
            res.status(500).json({ message: 'Ошибка на стороне сервера' });
        }
        finally {
            client.release();
        }
    }
}

export default new UserHandler();
