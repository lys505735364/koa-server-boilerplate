// const Sequelize = require('seq');
const { Sequelize, DataTypes, Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const { DB } = require('../config');

function generateId() {
  return uuidv4();
}

const seq = new Sequelize(
  // ========== 1. 基础连接参数（必填） ==========
  DB.db_name, // 数据库名称
  DB.user, // 数据库用户名
  DB.pwd, // 数据库密码
  {
    host: DB.host, // 数据库地址
    port: 3306, // 端口(MySQL默认3306)
    dialect: DB.dialect, // 数据库类型
    timezone: '+08:00', // 时区

    // ========== 2. 连接池配置（生产环境必备） ==========
    pool: {
      max: 20, // 最大连接数
      min: 5, // 最小空闲连接数
      acquire: 30000, // 获取连接超时时间(ms)
      idle: 10000, // 空闲超时释放连接(ms)
    },
    logging: console.log, // 是否打印SQL日志
    // ========== 4. 全局模型默认配置（推荐） ==========
    define: {
      timestamps: false, // 自动添加 createdAt/updatedAt 字段
      paranoid: false, // 软删除：添加deletedAt，不真实删除数据
      underscored: true, // 字段名自动转下划线(user_name)，关闭则驼峰
      freezeTableName: true, // 禁止表名自动复数化(user → users)
      createdAt: 'created_at', // 自定义创建时间字段名
      updatedAt: 'updated_at', // 自定义更新时间字段名
    },

    // ========== 5. 高级可选配置 ==========
    retry: { max: 3 }, // 失败自动重试3次
    benchmark: true, // 是否打印查询耗时
    query: { raw: false }, // 默认不返回原生对象(用模型实例)
  }
);

const TYPES = [
  'STRING', // 字符串： 相当于 VARCHAR(255) ，用法： DataTypes.STRING(123)
  'TEXT', // 长文本： 相当于 TEXT ，用法： DataTypes.TEXT
  'INTEGER', // 整数： 相当于 INTEGER ，用法： DataTypes.INTEGER
  'BIGINT', // 大整数： 相当于 BIGINT ，用法： DataTypes.BIGINT 或  DataTypes.BIGINT(11)
  'FLOAT', // 浮点数： 相当于 FLOAT ，用法： DataTypes.FLOAT 或 DataTypes.FLOAT(11) 或 DataTypes.FLOAT(11,10)
  'DOUBLE', // 双精度浮点数： 相当于 DOUBLE ，用法： DataTypes.DOUBLE 或 DataTypes.DOUBLE(11) 或 DataTypes.DOUBLE(11,10)
  'DECIMAL', // 精度数值： 相当于 DECIMAL ，用法： DataTypes.DECIMAL 或 DataTypes.DECIMAL(10,2)
  'DATE', // 日期时间： 相当于 DATETIME ，用法： DataTypes.DATE
  'DATEONLY', // 仅日期： 相当于 DATE ，用法： DataTypes.DATEONLY
  'BOOLEAN', // 布尔： 相当于 TINYINT(1) ，用法： DataTypes.BOOLEAN
  'UUID', // 全局唯一标识符： 相当于 CHAR(36) ，用法： DataTypes.UUID
  'ENUM', // 枚举类型： 相当于 ENUM('value1','value2') ，用法： DataTypes.ENUM('value1','value2')
  'JSON', // JSON 数据： 相当于 JSON ，用法： DataTypes.JSON
  'TINYINT', // 8位整型： 相当于 TINYINT ，用法： DataTypes.TINYINT
  'VIRTUAL', // 虚拟字段： 不会存储在数据库中，用法： DataTypes.VIRTUAL
];

function defineModel(tableName, attributes, configuration) {
  return seq.define(tableName, attributes, configuration);
}

const sync = () => {
  if (process.env.NODE_ENV !== 'production') {
    seq.sync({ force: true });
  } else {
    throw new Error("Cannot sync() when NODE_ENV is set to 'production'.");
  }
};
const typeObj = {};
for (let type of TYPES) {
  typeObj[type] = DataTypes[type];
}

module.exports = {
  defineModel,
  Sequelize,
  seq,
  Op,
  generateId,
  sync,
  ...typeObj,
};
