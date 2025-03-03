const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const VehicleService = sequelize.define(
  "VehicleService",
  {
    selectCategory: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    minFee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    vehicleNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    priority: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
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
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    area: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    icon: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    trash:{
      type:DataTypes.BOOLEAN,
      defaultValue:false
    }
  },
  {
    tableName: "vehicleservice",
    timestamps: true,
    underscored: true,
  }
);

module.exports = VehicleService;
