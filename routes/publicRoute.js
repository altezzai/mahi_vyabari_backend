const express = require("express");
const router = express.Router();

const publicController = require("../controllers/publicController");

router.get("/", publicController.homePage);
router.get("/shops", publicController.getShops);
router.get("/shop/:id", publicController.getShopById);
router.get("/docters", publicController.getDocters);
router.get("/docter/:id", publicController.getDocterById);
router.get("/busSchedule", publicController.getBusSchedules);
router.get("/trainSchedule", publicController.getTrainSchedules);
router.get("/hospitals", publicController.getHospitals);
router.get("/hospital/:id", publicController.getHospitalsById);
router.get("/emergency", publicController.getEmergencies);
router.get("/vehicle-services", publicController.getVehicleServices);
router.get("/vehicle-service/:id", publicController.getVehicleServiceById);

module.exports = router;
