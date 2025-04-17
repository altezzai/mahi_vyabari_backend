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
        images: req.files.map((file) => file.filename),
      };
      console.log(tourismData);
      const tourism = await Tourism.create(tourismData);
      res.status(201).json({ success: true, tourism });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  },
};
