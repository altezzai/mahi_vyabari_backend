"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("usercoupons", "recordedBy", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("usercoupons", "recordedBy");
  },
};
