const multer = require("multer");
const fs = require("fs");
const path = require("path");
const Product = require("../models/Product");
const Shop = require("../models/Shop");
const { deleteFileWithFolderName } = require("../utils/deleteFile");
const { Op } = require("sequelize");

const uploadPath = path.join(__dirname, "../public/uploads/productImages");
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
  addProduct: async (req, res) => {
    try {
      const productData = {
        ...req.body,
        image: req.file ? req.file.filename : null,
      };
      const savedProduct = await Product.create(productData);
      if (!savedProduct) {
        res
          .status(404)
          .json({ success: false, message: "Can't Upload Product Data" });
      }
      return res.status(200).json({
        success: true,
        result: savedProduct,
      });
    } catch (error) {
      await deleteFileWithFolderName(uploadPath, req.file?.filename);
      console.log(error);
      return res.status(401).json({
        success: false,
        message: error.message,
      });
    }
  },
  updateProduct: async (req, res) => {
    const {
      shopId,
      productName,
      originalPrice,
      offerPrice,
      offerPercentage,
      description,
    } = req.body;
    try {
      const { id } = req.params;
      let product = await Product.findByPk(id);
      if (!product) {
        await deleteFileWithFolderName(uploadPath, req.file.filename);
        return res
          .status(404)
          .json({ success: false, message: "Product not found" });
      }
      let newImage = product.image;
      if (req.file) {
        if (product.image) {
          const oldImagePath = path.join(uploadPath, product.image);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
        newImage = req.file.filename;
      }
      await product.update({
        shopId,
        productName,
        originalPrice,
        offerPrice: offerPrice || product.offerPrice,
        offerPercentage: offerPercentage || product.offerPercentage,
        description: description || product.description,
        image: newImage,
      });
      return res.status(200).json({ success: true, product });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },
  getProducts: async (req, res) => {
    const search = req.query.search || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    let whereCondition = {};
    if (search) {
      whereCondition = {
        [Op.or]: [
          { productName: { [Op.like]: `%${search}%` } },
          { "$shop.shopName$": { [Op.like]: `%${search}%` } },
        ],
      };
    }
    try {
      const { count, rows: products } = await Product.findAndCountAll({
        limit,
        offset,
        where: whereCondition,
        attributes: [
          "id",
          "productName",
          "originalPrice",
          "offerPrice",
          "trash",
        ],
        include: [
          {
            model: Shop,
            attributes: ["id", "shopName"],
            as: "shop",
            required: true,
          },
        ],
        order: [["createdAt", "DESC"]],
      });
      const totalPages = Math.ceil(count / limit);
      return res.status(200).json({
        success: true,
        count,
        totalPages,
        currentPage: page,
        data: products,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
  getProductById: async (req, res) => {
    try {
      const { id } = req.params;
      console.log(id);
      const product = await Product.findOne({
        where: { id },
        include: [
          {
            model: Shop,
            attributes: ["shopName"],
            as: "shop",
          },
        ],
      });
      if (!product) {
        return res
          .status(404)
          .json({ success: false, message: "Product not found" });
      }
      res.status(200).json({ success: true, product });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
  deleteProductById: async (req, res) => {
    try {
      const { id } = req.params;
      const product = await Product.findByPk(id);
      if (!product) {
        return res
          .status(404)
          .json({ success: false, message: "Product not found" });
      }
      await product.update({ trash: true });
      res.status(200).json({
        success: true,
        product,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
  restoreProductById: async (req, res) => {
    try {
      const { id } = req.params;
      const product = await Product.findByPk(id);
      if (!product) {
        return res
          .status(404)
          .json({ success: false, message: "Product not found" });
      }
      await product.update({ trash: false });
      res.status(200).json({
        success: true,
        product,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
  getShopName: async (req, res) => {
    const search = req.query.search || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    let whereCondition = {};
    if (search) {
      whereCondition = {
        shopName: { [Op.like]: `%${search}%` },
      };
    }
    try {
      const shops = await Shop.findAll({
        limit,
        offset,
        where: whereCondition,
        attributes: ["id", "shopName"],
      });
      res.status(200).json({ success: true, shops });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
};
