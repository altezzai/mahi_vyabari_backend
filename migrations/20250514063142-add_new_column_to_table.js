"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove foreign key constraint (if it exists)
    await queryInterface.removeConstraint("otps", "otps_ibfk_1").catch(() => {});

    // Rename userId to email
    await queryInterface.renameColumn("otps", "userId", "email");

    // Change the column type to STRING (for email)
    await queryInterface.changeColumn("otps", "email", {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    // Rename email back to userId
    await queryInterface.renameColumn("otps", "email", "userId");

    // Change back to INTEGER with foreign key
    await queryInterface.changeColumn("otps", "userId", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
    });

    // Re-adding the foreign key constraint (for rollback)
    await queryInterface.addConstraint("otps", {
      fields: ["userId"],
      type: "foreign key",
      name: "otps_ibfk_1",
      references: {
        table: "users",
        field: "id",
      },
      onDelete: "CASCADE",
    });
  },
};
