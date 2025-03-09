const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const VehicleService = sequelize.define(
  "VehicleService",
  {
    selectCategory: {
      type: DataTypes.STRING,
    },
    minFee: {
      type: DataTypes.DECIMAL(10, 2),
    },
    vehicleNumber: {
      type: DataTypes.STRING,
      allowNull:false
    },
    priority: {
      type: DataTypes.INTEGER,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    whatsapp: {
      type: DataTypes.STRING,
    },
    description: {
      type: DataTypes.TEXT,
    },
    area: {
      type: DataTypes.STRING,
    },
    address: {
      type: DataTypes.TEXT,
    },
    image: {
      type: DataTypes.STRING,
    },
    icon: {
      type: DataTypes.STRING,
    },
    trash:{
      type:DataTypes.BOOLEAN,
      defaultValue:false
    }
  },
  {
    tableName: "vehicleservice",
    timestamps: true,
  }
);

module.exports = VehicleService;
