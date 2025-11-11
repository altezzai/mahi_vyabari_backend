const { Op } = require("sequelize");
const generatePassword = require("generate-password");
const {Customer} = require("../models");
const { hashData } = require("../utils/hashData");
const { sendEmail } = require("../utils/nodemailer");

module.exports = {
  getCustomers: async (req, res) => {
    const search = req.query.search || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    let whereCondition = {role:"user"};
    if (search) {
      whereCondition = {
        ...whereCondition,
        [Op.or]: [
          { userName: { [Op.like]: `%${search}%` } },
          { phone: { [Op.like]: `%${search}%` } },
        ],
      };
    }
    try {
      const { count, rows: customers } = await Customer.findAndCountAll({
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
        totalPages,
        currentPage: page,
        data: customers,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },
  getCustomerById: async (req, res) => {
    try {
      const { id } = req.params;
      const customer = await Customer.findByPk(id, {
        attributes: { exclude: ["password"] },
      });
      if (!customer) {
        return res
          .status(404)
          .json({ success: false, message: "Customer not found" });
      }
      res.status(201).json({ success: true, customer });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, message: error.message });
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
      const newCustomer = await Customer.create(userData);
      res.status(200).json({ success: true, newCustomer });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, message: error.message });
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
      res.status(200).json({
        success: true,
        message: "Customer deleted successfully",
        data: customer,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, message: error.message });
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
      res.status(200).json({
        success: true,
        message: "Customer restored successfully",
        data: customer,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
};
