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
        type: Sequelize.STRING,
      },
      closingTime: {
        type: Sequelize.STRING,
      },
      workingDays: {
        type: Sequelize.STRING,
      },
      priority: {
        type: Sequelize.CHAR(1),
      },
      area_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "areas",
          key: "id", // Assuming 'id' is the primary key in the schools table
        },
        onDelete: "CASCADE",
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

    await queryInterface.addIndex("HealthcareProviders", ["userId"]);
    await queryInterface.addIndex("HealthcareProviders", ["category"]);
    await queryInterface.addIndex("HealthcareProviders", ["name"]);
    await queryInterface.addIndex("HealthcareProviders", ["phone"]);
    await queryInterface.addIndex("HealthcareProviders", ["subCategory"]);
    await queryInterface.addIndex("HealthcareProviders", ["area_id"]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex("HealthcareProviders", ["userId"]);
    await queryInterface.removeIndex("HealthcareProviders", ["category"]);
    await queryInterface.removeIndex("HealthcareProviders", ["name"]);
    await queryInterface.removeIndex("HealthcareProviders", ["phone"]);
    await queryInterface.removeIndex("HealthcareProviders", ["subCategory"]);
    await queryInterface.removeIndex("HealthcareProviders", ["area_id"]);
    await queryInterface.dropTable("HealthcareProviders");
  },
};
