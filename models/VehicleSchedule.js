const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
module.exports = (sequelize, DataTypes) => {
  const VehicleSchedule = sequelize.define(
    "VehicleSchedule",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.INTEGER,
      },
      category: {
        type: DataTypes.ENUM("train", "bus"),
      },
      vehicleName: {
        type: DataTypes.STRING,
      },
      vehicleNumber: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      via: {
        type: DataTypes.STRING,
        defaultValue: "mahe",
      },
      to: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      departureTime: {
        type: DataTypes.STRING,
      },
      arrivalTime: {
        type: DataTypes.STRING,
      },
      trash: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: "vehicleschedules",
      timestamps: true,
    }
  );

  return VehicleSchedule;
};
