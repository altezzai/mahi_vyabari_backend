module.exports = (sequelize, DataTypes) => {
  const Otp = sequelize.define(
    "Otp",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
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
    },
    {
      timestamps: true,
      tableName: "otps",
    }
  );
  return Otp;
};
