"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("vehicleschedules", "from", {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "mahe",
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("vehicleschedules", "from");
  },
};
