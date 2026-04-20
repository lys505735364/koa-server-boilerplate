const db = require("../../utils/modelBuild");
const { formatDate } = require("../../utils/index");
module.exports = {
  name: "OwnerModel", //数据model名称
  data: db.defineModel(
    "owner", // 表名
    {
      id: { type: db.INTEGER, primaryKey: true, autoIncrement: true, comment: "ID" },
      account: { type: db.STRING(20), unique: true, comment: "账号" },
      passwordHash: { type: db.STRING(255), field: "password_hash", comment: "密码哈希值(bcrypt)" },
      userName: { type: db.STRING(10), field: "user_name", comment: "用户姓名" },
      phone: { type: db.STRING(20), unique: true, comment: "手机号" },
      email: { type: db.STRING(50), comment: "邮箱" },
      age: { type: db.INTEGER, comment: "年龄" },
      gender: { type: db.TINYINT(1), comment: "性别: 0: 未设置, 1: 男, 2: 女" },
      isDelete: { type: db.TINYINT(1), defaultValue: 0, comment: "是否已删除: 0 否, 1 是" },
      createAt: {
        type: db.DATE,
        field: "create_at",
        comment: "创建时间",
        get() {
          let val = this.getDataValue("createAt");
          return formatDate(val);
        },
      },
      updateAt: {
        type: db.DATE,
        field: "update_at",
        comment: "更新时间",
        get() {
          let val = this.getDataValue("updateAt");
          return formatDate(val);
        },
      },
    },
    {
      underscored: false, // 手动指定字段映射
      timestamps: false, // 关闭Sequelize自动生成的createdAt/updatedAt字段（表已自带）
      freezeTableName: true, // 冻结表名，不自动复数化（确保与数据库表名一致）
    }
  ),
};
