const path = require('path');

// 判断环境
const isProduction = process.env.NODE_ENV === 'production';
console.log('\x1b[32m%s\x1b[0m', '##################################################');
console.log('\x1b[32m%s\x1b[0m', `#####           当前环境：${isProduction ? '生产环境' : '开发环境'}           #####`);
console.log('\x1b[32m%s\x1b[0m', '##################################################');

// 🔥 核心服务配置（统一管理）
const SERVER = {
  port: process.env.SERVER_PORT,
  prefix: process.env.API_PREFIX,
  sessionSecret: process.env.SESSION_SECRET,
  jwtSecret: process.env.JWT_SECRET,
};

// MySQL 配置
const DB = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  db_name: process.env.DB_NAME,
  user: process.env.DB_USER,
  pwd: process.env.DB_PWD,
  dialect: 'mysql',
};

// Redis 配置
const REDIS = {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  user: process.env.REDIS_USER,
  pwd: process.env.REDIS_PWD,
  db: process.env.REDIS_DB || 0,
};

// WebSocket 配置
const WS = {
  path: process.env.WS_PATH || '/ws',
  port: process.env.WS_PORT || 3001,
  maxpayload: 16 * 1024 * 1024,
  idletimeout: 60,
  pingInterval: 30000,
  pingTimeout: 10000,
  authToken: process.env.WS_AUTH_TOKEN,
};

// 文件配置
const UPLOAD_PATH = isProduction ? '/srv/uploadDir' : path.join(__dirname, '..', '/uploadDir');
const FILE_OSS = 'http://192.168.3.15:8083/oss-file';

// 统一导出
module.exports = {
  isProduction,
  SERVER,
  DB,
  REDIS,
  WS,
  UPLOAD_PATH,
  FILE_OSS,
};
