require("../config/database");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const Worker = require("../models/Worker");
const WorkerCategory = require("../models/WorkerCategory");
const { deletefilewithfoldername } = require("../utils/util");
const { Op } = require("sequelize");
const Type = require("../models/Type");
const Category = require("../models/Category");

const uploadPath = path.join(__dirname, "../public/uploads/workers");
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
  addWorkerProfile: async (req, res) => {
    try {
      const workerData = {
        ...req.body,
        image: req.files?.image?.[0]?.filename || null,
        icon: req.files?.icon?.[0]?.filename || null,
      };
      const savedWorker = await Worker.create(workerData);
      if (savedWorker.categories && savedWorker.categories.length > 0) {
        await WorkerCategory.bulkCreate(
          savedWorker.categories.map((category) => ({
            workerId: savedWorker.id,
            categoryId: category,
          }))
        );
      }
      res.status(201).json({
        success: true,
        result: savedWorker,
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
      console.log(error);
      res.status(401).json({
        success: false,
        message: error.message,
      });
    }
  },
  updateWorkerProfile: async (req, res) => {
    const {
      categories,
      workerName,
      minWage,
      priority,
      area,
      phone,
      whatsapp,
      description,
    } = req.body;
    try {
      const { id } = req.params;
      const worker = await Worker.findByPk(id);
      if (!worker) {
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
          .json({ success: false, message: "Worker profile not found" });
      }
      let newImage = worker.image;
      let newIcon = worker.icon;
      if (req.files?.image) {
        if (worker.image) {
          const oldImagePath = path.join(uploadPath, worker.image);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
        newImage = req.files.image[0].filename;
      }
      if (req.files?.icon) {
        if (worker.icon) {
          const oldIconPath = path.join(uploadPath, worker.icon);
          if (fs.existsSync(oldIconPath)) {
            fs.unlinkSync(oldIconPath);
          }
        }
        newIcon = req.files.icon[0].filename;
      }
      await worker.update({
        categories,
        workerName,
        minWage,
        priority,
        area,
        phone,
        whatsapp,
        image: newImage,
        icon: newIcon,
        description,
      });
      return res.status(200).json({
        success: true,
        data: worker,
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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const whereCondition = {};
    if (search) {
      whereCondition = {
        [Op.or]: [{ name: { [Op.like]: `%${search}%` } }],
      };
    }
    try {
      const workers = await Worker.findAndCountAll({
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
      return res.status(200).json({ success: true, data: workers });
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
        },
      });
      return res.status(200).json({ success: true, data: workerCategory });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },
};
