'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.removeColumn('banners', 'image_path'),
      queryInterface.addColumn('banners', 'banner_image_large', {
        type: Sequelize.STRING,
        allowNull: true,
        after:"id"
      }),

      queryInterface.addColumn('banners', 'banner_image_small', {
        type: Sequelize.STRING,
        allowNull: true,
        after:"id"
      }),
    ]);
  },

  async down(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.removeColumn('banners', 'banner_image_large'),
      queryInterface.removeColumn('banners', 'banner_image_small'),
      queryInterface.addColumn('banners', 'image_path', {
        type: Sequelize.STRING,
        allowNull: true,
      }),
    ]);
  },
};
