require("../config/database");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const Classified = require("../models/Classified");
const Type = require("../models/Type");
const { deletefilewithfoldername } = require("../utils/deleteFile");
const Category = require("../models/Category");
const { Op } = require("sequelize");

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
    try {
      const classifiedData = {
        ...req.body,
        image: req.files?.image?.[0]?.filename || null,
        icon: req.files?.icon?.[0]?.filename || null,
      };
      const savedClassified = await Classified.create(classifiedData);
      res.status(201).json({
        success: true,
        savedShop: savedClassified,
      });
    } catch (error) {
      await deletefilewithfoldername(
        uploadPath,
        req.files?.image?.[0]?.filename
      );
      await deletefilewithfoldername(
        uploadPath,
        req.files?.icon?.[0]?.filename
      );
      console.log(error);
      res.status(401).json({
        success: false,
        message: error.message,
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
      const { id } = req.params;
      const item = await Classified.findByPk(id);
      if (!item) {
        await deletefilewithfoldername(
          uploadPath,
          req.files?.image?.[0]?.filename
        );
        await deletefilewithfoldername(
          uploadPath,
          req.files?.icon?.[0]?.filename
        );
        return res
          .status(404)
          .json({ success: false, message: "Item not found" });
      }
      let newImage = null;
      let newIcon = null;
      if (req.files?.image) {
        if (item.image) {
          const oldImagePath = path.join(uploadPath, item.image);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
        newImage = req.files.image[0].filename;
      }

      if (req.files?.icon) {
        if (item.icon) {
          const oldIconPath = path.join(uploadPath, item.icon);
          if (fs.existsSync(oldIconPath)) {
            fs.unlinkSync(oldIconPath);
          }
        }
        newIcon = req.files.icon[0].filename;
      }
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
      return res.status(200).json({ success: true, item });
    } catch (error) {
      console.log(error);
      await deletefilewithfoldername(
        uploadPath,
        req.files?.image?.[0]?.filename
      );
      await deletefilewithfoldername(
        uploadPath,
        req.files?.icon?.[0]?.filename
      );
      return res.status(500).json({ success: false, message: error.message });
    }
  },
  deleteClassfied: async (req, res) => {
    try {
      const { id } = req.params;
      const item = await Classified.findByPk(id);
      if (!item) {
        return res
          .status(404)
          .json({ success: false, message: "Item not found" });
      }
      await item.update({ trash: true });
      return res.status(200).json({ success: true, item });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ success: false, message: "Internal Sever Error" });
    }
  },
  restoreClassfied: async (req, res) => {
    try {
      const { id } = req.params;
      const item = await Classified.findByPk(id);
      if (!item) {
        return res
          .status(404)
          .json({ success: false, message: "Item not found" });
      }
      await item.update({ trash: false });
      return res.status(200).json({ success: true, item });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },
  getClassfieds: async (req, res) => {
    const search = req.query.search || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    let whereCondition = {};
    if (search) {
      whereCondition = {
        [Op.or]: [
          { itemName: { [Op.like]: `%${search}%` } },
          { "$itemCategory.categoryName$": { [Op.like]: `%${search}%` } },
        ],
      };
    }
    try {
      const { count, rows: classifieds } = await Classified.findAndCountAll({
        limit,
        offset,
        where: whereCondition,
        attributes: ["id", "itemName", "priority", "trash"],
        include: [
          {
            model: Category,
            attributes: ["id", "categoryName"],
            as: "itemCategory",
          },
        ],
        order: [["createdAt", "DESC"]],
      });
      if (!classifieds) {
        return res
          .status(404)
          .json({ success: false, message: "No classifieds found" });
      }
      const totalPages = Math.ceil(count / limit);
      return res.status(200).json({
        success: true,
        count,
        totalPages,
        currentPage: page,
        data: classifieds,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },
  getClassfiedById: async (req, res) => {
    try {
      const { id } = req.params;
      const classified = await Classified.findByPk(id, {
        include: [
          {
            model: Category,
            attributes: ["id", "categoryName"],
            as: "itemCategory",
          },
        ],
      });
      if (!classified) {
        return res
          .status(404)
          .json({ success: false, message: "Classified not found" });
      }
      return res.status(200).json({ success: true, data: classified });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },
  getClassfiedCategories: async (req, res) => {
    try {
      const classifiedCategories = await Type.findOne({
        where: { typeName: "classified" },
        attributes: [],
        include: {
          model: Category,
          attributes: ["id", "categoryName"],
          as: "category",
        },
      });
      res.status(200).json({ success: true, classifiedCategories });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
};
