require("../config/database");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const VehicleSchedule = require("../models/VehicleSchedule");
const VehicleService = require("../models/VehicleService");
const { deletefilewithfoldername } = require("../utils/util");
const { Op } = require("sequelize");
const Type = require("../models/Type");
const Category = require("../models/Category");

const uploadPath = path.join(__dirname, "../public/uploads/Vehicle");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueSuffix);
  },
});

const upload = multer({ storage });

module.exports = {
  upload,
  createVehicleSchedule: async (req, res) => {
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
    const whereCondition = {};
    if (search) {
      whereCondition = {
        vehicleName: { [Op.like]: `%${search}%` },
      };
    }
    try {
      const vehicleSchedules = await VehicleSchedule.findAndCountAll({
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
      return res.status(200).json({ success: true, data: vehicleSchedules });
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
  CreateVehicleServiceProvider: async (req, res) => {
    try {
      const vehicleServiceData = {
        ...req.body,
        image: req.files?.image?.[0]?.filename || null,
        icon: req.files?.icon?.[0]?.filename || null,
      };
      const savedService = await VehicleService.create(vehicleServiceData);
      res.status(201).json({
        success: true,
        result: savedService,
      });
    } catch (error) {
      deletefilewithfoldername(uploadPath, req.files?.image?.[0]?.filename);
      deletefilewithfoldername(uploadPath, req.files?.icon?.[0]?.filename);
      console.log(error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
  updateVehicleServiceProvider: async (req, res) => {
    const {
      selectCategory,
      minFee,
      vehicleNumber,
      priority,
      phone,
      whatsapp,
      description,
      area,
      address,
    } = req.body;
    try {
      const { id } = req.params;
      const vehicleService = await VehicleService.findByPk(id);
      if (!vehicleService) {
        await deletefilewithfoldername(
          uploadPath,
          req.files?.image?.[0]?.filename
        );
        await deletefilewithfoldername(
          uploadPath,
          req.files?.icon?.[0]?.filename
        );
        return res
          .status(404)
          .json({ success: false, message: "Vehicle Service not found" });
      }
      let newImage = vehicleService.image;
      let newIcon = vehicleService.icon;
      if (req.files?.image) {
        if (vehicleService.image) {
          const oldImagePath = path.join(uploadPath, vehicleService.image);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
        newImage = req.files.image[0].filename;
      }
      if (req.files?.icon) {
        if (vehicleService.icon) {
          const oldIconPath = path.join(uploadPath, vehicleService.icon);
          if (fs.existsSync(oldIconPath)) {
            fs.unlinkSync(oldIconPath);
          }
        }
        newIcon = req.files.icon[0].filename;
      }
      await vehicleService.update({
        selectCategory,
        minFee,
        vehicleNumber,
        priority,
        phone,
        whatsapp,
        description,
        area,
        address,
        image: newImage,
        icon: newIcon,
      });
      return res.status(200).json({
        success: true,
        data: vehicleService,
      });
    } catch (error) {
      await deletefilewithfoldername(
        uploadPath,
        req.files?.image?.[0]?.filename
      );
      await deletefilewithfoldername(
        uploadPath,
        req.files?.icon?.[0]?.filename
      );
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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const whereCondition = {};
    if (search) {
      whereCondition = {
        [Op.or]: [{ ownerName: { [Op.like]: `%${search}%` } }],
      };
    }
    try {
      const vehicleServices = await VehicleService.findAndCountAll({
        limit,
        offset,
        where: whereCondition,
        attributes: ["id", "ownerName", "category", "priority", "trash"],
        order: [["createdAt", "DESC"]],
      });
      if (!vehicleServices) {
        return res
          .status(404)
          .json({ success: false, message: "Vehicle Service not found" });
      }
      return res.status(200).json({
        success: true,
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
      const vehicleService = await VehicleService.findByPk(id,{
        include:[
          {
            model:Category,
            attributes:["id","categoryName"],
            as:"taxiCategory"
          }
        ]
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
