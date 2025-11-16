module.exports = (sequelize, DataTypes) => {
  const OTP = sequelize.define(
    "otps",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
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
