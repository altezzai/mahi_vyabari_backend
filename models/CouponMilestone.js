const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

module.exports = (sequelize, DataTypes) => {
  const CouponMilestone = sequelize.define(
    "CouponMilestone",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },

      required_coupons: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },

      gift_image: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      gift_description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "coupon_milestones",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );
  return CouponMilestone;
};
