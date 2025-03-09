const express = require("express");
const router = express.Router();

const vehicleController = require("../controller/vehicleController");

router.post("/add-vehicleSchedule", vehicleController.createVehicleSchedule);
router.put("/update-vehicleSchedule/:id", vehicleController.updateVehicleSchedule);
router.patch("/delete-vehicleSchedule/:id", vehicleController.deleteVehicleSchedule);
router.patch("/restore-vehicleSchedule/:id", vehicleController.restoreVehicleSchedule);
router.get("/get-vehicleSchedules", vehicleController.getVehicleSchedules);
router.get("/get-vehicleSchedule/:id", vehicleController.getVehicleScheduleById);

router.post("/add-vehicle-Service",vehicleController.upload.fields([{ name: "image" }, { name: "icon" }]),vehicleController.CreateVehicleServiceProvider);
router.put("/update-vehicle-Service/:id",vehicleController.upload.fields([{ name: "image" }, { name: "icon" }]),vehicleController.updateVehicleServiceProvider);
router.patch("/delete-vehicle-Service/:id",vehicleController.deleteVehicleServiceProvider);
router.patch("/restore-vehicle-Service/:id",vehicleController.restoreVehicleServiceProvider);
router.get("/get-vehicle-Services",vehicleController.getVehicleServiceProviders);
router.get("/get-vehicle-Service/:id",vehicleController.getVehicleServiceProviderById);

module.exports = router;
