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
  deleteFileWithFolderName,
  compressAndSaveFile,
} = require("../utils/fileHandler");

const iconPath = "public/uploads/classified/icon/";
const imgPath = "public/uploads/classified/";
const sequelize = require("../config/database");
module.exports = {
  addClassified: async (req, res) => {
    const t = await sequelize.transaction();
    try {
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
        attributes: ["id", "itemName", "priority", "icon", "price", "trash"],
        include: [
          {
            model: Category,
            attributes: ["id", "categoryName"],
            as: "itemCategory",
          },
          {
            model: Area,
            attributes: ["id", "name"],
          },
        ],
        order: [["id", "DESC"]],
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
        totalPages: download === "true" ? null : totalPages,
        currentPage: download === "true" ? null : page,
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
          {
            model: ClassifiedImage,
            attributes: ["id", "image"],
          },
          {
            model: Area,
            attributes: ["id", "name"],
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
  deleteClassifiedImage: async (req, res) => {
    try {
      const { id } = req.params; // ID of the ClassifiedImage

      // 1. Find the image record
      const image = await ClassifiedImage.findByPk(id);
      if (!image) {
        return res.status(404).json({ error: "Image not found." });
      }
      const fileName = image.image;
      const uploadPath = "uploads/classified/";
      if (fileName) {
        await deleteFileWithFolderName(uploadPath, fileName);
      }
      await image.destroy();

      res.status(200).json({ message: "Image deleted successfully!" });
    } catch (error) {
      console.error("Error deleting image:", error);
      res.status(500).json({ error: "Failed to delete image" });
    }
  },
};
