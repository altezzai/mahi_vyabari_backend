'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('tourism', 'location', {
      type: Sequelize.STRING,
      allowNull: true, // set false if required
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('tourism', 'location');
  }
};
