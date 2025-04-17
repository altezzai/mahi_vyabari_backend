require("../config/database");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const Tourism = require("../models/Tourism");

const uploadPath = path.join(__dirname, "../public/uploads/tourismImages");
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
  addTrouristPlace: async (req, res) => {
    try {
      const tourismData = {
        ...req.body,
        images: JSON.stringify(req.files.map((file) => file.filename)),
      };
      const tourism = await Tourism.create(tourismData);
      res.status(201).json({ success: true, tourism });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  },
  updateTouristPlace: async (req, res) => {
    const { placeName, phone, area, startTime, endTime, entryFee } = req.body;
    try {
      const { id } = req.params;
      const tourism = await Tourism.findByPk(id);
      if (!tourism) {
        return res
          .status(404)
          .json({ success: false, message: "Tourism not found" });
      }
      let newImages = tourism.images;
      if (req.files) {
        if (tourism.images) {
          await JSON.parse(tourism.images).forEach((imageName) => {
            if (!imageName || typeof imageName !== "string") return;
            const oldImagePath = path.join(uploadPath, imageName);
            console.log(oldImagePath);
            if (fs.existsSync(oldImagePath)) {
              fs.unlinkSync(oldImagePath);
            }
          });
        }
        newImages = JSON.stringify(req.files.map((file) => file.filename));
      }
      console.log(newImages);
      const updatedTourism = await tourism.update({
        placeName,
        phone,
        area,
        startTime,
        endTime,
        entryFee,
        images: newImages,
      });
      res.status(200).json({ success: true, updatedTourism });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
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
      res.status(200).json({ success: true, tourism });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
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
      res.status(200).json({ success: true, tourism });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  },
  getTouristPlaces: async (req, res) => {
    const search = req.query.search || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit || 0;
    let whereCondition = {};
    if (search) {
      whereCondition = {
        [Op.or]: [{ placeName: { [Op.like]: `%${search}%` } }],
      };
    }
    try {
      const tourism = await Tourism.findAndCountAll({
        limit,
        offset,
        where: whereCondition,
        attributes: ["id", "placeName", "phone", "trash"],
        order: [["createdAt", "DESC"]],
      });
      res.status(200).json({ success: true, tourism });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
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
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  },
};
