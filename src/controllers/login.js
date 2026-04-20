const Joi = require('joi');
const LoginService = require('../services/login');
const { logger } = require('../utils/logger');

/**
 * 获取图形验证码
 */
const createCaptchaImg = async (ctx) => {
  try {
    ctx.body = await LoginService.createCaptchaImg();
  } catch (err) {
    logger.error('获取图形验证码失败:', err);
    ctx.throw(500, err.message);
  }
};

/**
 * 用户注册（手机号+图形验证码）
 */
const register = async (ctx) => {
  // Joi 参数校验
  const schema = Joi.object({
    phone: Joi.string()
      .pattern(/^1[3-9]\d{9}$/)
      .required()
      .messages({
        'string.pattern.base': '手机号格式不正确',
        'any.required': '手机号不能为空',
      }),
    password: Joi.string().min(6).max(20).required().messages({
      'string.min': '密码长度不能少于6位',
      'string.max': '密码长度不能超过20位',
      'any.required': '密码不能为空',
    }),
    code: Joi.string().required().messages({
      'any.required': '图形验证码不能为空',
    }),
    token: Joi.string().required().messages({
      'any.required': '验证码Token不能为空',
    }),
  });

  const { error, value } = schema.validate(ctx.request.body);
  if (error) {
    ctx.throw(400, error.details[0].message);
    return;
  }

  try {
    ctx.body = await LoginService.register(value);
  } catch (err) {
    logger.error('用户注册失败:', err);
    ctx.throw(500, err.message);
  }
};

/**
 * 用户登录（手机号+密码）
 */
const login = async (ctx) => {
  const schema = Joi.object({
    phone: Joi.string()
      .pattern(/^1[3-9]\d{9}$/)
      .required()
      .messages({
        'string.pattern.base': '手机号格式不正确',
        'any.required': '手机号不能为空',
      }),
    password: Joi.string().required().messages({
      'any.required': '密码不能为空',
    }),
  });

  const { error, value } = schema.validate(ctx.request.body);
  if (error) {
    ctx.throw(400, error.details[0].message);
    return;
  }

  try {
    ctx.body = await LoginService.login(value);
  } catch (err) {
    logger.error('用户登录失败:', err);
    ctx.throw(500, err.message);
  }
};

/**
 * 获取用户可绑定的房产列表
 */
const getAvailableHouses = async (ctx) => {
  const { ownerId } = ctx.query;

  if (!ownerId) {
    ctx.throw(400, '缺少用户ID');
    return;
  }

  try {
    ctx.body = await LoginService.getAvailableHouses(ownerId);
  } catch (err) {
    logger.error('获取可绑定房产列表失败:', err);
    ctx.throw(500, err.message);
  }
};

/**
 * 选择房产进行认证（绑定业主与房产）
 */
const bindHouseForAuth = async (ctx) => {
  const schema = Joi.object({
    ownerId: Joi.number().integer().positive().required().messages({
      'number.base': '用户ID必须是数字',
      'number.positive': '用户ID必须为正整数',
      'any.required': '用户ID不能为空',
    }),
    houseId: Joi.number().integer().positive().required().messages({
      'number.base': '房产ID必须是数字',
      'number.positive': '房产ID必须为正整数',
      'any.required': '房产ID不能为空',
    }),
  });

  const { error, value } = schema.validate(ctx.request.body);
  if (error) {
    ctx.throw(400, error.details[0].message);
    return;
  }

  try {
    ctx.body = await LoginService.bindHouseForAuth(value);
  } catch (err) {
    logger.error('房产认证失败:', err);
    ctx.throw(500, err.message);
  }
};

/**
 * 退出登录
 */
const logout = async (ctx) => {
  const token = ctx.headers.authorization || ctx.headers.token;

  try {
    ctx.body = await LoginService.logout(token);
  } catch (err) {
    logger.error('退出登录失败:', err);
    ctx.throw(500, err.message);
  }
};

module.exports = {
  '/login/captcha': {
    method: 'GET',
    handler: createCaptchaImg,
    requiresAuth: false, // 不需要登录
  },
  '/login/register': {
    method: 'POST',
    handler: register,
    requiresAuth: false, // 不需要登录
  },
  '/login/login': {
    method: 'POST',
    handler: login,
    requiresAuth: false, // 不需要登录
  },
  '/login/logout': {
    method: 'POST',
    handler: logout,
    requiresAuth: true, // 需要登录
  },
  '/auth/available-houses': {
    method: 'GET',
    handler: getAvailableHouses,
    requiresAuth: true, // 需要登录
  },
  '/auth/bind-house': {
    method: 'POST',
    handler: bindHouseForAuth,
    requiresAuth: true, // 需要登录
  },
};
