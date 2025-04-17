'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('shopcoupons', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      shopId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'shops',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      requestedCount: {
        type: Sequelize.INTEGER
      },
      assignedCount: {
        type: Sequelize.INTEGER,
      },
      couponIdFrom: {
        type: Sequelize.INTEGER,
        unique:true
      },
      couponIdTo: {
        type: Sequelize.INTEGER,
        unique:true
      },
      status: {
        type: Sequelize.ENUM('pending', 'assigned')
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('shopcoupon');
  }
};
