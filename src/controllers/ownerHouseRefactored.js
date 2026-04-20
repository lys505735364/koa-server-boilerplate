const Joi = require('joi');
const OwnerHouseRelationService = require('../services/ownerHouseRelation');
const { logger } = require('../utils/logger');

/**
 * 绑定业主与房产（业主视角）
 */
const bindOwnerHouse = async (ctx) => {
  const schema = Joi.object({
    ownerId: Joi.number().integer().positive().required(),
    houseId: Joi.number().integer().positive().required(),
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
      perspective: 'owner', // 业主视角
    });
  } catch (err) {
    logger.error('绑定业主与房产失败:', err);
    ctx.throw(500, err.message);
  }
};

/**
 * 解绑业主与房产（业主视角）
 */
const unbindOwnerHouse = async (ctx) => {
  const schema = Joi.object({
    ownerId: Joi.number().integer().positive().required(),
    houseId: Joi.number().integer().positive().required(),
  });

  const { error, value } = schema.validate(ctx.request.body);
  if (error) {
    ctx.throw(400, error.details[0].message);
    return;
  }

  try {
    ctx.body = await OwnerHouseRelationService.deleteRelation({
      ...value,
      perspective: 'owner', // 业主视角
    });
  } catch (err) {
    logger.error('解绑业主与房产失败:', err);
    ctx.throw(500, err.message);
  }
};

/**
 * 设置主要房产（业主视角）
 */
const setPrimaryHouse = async (ctx) => {
  const schema = Joi.object({
    ownerId: Joi.number().integer().positive().required(),
    houseId: Joi.number().integer().positive().required(),
  });

  const { error, value } = schema.validate(ctx.request.body);
  if (error) {
    ctx.throw(400, error.details[0].message);
    return;
  }

  try {
    ctx.body = await OwnerHouseRelationService.setPrimary({
      ...value,
      perspective: 'owner', // 业主视角
    });
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
    ctx.body = await OwnerHouseRelationService.getOwnerHouses(ownerId);
  } catch (err) {
    logger.error('获取业主房产列表失败:', err);
    ctx.throw(500, err.message);
  }
};

module.exports = {
  '/owner-house/bind': {
    method: 'POST',
    handler: bindOwnerHouse,
    requiresAuth: true,
  },
  '/owner-house/unbind': {
    method: 'POST',
    handler: unbindOwnerHouse,
    requiresAuth: true,
  },
  '/owner-house/set-primary': {
    method: 'POST',
    handler: setPrimaryHouse,
    requiresAuth: true,
  },
  '/owner-house/owner-houses': {
    method: 'GET',
    handler: getOwnerHouses,
    requiresAuth: false,
  },
};
