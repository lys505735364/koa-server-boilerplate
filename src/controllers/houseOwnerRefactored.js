const Joi = require('joi');
const OwnerHouseRelationService = require('../services/ownerHouseRelation');
const { logger } = require('../utils/logger');

/**
 * 添加产权人（房产视角）
 */
const addOwnerToHouse = async (ctx) => {
  const schema = Joi.object({
    houseId: Joi.number().integer().positive().required(),
    ownerId: Joi.number().integer().positive().required(),
    isPrimary: Joi.number().valid(0, 1).default(0),
  });

  const { error, value } = schema.validate(ctx.request.body);
  if (error) {
    ctx.throw(400, error.details[0].message);
    return;
  }

  try {
    ctx.body = await OwnerHouseRelationService.createRelation({
      ...value,
      perspective: 'house', // 房产视角
    });
  } catch (err) {
    logger.error('添加产权人失败:', err);
    ctx.throw(500, err.message);
  }
};

/**
 * 移除产权人（房产视角）
 */
const removeOwnerFromHouse = async (ctx) => {
  const schema = Joi.object({
    houseId: Joi.number().integer().positive().required(),
    ownerId: Joi.number().integer().positive().required(),
  });

  const { error, value } = schema.validate(ctx.request.body);
  if (error) {
    ctx.throw(400, error.details[0].message);
    return;
  }

  try {
    ctx.body = await OwnerHouseRelationService.deleteRelation({
      ...value,
      perspective: 'house', // 房产视角
    });
  } catch (err) {
    logger.error('移除产权人失败:', err);
    ctx.throw(500, err.message);
  }
};

/**
 * 设置主要产权人（房产视角）
 */
const setPrimaryOwner = async (ctx) => {
  const schema = Joi.object({
    houseId: Joi.number().integer().positive().required(),
    ownerId: Joi.number().integer().positive().required(),
  });

  const { error, value } = schema.validate(ctx.request.body);
  if (error) {
    ctx.throw(400, error.details[0].message);
    return;
  }

  try {
    ctx.body = await OwnerHouseRelationService.setPrimary({
      ...value,
      perspective: 'house', // 房产视角
    });
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
    ctx.body = await OwnerHouseRelationService.getHouseOwners(houseId);
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
    houseId: Joi.number().integer().positive().required(),
    owners: Joi.array()
      .items(
        Joi.object({
          ownerId: Joi.number().integer().positive().required(),
          isPrimary: Joi.number().valid(0, 1).default(0),
        })
      )
      .min(1)
      .required(),
  });

  const { error, value } = schema.validate(ctx.request.body);
  if (error) {
    ctx.throw(400, error.details[0].message);
    return;
  }

  try {
    ctx.body = await OwnerHouseRelationService.batchAddOwners(value);
  } catch (err) {
    logger.error('批量添加产权人失败:', err);
    ctx.throw(500, err.message);
  }
};

module.exports = {
  '/house-owner/add': {
    method: 'POST',
    handler: addOwnerToHouse,
    requiresAuth: true,
  },
  '/house-owner/remove': {
    method: 'POST',
    handler: removeOwnerFromHouse,
    requiresAuth: true,
  },
  '/house-owner/set-primary': {
    method: 'POST',
    handler: setPrimaryOwner,
    requiresAuth: true,
  },
  '/house-owner/list': {
    method: 'GET',
    handler: getHouseOwners,
    requiresAuth: false,
  },
  '/house-owner/batch-add': {
    method: 'POST',
    handler: batchAddOwners,
    requiresAuth: true,
  },
};
