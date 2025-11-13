"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("areas", [
      {
        name: "mahe",
        trash: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "chokli",
        trash: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "palloor",
        trash: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "pandakkal",
        trash: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("areas", null, {});
  },
};
