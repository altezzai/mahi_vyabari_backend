require("dotenv").config();
("use strict");
const bcrypt = require("bcrypt");

module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASS, 10);
    const email = process.env.ADMIN_EMAIL;
    await queryInterface.bulkInsert("users", [
      {
        googleId: null,
        userName: "Admin",
        email: email,
        password: hashedPassword,
        phone: null,
        image: null,
        area_id: null,
        couponCount: 0,
        status: "active",
        role: "admin",
        verified: true,
        trash: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("users", { email: "admin@example.com" });
  },
};
