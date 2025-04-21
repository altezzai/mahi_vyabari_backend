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
    otp: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: () => new Date(Date.now() + 10 * 60 * 1000),
    },
  },
  {
    indexes: [
      {
        fields: ["expiresAt"],
      },
    ],
    timestamps: true,
    tableName: "otps",
  }
);

module.exports = OTP;
