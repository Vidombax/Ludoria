import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import axios from 'axios'
import db from '../../../db.js'
import {getRedisValue, setRedisValue, deleteRedisValue} from '../../../redis.js'
import logger from '../../../logger.js'

class UserHandler {
    async createUser(req, res) {
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
                    'INSERT INTO users (name, email_user, password_user) ' +
                    'VALUES ($1, $2, $3)' +
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
            logger.error('Ошибка создания пользователя:', e);
            res.status(500).json({ message: 'Ошибка создания пользователя' });
        }
        finally {
            client.release();
        }
    }
    async updateUser(req, res) {
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
                    logger.info('Данные которые нужно обновить', needChangeInfo);

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
                    logger.info(`Данные пользователя ${data.id} такие же, не обновляем`);
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
            logger.error('Ошибка обновления пользователя:', e);
            res.status(500).json({ message: 'Ошибка на стороне сервера' });
        }
        finally {
            client.release();
        }
    }
    async updateUserPhoto(req, res) {
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
            logger.error('Ошибка обновления фотографии:', e);
            res.status(500).json({ message: 'Ошибка на стороне сервера' });
        }
        finally {
            client.release();
        }
    }
    async authorizationUser(req, res) {
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

                    res.json({ token, message: 'Пользователь был найден', id: getUser.rows[0].id_user });
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
            logger.error('Ошибка авторизации пользователя:', e);
            res.status(500).json({ message: 'Ошибка на стороне сервера' });
        }
        finally {
            client.release();
        }
    }
    async getUser(req, res) {
        const { id } = req.params;
        const client = await db.connect();

        try {
            let userInfo = await getRedisValue(`user:${id}`);

            if (userInfo !== null) {
                res.status(200).json({ message: 'Пользователь найден', data: JSON.parse(userInfo) });
            }
            else {
                await client.query('BEGIN');

                const getUser = await client.query(
                    'SELECT name, photo, email_user, gender, age FROM users ' +
                    'WHERE id_user = $1',
                    [id]
                );

                if (getUser.rows.length > 0) {
                    await setRedisValue(`user:${id}`, JSON.stringify(getUser.rows[0]));
                    res.status(200).json({ message: 'Пользователь найден', data: getUser.rows[0] });
                }
                else {
                    res.status(404).json({ message: 'Пользователь не найден' });
                }

                await client.query('COMMIT');
            }
        }
        catch (e) {
            await client.query('ROLLBACK');
            logger.error('Ошибка по получению данных пользователя:', e);
            res.status(500).json({ message: 'Ошибка на стороне сервера' });
        }
        finally {
            client.release();
        }
    }
    async getSubscribeToGameByUser(req, res) {
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
            logger.error('Ошибка ...:', e);
            res.status(500).json({ message: 'Ошибка на стороне сервера' });
        }
        finally {
            client.release();
        }
    }
    async subscribeToGame(req, res) {
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

                    res.status(200).json({ message: 'Игра добавлена в список' });
                }
            }
            else {
                logger.info('Игры нету в нашей базе отправляем запрос в RAWG');

                const getGameFromRAWG = await axios.get(`https://api.rawg.io/api/games?key=${process.env.RAWG_API}&search=${encodeURIComponent(nameGame)}&search_precise=true`);

                if (getGameFromRAWG.data.results.length > 0) {
                    logger.info('Получили данные с RAWG создаем JSON объект для передачи в БД');

                    let gameDataForDB = {};
                    let gameInfo = getGameFromRAWG.data.results[0];
                    let genreInfo = getGameFromRAWG.data.results[0].genres;

                    gameDataForDB.name = gameInfo.name;
                    gameDataForDB.cover = gameInfo.background_image;
                    gameDataForDB.description = gameInfo.description ?? null;
                    gameDataForDB.release_date = gameInfo.released ?? null;
                    gameDataForDB.id_from_rawg = gameInfo.id;

                    logger.info(`Сгенерировали JSON объект с данными игры`);
                    logger.info(JSON.stringify(gameDataForDB));

                    logger.info(`Сгенерировали JSON объект с жанрами`);
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

                    logger.info('Игра была добавлена в БД');

                    for (let i = 0; i < genreInfo.length; i++) {
                        const getGenresFromDB = await client.query(
                            'SELECT * FROM genres ' +
                            'WHERE name = $1',
                            [genreInfo[i].name]
                        );

                        if (getGenresFromDB.rows.length > 0) {
                            logger.info(`Жанр ${genreInfo[i].name} уже есть в базе привязываем жанр к игре`);
                            const addGenreToGame = await client.query(
                                'INSERT INTO genre_to_game (id_game, id_genre) VALUES ($1, $2)',
                                [addGameToDB.rows[0].id_game, getGenresFromDB.rows[0].id_genre]
                            );
                        }
                        else {
                            logger.info(`Жанра ${genreInfo[i].name} нет в базе добавляем`);
                            const addGenreToDB = await client.query(
                                'INSERT INTO genres (name) VALUES ($1) ' +
                                'RETURNING *',
                                [genreInfo[i].name]
                            );

                            logger.info(`Привязываем жанр ${genreInfo[i].name} к игре`);

                            const addGenreToGame = await client.query(
                                'INSERT INTO genre_to_game (id_game, id_genre) VALUES ($1, $2)',
                                [addGameToDB.rows[0].id_game, addGenreToDB.rows[0].id_genre]
                            );
                        }
                    }

                    logger.info('Выполнили подготовку к подписанию на игру, подписываем пользователя на игру');

                    const sub = await client.query(
                        'INSERT INTO following_to_game (id_follower, id_following, follow_type)' +
                        ' VALUES ($1, $2, $3)',
                        [idUser, addGameToDB.rows[0].id_game, followType]
                    );

                    res.status(200).json({ message: 'Подписка была оформлена' });
                }
                else {
                    logger.info(`В RAWG не нашли информацию по названию: ${nameGame}`);
                    res.status(404).json({ message: 'Не нашли информацию по игре'});
                }
            }

            await client.query('COMMIT');
        }
        catch (e) {
            await client.query('ROLLBACK');
            logger.error('Ошибка подписки на игру:', e);
            res.status(500).json({ message: 'Ошибка на стороне сервера' });
        }
        finally {
            client.release();
        }
    }
    async unsubscribeToGame(req, res) {
        const { idUser, idGame } = req.body;

        const client = await db.connect();
        try {
            await client.query('BEGIN');

            const unsub = await client.query(
                'DELETE FROM following_to_game ' +
                'WHERE id_follower = $1 AND id_following = $2',
                [idUser, idGame]
            );

            res.status(200).json({ message: 'Игра удалена из списка' });

            await client.query('COMMIT');
        }
        catch (e) {
            await client.query('ROLLBACK');
            logger.error('Ошибка отписки от игры:', e);
            res.status(500).json({ message: 'Ошибка на стороне сервера' });
        }
        finally {
            client.release();
        }
    }
    async rateGame(req, res) {
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
                    await deleteRedisValue(`game-info:${idGame}`);
                    await deleteRedisValue('page-released-date:1');
                    res.status(200).json({ message: 'Оценка обновлена' });
                }
                else {
                    logger.info('Оценка точно такая же не обновляем');
                    res.status(200).json({ message: 'Оценка обновлена' });
                }
            }
            else {
                const createScore = await client.query(
                    'INSERT INTO scores (id_user, id_game, score) ' +
                    'VALUES ($1, $2, $3)',
                    [idUser, idGame, newScore]
                );
                await deleteRedisValue(`game-info:${idGame}`);
                await deleteRedisValue('page-released-date:1');
                res.status(200).json({ message: 'Оценка поставлена' });
            }

            await client.query('COMMIT');
        }
        catch (e) {
            await client.query('ROLLBACK');
            logger.error('Ошибка оценки игры:', e);
            res.status(500).json({ message: 'Ошибка на стороне сервера' });
        }
        finally {
            client.release();
        }
    }
    async getUserScore(req, res) {
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
            logger.error('Ошибка получение оценки игры от пользователя:', e);
            res.status(500).json({ message: 'Ошибка на стороне сервера' });
        }
        finally {
            client.release();
        }
    }
    async createFeedback(req, res) {
        const { idUser, idGame, description } = req.body;

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
                if (getFeedback.rows[0].description !== description.trim()) {
                    const updateFeedback = await client.query('UPDATE feedbacks SET description = $1 ' +
                        'WHERE id_user = $2 AND id_game = $3 ' +
                        'RETURNING *',
                        [description.trim(), idUser, idGame]
                    );

                    await deleteRedisValue(`feedback-to-game:${idGame}`);
                    res.status(200).json({ message: 'Отзыв обновлен', data: updateFeedback.rows[0] });
                }
                else {
                    logger.info('Отзыв точно такой же не обновляем');
                    res.status(200).json({ message: 'Отзыв обновлен' });
                }
            }
            else {
                const createFeedback = await client.query(
                    'INSERT INTO feedbacks (id_user, id_game, description) ' +
                    'VALUES ($1, $2, $3) ' +
                    'RETURNING *',
                    [idUser, idGame, description.trim()]
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
                    feedback_score: 0
                }

                await deleteRedisValue(`feedback-to-game:${idGame}`);
                res.status(200).json({ message: 'Отзыв создан', data: data });
            }

            await client.query('COMMIT');
        }
        catch (e) {
            await client.query('ROLLBACK');
            logger.error('Ошибка создания отзыва:', e);
            res.status(500).json({ message: 'Ошибка на стороне сервера' });
        }
        finally {
            client.release();
        }
    }
    async rateFeedback(req, res) {
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
                    'SELECT id_game FROM feedbacks ' +
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
                    res.status(200).json({ message: 'Обновили оценку' });
                }
                else {
                    logger.info('Оценка точно такая же не обновляем');
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
                    'SELECT id_game FROM feedbacks ' +
                    'INNER JOIN public.feedback_score fs ' +
                    'ON feedbacks.id_feedback = fs.id_feedback ' +
                    'WHERE feedbacks.id_feedback = $1',
                    [createScore.rows[0].id_feedback]
                );

                await deleteRedisValue(`feedback-to-game:${rows[0].id_game}`);

                res.status(200).json({ message: 'Поставили оценку' });
            }

            await client.query('COMMIT');
        }
        catch (e) {
            await client.query('ROLLBACK');
            logger.error('Ошибка оценки отзыва:', e);
            res.status(500).json({ message: 'Ошибка на стороне сервера' });
        }
        finally {
            client.release();
        }
    }
    async createPost(req, res) {
        const { id_game, id_user, header, description } = req.body;
        const dataPost = req.body;

        const client = await db.connect();

        try {
            await client.query('BEGIN');

            //Сначала проверим есть ли этот пост
            const getPost = await client.query(
                'SELECT * FROM posts ' +
                'WHERE id_game = $1 AND id_user = $2',
                [id_game, id_user]
            );

            if (dataPost.id_post !== undefined) {
                let needChangeInfo = {};

                for (const key in getPost.rows[0]) {
                    //Если есть разница между данными полученными и из базы
                    if (dataPost[key] !== undefined && dataPost[key] !== getPost.rows[0][key]) {
                            needChangeInfo[key] = dataPost[key];
                    }
                }

                if (Object.keys(needChangeInfo).length > 0) {
                    logger.info('Данные которые нужно обновить', needChangeInfo);

                    const setClause = Object.keys(needChangeInfo)
                        .map((key, index) => `${key} = $${index + 2}`)
                        .join(', ');

                    const query = `
                        UPDATE posts
                        SET ${setClause}
                        WHERE id_post = $1
                    `;

                    const values = [dataPost.id_post, ...Object.values(needChangeInfo)];

                    await client.query(query, values);

                    res.status(200).json({ message: 'Данные обновлены' });
                }
                else {
                    logger.info(`Данные поста ${dataPost.id_post} такие же не обновляем`);
                    res.status(200).json({ message: 'Данные обновлены' });
                }
            }
            else {
                const createPost = await client.query(
                    'INSERT INTO posts (id_game, id_user, header, description) ' +
                    'VALUES ($1, $2, $3, $4)',
                    [id_game, id_user, header.trim(), description.trim()]
                );

                res.status(200).json({ message: 'Пост был создан' });
            }

            await client.query('COMMIT');
        }
        catch (e) {
            await client.query('ROLLBACK');
            logger.error('Ошибка создания поста:', e);
            res.status(500).json({ message: 'Ошибка на стороне сервера' });
        }
        finally {
            client.release();
        }
    }
    async ratePost(req, res) {
        const { idPost, idUser, score } = req.body;

        const client = await db.connect();

        try {
            await client.query('BEGIN');

            //Ищем есть ли уже такая оценка
            const getRate = await client.query(
                'SELECT * FROM post_scores ' +
                'WHERE id_user = $1 AND id_post = $2',
                [idUser, idPost]
            );

            if (getRate.rows.length > 0) {
                if (score !== getRate.rows[0].score) {
                    const updateScore = await client.query(
                        'UPDATE post_scores SET score = $1 ' +
                        'WHERE id_post = $2 AND id_user = $3',
                        [score, idPost, idUser]
                    );
                    res.status(200).json({ message: 'Оценка обновлена' });
                }
                else {
                    logger.info('Оценка такая же не обновляем');
                    res.status(200).json({ message: 'Оценка обновлена' });
                }
            }
            else {
                const createScore = await client.query(
                    'INSERT INTO post_scores (id_post, id_user, score) ' +
                    'VALUES ($1, $2, $3)',
                    [idPost, idUser, score]
                );
                res.status(200).json({ message: 'Оценка поставлена' });
            }

            await client.query('COMMIT');
        }
        catch (e) {
            await client.query('ROLLBACK');
            logger.error('Ошибка оценки поста:', e);
            res.status(500).json({ message: 'Ошибка на стороне сервера' });
        }
        finally {
            client.release();
        }
    }
    async createComment(req, res) {
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
                    logger.info('Комментарий такой же не меняем');
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
            logger.error('Ошибка создания комментария:', e);
            res.status(500).json({ message: 'Ошибка на стороне сервера' });
        }
        finally {
            client.release();
        }
    }
    async rateComment(req, res) {
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
                    logger.info('Оценка такая же не обновляем');
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
            logger.error('Ошибка оценки комментария:', e);
            res.status(500).json({ message: 'Ошибка на стороне сервера' });
        }
        finally {
            client.release();
        }
    }
    async deleteComment(req, res) {
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
                logger.info('Удалили оценки на комментарий');
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
            logger.error('Ошибка удаления комментария:', e);
            res.status(500).json({ message: 'Ошибка на стороне сервера' });
        }
        finally {
            client.release();
        }
    }
}

export default new UserHandler();
