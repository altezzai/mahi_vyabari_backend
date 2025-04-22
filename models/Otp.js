const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");

const OTP = sequelize.define(
  "otps",
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
  verificationOTP: {
      type: DataTypes.STRING,
    },
    verificationOTPexpires: {
      type: DataTypes.DATE,
      defaultValue: () => new Date(Date.now() + 10 * 60 * 1000),
    },
    resetOTP:{
      type:DataTypes.STRING,
    },
    resetOTPExpires:{
      type: DataTypes.DATE,
      defaultValue: () => new Date(Date.now() + 10 * 60 * 1000),
    },
    loginOTP:{
      type:DataTypes.STRING,
    },
    loginOTPExpires:{
      type: DataTypes.DATE,
      defaultValue: () => new Date(Date.now() + 10 * 60 * 1000),
    }
  },
  {
    timestamps: true,
    tableName: "otps",
  }
);

module.exports = OTP;
