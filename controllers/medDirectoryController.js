require("../config/database");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { Op } = require("sequelize");
const { Category, Type, HealthcareProvider } = require("../models");
const {
  cleanupFiles,
  deleteFileWithFolderName,
  processImageFields,
  compressAndSaveFile,
} = require("../utils/fileHandler");

const UPLOAD_SUBFOLDER = "medical";
const UPLOAD_PATH = process.env.UPLOAD_PATH;
const medicalProcessingConfig = {
  image: { width: 1024 },
  icon: { width: 150 },
};
module.exports = {
  addMedicalDirectory: async (req, res) => {
    try {
      const iconPath = "uploads/healthcareProvider/icon/";
      const imgPath = "uploads/healthcareProvider/";
      let image = null;
      let icon = null;

      if (req.files?.icon) {
        icon = await compressAndSaveFile(req.files.icon[0], iconPath);
      }
      if (req.files?.image) {
        image = await compressAndSaveFile(req.files.image[0], imgPath);
      }

      const medicalDirectoryData = {
        ...req.body,
        image: image || null,
        icon: icon || null,
      };

      const savedMedicalDirectory = await HealthcareProvider.create(
        medicalDirectoryData
      );
      res.status(201).json({
        success: true,
        result: savedMedicalDirectory,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
  updateMedicalDirectory: async (req, res) => {
    let processedFiles;
    try {
      const { id } = req.params;
      const healthcareProvider = await HealthcareProvider.findByPk(id);
      if (!healthcareProvider) {
        return res
          .status(404)
          .json({ success: false, message: "Healthcare Provider not found" });
      }
      const iconPath = "uploads/healthcareProvider/icon/";
      const imgPath = "uploads/healthcareProvider/";
      let icon = healthcareProvider.icon;
      let image = healthcareProvider.image;
      if (req.files?.icon) {
        const oldFilename = healthcareProvider.icon;
        icon = await compressAndSaveFile(req.files.icon[0], iconPath);
        if (oldFilename) {
          await deleteFileWithFolderName(iconPath, oldFilename);
        }
      }
      if (req.files?.image) {
        const oldFilename = healthcareProvider.image;
        image = await compressAndSaveFile(req.files.image[0], imgPath);
        if (oldFilename) {
          await deleteFileWithFolderName(imgPath, oldFilename);
        }
      }
      const { categories, ...updateBody } = req.body;
      const updatedHealthCareProvider = await healthcareProvider.update({
        ...updateBody,
        image: image || null,
        icon: icon || null,
      });
      return res.status(200).json({
        success: true,
        data: updatedHealthCareProvider,
      });
    } catch (error) {
      await cleanupFiles(processedFiles, UPLOAD_SUBFOLDER);
      console.error(error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
  deleteMedicalDirectory: async (req, res) => {
    try {
      const { id } = req.params;
      const healthcareProvider = await HealthcareProvider.findByPk(id);
      if (!healthcareProvider) {
        return res
          .status(404)
          .json({ success: false, message: "Healthcare Provider not found" });
      }
      await healthcareProvider.update({ trash: true });
      return res.status(200).json({
        success: true,
        healthcareProvider,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
  restoreMedicalDirectory: async (req, res) => {
    try {
      const { id } = req.params;
      const healthcareProvider = await HealthcareProvider.findByPk(id);
      if (!healthcareProvider) {
        return res
          .status(404)
          .json({ success: false, message: "Healthcare Provider not found" });
      }
      await healthcareProvider.update({ trash: false });
      return res.status(200).json({
        success: true,
        healthcareProvider,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
  getMedicalDirectories: async (req, res) => {
    const search = req.query.search || "";
    const area_id = req.query.area_id || null;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    let whereCondition = {};
    if (search) {
      whereCondition = {
        [Op.or]: [
          { name: { [Op.like]: `%${search}%` } },
          { category: { [Op.like]: `%${search}%` } },
        ],
      };
    }
    if (area_id) {
      whereCondition.area_id = area_id;
    }
    try {
      const { count, rows: medical } = await HealthcareProvider.findAndCountAll(
        {
          limit,
          offset,
          attributes: ["id", "name", "priority", "category", "trash"],
          where: whereCondition,
          order: [["createdAt", "DESC"]],
        }
      );
      const totalPages = Math.ceil(count / limit);
      return res.status(200).json({
        success: true,
        count,
        totalPages,
        currentPage: page,
        data: medical,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
  getMedicalDirectoryById: async (req, res) => {
    try {
      const { id } = req.params;
      const healthcareProvider = await HealthcareProvider.findByPk(id, {
        include: [
          {
            model: Category,
            attributes: ["id", "categoryName"],
            as: "categoryInfo",
          },
        ],
      });
      if (!healthcareProvider) {
        return res
          .status(404)
          .json({ success: false, message: "Healthcare Provider not found" });
      }
      return res.status(200).json({ success: true, data: healthcareProvider });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
  getMedicalCategory: async (req, res) => {
    try {
      const medicalCategory = await Type.findOne({
        where: {
          typeName: "medical",
        },
        attributes: [],
        include: {
          model: Category,
          attributes: ["id", "categoryName"],
          as: "category",
        },
      });
      return res.status(200).json({ success: true, data: medicalCategory });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },
};
