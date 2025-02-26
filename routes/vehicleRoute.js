const express = require("express");
const router = express.Router();

const vehicleController = require("../controller/vehicleController");

router.post("/add-vehicleSchedule", vehicleController.vehicleSchedule);
router.post("/add-vehicle-Service",vehicleController.upload.fields([{ name: "image" }, { name: "icon" }]),vehicleController.vehicleServiceProvider);

module.exports = router;
