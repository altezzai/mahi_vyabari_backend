const { Op } = require("sequelize");
const generatePassword = require("generate-password");
const { User } = require("../models");
const { hashData } = require("../utils/hashData");
const { sendSMS } = require("../utils/smsService");
const logger = require("../utils/logger");

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
      logger.error("error in getCustomers", error);
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
      logger.error("error in getCustomerById", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },
  addCustomer: async (req, res) => {
    let { userName, email, phone, area_id } = req.body;
    try {
      if (!userName || !phone) {
        return res
          .status(400)
          .json({ success: false, message: "All fields are required" });
      }
      if (!phone.startsWith("+91")) {
        phone = "+91" + phone;
      }
      const existingUser = await User.findOne({
        where: {
          [Op.or]: [{ phone }],
        },
      });
      if (existingUser) {
        return res
          .status(400)
          .json({ success: false, message: "User already exists" });
      }

      const users = await User.findOne({
        where: { phone },
      });
      if (users) {
        return res
          .status(400)
          .json({ success: false, message: "phone already exists" });
      }

      const password = await generatePassword.generate({
        length: 10,
        numbers: true,
      });
      const userData = {
        userName,
        email,
        phone,
        role: "user",
        area_id,
        password: await hashData(password),
      };
      const message = `
Welcome, ${userName} 👋
Your account has been created by the Admin.

Login phone: ${phone}
Password: ${password}
Please log in and change your password immediately for security reasons.

Thanks,
EnteMahe - Mahe Businesss Community
            `;

      const newusers = await User.create(userData);
      try {
        await sendSMS(phone, message);
      } catch (smsError) {
        console.error("SMS sending failed:", smsError.message);
      }
      res.status(200).json({ success: true, newusers });
    } catch (error) {
      console.log(error);
      logger.error("error in addCustomer", error);

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
      logger.error("error in deleteCustomer", error);
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
      logger.error("error in restoreCustomer", error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
};
