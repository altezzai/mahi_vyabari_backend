// src/middleware/upload.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Banner = require("../models/Banner");
const sequelize = require("../config/database");
const { deleteFileWithFolderName } = require("../utils/deleteFile");

const uploadDir = path.join(__dirname, "../public/uploads/banners");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);
    const originalName = path.basename(file.originalname, extension);
    const sanitizedName = originalName
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-");
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, sanitizedName + "-" + uniqueSuffix + extension);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 1024 * 1024 * 5 },
}).array("images", 10);

const uploadSingle = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 1024 * 1024 * 5 }, // 5MB file size limit
}).single("image");

module.exports = {
  uploadSingle,
  upload,
  uploadBanners: async (req, res) => {
    const t = await sequelize.transaction();

    try {
      const { banner_type } = req.body;
      const files = req.files;

      if (!files || files.length === 0) {
        return res
          .status(400)
          .json({ message: "No image files were uploaded." });
      }

      if (
        !banner_type ||
        (banner_type !== "type1" && banner_type !== "type2")
      ) {
        return res.status(400).json({
          message: "Invalid 'banner_type'. Must be 'type1' or 'type2'.",
        });
      }

      const bannersToCreate = files.map((file) => ({
        image_path: file.filename,
        banner_type: banner_type,
      }));

      await Banner.bulkCreate(bannersToCreate, { transaction: t });

      await t.commit();

      res.status(201).json({
        message: `${files.length} banners uploaded successfully for ${banner_type}.`,
      });
    } catch (error) {
      await t.rollback();

      res.status(500).json({
        message: "An error occurred on the server while uploading banners.",
      });
    }
  },
  updateBanner: async (req, res) => {
    try {
      const { id } = req.params;
      const { banner_type } = req.body;

      const banner = await Banner.findByPk(id);
      if (!banner) {
        return res.status(404).json({ message: "Banner not found." });
      }
      const oldImagePath = banner.image_path;

      if (req.file) {
        banner.image_path = req.file.filename;
      }
      if (banner_type && (banner_type === "type1" || banner_type === "type2")) {
        banner.banner_type = banner_type;
      }

      await banner.save();

      if (req.file && oldImagePath) {
        await deleteFileWithFolderName(uploadDir, oldImagePath);
      }

      res.status(200).json({
        message: "Banner updated successfully.",
        banner: banner,
      });
    } catch (error) {
      res.status(500).json({ message: "Error updating banner." });
    }
  },
  getLatestBannersByType: async (req, res) => {
    try {
      const [type1Banners, type2Banners] = await Promise.all([
        Banner.findAll({
          where: {
            banner_type: "type1",
            trash: false,
          },
          order: [["createdAt", "DESC"]],
          limit: 10,
        }),
        Banner.findAll({
          where: {
            banner_type: "type2",
            trash: false,
          },
          order: [["createdAt", "DESC"]],
          limit: 10,
        }),
      ]);

      const addFullUrl = (banner) => ({
        ...banner.toJSON(),
        full_image_url: `${req.protocol}://${req.get(
          "host"
        )}/public/uploads/banners${banner.image_path}`,
      });

      res.status(200).json({
        type1: type1Banners.map(addFullUrl),
        type2: type2Banners.map(addFullUrl),
      });
    } catch (error) {
      res.status(500).json({ message: "Error fetching banners." });
    }
  },
  getAllBannersAdmin: async (req, res) => {
    try {
      // 1. Get query parameters
      const {
        page = 1,
        limit = 10,
        search,
        type,
        status = "active",
      } = req.query;

      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);
      const offset = (pageNum - 1) * limitNum;
      const whereClause = {};

      if (search) {
        whereClause.image_path = {
          [Op.like]: `%${search}%`,
        };
      }

      if (type && (type === "type1" || type === "type2")) {
        whereClause.banner_type = type;
      }

      if (status === "active") {
        whereClause.trash = false;
      } else if (status === "trashed") {
        whereClause.trash = true;
      }
      const { count, rows } = await Banner.findAndCountAll({
        where: whereClause,
        limit: limitNum,
        offset: offset,
        order: [["createdAt", "DESC"]],
      });

      const addFullUrl = (banner) => ({
        ...banner.toJSON(),
        full_image_url: `${req.protocol}://${req.get(
          "host"
        )}/public/uploads/banners/${banner.image_path}`,
      });

      const totalPages = Math.ceil(count / limitNum);

      res.status(200).json({
        totalItems: count,
        totalPages: totalPages,
        currentPage: pageNum,
        banners: rows.map(addFullUrl),
      });
    } catch (error) {
      console.error("Error fetching admin banners:", error);
      res.status(500).json({ message: "Error fetching banners." });
    }
  },
  softDeleteBanner: async (req, res) => {
    try {
      const { id } = req.params;

      const banner = await Banner.findByPk(id);

      if (!banner) {
        return res.status(404).json({ message: "Banner not found." });
      }

      banner.trash = true;
      await banner.save();

      res.status(200).json({ message: "Banner soft-deleted successfully." });
    } catch (error) {
      res.status(500).json({ message: "Error soft-deleting banner." });
    }
  },
  restoreBanner: async (req, res) => {
    try {
      const { id } = req.params;

      const banner = await Banner.findByPk(id);

      if (!banner) {
        return res.status(404).json({ message: "Banner not found." });
      }

      banner.trash = false;
      await banner.save();

      res.status(200).json({ message: "Banner soft-deleted successfully." });
    } catch (error) {
      res.status(500).json({ message: "Error soft-deleting banner." });
    }
  },
  hardDeleteBanner: async (req, res) => {
    try {
      const { id } = req.params;

      const banner = await Banner.findByPk(id);

      if (!banner) {
        return res.status(404).json({ message: "Banner not found." });
      }

      const imagePath = banner.image_path;
      await banner.destroy({ force: true });

      if (imagePath) {
        await deleteFileWithFolderName(uploadDir, imagePath);
      }

      res
        .status(200)
        .json({ message: "Banner permanently deleted successfully." });
    } catch (error) {
      res.status(500).json({ message: "Error hard-deleting banner." });
    }
  },
};
