require("../config/database");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { Tourism, TourismImage, Category, Area } = require("../models");
const { Op } = require("sequelize");
const sequelize = require("../config/database");
const {
  processImage,
  cleanupFiles,
  deleteFileWithFolderName,
  processImageFields,
  compressAndSaveFile,
} = require("../utils/fileHandler");

const UPLOAD_SUBFOLDER = "tourism";
const UPLOAD_PATH = process.env.UPLOAD_PATH;

const tourismCreateConfig = {
  images: { width: 1080 },
};

const tourismAddImageConfig = {
  image: { width: 1080 },
};

module.exports = {
  addTouristPlace: async (req, res) => {
    let processedFiles;
    const t = await sequelize.transaction();
    try {
      const newSpot = await Tourism.create(
        {
          ...req.body,
        },
        { transaction: t }
      );

      if (req.files?.images) {
        const imageRecords = [];

        for (const img of req.files.images) {
          const compressedName = await compressAndSaveFile(
            img,
            "uploads/tourism/"
          );
          imageRecords.push({
            tourismId: newSpot.id,
            image: compressedName,
          });
        }

        await TourismImage.bulkCreate(imageRecords, { transaction: t });
      }
      await t.commit();
      const finalSpot = await Tourism.findByPk(
        newSpot.id,
        {
          include: [{ model: TourismImage, as: "images" }],
        },
        { transaction: t }
      );
      res.status(201).json({
        message: "Tourism spot created successfully!",
        spot: finalSpot,
      });
    } catch (error) {
      await t.rollback();
      console.log(error);
      await cleanupFiles(processedFiles, UPLOAD_SUBFOLDER);
      console.error("Error in createTourismSpot:", error);
      res.status(500).json({
        error: "Failed to create tourism spot",
        details: error.message,
      });
    }
  },
  updateTouristPlace: async (req, res) => {
    const {
      placeName,
      phone,
      area_id,
      startTime,
      endTime,
      entryFee,
      location,
    } = req.body;
    try {
      const { id } = req.params;
      const tourism = await Tourism.findByPk(id);
      if (!tourism) {
        return res
          .status(404)
          .json({ success: false, message: "Tourism not found" });
      }

      const updatedTourism = await tourism.update({
        placeName,
        phone,
        area_id,
        startTime,
        endTime,
        entryFee,
        location,
      });
      console.log(updatedTourism);
      if (req.files?.images) {
        console.log(req.files.images);
        const imageRecords = [];

        for (const img of req.files.images) {
          const compressedName = await compressAndSaveFile(
            img,
            "uploads/tourism/"
          );
          imageRecords.push({
            tourismId: tourism.id,
            image: compressedName,
          });
        }

        await TourismImage.bulkCreate(imageRecords, { transaction: t });
      }
      return res.status(200).json({ success: true, updatedTourism });
    } catch (error) {
      console.error("Error in updateTourismSpot:", error);
      res.status(500).json({
        error: "Failed to update tourism spot",
        details: error.message,
      });
    }
  },
  deleteTourismImage: async (req, res) => {
    try {
      const { id } = req.params; // ID of the TourismImage

      // 1. Find the image record
      const image = await TourismImage.findByPk(id);
      if (!image) {
        return res.status(404).json({ error: "Image not found." });
      }
      const fileName = image.image;
      const uploadPath = "uploads/tourism/";
      if (fileName) {
        await deleteFileWithFolderName(uploadPath, fileName);
      }
      await image.destroy();

      res.status(200).json({ message: "Image deleted successfully!" });
    } catch (error) {
      console.error("Error deleting image:", error);
      res.status(500).json({ error: "Failed to delete image" });
    }
  },

  deleteTouristPlace: async (req, res) => {
    try {
      const { id } = req.params;
      const tourism = await Tourism.findByPk(id);
      if (!tourism) {
        return res
          .status(404)
          .json({ success: false, message: "Tourism not found" });
      }
      await tourism.update({ trash: true });
      return res.status(200).json({ success: true, tourism });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },
  restoreTouristPlace: async (req, res) => {
    try {
      const { id } = req.params;
      const tourism = await Tourism.findByPk(id);
      if (!tourism) {
        return res
          .status(404)
          .json({ success: false, message: "Tourism not found" });
      }
      await tourism.update({ trash: false });
      return res.status(200).json({ success: true, tourism });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },
  getTouristPlaces: async (req, res) => {
    const search = req.query.search || "";
    const area_id = req.query.area_id || null;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit || 0;
    let whereCondition = {};
    if (search) {
      whereCondition = {
        [Op.or]: [{ placeName: { [Op.like]: `%${search}%` } }],
      };
    }
    if (area_id) {
      whereCondition.area_id = area_id;
    }
    try {
      const { count, rows: tourism } = await Tourism.findAndCountAll({
        limit,
        offset,
        where: whereCondition,
        attributes: ["id", "placeName", "phone", "trash"],
        order: [["id", "DESC"]],
        include: [
          {
            model: TourismImage,
            as: "images",
            attributes: ["image"],
          },
          {
            model: Area,
            attributes: ["id", "name"],
          },
        ],
      });
      const totalPages = Math.ceil(count / limit);
      return res.status(200).json({
        success: true,
        count,
        totalPages,
        currentPage: page,
        data: tourism,
      });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ success: false, message: error.message, name: error.name });
    }
  },
  getTouristPlaceById: async (req, res) => {
    try {
      const { id } = req.params;
      const tourism = await Tourism.findByPk(id, {
        include: [
          {
            model: TourismImage,
            as: "images",
            attributes: ["image"],
          },
          {
            model: Area,
            attributes: ["id", "name"],
          },
        ],
      });
      if (!tourism) {
        return res
          .status(404)
          .json({ success: false, message: "Tourism not found" });
      }
      res.status(200).json({ success: true, tourism });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
};
