const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { Emergency } = require("../models");
const { Op } = require("sequelize");
const {
  deleteFileWithFolderName,
  compressAndSaveFile,
} = require("../utils/fileHandler");

const UPLOAD_SUBFOLDER = "emergency";
const UPLOAD_PATH = process.env.UPLOAD_PATH;
const emergencyProcessingConfig = {
  icon: { width: 150 },
};

module.exports = {
  addEmergency: async (req, res) => {
    try {
      let fileName = null;
      if (req.file) {
        const uploadPath = "uploads/emergency/";
        fileName = await compressAndSaveFile(req.file, uploadPath);
      }
      const emergencyData = {
        ...req.body,
        icon: fileName,
      };
      const savedEmergency = await Emergency.create(emergencyData);
      res.status(200).json({
        success: true,
        data: savedEmergency,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
  updateEmergency: async (req, res) => {
    try {
      const { id } = req.params;
      const emergency = await Emergency.findByPk(id);
      if (!emergency) {
        return res
          .status(404)
          .json({ success: false, message: "Emergency record not found" });
      }

      const { ...bodyData } = req.body;

      let fileName = emergency.icon;
      if (req.file) {
        const uploadPath = "uploads/emergency/";
        const oldFilename = fileName;
        fileName = await compressAndSaveFile(req.file, uploadPath);
        if (oldFilename) {
          await deleteFileWithFolderName(uploadPath, oldFilename);
        }
      }

      const updatedEmergency = await emergency.update({
        ...bodyData,
        icon: fileName,
      });

      return res.status(200).json({
        success: true,
        data: updatedEmergency,
      });
    } catch (error) {
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
