const { RelOwnerHouseModel, RelOwnerCommunityModel, OwnerModel, HouseModel, CommunityModel } = require('../model/index');
const { seq: sequelize } = require('../utils/modelBuild');
const { Op } = require('sequelize');
const { logger } = require('../utils/logger');
const { success, fail } = require('../utils/responseBody');

/**
 * 通用：创建业主与房产的关联关系
 * @param {Object} params - { ownerId, houseId, isPrimary, perspective: 'owner' | 'house' }
 */
const createRelation = async (params) => {
  const { ownerId, houseId, isPrimary = 0, perspective = 'house' } = params;

  // 开启事务
  const transaction = await sequelize.transaction();

  try {
    // 检查业主是否存在
    const owner = await OwnerModel.findOne({
      where: { id: ownerId, isDelete: 0 },
      transaction,
    });
    if (!owner) {
      await transaction.rollback();
      return fail(null, '业主不存在');
    }

    // 检查房产是否存在
    const house = await HouseModel.findOne({
      where: { id: houseId, isDelete: 0 },
      transaction,
    });
    if (!house) {
      await transaction.rollback();
      return fail(null, '房产不存在');
    }

    // 检查是否已经绑定
    const existingRelation = await RelOwnerHouseModel.findOne({
      where: { ownerId, houseId, isDelete: 0 },
      transaction,
    });
    if (existingRelation) {
      await transaction.rollback();
      return fail(null, '该关联关系已存在');
    }

    // 根据视角处理主要对象
    if (isPrimary === 1) {
      if (perspective === 'owner') {
        // 业主视角：取消该业主的其他主要房产
        await RelOwnerHouseModel.update(
          { isPrimary: 0 },
          { where: { ownerId, isDelete: 0 }, transaction }
        );
      } else {
        // 房产视角：取消该房产的其他主要产权人
        await RelOwnerHouseModel.update(
          { isPrimary: 0 },
          { where: { houseId, isDelete: 0 }, transaction }
        );
      }
    }

    // 创建绑定关系
    const relation = await RelOwnerHouseModel.create(
      {
        ownerId,
        houseId,
        isPrimary,
      },
      { transaction }
    );

    // 同步建立业主与小区的关系
    const communityId = house.communityId;
    if (communityId) {
      // 检查是否已经存在业主与小区的关系
      const existingCommunityRelation = await RelOwnerCommunityModel.findOne({
        where: { ownerId, communityId, isDelete: 0 },
        transaction,
      });

      if (!existingCommunityRelation) {
        // 创建业主与小区的关系
        await RelOwnerCommunityModel.create(
          {
            ownerId,
            communityId,
          },
          { transaction }
        );
        logger.info(`同步创建业主与小区关系: 业主ID=${ownerId}, 小区ID=${communityId}`);
      }
    }

    // 提交事务
    await transaction.commit();
    logger.info(`创建关联关系成功: 业主ID=${ownerId}, 房产ID=${houseId}, 视角=${perspective}`);

    return success(relation, '创建成功');
  } catch (error) {
    // 回滚事务
    await transaction.rollback();
    logger.error(`创建关联关系失败:`, error);
    throw error;
  }
};

/**
 * 通用：删除业主与房产的关联关系
 * @param {Object} params - { ownerId, houseId, perspective: 'owner' | 'house' }
 */
const deleteRelation = async (params) => {
  const { ownerId, houseId, perspective = 'house' } = params;

  // 开启事务
  const transaction = await sequelize.transaction();

  try {
    // 查找绑定关系
    const relation = await RelOwnerHouseModel.findOne({
      where: { ownerId, houseId, isDelete: 0 },
      transaction,
    });

    if (!relation) {
      await transaction.rollback();
      return fail(null, '未找到关联关系');
    }

    // 房产视角的安全检查
    if (perspective === 'house' && relation.isPrimary === 1) {
      const otherOwners = await RelOwnerHouseModel.count({
        where: {
          houseId,
          id: { [Op.ne]: relation.id },
          isDelete: 0,
        },
        transaction,
      });

      if (otherOwners > 0) {
        await transaction.rollback();
        return fail(null, '该业主是主要产权人，请先指定其他产权人为主要产权人后再移除');
      }
    }

    // 先获取房产的小区ID（在软删除之前）
    const house = await HouseModel.findByPk(houseId, { transaction });
    const communityId = house?.communityId;

    // 软删除
    await relation.update({ isDelete: 1 }, { transaction });

    // 同步检查并解除业主与小区的关系
    if (communityId) {
      // 检查该业主在该小区是否还有其他未删除的房产
      // 注意：此时当前房产已经被标记为 isDelete=1，所以不会被计入
      const otherHousesInCommunity = await RelOwnerHouseModel.count({
        where: {
          ownerId,
          isDelete: 0, // 只统计未删除的房产
        },
        include: [
          {
            model: HouseModel,
            as: 'house',
            where: { communityId, isDelete: 0 },
            required: true,
          },
        ],
        transaction,
      });

      // 如果没有其他房产，则解除业主与小区的关系
      if (otherHousesInCommunity === 0) {
        await RelOwnerCommunityModel.update(
          { isDelete: 1 },
          { where: { ownerId, communityId, isDelete: 0 }, transaction }
        );
        logger.info(`同步解除业主与小区关系: 业主ID=${ownerId}, 小区ID=${communityId}`);
      } else {
        logger.info(`业主在该小区还有其他${otherHousesInCommunity}处房产，保留小区关系`);
      }
    }

    // 提交事务
    await transaction.commit();
    logger.info(`删除关联关系成功: 业主ID=${ownerId}, 房产ID=${houseId}`);

    return success(null, '删除成功');
  } catch (error) {
    // 回滚事务
    await transaction.rollback();
    logger.error(`删除关联关系失败:`, error);
    throw error;
  }
};

/**
 * 通用：设置主要对象
 * @param {Object} params - { ownerId, houseId, perspective: 'owner' | 'house' }
 */
const setPrimary = async (params) => {
  const { ownerId, houseId, perspective = 'house' } = params;

  // 检查绑定关系是否存在
  const relation = await RelOwnerHouseModel.findOne({
    where: { ownerId, houseId, isDelete: 0 },
  });

  if (!relation) {
    return fail(null, '未找到关联关系');
  }

  // 根据视角更新
  if (perspective === 'owner') {
    // 业主视角：取消该业主的其他主要房产
    await RelOwnerHouseModel.update(
      { isPrimary: 0 },
      { where: { ownerId, isDelete: 0 } }
    );
  } else {
    // 房产视角：取消该房产的其他主要产权人
    await RelOwnerHouseModel.update(
      { isPrimary: 0 },
      { where: { houseId, isDelete: 0 } }
    );
  }

  // 设置当前为主要对象
  await relation.update({ isPrimary: 1 });

  logger.info(`设置主要对象成功: 业主ID=${ownerId}, 房产ID=${houseId}, 视角=${perspective}`);

  return success(null, '设置成功');
};

/**
 * 获取业主的房产列表
 */
const getOwnerHouses = async (ownerId) => {
  // 检查业主是否存在
  const owner = await OwnerModel.findOne({
    where: { id: ownerId, isDelete: 0 },
  });

  if (!owner) {
    return fail(null, '业主不存在');
  }

  // 查询绑定的房产列表
  const relations = await RelOwnerHouseModel.findAll({
    where: { ownerId, isDelete: 0 },
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
    where: { id: houseId, isDelete: 0 },
  });

  if (!house) {
    return fail(null, '房产不存在');
  }

  // 查询绑定的业主列表
  const relations = await RelOwnerHouseModel.findAll({
    where: { houseId, isDelete: 0 },
    include: [
      {
        model: OwnerModel,
        as: 'owner',
        attributes: { exclude: ['passwordHash'] },
        where: { isDelete: 0 },
        required: true,
      },
    ],
    order: [['isPrimary', 'DESC'], ['createAt', 'ASC']],
  });

  // 格式化返回数据
  const owners = relations.map((rel) => ({
    ...rel.owner.get({ plain: true }),
    isPrimary: rel.isPrimary,
    relationId: rel.id,
    bindTime: rel.createAt,
  }));

  return success(owners, '获取成功');
};

/**
 * 批量添加产权人（房产视角）
 */
const batchAddOwners = async (params) => {
  const { houseId, owners } = params; // owners: [{ ownerId, isPrimary }]

  // 检查房产是否存在
  const house = await HouseModel.findOne({
    where: { id: houseId, isDelete: 0 },
  });

  if (!house) {
    return fail(null, '房产不存在');
  }

  const results = [];
  const errors = [];

  // 检查是否有多个主要产权人
  const primaryCount = owners.filter((o) => o.isPrimary === 1).length;
  if (primaryCount > 1) {
    return fail(null, '只能设置一个主要产权人');
  }

  // 如果有一个主要产权人，先取消现有的
  if (primaryCount === 1) {
    await RelOwnerHouseModel.update(
      { isPrimary: 0 },
      { where: { houseId, isDelete: 0 } }
    );
  }

  // 逐个添加
  for (const item of owners) {
    try {
      const { ownerId, isPrimary = 0 } = item;

      // 检查业主是否存在
      const owner = await OwnerModel.findOne({
        where: { id: ownerId, isDelete: 0 },
      });

      if (!owner) {
        errors.push({ ownerId, error: '业主不存在' });
        continue;
      }

      // 检查是否已经绑定
      const existingRelation = await RelOwnerHouseModel.findOne({
        where: { ownerId, houseId, isDelete: 0 },
      });

      if (existingRelation) {
        errors.push({ ownerId, error: '该业主已是此房产的产权人' });
        continue;
      }

      // 创建绑定关系
      const relation = await RelOwnerHouseModel.create({
        ownerId,
        houseId,
        isPrimary,
      });

      results.push(relation);
    } catch (err) {
      errors.push({ ownerId: item.ownerId, error: err.message });
    }
  }

  logger.info(`批量添加产权人完成: 房产ID=${houseId}, 成功${results.length}个, 失败${errors.length}个`);

  return success(
    {
      success: results,
      failed: errors,
    },
    `批量添加完成：成功${results.length}个，失败${errors.length}个`
  );
};

module.exports = {
  createRelation,
  deleteRelation,
  setPrimary,
  getOwnerHouses,
  getHouseOwners,
  batchAddOwners,
};
