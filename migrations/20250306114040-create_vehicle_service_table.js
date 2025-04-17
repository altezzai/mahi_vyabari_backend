"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("vehicleservice", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      ownerName:{
        type:Sequelize.STRING,
        allowNull:false,
      },
      category: {
        type: Sequelize.STRING,
      },
      minFee: {
        type: Sequelize.DECIMAL(10, 2),
      },
      vehicleNumber: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      priority: {
        type: Sequelize.ENUM("A","B","C"),
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      whatsapp: {
        type: Sequelize.STRING,
      },
      description: {
        type: Sequelize.TEXT,
      },
      area: {
        type: Sequelize.ENUM("mahe", "chokli", "palloor", "pandakkal"),
      },
      address: {
        type: Sequelize.TEXT,
      },
      image: {
        type: Sequelize.STRING,
      },
      icon: {
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
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("vehicleservice");
  },
};
