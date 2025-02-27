const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Shop = require("./Shop");

const Product = sequelize.define(
  "Product",
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    shopId: {
      type: DataTypes.INTEGER,
      references: {
        model: "shops",
        key: "id",
      },
      allowNull: false,
    },
    productName: {
      type: DataTypes.STRING,
      allowNull: false,
      trim: true,
    },
    originalPrice: {
      type: DataTypes.FLOAT,
      allowNull: false,
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

module.exports = Product;
