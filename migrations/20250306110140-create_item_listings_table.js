"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("classifieds", {
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
        type: Sequelize.STRING,
      },
      itemName: {
        type: Sequelize.STRING,
        allowNull:false
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
      },
      homeTown: {
        type: Sequelize.STRING,
      },
      area: {
         type: Sequelize.ENUM("mahe", "chokli", "palloor", "pandakkal"),
      },
      address: {
        type: Sequelize.TEXT,
      },
      description: {
        type: Sequelize.TEXT,
      },
      priority: {
        type: Sequelize.ENUM("A","B","C"),
      },
      phone: {
        type: Sequelize.STRING,
      },
      whatsapp: {
        type: Sequelize.STRING,
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
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"),
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("classifieds");
  },
};
