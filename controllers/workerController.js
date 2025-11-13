require("../config/database");
const path = require("path");
// const Worker = require("../models/Worker");
// const WorkerCategory = require("../models/WorkerCategory");
const { Op, where, col, Transaction } = require("sequelize");
// const Type = require("../models/Type");
// const Category = require("../models/Category");
const { Type, Category, Worker, WorkerCategory } = require("../models");
const sequelize = require("../config/database");
const {
  cleanupFiles,
  deleteFileWithFolderName,
  processImageFields,
} = require("../utils/fileHandler");

const UPLOAD_SUBFOLDER = "workers";
const UPLOAD_PATH = process.env.UPLOAD_PATH;
const workerProcessingConfig = {
  image: { width: 1024 },
  icon: { width: 150 },
};
module.exports = {
  addWorkerProfile: async (req, res) => {
    let processedFiles;
    const t = await sequelize.transaction();
    try {
      processedFiles = await processImageFields(
        req.files,
        workerProcessingConfig,
        UPLOAD_SUBFOLDER
      );
      const workerData = {
        ...req.body,
        image: processedFiles.image[0].filename || null,
        icon: processedFiles.icon[0].filename || null,
      };
      const newWorker = await Worker.create(workerData, { transaction: t });
      if (newWorker.categories && newWorker.categories.length > 0) {
        await newWorker.setCategories(newWorker.categories, { transaction: t });
      }
      await t.commit();
      res.status(201).json({
        success: true,
        result: newWorker,
      });
    } catch (error) {
      await t.rollback();
      await cleanupFiles(processedFiles, UPLOAD_SUBFOLDER);
      console.log(error);
      res.status(401).json({
        success: false,
        message: error.message,
      });
    }
  },
  updateWorkerProfile: async (req, res) => {
    let processedFiles;
    const t = await sequelize.transaction();
    try {
      const { id } = req.params;
      const worker = await Worker.findByPk(id);
      if (!worker) {
        return res
          .status(404)
          .json({ success: false, message: "Worker profile not found" });
      }
      processedFiles = await processImageFields(
        req.files,
        workerProcessingConfig,
        UPLOAD_SUBFOLDER
      );
      const { categories, ...bodyData } = req.body;
      if (processedFiles.image && worker.image) {
        const oldFilename = path.basename(worker.image);
        const oldFilePath = path.join(UPLOAD_PATH, UPLOAD_SUBFOLDER);
        await deleteFileWithFolderName(oldFilePath, oldFilename);
      }
      if (processedFiles.icon && worker.icon) {
        const oldFilename = path.basename(worker.icon);
        const oldFilePath = path.join(UPLOAD_PATH, UPLOAD_SUBFOLDER);
        await deleteFileWithFolderName(oldFilePath, oldFilename);
      }
      for (const key in bodyData) {
        if (bodyData[key] !== null && bodyData[key] !== undefined) {
          worker[key] = bodyData[key];
        }
      }
      if (categories) {
        worker.categories = categories;
      }
      if (processedFiles.image) {
        worker.image = processedFiles.image[0].filename;
      }
      if (processedFiles.icon) {
        worker.icon = processedFiles.icon[0].filename;
      }
      const updatedWorker = await worker.save();
      if (categories) {
        updatedWorker.setCategories(categories, { Transaction: t });
      }
      const finalWorker = await Worker.findByPk(updatedWorker.id, {
        include: Category,
        transaction: t,
      });
      await t.commit();
      return res.status(200).json({
        success: true,
        data: finalWorker,
      });
    } catch (error) {
      await t.rollback();
      await cleanupFiles(processedFiles, UPLOAD_SUBFOLDER);
      console.error(error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
  deleteWorkerProfile: async (req, res) => {
    try {
      const { id } = req.params;
      const worker = await Worker.findByPk(id);
      if (!worker) {
        return res
          .status(404)
          .json({ success: false, message: "Worker profile not found" });
      }
      await worker.update({ trash: true });
      return res.status(200).json({
        success: true,
        worker,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
  restoreWorkerProfile: async (req, res) => {
    try {
      const { id } = req.params;
      const worker = await Worker.findByPk(id);
      if (!worker) {
        return res
          .status(404)
          .json({ success: false, message: "Worker profile not found" });
      }
      await worker.update({ trash: false });
      return res.status(200).json({
        success: true,
        worker,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
  getWorkerProfiles: async (req, res) => {
    const search = req.query.search || "";
    const area = req.query.area || null;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    let whereCondition = {};
    if (search) {
      whereCondition = {
        [Op.or]: [{ workerName: { [Op.like]: `%${search}%` } }],
      };
    }
    try {
      const { count, rows: workers } = await Worker.findAndCountAll({
        limit,
        offset,
        where: whereCondition,
        attributes: ["id", "workerName", "priority", "trash", "createdAt"],
        include: [
          {
            model: Category,
            attributes: ["id", "categoryName"],
            through: { attributes: [] },
          },
        ],
        order: [["createdAt", "DESC"]],
      });
      if (!workers) {
        return res
          .status(404)
          .json({ success: false, message: "Worker profile not found" });
      }
      const totalPages = Math.ceil(count / limit);
      return res.status(200).json({
        success: true,
        count,
        totalPages,
        currentPage: page,
        data: workers,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
  getWorkerProfileById: async (req, res) => {
    try {
      const { id } = req.params;
      const worker = await Worker.findByPk(id);
      if (!worker) {
        return res
          .status(404)
          .json({ success: false, message: "Worker profile not found" });
      }
      return res.status(200).json({ success: true, data: worker });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
  getWorkerCategory: async (req, res) => {
    try {
      const workerCategory = await Type.findOne({
        where: {
          typeName: "worker",
        },
        attributes: [],
        include: {
          model: Category,
          attributes: ["id", "categoryName"],
          as: "category",
        },
      });
      return res.status(200).json({ success: true, data: workerCategory });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },
};
