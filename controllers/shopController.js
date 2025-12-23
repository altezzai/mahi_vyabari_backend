require("../config/database");
const fs = require("fs");
const path = require("path");
const sequelize = require("../config/database");
const { Op } = require("sequelize");
const logger = require("../utils/logger");

const {
  User,
  Feedback,
  Complaint,
  Type,
  Shop,
  Category,
  Area,
  ShopCategory,
} = require("../models");

const Sequelize = require("sequelize");

const { hashData } = require("../utils/hashData");
const { sendSMS } = require("../utils/smsService");
const {
  deleteFileWithFolderName,
  compressAndSaveFile,
} = require("../utils/fileHandler");
const { Console } = require("console");
const { id } = require("date-fns/locale");

const iconPath = "public/uploads/shop/icon/";
const imgPath = "public/uploads/shop/";
module.exports = {
  addShop: async (req, res) => {
    let { shopName, phone, area_id, email } = req.body;
    const t = await sequelize.transaction();

    try {
      if (!shopName || !phone) {
        return res
          .status(400)
          .json({ error: "shopName and phone are required." });
      }
      if (!phone.startsWith("+91")) {
        phone = "+91" + phone;
      }
      const existingPhone = await User.findOne({
        where: { phone },
        transaction: t,
      });
      if (existingPhone) {
        return res.status(400).json({
          success: false,
          message: " Phone already exists in user table",
        });
      }
      // const existingShop = await User.findOne({
      //   where: { email },
      //   transaction: t,
      // });
      // if (existingShop) {
      //   return res
      //     .status(400)
      //     .json({ success: false, message: "Shop Email already exists" });
      // }
      const existingshopName = await Shop.findOne({
        where: { shopName },
        transaction: t,
      });
      if (existingshopName) {
        return res
          .status(400)
          .json({ success: false, message: "Shop Name already exists" });
      }
      const fs = require("fs");
      if (!fs.existsSync(iconPath)) fs.mkdirSync(iconPath, { recursive: true });
      if (!fs.existsSync(imgPath)) fs.mkdirSync(imgPath, { recursive: true });

      let image = null;
      let icon = null;

      if (req.files?.icon) {
        icon = await compressAndSaveFile(req.files.icon[0], iconPath);
      }
      if (req.files?.image) {
        image = await compressAndSaveFile(req.files.image[0], imgPath);
      }

      const { categories, ...shopBody } = req.body;
      const password = req.body.phone.slice(0, 6);

      const user = await User.create(
        {
          userName: shopName,
          email: email || null,
          phone,
          area_id,
          password: await hashData(password),
          role: "shop",
          image: icon || null,
        },
        { transaction: t }
      );
      const shopData = {
        ...shopBody,
        userId: user.id,
        phone,
        image: image || null,
        icon: icon || null,
      };

      const newShop = await Shop.create(
        {
          ...shopData,
          trash: false,
          email: email || null,
          shopName,
        },
        { transaction: t }
      );
      let categoryList = [];
      if (Array.isArray(req.body.categories)) {
        categoryList = req.body.categories.map((c) => parseInt(c));
      }
      if (categoryList.length > 0) {
        const shopCategoryData = categoryList.map((category_id) => ({
          shopId: newShop.id,
          categoryId: category_id,
        }));

        await ShopCategory.bulkCreate(shopCategoryData, { transaction: t });
      }

      const message = `
Welcome, ${shopName} 👋
Your shop account has been created by the Admin.
Login Phone: ${phone}
Password: ${password}
Thanks,
EnteMahe - Mahe Businesss Community
            `;

      try {
        await sendSMS(phone, message);
      } catch (smsError) {
        console.error("SMS sending failed:", smsError.message);
        logger.error("SMS sending failed:", smsError.message, smsError.error);
      }
      await t.commit();

      res.status(201).json({
        success: true,
        shop: newShop,
      });
    } catch (error) {
      await t.rollback();
      console.error("Error adding shop:", error);
      logger.error("Error adding shop:", error, error);
      if (req.files?.icon)
        await deleteFileWithFolderName(iconPath, req.files.icon[0].filename);
      if (req.files?.image)
        await deleteFileWithFolderName(imgPath, req.files.image[0].filename);

      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  getShops: async (req, res) => {
    const search = req.query.search || "";
    const area_id = req.query.area_id || null;
    const download = req.query.download || "";
    const category_id = req.query.category_id || null;
    let { page = 1, limit = 10 } = req.query;
    if (download === "true") {
      page = null;
      limit = null;
    } else {
      page = parseInt(page) || 1;
      limit = parseInt(limit) || 10;
    }

    const offset = page && limit ? (page - 1) * limit : 0;

    let whereCondition = {};
    if (search) {
      whereCondition = {
        [Op.or]: [{ shopName: { [Op.like]: `%${search}%` } }],
      };
    }
    if (area_id) {
      whereCondition.area_id = area_id;
    }
    try {
      const count = await Shop.count({
        where: whereCondition,
        distinct: true,
      });
      const shops = await Shop.findAll({
        limit,
        offset,
        distinct: true,
        where: whereCondition,
        attributes: [
          "id",
          "shopName",
          "priority",
          "image",
          "phone",
          "address",
          "description",
          "openingTime",
          "closingTime",
          "workingDays",
          "whatsapp",
          "icon",
          "trash",
          "createdAt",
        ],
        include: [
          {
            model: Category,
            attributes: ["id", "categoryName"],
            through: { attributes: [] },
            where: category_id ? { id: category_id } : null,
          },
          {
            model: Area,
            attributes: ["id", "name"],
          },
        ],
        order: [["createdAt", "DESC"]],
      });
      const totalPages = Math.ceil(count / limit);
      return res.status(200).json({
        success: true,
        count,
        totalPages: download === "true" ? null : totalPages,
        currentPage: download === "true" ? null : page,
        data: shops,
      });
    } catch (error) {
      console.error(error);
      logger.error("Error getting shops:", error);
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
          {
            model: Area,
            attributes: ["id", "name"],
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
      logger.error("Error getting shop:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
  updateShop: async (req, res) => {
    const t = await sequelize.transaction();
    try {
      const { shopId } = req.params;
      const shop = await Shop.findByPk(shopId, { transaction: t });
      if (!shop) {
        return res
          .status(404)
          .json({ success: false, message: "Shop not found" });
      }

      let icon = shop.icon;
      let image = shop.image;
      if (req.files?.icon) {
        const oldFilename = shop.icon;
        icon = await compressAndSaveFile(req.files.icon[0], iconPath);
        if (oldFilename) {
          await deleteFileWithFolderName(iconPath, oldFilename);
        }
      }
      if (req.files?.image) {
        const oldFilename = shop.image;
        image = await compressAndSaveFile(req.files.image[0], imgPath);
        await deleteFileWithFolderName(imgPath, oldFilename);
      }
      const { categories, email, shopName, ...updateBody } = req.body;
      let phone = req.body.phone;
      if (phone && !phone.startsWith("+91")) {
        phone = "+91" + phone;
      }
      // const existingEmail = await User.findOne({
      //   where: {
      //     email: email,
      //     id: {
      //       [Op.ne]: shop.userId,
      //     },
      //   },
      // });

      // if (existingEmail) {
      //   return res.status(400).json({
      //     success: false,
      //     message: "Email already exists",
      //   });
      // }

      const existingPhone = await User.findOne({
        where: {
          phone: phone,
          id: {
            [Op.ne]: shop.userId,
          },
        },
      });

      if (existingPhone) {
        return res.status(400).json({
          success: false,
          message: "Phone number already exists",
        });
      }
      const existingshopName = await Shop.findOne({
        where: {
          shopName,
          id: {
            [Op.ne]: shopId,
          },
        },
        transaction: t,
      });
      if (existingshopName) {
        return res
          .status(400)
          .json({ success: false, message: "Shop Name already exists" });
      }

      const updatedShop = await shop.update(
        {
          ...updateBody,
          email: email || shop.email,
          shopName: shopName || shop.userName,
          phone: phone || shop.phone,
          icon,
          image,
        },
        { transaction: t }
      );
      if (phone || email || shopName) {
        await User.update(
          {
            phone: phone || shop.phone,
            email: email || shop.email,
            userName: shopName || shop.userName,
          },
          { where: { id: shop.userId }, transaction: t }
        );
      }

      let categoryList = [];

      if (Array.isArray(categories)) {
        categoryList = categories.map((c) => Number(c));
      }

      if (categoryList.length > 0) {
        const existingCategories = await ShopCategory.findAll({
          where: {
            shopId: shopId,
          },
          transaction: t,
        });

        const existingIds = existingCategories.map((c) => c.categoryId);
        const newIds = categoryList;

        const toAdd = newIds.filter((id) => !existingIds.includes(id));
        const toRemove = existingIds.filter((id) => !newIds.includes(id));

        if (toAdd.length > 0) {
          const insertData = toAdd.map((id) => ({
            shopId: shopId,
            categoryId: id,
          }));
          await ShopCategory.bulkCreate(insertData, { transaction: t });
        }

        if (toRemove.length > 0) {
          await ShopCategory.destroy({
            where: { shopId: shopId, categoryId: toRemove },
            transaction: t,
          });
        }
      }
      await t.commit();
      res.status(200).json({
        success: true,
        shop: updatedShop,
      });
    } catch (error) {
      await t.rollback();
      console.error(error);
      logger.error("Error updating shop:", error);
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
      logger.error("Error deleting shop:", error);
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
      logger.error("Error restoring shop:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
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
          where: { trash: false },
          as: "category",
        },
      });
      res.status(200).json({ success: true, shopCategories });
    } catch (error) {
      console.log(error);
      logger.error("error in getShopCategories", error);
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
        distinct: true,
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
      const totalPages = Math.ceil(count.length / limit);
      return res.status(200).json({
        success: true,
        totalContent: count.length,
        totalPages,
        currentPage: page,
        data: shops,
      });
    } catch (error) {
      console.log(error);
      logger.error("error in getShopFeedbacks", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },
  getShopComplaints: async (req, res) => {
    const search = req.query.search || "";
    const area_id = req.query.area_id || null;
    const start_date = req.query.start_date || null;
    const end_date = req.query.end_date || null;
    const shopId = req.query.shopId || null;
    const userId = req.query.userId || null;
    const status = req.query.status || null;

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

    let whereCondition = {};
    if (search) {
      whereCondition = {
        shopName: { [Op.like]: `%${search}%` },
      };
    }
    if (start_date) {
      const startDate = new Date(start_date);
      startDate.setHours(0, 0, 0, 0);
      whereCondition.createdAt = {
        ...whereCondition.createdAt,
        [Op.gte]: new Date(startDate),
      };
    }
    if (end_date) {
      const endDate = new Date(end_date);
      endDate.setHours(23, 59, 59, 999);
      whereCondition.createdAt = {
        ...whereCondition.createdAt,
        [Op.lte]: new Date(endDate),
      };
    }
    if (status) {
      whereCondition.status = status;
    }
    if (shopId) {
      whereCondition.shopId = shopId;
    }
    if (userId) {
      whereCondition.userId = userId;
    }

    try {
      const { count, rows: complaints } = await Complaint.findAndCountAll({
        limit,
        offset,
        distinct: true,
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
          exclude: ["userId", "shopId", "updatedAt"],
        },
        include: [
          {
            model: User,
            attributes: ["id", "userName", "phone"],
            as: "user",
          },
          {
            model: Shop,
            attributes: ["id", "shopName"],
            as: "shop",
            where: area_id ? { area_id } : null,
            include: [
              {
                model: Area,
                attributes: ["id", "name"],
              },
            ],
          },
        ],
        order: [["createdAt", "DESC"]],
      });
      const totalPages = Math.ceil(count / limit);
      return res.status(200).json({
        success: true,
        count,
        totalPages: download === "true" ? null : totalPages,
        currentPage: download === "true" ? null : page,
        data: complaints,
      });
    } catch (error) {
      console.log(error);
      logger.error("error in getShopComplaints", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },
  getShopComplaintById: async (req, res) => {
    try {
      const { id } = req.params;
      const complaint = await Complaint.findByPk(id, {
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
            include: [
              {
                model: Area,
                attributes: ["id", "name"],
              },
            ],
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
      logger.error("error in getShopComplaintById", error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
  resolveComplaints: async (req, res) => {
    const { id } = req.params;
    try {
      const { resolution } = req.body;
      const complaint = await Complaint.findByPk(id);
      if (!complaint) {
        return res
          .status(404)
          .json({ success: false, message: "Complaint not found" });
      }
      await complaint.update({ status: "resolved", resolution });
      res.status(200).json({ success: true, complaint });
    } catch (error) {
      console.error(error);
      logger.error("error in resolveComplaints", error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
  rejectComplaints: async (req, res) => {
    const { id } = req.params;
    try {
      const complaint = await Complaint.findByPk(id);
      if (!complaint) {
        return res
          .status(404)
          .json({ success: false, message: "Complaint not found" });
      }
      await complaint.update({ status: "rejected" });
      res.status(200).json({ success: true, complaint });
    } catch (error) {
      console.error(error);
      logger.error("error in rejectComplaints", error);
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
      logger.error("error in deleteComplaints", error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
};
