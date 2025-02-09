const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Category = sequelize.define(
  "Category",
  {
    category: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    categoryIcon:{
        type:DataTypes.STRING,
        allowNull:false
    },
    subcategories: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
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
    timestamps: false,
  }
);

module.exports = Category;
