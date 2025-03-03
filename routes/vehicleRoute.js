const express = require("express");
const router = express.Router();

const vehicleController = require("../controller/vehicleController");

router.post("/add-vehicleSchedule", vehicleController.createVehicleSchedule);
router.post("/update-vehicleSchedule/:id", vehicleController.updateVehicleSchedule);
router.post("/delete-vehicleSchedule/:id", vehicleController.deleteVehicleSchedule);
router.post("/restore-vehicleSchedule/:id", vehicleController.restoreVehicleSchedule);
router.post("/get-vehicleSchedules", vehicleController.getVehicleSchedules);
router.post("/get-vehicleSchedule/:id", vehicleController.getVehicleScheduleById);

router.post("/add-vehicle-Service",vehicleController.upload.fields([{ name: "image" }, { name: "icon" }]),vehicleController.CreateVehicleServiceProvider);
router.post("/update-vehicle-Service/:id",vehicleController.upload.fields([{ name: "image" }, { name: "icon" }]),vehicleController.updateVehicleServiceProvider);
router.post("/delete-vehicle-Service/:id",vehicleController.deleteVehicleServiceProvider);
router.post("/restore-vehicle-Service/:id",vehicleController.restoreVehicleServiceProvider);
router.post("/get-vehicle-Services",vehicleController.getVehicleServiceProviders);
router.post("/get-vehicle-Service/:id",vehicleController.getVehicleServiceProviderById);

module.exports = router;
