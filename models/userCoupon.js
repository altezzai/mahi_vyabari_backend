const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Shop = require("./Shop");
const User = require("./User");

const UserCoupen = sequelize.define(
  "UserCoupen",
  {
    shopId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Shop,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    assignedCount: {
      type: DataTypes.INTEGER,
    },
    couponIdFrom: {
      type: DataTypes.INTEGER,
      unique: true,
    },
    couponIdTo: {
      type: DataTypes.INTEGER,
      unique: true,
    },
  },
  {
    tableName: "usercoupons",
    timestamps: true,
  }
);

User.hasMany(UserCoupen, { foreignKey: "userId", as: "coupon" });
UserCoupen.belongsTo(User, { foreignKey: "userId", as: "user" });

module.exports = UserCoupen;
