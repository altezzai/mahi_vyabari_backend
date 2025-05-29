"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("otps", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        onDelete: "CASCADE",
      },
      otp: {
        type: Sequelize.STRING,
      },
      expiresAt: {
        type: Sequelize.DATE,
      },
      // resetOTP: {
      //   type: Sequelize.STRING,
      // },
      // resetOTPExpires: {
      //   type: Sequelize.DATE,
      // },
      // loginOTP: {
      //   type: Sequelize.STRING,
      // },
      // loginOTPExpires: {
      //   type: Sequelize.DATE,
      // },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("otps");
  },
};
