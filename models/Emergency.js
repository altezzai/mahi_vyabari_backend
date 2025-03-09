const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Emergency = sequelize.define(
  "Emergency",
  {
    itemName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    description: {
      type: DataTypes.TEXT,
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
    tableName: "emergencies",
    timestamps: true,
  }
);

module.exports = Emergency;
