const Joi = require('joi');
const OwnerHouseService = require('../services/ownerHouse');
const { logger } = require('../utils/logger');

/**
 * 绑定业主与房产
 */
const bindOwnerHouse = async (ctx) => {
  const schema = Joi.object({
    ownerId: Joi.number().integer().positive().required().messages({
      'number.base': '业主ID必须是数字',
      'number.positive': '业主ID必须为正整数',
      'any.required': '业主ID不能为空',
    }),
    houseId: Joi.number().integer().positive().required().messages({
      'number.base': '房产ID必须是数字',
      'number.positive': '房产ID必须为正整数',
      'any.required': '房产ID不能为空',
    }),
    isPrimary: Joi.number().valid(0, 1).default(0).messages({
      'any.only': '是否主要房产只能为0或1',
    }),
  });

  const { error, value } = schema.validate(ctx.request.body);
  if (error) {
    ctx.throw(400, error.details[0].message);
    return;
  }

  try {
    ctx.body = await OwnerHouseService.bindOwnerHouse(value);
  } catch (err) {
    logger.error('绑定业主与房产失败:', err);
    ctx.throw(500, err.message);
  }
};

/**
 * 解绑业主与房产
 */
const unbindOwnerHouse = async (ctx) => {
  const schema = Joi.object({
    ownerId: Joi.number().integer().positive().required().messages({
      'number.base': '业主ID必须是数字',
      'number.positive': '业主ID必须为正整数',
      'any.required': '业主ID不能为空',
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
    ctx.body = await OwnerHouseService.unbindOwnerHouse(value);
  } catch (err) {
    logger.error('解绑业主与房产失败:', err);
    ctx.throw(500, err.message);
  }
};

/**
 * 设置主要房产
 */
const setPrimaryHouse = async (ctx) => {
  const schema = Joi.object({
    ownerId: Joi.number().integer().positive().required().messages({
      'number.base': '业主ID必须是数字',
      'number.positive': '业主ID必须为正整数',
      'any.required': '业主ID不能为空',
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
    ctx.body = await OwnerHouseService.setPrimaryHouse(value);
  } catch (err) {
    logger.error('设置主要房产失败:', err);
    ctx.throw(500, err.message);
  }
};

/**
 * 获取业主的房产列表
 */
const getOwnerHouses = async (ctx) => {
  const { ownerId } = ctx.query;

  if (!ownerId) {
    ctx.throw(400, '缺少业主ID');
    return;
  }

  try {
    ctx.body = await OwnerHouseService.getOwnerHouses(ownerId);
  } catch (err) {
    logger.error('获取业主房产列表失败:', err);
    ctx.throw(500, err.message);
  }
};

/**
 * 获取房产的业主列表
 */
const getHouseOwners = async (ctx) => {
  const { houseId } = ctx.query;

  if (!houseId) {
    ctx.throw(400, '缺少房产ID');
    return;
  }

  try {
    ctx.body = await OwnerHouseService.getHouseOwners(houseId);
  } catch (err) {
    logger.error('获取房产业主列表失败:', err);
    ctx.throw(500, err.message);
  }
};

module.exports = {
  '/owner-house/bind': {
    method: 'POST',
    handler: bindOwnerHouse,
    requiresAuth: true, // 需要登录
  },
  '/owner-house/unbind': {
    method: 'POST',
    handler: unbindOwnerHouse,
    requiresAuth: true, // 需要登录
  },
  '/owner-house/set-primary': {
    method: 'POST',
    handler: setPrimaryHouse,
    requiresAuth: true, // 需要登录
  },
  '/owner-house/owner-houses': {
    method: 'GET',
    handler: getOwnerHouses,
    requiresAuth: false, // 不需要登录
  },
  '/owner-house/house-owners': {
    method: 'GET',
    handler: getHouseOwners,
    requiresAuth: false, // 不需要登录
  },
};
