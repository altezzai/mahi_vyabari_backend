"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("vehicleschedules", "from", {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
    await queryInterface.addIndex("vehicleschedules", ["from"]);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex("vehicleschedules", ["from"]);
    await queryInterface.removeColumn("vehicleschedules", "from");
  },
};
