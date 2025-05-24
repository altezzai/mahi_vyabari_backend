require("../config/database");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const sequelize = require("../config/database");
const Shop = require("../models/Shop");
const Category = require("../models/Category");
const ShopCategory = require("../models/ShopCategory");
const { deletefilewithfoldername } = require("../utils/util");
const { Op, Sequelize, literal, where, col } = require("sequelize");
const Type = require("../models/Type");
const Complaint = require("../models/Complaint");
const Feedback = require("../models/Feedback");
const User = require("../models/User");
const { hashData } = require("../utils/hashData");
const { sendEmail } = require("../utils/nodemailer");

const uploadPath = path.join(__dirname, "../public/uploads/shopImages");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueSuffix);
  },
});

const upload = multer({ storage });
module.exports = {
  upload,
  addshop: async (req, res) => {
    const { shopName, phone, areas, email } = req.body;
    const t = await sequelize.transaction();
    try {
      const shopData = {
        ...req.body,
        image: req.files?.image?.[0]?.filename || null,
        icon: req.files?.icon?.[0]?.filename || null,
      };
      const existingShop = await Shop.findOne({ where: { email } });
      if (existingShop) {
        return res
          .status(400)
          .json({ success: false, message: "Shop Email already exists" });
      }
      const savedShop = await Shop.create(shopData, { transaction: t });
      if (savedShop.categories && savedShop.categories.length > 0) {
        const categoriesToCreate = await savedShop.categories.map(
          (category) => ({
            shopId: savedShop.id,
            categoryId: category,
          })
        );
        await ShopCategory.bulkCreate(categoriesToCreate, { transaction: t });
      }
      // const savedShop = await Shop.bulkCreate(req.body, { validate: true });
      // savedShop.forEach(async (data) => {
      //   console.log(data)
      //   if (data.categories && data.categories.length > 0) {
      //     await ShopCategory.bulkCreate(
      //       data.categories.map((category) => ({
      //         shopId: data.id,
      //         categoryId: category,
      //       }))
      //     );
      //   }
      // });
      await User.create(
        {
          userName: shopName,
          email,
          phone,
          areas,
          password: await hashData(phone),
          role: "shop",
          image: req.files?.image?.[0]?.filename || null,
        },
        { transaction: t }
      );
      const subject = "Welcome to Mahe Vyapari!";
      const message = `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0px 0px 10px #ccc;">
          <h2 style="color: #4CAF50;">Welcome, ${shopName} 👋</h2>
          <p>Your account has been created by the Admin.</p>
          <p><strong>Login Email:</strong> ${email}</p>
          <p><strong>Password:</strong><span style="font-weight:900;"> ${phone}</span></p>
          <p>Please login and change your password immediately for security reasons.</p>
          <br/>
          <p>Thanks,<br/>Team Mahe Vyapari</p>
        </div>
      </div>
    `;
      sendEmail(email, subject, message);
      await t.commit();
      res.status(201).json({
        success: true,
        savedShop: savedShop,
      });
    } catch (error) {
      await t.rollback();
      console.log(error);
      await deletefilewithfoldername(
        uploadPath,
        req.files?.image?.[0]?.filename
      );
      await deletefilewithfoldername(
        uploadPath,
        req.files?.icon?.[0]?.filename
      );
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
  getShops: async (req, res) => {
    const search = req.query.search || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit || 0;
    let whereCondition = {};
    if (search) {
      whereCondition = {
        [Op.or]: [{ shopName: { [Op.like]: `%${search}%` } }],
      };
    }
    try {
      const { count, rows: shops } = await Shop.findAndCountAll({
        limit,
        offset,
        where: whereCondition,
        attributes: ["id", "shopName", "priority", "trash", "createdAt"],
        include: [
          {
            model: Category,
            attributes: ["id", "categoryName"],
            through: { attributes: [] },
          },
        ],
        order: [["createdAt", "DESC"]],
      });
      const totalPages = Math.ceil(count / limit);
      return res
        .status(200)
        .json({ success: true, totalPages, currentPage: page, data: shops });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },
  getShopById: async (req, res) => {
    try {
      const { shopId } = req.params;
      const shop = await Shop.findByPk(shopId, {
        include: [
          {
            model: Category,
            attributes: ["id", "categoryName"],
            through: { attributes: [] },
          },
        ],
      });
      if (!shop) {
        return res
          .status(404)
          .json({ success: false, message: "Shop not found" });
      }
      res.status(200).json({ success: true, data: shop });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
  updateShop: async (req, res) => {
    const {
      shopName,
      categories,
      phone,
      whatsapp,
      location,
      description,
      address,
      openingTime,
      closingTime,
      workingDays,
      priority,
      website,
      areas,
    } = req.body;
    try {
      const { shopId } = req.params;
      const shop = await Shop.findByPk(shopId);
      if (!shop) {
        await deletefilewithfoldername(
          uploadPath,
          req.files?.image?.[0]?.filename
        );
        await deletefilewithfoldername(
          uploadPath,
          req.files?.icon?.[0]?.filename
        );
        return res
          .status(404)
          .json({ success: false, message: "Shop not found" });
      }
      let newImage = shop.image;
      let newIcon = shop.icon;
      if (req.files?.image?.[0]) {
        if (shop.image) {
          const oldImagePath = path.join(uploadPath, shop.image);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
        newImage = req.files.image[0].filename;
      }

      if (req.files?.icon?.[0]) {
        if (shop.icon) {
          const oldIconPath = path.join(uploadPath, shop.icon);
          if (fs.existsSync(oldIconPath)) {
            fs.unlinkSync(oldIconPath);
          }
        }
        newIcon = req.files.icon[0].filename;
      }

      const updateData = {
        shopName: shopName || shop.shopName,
        categories: categories || shop.categories,
        phone: phone || shop.phone,
        whatsapp: whatsapp || shop.whatsapp,
        website: website || shop.website,
        location: location || shop.location,
        description: description || shop.location,
        address: address || shop.address,
        openingTime: openingTime || shop.openingTime,
        closingTime: closingTime || shop.closingTime,
        workingDays: workingDays || shop.workingDays,
        priority: priority || shop.priority,
        areas: areas || shop.areas,
        image: newImage || shop.image,
        icon: newIcon || shop.icon,
      };
      await shop.update(updateData);
      return res.status(200).json({ success: true, shop });
    } catch (error) {
      await deletefilewithfoldername(
        uploadPath,
        req.files?.image?.[0]?.filename
      );
      await deletefilewithfoldername(
        uploadPath,
        req.files?.icon?.[0]?.filename
      );
      console.error(error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },
  deleteShop: async (req, res) => {
    try {
      const { shopId } = req.params;
      const shop = await Shop.findByPk(shopId);
      if (!shop) {
        return res
          .status(404)
          .json({ success: false, message: "Shop not found" });
      }
      await shop.update({ trash: true });
      res.status(200).json({
        success: true,
        shop,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
  restoreShop: async (req, res) => {
    try {
      const { shopId } = req.params;
      const shop = await Shop.findByPk(shopId);
      if (!shop) {
        return res
          .status(404)
          .json({ success: false, message: "Shop not found" });
      }
      await shop.update({ trash: false });
      res.status(200).json({ success: true, shop });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: "Internal Server Errro" });
    }
  },
  getShopCategories: async (req, res) => {
    try {
      const shopCategories = await Type.findOne({
        where: {
          typeName: "shop",
        },
        attributes: [],
        include: {
          model: Category,
          attributes: ["id", "categoryName"],
          as: "category",
        },
      });
      res.status(200).json({ success: true, shopCategories });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
  getShopFeedbacks: async (req, res) => {
    const search = req.query.search || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    let whereCondition = {};
    if (search) {
      whereCondition = {
        shopName: { [Op.like]: `%${search}%` },
        trash: false,
      };
    }
    try {
      const { count, rows: shops } = await Shop.findAndCountAll({
        limit,
        offset,
        where: whereCondition,
        attributes: [
          "id",
          "shopName",
          [
            Sequelize.fn("AVG", Sequelize.col("feedbacks.rating")),
            "averageRating",
          ],
          [
            Sequelize.fn("COUNT", Sequelize.col("feedbacks.id")),
            "totalRatingCount",
          ],
        ],
        include: [
          {
            model: Feedback,
            as: "feedbacks",
            attributes: [],
          },
        ],
        group: ["Shop.id"],
        order: [[Sequelize.literal("averageRating"), "DESC"]],
        subQuery: false,
      });
      const totalPages = Math.ceil(count / limit);
      return res
        .status(200)
        .json({ success: true, totalPages, currentPage: page, data: shops });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },
  getShopComplaints: async (req, res) => {
    const search = req.query.search || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    let whereCondition = {};
    if (search) {
      whereCondition = {
        shopName: { [Op.like]: `%${search}%` },
      };
    }
    try {
      const { count, rows: complaints } = await Complaint.findAndCountAll({
        limit,
        offset,
        where: whereCondition,
        attributes: {
          include: [
            [
              sequelize.literal(
                `(SELECT COUNT(*) FROM complaints As c WHERE c.shopId = Complaint.shopId)`
              ),
              "totalComplaints",
            ],
          ],
          exclude: ["userId", "shopId", "resolution", "createdAt", "updatedAt"],
        },
        include: [
          {
            model: User,
            attributes: ["id", "userName"],
            as: "user",
          },
          {
            model: Shop,
            attributes: ["id", "shopName"],
            as: "shop",
          },
        ],
        order: [["createdAt", "DESC"]],
      });
      const totalPages = Math.ceil(count / limit);
      return res.status(200).json({
        success: true,
        count,
        totalPages,
        currentPage: page,
        data: complaints,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },
  getShopComplaintById: async (req, res) => {
    try {
      const { complaintId } = req.params;
      const complaint = await Complaint.findByPk(complaintId, {
        include: [
          {
            model: User,
            attributes: ["id", "userName"],
            as: "user",
          },
          {
            model: Shop,
            attributes: ["id", "shopName"],
            as: "shop",
          },
        ],
      });
      if (!complaint) {
        return res
          .status(404)
          .json({ success: false, message: "Complaint not found" });
      }
      res.status(200).json({ success: true, data: complaint });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
  resolveComplaints: async (req, res) => {
    const { complaintId } = req.params;
    try {
      const { resolution } = req.body;
      const complaint = await Complaint.findByPk(complaintId);
      if (!complaint) {
        return res
          .status(404)
          .json({ success: false, message: "Complaint not found" });
      }
      await complaint.update({ status: "resolved", resolution });
      res.status(200).json({ success: true, complaint });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
  rejectComplaints: async (req, res) => {
    const { complaintId } = req.params;
    try {
      const complaint = await Complaint.findByPk(complaintId);
      if (!complaint) {
        return res
          .status(404)
          .json({ success: false, message: "Complaint not found" });
      }
      await complaint.update({ status: "rejected" });
      res.status(200).json({ success: true, complaint });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
  deleteComplaints: async (req, res) => {
    try {
      const complaint = await Complaint.findByPk(req.params.id);
      if (!complaint) {
        return res
          .status(404)
          .json({ success: false, message: "Complaint not found" });
      }
      await complaint.update({ trash: true });
      res.status(200).json({ success: true, complaint });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
};
