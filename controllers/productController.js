const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { Shop, Product } = require("../models");
const { Op } = require("sequelize");
const {
  cleanupFiles,
  deleteFileWithFolderName,
  processImageFields,
} = require("../utils/fileHandler");

const UPLOAD_SUBFOLDER = "productImages";
const UPLOAD_PATH = process.env.UPLOAD_PATH;

const productProcessingConfig = {
  image: { width: 1024 },
};

module.exports = {
  addProduct: async (req, res) => {
    let processedFiles;
    try {
      processedFiles = await processImageFields(
        req.files,
        productProcessingConfig,
        UPLOAD_SUBFOLDER
      );
      console.log(processedFiles);
      const productData = {
        ...req.body,
        image: processedFiles.image[0].filename || null,
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
      await cleanupFiles(processedFiles, UPLOAD_SUBFOLDER);
      console.log(error);
      return res.status(401).json({
        success: false,
        message: error.message,
      });
    }
  },
  updateProduct: async (req, res) => {
    let processedFiles;
    try {
      const { id } = req.params;
      let product = await Product.findByPk(id);
      if (!product) {
        return res
          .status(404)
          .json({ success: false, message: "Product not found" });
      }
      processedFiles = await processImageFields(
        req.files,
        productProcessingConfig,
        UPLOAD_SUBFOLDER
      );
      const { ...bodyData } = req.body;
      if (processedFiles.image && product.image) {
        const oldFilename = path.basename(product.image);
        const oldFilePath = path.join(UPLOAD_PATH, UPLOAD_SUBFOLDER);
        await deleteFileWithFolderName(oldFilePath, oldFilename);
      }
      for (const key in bodyData) {
        if (bodyData[key] !== null && bodyData[key] !== undefined) {
          product[key] = bodyData[key];
        }
      }
      if (processedFiles.image) {
        product.image = processedFiles.image[0].filename;
      }
      const updatedProduct = await product.save();
      return res.status(200).json({ success: true, product: updatedProduct });
    } catch (error) {
      await cleanupFiles(processedFiles, UPLOAD_SUBFOLDER);
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
