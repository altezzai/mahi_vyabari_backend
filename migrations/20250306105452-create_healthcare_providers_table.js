"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("HealthcareProviders", {
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
      category: {
        type: Sequelize.ENUM("doctor", "hospital"),
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      subCategory: {
        type: Sequelize.INTEGER,
        references: {
          model: "categories",
          key: "id",
        },
        onDelete: "CASCADE",
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
        type: Sequelize.TEXT,
      },
      address: {
        type: Sequelize.TEXT,
      },
      openingTime: {
        type: Sequelize.TIME,
      },
      closingTime: {
        type: Sequelize.TIME,
      },
      workingDays: {
        type: Sequelize.STRING,
      },
      priority: {
        type: Sequelize.CHAR(1),
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
        defaultValue: Sequelize.literal(
          "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        ),
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("HealthcareProviders");
  },
};
