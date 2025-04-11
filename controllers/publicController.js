const Shop = require("../models/Shop");
const Feedback = require("../models/Feedback");
const Medical = require("../models/MedDirectory");
const VehicleSchedule = require("../models/VehicleSchedule");
const Emergency = require("../models/Emergency");
const VehicleService = require("../models/VehicleService");
const Worker = require("../models/Worker");
const Classified = require("../models/Classified");
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
        subQuery:false,
      });
      // console.log("✅ Shops sorted by rating:", JSON.stringify(shops, null, 2));
      res.json({ message: "Top-rated shops", data: shops });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error fetching shops", error });
    }
  },
  getShops: async (req, res) => {
    try {
      const shops = await Shop.findAll({
        attributes: ["image", "shopName", "location", "priority"],
        where: { trash: false }, // Exclude shops marked as trash
      });
      res.status(201).json({
        status: "SUCCESS",
        shops,
      });
    } catch (error) {
      console.error("Error fetching shops:", error);
      res.status(500).json({
        status: "failed",
        message: "Error fetching shops",
      });
    }
  },
  getShopById: async (req, res) => {
    try {
      const { shopId } = req.params;
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
        where: { id: shopId, trash: false },
        group: ["Shop.id"],
      });

      if (!shop) {
        return res.status(404).json({ error: "Shop not found" });
      }

      res.status(201).json({
        status: "SUCCESS",
        shop,
      });
    } catch (error) {
      console.error("Error fetching shop:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
  getDocters: async (req, res) => {
    try {
      const doctors = await Medical.findAll({
        attributes: ["name", "image", "searchSubcategory"],
        where: { searchCategory: "doctor", trash: false },
      });
      res.status(200).json({
        status: "SUCCESS",
        doctors,
      });
    } catch (error) {
      console.error("Error fetching doctors:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
  getDocterById: async (req, res) => {
    try {
      const { docterId } = req.params;
      const doctor = await Medical.findOne({
        where: { id: docterId, searchCategory: "doctor", trash: false },
      });

      if (!doctor) {
        return res.status(404).json({ error: "Doctor not found" });
      }

      res.json({
        status: "success",
        doctor,
      });
    } catch (error) {
      console.error("Error fetching doctor:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
  getBusSchedule: async (req, res) => {
    try {
      const buses = await VehicleSchedule.findAll({
        where: { category: "bus" },
      });
      res.status(200).json({
        status: "success",
        buses,
      });
    } catch (error) {
      console.error("Error fetching bus schedules:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
  getTrainSchedule: async (req, res) => {
    try {
      const trains = await VehicleSchedule.findAll({
        where: { category: "train" },
      });
      res.status(200).json({
        status: "success",
        trains,
      });
    } catch (error) {
      console.error("Error fetching train schedules:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
  getHospitals: async (req, res) => {
    try {
      const doctors = await Medical.findAll({
        attributes: ["name", "image", "searchSubcategory"],
        where: { searchCategory: "hospital", trash: false },
      });
      res.status(200).json({
        status: "success",
        doctors,
      });
    } catch (error) {
      console.error("Error fetching doctors:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
  getHospitalsById: async (req, res) => {
    try {
      const { hospitalId } = req.params;
      const doctor = await Medical.findOne({
        where: { id: hospitalId, searchCategory: "hospital", trash: false },
      });

      if (!doctor) {
        return res.status(404).json({ error: "Hospital not found" });
      }

      res.json(doctor);
    } catch (error) {
      console.error("Error fetching Hospital:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
  getEmergencies: async (req, res) => {
    try {
      const emergencies = await Emergency.findAll({
        where: { trash: false },
      });
      res.json(emergencies);
    } catch (error) {
      console.error("Error fetching emergencies:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
  getVehicleService: async (req, res) => {
    try {
      const services = await VehicleService.findAll({
        attributes: ["selectCategory", "vehicleNumber", "image"],
        where: { trash: false },
      });
      res.json(services);
    } catch (error) {
      console.error("Error fetching vehicle services:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
  getVehicleServiceById: async (req, res) => {
    try {
      const { id } = req.params;
      const vehicleService = await VehicleService.findOne({
        where: { id },
      });

      if (!vehicleService) {
        return res.status(404).json({ error: "Vehicle service not found" });
      }

      res.json(vehicleService);
    } catch (error) {
      console.error("Error fetching vehicle service:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
  getLocalWorkers: async (req, res) => {
    try {
      const services = await Worker.findAll({
        attributes: ["name", "categories", "image"],
        where: { trash: false },
      });
      res.json(services);
    } catch (error) {
      console.error("Error fetching workers Data:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
  getLocalWorkersById: async (req, res) => {
    try {
      const { id } = req.params;
      const Worker = await Worker.findOne({
        where: { id, trash: false },
      });

      if (!Worker) {
        return res.status(404).json({ error: "Worker not found" });
      }

      res.json(vehicleService);
    } catch (error) {
      console.error("Error fetching Worker data:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
  getClassified: async (req, res) => {
    try {
      const classified = await Classified.findAll({
        attributes: ["itemName", "price", "image"],
        where: { trash: false },
      });
      res.json(classified);
    } catch (error) {
      console.error("Error fetching classifed Data:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
  getClassifiedById: async (req, res) => {
    try {
      const { id } = req.params;
      const Worker = await Classified.findOne({
        where: { id, trash: false },
      });

      if (!Worker) {
        return res.status(404).json({ error: "Classfied not found" });
      }

      res.json(vehicleService);
    } catch (error) {
      console.error("Error fetching Classifed data:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
};
