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
      // if (!req.file) {
      //   return res.status(400).json({ message: "category icon is required" });
      // }
      const categoryData = {
        ...req.body,
        icon: req.file ? req.file.filename : null,
      };

      const savedCategory = await Category.create(categoryData);
      if (!savedCategory) {
        // await deletefilewithfoldername(uploadPath, req.file.filename);
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
      // await deletefilewithfoldername(uploadPath, req.file.filename);
      console.log(error);
      res.status(500).json({
        status: "FAILED",
        message: "An error occure while uploading Category data",
        error: error,
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
      let newIcon = category.icon; // Keep old image by default
      if (req.file) {
        // Delete old image if exists
        if (category.icon) {
          const oldImagePath = path.join(uploadPath, category.icon);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }

        // Assign new image filename
        newIcon = req.file.filename;
      }
      // Update the category with new data
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
      const { id } = req.params; // Extract product ID from request params
  
      // Find the product by ID
      const category = await Category.findByPk(id);
  
      // Check if product exists
      if (!category) {
        return res.status(404).json({ message: "Product not found" });
      }
  
      // Update the `trash` field to `true`
      await category.update({ trash: true });
  
      res.status(200).json({ message: "category  deleted successfully (soft delete)", category });
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ message: "Internal Server Error", error });
    }
  },
  restoreCategory: async (req, res) => {
    try {
      const { id } = req.params; // Extract product ID from request params
  
      // Find the product by ID
      const category = await Category.findByPk(id);
  
      // Check if product exists
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
  
      // Update the `trash` field to `true`
      await category.update({ trash: false });
  
      res.status(200).json({ message: "category restored successfully (soft delete)", category });
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ message: "Internal Server Error", error });
    }
  },
  getCategory: async (req, res) => {
    try {
      // Fetch all products from the database
      const categories = await Category.findAll({
        order: [["createdAt", "DESC"]], // Order by latest created products
      });
  
      // Check if products exist
      if (!categories.length) {
        return res.status(404).json({ message: "No categories found" });
      }
  
      res.status(200).json({ message: "Categories fetched successfully", categories });
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Internal Server Error", error });
    }
  },
  getCategoryById: async (req, res) => {
    try {
      const { id } = req.params; // Extract product ID from request params
  
      // Find product by ID
      const category = await Category.findByPk(id);
  
      // Check if product exists
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
  
      res.status(200).json({ message: "category fetched successfully", category });
    } catch (error) {
      console.error("Error fetching category:", error);
      res.status(500).json({ message: "Internal Server Error", error });
    }
  },
  addType: async (req, res) => {
    try {
      const data = req.body;
      const newType = await Type.bulkCreate(data);
      res
        .status(201)
        .json({ message: "Type created successfully", data: newType });
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
        data: type,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};
