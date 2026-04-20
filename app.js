require('dotenv').config({
  path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env',
});

const printLogo = require('./src/utils/logo');
console.log(`\x1b[33m%s\x1b[0m`, printLogo);
const Koa = require('koa');
const jsonError = require('koa-json-error');
const cors = require('@koa/cors');
const helmet = require('koa-helmet');
const compress = require('koa-compress');
const { koaBody } = require('koa-body');
const { koaLogger, logger } = require('./src/utils/logger');
const config = require('./src/config');
const createRouter = require('./src/router');

const { redisClient, redisSubscriber } = require('./src/redis/index');
const app = new Koa();
app.use(
  jsonError({
    postFormat: (e, { stack, ...rest }) => (process.env.NODE_ENV === 'production' ? rest : { stack, ...rest }),
  })
);

// -------------------------- 基础中间件 --------------------------
app.use(helmet()); // 安全
app.use(compress()); // 压缩
app.use(
  // 跨域
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(
  // 解析请求体（不开启文件上传，仅在需要的路由单独启用）
  koaBody({
    formidable: { maxFileSize: 5 * 1024 * 1024 },
  })
);
// --------------------------- 日志 --------------------------

app.use(koaLogger);

// -------------------------- 路由 --------------------------
const router = createRouter();
app.use(router.routes()).use(router.allowedMethods());

// -------------------------- 启动服务 --------------------------
// 🔥 端口从配置读取，修复变量名错误
const PORT = config.SERVER.port;
app.listen(PORT, () => {
  logger.info(`Koa 服务启动成功: http://localhost:${PORT}`);
});
