require("../config/database");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const Shop = require("../models/Shop");
const Category = require("../models/Category");
const ShopCategory = require("../models/ShopCategory");
const { deletefilewithfoldername } = require("../utils/util");
const { Op, Sequelize, literal } = require("sequelize");
const Type = require("../models/Type");
const Complaint = require("../models/Complaint");
const Feedback = require("../models/Feedback");
const User = require("../models/User");

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
    try {
      const shopData = {
        ...req.body,
        image: req.files?.image?.[0]?.filename || null,
        icon: req.files?.icon?.[0]?.filename || null,
      };
      const savedShop = await Shop.create(shopData);
      if (savedShop.categories && savedShop.categories.length > 0) {
        await ShopCategory.bulkCreate(
          JSON.parse(savedShop.categories).map((category) => ({
            shopId: savedShop.id,
            categoryId: category,
          }))
        );
      }
      res.status(201).json({
        success: true,
        savedShop: savedShop,
      });
    } catch (error) {
      console.log(error);
      // await deletefilewithfoldername(uploadPath, req.files.image[0].filename);
      // await deletefilewithfoldername(uploadPath, req.files.icon[0].filename);
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
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
      const shops = await Shop.findAndCountAll({
        limit,
        offset,
        attributes: ["id", "shopName", "priority", "trash"],
        where: whereCondition,
        include: [
          {
            model: Category,
            attributes: ["id", "categoryName"],
            through: { attributes: [] },
          },
        ],
      });
      res.status(200).json({ success: true, data: shops });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
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
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
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
      await deletefilewithfoldername(uploadPath, req.files?.image?.[0]?.filename);
      await deletefilewithfoldername(uploadPath, req.files?.icon?.[0]?.filename);
      console.error(error);
      return res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
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
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
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
        },
      });
      res.status(200).json({ success: true, shopCategories });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
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
      const shops = await Shop.findAll({
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
      res.status(200).json({ success: true, data: shops });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
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
        trash: false,
      };
    }
    try {
      const shops = await Shop.findAll({
        limit,
        offset,
        where: whereCondition,
        attributes: ["id", "shopName"],
        include: [
          {
            model: Complaint,
            as: "complaints",
            attributes: ["description", "title"],
            include: [
              {
                model: User,
                as: "user",
                attributes: ["userName", "email"],
              },
            ],
          },
        ],
        subQuery: false,
      });
      res.status(200).json({ success: true, data: shops });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  },
};
