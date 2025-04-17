require("../config/database");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const Category = require("../models/Category");
const Type = require("../models/Type");
const { deletefilewithfoldername } = require("../utils/util");

const uploadPath = path.join(__dirname, "../public/uploads/categoryImages");
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
  addCategory: async (req, res) => {
    try {
      const categoryData = {
        ...req.body,
        icon: req.file ? req.file.filename : null,
      };

      const savedCategory = await Category.create(categoryData);
      if (!savedCategory) {
        await deletefilewithfoldername(uploadPath, req.file?.filename);
        res.status(404).json({
          success: false,
          message: "Can't upload Category Data",
        });
      }
      res.status(200).json({
        success: true,
        data: savedCategory,
      });
    } catch (error) {
      await deletefilewithfoldername(uploadPath, req.file?.filename);
      console.log(error);
      res.status(500).json({
        success: false,
        message: "An error occure while uploading Category data",
      });
    }
  },
  updateCategory: async (req, res) => {
    const { userId, typeId, name, description } = req.body;
    try {
      const { id } = req.params;
      const category = await Category.findByPk(id);
      if (!category) {
        res.status(400).json({ success: false, message: "Category not found" });
      }
      let newIcon = category.icon;
      if (req.file) {
        if (category.icon) {
          const oldImagePath = path.join(uploadPath, category.icon);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
        newIcon = req.file.filename;
      }
      await category.update({
        userId: userId || category.userId,
        typeId: typeId || category.typeId,
        category: name || category.name,
        description: description || category.description,
        icon: newIcon,
      });
      res.status(200).json({
        success: true,
        message: "Category updated successfully",
        category,
      });
    } catch (error) {
      console.error("Error updating category:", error);
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
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
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
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  },
  getCategories: async (req, res) => {
    const search = req.query.search || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) ;
    console.log(limit);
    console.log(req.query);
    const offset = (page - 1) * limit;
    const whereCondition = {};
    if (search) {
      whereCondition = {
        [Op.or]: [{ name: { [Op.like]: `%${search}%` } }],
      };
    }
    try {
      const categories = await Category.findAndCountAll({
        limit,
        offset,
        where: whereCondition,
        order: [["createdAt", "DESC"]],
      });
      if (!categories) {
        return res
          .status(404)
          .json({ success: false, message: "No categories found" });
      }
      res.status(200).json({ success: true, categories });
    } catch (error) {
      console.error("Error fetching categories:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
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
      res.status(200).json({ success: true, category });
    } catch (error) {
      console.error("Error fetching category:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },
  addType: async (req, res) => {
    try {
      const data = req.body;
      const newType = await Type.bulkCreate(data);
      res.status(201).json({ success: true, data: newType });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
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
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
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
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  },
  getTypes: async (req, res) => {
    try {
      const types = await Type.findAll();
      res.json({ success: true, types });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
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
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  },
};
