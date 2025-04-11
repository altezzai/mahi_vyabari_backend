const multer = require("multer");
const fs = require("fs");
const path = require("path");
const Emergency = require("../models/Emergency");
const { deletefilewithfoldername } = require("../utils/util");
const { Op } = require("sequelize");

const uploadPath = path.join(__dirname, "../public/uploads/emergency");
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
  addEmergency: async (req, res) => {
    try {
      // if(!itemName||!phone||!description){
      //   return res.status(400).json({ message: "Please fill in all fields" });
      // }
      // if (!req.file) {
      //   return res.status(400).json({ message: "category icon is required" });
      // }

      const emergencyData = {
        ...req.body,
        icon: req.file ? req.file.filename : null,
      };

      const savedEmergency = await Emergency.create(emergencyData);
      if (!savedEmergency) {
        // await deletefilewithfoldername(uploadPath,req.file.filename);
        res.status(404).json({
          status: "FAILED",
          message: "Can't upload Emergency Data",
        });
      }
      res.status(200).json({
        status: "SUCCESS",
        data: savedEmergency,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        status: "FAILED",
        message: "An error occure while uploading Category data",
        error: error,
      });
    }
  },
  updateEmergency: async (req, res) => {
    try {
      const { id } = req.params; // Get emergency ID from URL
      const { itemName, phone, description } = req.body; // Extract data from request body

      // Find the existing emergency record
      const emergency = await Emergency.findByPk(id);
      if (!emergency) {
        return res
          .status(404)
          .json({ success: false, message: "Emergency record not found" });
      }

      // Handle file update
      let newFile = req.file ? req.file.filename : emergency.icon;

      if (req.file) {
        if (emergency.icon) {
          const oldFilePath = path.join(uploadPath, emergency.icon);

          // Check if the old file exists and delete it
          if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
          }
        }
      }

      // Update emergency details
      await emergency.update({
        title: itemName || emergency.itemName,
        description: description || emergency.description,
        phone: phone || emergency.phone,
        icon: newFile, // Update file field
      });

      return res.status(200).json({
        success: true,
        message: "Emergency details updated successfully",
        data: emergency,
      });
    } catch (error) {
      // await deletefilewithfoldername(uploadPath, req.file.filename);
      console.error("Error updating emergency details:", error);
      return res.status(500).json({
        success: false,
        message: "Error updating emergency details",
        error,
      });
    }
  },
  deleteEmergency: async (req, res) => {
    try {
      const { id } = req.params; // Get emergency ID from request params

      // Find the emergency record
      const emergency = await Emergency.findByPk(id);
      if (!emergency) {
        return res
          .status(404)
          .json({ success: false, message: "Emergency record not found" });
      }

      // Perform soft delete by updating the trash field to true
      await emergency.update({ trash: true });

      return res.status(200).json({
        success: true,
        message: "Emergency record moved to trash successfully",
        emergency,
      });
    } catch (error) {
      console.error("Error soft deleting emergency:", error);
      return res.status(500).json({
        success: false,
        message: "Error soft deleting emergency",
        error,
      });
    }
  },
  restoreEmergency: async (req, res) => {
    try {
      const { id } = req.params; // Get emergency ID from request params

      // Find the emergency record
      const emergency = await Emergency.findByPk(id);
      if (!emergency) {
        return res
          .status(404)
          .json({ success: false, message: "Emergency record not found" });
      }

      // Perform soft delete by updating the trash field to true
      await emergency.update({ trash: false });

      return res.status(200).json({
        success: true,
        message: "Emergency record moved to trash successfully",
        emergency,
      });
    } catch (error) {
      console.error("Error soft deleting emergency:", error);
      return res.status(500).json({
        success: false,
        message: "Error soft deleting emergency",
        error,
      });
    }
  },
  getEmergency: async (req, res) => {
    const search = req.query.search || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const whereCondition = {};
    if (search) {
      whereCondition = {
        [Op.or]: [{ emergencyName: { [Op.like]: `%${search}%` } }],
      };
    }
    try {
      const emergencies = await Emergency.findAndCountAll({
        limit,
        offset,
        where: whereCondition,
        attributes:["id","emergencyName","phone","trash"],
        order: [["createdAt", "DESC"]],
      }); // Fetch all records
      if (!emergencies) {
        return res
          .status(404)
          .json({ success: false, message: "Emergency record not found" });
      }
      return res.status(200).json({ success: true, data: emergencies });
    } catch (error) {
      console.error("Error fetching emergencies:", error);
      return res
        .status(500)
        .json({ success: false, message: "Error fetching emergencies", error });
    }
  },
  getEmergencyById: async (req, res) => {
    try {
      const { id } = req.params; // Get emergency ID from request params

      const emergency = await Emergency.findByPk(id);
      if (!emergency) {
        return res
          .status(404)
          .json({ success: false, message: "Emergency record not found" });
      }

      return res.status(200).json({ success: true, data: emergency });
    } catch (error) {
      console.error("Error fetching emergency by ID:", error);
      return res
        .status(500)
        .json({ success: false, message: "Error fetching emergency", error });
    }
  },
};
