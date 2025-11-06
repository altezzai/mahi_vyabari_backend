const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const AreaInfo = sequelize.define(
  "Area",
  {
    area: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, 
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
    tableName: "areas", 
    timestamps: true,
  }
);

module.exports = AreaInfo;
