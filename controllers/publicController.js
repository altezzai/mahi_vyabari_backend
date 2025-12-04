const { Sequelize } = require("sequelize");
const { Op } = require("sequelize");
const logger = require("../utils/logger");

const {
  Shop,
  Feedback,
  VehicleSchedule,
  Emergency,
  VehicleService,
  Worker,
  Classified,
  ShopCategory,
  WorkerCategory,
  Tourism,
  TourismImage,
  Category,
  Product,
  Type,
  Area,
  ClassifiedImage,
  HealthcareProvider,
  Banner,
} = require("../models");

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
      const tourism = await Tourism.findAll({
        limit: 4,
        attributes: ["id", "placeName"],
        include: [
          {
            model: Area,
            attributes: ["name"],
          },
          {
            model: TourismImage,
            as: "images",
            attributes: ["image"],
          },
        ],
        order: [["id", "DESC"]],
      });
      res.json({ success: true, shops: shops, tourism: tourism });
    } catch (error) {
      console.log(error);
      logger.error(error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
  getShops: async (req, res) => {
    try {
      const searchQuery = req.query.q || "";
      const area_id = req.query.area_id || "";
      const category = req.query.category || "";
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 3;
      const offset = (page - 1) * limit;
      let whereCondition = { trash: false };
      if (searchQuery) {
        whereCondition = {
          ...whereCondition,
          shopName: { [Op.like]: `%${searchQuery}%` },
        };
      }
      if (area_id) {
        whereCondition = {
          ...whereCondition,
          area_id: area_id,
        };
      }
      if (category) {
        const shopCategoryEntries = await ShopCategory.findAll({
          where: { categoryId: category },
          attributes: ["shopId"],
        });
        const shopIds = shopCategoryEntries.map((entry) => entry.shopId);
        if (shopIds.length === 0) {
          return res.status(200).json({
            success: true,
            totalPages: 0,
            currentPage: page,
            data: [],
          });
        }

        whereCondition.id = shopIds;
      }

      const { count, rows: shops } = await Shop.findAndCountAll({
        limit,
        offset,
        distinct: true,
        attributes: [
          "id",
          "image",
          "shopName",
          "priority",
          "area_id",
          "phone",
          "openingTime",
          "closingTime",
          "priority",
          "rating",
        ],
        where: whereCondition,
        include: [
          {
            model: Category,
            attributes: ["id", "categoryName"],
            through: { attributes: [] },
          },
          {
            model: Area,
            attributes: ["id", "name"],
          },
        ],
        order: [
          ["priority", "ASC"],
          ["rating", "DESC"],
        ],
      });
      const totalPages = Math.ceil(count / limit);
      res.status(200).json({
        success: true,
        totalCount: count,
        totalPages,
        currentPage: page,
        data: shops,
      });
    } catch (error) {
      console.error(error);
      logger.error(error);
      res.status(500).json({
        success: false,
        message: error.message,
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
          "area_id",
          "email",
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
          {
            model: Area,
            attributes: ["id", "name"],
          },
          {
            model: Product,
            as: "products",
            separate: true, // <-- IMPORTANT for ordering inside include
            order: [["id", "DESC"]], // <-- ORDER PRODUCTS BY ID DESC
            attributes: [
              "id",
              "productName",
              "image",
              "originalPrice",
              "offerPercentage",
              "offerPrice",
            ],
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
      logger.error(error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
  getProductById: async (req, res) => {
    const { id } = req.params;
    try {
      const product = await Product.findByPk(id, {
        attributes: [
          "id",
          "image",
          "productName",
          "originalPrice",
          "offerPrice",
          "description",
        ],
        include: [
          {
            model: Shop,
            as: "shop",
            attributes: [
              "id",
              "icon",
              "shopName",
              "phone",
              "whatsapp",
              "website",
              "location",
            ],
            include: [
              {
                model: Category,
                attributes: ["id", "categoryName"],
                through: { attributes: [] },
              },
            ],
          },
        ],
      });
      if (!product) {
        res
          .status(400)
          .json({ success: false, message: "Product is not found" });
      }
      res.status(200).json({
        success: true,
        product,
      });
    } catch (error) {}
  },
  getDoctors: async (req, res) => {
    const searchQuery = req.query.q || "";
    const area_id = req.query.area_id || "";
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
    if (area_id) {
      whereCondition = {
        ...whereCondition,
        area_id: area_id,
      };
    }
    try {
      const { count, rows: doctors } = await HealthcareProvider.findAndCountAll(
        {
          limit,
          offset,
          distinct: true,
          attributes: [
            "id",
            "name",
            "image",
            "category",
            "trash",
            "area_id",
            "openingTime",
            "closingTime",
            "priority",
            "phone",
          ],
          where: whereCondition,
          include: [
            {
              model: Category,
              attributes: ["id", "categoryName"],
              as: "categoryInfo",
            },
            {
              model: Area,
              attributes: ["id", "name"],
            },
          ],
          order: [["priority", "ASC"]],
        }
      );
      const totalPages = Math.ceil(count / limit);
      res.status(200).json({
        success: true,
        totalPages,
        currentPage: page,
        data: doctors,
      });
    } catch (error) {
      console.error(error);
      logger.error(error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
  getDoctorById: async (req, res) => {
    try {
      const { id } = req.params;
      const doctor = await HealthcareProvider.findOne({
        where: { id },
        include: [
          {
            model: Category,
            attributes: ["id", "categoryName"],
            as: "categoryInfo",
          },
          {
            model: Area,
            attributes: ["id", "name"],
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
      logger.error(error);
      res.status(500).json({ success: false, message: error.message });
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
        distinct: true,

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
      logger.error(error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
  getVehicleSchedules: async (req, res) => {
    const from = req.query.from || "";
    const via = req.query.via || "";
    const to = req.query.to || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    let whereCondition = { trash: false, category: "bus" };
    if (from) {
      whereCondition.from = from;
    }
    if (to) {
      whereCondition.to = to;
    }
    if (via) {
      whereCondition.via = via;
    }
    try {
      const { count, rows: trains } = await VehicleSchedule.findAndCountAll({
        limit,
        offset,
        distinct: true,
        where: whereCondition,
        order: [["departureTime", "ASC"]],
      });
      const totalPages = Math.ceil(count / limit);
      res.status(200).json({
        success: true,
        totalContents: count,
        totalPages,
        currentPage: page,
        data: trains,
      });
    } catch (error) {
      console.error(error);
      logger.error(error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
  getHospitals: async (req, res) => {
    const searchQuery = req.query.q || "";
    const area_id = req.query.area_id || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    let whereCondition = { trash: false, category: "hospital" };
    if (searchQuery) {
      whereCondition = {
        ...whereCondition,
        [Op.or]: [
          { name: { [Op.like]: `%${searchQuery}%` } },
          { "$categoryInfo.categoryName$": { [Op.like]: `%${searchQuery}%` } },
        ],
      };
    }
    if (area_id) {
      whereCondition = {
        ...whereCondition,
        area_id: area_id,
      };
    }
    try {
      const { count, rows: hospitals } =
        await HealthcareProvider.findAndCountAll({
          limit,
          offset,
          distinct: true,
          attributes: [
            "id",
            "name",
            "image",
            "icon",
            "trash",
            "category",
            "priority",
            "area_id",
          ],
          where: whereCondition,
          include: [
            {
              model: Category,
              attributes: ["id", "categoryName"],
              as: "categoryInfo",
            },
            {
              model: Area,
              attributes: ["id", "name"],
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
      logger.error(error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
  getHospitalsById: async (req, res) => {
    try {
      const { id } = req.params;
      const hospital = await HealthcareProvider.findOne({
        where: { id },
        include: [
          {
            model: Category,
            attributes: ["id", "categoryName"],
            as: "categoryInfo",
          },
          {
            model: Area,
            attributes: ["id", "name"],
          },
        ],
      });
      if (!hospital) {
        return res
          .status(404)
          .json({ success: false, message: "Hospital not found" });
      }
      res.json({ success: true, hospital });
    } catch (error) {
      console.error(error);
      logger.error(error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
  getEmergencies: async (req, res) => {
    const searchQuery = req.query.q || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    let whereCondition = { trash: false };
    if (searchQuery) {
      whereCondition = {
        ...whereCondition,
        emergencyName: { [Op.like]: `%${searchQuery}%` },
      };
    }
    try {
      const { count, rows: emergencies } = await Emergency.findAndCountAll({
        limit,
        offset,
        distinct: true,
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
      logger.error(error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
  getVehicleServices: async (req, res) => {
    const searchQuery = req.query.q || "";
    const area_id = req.query.area_id || "";
    const category = req.query.category || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    let whereCondition = { trash: false };
    if (searchQuery) {
      whereCondition = {
        ...whereCondition,
        ownerName: { [Op.like]: `%${searchQuery}%` },
      };
    }
    if (area_id) {
      whereCondition = {
        ...whereCondition,
        area_id: area_id,
      };
    }
    if (category) {
      whereCondition = {
        ...whereCondition,
        category: category,
      };
    }
    try {
      const { count, rows: vehicleServices } =
        await VehicleService.findAndCountAll({
          limit,
          offset,
          distinct: true,
          attributes: ["id", "ownerName", "vehicleNumber", "image", "priority"],
          where: whereCondition,
          include: [
            {
              model: Category,
              as: "taxiCategory",
              attributes: ["categoryName", "id"],
            },
            {
              model: Area,
              attributes: ["id", "name"],
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
      logger.error(error);
      res.status(500).json({ success: false, message: error.message });
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
          {
            model: Area,
            attributes: ["id", "name"],
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
      logger.error(error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
  getLocalWorkers: async (req, res) => {
    const searchQuery = req.query.q || "";
    const area_id = req.query.area_id || "";
    const category = req.query.category || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    let whereCondition = { trash: false };
    if (searchQuery) {
      whereCondition = {
        ...whereCondition,
        workerName: { [Op.like]: `%${searchQuery}%` },
      };
    }
    if (area_id) {
      whereCondition = {
        ...whereCondition,
        area_id: area_id,
      };
    }
    if (category) {
      const workerCategoryEntries = await WorkerCategory.findAll({
        where: { categoryId: category },
        attributes: ["workerId"],
      });
      const workerIds = workerCategoryEntries.map((entry) => entry.workerId);
      if (workerIds.length === 0) {
        return res.status(200).json({
          success: true,
          totalPages: 0,
          currentPage: page,
          data: [],
        });
      }

      whereCondition.id = workerIds;
    }
    try {
      const { count, rows: workers } = await Worker.findAndCountAll({
        limit,
        offset,
        distinct: true,
        attributes: [
          "id",
          "workerName",
          "image",
          "area_id",
          "phone",
          "priority",
        ],
        where: whereCondition,
        include: [
          {
            model: Area,
            attributes: ["id", "name"],
          },
        ],
        order: [["priority", "ASC"]],
      });
      const totalPages = Math.ceil(count / limit);
      res.json({ success: true, totalPages, currentPage: page, data: workers });
    } catch (error) {
      console.error(error);
      logger.error(error);
      res.status(500).json({ success: false, message: error.message });
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
      logger.error(error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
  getClassifieds: async (req, res) => {
    const searchQuery = req.query.q || "";
    const area_id = req.query.area_id || "";
    const category = req.query.category || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    let whereCondition = { trash: false };
    if (searchQuery) {
      whereCondition = {
        ...whereCondition,
        itemName: { [Op.like]: `%${searchQuery}%` },
      };
    }
    if (area_id) {
      whereCondition = {
        ...whereCondition,
        area_id: area_id,
      };
    }
    if (category) {
      whereCondition = {
        ...whereCondition,
        category: category,
      };
    }
    const today = new Date();
    whereCondition = {
      ...whereCondition,
      [Op.or]: [{ fromDate: { [Op.lte]: today } }, { fromDate: null }],
      [Op.or]: [
        { validityDate: { [Op.gte]: today } }, // valid products
        { validityDate: null }, // allow NULL validityDate
      ],
    };
    try {
      const { count, rows: classifieds } = await Classified.findAndCountAll({
        limit,
        offset,
        distinct: true,
        attributes: [
          "id",
          "itemName",
          "price",
          "image",
          "phone",
          "priority",
          "fromDate",
          "validityDate",
        ],
        where: whereCondition,
        include: [
          {
            model: Category,
            as: "itemCategory",
            attributes: ["id", "categoryName"],
          },
          {
            model: Area,
            attributes: ["id", "name"],
          },
          {
            model: ClassifiedImage,
            attributes: ["id", "image"],
            separate: true,
            order: [["id", "ASC"]],
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
      logger.error(error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
  getClassifiedById: async (req, res) => {
    try {
      const { id } = req.params;
      const today = new Date();

      const classified = await Classified.findOne({
        where: { id, trash: false },
        include: [
          {
            model: Category,
            as: "itemCategory",
            attributes: ["id", "categoryName"],
          },
          {
            model: ClassifiedImage,
            attributes: ["image"],
          },
          {
            model: Area,
            attributes: ["id", "name"],
          },
        ],
      });

      if (!classified) {
        return res
          .status(404)
          .json({ success: false, message: "Classfied not found" });
      }
      if (classified.validityDate) {
        if (classified.validityDate < today) {
          return res
            .status(404)
            .json({ success: false, message: "This classified is expired" });
        }
      }
      res.status(200).json({ success: true, classified });
    } catch (error) {
      console.error(error);
      logger.error(error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
  getTourism: async (req, res) => {
    const area_id = req.query.area_id || "";
    const searchQuery = req.query.q || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    let whereCondition = { trash: false };
    if (area_id) {
      whereCondition = {
        ...whereCondition,
        area_id: area_id,
      };
    }
    if (searchQuery) {
      whereCondition = {
        ...whereCondition,
        placeName: { [Op.like]: `%${searchQuery}%` },
      };
    }
    try {
      const { count, rows: tourism } = await Tourism.findAndCountAll({
        limit,
        offset,
        distinct: true,
        attributes: ["id", "placeName"],
        where: whereCondition,
        include: [
          {
            model: TourismImage,
            as: "images",
            attributes: ["image"],
          },
          {
            model: Area,
            attributes: ["id", "name"],
          },
        ],
      });
      const totalPages = Math.ceil(count / limit);
      res
        .status(200)
        .json({ success: true, totalPages, currentPage: page, data: tourism });
    } catch (error) {
      console.error(error);
      logger.error(error);
      res.status(500).json({ success: true, message: error.message });
    }
  },
  getTourismById: async (req, res) => {
    try {
      const { id } = req.params;
      const tourism = await Tourism.findOne({
        where: { id },
        include: [
          {
            model: TourismImage,
            as: "images",
            attributes: ["image"],
          },
        ],
      });
      if (!tourism) {
        return res
          .status(404)
          .json({ success: false, message: "Tourism not found" });
      }
      res.status(200).json({ success: true, data: tourism });
    } catch (error) {
      console.log(error);
      logger.error(error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
  getShopCategories: async (req, res) => {
    try {
      const shopCategories = await Type.findAll({
        where: { typeName: "shop" },
        attributes: [],
        include: [
          {
            model: Category,
            where: { trash: false },
            attributes: ["id", "categoryName", "icon"],
            as: "category",
          },
        ],
      });
      return res.status(200).json({ success: true, shopCategories });
    } catch (error) {
      console.log(error);
      logger.error(error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },
  getWorkerCategory: async (req, res) => {
    try {
      const workerCategory = await Type.findAll({
        where: { typeName: "worker" },
        attributes: [],
        include: [
          {
            model: Category,
            where: { trash: false },
            attributes: ["id", "categoryName", "icon"],
            as: "category",
          },
        ],
      });
      return res.status(200).json({ success: true, workerCategory });
    } catch (error) {
      console.log(error);
      logger.error(error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },
  getClassifiedCategory: async (req, res) => {
    try {
      const classifiedCategories = await Type.findAll({
        where: { typeName: "classified" },
        attributes: [],
        include: [
          {
            model: Category,
            where: { trash: false },
            attributes: ["id", "categoryName", "icon"],
            as: "category",
          },
        ],
      });
      return res.status(200).json({ success: true, classifiedCategories });
    } catch (error) {
      console.log(error);
      logger.error(error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },
  getAreas: async (req, res) => {
    try {
      const areas = await Area.findAll({
        where: { trash: false }, // Only get non-deleted areas
        order: [["name", "ASC"]],
        attributes: ["id", "name"],
      });
      return res.status(200).json({ success: true, areas });
    } catch (error) {
      console.log(error);
      logger.error(error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },
  getBanners: async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const type = req.query.type || "type1";
      const banners = await Banner.findAll({
        limit,
        where: { banner_type: type, trash: false },
        attributes: ["id", "banner_image_large", "banner_image_small", "url"],
        order: [["createdAt", "DESC"]],
      });
      return res.status(200).json({ success: true, banners });
    } catch (error) {
      console.log(error);
      logger.error(error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },
};
