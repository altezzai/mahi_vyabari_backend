require("../config/database");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const Category = require("../models/Category");
const Type = require("../models/Type");
const {deletefilewithfoldername} = require("../utils/util")

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
      if (!req.file) {
        return res.status(400).json({ message: "category icon is required" });
      }

      const categoryIcon = req.file ? req.file.filename : null;
      req.body.categoryIcon = categoryIcon;

      const savedCategory = await Category.create(req.body);
      if (!savedCategory) {
        await deletefilewithfoldername(uploadPath,req.file.filename);
        res.status(404).json({
          status: "FAILED",
          message: "Can't upload Category Data",
        });
      }
      res.status(200).json({
        status: "SUCCESS",
        data: savedCategory,
      });
    } catch (error) {
        await deletefilewithfoldername(uploadPath,req.file.filename);
      console.log(error);
      res.status(500).json({
        status: "FAILED",
        message: "An error occure while uploading Category data",
        error: error,
      });
    }
  },
  updateCategory: async (req, res) => {},
  deleteCategory: async (req, res) => {},
  restoreCategory: async (req, res) => {},
  getCategory: async (req, res) => {},
  getCategoryById: async (req, res) => {},
  addType: async (req, res) => {
    try {
      const data = req.body;
      const newType = await Type.bulkCreate(data);
      res.status(201).json({ message: "Type created successfully", data: newType });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
  },
  deleteType: async (req, res) => {
    try {
      const { id } = req.params;
      const type = await Type.findByPk(id);
      if (!type) return res.status(404).json({ message: "Type not found" });

      await type.update({ trash: true });
      res.json({ message: "Type deleted (soft delete)", data: type });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
  },
  restoreType: async (req, res) => {
    try {
      const { id } = req.params;
      const type = await Type.findByPk(id);
      if (!type) return res.status(404).json({ message: "Type not found" });

      await type.update({ trash: false });
      res.json({ message: "Type restored successfully", data: type });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
  },
  getTypes: async (req, res) => {
    try {
      const types = await Type.findAll();
      res.json(types);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
  },
  getTypeById: async (req, res) => {
    try {
      const { id } = req.params;
      const type = await Type.findByPk(id);
      if (!type) return res.status(404).json({ message: "Type not found" });

      res.status(200).json({
        message: "Type found successfully",
        data: type
      });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
  },
};
