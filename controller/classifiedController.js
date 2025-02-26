require("../config/database");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const Classified = require("../models/Classified");

const uploadPath = path.join(__dirname, "../public/uploads/classified");

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
  addClassfied: async (req, res) => {
    console.log(req.body);
    try {
      if (!req.files.image || !req.files.icon) {
        return res
          .status(400)
          .json({ message: "Both shopImage and shopIconImage are required" });
      }

      const image = req.files ? req.files.image[0].filename : null;
      const icon = req.files ? req.files.icon[0].filename : null;

      req.body.image = image;
      req.body.icon = icon;

      const savedClassified = await Classified.create(req.body);
      res.status(201).json({
        status: "success",
        savedShop: savedClassified,
      });
    } catch (error) {
      console.log(error);
      res.status(401).json({
        status: "FAILED",
        message: "An error occured while uploading new classified data",
      });
    }
  },
};
