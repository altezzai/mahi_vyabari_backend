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
const logger = require("../utils/logger");

module.exports = {
  addProduct: async (req, res) => {
    try {
      console.log("helow");
      let fileName = null;
      if (req.file) {
        fileName = await compressAndSaveFile(req.file, uploadPath);
      }
      const { offerPrice, originalPrice, ...bodyData } = req.body;
      const offerPriceFloat = parseFloat(offerPrice) || 0;
      const originalPriceFloat = parseFloat(originalPrice) || 0;
      if (offerPriceFloat && originalPriceFloat) {
        if (offerPriceFloat > originalPriceFloat) {
          return res.status(400).json({
            success: false,
            message: "Offer Price cannot be greater than Original Price",
          });
        }
      }

      const productData = {
        ...bodyData,
        image: fileName,
        offerPrice: offerPriceFloat,
        originalPrice: offerPriceFloat,
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
      logger.error("error in addProduct", error);
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
      const offerPrice = parseFloat(bodyData.offerPrice) || product.offerPrice;
      const originalPrice =
        parseFloat(bodyData.originalPrice) || product.originalPrice;

      if (originalPrice && offerPrice) {
        if (offerPrice > originalPrice) {
          return res.status(400).json({
            success: false,
            message: "Offer Price cannot be greater than Original Price",
          });
        }
      }
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
        offerPrice,
        originalPrice,
      });

      return res.status(200).json({ success: true, product: updatedProduct });
    } catch (error) {
      console.error(error);
      logger.error("error in updateProduct", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },
  getProducts: async (req, res) => {
    const search = req.query.search || "";
    const shop_id = req.query.shop_id || null;
    const download = req.query.download || "";
    let { page = 1, limit = 10 } = req.query;
    if (download === "true") {
      page = null;
      limit = null;
    } else {
      page = parseInt(page) || 1;
      limit = parseInt(limit) || 10;
    }

    const offset = page && limit ? (page - 1) * limit : 0;

    let whereCondition = {};
    if (search) {
      whereCondition = {
        [Op.or]: [
          { productName: { [Op.like]: `%${search}%` } },
          { "$shop.shopName$": { [Op.like]: `%${search}%` } },
        ],
      };
    }
    if (shop_id) {
      whereCondition.shopId = shop_id;
    }
    try {
      const count = await Product.count({
        where: whereCondition,
        distinct: true,
      });
      const products = await Product.findAll({
        limit,
        offset,
        distinct: true,
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
        totalPages: download === "true" ? null : totalPages,
        currentPage: download === "true" ? null : page,
        data: products,
      });
    } catch (error) {
      console.error(error);
      logger.error("error in getProducts", error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
  getProductById: async (req, res) => {
    try {
      const { id } = req.params;
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
      logger.error("error in getProductById", error);
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
      logger.error("error in deleteProductById", error);
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
      logger.error("error in restoreProductById", error);
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
      logger.error("error in getShopName", error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
};
