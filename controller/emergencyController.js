const multer = require("multer");
const fs = require("fs");
const path = require("path");
const Emergency = require("../models/Emergency");

const uploadPath = path.join(__dirname, "../public/uploads/emergency");
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
  addEmergency: async (req, res) => {
    console.log(req.body);
    try {
      if (!req.file) {
        return res.status(400).json({ message: "category icon is required" });
      }

      const icon = req.file ? req.file.filename : null;
      req.body.icon = icon;

      const savedEmergency = await Emergency.create(req.body);
      if (!savedEmergency) {
        res.status(404).json({
          status: "FAILED",
          message: "Can't upload Emergency Data",
        });
      }
      res.status(200).json({
        status: "SUCCESS",
        data: savedEmergency,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        status: "FAILED",
        message: "An error occure while uploading Category data",
        error: error,
      });
    }
  },
};
