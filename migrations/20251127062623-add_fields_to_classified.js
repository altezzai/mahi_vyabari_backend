"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("classifieds", "fromDate", {
      type: Sequelize.DATEONLY,
      allowNull: true,
    });

    await queryInterface.addColumn("classifieds", "validityDate", {
      type: Sequelize.DATEONLY,
      allowNull: true,
    });

    await queryInterface.addColumn("classifieds", "priceStatus", {
      type: Sequelize.ENUM("fixed", "negotiable"),
      allowNull: false,
      defaultValue: "fixed",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("classifieds", "fromDate");
    await queryInterface.removeColumn("classifieds", "validityDate");
    await queryInterface.removeColumn("classifieds", "priceStatus");
  },
};
