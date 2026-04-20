// src/utils/errorHandler.js
const { logger } = require('./logger');

const handleError = (ctx, err, message = '操作失败') => {
  logger.error({
    error: err,
    message,
    userId: ctx.user?.id,
    requestId: ctx.requestId,
    path: ctx.path,
    method: ctx.method,
    body: ctx.request.body,
  });
  ctx.throw(500, message);
};

module.exports = { handleError };
