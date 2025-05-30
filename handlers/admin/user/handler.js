import db from '../../../db.js'
import {getRedisValue, setRedisValue, deleteRedisValue} from '../../../redis.js'
import logger from '../../../logger.js'

class AdminUserHandler {
    async completeReport(req, res) {
        const funcName = 'completeReport';

        const { is_complete, id_report } = req.body;

        const client = await db.connect();
    
        try {
            await client.query('BEGIN');

            const report = await client.query(
                'UPDATE reports SET is_complete = $1 ' +
                'WHERE id_report = $2 RETURNING *',
                [is_complete, id_report]
            );

            if (report.rows.length > 0) {
                res.status(200).json({ message: 'Статус жалобы обновлен' });
            }
            else {
                res.status(400).json({ message: 'Ошибка обновление статуса жалобы' });
            }

            await client.query('COMMIT');
        }
        catch (e) {
            await client.query('ROLLBACK');
            logger.error(`${funcName}: Ошибка исполнения жалобы:`, e);
            res.status(500).json({ message: 'Ошибка на стороне сервера' });
        }
        finally {
            client.release();
        }
    }
}

export default new AdminUserHandler();