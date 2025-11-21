require("../config/database");
const fs = require("fs");
const path = require("path");
const sequelize = require("../config/database");
const { Op } = require("sequelize");

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

const { hashData } = require("../utils/hashData");
const { sendShopWelcomeEmail } = require("../utils/emailService");
const {
  deleteFileWithFolderName,
  compressAndSaveFile,
} = require("../utils/fileHandler");
const { Console } = require("console");

const iconPath = "public/uploads/shop/icon/";
const imgPath = "public/uploads/shop/";
module.exports = {
  addShop: async (req, res) => {
    const { shopName, phone, area_id, email } = req.body;
    const t = await sequelize.transaction();

    try {
      // 🔹 Validation
      if (!shopName || !phone || !email) {
        return res
          .status(400)
          .json({ error: "shopName, phone, and email are required." });
      }

      // 🔹 Check duplicate shop email
      const existingShop = await Shop.findOne({
        where: { email },
        transaction: t,
      });
      if (existingShop) {
        return res
          .status(400)
          .json({ success: false, message: "Shop Email already exists" });
      }

      // 🔹 Ensure upload folders exist
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

      // 🔹 Exclude categories field
      const { categories, ...shopBody } = req.body;

      const shopData = {
        ...shopBody,
        image: image || null,
        icon: icon || null,
      };

      // 🔹 Create shop record
      const newShop = await Shop.create(shopData, { transaction: t });
      // 🔹 Now handle categories separately
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

      // 🔹 Create corresponding user login
      await User.create(
        {
          userName: shopName,
          email,
          phone,
          area_id,
          password: await hashData(phone),
          role: "shop",
          image: icon || null,
        },
        { transaction: t }
      );

      // 🔹 Commit transaction
      await t.commit();

      // 🔹 Send async welcome email
      sendShopWelcomeEmail(
        newShop.shopName,
        newShop.email,
        newShop.phone
      ).catch((err) => {
        console.error("--- ASYNC EMAIL FAILED TO SEND ---", err);
      });

      // 🔹 Fetch shop with relations
      const finalShop = await Shop.findByPk(newShop.id, {
        include: [{ model: Category }, { model: Area }],
      });

      res.status(201).json({
        success: true,
        shop: finalShop,
      });
    } catch (error) {
      await t.rollback();

      // 🔹 Delete uploaded files if transaction fails
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
      const { count, rows: shops } = await Shop.findAndCountAll({
        limit,
        offset,
        where: whereCondition,
        attributes: [
          "id",
          "shopName",
          "priority",
          "icon",
          "trash",
          "createdAt",
        ],
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
      const { categories, ...updateBody } = req.body;

      const updatedShop = await shop.update(
        {
          ...updateBody,
          icon,
          image,
        },
        { transaction: t }
      );

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
    const area_id = req.query.area_id || null;
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
