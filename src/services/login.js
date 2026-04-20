const svgCaptcha = require('svg-captcha');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/jwt');
const { redisClient } = require('../redis/index');
const { OwnerModel, HouseModel, RelOwnerHouseModel, RelOwnerCommunityModel, CommunityModel } = require('../model/index');
const { seq: sequelize } = require('../utils/modelBuild');
const { Op } = require('sequelize');
const { logger } = require('../utils/logger');
const { success, fail } = require('../utils/responseBody');

/**
 * 获取图形验证码
 */
const createCaptchaImg = async () => {
  const captcha = svgCaptcha.create({
    inverse: false,
    fontSize: 48,
    noise: 2,
    width: 120,
    height: 40,
    size: 4,
    ignoreChars: '0o1il',
    color: true,
    background: '#e9dcea',
  });

  const token = generateToken(); // 使用 JWT 生成 Token 字符串
  await redisClient.set(token, captcha.text, { EX: 500 });

  const buffer = Buffer.from(captcha.data, 'utf8');
  const base64String = buffer.toString('base64');

  return success(
    {
      img: 'data:image/svg+xml;base64,' + base64String,
      token,
    },
    '获取验证码成功'
  );
};

/**
 * 用户注册（手机号+图形验证码）
 */
const register = async (params) => {
  const { phone, password, code, token } = params;

  // 1. 校验图形验证码
  const captcha = await redisClient.get(token);
  if (!captcha) {
    return fail(null, '图形验证码已过期，请重新获取');
  }

  if (code.toLowerCase() !== captcha.toLowerCase()) {
    return fail(null, '图形验证码错误');
  }

  // 2. 检查用户是否已存在
  const existingUser = await OwnerModel.findOne({
    attributes: ['id'],
    where: {
      [Op.or]: [{ account: phone }, { phone }],
      isDelete: 0,
    },
  });

  if (existingUser) {
    return fail(null, '该手机号已注册');
  }

  // 3. 密码加密
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  // 4. 创建新用户
  await OwnerModel.create({
    phone,
    account: phone,
    passwordHash,
  });

  // 5. 删除验证码（防止重复使用）
  await redisClient.del(token);

  logger.info(`用户注册成功: ${phone}`);

  return success(null, '注册成功');
};

/**
 * 用户登录（手机号+密码）
 */
const login = async (params) => {
  const { phone, password } = params;

  // 1. 查找用户
  const user = await OwnerModel.findOne({
    attributes: {
      exclude: ['passwordHash'], // 排除密码字段
    },
    where: {
      [Op.or]: [{ account: phone }, { phone }],
      isDelete: 0,
    },
  });

  if (!user) {
    return fail(null, '手机号或密码错误');
  }

  // 2. 验证密码
  const isValidPassword = await bcrypt.compare(password, user.passwordHash);
  if (!isValidPassword) {
    return fail(null, '手机号或密码错误');
  }

  // 3. 生成登录token（UUID格式）
  const loginToken = generateToken();

  // 4. 将用户信息存入Redis，有效期7天
  const userInfo = {
    id: user.id,
    account: user.account,
    userName: user.userName,
    phone: user.phone,
    email: user.email,
  };

  await redisClient.set(
    loginToken,
    JSON.stringify({ token: loginToken, userInfo }),
    { EX: 7 * 24 * 60 * 60 } // 7天
  );

  logger.info(`用户登录成功: ${phone}, Token: ${loginToken}`);

  return success(
    {
      token: loginToken,
      userInfo,
    },
    '登录成功'
  );
};

/**
 * 获取用户可绑定的房产列表（未认证的房产）
 */
const getAvailableHouses = async (ownerId) => {
  // 检查业主是否存在
  const owner = await OwnerModel.findOne({
    where: { id: ownerId, isDelete: 0 },
  });

  if (!owner) {
    return fail(null, '用户不存在');
  }

  // 查询该业主已绑定的房产ID列表
  const boundRelations = await RelOwnerHouseModel.findAll({
    attributes: ['houseId'],
    where: {
      ownerId,
      isDelete: 0,
    },
  });

  const boundHouseIds = boundRelations.map((rel) => rel.houseId);

  // 查询所有未被其他业主绑定的房产（或者可以被当前业主绑定的房产）
  // 这里简化逻辑：返回所有房产，前端根据已绑定状态显示
  const houses = await HouseModel.findAll({
    where: {
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
    order: [['createAt', 'DESC']],
  });

  // 标记已绑定的房产
  const houseList = houses.map((house) => {
    const plainHouse = house.get({ plain: true });
    return {
      ...plainHouse,
      isBound: boundHouseIds.includes(house.id),
    };
  });

  return success(houseList, '获取成功');
};

/**
 * 选择房产进行认证（绑定业主与房产）
 */
const bindHouseForAuth = async (params) => {
  const { ownerId, houseId } = params;

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
      return fail(null, '用户不存在');
    }

    // 检查房产是否存在
    const house = await HouseModel.findOne({
      where: { id: houseId, isDelete: 0 },
      include: [
        {
          model: CommunityModel,
          as: 'community',
          attributes: ['id', 'name', 'address'],
          where: { isDelete: 0 },
          required: false,
        },
      ],
      transaction,
    });

    if (!house) {
      await transaction.rollback();
      return fail(null, '房产不存在');
    }

    // 检查是否已经绑定
    const existingRelation = await RelOwnerHouseModel.findOne({
      where: {
        ownerId,
        houseId,
        isDelete: 0,
      },
      transaction,
    });

    if (existingRelation) {
      await transaction.rollback();
      return fail(null, '您已绑定此房产');
    }

    // 检查该房产是否已有主要产权人，如果没有则设置为主要产权人
    const primaryOwnerCount = await RelOwnerHouseModel.count({
      where: {
        houseId,
        isPrimary: 1,
        isDelete: 0,
      },
      transaction,
    });

    const isPrimary = primaryOwnerCount === 0 ? 1 : 0;

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
    logger.info(`房产认证成功: 业主ID=${ownerId}, 房产ID=${houseId}`);

    return success(
      {
        relation,
        house: house.get({ plain: true }),
      },
      '房产认证成功'
    );
  } catch (error) {
    // 回滚事务
    await transaction.rollback();
    logger.error(`房产认证失败:`, error);
    throw error;
  }
};

/**
 * 退出登录
 */
const logout = async (token) => {
  if (!token) {
    return fail(null, 'Token不能为空');
  }

  // 从Redis中删除token
  await redisClient.del(token);

  logger.info(`用户退出登录: Token=${token}`);

  return success(null, '退出成功');
};

module.exports = {
  createCaptchaImg,
  register,
  login,
  getAvailableHouses,
  bindHouseForAuth,
  logout,
};
