"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn("vehicleschedules", "departureTime", {
      type: Sequelize.STRING,
    });

    await queryInterface.changeColumn("vehicleschedules", "arrivalTime", {
      type: Sequelize.STRING,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn("HealthcareProviders", "openingTime", {
      type: Sequelize.TIME,
    });

    await queryInterface.changeColumn("HealthcareProviders", "closingTime", {
      type: Sequelize.TIME,
    });
  },
};
