const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

module.exports = (sequelize, DataTypes) => {
  const Banner = sequelize.define(
    "Banner",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      banner_image_large: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      banner_image_small: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      banner_type: {
        type: DataTypes.ENUM("type1", "type2"),
        allowNull: false,
      },
      url: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      trash: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: "banners",
      timestamps: true,
    }
  );
  return Banner;
};
