const express = require("express");
const router = express.Router();

const publicController = require("../controllers/publicController");

router.get("/", publicController.homePage);
router.get("/shops", publicController.getShops);
router.get("/shop/:id", publicController.getShopById);
router.get("/product/:id", publicController.getProductById);
router.get("/docters", publicController.getDoctors);
router.get("/docter/:id", publicController.getDoctorById);
router.get("/busSchedule", publicController.getBusSchedules);
router.get("/vehicleSchedule", publicController.getVehicleSchedules);
router.get("/hospitals", publicController.getHospitals);
router.get("/hospital/:id", publicController.getHospitalsById);
router.get("/emergency", publicController.getEmergencies);
router.get("/vehicle-services", publicController.getVehicleServices);
router.get("/vehicle-service/:id", publicController.getVehicleServiceById);
router.get("/workers", publicController.getLocalWorkers);
router.get("/worker/:id", publicController.getLocalWorkersById);
router.get("/classifieds", publicController.getClassifieds);
router.get("/classified/:id", publicController.getClassifiedById);
router.get("/tourism", publicController.getTourism);
router.get("/tourism/:id", publicController.getTourismById);
router.get("/shop-categories", publicController.getShopCategories);
router.get("/worker-categories", publicController.getWorkerCategory);
router.get("/classified-categories", publicController.getClassifiedCategory);
router.get("/areas", publicController.getAreas);
router.get("/banners", publicController.getBanners);

module.exports = router;
