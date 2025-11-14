"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("coupon_milestones", {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },

      required_coupons: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
      },

      gift_image: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      gift_description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },

      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal(
          "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        ),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("coupon_milestones");
  },
};
