const path = require("path");
const fs = require("fs");
const { Banner } = require("../models");
const sequelize = require("../config/database");
const {
  deleteFileWithFolderName,
  compressAndSaveFile,
} = require("../utils/fileHandler");
const BannerSmlPath = "public/uploads/banner/small/";
const BannerLrgPath = "public/uploads/banner/";
module.exports = {
  uploadBanners: async (req, res) => {
    try {
      const { banner_type, url } = req.body;
      if (!banner_type) {
        return res.status(400).json({ error: "banner_type is required." });
      }
      let banner_image_small = null;
      let banner_image_large = null;

      if (req.files?.banner_image_small) {
        banner_image_small = await compressAndSaveFile(
          req.files.banner_image_small[0],
          BannerSmlPath
        );
      }
      if (req.files?.banner_image_large) {
        banner_image_large = await compressAndSaveFile(
          req.files.banner_image_large[0],
          BannerLrgPath
        );
      }

      const newBanner = await Banner.create({
        banner_image_small: banner_image_small,
        banner_image_large: banner_image_large,
        banner_type: banner_type,
        url: url,
        trash: false,
      });

      res.status(201).json({
        message: "Banner created successfully!",
        banner: newBanner,
      });
    } catch (error) {
      res.status(500).json({
        message: "An error occurred on the server while uploading banners.",
      });
    }
  },
  updateBanner: async (req, res) => {
    try {
      const { id } = req.params;
      const banner = await Banner.findByPk(id);
      if (!banner) {
        return res.status(404).json({ message: "Banner not found." });
      }

      const { banner_type, url } = req.body;

      let banner_image_small = banner.banner_image_small;
      let banner_image_large = banner.banner_image_large;

      if (req.files?.banner_image_small) {
        banner_image_small = await compressAndSaveFile(
          req.files.banner_image_small[0],
          BannerSmlPath
        );
        if (banner.banner_image_small) {
          await deleteFileWithFolderName(
            BannerSmlPath,
            banner.banner_image_small
          );
        }
      }
      if (req.files?.banner_image_large) {
        banner_image_large = await compressAndSaveFile(
          req.files.banner_image_large[0],
          BannerLrgPath
        );
        if (banner.banner_image_large) {
          await deleteFileWithFolderName(
            BannerLrgPath,
            banner.banner_image_large
          );
        }
      }

      const updatedBanner = await banner.update({
        banner_image_small: banner_image_small,
        banner_image_large: banner_image_large,
        banner_type: banner_type,
        url: url,
      });
      res.status(200).json({
        message: `Banner ${updatedBanner.id} updated successfully!`,
        banner: updatedBanner,
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
      const { count, rows: banners } = await Banner.findAndCountAll({
        where: whereClause,
        limit: limitNum,
        offset: offset,
        order: [["createdAt", "DESC"]],
      });

      // const addFullUrl = (banner) => ({
      //   ...banner.toJSON(),
      //   banner_image_large: `${req.protocol}://${req.get(
      //     "host"
      //   )}/public/uploads/banners/${banner.banner_image_large}`,
      //   banner_image_small: `${req.protocol}://${req.get(
      //     "host"
      //   )}/public/uploads/banners/${banner.banner_image_small}`,
      // });

      const totalPages = Math.ceil(count / limitNum);

      res.status(200).json({
        totalItems: count,
        totalPages: totalPages,
        currentPage: pageNum,
        banners: banners,
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
  getBannerById: async (req, res) => {
    try {
      const { id } = req.params;
      const banner = await Banner.findByPk(id);
      if (!banner) {
        return res.status(404).json({ message: "Banner not found." });
      }
      res.status(200).json(banner);
    } catch (error) {
      res.status(500).json({ message: "Error fetching banner." });
    }
  },
  deleteBannerById: async (req, res) => {
    try {
      const { id } = req.params;
      const banner = await Banner.findByPk(id);
      if (!banner) {
        return res.status(404).json({ message: "Banner not found." });
      }
      if (banner.banner_image_large) {
        await deleteFileWithFolderName(uploadDir, banner.banner_image_large);
      }
      if (banner.banner_image_small) {
        await deleteFileWithFolderName(uploadDir, banner.banner_image_small);
      }

      await banner.destroy();
      res.status(200).json({ message: "Banner deleted successfully." });
    } catch (error) {
      res.status(500).json({ message: "Error deleting banner." });
    }
  },
};
