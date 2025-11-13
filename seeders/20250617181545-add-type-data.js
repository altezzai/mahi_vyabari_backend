'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('types', [
      { typeName: 'shop', createdAt: new Date(), updatedAt: new Date() },
      { typeName: 'classified', createdAt: new Date(), updatedAt: new Date() },
      { typeName: 'worker', createdAt: new Date(), updatedAt: new Date() },
      { typeName: 'taxi', createdAt: new Date(), updatedAt: new Date() },
      { typeName: 'medical', createdAt: new Date(), updatedAt: new Date() }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('types', null, {});
  }
};
