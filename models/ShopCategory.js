const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Shop = require("./Shop");
const Category = require("./Category");

const ShopCategory = sequelize.define(
  "ShopCategory",
  {
    id: {
      type: DataTypes.INTEGER,
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

Shop.belongsToMany(Category, { through: ShopCategory, foreignKey: "shopId" });
Category.belongsToMany(Shop, {
  through: ShopCategory,
  foreignKey: "categoryId",
});

module.exports = ShopCategory;
