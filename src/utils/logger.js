const pino = require('pino');
const isDev = process.env.NODE_ENV === 'development';

const baseConfig = {
  level: isDev ? 'debug' : 'info',
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label) => ({ level: label }),
  },
};

let transport;

if (isDev) {
  transport = {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'yyyy-mm-dd HH:MM:ss',
      ignore: 'pid,hostname',
    },
  };
} else {
  // ==============================================
  // 生产环境【官方正确、稳定、能生成文件】写法
  // ==============================================
  transport = {
    target: 'pino/file',
    options: {
      destination: './logs/app.log', // 必须用 destination
      mkdir: true,                   // 自动创建 logs 目录
    },
  };
}

const logger = pino({ ...baseConfig, transport });

module.exports = {
  logger,
  koaLogger: require('koa-pino-logger')({ logger: logger }),
};