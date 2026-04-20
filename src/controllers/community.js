const Joi = require('joi');
const CommunityService = require('../services/community');
const { logger } = require('../utils/logger');

/**
 * 创建小区
 */
const createCommunity = async (ctx) => {
  const schema = Joi.object({
    name: Joi.string().max(50).required().messages({
      'string.max': '小区名称不能超过50个字符',
      'any.required': '小区名称不能为空',
    }),
    address: Joi.string().max(200).allow('').messages({
      'string.max': '地址不能超过200个字符',
    }),
    regionCode: Joi.string().max(20).allow('').messages({
      'string.max': '区域编码不能超过20个字符',
    }),
  });

  const { error, value } = schema.validate(ctx.request.body);
  if (error) {
    ctx.throw(400, error.details[0].message);
    return;
  }

  try {
    ctx.body = await CommunityService.createCommunity(value);
  } catch (err) {
    logger.error('创建小区失败:', err);
    ctx.throw(500, err.message);
  }
};

/**
 * 删除小区
 */
const deleteCommunity = async (ctx) => {
  const { id } = ctx.request.body;

  if (!id) {
    ctx.throw(400, '缺少小区ID');
    return;
  }

  try {
    ctx.body = await CommunityService.deleteCommunity(id);
  } catch (err) {
    logger.error('删除小区失败:', err);
    ctx.throw(500, err.message);
  }
};

/**
 * 更新小区
 */
const updateCommunity = async (ctx) => {
  const { id, ...updateData } = ctx.request.body;

  if (!id) {
    ctx.throw(400, '缺少小区ID');
    return;
  }

  const schema = Joi.object({
    name: Joi.string().max(50).allow('').messages({
      'string.max': '小区名称不能超过50个字符',
    }),
    address: Joi.string().max(200).allow('').messages({
      'string.max': '地址不能超过200个字符',
    }),
    regionCode: Joi.string().max(20).allow('').messages({
      'string.max': '区域编码不能超过20个字符',
    }),
  });

  const { error, value } = schema.validate(updateData);
  if (error) {
    ctx.throw(400, error.details[0].message);
    return;
  }

  try {
    ctx.body = await CommunityService.updateCommunity(id, value);
  } catch (err) {
    logger.error('更新小区失败:', err);
    ctx.throw(500, err.message);
  }
};

/**
 * 获取小区详情
 */
const getCommunityById = async (ctx) => {
  const { id } = ctx.query;

  if (!id) {
    ctx.throw(400, '缺少小区ID');
    return;
  }

  try {
    ctx.body = await CommunityService.getCommunityById(id);
  } catch (err) {
    logger.error('获取小区详情失败:', err);
    ctx.throw(500, err.message);
  }
};

/**
 * 获取小区列表
 */
const getCommunityList = async (ctx) => {
  const { page, pageSize, name, regionCode } = ctx.query;

  try {
    ctx.body = await CommunityService.getCommunityList({
      page: page || 1,
      pageSize: pageSize || 10,
      name,
      regionCode,
    });
  } catch (err) {
    logger.error('获取小区列表失败:', err);
    ctx.throw(500, err.message);
  }
};

module.exports = {
  '/community/create': {
    method: 'POST',
    handler: createCommunity,
    requiresAuth: true, // 需要登录
  },
  '/community/delete': {
    method: 'POST',
    handler: deleteCommunity,
    requiresAuth: true, // 需要登录
  },
  '/community/update': {
    method: 'POST',
    handler: updateCommunity,
    requiresAuth: true, // 需要登录
  },
  '/community/detail': {
    method: 'GET',
    handler: getCommunityById,
    requiresAuth: false, // 不需要登录
  },
  '/community/list': {
    method: 'GET',
    handler: getCommunityList,
    requiresAuth: false, // 不需要登录
  },
};
