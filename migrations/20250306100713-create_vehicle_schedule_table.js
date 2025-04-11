"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("vehicleschedules", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      userId: {
        type: Sequelize.INTEGER,
      },
      category: {
        type: Sequelize.ENUM("train","bus"),
      },
      vehicleName: {
        type: Sequelize.STRING,
      },
      vehicleNumber: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      via: {
        type: Sequelize.STRING,
        defaultValue: "mahe",
      },
      to: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      departureTime: {
        type: Sequelize.TIME,
      },
      arrivalTime: {
        type: Sequelize.TIME,
      },
      trash: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"),
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("vehicleschedules");
  },
};
