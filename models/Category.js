const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Type = require("./Type");
const Category = sequelize.define(
  "Category",
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    typeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Type,
        key: "id",
      },
      validate: {
        notEmpty: true,
      },
    },
    categoryIcon: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    trash: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "categories",
    timestamps: true,
  }
);

module.exports = Category;
