const db = require("../../utils/modelBuild");
const { formatDate } = require("../../utils/index");

module.exports = {
  name: "CommunityModel",
  data: db.defineModel(
    "community",
    {
      id: { type: db.INTEGER, primaryKey: true, autoIncrement: true, comment: "ID" },
      name: { type: db.STRING(50), allowNull: false, comment: "小区名称" },
      address: { type: db.STRING(200), comment: "小区地址" },
      regionCode: { type: db.STRING(20), field: "region_code", comment: "区域编码" },
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
      underscored: false,
      timestamps: false,
      freezeTableName: true,
    }
  ),
};

