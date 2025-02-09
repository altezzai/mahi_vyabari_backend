require("../config/database");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const Category = require("../models/category");

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
      console.log(error);
      res.status(500).json({
        status: "FAILED",
        message: "An error occure while uploading Category data",
        error: error,
      });
    }
  },
};
