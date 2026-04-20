const { HouseModel, CommunityModel } = require('../model/index');
const { Op } = require('sequelize');
const { logger } = require('../utils/logger');
const { success, fail } = require('../utils/responseBody');

/**
 * 创建房产
 */
const createHouse = async (params) => {
  const { communityId, building, unit, roomNumber, area } = params;

  // 检查小区是否存在
  const community = await CommunityModel.findOne({
    where: {
      id: communityId,
      isDelete: 0,
    },
  });

  if (!community) {
    return fail(null, '小区不存在');
  }

  // 检查房产是否已存在（同一小区、楼栋、单元、房号）
  const whereCondition = {
    communityId,
    building,
    roomNumber,
    isDelete: 0,
  };

  if (unit) {
    whereCondition.unit = unit;
  } else {
    whereCondition.unit = { [Op.or]: [null, ''] };
  }

  const existingHouse = await HouseModel.findOne({
    where: whereCondition,
  });

  if (existingHouse) {
    return fail(null, '该房产已存在');
  }

  // 创建房产
  const house = await HouseModel.create({
    communityId,
    building,
    unit,
    roomNumber,
    area,
  });

  logger.info(`创建房产成功: ${building}-${unit || ''}-${roomNumber}`);

  return success(house, '创建房产成功');
};

/**
 * 删除房产（软删除）
 */
const deleteHouse = async (id) => {
  const house = await HouseModel.findByPk(id);

  if (!house) {
    return fail(null, '房产不存在');
  }

  // 软删除
  await house.update({ isDelete: 1 });

  logger.info(`删除房产成功: ID=${id}`);

  return success(null, '删除房产成功');
};

/**
 * 更新房产
 */
const updateHouse = async (id, params) => {
  const { communityId, building, unit, roomNumber, area } = params;

  const house = await HouseModel.findByPk(id);

  if (!house) {
    return fail(null, '房产不存在');
  }

  // 如果修改了小区ID，检查小区是否存在
  if (communityId && communityId !== house.communityId) {
    const community = await CommunityModel.findOne({
      where: {
        id: communityId,
        isDelete: 0,
      },
    });

    if (!community) {
      return fail(null, '小区不存在');
    }
  }

  // 如果修改了关键信息，检查是否与其他房产重复
  if (communityId || building || roomNumber || unit !== undefined) {
    const newCommunityId = communityId || house.communityId;
    const newBuilding = building || house.building;
    const newRoomNumber = roomNumber || house.roomNumber;
    const newUnit = unit !== undefined ? unit : house.unit;

    const whereCondition = {
      id: { [Op.ne]: id },
      communityId: newCommunityId,
      building: newBuilding,
      roomNumber: newRoomNumber,
      isDelete: 0,
    };

    if (newUnit) {
      whereCondition.unit = newUnit;
    } else {
      whereCondition.unit = { [Op.or]: [null, ''] };
    }

    const existingHouse = await HouseModel.findOne({
      where: whereCondition,
    });

    if (existingHouse) {
      return fail(null, '该房产已存在');
    }
  }

  // 更新房产信息
  await house.update({
    communityId: communityId !== undefined ? communityId : house.communityId,
    building: building || house.building,
    unit: unit !== undefined ? unit : house.unit,
    roomNumber: roomNumber || house.roomNumber,
    area: area !== undefined ? area : house.area,
  });

  logger.info(`更新房产成功: ID=${id}`);

  return success(house, '更新房产成功');
};

/**
 * 获取房产详情
 */
const getHouseById = async (id) => {
  const house = await HouseModel.findOne({
    where: {
      id,
      isDelete: 0,
    },
    include: [
      {
        model: CommunityModel,
        as: 'community',
        attributes: ['id', 'name', 'address'],
        where: { isDelete: 0 },
        required: false,
      },
    ],
  });

  if (!house) {
    return fail(null, '房产不存在');
  }

  return success(house, '获取房产详情成功');
};

/**
 * 获取房产列表（分页）
 */
const getHouseList = async (params) => {
  const { page = 1, pageSize = 10, communityId, building, roomNumber } = params;

  const offset = (page - 1) * pageSize;
  const where = { isDelete: 0 };

  // 搜索条件
  if (communityId) {
    where.communityId = communityId;
  }
  if (building) {
    where.building = { [Op.like]: `%${building}%` };
  }
  if (roomNumber) {
    where.roomNumber = { [Op.like]: `%${roomNumber}%` };
  }

  const { count, rows } = await HouseModel.findAndCountAll({
    where,
    offset,
    limit: parseInt(pageSize),
    order: [['createAt', 'DESC']],
    include: [
      {
        model: CommunityModel,
        as: 'community',
        attributes: ['id', 'name', 'address'],
        where: { isDelete: 0 },
        required: false,
      },
    ],
  });

  return success(
    {
      list: rows,
      total: count,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
    },
    '获取房产列表成功'
  );
};

module.exports = {
  createHouse,
  deleteHouse,
  updateHouse,
  getHouseById,
  getHouseList,
};
