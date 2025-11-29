import axios from 'axios'
import db from '../../../db.js'
import logger from '../../../logger.js'
import { deleteRedisValue, getRedisValue, setRedisValue } from '../../../redis.js'

class PostHandler {
    async createPost(req, res) {
        const funcName = 'createPost';
        const { id_game, id_user, header, description, is_article } = req.body;
        let photoName;

        if (is_article === true) {
            if (!req.file) {
                return res.status(400).json({ message: 'Файл не был загружен' });
            }

            photoName = '/postPicture/' + req.file.filename
        }

        const client = await db.connect();

        try {
            await client.query('BEGIN');

            const createPost = await client.query(
                'INSERT INTO posts (id_game, id_user, header, description, is_active, create_data, is_article, photo) ' +
                'VALUES ($1, $2, $3, $4, false, CURRENT_DATE, $5, $6) ' +
                'RETURNING *',
                [id_game, id_user, header.trim(), description.trim(), is_article, photoName]
            );

            const newPost = createPost.rows[0];

            if (newPost) {
                await setRedisValue(`post:${newPost.id_post}`, JSON.stringify(newPost));
            }

            await client.query('COMMIT');

            res.status(200).json({ message: 'Пост был создан' });
        }
        catch (e) {
            await client.query('ROLLBACK');
            logger.error(`${funcName}: Ошибка создания поста:`, e);
            res.status(500).json({ message: 'Ошибка на стороне сервера' });
        }
        finally {
            client.release();
        }
    }
    async getPost(req, res) {
        const funcName = 'getPost';

        const { id } = req.params;
        const { id_user, token } = req.body;
        let post = {
            post: [],
            userRate: {},
            comments: [],
            anotherPost: []
        };

        const client = await db.connect();

        try {
            let postRedis = await getRedisValue(`post:${id}`);

            if (postRedis !== null) {
                res.status(200).json({ message: 'Получили данные о посте', game: JSON.parse(postRedis) });
                logger.info(`${funcName}: Нашли данные о посте ${id} в редисе`);
            }
            else {
                await client.query('BEGIN');

                const { rows } = await client.query(
                    `
                        SELECT
                            u.id_user as author_id,
                            u.name as author_name,
                            u.photo as author_photo,
                            p.id_post,
                            p.header as header_post,
                            p.description as header_description,
                            p.create_data as header_create_data,
                            p.is_article,
                            p.photo as article_photo,
                            p.id_game,
                            g.main_picture as game_photo
                        FROM posts p
                                 INNER JOIN public.games g ON g.id_game = p.id_game
                                 INNER JOIN public.users u on u.id_user = p.id_user
                        WHERE p.id_post = ${id} AND p.is_active = true
                    `
                );

                if (rows.length > 0) {
                    post.post = rows[0];
                    if (id_user !== 0) {
                        const userRateOnGame = await axios.get(`${process.env.HOST}/get-rate/${id_user}/${rows[0].id_game}`);
                        console.log(userRateOnGame.data)
                        if (userRateOnGame.data) {
                            post.userRate = userRateOnGame.data.message;
                        }
                    }

                    logger.info(`${funcName}: Нашли пост по заданному ID: ${id}`);
                    // await setRedisValue(`post:${id}`, JSON.stringify(rows[0]));

                    res.status(200).json({ message: 'Нашли пост', post });
                }
                else {
                    res.status(200).json({ message: 'Не нашли пост по заданному ID' });
                }

                await client.query('COMMIT');
            }
        }
        catch (e) {
            await client.query('ROLLBACK');
            logger.error(`${funcName}: Ошибка вывода поста:`, e);
            res.status(500).json({ message: 'Ошибка на стороне сервера' });
        }
        finally {
            client.release();
        }
    }
    async getUserPosts(req, res) {
        const funcName = 'getPosts';

        const { id } = req.params;

        const client = await db.connect();

        try {
            const articles = await client.query(
                'SELECT posts.id_post, posts.id_game, g.name, posts.header, posts.description, posts.photo, posts.create_data, posts.is_article ' +
                'FROM posts ' +
                'INNER JOIN public.games g ON g.id_game = posts.id_game ' +
                'WHERE posts.id_user = $1 AND is_article = true',
                [id]
            );

            const news = await client.query(
                'SELECT posts.id_post, posts.id_game, g.name, g.main_picture, posts.header, posts.description, posts.create_data, posts.is_article ' +
                'FROM posts ' +
                'INNER JOIN public.games g ON g.id_game = posts.id_game ' +
                'WHERE posts.id_user = $1 AND is_article = false',
                [id]
            );

            res.status(200).json({ message: 'Получили посты пользователя', articles: articles.rows, news: news.rows});
        }
        catch (e) {
            logger.error(`${funcName}: Ошибка получения постов пользователя:`, e);
            res.status(500).json({ message: 'Ошибка на стороне сервера' });
        }
        finally {
            client.release();
        }
    }
    async updatePost(req, res) {
        const funcName = 'updatePost';

        const dataPost = req.body;

        const client = await db.connect();

        try {
            await client.query('BEGIN');

            const getPost = await client.query(
                'SELECT * FROM posts ' +
                'WHERE id_post = $1',
                [dataPost.id]
            );

            if (getPost.rows.length > 0) {
                let needChangeInfo = {};

                for (const key in getPost.rows[0]) {
                    //Если есть разница между данными полученными и из базы
                    if (dataPost[key] !== undefined && dataPost[key] !== getPost.rows[0][key]) {
                        needChangeInfo[key] = dataPost[key];
                    }
                }

                if (Object.keys(needChangeInfo).length > 0) {
                    logger.info(`${funcName}: Данные которые нужно обновить`, needChangeInfo);

                    const setClause = Object.keys(needChangeInfo)
                        .map((key, index) => `${key} = $${index + 2}`)
                        .join(', ');

                    const query = `
                        UPDATE posts
                        SET ${setClause}
                        WHERE id_post = $1
                    `;

                    const values = [dataPost.id, ...Object.values(needChangeInfo)];

                    await client.query(query, values);

                    res.status(200).json({ message: 'Данные обновлены' });
                }
                else {
                    logger.info(`${funcName}: Данные поста ${dataPost.id} такие же не обновляем`);
                    res.status(200).json({ message: 'Данные обновлены' });
                }
            }
            else {
                res.status(404).json({ message: 'Такого поста не существует' });
            }

            await client.query('COMMIT');
        }
        catch (e) {
            await client.query('ROLLBACK');
            logger.error(`${funcName}: Ошибка обновления поста:`, e);
            res.status(500).json({ message: 'Ошибка на стороне сервера' });
        }
        finally {
            client.release();
        }
    }
    async ratePost(req, res) {
        const funcName = 'ratePost';

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
                    logger.info(`${funcName}: Оценка такая же не обновляем`);
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
            logger.error(`${funcName}: Ошибка оценки поста:`, e);
            res.status(500).json({ message: 'Ошибка на стороне сервера' });
        }
        finally {
            client.release();
        }
    }
    async getNewestPost(req, res) {
        const funcName = 'getNewestPost';

        const client = await db.connect();

        try {
            await client.query('BEGIN');

            const posts = await client.query(
                'SELECT posts.id_post, posts.id_game, g.name, g.main_picture, posts.header, posts.description, posts.create_data, posts.is_article ' +
                'FROM posts ' +
                'INNER JOIN public.games g ON g.id_game = posts.id_game ' +
                'ORDER BY create_data DESC'
            );

            if (posts.rows.length > 0) {
                res.status(200).json({ message: 'Нашли статьи', data: posts.rows });
            }
            else {
                res.status(200).json({ message: 'Не нашли статьи' });
            }

            await client.query('COMMIT');
        }
        catch (e) {
            await client.query('ROLLBACK');
            logger.error(`${funcName}: Ошибка получения статей:`, e);
            res.status(500).json({ message: 'Ошибка на стороне сервера' });
        }
        finally {
            client.release();
        }
    }
    async deletePost(req, res) {
        const funcName = 'deletePost';

        const { id } = req.params;

        const client = await db.connect();

        try {
            await client.query('BEGIN');

            const delete_post = client.query(
                `DELETE FROM posts WHERE id_post = $1`,
                [id]
            );

            if (delete_post) {
                res.status(200).json({ message: 'Пост успешно удален' });
            }
            else {
                res.status(400).json({ message: 'Ошибка удаления поста' });
            }

            await client.query('COMMIT');
        }
        catch (e) {
            await client.query('ROLLBACK');
            logger.error(`${funcName}: Ошибка удаления поста:`, e);
            res.status(500).json({ message: 'Ошибка на стороне сервера' });
        }
        finally {
            client.release();
        }
    }
}

export default new PostHandler();
