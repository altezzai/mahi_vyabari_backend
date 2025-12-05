"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "Places",
      [
        { name: "mahe", createdAt: new Date(), updatedAt: new Date() },
        { name: "kannur", createdAt: new Date(), updatedAt: new Date() },
        { name: "kozhikode", createdAt: new Date(), updatedAt: new Date() },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Places", null, {});
  },
};
