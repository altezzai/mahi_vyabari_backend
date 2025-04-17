const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Tourism = sequelize.define(
  "Tourism",
  {
    placeName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    images: {
      type: DataTypes.STRING,
    },
    phone: {
      type: DataTypes.STRING,
    },
    area: {
      type: DataTypes.ENUM("mahe", "chokli", "palloor", "pandakkal"),
      validate: {
        isIn: [["mahe", "chokli", "palloor", "pandakkal"]],
      },
    },
    startTime: {
      type: DataTypes.STRING,
    },
    endTime: {
      type: DataTypes.STRING,
    },
    entryFee: {
      type: DataTypes.STRING,
    },
    trash:{
      type: DataTypes.BOOLEAN,
      defaultValue:false
    }
  },
  {
    tableName: "tourism",
    timestamps: true,
  }
);

module.exports = Tourism;
