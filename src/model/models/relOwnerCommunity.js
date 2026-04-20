const db = require("../../utils/modelBuild");
const { formatDate } = require("../../utils/index");

module.exports = {
  name: "RelOwnerCommunityModel",
  data: db.defineModel(
    "rel_owner_community",
    {
      id: { type: db.INTEGER, primaryKey: true, autoIncrement: true, comment: "ID" },
      ownerId: { type: db.INTEGER, field: "owner_id", allowNull: false, comment: "业主ID" },
      communityId: { type: db.INTEGER, field: "community_id", allowNull: false, comment: "小区ID" },
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
      indexes: [
        {
          unique: true,
          fields: ["owner_id", "community_id"],
          name: "uk_owner_community",
        },
      ],
    }
  ),
};

