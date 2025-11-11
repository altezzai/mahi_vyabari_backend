require("../config/database");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { Category, Type } = require("../models");
const { Op } = require("sequelize");
const { cleanupFiles,deleteFileWithFolderName,processImageFields } = require("../utils/fileHandler");

const UPLOAD_SUBFOLDER = "categoryImages";
const UPLOAD_PATH = process.env.UPLOAD_PATH;
const categoryProcessingConfig = {
  icon: { width: 150 },
};

module.exports = {
  addCategory: async (req, res) => {
    let processedFiles;
    try {
      const { typeId, categoryName, description, userId } = req.body;
      if (!typeId || !categoryName) {
        return res
          .status(400)
          .json({ error: "typeId and categoryName are required." });
      }
      processedFiles = await processImageFields(
        req.files,
        categoryProcessingConfig,
        UPLOAD_SUBFOLDER
      );
      const newCategory = await Category.creat({
        typeId,
        categoryName,
        description,
        userId,
        icon: processedFiles.icon?.filename || null,
        trash: false,
      });
      res.status(201).json({
        message: "Category created successfully!",
        category: newCategory,
      });
    } catch (error) {
      console.error(
        "Error during category creation, cleaning up uploaded files..."
      );
      await cleanupFiles(processedFiles, UPLOAD_SUBFOLDER);
      console.log(error);
      res.status(500).json({
        success: false,
        message: "An error occur while uploading Category data",
      });
    }
  },
  updateCategory: async (req, res) => {
    let processedFiles;
    try {
      const { id } = req.params;
      const category = await Category.findByPk(id);
      if (!category) {
        return res
          .status(404)
          .json({ error: `Category with ID ${id} not found.` });
      }
      processedFiles = await processImageFields(
        req.files,
        categoryProcessingConfig,
        UPLOAD_SUBFOLDER
      );
      const { ...bodyData } = req.body;

      if (processedFiles.icon && category.icon) {
        const oldFilename = path.basename(category.icon);
        const oldFilePath = path.join(UPLOAD_PATH, UPLOAD_SUBFOLDER);
        await deleteFileWithFolderName(oldFilePath, oldFilename);
      }
      for (const key in bodyData) {
        if (bodyData[key] !== null && bodyData[key] !== undefined) {
          category[key] = bodyData[key];
        }
      }
      if (processedFiles.icon) {
        category.icon = processedFiles.icon.filename;
      }
      const updatedCategory = await category.save();
      res.status(200).json({
        message: `Category ${updatedCategory.id} updated successfully!`,
        category: updatedCategory,
      });
    } catch (error) {
      await cleanupFiles(processedFiles, UPLOAD_SUBFOLDER);
      res
        .status(500)
        .json({ success: false, message: "Error updating category" });
    }
  },
  deleteCategory: async (req, res) => {
    try {
      const { id } = req.params;
      const category = await Category.findByPk(id);
      if (!category) {
        return res.status(404).json({ message: "Product not found" });
      }
      await category.update({ trash: true });
      res.status(200).json({
        success: true,
        category,
      });
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
  restoreCategory: async (req, res) => {
    try {
      const { id } = req.params;
      const category = await Category.findByPk(id);
      if (!category) {
        return res
          .status(404)
          .json({ success: false, message: "Category not found" });
      }
      await category.update({ trash: false });
      res.status(200).json({
        success: true,
        category,
      });
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
  getCategories: async (req, res) => {
    const search = req.query.search || "";
    const type = req.query.type || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    let whereCondition = {};
    if (search) {
      whereCondition = {
        [Op.or]: [
          { categoryName: { [Op.like]: `%${search}%` } },
          { "$type.typeName$": { [Op.like]: `%${search}%` } },
        ],
      };
    }
    try {
      const { count, rows: categories } = await Category.findAndCountAll({
        limit,
        offset,
        where: whereCondition,
        include: [
          {
            model: Type,
            attributes: ["id", "typeName"],
            as: "type",
          },
        ],
        order: [["createdAt", "DESC"]],
      });
      if (!categories) {
        return res
          .status(404)
          .json({ success: false, message: "No categories found" });
      }
      const totalPages = Math.ceil(count / limit);
      return res.status(200).json({
        success: true,
        count,
        totalPages,
        currentPage: page,
        data: categories,
      });
    } catch (error) {
      console.error("Error fetching categories:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },
  getCategoryById: async (req, res) => {
    try {
      const { id } = req.params;
      const category = await Category.findByPk(id);
      if (!category) {
        return res
          .status(404)
          .json({ success: false, message: "Category not found" });
      }
      return res.status(200).json({ success: true, category });
    } catch (error) {
      console.error("Error fetching category:", error);
      return res.status(500).json({ message: error.message });
    }
  },
  addType: async (req, res) => {
    try {
      const data = req.body;
      const newType = await Type.bulkCreate(data);
      res.status(201).json({ success: true, data: newType });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
  deleteType: async (req, res) => {
    try {
      const { id } = req.params;
      const type = await Type.findByPk(id);
      if (!type)
        return res
          .status(404)
          .json({ success: false, message: "Type not found" });
      await type.update({ trash: true });
      res.json({ success: true, data: type });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
  restoreType: async (req, res) => {
    try {
      const { id } = req.params;
      const type = await Type.findByPk(id);
      if (!type)
        return res
          .status(404)
          .json({ success: false, message: "Type not found" });
      await type.update({ trash: false });
      res.json({ success: true, data: type });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
  getTypes: async (req, res) => {
    try {
      const types = await Type.findAll();
      res.json({ success: true, types });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
  getTypeById: async (req, res) => {
    try {
      const { id } = req.params;
      const type = await Type.findByPk(id);
      if (!type)
        return res
          .status(404)
          .json({ success: false, message: "Type not found" });
      res.status(200).json({
        success: true,
        data: type,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
};
