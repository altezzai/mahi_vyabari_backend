const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Shop = require("./Shop");
const Category = require("./Category");

module.exports = (sequelize, DataTypes) => {
  const ShopCategory = sequelize.define(
    "ShopCategory",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      shopId: {
        type: DataTypes.INTEGER,
        references: {
          model: Shop,
          key: "id",
        },
        allowNull: false,
        onDelete: "CASCADE",
      },
      categoryId: {
        type: DataTypes.INTEGER,
        references: {
          model: Category,
          key: "id",
        },
        allowNull: false,
        onDelete: "CASCADE",
      },
    },
    {
      tableName: "shopcategories",
      timestamps: false,
    }
  );
  return ShopCategory;
};

