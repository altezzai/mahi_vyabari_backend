"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("vehicleschedules", "to", {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null,
    });

    await queryInterface.changeColumn("vehicleschedules", "from", {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null,
    });
  },

  async down(queryInterface, Sequelize) {
    // revert back to string type
    await queryInterface.changeColumn("vehicleschedules", "to", {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.changeColumn("vehicleschedules", "from", {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "mahe",
    });
  },
};
