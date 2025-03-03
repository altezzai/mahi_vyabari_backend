require("../config/database");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const Medical = require("../models/MedDirectory");
const {deletefilewithfoldername} = require("../utils/util")

const uploadPath = path.join(__dirname, "../public/uploads/Medical");
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
  addMedicalDirectory: async (req, res) => {
    const {
      searchCategory,
      name,
      phone,
      searchSubcategory,
      whatsapp,
      website,
      location,
      description,
      address,
      openingTime,
      closingTime,
      workingDays,
      priority,
      area,
    } = req.body;
    console.log(req.body);
    try {
      if (
        !searchCategory ||
        !name ||
        !phone ||
        !searchSubcategory ||
        !whatsapp ||
        !website ||
        !location ||
        !description ||
        !address ||
        !openingTime ||
        !closingTime ||
        !workingDays ||
        !priority ||
        !area
      ) {
        return res.status(400).json({ message: "Please fill all the fields" });
      }
      if (!req.files.image || !req.files.icon) {
        return res
          .status(400)
          .json({ message: "Both Image and Icon are required" });
      }

      const image = req.files ? req.files.image[0].filename : null;
      const icon = req.files ? req.files.icon[0].filename : null;

      req.body.image = image;
      req.body.icon = icon;

      const savedMedicalDirectory = await Medical.create(req.body);
      res.status(201).json({
        status: "success",
        result: savedMedicalDirectory,
      });
    } catch (error) {
      await deletefilewithfoldername(uploadPath,req.files.image[0].filename);
      await deletefilewithfoldername(uploadPath,req.files.icon[0].filename);
      console.log(error);
      res.status(401).json({
        status: "FAILED",
        message: "An error occured while uploading new shop data",
      });
    }
  },
  updateMedicalDirectory: async (req, res) => {
    try {
      const { id } = req.params;
      const healthcareProvider = await Medical.findByPk(id);

      if (!healthcareProvider) {
        return res
          .status(404)
          .json({ success: false, message: "Healthcare Provider not found" });
      }

      // Destructure request body
      const {
        searchCategory,
        name,
        phone,
        searchSubcategory,
        whatsapp,
        website,
        location,
        description,
        address,
        openingTime,
        closingTime,
        workingDays,
        priority,
        area,
      } = req.body;

      // Handle file uploads (image & icon)
      let newImage = healthcareProvider.image;
      let newIcon = healthcareProvider.icon;

      if (req.files?.image[0]) {
        if (healthcareProvider.image) {
          const oldImagePath = path.join(uploadPath, healthcareProvider.image);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
        newImage = req.files.image[0].filename;
      }

      if (req.files?.icon[0]) {
        if (healthcareProvider.icon) {
          const oldIconPath = path.join(uploadPath, healthcareProvider.icon);
          if (fs.existsSync(oldIconPath)) {
            fs.unlinkSync(oldIconPath);
          }
        }
        newIcon = req.files.icon[0].filename;
      }

      // Update the healthcare provider
      await healthcareProvider.update({
        image: newImage,
        icon: newIcon,
        searchCategory: searchCategory || healthcareProvider.searchCategory,
        name: name || healthcareProvider.name,
        phone: phone || healthcareProvider.phone,
        searchSubcategory: searchSubcategory || healthcareProvider.searchSubcategory,
        whatsapp: whatsapp || healthcareProvider.whatsapp,
        website: website || healthcareProvider.website,
        location: location || healthcareProvider.location,
        description: description || healthcareProvider.description,
        address: address || healthcareProvider.address,
        openingTime: openingTime || healthcareProvider.openingTime,
        closingTime: closingTime || healthcareProvider.closingTime,
        workingDays: workingDays || healthcareProvider.workingDays,
        priority: priority || healthcareProvider.priority,
        area: area || healthcareProvider.area,
      });

      return res.status(200).json({
        success: true,
        message: "Healthcare Provider updated successfully",
        data: healthcareProvider,
      });
    } catch (error) {
      await deletefilewithfoldername(uploadPath,req.files.image[0].filename);
      await deletefilewithfoldername(uploadPath,req.files.icon[0].filename);
      console.error("Error updating healthcare provider:", error);
      return res.status(500).json({
        success: false,
        message: "Error updating healthcare provider",
        error,
      });
    }
  },
  deleteMedicalDirectory: async (req, res) => {
    try {
      const { id } = req.params;
      const healthcareProvider = await Medical.findByPk(id);

      if (!healthcareProvider) {
        return res
          .status(404)
          .json({ success: false, message: "Healthcare Provider not found" });
      }

      // Soft delete by setting trash to true
      await healthcareProvider.update({ trash: true });

      return res.status(200).json({
        success: true,
        message: "Healthcare Provider deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting healthcare provider:", error);
      return res.status(500).json({
        success: false,
        message: "Error deleting healthcare provider",
        error,
      });
    }
  },
  restoreMedicalDirectory: async (req, res) => {
    try {
      const { id } = req.params;
      const healthcareProvider = await Medical.findByPk(id);

      if (!healthcareProvider) {
        return res
          .status(404)
          .json({ success: false, message: "Healthcare Provider not found" });
      }

      // Soft delete by setting trash to true
      await healthcareProvider.update({ trash: false });

      return res.status(200).json({
        success: true,
        message: "Healthcare Provider deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting healthcare provider:", error);
      return res.status(500).json({
        success: false,
        message: "Error deleting healthcare provider",
        error,
      });
    }
  },
  getMedicalDirectory: async (req, res) => {
    try {
      const healthcareProviders = await Medical.findAll();
      if (!healthcareProviders.length) {
        return res
          .status(404)
          .json({ success: false, message: "Healthcare Provider not found" });
      }
      return res.status(200).json({ success: true, data: healthcareProviders });
    } catch (error) {
      console.error("Error fetching healthcare providers:", error);
      return res.status(500).json({
        success: false,
        message: "Error fetching healthcare providers",
        error,
      });
    }
  },
  getMedicalDirectoryById: async (req, res) => {
    try {
      const { id } = req.params;
      const healthcareProvider = await Medical.findByPk(id);

      if (!healthcareProvider) {
        return res
          .status(404)
          .json({ success: false, message: "Healthcare Provider not found" });
      }

      return res.status(200).json({ success: true, data: healthcareProvider });
    } catch (error) {
      console.error("Error fetching healthcare provider:", error);
      return res.status(500).json({
        success: false,
        message: "Error fetching healthcare provider",
        error,
      });
    }
  },
};
