const multer = require("multer");
const fs = require("fs");
const path = require("path");
const Product = require("../models/Product");
const { deletefilewithfoldername } = require("../utils/util");

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
      }
}