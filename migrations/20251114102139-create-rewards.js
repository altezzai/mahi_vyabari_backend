"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("rewards", {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },

      user_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
      },

      milestone_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
      },
      coupon_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
      },

      coupon_Number: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },

      gift: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      user_address: {
        type: Sequelize.TEXT,
        allowNull: true,
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

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("rewards");
  },
};
