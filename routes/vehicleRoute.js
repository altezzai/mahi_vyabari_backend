const express = require("express");
const router = express.Router();

const vehicleController = require("../controllers/vehicleController");
const userAuth = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const multerInstance = require("../middleware/upload");
// router.use(userAuth, authorizeRoles("admin"));
const vehicleUploadFields = [
  { name: "image", maxCount: 1 },
  { name: "icon", maxCount: 1 },
];

router.post("/add-vehicleSchedule", vehicleController.addVehicleSchedule);
router.put(
  "/update-vehicleSchedule/:id",
  vehicleController.updateVehicleSchedule
);
router.patch(
  "/delete-vehicleSchedule/:id",
  vehicleController.deleteVehicleSchedule
);
router.patch(
  "/restore-vehicleSchedule/:id",
  vehicleController.restoreVehicleSchedule
);
router.get("/get-vehicleSchedules", vehicleController.getVehicleSchedules);
router.get(
  "/get-vehicleSchedule/:id",
  vehicleController.getVehicleScheduleById
);

router.post(
  "/add-vehicle-Service",
  multerInstance.fields(vehicleUploadFields),
  vehicleController.addVehicleServiceProvider
);
router.put(
  "/update-vehicle-Service/:id",
  multerInstance.fields(vehicleUploadFields),
  vehicleController.updateVehicleServiceProvider
);
router.patch(
  "/delete-vehicle-Service/:id",
  vehicleController.deleteVehicleServiceProvider
);
router.patch(
  "/restore-vehicle-Service/:id",
  vehicleController.restoreVehicleServiceProvider
);
router.get(
  "/get-vehicle-Services",
  vehicleController.getVehicleServiceProviders
);
router.get(
  "/get-vehicle-Service/:id",
  vehicleController.getVehicleServiceProviderById
);
router.get(
  "/get-vehicle-service-categories",
  vehicleController.getVehicleServiceCategories
);

module.exports = router;
