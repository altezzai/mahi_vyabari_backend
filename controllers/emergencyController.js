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
      const emergencyData = {
        ...req.body,
        icon: req.file ? req.file.filename : null,
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
        message: "Internal Server Error",
      });
    }
  },
  updateEmergency: async (req, res) => {
    try {
      const { id } = req.params;
      const { itemName, phone, description } = req.body;
      const emergency = await Emergency.findByPk(id);
      if (!emergency) {
        return res
          .status(404)
          .json({ success: false, message: "Emergency record not found" });
      }
      let newFile = emergency.icon;
      if (req.file) {
        if (emergency.icon) {
          const oldFilePath = path.join(uploadPath, emergency.icon);
          if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
          }
        }
        newFile = req.file.filename
      }
      await emergency.update({
        title: itemName || emergency.itemName,
        description: description || emergency.description,
        phone: phone || emergency.phone,
        icon: newFile,
      });
      return res.status(200).json({
        success: true,
        data: emergency,
      });
    } catch (error) {
      // await deletefilewithfoldername(uploadPath, req.file.filename);
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
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
        message: "Internal Server Error",
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
        attributes: ["id", "emergencyName", "phone", "trash"],
        order: [["createdAt", "DESC"]],
      });
      if (!emergencies) {
        return res
          .status(404)
          .json({ success: false, message: "Emergency record not found" });
      }
      return res.status(200).json({ success: true, data: emergencies });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
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
      return res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  },
};
