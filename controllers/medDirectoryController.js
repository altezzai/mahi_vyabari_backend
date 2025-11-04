require("../config/database");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const Medical = require("../models/MedDirectory");
const { deleteFileWithFolderName } = require("../utils/deleteFile");
const { Op } = require("sequelize");
const Category = require("../models/Category");
const Type = require("../models/Type");

const uploadPath = path.join(__dirname, "../public/uploads/Medical");
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
  addMedicalDirectory: async (req, res) => {
    try {
      const medDirectoryData = {
        ...req.body,
        image: req.files?.image?.[0]?.filename || null,
        icon: req.files?.icon?.[0]?.filename || null,
      };
      const savedMedicalDirectory = await Medical.create(medDirectoryData);
      res.status(201).json({
        success: true,
        result: savedMedicalDirectory,
      });
    } catch (error) {
      await deleteFileWithFolderName(
        uploadPath,
        req.files?.image?.[0]?.filename
      );
      await deleteFileWithFolderName(
        uploadPath,
        req.files?.icon?.[0]?.filename
      );
      console.log(error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
  updateMedicalDirectory: async (req, res) => {
    const {
      category,
      name,
      phone,
      subCategory,
      whatsapp,
      website,
      location,
      description,
      address,
      openingTime,
      closingTime,
      workingDays,
      priority,
      area,
    } = req.body;
    try {
      const { id } = req.params;
      const healthcareProvider = await Medical.findByPk(id);
      if (!healthcareProvider) {
        return res
          .status(404)
          .json({ success: false, message: "Healthcare Provider not found" });
      }
      let newImage = healthcareProvider.image;
      let newIcon = healthcareProvider.icon;
      if (req.files?.image?.[0]) {
        if (healthcareProvider.image) {
          const oldImagePath = path.join(uploadPath, healthcareProvider.image);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
        newImage = req.files.image[0].filename;
      }
      if (req.files?.icon?.[0]) {
        if (healthcareProvider.icon) {
          const oldIconPath = path.join(uploadPath, healthcareProvider.icon);
          if (fs.existsSync(oldIconPath)) {
            fs.unlinkSync(oldIconPath);
          }
        }
        newIcon = req.files.icon[0].filename;
      }
      await healthcareProvider.update({
        image: newImage,
        icon: newIcon,
        category: category || healthcareProvider.category,
        name: name || healthcareProvider.name,
        phone: phone || healthcareProvider.phone,
        subCategory: subCategory || healthcareProvider.subCategory,
        whatsapp: whatsapp || healthcareProvider.whatsapp,
        website: website || healthcareProvider.website,
        location: location || healthcareProvider.location,
        description: description || healthcareProvider.description,
        address: address || healthcareProvider.address,
        openingTime: openingTime || healthcareProvider.openingTime,
        closingTime: closingTime || healthcareProvider.closingTime,
        workingDays: workingDays || healthcareProvider.workingDays,
        priority: priority || healthcareProvider.priority,
        area: area || healthcareProvider.area,
      });
      return res.status(200).json({
        success: true,
        data: healthcareProvider,
      });
    } catch (error) {
      await deleteFileWithFolderName(
        uploadPath,
        req.files?.image?.[0]?.filename
      );
      await deleteFileWithFolderName(
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
  deleteMedicalDirectory: async (req, res) => {
    try {
      const { id } = req.params;
      const healthcareProvider = await Medical.findByPk(id);
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
      const healthcareProvider = await Medical.findByPk(id);
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
    try {
      const { count, rows: medical } = await Medical.findAndCountAll({
        limit,
        offset,
        attributes: ["id", "name", "priority", "category", "trash"],
        where: whereCondition,
        order: [["createdAt", "DESC"]],
      });
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
      const healthcareProvider = await Medical.findByPk(id, {
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
