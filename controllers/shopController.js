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
} = require("../models");

const { hashData } = require("../utils/hashData");
const { sendShopWelcomeEmail } = require("../utils/emailService");
const {
  processImageFields,
  cleanupFiles,
  deleteFileWithFolderName,
} = require("../utils/fileHandler");

const UPLOAD_SUBFOLDER = "shopImages";
const UPLOAD_PATH = process.env.UPLOAD_PATH;
const USER_PROFILE_SUBFOLDER = "userImages";

const shopProcessingConfig = {
  image: { width: 1024 },
  icon: { width: 150 },
};

module.exports = {
  addShop: async (req, res) => {
    const { shopName, phone, areas, email } = req.body;
    let processedShopFiles;
    let processedUserFiles;
    const t = await sequelize.transaction();
    if (!shopName || !phone || !email) {
      return res
        .status(400)
        .json({ error: "shopName, phone, and email are required." });
    }
    const existingShop = await Shop.findOne({
      where: { email },
      transaction: t,
    });
    if (existingShop) {
      return res
        .status(400)
        .json({ success: false, message: "Shop Email already exists" });
    }
    try {
      processedShopFiles = await processImageFields(
        req.files,
        shopProcessingConfig,
        UPLOAD_SUBFOLDER
      );
      console.log(processedShopFiles);
      const shopData = {
        ...req.body,
        image: processedShopFiles.image[0].filename || null,
        icon: processedShopFiles.icon[0].filename || null,
      };
      const newShop = await Shop.create(shopData, { transaction: t });
      if (newShop.categories && newShop.categories.length > 0) {
        await newShop.setCategories(newShop.categories, { transaction: t });
      }
      const userImageConfig = {
        image: { width: 500 },
      };
      processedUserFiles = await processImageFields(
        req.files,
        userImageConfig,
        USER_PROFILE_SUBFOLDER
      );
      console.log(processedUserFiles);
      await User.creat(
        {
          userName: shopName,
          email,
          phone,
          areas,
          password: await hashData(phone),
          role: "shop",
          image: processedUserFiles.image[0].filename || null,
        },
        { transaction: t }
      );
      sendShopWelcomeEmail(
        newShop.shopName,
        newShop.email,
        newShop.phone
      ).catch(() => {
        console.error("--- ASYNC EMAIL FAILED TO SEND ---", err);
      });

      const finalShop = await Shop.findByPk(newShop.id, {
        include: [
          { model: Category },
          { model: Area},
        ],
        transaction: t,
      });
      await t.commit();
      res.status(201).json({
        success: true,
        shop: finalShop,
      });
    } catch (error) {
      await t.rollback();
      console.log(error);
      await cleanupFiles(processedShopFiles, UPLOAD_SUBFOLDER);
      await cleanupFiles(processedUserFiles, USER_PROFILE_SUBFOLDER);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
  getShops: async (req, res) => {
    const search = req.query.search || "";
    const area = req.query.area || null;
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
    let processedFiles;
    const t = await sequelize.transaction();
    try {
      const { shopId } = req.params;
      const shop = await Shop.findByPk(shopId, { transaction: t });
      if (!shop) {
        return res
          .status(404)
          .json({ success: false, message: "Shop not found" });
      }
      const processedShopFiles = await processImageFields(
        req.files,
        shopProcessingConfig,
        UPLOAD_SUBFOLDER
      );
      processedFiles = processedShopFiles;

      const { categories, ...bodyData } = req.body;

      if (processedFiles.image && shop.image) {
        const oldFilename = path.basename(shop.image);
        const oldFilePath = path.join(UPLOAD_PATH, UPLOAD_SUBFOLDER);
        await deleteFileWithFolderName(oldFilePath, oldFilename);
      }
      if (processedFiles.icon && shop.icon) {
        const oldFilename = path.basename(shop.icon);
        const oldFilePath = path.join(UPLOAD_PATH, UPLOAD_SUBFOLDER);
        await deleteFileWithFolderName(oldFilePath, oldFilename);
      }

      for (const key in bodyData) {
        if (bodyData[key] !== null && bodyData[key] !== undefined) {
          shop[key] = bodyData[key];
        }
      }
      if (categories) {
        shop.categories = categories;
      }
      if (processedFiles.image) {
        shop.image = processedFiles.image[0].filename;
      }
      if (processedFiles.icon) {
        shop.icon = processedFiles.icon[0].filename;
      }
      const updatedShop = await shop.save({ transaction: t });

      if (categories) {
        updatedShop.setCategories(categories, { transaction: t });
      }

      console.log("Old files cleaned up.");
      const finalShop = await Shop.findByPk(updatedShop.id, {
        include: Category,
        transaction: t,
      });
      await t.commit();
      res.status(200).json({
        message: `Shop ${finalShop.id} updated successfully!`,
        shop: finalShop,
      });
    } catch (error) {
      await t.rollback();
      await cleanupFiles(processedFiles, UPLOAD_SUBFOLDER);
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
