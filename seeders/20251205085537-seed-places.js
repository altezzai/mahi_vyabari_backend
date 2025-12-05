"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "places",
      [
        {
          name: "mahe",
          primary: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "kannur",
          primary: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "kozhikode",
          primary: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("places", null, {});
  },
};
