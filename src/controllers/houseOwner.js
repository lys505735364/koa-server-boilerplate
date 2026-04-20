const Joi = require('joi');
const HouseOwnerService = require('../services/houseOwner');
const { logger } = require('../utils/logger');

/**
 * 添加产权人
 */
const addOwnerToHouse = async (ctx) => {
  const schema = Joi.object({
    houseId: Joi.number().integer().positive().required().messages({
      'number.base': '房产ID必须是数字',
      'number.positive': '房产ID必须为正整数',
      'any.required': '房产ID不能为空',
    }),
    ownerId: Joi.number().integer().positive().required().messages({
      'number.base': '业主ID必须是数字',
      'number.positive': '业主ID必须为正整数',
      'any.required': '业主ID不能为空',
    }),
    isPrimary: Joi.number().valid(0, 1).default(0).messages({
      'any.only': '是否主要产权人只能为0或1',
    }),
  });

  const { error, value } = schema.validate(ctx.request.body);
  if (error) {
    ctx.throw(400, error.details[0].message);
    return;
  }

  try {
    ctx.body = await HouseOwnerService.addOwnerToHouse(value);
  } catch (err) {
    logger.error('添加产权人失败:', err);
    ctx.throw(500, err.message);
  }
};

/**
 * 移除产权人
 */
const removeOwnerFromHouse = async (ctx) => {
  const schema = Joi.object({
    houseId: Joi.number().integer().positive().required().messages({
      'number.base': '房产ID必须是数字',
      'number.positive': '房产ID必须为正整数',
      'any.required': '房产ID不能为空',
    }),
    ownerId: Joi.number().integer().positive().required().messages({
      'number.base': '业主ID必须是数字',
      'number.positive': '业主ID必须为正整数',
      'any.required': '业主ID不能为空',
    }),
  });

  const { error, value } = schema.validate(ctx.request.body);
  if (error) {
    ctx.throw(400, error.details[0].message);
    return;
  }

  try {
    ctx.body = await HouseOwnerService.removeOwnerFromHouse(value);
  } catch (err) {
    logger.error('移除产权人失败:', err);
    ctx.throw(500, err.message);
  }
};

/**
 * 设置主要产权人
 */
const setPrimaryOwner = async (ctx) => {
  const schema = Joi.object({
    houseId: Joi.number().integer().positive().required().messages({
      'number.base': '房产ID必须是数字',
      'number.positive': '房产ID必须为正整数',
      'any.required': '房产ID不能为空',
    }),
    ownerId: Joi.number().integer().positive().required().messages({
      'number.base': '业主ID必须是数字',
      'number.positive': '业主ID必须为正整数',
      'any.required': '业主ID不能为空',
    }),
  });

  const { error, value } = schema.validate(ctx.request.body);
  if (error) {
    ctx.throw(400, error.details[0].message);
    return;
  }

  try {
    ctx.body = await HouseOwnerService.setPrimaryOwner(value);
  } catch (err) {
    logger.error('设置主要产权人失败:', err);
    ctx.throw(500, err.message);
  }
};

/**
 * 获取房产的产权人列表
 */
const getHouseOwners = async (ctx) => {
  const { houseId } = ctx.query;

  if (!houseId) {
    ctx.throw(400, '缺少房产ID');
    return;
  }

  try {
    ctx.body = await HouseOwnerService.getHouseOwners(houseId);
  } catch (err) {
    logger.error('获取房产业主列表失败:', err);
    ctx.throw(500, err.message);
  }
};

/**
 * 批量添加产权人
 */
const batchAddOwners = async (ctx) => {
  const schema = Joi.object({
    houseId: Joi.number().integer().positive().required().messages({
      'number.base': '房产ID必须是数字',
      'number.positive': '房产ID必须为正整数',
      'any.required': '房产ID不能为空',
    }),
    owners: Joi.array()
      .items(
        Joi.object({
          ownerId: Joi.number().integer().positive().required().messages({
            'number.base': '业主ID必须是数字',
            'number.positive': '业主ID必须为正整数',
            'any.required': '业主ID不能为空',
          }),
          isPrimary: Joi.number().valid(0, 1).default(0),
        })
      )
      .min(1)
      .required()
      .messages({
        'array.min': '至少需要添加一个业主',
        'any.required': '业主列表不能为空',
      }),
  });

  const { error, value } = schema.validate(ctx.request.body);
  if (error) {
    ctx.throw(400, error.details[0].message);
    return;
  }

  try {
    ctx.body = await HouseOwnerService.batchAddOwners(value);
  } catch (err) {
    logger.error('批量添加产权人失败:', err);
    ctx.throw(500, err.message);
  }
};

module.exports = {
  '/house-owner/add': {
    method: 'POST',
    handler: addOwnerToHouse,
    requiresAuth: true, // 需要登录
  },
  '/house-owner/remove': {
    method: 'POST',
    handler: removeOwnerFromHouse,
    requiresAuth: true, // 需要登录
  },
  '/house-owner/set-primary': {
    method: 'POST',
    handler: setPrimaryOwner,
    requiresAuth: true, // 需要登录
  },
  '/house-owner/list': {
    method: 'GET',
    handler: getHouseOwners,
    requiresAuth: false, // 不需要登录
  },
  '/house-owner/batch-add': {
    method: 'POST',
    handler: batchAddOwners,
    requiresAuth: true, // 需要登录
  },
};
