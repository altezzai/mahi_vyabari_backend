"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("tourism", "workingDays", {
      type: Sequelize.STRING,
      allowNull: true,
      after: "location",
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("tourism", "workingDays");
  },
};
