const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { Shop, Product } = require("../models");
const { Op } = require("sequelize");
const {
  deleteFileWithFolderName,
  compressAndSaveFile,
} = require("../utils/fileHandler");
const uploadPath = "public/uploads/products/";

module.exports = {
  addProduct: async (req, res) => {
    try {
      console.log("helow");
      let fileName = null;
      if (req.file) {
        fileName = await compressAndSaveFile(req.file, uploadPath);
      }

      const productData = {
        ...req.body,
        image: fileName,
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
      console.log(error);
      return res.status(401).json({
        success: false,
        message: error.message,
      });
    }
  },
  updateProduct: async (req, res) => {
    try {
      const { id } = req.params;
      let product = await Product.findByPk(id);
      if (!product) {
        return res
          .status(404)
          .json({ success: false, message: "Product not found" });
      }

      const { ...bodyData } = req.body;
      let fileName = product.image;
      if (req.file) {
        const oldFilename = fileName;
        fileName = await compressAndSaveFile(req.file, uploadPath);
        if (oldFilename) {
          await deleteFileWithFolderName(uploadPath, oldFilename);
        }
      }
      const updatedProduct = await product.update({
        ...bodyData,
        image: fileName,
      });

      return res.status(200).json({ success: true, product: updatedProduct });
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
          "offerPercentage",
          "image",
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
