const multer = require("multer");
const fs = require("fs");
const path = require("path");
const {Emergency} = require("../models");
const { Op } = require("sequelize");
const { cleanupFiles,deleteFileWithFolderName ,processImageFields} = require("../utils/fileHandler");

const UPLOAD_SUBFOLDER = "emergency";
const UPLOAD_PATH = process.env.UPLOAD_PATH;
const emergencyProcessingConfig = {
  icon: { width: 150 }, 
};

module.exports = {
  addEmergency: async (req, res) => {
    let processedFiles;
    try {
      processedFiles = await processImageFields(
        req.files,
        emergencyProcessingConfig,
        UPLOAD_SUBFOLDER
      );
      const emergencyData = {
        ...req.body,
        icon: processedFiles.icon.filename || null,
      };
      const savedEmergency = await Emergency.create(emergencyData);
      res.status(200).json({
        success: true,
        data: savedEmergency,
      });
    } catch (error) {
      console.log(error);
      await cleanupFiles(processedFiles, UPLOAD_SUBFOLDER);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
  updateEmergency: async (req, res) => {
    let processedFiles;
    try {
      const { id } = req.params;
      const emergency = await Emergency.findByPk(id);
      if (!emergency) {
        return res
          .status(404)
          .json({ success: false, message: "Emergency record not found" });
      }
      processedFiles = await processImageFields(
        req.files,
        emergencyProcessingConfig,
        UPLOAD_SUBFOLDER
      );
      const { ...bodyData } = req.body;
      if (processedFiles.icon && emergency.icon) {
        const oldFilename = path.basename(emergency.icon);
        const oldFilePath = path.join(UPLOAD_PATH, UPLOAD_SUBFOLDER);
        await deleteFileWithFolderName(oldFilePath, oldFilename);
      }
      for (const key in bodyData) {
        if (bodyData[key] !== null && bodyData[key] !== undefined) {
          emergency[key] = bodyData[key];
        }
      }
      if (processedFiles.icon) {
        emergency.icon = processedFiles.icon.filename;
      }
      const updatedEmergency = await emergency.save();
      return res.status(200).json({
        success: true,
        data: updatedEmergency,
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
  deleteEmergency: async (req, res) => {
    try {
      const { id } = req.params;
      const emergency = await Emergency.findByPk(id);
      if (!emergency) {
        return res
          .status(404)
          .json({ success: false, message: "Emergency record not found" });
      }
      await emergency.update({ trash: true });
      return res.status(200).json({
        success: true,
        emergency,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
  restoreEmergency: async (req, res) => {
    try {
      const { id } = req.params;
      const emergency = await Emergency.findByPk(id);
      if (!emergency) {
        return res
          .status(404)
          .json({ success: false, message: "Emergency record not found" });
      }
      await emergency.update({ trash: false });
      return res.status(200).json({
        success: true,
        emergency,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Error soft deleting emergency",
      });
    }
  },
  getEmergencies: async (req, res) => {
    const search = req.query.search || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    let whereCondition = {};
    if (search) {
      whereCondition = {
        [Op.or]: [
          { emergencyName: { [Op.like]: `%${search}%` } },
          { phone: { [Op.like]: `%${search}%` } },
        ],
      };
    }
    try {
      const { count, rows: emergencies } = await Emergency.findAndCountAll({
        limit,
        offset,
        where: whereCondition,
        attributes: ["id", "emergencyName", "phone", "trash"],
        order: [["createdAt", "DESC"]],
      });
      if (!emergencies) {
        return res
          .status(404)
          .json({ success: false, message: "Emergency record not found" });
      }
      const totalPages = Math.ceil(count / limit);
      return res.status(200).json({
        success: true,
        count,
        totalPages,
        currentPage: page,
        data: emergencies,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },
  getEmergencyById: async (req, res) => {
    try {
      const { id } = req.params;
      const emergency = await Emergency.findByPk(id);
      if (!emergency) {
        return res
          .status(404)
          .json({ success: false, message: "Emergency record not found" });
      }

      return res.status(200).json({ success: true, data: emergency });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },
};
