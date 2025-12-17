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
        type: Sequelize.STRING,
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
        defaultValue: Sequelize.literal(
          "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        ),
      },
    });

    await queryInterface.addIndex("products", ["userId"]);
    await queryInterface.addIndex("products", ["shopId"]);
    await queryInterface.addIndex("products", ["productName"]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex("products", ["userId"]);
    await queryInterface.removeIndex("products", ["shopId"]);
    await queryInterface.removeIndex("products", ["productName"]);
    await queryInterface.dropTable("products");
  },
};
