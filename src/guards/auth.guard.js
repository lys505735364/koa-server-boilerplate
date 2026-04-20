const { redisClient } = require('../redis/index');
const { logger } = require('../utils/logger');

/**
 * 全局路由守卫
 * 1. 白名单放行
 * 2. 校验token登录状态
 * 3. 校验接口权限
 */
const authGuard = async (ctx, next) => {
  // 从控制器自动路由传入的配置
  const routeConfig = ctx.routeConfig || {};
  const { requiresAuth = true, permission } = routeConfig;

  // ====================== 1. 不需要登录 → 直接放行
  if (!requiresAuth) {
    return next();
  }

  // ====================== 2. 获取token
  const token = ctx.headers.authorization || ctx.headers.token;
  if (!token) {
    ctx.throw(401, '请先登录');
  }

  // ====================== 3. 校验Redis登录状态
  const userInfo = await redisClient.get(token);
  if (!userInfo) {
    ctx.throw(401, '登录已过期，请重新登录');
  }

  // 解析用户信息（Redis中存储格式: { token: uuid, userInfo: userData }）
  const parsedData = JSON.parse(userInfo);
  const user = parsedData.userInfo || parsedData; // 兼容两种格式
  ctx.user = user; // 把用户信息挂到ctx，接口里直接用 ctx.user

  // ====================== 4. 权限校验（核心）
  if (permission) {
    const userPermissions = user.permissions || [];
    if (!userPermissions.includes(permission)) {
      ctx.throw(403, '无权限访问');
    }
  }

  // ====================== 5. 全部校验通过
  await next();
};

module.exports = authGuard;
