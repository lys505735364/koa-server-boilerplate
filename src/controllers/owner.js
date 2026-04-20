const Joi = require('joi');
const OwnerService = require('../services/owner');
const { logger } = require('../utils/logger');

/**
 * 创建业主
 */
const createOwner = async (ctx) => {
  const schema = Joi.object({
    account: Joi.string().max(20).allow('').messages({
      'string.max': '账号不能超过20个字符',
    }),
    password: Joi.string().min(6).max(20).allow('').messages({
      'string.min': '密码长度不能少于6位',
      'string.max': '密码长度不能超过20位',
    }),
    userName: Joi.string().max(10).allow('').messages({
      'string.max': '姓名不能超过10个字符',
    }),
    phone: Joi.string()
      .pattern(/^1[3-9]\d{9}$/)
      .allow('')
      .messages({
        'string.pattern.base': '手机号格式不正确',
      }),
    email: Joi.string().email().max(50).allow('').messages({
      'string.email': '邮箱格式不正确',
      'string.max': '邮箱不能超过50个字符',
    }),
    age: Joi.number().integer().min(0).max(150).allow(null).messages({
      'number.min': '年龄不能小于0',
      'number.max': '年龄不能大于150',
    }),
    gender: Joi.number().valid(0, 1, 2).allow(null).messages({
      'any.only': '性别只能为0(未设置)、1(男)、2(女)',
    }),
  });

  const { error, value } = schema.validate(ctx.request.body);
  if (error) {
    ctx.throw(400, error.details[0].message);
    return;
  }

  try {
    ctx.body = await OwnerService.createOwner(value);
  } catch (err) {
    logger.error('创建业主失败:', err);
    ctx.throw(500, err.message);
  }
};

/**
 * 删除业主
 */
const deleteOwner = async (ctx) => {
  const { id } = ctx.request.body;

  if (!id) {
    ctx.throw(400, '缺少业主ID');
    return;
  }

  try {
    ctx.body = await OwnerService.deleteOwner(id);
  } catch (err) {
    logger.error('删除业主失败:', err);
    ctx.throw(500, err.message);
  }
};

/**
 * 更新业主
 */
const updateOwner = async (ctx) => {
  const { id, ...updateData } = ctx.request.body;

  if (!id) {
    ctx.throw(400, '缺少业主ID');
    return;
  }

  const schema = Joi.object({
    account: Joi.string().max(20).allow('').messages({
      'string.max': '账号不能超过20个字符',
    }),
    password: Joi.string().min(6).max(20).allow('').messages({
      'string.min': '密码长度不能少于6位',
      'string.max': '密码长度不能超过20位',
    }),
    userName: Joi.string().max(10).allow('').messages({
      'string.max': '姓名不能超过10个字符',
    }),
    phone: Joi.string()
      .pattern(/^1[3-9]\d{9}$/)
      .allow('')
      .messages({
        'string.pattern.base': '手机号格式不正确',
      }),
    email: Joi.string().email().max(50).allow('').messages({
      'string.email': '邮箱格式不正确',
      'string.max': '邮箱不能超过50个字符',
    }),
    age: Joi.number().integer().min(0).max(150).allow(null).messages({
      'number.min': '年龄不能小于0',
      'number.max': '年龄不能大于150',
    }),
    gender: Joi.number().valid(0, 1, 2).allow(null).messages({
      'any.only': '性别只能为0(未设置)、1(男)、2(女)',
    }),
  });

  const { error, value } = schema.validate(updateData);
  if (error) {
    ctx.throw(400, error.details[0].message);
    return;
  }

  try {
    ctx.body = await OwnerService.updateOwner(id, value);
  } catch (err) {
    logger.error('更新业主失败:', err);
    ctx.throw(500, err.message);
  }
};

/**
 * 获取业主详情
 */
const getOwnerById = async (ctx) => {
  const { id } = ctx.query;

  if (!id) {
    ctx.throw(400, '缺少业主ID');
    return;
  }

  try {
    ctx.body = await OwnerService.getOwnerById(id);
  } catch (err) {
    logger.error('获取业主详情失败:', err);
    ctx.throw(500, err.message);
  }
};

/**
 * 获取业主列表
 */
const getOwnerList = async (ctx) => {
  const { page, pageSize, userName, phone, account } = ctx.query;

  try {
    ctx.body = await OwnerService.getOwnerList({
      page: page || 1,
      pageSize: pageSize || 10,
      userName,
      phone,
      account,
    });
  } catch (err) {
    logger.error('获取业主列表失败:', err);
    ctx.throw(500, err.message);
  }
};

module.exports = {
  '/owner/create': {
    method: 'POST',
    handler: createOwner,
    requiresAuth: true, // 需要登录
  },
  '/owner/delete': {
    method: 'POST',
    handler: deleteOwner,
    requiresAuth: true, // 需要登录
  },
  '/owner/update': {
    method: 'POST',
    handler: updateOwner,
    requiresAuth: true, // 需要登录
  },
  '/owner/detail': {
    method: 'GET',
    handler: getOwnerById,
    requiresAuth: false, // 不需要登录
  },
  '/owner/list': {
    method: 'GET',
    handler: getOwnerList,
    requiresAuth: false, // 不需要登录
  },
};
