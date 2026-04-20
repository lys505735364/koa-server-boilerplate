const { koaBody } = require('koa-body');

/**
 * 文件上传专用中间件
 * 仅在需要上传的路由中使用，避免全局开启 multipart 带来的安全风险
 */
const uploadMiddleware = koaBody({
  multipart: true, // 仅在此处开启文件上传
  formidable: {
    maxFileSize: 4 * 1024 * 1024, // 4MB（与原 koa-multer 配置保持一致）
    keepExtensions: true, // 保留文件扩展名
    maxFields: 1024, // 非文件字段的数量
    maxFiles: 1, // 文件数量限制为1
  },
});

module.exports = uploadMiddleware;
