const fs = require('fs');
const path = require('path');
const Router = require('@koa/router');
const config = require('../config');
const { logger } = require('../utils/logger');
const { defineModelRelationships } = require('../model/relationships/index');
const authGuard = require('../guards/auth.guard');
const uploadMiddleware = require('../middleware/upload');

// 创建路由实例（携带全局前缀 /api）
const router = new Router({ prefix: config.SERVER.prefix });

/**
 * 合法HTTP请求方法白名单（仅支持这些方法）
 */
const ALLOWED_METHODS = ['get', 'post', 'put', 'delete', 'patch', 'options', 'head'];

/**
 * 自动扫描 controllers 目录，注册所有路由
 */
const buildRouters = () => {
  // 1. 获取控制器目录绝对路径
  const controllerDir = path.join(__dirname, '../controllers');

  // 2. 读取目录下所有文件
  const files = fs.readdirSync(controllerDir);

  // 3. 遍历所有控制器文件
  files.forEach((file) => {
    // 只加载 .js 文件
    if (!file.endsWith('.js')) return;

    try {
      // 加载控制器模块
      const controller = require(path.join(controllerDir, file));

      // 遍历控制器导出的路由配置
      for (const [url, routeInfo] of Object.entries(controller)) {
        // 基础空值校验
        if (!routeInfo || !routeInfo.method || !routeInfo.handler) {
          logger.err(`[路由注册失败] ${file} → 接口【${url}】配置不完整，已跳过`);
          continue;
        }

        const { method, handler, requiresAuth, permission, upload } = routeInfo;
        const lowerMethod = method.toLowerCase();

        // ✅ 核心：非法请求方法 → 跳过并打印日志
        if (!ALLOWED_METHODS.includes(lowerMethod)) {
          logger.warn(
            `[路由注册失败] ${file} → 接口【${url}】使用非法方法【${method}】，支持的方法：${ALLOWED_METHODS.join(', ')}`
          );
          continue;
        }

        // 校验handler必须是函数
        if (typeof handler !== 'function') {
          logger.warn(`[路由注册失败] ${file} → 接口【${url}】handler 不是函数，已跳过`);
          continue;
        }

        // 合法路由 → 注册
        // 如果路由标记了 upload: true，则添加文件上传中间件
        const middlewares = [
          async (ctx, next) => {
            ctx.routeConfig = { requiresAuth, permission };
            await next();
          },
        ];

        // 仅在需要上传的路由上添加上传中间件
        if (upload === true) {
          middlewares.push(uploadMiddleware);
        }

        middlewares.push(authGuard, handler);

        router[lowerMethod](url, ...middlewares);
        logger.info(`[路由注册成功] ${method.toUpperCase()} ${config.SERVER.prefix}${url}`);
      }
    } catch (err) {
      logger.error(`[加载控制器失败] ${file}，错误信息：${err.message}`);
    }
  });

  logger.info('✅ 自动路由加载完成：所有合法控制器已注册');
  return router;
};

module.exports = function () {
  defineModelRelationships();
  return buildRouters();
};
