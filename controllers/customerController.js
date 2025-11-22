const { Op } = require("sequelize");
const generatePassword = require("generate-password");
const { User } = require("../models");
const { hashData } = require("../utils/hashData");
const { sendEmail } = require("../utils/nodemailer");

module.exports = {
  getCustomers: async (req, res) => {
    const search = req.query.search || "";
    const download = req.query.download || "";
    let { page = 1, limit = 10 } = req.query;
    if (download === "true") {
      page = null;
      limit = null;
    } else {
      page = parseInt(page) || 1;
      limit = parseInt(limit) || 10;
    }

    const offset = page && limit ? (page - 1) * limit : 0;

    let whereCondition = { role: "user" };
    if (search) {
      whereCondition = {
        ...whereCondition,
        [Op.or]: [
          { userName: { [Op.like]: `%${search}%` } },
          { phone: { [Op.like]: `%${search}%` } },
          { id: { [Op.like]: `%${search}%` } },
        ],
      };
    }
    try {
      const { count, rows: users } = await User.findAndCountAll({
        limit,
        offset,
        where: whereCondition,
        attributes: [
          "id",
          "userName",
          "phone",
          "couponCount",
          "trash",
          "status",
        ],
        order: [["createdAt", "DESC"]],
      });
      const totalPages = Math.ceil(count / limit);
      return res.status(200).json({
        success: true,
        count,
        totalPages: download === "true" ? null : totalPages,
        currentPage: download === "true" ? null : page,
        data: users,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },
  getCustomerById: async (req, res) => {
    try {
      const { id } = req.params;
      const users = await User.findByPk(id, {
        attributes: { exclude: ["password"] },
      });
      if (!users) {
        return res
          .status(404)
          .json({ success: false, message: "users not found" });
      }
      res.status(201).json({ success: true, users });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },
  addCustomer: async (req, res) => {
    const { userName, email } = req.body;
    try {
      const users = await User.findOne({
        where: { email },
      });
      if (users) {
        return res
          .status(400)
          .json({ success: false, message: "Email already exists" });
      }
      const password = await generatePassword.generate({
        length: 10,
        numbers: true,
      });
      const userData = {
        userName,
        email,
        password: await hashData(password),
      };
      const subject = "Welcome to Mahe Vyapari!";
      const message = `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0px 0px 10px #ccc;">
          <h2 style="color: #4CAF50;">Welcome, ${userName} 👋</h2>
          <p>Your account has been created by the Admin.</p>
          <p><strong>Login Email:</strong> ${email}</p>
          <p><strong>Password:</strong><span style="font-weight:900;"> ${password}</span></p>
          <p>Please login and change your password immediately for security reasons.</p>
          <br/>
          <p>Thanks,<br/>Team Mahe Vyapari</p>
        </div>
      </div>
    `;
      sendEmail(email, subject, message);
      const newusers = await User.create(userData);
      res.status(200).json({ success: true, newusers });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },
  deleteCustomer: async (req, res) => {
    try {
      const { id } = req.params;
      const users = await User.findByPk(id);
      if (!users) {
        return res
          .status(404)
          .json({ success: true, message: "users Not Found" });
      }
      await users.update({ trash: true });
      res.status(200).json({
        success: true,
        message: "users deleted successfully",
        data: users,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },
  restoreCustomer: async (req, res) => {
    try {
      const { id } = req.params;
      const users = await User.findByPk(id);
      if (!users) {
        return res
          .status(404)
          .json({ success: true, message: "users Not Found" });
      }
      await users.update({ trash: false });
      res.status(200).json({
        success: true,
        message: "users restored successfully",
        data: users,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
};
