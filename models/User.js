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
      allowNull:false,
      validate: {
        isEmail: true,
        notEmpty: true,
      },
      unique:true
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
    couponCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "active",
    },
    verified:{
       type:DataTypes.BOOLEAN,
       defaultValue:false
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
