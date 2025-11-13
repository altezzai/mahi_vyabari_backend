const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Shop = require("./Shop");

module.exports = (sequelize, DataTypes) => {
  const ShopCoupon = sequelize.define(
    "ShopCoupon",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      shopId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: "shops",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      requestedCount: {
        type: DataTypes.INTEGER,
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
      status: {
        type: DataTypes.ENUM("pending", "assigned"),
      },
    },
    {
      tableName: "shopcoupons",
      timestamps: true,
    }
  );
  return ShopCoupon;
};

