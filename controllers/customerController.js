const { Op } = require("sequelize");
const Customer = require("../models/User");

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
};
