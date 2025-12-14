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
        type: Sequelize.ENUM("train", "bus"),
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
      },
      to: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      departureTime: {
        type: Sequelize.STRING,
      },
      arrivalTime: {
        type: Sequelize.STRING,
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
        defaultValue: Sequelize.literal(
          "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        ),
      },
    });

    await queryInterface.addIndex("vehicleschedules", ["userId"]);
    await queryInterface.addIndex("vehicleschedules", ["category"]);
    await queryInterface.addIndex("vehicleschedules", ["vehicleName"]);
    await queryInterface.addIndex("vehicleschedules", ["vehicleNumber"]);
    await queryInterface.addIndex("vehicleschedules", ["to"]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex("vehicleschedules", ["userId"]);
    await queryInterface.removeIndex("vehicleschedules", ["category"]);
    await queryInterface.removeIndex("vehicleschedules", ["vehicleName"]);
    await queryInterface.removeIndex("vehicleschedules", ["vehicleNumber"]);
    await queryInterface.removeIndex("vehicleschedules", ["to"]);
    await queryInterface.dropTable("vehicleschedules");
  },
};
