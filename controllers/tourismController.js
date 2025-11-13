require("../config/database");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { Tourism, TourismImage } = require("../models");
const { Op } = require("sequelize");
const sequelize = require("../config/database");
const {
  processImage,
  cleanupFiles,
  deleteFileWithFolderName,
  processImageFields,
} = require("../utils/fileHandler");

const UPLOAD_SUBFOLDER = "tourism";
const UPLOAD_PATH = process.env.UPLOAD_PATH;

const tourismCreateConfig = {
  images: { width: 1080 },
};

const tourismAddImageConfig = {
  image: { width: 1080 },
};

module.exports = {
  addTouristPlace: async (req, res) => {
    // try {
    //   const tourismData = {
    //     ...req.body,
    //     images: req.files.map((file) => file.filename),
    //   };
    //   const tourism = await Tourism.create(tourismData);
    //   return res.status(201).json({ success: true, tourism });
    // } catch (error) {
    //   console.log(error);
    //   return res.status(500).json({ success: false, message: error.message });
    // }
    let processedFiles;
    const t = await sequelize.transaction();
    try {
      processedFiles = await processImageFields(
        req.files,
        tourismCreateConfig,
        UPLOAD_SUBFOLDER
      );
      // 2. Create the Tourism spot
      const newSpot = await Tourism.create(
        {
          ...req.body,
        },
        { transaction: t }
      );
      // 3. Create the linked images in the new table
      if (processedFiles.images && processedFiles.images.length > 0) {
        const imagesToCreate = processedFiles.images.map((file) => ({
          tourismId: newSpot.id,
          image: file.filename,
        }));
        await TourismImage.bulkCreate(imagesToCreate, { transaction: t });
      }
      await t.commit();
      const finalSpot = await Tourism.findByPk(
        newSpot.id,
        {
          include: [{ model: TourismImage, as: "images" }],
        },
        { transaction: t }
      );
      res.status(201).json({
        message: "Tourism spot created successfully!",
        spot: finalSpot,
      });
    } catch (error) {
      await t.rollback();
      console.log(error);
      await cleanupFiles(processedFiles, UPLOAD_SUBFOLDER);
      console.error("Error in createTourismSpot:", error);
      res.status(500).json({
        error: "Failed to create tourism spot",
        details: error.message,
      });
    }
  },
  updateTouristPlace: async (req, res) => {
    const { placeName, phone, area, startTime, endTime, entryFee, location } =
      req.body;
    try {
      const { id } = req.params;
      const tourism = await Tourism.findByPk(id);
      if (!tourism) {
        return res
          .status(404)
          .json({ success: false, message: "Tourism not found" });
      }
      // let newImages = tourism.images;
      // if (req.files) {
      //   if (tourism.images) {
      //     await tourism.images.forEach((imageName) => {
      //       if (!imageName || typeof imageName !== "string") return;
      //       const oldImagePath = path.join(uploadPath, imageName);
      //       if (fs.existsSync(oldImagePath)) {
      //         fs.unlinkSync(oldImagePath);
      //       }
      //     });
      //   }
      //   newImages = req.files.map((file) => file.filename);
      // }
      // const updatedTourism = await tourism.update({
      //   placeName,
      //   phone,
      //   area,
      //   startTime,
      //   endTime,
      //   entryFee,
      //   location,
      //   images: newImages,
      // });
      const updatedTourism = await tourism.update(req.body);
      return res.status(200).json({ success: true, updatedTourism });
    } catch (error) {
      console.error("Error in updateTourismSpot:", error);
      res.status(500).json({
        error: "Failed to update tourism spot",
        details: error.message,
      });
    }
  },
  addTourismImage: async (req, res) => {
    let processedFile;
    try {
      const { id } = req.params; // ID of the Tourism spot

      // 1. Check if the spot exists
      const spot = await Tourism.findByPk(id);
      if (!spot) {
        return res.status(404).json({ error: "Tourism spot not found." });
      }

      // 2. Check if a file was uploaded
      if (!req.file) {
        return res.status(400).json({ error: 'No "image" file was uploaded.' });
      }

      // 3. Process the single image
      processedFile = await processImage(
        req.file.buffer,
        tourismAddImageConfig.image,
        UPLOAD_SUBFOLDER,
        req.file.originalname
      );
      console.log(processedFile);
      // 4. Create the new image record in the database
      const newImage = await TourismImage.create({
        tourismId: id,
        image: processedFile.filename,
      });

      res.status(201).json({
        message: "Image added successfully!",
        image: newImage,
      });
    } catch (error) {
      console.error("Error adding image, cleaning up file...");
      // Manually build object for cleanupFiles
      if (processedFile) {
        await cleanupFiles({ image: [processedFile] }, UPLOAD_SUBFOLDER);
      }
      // Send error response
      console.error("Error in addTourismImage:", error);
      res.status(500).json({
        error: "Failed to add image",
        details: error.message,
      });
    }
  },
  deleteTourismImage: async (req, res) => {
    try {
      const { id } = req.params; // ID of the TourismImage

      // 1. Find the image record
      const image = await TourismImage.findByPk(id);
      if (!image) {
        return res.status(404).json({ error: "Image not found." });
      }

      // 2. Delete the file from the disk
      const filename = path.basename(image.image);
      const filePath = path.join(UPLOAD_PATH, UPLOAD_SUBFOLDER);
      await deleteFileWithFolderName(filePath, filename);
      // await fs.promises.unlink(filePath).catch(err => {
      //   // Log error if file not found, but don't stop the process
      //   console.error(`Failed to delete file from disk, but continuing: ${err.message}`);
      // });

      // 3. Delete the record from the database
      await image.destroy();

      res.status(200).json({ message: "Image deleted successfully." });
    } catch (error) {
      // Send error response
      console.error("Error in deleteTourismImage:", error);
      res.status(500).json({
        error: "Failed to delete image",
        details: error.message,
      });
    }
  },
  deleteTouristPlace: async (req, res) => {
    try {
      const { id } = req.params;
      const tourism = await Tourism.findByPk(id);
      if (!tourism) {
        return res
          .status(404)
          .json({ success: false, message: "Tourism not found" });
      }
      await tourism.update({ trash: true });
      return res.status(200).json({ success: true, tourism });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },
  restoreTouristPlace: async (req, res) => {
    try {
      const { id } = req.params;
      const tourism = await Tourism.findByPk(id);
      if (!tourism) {
        return res
          .status(404)
          .json({ success: false, message: "Tourism not found" });
      }
      await tourism.update({ trash: false });
      return res.status(200).json({ success: true, tourism });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },
  getTouristPlaces: async (req, res) => {
    const search = req.query.search || "";
    const area = req.query.area || null;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit || 0;
    let whereCondition = {};
    if (search) {
      whereCondition = {
        [Op.or]: [{ placeName: { [Op.like]: `%${search}%` } }],
      };
    }
    if (area) {
      whereCondition.area = area;
    }
    try {
      const { count, rows: tourism } = await Tourism.findAndCountAll({
        limit,
        offset,
        where: whereCondition,
        attributes: ["id", "placeName", "phone", "trash"],
        order: [["createdAt", "DESC"]],
      });
      const totalPages = Math.ceil(count / limit);
      return res.status(200).json({
        success: true,
        count,
        totalPages,
        currentPage: page,
        data: tourism,
      });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ success: false, message: error.message, name: error.name });
    }
  },
  getTouristPlaceById: async (req, res) => {
    try {
      const { id } = req.params;
      const tourism = await Tourism.findByPk(id);
      if (!tourism) {
        return res
          .status(404)
          .json({ success: false, message: "Tourism not found" });
      }
      res.status(200).json({ success: true, tourism });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
};
