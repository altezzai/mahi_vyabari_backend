const Shop = require("../models/Shop");
const Feedback = require("../models/Feedback");
const Medical = require("../models/MedDirectory");
const VehicleSchedule = require("../models/VehicleSchedule");
const Emergency = require("../models/Emergency");
const VehicleService = require("../models/VehicleService");
const Worker = require("../models/Worker");
const Classified = require("../models/Classified");
const ShopCategory = require("../models/ShopCategory");
const WorkerCategory = require("../models/WorkerCategory");
const Tourism = require("../models/Tourism");
const { Sequelize, where, Op } = require("sequelize");
const Category = require("../models/Category");

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
          area: area,
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
        attributes: ["id", "image", "shopName", "location", "priority", "area"],
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
          "area",
          [
            Sequelize.literal(`(
              SELECT AVG(rating)
              FROM feedbacks AS f
              WHERE f.shopId = Shop.id
            )`),
            "averageRating",
          ],      
        ],
        where: { id },
        include: [
          {
            model: Feedback,
            attributes: [],
            as: "feedbacks",
          },
          {
            model: Category,
            attributes: ["id", "categoryName"],
            through: { attributes: [] },
          },
        ],
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
    const searchQuery = req.query.q || "";
    const area = req.query.area || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    let whereCondition = { trash: false, category: "doctor" };
    if (searchQuery) {
      whereCondition = {
        ...whereCondition,
        [Op.or]: [
          { name: { [Op.like]: `%${searchQuery}%` } },
          { "$categoryInfo.categoryName$": { [Op.like]: `%${searchQuery}%` } },
        ],
      };
    }
    if (area) {
      whereCondition = {
        ...whereCondition,
        area: area,
      };
    }
    try {
      const { count, rows: doctors } = await Medical.findAndCountAll({
        limit,
        offset,
        attributes: ["id", "name", "image", "category", "trash", "area"],
        where: whereCondition,
        include: [
          {
            model: Category,
            attributes: ["id", "categoryName"],
            as: "categoryInfo",
          },
        ],
        order: [["priority", "ASC"]],
      });
      const totalPages = Math.ceil(count / limit);
      res.status(200).json({
        success: true,
        totalPages,
        currentPage: page,
        data: doctors,
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
        where: { id },
        include: [
          {
            model: Category,
            attributes: ["id", "categoryName"],
            as: "categoryInfo",
          },
        ],
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
    const via = req.query.via || "mahe";
    const to = req.query.to || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    let whereCondition = { trash: false, category: "bus" };
    if (via && to) {
      whereCondition = {
        ...whereCondition,
        [Op.and]: [
          { via: { [Op.like]: `%${via}%` } },
          { to: { [Op.like]: `%${to}%` } },
        ],
      };
    }
    try {
      const { count, rows: buses } = await VehicleSchedule.findAndCountAll({
        limit,
        offset,
        where: whereCondition,
        order: [["departureTime", "ASC"]],
      });
      const totalPages = Math.ceil(count / limit);
      res.status(200).json({
        success: true,
        totalPages,
        currentPage: page,
        data: buses,
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },
  getTrainSchedules: async (req, res) => {
    const via = req.query.via || "mahe";
    const to = req.query.to || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    let whereCondition = { trash: false, category: "train" };
    if (via && to) {
      whereCondition = {
        ...whereCondition,
        [Op.and]: [
          { via: { [Op.like]: `%${via}%` } },
          { to: { [Op.like]: `%${to}%` } },
        ],
      };
    }
    try {
      const { count, rows: trains } = await VehicleSchedule.findAndCountAll({
        limit,
        offset,
        where: whereCondition,
        order: [["departureTime", "ASC"]],
      });
      const totalPages = Math.ceil(count / limit);
      res.status(200).json({
        success: true,
        totalPages,
        currentPage: page,
        data: trains,
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },
  getHospitals: async (req, res) => {
    const searchQuery = req.query.q || "";
    const area = req.query.area || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    let whereCondition = { trash: false, category: "hospital" };
    if (searchQuery) {
      whereCondition = {
        [Op.or]: [
          { name: { [Op.like]: `%${searchQuery}%` } },
          { "$categoryInfo.categoryName$": { [Op.like]: `%${searchQuery}%` } },
        ],
      };
    }
    if (area) {
      whereCondition = {
        area: area,
      };
    }
    try {
      const { count, rows: hospitals } = await Medical.findAndCountAll({
        limit,
        offset,
        attributes: ["id", "name", "image", "trash", "category", "area"],
        where: whereCondition,
        include: [
          {
            model: Category,
            attributes: ["id", "categoryName"],
            as: "categoryInfo",
          },
        ],
        order: [["priority", "ASC"]],
      });
      const totalPages = Math.ceil(count / limit);
      res.status(200).json({
        success: true,
        totalPages,
        currentPage: page,
        data: hospitals,
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
        where: { id },
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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    try {
      const { count, rows: emergencies } = await Emergency.findAndCountAll({
        limit,
        offset,
        where: { trash: false },
      });
      const totalPages = Math.ceil(count / limit);
      res.json({
        success: true,
        totalPages,
        currentPage: page,
        data: emergencies,
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },
  getVehicleServices: async (req, res) => {
    const searchQuery = req.query.q || "";
    const area = req.query.area || "";
    const category = req.query.category || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    let whereCondition = { trash: false };
    if (searchQuery) {
      whereCondition = {
        ownerName: { [Op.like]: `%${searchQuery}%` },
      };
    }
    if (area) {
      whereCondition = {
        area: area,
      };
    }
    if (category) {
      whereCondition = {
        category: category,
      };
    }
    try {
      const { count, rows: vehicleServices } =
        await VehicleService.findAndCountAll({
          limit,
          offset,
          attributes: ["id", "ownerName", "vehicleNumber", "image"],
          where: whereCondition,
          include: [
            {
              model: Category,
              as: "taxiCategory",
              attributes: ["categoryName", "id"],
            },
          ],
          order: [["priority", "ASC"]],
        });
      const totalPages = Math.ceil(count / limit);
      res.status(200).json({
        success: true,
        totalPages,
        currentPage: page,
        data: vehicleServices,
      });
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
        include: [
          {
            model: Category,
            as: "taxiCategory",
            attributes: ["categoryName", "id"],
          },
        ],
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
    const searchQuery = req.query.q || "";
    const area = req.query.area || "";
    const category = req.query.category || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    let whereCondition = { trash: false };
    if (searchQuery) {
      whereCondition = {
        workerName: { [Op.like]: `%${searchQuery}%` },
      };
    }
    if (area) {
      whereCondition = {
        area: area,
      };
    }
    if (category) {
      const workerCategoryEntries = await WorkerCategory.findAll({
        where: { categoryId: category },
        attributes: ["workerId"],
      });
      const workerIds = workerCategoryEntries.map((entry) => entry.workerId);
      // If no matching shops for category, return empty result
      if (workerIds.length === 0) {
        return res.status(200).json({
          success: true,
          totalPages: 0,
          currentPage: page,
          data: ["No shops found"],
        });
      }

      whereCondition.id = workerIds;
    }
    try {
      const { count, rows: workers } = await Worker.findAndCountAll({
        limit,
        offset,
        attributes: ["id", "workerName", "image"],
        where: whereCondition,
        order: [["priority", "ASC"]],
      });
      const totalPages = Math.ceil(count / limit);
      res.json({ success: true, totalPages, currentPage: page, data: workers });
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
    const searchQuery = req.query.q || "";
    const area = req.query.area || "";
    const category = req.query.category || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    let whereCondition = { trash: false };
    if (searchQuery) {
      whereCondition = {
        itemName: { [Op.like]: `%${searchQuery}%` },
      };
    }
    if (area) {
      whereCondition = {
        area: area,
      };
    }
    if (category) {
      whereCondition = {
        category: category,
      };
    }
    try {
      const { count, rows: classifieds } = await Classified.findAndCountAll({
        limit,
        offset,
        attributes: ["itemName", "price", "image"],
        where: whereCondition,
        include: [
          {
            model: Category,
            as: "itemCategory",
            attributes: ["id", "categoryName"],
          },
        ],
        order: [["priority", "ASC"]],
      });
      const totalPages = Math.ceil(count / limit);
      res.status(200).json({
        success: true,
        totalPages,
        currentPage: page,
        data: classifieds,
      });
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
        where: { id },
        include: [
          {
            model: Category,
            as: "itemCategory",
            attributes: ["id", "categoryName"],
          },
        ],
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
  getTourism: async (req, res) => {
    const area = req.query.area || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    let whereCondition = { trash: false };
    if (area) {
      whereCondition = {
        area: area,
      };
    }
    try {
      const { count, rows: tourism } = await Tourism.findAndCountAll({
        limit,
        offset,
        attributes: ["id", "placeName", "images"],
        where: whereCondition,
      });
      const totalPages = Math.ceil(count / limit);
      res
        .status(200)
        .json({ success: true, totalPages, currentPage: page, data: tourism });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: true, message: "Internal Server Error" });
    }
  },
  getTourismById: async (req, res) => {
    try {
      const { id } = req.params;
      const tourism = await Tourism.findOne({ where: { id } });
      if (!tourism) {
        return res
          .status(404)
          .json({ success: false, message: "Tourism not found" });
      }
      res.status(200).json({ success: true, data: tourism });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },
};
