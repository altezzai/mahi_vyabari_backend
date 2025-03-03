require("../config/database");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const Classified = require("../models/Classified");
const { deletefilewithfoldername } = require("../utils/util");

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
    const {
      category,
      itemName,
      price,
      homeTown,
      area,
      address,
      description,
      priority,
      phone,
      whatsapp,
    } = req.body;
    if (
      !category ||
      !itemName ||
      !price ||
      !homeTown ||
      !area ||
      !address ||
      !description ||
      !priority ||
      !phone ||
      !whatsapp
    ) {
      await deletefilewithfoldername(uploadPath,req.files.image[0].filename)
      await deletefilewithfoldername(uploadPath,req.files.icon[0].filename)
      return res.status(400).json({ message: "Please fill all the fields" });
    }
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
      await deletefilewithfoldername(uploadPath,req.files.image[0].filename)
      await deletefilewithfoldername(uploadPath,req.files.icon[0].filename)
      console.log(error);
      res.status(401).json({
        status: "FAILED",
        message: "An error occured while uploading new classified data",
      });
    }
  },
  updateClassfied: async (req, res) => {
    const {
      category,
      itemName,
      price,
      homeTown,
      area,
      address,
      description,
      priority,
      phone,
      whatsapp,
    } = req.body;
    try {
      const { id } = req.params; // Get item ID
      // Find existing item
      const item = await Classified.findByPk(id);

      if (!item) {
        await deletefilewithfoldername(uploadPath,req.files.image[0].filename)
        await deletefilewithfoldername(uploadPath,req.files.icon[0].filename)
        return res.status(404).json({ message: "Item not found" });
      }

      // Handle file deletion and updating
      let newImage = item.image;
      let newIcon = item.icon;

      if (req.files?.image) {
        const oldImagePath = path.join(uploadPath, item.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath); // Delete old image
        }
        newImage = req.files.image[0].filename; // Assign new image
      }

      if (req.files?.icon) {
        const oldIconPath = path.join(uploadPath, item.icon);
        if (fs.existsSync(oldIconPath)) {
          fs.unlinkSync(oldIconPath); // Delete old icon
        }
        newIcon = req.files.icon[0].filename; // Assign new icon
      }

      // Update fields (only if provided)
      await item.update({
        category: category || item.category,
        itemName: itemName || item.itemName,
        price: price || item.price,
        homeTown: homeTown || item.homeTown,
        area: area || item.area,
        address: address || item.address,
        description: description || item.description,
        priority: priority || item.priority,
        phone: phone || item.phone,
        whatsapp: whatsapp || item.whatsapp,
        image: newImage,
        icon: newIcon,
      });

      return res
        .status(200)
        .json({ message: "Item updated successfully", item });
    } catch (error) {
      await deletefilewithfoldername(uploadPath,req.files.image[0].filename)
      await deletefilewithfoldername(uploadPath,req.files.icon[0].filename)
      return res.status(500).json({ message: "Error updating item", error });
    }
  },
  deleteClassfied: async (req, res) => {
    try {
      const { id } = req.params; // Get item ID from request params

      // Find the item by ID
      const item = await Classified.findByPk(id);

      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }

      // Perform soft delete by updating `trash` field to true
      await item.update({ trash: true });

      return res
        .status(200)
        .json({ message: "Item soft deleted successfully", item });
    } catch (error) {
      return res.status(500).json({ message: "Error deleting item", error });
    }
  },
  restoreClassfied: async (req, res) => {
    try {
      const { id } = req.params; // Get item ID from request params

      // Find the item by ID
      const item = await Classified.findByPk(id);

      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }

      // Perform soft delete by updating `trash` field to true
      await item.update({ trash: false });

      return res
        .status(200)
        .json({ message: "Item soft deleted successfully", item });
    } catch (error) {
      return res.status(500).json({ message: "Error deleting item", error });
    }
  },
  getClassfieds: async (req, res) => {
    try {
      const classifieds = await Classified.findAll({
        order: [["createdAt", "DESC"]],
      }); // Fetch all classifieds
      // Check if products exist
      if (!classifieds.length) {
        return res.status(404).json({ message: "No classifieds found" });
      }

      return res.status(200).json({ success: true, data: classifieds });
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, message: "Error fetching classifieds", error });
    }
  },
  getClassfiedById: async (req, res) => {
    try {
      const { id } = req.params; // Get the ID from request params
      const classified = await Classified.findByPk(id);

      if (!classified) {
        return res
          .status(404)
          .json({ success: false, message: "Classified not found" });
      }

      return res.status(200).json({ success: true, data: classified });
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, message: "Error fetching classified", error });
    }
  },
};
