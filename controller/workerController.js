require("../config/database");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const Worker = require("../models/Worker");
const WorkerCategory = require("../models/WorkerCategory");
const {deletefilewithfoldername} = require("../utils/util")

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
      // if (!req.files.image || !req.files.icon) {
      //   return res
      //     .status(400)
      //     .json({ message: "Both shopImage and shopIconImage are required" });
      // }

      const workerData = {
        ...req.body,
        image:req.files?.image?.[0]?.filename||null,
        icon:req.files?.icon?.[0]?.filename||null
      }
      const savedWorker = await Worker.create(workerData);
      
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
      // await deletefilewithfoldername(uploadPath,req.files.image[0].filename)
      // await deletefilewithfoldername(uploadPath,req.files.icon[0].filename)
      console.log(error);
      res.status(401).json({
        status: "FAILED",
        message: "An error occured while uploading new Worker Profile data",
      });
    }
  },
  updateWorkerProfile:async(req,res)=>{
    try {
      const { id } = req.params;
      const { categories, name, minWage, priority, area, phone, whatsapp, description } = req.body;
  
      // Find the existing worker profile
      const worker = await Worker.findByPk(id);
      if (!worker) {
        // await deletefilewithfoldername(uploadPath,req.files.image[0].filename)
        // await deletefilewithfoldername(uploadPath,req.files.icon[0].filename)
        return res.status(404).json({ success: false, message: "Worker profile not found" });
      }
  
      let newImage = worker.image;
      let newIcon = worker.icon;
  
      // Handle image update
      if (req.files?.image) {
        if (worker.image) {
          const oldImagePath = path.join(uploadPath, worker.image);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath); // Delete old image
          }
        }
        newImage = req.files.image[0].filename; // Save new image filename
      }
  
      // Handle icon update
      if (req.files?.icon) {
        if (worker.icon) {
          const oldIconPath = path.join(uploadPath, worker.icon);
          if (fs.existsSync(oldIconPath)) {
            fs.unlinkSync(oldIconPath); // Delete old icon
          }
        }
        newIcon = req.files.icon[0].filename; // Save new icon filename
      }
  
      // Update worker profile
      await worker.update({
        categories,
        name,
        minWage,
        priority,
        area,
        phone,
        whatsapp,
        image: newImage,
        icon: newIcon,
        description,
      });
  
      return res.status(200).json({ success: true, message: "Worker profile updated successfully", data: worker });
  
    } catch (error) {
      // await deletefilewithfoldername(uploadPath,req.files.image[0].filename)
      // await deletefilewithfoldername(uploadPath,req.files.icon[0].filename)
      console.error("Error updating worker profile:", error);
      return res.status(500).json({ success: false, message: "Error updating worker profile", error });
    }
  },
  deleteWorkerProfile:async(req,res)=>{
    try {
      const { id } = req.params;
  
      // Find the existing worker profile
      const worker = await Worker.findByPk(id);
      if (!worker) {
        return res.status(404).json({ success: false, message: "Worker profile not found" });
      }
  
      // Soft delete by setting trash to true
      await worker.update({ trash: true });
  
      return res.status(200).json({ success: true, message: "Worker profile deleted successfully",worker});
  
    } catch (error) {
      console.error("Error deleting worker profile:", error);
      return res.status(500).json({ success: false, message: "Error deleting worker profile", error });
    }
  
  },
  restoreWorkerProfile:async(req,res)=>{
    try {
      const { id } = req.params;
  
      // Find the existing worker profile
      const worker = await Worker.findByPk(id);
      if (!worker) {
        return res.status(404).json({ success: false, message: "Worker profile not found" });
      }
  
      // Soft delete by setting trash to true
      await worker.update({ trash: false });
  
      return res.status(200).json({ success: true, message: "Worker profile restored successfully",worker});
  
    } catch (error) {
      console.error("Error restoring worker profile:", error);
      return res.status(500).json({ success: false, message: "Error restoring worker profile", error });
    }
  
  },
  getWorkerProfiles:async(req,res)=>{
    try {
      // Fetch all worker profiles
      const workers = await Worker.findAll();
      if (!workers.length) {
        return res.status(404).json({ success: false, message: "Worker profile not found" });
      }
      return res.status(200).json({ success: true, data: workers });
    } catch (error) {
      console.error("Error fetching worker profiles:", error);
      return res.status(500).json({ success: false, message: "Error fetching worker profiles", error });
    }
  },
  getWorkerProfileById:async(req,res)=>{
    try {
      const { id } = req.params;
  
      // Find worker profile by ID
      const worker = await Worker.findByPk(id);
      
      if (!worker) {
        return res.status(404).json({ success: false, message: "Worker profile not found" });
      }
  
      return res.status(200).json({ success: true, data: worker });
    } catch (error) {
      console.error("Error fetching worker profile:", error);
      return res.status(500).json({ success: false, message: "Error fetching worker profile", error });
    }
  }
};
