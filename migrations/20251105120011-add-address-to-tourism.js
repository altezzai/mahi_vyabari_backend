'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn(
      'tourism',
      'address', 
      {
        type: Sequelize.STRING, 
        allowNull: true,       
        after: "entryFee"         
      }
    );
  },
  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('tourism', 'address');
  }
};