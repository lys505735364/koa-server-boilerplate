const { OwnerModel, CommunityModel, HouseModel, RelOwnerHouseModel, RelOwnerCommunityModel } = require("../index");

const defineModelRelationships = () => {
  //======================================================== 定义模型关系

  // ================ 1. 业主 ↔ 房产：多对多 ================
  OwnerModel.belongsToMany(HouseModel, {
    through: RelOwnerHouseModel,
    foreignKey: "ownerId", // 关联表指向业主的字段
    otherKey: "houseId", // 关联表指向房产的字段
    as: "houses", // 多对多复数
    constraints: false, // 关闭外键约束
  });

  HouseModel.belongsToMany(OwnerModel, {
    through: RelOwnerHouseModel,
    foreignKey: "houseId", // 关联表指向房产的字段
    otherKey: "ownerId", // 关联表指向业主的字段
    as: "owners", // 多对多复数
    constraints: false, // 关闭外键约束
  });

  // 1-1. 业主 ↔ 关联表：一对多
  OwnerModel.hasMany(RelOwnerHouseModel, {
    foreignKey: "ownerId",
    sourceKey: "id", // 显式指定业主模型的主键（增强可读性）
    as: "ownerHouseRels", // 复数
    constraints: false, // 关闭外键约束
  });

  // 1-2. 房产 ↔ 关联表：一对多
  HouseModel.hasMany(RelOwnerHouseModel, {
    foreignKey: "houseId",
    sourceKey: "id", // 显式指定房产模型的主键
    as: "houseOwnerRels", // ownerHouseRels→houseOwnerRels（避免别名冲突）
    constraints: false, // 关闭外键约束
  });

  // 1-3. 关联表 ↔ 业主：多对一
  RelOwnerHouseModel.belongsTo(OwnerModel, {
    foreignKey: "ownerId",
    targetKey: "id", // 显式指定匹配业主的主键
    as: "owner", // 单数
    constraints: false, // 关闭外键约束
  });

  // 1-4. 关联表 ↔ 房产：多对一
  RelOwnerHouseModel.belongsTo(HouseModel, {
    foreignKey: "houseId",
    targetKey: "id", // 显式指定匹配房产的主键
    as: "house", // 单数
    constraints: false, // 关闭外键约束
  });

  // ================ 2. 小区 ↔ 房产：一对多 ================
  CommunityModel.hasMany(HouseModel, { foreignKey: "communityId", sourceKey: "id", as: "houses", constraints: false });
  HouseModel.belongsTo(CommunityModel, { foreignKey: "communityId", targetKey: "id", as: "community", constraints: false });

  // ================ 3. 业主 ↔ 小区：多对多 ================
  OwnerModel.belongsToMany(CommunityModel, { through: RelOwnerCommunityModel, foreignKey: "ownerId", otherKey: "communityId", as: "communities", constraints: false });
  CommunityModel.belongsToMany(OwnerModel, { through: RelOwnerCommunityModel, foreignKey: "communityId", otherKey: "ownerId", as: "owners", constraints: false });
  // 3-1. 业主 ↔ 关联表：一对多
  OwnerModel.hasMany(RelOwnerCommunityModel, { foreignKey: "ownerId", sourceKey: "id", as: "ownerCommunityRels", constraints: false });
  // 3-2. 小区 ↔ 关联表：一对多
  CommunityModel.hasMany(RelOwnerCommunityModel, { foreignKey: "communityId", sourceKey: "id", as: "communityOwnerRels", constraints: false });
  // 3-3. 关联表 ↔ 业主：多对一
  RelOwnerCommunityModel.belongsTo(OwnerModel, { foreignKey: "ownerId", targetKey: "id", as: "owner", constraints: false });
  // 3-4. 关联表 ↔ 小区：多对一
  RelOwnerCommunityModel.belongsTo(CommunityModel, { foreignKey: "communityId", targetKey: "id", as: "community", constraints: false });

};

module.exports = { defineModelRelationships };
