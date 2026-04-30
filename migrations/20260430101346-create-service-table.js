"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("services", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      serviceName: {
        type: Sequelize.STRING,
      },
      categories: {
        type: Sequelize.STRING,
      },
      minWage: {
        type: Sequelize.DECIMAL(10, 2),
      },
      priority: {
        type: Sequelize.ENUM("A", "B", "C"),
      },
      area_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "areas",
          key: "id", 
        },
        onDelete: "CASCADE",
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: false,
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

    await queryInterface.addIndex("services", ["serviceName"]);
    await queryInterface.addIndex("services", ["area_id"]);
    await queryInterface.addIndex("services", ["phone"]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex("services", ["serviceName"]);
    await queryInterface.removeIndex("services", ["area_id"]);
    await queryInterface.removeIndex("services", ["phone"]);
    await queryInterface.dropTable("services");
  },
};
