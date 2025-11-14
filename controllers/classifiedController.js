require("../config/database");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const {
  Classified,
  Type,
  Category,
  Area,
  ClassifiedImage,
} = require("../models");
const { Op } = require("sequelize");
const {
  cleanupFiles,
  deleteFileWithFolderName,
  processImageFields,
  compressAndSaveFile,
} = require("../utils/fileHandler");

const UPLOAD_PATH = process.env.UPLOAD_PATH;
const UPLOAD_SUBFOLDER = "classified";
const classifiedProcessingConfig = {
  image: { width: 1024 },
  icon: { width: 150 },
};
const sequelize = require("../config/database");
module.exports = {
  addClassified: async (req, res) => {
    const t = await sequelize.transaction();
    try {
      const iconPath = "uploads/classified/icon/";
      const imgPath = "uploads/classified/";

      let icon = null;

      if (req.files?.icon) {
        icon = await compressAndSaveFile(req.files.icon[0], iconPath);
      }
      const classifiedData = {
        ...req.body,
        icon: icon || null,
      };

      const savedClassified = await Classified.create(classifiedData);
      if (req.files?.images) {
        const imageRecords = [];

        for (const img of req.files.images) {
          const compressedName = await compressAndSaveFile(img, imgPath);
          imageRecords.push({
            classifiedId: savedClassified.id,
            image: compressedName,
          });
        }
        await ClassifiedImage.bulkCreate(imageRecords);
      }

      res.status(201).json({
        success: true,
        savedShop: savedClassified,
      });
    } catch (error) {
      console.log(error);
      res.status(401).json({
        success: false,
        message: error.message,
      });
    }
  },
  updateClassified: async (req, res) => {
    try {
      const { id } = req.params;
      const classified = await Classified.findByPk(id);
      if (!classified) {
        return res
          .status(404)
          .json({ success: false, message: "Item not found" });
      }
      const iconPath = "uploads/classified/icon/";
      const imgPath = "uploads/classified/";
      let icon = classified.icon;
      if (req.files?.icon) {
        const oldFilename = classified.icon;
        icon = await compressAndSaveFile(req.files.icon[0], iconPath);
        if (oldFilename) {
          await deleteFileWithFolderName(iconPath, oldFilename);
        }
      }

      const { ...bodyData } = req.body;
      const updatedClassified = await classified.update({
        ...bodyData,
        icon: icon || null,
      });
      if (req.files?.images) {
        const imageRecords = [];

        for (const img of req.files.images) {
          const compressedName = await compressAndSaveFile(img, imgPath);
          imageRecords.push({
            classifiedId: id,
            image: compressedName,
          });
        }
        await ClassifiedImage.bulkCreate(imageRecords);
      }

      return res.status(200).json({ success: true, item: updatedClassified });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },
  deleteClassified: async (req, res) => {
    try {
      const { id } = req.params;
      const item = await Classified.findByPk(id);
      if (!item) {
        return res
          .status(404)
          .json({ success: false, message: "Item not found" });
      }
      await item.update({ trash: true });
      return res.status(200).json({ success: true, item });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ success: false, message: "Internal Sever Error" });
    }
  },
  restoreClassified: async (req, res) => {
    try {
      const { id } = req.params;
      const item = await Classified.findByPk(id);
      if (!item) {
        return res
          .status(404)
          .json({ success: false, message: "Item not found" });
      }
      await item.update({ trash: false });
      return res.status(200).json({ success: true, item });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },
  getClassifieds: async (req, res) => {
    const search = req.query.search || "";
    const area_id = req.query.area_id || null;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    let whereCondition = {};
    if (search) {
      whereCondition = {
        [Op.or]: [
          { itemName: { [Op.like]: `%${search}%` } },
          { "$itemCategory.categoryName$": { [Op.like]: `%${search}%` } },
        ],
      };
    }
    if (area_id) {
      whereCondition.area_id = area_id;
    }
    try {
      const { count, rows: classifieds } = await Classified.findAndCountAll({
        limit,
        offset,
        where: whereCondition,
        attributes: ["id", "itemName", "priority", "trash"],
        include: [
          {
            model: Category,
            attributes: ["id", "categoryName"],
            as: "itemCategory",
          },
        ],
        order: [["createdAt", "DESC"]],
      });
      if (!classifieds) {
        return res
          .status(404)
          .json({ success: false, message: "No classifieds found" });
      }
      const totalPages = Math.ceil(count / limit);
      return res.status(200).json({
        success: true,
        count,
        totalPages,
        currentPage: page,
        data: classifieds,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },
  getClassifiedById: async (req, res) => {
    try {
      const { id } = req.params;
      const classified = await Classified.findByPk(id, {
        include: [
          {
            model: Category,
            attributes: ["id", "categoryName"],
            as: "itemCategory",
          },
        ],
      });
      if (!classified) {
        return res
          .status(404)
          .json({ success: false, message: "Classified not found" });
      }
      return res.status(200).json({ success: true, data: classified });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },
  getClassifiedCategories: async (req, res) => {
    try {
      const classifiedCategories = await Type.findOne({
        where: { typeName: "classified" },
        attributes: [],
        include: {
          model: Category,
          attributes: ["id", "categoryName"],
          as: "category",
        },
      });
      res.status(200).json({ success: true, classifiedCategories });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
};
