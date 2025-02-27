const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const VehicleSchedule = sequelize.define(
  "VehicleSchedule",
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    vehicleName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    vehicleNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
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
      type: DataTypes.TIME,
      allowNull: false,
    },
    arrivalTime: {
      type: DataTypes.TIME,
      allowNull: false,
    },
  },
  {
    tableName: "vehicleschedules",
    timestamps: true,
  }
);

module.exports = VehicleSchedule;
