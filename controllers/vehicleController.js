require("../config/database");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { Op } = require("sequelize");

const {
  VehicleSchedule,
  VehicleService,
  Type,
  Category,
  Area,
  User,
} = require("../models");
const {
  deleteFileWithFolderName,
  compressAndSaveFile,
} = require("../utils/fileHandler");

const iconPath = "public/uploads/taxi/icon/";
const imgPath = "public/uploads/taxi/";

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
          attributes: [
            "id",
            "vehicleName",
            "category",
            "via",
            "to",
            "vehicleNumber",
            "trash",
          ],
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
    try {
      let image = null;
      let icon = null;

      if (req.files?.icon) {
        icon = await compressAndSaveFile(req.files.icon[0], iconPath);
      }
      if (req.files?.image) {
        image = await compressAndSaveFile(req.files.image[0], imgPath);
      }

      const vehicleServiceData = {
        ...req.body,
        image: image || null,
        icon: icon || null,
      };
      const savedService = await VehicleService.create(vehicleServiceData);
      res.status(201).json({
        success: true,
        result: savedService,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
  updateVehicleServiceProvider: async (req, res) => {
    try {
      const { id } = req.params;
      const vehicleService = await VehicleService.findByPk(id);
      if (!vehicleService) {
        return res
          .status(404)
          .json({ success: false, message: "Vehicle Service not found" });
      }

      const { ...bodyData } = req.body;

      let icon = vehicleService.icon;
      let image = vehicleService.image;
      if (req.files?.icon) {
        const oldFilename = vehicleService.icon;
        icon = await compressAndSaveFile(req.files.icon[0], iconPath);
        if (oldFilename) {
          await deleteFileWithFolderName(iconPath, oldFilename);
        }
      }
      if (req.files?.image) {
        const oldFilename = vehicleService.image;
        image = await compressAndSaveFile(req.files.image[0], imgPath);
        await deleteFileWithFolderName(imgPath, oldFilename);
      }

      const updatedVehicleService = await vehicleService.update({
        ...bodyData,
        image: image || null,
        icon: icon || null,
      });
      return res.status(200).json({
        success: true,
        data: updatedVehicleService,
      });
    } catch (error) {
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
    const area_id = req.query.area_id || null;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const category = req.query.category || null;
    let whereCondition = {};
    if (search) {
      whereCondition = {
        [Op.or]: [
          { ownerName: { [Op.like]: `%${search}%` } },
          { "$taxiCategory.categoryName$": { [Op.like]: `%${search}%` } },
        ],
      };
    }
    if (area_id) {
      whereCondition.area_id = area_id;
    }
    if (category) {
      whereCondition.category = category;
    }
    try {
      const { count, rows: vehicleServices } =
        await VehicleService.findAndCountAll({
          limit,
          offset,
          where: whereCondition,
          attributes: [
            "id",
            "ownerName",
            "priority",
            "image",
            "icon",
            "minFee",
            "vehicleNumber",
          ],
          include: [
            {
              model: Category,
              attributes: ["id", "categoryName"],
              as: "taxiCategory",
            },
            {
              model: Area,
              attributes: ["id", "name"],
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
          {
            model: Area,
            attributes: ["id", "name"],
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
