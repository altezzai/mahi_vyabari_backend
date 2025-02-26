const express = require("express");
const router = express.Router();

const emergencyController = require("../controller/emergencyController");

router.post("/add-emergency",emergencyController.upload.single("icon"),emergencyController.addEmergency);

module.exports = router;
