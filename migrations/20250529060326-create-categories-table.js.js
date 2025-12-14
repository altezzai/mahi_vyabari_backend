"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("categories", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      userId: {
        type: Sequelize.INTEGER,
      },
      typeId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "types", // Ensure this matches the actual table name of Type model
          key: "id",
        },
        onDelete: "CASCADE",
      },
      icon: {
        type: Sequelize.STRING,
      },
      categoryName: {
        type: Sequelize.STRING,
      },
      description: {
        type: Sequelize.TEXT,
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

    await queryInterface.addIndex("categories", ["userId"]);
    await queryInterface.addIndex("categories", ["typeId"]);
    await queryInterface.addIndex("categories", ["categoryName"]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex("categories", ["userId"]);
    await queryInterface.removeIndex("categories", ["typeId"]);
    await queryInterface.removeIndex("categories", ["categoryName"]);
    await queryInterface.dropTable("categories");
  },
};
