module.exports = (sequelize, DataTypes) => {
  const UserCoupon = sequelize.define(
    "UserCoupon",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      shopId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: "shops",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      userId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      assignedCount: {
        type: DataTypes.INTEGER,
      },
      couponIdFrom: {
        type: DataTypes.INTEGER,
        unique: true,
      },
      couponIdTo: {
        type: DataTypes.INTEGER,
        unique: true,
      },
    },
    {
      tableName: "usercoupons",
      timestamps: true,
    }
  );
  return UserCoupon;
};
