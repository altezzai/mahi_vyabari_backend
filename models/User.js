const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = sequelize.define(
  "User",
  {
    googleId: {
      type: DataTypes.STRING,
      unique: true,
    },
    userName: {
      type: DataTypes.STRING,
    },
    email: {
      type: DataTypes.STRING,
      validate: {
        isEmail: true,
        notEmpty: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: function (value) {
          if (!this.googleId && !value) {
            throw new Error("password is required..!");
          }
        },
        len: [6, 100],
      },
    },
    phone: {
      type: DataTypes.STRING,
      validate: {
        is: /^\+?[\d\s-]+$/,
      },
    },
    image: {
      type: DataTypes.STRING,
    },
    area: {
      type: DataTypes.STRING,
    },
    coupenCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "active",
    },
    trash: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "users",
    timestamps: true,
  }
);

module.exports = User;
