require("../config/database");
const path = require("path");
// const Worker = require("../models/Worker");
// const WorkerCategory = require("../models/WorkerCategory");
const { Op, where, col, Transaction } = require("sequelize");
// const Type = require("../models/Type");
// const Category = require("../models/Category");
const { Type, Category, Worker, WorkerCategory, Area } = require("../models");
const sequelize = require("../config/database");
const {
  deleteFileWithFolderName,
  compressAndSaveFile,
} = require("../utils/fileHandler");

const iconPath = "uploads/workers/icon/";
const imgPath = "uploads/workers/";
module.exports = {
  addWorkerProfile: async (req, res) => {
    const t = await sequelize.transaction();

    try {
      let image = null;
      let icon = null;

      if (req.files?.icon) {
        icon = await compressAndSaveFile(req.files.icon[0], iconPath);
      }
      if (req.files?.image) {
        image = await compressAndSaveFile(req.files.image[0], imgPath);
      }
      const { categories, ...data } = req.body;
      const workerData = {
        ...data,
        image: image || null,
        icon: icon || null,
      };

      const newWorker = await Worker.create(workerData, { transaction: t });
      let categoryList = [];
      if (Array.isArray(req.body.categories)) {
        categoryList = req.body.categories.map((c) => parseInt(c));
      }
      if (categoryList.length > 0) {
        const workerCategoryData = categoryList.map((category_id) => ({
          workerId: newWorker.id,
          categoryId: category_id,
        }));
        await WorkerCategory.bulkCreate(workerCategoryData, { transaction: t });
      }
      await t.commit();
      res.status(201).json({
        success: true,
        result: newWorker,
      });
    } catch (error) {
      await t.rollback();
      res.status(401).json({
        success: false,
        message: error.message,
      });
    }
  },
  updateWorkerProfile: async (req, res) => {
    const t = await sequelize.transaction();
    try {
      const { id } = req.params;
      const workerId = id;
      const worker = await Worker.findByPk(id);
      if (!worker) {
        return res
          .status(404)
          .json({ success: false, message: "Worker profile not found" });
      }
      let icon = worker.icon;
      let image = worker.image;
      if (req.files?.icon) {
        const oldFilename = worker.icon;
        icon = await compressAndSaveFile(req.files.icon[0], iconPath);
        if (oldFilename) {
          await deleteFileWithFolderName(iconPath, oldFilename);
        }
      }
      if (req.files?.image) {
        const oldFilename = worker.image;
        image = await compressAndSaveFile(req.files.image[0], imgPath);
        if (oldFilename) {
          await deleteFileWithFolderName(imgPath, oldFilename);
        }
      }
      const { categories, ...bodyData } = req.body;
      const updatedWorker = await worker.update(
        { ...bodyData, icon, image },
        { transaction: t }
      );
      let categoryList = [];

      if (Array.isArray(categories)) {
        categoryList = categories.map((c) => Number(c));
      }

      if (categoryList.length > 0) {
        const existingCategories = await WorkerCategory.findAll({
          where: {
            workerId: workerId,
          },
          transaction: t,
        });

        const existingIds = existingCategories.map((c) => c.categoryId);
        const newIds = categoryList;

        const toAdd = newIds.filter((id) => !existingIds.includes(id));
        const toRemove = existingIds.filter((id) => !newIds.includes(id));

        if (toAdd.length > 0) {
          const insertData = toAdd.map((id) => ({
            workerId: workerId,
            categoryId: id,
          }));
          await WorkerCategory.bulkCreate(insertData, { transaction: t });
        }

        if (toRemove.length > 0) {
          await WorkerCategory.destroy({
            where: { workerId: workerId, categoryId: toRemove },
            transaction: t,
          });
        }
      }
      const finalWorker = await Worker.findByPk(updatedWorker.id);

      await t.commit();
      return res.status(200).json({
        success: true,
        data: finalWorker,
      });
    } catch (error) {
      await t.rollback();
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
    const area_id = req.query.area_id || null;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    let whereCondition = {};
    if (search) {
      whereCondition = {
        [Op.or]: [{ workerName: { [Op.like]: `%${search}%` } }],
      };
    }
    if (area_id) {
      whereCondition.area_id = area_id;
    }

    try {
      const { count, rows: workers } = await Worker.findAndCountAll({
        limit,
        offset,
        where: whereCondition,
        attributes: [
          "id",
          "workerName",
          "priority",
          "icon",
          "minWage",
          "trash",
          "createdAt",
        ],
        include: [
          {
            model: Category,
            attributes: ["id", "categoryName"],
            through: { attributes: [] },
          },
          {
            model: Area,
            attributes: ["id", "name"],
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
