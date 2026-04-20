const bcrypt = require('bcryptjs');
const { OwnerModel, RelOwnerHouseModel, RelOwnerCommunityModel } = require('../model/index');
const { seq: sequelize } = require('../utils/modelBuild');
const { Op } = require('sequelize');
const { logger } = require('../utils/logger');
const { success, fail } = require('../utils/responseBody');

/**
 * 创建业主
 */
const createOwner = async (params) => {
  const { account, password, userName, phone, email, age, gender } = params;

  // 检查账号是否已存在
  if (account) {
    const existingAccount = await OwnerModel.findOne({
      where: {
        account,
        isDelete: 0,
      },
    });

    if (existingAccount) {
      return fail(null, '账号已存在');
    }
  }

  // 检查手机号是否已存在
  if (phone) {
    const existingPhone = await OwnerModel.findOne({
      where: {
        phone,
        isDelete: 0,
      },
    });

    if (existingPhone) {
      return fail(null, '手机号已注册');
    }
  }

  // 密码加密
  let passwordHash = null;
  if (password) {
    const saltRounds = 10;
    passwordHash = await bcrypt.hash(password, saltRounds);
  }

  // 创建业主
  const owner = await OwnerModel.create({
    account: account || phone,
    passwordHash,
    userName,
    phone,
    email,
    age,
    gender,
  });

  logger.info(`创建业主成功: ${phone || account}`);

  return success(owner, '创建业主成功');
};

/**
 * 删除业主（软删除）
 */
const deleteOwner = async (id) => {
  const owner = await OwnerModel.findByPk(id);

  if (!owner) {
    return fail(null, '业主不存在');
  }

  // 开启事务
  const transaction = await sequelize.transaction();

  try {
    // 1. 软删除业主与房产的关联关系
    await RelOwnerHouseModel.update(
      { isDelete: 1 },
      { where: { ownerId: id, isDelete: 0 }, transaction }
    );

    // 2. 软删除业主与小区的关联关系
    await RelOwnerCommunityModel.update(
      { isDelete: 1 },
      { where: { ownerId: id, isDelete: 0 }, transaction }
    );

    // 3. 软删除业主本身
    await owner.update({ isDelete: 1 }, { transaction });

    // 提交事务
    await transaction.commit();
    logger.info(`删除业主成功: ID=${id}，已同步解除所有关联关系`);

    return success(null, '删除业主成功');
  } catch (error) {
    // 回滚事务
    await transaction.rollback();
    logger.error(`删除业主失败:`, error);
    throw error;
  }
};

/**
 * 更新业主
 */
const updateOwner = async (id, params) => {
  const { account, password, userName, phone, email, age, gender } = params;

  const owner = await OwnerModel.findByPk(id);

  if (!owner) {
    return fail(null, '业主不存在');
  }

  // 如果修改了账号，检查是否与其他业主重复
  if (account && account !== owner.account) {
    const existingAccount = await OwnerModel.findOne({
      where: {
        account,
        id: { [Op.ne]: id },
        isDelete: 0,
      },
    });

    if (existingAccount) {
      return fail(null, '账号已存在');
    }
  }

  // 如果修改了手机号，检查是否与其他业主重复
  if (phone && phone !== owner.phone) {
    const existingPhone = await OwnerModel.findOne({
      where: {
        phone,
        id: { [Op.ne]: id },
        isDelete: 0,
      },
    });

    if (existingPhone) {
      return fail(null, '手机号已被使用');
    }
  }

  // 准备更新数据
  const updateData = {
    userName: userName !== undefined ? userName : owner.userName,
    email: email !== undefined ? email : owner.email,
    age: age !== undefined ? age : owner.age,
    gender: gender !== undefined ? gender : owner.gender,
  };

  // 如果提供了新密码，则更新密码
  if (password) {
    const saltRounds = 10;
    updateData.passwordHash = await bcrypt.hash(password, saltRounds);
  }

  // 如果修改了账号或手机号
  if (account) {
    updateData.account = account;
  }
  if (phone) {
    updateData.phone = phone;
  }

  // 更新业主信息
  await owner.update(updateData);

  logger.info(`更新业主成功: ID=${id}`);

  return success(owner, '更新业主成功');
};

/**
 * 获取业主详情
 */
const getOwnerById = async (id) => {
  const owner = await OwnerModel.findOne({
    attributes: { exclude: ['passwordHash'] }, // 不返回密码哈希
    where: {
      id,
      isDelete: 0,
    },
  });

  if (!owner) {
    return fail(null, '业主不存在');
  }

  return success(owner, '获取业主详情成功');
};

/**
 * 获取业主列表（分页）
 */
const getOwnerList = async (params) => {
  const { page = 1, pageSize = 10, userName, phone, account } = params;

  const offset = (page - 1) * pageSize;
  const where = { isDelete: 0 };

  // 搜索条件
  if (userName) {
    where.userName = { [Op.like]: `%${userName}%` };
  }
  if (phone) {
    where.phone = { [Op.like]: `%${phone}%` };
  }
  if (account) {
    where.account = { [Op.like]: `%${account}%` };
  }

  const { count, rows } = await OwnerModel.findAndCountAll({
    attributes: { exclude: ['passwordHash'] }, // 不返回密码哈希
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
    '获取业主列表成功'
  );
};

module.exports = {
  createOwner,
  deleteOwner,
  updateOwner,
  getOwnerById,
  getOwnerList,
};
