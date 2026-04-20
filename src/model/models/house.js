const db = require("../../utils/modelBuild");
const { formatDate } = require("../../utils/index");

module.exports = {
  name: "HouseModel",
  data: db.defineModel(
    "house",
    {
      id: { type: db.INTEGER, primaryKey: true, autoIncrement: true, comment: "ID" },
      communityId: { type: db.INTEGER, field: "community_id", allowNull: false, comment: "所属小区ID" },
      building: { type: db.STRING(10), allowNull: false, comment: "楼栋号" },
      unit: { type: db.STRING(10), comment: "单元号" },
      roomNumber: { type: db.STRING(20), field: "room_number", allowNull: false, comment: "房号" },
      area: { type: db.DECIMAL(10, 2), comment: "建筑面积(平方米)" },
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

