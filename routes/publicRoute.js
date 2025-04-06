const express = require("express");
const router = express.Router();

const publicController = require("../controllers/publicController");

router.get("/",publicController.homePage);
router.get("/shops",publicController.getShops);
router.get("/shop/:shopId",publicController.getShopById);
router.get("/docters",publicController.getDocters);
router.get("/docter/:docterId",publicController.getDocterById);
router.get("/busSchedule",publicController.getBusSchedule);
router.get("/trainSchedule",publicController.getTrainSchedule);
router.get("/hospitals",publicController.getHospitals);
router.get("/hospital/:hospitalId",publicController.getHospitalsById);
router.get("/emergency",publicController.getEmergencies);
router.get("/vehicle-services",publicController.getVehicleService);
router.get("/vehicle-service/:id",publicController.getVehicleServiceById);

module.exports = router