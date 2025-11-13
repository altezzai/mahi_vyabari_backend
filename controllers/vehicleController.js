require("../config/database");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
// const VehicleSchedule = require("../models/VehicleSchedule");
// const VehicleService = require("../models/VehicleService");
const { Op } = require("sequelize");
// const Type = require("../models/Type");
// const Category = require("../models/Category");
const {
  VehicleSchedule,
  VehicleService,
  Type,
  Category,
} = require("../models");
const {
  cleanupFiles,
  deleteFileWithFolderName,
  processImageFields,
} = require("../utils/fileHandler");

const UPLOAD_SUBFOLDER = "vehicle";
const UPLOAD_PATH = process.env.UPLOAD_PATH;
const vehicleProcessingConfig = {
  image: { width: 1024 },
  icon: { width: 150 },
};

module.exports = {
  addVehicleSchedule: async (req, res) => {
    try {
      const savedSchedule = await VehicleSchedule.create(req.body);
      if (!savedSchedule) {
        res.status(404).json({
          success: false,
          message: "Can't upload vehicle Schedule Data",
        });
      }
      res.status(201).json({
        success: true,
        result: savedSchedule,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
  updateVehicleSchedule: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        userId,
        category,
        vehicleName,
        vehicleNumber,
        via,
        to,
        departureTime,
        arrivalTime,
      } = req.body;
      let vehicleSchedule = await VehicleSchedule.findByPk(id);
      if (!vehicleSchedule) {
        return res
          .status(404)
          .json({ success: false, message: "Vehicle Schedule not found" });
      }
      if (vehicleNumber && vehicleNumber !== vehicleSchedule.vehicleNumber) {
        const existingVehicle = await VehicleSchedule.findOne({
          where: { vehicleNumber },
        });
        if (existingVehicle) {
          return res
            .status(400)
            .json({ success: false, message: "Vehicle number already exists" });
        }
      }
      await vehicleSchedule.update({
        userId,
        category,
        vehicleName,
        vehicleNumber,
        via,
        to,
        departureTime,
        arrivalTime,
      });

      return res.status(200).json({
        success: true,
        data: vehicleSchedule,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
  deleteVehicleSchedule: async (req, res) => {
    try {
      const { id } = req.params;
      let vehicleSchedule = await VehicleSchedule.findByPk(id);
      if (!vehicleSchedule) {
        return res
          .status(404)
          .json({ success: false, message: "Vehicle Schedule not found" });
      }
      await vehicleSchedule.update({ trash: true });
      return res.status(200).json({
        success: true,
        vehicleSchedule,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
  restoreVehicleSchedule: async (req, res) => {
    try {
      const { id } = req.params;
      let vehicleSchedule = await VehicleSchedule.findByPk(id);
      if (!vehicleSchedule) {
        return res
          .status(404)
          .json({ success: false, message: "Vehicle Schedule not found" });
      }
      await vehicleSchedule.update({ trash: false });
      return res.status(200).json({
        success: true,
        vehicleSchedule,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
  getVehicleSchedules: async (req, res) => {
    const search = req.query.search || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    let whereCondition = {};
    if (search) {
      whereCondition = {
        [Op.or]: [
          { vehicleName: { [Op.like]: `%${search}%` } },
          { category: { [Op.like]: `%${search}%` } },
          { via: { [Op.like]: `%${search}%` } },
          { to: { [Op.like]: `%${search}%` } },
        ],
      };
    }
    try {
      const { count, rows: vehicleSchedules } =
        await VehicleSchedule.findAndCountAll({
          limit,
          offset,
          where: whereCondition,
          attributes: ["id", "vehicleName", "category", "via", "to", "trash"],
          order: [["createdAt", "DESC"]],
        });
      if (!vehicleSchedules) {
        return res
          .status(404)
          .json({ success: false, message: "Vehicle Schedule not found" });
      }
      const totalPages = Math.ceil(count / limit);
      return res.status(200).json({
        success: true,
        count,
        totalPages,
        currentPage: page,
        data: vehicleSchedules,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
  getVehicleScheduleById: async (req, res) => {
    try {
      const { id } = req.params;
      const vehicleSchedule = await VehicleSchedule.findByPk(id);
      if (!vehicleSchedule) {
        return res
          .status(404)
          .json({ success: false, message: "Vehicle Schedule not found" });
      }
      return res.status(200).json({ success: true, data: vehicleSchedule });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
  addVehicleServiceProvider: async (req, res) => {
    let processedFiles;
    try {
      processedFiles = await processImageFields(
        req.files,
        vehicleProcessingConfig,
        UPLOAD_SUBFOLDER
      );
      const vehicleServiceData = {
        ...req.body,
        image: processedFiles.image[0].filename || null,
        icon: processedFiles.icon[0].filename || null,
      };
      const savedService = await VehicleService.create(vehicleServiceData);
      res.status(201).json({
        success: true,
        result: savedService,
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
  updateVehicleServiceProvider: async (req, res) => {
    let processedFiles;
    try {
      const { id } = req.params;
      const vehicleService = await VehicleService.findByPk(id);
      if (!vehicleService) {
        return res
          .status(404)
          .json({ success: false, message: "Vehicle Service not found" });
      }
      processedFiles = await processImageFields(
        req.files,
        vehicleProcessingConfig,
        UPLOAD_SUBFOLDER
      );
      const { ...bodyData } = req.body;
      if (processedFiles.image && vehicleService.image) {
        const oldFilename = path.basename(vehicleService.image);
        const oldFilePath = path.join(UPLOAD_PATH, UPLOAD_SUBFOLDER);
        await deleteFileWithFolderName(oldFilePath, oldFilename);
      }
      if (processedFiles.icon && vehicleService.icon) {
        const oldFilename = path.basename(vehicleService.icon);
        const oldFilePath = path.join(UPLOAD_PATH, UPLOAD_SUBFOLDER);
        await deleteFileWithFolderName(oldFilePath, oldFilename);
      }
      for (const key in bodyData) {
        if (bodyData[key] !== null && bodyData[key] !== undefined) {
          vehicleService[key] = bodyData[key];
        }
      }
      if (processedFiles.image) {
        vehicleService.image = processedFiles.image[0].filename;
      }
      if (processedFiles.icon) {
        vehicleService.icon = processedFiles.icon[0].filename;
      }
      const updatedVehicleService = await vehicleService.save();
      return res.status(200).json({
        success: true,
        data: updatedVehicleService,
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
  deleteVehicleServiceProvider: async (req, res) => {
    try {
      const { id } = req.params;
      const vehicleService = await VehicleService.findByPk(id);
      if (!vehicleService) {
        return res
          .status(404)
          .json({ success: false, message: "Vehicle Service not found" });
      }
      await vehicleService.update({ trash: true });
      return res.status(200).json({
        success: true,
        vehicleService,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
  restoreVehicleServiceProvider: async (req, res) => {
    try {
      const { id } = req.params;
      const vehicleService = await VehicleService.findByPk(id);
      if (!vehicleService) {
        return res
          .status(404)
          .json({ success: false, message: "Vehicle Service not found" });
      }
      await vehicleService.update({ trash: false });
      return res.status(200).json({
        success: true,
        vehicleService,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
  getVehicleServiceProviders: async (req, res) => {
    const search = req.query.search || "";
    const area = req.query.area || null;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    let whereCondition = {};
    if (search) {
      whereCondition = {
        [Op.or]: [
          { ownerName: { [Op.like]: `%${search}%` } },
          { "$taxiCategory.categoryName$": { [Op.like]: `%${search}%` } },
        ],
      };
    }
    if (area) {
      whereCondition.area = area;
    }
    try {
      const { count, rows: vehicleServices } =
        await VehicleService.findAndCountAll({
          limit,
          offset,
          where: whereCondition,
          attributes: ["id", "ownerName", "priority", "trash"],
          include: [
            {
              model: Category,
              attributes: ["id", "categoryName"],
              as: "taxiCategory",
            },
          ],
          order: [["createdAt", "DESC"]],
        });
      if (!vehicleServices) {
        return res
          .status(404)
          .json({ success: false, message: "Vehicle Service not found" });
      }
      const totalPages = Math.ceil(count / limit);
      return res.status(200).json({
        success: true,
        count,
        totalPages,
        currentPage: page,
        data: vehicleServices,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
  getVehicleServiceProviderById: async (req, res) => {
    try {
      const { id } = req.params;
      const vehicleService = await VehicleService.findByPk(id, {
        include: [
          {
            model: Category,
            attributes: ["id", "categoryName"],
            as: "taxiCategory",
          },
        ],
      });
      if (!vehicleService) {
        return res
          .status(404)
          .json({ success: false, message: "Vehicle Service not found" });
      }
      return res.status(200).json({
        success: true,
        data: vehicleService,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
  getVehicleServiceCategories: async (req, res) => {
    try {
      const vehicleServiceCategories = await Type.findOne({
        where: {
          typeName: "taxi",
        },
        attributes: [],
        include: [
          {
            model: Category,
            attributes: ["id", "categoryName"],
            as: "category",
          },
        ],
      });
      res.status(200).json({ success: true, vehicleServiceCategories });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
};
