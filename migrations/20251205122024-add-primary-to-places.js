module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("places", "primary", {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("places", "primary");
  },
};
