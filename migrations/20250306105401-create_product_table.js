"use strict";

const Shop = require("../models/Shop");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("products", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      userId: {
        type: Sequelize.INTEGER,
      },
      shopId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "shops",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      productName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      image: {
        type: Sequelize.STRING,
      },
      originalPrice: {
        type: Sequelize.FLOAT,
      },
      offerPrice: {
        type: Sequelize.FLOAT,
      },
      offerPercentage: {
        type: Sequelize.FLOAT,
        defaultValue:0,
        validate: {
          min: 0,
          max: 100,
        },
      },
      description: {
        type: Sequelize.STRING,
      },
      trash: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"),
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("products");
  },
};
