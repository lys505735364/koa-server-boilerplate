// @/config/redis.js  路径：根目录/config/redis.js
const Redis = require('ioredis');
const { REDIS } = require('../config');
// 1. 基础配置（生产环境建议放到环境变量中）
const redisConfig = {
  host: REDIS.host, // Redis 地址
  port: REDIS.port, // 端口
  username: REDIS.user, // 这就是缺失的关键！
  password: REDIS.pwd, // Redis 密码（无密码留空）
  db: REDIS.db, // 选择数据库（Redis 默认 16 个库，0-15）
  retryDelayOnFailover: 100, // 故障重连延迟
  connectTimeout: 10000, // 连接超时时间（10秒）
  lazyConnect: false, // 禁用懒连接（启动即连接）

  enableReadyCheck: false, // 禁用自动重连（生产必备）

  // 🔥 核心：自动重连策略（生产必备）
  retryStrategy: (times) => {
    // 重连次数限制，最多重连 10 次，每次延迟递增
    if (times > 10) return null;
    return Math.min(times * 100, 3000);
  },
};

// 2. 创建普通 Redis 客户端（用于 set/get/del 等操作）
const redisClient = new Redis(redisConfig);

// 3. 创建独立的订阅客户端（发布/订阅必须分离！）
const redisSubscriber = new Redis(redisConfig);

// 监听连接状态（调试用）
redisClient.on('ready', () => {
  console.log('\x1b[32m##########################################\x1b[0m');
  console.log('\x1b[32m##   ✅  redisClient 服务链接成功!      ##\x1b[0m');
  console.log('\x1b[32m##########################################\x1b[0m');
});
redisClient.on('error', (err) => {
  console.log('\x1b[31m##########################################\x1b[0m');
  console.log('\x1b[31m##    ❌  redisClient 服务链接失败!     ##\x1b[0m');
  console.log('\x1b[31m##########################################\x1b[0m');
  console.log(err);
});
redisSubscriber.on('ready', () => {
  console.log('\x1b[32m##########################################\x1b[0m');
  console.log('\x1b[32m##   ✅  redisSubscriber 服务链接成功!  ##\x1b[0m');
  console.log('\x1b[32m##########################################\x1b[0m');
});
redisSubscriber.on('error', (err) => {
  console.log('\x1b[31m##########################################\x1b[0m');
  console.log('\x1b[31m##   ❌ redisSubscriber 服务链接失败!  ##\x1b[0m');
  console.log('\x1b[31m##########################################\x1b[0m');
});

module.exports = {
  redisClient, // 普通操作（存验证码、登录态）
  redisSubscriber, // 订阅专用（监听退出消息）
};
