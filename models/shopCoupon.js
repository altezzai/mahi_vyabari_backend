const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Shop = require("./Shop");

const ShopCoupen = sequelize.define(
  "ShopCoupen",
  {
    shopId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references:{
        model:Shop,
        key:"id"
      },
      onDelete: 'CASCADE',
    },
    requestedCount: {
      type: DataTypes.INTEGER,
    },
    assignedCount: {
      type: DataTypes.INTEGER,
    },
    couponIdFrom: {
      type: DataTypes.INTEGER,
      unique:true
    },
    couponIdTo: {
      type: DataTypes.INTEGER,
      unique:true
    },
    status: {
      type: DataTypes.ENUM("pending", "assigned"),
    },
  },
  {
    tableName: "shopcoupons",
    timestamps: true,
  }
);

Shop.hasMany(ShopCoupen,{foreignKey:"shopId",as:"coupen"});
ShopCoupen.belongsTo(Shop,{foreignKey:"shopId"});

module.exports = ShopCoupen;
