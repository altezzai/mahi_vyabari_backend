const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const VehicleService = sequelize.define(
  "VehicleService",
  {
    ownerName:{
       type: DataTypes.STRING,
    },
    category: {
      type: DataTypes.ENUM("car","rickshaw"),
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
      type: DataTypes.ENUM("mahe","chokli","palloor","pandakkal"),
      validate:{
        isIn:[["mahe","chokli","palloor","pandakkal"]]
      }
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
