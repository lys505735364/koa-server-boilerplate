const { CommunityModel } = require('../model/index');
const { Op } = require('sequelize');
const { logger } = require('../utils/logger');
const { success, fail } = require('../utils/responseBody');

/**
 * 创建小区
 */
const createCommunity = async (params) => {
  const { name, address, regionCode } = params;

  // 检查小区名称是否已存在
  const existingCommunity = await CommunityModel.findOne({
    where: {
      name,
      isDelete: 0,
    },
  });

  if (existingCommunity) {
    return fail(null, '小区名称已存在');
  }

  // 创建小区
  const community = await CommunityModel.create({
    name,
    address,
    regionCode,
  });

  logger.info(`创建小区成功: ${name}`);

  return success(community, '创建小区成功');
};

/**
 * 删除小区（软删除）
 */
const deleteCommunity = async (id) => {
  const community = await CommunityModel.findByPk(id);

  if (!community) {
    return fail(null, '小区不存在');
  }

  // 软删除
  await community.update({ isDelete: 1 });

  logger.info(`删除小区成功: ID=${id}`);

  return success(null, '删除小区成功');
};

/**
 * 更新小区
 */
const updateCommunity = async (id, params) => {
  const { name, address, regionCode } = params;

  const community = await CommunityModel.findByPk(id);

  if (!community) {
    return fail(null, '小区不存在');
  }

  // 如果修改了名称，检查是否与其他小区重名
  if (name && name !== community.name) {
    const existingCommunity = await CommunityModel.findOne({
      where: {
        name,
        id: { [Op.ne]: id },
        isDelete: 0,
      },
    });

    if (existingCommunity) {
      return fail(null, '小区名称已存在');
    }
  }

  // 更新小区信息
  await community.update({
    name: name || community.name,
    address: address !== undefined ? address : community.address,
    regionCode: regionCode !== undefined ? regionCode : community.regionCode,
  });

  logger.info(`更新小区成功: ID=${id}`);

  return success(community, '更新小区成功');
};

/**
 * 获取小区详情
 */
const getCommunityById = async (id) => {
  const community = await CommunityModel.findOne({
    where: {
      id,
      isDelete: 0,
    },
  });

  if (!community) {
    return fail(null, '小区不存在');
  }

  return success(community, '获取小区详情成功');
};

/**
 * 获取小区列表（分页）
 */
const getCommunityList = async (params) => {
  const { page = 1, pageSize = 10, name, regionCode } = params;

  const offset = (page - 1) * pageSize;
  const where = { isDelete: 0 };

  // 搜索条件
  if (name) {
    where.name = { [Op.like]: `%${name}%` };
  }
  if (regionCode) {
    where.regionCode = regionCode;
  }

  const { count, rows } = await CommunityModel.findAndCountAll({
    where,
    offset,
    limit: parseInt(pageSize),
    order: [['createAt', 'DESC']],
  });

  return success(
    {
      list: rows,
      total: count,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
    },
    '获取小区列表成功'
  );
};

module.exports = {
  createCommunity,
  deleteCommunity,
  updateCommunity,
  getCommunityById,
  getCommunityList,
};
