const Joi = require('joi');
const HouseService = require('../services/house');
const { logger } = require('../utils/logger');

/**
 * 创建房产
 */
const createHouse = async (ctx) => {
  const schema = Joi.object({
    communityId: Joi.number().integer().positive().required().messages({
      'number.base': '小区ID必须是数字',
      'number.positive': '小区ID必须为正整数',
      'any.required': '小区ID不能为空',
    }),
    building: Joi.string().max(10).required().messages({
      'string.max': '楼栋号不能超过10个字符',
      'any.required': '楼栋号不能为空',
    }),
    unit: Joi.string().max(10).allow('').messages({
      'string.max': '单元号不能超过10个字符',
    }),
    roomNumber: Joi.string().max(20).required().messages({
      'string.max': '房号不能超过20个字符',
      'any.required': '房号不能为空',
    }),
    area: Joi.number().positive().allow(null).messages({
      'number.positive': '面积必须为正数',
    }),
  });

  const { error, value } = schema.validate(ctx.request.body);
  if (error) {
    ctx.throw(400, error.details[0].message);
    return;
  }

  try {
    ctx.body = await HouseService.createHouse(value);
  } catch (err) {
    logger.error('创建房产失败:', err);
    ctx.throw(500, err.message);
  }
};

/**
 * 删除房产
 */
const deleteHouse = async (ctx) => {
  const { id } = ctx.request.body;

  if (!id) {
    ctx.throw(400, '缺少房产ID');
    return;
  }

  try {
    ctx.body = await HouseService.deleteHouse(id);
  } catch (err) {
    logger.error('删除房产失败:', err);
    ctx.throw(500, err.message);
  }
};

/**
 * 更新房产
 */
const updateHouse = async (ctx) => {
  const { id, ...updateData } = ctx.request.body;

  if (!id) {
    ctx.throw(400, '缺少房产ID');
    return;
  }

  const schema = Joi.object({
    communityId: Joi.number().integer().positive().messages({
      'number.base': '小区ID必须是数字',
      'number.positive': '小区ID必须为正整数',
    }),
    building: Joi.string().max(10).messages({
      'string.max': '楼栋号不能超过10个字符',
    }),
    unit: Joi.string().max(10).allow('').messages({
      'string.max': '单元号不能超过10个字符',
    }),
    roomNumber: Joi.string().max(20).messages({
      'string.max': '房号不能超过20个字符',
    }),
    area: Joi.number().positive().allow(null).messages({
      'number.positive': '面积必须为正数',
    }),
  });

  const { error, value } = schema.validate(updateData);
  if (error) {
    ctx.throw(400, error.details[0].message);
    return;
  }

  try {
    ctx.body = await HouseService.updateHouse(id, value);
  } catch (err) {
    logger.error('更新房产失败:', err);
    ctx.throw(500, err.message);
  }
};

/**
 * 获取房产详情
 */
const getHouseById = async (ctx) => {
  const { id } = ctx.query;

  if (!id) {
    ctx.throw(400, '缺少房产ID');
    return;
  }

  try {
    ctx.body = await HouseService.getHouseById(id);
  } catch (err) {
    logger.error('获取房产详情失败:', err);
    ctx.throw(500, err.message);
  }
};

/**
 * 获取房产列表
 */
const getHouseList = async (ctx) => {
  const { page, pageSize, communityId, building, roomNumber } = ctx.query;

  try {
    ctx.body = await HouseService.getHouseList({
      page: page || 1,
      pageSize: pageSize || 10,
      communityId,
      building,
      roomNumber,
    });
  } catch (err) {
    logger.error('获取房产列表失败:', err);
    ctx.throw(500, err.message);
  }
};

module.exports = {
  '/house/create': {
    method: 'POST',
    handler: createHouse,
    requiresAuth: true, // 需要登录
  },
  '/house/delete': {
    method: 'POST',
    handler: deleteHouse,
    requiresAuth: true, // 需要登录
  },
  '/house/update': {
    method: 'POST',
    handler: updateHouse,
    requiresAuth: true, // 需要登录
  },
  '/house/detail': {
    method: 'GET',
    handler: getHouseById,
    requiresAuth: false, // 不需要登录
  },
  '/house/list': {
    method: 'GET',
    handler: getHouseList,
    requiresAuth: false, // 不需要登录
  },
};
