const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");

module.exports = (sequelize, DataTypes) => {
  const OTP = sequelize.define(
    "otps",
    {
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isEmail: true,
          notEmpty: true,
        },
      },
      otp: {
        type: DataTypes.STRING,
      },
      expiresAt: {
        type: DataTypes.DATE,
        defaultValue: () => new Date(Date.now() + 10 * 60 * 1000),
      },
      // resetOTP: {
      //   type: DataTypes.STRING,
      // },
      // resetOTPExpires: {
      //   type: DataTypes.DATE,
      //   defaultValue: () => new Date(Date.now() + 10 * 60 * 1000),
      // },
      // loginOTP: {
      //   type: DataTypes.STRING,
      // },
      // loginOTPExpires: {
      //   type: DataTypes.DATE,
      //   defaultValue: () => new Date(Date.now() + 10 * 60 * 1000),
      // },
    },
    {
      timestamps: true,
      tableName: "otps",
    }
  );
  return OTP;
};
// module.exports = OTP;
