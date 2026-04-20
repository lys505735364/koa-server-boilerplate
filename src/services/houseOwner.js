const { RelOwnerHouseModel, RelOwnerCommunityModel, OwnerModel, HouseModel } = require('../model/index');
const { seq: sequelize } = require('../utils/modelBuild');
const { Op } = require('sequelize');
const { logger } = require('../utils/logger');
const { success, fail } = require('../utils/responseBody');

/**
 * 添加产权人（绑定业主到房产）
 */
const addOwnerToHouse = async (params) => {
  const { houseId, ownerId, isPrimary = 0 } = params;

  // 开启事务
  const transaction = await sequelize.transaction();

  try {
    // 检查房产是否存在
    const house = await HouseModel.findOne({
      where: { id: houseId, isDelete: 0 },
      transaction,
    });

    if (!house) {
      await transaction.rollback();
      return fail(null, '房产不存在');
    }

    // 检查业主是否存在
    const owner = await OwnerModel.findOne({
      where: { id: ownerId, isDelete: 0 },
      transaction,
    });

    if (!owner) {
      await transaction.rollback();
      return fail(null, '业主不存在');
    }

    // 检查是否已经绑定
    const existingRelation = await RelOwnerHouseModel.findOne({
      where: { ownerId, houseId, isDelete: 0 },
      transaction,
    });

    if (existingRelation) {
      await transaction.rollback();
      return fail(null, '该业主已是此房产的产权人');
    }

    // 如果设置为主要产权人，需要取消该房产的其他主要产权人
    if (isPrimary === 1) {
      await RelOwnerHouseModel.update(
        { isPrimary: 0 },
        { where: { houseId, isDelete: 0 }, transaction }
      );
    }

    // 创建绑定关系
    const relation = await RelOwnerHouseModel.create(
      { ownerId, houseId, isPrimary },
      { transaction }
    );

    // 同步建立业主与小区的关系
    const communityId = house.communityId;
    if (communityId) {
      const existingCommunityRelation = await RelOwnerCommunityModel.findOne({
        where: { ownerId, communityId, isDelete: 0 },
        transaction,
      });

      if (!existingCommunityRelation) {
        await RelOwnerCommunityModel.create(
          { ownerId, communityId },
          { transaction }
        );
        logger.info(`同步创建业主与小区关系: 业主ID=${ownerId}, 小区ID=${communityId}`);
      }
    }

    // 提交事务
    await transaction.commit();
    logger.info(`添加产权人成功: 房产ID=${houseId}, 业主ID=${ownerId}`);

    return success(relation, '添加产权人成功');
  } catch (error) {
    // 回滚事务
    await transaction.rollback();
    logger.error(`添加产权人失败:`, error);
    throw error;
  }
};

/**
 * 移除产权人（解绑业主与房产的关联）
 */
const removeOwnerFromHouse = async (params) => {
  const { houseId, ownerId } = params;

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
      return fail(null, '该业主不是此房产的产权人');
    }

    // 如果是主要产权人，不允许直接删除（需要先指定新的主要产权人）
    if (relation.isPrimary === 1) {
      // 检查是否还有其他产权人
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
    logger.info(`移除产权人成功: 房产ID=${houseId}, 业主ID=${ownerId}`);

    return success(null, '移除产权人成功');
  } catch (error) {
    // 回滚事务
    await transaction.rollback();
    logger.error(`移除产权人失败:`, error);
    throw error;
  }
};

/**
 * 设置主要产权人
 */
const setPrimaryOwner = async (params) => {
  const { houseId, ownerId } = params;

  // 检查绑定关系是否存在
  const relation = await RelOwnerHouseModel.findOne({
    where: {
      ownerId,
      houseId,
      isDelete: 0,
    },
  });

  if (!relation) {
    return fail(null, '该业主不是此房产的产权人');
  }

  // 取消该房产的其他主要产权人
  await RelOwnerHouseModel.update(
    { isPrimary: 0 },
    {
      where: {
        houseId,
        isDelete: 0,
      },
    }
  );

  // 设置当前业主为主要产权人
  await relation.update({ isPrimary: 1 });

  logger.info(`设置主要产权人成功: 房产ID=${houseId}, 业主ID=${ownerId}`);

  return success(null, '设置成功');
};

/**
 * 获取房产的产权人列表
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
 * 批量添加产权人
 */
const batchAddOwners = async (params) => {
  const { houseId, owners } = params; // owners: [{ ownerId, isPrimary }]

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
      {
        where: {
          houseId,
          isDelete: 0,
        },
      }
    );
  }

  // 逐个添加
  for (const item of owners) {
    try {
      const { ownerId, isPrimary = 0 } = item;

      // 检查业主是否存在
      const owner = await OwnerModel.findOne({
        where: {
          id: ownerId,
          isDelete: 0,
        },
      });

      if (!owner) {
        errors.push({ ownerId, error: '业主不存在' });
        continue;
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
        errors.push({ ownerId, error: '该业主已是此房产的产权人' });
        continue;
      }

      // 创建绑定关系
      const relation = await RelOwnerHouseModel.create({
        ownerId,
        houseId,
        isPrimary,
      });

      // 同步建立业主与小区的关系
      const communityId = house.communityId;
      if (communityId) {
        const existingCommunityRelation = await RelOwnerCommunityModel.findOne({
          where: { ownerId, communityId, isDelete: 0 },
        });

        if (!existingCommunityRelation) {
          await RelOwnerCommunityModel.create({
            ownerId,
            communityId,
          });
        }
      }

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
  addOwnerToHouse,
  removeOwnerFromHouse,
  setPrimaryOwner,
  getHouseOwners,
  batchAddOwners,
};
