const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * 生成 JWT token
 * @param {Object} payload 要存储的信息（不要放密码）
 */
const generateToken = (payload = {}) => { // 此方法仅作为生成token字符串的工具,不参与有效期设置和验证
  return jwt.sign(payload, config.JWT.secret, {
    expiresIn: '10y'
  });
};

/**
 * 校验 token 是否有效
 * @param {String} token
 * @return 有效返回解析后的数据，无效抛出错误
 */
const verifyToken = (token) => {
  return jwt.verify(token, config.JWT.secret);
};

module.exports = {
  generateToken,
  verifyToken
};