require("../config/database");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { Op } = require("sequelize");
const logger = require("../utils/logger");

const {
  VehicleSchedule,
  VehicleService,
  Type,
  Category,
  Area,
  User,
  Place,
} = require("../models");
const {
  deleteFileWithFolderName,
  compressAndSaveFile,
} = require("../utils/fileHandler");
const { get } = require("http");

const iconPath = "public/uploads/taxi/icon/";
const imgPath = "public/uploads/taxi/";

module.exports = {
  addVehicleSchedule: async (req, res) => {
    try {
      const {
        userId,
        vehicleName,
        vehicleNumber,
        from,
        via,
        to,
        departureTime,
        arrivalTime,
      } = req.body;
      const savedSchedule = await VehicleSchedule.create({
        userId,
        vehicleName,
        vehicleNumber,
        category: "bus",
        from,
        via,
        to,
        departureTime,
        arrivalTime,
      });
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
      logger.error("error in addVehicleSchedule", error);
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
        vehicleName,
        vehicleNumber,
        from,
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
        category: "bus",
        vehicleName,
        vehicleNumber,
        from,
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
      logger.error("error in updateVehicleSchedule", error);
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
      logger.error("error in deleteVehicleSchedule", error);
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
      logger.error("error in restoreVehicleSchedule", error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
  permanentDeleteVehicleSchedule: async (req, res) => {
    try {
      const { id } = req.params;
      let vehicleSchedule = await VehicleSchedule.findByPk(id);
      if (!vehicleSchedule) {
        return res
          .status(404)
          .json({ success: false, message: "Vehicle Schedule not found" });
      }
      await vehicleSchedule.destroy();
      return res.status(200).json({
        success: true,
        vehicleSchedule,
      });
    } catch (error) {
      console.error(error);
      logger.error(error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
  getVehicleSchedules: async (req, res) => {
    const search = req.query.search || "";
    const download = req.query.download || "";
    const from = req.query.from || null;
    const to = req.query.to || null;
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
          { vehicleName: { [Op.like]: `%${search}%` } },
          { vehicleNumber: { [Op.like]: `%${search}%` } },
        ],
      };
    }
    if (from) {
      whereCondition.from = from;
    }
    if (to) {
      whereCondition.to = to;
    }
    try {
      const { count, rows: vehicleSchedules } =
        await VehicleSchedule.findAndCountAll({
          limit,
          offset,
          distinct: true,
          where: whereCondition,
          attributes: [
            "id",
            "vehicleName",
            "category",
            "from",
            "via",
            "to",
            "vehicleNumber",
            "trash",
          ],
          include: [
            { model: Place, as: "fromPlace", attributes: ["id", "name"] },
            { model: Place, as: "toPlace", attributes: ["id", "name"] },
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
        totalPages: download === "true" ? null : totalPages,
        currentPage: download === "true" ? null : page,
        data: vehicleSchedules,
      });
    } catch (error) {
      console.error(error);
      logger.error("error in getVehicleSchedules", error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
  getVehicleScheduleById: async (req, res) => {
    try {
      const { id } = req.params;
      const vehicleSchedule = await VehicleSchedule.findOne({
        where: { id },
        include: [
          { model: Place, as: "fromPlace", attributes: ["id", "name"] },
          { model: Place, as: "toPlace", attributes: ["id", "name"] },
        ],
      });

      if (!vehicleSchedule) {
        return res
          .status(404)
          .json({ success: false, message: "Vehicle Schedule not found" });
      }
      return res.status(200).json({ success: true, data: vehicleSchedule });
    } catch (error) {
      console.error(error);
      logger.error("error in getVehicleScheduleById", error);
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
      logger.error("error in addVehicleServiceProvider", error);
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
      logger.error("error in updateVehicleServiceProvider", error);
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
      logger.error(error);
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
      logger.error("error in restoreVehicleServiceProvider", error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
  getVehicleServiceProviders: async (req, res) => {
    const search = req.query.search || "";
    const area_id = req.query.area_id || null;
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
          distinct: true,
          where: whereCondition,
          attributes: [
            "id",
            "ownerName",
            "priority",
            "image",
            "icon",
            "minFee",
            "vehicleNumber",
            "trash",
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
        totalPages: download === "true" ? null : totalPages,
        currentPage: download === "true" ? null : page,
        data: vehicleServices,
      });
    } catch (error) {
      console.error(error);
      logger.error("error in getVehicleServiceProviders", error);
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
      logger.error("error in getVehicleServiceProviderById", error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  addPlace: async (req, res) => {
    try {
      const { name } = req.body;
      const existingPlace = await Place.findOne({ where: { name } });
      if (existingPlace) {
        return res
          .status(409)
          .json({ success: false, message: "Place already exists" });
      }
      const savedPlaces = await Place.create({ name });
      res.status(201).json({ success: true, savedPlaces });
    } catch (error) {
      console.error(error);
      logger.error("error in addPlaces", error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
  updatePlace: async (req, res) => {
    try {
      const { id } = req.params;
      const { name } = req.body;
      const place = await Place.findByPk(id);

      if (!place) {
        return res
          .status(404)
          .json({ success: false, message: "Place not found" });
      }
      const existingPlace = await Place.findOne({
        where: { name, id: { [Op.ne]: id } },
      });
      if (existingPlace) {
        return res
          .status(409)
          .json({ success: false, message: "Place already exists" });
      }
      const savedPlaces = await Place.update({ name }, { where: { id } });
      res.status(201).json({ success: true, savedPlaces });
    } catch (error) {
      console.error(error);
      logger.error("error in updatePlace", error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
  getPlaces: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 5;
      const offset = (page - 1) * limit;
      const search = req.query.search || "";
      let whereCondition = {};
      if (search) {
        whereCondition = {
          name: { [Op.like]: `%${search}%` },
        };
      }

      const { rows: places, count } = await Place.findAndCountAll({
        where: whereCondition,
        limit,
        offset,
        order: [["createdAt", "DESC"]],
      });
      res.status(200).json({
        success: true,
        totalContents: count,
        totalPage: Math.ceil(count / limit),
        currentPage: page,
        places,
      });
    } catch (error) {
      console.error(error);
      logger.error("error in getPlaces", error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
  getPlaceById: async (req, res) => {
    try {
      const { id } = req.params;
      const place = await Place.findByPk(id);
      if (!place) {
        return res
          .status(404)
          .json({ success: false, message: "Place not found" });
      }
      res.status(200).json({ success: true, place });
    } catch (error) {
      console.error(error);
      logger.error("error in getPlaceById", error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
  deletePlace: async (req, res) => {
    try {
      const { id } = req.params;
      const place = await Place.findByPk(id);
      if (!place) {
        return res
          .status(404)
          .json({ success: false, message: "Place not found" });
      }
      await place.update({ trash: true });
      res.status(200).json({ success: true, message: "Place deleted" });
    } catch (error) {
      console.error(error);
      logger.error("error in deletePlace", error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
  restorePlace: async (req, res) => {
    try {
      const { id } = req.params;
      const place = await Place.findByPk(id);
      if (!place) {
        return res
          .status(404)
          .json({ success: false, message: "Place not found" });
      }
      await place.update({ trash: false });
      res.status(200).json({ success: true, message: "Place restored" });
    } catch (error) {
      console.error(error);
      logger.error("error in restorePlace", error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
};
