import db from '../../../db.js'
import logger from '../../../logger.js'

class PostHandler {
    async createPost(req, res) {
        const funcName = 'createPost';

        const { id_game, id_user, header, description } = req.body;

        const client = await db.connect();

        try {
            await client.query('BEGIN');

            const createPost = await client.query(
                'INSERT INTO posts (id_game, id_user, header, description, create_data) ' +
                'VALUES ($1, $2, $3, $4, CURRENT_DATE)',
                [id_game, id_user, header.trim(), description.trim()]
            );

            res.status(200).json({ message: 'Пост был создан' });


            await client.query('COMMIT');
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
                'SELECT posts.id_post, posts.id_game, g.name, g.main_picture, posts.header, posts.description, posts.create_data ' +
                'FROM posts ' +
                'INNER JOIN public.games g ON g.id_game = posts.id_game ' +
                'ORDER BY create_data ASC'
            );

            if (posts.rows.length > 0) {
                res.status(200).json({ message: 'Нашли статьи', data: posts.rows });
            }
            else {
                res.status(404).json({ message: 'Не нашли статьи' });
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
}

export default new PostHandler();