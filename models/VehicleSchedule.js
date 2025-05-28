const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const VehicleSchedule = sequelize.define(
  "VehicleSchedule",
  {
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

module.exports = VehicleSchedule;
