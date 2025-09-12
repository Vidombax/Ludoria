import logger from '../logger.js'

const activeRequests = new Map();

export const requestManager = (req, res, next) => {
    const funcName = 'requestManager';

    const sessionId = req.sessionID || req.ip; // Используем sessionID или IP как идентификатор
    // Отменяем предыдущий запрос того же типа от этого же клиента
    if (activeRequests.has(sessionId)) {
        logger.info(`${funcName}: Отменяем предыдущий запрос от клиента ${sessionId}`);
        const previousController = activeRequests.get(sessionId);
        previousController.abort();
        activeRequests.delete(sessionId);
    }

    // Создаем новый AbortController для текущего запроса
    const controller = new AbortController();
    activeRequests.set(sessionId, controller);
    req.abortController = controller;
    logger.info(`${funcName}: Создаем AbortController для запроса на ${sessionId}`);

    // Очищаем при завершении запроса
    res.on('finish', () => {
        if (activeRequests.get(sessionId) === controller) {
            activeRequests.delete(sessionId);
            logger.info(`${funcName}: Очистили ${sessionId} при завершении запроса`);
        }
    });

    next();
};

export default requestManager;