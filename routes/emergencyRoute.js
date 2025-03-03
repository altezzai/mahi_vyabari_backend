const express = require("express");
const router = express.Router();

const emergencyController = require("../controller/emergencyController");

router.post("/add-emergency",emergencyController.upload.single("icon"),emergencyController.addEmergency);
router.put("/update-emergency/:id",emergencyController.upload.single("icon"),emergencyController.updateEmergency);
router.patch("/delete-emergency/:id",emergencyController.deleteEmergency);
router.patch("/restore-emergency/:id",emergencyController.restoreEmergency);
router.get("/get-emergency",emergencyController.getEmergency);
router.get("/get-emergency/:id",emergencyController.getEmergencyById);

module.exports = router;
