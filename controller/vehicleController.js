require("../config/database");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const VehicleSchedule = require("../models/VehicleSchedule");
const VehicleService = require("../models/VehicleService");
const { deletefilewithfoldername } = require("../utils/util");

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
    // console.log(req.body);
    // const {
    //   userId,
    //   category,
    //   vehicleName,
    //   vehicleNumber,
    //   via,
    //   to,
    //   departureTime,
    //   arrivalTime,
    // } = req.body;
    try {
      // if(!category||!vehicleName||!vehicleNumber||!via||!to||!departureTime||!arrivalTime){
      //   return res.status(400).json({ message: "Please fill all fields" });
      // }
      const savedSchedule = await VehicleSchedule.create(req.body);
      if (!savedSchedule) {
        res.status(404).json({
          status: "FAILED",
          message: "Can't upload vehicle Schedule Data",
        });
      }
      res.status(201).json({
        status: "success",
        result: savedSchedule,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        status: "FAILED",
        message: "An error occure while uploading Vehicle Schedule",
        error: error,
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

      // Find the existing record
      let vehicleSchedule = await VehicleSchedule.findByPk(id);

      if (!vehicleSchedule) {
        return res
          .status(404)
          .json({ success: false, message: "Vehicle Schedule not found" });
      }

      // Check if vehicle number is being updated and ensure it's unique
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

      // Update the vehicle schedule data
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
        message: "Vehicle Schedule updated successfully",
        data: vehicleSchedule,
      });
    } catch (error) {
      console.error("Error updating vehicle schedule:", error);
      return res.status(500).json({
        success: false,
        message: "Error updating vehicle schedule",
        error,
      });
    }
  },
  deleteVehicleSchedule: async (req, res) => {
    try {
      const { id } = req.params;

      // Find the existing record
      let vehicleSchedule = await VehicleSchedule.findByPk(id);

      if (!vehicleSchedule) {
        return res
          .status(404)
          .json({ success: false, message: "Vehicle Schedule not found" });
      }

      // Perform soft delete (set trash to true)
      await vehicleSchedule.update({ trash: true });

      return res.status(200).json({
        success: true,
        message: "Vehicle Schedule moved to trash successfully",
        vehicleSchedule,
      });
    } catch (error) {
      console.error("Error deleting vehicle schedule:", error);
      return res.status(500).json({
        success: false,
        message: "Error deleting vehicle schedule",
        error,
      });
    }
  },
  restoreVehicleSchedule: async (req, res) => {
    try {
      const { id } = req.params;

      // Find the existing record
      let vehicleSchedule = await VehicleSchedule.findByPk(id);

      if (!vehicleSchedule) {
        return res
          .status(404)
          .json({ success: false, message: "Vehicle Schedule not found" });
      }

      // Perform soft delete (set trash to true)
      await vehicleSchedule.update({ trash: false });

      return res.status(200).json({
        success: true,
        message: "Vehicle Schedule moved to trash successfully",
        vehicleSchedule,
      });
    } catch (error) {
      console.error("Error deleting vehicle schedule:", error);
      return res.status(500).json({
        success: false,
        message: "Error deleting vehicle schedule",
        error,
      });
    }
  },
  getVehicleSchedules: async (req, res) => {
    try {
      const vehicleSchedules = await VehicleSchedule.findAll();
      if (!vehicleSchedules.length) {
        return res
          .status(404)
          .json({ success: false, message: "Vehicle Schedule not found" });
      }
      return res.status(200).json({ success: true, data: vehicleSchedules });
    } catch (error) {
      console.error("Error fetching vehicle schedules:", error);
      return res.status(500).json({
        success: false,
        message: "Error fetching vehicle schedules",
        error,
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
      console.error("Error fetching vehicle schedule by ID:", error);
      return res.status(500).json({
        success: false,
        message: "Error fetching vehicle schedule",
        error,
      });
    }
  },
  CreateVehicleServiceProvider: async (req, res) => {
    try {
      // if (!req.files.image || !req.files.icon) {
      //   return res
      //     .status(400)
      //     .json({ message: "Both shopImage and shopIconImage are required" });
      // }

      const vehicleServiceData = {
        ...req.body,
        image: req.files?.image?.[0]?.filename || null,
        icon: req.files?.icon?.[0]?.filename || null,
      };

      const savedService = await VehicleService.create(vehicleServiceData);
      res.status(201).json({
        status: "success",
        result: savedService,
      });
    } catch (error) {
      // deletefilewithfoldername(uploadPath, req.files.image[0].filename);
      // deletefilewithfoldername(uploadPath, req.files.icon[0].filename);
      console.log(error);
      res.status(401).json({
        status: "FAILED",
        message: "An error occured while uploading new vehicle service data",
      });
    }
  },
  updateVehicleServiceProvider: async (req, res) => {
    try {
      const { id } = req.params;
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

      // Check if vehicle service exists
      const vehicleService = await VehicleService.findByPk(id);
      if (!vehicleService) {
        // await deletefilewithfoldername(uploadPath, req.files.image[0].filename);
        // await deletefilewithfoldername(uploadPath, req.files.icon[0].filename);
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
            fs.unlinkSync(oldImagePath); // Delete old image
          }
        }
        newImage = req.files.image[0].filename; // Assign new image
      }

      if (req.files?.icon) {
        if (vehicleService.icon) {
          const oldIconPath = path.join(uploadPath, vehicleService.icon);
          if (fs.existsSync(oldIconPath)) {
            fs.unlinkSync(oldIconPath); // Delete old icon
          }
        }
        newIcon = req.files.icon[0].filename; // Assign new icon
      }

      // Update Vehicle Service Data
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
        message: "Vehicle Service updated successfully",
        data: vehicleService,
      });
    } catch (error) {
      // await deletefilewithfoldername(uploadPath, req.files.image[0].filename);
      // await deletefilewithfoldername(uploadPath, req.files.icon[0].filename);
      console.error("Error updating vehicle service:", error);
      return res.status(500).json({
        success: false,
        message: "Error updating vehicle service",
        error,
      });
    }
  },
  deleteVehicleServiceProvider: async (req, res) => {
    try {
      const { id } = req.params;

      // Find the vehicle service by ID
      const vehicleService = await VehicleService.findByPk(id);
      if (!vehicleService) {
        return res
          .status(404)
          .json({ success: false, message: "Vehicle Service not found" });
      }

      // Soft delete by updating the trash field to true
      await vehicleService.update({ trash: true });

      return res.status(200).json({
        success: true,
        message: "Vehicle Service deleted successfully",
        vehicleService,
      });
    } catch (error) {
      console.error("Error deleting vehicle service:", error);
      return res.status(500).json({
        success: false,
        message: "Error deleting vehicle service",
        error,
      });
    }
  },
  restoreVehicleServiceProvider: async (req, res) => {
    try {
      const { id } = req.params;

      // Find the vehicle service by ID
      const vehicleService = await VehicleService.findByPk(id);
      if (!vehicleService) {
        return res
          .status(404)
          .json({ success: false, message: "Vehicle Service not found" });
      }

      // Soft delete by updating the trash field to true
      await vehicleService.update({ trash: false });

      return res.status(200).json({
        success: true,
        message: "Vehicle Service restored successfully",
        vehicleService,
      });
    } catch (error) {
      console.error("Error restoring vehicle service:", error);
      return res.status(500).json({
        success: false,
        message: "Error restoring vehicle service",
        error,
      });
    }
  },
  getVehicleServiceProviders: async (req, res) => {
    try {
      const vehicleServices = await VehicleService.findAll();
      if (!vehicleServices.length) {
        return res
          .status(404)
          .json({ success: false, message: "Vehicle Service not found" });
      }
      return res.status(200).json({
        success: true,
        data: vehicleServices,
      });
    } catch (error) {
      console.error("Error fetching vehicle services:", error);
      return res.status(500).json({
        success: false,
        message: "Error fetching vehicle services",
        error,
      });
    }
  },
  getVehicleServiceProviderById: async (req, res) => {
    try {
      const { id } = req.params;

      const vehicleService = await VehicleService.findByPk(id);
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
      console.error("Error fetching vehicle service by ID:", error);
      return res.status(500).json({
        success: false,
        message: "Error fetching vehicle service",
        error,
      });
    }
  },
};
