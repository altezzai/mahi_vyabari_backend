require("../config/database");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const Worker = require("../models/Worker");
const WorkerCategory = require("../models/WorkerCategory");

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
      if (!req.files.image || !req.files.icon) {
        return res
          .status(400)
          .json({ message: "Both shopImage and shopIconImage are required" });
      }

      const image = req.files ? req.files.image[0].filename : null;
      const icon = req.files ? req.files.icon[0].filename : null;

      req.body.image = image;
      req.body.icon = icon;

      const savedWorker = await Worker.create(req.body);
      
      if (savedWorker.categories && savedWorker.categories.length > 0) {
        await WorkerCategory.bulkCreate(
          JSON.parse(savedWorker.categories).map((category) => ({
            workerId: savedWorker.id,
            categoryId: category,
          }))
        );
      }
      res.status(201).json({
        status: "success",
        result: savedWorker,
      });
    } catch (error) {
      console.log(error);
      res.status(401).json({
        status: "FAILED",
        message: "An error occured while uploading new Worker Profile data",
      });
    }
  },
};
