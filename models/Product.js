const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Shop = require("./Shop");

module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define(
    "Product",
    {
      userId: {
        type: DataTypes.INTEGER,
      },
      shopId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      productName: {
        type: DataTypes.STRING,
        allowNull: false,
        trim: true,
      },
      image: {
        type: DataTypes.STRING,
      },
      originalPrice: {
        type: DataTypes.FLOAT,
        validate: {
          min: 0,
        },
      },
      offerPrice: {
        type: DataTypes.FLOAT,
        validate: {
          min: 0,
        },
      },
      offerPercentage: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
        validate: {
          min: 0,
          max: 100,
        },
      },
      description: {
        type: DataTypes.STRING,
        trim: true,
      },
      trash: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: "products",
      timestamps: true,
    }
  );
  return Product;
};
