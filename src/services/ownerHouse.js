const { RelOwnerHouseModel, OwnerModel, HouseModel } = require('../model/index');
const { Op } = require('sequelize');
const { logger } = require('../utils/logger');
const { success, fail } = require('../utils/responseBody');

/**
 * 绑定业主与房产
 */
const bindOwnerHouse = async (params) => {
  const { ownerId, houseId, isPrimary = 0 } = params;

  // 检查业主是否存在
  const owner = await OwnerModel.findOne({
    where: {
      id: ownerId,
      isDelete: 0,
    },
  });

  if (!owner) {
    return fail(null, '业主不存在');
  }

  // 检查房产是否存在
  const house = await HouseModel.findOne({
    where: {
      id: houseId,
      isDelete: 0,
    },
  });

  if (!house) {
    return fail(null, '房产不存在');
  }

  // 检查是否已经绑定
  const existingRelation = await RelOwnerHouseModel.findOne({
    where: {
      ownerId,
      houseId,
      isDelete: 0,
    },
  });

  if (existingRelation) {
    return fail(null, '该业主已绑定此房产');
  }

  // 如果设置为主要房产，需要取消该业主的其他主要房产
  if (isPrimary === 1) {
    await RelOwnerHouseModel.update(
      { isPrimary: 0 },
      {
        where: {
          ownerId,
          isDelete: 0,
        },
      }
    );
  }

  // 创建绑定关系
  const relation = await RelOwnerHouseModel.create({
    ownerId,
    houseId,
    isPrimary,
  });

  logger.info(`绑定业主与房产成功: 业主ID=${ownerId}, 房产ID=${houseId}`);

  return success(relation, '绑定成功');
};

/**
 * 解绑业主与房产
 */
const unbindOwnerHouse = async (params) => {
  const { ownerId, houseId } = params;

  // 查找绑定关系
  const relation = await RelOwnerHouseModel.findOne({
    where: {
      ownerId,
      houseId,
      isDelete: 0,
    },
  });

  if (!relation) {
    return fail(null, '未找到绑定关系');
  }

  // 软删除
  await relation.update({ isDelete: 1 });

  logger.info(`解绑业主与房产成功: 业主ID=${ownerId}, 房产ID=${houseId}`);

  return success(null, '解绑成功');
};

/**
 * 设置主要房产
 */
const setPrimaryHouse = async (params) => {
  const { ownerId, houseId } = params;

  // 检查绑定关系是否存在
  const relation = await RelOwnerHouseModel.findOne({
    where: {
      ownerId,
      houseId,
      isDelete: 0,
    },
  });

  if (!relation) {
    return fail(null, '未找到绑定关系');
  }

  // 取消该业主的其他主要房产
  await RelOwnerHouseModel.update(
    { isPrimary: 0 },
    {
      where: {
        ownerId,
        isDelete: 0,
      },
    }
  );

  // 设置当前房产为主要房产
  await relation.update({ isPrimary: 1 });

  logger.info(`设置主要房产成功: 业主ID=${ownerId}, 房产ID=${houseId}`);

  return success(null, '设置成功');
};

/**
 * 获取业主的房产列表
 */
const getOwnerHouses = async (ownerId) => {
  // 检查业主是否存在
  const owner = await OwnerModel.findOne({
    where: {
      id: ownerId,
      isDelete: 0,
    },
  });

  if (!owner) {
    return fail(null, '业主不存在');
  }

  // 查询绑定的房产列表
  const relations = await RelOwnerHouseModel.findAll({
    where: {
      ownerId,
      isDelete: 0,
    },
    include: [
      {
        model: HouseModel,
        as: 'house',
        attributes: ['id', 'communityId', 'building', 'unit', 'roomNumber', 'area'],
        where: { isDelete: 0 },
        required: true,
      },
    ],
    order: [['isPrimary', 'DESC'], ['createAt', 'DESC']],
  });

  // 格式化返回数据
  const houses = relations.map((rel) => ({
    ...rel.house.get({ plain: true }),
    isPrimary: rel.isPrimary,
    relationId: rel.id,
  }));

  return success(houses, '获取成功');
};

/**
 * 获取房产的业主列表
 */
const getHouseOwners = async (houseId) => {
  // 检查房产是否存在
  const house = await HouseModel.findOne({
    where: {
      id: houseId,
      isDelete: 0,
    },
  });

  if (!house) {
    return fail(null, '房产不存在');
  }

  // 查询绑定的业主列表
  const relations = await RelOwnerHouseModel.findAll({
    where: {
      houseId,
      isDelete: 0,
    },
    include: [
      {
        model: OwnerModel,
        as: 'owner',
        attributes: { exclude: ['passwordHash'] },
        where: { isDelete: 0 },
        required: true,
      },
    ],
    order: [['isPrimary', 'DESC'], ['createAt', 'DESC']],
  });

  // 格式化返回数据
  const owners = relations.map((rel) => ({
    ...rel.owner.get({ plain: true }),
    isPrimary: rel.isPrimary,
    relationId: rel.id,
  }));

  return success(owners, '获取成功');
};

module.exports = {
  bindOwnerHouse,
  unbindOwnerHouse,
  setPrimaryHouse,
  getOwnerHouses,
  getHouseOwners,
};
