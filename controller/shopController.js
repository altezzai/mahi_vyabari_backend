require("../config/database");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const Product = require("../models/Product");
const Shop = require("../models/Shop");

const uploadPath = path.join(__dirname, "../public/uploads/shopImages");
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
  addshop: async (req, res) => {
    try {
      if (!req.files.shopImage || !req.files.shopIconImage) {
        return res
          .status(400)
          .json({ message: "Both shopImage and shopIconImage are required" });
      }

      const shopImage = req.files ? req.files.shopImage[0].filename : null;
      const shopIconImage = req.files ? req.files.shopIconImage[0].filename : null;

      req.body.shopImage = shopImage;
      req.body.shopIconImage = shopIconImage;

      const savedShop = await Shop.create(req.body);
      res.status(201).json({
        status: "success",
        savedShop: savedShop,
      });
    } catch (error) {
      console.log(error);
      res.status(401).json({
        status: "FAILED",
        message: "An error occured while uploading new shop data",
      });
    }
  },
  addproduct: async (req, res) => {
    try {
      const savedProduct = await Product.create(req.body);
      if (!savedProduct) {
        res.status(404).json(error.message);
      }
      res.status(200).json({
        success: "SUCCESS",
        result: savedProduct,
      });
    } catch (error) {
      console.log(error);
      res.status(401).json({
        status: "FAILED",
        message: "An error occured while adding the product",
      });
    }
  },
};
