"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("vehicleschedules", "from", {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("vehicleschedules", "from");
  },
};
