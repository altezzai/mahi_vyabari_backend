const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Banner = sequelize.define(
  "Banner",
  {
    image_path: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    banner_type: {
      type: DataTypes.ENUM('type1', 'type2'),
      allowNull: false,
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

module.exports = Banner;