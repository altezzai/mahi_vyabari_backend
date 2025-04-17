const Shop = require("../models/Shop");
const Feedback = require("../models/Feedback");
const Medical = require("../models/MedDirectory");
const VehicleSchedule = require("../models/VehicleSchedule");
const Emergency = require("../models/Emergency");
const VehicleService = require("../models/VehicleService");
const Worker = require("../models/Worker");
const Classified = require("../models/Classified");
const ShopCategory = require("../models/ShopCategory");
const { Sequelize, where, Op } = require("sequelize");

module.exports = {
  homePage: async (req, res) => {
    const search = req.query.search || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    let whereCondition = {};
    if (search) {
      whereCondition = {
        shopName: { [Op.like]: `%${search}%` },
        trash: false,
      };
    }
    try {
      const shops = await Shop.findAll({
        limit,
        offset,
        where: whereCondition,
        attributes: [
          "id",
          "shopName",
          [
            Sequelize.fn("AVG", Sequelize.col("feedbacks.rating")),
            "averageRating",
          ],
        ],
        include: [
          {
            model: Feedback,
            as: "feedbacks",
            attributes: [],
          },
        ],
        group: ["Shop.id"],
        order: [[Sequelize.literal("averageRating"), "DESC"]],
        subQuery: false,
      });
      res.json({ success: true, data: shops });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  },
  getShops: async (req, res) => {
    try {
      const searchQuery = req.query.q || "";
      const area = req.query.area || "";
      const category = req.query.category || "";
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;
      let whereCondition = { trash: false };
      if (searchQuery) {
        whereCondition = {
          shopName: { [Op.like]: `%${searchQuery}%` },
        };
      }
      if (area) {
        whereCondition = {
          areas: area,
        };
      }
      if (category) {
        const shopCategoryEntries = await ShopCategory.findAll({
          where: { categoryId: category },
          attributes: ["shopId"],
        });

        const shopIds = shopCategoryEntries.map((entry) => entry.shopId);

        // If no matching shops for category, return empty result
        if (shopIds.length === 0) {
          return res.status(200).json({
            success: true,
            totalPages: 0,
            currentPage: page,
            data: ["No shops found"],
          });
        }

        whereCondition.id = shopIds;
      }

      const { count, rows: shops } = await Shop.findAndCountAll({
        limit,
        offset,
        attributes: [
          "id",
          "image",
          "shopName",
          "location",
          "priority",
          "areas",
        ],
        where: whereCondition,
        order: [["priority", "ASC"]],
      });
      const totalPages = Math.ceil(count / limit);
      res.status(200).json({
        success: true,
        totalPages,
        currentPage: page,
        data: shops,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  },
  getShopById: async (req, res) => {
    try {
      const { id } = req.params;
      const shop = await Shop.findOne({
        attributes: [
          "id",
          "shopName",
          "image",
          "icon",
          "categories",
          "phone",
          "whatsapp",
          "website",
          "location",
          "description",
          "address",
          "openingTime",
          "closingTime",
          "workingDays",
          "priority",
          "areas",
          [
            Sequelize.fn("AVG", Sequelize.col("Feedbacks.rating")),
            "averageRating",
          ],
        ],
        include: [
          {
            model: Feedback,
            attributes: [],
            as: "Feedbacks",
          },
        ],
        where: { id, trash: false },
        group: ["Shop.id"],
      });
      if (!shop) {
        return res
          .status(404)
          .json({ success: false, message: "Shop Not Found" });
      }
      res.status(201).json({
        success: true,
        shop,
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },
  getDocters: async (req, res) => {
    try {
      const doctors = await Medical.findAll({
        attributes: ["name", "image", "searchSubcategory"],
        where: { category: "doctor", trash: false },
      });
      res.status(200).json({
        success: true,
        doctors,
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },
  getDocterById: async (req, res) => {
    try {
      const { id } = req.params;
      const doctor = await Medical.findOne({
        where: { id, category: "doctor", trash: false },
      });
      if (!doctor) {
        return res
          .status(404)
          .json({ success: false, message: "Doctor not found" });
      }
      res.json({
        success: true,
        doctor,
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },
  getBusSchedules: async (req, res) => {
    try {
      const buses = await VehicleSchedule.findAll({
        where: { category: "bus" },
      });
      res.status(200).json({
        success: true,
        buses,
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },
  getTrainSchedules: async (req, res) => {
    try {
      const trains = await VehicleSchedule.findAll({
        where: { category: "train" },
      });
      res.status(200).json({
        success: true,
        trains,
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },
  getHospitals: async (req, res) => {
    try {
      const hospitals = await Medical.findAll({
        attributes: ["name", "image", "searchSubcategory"],
        where: { searchCategory: "hospital", trash: false },
      });
      res.status(200).json({
        success: true,
        hospitals,
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },
  getHospitalsById: async (req, res) => {
    try {
      const { id } = req.params;
      const hospital = await Medical.findOne({
        where: { id, category: "hospital", trash: false },
      });
      if (!hospital) {
        return res
          .status(404)
          .json({ success: false, message: "Hospital not found" });
      }
      res.json({ success: true, hospital });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },
  getEmergencies: async (req, res) => {
    try {
      const emergencies = await Emergency.findAll({
        where: { trash: false },
      });
      res.json({ success: true, emergencies });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },
  getVehicleServices: async (req, res) => {
    try {
      const vehicleServices = await VehicleService.findAll({
        attributes: ["selectCategory", "vehicleNumber", "image"],
        where: { trash: false },
      });
      res.status(200).json({ success: true, vehicleServices });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },
  getVehicleServiceById: async (req, res) => {
    try {
      const { id } = req.params;
      const vehicleService = await VehicleService.findOne({
        where: { id },
      });
      if (!vehicleService) {
        return res
          .status(404)
          .json({ success: false, message: "Vehicle service not found" });
      }
      res.status(200).json({ success: true, vehicleService });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },
  getLocalWorkers: async (req, res) => {
    try {
      const workers = await Worker.findAll({
        attributes: ["name", "categories", "image"],
        where: { trash: false },
      });
      res.json({ success: true, workers });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },
  getLocalWorkersById: async (req, res) => {
    try {
      const { id } = req.params;
      const worker = await Worker.findOne({
        where: { id, trash: false },
      });
      if (!worker) {
        return res
          .status(404)
          .json({ success: false, message: "Worker not found" });
      }
      res.status(200).json({ success: true, worker });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },
  getClassifieds: async (req, res) => {
    try {
      const classifieds = await Classified.findAll({
        attributes: ["itemName", "price", "image"],
        where: { trash: false },
      });
      res.status(200).json({ success: true, classifieds });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },
  getClassifiedById: async (req, res) => {
    try {
      const { id } = req.params;
      const classified = await Classified.findOne({
        where: { id, trash: false },
      });
      if (!classified) {
        return res
          .status(404)
          .json({ success: false, message: "Classfied not found" });
      }
      res.status(200).json({ success: true, classified });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },
};
