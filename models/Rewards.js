const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
module.exports = (sequelize, DataTypes) => {
  const Rewards = sequelize.define(
    "Rewards",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },

      user_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },

      milestone_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      coupon_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },

      coupon_Number: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      gift: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      user_address: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
    },
    {
      tableName: "rewards",
      timestamps: true,
    }
  );

  return Rewards;
};
