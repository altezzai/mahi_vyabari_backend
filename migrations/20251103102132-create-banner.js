"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("banners", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      image_path: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      banner_type: {
        type: Sequelize.ENUM("type1", "type2"),
        allowNull: false,
      },
      trash: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("banners");
  },
};
