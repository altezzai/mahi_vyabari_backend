require("../config/database");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { Classified, Type, Category } = require("../models");
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
module.exports = {
  addClassified: async (req, res) => {
    let processedFiles;
    try {
      const iconPath = "uploads/classified/icon/";
      const imgPath = "uploads/classified/";
      let image = null;
      let icon = null;

      if (req.files?.icon) {
        icon = await compressAndSaveFile(req.files.icon[0], iconPath);
      }
      if (req.files?.image) {
        image = await compressAndSaveFile(req.files.image[0], imgPath);
      }

      const classifiedData = {
        ...req.body,
        image: image || null,
        icon: icon || null,
      };
      const savedClassified = await Classified.create(classifiedData);
      res.status(201).json({
        success: true,
        savedShop: savedClassified,
      });
    } catch (error) {
      await cleanupFiles(processedFiles, UPLOAD_SUBFOLDER);
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
      let image = classified.image;
      if (req.files?.icon) {
        const oldFilename = classified.icon;
        icon = await compressAndSaveFile(req.files.icon[0], iconPath);
        if (oldFilename) {
          await deleteFileWithFolderName(iconPath, oldFilename);
        }
      }
      if (req.files?.image) {
        const oldFilename = classified.image;
        image = await compressAndSaveFile(req.files.image[0], imgPath);
        await deleteFileWithFolderName(imgPath, oldFilename);
      }

      const { ...bodyData } = req.body;
      const updatedClassified = await classified.update({
        ...bodyData,
        image: image || null,
        icon: icon || null,
      });
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
