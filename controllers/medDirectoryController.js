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
} = require("../utils/fileHandler");

const UPLOAD_SUBFOLDER = "medical";
const UPLOAD_PATH = process.env.UPLOAD_PATH;
const medicalProcessingConfig = {
  image: { width: 1024 },
  icon: { width: 150 },
};
module.exports = {
  addMedicalDirectory: async (req, res) => {
    let processedFiles;
    try {
      processedFiles = await processImageFields(
        req.files,
        medicalProcessingConfig,
        UPLOAD_SUBFOLDER
      );
      const medDirectoryData = {
        ...req.body,
        image: processedFiles.image?.[0].filename || null,
        icon: processedFiles.icon?.[0].filename || null,
      };
      const savedMedicalDirectory = await HealthcareProvider.create(
        medDirectoryData
      );
      res.status(201).json({
        success: true,
        result: savedMedicalDirectory,
      });
    } catch (error) {
      await cleanupFiles(processedFiles, UPLOAD_SUBFOLDER);
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
      processedFiles = await processImageFields(
        req.files,
        medicalProcessingConfig,
        UPLOAD_SUBFOLDER
      );
      const { ...bodyData } = req.body;
      if (processedFiles.image && healthcareProvider.image) {
        const oldFilename = path.basename(healthcareProvider.image);
        const oldFilePath = path.join(UPLOAD_PATH, UPLOAD_SUBFOLDER);
        await deleteFileWithFolderName(oldFilePath, oldFilename);
      }
      if (processedFiles.icon && healthcareProvider.icon) {
        const oldFilename = path.basename(healthcareProvider.icon);
        const oldFilePath = path.join(UPLOAD_PATH, UPLOAD_SUBFOLDER);
        await deleteFileWithFolderName(oldFilePath, oldFilename);
      }
      for (const key in bodyData) {
        if (bodyData[key] !== null && bodyData[key] !== undefined) {
          healthcareProvider[key] = bodyData[key];
        }
      }
      if (processedFiles.image) {
        healthcareProvider.image = processedFiles.image?.[0].filename;
      }
      if (processedFiles.icon) {
        healthcareProvider.icon = processedFiles.icon?.[0].filename;
      }
      const updatedHealthCareProvider = await healthcareProvider.save();
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
