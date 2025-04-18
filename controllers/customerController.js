const { Op } = require("sequelize");
const generatePassowrd = require("generate-password");
const Customer = require("../models/User");
const { hashPassword } = require("../utils/hashData");
const { sendEmail } = require("../utils/nodemailer");
const { use } = require("passport");

module.exports = {
  getCustomers: async (req, res) => {
    const search = req.query.search || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    let whereCondition = {};
    if (search) {
      whereCondition = {
        userName: { [Op.like]: `%${search}%` },
      };
    }
    try {
      const customers = await Customer.findAndCountAll({
        limit,
        offset,
        where: whereCondition,
        attributes: ["id", "userName", "coupenCount", "trash", "status"],
        order: [["createdAt", "DESC"]],
      });
      return res.status(200).json({ success: true, customers });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  },
  getCustomerById: async (req, res) => {
    try {
      const { id } = req.params;
      const customer = await Customer.findByPk(id);
      if (!customer) {
        return res
          .status(404)
          .json({ success: false, message: "Customer not found" });
      }
      res.status(201).json({ success: true, customer });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  },
  addCustomer: async (req, res) => {
    const { userName, email } = req.body;
    try {
      const customer = await Customer.findOne({
        where: { email },
      });
      if (customer) {
        return res
          .status(400)
          .json({ success: false, message: "Email already exists" });
      }
      const password = await generatePassowrd.generate({
        length: 10,
        numbers: true,
      });
      const userData = {
        userName,
        email,
        password: await hashPassword(password),
      };
      sendEmail(email, userName, password);
      const newCustomer = await Customer.create(userData);
      res.status(200).json({ success: true, newCustomer });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  },
  deleteCustomer: async (req, res) => {
    try {
      const { id } = req.params;
      const customer = await Customer.findByPk(id);
      if (!customer) {
        return res
          .status(404)
          .json({ success: true, message: "Customer Not Found" });
      }
      await customer.update({ trash: true });
      res
        .status(200)
        .json({ success: true, message: "Customer deleted successfully" });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  },
  restoreCustomer: async (req, res) => {
    try {
      const { id } = req.params;
      const customer = await Customer.findByPk(id);
      if (!customer) {
        return res
          .status(404)
          .json({ success: true, message: "Customer Not Found" });
      }
      await customer.update({ trash: false });
      res
        .status(200)
        .json({ success: true, message: "Customer restored successfully" });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  },
};
