require("dotenv").config();
("use strict");
const bcrypt = require("bcrypt");

module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASS, 10);
    const phone = process.env.ADMIN_PHONE;
    await queryInterface.bulkInsert("users", [
      {
        googleId: null,
        userName: "Admin",
        email: null,
        password: hashedPassword,
        phone: phone,
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
      {
        googleId: null,
        userName: "User",
        email: "user@example.com",
        password: hashedPassword,
        phone: null,
        image: null,
        area_id: null,
        couponCount: 0,
        status: "active",
        role: "user",
        verified: true,
        trash: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        googleId: null,
        userName: "shop1",
        email: "shop1@example.com",
        password: hashedPassword,
        phone: null,
        image: null,
        area_id: null,
        couponCount: 0,
        status: "active",
        role: "shop",
        verified: true,
        trash: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        googleId: null,
        userName: "shop2",
        email: "shop2@example.com",
        password: hashedPassword,
        phone: null,
        image: null,
        area_id: null,
        couponCount: 0,
        status: "active",
        role: "shop",
        verified: true,
        trash: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        googleId: null,
        userName: "shop3",
        email: "shop3@example.com",
        password: hashedPassword,
        phone: null,
        image: null,
        area_id: null,
        couponCount: 0,
        status: "active",
        role: "shop",
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
