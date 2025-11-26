require("../config/database");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { Op } = require("sequelize");
const { Category, Type, HealthcareProvider, Area } = require("../models");
const {
  deleteFileWithFolderName,
  compressAndSaveFile,
} = require("../utils/fileHandler");

const iconPath = "public/uploads/healthcareProvider/icon/";
const imgPath = "public/uploads/healthcareProvider/";
module.exports = {
  addMedicalDirectory: async (req, res) => {
    try {
      let image = null;
      let icon = null;

      if (req.files?.icon) {
        icon = await compressAndSaveFile(req.files.icon[0], iconPath);
      }
      if (req.files?.image) {
        image = await compressAndSaveFile(req.files.image[0], imgPath);
      }

      const medicalDirectoryData = {
        ...req.body,
        image: image || null,
        icon: icon || null,
      };

      const savedMedicalDirectory = await HealthcareProvider.create(
        medicalDirectoryData
      );
      res.status(201).json({
        success: true,
        result: savedMedicalDirectory,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
  updateMedicalDirectory: async (req, res) => {
    try {
      const { id } = req.params;
      const healthcareProvider = await HealthcareProvider.findByPk(id);
      if (!healthcareProvider) {
        return res
          .status(404)
          .json({ success: false, message: "Healthcare Provider not found" });
      }

      let icon = healthcareProvider.icon;
      let image = healthcareProvider.image;
      if (req.files?.icon) {
        const oldFilename = healthcareProvider.icon;
        icon = await compressAndSaveFile(req.files.icon[0], iconPath);
        if (oldFilename) {
          await deleteFileWithFolderName(iconPath, oldFilename);
        }
      }
      if (req.files?.image) {
        const oldFilename = healthcareProvider.image;
        image = await compressAndSaveFile(req.files.image[0], imgPath);
        if (oldFilename) {
          await deleteFileWithFolderName(imgPath, oldFilename);
        }
      }
      const { categories, ...updateBody } = req.body;
      const updatedHealthCareProvider = await healthcareProvider.update({
        ...updateBody,
        image: image || null,
        icon: icon || null,
      });
      return res.status(200).json({
        success: true,
        data: updatedHealthCareProvider,
      });
    } catch (error) {
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
      const healthcareProvider = await HealthcareProvider.findByPk(id);
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
      const healthcareProvider = await HealthcareProvider.findByPk(id);
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
    const subCategory = req.query.subCategory || null;
    let whereCondition = {};
    if (search) {
      whereCondition = {
        [Op.or]: [
          { name: { [Op.like]: `%${search}%` } },
          { category: { [Op.like]: `%${search}%` } },
        ],
      };
    }
    if (area_id) {
      whereCondition.area_id = area_id;
    }
    if (category) {
      whereCondition.category = category;
    }
    if (subCategory) {
      whereCondition.subCategory = subCategory;
    }
    try {
      const { count, rows: medical } = await HealthcareProvider.findAndCountAll(
        {
          limit,
          offset,
          attributes: [
            "id",
            "name",
            "priority",
            "category",
            "subCategory",
            "image",
            "icon",
            "trash",
          ],
          where: whereCondition,
          include: [
            {
              model: Category,
              attributes: ["id", "categoryName"],
              as: "categoryInfo",
            },
            {
              model: Area,
              attributes: ["id", "name"],
            },
          ],
          order: [["createdAt", "DESC"]],
        }
      );
      const totalPages = Math.ceil(count / limit);
      return res.status(200).json({
        success: true,
        count,
        totalPages: download === "true" ? null : totalPages,
        currentPage: download === "true" ? null : page,
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
      const healthcareProvider = await HealthcareProvider.findByPk(id, {
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
          where: { trash: false },
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
