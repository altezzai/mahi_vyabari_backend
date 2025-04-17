"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("shops", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      userId: {
        type: Sequelize.INTEGER,
      },
      image: {
        type: Sequelize.STRING,
      },
      icon: {
        type: Sequelize.STRING,
      },
      shopName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      categories: {
        type: Sequelize.STRING,
      },
      email: {
        type: Sequelize.STRING,
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      whatsapp: {
        type: Sequelize.STRING,
      },
      website: {
        type: Sequelize.STRING,
      },
      location: {
        type: Sequelize.STRING,
      },
      description: {
        type: Sequelize.STRING(500),
      },
      address: {
        type: Sequelize.STRING,
      },
      openingTime: {
        type: Sequelize.STRING,
      },
      closingTime: {
        type: Sequelize.STRING,
      },
      workingDays: {
        type: Sequelize.STRING,
      },
      priority: {
        type: Sequelize.ENUM("A","B","C"),
      },
      area: {
        type: Sequelize.ENUM("mahe", "chokli", "palloor", "pandakkal"),
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
    await queryInterface.dropTable("shops");
  },
};
