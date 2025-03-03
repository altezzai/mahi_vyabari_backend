const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Emergency = sequelize.define(
  "Emergency",
  {
    itemName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "item_name",
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
    tableName: "emergencies",
    timestamps: true,
  }
);

module.exports = Emergency;
